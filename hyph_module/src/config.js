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
			'defaultlanguage': 'defaultLanguage',
			'togglebox': 'toggleBox',
			'selectorfunction': 'selectorFunction',
			'onhyphenationdonecallback': 'onHyphenationDoneCallback'
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

	},
	onHyphenationDoneCallback: function () {}
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
Hyphenator.fn.settings.add('toggleBox', Hyphenator.toggleBox, 'function', '.');
Hyphenator.fn.settings.add('selectorFunction', Hyphenator.selectorFunction, 'function', '.');
Hyphenator.fn.settings.add('onHyphenationDoneCallback', Hyphenator.onHyphenationDoneCallback, 'function', '.');
Hyphenator.fn.settings.expose('*');
//end Hyphenator_config.js
