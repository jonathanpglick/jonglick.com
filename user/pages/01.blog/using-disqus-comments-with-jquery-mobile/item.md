---
title: 'Using Disqus comments with jQuery Mobile'
date: '2013-07-10 10:31'
---

I recently started a project to make a [jQuery Mobile](http://jquerymobile.com) site for to show content from a client's site.  The site's articles use [Disqus](http://disqus.com) for comments and I needed to get them working in jQuery Mobile.

jQuery Mobile's default navigation uses AJAX to load all page content after the initial page load and this caused havoc with Disqus for a few reasons:

1. There will be multiple or orphaned `<div id="disqus_thread></div>` elements
   as pages chang.  This causes the Disqus code to choke.
2. jQuery Mobile doesn't like `<script>` tags in the `<div data-role=" page>`
   element, so passing the `disqus_identifier` or other config data in
   javascript on the page causes jQuery Mobile to choke.  

The first part of my solution was to transport the Disqus data along with a page without using javascript.  I ended up doing this with `data-*` attributes:

    ...
    <div data-role="page">
      ...
      <div class="disqus_data" data-disqus_shortname="shortname" data-disqus_identifier="identifier" data-disqus_title="title" data-disqus_url="url">
      </div>
    </div>
    ...

The presence of this element also tells me that Disqus should be loaded on this page.
The other part of this is that the standard Disqus embed code won't work since we need to load comments dynamically -- the `<div id="disqus_thread">` element may not even exist when the page is loaded!

My first attempt to manage this was to create the Disqus element on jQuery
Mobile's `pageinit` event and remove it in the previous page on the `pageshow`
event.  This didn't work because Disqus maintains a reference to the DOM node
and it threw a bunch of errors.

Finally, I realized I needed to reuse the DOM node and just move it between pages before re-initializing Disqus ([`DISQUS.reset()`](http://help.disqus.com/customer/portal/articles/472107-using-disqus-on-ajax-sites)) with the new identifier.

The final javascript looks like this:

    $(document).on("pageshow", function(event, data) {
      var pageNode = event.target;

      // Add & initialize disqus on next page.
      if ($('.disqus_data', pageNode).length > 0) {

        // Get disqus data.
        var $disqus_data_node = $('.disqus_data', pageNode);
        var shortname = $disqus_data_node.attr('data-disqus_shortname');
        var identifier = $disqus_data_node.attr('data-disqus_identifier');
        var title = $disqus_data_node.attr('data-disqus_ta_node_title');
        var url = $disqus_data_node.attr('data-disqus_url');

        // Initial disqus load.
        if (typeof(DISQUS) == 'undefined') {

          // Add DOM node.
          $('<div id="disqus_thread"></div>').insertAfter($disqus_data_node);;

          // Set initial disqus configuration.
          window.disqus_shortname = shortname;
          window.disqus_identifier = identifier;
          window.disqus_title = title;
          window.disqus_url = url;

          // Load disqus embed script.
          $.getScript('http://' + shortname + '.disqus.com/embed.js');

        }

        // Disqus already loaded, just reset.
        else {

          // Move DOM node to the new page.
          $('#disqus_thread').detach().insertAfter($disqus_data_node);

          // Reset disqus with new configuration data.
          DISQUS.reset({
            reload: true,
            config: function() {
              this.page.identifier = identifier;
              this.page.title = title;
              this.page.url = url;
            }
          });

        }
      }

    });

So, the Disqus javascript is only loaded once comments are actually needed, not on the initial jQuery Mobile app load, and the `<div id="disqus_thread">` element will stay on whatever page it was on until a new page needs to use it. </div></div></div>