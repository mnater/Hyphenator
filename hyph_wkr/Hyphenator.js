var Hyphenator = (function (window) {
	return {
		basePath: '../',
		Worker: undefined,
		Expando: undefined,
		intermediateState: 'hidden',
		storageType: 'local',
		getLang: function (element, fallback) {
			var metaNodeList, metaTag, i = 0, data;
			if (!!element.getAttribute('lang')) {
				return element.getAttribute('lang').toLowerCase();
			}
			try {
				if (!!element.getAttribute('xml:lang')) {
					return element.getAttribute('xml:lang').toLowerCase();
				}
			} catch (ex) {}
			if (!!(data = Hyphenator.Expando.getDataForElem(element)) && !!data.lang) {
				return data.lang;
			}
			if (element.tagName !== 'HTML') {
				return Hyphenator.getLang(element.parentNode, true);
			} else {
				metaNodeList = element.getElementsByTagName('meta');
				while (!!(metaTag = metaNodeList.item(i++))) {
					//<meta http-equiv = "content-language" content="xy">	
					if (!!metaTag.getAttribute('http-equiv') && (metaTag.getAttribute('http-equiv').toLowerCase() === 'content-language')) {
						return metaTag.getAttribute('content').toLowerCase();
					}
					//<meta name = "DC.Language" content="xy">
					if (!!metaTag.getAttribute('name') && (metaTag.getAttribute('name').toLowerCase() === 'dc.language')) {
						return metaTag.getAttribute('content').toLowerCase();
					}			
					//<meta name = "language" content = "xy">
					if (!!metaTag.getAttribute('name') && (metaTag.getAttribute('name').toLowerCase() === 'language')) {
						return metaTag.getAttribute('content').toLowerCase();
					}
				}
			}
			//language not defined
			Hyphenator.customEvents.fire('onerror', {
				sender: 'Hyphenator.getLang()',
				message: 'Language not defined.'
			});
			return;
		},
		select: function () {
			var r = [];
			r = window.document.getElementsByClassName('hyphenate');
			return r;
		},
		dontselect: function () {
			var r = [];
			r = window.document.getElementsByClassName('donthyphenate');
			return r;
		},
		run: function (config) {
			var elToProcess, elNoProcess, element, i = 0, messageCount = 0,
			process = function (element, hide, lang) {
				var linkToElement, msg, node, i = -1, j, hyphenateChild;
				lang = Hyphenator.getLang(element);
				if (!lang) {
					return;
				}
				Hyphenator.Expando.setDataForElem(element, {lang: lang});
				if (hide && Hyphenator.intermediateState === 'hidden') {
					if (!!element.getAttribute('style')) {
						Hyphenator.Expando.setDataForElem(element, {hasOwnStyle: true});
					} else {
						Hyphenator.Expando.setDataForElem(element, {hasOwnStyle: false});
					}
					Hyphenator.Expando.setDataForElem(element, {isHidden: true});
					element.style.visibility = 'hidden';
				}
				while (!!(n = element.childNodes[++i])) {
					hyphenateChild = true;
					if (n.nodeType === 3) {
						linkToElement = Hyphenator.Expando.setDataForElem(element, {element: element});
						msg = {
							type: 0,
							link: linkToElement,
							nodeNumber: i,
							text: n.data,
							lang: lang
						}
						messageCount++;
						Hyphenator.Worker.postMessage(JSON.stringify(msg));
					} else if (n.nodeType === 1) {
						if (elNoProcess.length > 0) {
							for(j = 0; j < elNoProcess.length; j++) {
								if (elNoProcess[j] === n) {
									hyphenateChild = false;
								}
							}
						}
						if (hyphenateChild) {
							process(n, false, lang);
						}
					}
				}
			};
			
			//initialize properties
			if (config) {
				Hyphenator.config(config);
			}
						
			//do the run
			Hyphenator.Worker.onmessage = function (e) {
				var msg = JSON.parse(e.data), element;
				switch (msg.type) {
					case 0:
						element = Hyphenator.Expando.getDataForId(msg.link).element;
						element.childNodes[msg.nodeNumber].data = msg.text;
						if (Hyphenator.Expando.getDataForId(msg.link).isHidden && Hyphenator.intermediateState === 'hidden') {
							element.style.visibility = 'visible';
							if (!Hyphenator.Expando.getDataForId(msg.link).hasOwnStyle) {
								element.setAttribute('style', ''); // without this, removeAttribute doesn't work in Safari (thanks to molily)
								element.removeAttribute('style');
							} else {
								if (element.style.removeProperty) {
									element.style.removeProperty('visibility');
								} else if (element.style.removeAttribute) { // IE
									element.style.removeAttribute('visibility');
								}  
							}
						}
						messageCount--;
						if (messageCount === 0) {
							Hyphenator.customEvents.fire('onhyphenationdone', 'Hyphenator.run()');
						}
					break;
					case 3:
						Hyphenator.storage.setItem('Hyphenator_' + msg.lang, msg.patterns);
					break;
					case 42:
						Hyphenator.customEvents.fire('onerror', {sender: msg.sender, message: msg.message});
					break;
				}
			};			
			elToProcess = Hyphenator.select();
			elNoProcess = Hyphenator.dontselect();
			while (!!(element = elToProcess[i++])) {
				Hyphenator.Expando.setDataForElem(element, {donthyphenate: false});
				process(element, true);
			}

		}
	};

})(window);

Hyphenator.Worker = new Worker(Hyphenator.basePath + 'Hyphenator_worker.js');
Hyphenator.Expando = (function () {
	var container = {},
		name = "HyphenatorExpando_" + Math.random(),
		uuid = 1;
	return {
		getDataForElem : function (elem) {
			return container[elem[name]];
		},
		getDataForId : function (id) {
			return container[id];
		},
		setDataForElem : function (elem, data) {
			var id, k;
			if (elem[name] && elem[name] !== '') {
				id = elem[name];
			} else {
				id = uuid++;
				elem[name] = id;
			}
			if (!container[id]) {
				container[id] = {};
			}
			for (k in data) {
				if (data.hasOwnProperty(k)) {
					container[id][k] = data[k];
				}
			}
			return id;
		},
		delDataOfElem : function (elem) {
			delete container[elem[name]];
		}
	};
}());

Hyphenator.storage = (function () {
	try {
		if (Hyphenator.storageType !== 'none' &&
			typeof(window.localStorage) !== 'undefined' &&
			typeof(window.sessionStorage) !== 'undefined') {
			switch (Hyphenator.storageType) {
			case 'session':
				return window.sessionStorage;
				break;
			case 'local':
				return window.localStorage;
				break;
			default:
				return;
				break;
			}
		}
	} catch(e) {
		//FF throws an error if DOM.storage.enabled is set to false
	}
})();


Hyphenator.restorePatterns = (function () {
	var field, l, p;
	for (field in Hyphenator.storage) {
		if (field.indexOf('Hyphenator_') !== -1 && Hyphenator.storage.hasOwnProperty(field)) {
			p = Hyphenator.storage.getItem(field);
			l = field.slice(11);
			Hyphenator.Worker.postMessage(JSON.stringify({
				type: 3,
				lang: l,
				patterns: p
			}));
		}
	}
})();

Hyphenator.addExceptions = function (lang, words) {
	var lang, tmp = [], i, exceptions = {}, msg = {
		type: 2
	};
	tmp = words.split(', ');
	for (i = 0; i < tmp.length; i++) {
		exceptions[tmp[i].replace(/-/g, '')] = tmp[i];
	}
	msg.lang = lang;
	msg.exceptions = exceptions;
	Hyphenator.Worker.postMessage(JSON.stringify(msg));
};


//define modular extras
Hyphenator.config = function (configObj) {
	var assert = function (name, type) {
			if (typeof configObj[name] === type) {
				return true;
			} else {
				Hyphenator.customEvents.fire('onerror', {
					sender: 'Hyphenator.config()',
					message: 'Config property ' + name + ' must be of type ' + type
				});
				return false;
			}
		},
		key, msg = {
			type: 1
		};
	for (key in configObj) {
		if (configObj.hasOwnProperty(key)) {
			switch (key) {
			case 'minwordlength':
				if (assert('minwordlength', 'number')) {
					msg.minWordLength = configObj.minwordlength;
				}
				break;
			case 'wordhyphenchar':
				if (assert('wordhyphenchar', 'string')) {
					if (configObj.wordhyphenchar === '&shy;') {
						configObj.wordhyphenchar = String.fromCharCode(173);
					}
					msg.wordHyphenChar = configObj.wordhyphenchar;
				}
				break;
			case 'urlhyphenchar':
				if (configObj.hasOwnProperty('urlhyphenchar')) {
					if (assert('urlhyphenchar', 'string')) {
						msg.urlHyphenChar = configObj.urlhyphenchar;
					}
				}
				break;
			case 'storagetype':
				if (assert('storagetype', 'string')) {
					msg.storageType = configObj.storagetype;
				}						
				break;
			default:
				Hyphenator.customEvents.fire('onerror', {
					sender: 'Hyphenator.config()',
					message: 'Unknown config property: ' + key
				});
			}
		}
	}
	Hyphenator.Worker.postMessage(JSON.stringify(msg));
}

Hyphenator.customEvents = (function () {
	var events = {};
	return {
		//for use in the library:
		add: function (name) {
			events[name] = function () {};
		},
		fire: function (name, data) {
			events[name](data);
		},
		//for use by the client:
		addEventListener: function (name, action) {
			var oldEvent = events[name];
			events[name] = function (data) {
				oldEvent(data);
				action(data);
			}
		}
	};
})();
Hyphenator.customEvents.add('onhyphenationdone');
Hyphenator.customEvents.add('onerror');
Hyphenator.customEvents.addEventListener('onerror', function(e) {
	alert(e.message);
});