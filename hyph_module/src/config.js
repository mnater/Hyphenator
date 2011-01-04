//begin Hyphenator_config.js
Hyphenator.fn.extend('Setting', function (type, assert) {
	this.defaultValue = null;
	this.currentValue = null;
	this.type = type;
	this.assert = assert;
});

Hyphenator.fn.Setting.prototype = {
	setDefaultValue: function (val) {
		if (typeof val === this.type && this.assert.test(val)) {
			this.currentValue = this.defaultValue = val;
		} else {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, val, "default setting '" + val + "' doesn't fit (" + this.type + "/" + this.assert + ")"));
		}

	},
	setCurrValue: function (val) {
		if (typeof val === this.type && this.assert.test(val.toString())) {
			this.currentValue = val;
			return true;
		} else {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, val, "setting '" + val + "' doesn't fit (" + this.assert + ")"));
			return false;
		}
	}
};

Hyphenator.fn.extend('Settings', function () {
	this.data = {};
});

Hyphenator.fn.Settings.prototype = {
	expose: function (settings) {
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
		//console.log(Hyphenator);
	},
	add: function (name, defaultValue, type, assert) {
		this.data[name] = new Hyphenator.fn.Setting(type, new RegExp(assert));
		this.data[name].setDefaultValue(defaultValue);
	},
	change: function (name, value) {
		return (this.data[name].setCurrValue(value));
	},
	exportConfigObj: function () {
		var data = new Hyphenator.fn.EO(this.data), tmp = {};
		data.each(function (k, v) {
			tmp[k] = v.currentValue;
		});
		return tmp;
	}
};

Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	settings: new Hyphenator.fn.Settings()
}));

Hyphenator.addModule(new Hyphenator.fn.EO({
	config: function (obj) {
		var changes = [], stopStorage = false;

		if (obj.hasOwnProperty('STOPSTORAGE')) {
			stopStorage = true;
			delete obj.STOPSTORAGE;
		} else if (obj.hasOwnProperty('persistentconfig') && 
			obj.persistentconfig === true &&
			obj.hasOwnProperty('storagetype') &&
			obj.storagetype !== '') {
			Hyphenator.config({
				persistentconfig: true,
				storagetype: obj.storagetype,
				STOPSTORAGE: true
			});
			(new Hyphenator.fn.Storage()).restoreSettings();
		}		
		obj = new Hyphenator.fn.EO(obj);
		obj.each(function (key, value) {
			if (Hyphenator.fn.settings.data.hasOwnProperty(key)) {
				if (Hyphenator.fn.settings.change(key, value)) {
					changes.push(key);
				}
			} else {
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, key, "Error: configuration option '" + key + "' doesn't exist."));
			}

		});

		if (changes.length > 0) {
			Hyphenator.fn.settings.expose(changes);
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(1, changes, "settings changed."));
		}
		if (Hyphenator.persistentconfig && !stopStorage) {
			(new Hyphenator.fn.Storage()).storeSettings(Hyphenator.fn.settings.exportConfigObj());
		}

	},
	onhyphenationdonecallback: function () {},
	onerrorhandler: function (e) {
		window.alert(e.text);
	}
}));


Hyphenator.fn.settings.add('classname', 'hyphenate', 'string', '^[a-zA-Z_]+[a-zA-Z0-9_]+$');
Hyphenator.fn.settings.add('donthyphenateclassname', 'donthyphenate', 'string', '^[a-zA-Z_]+[a-zA-Z0-9_]+$');
Hyphenator.fn.settings.add('minwordlength', 6, 'number', '\\d+');
Hyphenator.fn.settings.add('hyphenchar', String.fromCharCode(173), 'string', '.');
Hyphenator.fn.settings.add('urlhyphenchar', Hyphenator.fn.zeroWidthSpace, 'string', '.');
Hyphenator.fn.settings.add('displaytogglebox', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('remoteloading', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('enablecache', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('enablereducedpatternset', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('intermediatestate', 'hidden', 'string', 'hidden|visible|progressive');
Hyphenator.fn.settings.add('safecopy', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('doframes', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('storagetype', 'none', 'string', 'none|local|session');
Hyphenator.fn.settings.add('orphancontrol', 1, 'number', '1|2|3');
Hyphenator.fn.settings.add('dohyphenation', true, 'boolean', 'true|false');
Hyphenator.fn.settings.add('persistentconfig', false, 'boolean', 'true|false');
Hyphenator.fn.settings.add('defaultlanguage', '', 'string', '.*');
Hyphenator.fn.settings.add('togglebox', Hyphenator.togglebox, 'function', '.');
Hyphenator.fn.settings.add('selectorfunction', Hyphenator.selectorfunction, 'function', '.');
Hyphenator.fn.settings.add('onhyphenationdonecallback', Hyphenator.onhyphenationdonecallback, 'function', '.');
Hyphenator.fn.settings.add('onerrorhandler', Hyphenator.onerrorhandler, 'function', '.');
Hyphenator.fn.settings.expose('*');
//end Hyphenator_config.js
