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
 */

/**
 * @description Provides all functionality to do hyphenation
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
	 * @name Hyphenator-SUPPORTEDLANG
	 * @fieldOf Hyphenator
	 * @description
	 * A key-value object that stores supported languages.
	 * If you add hyphenation patterns change this object.
	 * @type object
	 * @private
	 * @example
	 * Check if language lang is supported:
	 * if (SUPPORTEDLANG[lang])
	 */
	var SUPPORTEDLANG = {'de': true,
						'en': true,
						'es': true,
						'fr': true,
						'nl': true,
						'ml': true,
						'hi': true,
						'bn': true,
						'gu': true,
						'ta': true,
						'ka': true,
						'te': true,
						'or': true,
						'pa': true,
						'sv': true,
						'it': true,
						'fi': true}; //you may delete languages that you won't use (for better performance)

	/**
	 * @name Hyphenator-LANGUAGEHINT
	 * @fieldOf Hyphenator
	 * @description
	 * A string to be displayed in a prompt if the language can't be guessed.
	 * If you add hyphenation patterns change this string.
	 * @type string
	 * @private
	 * @see Hyphenator-autoSetMainLanguage
	 */
	var LANGUAGEHINT = 'Deutsch: de\tEnglish: en\tEspa%F1ol: es\tFran%E7ais: fr\tNederlands: nl\tSvenska: sv\tMalayalam: ml\tHindi: hi\tBengali: bn\tGujarati : gu\tTamil: ta\tOriya: or\tPanjabi: pa\tTelugu: te\tKannada: kn\tItaliano: it\tSuomi: fi';

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
	var PROMPTERSTRINGS = {'de': 'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben: \n\n' + LANGUAGEHINT,
						 'en': 'The language of this website could not be determined automatically. Please indicate main language: \n\n' + LANGUAGEHINT,
                         'es': 'El idioma del sitio no pudo determinarse autom%E1ticamente. Por favor, indique el idioma principal: \n\n'+LANGUAGEHINT,
						 'fr': 'La langue de ce site n%u2019a pas pu %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue%A0: \n\n' + LANGUAGEHINT,
						 'nl': 'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op: \n\n' + LANGUAGEHINT,
						 'sv': 'Spr%E5ket p%E5 den h%E4r webbplatsen kunde inte avg%F6ras automatiskt. V%E4nligen ange: \n\n' + LANGUAGEHINT,
						 'ml': 'ഈ വെബ്‌സൈറ്റിന്റെ ഭാഷ കണ്ടുപിടിയ്ക്കാന്‍ കഴിഞ്ഞില്ല. ഭാഷ ഏതാണെന്നു തിരഞ്ഞെടുക്കുക: \n\n' + LANGUAGEHINT,
						 'it': 'Lingua del sito sconosciuta. Indicare una lingua, per favore: \n\n' + LANGUAGEHINT,
						 'fi': 'Sivun kieltä ei tunnistettu automaattisesti. Määritä sivun pääkieli: \n\n' + LANGUAGEHINT};
	
	/**
	 * @name Hyphenator-BASEPATH
	 * @fieldOf Hyphenator
	 * @description
 	 * A string storing the basepath from where Hyphenator.js was loaded.
	 * This is used to load the patternfiles.
	 * The basepath is determined dynamically ba searching all script-tags for Hyphenator.js
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
	 * @name Hyphenator-DONTHYPHENATE
	 * @fieldOf Hyphenator
	 * @description
	 * A key-value object containing all html-text their content sould not be hyphenated
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
	 * {@link Hyphenator-gatherElements}
	 * @type array
	 * @private
	 */	
	var elements = [];

	/**
	 * @name Hyphenator-doclanguages
	 * @fieldOf Hyphenator
	 * @description
	 * An object holding all languages used in the document. This is filled by
	 * {@link Hyphenator-gatherElements}
	 * @type array
	 * @private
	 */	
	var doclanguages = {};


	/**
	 * @name Hyphenator-preparestate
	 * @fieldOf Hyphenator
	 * @description
	 * A number that inidcates the current state of the scripts pattern-loading routine
	 * 0: not initialized
	 * 1: loading patterns
	 * 2: ready
	 * @type number
	 * @private
	 */	
	var preparestate = 0;

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
			if (SUPPORTEDLANG[ul]) {
				text = PROMPTERSTRINGS[ul];
			} else {
				text = PROMPTERSTRINGS.en;
			}
			var lang = window.prompt(unescape(text), ul);
			if (SUPPORTEDLANG[lang]) {
				mainlanguage = lang;
			}
		}
	}

    
	/**
	 *
	 *
	 *
	 */
	function gatherDocumentInfos() {
		var el, i, l;
		var process = function(el, hide) {
			var idx, lang;
			idx = elements.push(el) - 1;
			if (hide) {
				elements[idx].style.visibility = 'hidden';
			}
			if (!!(lang = getLang(el, true))) {
				if (SUPPORTEDLANG[lang]) {
					doclanguages[lang] = true;
				} else {
					//alert('Language '+lang+' is not yet supported.');
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
			return;
		}
		if (document.getElementsByClassName) {
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
	 * @name Hyphenator-loadPatterns
	 * @methodOf Hyphenator
	 * @description
	 * Adds a &lt;script&gt;-Tag to the DOM to load an externeal .js-file containing patterns and settings for the given language.
	 * If the iven language is not in the {@link Hyphenator-SUPPORTEDLANG}-Object it returns.
	 * One may ask why we are not using AJAX to load the patterns. The XMLHttpRequest-Object 
	 * has a same-origin-policy. The makes the bookmarklet-functionality impossible.
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
		//check if 'url' is available:
		//Still commented out, because it's not yet fully tested!
		//TBD: Where to catch errors?
		/*var xhr = null;
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
				alert('Hyphenator.js Error:\nCould not load\n'+url);
				return;
			}
		}*/
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
	 */		
	function prepareLanguagesObj(lang) {
		if (enableCache) {
			Hyphenator.languages[lang].cache = {};
		}
		if (Hyphenator.languages[lang].hasOwnProperty('exceptions')) {
			var tmp = Hyphenator.languages[lang].exceptions;
			Hyphenator.languages[lang].exceptions = {};
			Hyphenator.addExceptions(lang, tmp);
		} else {
			Hyphenator.languages[lang].exceptions = {};
		}
	}
	
	/**
	 * @name Hyphenator-prepare
	 * @methodOf Hyphenator
	 * @description
	 * This funtion prepares the Hyphenator-Object. First, it looks for languages that are used
	 * in the document. Then it loads the patterns calling {@link Hyphenator-loadPatterns}.
	 * Finally it 'waits' until all patterns are loaded by repeatedly checking languages
	 * for all languages.
	 * When all patterns are loaded the function sets {@link Hyphenator-preparestate} to 2 and calls the callback.
	 * Currently there's no message if the patterns aren't found/loaded.
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
			preparestate = 2;
			callback();
			return;
		}
		// get all languages that are used and preload the patterns
		preparestate = 1;
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
					//do conversion while other patterns are loading:
					convertPatternsToObject(lang);
					prepareLanguagesObj(lang);			
				}
			}
			if (finishedLoading) {
				window.clearInterval(interval);
				preparestate = 2;
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
	function switchToggleBox(s) {
		var myBox, bdy, myIdAttribute, myTextNode, myClassAttribute;
		if (s) {
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
		} else {
			myBox = document.getElementById('HyphenatorToggleBox');
			myBox.style.visibility = 'hidden';
		}
	}

	return {
		/**
		 * @name Hyphenator.leftmin
		 * @memberOf Hyphenator
		 * @description
		 * Objects that holds a key-value pairs, where key is the language and value the number of chars that can be at minimum on the old line.
		 * This is set by the patternfile.
		 * @public
         */		
		languages: {}, // patterns are stored in here, when they have finished loading
		

		/**
		 * @name Hyphenator.init
		 * @methodOf Hyphenator
		 * @description
		 * Init function that takes an onject as an argument. The object contains key-value-pairs
		 * containig Hyphenator-settings. This is a shortcut for calling Hyphenator.set...-Methods.
		 * @param object <table>
		 * <tr><th>key</th><th>values</th><th>default</th></tr>
		 * <tr><td>classname</td><td>string</td><td>'hyphenate'</td></tr>
		 * <tr><td>minwordlength</td><td>integer</td><td>6</td></tr>
		 * <tr><td>hyphenchar</td><td>string</td><td>'&amp;shy;'</td></tr>
		 * <tr><td>togglebox</td><td>boolean</td><td>false</td></tr>
		 * <tr><td>urlhyphenchar</td><td>string</td><td>'zero with space'</td></tr>
		 * <tr><td>remoteloading</td><td>boolean</td><td>true</td></tr>
		 * </table>
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.run();
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
			if(obj.togglebox) {
				Hyphenator.setDisplayToggleBox(obj.togglebox);
			}
			if(obj.urlhyphenchar) {
				Hyphenator.setUrlHyphenChar(obj.urlhyphenchar);
			}
			if(obj.remoteloading) {
				Hyphenator.setRemoteLoading(obj.remoteloading);
			}
		},

		/**
		 * @name Hyphenator.run
		 * @methodOf Hyphenator
		 * @description
		 * Bootstrap function that starts all hyphenationprocesses when called.
		 * Can have a callback as argument wich is called when all hyphenation is done.
		 * @param function Callback
		 * @public
		 * @example &lt;script src = "Hyphenator.js" type = "text/javascript"&gt;&lt;/script&gt;
         * &lt;script type = "text/javascript"&gt;
         *   Hyphenator.run(function(){alert('Hyphenation done');});
         * &lt;/script&gt;
         */
		run: function (cb) {
			onHyphenationDone = cb || function(){};
			var process = function () {
				autoSetMainLanguage();
				gatherDocumentInfos();
				prepare(Hyphenator.hyphenateDocument);
				if (displayToggleBox) {
					switchToggleBox(true);
				}
			};
			runOnContentLoaded(window, process);
			if (Hyphenator.isBookmarklet()) {
				process();
			}
		},
		
		/**
		 * @name Hyphenator.adds
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
		addExceptions: function (lang, words) { //words is a comma separated string of words
			var w = words.split(',');
			for (var i = 0, l = w.length; i < l; i++) {
				var key = w[i].replace(/-/g, '');
				if (!Hyphenator.languages[lang].exceptions.hasOwnProperty(key)) {
					Hyphenator.languages[lang].exceptions[key] = w[i];
				}
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
		 * 
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
		 * 
		 * @public
         */
		removeHyphenationFromDocument: function () {
			if (Hyphenator.isBookmarklet()) {
				Hyphenator.deleteHyphenationInElement(document.getElementsByTagName('body')[0]);
			} else {
				var i = 0, el;
				while (!!(el = elements[i++])) {
					Hyphenator.removeHyphenationFromElement(el);
				}
			}
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
			if (el.className.indexOf("donthyphenate") !== -1) {
				return;
			}
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
            if (el.className.indexOf(hyphenateclass) !== -1) {
	            el.style.visibility = 'visible';
	        }
	        if(el.isLast) {
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
		 * This function is the heart of Hyphenator.js. returns a hyphenated word.
		 *
		 * If there's already a {@link Hyphenator-hypen} in the word, the word is returned as it is.
		 * If the word is in the exceptions list, it is retrieved from it.
		 * If there's a '-' put a zerowidthspace after the '-' and hyphenate the parts.
		 * @param string The language of the word
		 * @param string The word
		 * @returns string The hyphenated word
		 * @public
         */
		hyphenateWord : function (lang, word) {
			if (word === '') {
				return '';
			}
			if (word.indexOf(String.fromCharCode(173)) !== -1) { //this String only contains the unicode char 'Soft Hyphen'
				//word already contains shy; -> leave at it is!
				return word;
			}
			if (Hyphenator.languages[lang].exceptions.hasOwnProperty(word)) { //the word is in the exceptions list
				return Hyphenator.languages[lang].exceptions[word].replace(/-/g, hyphen);
			}
			if (enableCache && Hyphenator.languages[lang].cache.hasOwnProperty(word)) { //the word is in the cache
				return Hyphenator.languages[lang].cache[word];
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
			var p, maxwins, win, pat = false, patl, c, digits, z;
			var numb3rs = {'0': true, '1': true, '2': true, '3': true, '4': true, '5': true, '6': true, '7': true, '8': true, '9': true}; //check for member is faster then isFinite()
			var n = wl - Hyphenator.languages[lang].shortestPattern;
			for (p = 0; p <= n; p++) {
				maxwins = Math.min((wl - p), Hyphenator.languages[lang].longestPattern);
				for (win = Hyphenator.languages[lang].shortestPattern; win <= maxwins; win++) {
					if (Hyphenator.languages[lang].patterns.hasOwnProperty(w.substr(p, win))) {
						pat = Hyphenator.languages[lang].patterns[w.substr(p, win)];
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
			for (i = Hyphenator.languages[lang].leftmin; i <= (word.length - Hyphenator.languages[lang].rightmin); i++) {
				if (!!(hypos[i] & 1)) {
					s.splice(i + inserted + 1, 0, hyphen);
					inserted++;
				}
			}
			var hyphenatedword = s.slice(1, -1).join('');
			if(enableCache) {
				Hyphenator.languages[lang].cache[word] = hyphenatedword;
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
			var currentText = document.getElementById('HyphenatorToggleBox').firstChild.nodeValue;
			if (currentText === 'Hy-phe-na-ti-on') {
				Hyphenator.removeHyphenationFromDocument();
				document.getElementById('HyphenatorToggleBox').firstChild.nodeValue = 'Hyphenation';
				
			} else {
				Hyphenator.hyphenateDocument();
				document.getElementById('HyphenatorToggleBox').firstChild.nodeValue = 'Hy-phe-na-ti-on';
			}
		}
	};
}();
if (Hyphenator.isBookmarklet()) {
	Hyphenator.run();
}