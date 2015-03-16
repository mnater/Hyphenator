# Adding further languages - about the pattern files #

## What we have now ##
Currently, there's support for
  * English (US and GB)
  * German
  * French
  * Dutch (thanks to Remco Bloemen)
  * Swedish (thanks to Andreas Johansson)
  * Spanish (thanks to Luis Pabón)
  * Malayalam, Tamil, Hindi, Oriya, Kannda, Telugu, Bengali, Gujarati and Panjabi (thanks to Santhosh Thottingal)
  * Italian (thanks to Stefano Gorini)
  * Finnish (thanks to Olli Wilkman)
  * Russian (thanks to Dmitry Vedernikov)
  * Polish (thanks to Kamil)
  * Danish (thanks to Henrik Ryom)
  * Portuguese (thanks to Lailson Bandeira)
  * Hungarian (thanks to Péter Nagy)
  * Czech  (thanks to Martin Hasoň)
  * Ukrainian (thanks to Alexey Grekov)
  * Turkish (thanks to Andreas Lappe)
  * Armenian (thanks to Sahak Petrosyan)
  * Lithuanian (thanks to Rogutės Sparnuotos)
  * Slovenian (thanks to Mojca Miklavec)
  * Latin (thanks to Pablo Rodríguez)
  * Greek, monoton, polyton and ancient (thanks to Pablo Rodríguez)
  * Belarusian (thanks to Olexandr Zhydenko)
  * Norwegian (thanks to Erik Erik Seierstad)
  * Latvian (thanks to Kristaps Karlsons)
  * Catalan (thanks to Jordi Rosell)
  * Serbian Latin script (thanks to Sonja Keljevic)
  * Esperanto (thanks to Sergio Pokrovskij)
  * Estonian (thanks to Enn Saar and Peeter Marvet)
  * Romanian (thanks to irragal)
  * Slovak (thanks to Zdenko Podobný)
  * Serbian Cyrillic (thanks to Milan Gurjanov)

But Hyphenator is written in a manner that makes it easy to add support for other languages.

## What you can do ##

To add a further language, a language pattern file is needed. If you have a (complete) list of hyphenated words you may be able to compute patterns by your own (if you can, you know how). If not, go to [http://www.ctan.org](http://www.ctan.org/tex-archive/language/hyph-utf8/tex/generic/hyph-utf8/patterns/) and search the LaTeX hyphenation patterns for your language (be aware of the license!)

Next steps you will have to do:
  1. convert the patterns
  1. build a pattern file
  1. change code in Hyphenator.js
  1. send-in changings and patterns if you feel like (I'll take you as a supporter for this language, you'll get full attribution)

### Converting the patterns ###

#### Version >1.2.0 ####
  * make sure that the licence of the pattern file allows reuse for Hyphenator.js
  * work on a copy of the file, call it `lang`.js (e.g. 'en.js')
  * convert the file to UTF-8
  * replace the lccodes (if any) by their respective characters
  * remove all comments (from '%' to the EOL) from the LaTeX patterns.
  * replace all linebreaks by a single space. At the end there should only be patterns in the file, separated by spaces.
  * use compressor.html (that comes with the Hyphenator-package) to build the patterns and information for Hyphenator.js. compressor.html outputs the pattern in a special format described in http://code.google.com/p/hyphenator/wiki/en_PatternFilesFormat

#### Version <1.0.2 ####
  * LaTeX patterns are coming in this form: `.ab3s2`. To see the difference I use underline instead of point. A simple search&replace will do the trick: `_ab3s2`
  * All pattern files should be encoded with **UTF-8 (with BOM)**.
  * Copy an other pattern file and replace the patterns.
  * Adjust the other variables as following:
> | _Name_ | _Description_ |
|:-------|:--------------|
> | Hyphenator.leftmin | On the old line, there shall remain this number of letters at minimum (preventing e.g. '  a-') |
> | Hyphenator.rightmin | This number of letters at minimum are on the newline (preventing e.g. '-a ') |
> | Hyphenator.shortestPattern | The sortest pattern in the list (for better performance). Do not count the numbers! E.g. the pattern `_ab3s2` has a length of four (4). |
> | Hyphenator.longestPattern | The longest pattern in the list (for better performance). Do not count the numbers! E.g. the pattern `_ab3s2` has a length of four (4). |
> | Hyphenator.specialChars | Non-ASCII-letters used in this language. |
  * Dont forget to change the language on the first line and to change the filename accordingly.

### adapt code in Hyphenator ###
There is one thing you HAVE to change and one thing you SHOULD change in Hyphenator.js:
#### Version >4.0.0 ####
Add the new language to `supportedLangs` (around line 90 in Hyphenator.js)
#### Version >=3.0.0 ####
  * `supportedLang`: Add the new language to the list. Please use the [bcp47-codes](http://www.rfc-editor.org/rfc/bcp/bcp47.txt) for the language to be supported.
  * `prompterStrings`: This strings are used if the language of a document isn't defined. Please translate this short text to the language to be supported.

#### Version <3.0.0 ####
  * `languageHint`: Add the new language to the list. Please use the [ISO 639-1-Code](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for the language to be supported.
  * `prompterStrings`: This strings are used if the language of a document isn't defined. Please translate this short text to the language to be supported.

Make some tests to see, if it works!

### send in changings and patterns ###
If you like to support Hyphenator, you may send in the work you've done. You'll get full attribution. I will ask you to put your Mail in the header of the pattern file (see nl.js for example).
<a href='Hidden comment: 
== The pattern files format ==
Pattern files include a JavaScript-Object that is directly stored in an other object of Hyphenator:
```
Hyphenator.languages["lang"] = { … };
```
(Therefore the patterns have to be loaded after the Hyphenator-Script.)

The object
'></a>