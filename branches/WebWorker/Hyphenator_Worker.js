var lang, index, text;
/*
 * event.data holds a string with words to hyphenate,
 * or the language (a string with two letters)
 * or the number of the element (an integer)
 */
onmessage = function (e) {

	var parts = e.data.split(',');
	lang = parts.shift();
	index = parts.shift();
	text = parts.join(',');
	
	if (!Hyphenator.languages[lang]) {
		importScripts('patterns/' + lang + '.js');
	}
	postMessage(index + ',' + Hyphenator.hyphenate(text, lang));
	
}


var Hyphenator = (function () {
	var url = '(\\w*:\/\/)?((\\w*:)?(\\w*)@)?((([\\d]{1,3}\\.){3}([\\d]{1,3}))|(([\\w]*\\.)+([\\w]{2,4})))(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*',
	mail = '[\\w-\\.]+@[\\w\\.]+',
	urlOrMailRE = new RegExp('(' + url + ')|(' + mail + ')', 'i'),
	hyphen = String.fromCharCode(173),
	urlhyphen = String.fromCharCode(8203),
	zeroWidthSpace = '';
	enableCache = true,
	convertPatterns = function (lang) {
		var plen, anfang, pats, pat, key, tmp = {};
		pats = Hyphenator.languages[lang].patterns;
		for (plen in pats) {
			if (pats.hasOwnProperty(plen)) {
				plen = parseInt(plen, 10);
				anfang = 0;
				while (!!(pat = pats[plen].substr(anfang, plen))) {
					key = pat.replace(/\d/g, '');
					tmp[key] = pat;
					anfang += plen;
				}
			}
		}
		Hyphenator.languages[lang].patterns = tmp;
		Hyphenator.languages[lang].patternsConverted = true;
	},
	prepareLanguagesObj = function (lang) {
		var enableCache = true;
		var lo = Hyphenator.languages[lang], wrd;
		if (!lo.prepared) {	
			if (enableCache) {
				lo.cache = {};
			}
			convertPatterns(lang);
			wrd = '[\\w' + lo.specialChars + '@' + String.fromCharCode(173) + '-]{2,}';
			lo.genRegExp = new RegExp('(' + url + ')|(' + mail + ')|(' + wrd + ')', 'gi');
			lo.prepared = true;
		}
	},
	hyphenateWord = function (lang, word) {
		var lo = Hyphenator.languages[lang],
			parts, i, l, w, wl, s, hypos, p, maxwins, win, pat = false, patk, patl, c, digits, z, numb3rs, n, inserted, hyphenatedword;
		if (word === '') {
			return '';
		}
		if (word.indexOf(hyphen) !== -1) {
			//word already contains shy; -> leave at it is!
			return word;
		}
		if (enableCache && lo.cache.hasOwnProperty(word)) { //the word is in the cache
			return lo.cache[word];
		}
		if (word.indexOf('-') !== -1) {
			//word contains '-' -> put a zeroWidthSpace after it and hyphenate the parts separated with '-'
			parts = word.split('-');
			for (i = 0, l = parts.length; i < l; i++) {
				parts[i] = hyphenateWord(lang, parts[i]);
			}
			return parts.join('-' + zeroWidthSpace);
		}
		//finally the core hyphenation algorithm
		w = '_' + word + '_';
		wl = w.length;
		s = w.split('');
		w = w.toLowerCase();
		hypos = [];
		numb3rs = {'0': true, '1': true, '2': true, '3': true, '4': true, '5': true, '6': true, '7': true, '8': true, '9': true}; //check for member is faster then isFinite()
		n = wl - lo.shortestPattern;
		for (p = 0; p <= n; p++) {
			maxwins = Math.min((wl - p), lo.longestPattern);
			for (win = lo.shortestPattern; win <= maxwins; win++) {
				if (lo.patterns.hasOwnProperty(patk = w.substr(p, win))) {
					pat = lo.patterns[patk];
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
		inserted = 0;
		for (i = lo.leftmin; i <= (word.length - lo.rightmin); i++) {
			if (!!(hypos[i] & 1)) {
				s.splice(i + inserted + 1, 0, hyphen);
				inserted++;
			}
		}
		hyphenatedword = s.slice(1, -1).join('');
		if (enableCache) {
			lo.cache[word] = hyphenatedword;
		}
		return hyphenatedword;
	},
		
	hyphenateURL = function (url) {
		return url.replace(/([:\/\.\?#&_,;!@]+)/gi, '$&' + urlhyphen);
	}
	
	return {
		languages: {},
		hyphenate: function (text, lang) {
			var hyphenate, n, i;
			if (Hyphenator.languages.hasOwnProperty(lang)) {
				if (!Hyphenator.languages[lang].prepared) {
					prepareLanguagesObj(lang);
				}
				hyphenate = function (word) {
					if (urlOrMailRE.test(word)) {
						return hyphenateURL(word);
					} else {
						return hyphenateWord(lang, word);
					}
				};
				return text.replace(Hyphenator.languages[lang].genRegExp, hyphenate);
			} else {
				onError(new Error('Language "' + lang + '" is not loaded.'));
			}
		}
	};
}());