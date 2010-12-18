//Hyphenator_constants.js
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	url: '(\\w*:\/\/)?((\\w*:)?(\\w*)@)?((([\\d]{1,3}\\.){3}([\\d]{1,3}))|((www\\.|[a-zA-Z]\\.)?[a-zA-Z0-9\\-\\.]+\\.([a-z]{2,4})))(:\\d*)?(\/[\\w#!:\\.?\\+=&%@!\\-]*)*',
	//      protocoll     usr     pwd                    ip               or                          host                 tld        port               path
	mail: '[\\w-\\.]+@[\\w\\.]+',
	urlOrMailRE: new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')', 'i'),
	isBookmarklet: (function () {
		var loc = null, re = false, jsArray = document.getElementsByTagName('script'), i, l;
		for (i = 0, l = jsArray.length; i < l; i++) {
			if (!!jsArray[i].getAttribute('src')) {
				loc = jsArray[i].getAttribute('src');
			}
			if (!loc) {
				continue;
			} else if ((loc.indexOf('Hyphenator') !== -1) && loc.indexOf('bm=true') !== -1) {
				re = true;
			}
		}
		return re;
	}()),
	dontHyphenate: {'script': true, 'code': true, 'pre': true, 'img': true, 'br': true, 'samp': true, 'kbd': true, 'var': true, 'abbr': true, 'acronym': true, 'sub': true, 'sup': true, 'button': true, 'option': true, 'label': true, 'textarea': true, 'input': true}
}));
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	urlOrMailRE: new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')', 'i')
}));