# What we have now #

Currently, there's support for
  * english
  * german
  * french
  * dutch (thanks to Remco Bloemen)
  * swedish (thanks to Andreas Johansson)
  * spanish (thanks to Luis Pabón)
  * Malayalam, Tamil, Hindi, Oriya, Kannda, Telugu, Bengali, Gujarati and Panjabi (thanks to Santhosh Thottingal)
  * Italian (thanks to Stefano Gorini)

But Hyphenator is written in a manner that makes it easy to add support for other languages.

# What you can do #

To add a further language, language pattern file is needed. If you have a (complete) list of hyphenated words you may be able to compute patterns by your own (if you can, you know how). If not, go to http://www.ctan.org and search the LaTeX hyphenation patterns for your language.

Next steps you will have to do:
  1. converting the patterns
  1. changing code in Hyphenator.js
  1. send-in changings and patterns if you feel like (I'll take you as a supporter for this language, you'll get full attribution)

## Converting the patterns ##
  * LaTeX patterns are coming in this form: `.ab3s2`. To see the difference I use underline instead of point. A simple search&replace will do the trick: `_ab3s2`
  * All pattern files should be encoded with **UTF-8 (with BOM)**.
  * Copy an other pattern file and replace the patterns.
  * Adjust the other variables as following:
> | _Name_ | _Description_ |
|:-------|:--------------|
> | Hyphenator.leftmin | On the old line, there shall remain this number of letters at minimum (preventing e.g. '  a-') |
> | Hyphenator.rightmin | This number of letters at minimum are on the newline (preventing e.g. '-a ') |
> | Hyphenator.shortestPattern | The sortest pattern in the list (for better performance) |
> | Hyphenator.longestPattern | The longest pattern in the list (for better performance) |
> | Hyphenator.specialChars | Non-ASCII-letters used in this language |
  * Dont forget to change the language in each variable and to change the filename accordingly.

## adapt code in Hyphenator ##
There are three variables that have to be changed to add a further language.
  * `SUPPORTEDLANG`: Please use the [ISO 639-1-Code](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for the language to be supported.
  * `LANGUAGEHINT` and
  * `PROMPTERSTRINGS`: This strings are used if the language of a document isn't defined. Please translate this short text to the language to be supported.

Make some tests to see, if it works!

## send in changings and patterns ##
If you like to support Hyphenator, you may send in the work you've done. You'll get full attribution. I will ask you to put your Mail in the header of the pattern file (see nl.js for example).