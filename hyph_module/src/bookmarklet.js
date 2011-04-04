Hyphenator.fn.addModule({
	/**
	 * Gets options from the bookmarklets GET-String and returns them as an object
	 * This only works for options that are a boolean, a number or a string (not for functions!)
	 * @returns {Object} The configuration options
	 * @memberOf Hyphenator.fn
	 * @function
	 * @public
	 */
	getConfigFromURI: function () {
		var loc = null, re = {}, jsArray = document.getElementsByTagName('script'), i, j, l, s, gp, option;
		for (i = 0, l = jsArray.length; i < l; i++) {
			if (!!jsArray[i].getAttribute('src')) {
				loc = jsArray[i].getAttribute('src');
			}
			if (!loc) {
				continue;
			} else {
				s = loc.indexOf('Hyphenator.js?');
				if (s === -1) {
					continue;
				}
				gp = loc.substring(s + 14).split('&');
				for (j = 0; j < gp.length; j++) {
					option = gp[j].split('=');
					if (option[0] === 'bm') {
						continue;
					}
					if (option[1] === 'true') {
						re[option[0]] = true;
						continue;
					}
					if (option[1] === 'false') {
						re[option[0]] = false;
						continue;
					}
					if (isFinite(option[1])) {
						re[option[0]] = parseInt(option[1], 10);
						continue;
					}
					re[option[0]] = option[1];
				}
				break;
			}
		}
		return re;
	}
});

/**
 * Checks if Hyphenator is loaded as a Bookmarklet and runs it
 */
if (Hyphenator.fn.isBookmarklet) {
	Hyphenator.config({'displaytogglebox': true, 'intermediatestate': 'visible', 'doframes': true});
	Hyphenator.config(Hyphenator.fn.getConfigFromURI());
	Hyphenator.run();
}

