# Introduction #
_time-stamp: October 28, 2012_

> "In justified text, there is always a trade-off between evenness of word spacing and frequency of hyphenation. Narrow measures – which prevent good justification – are commonly used when the text is set in multiple columns. Setting ragged right under these conditions will lighten the page and decrease its stiffness."

> (The Elements of Typographic Style by Robert Bringhurst via http://webtypography.net/)

**The web is ragged right.**

In typography justification and hyphenation always come together. Justified text without hyphenation is considered as a no-go.

For years webdesigners have been discouraged to use `text-align: justify` because it led to ugly interword spaces due to the lack of hyphenation in webbrowsers.

**The need for hyphenation is language specific**

In english words are short in average. Even in narrow, ragged-left columns the need for hyphenation is rare.

On the contrary words in e.g. German are longer in average. To avoid single words per line or text-overflows words have to be hyphenated, sometimes even in ragged-right texts.

**There are bad solutions …**

To wrap words at the end of lines, people are very creative. They split up compound words with a space or a hyphen-minus which may work on one plattform but looks ugly on the other where a different font is used.

**… and better solutions …**

The soft hyphen http://unicode.org/reports/tr14/#SoftHyphen is an invisible character that marks a hyphenation point in a word. If the layout engine decides to break the line at this point a hyphen character (commonly a hyphen minus) will be displayed.

Inserting the soft hyphen manually works fine but is quite expensive. There are several solutions to automatically insert soft hyphens at the server-side or on the client.

These solutions all have their drawbacks: it requires computing time and network bandwith (either to serve hyphenated text or to serve the script that hyphenates).

**… and finally best solutions!**

CSS3 defines some new properties to enable hyphenation by webbrowsers http://www.w3.org/TR/css3-text/#hyphenation. Since in most cases hyphenation is a question of style, CSS is the right place to do it. Allthough there are rare cases where a missplaced hyphen changes the meaning of the word: e.g. Wach-stube (German for guardroom) vs. Wachs-tube (wax tube). In these rare cases hyphenation as to be done manually by the author.

CSS3 is still a working draft and support for CSS3-hyphenation is not yet widely deployed nor documented. First implementations came up in iOS 4.2 (Safari and iBooks on iPhone and iPad) late 2010 followed by Safari 5.1 and Firefox 6 (both mid 2011). Still the range of supported language is varying, but the issue is improving.

## Intent of this article ##

I like to give an overview of the state of the art of hyphenation in the different UserAgents (aka browsers) and how it can be used and how it is implemented.

# Automatic hyphenation – algorithm #

It looks like all engines are using the hyphenation algorithm by Franklin Mark Liang http://www.tug.org/docs/liang/liang-thesis-hires.pdf or a derivation of it. It is easy to implement and thanks to TeX there are hyphenation patterns for a wide range of languages available for free http://tug.org/svn/texhyphen/. See http://www.mnn.ch/hyph/hyphenation2.html for a short abstract on how it works.

While using the hyphenation patterns is easy, they are quite complicated to compute and maintain. Whereas free and open software (like Mozilla Firefox or OpenOffice) relies on the free TeX hyphenation patterns other vendors are buying patterns from specialized companies.

In short terms: to support hyphenation one will
  1. need to implement the hyphenation algorithm and
  1. needs the hyphenation patterns for each language.

# CSS3-text hyphenation (standard) #
The number of properties to control hyphenation have been reduced to one single property (hyphens) over the last months:

| property | [WD-css3-text-20110412](http://www.w3.org/TR/2011/WD-css3-text-20110412/) | [WD-css3-text-20110901](http://www.w3.org/TR/2011/WD-css3-text-20110901) | [WD-css3-text-20120119](http://www.w3.org/TR/2012/WD-css3-text-20120119/) | [latest WD](http://dev.w3.org/csswg/css3-text/) |
|:---------|:--------------------------------------------------------------------------|:-------------------------------------------------------------------------|:--------------------------------------------------------------------------|:------------------------------------------------|
| hyphens | 1 | 1 (removed value 'all') | 1 | 1 |
| hyphenate-resource/@hyphenate-resource | 1 | removed | 0 | 0 |
| hyphenate-character | 1 | 1 | deferred to Level 4 | 0 |
| hyphenate-limit-zone | 1 | 1 | deferred to Level 4 | 0 |
| hyphenate-limit-chars | 1 | 1 | deferred to Level 4 | 0 |
| hyphenate-limit-lines | 1 | 1 | deferred to Level 4 | 0 |
| hyphenate-limit-last  | 1 | 1 | deferred to Level 4 | 0 |

So we are actually confronted with some sort of hyphenation, but we do not have any controls over the resulting layout (orphans, number of consecutive hyphenated lines etc.).

# Usage of the hyphens-property #

## Firefox ##
In Firefox 6, released in August 2011, support for hyphenation has started. The algorithm is implemented but only patterns for english are included https://bugzilla.mozilla.org/show_bug.cgi?id=253317.

Mozilla uses the [Hunspell](http://sourceforge.net/projects/hunspell/) library which includes an extended version of Liangs hyphenation algorithm. Hunspell includes the patterns for english which in turn are a derivate of the original TeX patterns.

To include more languages in Mozilla Firefox the patterns from TeX have to be converted in the (slightly different) hunspell format. This has been done for a wide range of languages in Firefox 8 (released November 8, 2011) and some additional languages were added in Firefox 9 (December 20, 2011).

The hyphenation patterns for the different languages are stored in the omni.ja-archive (that can be unzipped).

Due to licensing issues it is not yet clear if all languages from the TeX repository will be included in Firefox.

## Webkit/Safari ##
Safari has a different approach: It uses a system service to hyphenate texts.

**Lion (Mac OS X 10.7) and Mountain Lion (10.8)**
The patterns are located in `/System/Library/LinguisticData/`. There are patterns (binaries) for de, en\_GB, en\_US, es, fr, it, nl and ru.

**Snow Leopard (Mac OS X 10.6)**
Only English is supported: (/System/Library/Frameworks/AppKit.framework/Resources/English-Hyphenation.txt)

**iOS Versions 4.2 to 5.1.1**
Hyphenation in Safari on iOS (< iOS 6) is weird. It's activated with '-webkit-hyphens: auto;', too. But it doesn't respect any language settings. Unfortunately all texts are hyphenated with the rules for the given system-language. So if your iPhone is set to German, all texts are hyphenated with German rules!

Due to that bug and because iOS is really a closed system, I actually can't figure out what languages iOS (< iOS 6) can hyphenate.

**iOS Version 6**
In Webkit/Safari for iOS 6 the previous bugs have been fixed and it behaves like Safari on Desktop.

## Webkit/Chrome ##
Chrome (as of Version 22) has a [bug](http://code.google.com/p/chromium/issues/detail?id=47083). It implements '-webkit-hyphens' but doesn't hyphenate texts. It looks like the issue has been fixed and hyphenation support will come up with a future version.

## Microsoft Internet Explorer ##
IE10 on Windows 8 (released Oct 26, 2012) supports hyphens for a distinctive set of languages.
The pattern files (binaries) can be found in 'Windows\Globalisation\ELS…'.

## Opera ##
Not yet supported.

## Using CSS3 hyphenation ##
Since CSS3 is a working draft you'll need to prepend vendor prefixes ('-webkit-', '-moz-', '-ms-') to the hyphens property.

Further, you'll have to provide the browsers with an information about the language of the text by setting the html-lang attribute

```
<!DOCTYPE HTML>
<html>
    <head>
        <title>CSS3 Hyphenation</title>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <style type="text/css">
			p {
				width: 5em; /*just for testing purposes*/
				-webkit-hyphens: auto;
				-moz-hyphens: auto;
				-ms-hyphens: auto;
				hyphens: auto;
			}
        </style>
    </head>
    <body>
		<p lang="en">supercalifragilisticexpialidocious</p>
		<p lang="es">supercalifragilisticexpialidocious</p>
	</body>
</html>
```

# Supported languages #
As noted above the user agents need hyphenation patterns for each language. While most of the actual browsers provide basic support for the hyphens-property, they do not support the same set of languages. Since 'hyphenate-resource/@hyphenate-resource' had been removed from CSS3 there's no way to add hyphenation support by the user.

An automated testsuite and compatibility table can found here: http://www.mnn.ch/hyphensChecker/index.php