# Dealing with inaccurate hyphenation #
Automatic hyphenation will never be perfect. There are special cases where a algorithm can't decide how to hyphenate, because it doesn't take in account the context.

In other words, you should check the hyphenation when possible and correct eventually false hyphenation points.

## Checking hyphenation ##
After you've written the text, set hyphenChar to something visible (I prefer the pipe '|') to be able to check the result of the automatic hyphenation.
### Example - Checking hyphenation ###
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({
            urlhyphenchar : '|',
            hyphenchar : '|'
        });
	Hyphenator.run();
</script>
```

## Fixing bad hyphenation ##
There are three levels of adding exceptions to the hyphenation process:
  * **word level:** manually hyphenate a word
  * **page wide:** defined in the &lt;script&gt;-tag
  * **language wide:** defined in the pattern file

### Manually hyphenated words ###
If a word already contains a character defined in `hyphen` (by default the soft hyphen), this word will not be processed by Hyphenator.js

Thus, you can directly hyphenate words in the text.
#### Example - manually hyphenating ####
```
<p class="hyphenate" lang="en">Loading the whole patternfile for just one german word like «Sil&shy;ben&shy;tren&shy;nung» would be an overkill.</p>
```

### Page wide exceptions ###
Often a word is used repeatedly on the same page. It isn't an option to edit it every time manually. You can define an exeption instead using the addException-method.

This method takes two parameters: a string defining the language and a second string containing all words, hyphenated with a dash (-) and separated with a semicolon followed by a space.

With this method you can also inhibit hyphenation of a single word.
#### Example ####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.addExceptions('en','FORTRAN, man-u-script, man-u-scripts');
	Hyphenator.run();
</script>
```
On this page, the word FORTRAN will not be hyphenated at all.

### Language wide exceptions ###
Finally, if the same word is used over several pages you don't have to define the exceptions on every page.

Instead, you can define the exceptions directly in the pattern files for each language. Therefore you have to insert a new field in the pattern object (don't forget to add the comma after the patterns):

```
Hyphenator.languages.en={
    leftmin : 2,
    rightmin : 2,
    shortestPattern : 2,
    longestPattern : 8,
    specialChars : '',
    patterns : {[... the patterns ...]},
    exceptions : 'FORTRAN, man-u-script, man-u-scripts'
};
```