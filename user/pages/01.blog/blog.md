---
title: Home
blog_url: blog
sitemap:
    changefreq: monthly
    priority: 1.03
content:
    items: '@self.children'
    order:
        by: date
        dir: desc
    limit: 1
    pagination: true
feed:
    description: 'Sample Blog Description'
    limit: 10
pagination: true
---

