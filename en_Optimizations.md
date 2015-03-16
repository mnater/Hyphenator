# How fast is Hyphenator? #

There is no answer to this question despite of: “it depends on a lot of parameters”.
For most tasks Hyphenator is fast enough, but speed is cool and there are things you can do to make Hyphenator faster and thus even cooler ;-)

## CSS3 hyphenation ##
Some browsers already support the not yet fully standardized CSS hyphenation properties ([css3-text](http://www.w3.org/TR/css3-text/#hyphenation)). If you develop for a specific platform supporting css3-hyphenation (like e.g. WebKit/Safari on iOS) and your language is supported you will not need Hyphenator.js.
For all other cases Hyphenator.js polyfills the gap.
If you develop for all platforms don't forget to set the switch: [useCSS3hyphenation](http://code.google.com/p/hyphenator/wiki/en_PublicAPI#property_useCSS3hyphenation).
If set to true Hyphenator.js takes himself back.

You may also be interested in [Hyphenator\_Loader.js](https://code.google.com/p/hyphenator/wiki/en_HowToUseHyphenator#.js), which is a small script that loads Hyphenator.js (and the patterns) only if necessary.

## Execution speed ##
I'm permanently tweaking the code for execution speed. If there's a millisecond to save, I want to save it!
Nevertheless there are differences in execution speed depending on the browser you use. In general a more recent version is faster.

**What an webauthor can do:**
The depth of the DOM-Tree has a big impact on the speed of Hyphenator. It takes a quite bit of time to hyphenate a document with `<body class="hyphenate">` and highly nested code (layout tables, lots of divs in divs in divs...). But its quite fast to just hyphenate all p-Elements.

Conclusion: Write clean standard-conform code and set class="hyphenate" to the leaves instead to the roots or branches.

## Loading speed ##
The script itself isn't that big (commented Hyphenator.js: ca. 44KB). But the pattern files take some time to load (69KB for the german patterns, 24 KB for english).

By merging the script and the patterns in one file and by packing the resulting script with a Javascript-packer we can optimize loading speed (one file = one http request).

Since version 3.0.0 the patterns are stored in DOM Storage if the browser supports it.

**What an webauthor can do:**
  * **Use merge+pack.html:** There's a customizing service bundled in the download package (called `merge+pack.html`) since version 2.2.0. Open this file in your browser via http (not via `file:` !) and follow the instructions.
  * **Serve the files zipped:** Depending on your server you may serve the files zipped. Current browsers can easily deal with zipped packages. Zipping typically saves +/- 50%.
  * **Cache:** Make sure that the script file is correctly cached in the browser.
  * **Reduce the pattern set:** If you have a static web site (i.e. text that doesn't change) you can reduce the patterns to those you actually need (see `reducePatternSet.html` in the package).