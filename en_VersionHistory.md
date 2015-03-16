#summary Version History and note about versioning

# Version History #
## [Version 4.3.0 (Download from Google Drive)](https://docs.google.com/folderview?id=0B70aJF1epiRqa3BLWnpVRzh0Ym8&usp=docslist_api#) (October 17, 2014) ##
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

## [4.2.0](http://code.google.com/p/hyphenator/downloads/detail?name=Version%204.2.0.zip) (April 25, 2013) ##
This minor release brings the following changes:
  * added support for Romanian (thanks to irragal)
  * hiding and unhiding of elements is now done by adding classes
  * patterns stored in DOMStorage are now versioned (fixed [issue169](https://code.google.com/p/hyphenator/issues/detail?id=169))
  * Hyphenator.js now uses a modalDialog to ask for languages if o language is defined ([issue171](https://code.google.com/p/hyphenator/issues/detail?id=171))
  * there are two new functions that can be defined: onbeforewordhyphenation and onafterwordhyphenation
And some bugfixes:
  * fixed issue when accessing external style sheets (fixed [issue164](https://code.google.com/p/hyphenator/issues/detail?id=164))
  * togglebox works when elements are hyphenated by CSS (fixed [issue168](https://code.google.com/p/hyphenator/issues/detail?id=168))
  * hyphenation now works for elements with a supported language on pages that have a unsupported main language (fixed [issue177](https://code.google.com/p/hyphenator/issues/detail?id=177))
  * elements now hide during hyphenation when using a selector function (fixed [issue172](https://code.google.com/p/hyphenator/issues/detail?id=172))
  * some general refactoring and code changes


## [4.1.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%204.1.0.zip) (October 18, 2012) ##
This minor release brings the following changes:
  * bookmarklet uses CSS3hyphenation
  * updated jslint and made it happier
  * faster pattern checking (async)
  * use of querySelectorAll in some browsers
  * globally hide and unhide text by setting CSS classes (faster)
  * included test for CSS3hyphenation availability
  * made Hyphenator.js ready for IE10
  * added support for Esperanto (thanks to Sergio Pokrovskij)
  * added support for Estonian (thanks to Peeter Marvet)
  * added support for Serbian latin (thanks to (Sonja Keljević)
  * some general commenting and code reordering
Ans some bugfixes:
  * fixed issue with getComputedStyle for older Firefox (<4)
  * fixed [issue158](https://code.google.com/p/hyphenator/issues/detail?id=158) (Not working when called after the document load, thanks to  davenewtron)
  * fixed [issue162](https://code.google.com/p/hyphenator/issues/detail?id=162) (Object Document has no method 'getAttribute')
  * fixed [issue165](https://code.google.com/p/hyphenator/issues/detail?id=165) (words not cached)
  * fixed [issue166](https://code.google.com/p/hyphenator/issues/detail?id=166) (added polish prompter string)
  * fixed [issue148](https://code.google.com/p/hyphenator/issues/detail?id=148) (safe copy not working correctly with toggle box)
  * fixed an issue where words with apostrophes weren't treated correctly


## [4.0.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%204.0.0.zip) (August 05, 2011) ##
This major release brings the following new features:
  * Faster hyphenation algorithm based on a trie (thanks to Bram Stein)
  * Faster DOM traversal
  * Overall: 30% less execution time
  * Support for CSS3-Hyphenation ([issue133](https://code.google.com/p/hyphenator/issues/detail?id=133))
  * progressive unhiding of hyphenated elements ([issue123](https://code.google.com/p/hyphenator/issues/detail?id=123))
  * Added support for Slovak (thanks to Zdenko Podobny)
And some bugfixes:
  * fixed issue with oncopy and IE9
  * fixed [issue138](https://code.google.com/p/hyphenator/issues/detail?id=138) (HTML5 Elements)
  * fixed [issue142](https://code.google.com/p/hyphenator/issues/detail?id=142) (no-nb -> nb-no)

## [3.3.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%203.3.0.zip) (April 6, 2011) ##
This minor release brings the following changes:
  * Support for Catalan (Thanks to Jordi Rosell)
  * Fixed [issue125](https://code.google.com/p/hyphenator/issues/detail?id=125) (Words containing ZWNJ are hyphenated now)
  * Fixed [issue126](https://code.google.com/p/hyphenator/issues/detail?id=126) (support for substituted chars: e.g. long s in german fraktur)
  * Fixed [issue131](https://code.google.com/p/hyphenator/issues/detail?id=131) (fixed version number)

## [3.2.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%203.2.0.zip) (November 14, 2010) ##
This minor release brings the following changes:
  * Support for Latvian (Thanks to Kristaps Karlsons)
  * Support for Norwegian (Thanks to Erik Erik Seierstad)
  * Added feature to store configuration ([issue113](https://code.google.com/p/hyphenator/issues/detail?id=113))
  * Added feature to defer Hyphenation (because of [issue113](https://code.google.com/p/hyphenator/issues/detail?id=113))
  * Added feature to set a default language ([issue115](https://code.google.com/p/hyphenator/issues/detail?id=115))
  * Fixed [issue110](https://code.google.com/p/hyphenator/issues/detail?id=110) (oncopy is only registered on elements owned by hyphenator)
  * Fixed [issue112](https://code.google.com/p/hyphenator/issues/detail?id=112) (better prompterString for Turkish)
  * Fixed [issue121](https://code.google.com/p/hyphenator/issues/detail?id=121) (wrong rightmin in en-us)

## [3.1.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%203.1.0.zip) (September 2, 2010) ##
This minor release brings the following changes:
  * Support for Belarusian (Thanks to Olexandr Zhydenko)
  * Updated Patterns for German and Ukrainian
  * Possibilities to control if/how the last words of a paragraph are hyphenated
  * Fixed [issue105](https://code.google.com/p/hyphenator/issues/detail?id=105) (NS\_ERROR\_DOM\_SECURITY\_ERR)
  * Fixed [issue106](https://code.google.com/p/hyphenator/issues/detail?id=106) (iframe)
  * Fixed [issue107](https://code.google.com/p/hyphenator/issues/detail?id=107) (compatibility with Google Closure Compiler)
  * Fixed [issue108](https://code.google.com/p/hyphenator/issues/detail?id=108) (QUOTA\_EXCEEDED\_ERR)
  * Fixed an issue with global exceptions not set correctly
  * internal changes to support automated testsuite

## [3.0.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%203.0.0.zip) (July 1, 2010) ##
This major release brings a the following new features:
  * remove hyphenation from copied text ([issue34](https://code.google.com/p/hyphenator/issues/detail?id=34))
  * store patterns in DOM storage ([issue18](https://code.google.com/p/hyphenator/issues/detail?id=18))
  * hyphenate frames/iframes ([issue82](https://code.google.com/p/hyphenator/issues/detail?id=82))
  * support for latin (Thanks to Pablo Rodríguez)
  * support for modern (monoton and polyton) and ancient greek (Thanks to Pablo Rodríguez)
  * support for slovenian (Thanks to Mojca Miklavec)
  * support for bcp47 language tags
  * support for en-us and en-gb
  * updated patterns
  * supports possibility to make settings in bookmarklets ([issue91](https://code.google.com/p/hyphenator/issues/detail?id=91))
An many bugfixes:
  * Fixed [issue85](https://code.google.com/p/hyphenator/issues/detail?id=85)
  * Fixed [issue95](https://code.google.com/p/hyphenator/issues/detail?id=95)


## [2.5.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%202.5.0.zip) (February 27, 2010) ##
This minor release brings a the following changes:
  * Support for Armenian (Thanks to Sahak Petrosyan)
  * Support for Lithuanian (Thanks to Rogutės Sparnuotos)
  * Added a tool to compute reduced pattern sets ([reducePatternSet.html](http://hyphenator.googlecode.com/svn/trunk/reducePatternSet.html))
  * Worked on [issue70](https://code.google.com/p/hyphenator/issues/detail?id=70)
  * Fixed [issue72](https://code.google.com/p/hyphenator/issues/detail?id=72)
  * Fixed [issue73](https://code.google.com/p/hyphenator/issues/detail?id=73)
  * Fixed [issue75](https://code.google.com/p/hyphenator/issues/detail?id=75)
  * Updated the runOnContentLoaded function to most recent state of the art


## [2.4.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%202.4.0.zip) (October 09, 2009) ##
This minor release brings a the following changes:
  * Support for Turkish (thanks to Andreas Lappe)
  * Fixed [issue69](https://code.google.com/p/hyphenator/issues/detail?id=69)
  * There's no longer a 'Zero With Space' inserted after hyphens ([issue70](https://code.google.com/p/hyphenator/issues/detail?id=70))
  * Fixed [issue71](https://code.google.com/p/hyphenator/issues/detail?id=71)


## [2.3.1](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%202.3.1.zip) (August 05, 2009) ##
This bugfix release fixes
  * an issue with sites that don't use utf8.
  * an issue with compressor.html

## [2.3.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%202.3.0.zip) (July 14, 2009) ##
This minor release brings a the following changes:
  * Support for Hungarian (thanks to Péter Nagy)
  * Support for Czech (thanks to Martin Hasoň)
  * Support for Ukrainian (thanks to Alexey Grekov)
  * Updated patterns for german (thanks to the [trennmuster-group](http://groups.google.de/group/trennmuster-opensource))
  * Pattern files are passing jslint w/o warning
  * Fixed issues in compressor.html and merge+pack.html
  * Fixed [issue65](https://code.google.com/p/hyphenator/issues/detail?id=65)

## [2.2.0](http://code.google.com/p/hyphenator/downloads/detail?name=Version%202.2.0.zip) (May 06, 2009) ##
This minor release brings a the following changes:
  * Support for portuguese
  * Functions like hyphenateDocument(), hyphenateElement() and hyphenateWord() are made private. Instead there's a new public function hyphenate().
  * Fixed [issue55](https://code.google.com/p/hyphenator/issues/detail?id=55), [issue56](https://code.google.com/p/hyphenator/issues/detail?id=56), [issue60](https://code.google.com/p/hyphenator/issues/detail?id=60)
  * Internal code beautifying (check with jslint)
  * new service `merge+pack.html` bundled with the package: easily create a customized and packed all-in-one script file of Hyphenator.js

## [2.1.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%202.1.0.zip) (Apr 05, 2009) ##
This minor release brings a the following changes:
  * It's licensed under LGPL version 3.0
  * The DOM isn't cluttered anymore with `lang` and `style` attributes after Hyphenator.js is run
and some bugfixes:
  * fixed [issue 53](https://code.google.com/p/hyphenator/issues/detail?id=53): language is recognized even if it's uppercase

## [2.0.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator%202.0.0.zip) (Mar 15, 2009) ##
This major release brings a big improvement:
  * pattern files are packed by removing the spaces between patterns. Thus, pattern files are 12% smaller in average. As a downside they are harder to create; therefore I created a helper `compressor.html`
Further there are some new features:
  * support for danish (thanks to Henrik Ryom)
  * you may now define a class for elements that should NOT be hyphenated (`donthyphenateclassname`)
  * hyphenation of AJAX-loaded elements is possible
  * exceptions can be defined for ALL languages
  * Hyphenator.config throws an error, when a key is misspelled or unknown.
and some bugfixes:
  * added `textarea` to the elements that will not be hyphenated
  * fixed a bug that occured when no language has been indicated in the prompt.
  * some internal improvements

## [1.0.2](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator_1.0.2.zip) (Mar 08, 2009) ##
Fixed [issue 47](https://code.google.com/p/hyphenator/issues/detail?id=47): Hyphenator.js works in Opera, now.

## [1.0.1](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator_1.0.1.zip) (Mar 02, 2009) ##
A pure bugfix release. It fixes three issues:
  * [issue 43](https://code.google.com/p/hyphenator/issues/detail?id=43): Hyphenator.js didn't work when JSON.js was loaded
  * [issue 44](https://code.google.com/p/hyphenator/issues/detail?id=44): zwsp weren't removed, when hyphenation was turned off
  * an issue that broke Hyphenator.js when there was a internal script on the page befor Hyphenator.js

## [1.0.0](http://code.google.com/p/hyphenator/downloads/detail?name=Hyphenator_1.0.0.zip) (Feb 21, 2009) ##
First release after twelve betas.

See [beta version history (german)](http://www.mnn.ch/hyph/versionhist.html).

# Version Numbers #
You may want to know, how the version numbers are built.
Each version number consists of three numbers separated by a dot:

`A.B.C`

The first number (`A`) denotes the number of the major release. This number is changed if there's a change in the API or an important new feature.

The second number (`B`) denotes the number of a minor release. The numbering begins fom 0, when the major release has changed. A minor release is caused by a new language or an important bugfix.

The third number (`C`) is the bugfix number. The numbering begins from 0, when the minor release number has changed.