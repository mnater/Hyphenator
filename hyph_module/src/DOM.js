//Hyphenator.DOM.js
Hyphenator.fn.extend('Element', function (element, hyphenated, data) {
	this.element = element;
	this.hyphenated = hyphenated;
	this.data = data;
});

Hyphenator.fn.Element.prototype = {
	hyphenate: function () {
		var lang = this.data.language, hyphenate, n, i,
			controlOrphans = function (part) {
				var h, r;
				switch (Hyphenator.hyphen) {
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
					h = Hyphenator.hyphen;
				}
				if (Hyphenator.orphanControl >= 2) {
					//remove hyphen points from last word
					r = part.split(' ');
					r[1] = r[1].replace(new RegExp(h, 'g'), '');
					r[1] = r[1].replace(new RegExp(Hyphenator.zeroWidthSpace, 'g'), '');
					r = r.join(' ');
				}
				if (Hyphenator.orphanControl === 3) {
					//replace spaces by non breaking spaces
					r = r.replace(/[ ]+/g, String.fromCharCode(160));
				}
				return r;
			};
		if (Hyphenator.languages.hasOwnProperty(lang)) {
			hyphenate = function (word) {
				//console.log(word);
				if (!Hyphenator.doHyphenation) {
					return word;
				} else if (Hyphenator.fn.urlOrMailRE.test(word)) {
					return Hyphenator.hyphenateURL(word);
				} else {
					return Hyphenator.hyphenateWord(lang, word);
				}
			};
			/*if (Hyphenator.safeCopy && (this.element.tagName.toLowerCase() !== 'body')) {
				Hyphenator.fn.registerOnCopy(this.element);
			}*/
			i = 0;
			while (!!(n = this.element.childNodes[i++])) {
				if (n.nodeType === 3 && n.data.length >= Hyphenator.min) { //type 3 = #text -> hyphenate!
					n.data = n.data.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
					if (Hyphenator.orphanControl !== 1) {
						n.data = n.data.replace(/[\S]+ [\S]+$/, controlOrphans);
					}
				}
			}
		}
		if (this.data.isHidden && Hyphenator.intermediateState === 'hidden') {
			this.element.style.visibility = 'visible';
			if (!this.data.hasOwnStyle) {
				this.element.setAttribute('style', ''); // without this, removeAttribute doesn't work in Safari (thanks to molily)
				this.element.removeAttribute('style');
			} else {
				if (this.element.style.removeProperty) {
					this.element.style.removeProperty('visibility');
				} else if (this.element.style.removeAttribute) { // IE
					this.element.style.removeAttribute('visibility');
				}  
			}
		}
		this.hyphenated = true;
		Hyphenator.fn.collectedElements.runCount++;
		if (Hyphenator.fn.collectedElements.runCount === Hyphenator.fn.collectedElements.elementCount) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(6, null, "Hyphenation done."));
		}
	},
	removeHyphenation: function () {
		var h, i = 0, n;
		switch (Hyphenator.hyphen) {
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
			h = Hyphenator.hyphen;
		}
		while (!!(n = this.element.childNodes[i++])) {
			if (n.nodeType === 3) {
				n.data = n.data.replace(new RegExp(h, 'g'), '');
				n.data = n.data.replace(new RegExp(Hyphenator.zeroWidthSpace, 'g'), '');
			}
		}
		this.hyphenated = false;
	}
};

Hyphenator.fn.extend('LanguageElementsCollection', function (lang) {
	this.language = lang;
	this.elementList = [];
});

Hyphenator.fn.LanguageElementsCollection.prototype = {
	add: function (el, data) {
		this.elementList.push(new Hyphenator.fn.Element(el, false, data));
	},
	each: function (fn) {
		var tmp = new Hyphenator.fn.EO(this.elementList);
		tmp.each(fn);
	},
	hyphenateElements: function () {
		this.each(function (el, content) {
			content.hyphenate();
		});
	},
	removeHyphenationFromElements: function () {
		this.each(function (el, content) {
			content.removeHyphenation();
		});
	}
};

Hyphenator.fn.extend('ElementCollection', function () {
	this.list = {};
	this.elementCount = 0;
	this.runCount = 0;
	this.addElement = function (el, lang, data) {
		if (!this.list.hasOwnProperty(lang)) {
			this.list[lang] = new Hyphenator.fn.LanguageElementsCollection(lang);
		}
		this.list[lang].add(el, data);
		this.elementCount++;
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(5, {'element': el, 'lang': lang}, "Element added."));
	};
});

Hyphenator.fn.ElementCollection.prototype = {
	each: function (fn) {
		var tmp = new Hyphenator.fn.EO(this.list);
		tmp.each(fn);
	},
	removeAllHyphenation: function () {
		this.each(function (el, content) {
			content.removeHyphenationFromElements();
		});
	},
	hyphenateAll: function () {
		this.each(function (el, content) {
			content.hyphenateElements();
		});
	}
};


Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	createElem: function (tagname) {
		if (window.document.createElementNS) {
			return window.document.createElementNS('http://www.w3.org/1999/xhtml', tagname);
		} else if (window.createElement) {
			return window.document.createElement(tagname);
		}
	},
	insertScript: function (text) {
		var script, head = window.document.getElementsByTagName('head').item(0);
		script = Hyphenator.fn.createElem('script');
		script.type = 'text/javascript';
		script.text = text;
		head.appendChild(script);
	},
	collectedElements: new Hyphenator.fn.ElementCollection(),
	prepareElements: function () {
		var tmp, i = 0, elementsToProcess,
		process = function (el, hide, lang) {
			var n, i = 0, hyphenatorSettings = {};
			if (hide && Hyphenator.intermediateState === 'hidden') {
				if (!!el.getAttribute('style')) {
					hyphenatorSettings.hasOwnStyle = true;
				} else {
					hyphenatorSettings.hasOwnStyle = false;					
				}
				hyphenatorSettings.isHidden = true;
				el.style.visibility = 'hidden';
			}
			if (el.lang && typeof(el.lang) === 'string') {
				hyphenatorSettings.language = el.lang.toLowerCase(); //copy attribute-lang to internal lang
			} else if (lang) {
				hyphenatorSettings.language = lang.toLowerCase();
			} else {
				hyphenatorSettings.language = Hyphenator.fn.getLang(el, true);
			}
			lang = hyphenatorSettings.language;
			if (!Hyphenator.fn.supportedLanguages.hasOwnProperty(lang)) {
				if (Hyphenator.fn.supportedLanguages.hasOwnProperty(lang.split('-')[0])) { //try subtag
					lang = lang.split('-')[0];
					hyphenatorSettings.language = lang;
				} else if (!Hyphenator.fn.isBookmarklet) {
					Hyphenator.postMessage(new Hyphenator.fn.Message(0, lang, 'Language ' + lang + ' is not yet supported.'));
				}
			}
			if (Hyphenator.fn.supportedLanguages.hasOwnProperty(lang)) {
				if (Hyphenator.fn.supportedLanguages[lang].state === 0) {
					//load the language
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(4, lang, "language found: " + lang));
				}
			}
			Hyphenator.fn.collectedElements.addElement(el, lang, hyphenatorSettings);
			
			while (!!(n = el.childNodes[i++])) {
				if (n.nodeType === 1 && !Hyphenator.fn.dontHyphenate[n.nodeName.toLowerCase()] &&
					n.className.indexOf(Hyphenator.dontHyphenateClass) === -1 && !(n in Hyphenator.fn.collectedElements)) {
					process(n, false, lang);
				}
			}
		};
		elementsToProcess = Hyphenator.selectorFunction();
		while (!!(tmp = elementsToProcess[i++])) {
			process(tmp, true, '');
		}
		
	},
	removeHyphenationFromDocument: function () {
		Hyphenator.fn.collectedElements.removeAllHyphenation();
	},
	rehyphenateDocument: function () {
		Hyphenator.fn.collectedElements.hyphenateAll();
	},
	getLang: function (el, fallback) {
		if (!!el.getAttribute('lang')) {
			return el.getAttribute('lang').toLowerCase();
		}
		// The following doesn't work in IE due to a bug when getAttribute('xml:lang') in a table
		/*if (!!el.getAttribute('xml:lang')) {
			return el.getAttribute('xml:lang').substring(0, 2);
		}*/
		//instead, we have to do this (thanks to borgzor):
		try {
			if (!!el.getAttribute('xml:lang')) {
				return el.getAttribute('xml:lang').toLowerCase();
			}
		} catch (ex) {}
		if (el.tagName !== 'HTML') {
			return Hyphenator.fn.getLang(el.parentNode, true);
		}
		if (fallback) {
			return Hyphenator.mainLanguage;
		}
		return null;
	},
	autoSetMainLanguage: function (w) {
		w = w || window;
		var el = w.document.getElementsByTagName('html')[0],
			m = w.document.getElementsByTagName('meta'),
			i, text, e, ul;
		Hyphenator.mainLanguage = Hyphenator.fn.getLang(el, false);
		if (!Hyphenator.mainLanguage) {
			for (i = 0; i < m.length; i++) {
				//<meta http-equiv = "content-language" content="xy">	
				if (!!m[i].getAttribute('http-equiv') && (m[i].getAttribute('http-equiv').toLowerCase() === 'content-language')) {
					Hyphenator.mainLanguage = m[i].getAttribute('content').toLowerCase();
				}
				//<meta name = "DC.Language" content="xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name').toLowerCase() === 'dc.language')) {
					Hyphenator.mainLanguage = m[i].getAttribute('content').toLowerCase();
				}			
				//<meta name = "language" content = "xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name').toLowerCase() === 'language')) {
					Hyphenator.mainLanguage = m[i].getAttribute('content').toLowerCase();
				}
			}
		}
		//get lang for frame from enclosing document
		if (!Hyphenator.mainLanguage && Hyphenator.doFrames && w != window.parent) {
			Hyphenator.fn.autoSetMainLanguage(window.parent);
		}
		//fallback to defaultLang if set
		if (!Hyphenator.mainLanguage && Hyphenator.defaultLanguage !== '') {
			Hyphenator.mainLanguage = Hyphenator.defaultLanguage;
		}
		//ask user for lang
		if (!Hyphenator.mainLanguage) {
			text = '';
			ul = navigator.language ? navigator.language : navigator.userLanguage;
			ul = ul.substring(0, 2);
			if (Hyphenator.fn.prompterStrings.hasOwnProperty(ul)) {
				text = Hyphenator.fn.prompterStrings[ul];
			} else {
				text = Hyphenator.fn.prompterStrings.en;
			}
			text += ' (ISO 639-1)\n\n' + Hyphenator.fn.languageHint;
			Hyphenator.mainLanguage = window.prompt(unescape(text), ul).toLowerCase();
		}
		if (!Hyphenator.fn.supportedLanguages.hasOwnProperty(Hyphenator.mainLanguage)) {
			if (Hyphenator.fn.supportedLanguages.hasOwnProperty(Hyphenator.mainLanguage.split('-')[0])) { //try subtag
				Hyphenator.mainLanguage = Hyphenator.mainLanguage.split('-')[0];
			} else {
				e = 'The language "' + Hyphenator.mainLanguage + '" is not yet supported.';
				Hyphenator.postMessage(new Hyphenator.fn.Message(0, Hyphenator.mainLanguage, e));
			}
		}
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(4, Hyphenator.mainLanguage, "mainLanguage set: " + Hyphenator.mainLanguage));
	},
	runOnContentLoaded: function (w, f) {
		var DOMContentLoaded = function () {}, toplevel, hyphRunForThis = {}, contextWindow;
		/*if (documentLoaded && !hyphRunForThis[w.location.href]) {
			f();
			hyphRunForThis[w.location.href] = true;
			return;
		}*/
		function init(context) {
			contextWindow = context || window;
			if (!hyphRunForThis[contextWindow.location.href] /*&& (!documentLoaded || contextWindow != window.parent)*/) {
				//documentLoaded = true;
				f();
				hyphRunForThis[contextWindow.location.href] = true;
			}
		}
		
		function doScrollCheck() {
			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch (error) {
				setTimeout(doScrollCheck, 1);
				return;
			}
		
			// and execute any waiting functions
			init(window);
		}

		function doOnLoad() {
			var i, haveAccess, fl = window.frames.length;
			if (Hyphenator.doFrames && fl > 0) {
				for (i = 0; i < fl; i++) {
					haveAccess = undefined;
					//try catch isn't enough for webkit
					try {
						//opera throws only on document.toString-access
						haveAccess = window.frames[i].document.toString();
					} catch (e) {
						haveAccess = undefined;
					}
					if (!!haveAccess) {
						init(window.frames[i]);
					}
				}
				contextWindow = window;
				f();
				hyphRunForThis[window.location.href] = true;
			} else {
				init(window);
			}
		}
		
		// Cleanup functions for the document ready method
		if (document.addEventListener) {
			DOMContentLoaded = function () {
				document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
				window.removeEventListener("load", doOnLoad, false);
				if (Hyphenator.doFrames && window.frames.length > 0) {
					//we are in a frameset, so do nothing but wait for onload to fire
					return;
				} else {
					init(window);
				}
			};
		
		} else if (document.attachEvent) {
			DOMContentLoaded = function () {
				// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
				if (document.readyState === "complete") {
					document.detachEvent("onreadystatechange", DOMContentLoaded);
					window.detachEvent("onload", doOnLoad);
					if (Hyphenator.doFrames && window.frames.length > 0) {
						//we are in a frameset, so do nothing but wait for onload to fire
						return;
					} else {
						init(window);
					}
				}
			};
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if (document.addEventListener) {
			// Use the handy event callback
			document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
			
			// A fallback to window.onload, that will always work
			window.addEventListener("load", doOnLoad, false);

		// If IE event model is used
		} else if (document.attachEvent) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent("onreadystatechange", DOMContentLoaded);
			
			// A fallback to window.onload, that will always work
			window.attachEvent("onload", doOnLoad);

			// If IE and not a frame
			// continually check to see if the document is ready
			toplevel = false;
			try {
				toplevel = window.frameElement === null;
			} catch (e) {}

			if (document.documentElement.doScroll && toplevel) {
				doScrollCheck();
			}
		}

	}

}));


Hyphenator.addModule(new Hyphenator.fn.EO({
	selectorFunction: function () {
		var tmp, el = [], i, l;
		if (document.getElementsByClassName) {
			el = window.document.getElementsByClassName(Hyphenator.hyphenateClass);
		} else {
			tmp = window.document.getElementsByTagName('*');
			l = tmp.length;
			for (i = 0; i < l; i++)
			{
				if (tmp[i].className.indexOf(Hyphenator.hyphenateClass) !== -1 && tmp[i].className.indexOf(Hyphenator.dontHyphenateClass) === -1) {
					el.push(tmp[i]);
				}
			}
		}
		return el;
	}
}));

