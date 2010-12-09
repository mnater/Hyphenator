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
	/*Expando: (function () {
		var container = {},
			name = "HyphenatorExpando_" + Math.random(),
			uuid = 0;
		return {
			getDataForElem : function (elem) {
				return container[elem[name].id];
			},
			setDataForElem : function (elem, data) {
				var id;
				if (elem[name] && elem[name].id !== '') {
					id = elem[name].id;
				} else {
					id = uuid++;
					elem[name] = {'id': id}; //object needed, otherways it is reflected in HTML in IE
				}
				container[id] = data;
			},
			appendDataForElem : function (elem, data) {
				var k;
				for (k in data) {
					if (data.hasOwnProperty(k)) {
						container[elem[name].id][k] = data[k];
					}
				}
			},
			delDataOfElem : function (elem) {
				delete container[elem[name]];
			}
		};
	}()),*/
	dontHyphenate: {'script': true, 'code': true, 'pre': true, 'img': true, 'br': true, 'samp': true, 'kbd': true, 'var': true, 'abbr': true, 'acronym': true, 'sub': true, 'sup': true, 'button': true, 'option': true, 'label': true, 'textarea': true, 'input': true}
}));
Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	urlOrMailRE: new RegExp('(' + Hyphenator.fn.url + ')|(' + Hyphenator.fn.mail + ')', 'i')
}));