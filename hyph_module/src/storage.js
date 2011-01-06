//Hyphenator_storage.js
Hyphenator.fn.extend('Storage', function () {
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
});

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
