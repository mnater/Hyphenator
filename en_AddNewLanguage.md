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
  * Irish (thanks to Kevin Scannell)
  * Georgian (thanks to Levan Shoshiashvili)
  * Church Slavonic (thanks to Aleksandr Andreev)

But Hyphenator is written in a manner that makes it easy to add support for other languages.

## What you can do ##

To add a further language, a language pattern file is needed. If you have a (complete) list of hyphenated words you may be able to compute patterns by your own (if you can, you know how). If not, go to [http://www.ctan.org](http://www.ctan.org/tex-archive/language/hyph-utf8/tex/generic/hyph-utf8/patterns/) and search the LaTeX hyphenation patterns for your language (be aware of the license!)

Next steps you will have to do:
  1. convert the patterns
  2. build a pattern file
  3. change code in Hyphenator.js
  4. send-in changings and patterns if you feel like (I'll take you as a supporter for this language, you'll get full attribution)

### Converting the patterns ###

  * make sure that the licence of the pattern file allows reuse for Hyphenator.js
  * work on a copy of the file, call it `lang`.js (e.g. 'en.js')
  * convert the file to UTF-8
  * replace the lccodes (if any) by their respective characters
  * remove all comments (from '%' to the EOL) from the LaTeX patterns.
  * replace all linebreaks by a single space. At the end there should only be patterns in the file, separated by spaces.
  * use [compressor.html] (http://mnater.github.io/Hyphenator/compressor.html) (that comes with the Hyphenator-package) to build the patterns and information for Hyphenator.js. compressor.html outputs the pattern in a special format described in https://github.com/mnater/Hyphenator/blob/wiki/en_PatternFilesFormat.md


### adapt code in Hyphenator ###
Add a new line to `supportedLangs` (around line 110 in Hyphenator.js) for the new language.

Make some tests to see, if it works!

### send in changings and patterns ###
If you like to support Hyphenator, you may send in the work you've done. You'll get full attribution. I will ask you to put your Mail in the header of the pattern file (see nl.js for example).
