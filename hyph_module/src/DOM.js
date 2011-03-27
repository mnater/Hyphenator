//Hyphenator.DOM.js
/*jslint sub: true */
/**
 * A wrapper for DOMElements:
 * this.elements {Element} hold a pointer to the DOMElement
 * this.hyphenated {boolean} is set to true as soon as the element is hyphenated
 * this.treated {boolean} is set to true, when the element is read out and the language registered
 * this.data {Object} holds settings of hyphenator for the element (lang, visibility, style, ...) 
 * @constructor
 */
Hyphenator.fn.Element = function (element, data) {
	this.element = element;
	this.hyphenated = false;
	this.treated = false; //collected but not hyphenated (dohyphenation is off)
	this.data = data;
};

Hyphenator.fn.Element.prototype = {
	/**
	 * method hyphenate() hyphenates the text contained in the element and marks it as hyphenated
	 * @function
	 * @memberOf Hyphenator.fn.Element.prototype
	 * @private
	 */
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
				//registerOnCopy
				if (Hyphenator.safecopy && (this.element.tagName.toLowerCase() !== 'body')) {
					Hyphenator.fn.registerOnCopy(this.element);
				}
				//cycle through child nodes
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
			//handle style of the element
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
	/**
	 * method removeHyphenation() deletes hyphen characters from elements text and marks it as unhyphenated
	 * @function
	 * @memberOf Hyphenator.fn.Element.prototype
	 * @private
	 */
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
 * A container for Hyphentator.fn.LanguageElementsCollections
 * this.list {Object} where key is the language and value the Hyphenator.fn.LanguageElementsCollection
 * @constructor
 */
Hyphenator.fn.ElementCollection = function () {
	this.list = {};
};

Hyphenator.fn.ElementCollection.prototype = {
	/**
	 * Adds an element to the list
	 * @param {Element} el The DomElement to add
	 * @param {string} lang The language of that element
	 * @param {Object} data Additional data for that element
	 * @function
	 * @memberOf Hyphenator.fn.ElementCollection.prototype
	 * @private
	 */
	addElement: function (el, lang, data) {
		if (!this.list.hasOwnProperty(lang)) {
			this.list[lang] = [];
		}
		this.list[lang].push(new Hyphenator.fn.Element(el, data));
	},
	/**
	 * Go through each element in the list and apply fn to it
	 * @param {function(*, *)} fn The function to apply, takes key and value as arguments
	 * @function
	 * @memberOf Hyphenator.fn.ElementCollection.prototype
	 * @private
	 */
	each: function (fn) {
		var tmp = new Hyphenator.fn.EO(this.list);
		tmp.each(fn);
	},
	/**
	 * Remove hyphenation from all elements in the list
	 * @function
	 * @memberOf Hyphenator.fn.ElementCollection.prototype
	 * @private
	 */
	removeAllHyphenation: function () {
		this.each(function (lang, content) {
			var tmp = new Hyphenator.fn.EO(content);
			tmp.each(function (k, element) {
				element.removeHyphenation();
			});
		});
	},
	/**
	 * Hyphenate elements in the list either all of the given language or all, if lang === '*'
	 * @param {string} lang The language to hyphenate or '*' for all languages
	 * @function
	 * @memberOf Hyphenator.fn.ElementCollection.prototype
	 * @private
	 */
	hyphenate: function (lang) {
		lang = lang || null;
		if (lang === '*') {
			this.each(function (lang, content) {
				var tmp = new Hyphenator.fn.EO(content);
				tmp.each(function (k, element) {
					element.hyphenate();
				});
			});
		} else {
			var tmp = new Hyphenator.fn.EO(this.list[lang]);
			tmp.each(function (k, element) {
				element.hyphenate();
			});
		}
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(5, lang, "Some elements have been hyphenated: " + lang));
	}
};

 /**
 * A wrapper for Documents:
 * this.w {Window} holds a pointer to the DOMWindow
 * this.parent {Window | null} pointer to the parent window (for frames) or null if top
 * this.href {string} the URI of the window (is used as identifier)
 * this.state {number} the state of the window
 * this.mainLanguage {string} the language found in meta-tags or attributes
 * this.elementCollection {Hyphenator.fn.ElementCollection} The Elements in this window that will be hyphenated
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
	/**
	 * Sets the mainLanguage-Property in the Document-Object
	 * This method searches in several places for a useful language-tag, if nothing
	 * can be found, it displays a user prompt
	 * @function
	 * @memberOf Hyphenator.fn.Document.prototype
	 * @private
	 */
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
			ul = navigator.userLanguage ? navigator.userLanguage : navigator.language;
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
	/**
	 * Remove hyphenation from all elements of this document
	 * @function
	 * @memberof Hyphenator.fn.Document.prototype
	 * @private
	 */
	removeHyphenation: function () {
		this.elementCollection.removeAllHyphenation();
	},
	/**
	 * Hyphenates all elements
	 * @function
	 * @memberOf Hyphenator.fn.Document.prototype
	 * @private
	 */
	hyphenate: function () {
		this.elementCollection.hyphenate('*');
	},
	/**
	 * Prepares the elements: gets their language, initiate languae load, hides the element, add it to the collection
	 * @function
	 * @memberOf Hyphenator.fn.Document.prototype
	 * @private
	 */
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
	/**
	 * Sets the state of the document
	 * @param {number} state The state: (0: Error, 1: init, 2: ready, 3:elements collected, 4: hyphenated, 5: frameset)
	 * @function
	 * @memberOf Hyphenator.fn.Document.prototype
	 * @private
	 */
	updateDocumentState: function (state) {
		this.state = state;
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(7, {'id': this.w, 'state': this.state}, "Document state updated (" + this.state + "): " + this.href));
	},
	/**
	 * Checks if all elements are hyphenated, sets state to 4, when all done
	 * @function
	 * @memberOf Hyphenator.fn.Document.prototype
	 * @private
	 */
	checkIfAllDone: function () {
		var allDone = true;
		if (this.state === 3) {
			this.elementCollection.each(function (lang, elOfLang) {
				elOfLang = new Hyphenator.fn.EO(elOfLang);
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
 * A container for Hyphentator.fn.Document
 * this.list {Object} where key is the href of the Document and value a instance of Hyphentator.fn.Document
 * @constructor
 */
Hyphenator.fn.DocumentCollection = function () {
	this.list = {}; //href: Hyphenator.fn.Document
};

Hyphenator.fn.DocumentCollection.prototype = {
	/**
	 * Cycles throuch each Document in the collection and calls a function on it
	 * @function
	 * @memberOf Hyphenator.fn.DocumentCollection.prototype
	 * @private
	 * @param {function(*, *)} fn The function to apply
	 */
	each: function (fn) {
		var tmp = new Hyphenator.fn.EO(this.list);
		tmp.each(fn);
	},
	/**
	 * Adds a document to the collection and throws a message
	 * @function
	 * @memberOf Hyphenator.fn.DocumentCollection.prototype
	 * @private
	 * @param {Window} w The document (default: window)
	 * @param {Window} p The parent windo of the document (default: null)
	 */
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
	/**
	 * Checks if all documents are hyphenated and throws a message
	 * @function
	 * @memberOf Hyphenator.fn.DocumentCollection.prototype
	 * @private
	 */
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
	/**
	 * Custom method for creating DOM elements
	 * @function
	 * @memberOf Hyphenator.fn
	 * @private
	 * @param {string} tagname The tag to create
	 * @param {Window} w The window where the Element has to be created
	 */
	createElem: function (tagname, w) {
		w = w || window;
		if (window.document.createElementNS) {
			return w.document.createElementNS('http://www.w3.org/1999/xhtml', tagname);
		} else if (window.createElement) {
			return w.document.createElement(tagname);
		}
	},
	/**
	 * Custom method for creating script elements
	 * @function
	 * @memberOf Hyphenator.fn
	 * @private
	 * @param {string} text The script to be appended
	 */
	insertScript: function (text) {
		var script, head = window.document.getElementsByTagName('head').item(0);
		script = Hyphenator.fn.createElem('script');
		script.type = 'text/javascript';
		script.text = text;
		head.appendChild(script);
	},
	
	/**
	 * Property that holds the collected documents
	 * @field
	 * @memberOf Hyphenator.fn
	 * @private
	 */
	collectedDocuments: new Hyphenator.fn.DocumentCollection(),

	/*
	 */
	/**
	 * A crossbrowser solution for the DOMContentLoaded-Event
	 * prepareDocuments is originaly based od jQuery.bindReady()
	 * see jQuery JavaScript Library v1.3.2 http://jquery.com/
	 *
	 * Copyright (c) 2009 John Resig
	 * Dual licensed under the MIT and GPL licenses.
	 * http://docs.jquery.com/License
	 *
	 * Date: 2009-02-19 17:34:21 -0500 (Thu, 19 Feb 2009)
	 * Revision: 6246
	 *
	 * I added some functionality: e.g. support for frames and iframes…
	 * This method throws many messages and collects documents in Hyphenator.fn.collectedDocuments
	 * @param {Window} w the window-object
	 * @function
	 * @memberOf Hyphenator.fn
	 * @private
	 */
	prepareDocuments: function (w) {
		w = w || window;
		var DOMContentLoaded = function () {}, toplevel,
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
	/**
	 * This method collects the language from a given element. If no language can be found,
	 * it goes up one level and tries it on the parent node.
	 * Lastly there's a fallback to the mainLanguage of the document
	 * @function
	 * @memberOf Hyphenator.fn
	 * @private
	 * @param {Window} w The window
	 * @param {Element} el The DOMElement to handle
	 * @param {boolean} fallback Fallback to mainLanguage if set to true, else return null
	 * @return {string|null} Return the language or null
	 */
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
	/**
	 * This method returns an array of elements of the given window.document
	 * This method may be overridden by the user
	 * @function
	 * @memberOf Hyphenator
	 * @private
	 * @param {Window} w The window
	 * @return {Array} The collected elements
	 */
	selectorfunction: function (w) {
		w = w || window;
		var tmp, el = [], i, l;
		if (document.getElementsByClassName) {
			tmp = w.document.getElementsByClassName(Hyphenator.classname); //returns a NodeList
			//convert to array
			l = tmp.length;
			for (i = 0; i < l; i++) {
				el.push(tmp[i]);
			}
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
//export
window['Hyphenator']['selectorfunction'] = Hyphenator.selectorfunction;
