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
		//console.log(Hyphenator.fn.collectedElements);
		if (Hyphenator.fn.collectedElements.complete && (Hyphenator.fn.collectedElements.runCount === Hyphenator.fn.collectedElements.elementCount)) {
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
	this.complete = false;
});

Hyphenator.fn.ElementCollection.prototype = {
	reset: function () {
		this.list = {};
		this.elementCount = this.runCount = 0;
		this.complete = false;
	},
	addElement: function (el, lang, data) {
		if (!this.list.hasOwnProperty(lang)) {
			this.list[lang] = new Hyphenator.fn.LanguageElementsCollection(lang);
		}
		this.list[lang].add(el, data);
		this.elementCount++;
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(5, {'element': el, 'lang': lang}, "Element added."));
	},
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

Hyphenator.fn.extend('DocumentCollection', function () {
	this.list = {};
	this.documentCount = 0;
});

Hyphenator.fn.DocumentCollection.prototype = {
	addDocument: function (w, loaded) {
		var href = w.location.href;
		if (!this.list.hasOwnProperty(href)) {
			this.documentCount++;
		}
		this.list[href] = loaded;
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(7, w, "Document added: " + href));
	}
};

Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	createElem: function (tagname, w) {
		w = w || window;
		if (window.document.createElementNS) {
			return w.document.createElementNS('http://www.w3.org/1999/xhtml', tagname);
		} else if (window.createElement) {
			return w.document.createElement(tagname);
		}
	},
	insertScript: function (text) {
		var script, head = window.document.getElementsByTagName('head').item(0);
		script = Hyphenator.fn.createElem('script');
		script.type = 'text/javascript';
		script.text = text;
		head.appendChild(script);
	},
	collectedDocuments: new Hyphenator.fn.DocumentCollection(),
	prepareDocuments: function (w) {
		w = w || window;
		
		var DOMContentLoaded, toplevel,
		process = function (w) {
			var i, fl = w.frames.length, haveAccess;
			if (w.document.getElementsByTagName('frameset').length === 0) { //this is no frameset -> hyphenate
				if (Hyphenator.displayToggleBox) {
					Hyphenator.toggleBox(w);
				}
				Hyphenator.mainLanguage[w.location.href] = Hyphenator.fn.getMainLanguage(w);
				Hyphenator.fn.collectedDocuments.addDocument(w, true);
			}
			if (fl > 0) {
				for (i = 0; i < fl; i++) {
					haveAccess = undefined;
					//try catch isn't enough for webkit
					try {
						//opera throws only on document.toString-access
						haveAccess = w.frames[i].document.toString();
					} catch (e) {
						haveAccess = undefined;
					}
					if (!!haveAccess) {
						Hyphenator.fn.prepareDocuments(w.frames[i]);
					}
				}
			}
		},
		doScrollCheck = function () {
			try {
				// If IE is used, use the trick by Diego Perini: http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch (error) {
				setTimeout(doScrollCheck, 1);
				return;
			}
		
			// and execute any waiting functions
			process(w);
		},
		doOnLoad = function () {
			var i, haveAccess, fl = window.frames.length;
			process(w);
		};
		
		if (Hyphenator.fn.isBookmarklet || Hyphenator.fn.collectedDocuments.list[w.location.href]) {
			process(w);
		}
		
		// Cleanup functions for the document ready method
		if (document.addEventListener) {
			DOMContentLoaded = function () {
				w.document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
				w.removeEventListener("load", doOnLoad, false);
				process(w);
			};
		} else if (document.attachEvent) {
			DOMContentLoaded = function () {
				if (w.document.readyState === "complete") {
					w.document.detachEvent("onreadystatechange", DOMContentLoaded);
					w.detachEvent("onload", doOnLoad);
					process(w);
				}
			};
		}

		if (document.addEventListener) {
			w.document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);			
			// A fallback to window.onload, that will always work
			w.addEventListener("load", doOnLoad, false);

		} else if (document.attachEvent) {
			w.document.attachEvent("onreadystatechange", DOMContentLoaded);
			// A fallback to window.onload, that will always work
			w.attachEvent("onload", doOnLoad);

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

	},
	
	collectedElements: new Hyphenator.fn.ElementCollection(),
	prepareElements: function (w) {
		var tmp, i = 0, elementsToProcess,
		process = function (el, hide, lang) {
			var n, i = 0, hyphenatorSettings = {};
			//get the language of the element
			if (el.lang && typeof(el.lang) === 'string') {
				hyphenatorSettings.language = el.lang.toLowerCase(); //copy attribute-lang to internal lang
			} else if (lang) {
				hyphenatorSettings.language = lang.toLowerCase(); //else get submitted lang
			} else {
				hyphenatorSettings.language = Hyphenator.fn.getLang(w, el, true); //or try to find lang in a parent
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
				//hide it
				if (hide && Hyphenator.intermediateState === 'hidden') {
					if (!!el.getAttribute('style')) {
						hyphenatorSettings.hasOwnStyle = true;
					} else {
						hyphenatorSettings.hasOwnStyle = false;					
					}
					hyphenatorSettings.isHidden = true;
					el.style.visibility = 'hidden';
				}
				if (Hyphenator.fn.supportedLanguages[lang].state === 0) {
					//load the language
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(4, lang, "language found: " + lang));
				}
				//add it to the list
				Hyphenator.fn.collectedElements.addElement(el, lang, hyphenatorSettings);
			}
			
			while (!!(n = el.childNodes[i++])) {
				if (n.nodeType === 1 && !Hyphenator.fn.dontHyphenate[n.nodeName.toLowerCase()] &&
					n.className.indexOf(Hyphenator.dontHyphenateClass) === -1 && !(n in Hyphenator.fn.collectedElements)) {
					process(n, false, lang);
				}
			}
		};
		
		if (Hyphenator.fn.isBookmarklet) {
			elementsToProcess = w.document.getElementsByTagName('body')[0];
			process(elementsToProcess, false, Hyphenator.mainLanguage[w.location.href]);
		} else {
			elementsToProcess = Hyphenator.selectorFunction(w);
			while (!!(tmp = elementsToProcess[i++])) {
				process(tmp, true, '');
			}
		}
		Hyphenator.fn.collectedElements.complete = true;
		if (Hyphenator.fn.collectedElements.runCount === Hyphenator.fn.collectedElements.elementCount) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(6, null, "Hyphenation done."));
		}
	},
	removeHyphenationFromDocument: function () {
		Hyphenator.fn.collectedElements.removeAllHyphenation();
	},
	rehyphenateDocument: function () {
		Hyphenator.fn.collectedElements.hyphenateAll();
	},
	getLang: function (w, el, fallback) {
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
			return Hyphenator.fn.getLang(w, el.parentNode, true);
		}
		if (fallback) {
			return Hyphenator.mainLanguage[w.location.href];
		}
		return null;
	},
	getMainLanguage: function (w) {
		w = w || window;
		var el = w.document.getElementsByTagName('html')[0],
			m = w.document.getElementsByTagName('meta'),
			i, text, e, ul, mainLanguage;
		if (!!Hyphenator.mainLanguage[w.location.href]) {
			return Hyphenator.mainLanguage[w.location.href];
		}
		mainLanguage = Hyphenator.fn.getLang(w, el, false);
		if (!mainLanguage) {
			for (i = 0; i < m.length; i++) {
				//<meta http-equiv = "content-language" content="xy">	
				if (!!m[i].getAttribute('http-equiv') && (m[i].getAttribute('http-equiv').toLowerCase() === 'content-language')) {
					mainLanguage = m[i].getAttribute('content').toLowerCase();
				}
				//<meta name = "DC.Language" content="xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name').toLowerCase() === 'dc.language')) {
					mainLanguage = m[i].getAttribute('content').toLowerCase();
				}			
				//<meta name = "language" content = "xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name').toLowerCase() === 'language')) {
					mainLanguage = m[i].getAttribute('content').toLowerCase();
				}
			}
		}
		//get lang for frame from enclosing document
		if (!mainLanguage && Hyphenator.doFrames && w != w.parent) {
			mainLanguage = Hyphenator.fn.getMainLanguage(w.parent);
		}
		//fallback to defaultLang if set
		if (!mainLanguage && Hyphenator.defaultLanguage !== '') {
			mainLanguage = Hyphenator.defaultLanguage;
		}
		//ask user for lang
		if (!mainLanguage) {
			text = '';
			ul = navigator.language ? navigator.language : navigator.userLanguage;
			ul = ul.substring(0, 2);
			if (Hyphenator.fn.prompterStrings.hasOwnProperty(ul)) {
				text = Hyphenator.fn.prompterStrings[ul];
			} else {
				text = Hyphenator.fn.prompterStrings.en;
			}
			text += ' (ISO 639-1)\n\n' + Hyphenator.fn.languageHint;
			mainLanguage = window.prompt(unescape(text), ul).toLowerCase();
		}
		if (!Hyphenator.fn.supportedLanguages.hasOwnProperty(mainLanguage)) {
			if (Hyphenator.fn.supportedLanguages.hasOwnProperty(mainLanguage.split('-')[0])) { //try subtag
				mainLanguage = mainLanguage.split('-')[0];
			} else {
				e = 'The language "' + mainLanguage + '" is not yet supported.';
				Hyphenator.postMessage(new Hyphenator.fn.Message(0, mainLanguage, e));
			}
		}
		if (Hyphenator.fn.supportedLanguages.hasOwnProperty(mainLanguage)) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(4, mainLanguage, "mainLanguage found: " + mainLanguage));
			return mainLanguage;
		}
	}
}));


Hyphenator.addModule(new Hyphenator.fn.EO({
	selectorFunction: function (w) {
		w = w || window;
		var tmp, el = [], i, l;
		if (document.getElementsByClassName) {
			el = w.document.getElementsByClassName(Hyphenator.hyphenateClass);
		} else {
			tmp = w.document.getElementsByTagName('*');
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

