//main.js
var Hyphenator = (function (window) {
	var Hyphenator = function () {
		var F = function () {
			this.addModule = Hyphenator.fn.addModule;
		};
		F.prototype = new Hyphenator.fn.getProto();
		return new F();
	};

			
	Hyphenator.fn = {
		getProto: function () {
			this.fn = Hyphenator.fn;
		},
		extend: function (name, fnproto) {
			this[name] = fnproto;
		},
		addModule: function (module) {
			var that = this;
			module.each(function (k, v) {
				that[k] = v;
			});
		}
		
	};
	
	// Expose Hyphenator to the global object
	return new Hyphenator();	
}(window));


Hyphenator.fn.extend('EO', function (obj) {
	var that = this;
	this.src = obj;
	this.each = function (fn) {
		var k;
		for (k in obj) {
			if (obj.hasOwnProperty(k)) {
				fn(k, obj[k]);
			}
		}
	};
	this.getLength = function () {
		var l = 0;
		that.each(function () {
			l++;
		});
		return l;
	};
});

Hyphenator.addModule(new Hyphenator.fn.EO({
	run: function (config) {
		if (!!config) {
			Hyphenator.config(config);
		}
		Hyphenator.fn.collectedElements.reset();
		Hyphenator.fn.prepareDocuments(window);
		//console.log(Hyphenator);
	}
}));

