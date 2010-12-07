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
/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: false, regexp: true, newcap: true, immed: true */
/*global Hyphenator: true, window: true, ActiveXObject: true*/
//main.js
var Hyphenator = (function (window) {
	var Hyphenator = function () {
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
		extend: function (name, fnproto) {
			this[name] = fnproto;
		},
		addModule: function (module) {
			var that = this;
			module.each(function (k, v) {
				that[k] = v;
			});
		}
		
	};
	
	// Expose Hyphenator to the global object
	return new Hyphenator();	
}(window));


Hyphenator.fn.extend('EO', function (obj) {
	var that = this;
	this.src = obj;
	this.each = function (fn) {
		var k;
		for (k in obj) {
			if (obj.hasOwnProperty(k)) {
				fn(k, obj[k]);
			}
		}
	};
	this.getLength = function () {
		var l = 0;
		that.each(function () {
			l++;
		});
		return l;
	};
});

Hyphenator.addModule(new Hyphenator.fn.EO({
	run: function (config) {
		if (!!config) {
			Hyphenator.config(config);
		}
		Hyphenator.fn.autoSetMainLanguage();
		Hyphenator.fn.prepareElements();
	}
}));
//Hyphenator_debug.js
Hyphenator.addModule(new Hyphenator.fn.EO({
	log: function (msg) {
		if (window.console && window.console.log) {
			window.console.log(msg);
		} else {
			alert(msg);
		}
	}
}));
//Hyphenator_quirks.js
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
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
	}())
}));
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

//Hyphenator_constants.js
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
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
	Expando: (function () {
		var container = {},
			name = "HyphenatorExpando_" + Math.random(),
			uuid = 0;
		return {
			getDataForElem : function (elem) {
				return container[elem[name].id];
			},
			setDataForElem : function (elem, data) {
				var id;
				if (elem[name] && elem[name].id !== '') {
					id = elem[name].id;
				} else {
					id = uuid++;
					elem[name] = {'id': id}; //object needed, otherways it is reflected in HTML in IE
				}
				container[id] = data;
			},
			appendDataForElem : function (elem, data) {
				var k;
				for (k in data) {
					if (data.hasOwnProperty(k)) {
						container[elem[name].id][k] = data[k];
					}
				}
			},
			delDataOfElem : function (elem) {
				delete container[elem[name]];
			}
		};
	}()),
	dontHyphenate: {'script': true, 'code': true, 'pre': true, 'img': true, 'br': true, 'samp': true, 'kbd': true, 'var': true, 'abbr': true, 'acronym': true, 'sub': true, 'sup': true, 'button': true, 'option': true, 'label': true, 'textarea': true, 'input': true}
}));
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	urlOrMailRE: new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')', 'i')
}));//Hyphenator_messages.js
/*
Message types:
0: Error
1: Updated settings
2: file loaded
3: pattern available
*/
Hyphenator.fn.extend('Message', function (type, data, text) {
	this.type = type || 0;
	this.data = data || null;
	this.text = text || '';
	this.toString = function () {
		return "Message:\n\ttype: " + type + ":\n\tdata: " + JSON.stringify(data) + ":\n\ttext: " + text; 
	};
});

Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	postMessage: function (msg) {
		if (msg.constructor !== Hyphenator.fn.Message) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg, "Received non-conforming message"));
		} else {
			Hyphenator.fn.onmessage(msg);
		}
	},
	onmessage: function (msg) {
		//console.log(msg.toString());
		switch (msg.type) {
		case 0: //Error
			Hyphenator.postMessage(msg);
			break;
		case 1: //settings related
			//do reflow if necessary
			Hyphenator.postMessage(msg);
			break;
		case 2: //file load related
			//update supportedLang
			Hyphenator.fn.supportedLanguages[msg.data.id].state = msg.data.readyState;
			if (msg.data.state === 42) {
				//error
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg.data.url, "failed to load file."));
			}
			if (msg.data.state === 4) {
				//insert script
				Hyphenator.fn.insertScript(msg.data.content);
				Hyphenator.fn.supportedLanguages[msg.data.id].state = 5;
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data.id, 'state': 5}, "File added."));
			}
			break;
		case 3: //pattern related
			switch (msg.data.state) {
			case 5:
				Hyphenator.fn.prepareLanguagesObj(msg.data.id);
				break;
			case 6:
				Hyphenator.fn.supportedLanguages[msg.data.id].state = 7;
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data.id, 'state': 7}, "Pattern ready"));
				break;
			case 7:
				console.log("Hyphenate " + msg.data.id + Hyphenator.fn.collectedElements[msg.data.id]);
				Hyphenator.fn.hyphenateElementsOfLang(msg.data.id);
				break;
			default:
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, null, "Error"));
			}
			break;
		case 4: //language detected
			//load the language
			if (Hyphenator.fn.supportedLanguages[msg.data].state === 0) {
				Hyphenator.fn.supportedLanguages[msg.data].state = 1;
				Hyphenator.loadLanguage(msg.data);
			}
			break;
		default:
			Hyphenator.postMessage(new Hyphenator.fn.Message(0, msg.toString(), 'Internally received unknown message.'));
		}
	}
}));


Hyphenator.addModule(new Hyphenator.fn.EO({
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
		Hyphenator.log('received message: ' + msg.text);
		Hyphenator.log(msg);
	}
}));
//begin Hyphenator_config.js
Hyphenator.fn.extend('Setting', function (type, assert) {
	this.defaultValue = null;
	this.currentValue = null;
	this.setDefaultValue = function (val) {
		if (typeof val === type && assert.test(val)) {
			this.currentValue = this.defaultValue = val;
		}
	};
	this.setCurrValue = function (val) {
		if (typeof val === type && assert.test(val.toString())) {
			this.currentValue = val;
			return true;
		} else {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, val, "setting '" + val + "' doesn't fit."));
			return false;
		}
	};
});
Hyphenator.fn.extend('Settings', function () {
	this.data = {};
	this.expose = function (settings) {
		var tmp = {}, data, i;
		if (typeof settings === 'string') {
			if (settings === '*') {
				data = new Hyphenator.fn.EO(this.data);
				data.each(function (k, v) {
					tmp[k] = v.currentValue;
				});
			} else {
				tmp[settings] = this.data[settings].currentValue;
			}
		} else if (typeof settings === 'object') {
			for (i = 0; i < settings.length; i++) {
				tmp[settings[i]] = this.data[settings[i]].currentValue;
			}
		}
		Hyphenator.addModule(new Hyphenator.fn.EO(tmp));
	};
	this.add = function (name, defaultValue, type, assert) {
		this.data[name] = new Hyphenator.fn.Setting(type, new RegExp(assert));
		this.data[name].setDefaultValue(defaultValue);
	};
	this.change = function (name, value) {
		return (this.data[name].setCurrValue(value));
	};
});

Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	settings: new Hyphenator.fn.Settings()
}));

Hyphenator.addModule(new Hyphenator.fn.EO({
	config: function (obj) {
		var translate = {
			'classname': 'hyphenateClass',
			'donthyphenateclassname': 'dontHyphenateClass',
			'minwordlength': 'min',
			'hyphenchar': 'hyphen',
			'urlhyphenchar': 'urlhyphen',
			'displaytogglebox': 'displayToggleBox',
			'remoteloading': 'enableRemoteLoading',
			'enablereducedpatternset': 'enableReducedPatternSet',
			'enablecache': 'enableCache',
			'intermediatestate': 'intermediateState',
			'safecopy': 'safeCopy',
			'doframes': 'doFrames',
			'storagetype': 'storageType',
			'orphancontrol': 'orphanControl',
			'dohyphenation': 'doHyphenation',
			'persistentconfig': 'persistentConfig',
			'defaultlanguage': 'defaultLanguage'		
		}, changes = [], key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (translate.hasOwnProperty(key)) {
					if (Hyphenator.fn.settings.change(translate[key], obj[key])) {
						changes.push(translate[key]);
					}					
				} else {
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, key, "Error: configuration option '" + key + "' doesn't exist."));
				}
			}
		}
		if (changes.length > 0) {
			Hyphenator.fn.settings.expose(changes);
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(1, changes, "settings changed."));
		}

	}
}));


Hyphenator.fn.settings.add('hyphenateClass', 'hyphenate', 'string', '^[a-zA-Z_]+[a-zA-Z0-9_]+$');
Hyphenator.fn.settings.add('dontHyphenateClass', 'donthyphenate', 'string', '^[a-zA-Z_]+[a-zA-Z0-9_]+$');
Hyphenator.fn.settings.add('min', 6, 'number', '\\d+');
Hyphenator.fn.settings.add('hyphen', String.fromCharCode(173), 'string', '.');
Hyphenator.fn.settings.add('urlhyphen', Hyphenator.fn.zeroWidthSpace, 'string', '.');
Hyphenator.fn.settings.add('displayToggleBox', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('enableRemoteLoading', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('enableCache', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('enableReducedPatternSet', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('intermediateState', 'hidden', 'string', 'hidden|visible|progressive');
Hyphenator.fn.settings.add('safeCopy', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('doFrames', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('storageType', true, 'string', 'none|local|session');
Hyphenator.fn.settings.add('orphanControl', 1, 'number', '1|2|3');
Hyphenator.fn.settings.add('doHyphenation', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('persistentConfig', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('defaultLanguage', '', 'string', '.');
Hyphenator.fn.settings.expose('*');
//end Hyphenator_config.js
//begin Hyphenator_languages.js
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	supportedLanguages: {
		 /* 0: init, 1:to be loaded, 2:request sent, 3:loading, 4:loaded, 5:added, 6:preparing, 7:ready 42: failed*/
		'be': {file: 'be.js', state: 0},
		'cs': {file: 'cs.js', state: 0},
		'da': {file: 'da.js', state: 0},
		'bn': {file: 'bn.js', state: 0},
		'de': {file: 'de.js', state: 0},
		'el': {file: 'el-monoton.js', state: 0},
		'el-monoton': {file: 'el-monoton.js', state: 0},
		'el-polyton': {file: 'el-polyton.js', state: 0},
		'en': {file: 'en-us.js', state: 0},
		'en-gb': {file: 'en-gb.js', state: 0},
		'en-us': {file: 'en-us.js', state: 0},
		'es': {file: 'es.js', state: 0},
		'fi': {file: 'fi.js', state: 0},
		'fr': {file: 'fr.js', state: 0},
		'grc': {file: 'grc.js', state: 0},
		'gu': {file: 'gu.js', state: 0},
		'hi': {file: 'hi.js', state: 0},
		'hu': {file: 'hu.js', state: 0},
		'hy': {file: 'hy.js', state: 0},
		'it': {file: 'it.js', state: 0},
		'kn': {file: 'kn.js', state: 0},
		'la': {file: 'la.js', state: 0},
		'lt': {file: 'lt.js', state: 0},
		'lv': {file: 'lv.js', state: 0},
		'ml': {file: 'ml.js', state: 0},
		'no': {file: 'no-nb.js', state: 0},
		'no-nb': {file: 'no-nb.js', state: 0},
		'nl': {file: 'nl.js', state: 0},
		'or': {file: 'or.js', state: 0},
		'pa': {file: 'pa.js', state: 0},
		'pl': {file: 'pl.js', state: 0},
		'pt': {file: 'pt.js', state: 0},
		'ru': {file: 'ru.js', state: 0},
		'sl': {file: 'sl.js', state: 0},
		'sv': {file: 'sv.js', state: 0},
		'ta': {file: 'ta.js', state: 0},
		'te': {file: 'te.js', state: 0},
		'tr': {file: 'tr.js', state: 0},
		'uk': {file: 'uk.js', state: 0}
	},
	convertPatterns: function (lang) {
		var plen, anfang, ende, pats, pat, key, tmp = {};
		pats = Hyphenator.languages[lang].patterns;
		for (plen in pats) {
			if (pats.hasOwnProperty(plen)) {
				plen = parseInt(plen, 10);
				anfang = 0;
				ende = plen;
				while (!!(pat = pats[plen].substring(anfang, ende))) {
					key = pat.replace(/\d/g, '');
					tmp[key] = pat;
					anfang = ende;
					ende += plen;
				}
			}
		}
		Hyphenator.languages[lang].patterns = tmp;
		Hyphenator.languages[lang].patternsConverted = true;
	},
	prepareLanguagesObj: function (lang) {
		Hyphenator.fn.supportedLanguages[lang].state = 6;
		var lo = Hyphenator.languages[lang], wrd;
		if (Hyphenator.enableCache) {
			lo.cache = {};
			//Export
			//lo['cache'] = lo.cache;
		}
		if (Hyphenator.enableReducedPatternSet) {
			lo.redPatSet = {};
		}
		lo.exceptions = {};
		/*
		//add exceptions from the pattern file to the local 'exceptions'-obj
		if (lo.hasOwnProperty('exceptions')) {
			Hyphenator.addExceptions(lang, lo.exceptions);
			delete lo.exceptions;
		}
		//copy global exceptions to the language specific exceptions
		if (exceptions.hasOwnProperty('global')) {
			if (exceptions.hasOwnProperty(lang)) {
				exceptions[lang] += ', ' + exceptions.global;
			} else {
				exceptions[lang] = exceptions.global;
			}
		}
		//move exceptions from the the local 'exceptions'-obj to the 'language'-object
		if (exceptions.hasOwnProperty(lang)) {
			lo.exceptions = convertExceptionsToObject(exceptions[lang]);
			delete exceptions[lang];
		} else {
			lo.exceptions = {};
		}*/
		Hyphenator.fn.convertPatterns(lang);
		wrd = '[\\w' + lo.specialChars + '@' + String.fromCharCode(173) + String.fromCharCode(8204) + '-]{' + Hyphenator.min + ',}';
		lo.genRegExp = new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')|(' + wrd + ')', 'gi');
		/*if (!!storage) {
			try {
				storage.setItem('Hyphenator_' + lang, window.JSON.stringify(lo));
			} catch (e) {
				//onError(e);
			}
		}*/
		Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': lang, state: 6}, "Pattern object prepared"));
	}
}));

Hyphenator.fn.addModule(new Hyphenator.fn.EO({
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
}));

Hyphenator.addModule(new Hyphenator.fn.EO({
	mainLanguage: null,
	languages: {},
	loadLanguages: function () {
		var supportedLanguages = new Hyphenator.fn.EO(Hyphenator.fn.supportedLanguages);
		supportedLanguages.each(function (lang, data) {
			if (data.state === 1) {
				Hyphenator.fn.load(lang, Hyphenator.fn.basePath + 'patterns/' + data.file);
			}
		});
	},
	loadLanguage: function (lang) {
		if (Hyphenator.fn.supportedLanguages[lang].state < 2) {
			Hyphenator.fn.load(lang, Hyphenator.fn.basePath + 'patterns/' + Hyphenator.fn.supportedLanguages[lang].file);
		}
	}
}));
//end Hyphenator_languages.js
//begin Hyphenator_loader.js
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
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
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(2, {'id': id, 'url': url, state: xhr.readyState}, "readyState changed."));					
				} else if (xhr.readyState === 4 && xhr.status === 200) {
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(2, {'id': id, 'url': url, state: xhr.readyState, content: xhr.responseText}, "file loaded."));					
				}
			};
			xhr.send(null);
		}

		/*for bookmarklet:
		head = window.document.getElementsByTagName('head').item(0);
		script = createElem('script');
		script.src = url;
		script.type = 'text/javascript';
		head.appendChild(script);
		*/
	},
	storageLoad: function (url) {
	
	},
	load: function (id, url, watcher, callback) {
		Hyphenator.fn.remoteLoad(id, url);
	}
}));
//begin Hyphenator_hyphenate.js
Hyphenator.addModule(new Hyphenator.fn.EO({
	hyphenateWord: function (lang, word) {
		var lo = Hyphenator.languages[lang],
			parts, i, l, w, wl, s, hypos, p, maxwins, win, pat = false, patk, c, t, n, numb3rs, inserted, hyphenatedword, val, subst, ZWNJpos = [];
		if (word === '') {
			return '';
		}
		if (word.indexOf(Hyphenator.hyphen) !== -1) {
			//word already contains shy; -> leave at it is!
			return word;
		}
		if (Hyphenator.enableCache && lo.cache.hasOwnProperty(word)) { //the word is in the cache
			return lo.cache[word];
		}
		if (lo.exceptions.hasOwnProperty(word)) { //the word is in the exceptions list
			return lo.exceptions[word].replace(/-/g, Hyphenator.hyphen);
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
				parts[i] = parts[i].length;
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
					if (Hyphenator.enableReducedPatternSet && (typeof pat === 'string')) {
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
				s.splice(i + inserted + 1, 0, Hyphenator.hyphen);
				inserted++;
			}
		}
		hyphenatedword = s.slice(1, -1).join('');
		if (Hyphenator.enableCache) {
			lo.cache[word] = hyphenatedword;
		}
		return hyphenatedword;
	},
	hyphenateURL: function (url) {
		return url.replace(/([:\/\.\?#&_,;!@]+)/gi, '$&' + Hyphenator.urlhyphen);
	}

}));
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
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
}));

