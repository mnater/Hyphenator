//Hyphenator_messages.js
/*
Message types:
0: Error
1: Updated settings
2: file loaded
3: pattern available
*/
Hyphenator.fn.extend('Message', function (type, data, text) {
	this.type = type || 0;
	this.data = data || null;
	this.text = text || '';
	this.toString = function () {
		return "Message:\n\ttype: " + type + ":\n\tdata: " + window.JSON.stringify(data) + ":\n\ttext: " + text; 
	};
});

Hyphenator.fn.addModule(new Hyphenator.fn.EO({
	postMessage: function (msg) {
		if (msg.constructor !== Hyphenator.fn.Message) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg, "Received non-conforming message"));
		} else {
			Hyphenator.fn.onmessage(msg);
		}
	},
	onmessage: function (msg) {
		//console.log(msg.text);
		switch (msg.type) {
		case 0: //Error
			Hyphenator.postMessage(msg);
			break;
		case 1: //settings related
			//do reflow if necessary
			//Hyphenator.postMessage(msg);
			break;
		case 2: //file load related
			//update supportedLang
			Hyphenator.fn.supportedLanguages[msg.data.id].state = msg.data.readyState;
			if (msg.data.state === 42) {
				//error
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg.data.url, "failed to load file: " + msg.data.url));
			}
			if (msg.data.state === 4) {
				//insert script
				Hyphenator.fn.insertScript(msg.data.content);
				Hyphenator.fn.supportedLanguages[msg.data.id].state = 5;
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data.id, 'state': 5}, "File added: " + msg.data.url));
			}
			break;
		case 3: //pattern related
			switch (msg.data.state) {
			case 5: //patterns loaded
				Hyphenator.fn.prepareLanguagesObj(msg.data.id);
				break;
			case 6: //patterns prepared
				Hyphenator.fn.supportedLanguages[msg.data.id].state = 7;
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data.id, 'state': 7}, "Pattern ready: " + msg.data.id));
				(new Hyphenator.fn.Storage()).storePatterns(msg.data.id, Hyphenator.languages[msg.data.id]);
				break;
			case 7: //patterns ready
				Hyphenator.fn.collectedDocuments.each(function (href, data) {
					if (data.elementCollection.list.hasOwnProperty(msg.data.id)) {
						data.elementCollection.list[msg.data.id].hyphenateElements();
					}
				});
				break;
			default:
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, null, "Error"));
			}
			break;
		case 4: //language detected
			if (Hyphenator.languages.hasOwnProperty(msg.data) && (Hyphenator.fn.supportedLanguages[msg.data].state < 5)) {
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data, 'state': 5}, "File added: " + msg.data));
			} else {
				//load the language
				if ((new Hyphenator.fn.Storage()).inStorage(msg.data)) {
					//from storage?
					(new Hyphenator.fn.Storage()).restorePatterns(msg.data);
					Hyphenator.fn.supportedLanguages[msg.data].state = 7;
					Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data, 'state': 7}, "Pattern restored: " + msg.data));
				} else if (Hyphenator.fn.supportedLanguages[msg.data].state === 0 && Hyphenator.remoteloading) {
					//remotely?
					Hyphenator.fn.supportedLanguages[msg.data].state = 1;
					Hyphenator.loadLanguage(msg.data);
				} else if (!Hyphenator.remoteloading) {
					//will not load!
					Hyphenator.fn.supportedLanguages[msg.data].state = 8;
				}
			}
			break;
		case 5: //some elements have been hyphenated -> check if all done
			Hyphenator.fn.collectedDocuments.allDone();
			break;
		case 6: //storage
			//console.log('storage: ', msg.data);
			break;
		case 7: //document updated
			switch (msg.data.state) {
			case 0: //error
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg.data.id, "Error in Document."));
				break;
			case 1: //init
			
				break;
			case 2: //ready
				//handle each document in a single "thread"
				window.setTimeout(function () {
					Hyphenator.fn.collectedDocuments.list[msg.data.id.location.href].setMainLanguage();
					Hyphenator.fn.collectedDocuments.list[msg.data.id.location.href].prepareElements();
				}, 0);
				break;
			case 3: //elements collected
				Hyphenator.fn.collectedDocuments.list[msg.data.id.location.href].elementCollection.each(function (lang, data) {
					if (Hyphenator.fn.supportedLanguages[lang].state === 7) {
						data.hyphenateElements();
					} else if (Hyphenator.fn.supportedLanguages[lang].state === 8) { //language will not load -> delete Elements of that lang
						delete Hyphenator.fn.collectedDocuments.list[msg.data.id.location.href].elementCollection.list[lang];
						Hyphenator.fn.collectedDocuments.allDone();
					}//else wait for language to be loaded
				});
				break;
			case 4: //hyphenated

				break;
			case 5: //frameset

				break;
			}
			break;
		case 42: //runtime message: hyphenation done! Yupee!
			Hyphenator.onhyphenationdonecallback();
			break;
		default:
			Hyphenator.postMessage(new Hyphenator.fn.Message(0, msg.toString(), 'Internally received unknown message.'));
		}
	}
}));


Hyphenator.addModule(new Hyphenator.fn.EO({
	postMessage: function (msg) {
		if (msg.constructor !== Hyphenator.fn.Message) {
			Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg, "Received non-conforming message"));
		} else {
			Hyphenator.onmessage(msg);
		}
	},
	onmessage: function (msg) {
		/*
		to be overwritten by
		Hyphenator.onmessage = function (msg) {};
		*/
		Hyphenator.onerrorhandler(msg);
	}
}));
