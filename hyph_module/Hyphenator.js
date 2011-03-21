/** @license Hyphenator X.Y.Z - client side hyphenation for webbrowsers
 *  Copyright (C) 2010  Mathias Nater, Zürich (mathias at mnn dot ch)
 *  Project and Source hosted on http://code.google.com/p/hyphenator/
 * 
 *  This JavaScript code is free software: you can redistribute
 *  it and/or modify it under the terms of the GNU Lesser
 *  General Public License (GNU LGPL) as published by the Free Software
 *  Foundation, either version 3 of the License, or (at your option)
 *  any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS
 *  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *  As additional permission under GNU GPL version 3 section 7, you
 *  may distribute non-source (e.g., minimized or compacted) forms of
 *  that code without the copy of the GNU GPL normally required by
 *  section 4, provided you include this license notice and a URL
 *  through which recipients can access the Corresponding Source.
 */
 
/* 
 *  Comments are jsdoctoolkit formatted. See http://code.google.com/p/jsdoc-toolkit/
 */
 
/* The following comment is for JSLint: */
/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: false, regexp: true, newcap: true, immed: true, sub: true */
/*global Hyphenator: true, window: true, ActiveXObject: true, unescape: true*/
//main.js
/*jslint sub: true */
var Hyphenator = (function (window) {
	/**
	 * @constructor
	 */
	var Hyphenator = function () {
		/**
		 * @constructor
		 */
		var F = function () {
			this.addModule = Hyphenator.fn.addModule; 
		};
		F.prototype = new Hyphenator.fn.getProto();
		return new F();
	};

			
	Hyphenator.fn = {
		getProto: function () {
			this.fn = Hyphenator.fn;
		},
		/*extend: function (name, fnproto) {
			this[name] = fnproto;
		},*/
		EO: function (obj) {
			this.each = function (fn) {
				var k;
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						fn(k, obj[k]);
					}
				}
			};
		},
		addModule: function (module) {
			var that = this;
			module = new Hyphenator.fn.EO(module);
			module.each(function (k, v) {
				that[k] = v;
			});
		}
		
	};
	
	// Expose Hyphenator to the global object
	return new Hyphenator();	
}(window));
//export
window['Hyphenator'] = Hyphenator;


Hyphenator.addModule({
	run: function (config) {
		if (!!config) {
			Hyphenator.config(config);
		}
		Hyphenator.fn.prepareDocuments(window);
		//Hyphenator.log(Hyphenator);
	}
});

window['Hyphenator']['run'] = Hyphenator.run;
//Hyphenator_debug.js
/*jslint sub: true */
Hyphenator.addModule({
	log: function (msg) {
		if (window.console && window.console.log) {
			window.console.log(msg);
		} else {
			alert(msg);
		}
	}
});
window['Hyphenator']['log'] = Hyphenator.log;
//Hyphenator_quirks.js
/*jslint sub: true */
Hyphenator.fn.addModule({
	zeroWidthSpace: (function () {
		var zws, ua = window.navigator.userAgent.toLowerCase();
		zws = String.fromCharCode(8203); //Unicode zero width space
		if (ua.indexOf('msie 6') !== -1) {
			zws = ''; //IE6 doesn't support zws
		}
		if (ua.indexOf('opera') !== -1 && ua.indexOf('version/10.00') !== -1) {
			zws = ''; //opera 10 on XP doesn't support zws
		}
		return zws;
	}()),
	registerOnCopy: function (el) {
		var body = el.ownerDocument.getElementsByTagName('body')[0],
		shadow,
		selection,
		range,
		rangeShadow,
		restore,
		oncopyHandler = function (e) {
			e = e || window.event;
			var target = e.target || e.srcElement,
			currDoc = target.ownerDocument,
			body = currDoc.getElementsByTagName('body')[0],
			targetWindow = 'defaultView' in currDoc ? currDoc.defaultView : currDoc.parentWindow;
			if (target.tagName && Hyphenator.fn.dontHyphenate[target.tagName.toLowerCase()]) {
				//Safari needs this
				return;
			}
			//create a hidden shadow element
			shadow = currDoc.createElement('div');
			shadow.style.overflow = 'hidden';
			shadow.style.position = 'absolute';
			shadow.style.top = '-5000px';
			shadow.style.height = '1px';
			body.appendChild(shadow);
			if (!!window.getSelection) {
				//FF3, Webkit
				selection = targetWindow.getSelection();
				range = selection.getRangeAt(0);
				shadow.appendChild(range.cloneContents());
				(new Hyphenator.fn.Element(shadow, {})).removeHyphenation();
			//	removeHyphenationFromElement(shadow);
				selection.selectAllChildren(shadow);
				restore = function () {
					shadow.parentNode.removeChild(shadow);
					selection.addRange(range);
				};
			} else {
				// IE
				selection = targetWindow.document.selection;
				range = selection.createRange();
				shadow.innerHTML = range.htmlText;
				(new Hyphenator.fn.Element(shadow, {})).removeHyphenation();
			//	removeHyphenationFromElement(shadow);
				rangeShadow = body.createTextRange();
				rangeShadow.moveToElementText(shadow);
				rangeShadow.select();
				restore = function () {
					shadow.parentNode.removeChild(shadow);
					if (range.text !== "") {
						range.select();
					}
				};
			}
			window.setTimeout(restore, 0);
		};
		if (!body) {
			return;
		}
		el = el || body;
		if (window.addEventListener) {
			el.addEventListener("copy", oncopyHandler, false);
		} else {
			el.attachEvent("oncopy", oncopyHandler);
		}
	}
});
//Hyphenator.DOM.js
/*jslint sub: true */
/**
 * @constructor
 */
Hyphenator.fn.Element = function (element, data) {
	this.element = element;
	this.hyphenated = false;
	this.treated = false; //collected but not hyphenated (dohyphenation is off)
	this.data = data;
};

Hyphenator.fn.Element.prototype = {
	hyphenate: function () {
		var lang = this.data.language, hyphenate, n, i,
			controlOrphans = function (part) {
				var r, h = Hyphenator.fn.getEscapedHyphenChar();
				if (Hyphenator.orphancontrol >= 2) {
					//remove hyphen points from last word
					r = part.split(' ');
					r[1] = r[1].replace(new RegExp(h, 'g'), '');
					r[1] = r[1].replace(new RegExp(Hyphenator.zeroWidthSpace, 'g'), '');
					r = r.join(' ');
				}
				if (Hyphenator.orphancontrol === 3) {
					//replace spaces by non breaking spaces
					r = r.replace(/[ ]+/g, String.fromCharCode(160));
				}
				return r;
			};
		if (!this.hyphenated && Hyphenator.dohyphenation) {
			if (Hyphenator.languages.hasOwnProperty(lang)) {
				hyphenate = function (word) {
					//console.log(word);
					if (Hyphenator.fn.urlOrMailRE.test(word)) {
						return Hyphenator.hyphenateURL(word);
					} else {
						return Hyphenator.hyphenateWord(lang, word);
					}
				};
				if (Hyphenator.safecopy && (this.element.tagName.toLowerCase() !== 'body')) {
					Hyphenator.fn.registerOnCopy(this.element);
				}
				i = 0;
				while (!!(n = this.element.childNodes[i++])) {
					if (n.nodeType === 3 && n.data.length >= Hyphenator.minwordlength) { //type 3 = #text -> hyphenate!
						n.data = n.data.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
						if (Hyphenator.orphancontrol !== 1) {
							n.data = n.data.replace(/[\S]+ [\S]+$/, controlOrphans);
						}
					}
				}
			}
			if (this.data.isHidden && Hyphenator.intermediatestate === 'hidden') {
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
		} else {
			this.treated = true;
		}
	},
	removeHyphenation: function () {
		var h = Hyphenator.fn.getEscapedHyphenChar(), i = 0, n;
		while (!!(n = this.element.childNodes[i++])) {
			if (n.nodeType === 3) {
				n.data = n.data.replace(new RegExp(h, 'g'), '');
				n.data = n.data.replace(new RegExp(Hyphenator.zeroWidthSpace, 'g'), '');
			}
		}
		this.hyphenated = false;
	}
};
/**
 * @constructor
 */
Hyphenator.fn.LanguageElementsCollection = function (lang) {
	this.language = lang;
	this.elementList = [];
};

Hyphenator.fn.LanguageElementsCollection.prototype = {
	add: function (el, data) {
		this.elementList.push(new Hyphenator.fn.Element(el, data));
	},
	each: function (fn) {
		var tmp = new Hyphenator.fn.EO(this.elementList);
		tmp.each(fn);
	},
	hyphenateElements: function () {
		this.each(function (el, content) {
			content.hyphenate();
		});
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(5, this.language, "Some elements have been hyphenated: " + this.language));
	},
	removeHyphenationFromElements: function () {
		this.each(function (el, content) {
			content.removeHyphenation();
		});
	}
};
/**
 * @constructor
 */
Hyphenator.fn.ElementCollection = function () {
	this.list = {};
};

Hyphenator.fn.ElementCollection.prototype = {
	addElement: function (el, lang, data) {
		if (!this.list.hasOwnProperty(lang)) {
			this.list[lang] = new Hyphenator.fn.LanguageElementsCollection(lang);
		}
		this.list[lang].add(el, data);
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

/**
 * @constructor
 */
Hyphenator.fn.Document = function (w, p) {
	this.w = w || window;
	this.parent = p || null;
	this.href = w.location.href;
	this.state = 1; //(0: Error, 1: init, 2: ready, 3:elements collected, 4: hyphenated, 5: frameset)
	this.mainLanguage = null;
	this.elementCollection = new Hyphenator.fn.ElementCollection();
};

Hyphenator.fn.Document.prototype = {
	setMainLanguage: function () {
		var el = this.w.document.getElementsByTagName('html')[0],
			m = this.w.document.getElementsByTagName('meta'),
			i, text, e, ul, resp;
		if (!!this.mainLanguage) {
			return;
		}
		this.mainLanguage = Hyphenator.fn.getLang(this.w, el, false);
		if (!this.mainLanguage) {
			for (i = 0; i < m.length; i++) {
				//<meta http-equiv = "content-language" content="xy">	
				if (!!m[i].getAttribute('http-equiv') && (m[i].getAttribute('http-equiv').toLowerCase() === 'content-language')) {
					this.mainLanguage = m[i].getAttribute('content').toLowerCase();
				}
				//<meta name = "DC.Language" content="xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name').toLowerCase() === 'dc.language')) {
					this.mainLanguage = m[i].getAttribute('content').toLowerCase();
				}			
				//<meta name = "language" content = "xy">
				if (!!m[i].getAttribute('name') && (m[i].getAttribute('name').toLowerCase() === 'language')) {
					this.mainLanguage = m[i].getAttribute('content').toLowerCase();
				}
			}
		}
		//get lang for frame from enclosing document
		if (!this.mainLanguage && this.parent !== null) {
			this.mainLanguage = Hyphenator.fn.collectedDocuments.list[this.parent.location.href].mainLanguage;
		}
		//fallback to defaultLang if set
		if (!this.mainLanguage && Hyphenator.defaultlanguage !== '') {
			this.mainLanguage = Hyphenator.defaultlanguage;
		}
		//ask user for lang
		if (!this.mainLanguage) {
			text = '';
			ul = navigator.language ? navigator.language : navigator.userLanguage;
			ul = ul.substring(0, 2);
			if (Hyphenator.fn.prompterStrings.hasOwnProperty(ul)) {
				text = Hyphenator.fn.prompterStrings[ul];
			} else {
				text = Hyphenator.fn.prompterStrings.en;
			}
			text += ' (ISO 639-1)\n\n' + Hyphenator.fn.languageHint;
			resp = window.prompt(unescape(text), ul);
			if (resp !== null) {
				this.mainLanguage = resp.toLowerCase();
			} else {
				Hyphenator.postMessage(new Hyphenator.fn.Message(0, this.mainLanguage, "Language unknown. Can't hyphenate."));	
			}
		}
		if (!Hyphenator.fn.supportedLanguages.hasOwnProperty(this.mainLanguage) && !!this.mainLanguage) {
			if (Hyphenator.fn.supportedLanguages.hasOwnProperty(this.mainLanguage.split('-')[0])) { //try subtag
				this.mainLanguage = this.mainLanguage.split('-')[0];
			} else {
				e = 'The language "' + this.mainLanguage + '" is not yet supported.';
				Hyphenator.postMessage(new Hyphenator.fn.Message(0, this.mainLanguage, e));
			}
		}
		if (Hyphenator.fn.supportedLanguages.hasOwnProperty(this.mainLanguage)) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(4, this.mainLanguage, "mainLanguage found: " + this.mainLanguage));
		}
	},
	removeHyphenation: function () {
		this.elementCollection.removeAllHyphenation();
	},
	hyphenate: function () {
		this.elementCollection.hyphenateAll();
	},
	prepareElements: function () {
		var tmp, i = 0, elementsToProcess, that = this,
		process = function (el, hide, lang) {
			var n, i = 0, hyphenatorSettings = {};
			//get the language of the element
			if (el.lang && typeof(el.lang) === 'string') {
				hyphenatorSettings.language = el.lang.toLowerCase(); //copy attribute-lang to internal lang
			} else if (lang) {
				hyphenatorSettings.language = lang.toLowerCase(); //else get submitted lang
			} else {
				hyphenatorSettings.language = Hyphenator.fn.getLang(that.w, el, true); //or try to find lang in a parent
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
				if (Hyphenator.dohyphenation && hide && Hyphenator.intermediatestate === 'hidden') {
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
				that.elementCollection.addElement(el, lang, hyphenatorSettings);
			}
			
			while (!!(n = el.childNodes[i++])) {
				if (n.nodeType === 1 && !Hyphenator.fn.dontHyphenate[n.nodeName.toLowerCase()] &&
					n.className.indexOf(Hyphenator.donthyphenateclassname) === -1 && !(n in that.elementCollection)) {
					process(n, false, lang);
				}
			}
		};
		
		if (Hyphenator.fn.isBookmarklet) {
			elementsToProcess = this.w.document.getElementsByTagName('body')[0];
			process(elementsToProcess, false, this.mainLanguage);
		} else {
			elementsToProcess = Hyphenator.selectorfunction(this.w);
			while (!!(tmp = elementsToProcess[i++])) {
				process(tmp, true, '');
			}
		}
		this.updateDocumentState(3);
	},
	updateDocumentState: function (state) {
		this.state = state;
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(7, {'id': this.w, 'state': this.state}, "Document state updated (" + this.state + "): " + this.href));
	},
	checkIfAllDone: function () {
		var allDone = true;
		if (this.state === 3) {
			this.elementCollection.each(function (lang, elOfLang) {
				elOfLang.each(function (k, data) {
					allDone = allDone && (data.hyphenated || data.treated);
				});
			});
		} else {
			//elements not yet collected
			allDone = false;
			return false;
		}
		if (allDone) {
			this.updateDocumentState(4);
			return true;
		}
	}
};

/**
 * @constructor
 */
Hyphenator.fn.DocumentCollection = function () {
	this.list = {}; //href: Hyphenator.fn.Document
};

Hyphenator.fn.DocumentCollection.prototype = {
	each: function (fn) {
		var tmp = new Hyphenator.fn.EO(this.list);
		tmp.each(fn);
	},
	addDocument: function (w, p) {
		var href = w.location.href;
		if (!this.list.hasOwnProperty(href)) {
			//add document
			this.list[href] = new Hyphenator.fn.Document(w, p);
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(7, {'id': w, 'state': 1}, "Document added: " + href));
		} else {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(7, {'id': w, 'state': 0}, "Error: Document already added: " + href));
		}
	},
	allDone: function () {
		var allDone = true;
		this.each(function (href, docdata) {
			if (docdata.state === 4 || docdata.state === 5) {
				allDone = allDone && true;
			} else {
				allDone = allDone && docdata.checkIfAllDone();
			}
		});
		if (allDone) {
			
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(42, null, "Hyphenation done"));
		}
	}
};








Hyphenator.fn.addModule({
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
			if (w.document.getElementsByTagName('frameset').length === 0) { //this is no frameset -> hyphenate
				if (Hyphenator.displaytogglebox) {
					Hyphenator.togglebox(w);
				}
				Hyphenator.fn.collectedDocuments.list[w.location.href].updateDocumentState(2); //ready
			} else {
				Hyphenator.fn.collectedDocuments.list[w.location.href].updateDocumentState(5); //frameset
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
		processFrames = function (pw) {
			var fl = pw.frames.length,
			execOnAccessible = function (fn) {
				var i, haveAccess;
				for (i = 0; i < fl; i++) {
					haveAccess = undefined;
					//try catch isn't enough for webkit
					try {
						//opera throws only on document.toString-access
						haveAccess = pw.frames[i].document.toString();
					} catch (e) {
						haveAccess = undefined;
					}
					if (!!haveAccess) {
						fn(pw.frames[i], pw);
					}
				}				
			};
			if (fl > 0) {
				execOnAccessible(function (fr, par) {
					Hyphenator.fn.collectedDocuments.addDocument(fr, par);
				});
				execOnAccessible(function (fr, par) {
					Hyphenator.fn.collectedDocuments.list[fr.location.href].updateDocumentState(2); //ready
				});
			}
		},
		doOnLoad = function () {
			if (document.addEventListener) {
				w.removeEventListener("load", doOnLoad, false);
			} else if (document.attachEvent) {
				w.detachEvent("onload", doOnLoad);
			}
			if (Hyphenator.fn.collectedDocuments.list[w.location.href].state < 2) {
				process(w);
			}
			//go down the frame-tree
			processFrames(w);
		};
		
		//check for re-run:
		if (Hyphenator.fn.collectedDocuments.list.hasOwnProperty(w.location.href) && (Hyphenator.fn.collectedDocuments.list[w.location.href].state === 4)) {
			Hyphenator.fn.collectedDocuments.list[w.location.href].state = 1;
			process(w);
			return;
		}

		Hyphenator.fn.collectedDocuments.addDocument(w, null);		
		
		if (Hyphenator.fn.isBookmarklet || (Hyphenator.fn.collectedDocuments.list[w.location.href].state === 2)) {
			process(w);
			processFrames(w);
			return;
		}
				
		// Cleanup functions for the document ready method
		if (document.addEventListener) {
			DOMContentLoaded = function () {
				w.document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
				if (w.frames.length === 0) {
					process(w);					
				} // else: wait for onLoad
			};
		} else if (document.attachEvent) {
			DOMContentLoaded = function () {
				if (w.document.readyState === "complete") {
					w.document.detachEvent("onreadystatechange", DOMContentLoaded);
					if (w.frames.length === 0) {
						process(w);					
					} // else: wait for onLoad
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
			return Hyphenator.fn.collectedDocuments.list[w.location.href].mainLanguage;
		}
		return null;
	}
});


Hyphenator.addModule({
	selectorfunction: function (w) {
		w = w || window;
		var tmp, el = [], i, l;
		if (document.getElementsByClassName) {
			el = w.document.getElementsByClassName(Hyphenator.classname);
		} else {
			tmp = w.document.getElementsByTagName('*');
			l = tmp.length;
			for (i = 0; i < l; i++)
			{
				if (tmp[i].className.indexOf(Hyphenator.classname) !== -1 && tmp[i].className.indexOf(Hyphenator.donthyphenateclassname) === -1) {
					el.push(tmp[i]);
				}
			}
		}
		return el;
	}
});
window['Hyphenator']['selectorfunction'] = Hyphenator.selectorfunction;
//Hyphenator_constants.js
Hyphenator.fn.addModule({
	url: '(\\w*:\/\/)?((\\w*:)?(\\w*)@)?((([\\d]{1,3}\\.){3}([\\d]{1,3}))|((www\\.|[a-zA-Z]\\.)?[a-zA-Z0-9\\-\\.]+\\.([a-z]{2,4})))(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*',
	//      protocoll     usr     pwd                    ip               or                          host                 tld        port               path
	mail: '[\\w-\\.]+@[\\w\\.]+',
	urlOrMailRE: new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')', 'i'),
	isBookmarklet: (function () {
		var loc = null, re = false, jsArray = document.getElementsByTagName('script'), i, l;
		for (i = 0, l = jsArray.length; i < l; i++) {
			if (!!jsArray[i].getAttribute('src')) {
				loc = jsArray[i].getAttribute('src');
			}
			if (!loc) {
				continue;
			} else if ((loc.indexOf('Hyphenator') !== -1) && loc.indexOf('bm=true') !== -1) {
				re = true;
			}
		}
		return re;
	}()),
	dontHyphenate: {'script': true, 'code': true, 'pre': true, 'img': true, 'br': true, 'samp': true, 'kbd': true, 'var': true, 'abbr': true, 'acronym': true, 'sub': true, 'sup': true, 'button': true, 'option': true, 'label': true, 'textarea': true, 'input': true}
});
Hyphenator.fn.addModule({
	urlOrMailRE: new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')', 'i'),
	getEscapedHyphenChar: function () {
		var h;
		switch (Hyphenator.hyphenchar) {
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
			h = Hyphenator.hyphenchar;
		}
		return h;
	}
});
//Hyphenator_messages.js
/*jslint sub: true */
/*
Message types:
0: Error
1: Updated settings
2: file loaded
3: pattern available
*/
/**
 * @constructor
 */
Hyphenator.fn.Message = function (type, data, text) {
	this.type = type || 0;
	this.data = data || null;
	this.text = text || '';
	this.toString = function () {
		return "Message:\n\ttype: " + type + ":\n\tdata: " + window.JSON.stringify(data) + ":\n\ttext: " + text; 
	};
};

Hyphenator.fn.addModule({
	postMessage: function (msg) {
		if (msg.constructor !== Hyphenator.fn.Message) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg, "Received non-conforming message"));
		} else {
			Hyphenator.fn.onmessage(msg);
		}
	},
	onmessage: function (msg) {
		//Hyphenator.log(msg.text);
		switch (msg.type) {
		case 0: //Error
			Hyphenator.postMessage(msg);
			break;
		case 1: //settings related
			//do reflow if necessary
			//Hyphenator.postMessage(msg);
			break;
		case 2: //file load related
			//update supportedLang
			Hyphenator.fn.supportedLanguages[msg.data.id].state = msg.data.readyState;
			if (msg.data.state === 42) {
				//error
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg.data.url, "failed to load file: " + msg.data.url));
			}
			if (msg.data.state === 4) {
				//insert script
				Hyphenator.fn.insertScript(msg.data.content);
				Hyphenator.fn.supportedLanguages[msg.data.id].state = 5;
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data.id, 'state': 5}, "File added: " + msg.data.url));
			}
			break;
		case 3: //pattern related
			switch (msg.data.state) {
			case 5: //patterns loaded
				Hyphenator.fn.prepareLanguagesObj(msg.data.id);
				break;
			case 6: //patterns prepared
				Hyphenator.fn.supportedLanguages[msg.data.id].state = 7;
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data.id, 'state': 7}, "Pattern ready: " + msg.data.id));
				(new Hyphenator.fn.Storage()).storePatterns(msg.data.id, Hyphenator.languages[msg.data.id]);
				break;
			case 7: //patterns ready
				Hyphenator.fn.collectedDocuments.each(function (href, data) {
					if (data.elementCollection.list.hasOwnProperty(msg.data.id)) {
						data.elementCollection.list[msg.data.id].hyphenateElements();
					}
				});
				break;
			default:
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, null, "Error"));
			}
			break;
		case 4: //language detected
			if (Hyphenator.languages.hasOwnProperty(msg.data) && (Hyphenator.fn.supportedLanguages[msg.data].state < 5)) {
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data, 'state': 5}, "File added: " + msg.data));
			} else {
				//load the language
				if ((new Hyphenator.fn.Storage()).inStorage(msg.data)) {
					//from storage?
					(new Hyphenator.fn.Storage()).restorePatterns(msg.data);
					Hyphenator.fn.supportedLanguages[msg.data].state = 7;
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data, 'state': 7}, "Pattern restored: " + msg.data));
				} else if (Hyphenator.fn.supportedLanguages[msg.data].state === 0 && Hyphenator.remoteloading) {
					//remotely?
					Hyphenator.fn.supportedLanguages[msg.data].state = 1;
					Hyphenator.loadLanguage(msg.data);
				} else if (!Hyphenator.remoteloading) {
					//will not load!
					Hyphenator.fn.supportedLanguages[msg.data].state = 8;
				}
			}
			break;
		case 5: //some elements have been hyphenated -> check if all done
			Hyphenator.fn.collectedDocuments.allDone();
			break;
		case 6: //storage
			//console.log('storage: ', msg.data);
			break;
		case 7: //document updated
			switch (msg.data.state) {
			case 0: //error
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg.data.id, "Error in Document."));
				break;
			case 1: //init
			
				break;
			case 2: //ready
				//handle each document in a single "thread"
				window.setTimeout(function () {
					Hyphenator.fn.collectedDocuments.list[msg.data.id.location.href].setMainLanguage();
					Hyphenator.fn.collectedDocuments.list[msg.data.id.location.href].prepareElements();
				}, 0);
				break;
			case 3: //elements collected
				Hyphenator.fn.collectedDocuments.list[msg.data.id.location.href].elementCollection.each(function (lang, data) {
					if (Hyphenator.fn.supportedLanguages[lang].state === 7) {
						data.hyphenateElements();
					} else if (Hyphenator.fn.supportedLanguages[lang].state === 8) { //language will not load -> delete Elements of that lang
						delete Hyphenator.fn.collectedDocuments.list[msg.data.id.location.href].elementCollection.list[lang];
						Hyphenator.fn.collectedDocuments.allDone();
					}//else wait for language to be loaded
				});
				break;
			case 4: //hyphenated

				break;
			case 5: //frameset

				break;
			}
			break;
		case 42: //runtime message: hyphenation done! Yupee!
			Hyphenator.onhyphenationdonecallback();
			break;
		default:
			Hyphenator.postMessage(new Hyphenator.fn.Message(0, msg.toString(), 'Internally received unknown message.'));
		}
	}
});


Hyphenator.addModule({
	postMessage: function (msg) {
		if (msg.constructor !== Hyphenator.fn.Message) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg, "Received non-conforming message"));
		} else {
			Hyphenator.onmessage(msg);
		}
	},
	onmessage: function (msg) {
		/*
		to be overwritten by
		Hyphenator.onmessage = function (msg) {};
		*/
		Hyphenator.onerrorhandler(msg);
	}
});
window['Hyphenator']['postMessage'] = Hyphenator.postMessage;
window['Hyphenator']['onmessage'] = Hyphenator.onmessage;
//Hyphenator_storage.js
/**
 * @constructor
 */
Hyphenator.fn.Storage = function () {
	this.storage = (function () {
		try {
			if (Hyphenator.storagetype !== 'none' &&
				typeof(window.localStorage) !== 'undefined' &&
				typeof(window.sessionStorage) !== 'undefined' &&
				typeof(window.JSON.stringify) !== 'undefined' &&
				typeof(window.JSON.parse) !== 'undefined') {
				switch (Hyphenator.storagetype) {
				case 'session':
					return window.sessionStorage;
				case 'local':
					return window.localStorage;
				default:
					return null;
				}
			}
		} catch (f) {
			//FF throws an error if DOM.storage.enabled is set to false
		}
		return null;
	}());
};

Hyphenator.fn.Storage.prototype = {
	storagePrefix: "Hyphenator_",
	inStorage: function (id) {
		if (this.storage === null || !this.storage.getItem(this.storagePrefix + id)) {
			return false;
		} else {
			return true;
		}
	},
	storeSettings: function (settings) {
		if (this.storage !== null) {
			try {
				//console.log('store: ', settings);
				this.storage.setItem(this.storagePrefix + "config", window.JSON.stringify(settings));
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(6, settings, "Settings stored."));
			} catch (e) {
				//onError(e);
			}
		}	
	},

	restoreSettings: function () {
		if (this.storage !== null && this.inStorage('config')) {
			var storedSettings =  window.JSON.parse(this.storage.getItem(this.storagePrefix + "config"));
			storedSettings.STOPSTORAGE = true;
			Hyphenator.config(storedSettings);
		}
	},
	storePatterns: function (lang, langObj) {
		var tmp;
		if (this.storage !== null) {
			try {
				this.storage.setItem(this.storagePrefix + lang, window.JSON.stringify(langObj));
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(6, lang, "Lang " + lang + " stored."));
			} catch (e) {
				//onError(e);
			}
		}
	},
	storeAllPatterns: function () {
		var lo = new Hyphenator.fn.EO(Hyphenator.languages), that = this;
		lo.each(function (lang, langObj) {
			that.storePatterns(lang, langObj);
		});
	},
	restorePatterns: function (lang) {
		var tmp1, lo = window.JSON.parse(this.storage.getItem(this.storagePrefix + lang));
		if (Hyphenator.fn.exceptions.hasOwnProperty('global')) {
			tmp1 = new Hyphenator.fn.EO(Hyphenator.fn.convertExceptionsToObject(Hyphenator.fn.exceptions.global));
			tmp1.each(function (word, exception) {
				lo.exceptions[word] = exception;
			});
		}
		//Replace exceptions since they may have been changed:
		if (Hyphenator.fn.exceptions.hasOwnProperty(lang)) {
			tmp1 = new Hyphenator.fn.EO(Hyphenator.fn.convertExceptionsToObject(Hyphenator.fn.exceptions[lang]));
			tmp1.each(function (word, exception) {
				lo.exceptions[word] = exception;
			});
		}
		delete Hyphenator.fn.exceptions[lang];
		lo.cache = {};
		//Replace genRegExp since it may have been changed:
		tmp1 = '[\\w' + lo.specialChars + '@' + String.fromCharCode(173) + String.fromCharCode(8204) + '-]{' + Hyphenator.minwordlength + ',}';
		lo.genRegExp = new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')|(' + tmp1 + ')', 'gi');
		Hyphenator.languages[lang] = lo;
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(6, lang, "Lang " + lang + " retrieved from storage."));
	}
};
//Hyphenator_togglebox.js
/*jslint sub: true */
Hyphenator.fn.addModule({
	removeHyphenationFromDocuments: function () {
		Hyphenator.fn.collectedDocuments.each(function (href, data) {
			data.removeHyphenation();
		});
	},
	hyphenateDocuments: function () {
		Hyphenator.fn.collectedDocuments.each(function (href, data) {
			data.hyphenate();
		});
	}
});

Hyphenator.addModule({
	togglebox: function (w) {
		w = w || window;
		var  myBox, bdy, myIdAttribute, myTextNode, myClassAttribute,
		text = (Hyphenator.dohyphenation ? 'Hy-phen-a-tion' : 'Hyphenation');
		if (!!(myBox = w.document.getElementById('HyphenatorToggleBox'))) {
			myBox.firstChild.data = text;
		} else {
			bdy = w.document.getElementsByTagName('body')[0];
			myBox = Hyphenator.fn.createElem('div', w);
			myIdAttribute = w.document.createAttribute('id');
			myIdAttribute.nodeValue = 'HyphenatorToggleBox';
			myClassAttribute = w.document.createAttribute('class');
			myClassAttribute.nodeValue = Hyphenator.donthyphenateclassname;
			myTextNode = w.document.createTextNode(text);
			myBox.appendChild(myTextNode);
			myBox.setAttributeNode(myIdAttribute);
			myBox.setAttributeNode(myClassAttribute);
			myBox.onclick =  function () {
				Hyphenator.toggleHyphenation(w);
			};
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
	}
});
window['Hyphenator']['togglebox'] = Hyphenator.togglebox;

Hyphenator.addModule({
	toggleHyphenation: function (w) {
		if (Hyphenator.dohyphenation) {
			Hyphenator.config({
				dohyphenation: false
			});
			Hyphenator.fn.removeHyphenationFromDocuments();
			Hyphenator.togglebox(w);
		} else {
			Hyphenator.config({
				dohyphenation: true
			});
			Hyphenator.fn.hyphenateDocuments();
			Hyphenator.togglebox(w);
		}
	}
});
window['Hyphenator']['toggleHyphenation'] = Hyphenator.toggleHyphenation;

//begin Hyphenator_config.js
/*jslint sub: true */
/**
 * @constructor
 */
Hyphenator.fn.Setting = function (type, assert) {
	this.defaultValue = null;
	this.currentValue = null;
	this.type = type;
	this.assert = assert;
};

Hyphenator.fn.Setting.prototype = {
	setDefaultValue: function (val) {
		if (typeof val === this.type && this.assert.test(val)) {
			this.currentValue = this.defaultValue = val;
		} else {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, val, "default setting '" + val + "' doesn't fit (" + this.type + "/" + this.assert + ")"));
		}

	},
	setCurrValue: function (val) {
		if (typeof val === this.type && this.assert.test(val.toString())) {
			this.currentValue = val;
			return true;
		} else {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, val, "setting '" + val + "' doesn't fit (" + this.assert + ")"));
			return false;
		}
	}
};

/**
 * @constructor
 */
Hyphenator.fn.Settings = function () {
	this.data = {};
	this.fields = {};
};

Hyphenator.fn.Settings.prototype = {
	expose: function (settings) {
		var tmp = {}, data, i, that = this;
		if (typeof settings === 'string') {
			if (settings === '*') {
				data = new Hyphenator.fn.EO(this.data);
				data.each(function (iname, v) {
					tmp[iname] = that.data[iname].currentValue;
				});
			} else {
				tmp[this.fields[settings]] = this.data[this.fields[settings]].currentValue;
			}
		} else if (typeof settings === 'object') {
			for (i = 0; i < settings.length; i++) {
				tmp[this.fields[settings[i]]] = this.data[this.fields[settings[i]]].currentValue;
			}
		}
		Hyphenator.addModule(tmp);
		//Hyphenator.log(Hyphenator);
	},
	add: function (obj) {
		var that = this;
		obj = new Hyphenator.fn.EO(obj);
		obj.each(function (iname, v) {
			//[0=>eName, 1=>default ,2=>type, 3=>assert]
			that.data[iname] = new Hyphenator.fn.Setting(v[2], new RegExp(v[3]));
			that.data[iname].setDefaultValue(v[1]);
			that.fields[v[0]] = iname;
		});
	},
	change: function (ename, value) {
		return (this.data[this.fields[ename]].setCurrValue(value));
	},
	exportConfigObj: function () {
		var data = new Hyphenator.fn.EO(this.data), tmp = {};
		data.each(function (k, v) {
			tmp[k] = v.currentValue;
		});
		return tmp;
	}
};

Hyphenator.fn.addModule({
	settings: new Hyphenator.fn.Settings()
});

Hyphenator.addModule({
	config: function (obj) {
		var changes = [], stopStorage = false;

		if (obj.hasOwnProperty('STOPSTORAGE')) {
			stopStorage = true;
			delete obj.STOPSTORAGE;
		} else if (obj.hasOwnProperty('persistentconfig') && 
			obj.persistentconfig === true &&
			obj.hasOwnProperty('storagetype') &&
			obj.storagetype !== '') {
			Hyphenator.config({
				persistentconfig: true,
				storagetype: obj.storagetype,
				STOPSTORAGE: true
			});
			(new Hyphenator.fn.Storage()).restoreSettings();
		}		
		obj = new Hyphenator.fn.EO(obj);
		obj.each(function (ename, value) {
			if (Hyphenator.fn.settings.fields.hasOwnProperty(ename)) {
				if (Hyphenator.fn.settings.change(ename, value)) {
					changes.push(ename);
				}
			} else {
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, ename, "Error: configuration option '" + ename + "' doesn't exist."));
			}

		});

		if (changes.length > 0) {
			Hyphenator.fn.settings.expose(changes);
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(1, changes, "settings changed."));
		}
		if (Hyphenator.persistentconfig && !stopStorage) {
			(new Hyphenator.fn.Storage()).storeSettings(Hyphenator.fn.settings.exportConfigObj());
		}
	},
	getSetting: function (name) {
		return Hyphenator.fn.settings.data[name].currentValue;	
	},
	onhyphenationdonecallback: function () {},
	onerrorhandler: function (e) {
		window.alert(e.text);
	}
});
window['Hyphenator']['config'] = Hyphenator.config;
window['Hyphenator']['onhyphenationdonecallback'] = Hyphenator.onhyphenationdonecallback;
window['Hyphenator']['onerrorhandler'] = Hyphenator.onerrorhandler;

Hyphenator.fn.settings.add({
	//iname: [ename, default, type, assert]
	classname: ['classname', 'hyphenate', 'string', '^[a-zA-Z_]+[a-zA-Z0-9_]+$'],
	donthyphenateclassname: ['donthyphenateclassname', 'donthyphenate', 'string', '^[a-zA-Z_]+[a-zA-Z0-9_]+$'],
	minwordlength: ['minwordlength', 6, 'number', '\\d+'],
	hyphenchar: ['hyphenchar', String.fromCharCode(173), 'string', '.'],
	urlhyphenchar: ['urlhyphenchar', Hyphenator.fn.zeroWidthSpace, 'string', '.'],
	displaytogglebox: ['displaytogglebox', false, 'boolean', 'true|false'],
	remoteloading: ['remoteloading', true, 'boolean', 'true|false'],
	enablecache: ['enablecache', true, 'boolean', 'true|false'],
	enablereducedpatternset: ['enablereducedpatternset', false, 'boolean', 'true|false'],
	intermediatestate: ['intermediatestate', 'hidden', 'string', 'hidden|visible|progressive'],
	safecopy: ['safecopy', true, 'boolean', 'true|false'],
	doframes: ['doframes', false, 'boolean', 'true|false'],
	storagetype: ['storagetype', 'none', 'string', 'none|local|session'],
	orphancontrol: ['orphancontrol', 1, 'number', '1|2|3'],
	dohyphenation: ['dohyphenation', true, 'boolean', 'true|false'],
	persistentconfig: ['persistentconfig', false, 'boolean', 'true|false'],
	defaultlanguage: ['defaultlanguage', '', 'string', '.*'],
	togglebox: ['togglebox', Hyphenator.togglebox, 'function', '.'],
	selectorfunction: ['selectorfunction', Hyphenator.selectorfunction, 'function', '.'],
	onhyphenationdonecallback: ['onhyphenationdonecallback', Hyphenator.onhyphenationdonecallback, 'function', '.'],
	onerrorhandler: ['onerrorhandler', Hyphenator.onerrorhandler, 'function', '.']
});
Hyphenator.fn.settings.expose('*');


//end Hyphenator_config.js
//begin Hyphenator_languages.js
/*jslint sub: true */
Hyphenator.fn.addModule({
	supportedLanguages: (function () {
		var tmp = new Hyphenator.fn.EO({
			'be': 'be.js',
			'cs': 'cs.js',
			'da': 'da.js',
			'bn': 'bn.js',
			'de': 'de.js',
			'el': 'el-monoton.js',
			'el-monoton': 'el-monoton.js',
			'el-polyton': 'el-polyton.js',
			'en': 'en-us.js',
			'en-gb': 'en-gb.js',
			'en-us': 'en-us.js',
			'es': 'es.js',
			'fi': 'fi.js',
			'fr': 'fr.js',
			'grc': 'grc.js',
			'gu': 'gu.js',
			'hi': 'hi.js',
			'hu': 'hu.js',
			'hy': 'hy.js',
			'it': 'it.js',
			'kn': 'kn.js',
			'la': 'la.js',
			'lt': 'lt.js',
			'lv': 'lv.js',
			'ml': 'ml.js',
			'no': 'no-nb.js',
			'no-nb': 'no-nb.js',
			'nl': 'nl.js',
			'or': 'or.js',
			'pa': 'pa.js',
			'pl': 'pl.js',
			'pt': 'pt.js',
			'ru': 'ru.js',
			'sl': 'sl.js',
			'sv': 'sv.js',
			'ta': 'ta.js',
			'te': 'te.js',
			'tr': 'tr.js',
			'uk': 'uk.js'
		}), r = {};
		tmp.each(function (k, v) {
			r[k] = {'file': v, 'state': 0};
		});
		return r;
	}()),
	convertPatterns: function (lang) {
		var tmp = {}, patterns = new Hyphenator.fn.EO(Hyphenator.languages[lang].patterns);
		patterns.each(function (plen, pats) {
			var anfang, ende, pat, key;
			plen = parseInt(plen, 10);
			anfang = 0;
			ende = plen;
			while (!!(pat = pats.substring(anfang, ende))) {
				key = pat.replace(/\d/g, '');
				tmp[key] = pat;
				anfang = ende;
				ende += plen;
			}
		});
		Hyphenator.languages[lang].patterns = tmp;
		Hyphenator.languages[lang].patternsConverted = true;
	},
	convertExceptionsToObject: function (exc) {
		var w = exc.split(', '),
			r = {},
			i, l, key;
		for (i = 0, l = w.length; i < l; i++) {
			key = w[i].replace(/-/g, '');
			if (!r.hasOwnProperty(key)) {
				r[key] = w[i];
			}
		}
		return r;
	},
	prepareLanguagesObj: function (lang) {
		Hyphenator.fn.supportedLanguages[lang].state = 6;
		var lo = Hyphenator.languages[lang], wrd;
		if (Hyphenator.enablecache) {
			lo.cache = {};
			//Export
			//lo['cache'] = lo.cache;
		}
		if (Hyphenator.enablereducedpatternset) {
			lo.redPatSet = {};
		}
		//add exceptions from the pattern file to the local 'exceptions'-obj
		if (lo.hasOwnProperty('exceptions')) {
			Hyphenator.addExceptions(lang, lo.exceptions);
			delete lo.exceptions;
		}
		//copy global exceptions to the language specific exceptions
		if (Hyphenator.fn.exceptions.hasOwnProperty('global')) {
			if (Hyphenator.fn.exceptions.hasOwnProperty(lang)) {
				Hyphenator.fn.exceptions[lang] += ', ' + Hyphenator.fn.exceptions.global;
			} else {
				Hyphenator.fn.exceptions[lang] = Hyphenator.fn.exceptions.global;
			}
		}
		//move exceptions from the the local 'exceptions'-obj to the 'language'-object
		if (Hyphenator.fn.exceptions.hasOwnProperty(lang)) {
			lo.exceptions = Hyphenator.fn.convertExceptionsToObject(Hyphenator.fn.exceptions[lang]);
			delete Hyphenator.fn.exceptions[lang];
		} else {
			lo.exceptions = {};
		}
		Hyphenator.fn.convertPatterns(lang);
		wrd = '[\\w' + lo.specialChars + '@' + String.fromCharCode(173) + String.fromCharCode(8204) + '-]{' + Hyphenator.minwordlength + ',}';
		lo.genRegExp = new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')|(' + wrd + ')', 'gi');
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': lang, state: 6}, "Pattern object prepared: " + lang));
	},
	exceptions: {}
});

Hyphenator.fn.addModule({
	languageHint: (function () {
		var k, r = '';
		for (k in Hyphenator.fn.supportedLanguages) {
			if (Hyphenator.fn.supportedLanguages.hasOwnProperty(k)) {
				r += k + ', ';
			}
		}
		r = r.substring(0, r.length - 2);
		return r;
	}())
});

Hyphenator.addModule({
	mainLanguage: {},
	languages: {},
	loadLanguage: function (lang) {
		if (Hyphenator.fn.supportedLanguages[lang].state < 2) {
			Hyphenator.fn.load(lang, Hyphenator.fn.basePath + 'patterns/' + Hyphenator.fn.supportedLanguages[lang].file);
		}
	},
	addExceptions: function (lang, words) {
		if (lang === '') {
			lang = 'global';
		}
		if (Hyphenator.fn.exceptions.hasOwnProperty(lang)) {
			Hyphenator.fn.exceptions[lang] += ", " + words;
		} else {
			Hyphenator.fn.exceptions[lang] = words;
		}
	}
});
window['Hyphenator']['mainLanguage'] = Hyphenator.mainLanguage;
window['Hyphenator']['languages'] = Hyphenator.languages;
window['Hyphenator']['loadLanguage'] = Hyphenator.loadLanguage;
window['Hyphenator']['addExceptions'] = Hyphenator.addExceptions;
//begin Hyphenator_loader.js
Hyphenator.fn.addModule({
	basePath: (function () {
		var s = document.getElementsByTagName('script'), i = 0, p, src, t;
		while (!!(t = s[i++])) {
			if (!t.src) {
				continue;
			}
			src = t.src;
			p = src.indexOf('Hyphenator');
			if (p !== -1) {
				return src.substring(0, p);
			}
		}
		return 'http://192.168.0.2/~mnater/hyph/hyph_module/';
	}()),
	remoteLoad: function (id, url) {
		var xhr = null;
		if (typeof XMLHttpRequest !== 'undefined') {
			xhr = new XMLHttpRequest();
		}
		if (!xhr) {
			try {
				xhr  = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				xhr  = null;
			}
		}
		if (xhr) {
			xhr.open('GET', url, true);
			xhr.onreadystatechange = function () {
				if (xhr.status === 404) {
					xhr.abort();
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(2, {'id': id, 'url': url, state: 42}, "failed to load file."));					
				} else if (xhr.readyState < 4) {
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(2, {'id': id, 'url': url, state: xhr.readyState}, "readyState changed: " + url));					
				} else if (xhr.readyState === 4 && xhr.status === 200) {
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(2, {'id': id, 'url': url, state: xhr.readyState, content: xhr.responseText}, "file loaded: " + url));					
				}
			};
			xhr.send(null);
		}
	},
	load: function (id, url, watcher, callback) {
		Hyphenator.fn.remoteLoad(id, url);
	}
});
//begin Hyphenator_hyphenate.js
/*jslint sub: true */

Hyphenator.addModule({
	hyphenate: function (target, lang) {
		var hyphenate, n, i;
		if (Hyphenator.languages.hasOwnProperty(lang)) {
			
			if (Hyphenator.fn.supportedLanguages[lang].state === 0) {
				Hyphenator.fn.prepareLanguagesObj(lang);
			}
			
			hyphenate = function (word) {
				if (Hyphenator.fn.urlOrMailRE.test(word)) {
					return Hyphenator.hyphenateURL(word);
				} else {
					return Hyphenator.hyphenateWord(lang, word);
				}
			};
			if (typeof target === 'string' || target.constructor === String) {
				return target.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
			} else if (typeof target === 'object') {
				i = 0;
				while (!!(n = target.childNodes[i++])) {
					if (n.nodeType === 3 && n.data.length >= Hyphenator.minwordlength) { //type 3 = #text -> hyphenate!
						n.data = n.data.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
					} else if (n.nodeType === 1) {
						if (n.lang !== '') {
							Hyphenator.hyphenate(n, n.lang);
						} else {
							Hyphenator.hyphenate(n, lang);
						}
					}
				}
			}
		} else {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, lang, "Language '" + lang + "' is not loaded."));
		}
	},
	hyphenateWord: function (lang, word) {
		var lo = Hyphenator.languages[lang],
			parts, i, l, w, wl, s, hypos, p, maxwins, win, pat = false, patk, c, t, n, numb3rs, inserted, hyphenatedword, val, subst, ZWNJpos = [];
		if (word === '') {
			return '';
		}
		if (word.indexOf(Hyphenator.hyphenchar) !== -1) {
			//word already contains shy; -> leave at it is!
			return word;
		}
		if (Hyphenator.enablecache && lo.cache.hasOwnProperty(word)) { //the word is in the cache
			return lo.cache[word];
		}
		if (lo.exceptions.hasOwnProperty(word)) { //the word is in the exceptions list
			return lo.exceptions[word].replace(/-/g, Hyphenator.hyphenchar);
		}
		if (word.indexOf('-') !== -1) {
			//word contains '-' -> hyphenate the parts separated with '-'
			parts = word.split('-');
			for (i = 0, l = parts.length; i < l; i++) {
				parts[i] = Hyphenator.hyphenateWord(lang, parts[i]);
			}
			return parts.join('-');
		}
		w = '_' + word + '_';
		if (word.indexOf(String.fromCharCode(8204)) !== -1) {
			parts = w.split(String.fromCharCode(8204));
			w = parts.join('');
			for (i = 0, l = parts.length; i < l; i++) {
				parts[i] = parts[i].length.toString();
			}
			parts.pop();
			ZWNJpos = parts;
		}
		wl = w.length;
		s = w.split('');
		if (!!lo.charSubstitution) {
			for (subst in lo.charSubstitution) {
				if (lo.charSubstitution.hasOwnProperty(subst)) {
					w = w.replace(new RegExp(subst, 'g'), lo.charSubstitution[subst]);
				}
			}
		}
		
		if (word.indexOf("'") !== -1) {
			w = w.toLowerCase().replace("'", "’"); //replace APOSTROPHE with RIGHT SINGLE QUOTATION MARK (since the latter is used in the patterns)
		} else {
			w = w.toLowerCase();
		}
		//finally the core hyphenation algorithm
		hypos = [];
		numb3rs = {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9}; //check for member is faster then isFinite()
		n = wl - lo.shortestPattern;
		for (p = 0; p <= n; p++) {
			maxwins = Math.min((wl - p), lo.longestPattern);
			for (win = lo.shortestPattern; win <= maxwins; win++) {
				if (lo.patterns.hasOwnProperty(patk = w.substring(p, p + win))) {
					pat = lo.patterns[patk];
					if (Hyphenator.enablereducedpatternset && (typeof pat === 'string')) {
						lo.redPatSet[patk] = pat;
					}
					if (typeof pat === 'string') {
						//convert from string 'a5b' to array [1,5] (pos,value)
						t = 0;
						val = [];
						for (i = 0; i < pat.length; i++) {
							if (!!(c = numb3rs[pat.charAt(i)])) {
								val.push(i - t, c);
								t++;								
							}
						}
						pat = lo.patterns[patk] = val;
					}
				} else {
					continue;
				}
				for (i = 0; i < pat.length; i++) {
					c = p - 1 + pat[i];
					if (!hypos[c] || hypos[c] < pat[i + 1]) {
						hypos[c] = pat[i + 1];
					}
					i++;
				}
			}
		}
		inserted = 0;
		for (i = lo.leftmin; i <= (wl - 2 - lo.rightmin); i++) {
			if (ZWNJpos.length > 0 && ZWNJpos[0] === i) {
				ZWNJpos.shift();
				s.splice(i + inserted - 1, 0, String.fromCharCode(8204));
				inserted++;
			}			
			if (!!(hypos[i] & 1)) {
				s.splice(i + inserted + 1, 0, Hyphenator.hyphenchar);
				inserted++;
			}
		}
		hyphenatedword = s.slice(1, -1).join('');
		if (Hyphenator.enablecache) {
			lo.cache[word] = hyphenatedword;
		}
		return hyphenatedword;
	},
	hyphenateURL: function (url) {
		return url.replace(/([:\/\.\?#&_,;!@]+)/gi, '$&' + Hyphenator.urlhyphenchar);
	}

});
window['Hyphenator']['hyphenate'] = Hyphenator.hyphenate;
window['Hyphenator']['hyphenateWord'] = Hyphenator.hyphenateWord;
window['Hyphenator']['hyphenateURL'] = Hyphenator.hyphenateURL;
Hyphenator.fn.addModule({
	prompterStrings: {
		'be': 'Мова гэтага сайта не можа быць вызначаны аўтаматычна. Калі ласка пакажыце мову:',
		'cs': 'Jazyk této internetové stránky nebyl automaticky rozpoznán. Určete prosím její jazyk:',
		'da': 'Denne websides sprog kunne ikke bestemmes. Angiv venligst sprog:',
		'de': 'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben:',
		'en': 'The language of this website could not be determined automatically. Please indicate the main language:',
		'es': 'El idioma del sitio no pudo determinarse autom%E1ticamente. Por favor, indique el idioma principal:',
		'fi': 'Sivun kielt%E4 ei tunnistettu automaattisesti. M%E4%E4rit%E4 sivun p%E4%E4kieli:',
		'fr': 'La langue de ce site n%u2019a pas pu %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue, s.v.p.%A0:',
		'hu': 'A weboldal nyelvét nem sikerült automatikusan megállapítani. Kérem adja meg a nyelvet:',
		'hy': 'Չհաջողվեց հայտնաբերել այս կայքի լեզուն։ Խնդրում ենք նշեք հիմնական լեզուն՝',
		'it': 'Lingua del sito sconosciuta. Indicare una lingua, per favore:',
		'kn': 'ಜಾಲ ತಾಣದ ಭಾಷೆಯನ್ನು ನಿರ್ಧರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮುಖ್ಯ ಭಾಷೆಯನ್ನು ಸೂಚಿಸಿ:',
		'lt': 'Nepavyko automatiškai nustatyti šios svetainės kalbos. Prašome įvesti kalbą:',
		'lv': 'Šīs lapas valodu nevarēja noteikt automātiski. Lūdzu norādiet pamata valodu:',
		'ml': 'ഈ വെ%u0D2C%u0D4D%u200Cസൈറ്റിന്റെ ഭാഷ കണ്ടുപിടിയ്ക്കാ%u0D28%u0D4D%u200D കഴിഞ്ഞില്ല. ഭാഷ ഏതാണെന്നു തിരഞ്ഞെടുക്കുക:',
		'nl': 'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op:',
		'no': 'Nettstedets språk kunne ikke finnes automatisk. Vennligst oppgi språk:',
		'pt': 'A língua deste site não pôde ser determinada automaticamente. Por favor indique a língua principal:',
		'ru': 'Язык этого сайта не может быть определен автоматически. Пожалуйста укажите язык:',
		'sl': 'Jezika te spletne strani ni bilo mogoče samodejno določiti. Prosim navedite jezik:',
		'sv': 'Spr%E5ket p%E5 den h%E4r webbplatsen kunde inte avg%F6ras automatiskt. V%E4nligen ange:',
		'tr': 'Bu web sitesinin dili otomatik olarak tespit edilememiştir. Lütfen dökümanın dilini seçiniz%A0:',
		'uk': 'Мова цього веб-сайту не може бути визначена автоматично. Будь ласка, вкажіть головну мову:'
	}	
});

Hyphenator.fn.addModule({
	getConfigFromURI: function () {
		var loc = null, re = {}, jsArray = document.getElementsByTagName('script'), i, j, l, s, gp, option;
		for (i = 0, l = jsArray.length; i < l; i++) {
			if (!!jsArray[i].getAttribute('src')) {
				loc = jsArray[i].getAttribute('src');
			}
			if (!loc) {
				continue;
			} else {
				s = loc.indexOf('Hyphenator.js?');
				if (s === -1) {
					continue;
				}
				gp = loc.substring(s + 14).split('&');
				for (j = 0; j < gp.length; j++) {
					option = gp[j].split('=');
					if (option[0] === 'bm') {
						continue;
					}
					if (option[1] === 'true') {
						re[option[0]] = true;
						continue;
					}
					if (option[1] === 'false') {
						re[option[0]] = false;
						continue;
					}
					if (isFinite(option[1])) {
						re[option[0]] = parseInt(option[1], 10);
						continue;
					}
					re[option[0]] = option[1];
				}
				break;
			}
		}
		return re;
	}
});

if (Hyphenator.fn.isBookmarklet) {
	Hyphenator.config({displaytogglebox: true, intermediatestate: 'visible', doframes: true});
	Hyphenator.config(Hyphenator.fn.getConfigFromURI());
	Hyphenator.run();
}

