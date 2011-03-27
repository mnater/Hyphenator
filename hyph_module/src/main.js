//main.js
/*jslint sub: true */

/**
 * The Hyphenator Class is the one and only object exposed to the global object.
 * @class Hyphenator
 * @author Mathias Nater, <a href = "mailto:mathias@mnn.ch">mathias@mnn.ch</a>
 * @version @VERSION@
 */
var Hyphenator = (function (window) {
	/**
	 * Factory for the Hyphenator object
	 * @returns {Object}
	 */
	var factory = function () {
		/**
		 * Constructor for intermediate class
		 * @constructor
		 */
		var F = function () {
			/**
			 * Method addModule(object) allows to add properties to the Hyphenator-Object
			 * The keys are the names of the properties and the values are the properties.
			 * @param {Object} module
			 */		
			this.addModule = factory.fn.addModule; 
		};
		F.prototype = new factory.fn.getProto();
		return new F();
	};

	/**
	 * Object that is stored in the prototype of the Hyphenator-Class
	 * Using Hyphenator.fn as namespace allows us to quasi extend the prototype and
	 * not to clutter the Hyphenator-Class with internal properties.
	 * @namespace  Holds internal properties and methods
	 */
	factory.fn = {
		/**
		 * Constructor for the Hyphenator.fn methods subcollection
		 * @constructor
		 */
		getProto: function () {
			this.fn = factory.fn;
		},
		/**
		 * Constructor to create Extended Objects
		 * @constructor
		 * @param {Object} obj The object to be extended
		 */
		EO: function (obj) {
			/**
			 * Method each(fn) lets us cycle through each property of the object and apply a function to it
			 * @param {function(*, *)} fn A function that takes a key and a value as arguments
			 */
			this.each = function (fn) {
				var k;
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						fn(k, obj[k]);
					}
				}
			};
		},
		/**
		 * Method addModule(object) allows to add properties to the Hyphenator.fn-Object
		 * The keys are the names of the properties and the values are the properties.
		 * @param {Object} module
		 */
		addModule: function (module) {
			var that = this;
			module = new Hyphenator.fn.EO(module);
			module.each(function (k, v) {
				that[k] = v;
			});
		}
		
	};
	
	// Expose Hyphenator to the global object
	return factory();	
}(window));
//export
window['Hyphenator'] = Hyphenator;


Hyphenator.addModule({
	/**
	 * Method run(config) takes an (optional) config object and runs Hyphenator
	 * @lends Hyphenator
	 * @param {Object=} config Configurations
	 * @memberOf Hyphenator
	 * @function
	 * @public
	 */
	run: function (config) {
		if (!!config) {
			Hyphenator.config(config);
		}
		Hyphenator.fn.prepareDocuments(window);
	},
	version : '@VERSION@'
});
//export
window['Hyphenator']['run'] = Hyphenator.run;
