---
title: 'Reactive modeling for imperative solutions'
date: '2018-06-09 05:30'
published: false
---

People tend to describe how websites and applicaitons should work using "cause and
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

Anyway, lets use the email sending example above to illustrate the process. There are
some unstated assumptions that we need to think about:

- Content is assigned to categories and users are subscribed to categories.
- Content could be published multiple times (`published` => `unpublished` =>
  `published`) but users should only be notified once. If the user subscribed
  after the first publishing, they should still be notified when published the
  second time.

Modeling these requirements with reactive psuedo-code is fairly
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

These events would then be filtered to remove any user/content pairs that have already been notified.

    UserNotifyContentPublishedStream = UserContentPublishedStream.filter(alreadyNotified)

Lastly, we take the remaining user/content pairs, send the notification, and track that the notification is sent.

    UserNofityContentPublishStream.each(function(item) {
        if (sendNotification(item.user, item.content)) {
          trackNotificationSent(item.user, item.content);
        }
    });

Thinking about the process as a series of streams that can be filtered leaves us with a decent structure to implement
in imperative code. The details I glossed over are the ones that need to be figured out to make the actual solution work. Namely, the function definitions for:

  - `ContentPublishedStream()`: A list of users and content that should be notified.
  - `alreadyNotified()`: A way to filter the list based on past notifications.
  - `trackNotificationSent()`: A way to track that a notification has been sent.

Breaking down the problem this way makes the imperative solution a lot more manageable than trying to accomplish it all at once. It makes breaking down the problem into composable pieces a lot easier.

When I implemented this I didn't want to _actually_ send the notifications _when_ the content was published since that would be happening with the request/response cycle and could hold up the site for quite a while as it sends the emails.

The way around this was to periodically run a script with `cron` that accomplishes the same thing. _When new content is published_ becomes _Get content published since last time notifications have been sent_.

Tackling that issue in isolation is much easier and once it was in place, the other pieces filtering and tracking the notifications are pretty straight forward.


> I've found that writing `when x then y` development requests as reactive psuedo-code helps me understand and break down the problem into pieces that are easier to implement with imperative code.










