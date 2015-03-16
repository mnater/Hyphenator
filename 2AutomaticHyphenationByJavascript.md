# Automatic hyphenation in HTML with Javascript #

## Abstract ##
This Article treats in its [first part](http://code.google.com/p/hyphenator/wiki/1HyphenationInHTML) the problem of word hyphenation in current webbrowsers. In this second part a javascript doing automatic word hyphenation is presented as a possible solution. This script relies on Liangs thesis and uses hyphenation patterns from the LaTeX-Distribution.

English's not my first language. Please send in corrections. Thank you.


## Liangs Thesis ##
1983 Franklin Mark Liang worked within the scope of his dissertation on an algorithm for the automatic hyphenation in the text setting system (La)TeX. At this time it was important that an application used as less memory as possible — a long list with all words and their hyphen points was out of question.

Liangs advisor and creator of (La)TeX, Donald Knuth, had already developped an algorithm able to hyphenate english words by cutting off pre- and suffixes. Liang went further.

Out of a list with hyphenated words he computed patterns with integer values. Odd numbers are marking hyphenation points. With this patterns a program can compute possible hyphen points of any given word. Such patterns look like this:

`hy3ph he2n hen4a hen5at 1na n2at 1tio 2io o2n`.

To find hyphenation points you have to get all fitting patterns and to combine the integers – a bigger value overwrites a smaller one.

To the word `hyphenation` the mentioned patterns are matching and are doing the following:

```
 h y p h e n a t i o n 
 h y3p h
       h e2n
       h e n a4
       h e n5a t
          1n a
           n2a t
              1t i o
                2i o
                   o2n
-----------------------
 h y3p h e2n5a4t2i o2n
```
That gives us `hy|phen|ation`.

Liang tried many different parameters for the computation of the patterns. He preferred to miss
out a hyphenation point instead of setting a false one. During his tests he found that with only about 5000 patterns
the programm was able to find almost 90% of all hyphenation points. To find all hyphenation points over 20'000
patterns would have been necessary &ndash; a great deal too much for computers of this time.

Later, patterns for many other languages have been computed and are used in todays software
like Openoffice and LaTeX.

Patterns are available online at [CTAN](http://www.ctan.org/tex-archive/language/hyphenation/") under the LaTeX Project Public License.

## Implementation in Javascript ##
Due to its low memory usage and its simplicity Liangs algorithm suits very well for usage on webpages. As you will see, the entire script including one pattern library isn't bigger then 100KB and fast enough.
(First benchmarks have been taken on an older Powermac G4/933MHz and Safari 2.0.4. Current machines will be much faster.)

### Preparing the patterns ###
First I tried to use the patterns directly in their original format `n1tr`. A pattern file like this was
about 40KB but it took over 2 seconds to read it.

Thats why I converted them to a JSON-format (`{"ntr":"0100"}`), which uses more then twice as much space
but is read in less than 30ms.

Liang proposes to use a trie as basic data structure for the patterns. I did it, too. But it
was too slow (assumed I did everything right!): With a trie many searches for patterns could be avoided, but
traversing the trie was so slow.

It took quite a while for me to find the current solution as of version 9. Patterns are now transmitted in their native form (`n1tr`) and on the fly filled in to an object `{"ntr":"n1tr"}`. The conversion takes about 200ms on IE and, thus, is fast enough.

## How it works (just an overview) ##
There are two modes:
  1. Running when the page is loaded
  1. Running as a Bookmarklet

### Running when the page is loaded ###
This mode is used, when you include Hyphenator on your own webpage. It is highly customizable and fast.

The script is doing its work as follows:
  1. By including the `Hyphenator.js` in your HTML a Hyphenator-Object is automatically created but hyphenation is not executed yet.
  1. On creation the script guesses the main language of the site, and decides if it's running as a bookmarklet or not. If it can't find a hint on the language it displays a user prompt.
  1. When the page is loaded it can start the hyphenation process by calling `Hyphenator.hyphenateDocument();`:
    1. the `Hyphenator.prepare` walks through the document and looks what languages are used. It then loads the necessary patterns.
    1. When all patterns are loaded, it looks for all elements with `class="hyphenate"`.
    1. The function `Hyphenator.hyphenateElement()` further takes care of these elements by extracting their child-Nodes. The child-Nodes are recursively traversed until they are text-Nodes, which contents are replaced with hyphenated texts.

By applying the `class="hyphenate"` only to a small set of elements you can massively speed up the script. Beside that laoding the patterns take their time depending on bandwith.

### Running as a Bookmarklet ###
This mode is used when you start Hyphenator from a Bookmarklet on any arbitray webpage. It's slower end lesser customizable.

The script does his work almost exactly as explained above. But there are some small changes:
  1. By starting the bookmarklet, the script is included in the page and has to be loaded first.
  1. By including the `Hyphenator.js` in your HTML a Hyphenator-Object is automatically created but hyphenation is not executed yet.
  1. On creation the script guesses the main language of the site, and decides if it's running as a bookmarklet or not. If it can't find a hint on the language it displays a user prompt.
  1. When the page is loaded it can start the hyphenation process by calling `Hyphenator.hyphenateDocument();`:
    1. the `Hyphenator.prepare` walks through the document and looks what languages are used. It then loads the necessary patterns.
    1. When all patterns are loaded, it hyphenates the `<body>`-Element (and all its children).
    1. The function `Hyphenator.hyphenateElement()` further takes care of the `<body>` by extracting its child-Nodes. The child-Nodes are recursively traversed until they are text-Nodes, which contents are replaced with hyphenated texts.

Because the script has to traverse all elements and hyphenates them all, this mode may take a while to complete (some seconds). Beside that loading the patterns _and the script_ take their time depending on bandwith.

## How it works (the fussy details) ##
Read the code!

## Getting and using the script ##
Just [download](http://code.google.com/p/hyphenator/downloads/list), unzip and read the [how to](3HowTo.md) use it on your page.

You can use it as a bookmarklet, too. By clicking this bookmarklet you can hyphenate whatever webage you want. To set the bookmarklet just save the following script as a bookmark:
```
javascript:if(document.createElement){void(head=document.getElementsByTagName('head').item(0));void(script=document.createElement('script'));void(script.src='http://www.mnn.ch/hyph/v5/Hyphenator.js?bm=true');void(script.type='text/javascript');void(head.appendChild(script));}
```