# How fast is Hyphenator? #

There is no answer to this question despite of: “it depends on a lot of parameteres”.
For most tasks Hyphenator is fast enough, but speed is cool and there are things you can do to make Hyphenator faster and thus even cooler ;-)

## Execution speed ##
I'm permanently tweaking the code for execution speed. If there's a millisecond to save, I want to save it!
Nevertheless there are differences in execution speed depending on the browser you use. In general a more recent version is faster.

**What an webauthor can do:**
The depth of the DOM-Tree has a big impact on the speed of Hyphenator. It takes a quite bit of time to hyphenate a document with `<body class="hyphenate">` and highly nested code (layout tables, lots of divs in divs in divs...). But its quite fast to just hyphenate all p-Elements.

Conclusion: Write clean standard-conform code and set class="hyphenate" to the leaves instead to the roots or branches.

## Loading speed ##
The script itself isn't that big (commented Hyphenator.js: ca. 44KB). But the pattern files take some time to load (84KB for the german patterns, 24 KB for english).

With a Javascript-packer (http://dean.edwards.name/packer/) Hyphenator.js could be cut down to a fraction of its size. But the data structure of the patterns is already highly optimized for space (and speed). There's almost nothing to save.

**What an webauthor can do:**
  * **Serve the files zipped:** Depending on your server you may serve the files zipped. Current browsers can easily deal with zipped packages. Zipping typically saves more than 50%.
  * **Preload patterns:** Normally only one language is used on a page. So the mechanism to dynamically load patterns is rather superfluous. To preload patterns write e.g.
```
<script src="http://hyphenator.googlecode.com/svn/trunk/patterns/en.js" type="text/javascript"></script>
```
> after the script block wich loads Hyphenator.js but before the script is invoked. The [working sample](http://hyphenator.googlecode.com/svn/trunk/WorkingExample.html) may then look like this:
```
<script src="http://hyphenator.googlecode.com/svn/trunk/Hyphenator.js" type="text/javascript"></script>
<script src="http://hyphenator.googlecode.com/svn/trunk/patterns/en.js" type="text/javascript"></script>
<script type="text/javascript">
    Hyphenator.run();
</script>
```
> Preloaded pattern files won't be loaded again!

> If you want to prevent Hyphenator from remote loading patterns, you can explicitly turn of this functionality:
```
Hyphenator.setRemoteLoading(false);
```
> In this case Hyphenator only hyphenates text in languages, whose pattern file is loaded.
  * **Cache pattern files:** If your site often uses Hyphenator.js you may think about caching pattern files in the browsers cache by sending an appropriate HTTP-Header.