//Hyphenator_debug.js
Hyphenator.addModule(new Hyphenator.fn.EO({
	log: function (msg) {
		if (window.console && window.console.log) {
			window.console.log(msg);
		} else {
			alert(msg);
		}
	}
}));
