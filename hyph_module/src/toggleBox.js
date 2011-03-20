//Hyphenator_togglebox.js
Hyphenator.fn.addModule({
	removeHyphenationFromDocuments: function () {
		Hyphenator.fn.collectedDocuments.each(function (href, data) {
			data.removeHyphenation();
		});
	},
	hyphenateDocuments: function () {
		Hyphenator.fn.collectedDocuments.each(function (href, data) {
			data.hyphenate();
		});
	}
});

Hyphenator.addModule({
	togglebox: function (w) {
		w = w || window;
		var  myBox, bdy, myIdAttribute, myTextNode, myClassAttribute,
		text = (Hyphenator.dohyphenation ? 'Hy-phen-a-tion' : 'Hyphenation');
		if (!!(myBox = w.document.getElementById('HyphenatorToggleBox'))) {
			myBox.firstChild.data = text;
		} else {
			bdy = w.document.getElementsByTagName('body')[0];
			myBox = Hyphenator.fn.createElem('div', w);
			myIdAttribute = w.document.createAttribute('id');
			myIdAttribute.nodeValue = 'HyphenatorToggleBox';
			myClassAttribute = w.document.createAttribute('class');
			myClassAttribute.nodeValue = Hyphenator.donthyphenateclassname;
			myTextNode = w.document.createTextNode(text);
			myBox.appendChild(myTextNode);
			myBox.setAttributeNode(myIdAttribute);
			myBox.setAttributeNode(myClassAttribute);
			myBox.onclick =  function () {
				Hyphenator.toggleHyphenation(w);
			};
			myBox.style.position = 'absolute';
			myBox.style.top = '0px';
			myBox.style.right = '0px';
			myBox.style.margin = '0';
			myBox.style.backgroundColor = '#AAAAAA';
			myBox.style.color = '#FFFFFF';
			myBox.style.font = '6pt Arial';
			myBox.style.letterSpacing = '0.2em';
			myBox.style.padding = '3px';
			myBox.style.cursor = 'pointer';
			myBox.style.WebkitBorderBottomLeftRadius = '4px';
			myBox.style.MozBorderRadiusBottomleft = '4px';
			bdy.appendChild(myBox);
		}
	}
});

Hyphenator.addModule({
	toggleHyphenation: function (w) {
		if (Hyphenator.dohyphenation) {
			Hyphenator.config({
				dohyphenation: false
			});
			Hyphenator.fn.removeHyphenationFromDocuments();
			Hyphenator.togglebox(w);
		} else {
			Hyphenator.config({
				dohyphenation: true
			});
			Hyphenator.fn.hyphenateDocuments();
			Hyphenator.togglebox(w);
		}
	}
});

