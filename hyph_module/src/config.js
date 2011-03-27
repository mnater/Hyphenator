//begin Hyphenator_config.js
/*jslint sub: true */
/**
 * @constructor
 */
Hyphenator.fn.Setting = function (type, assert) {
	this.defaultValue = null;
	this.currentValue = null;
	this.type = type;
	this.assert = assert;
};

Hyphenator.fn.Setting.prototype = {
	setDefaultValue: function (val) {
		if (typeof val === this.type && this.assert.test(val)) {
			this.currentValue = this.defaultValue = val;
		} else {
			Hyphenator.fn.postMessage([0, val, "default setting '" + val + "' doesn't fit (" + this.type + "/" + this.assert + ")"]);
		}

	},
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
 * @constructor
 */
Hyphenator.fn.Settings = function () {
	this.data = {};
	this.fields = {};
};

Hyphenator.fn.Settings.prototype = {
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
	change: function (ename, value) {
		return (this.data[this.fields[ename]].setCurrValue(value));
	},
	exportConfigObj: function () {
		var data = new Hyphenator.fn.EO(this.data), tmp = {};
		data.each(function (k, v) {
			tmp[k] = v.currentValue;
		});
		return tmp;
	}
};

Hyphenator.fn.addModule({
	settings: new Hyphenator.fn.Settings()
});

Hyphenator.addModule({
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
	update: function (obj, w) {
		w = w || 'all';
		Hyphenator.config(obj);
		Hyphenator.fn.collectedDocuments.each(function (href, data) {
			data.removeHyphenation();
		});
		Hyphenator.fn.collectedDocuments.each(function (href, data) {
			data.hyphenate();
		});
		if (Hyphenator.displaytogglebox) {
			if (w === 'all') {
				//cycle
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
