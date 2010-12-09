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
		return "Message:\n\ttype: " + type + ":\n\tdata: " + JSON.stringify(data) + ":\n\ttext: " + text; 
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
		//console.log(msg.toString());
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
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, msg.data.url, "failed to load file."));
			}
			if (msg.data.state === 4) {
				//insert script
				Hyphenator.fn.insertScript(msg.data.content);
				Hyphenator.fn.supportedLanguages[msg.data.id].state = 5;
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data.id, 'state': 5}, "File added."));
			}
			break;
		case 3: //pattern related
			switch (msg.data.state) {
			case 5:
				Hyphenator.fn.prepareLanguagesObj(msg.data.id);
				break;
			case 6:
				Hyphenator.fn.supportedLanguages[msg.data.id].state = 7;
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data.id, 'state': 7}, "Pattern ready"));
				break;
			case 7:
				if (Hyphenator.fn.collectedElements.list.hasOwnProperty(msg.data.id)) {
					Hyphenator.fn.collectedElements.list[msg.data.id].hyphenateElements();
				}
				break;
			default:
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(0, null, "Error"));
			}
			break;
		case 4: //language detected
			if (Hyphenator.languages.hasOwnProperty(msg.data)) {
				Hyphenator.fn.postMessage(new Hyphenator.fn.Message(3, {'id': msg.data, 'state': 5}, "File added."));
			} else {
				//load the language
				if (Hyphenator.fn.supportedLanguages[msg.data].state === 0 && Hyphenator.enableRemoteLoading) {
					Hyphenator.fn.supportedLanguages[msg.data].state = 1;
					Hyphenator.loadLanguage(msg.data);
				}
			}
			break;
		case 5: //DOM Elements related
			if (Hyphenator.fn.supportedLanguages[msg.data.lang].state === 7) {
				Hyphenator.fn.collectedElements.list[msg.data.lang].hyphenateElements();
			} //else: wait for language to be loaded
			break;
		case 6: //runtime message: hyphenation done! Yupee!
			Hyphenator.onHyphenationDoneCallback();
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
		Hyphenator.log('received message: ' + msg.text);
		Hyphenator.log(msg);
	}
}));
