/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global Hyphenator: true, window: true */
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
		Hyphenator.fn.supportedLanguages['de'].state = 1;
		Hyphenator.fn.supportedLanguages['en'].state = 1;
		Hyphenator.loadLanguages();
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
	insertScript: function(text) {
		var script, head = window.document.getElementsByTagName('head').item(0);
		script = Hyphenator.fn.createElem('script');
		script.type = 'text/javascript';
		script.text = text;
		head.appendChild(script);
	}
}));

//Hyphenator_constants.js
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	url: '(\\w*:\/\/)?((\\w*:)?(\\w*)@)?((([\\d]{1,3}\\.){3}([\\d]{1,3}))|((www\\.|[a-zA-Z]\\.)?[a-zA-Z0-9\\-\\.]+\\.([a-z]{2,4})))(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*',
	//      protocoll     usr     pwd                    ip               or                          host                 tld        port               path
	mail: '[\\w-\\.]+@[\\w\\.]+'
}));


//Hyphenator_messages.js
/*
Message types:
0: Error
1: Updated settings
2: file loaded
3: pattern available
*/
// Hyphenator.fn.extend('Receiver', function (msg, handler) {
// 	this.msg = msg;
// 	this.handler = handler;
// });

Hyphenator.fn.extend('Message', function (type, data, text) {
	this.type = type || 0;
	this.data = data || null;
	this.text = text || '';
	this.toString = function () {
		return "Message from " + source + ":\n\ttype: " + type + ":\n\tdata: " + data + ":\n\ttext: " + text; 
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
						alert(msg.data.id + ' ' + Hyphenator.hyphenateWord(msg.data.id, 'Hyphenation'));
					break;
					default:
						Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, null, "Error"));
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
Hyphenator.fn.settings.add('displaytogglebox', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('remoteloading', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('enablecache', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('enablereducedpatternset', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('intermediatestate', 'hidden', 'string', 'hidden|visible|progressive');
Hyphenator.fn.settings.add('safecopy', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('doframes', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('storagetype', true, 'string', 'none|local|session');
Hyphenator.fn.settings.add('orphancontrol', 0, 'number', '0|1|2');
Hyphenator.fn.settings.add('dohyphenation', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('persistentconfig', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('defaultlanguage', '', 'string', '.');
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
			lo['cache'] = lo.cache;
		}
		if (Hyphenator.enableReducedPatternSet) {
			lo.redPatSet = {};
		}
		lo.exceptions={};
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
Hyphenator.addModule(new Hyphenator.fn.EO({
	languages: {},
	loadLanguages: function () {
		var supportedLanguages = new Hyphenator.fn.EO(Hyphenator.fn.supportedLanguages);
		supportedLanguages.each(function (lang, data) {
			if (data.state === 1) {
				Hyphenator.fn.load(lang, Hyphenator.fn.basePath + 'patterns/' + data.file);
			}
		});
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
			p = src.indexOf('Hyphenator.js');
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
			return lo.exceptions[word].replace(/-/g, hyphen);
		}
		if (word.indexOf('-') !== -1) {
			//word contains '-' -> hyphenate the parts separated with '-'
			parts = word.split('-');
			for (i = 0, l = parts.length; i < l; i++) {
				parts[i] = hyphenateWord(lang, parts[i]);
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
	}
}));
