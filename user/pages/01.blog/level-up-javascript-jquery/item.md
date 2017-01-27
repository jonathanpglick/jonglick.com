---
title: 'Take your JS to the next level: jQuery'
date: '2017-01-27 11:23'
published: true
---

As part of my job I often help front and back end developers with their javascript, usually with [jQuery](http://jquery.com). jQuery's easy-to-use syntax makes it easy to pick up and understand but transitioning from simple click handling to complex interactions can often end up with an unreadable, error-prone mess.

In this post I've outlined some of the simplest things a developer can do to start improving their usage of jQuery, and JavaScript, as a whole.


---


## Selector Readability

This is the most common way to scope a DOM selection below an element:

    $('input[name="email"]', formEl);

But I prefer to make the same selection like this:

    $(formEl).find('input[name="email"]');

Although you'll almost never see this used in tutorials, I prefer this for three reasons:

1. **The intent is immediately clear.** I can tell I'm searching below an element for another selector without having to memorize the function signature for `$()`, which many beginners aren't familiar with.
2. **The order is left to right.** The same direction we read and expect code to execute.
3. **It does the same thing under-the-hood.** It may look like more function calls but in the [jQuery source](https://github.com/jquery/jquery/blob/1.12-stable/src/core/init.js#L98-L105) restructures the first example into the second.


---


## Scope selectors tightly

I'll often see something like the following in a code base.

    $('.page-search form').on('submit', function() {});

This may work but it doesn't take into account what would happen if another form is added to the page, or the `.page-search` class is added elsewhere to inherit styles. I've found it's usually best to scope things as close to the _component_ as possible.

    $('form.search-form').on('submit', function() {});

This is even more important when working on projects with many developers; you don't want your code effecting their features or theirs to effect yours.


---


## Store frequently-used jQuery selections as variables

Take the following example of a common click handler to toggle a menu.

    $('a.menu-toggle').on('click', function() {
        if ($('.menu').hasClass('open')) {
            $('.menu').removeClass('open');
            $(this).removeClass('open')
        }
        else {
            $('.menu').addClass('open');
            $(this).addClass('open')
        }
    });

Wow, each time a click happens, `$()` is being called 5 times! By assigning the results of those selections to variables at the beginning, we will only ever have to call them twice. And if the selectors ever need to change, we only need to update them in one place.

    var $menuToggle = $('a.menu-toggle');
    var $menu = $('.menu');

    $menuToggle.on('click', function() {
        if ($menu.hasClass('open')) {
            $menu.removeClass('open');
            $menuTogle.removeClass('open');
        }
        else {
            $menu.addClass('open');
            $menuToggle.addClass('open')
        }
    });

Storing the results of jQuery calls in variables also lets us _name_ them which can greatly increase the readability.

Some software (*cough* Drupal *cough*) makes it hard for front-enders to change markup, they're stuck with what the back-end gives them, so they have to use non-obvious selectors to grab what they need. In these cases, using variables is better than not because their names give recognizable purpose to an otherwise ambiguous selector.

Which would you rather see in your codebase upon returning to it a few months, or even days, later?

    $('header .menu > div');

    // vs

    $menuContentExpander = $('header .menu > div');

Along with this, simple variable naming conventions can increase readability even further. In my jQuery projects I tend to use these conventions to know the types of variables.

jQuery object variables begin with `$`. This prevents us from constantly re-wrapping the variables with `$()` to ensure they work as we expect.

    var $topNav = $('[data-name="dropdown-menu"] > ul.nav-mega');

DOM elements have "El" or "Element" appended to their names. This identifies them as raw DOM elements, not jQuery ones.

    var headerEl = document.getElementById('header');

Of course, these are just my personal conventions and they can mean different things in other frameworks. The point is to _have_ a convention.


---


## this

`this` is a confusing wart in the javascript language and I suggest that you should *avoid using it when possible*.

jQuery uses `this` inside callback functions to reference the current object. In the contrived example below, `this` is used for both the current `<li>` element in the `.each()` loop and as the `<a>` element in the click handler.

    $('li').each(function() {
        $(this).find('a').on('click', function(e) {
            e.preventDefault();
            $(this).addClass('clicked');
        });
    });

`this` references different things depending on the closure it's in and each time you encounter `this` you have to spend a few brain cycles to figure out what it means in that place.

Luckily, there are some easy ways to avoid `this` and make your code much easier to reason about.

The `.each()` function passes two arguments to its callback: the current index and the current element. By semantically naming the argument in the callback function it becomes obvious what it is.

Event handlers pass an event object into their callback functions. The `currentTarget` property of the event object is the same as what `this` would be in the closure. Mixing that with a properly named variable removes all the error-prone ambiguity and we end up with:

    $('li').each(function(index, liElement) {
        $(liElement).find('a').on('click', function(e) {
            e.preventDefault();
            var $a = $(e.currentTarget);
            $a.addClass('clicked');
        });
    });

Even when there isn't a workaround for `this`, readability can be improved by simply assigning `this` to a semantically named variable.

    ...
    .on('load', function(e) {
      var $img = $(this);
      $img.width(200);
    });
    ...

Ahh, much better.
