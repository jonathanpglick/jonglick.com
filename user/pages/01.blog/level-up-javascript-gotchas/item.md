---
title: 'Take your JS to the next level: Gotchas'
date: '2017-01-27 11:23'
published: false
---

## Accidental Global vars.

Any variable defined without `var` is automatically a global variable.
Often the result of variables in loops.

    for (i; i < 100; i++) {}

    for (prop in obj) {}

    for (var i; i < 100; i++) {}

    for (var prop in obj) {}

---


## Strict Mode.

Opts-in to a more strict JS environment where errors are thrown where
mistakes would've failed silently and slightly restricts syntax and names
to prevent acciental errors.

To use, add "use strict" at the top of a function definition.

    (function() {
        "use strict"

        // ...code...
    })();

---


## Immediately-invoked Function Expressions (IIFE).

Creates closure around variables.
Prevents polluting the global scope.
Easy aliasing of global vars.

    (function() {

    })()

Common Drupal pattern.

    (function($) {
        "use strict"

        // 1. Invoked immediately.

        var privateVar = 'foo';

        function myUtilityFunction() {
            return 'bar';
        }


        $(function() {
            // 2. Invoked when the DOM is ready.
        });


        // Exposed because it's attached to a global namespace.
        Drupal.behaviors.myBehavior = {
            attach: function() {

                // 3. Invoked whenever `Drupal.attachBehaviors()` is called.

                // Can access `privateVar` and `myUtilityFunction`.
            }
        };

    })(jQuery);

---


## Object.hasOwnProperty().

Always use `.hasOwnProperty()` when iterating object keys. Ensures that only
keys on the object, not its prototype chain, are iterated.

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            // Do something with obj[key]
        }
    }


## parseInt, String to integer conversion.

Always use the second argument (radix) or weird things can happen!

    parseInt('018px', 10);
