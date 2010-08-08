/* The following comment is for JSLint: */
/*global window */
/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, regexp: true, newcap: true, immed: true */

var Hyphenator = (function (window) {
	return {
		wordHyphenChar: String.fromCharCode(173),
		urlHyphenChar: String.fromCharCode(8203),
		basePath: (function () {
			var s = document.getElementsByTagName('script'), i = 0, p, src, t;
			while (!!(t = s[i++])) {
				if (!t.src) {
					continue;
				}
				src = t.src;
				p = src.indexOf('Hyphenator.js');
				if (p !== -1) {
					return src.substring(0, p);
				}
			}
			return '';
		}()),
		Wkr: undefined,
		Expando: undefined,
		intermediateState: 'hidden',
		storageType: 'local',
		getLang: function (element, fallback) {
			var metaNodeList, metaTag, i = 0, data;
			if (!!element.getAttribute('lang')) {
				return element.getAttribute('lang').toLowerCase();
			}
			try {
				if (!!element.getAttribute('xml:lang')) {
					return element.getAttribute('xml:lang').toLowerCase();
				}
			} catch (ex) {}
			if (!!(data = Hyphenator.Expando.getDataForElem(element)) && !!data.lang) {
				return data.lang;
			}
			if (element.tagName !== 'HTML') {
				return Hyphenator.getLang(element.parentNode, true);
			} else {
				metaNodeList = element.getElementsByTagName('meta');
				while (!!(metaTag = metaNodeList.item(i++))) {
					//<meta http-equiv = "content-language" content="xy">	
					if (!!metaTag.getAttribute('http-equiv') && (metaTag.getAttribute('http-equiv').toLowerCase() === 'content-language')) {
						return metaTag.getAttribute('content').toLowerCase();
					}
					//<meta name = "DC.Language" content="xy">
					if (!!metaTag.getAttribute('name') && (metaTag.getAttribute('name').toLowerCase() === 'dc.language')) {
						return metaTag.getAttribute('content').toLowerCase();
					}			
					//<meta name = "language" content = "xy">
					if (!!metaTag.getAttribute('name') && (metaTag.getAttribute('name').toLowerCase() === 'language')) {
						return metaTag.getAttribute('content').toLowerCase();
					}
				}
			}
			//language not defined
			Hyphenator.customEvents.fire('onerror', {
				sender: 'Hyphenator.getLang()',
				message: 'Language not defined.'
			});
			return;
		},
		select: function () {
			var r = [];
			r = window.document.getElementsByClassName('hyphenate');
			return r;
		},
		dontselect: function () {
			var r = [];
			r = window.document.getElementsByClassName('donthyphenate');
			return r;
		},
		run: function (config) {
			var elToProcess, elNoProcess, element, i = 0, messageCount = 0, first = false,
			process = function (element, hide, lang) {
				var linkToElement, msg, n, i = -1, j, hyphenateChild;
				lang = Hyphenator.getLang(element);
				if (!lang) {
					return;
				}
				Hyphenator.restorePatterns(lang);
				Hyphenator.Expando.setDataForElem(element, {lang: lang});
				if (hide && Hyphenator.intermediateState === 'hidden') {
					if (!!element.getAttribute('style')) {
						Hyphenator.Expando.setDataForElem(element, {hasOwnStyle: true});
					} else {
						Hyphenator.Expando.setDataForElem(element, {hasOwnStyle: false});
					}
					Hyphenator.Expando.setDataForElem(element, {isHidden: true});
					element.style.visibility = 'hidden';
				}
				if (!first) {
					first = element;
				}
				while (!!(n = element.childNodes[++i])) {
					hyphenateChild = true;
					if (n.nodeType === 3 && /[\S]/.test(n.data)) {
						linkToElement = Hyphenator.Expando.setDataForElem(element, {element: element});
						msg = {
							type: 'hyphenate',
							link: linkToElement,
							nodeNumber: i,
							text: n.data,
							lang: lang
						};
						messageCount++;
						Hyphenator.Wkr.postMessage(window.JSON.stringify(msg));
					} else if (n.nodeType === 1) {
						if (elNoProcess.length > 0) {
							for (j = 0; j < elNoProcess.length; j++) {
								if (elNoProcess[j] === n) {
									hyphenateChild = false;
								}
							}
						}
						if (hyphenateChild) {
							process(n, false, lang);
						}
					}
				}
			};
			
			//initialize properties
			if (config) {
				Hyphenator.config(config);
			}

			//do the run
			Hyphenator.Wkr.onmessage = function (e) {
				var msg = window.JSON.parse(e.data), element;
				switch (msg.type) {
				case 'hyphenate':
					element = Hyphenator.Expando.getDataForId(msg.link).element;
					element.childNodes[msg.nodeNumber].data = msg.text;
					if (Hyphenator.Expando.getDataForId(msg.link).isHidden && Hyphenator.intermediateState === 'hidden') {
						element.style.visibility = 'visible';
						if (!Hyphenator.Expando.getDataForId(msg.link).hasOwnStyle) {
							element.setAttribute('style', ''); // without this, removeAttribute doesn't work in Safari (thanks to molily)
							element.removeAttribute('style');
						} else {
							if (element.style.removeProperty) {
								element.style.removeProperty('visibility');
							} else if (element.style.removeAttribute) { // IE
								element.style.removeAttribute('visibility');
							}  
						}
					}
					messageCount--;
					if (messageCount === 0) {
						first.style.visibility = 'visible';
						//clean up:
						elToProcess = elNoProcess = element = first = null;
						Hyphenator.Expando.reset();
						Hyphenator.customEvents.fire('onhyphenationdone', 'Hyphenator.run()');
					}
					break;
				case 'pattern':
					Hyphenator.storage.setItem('Hyphenator_' + msg.lang, msg.patterns);
					break;
				case 'error':
					Hyphenator.customEvents.fire('onerror', {sender: msg.sender, message: msg.message});
					break;
				}
			};
			
			elToProcess = Hyphenator.select();
			elNoProcess = Hyphenator.dontselect();
			while (!!(element = elToProcess[i++])) {
				process(element, true, undefined);
			}

		},
		removehyphenation: function () {
			var i = 0, elToProcess, element,
			process = function (element) {
				var n, i = 0, wordHyphenChar, urlHyphenChar;
				switch (Hyphenator.wordHyphenChar) {
				case '|':
					wordHyphenChar = '\\|';
					break;
				case '+':
					wordHyphenChar = '\\+';
					break;
				case '*':
					wordHyphenChar = '\\*';
					break;
				default:
					wordHyphenChar = Hyphenator.wordHyphenChar;
				}
				switch (Hyphenator.urlHyphenChar) {
				case '|':
					urlHyphenChar = '\\|';
					break;
				case '+':
					urlHyphenChar = '\\+';
					break;
				case '*':
					urlHyphenChar = '\\*';
					break;
				default:
					urlHyphenChar = Hyphenator.urlHyphenChar;
				}
				while (!!(n = element.childNodes[i++])) {
					if (n.nodeType === 3) {
						n.data = n.data.replace(new RegExp(wordHyphenChar, 'g'), '');
						n.data = n.data.replace(new RegExp(urlHyphenChar, 'g'), '');
					} else if (n.nodeType === 1) {
						process(n);
					}
				}
			};
			elToProcess = Hyphenator.select();
			while (!!(element = elToProcess[i++])) {
				process(element);
			}
			Hyphenator.customEvents.fire('onremovehyphenationdone', 'Hyphenator.removehyphenation()');
		}
	};

}(window));

Hyphenator.Wkr = new Worker(Hyphenator.basePath + 'Hyphenator_worker.js');
Hyphenator.Expando = (function () {
	var container = {},
		name = "HyphenatorExpando_" + Math.random(),
		uuid = 1;
	return {
		c : container,
		getDataForElem : function (elem) {
			return container[elem[name]];
		},
		getDataForId : function (id) {
			return container[id];
		},
		setDataForElem : function (elem, data) {
			var id, k;
			if (elem[name] && elem[name] !== '') {
				id = elem[name];
			} else {
				id = uuid++;
				elem[name] = id;
			}
			if (!container[id]) {
				container[id] = {};
			}
			for (k in data) {
				if (data.hasOwnProperty(k)) {
					container[id][k] = data[k];
				}
			}
			return id;
		},
		reset : function () {
			container = {};
			name = "HyphenatorExpando_" + Math.random();
			uuid = 1;
		}
	};
}());

Hyphenator.storage = (function () {
	try {
		if (Hyphenator.storageType !== 'none' &&
			typeof(window.localStorage) !== 'undefined' &&
			typeof(window.sessionStorage) !== 'undefined') {
			switch (Hyphenator.storageType) {
			case 'session':
				return window.sessionStorage;
			case 'local':
				return window.localStorage;
			default:
				return;
			}
		}
	} catch (e) {
		//FF throws an error if DOM.storage.enabled is set to false
	}
}());


Hyphenator.restorePatterns = (function () {
	var restored = {};
	return function () {
		var i, l, p;
		for (i = 0; i < arguments.length; i++) {
			l = arguments[i];
			if (!restored[l] && Hyphenator.storage.hasOwnProperty('Hyphenator_' + l)) {
				p = Hyphenator.storage.getItem('Hyphenator_' + l);
				Hyphenator.Wkr.postMessage(window.JSON.stringify({
					type: 'pattern',
					lang: l,
					patterns: p
				}));
				restored[l] = true;
			}
		}
	};
}());

Hyphenator.addExceptions = function (lang, words) {
	var tmp = [], i, exceptions = {}, msg = {
		type: 'exception'
	};
	tmp = words.split(', ');
	for (i = 0; i < tmp.length; i++) {
		exceptions[tmp[i].replace(/-/g, '')] = tmp[i];
	}
	msg.lang = lang;
	msg.exceptions = exceptions;
	Hyphenator.Wkr.postMessage(window.JSON.stringify(msg));
};


//define modular extras
Hyphenator.config = function (configObj) {
	var assert = function (name, type) {
			if (typeof configObj[name] === type) {
				return true;
			} else {
				Hyphenator.customEvents.fire('onerror', {
					sender: 'Hyphenator.config()',
					message: 'Config property ' + name + ' must be of type ' + type
				});
				return false;
			}
		},
		key, msg = {
			type: 'config'
		};
	for (key in configObj) {
		if (configObj.hasOwnProperty(key)) {
			switch (key) {
			case 'minwordlength':
				if (assert('minwordlength', 'number')) {
					msg.minWordLength = configObj.minwordlength;
				}
				break;
			case 'wordhyphenchar':
				if (assert('wordhyphenchar', 'string')) {
					if (configObj.wordhyphenchar === '&shy;') {
						configObj.wordhyphenchar = String.fromCharCode(173);
					}
					Hyphenator.wordHyphenChar = msg.wordHyphenChar = configObj.wordhyphenchar;
				}
				break;
			case 'urlhyphenchar':
				if (configObj.hasOwnProperty('urlhyphenchar')) {
					if (assert('urlhyphenchar', 'string')) {
						msg.urlHyphenChar = configObj.urlhyphenchar;
					}
				}
				break;
			case 'storagetype':
				if (assert('storagetype', 'string')) {
					msg.storageType = configObj.storagetype;
				}						
				break;
			default:
				Hyphenator.customEvents.fire('onerror', {
					sender: 'Hyphenator.config()',
					message: 'Unknown config property: ' + key
				});
			}
		}
	}
	Hyphenator.Wkr.postMessage(window.JSON.stringify(msg));
};

Hyphenator.customEvents = (function () {
	var events = {};
	return {
		//for use in the library:
		add: function (name) {
			events[name] = function () {};
		},
		fire: function (name, data) {
			events[name](data);
		},
		//for use by the client:
		addEventListener: function (name, action, overwrite) {
			var oldEvent = events[name];
			events[name] = function (data) {
				if (!overwrite) {
					oldEvent(data);
				}
				action(data);
			};
		}
	};
}());
Hyphenator.customEvents.add('onhyphenationdone');
Hyphenator.customEvents.add('onremovehyphenationdone');
Hyphenator.customEvents.add('onerror');
Hyphenator.customEvents.addEventListener('onerror', function (e) {
	window.alert(e.message);
});