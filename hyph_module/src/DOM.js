//Hyphenator.DOM.js
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
	collectedElements: {},
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
				} else if (!isBookmarklet) {
					Hyphenator.postMessage(new Hyphenator.fn.Message(0, lang, 'Language ' + lang + ' is not yet supported.'));
				}
			}
			if (Hyphenator.fn.supportedLanguages.hasOwnProperty(lang)) {
				if (Hyphenator.fn.supportedLanguages[lang].state === 0) {
					//load the language
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(4, lang, "language found: " + lang));
				}
				if (!Hyphenator.fn.collectedElements.hasOwnProperty(lang)) {
					Hyphenator.fn.collectedElements[lang] = [];
				}
			}
			Hyphenator.fn.Expando.setDataForElem(el, hyphenatorSettings);			
			
			Hyphenator.fn.collectedElements[lang].push(el);
			
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

	hyphenateElementsOfLang: function (lang) {
		var i;
		for (i = 0; i < Hyphenator.fn.collectedElements[lang].length; i++) {
			Hyphenator.fn.hyphenateElement(Hyphenator.fn.collectedElements[lang][i]);
		}
	},

	hyphenateElement: function (el) {
		console.log(el);
		var hyphenatorSettings = Hyphenator.fn.Expando.getDataForElem(el),
			lang = hyphenatorSettings.language, hyphenate, n, i,
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
					h = hyphen;
				}
				if (Hyphenator.orphanControl >= 2) {
					//remove hyphen points from last word
					r = part.split(' ');
					r[1] = r[1].replace(new RegExp(h, 'g'), '');
					r[1] = r[1].replace(new RegExp(zeroWidthSpace, 'g'), '');
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
				console.log(Hyphenator.fn.urlOrMailRE);
				if (!Hyphenator.doHyphenation) {
					return word;
				} else if (Hyphenator.fn.urlOrMailRE.test(word)) {
					return Hyphenator.hyphenateURL(word);
				} else {
					return Hyphenator.hyphenateWord(lang, word);
				}
			};
			/*if (Hyphenator.safeCopy && (el.tagName.toLowerCase() !== 'body')) {
				Hyphenator.fn.registerOnCopy(el);
			}*/
			i = 0;
			while (!!(n = el.childNodes[i++])) {
				if (n.nodeType === 3 && n.data.length >= Hyphenator.min) { //type 3 = #text -> hyphenate!
					n.data = n.data.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
					if (Hyphenator.orphanControl !== 1) {
						n.data = n.data.replace(/[\S]+ [\S]+$/, controlOrphans);
					}
				}
			}
		}
		if (hyphenatorSettings.isHidden && Hyphenator.intermediateState === 'hidden') {
			el.style.visibility = 'visible';
			if (!hyphenatorSettings.hasOwnStyle) {
				el.setAttribute('style', ''); // without this, removeAttribute doesn't work in Safari (thanks to molily)
				el.removeAttribute('style');
			} else {
				if (el.style.removeProperty) {
					el.style.removeProperty('visibility');
				} else if (el.style.removeAttribute) { // IE
					el.style.removeAttribute('visibility');
				}  
			}
		}
		/*if (hyphenatorSettings.isLast) {
			state = 3;
			documentCount--;
			if (documentCount > (-1000) && documentCount <= 0) {
				documentCount = (-2000);
				onHyphenationDone();
			}
		}*/
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

