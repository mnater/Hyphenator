//Hyphenator_quirks.js
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	zeroWidthSpace: (function () {
		var zws, ua = window.navigator.userAgent.toLowerCase();
		zws = String.fromCharCode(8203); //Unicode zero width space
		if (ua.indexOf('msie 6') !== -1) {
			zws = ''; //IE6 doesn't support zws
		}
		if (ua.indexOf('opera') !== -1 && ua.indexOf('version/10.00') !== -1) {
			zws = ''; //opera 10 on XP doesn't support zws
		}
		return zws;
	}())
}));
