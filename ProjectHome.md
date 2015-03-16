**Hyphenator.js …**
  * **automatically hyphenates texts on websites** if either the webdeveloper has included the script on the website or you use it as a [bookmarklet](http://en.wikipedia.org/wiki/Bookmarklet) on any site.
  * runs **on any modern browser** that supports JavaScript and the soft hyphen (&shy;).
  * **automatically breaks URLs** on any browser that supports the zero width space.
  * **runs on the client** in order that the HTML source of the website may be served clean and svelte and that it can respond to text resizings by the user.
  * follows the ideas of **[unobtrusive JavaScript](http://en.wikipedia.org/wiki/Unobtrusive_JavaScript)**.
  * has a **[documented API](http://code.google.com/p/hyphenator/wiki/en_PublicAPI)** and is highly configurable to meet your needs.
  * supports a **[wide range of languages](http://code.google.com/p/hyphenator/wiki/en_AddNewLanguage)**.
  * relies on Franklin M. Liangs hyphenation algorithm [(PDF)](http://www.tug.org/docs/liang/liang-thesis.pdf) commonly known from LaTeX and OpenOffice.
  * is free software licensed under [LGPL v3](http://www.gnu.org/licenses/lgpl.html) with additional permission to distribute non-source (e.g., minimized or compacted) forms of that code (see source code header for details).
  * provides **services for customizing, merging and packing** script and patterns.
  * supports [CSS3-hyphenation](http://code.google.com/p/hyphenator/wiki/en_CSS3Hyphenation)

**Hyphenator.js does …**
  * not give you control over how many hyphens you'll have as endings on consecutive lines.
  * not eliminate misleading hyphenation like 'leg-ends' (depending on the pattern quality).
  * not work in Firefox 2 (but it works fine in Firefox >=3.0)
  * not handle special (aka non-standard) hyphenation (e.g. omaatje->oma-tje)

See a [simple life example](http://hyphenator.googlecode.com/svn/tags/4.3.0/WorkingExample.html) (resize window or click the button in the upper right corner).

&lt;wiki:gadget url="http://hyphenator.googlecode.com/svn/donate/flattr.xml" border="0" width="140" height="40" /&gt;

## Where to go from here ##
See the articles in the wiki for more information about:
  * [Download Hyphenator](https://docs.google.com/folderview?id=0B70aJF1epiRqa3BLWnpVRzh0Ym8&usp=docslist_api#) or use bower:  `bower install svn+http://hyphenator.googlecode.com/svn/`
  * [How to use Hyphenator](http://code.google.com/p/hyphenator/wiki/en_HowToUseHyphenator)
  * [Documentation of the public API](http://code.google.com/p/hyphenator/wiki/en_PublicAPI)
  * [Correcting hyphenation](http://code.google.com/p/hyphenator/wiki/en_DealingWithInaccurateHyphenation)
  * [Optimizations](http://code.google.com/p/hyphenator/wiki/en_Optimizations)
  * [Add support for further language](http://code.google.com/p/hyphenator/wiki/en_AddNewLanguage)
  * [Version History](http://code.google.com/p/hyphenator/wiki/en_VersionHistory)
  * [Bug reporting and feature requests](http://code.google.com/p/hyphenator/wiki/en_reportProblems)

There's also a [FAQ](http://code.google.com/p/hyphenator/wiki/en_FAQ) and a large set of [test cases](http://hyphenator.googlecode.com/svn/tags/4.3.0/testsuite/index.html).

If you're looking for a server-side script doing hyphenation I recommend http://yellowgreen.de/phphyphenator

If you're looking for a script that does really nice line breaking (using an implementation of the Knuth and Plass line breaking algorithm) see http://www.bramstein.com/projects/typeset/flatland/.

There's a port of Hyphenator.js to ActionScript: http://code.google.com/p/hyphenator-flash/

If you're looking for a more light-weight solution (using Knuth's algorithm from 1977, english only), see http://github.com/aristus/sweet-justice

## News ##
### October 17, 2014 ###
[Version 4.3.0 is here! (Download from Google Drive)](https://docs.google.com/folderview?id=0B70aJF1epiRqa3BLWnpVRzh0Ym8&usp=docslist_api#)

This minor release brings the following changes:
  * added support for Serbian Cyrillic (thanks to Milan Gurjanov)
  * jsdoc3 formatted code comments in the source file
  * the core functions are slightly faster (specially in chrome: removed some deopts)
  * better performance when checking for CSS3 hyphens support
  * new method for hyphenating URL-styled text (fixed [issue188](https://code.google.com/p/hyphenator/issues/detail?id=188) and [issue198](https://code.google.com/p/hyphenator/issues/detail?id=198))
  * prevention of a memory leak in some rare cases (fixed [issue192](https://code.google.com/p/hyphenator/issues/detail?id=192))
  * Hyphenator. emits a warning to the console, when it is invoked twice (see [documentation](https://code.google.com/p/hyphenator/wiki/en_repeatedRunsOfHyphenator))
  * Code refactoring for better readability

And some bugfixes:
  * fixed an issue with Hyphenator.js running in private mode (fixed [issue108](https://code.google.com/p/hyphenator/issues/detail?id=108))
  * fixed an issue with the Bookmarklet (fixed [issue185](https://code.google.com/p/hyphenator/issues/detail?id=185))
  * fixed an issue with ommited tags (fixed [issue194](https://code.google.com/p/hyphenator/issues/detail?id=194))
  * workaround for a bug in Konqueror 4.8.4 (fixed [issue202](https://code.google.com/p/hyphenator/issues/detail?id=202))

### October 28, 2012 ###
Created a huge [compatibility table to see what browser supports what language for CSS3-hyphenation](http://mnn.ch/hyphensChecker/). Fun fact: with each visit a new test is run and added to the table.

## Donate ##
Hyphenator.js is absolutely free of charge.
But if you think Hyphenator.js is cool you can

&lt;wiki:gadget url="http://hyphenator.googlecode.com/svn/donate/flattr.xml" border="0" width="140" height="40" /&gt;
or
<a href='https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3345544'><img src='https://www.paypal.com/en_US/i/btn/btn_donateCC_LG_global.gif' alt='Donate' width='122' height='46' /></a>