//Hyphenator_messages.js
/*jslint sub: true */
//Message format: [0=>type, 1=>data, 2=>text]

Hyphenator.fn.addModule({
	postMessage: function (msg) {
		if (msg.constructor !== Array && msg.length !== 3) {
			Hyphenator.fn.postMessage([0, msg, "Received non-conforming message"]);
		} else {
			Hyphenator.fn.onmessage(msg);
		}
	},
	onmessage: function (msg) {
		//Hyphenator.log(msg[2]);
		//Hyphenator.log(msg);
		switch (msg[0]) {
		case 0: //Error
			Hyphenator.postMessage(msg);
			break;
		case 1: //settings related
			//do reflow if necessary
			//Hyphenator.log(msg);
			break;
		case 2: //file load related
			//update supportedLang
			Hyphenator.fn.supportedLanguages[msg[1].id].state = msg[1].readyState;
			if (msg[1].state === 42) {
				//error
				Hyphenator.fn.postMessage([0, msg[1].url, "failed to load file: " + msg[1].url]);
			}
			if (msg[1].state === 4) {
				//insert script
				Hyphenator.fn.insertScript(msg[1].content);
				Hyphenator.fn.supportedLanguages[msg[1].id].state = 5;
				Hyphenator.fn.postMessage([3, {'id': msg[1].id, 'state': 5}, "File added: " + msg[1].url]);
			}
			break;
		case 3: //pattern related
			switch (msg[1].state) {
			case 5: //patterns loaded
				Hyphenator.fn.prepareLanguagesObj(msg[1].id);
				break;
			case 6: //patterns prepared
				Hyphenator.fn.supportedLanguages[msg[1].id].state = 7;
				Hyphenator.fn.postMessage([3, {'id': msg[1].id, 'state': 7}, "Pattern ready: " + msg[1].id]);
				(new Hyphenator.fn.Storage()).storePatterns(msg[1].id, Hyphenator.languages[msg[1].id]);
				break;
			case 7: //patterns ready
				Hyphenator.fn.collectedDocuments.each(function (href, data) {
					if (data.elementCollection.list.hasOwnProperty(msg[1].id)) {
						data.elementCollection.hyphenate(msg[1].id);
					}
				});
				break;
			default:
				Hyphenator.fn.postMessage([0, null, "Error"]);
			}
			break;
		case 4: //language detected
			if (Hyphenator.languages.hasOwnProperty(msg[1]) && (Hyphenator.fn.supportedLanguages[msg[1]].state < 5)) {
				Hyphenator.fn.postMessage([3, {'id': msg[1], 'state': 5}, "File added: " + msg[1]]);
			} else {
				//load the language
				if ((new Hyphenator.fn.Storage()).inStorage(msg[1])) {
					//from storage?
					(new Hyphenator.fn.Storage()).restorePatterns(msg[1]);
					Hyphenator.fn.supportedLanguages[msg[1]].state = 7;
					Hyphenator.fn.postMessage([3, {'id': msg[1], 'state': 7}, "Pattern restored: " + msg[1]]);
				} else if (Hyphenator.fn.supportedLanguages[msg[1]].state === 0 && Hyphenator.remoteloading) {
					//remotely?
					Hyphenator.fn.supportedLanguages[msg[1]].state = 1;
					Hyphenator.loadLanguage(msg[1]);
				} else if (!Hyphenator.remoteloading) {
					//will not load!
					Hyphenator.fn.supportedLanguages[msg[1]].state = 8;
				}
			}
			break;
		case 5: //some elements have been hyphenated -> check if all done
			Hyphenator.fn.collectedDocuments.allDone();
			break;
		case 6: //storage
			//console.log('storage: ', msg[1]);
			break;
		case 7: //document updated
			switch (msg[1].state) {
			case 0: //error
				Hyphenator.fn.postMessage([0, msg[1].id, "Error in Document."]);
				break;
			case 1: //init
			
				break;
			case 2: //ready
				//handle each document in a single "thread"
				window.setTimeout(function () {
					Hyphenator.fn.collectedDocuments.list[msg[1].id.location.href].setMainLanguage();
					Hyphenator.fn.collectedDocuments.list[msg[1].id.location.href].prepareElements();
				}, 0);
				break;
			case 3: //elements collected
				Hyphenator.fn.collectedDocuments.list[msg[1].id.location.href].elementCollection.each(function (lang, data) {
					if (Hyphenator.fn.supportedLanguages[lang].state === 7) {
						Hyphenator.fn.collectedDocuments.list[msg[1].id.location.href].elementCollection.hyphenate(lang);
					} else if (Hyphenator.fn.supportedLanguages[lang].state === 8) { //language will not load -> delete Elements of that lang
						delete Hyphenator.fn.collectedDocuments.list[msg[1].id.location.href].elementCollection.list[lang];
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
			Hyphenator.postMessage([0, msg.toString(), 'Internally received unknown message.']);
		}
	}
});


Hyphenator.addModule({
	postMessage: function (msg) {
		if (msg.constructor !== Array && msg.length !== 3) {
			Hyphenator.fn.postMessage([0, msg, "Received non-conforming message"]);
		} else {
			Hyphenator.onmessage(msg);
		}
	},
	onmessage: function (msg) {
		var tmp = {
			type: msg[0],
			data: msg[1],
			text: msg[2]
		};
		Hyphenator.onerrorhandler(tmp);
	}
});
window['Hyphenator']['postMessage'] = Hyphenator.postMessage;
window['Hyphenator']['onmessage'] = Hyphenator.onmessage;
