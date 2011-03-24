//Hyphenator_quirks.js
/*jslint sub: true */
Hyphenator.fn.addModule({
	/**
	 * zeroWidthSpace stores the ZWS character if available
	 * @field
	 * @memberOf Hyphenator.fn
	 * @private
	 */
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
	}()),
	/**
	 * registerOnCopy(el) registers oncopy on the given element that removes hyphens from copied text
	 * Because of accessing the copied text isn't allways possible or other bugs huge shadow element trickery is necessary
	 * The idea behind this code has been provided by http://github.com/aristus/sweet-justice
	 * sweet-justice is under BSD-License
	 * @param {Element} el The (hyphenated) element to treat.
	 * @function
	 * @memberOf Hyphenator.fn
	 * @private
	 */
	registerOnCopy: function (el) {
		var body = el.ownerDocument.getElementsByTagName('body')[0],
		shadow,
		selection,
		range,
		rangeShadow,
		restore,
		oncopyHandler = function (e) {
			e = e || window.event;
			var target = e.target || e.srcElement,
			currDoc = target.ownerDocument,
			body = currDoc.getElementsByTagName('body')[0],
			targetWindow = 'defaultView' in currDoc ? currDoc.defaultView : currDoc.parentWindow;
			if (target.tagName && Hyphenator.fn.dontHyphenate[target.tagName.toLowerCase()]) {
				//Safari needs this
				return;
			}
			//create a hidden shadow element
			shadow = currDoc.createElement('div');
			shadow.style.overflow = 'hidden';
			shadow.style.position = 'absolute';
			shadow.style.top = '-5000px';
			shadow.style.height = '1px';
			body.appendChild(shadow);
			if (!!window.getSelection) {
				//FF3, Webkit
				selection = targetWindow.getSelection();
				range = selection.getRangeAt(0);
				shadow.appendChild(range.cloneContents());
				(new Hyphenator.fn.Element(shadow, {})).removeHyphenation();
			//	removeHyphenationFromElement(shadow);
				selection.selectAllChildren(shadow);
				restore = function () {
					shadow.parentNode.removeChild(shadow);
					selection.addRange(range);
				};
			} else {
				// IE
				selection = targetWindow.document.selection;
				range = selection.createRange();
				shadow.innerHTML = range.htmlText;
				(new Hyphenator.fn.Element(shadow, {})).removeHyphenation();
			//	removeHyphenationFromElement(shadow);
				rangeShadow = body.createTextRange();
				rangeShadow.moveToElementText(shadow);
				rangeShadow.select();
				restore = function () {
					shadow.parentNode.removeChild(shadow);
					if (range.text !== "") {
						range.select();
					}
				};
			}
			window.setTimeout(restore, 0);
		};
		if (!body) {
			return;
		}
		el = el || body;
		if (window.addEventListener) {
			el.addEventListener("copy", oncopyHandler, false);
		} else if (el.attachEvent) {
			el.attachEvent("oncopy", oncopyHandler);
		}
	}
});
