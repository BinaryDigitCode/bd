---
title: Migrating my Hugo Website to Neocities and Deploying with GitHub Actions
date: 2024-02-19
categories: ["Projects"]
tags: ["neocities", "GitHub"]
---

## Neocities

I've always loved the idea of Neocities and have tinkered with my free site there for a few months but never landed on a long term project. Only recently I learned that you can use the Neocities API and CLI to push a site to your space! It's awesome and available on the free tier.

Recently I've seen more and more people on the supporter plan where you can host unlimited sites, have increased bandwidth, use custom domain names, and support open source and the small web. Today I decided to become a supporter since for $5 a month is a great value and I wanted to migrate my main websites from Netlify to Neocities.

## GitHub Actions

I've learned about GitHub Actions and realized this makes deployment much easier since I don't have to push my code to GitHub and then push it to Neocities. A small task right now, but why not learn how to automate it, right?

I ran across the every amazing website of [Sophie Koonin](https://localghost.dev/blog/how-i-deploy-my-eleventy-site-to-neocities/) and how she deployed her site using GitHub Actions. She explains perfectly how to get your Neocities key and add it to GitHub. The one problem I ran into was that Sophie uses 11ty, but I use Hugo on this site. After searching some more, I ran across John Bowdre's blog post on how to [Deploy a Hugo Site to Neocities with GitHub Actions](https://runtimeterror.dev/deploy-hugo-neocities-github-actions/) - just what I needed!

## My Workflow

I had to fiddle with my workflow but the below is what ended up working for me, since I don't use the exact same setup as others:


```
name: Deploy to Neocities
on:
  push:
    branches:
      - main

concurrency: 
  group: deploy-to-neocities
  cancel-in-progress: true

jobs:
  deploy:
    name: Build and deploy Hugo site
    runs-on: ubuntu-latest
    steps:
      - name: Hugo setup
        uses: peaceiris/actions-hugo@v2.6.0
        with:
          hugo-version: '0.121.1'
          extended: true

      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      # Build the site with Hugo
      - name: Build with Hugo
        run: hugo --minify
      
    # Push public dir to Neocities and clean up any orphaned files
      - name: Deploy to Neocities
        uses: bcomnes/deploy-to-neocities@v1
        with:
          api_token: ${{ secrets.NEOCITIES_TOKEN }}
          cleanup: true
          dist_dir: public

```

I hope this helps you just like the blog posts above helped me get in the right direction! If you're on Neocities and want to [follow me](https://neocities.org/site/binarydigit), say hi there or on [Mastodon](https://social.lol/@BinaryDigit)!