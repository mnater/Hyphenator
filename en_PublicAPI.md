# Public API #
Hyphenator.js provides an [API](http://en.wikipedia.org/wiki/Application_programming_interface) that allows webdevelopers to customize behaviour and look of Hyphenator.js

Methods and fields that are accessible (public) are defined in the following.

## Fields ##
### version ###
String that holds the version number.

### languages ###
Object that holds a key-value pairs, where key is the language and the value is the language-object loaded from (and set by) the pattern files. See [en\_PatternFilesFormat](http://code.google.com/p/hyphenator/wiki/en_PatternFilesFormat) for details.

## Methods ##
### void Hyphenator.config(object settings) ###
The config-method gives you a wide range of possibilities to adapt behaviour and look of Hyphenator.js.
To use the config method, you'll have to define an object that holds at least one of the following keys.
The values for the associated keys must be of the defined type:
<table>
<tr><th>key</th><th>type</th></tr>
<tr><td>classname</td><td>string</td></tr>
<tr><td>donthyphenateclassname</td><td>string</td></tr>
<tr><td>urlclassname</td><td>string</td></tr>
<tr><td>minwordlength</td><td>number</td></tr>
<tr><td>hyphenchar</td><td>string</td></tr>
<tr><td>urlhyphenchar</td><td>string</td></tr>
<tr><td>togglebox</td><td>function</td></tr>
<tr><td>displaytogglebox</td><td>boolean</td></tr>
<tr><td>remoteloading</td><td>boolean</td></tr>
<tr><td>enablecache</td><td>boolean</td></tr>
<tr><td>enablereducedpatternset</td><td>boolean</td></tr>
<tr><td>onhyphenationdonecallback</td><td>function</td></tr>
<tr><td>onerrorhandler</td><td>function</td></tr>
<tr><td>intermediatestate</td><td>string</td></tr>
<tr><td>selectorfunction</td><td>function</td></tr>
<tr><td>safecopy</td><td>boolean</td></tr>
<tr><td>doframes</td><td>boolean</td></tr>
<tr><td>storagetype</td><td>string</td></tr>
<tr><td>orphancontrol</td><td>number</td></tr>
<tr><td>dohyphenation</td><td>boolean</td></tr>
<tr><td>persistentconfig</td><td>boolean</td></tr>
<tr><td>defaultlanguage</td><td>string</td></tr>
<tr><td>useCSS3hyphenation</td><td>string</td></tr>
<tr><td>unhide</td><td>string</td></tr>
<tr><td>onbeforewordhyphenation</td><td>function</td></tr>
<tr><td>onafterwordhyphenation</td><td>function</td></tr>
</table>

For detailed description of each property see below.

#### Example 1 – defining a named object ####
Define a special object `hyphenatorSettings` and pass it to `Hyphenator.config()`:
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	var hyphenatorSettings = {
		hyphenchar : 		'|',
		urlhyphenchar : 	'|'
	};
	Hyphenator.config(hyphenatorSettings);
	Hyphenator.run();
</script>
```

#### Example 2 – defining an anonymous object ####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({
		hyphenchar : 		'|',
		urlhyphenchar : 	'|'
	});
	Hyphenator.run();
</script>
```

---

#### properties `classname` and `donthyphenateclassname` ####
By default Hyphenator.js looks for elements with a classname `hyphenate`. Instead of adding this classname to each element that you like to be hyphenated, you'll probably prefer using an existing classname (e.g. `content`) or define an other name.
As of version 2.0.0 you can redefine the classname that marks elements that should not be hyphenated (defaults to `donthyphenate`).

##### Example 3 – redefining a classname #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({
		classname : 'content',
		donthyphenateclassname : 'header'
	});
	Hyphenator.run();
</script>
```

---

#### property `urlclassname` ####
**new in 4.3.0**

URLs are automatically detected and Hyphenator.js inserts zero width spaces (or whatever is stored in `urlhyphenchar`) at good breaking points (i.e. after the characters `:/.?#&\-_,;!@` and if there are longer 'words' inbetween after 2`*``minwordlength` characters).

For some texts (e.g. JSON-Data) this behaviour is more suitable than normal hyphenation which inserts hyphens. Elements that have a class called 'urlhyphenate' (default) are splitted with the same method as normal URLs.

You can change this class name.

---

#### property `minwordlength` ####
By default Hyphenator.js only hyphenates words with a minimum of 6 letters. You can change this values. The higher the value, the faster the script; the lower the value, the better the result.

##### Example 3 – redefining minwordlength #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({minwordlength : 8});
	Hyphenator.run();
</script>
```

---

#### property `hyphenchar` ####
By default Hyphenator.js puts the [soft hyphen](http://en.wikipedia.org/wiki/Hyphen#Hyphens_in_computing) in each possible hyphenation point. Soft hyphens are invisible unless the line is breaked. To check hyphenation you can set `hyphenchar` to a visible character (such as the pipe '|').

**Note:** Use `String.fromCharCode()` for HTML-Entities!

##### Example 4 – redefining hyphenchar #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({hyphenchar : '|'});
	Hyphenator.run();
</script>
```

---

#### property `urlhyphenchar` ####
When processing URLs and email-adresses a hyphen would invalidate the text. Thus, by default, a [zero width space](http://en.wikipedia.org/wiki/Zero_width_space) is used instead. You can change this character, too.

**Note:** Use `String.fromCharCode()` for HTML-Entities!

##### Example 5 – redefining urlhyphenchar #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({urlhyphenchar : '·'});
	Hyphenator.run();
</script>
```

---

#### property `displaytogglebox` ####
If you want the user to be able to turn off an back on hyphenation, you can display the 'toggleBox' - by default a small light-grey button in the top right corner of the screen.

##### Example 6 – setting `displaytogglebox` to true #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({displaytogglebox : true});
	Hyphenator.run();
</script>
```

---

#### property `togglebox` ####
The small light-grey button provided by Hyphenator.js can be replaced by any other element that fits the design of your website. To do so you'll have to define a function that takes an argument of type boolean.

Call the function Hyphenator.toggleHyphenation() to toggle hyphenation.

Don't forget to set `displaytogglebox`!

##### Example 7 – redefining togglebox #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	var hyphenatorSettings = {
		displaytogglebox :	true,
		togglebox : 		function () {
			var myelem = document.getElementById('hyphenationbutton');
			if (Hyphenator.doHyphenation) {
                                myelem.style.color = '#00FF00';
				myelem.onclick = Hyphenator.toggleHyphenation;
			} else {
				myelem.style.color = '#FF0000';
				myelem.onclick = Hyphenator.toggleHyphenation;
			}


		}
	};
	Hyphenator.config(hyphenatorSettings);
	Hyphenator.run();
</script>
[...]
<div id="hyphenationbutton">toggle hyphenation</div>
[...]
```

---

#### property `remoteloading` ####
Hyphenator.js automatically loads the pattern files for each language, if they are available.
Alternatively you can load the pattern files manually and disable the remote loading mechanism.

It's very important, that pattern files are loaded AFTER Hyphenator.js

##### Example 8 – setting `remoteloading` to false #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script src="patterns/en.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({remoteloading : false});
	Hyphenator.run();
</script>
```

---

#### property `enablecache` ####
Hyphenator caches words that have been hyphenated to fasten execution. If for some reason (memory?) you want to disable caching, you can do it.

##### Example 9 – setting `enablecache` to false #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({enablecache : false});
	Hyphenator.run();
</script>
```

---

#### property `enablereducedpatternset` ####
This property is used by the reducePatternSet-tool. It stores all patterns used in a run in the language-object. They can be retrieved with the Hyphenator.getRedPatternSet(lang)-method.

---

#### property `onhyphenationdonecallback` ####
Hyphenator.js calls the function `onhyphenationdonecallback()` when hyphenation is complete. This function is empty by default.

You can redefine it to execute any code upon completing hyphenation.
##### Example 10 – redefining `onhyphenationdonecallback` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	var hyphenatorSettings = {
		onhyphenationdonecallback : function () {
			alert('Hyphenation done');
		}
	}
	Hyphenator.config(hyphenatorSettings);
	Hyphenator.run();
</script>
```

---

#### property `onerrorhandler` ####
In some cases, Hyphenator.js calls a method called error(). By default this method displays an alert with the error message.
This may not be suitable for deploymet, thus you can redefine the error()-method.

##### Example 11 – redefining `onerrorhandler` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	var hyphenatorSettings = {
		onerrorhandler : function (e) {
			//do nothing
		}
	}
	Hyphenator.config(hyphenatorSettings);
	Hyphenator.run();
</script>
```

---

#### property `intermediatestate` ####
When a paragraph is hyphenated, the browser does a reflow of the layout, which you might like or not.

By default Hyphenator.js hides elements when they are hyphenated an makes them visible, when hyphenation is done.

You can change this behaviour in such a manner, that elements stay visible.

##### Example 12 – redefining `intermediatestate` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({intermediatestate : 'visible'});
	Hyphenator.run();
</script>
```

---

#### property `selectorfunction` ####
This property is one of the most interesting, since it changes the way, Hyphenator.js selects the elements to be hyphenated.

By default Hyphenator.js looks for all elements with classname='hyphenate'. If you declare a selector function, wich has to return a HTMLNodeList or an array of elements, you can hyphenate any arbitrary element your function returns.

`selectorfunction` is really powerful, if it's used with a JavaScript-Framework like jQuery (see example), prototype or similar. These frameworks include functionalities to adress elements by special selectors.
##### Example 13 – defining `selectorfunction` #####
```
<script src="jquery.js" type="text/javascript"></script>
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	var hyphenatorSettings = {
		selectorfunction: function () {
			return $('p').get();
		}
	};
	Hyphenator.config(hyphenatorSettings);
	Hyphenator.run();
</script>
```

---

#### property `safecopy` ####
This property this property tells Hyphenator.js if it should remove hyphenation from copied text.

By default this feature is enabled but you can turn it off if you like so.
##### Example 14 – setting `safecopy` to `false` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({safecopy: false});
	Hyphenator.run();
</script>
```

---

#### property `doframes` ####
Hyphenator does not automatically hyphenate text in frames nor iframes. But you can turn this feature on.
Remember: due to the Same Origin Policy scripts can only access frames with the same origin.

By default this feature is turned off.
##### Example 15 – setting `doframes` to `true` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({doframes: true});
	Hyphenator.run();
</script>
```

---

#### property `storagetype` ####
To speed up Hyphenator.js the pattern files are stored in [DOM storage](http://en.wikipedia.org/wiki/DOM_storage), if the browser supports it.

By default the storage method is `localStorage` but you can change this to `sessionStorage` (option `'session'`)or turn this feature off (by setting `storagetype` to `'none'`.
##### Example 15 – setting `storagetype` to `none` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({storagetype: 'none'});
	Hyphenator.run();
</script>
```


---


#### property `orphancontrol` ####
In some cases it may happen that one single syllable comes to the last line. To prevent this you may set the `orphancontrol`-level to one of the following values:
  * 1 (default): last word is hyphenated
  * 2: last word is not hyphenated
  * 3: last word is not hyphenated and last space is non breaking

##### Example 16 – setting `orphancontrol` to `2` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({orphancontrol: 2});
	Hyphenator.run();
</script>
```


---

#### property `dohyphenation` ####
**new in version 3.2.0**
Sometimes you like to run the script, prepare everything, but not to hyphenate yet. In this case you can set the option `dohyphenation` to false. Hyphenation can later be executed by calling Hyphenator.toggleHyphenation();

##### Example 17 – setting `dohyphenation` to `false` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({dohyphenation: false});
	Hyphenator.run();
</script>
```


---


#### property `persistentconfig` ####
**new in version 3.2.0**
With the option `persistentconfig` set to true (default is false), all configuration options are stored in a object called `Hyphenator_config` in the storage type defined by the property `storagetype` (if `storagetype is none` or storage isn't supported, nothing is stored).
By reloading or going to an other page, those settings remain set.
This is very and specially usefull for the toggle-button.
Be carefull with this option!

##### Example 18 – setting `persistentconfig` to `true` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({
		persistentconfig: true,
		storagetype: 'local'
	});
	Hyphenator.run();
</script>
```


---


#### property `defaultlanguage` ####
**new in version 3.2.0**
`defaultlanguage` is the fallback-language if no lang-attribute is set in the HTML.

If you can't set a lang-attribute to the appropriate html-tag it may be interesting to set the default language.
This language is only taken in count, if no actual lang-tag can be found (i.e. just before the language-prompt occurs). In other words, setting this property prevents the language-prompt to ask you for the language…

##### Example 19 – setting `defaultlanguage` to `de` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({
		defaultlanguage: 'de'
	});
	Hyphenator.run();
</script>
```

---


#### property `useCSS3hyphenation` ####
**new in version 4.0.0**
Modern browsers are implementing CSS3-Hyphenation. In cases where CSS3-Hyphenation is supported by the browser, Hyphenator.js can activate it for the supported languages instead of computing the hyphenation points by itself. This is fast and don't require to download the patterns which is nice for mobile browsers (e.g. iPad/iPhone).

By default `useCSS3hyphenation` is off but you can make Hyphenator.js to use CSS3-Hyphenation by setting this option to true.

##### Example 20 – turning `useCSS3hyphenation`on #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({
		useCSS3hyphenation: true
	});
	Hyphenator.run();
</script>
```

---


#### property `unhide` ####
**new in version 4.0.0**
By default – if `intermediatestate`is set to the default `hidden` (see above) – Hyphenator.js waits until all elements are processed (hyphenated) and finally unhides them.
In some cases (e.g. in multilanguage documents, where multiple patterns have to be loaded) a progressive unhiding (i.e. not waiting for all elements but unhiding as soon as the respective patterns are loaded) is more usefull.
Default: `unhide = 'wait'`

##### Example 21 – setting `unhide` to `progressive` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.config({
		unhide: 'progressive'
	});
	Hyphenator.run();
</script>
```

---


#### property `onbeforewordhyphenation` ####
**new in version 4.2.0**
In some cases it is usefull to edit a word just before it is hyphenated. In this case you can define a function to change the word just before it is hyphenated.
The function is called with two arguments:
The first argument is the word to be hyphenated, the second argument is the language of the element.
This function must return a string (aka the word).
##### Example 22 – using `onbeforewordhyphenation` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
    Hyphenator.config({
        'onbeforewordhyphenation': function (word, lang) {
        	if (lang === 'de') {
            	return word.replace(/ß/g, 'ss');
            } else {
            	return word;
            }
        }
    });
	Hyphenator.run();
</script>
```

---


#### property `onafterhyphenation` ####
**new in version 4.2.0**
In some cases it is usefull to edit a word after it is hyphenated. In this case you can define a function to change the word just after its hyphenation.
The function is called with two arguments:
The first argument is the hyphenated word, the second argument is the language of the element.
This function must return a string (aka the word).
##### Example 23 – using `onbeforewordhyphenation` #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
    Hyphenator.config({
        'onafterwordhyphenation': function (hword, lang) {
        	console.log(lang + ': ' + hword.replace(new RegExp(String.fromCharCode(173), 'g'), '-'));
                return hword;
        }
    });
	Hyphenator.run();
</script>
```

---


### void Hyphenator.run() ###
Calling this method invokes hyphenation.
#### Example ####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.run();
</script>
```

---

### void Hyphenator.addExceptions(string language, string words) ###
Adds exceptions on a page-wide base. Use this to correct words that would be wrongly hyphenated by the patterns. Indicate the language in the first argument.
The second argumet takes a comma separated string (WITH spaces) of prehyphenated words.
For Hyphenator.js >=2.0.0:
If the first argument is an empty string, the exception is 'global', not for a specific language, but for all languages.
#### Example ####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	Hyphenator.addExceptions('en','man-u-script, man-u-scripts');
	Hyphenator.addExceptions('','FORTRAN');
	Hyphenator.run();
</script>
```
On this page, the word FORTRAN will not be hyphenated at all.

---

### mixed Hyphenator.hyphenate(mixed target, string lang) ###
Hyphenates the target. If the target is a string, the hyphenated string is returned. If the target is an DOM-Object (an element), it will be hyphenated directly (as are its children).
The patterns indicated by the 2nd attribute (`lang`) have to be loaded; if not, an error is thrown.
#### Example ####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script src="patterns/en.js" type="text/javascript"></script>
<script type="text/javascript">
	alert(Hyphenator.hyphenate('Hyphenation is cool!', 'en'););
</script>
```

---

### bool Hyphenator.getRedPatternSet(string lang) ###
Returns all used patterns of the indicated language. (But only if the config-option `enablereducedpatternset` had been set to `true`)

---

### bool Hyphenator.isBookmarklet() ###
Returns true if Hyphenator.js has been called by a bookmarklet.

---

### void Hyphenator.toggleHyphenation() ###
Calls Hyphenator.removeHyphenationFromDocument() if the state of Hyphenator is 3 or calls Hyphenator.hyphenateDocument() if the state is 4.
Use his function when implementing  your own toggleBox.
##### Example – using Hyphenator.toggleHyphenation() #####
```
<script src="Hyphenator.js" type="text/javascript"></script>
<script type="text/javascript">
	var hyphenatorSettings = {
		displaytogglebox :	true,
		togglebox : 		function (hyphenate) {
			var myelem = document.getElementById('hyphenationbutton');
			if (hyphenate) {
				myelem.style.color = '#00FF00';
				myelem.onclick = Hyphenator.toggleHyphenation;
			} else {
				myelem.style.color = '#FF0000';
				myelem.onclick = Hyphenator.toggleHyphenation;
			}
		}
	};
	Hyphenator.config(hyphenatorSettings);
	Hyphenator.run();
</script>
[...]
<div id="hyphenationbutton">toggle hyphenation</div>
[...]
```