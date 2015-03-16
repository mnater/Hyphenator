# FAQ #

**List of questions:**


---


## What about CSS3 hyphenation? ##
There's work going on on standardizing hyphenation in CSS 3 ([css3-text](http://www.w3.org/TR/css3-text/#hyphenation)).
Modern browsers already support CSS3 hyphenation for a different set of languages and support is growing.

Since Version 4.0.0 Hyphenator.js respects those browsers and automatically activates css3-hyphenation if available. See [the manual](http://code.google.com/p/hyphenator/wiki/en_PublicAPI#property_useCSS3hyphenation) on how to enable this in Hyphenator.js.

And even if all browsers will generally support hyphenation one day they will not support all languages Hyphenator.js can deal with actually… So Hyphenator.js will remain as a polyfill for this browsers.

[> Go to top](#FAQ.md)

## Shouldn't hyphenation be done on the server side? ##
There are some arguments against client side hyphenation - true. It costs a lot of computing time and the patterns have to be loaded for each language, everytime.
But I believe that hyphenation belongs to the client:
  * Only the client «knows» where to break a line (and if at all).
  * A html file that has been hyphenated on the server would be full of &shy;'s. That's ugly and nobody knows how that would be treated by search engines…
  * Hyphenation on the client can be turned off to work around copy&paste- and search-bugs in most browsers.
  * as JavaScript-engines are in focus of development, they become faster and faster.
  * there are billions of mostly underworked clients vs. millions of often overloaded servers.

[> Go to top](#FAQ.md)

## Hyphenator breaks the search functionality of my browser ##
Your browser has a bug (Standards are very clear in this point: "For operations such as searching and sorting, the soft hyphen should always be ignored." http://www.w3.org/TR/html401/struct/text.html#h-9.3.3). So I don't want/can't fix this in Hyphenator.js.
The only thing we can do is to turn hyphenation off before searching.

[> Go to top](#FAQ.md)

## When I copy/paste hyphenated texts from a website, spaces/hyphens are inserted in allmost all words ##
This is fixed since version 3.0.0. Make sure that the option `safecopy` is set to `true`.

[> Go to top](#FAQ.md)

## I want to set a value for the minimum of letters that remain on the old line/come to the new line. ##
In CSS3 are parameters hyphenate-before and hyphenate-before. These setting are made per language in the pattern files. You'll have to change them there.

[> Go to top](#FAQ.md)

## Could you write an extension/plugin for … ##
Maybe I could. But
  1. to maintain Hyphenator.js is enough for the moment and
  1. there are so many CMSs, Blogs and other Frameworks out there, I wouldn't know where to begin.
The coolest thing is, when YOU decide to write a plugin or whatever for your favorite environment, based on Hyphenator.js.
If you need a special feature, send me an e-mail, We'll found a solution.

[> Go to top](#FAQ.md)

## Why are the pattern files so different in size? ##
Patterns depend highly on linguistics and grammar of the respective language. Where it seems (I suppose) to be enough for some Indian languages to break a word after some special characters the hyphenation rules for german are quite complex.

[> Go to top](#FAQ.md)

## JavaScript is insecure and evil. It should be turned off in every browser! ##
Welcome to Web 2.0, the world of AJAX and modern browsers!
It's true, JavaScript had a very bad reputation - not because JavaScript itself is bad, but because of a very poor implementation in some browsers. As of today JavaScripts influence is growing and browser developers put a lot of work in making their JavaScript engines better, secure and really fast. There are a lot of webpages using JavaScript in a good manner.
Further, Hyphenator.js follows the rules of **[unobtrusive JavaScript](http://en.wikipedia.org/wiki/Unobtrusive_JavaScript)**.

[> Go to top](#FAQ.md)

## How about Accessibility? ##
Following the rules of **[unobtrusive JavaScript](http://en.wikipedia.org/wiki/Unobtrusive_JavaScript)** Hyphenator.js has AFAIK no influence on accessibility of your webpage. It just adds a feature that will not be missed by a screen reader.

Some screen readers have issues with words that contain soft hyphens (they read syllables instead of words). Please note that this is not an issue of Hyphenator but a bug in the screen reader. Please contact the makers of the screen reader application.

[> Go to top](#FAQ.md)

## How to hyphenate text that has been loaded with AJAX? ##
The simple answer is: just call Hyphenator.run() again.
The problem with this is, that Hyphenator.js will process the whole file again (and not just the reloaded text).
Instead you can redefine `selectorfunction` in a way that it just returns the elements that have been loaded by AJAX.
I've created a testcase (http://hyphenator.googlecode.com/svn/trunk/testsuite/test44.html) where you can have a look how this works (using jQuery).
Here's the code:
```
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"></script>
<script src="../Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({
		hyphenchar:'|'
	});
	Hyphenator.run();
	function insert()  {
		$("#target").load("test44inc.html",'',cb);
	}
	function cb () {
		Hyphenator.config({
			selectorfunction: function(){
				return $("#target").get();
			}
		});
		Hyphenator.run();
	}
</script>
```

UPDATE:
See https://code.google.com/p/hyphenator/issues/detail?id=192
I'm working on a fix.

[> Go to top](#FAQ.md)

## Can I use hyphenator.js in a frameset? ##
Yes, this feature is new in version 3.0.0 but turned off by default. You can turn it on with the option `doframes`.
Due to the [Same Origin Policy](http://en.wikipedia.org/wiki/Same_origin_policy) only frames with the same origin can be hyphenated.

[> Go to top](#FAQ.md)