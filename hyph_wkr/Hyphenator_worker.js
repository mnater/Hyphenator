var Hyphenator_worker = (function (self) {
	var
	url = '(\\w*:\/\/)?((\\w*:)?(\\w*)@)?((([\\d]{1,3}\\.){3}([\\d]{1,3}))|((www\\.|[a-zA-Z]\\.)?[a-zA-Z0-9\\-\\.]+\\.([a-z]{2,4})))(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*',
	mail = '[\\w-\\.]+@[\\w\\.]+',
	urlOrMailRE = new RegExp('(' + url + ')|(' + mail + ')', 'i'),
	convertPatterns = function (lang) {
		var plen, anfang, ende, pats, pat, key, tmp = {};
		pats = Hyphenator_worker.languages[lang].patterns;
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
		Hyphenator_worker.languages[lang].patterns = tmp;
	},
	storePatterns = function (lang) {
		var patterns = JSON.stringify(Hyphenator_worker.languages[lang]);
		postMessage(JSON.stringify({
						type: 3,
						lang: lang,
						patterns: patterns
					}));
	},
	addExceptions = function (lang, exceptions) {
		var exception;
		for (exception in exceptions) {
			if (exceptions.hasOwnProperty(exception)) {
				if (!Hyphenator_worker.exceptions[lang]) {
					Hyphenator_worker.exceptions[lang] = {};
				}
				Hyphenator_worker.exceptions[lang][exception] = exceptions[exception];
			}
		}
	};

	self.onmessage = function (e) {
		var msg = JSON.parse(e.data);
		switch (msg.type) {
			case 0:
				msg.text = Hyphenator_worker.hyphenateText(msg.text, msg.lang);
				postMessage(JSON.stringify(msg));
			break;
			case 1:
				if (msg.hasOwnProperty('wordHyphenChar')) {
					Hyphenator_worker.wordHyphenChar = msg.wordHyphenChar;
				}
				if (msg.hasOwnProperty('urlHyphenChar')) {
					Hyphenator_worker.urlHyphenChar = msg.urlHyphenChar;
				}
				if (msg.hasOwnProperty('minWordLength')) {
					Hyphenator_worker.minWordLength = msg.minWordLength;
				}
				if (msg.hasOwnProperty('storageType')) {
					Hyphenator_worker.storageType = msg.storageType;
				}
			break;
			case 2:
				addExceptions(msg.lang, msg.exceptions);
			break;
			case 3:
				Hyphenator_worker.languages[msg.lang] = JSON.parse(msg.patterns);
				convertPatterns(msg.lang);
				wordRE = '[\\w' + Hyphenator_worker.languages[msg.lang].specialChars + '@' + String.fromCharCode(173) + '-]{' + Hyphenator_worker.minWordLength + ',}';
				Hyphenator_worker.languages[msg.lang].genRegExp = new RegExp('(' + url + ')|(' + mail + ')|(' + wordRE + ')', 'gi');
				Hyphenator_worker.languages[msg.lang].cache = {};
			break;
		}
	};
	
	return {
		wordHyphenChar: String.fromCharCode(173),
		urlHyphenChar: String.fromCharCode(8203),
		minWordLength: 6,
		languages: {},
		exceptions: {},
		storageType: 'local',
		hyphenateWord: function (word, lang) {
			var lo = Hyphenator_worker.languages[lang],
				parts, i, l, w, wl, s, hypos, p, maxwins, win, pat = false, patk, c, t, n, numb3rs, inserted, hyphenatedword, val;
			if (word.indexOf(Hyphenator_worker.wordHyphenChar) !== -1) {
				return word;
			}
			if (lo.cache.hasOwnProperty(word)) { //the word is in the cache
				return lo.cache[word];
			}
			if (Hyphenator_worker.exceptions[lang] && Hyphenator_worker.exceptions[lang].hasOwnProperty(word)) { //the word is in the user defined exceptions list
				return Hyphenator_worker.exceptions[lang][word].replace(/-/g, Hyphenator_worker.wordHyphenChar);
			}
			if (lo.exceptions && lo.exceptions.hasOwnProperty(word)) { //the word is in the patternfiles exceptions list
				return lo.exceptions[word].replace(/-/g, Hyphenator_worker.wordHyphenChar);
			}
			if (word.indexOf('-') !== -1) {
				//word contains '-' -> hyphenate the parts separated with '-'
				parts = word.split('-');
				for (i = 0, l = parts.length; i < l; i++) {
					parts[i] = Hyphenator_worker.hyphenateWord(parts[i], lang);
				}
				return parts.join('-');
			}
			//finally the core hyphenation algorithm
			w = '_' + word + '_';
			wl = w.length;
			s = w.split('');
			if (word.indexOf("'") !== -1) {
				w = w.toLowerCase().replace("'", "’"); //replace APOSTROPHE with RIGHT SINGLE QUOTATION MARK (since the latter is used in the patterns)
			} else {
				w = w.toLowerCase();
			}
			hypos = [];
			numb3rs = {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9}; //check for member is faster then isFinite()
			n = wl - lo.shortestPattern;
			for (p = 0; p <= n; p++) {
				maxwins = Math.min((wl - p), lo.longestPattern);
				for (win = lo.shortestPattern; win <= maxwins; win++) {
					if (lo.patterns.hasOwnProperty(patk = w.substring(p, p + win))) {
						pat = lo.patterns[patk];
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
			for (i = lo.leftmin; i <= (word.length - lo.rightmin); i++) {
				if (!!(hypos[i] & 1)) {
					s.splice(i + inserted + 1, 0, Hyphenator_worker.wordHyphenChar);
					inserted++;
				}
			}
			hyphenatedword = s.slice(1, -1).join('');
			lo.cache[word] = hyphenatedword;
			return hyphenatedword;
		},
		hyphenateURL: function (url) {
			return url.replace(/([:\/\.\?#&_,;!@]+)/gi, '$&' + Hyphenator_worker.urlHyphenChar);
		},
		hyphenateText: function (text, lang) {
			var wordRE,
			hyphenate = function (word) {
				if (urlOrMailRE.test(word)) {
					return Hyphenator_worker.hyphenateURL(word);
				} else {
					return Hyphenator_worker.hyphenateWord(word, lang);
				}
			}, path;
			if (!Hyphenator_worker.languages.hasOwnProperty(lang)) {
				switch (lang) {
					case 'en':
						path = 'patterns/en-us.js';
					break;
					default:
						path = 'patterns/' + lang + '.js';
				}
				try {
					self.importScripts(path);
				} catch (e) {
					postMessage(JSON.stringify({
						type: 42,
						sender: 'Hyphenator_worker: importScripts',
						message: 'Couldn\'t load file: \'' + path + '\''
					}));
				}
				storePatterns(lang);
				convertPatterns(lang);
				wordRE = '[\\w' + Hyphenator_worker.languages[lang].specialChars + '@' + String.fromCharCode(173) + '-]{' + Hyphenator_worker.minWordLength + ',}';
				Hyphenator_worker.languages[lang].genRegExp = new RegExp('(' + url + ')|(' + mail + ')|(' + wordRE + ')', 'gi');
				Hyphenator_worker.languages[lang].cache = {};
			}
			return text.replace(Hyphenator_worker.languages[lang].genRegExp, hyphenate);
		}
	};
})(self);