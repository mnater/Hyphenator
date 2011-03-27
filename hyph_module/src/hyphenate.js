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
			Hyphenator.fn.postMessage([0, lang, "Language '" + lang + "' is not loaded."]);
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
