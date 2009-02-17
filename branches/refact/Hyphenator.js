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
 * - redo config()-method
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
	 * @name Hyphenator-hyphenateClass
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
	var hyphenateClass = 'hyphenate'; // the CSS-Classname of Elements that should be hyphenated eg. <p class = "hyphenate">Text</p>
	
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
	 * @name Hyphenator-mainLanguage
	 * @fieldOf Hyphenator
	 * @description
	 * The general language of the document
	 * @type number
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */	
	var mainLanguage = null;

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
	 * @name Hyphenator-docLanguages
	 * @fieldOf Hyphenator
	 * @description
	 * An object holding all languages used in the document. This is filled by
	 * {@link Hyphenator-gatherDocumentInfos}
	 * @type object
	 * @private
	 */	
	var docLanguages = {};


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
	 * @name Hyphenator-error
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
	 * Gets the language of an element. If no language is set, it may use the {@link Hyphenator-mainLanguage}.
	 * @param object The first parameter is an DOM-Element-Object
	 * @param boolean The second parameter is a boolean to tell if the function should return the {@link Hyphenator-mainLanguage}
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
		if (!nofallback && mainLanguage) {
			return mainLanguage;
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
	 * If the retrieved language is in the object {@link Hyphenator-SUPPORTEDLANG} it is copied to {@link Hyphenator-mainLanguage}
	 * @private
	 */		
	function autoSetMainLanguage() {
		var el = document.getElementsByTagName('html')[0];
		mainLanguage = getLang(el);
		if (!mainLanguage) {
			var m = document.getElementsByTagName('meta');
			for (var i = 0; i < m.length; i++) {
				//<meta http-equiv = "content-language" content="xy">	
				if (!!m[i].getAttribute('http-equiv') && (m[i].getAttribute('http-equiv') === 'content-language')) {
					mainLanguage = m[i].getAttribute('content').substring(0, 2);
				}
				//<meta name = "DC.Language" content="xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name') === 'DC.language')) {
					mainLanguage = m[i].getAttribute('content').substring(0, 2);
				}			
				//<meta name = "language" content = "xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name') === 'language')) {
					mainLanguage = m[i].getAttribute('content').substring(0, 2);
				}
			}
		}
		if (!mainLanguage) {
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
				mainLanguage = lang;
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
					docLanguages[lang] = true;
				} else {
					error(new Error('Language '+lang+' is not yet supported.'));
				}
			}
			if (lang !== mainLanguage) {
				elements[idx].lang = lang;
			}
			var n, i = 0;
			while (!!(n = el.childNodes[i++])) {
				if (n.nodeType === 1 && !DONTHYPHENATE[n.nodeName.toLowerCase()]) {			//typ 1 = element node -> recursion
					if(n.className.indexOf(hyphenateClass) === -1 && n.className.indexOf('donthyphenate') === -1) {
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
			el = document.getElementsByClassName(hyphenateClass);
			for (i = 0, l = el.length; i < l; i++)
			{
				process(el[i], true);
			}
		} else {
			el = document.getElementsByTagName('*');
			for (i = 0, l = el.length; i < l; i++)
			{
				if (el[i].className.indexOf(hyphenateClass) !== -1 && el[i].className.indexOf('donthyphenate') === -1) {
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
					delete docLanguages[lang];
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
		docLanguages[mainLanguage] = true;
		for (lang in docLanguages) {
			if (docLanguages.hasOwnProperty(lang)) {
				loadPatterns(lang);
			}
		}
		// wait until they are loaded
		var interval = window.setInterval(function () {
			var finishedLoading = false;
			for (var lang in docLanguages) {
				if (!Hyphenator.languages[lang]) {
					finishedLoading = false;
					break;
				} else {
					finishedLoading = true;
					delete docLanguages[lang];
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
		 * @name Hyphenator.config
		 * @methodOf Hyphenator
		 * @description
		 * Config function that takes an object as an argument. The object contains key-value-pairs
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
         *     Hyphenator.config({'minwordlength':4,'hyphenchar':'|'});
         *     Hyphenator.run();
         * &lt;/script&gt;
         */
		config: function (obj) {
			var assert = function (name, type) {
				if (typeof obj[name] === type) {
					return true;
				} else {
					error(new Error('Config error: '+name+' must be of type '+type));
					return false;
				}
			};
			if (obj.hasOwnProperty('classname')) {
				if (assert ('classname', 'string')) {
					hyphenateClass = obj.classname;
				}
			}
			if (obj.hasOwnProperty('minwordlength')) {
				if (assert ('minwordlength', 'number')) {
					min = obj.minwordlength;
				}
			}
			if (obj.hasOwnProperty('hyphenchar')) {
				if (assert ('hyphenchar', 'string')) {
					if (obj.hyphenchar === '&shy;') {
						obj.hyphenchar = String.fromCharCode(173);
					}
            		hyphen = obj.hyphenchar;
            	}
			}
			if (obj.hasOwnProperty('urlhyphenchar')) {
				if (assert ('urlhyphenchar', 'string')) {
					urlhyphen = obj.urlhyphenchar;
				}
			}
			if (obj.hasOwnProperty('togglebox')) {
				if (assert ('togglebox', 'function')) {
					toggleBox = obj.togglebox;
				}
			}
			if (obj.hasOwnProperty('displaytogglebox')) {
				if (assert ('displaytogglebox', 'boolean')) {
            		displayToggleBox = obj.displaytogglebox;
            	}
			}
			if (obj.hasOwnProperty('remoteloading')) {
				if (assert ('remoteloading', 'boolean')) {
					enableRemoteLoading = obj.remoteloading;
				}
			}
			if (obj.hasOwnProperty('enablecache')) {
				if (assert ('enablecache', 'boolean')) {
					enableCache = obj.enablecache;
				}
			}
			if (obj.hasOwnProperty('onhyphenationdonecallback')) {
				if (assert ('onhyphenationdonecallback', 'function')) {
					onHyphenationDone = obj.onhyphenationdonecallback;
				}
			}
			if (obj.hasOwnProperty('onerrorhandler')) {
				if (assert ('onerrorhandler', 'function')) {
					error = obj.onerrorhandler;
				}
			}
			if (obj.hasOwnProperty('intermediatestate')) {
				if (assert ('intermediatestate', 'string')) {
					intermediateState = obj.intermediatestate;
				}
			}
			if (obj.hasOwnProperty('selectorfunction')) {
				if (assert ('selectorfunction', 'function')) {
					selectorFunction = obj.selectorfunction;
				}
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
	Hyphenator.config({displaytogglebox:true});
	Hyphenator.run();
}