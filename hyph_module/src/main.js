//main.js
/*jslint sub: true */
var Hyphenator = (function (window) {
	/**
	 * Internal Hyphenator object
	 * Is returned from the outer function
	 * @constructor
	 */
	var Hyphenator = function () {
		/**
		 * Constructor
		 * @constructor
		 */
		var F = function () {
			this.addModule = Hyphenator.fn.addModule; 
		};
		F.prototype = new Hyphenator.fn.getProto();
		return new F();
	};

			
	Hyphenator.fn = {
		/**
		 * Constructor for the Hyphenator.fn methods subcollection
		 * @constructor
		 */
		getProto: function () {
			this.fn = Hyphenator.fn;
		},
		EO: function (obj) {
			this.each = function (fn) {
				var k;
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						fn(k, obj[k]);
					}
				}
			};
		},
		addModule: function (module) {
			var that = this;
			module = new Hyphenator.fn.EO(module);
			module.each(function (k, v) {
				that[k] = v;
			});
		}
		
	};
	
	// Expose Hyphenator to the global object
	return new Hyphenator();	
}(window));
//export
window['Hyphenator'] = Hyphenator;


Hyphenator.addModule({
	run: function (config) {
		if (!!config) {
			Hyphenator.config(config);
		}
		Hyphenator.fn.prepareDocuments(window);
		//Hyphenator.log(Hyphenator);
	}
});

window['Hyphenator']['run'] = Hyphenator.run;
