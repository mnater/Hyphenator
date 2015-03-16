# Hyphenation in HTML #
[zur deutschen Version](http://code.google.com/p/hyphenator/wiki/1SilbentrennungInHTML)

## Abstract ##
This article treats in this  first part the problem of word hyphenation in current webbrowsers. In its [second part](http://code.google.com/p/hyphenator/wiki/2AutomaticHypheationByJavascript) a javascript doing automatic word hyphenation is presented as a possible solution. This script relies on Liangs thesis and uses hyphenation patterns from the LaTeX-Distribution.


English's not my first language. Please post corrections. Thank you.


## `text-align:justify; vs. text-align:left;` ##
Text in current browsers is set ragged-left per default. With the CSS-property `text-align:justify;` it can be set in hyphenless justification. This leads to an ugly typeface with big spacings, particularly in narrow columns with long words.

Beside that, justified text on webpages is controversial. Ragged-left text together with a short line length and generous line spacing is said to bring better readability because it leads the eye. So the eye doesn't get lost when it jumps to a new line.

Generally the distance between text and eye is much bigger when reading texts on screen instead of reading printed texts. Furthermore you rarely use your index for orientation. To enhance readability of a screen text it is better to set it ragged-left. Nevertheless it may be desirable for printed webpages to be justified with hyphenation.

Last but not least hyphenation may also be useful in ragged-left text. Not only to break long words in narrow table-columns, but also to “calm” the text.

## Automatic Hyphenation ##
Hyphenation is a big issue for professional applications in print business. But things like optical margin alignment isn't very important in webdesign because of the much lower resolution of screens. Far from it! There is no hyphenation on webpages (yet)!

Automatic hyphenation is quite complex: It depends fairly on the particular language. English words are shorter on average then e.g. german words. Other languages behave completly different. In Thai there aren't any spaces between words.

In most text processing applications lexical algorithms are used to find components and hyphenation points for each word. Words and components that can't be found on the list have to be hyphenated manually. The disadvantage of this approach is the extended use of storage space and the fact that unknown words (often compounds) can't be hyphenated.

Pattern based algorithms are the other side of the game. They compute patterns out of long lists of hyphenated words and later use this patterns to find hyphenation points. The most known algorithm of this kind is Franklin Mark Liangs (see [Word Hy-phen-a-tion by Com-put-er](http://www.tug.org/docs/liang/liang-thesis.pdf)), which has been developed 1983 and is used in applications like LaTeX and Openoffice. Pattern based algorithms are - depending on the length of the initial word list - able to find 90% of all hyphenation points. Although they can produce confusions with other words (such as “recover” vs. “re-cover”) wich have to be edited manually.

## Using hyphenation on webpages today ##
The [HTML401-Standard](http://www.w3.org/TR/html401/struct/text.html#h-9.3.3) says

_In HTML, there are two types of hyphens: the plain hyphen and the soft hyphen. The plain hyphen should be interpreted by a user agent as just another character. The soft hyphen tells the user agent where a line break can occur._

_Those browsers that interpret soft hyphens must observe the following semantics: If a line is broken at a soft hyphen, a hyphen character must be displayed at the end of the first line. If a line is not broken at a soft hyphen, the user agent must not display a hyphen character. For operations such as searching and sorting, the soft hyphen should always be ignored._

_In HTML, the plain hyphen is represented by the "-" character (&#45; or &#x2D;). The soft hyphen is represented by the character entity reference &shy; (&#173; or &#xAD;)_

The Standard doesn't dictate that browsers have to support the `&shy;`-Entity. Nevertheless all actual browsers (Internet Explorer since version 5, Safari 2, Opera since version 7.1) except for Firefox 2.0 support it. (Firefox is going to support it with its upcoming version 3.0 wich is currently beta.)
Still, its up to the author to put `&shy;` inside every word.

The disadvantage of using `&shy;` is that hyphenated words won't be found by the browsers Search-Function.
I also assume that search engines don't index hyphenated words.

## Hyphenation in tomorrow's web ##

With [CSS 3](http://www.w3.org/TR/css3-text/#hyphenate) (today only CSS 2.1 is actually usable) it will be possible to control how texts are hyphenated. Still, it is important to note that CSS 3 do not explicitly specify that browsers will have to support hyphenation.

## Conclusion ##
Although hyphenation isn't very important on webpages, it may lead to nicer layouts. Currently hyphenation has to be done by the author manually by putting `&shy;` at the right places. There is no clientside automatic hyphenation.


## And now? ##
All major browsers do support &shy; (since version 3, even Firefox does). Therefore, an automated hyphenation is going to be more and more interesting. Until browsers have their own hyphenation-mechanism, hyphenation can only be achieved in three way. Firstly, during the authoring of the text (by the editor). Secondly, before the delivery of the page (by a server-side script). Thirdly, by the browser of the user (with a client-side scripting language like Javascript).

Using Javascript on the clientside has the big advantages that hyphenation can be turned on and off by the user and isn't seen by search bots.

The <a href='hyphenation2.html'>second part</a> of this article shows a possible implementation in Javascript.