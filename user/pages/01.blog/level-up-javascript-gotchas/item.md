---
title: 'Take your JS to the next level: Gotchas'
date: '2017-01-27 11:23'
published: false
---


- Great because dynamic, easy to shoot your foot
- The fact of "Javascript: the good parts"
- Typescript, Flow

Below is a list of common javascript errors to avoid.


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
