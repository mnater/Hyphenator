//begin Hyphenator_config.js
/*jslint sub: true */
/**
 * A wrapper for Settings:
 * this.defaultValue {*} The default value of this option
 * this.currentValue {*} set by config
 * this.type {String} The type of the option (for assertion)
 * this.assert {String} a Regular Expression that can be used to assert the option
 * @constructor
 */
Hyphenator.fn.Setting = function (type, assert) {
	this.defaultValue = null;
	this.currentValue = null;
	this.type = type;
	this.assert = assert;
};

Hyphenator.fn.Setting.prototype = {
	/**
	 * method setDefaultValue(val) asserts the value and sets it in default AND current
	 * If assertion fails an error message is thrown
	 * @param {*} val The value
	 * @function
	 * @memberOf Hyphenator.fn.Setting.prototype
	 * @private
	 */
	setDefaultValue: function (val) {
		if (typeof val === this.type && this.assert.test(val)) {
			this.currentValue = this.defaultValue = val;
		} else {
			Hyphenator.fn.postMessage([0, val, "default setting '" + val + "' doesn't fit (" + this.type + "/" + this.assert + ")"]);
		}

	},
	/**
	 * method setCurrValue(val) asserts the value and sets it in current
	 * If assertion fails an error message is thrown
	 * @param {*} val The value
	 * @function
	 * @memberOf Hyphenator.fn.Setting.prototype
	 * @private
	 */
	setCurrValue: function (val) {
		if (typeof val === this.type && this.assert.test(val.toString())) {
			this.currentValue = val;
			return true;
		} else {
			Hyphenator.fn.postMessage([0, val, "setting '" + val + "' doesn't fit (" + this.assert + ")"]);
			return false;
		}
	}
};

/**
 * A container for Hyphentator.fn.Setting
 * this.data {Object} where key is the internal name of the setting and value its value
 * this.fields {Object} where key is the external name of the setting and value its internal name
 * @constructor
 */
Hyphenator.fn.Settings = function () {
	this.data = {};
	this.fields = {};
};

Hyphenator.fn.Settings.prototype = {
	/**
	 * method expose(settings) exposes either all settings or a subset to Hyphenators namespace, using its external names
	 * If assertion fails an error message is thrown
	 * @param {(string|Array)} settings Either a string to export a setting ('*' for all settings) or an array of setting names
	 * @function
	 * @memberOf Hyphenator.fn.Settings.prototype
	 * @private
	 */
	expose: function (settings) {
		var tmp = {}, data, i, that = this;
		if (typeof settings === 'string') {
			if (settings === '*') {
				data = new Hyphenator.fn.EO(this.data);
				data.each(function (iname, v) {
					tmp[iname] = that.data[iname].currentValue;
				});
			} else {
				tmp[this.fields[settings]] = this.data[this.fields[settings]].currentValue;
			}
		} else if (typeof settings === 'object') {
			for (i = 0; i < settings.length; i++) {
				tmp[this.fields[settings[i]]] = this.data[this.fields[settings[i]]].currentValue;
			}
		}
		Hyphenator.addModule(tmp);
		//Hyphenator.log(Hyphenator);
	},
	/**
	 * method add(obj) adds one or multiple Settings to the collection
	 * @param {Object} obj An object where the keys are the internal names of the settings and value an array of the format [0=>eName, 1=>default ,2=>type, 3=>assert]
	 * @function
	 * @memberOf Hyphenator.fn.Settings.prototype
	 * @private
	 */
	add: function (obj) {
		var that = this;
		obj = new Hyphenator.fn.EO(obj);
		obj.each(function (iname, v) {
			//[0=>eName, 1=>default ,2=>type, 3=>assert]
			that.data[iname] = new Hyphenator.fn.Setting(v[2], new RegExp(v[3]));
			that.data[iname].setDefaultValue(v[1]);
			that.fields[v[0]] = iname;
		});
	},
	/**
	 * method change(ename, value) changes the currentValue of the given Setting
	 * @param {String} ename The external name of the Setting to change
	 * @param {*} value The new value for that Setting
	 * @returns {boolean} returns true on success (assertion) or false on fail
	 * @function
	 * @memberOf Hyphenator.fn.Settings.prototype
	 * @private
	 */	
	change: function (ename, value) {
		return (this.data[this.fields[ename]].setCurrValue(value));
	},
	/**
	 * method exportConfigObj() returns an object containing all settings (for storage)
	 * @returns {Object} Object where keys are the internal names and values the currentValue
	 * @function
	 * @memberOf Hyphenator.fn.Settings.prototype
	 * @private
	 */	
	exportConfigObj: function () {
		var data = new Hyphenator.fn.EO(this.data), tmp = {};
		data.each(function (k, v) {
			tmp[k] = v.currentValue;
		});
		return tmp;
	}
};

Hyphenator.fn.addModule({
	/**
	 * Contains the settings (these settings are not used by Hyphenator, only their exports!)
	 * @field
	 * @memberOf Hyphenator.fn
	 * @private
	 */
	settings: new Hyphenator.fn.Settings()
});

Hyphenator.addModule({
	/**
	 * This method configures Hyphenator and throws a "Settings changed" message
	 * If the object contains storage information, settings are restored from storage.
	 * If necessary the new options are stored in storage.
	 * @function
	 * @memberOf Hyphenator
	 * @public
	 * @param {Object} obj A configuration object where key is the options name and value its value
	 */
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
		obj.each(function (ename, value) {
			if (Hyphenator.fn.settings.fields.hasOwnProperty(ename)) {
				if (Hyphenator.fn.settings.change(ename, value)) {
					changes.push(ename);
				}
			} else {
				Hyphenator.fn.postMessage([0, ename, "Error: configuration option '" + ename + "' doesn't exist."]);
			}

		});
		if (changes.length > 0) {
			Hyphenator.fn.settings.expose(changes);
			Hyphenator.fn.postMessage([1, changes, "settings changed."]);
		}
		if (Hyphenator.persistentconfig && !stopStorage) {
			(new Hyphenator.fn.Storage()).storeSettings(Hyphenator.fn.settings.exportConfigObj());
		}
	},
	/**
	 * This method updates settings for the given window
	 * @function
	 * @memberOf Hyphenator
	 * @public
	 * @param {Object} obj The settings to be updated
	 * @param {(Window|string)} w The window, where this applies to or a string ('all'), when it applies to all windows
	 */
	update: function (obj, w) {
		w = w || 'all';
		Hyphenator.fn.collectedDocuments.each(function (href, data) {
			data.removeHyphenation();
		});
		Hyphenator.config(obj);
		Hyphenator.fn.collectedDocuments.each(function (href, data) {
			data.hyphenate();
		});
		if (Hyphenator.displaytogglebox) {
			if (w === 'all') {
				Hyphenator.fn.collectedDocuments.each(function (href, data) {
					Hyphenator.togglebox(data.w);
				});
			} else {
				Hyphenator.togglebox(w);
			}
		}	
	},
	getSetting: function (name) {
		return Hyphenator.fn.settings.data[name].currentValue;	
	},
	onhyphenationdonecallback: function () {},
	onerrorhandler: function (e) {
		window.alert(e.text);
	}
});
window['Hyphenator']['config'] = Hyphenator.config;
window['Hyphenator']['update'] = Hyphenator.update;
window['Hyphenator']['onhyphenationdonecallback'] = Hyphenator.onhyphenationdonecallback;
window['Hyphenator']['onerrorhandler'] = Hyphenator.onerrorhandler;

Hyphenator.fn.settings.add({
	//iname: [ename, default, type, assert]
	classname: ['classname', 'hyphenate', 'string', '^[a-zA-Z_]+[a-zA-Z0-9_]+$'],
	donthyphenateclassname: ['donthyphenateclassname', 'donthyphenate', 'string', '^[a-zA-Z_]+[a-zA-Z0-9_]+$'],
	minwordlength: ['minwordlength', 6, 'number', '\\d+'],
	hyphenchar: ['hyphenchar', String.fromCharCode(173), 'string', '.'],
	urlhyphenchar: ['urlhyphenchar', Hyphenator.fn.zeroWidthSpace, 'string', '.?'],
	displaytogglebox: ['displaytogglebox', false, 'boolean', 'true|false'],
	remoteloading: ['remoteloading', true, 'boolean', 'true|false'],
	enablecache: ['enablecache', true, 'boolean', 'true|false'],
	enablereducedpatternset: ['enablereducedpatternset', false, 'boolean', 'true|false'],
	intermediatestate: ['intermediatestate', 'hidden', 'string', 'hidden|visible|progressive'],
	safecopy: ['safecopy', true, 'boolean', 'true|false'],
	doframes: ['doframes', false, 'boolean', 'true|false'],
	storagetype: ['storagetype', 'none', 'string', 'none|local|session'],
	orphancontrol: ['orphancontrol', 1, 'number', '1|2|3'],
	dohyphenation: ['dohyphenation', true, 'boolean', 'true|false'],
	persistentconfig: ['persistentconfig', false, 'boolean', 'true|false'],
	defaultlanguage: ['defaultlanguage', '', 'string', '.*'],
	togglebox: ['togglebox', Hyphenator.togglebox, 'function', '.'],
	selectorfunction: ['selectorfunction', Hyphenator.selectorfunction, 'function', '.'],
	onhyphenationdonecallback: ['onhyphenationdonecallback', Hyphenator.onhyphenationdonecallback, 'function', '.'],
	onerrorhandler: ['onerrorhandler', Hyphenator.onerrorhandler, 'function', '.']
});
Hyphenator.fn.settings.expose('*');


//end Hyphenator_config.js
