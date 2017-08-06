# Hyphenator.js

- This repository replaces https://code.google.com/p/hyphenator/
- Demo: http://mnater.github.io/Hyphenator/

Note: Hyphenator.js has somewhat grown old. Have a look at its successor: https://github.com/mnater/Hyphenopoly

## Overview

Hyphenator.js is a free open source Javascript library that automatically hyphenates text on websites. It comes in handy as a _polyfill_ for legacy browsers that don't support CSS 3 hyphenation at all or for modern browsers that do hyphenation, but do not provide hyphenation dictionaries for a particular language.

Hyphenator.js …

*   can be [included by the creator of the website](https://github.com/mnater/Hyphenator/blob/wiki/en_HowToUseHyphenator.md#using-hyphenator-on-your-website).
*   can be used [as bookmarklet on any website](https://github.com/mnater/Hyphenator/blob/wiki/en_HowToUseHyphenator.md#using-hyphenator-as-a-bookmarklet).
*   is [unobtrusive](http://en.wikipedia.org/wiki/Unobtrusive_JavaScript).
*   steps behind CSS 3 hyphenation if supported ([how to use Hyphenator_Loader](https://github.com/mnater/Hyphenator/blob/wiki/en_HowToUseHyphenator.md#hyphenator_loaderjs)).
*   runs on the client in order that the HTML source of the website may be served clean and svelte and that it can respond to text resizings by the user.
*   is highly configurable and has a [well-documented API](https://github.com/mnater/Hyphenator/blob/wiki/en_PublicAPI.md#public-api).
*   relies on Franklin M. Liangs hyphenation algorithm ([PDF](http://www.tug.org/docs/liang/liang-thesis.pdf)) commonly known from LaTeX and OpenOffice.
*   supports a [large set of different languages](https://github.com/mnater/Hyphenator/blob/wiki/en_AddNewLanguage.md#what-we-have-now).
*   provides services for [customizing, merging and packing script and patterns](http://mnater.github.io/Hyphenator/mergeAndPack.html).
*   also wraps URLs and Email adresses.
*   is free software licensed under [MIT License](http://mnater.github.io/Hyphenator/LICENSE.txt) (Version 5.0.0 and above).

## Quick links

*   [Code](https://github.com/mnater/Hyphenator)
*   [Download](https://github.com/mnater/Hyphenator/releases/latest)
*   [Documentation](https://github.com/mnater/Hyphenator/blob/wiki/en_TableOfContents.md#table-of-contents)

## Quick guide

1.  [Download](https://github.com/mnater/Hyphenator/releases/latest) the recent version of Hyphenator.js
2.  Use [mergeAndPack.html](http://mnater.github.io/Hyphenator/mergeAndPack.html) to configure and minify Hyphenator.js and hyphenation patterns.
3.  Prepare your .html documents (i.e. add `hyphenate`-classes, set `lang` and add Hyphenator.js)
4.  Test it!

Get [detailed instructions](https://github.com/mnater/Hyphenator/blob/wiki/en_HowToUseHyphenator.md#using-hyphenator-on-your-website).

## The bad parts

As with most things, there's a downside, too. Consider the following drawbacks before using Hyphenator.js:

*   Hyphenator.js and the hyphenation patterns are quite large. Good compression and caching is vital.
*   Automatic hyphenation can not be perfect: it may lead to misleading hyphenation like leg-ends (depends on the pattern quality)
*   There's no support for special (aka non-standard) hyphenation (e.g. omaatje->oma-tje)
*   There's no way for Javascript to influence the algorithm for laying out text in the browser. Thus we can't control how many hyphens occur on subsequent lines nor can we know which words have actually been hyphenated. Hyphenator.js just hyphenates all of them.

## Philosophy

### There is text and there is beautiful text

This beauty becomes manifest in content and representation. I'm firmly convinced that all written text (well, most of it) deserves fine typography, that we deserve it. While hyphenation is just one of many tesserae that forms the appearance of text, it may be an important one.

### There is code and there is sound code

In code there is readability, maintainability, performance and genius – and some constraints of technology. As a hobbyist programmer I often feel like a hobbit surrounded by wizards who campaign for these values. But being an agile hobbit gives me the freedom to find my own way through the woods (thankfully free from evil in this area). I'm constantly in search of the most performant path to circumvent the constraints of technology while maintaining readability and maintainability of my code. Sometimes this path is illuminated by a wizard<sup>[1](#fn1)</sup>.

## Issues and Requests

Each release is tested in various browsers with an [automated testsuite](./testsuite/). Nevertheless, there will always be bugs. Please don't hesitate to [submit them](https://github.com/mnater/Hyphenator/issues).

If you have a special use case and Hyphenator.js doesn't provide a solution, feel free to [submit a feature request](https://github.com/mnater/Hyphenator/issues).

And please, be patient. Hyphenator.js is a hobby of mine and sometimes other things have precedence…

* * *

(1) Some of my coding wizards are:

*   Franklin Mark Liang for his beautiful [hyphenation algorithm](http://www.tug.org/docs/liang/)
*   [Brendan Eich](https://brendaneich.com/) for making JavaScript a programming language (and [Douglas Crockford](http://www.crockford.com) for finding The Good Parts of it)
*   Vyacheslav Egorov for his [deep insights to V8](http://mrale.ph/)
*   Bram Stein for his [initiative on web typography](http://stateofwebtype.com)
