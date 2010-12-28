//begin Hyphenator_languages.js
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	supportedLanguages: {
		 /* 0: init, 1:to be loaded, 2:request sent, 3:loading, 4:loaded, 5:added, 6:preparing, 7:ready, 8: will not load (remoteLoading disabled), 42: failed*/
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
}));
//end Hyphenator_languages.js
