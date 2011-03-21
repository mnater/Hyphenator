//Hyphenator_debug.js
/*jslint sub: true */
Hyphenator.addModule({
	log: function (msg) {
		if (window.console && window.console.log) {
			window.console.log(msg);
		} else {
			alert(msg);
		}
	}
});
window['Hyphenator']['log'] = Hyphenator.log;
