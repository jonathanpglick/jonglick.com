---
title: 'Take your JS to the next level: Gotchas'
date: '2018-06-06 03:47'
published: true
---

Javascript, JS, ECMAScript. Many love it, some hate it but we're all stuck with
it.

Its dynamic nature and familiar syntax makes it fast, expressive and flexible
to develop with but anything [written in 10
days](https://en.wikipedia.org/wiki/JavaScript#History) will certainly have
issues. The fact that there's an excellent book titled ["JavaScript: The Good
Parts"](http://shop.oreilly.com/product/9780596517748.do) highlights that there
are many _bad parts_ to be avoided.

With great power comes the responsibility to not shoot yourself (or your team)
in the foot. Here are a few of the tricky things to be aware of or avoid.


## Accidental Global variables

Any variable defined without `var` is automatically a global variable.  Often
the result of variables used in loops.

    for (i; i < 100; i++) { ...  } // `i` is a global!

    for (prop in obj) { ... } // `p` is global!

These should pe properly prefixed with `var` to keep the variables in the local
scope.

    for (var i; i < 100; i++) {}

    for (var prop in obj) {}

An easy way to catch errors like this is to use ["strict
mode"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).
Strict mode enables a more strict javascript environment where errors are
thrown when mistakes would've otherwise failed silently. It also slightly
restricts syntax and names to prevent acciental errors.

Use strict mode by putting `"use strict"` on the first line of the file or the
first line of the function. Placing it as the first line in a file can cause
problems with concatenation. A good pattern to prevent this is to wrap your
code in an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE).

    (function() {
      "use strict"
      ...
    })();


---


## parseInt, String to integer conversion.

Always use the second argument (radix) or weird things can happen since
javascript implementations have different default values for the radix.

    parseInt('018px', 10);


---


## Responsible use of `this`

Understanding the `this` context keyword can be really tricky considering it
can be used in places you wouldn't expect. Depending on the context the code
was called in, `this` could be the `window` object, an object "instance", a DOM
element, and many other things.

I advocate only using `this` when dealing with objects that are instiantated,
such as classes or in prototype methods of a constructor function.

    function DestinysChild(name) {
      this.name = name;
    }

    DestinysChild.prototype.sayMyName = function() {
      console.log(this.name);
    }

    var beyonce = new DestinysChild('beyonce');
    beyonce.sayMyName();
    // => logs 'beyonce';

Used in this way, `this` works similarly to `self` in many object-oriented
languages -- referencing the object instance that the method is being called
in.

In DOM event handler callbacks `this` is assigned to the DOM element that
triggered the event. In that context, `this` is ambiguous and poorly named.
It's more clear what you're referencing if you pull the DOM node from the event
object passed to the event handler.

    var linkElement = event.currentTarget;


---


## DOM Element IDs are part of the `window` context

I've only bumped into this last one once but I was thoroughly confused until
I realized what was happening. And it's actually a DOM quirk rather than an
issue with Javascript.

Browsers automatically create variable references to DOM elements that have
`id` attributes. If we have the following markup in the page:

    <div id="header"></div>

The `header` (or `window.header`) variable will automatically be created and it
will reference the `<div id="header"></div>` DOM element.

This can be really confusing if you forget to assign a variable correctly or
are checking if a variable has been initialized and there's an element with the
same ID on the page.
