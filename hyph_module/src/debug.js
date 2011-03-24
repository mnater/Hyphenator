//Hyphenator_debug.js
/*jslint sub: true */
Hyphenator.addModule({
	/**
	 * Method log(msg) is a wrapper for console.log
	 * @param {*} msg What ever is to be logged
	 * @memberOf Hyphenator
	 * @function
	 * @public
	 */
	log: function (msg) {
		if (window.console && window.console.log) {
			window.console.log(msg);
		} else {
			alert(msg);
		}
	}
});
//export
window['Hyphenator']['log'] = Hyphenator.log;
