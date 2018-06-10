---
title: 'Reactive modeling for imperative solutions'
date: '2018-06-09 05:30'
published: false
---

People describe the way websites and applicaitons should work using "cause and
effect" language that involves events happening in time.

> Ask the user to update their credit card _a week before_ it expires.

> Send notification emails to subscribed users _when_ new content is published.

These requests are reasonable and easy enough to understand.

Unfortunately, most back-end languages and frameworks don't allow modeling
these situations as described. Instead, we translate them into imperative code
that accomplishes the same thing. This is often accomplished by hooking into
a model's methods, events, or signals to trigger code "when" something happens.

These seemingly simple requests can be difficult to turn into imperative code
and I've found that modeling them in reactive psuedo-code can help me unpack
the problem and understand its implementation before turning it into imperative
code.

[Reactive programming](https://en.wikipedia.org/wiki/Reactive_programming) is
a programming paradigm that involves streams of data and automatic propagation
of changes. It models these `when x then y` problems succingly because an event
stream for `x` can be made and subscribed to by `y` so the two things are
directly attached. This front-end focused introduction to reactive programming
is a great way to start thinking about everything as a stream: [The
introduction to Reactive Programming you've been
missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754).

Anyway, lets use the request to send emails from above as an example. There are
some unstated assumptions that we need to think about:

- Content is assigned to categories and users are subscribed to categories.
- Many users could be subscribed to a category so we can't do the email sending
  right when publishing happens; it needs to be in another process so the
  "publish" http request doesn't take too long.
- Content could be published multiple times (`published` => `unpublished` =>
  `published`) but users should only be notified once. If the user subscribed
  after the first publishing, they should still be notified when published the
  second time.

Modeling these requiremnts with reactive psuedo-code is fairly
straight-forward.

To know when content is published, we'll need a `ContentPublishedStream` that
produces events when content is published. This could be done with a model
signal or some kind of queue system.

Next we want to get a stream that produces events containing a user and the published content.

    UserContentPublishedStream = ContentPublishedStream.flatmap(function(content) {
                                    categories = content.categories
                                    users = getUsersSubscribedToCategories(categories)
                                    return users.map(function(user) {
                                      return {
                                        content: content,
                                        user: user
                                      }
                                    })
                                  })

    UserNotifyContentPublishedStream = UserContentPublishedStream.filter(alreadyNotified)

    // Load users subscribed to the content categories

