/**************** Preamble ****************/
// This script is licensed under the creative commons license
// Attribution-Share Alike 2.5 Switzerland
// You are free to share and to remix this work under the 
// following conditions: Attribution and Share-Alike
// See http://creativecommons.org/licenses/by-sa/2.5/ch/deed.en
// Thus you are free to use it for commercial purposes.
//
// Dieses Script steht unter der Creative Commons-Lizenz
// Attribution-Share Alike 2.5 Switzerland
// Sie dürfen das Werk vervielfältigen, verbreiten und
// öffentlich zugänglich machen,
// sowie Bearbeitungen des Werkes anfertigen
// Zu den folgenden Bedingungen:
// Namensnennung und Weitergabe unter gleichen Bedingungen.
// Siehe http://creativecommons.org/licenses/by-sa/2.5/ch/
// Somit sind Sie frei, das Script für kommerzielle Zwecke zu nutzen.
//
// Mathias Nater, Zürich, 2009
// mathias at mnn dot ch
//
// Comments are jsdoctoolkit formatted. See jsdoctoolkit.org
/**************** Preamble ****************/

/**
 * @fileOverview
 * A script that does hyphenation in (X)HTML files
 * @author Mathias Nater, <a href = "mailto:mathias@mnn.ch">mathias@mnn.ch</a>
 * @version BetaXX
 * @TO DO:
 * - redo init()-method
 */

/**
 * @description Provides all functionality to do hyphenation, except the patterns that are loaded
 * externally.
 * @namespace Holds all methods and properties
 * @constructor
 * @example
 * &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
 * &lt;script type = "text/javascript"&gt;
 *   Hyphenator.run();
 * &lt;/script&gt;
 */
var Hyphenator = function () {


	/**
	 * @name Hyphenator-LANGUAGEHINT
	 * @fieldOf Hyphenator
	 * @description
	 * A string to be displayed in a prompt if the language can't be guessed.
	 * If you add hyphenation patterns change this string.
	 * Internally, this string is used to define languages that are supported by Hyphenator.
	 * @see Hyphenator-SUPPORTEDLANG
	 * @type string
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */
	var LANGUAGEHINT = 'bn, de, en, es, fi, fr, gu, hi, it, ka, ml, nl, or, pa, pl, ru, sv, ta, te';

	/**
	 * @name Hyphenator-SUPPORTEDLANG
	 * @fieldOf Hyphenator
	 * @description
	 * A generated key-value object that stores supported languages.
	 * @type object
	 * @private
	 * @example
	 * Check if language lang is supported:
	 * if (SUPPORTEDLANG[lang])
	 */
	var SUPPORTEDLANG = function () {
		var k, i = 0, a = LANGUAGEHINT.split(', ');
		var r = {};
		while (!!(k = a[i++])) {
			r[k] = true;
		}
		return r;
	}();

	/**
	 * @name Hyphenator-PROMPTERSTRINGS
	 * @fieldOf Hyphenator
	 * @description
	 * A key-value object holding the strings to be displayed if the language can't be guessed
	 * If you add hyphenation patterns change this string.
	 * @type object
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */	
	var PROMPTERSTRINGS = {
		'de': 'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben:',
		'en': 'The language of this website could not be determined automatically. Please indicate main language:',
		'es': 'El idioma del sitio no pudo determinarse autom%E1ticamente. Por favor, indique el idioma principal:',
		'fr': 'La langue de ce site n%u2019a pas pu %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue, s.v.p.%A0:',
		'nl': 'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op:',
		'sv': 'Spr%E5ket p%E5 den h%E4r webbplatsen kunde inte avg%F6ras automatiskt. V%E4nligen ange:',
		'ml': 'ഈ വെബ്‌സൈറ്റിന്റെ ഭാഷ കണ്ടുപിടിയ്ക്കാന്‍ കഴിഞ്ഞില്ല. ഭാഷ ഏതാണെന്നു തിരഞ്ഞെടുക്കുക:',
		'it': 'Lingua del sito sconosciuta. Indicare una lingua, per favore:',
		'ru': 'Язык этого сайта не может быть определен автоматически. Пожалуйста укажите язык:',
		'fi': 'Sivun kielt%E4 ei tunnistettu automaattisesti. M%E4%E4rit%E4 sivun p%E4%E4kieli:'
	};
	
	/**
	 * @name Hyphenator-BASEPATH
	 * @fieldOf Hyphenator
	 * @description
 	 * A string storing the basepath from where Hyphenator.js was loaded.
	 * This is used to load the patternfiles.
	 * The basepath is determined dynamically by searching all script-tags for Hyphenator.js
	 * If the path cannot be determined http://hyphenator.googlecode.com/svn/trunk/ is used as fallback.
	 * @type string
	 * @private
	 * @see Hyphenator-loadPatterns
	 */
	var BASEPATH = function () {
		var s = document.getElementsByTagName('script'), i = 0, p, t;
		while (!!(t = s[i++].src)) {
			p = t.indexOf('Hyphenator.js');
			if (p !== -1) {
				return t.substring(0, p);
			}
		}
		return 'http://hyphenator.googlecode.com/svn/branches/refact/';
	}();
	
	/**
	 * @name Hyphenator-LOCAL
	 * @fieldOf Hyphenator
	 * @description
	 * LOCAL is true, if Hyphenator is loaded from the same domain, as the webpage, but false, if
	 * it's loaded from an external source (i.e. directly from google.code)
	 */
	var LOCAL = function () {
		var re = false;
		if (BASEPATH.indexOf(window.location.hostname) !== -1) {
			re = true;
		}
		return re;
	}();
	
	/**
	 * @name Hyphenator-DONTHYPHENATE
	 * @fieldOf Hyphenator
	 * @description
	 * A key-value object containing all html-tags whose content sould not be hyphenated
	 * @type object
	 * @private
	 * @see Hyphenator.hyphenateElement
	 */
	var DONTHYPHENATE = {'script': true, 'code': true, 'pre': true, 'img': true, 'br': true, 'samp': true, 'kbd': true, 'var': true, 'abbr': true, 'acronym': true, 'sub': true, 'sup': true, 'button': true, 'option': true, 'label': true};

	/**
	 * @name Hyphenator-enableCache
	 * @fieldOf Hyphenator
	 * @description
	 * A variable to set if caching is enabled or not
	 * @type boolean
	 * @default true
	 * @private
	 * @see Hyphenator.setEnableCache
	 * @see Hyphenator.hyphenateWord
	 */
	var enableCache = true;
	
	/**
	 * @name Hyphenator-enableRemoteLoading
	 * @fieldOf Hyphenator
	 * @description
	 * A variable to set if pattern files should be loaded remotely or not
	 * @type boolean
	 * @default true
	 * @private
	 * @see Hyphenator.setRemoteLoading
	 * @see Hyphenator-loadPatterns
	 */
	var enableRemoteLoading = true;
	
	/**
	 * @name Hyphenator-displayToggleBox
	 * @fieldOf Hyphenator
	 * @description
	 * A variable to set if the togglebox should be displayed or not
	 * @type boolean
	 * @default false
	 * @private
	 * @see Hyphenator.setDisplayToggleBox
	 * @see Hyphenator-switchToggleBox
	 */
	var displayToggleBox = false;
	
	/**
	 * @name Hyphenator-hyphenateclass
	 * @fieldOf Hyphenator
	 * @description
	 * A string containing the css-class-name for the hyphenate class
	 * @type string
	 * @default 'hyphenate'
	 * @private
	 * @example
	 * &lt;p class = "hyphenate"&gt;Text&lt;/p&gt;
	 * @see Hyphenator.setClassName
	 * @see Hyphenator-switchToggleBox
	 */
	var hyphenateclass = 'hyphenate'; // the CSS-Classname of Elements that should be hyphenated eg. <p class = "hyphenate">Text</p>
	
	/**
	 * @name Hyphenator-min
	 * @fieldOf Hyphenator
	 * @description
	 * A number wich indicates the minimal length of words to hyphenate.
	 * @type number
	 * @default 6
	 * @private
	 * @see Hyphenator.setMinWordLength
	 */	
	var min = 6;
	
	/**
	 * @name Hyphenator-bookmarklet
	 * @fieldOf Hyphenator
	 * @description
	 * Indicates if Hyphanetor runs as bookmarklet or not.
	 * @type boolean
	 * @default false
	 * @private
	 */	
	var bookmarklet = function() {
		var loc = null, re = false;
		var jsArray = document.getElementsByTagName('script');
		for (var i = 0, l = jsArray.length; i < l; i++) {
			if (!!jsArray[i].getAttribute('src')) {
				loc = jsArray[i].getAttribute('src');
			}
			if (!loc) {
				continue;
			} else if (loc.indexOf('Hyphenator.js?bm=true') !== -1) {
				re = true;
			}
		}
		return re;
	}();

	/**
	 * @name Hyphenator-mainlanguage
	 * @fieldOf Hyphenator
	 * @description
	 * The general language of the document
	 * @type number
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */	
	var mainlanguage = null;

	/**
	 * @name Hyphenator-elements
	 * @fieldOf Hyphenator
	 * @description
	 * An array holding all elements that have to be hyphenated. This var is filled by
	 * {@link Hyphenator-gatherDocumentInfos}
	 * @type array
	 * @private
	 */	
	var elements = [];
	
	/**
	 * @name Hyphenator-exceptions
	 * @fieldOf Hyphenator
	 * @description
	 * An object containing exceptions as comma separated strings for each language.
	 * When the language-objects are loaded, this exceptions are processed and then deleted.
	 * @see Hyphenator-prepareLanguagesObj
	 * @type object
	 * @private
	 */	
	var exceptions = {};

	/**
	 * @name Hyphenator-doclanguages
	 * @fieldOf Hyphenator
	 * @description
	 * An object holding all languages used in the document. This is filled by
	 * {@link Hyphenator-gatherDocumentInfos}
	 * @type object
	 * @private
	 */	
	var doclanguages = {};


	/**
	 * @name Hyphenator-state
	 * @fieldOf Hyphenator
	 * @description
	 * A number that inidcates the current state of the scripts pattern-loading routine
	 * 0: not initialized
	 * 1: loading patterns
	 * 2: ready
	 * 3: hyphenation done
	 * 4: hyphenation removed
	 * @type number
	 * @private
	 */	
	var state = 0;

	/**
	 * @name Hyphenator-url
	 * @fieldOf Hyphenator
	 * @description
	 * A string containing a RegularExpression to match URL's
	 * @type string
	 * @private
	 */	
	var url = '(\\w*:\/\/)((\\w*:)?(\\w*)@)?([\\w\\.]*)?(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*';

	/**
	 * @name Hyphenator-mail
	 * @fieldOf Hyphenator
	 * @description
	 * A string containing a RegularExpression to match mail-adresses
	 * @type string
	 * @private
	 */	
	var mail = '[\\w-\\.]+@[\\w\\.]+';
	
	/**
	 * @name Hyphenator-urlRE
	 * @fieldOf Hyphenator
	 * @description
	 * A RegularExpressions-Object for url-matching
	 * @type object
	 * @private
	 */		
	var urlRE = new RegExp(url, 'i');

	/**
	 * @name Hyphenator-mailRE
	 * @fieldOf Hyphenator
	 * @description
	 * A RegularExpressions-Object for mail-adress-matching
	 * @type object
	 * @private
	 */		
	var mailRE = new RegExp(mail, 'i');

	/**
	 * @name Hyphenator-zerowidthspace
	 * @fieldOf Hyphenator
	 * @description
	 * A string that holds a char.
	 * Depending on the browser, this is the zero with space or an empty string.
	 * The zerowidthspace is inserted after a '-' in compound words, so even FF and IE
	 * will break after a '-' if necessary.
	 * zerowidthspace is also used to break URLs
	 * @type string
	 * @private
	 */		
	var zerowidthspace = function() {
		var ua = navigator.userAgent.toLowerCase();
		if (ua.indexOf('msie 6') === -1 && ua.indexOf('msie 8') === -1) {
			zerowidthspace = String.fromCharCode(8203); //Unicode zero width space
		} else {
			zerowidthspace = '';
		}
		return zerowidthspace;
	}();
	
	/**
	 * @name Hyphenator-onHyphenationDone
	 * @fieldOf Hyphenator
	 * @description
	 * A method to be called, when the last element has been hyphenated or the hyphenation has been
	 * removed from the last element.
	 * This is set by {@link Hyphenator.run}
	 * @type function
	 * @private
	 */		
	var onHyphenationDone = function(){};

	/**
	 * @name Hyphenator-onHyphenationDone
	 * @fieldOf Hyphenator
	 * @description
	 * A method to be called, when the last element has been hyphenated or the hyphenation has been
	 * removed from the last element.
	 * This is set by {@link Hyphenator.run}
	 * @type function
	 * @private
	 */		
	var error = function(e){
		alert("Hyphenator.js says:\n\nAn Error ocurred:\n"+e.message);
	};

	/**
	 * @name Hyphenator-selectorFunction
	 * @fieldOf Hyphenator
	 * @description
	 * 
	 * @type function
	 * @private
	 */		
	var selectorFunction = undefined;

	/**
	 * @name Hyphenator-intermediateState
	 * @fieldOf Hyphenator
	 * @description
	 * @type string
	 * @private
	 */		
	var intermediateState = 'hidden';
	
	/**
	 * @name Hyphenator-hyphen
	 * @fieldOf Hyphenator
	 * @description
	 * A string containing the character for in-word-hyphenation
	 * @type string
	 * @default the soft hyphen
	 * @private
	 * @see Hyphenator.setHyphenChar
	 */
	var hyphen = String.fromCharCode(173);
	
	/**
	 * @name Hyphenator-urlhyphen
	 * @fieldOf Hyphenator
	 * @description
	 * A string containing the character for url/mail-hyphenation
	 * @type string
	 * @default the zero width space
	 * @private
	 * @see Hyphenator.setUrlHyphenChar
	 * @see Hyphenator-zerowidthspace
	 */
	var urlhyphen = zerowidthspace;
	
	/*
	 * ContentLoaded.js
	 *
	 * Author: Diego Perini (diego.perini at gmail.com)
	 * Summary: Cross-browser wrapper for DOMContentLoaded
	 * Updated: 17/05/2008
	 * License: MIT
	 * Version: 1.1
	 *
	 * URL:
	 * http://javascript.nwbox.com/ContentLoaded/
	 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	 *
	 * Notes:
	 * based on code by Dean Edwards and John Resig
	 * http://dean.edwards.name/weblog/2006/06/again/
	 */
	// @w	window reference
	// @f	function reference
	//function ContentLoaded(w, f) {
	/**
	 * @name Hyphenator-runOnContentLoaded
	 * @methodOf Hyphenator
	 * @description
	 * A crossbrowser solution for the DOMContentLoaded-Event
	 * @author Diego Perini (diego.perini at gmail.com)
	 * <a href = "http://javascript.nwbox.com/ContentLoaded/">http://javascript.nwbox.com/ContentLoaded/</a>
	 * @param object the window-object
	 * @param function-object the function to call onDOMContentLoaded
	 * @private
 	 */		
	function runOnContentLoaded(w, f) {
		var	d = w.document,
			D = 'DOMContentLoaded',
			// user agent, version
			u = w.navigator.userAgent.toLowerCase(),
			v = parseFloat(u.match(/.+(?:rv|it|ml|ra|ie)[\/: ]([\d.]+)/)[1]),
			documentloaded = false;
				
		function init(e) {
			if (!documentloaded) {
				documentloaded = true;
				// pass a fake event if needed
				f((e.type && e.type === D) ? e : {
					type: D,
					target: d,
					eventPhase: 0,
					currentTarget: d,
					timeStamp: new Date().getTime(),
					eventType: e.type || e
				});
			}
		}
	
		// safari < 525.13
		if (/webkit\//.test(u) && v < 525.13) {
	
			(function () {
				if (/complete|loaded/.test(d.readyState)) {
					init('khtml-poll');
				} else {
					setTimeout(arguments.callee, 10);
				}
			})();
	
		// internet explorer all versions
		} else if (/msie/.test(u) && !w.opera) {
	
			d.attachEvent('onreadystatechange',
				function (e) {
					if (d.readyState === 'complete') {
						d.detachEvent('on'+e.type, arguments.callee);
						init(e);
					}
				}
			);
			if (w == top) {
				(function () {
					try {
						d.documentElement.doScroll('left');
					} catch (e) {
						setTimeout(arguments.callee, 10);
						return;
					}
					init('msie-poll');
				})();
			}
	
		// browsers having native DOMContentLoaded
		} else if (d.addEventListener &&
			(/opera\//.test(u) && v > 9) ||
			(/gecko\//.test(u) && v >= 1.8) ||
			(/khtml\//.test(u) && v >= 4.0) ||
			(/webkit\//.test(u) && v >= 525.13)) {
	
			d.addEventListener(D,
				function (e) {
					d.removeEventListener(D, arguments.callee, false);
					init(e);
				}, false
			);
	
		// fallback to last resort for older browsers
		} else {
	
			// from Simon Willison
			var oldonload = w.onload;
			/**
			 * @ignore
			 */
			w.onload = function (e) {
				init(e || w.event);
				if (typeof oldonload === 'function') {
					oldonload(e || w.event);
				}
			};
	
		}
	}
	/* end ContentLoaded.js */

	/**
	 * @name Hyphenator-getLang
	 * @methodOf Hyphenator
	 * @description
	 * Gets the language of an element. If no language is set, it may use the {@link Hyphenator-mainlanguage}.
	 * @param object The first parameter is an DOM-Element-Object
	 * @param boolean The second parameter is a boolean to tell if the function should return the {@link Hyphenator-mainlanguage}
	 * if there's no language found for the element.
	 * @private
	 */		
	function getLang(el, nofallback) {
		if (!!el.lang) {
			return el.lang.substring(0,2);
		}
		if (!!el.getAttribute('lang')) {
			return el.getAttribute('lang').substring(0, 2);
		}
		// The following doesn't work in IE due to a bug when getAttribute('xml:lang') in a table
		/*if (!!el.getAttribute('xml:lang')) {
			return el.getAttribute('xml:lang').substring(0, 2);
		}*/
		//instead, we have to do this (thanks to borgzor):
		try {
			if (!!el.getAttribute('xml:lang')) {
				return el.getAttribute('xml:lang').substring(0, 2);
			}
		} catch (ex) {}
		if (el.tagName != 'HTML' && nofallback) {
			return getLang(el.parentNode);
		}
		if (!nofallback && mainlanguage) {
			return mainlanguage;
		}
		return null;
	}	
	
	/**
	 * @name Hyphenator-autoSetMainLanguage
	 * @methodOf Hyphenator
	 * @description
	 * Retrieves the language of the document from the DOM.
	 * The function looks in the following places:
	 * <ul>
	 * <li>lang-attribute in the html-tag</li>
	 * <li>&lt;meta http-equiv = "content-language" content = "xy" /&gt;</li>
	 * <li>&lt;meta name = "DC.Language" content = "xy" /&gt;</li>
	 * <li>&lt;meta name = "language" content = "xy" /&gt;</li>
	 * </li>
	 * If nothing can be found a prompt using {@link Hyphenator-LANGUAGEHINT} and {@link Hyphenator-PROMPTERSTRINGS} is displayed.
	 * If the retrieved language is in the object {@link Hyphenator-SUPPORTEDLANG} it is copied to {@link Hyphenator-mainlanguage}
	 * @private
	 */		
	function autoSetMainLanguage() {
		var el = document.getElementsByTagName('html')[0];
		mainlanguage = getLang(el);
		if (!mainlanguage) {
			var m = document.getElementsByTagName('meta');
			for (var i = 0; i < m.length; i++) {
				//<meta http-equiv = "content-language" content="xy">	
				if (!!m[i].getAttribute('http-equiv') && (m[i].getAttribute('http-equiv') === 'content-language')) {
					mainlanguage = m[i].getAttribute('content').substring(0, 2);
				}
				//<meta name = "DC.Language" content="xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name') === 'DC.language')) {
					mainlanguage = m[i].getAttribute('content').substring(0, 2);
				}			
				//<meta name = "language" content = "xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name') === 'language')) {
					mainlanguage = m[i].getAttribute('content').substring(0, 2);
				}
			}
		}
		if (!mainlanguage) {
			var text = '';
			var ul = navigator.language ? navigator.language : navigator.userLanguage;
			ul = ul.substring(0, 2);
			if (PROMPTERSTRINGS.hasOwnProperty(ul)) {
				text = PROMPTERSTRINGS[ul];
			} else {
				text = PROMPTERSTRINGS.en;
			}
			text += ' (ISO 639-1)\n\n'+LANGUAGEHINT;
			var lang = window.prompt(unescape(text), ul);
			if (SUPPORTEDLANG[lang]) {
				mainlanguage = lang;
			}
		}
	}
    
	/**
	 * @name Hyphenator-gatherDocumentInfos
	 * @methodOf Hyphenator
	 * @description
	 * This method runs through the DOM and executes the process()-function on:
	 * - every node in case of running as Bookmarklet
	 * - every node with class="hyphenate"
	 * The process()-function copies the element to the elements-variable, hides the element,
	 * retrieves its language and recursivly descends the DOM-tree until the child-Nodes aren't of type 1
	 * @private
	 */		
	function gatherDocumentInfos() {
		var el, i, l;
		var process = function(el, hide) {
			var idx, lang;
			idx = elements.push(el) - 1;
			if (hide) {
				elements[idx].style.visibility = intermediateState;
			}
			if (!!(lang = getLang(el, true))) {
				if (SUPPORTEDLANG[lang]) {
					doclanguages[lang] = true;
				} else {
					error(new Error('Language '+lang+' is not yet supported.'));
				}
			}
			if (lang !== mainlanguage) {
				elements[idx].lang = lang;
			}
			var n, i = 0;
			while (!!(n = el.childNodes[i++])) {
				if (n.nodeType === 1 && !DONTHYPHENATE[n.nodeName.toLowerCase()]) {			//typ 1 = element node -> recursion
					if(n.className.indexOf(hyphenateclass) === -1 && n.className.indexOf('donthyphenate') === -1) {
						process(n, false);
					}
					
				}
			}
		};
		if (Hyphenator.isBookmarklet()) {
			process(document.getElementsByTagName('body')[0], false);
		} else if (typeof selectorFunction === 'function') {
			el = selectorFunction();
			for (i = 0, l = el.length; i < l; i++)
			{
				process(el[i], true);
			}			
		} else if (document.getElementsByClassName) {
			el = document.getElementsByClassName(hyphenateclass);
			for (i = 0, l = el.length; i < l; i++)
			{
				process(el[i], true);
			}
		} else {
			el = document.getElementsByTagName('*');
			for (i = 0, l = el.length; i < l; i++)
			{
				if (el[i].className.indexOf(hyphenateclass) !== -1 && el[i].className.indexOf('donthyphenate') === -1) {
					process(el[i], true);
				}
			}
		}
		if (elements.length > 0) {
			elements[elements.length-1].isLast = true;
		}
	}
	 
	/**
	 * @name Hyphenator-convertPatternsToObject
	 * @methodOf Hyphenator
	 * @description
	 * Converts the patterns from string '_a6' to object '_a':'_a6'.
	 * The result is stored in the {@link Hyphenator-patterns}-object.
	 * @private
	 * @param string the language whose patterns shall be converted
	 */		
	function convertPatternsToObject(lang) {
		var sa = Hyphenator.languages[lang].patterns.split(' ');
		Hyphenator.languages[lang].patterns = {};
		var pat, key, i = 0;
		while (!!(pat = sa[i++])) {
			key = pat.replace(/\d/g, '');
			Hyphenator.languages[lang].patterns[key] = pat;
		}
	}

	/**
	 * @name Hyphenator-convertExceptionsToObject
	 * @methodOf Hyphenator
	 * @description
	 * Converts a list of comma seprated exceptions to an object:
	 * 'Fortran,Hy-phen-a-tion' -> {'Fortra':'Fortran','Hyphenation':'Hy-phen-a-tion'}
	 * @private
	 * @param string a comma separated string of exceptions (without spaces)
	 */		
	function convertExceptionsToObject(exc) {
		var w = exc.split(',');
		var r = {};
		for (var i = 0, l = w.length; i < l; i++) {
			var key = w[i].replace(/-/g, '');
			if (!r.hasOwnProperty(key)) {
				r[key] = w[i];
			}
		}
		return r;
	}
	
	/**
	 * @name Hyphenator-loadPatterns
	 * @methodOf Hyphenator
	 * @description
	 * Adds a &lt;script&gt;-Tag to the DOM to load an externeal .js-file containing patterns and settings for the given language.
	 * If the iven language is not in the {@link Hyphenator-SUPPORTEDLANG}-Object it returns.
	 * One may ask why we are not using AJAX to load the patterns. The XMLHttpRequest-Object 
	 * has a same-origin-policy. This makes the bookmarklet-functionality impossible.
	 * @param string The language to load the patterns for
	 * @private
	 * @see Hyphenator-BASEPATH
	 */
	function loadPatterns(lang) {
		if (SUPPORTEDLANG[lang] && !Hyphenator.languages[lang]) {
	        var url = BASEPATH + 'patterns/' + lang + '.js';
		} else {
			return;
		}
		if (LOCAL && !bookmarklet) {
			//check if 'url' is available:
			var xhr = null;
			if (typeof XMLHttpRequest != 'undefined') {
				xhr = new XMLHttpRequest();
			}
			if (!xhr) {
				try {
					xhr  = new ActiveXObject("Msxml2.XMLHTTP");
				} catch(e) {
					xhr  = null;
				}
			}
			if (xhr) {
				xhr.open('HEAD', url, false);
				xhr.send(null);
				if(xhr.status == 404) {
					error(new Error('Could not load\n'+url));
					delete doclanguages[lang];
					return;
				}
			}
		}
		if (document.createElement) {
			var head = document.getElementsByTagName('head').item(0);
			var script = document.createElement('script');
			script.src = url;
			script.id = lang;
			script.type = 'text/javascript';
			head.appendChild(script);
		}
	}
	
	/**
	 * @name Hyphenator-prepareLanguagesObj
	 * @methodOf Hyphenator
	 * @description
	 * Adds a cache to each language and converts the exceptions-list to an object.
	 * @private
	 * @param string the language ob the lang-obj
	 */		
	function prepareLanguagesObj(lang) {
		if (enableCache) {
			Hyphenator.languages[lang].cache = {};
		}
		if (Hyphenator.languages[lang].hasOwnProperty('exceptions')) {
			Hyphenator.addExceptions(lang, Hyphenator.languages[lang].exceptions);
			delete Hyphenator.languages[lang].exceptions;
		}
		if (exceptions.hasOwnProperty(lang)) {
			Hyphenator.languages[lang].exceptions = convertExceptionsToObject(exceptions[lang]);
			delete exceptions[lang];
		} else {
			Hyphenator.languages[lang].exceptions = {};
		}
	}
	
	/**
	 * @name Hyphenator-prepare
	 * @methodOf Hyphenator
	 * @description
	 * This funtion prepares the Hyphenator-Object: If RemoteLoading is turned off, it assumes
	 * that the patternfiles are loaded, all conversions are made and the callback is called.
	 * If RemoteLoading is on (default), it loads the pattern files and waits until they are loaded,
	 * by repeatedly checking Hyphenator.languages. If a patterfile is loaded the patterns are
	 * converted to their object style and the lang-object extended.
	 * Finally the callback is called.
	 * @param function-object callback to call, when all patterns are loaded
	 * @private
	 */
	function prepare (callback) {
		var lang;
		if (!enableRemoteLoading) {
			for (lang in Hyphenator.languages) {
				if (Hyphenator.languages.hasOwnProperty(lang)) {
					convertPatternsToObject(lang);
					prepareLanguagesObj(lang);
				}
			}
			state = 2;
			callback();
			return;
		}
		// get all languages that are used and preload the patterns
		state = 1;
		doclanguages[mainlanguage] = true;
		for (lang in doclanguages) {
			if (doclanguages.hasOwnProperty(lang)) {
				loadPatterns(lang);
			}
		}
		// wait until they are loaded
		var interval = window.setInterval(function () {
			var finishedLoading = false;
			for (var lang in doclanguages) {
				if (!Hyphenator.languages[lang]) {
					finishedLoading = false;
					break;
				} else {
					finishedLoading = true;
					delete doclanguages[lang];
					//do conversion while other patterns are loading:
					convertPatternsToObject(lang);
					prepareLanguagesObj(lang);		
				}
			}
			if (finishedLoading) {
				window.clearInterval(interval);
				state = 2;
				callback();
			}
		}, 100);
	}

	/**
	 * @name Hyphenator-switchToggleBox
	 * @methodOf Hyphenator
	 * @description
	 * Creates or hides the toggleBox: a small button to turn off/on hyphenation on a page.
	 * <strong>Todo:</strong>
	 * <ul>
	 * <li>Remove the toggle box from the DOM instead of hiding it</li>
	 * <li>implement a possibility to style the box</li>
	 * </ul>
	 * @param boolean True to create the toggleBox, false to hide it
	 * @private
	 */		
	var toggleBox = function (s) {
		var myBox;
		if (!!(myBox = document.getElementById('HyphenatorToggleBox'))) {
			if (s) {
				myBox.firstChild.data = 'Hy-phe-na-ti-on';
			} else {
				myBox.firstChild.data = 'Hyphenation';
			}
		} else {
			var bdy, myIdAttribute, myTextNode, myClassAttribute; 
			bdy = document.getElementsByTagName('body')[0];
			myBox = document.createElement('div');
			myIdAttribute = document.createAttribute('id');
			myIdAttribute.nodeValue = 'HyphenatorToggleBox';
			myClassAttribute = document.createAttribute('class');
			myClassAttribute.nodeValue = 'donthyphenate';
			myTextNode = document.createTextNode('Hy-phe-na-ti-on');
			myBox.appendChild(myTextNode);
			myBox.setAttributeNode(myIdAttribute);
			myBox.setAttributeNode(myClassAttribute);
			myBox.onclick = Hyphenator.toggleHyphenation;
			myBox.style.position = 'absolute';
			myBox.style.top = '0px';
			myBox.style.right = '0px';
			myBox.style.margin = '0';
			myBox.style.backgroundColor = '#AAAAAA';
			myBox.style.color = '#FFFFFF';
			myBox.style.font = '6pt Arial';
			myBox.style.letterSpacing = '0.2em';
			myBox.style.padding = '3px';
			myBox.style.cursor = 'pointer';
			myBox.style.WebkitBorderBottomLeftRadius = '4px';
			myBox.style.MozBorderRadiusBottomleft = '4px';
			bdy.appendChild(myBox);
		}
	};

	return {
		/**
		 * @name Hyphenator.languages
		 * @memberOf Hyphenator
		 * @description
		 * Objects that holds a key-value pairs, where key is the language and the value is the
		 * language-object loaded from (and set by) the pattern file.
		 * The language object holds the following members:
		 * <table>
		 * <tr><th>key</th><th>desc></th></tr>
		 * <tr><td>leftmin</td><td>The minimum of chars to remain on the old line</td></tr>
		 * <tr><td>rightmin</td><td>The minimum of chars to go on the new line</td></tr>
		 * <tr><td>shortestPattern</td><td>The shortes pattern (numbers don't count!)</td></tr>
		 * <tr><td>longestPattern</td><td>The longest pattern (numbers don't count!)</td></tr>
		 * <tr><td>specialChars</td><td>Non-ASCII chars in the alphabet.</td></tr>
		 * <tr><td>patterns</td><td>the patterns</td></tr>
		 * </table>
		 * And optionally (or after prepareLanguagesObj() has been called):
		 * <table>
		 * <tr><td>exceptions</td><td>Excpetions for the secified language</td></tr>
		 * </table>
		 * @public
         */		
		languages: {},
		

		/**
		 * @name Hyphenator.init
		 * @methodOf Hyphenator
		 * @description
		 * Init function that takes an object as an argument. The object contains key-value-pairs
		 * containig Hyphenator-settings. This is a shortcut for calling Hyphenator.set...-Methods.
		 * @param object <table>
		 * <tr><th>key</th><th>values</th><th>default</th></tr>
		 * <tr><td>classname</td><td>string</td><td>'hyphenate'</td></tr>
		 * <tr><td>minwordlength</td><td>integer</td><td>6</td></tr>
		 * <tr><td>hyphenchar</td><td>string</td><td>'&amp;shy;'</td></tr>
		 * <tr><td>urlhyphenchar</td><td>string</td><td>'zero with space'</td></tr>
		 * <tr><td>togglebox</td><td>function</td><td>see code</td></tr>
		 * <tr><td>displaytogglebox</td><td>boolean</td><td>false</td></tr>
		 * <tr><td>remoteloading</td><td>boolean</td><td>true</td></tr>
		 * <tr><td>onhyphenationdonecallback</td><td>function</td><td>empty function</td></tr>
		 * <tr><td>onerrorhandler</td><td>function</td><td>alert(error)</td></tr>
		 * <tr><td>intermediatestate</td><td>string</td><td>'hidden'</td></tr>
		 * </table>
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *     Hyphenator.init({'minwordlength':4,'hyphenchar':'|'});
         *     Hyphenator.run();
         * &lt;/script&gt;
         */
		init: function (obj) {
			if(obj.classname) {
				Hyphenator.setClassName(obj.classname);
			}
			if(obj.minwordlength) {
				Hyphenator.setMinWordLength(obj.minwordlength);
			}
			if(obj.hyphenchar) {
				Hyphenator.setHyphenChar(obj.hyphenchar);
			}
			if(obj.urlhyphenchar) {
				Hyphenator.setUrlHyphenChar(obj.urlhyphenchar);
			}
			if(obj.togglebox) {
				Hyphenator.setToggleBox(obj.togglebox);
			}
			if(obj.displaytogglebox) {
				Hyphenator.setDisplayToggleBox(obj.displaytogglebox);
			}
			if(obj.remoteloading) {
				Hyphenator.setRemoteLoading(obj.remoteloading);
			}
			if(obj.onhyphenationdonecallback) {
				Hyphenator.setOnHyphenationDoneCallback(obj.onhyphenationdonecallback);
			}
			if(obj.onerrorhandler) {
				Hyphenator.setOnErrorHandler(obj.onerrorhandler);
			}
			if(obj.intermediatestate) {
				Hyphenator.setIntermediateState(obj.intermediatestate);
			}
			if(obj.selectorfunction) {
				Hyphenator.setSelectorFunction(obj.selectorfunction);
			}
		},

		/**
		 * @name Hyphenator.run
		 * @methodOf Hyphenator
		 * @description
		 * Bootstrap function that starts all hyphenationprocesses when called.
		 * Can have a callback as argument wich is called when all hyphenation is done.
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.run();
         * &lt;/script&gt;
         */
		run: function () {
			var process = function () {
				try {
					autoSetMainLanguage();
					gatherDocumentInfos();
					prepare(Hyphenator.hyphenateDocument);
					if (displayToggleBox) {
						toggleBox(true);
					}
				} catch (e) {
					error(e);
				}
			};
			runOnContentLoaded(window, process);
			if (Hyphenator.isBookmarklet()) {
				process();
			}
		},
		
		/**
		 * @name Hyphenator.addExceptions
		 * @methodOf Hyphenator
		 * @description
		 * Adds the exceptions from the string to the appropriate language in the 
		 * {@link Hyphenator-languages}-object
		 * @param string The language
		 * @param string A comma separated string of hyphenated words WITHOUT spaces.
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.addExceptions('de','ziem-lich,Wach-stube');
         *   Hyphenator.run();
         * &lt;/script&gt;
         */
		addExceptions: function (lang, words) {
			if (exceptions.hasOwnProperty[lang]) {
				exceptions[lang] += ","+words;
			} else {
				exceptions[lang] = words;
			}
		},	
		
		/**
		 * @name Hyphenator.setClassName
		 * @methodOf Hyphenator
		 * @description
		 * Sets {@link Hyphenator-hyphenateclass}
		 * @param string The class name.
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.setClassName('justify');
         *   Hyphenator.run();
         * &lt;/script&gt;
         * @default hyphenate
         */
		setClassName: function (str) {
            hyphenateclass = str || 'hyphenate';
		},
		
		/**
		 * @name Hyphenator.setMinWordLength
		 * @methodOf Hyphenator
		 * @description
		 * Sets {@link Hyphenator-min}, the minimal word-length to hyphenate. Shorter words are returned without changings.
		 * If you use small numbers, Hyphenator is slower.
		 * @param number The word-length
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.setMinWordLength(5);
         *   Hyphenator.run();
         * &lt;/script&gt;
         * @default 6
         */
		setMinWordLength: function (mymin) {
            min = mymin || 6;
		},

		/**
		 * @name Hyphenator.setHyphenChar
		 * @methodOf Hyphenator
		 * @description
		 * Sets {@link Hyphenator-hyphen}, the char to be put at hyphen points.
		 * Use e.g. | to test hyphenation.
		 * @param string The char.
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.setHyphenChar('|');
         *   Hyphenator.run();
         * &lt;/script&gt;
         * @default Soft Hyphen
         */
		setHyphenChar: function (str) {
			if (str === '&shy;') {
				str = String.fromCharCode(173);
			}
            hyphen = str || String.fromCharCode(173);
		},

		/**
		 * @name Hyphenator.setDisplayToggleBox
		 * @methodOf Hyphenator
		 * @description
		 * Sets {@link Hyphenator-displayToggleBox}. The ToggleBox is off by default.
		 * @param boolean Set to true, if you want to display the ToggleBox.
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.setDisplayToggleBox(true);
         *   Hyphenator.run();
         * &lt;/script&gt;
         * @default true
         */
		setDisplayToggleBox: function (bool) {
			if (bool===undefined) {
				bool = true;
			}
            displayToggleBox = bool;
		},

		/**
		 * @name Hyphenator.setUrlHyphenChar
		 * @methodOf Hyphenator
		 * @description
		 * Sets {@link Hyphenator-urlhyphen}, the char to use to hyphenate URLs and Mailadresses.
		 * Use e.g. | to test hyphenation.
		 * @param string The character.
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.setUrlHyphenChar('|');
         *   Hyphenator.run();
         * &lt;/script&gt;
         * @default Zero Width Space or empty string (in IE 6).
         */
		setUrlHyphenChar: function (str) {
            urlhyphen = str || zerowidthspace;
		},

		/**
		 * @name Hyphenator.setRemoteLoading
		 * @methodOf Hyphenator
		 * @description
		 * Sets {@link Hyphenator-enableRemoteLoading}.
		 * You can load the patterns manually and turn off remote loading. Remote loading
		 * is on by default.
		 * @param boolean True enables remote loading
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.setRemoteLoading(false);
         *   Hyphenator.run();
         * &lt;/script&gt;
         */
		setRemoteLoading: function (bool) {
			enableRemoteLoading = bool;
		},

		/**
		 * @name Hyphenator.setEnableCache
		 * @methodOf Hyphenator
		 * @description
		 * Sets {@link Hyphenator-enableCache}.
		 * If cache is enabled, hyphenated words are stored in a cache for later reuse.
		 * This is good for longer texts.
		 * @param boolean True enables cache
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.setEnableCache(true);
         *   Hyphenator.run();
         * &lt;/script&gt;
         */
		setEnableCache: function (bool) {
			enableCache = bool;
		},

		/**
		 * @name Hyphenator.setOnHyphenationDoneCallback
		 * @methodOf Hyphenator
		 * @description
         */
		setOnHyphenationDoneCallback: function (cb) {
			onHyphenationDone = cb || function(){};
		},

		/**
		 * @name Hyphenator.setErrorHandler
		 * @methodOf Hyphenator
		 * @description
         */
		setOnErrorHandler: function (h) {
			error = h || function(){};
		},

		/**
		 * @name Hyphenator.setSwitchToggleBox
		 * @methodOf Hyphenator
		 * @description
         */
		setToggleBox: function (h) {
			toggleBox = h || function(){};
		},

		/**
		 * @name Hyphenator.setSwitchToggleBox
		 * @methodOf Hyphenator
		 * @description
         */
		setIntermediateState: function (visibility) {
			switch (visibility) {
				case 'visible':
				intermediateState = 'visible';
				break;
				case 'hidden':
				default:
				intermediateState = 'hidden';
				break;
			}
		},

		/**
		 * @name Hyphenator.setSwitchToggleBox
		 * @methodOf Hyphenator
		 * @description
         */
		setSelectorFunction: function (f) {
			selectorFunction = f || undefined;
		},

		/**
		 * @name Hyphenator.isBookmarklet
		 * @methodOf Hyphenator
		 * @description
		 * Returns {@link Hyphenator-bookmarklet}.
		 * @returns boolean
		 * @public
         */
		isBookmarklet: function () {
			return bookmarklet;
		},

		/**
		 * @name Hyphenator.hyphenateDocument
		 * @methodOf Hyphenator
		 * @description
		 * Calls hyphenateElement() for all members of elements. This is done with a setTimout
		 * to prevent a "long running Script"-alert when hyphenating large pages.
		 * Therefore a tricky bind()-function was necessary.
		 * @public
         */
		hyphenateDocument: function () {
			function bind(obj, fun, args) {
				return function() {
					var f = obj[fun];
					return f.call(obj, args);
				};
			}
			var i = 0, el;
			while (!!(el = elements[i++])) {
				window.setTimeout(bind(Hyphenator, "hyphenateElement", el), 0);
			}
		},
		
		/**
		 * @name Hyphenator.removeHyphenationFromDocument
		 * @methodOf Hyphenator
		 * @description
		 * Does what it says ;-)
		 * @public
         */
		removeHyphenationFromDocument: function () {
				var i = 0, el;
				while (!!(el = elements[i++])) {
					Hyphenator.removeHyphenationFromElement(el);
				}
				state = 4;
		},
		
		/**
		 * @name Hyphenator.hyphenateElement
		 * @methodOf Hyphenator
		 * @description
		 * Takes the content of the given element and - if there's text - replaces the words
		 * by hyphenated words. If there's an other element, the function is called recursively.
		 * When all words are hyphenated, the visibility of the element is set to 'visible'.
		 * @param object The element to hyphenate
		 * @param string The language used in this element
		 * @public
         */
		hyphenateElement : function (el, lang) {
			if (!lang) {
				lang = getLang(el, true);
			} else {
				var elemlang = getLang(el, true);
				if (elemlang !== null) {
					lang = elemlang;
				}
			}
			if (Hyphenator.languages.hasOwnProperty(lang)) {
				var wrd = '[\\w' + Hyphenator.languages[lang].specialChars + '@' + String.fromCharCode(173) + '-]{' + min + ',}';
				var hyphenate = function (word) {
					if (urlRE.test(word) || mailRE.test(word)) {
						return Hyphenator.hyphenateURL(word);
					} else {
						return Hyphenator.hyphenateWord(lang, word);
					}
				};
				var genRegExp = new RegExp('(' + url + ')|(' + mail + ')|(' + wrd + ')', 'gi');
				var n, i = 0;
				while (!!(n = el.childNodes[i++])) {
					if (n.nodeType === 3 && n.data.length >= min) { //type 3 = #text -> hyphenate!
						n.data = n.data.replace(genRegExp, hyphenate);
					}
				}
			}
            el.style.visibility = 'visible';
	        if(el.isLast) {
	        	state = 3;
	        	onHyphenationDone();
	        }
       },

		/**
		 * @name Hyphenator.deleteHyphenationInElement
		 * @methodOf Hyphenator
		 * @description
		 * Removes all hyphens from the element. If there are other elements, the function is
		 * called recursively.
		 * Removing hyphens is usefull if you like to copy text. Some browsers are buggy when the copy hyphenated texts.
		 * @param object The element where to remove hyphenation.
		 * @public
         */
        removeHyphenationFromElement : function (el) {
        	var h, i = 0, n;
        	switch (hyphen) {
			case '|':
				h = '\\|';
				break;
			case '+':
				h = '\\+';
				break;
			case '*':
				h = '\\*';
				break;
			default:
				h = hyphen;
        	}
        	while (!!(n = el.childNodes[i++])) {
        		if (n.nodeType === 3) {
        			n.data = n.data.replace(new RegExp(h, 'g'), '');
        		} else if (n.nodeType === 1) {
        			Hyphenator.removeHyphenationFromElement(n);
        		}
        	}
        },

		/**
		 * @name Hyphenator.hyphenateWord
		 * @methodOf Hyphenator
		 * @description
		 * This function is the heart of Hyphenator.js. It returns a hyphenated word.
		 *
		 * If there's already a {@link Hyphenator-hypen} in the word, the word is returned as it is.
		 * If the word is in the exceptions list or in the cache, it is retrieved from it.
		 * If there's a '-' put a zerowidthspace after the '-' and hyphenate the parts.
		 * @param string The language of the word
		 * @param string The word
		 * @returns string The hyphenated word
		 * @public
         */
		hyphenateWord : function (lang, word) {
			var lo = Hyphenator.languages[lang];
			if (word === '') {
				return '';
			}
			if (word.indexOf(String.fromCharCode(173)) !== -1) { //this String only contains the unicode char 'Soft Hyphen'
				//word already contains shy; -> leave at it is!
				return word;
			}
			if (lo.exceptions.hasOwnProperty(word)) { //the word is in the exceptions list
				return lo.exceptions[word].replace(/-/g, hyphen);
			}
			if (enableCache && lo.cache.hasOwnProperty(word)) { //the word is in the cache
				return lo.cache[word];
			}
			if (word.indexOf('-') !== -1) {
				//word contains '-' -> put a zerowidthspace after it and hyphenate the parts separated with '-'
				var parts = word.split('-');
				for (var i = 0, l = parts.length; i < l; i++) {
					parts[i] = Hyphenator.hyphenateWord(lang, parts[i]);
				}
				return parts.join('-' + zerowidthspace);
			}
			//finally the core hyphenation algorithm
			var w = '_' + word + '_';
			var wl = w.length;
			var s = w.split('');
			w = w.toLowerCase();
			var hypos = [];
			var p, maxwins, win, patk, pat = false, patl, c, digits, z;
			var numb3rs = {'0': true, '1': true, '2': true, '3': true, '4': true, '5': true, '6': true, '7': true, '8': true, '9': true}; //check for member is faster then isFinite()
			var n = wl - lo.shortestPattern;
			for (p = 0; p <= n; p++) {
				maxwins = Math.min((wl - p), lo.longestPattern);
				for (win = lo.shortestPattern; win <= maxwins; win++) {
					if (lo.patterns.hasOwnProperty(patk = w.substr(p, win))) {
						pat = lo.patterns[patk];
					} else {
						continue;
					}
					digits = 1;
					patl = pat.length;
					for (i = 0; i < patl; i++) {
						c = pat.charAt(i);
						if (numb3rs[c]) {
							if (i === 0) {
								z = p - 1;
								if (!hypos[z] || hypos[z] < c) {
									hypos[z] = c;
								}
							} else {
								z = p + i - digits;
								if (!hypos[z] || hypos[z] < c) {
									hypos[z] = c;
								}
							}
							digits++;								
						}
					}
				}
			}
			var inserted = 0;
			for (i = lo.leftmin; i <= (word.length - lo.rightmin); i++) {
				if (!!(hypos[i] & 1)) {
					s.splice(i + inserted + 1, 0, hyphen);
					inserted++;
				}
			}
			var hyphenatedword = s.slice(1, -1).join('');
			if(enableCache) {
				lo.cache[word] = hyphenatedword;
			}
			return hyphenatedword;
		},

		/**
		 * @name Hyphenator.hyphenateURL
		 * @methodOf Hyphenator
		 * @description
		 * Puts {@link Hyphenator-urlhyphen} after each no-alphanumeric char that my be in a URL.
		 * @param string URL to hyphenate
		 * @returns string the hyphenated URL
		 * @public
         */
		hyphenateURL: function (url) {
			return url.replace(/([:\/\.\?#&_,;!@]+)/gi, '$&' + urlhyphen);
		},

		/**
		 * @name Hyphenator.toggleHyphenation
		 * @methodOf Hyphenator
		 * @description
		 * Checks the current state of the ToggleBox and removes or does hyphenation.
		 * @public
         */
		toggleHyphenation: function () {
			switch (state) {
				case 3:
					Hyphenator.removeHyphenationFromDocument();
					toggleBox(false);
					break;
				case 4:
					Hyphenator.hyphenateDocument();
					toggleBox(true);
					break;
			}
		}
	};
}();
if (Hyphenator.isBookmarklet()) {
	Hyphenator.setDisplayToggleBox(true);
	Hyphenator.run();
}