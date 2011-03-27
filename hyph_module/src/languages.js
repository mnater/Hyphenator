//begin Hyphenator_languages.js
/*jslint sub: true */
/**
 * @constructor
 */
Hyphenator.fn.Language = function (lo) {
	this.leftmin = lo.leftmin;
	this.rightmin = lo.rightmin;
	this.shortestPattern = lo.shortestPattern;
	this.longestPattern = lo.longestPattern;
	this.specialChars = lo.specialChars;
	this.patterns = lo.patterns;
	this.charSubstitution = lo.charSubstitution;
	this.exceptions = lo.exceptions || null;
	this.cache = null;
	this.redPatSet = null;
	this.genRegExp = null;
};

Hyphenator.fn.addModule({
	supportedLanguages: (function () {
		var tmp = new Hyphenator.fn.EO({
			'be': '',
			'cs': '',
			'da': '',
			'bn': '',
			'de': '',
			'el': 'el-monoton.js',
			'el-monoton': 'el-monoton.js',
			'el-polyton': 'el-polyton.js',
			'en': 'en-us.js',
			'en-gb': 'en-gb.js',
			'en-us': 'en-us.js',
			'es': '',
			'fi': '',
			'fr': '',
			'grc': '',
			'gu': '',
			'hi': '',
			'hu': '',
			'hy': '',
			'it': '',
			'kn': '',
			'la': '',
			'lt': '',
			'lv': '',
			'ml': '',
			'no': 'no-nb.js',
			'no-nb': 'no-nb.js',
			'nl': '',
			'or': '',
			'pa': '',
			'pl': '',
			'pt': '',
			'ru': '',
			'sl': '',
			'sv': '',
			'ta': '',
			'te': '',
			'tr': '',
			'uk': ''
		}), r = {};
		tmp.each(function (k, v) {
			if (v === '') {
				v = k + '.js';
			}
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
		var lo = Hyphenator.languages[lang] = new Hyphenator.fn.Language(Hyphenator.languages[lang]),
			wrd;
		if (Hyphenator.enablecache) {
			lo.cache = {};
			//Export
			//lo['cache'] = lo.cache;
		}
		if (Hyphenator.enablereducedpatternset) {
			lo.redPatSet = {};
		}
		//add exceptions from the pattern file to the local 'exceptions'-obj
		if (lo.exceptions !== null) {
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
		Hyphenator.fn.postMessage([3, {'id': lang, state: 6}, "Pattern object prepared: " + lang]);
	},
	exceptions: {},
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
