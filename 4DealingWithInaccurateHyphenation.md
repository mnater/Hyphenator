# Automatic hyphenation is good, but not error-free #

There three types of errors
  * **the algorithm doesn't find a hyphenation point:** this is not very severe, but not very nice either
  * **the algorithm finds to much hyphenation points:** severe!
  * **the algorithm finds a hyphenation point, that grammatically is OK, but syntactically faulty:** e.g. Urin-stinkt in german

It's almost impossible for an algorithm to decide, basing on the context of a word, how it has to be hyphenated.

## How to manually adjust hyphenation ##

There two possible ways:

  1. **Directly edit the text:** if you manually put at least one &shy; in a word, this word isn't hyphenated by Hyphenator any further. But you have to edit the word each time it is used!
  1. **Create an exceptions list:**  When the script is invoked, you can define exceptions that are globally available for the whole script:
```
<script type="text/javascript">
        Hyphenator.addExceptions('Ur-instinkt,Fortran');
        Hyphenator.run();
</script>
```
Now, Hyphenator knows how to hyphenate "Urinstinkt" and that "Fortran" hasn't to be hyphenated at all.
_The values have to be in a comma-separated string with no spaces._

## How to check hyphenation-quality ##
If a high quality of hyphenation is demanded I recommend to check hyphenation as described below:
  1. Use a visible hyphenation char and run a test:
```
	Hyphenator.setHyphenChar('·');
```
  1. Look for misshyphenated words and put them in the exception list.
  1. Turn of the visible hyphenation char:
```
	//Hyphenator.setHyphenChar('·');
```
