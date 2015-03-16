# About Pattern Files #
Each language has its own rules for hyphenation, so Hyphenator.js has to load a language-specific file containing the patterns and some meta information. This files are called pattern files.

Their format and meta information is described in this article.


## Loading of pattern files ##
By default Hyphenator.js searches the html-file for information, witch language to use to hyphenate the text. It then loads the pattern files asynchronously in the background. As soon as the patterns are loaded Hyphenator.js hyphenates the texts.

Instead of automatically loading the patterns [you can load them manually](http://code.google.com/p/hyphenator/wiki/en_PublicAPI#property_remoteloading).

## Encoding and Naming ##
If you decide to create your own pattern file (e.g. to add a new language) you should use the ["compressor"](http://hyphenator.googlecode.com/svn/trunk/compressor.html) that comes with the Hyphenator.js package.

Please make sure to save the file with the following standards:
  * encoding: utf8
  * no BOM
  * filename: `<language-tag>.js` (`<language-tag>` according to [BCP 47](http://en.wikipedia.org/wiki/BCP_47))

## General structure of the pattern files ##
The pattern files should only contain a Javascript-object and Javascript-comments. When loaded this script is executed and the informations are added to the Hyphenator-object that encloses the whole script.

```

/* Comments */
Hyphenator.languages['ex-mpl'] = {
leftmin : 2,
rightmin : 2,
specialChars : "äöü",
patterns : {
…
}
};
```

### Mandatory fields ###
There are four mandatory fields in the object:

|`leftmin`|int number| number of characters (at the beginning of the word) to remain on the line|
|:--------|:---------|:-------------------------------------------------------------------------|
|`rightmin`|int number| number of characters (at the end of the word) to go on the new line|
|`specialChars`|string| all chars that are used in the patterns and are not part of ASCII char set|
|`patterns`|object| the patterns as described below|

### optional fields ###
Additionally to the mandatory fields there are two optional fields in the object:
|`charSubstitution`|object| characters to be replaced for hyphenation (see below)|
|:-----------------|:-----|:-----------------------------------------------------|
|`exceptions`|string CSV| exceptions for the language (see: http://code.google.com/p/hyphenator/wiki/en_DealingWithInaccurateHyphenation#Language_wide_exceptions)|

### charSubstitution ###
With `charSubstitution` you can replace a character in a word by another character for hyphenation (e.g. character `é` treated as `e`).
This is used for example to internally substitute the old german `ſ` (&#383;) with an `s`; the `ſ` will remain in the hyphenated text, though.

```

charSubstitution : {
'ſ' : 's'
}
```
You may also want to substitute more than one character:
```

charSubstitution : {
'à' : 'a',
'ä' : 'a',
'å' : 'a'
}
```

### Pattern packing ###
Since pattern files have to be loaded additionally to the Hyphenator.js-script they should be as small as possible. In standard TeX-hyphenation-pattern the patterns are separated by a white-space character (typically a new line) using 8bits each.

These white-space characters are saved up by sorting the patterns by their length.
```

patterns : {
3 : [patterns with length 3],
4 : [patterns with length 4],
n : [patterns with length n]
}
```
This saves typically around 10% of the file size. Extracting the patterns is much faster then loading the additional 10% of bits.