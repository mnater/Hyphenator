//begin Hyphenator_loader.js
Hyphenator.fn.addModule({
	basePath: (function () {
		var s = document.getElementsByTagName('script'), i = 0, p, src, t;
		while (!!(t = s[i++])) {
			if (!t.src) {
				continue;
			}
			src = t.src;
			p = src.indexOf('Hyphenator');
			if (p !== -1) {
				return src.substring(0, p);
			}
		}
		return 'http://192.168.0.2/~mnater/hyph/hyph_module/';
	}()),
	remoteLoad: function (id, url) {
		var xhr = null;
		if (typeof XMLHttpRequest !== 'undefined') {
			xhr = new XMLHttpRequest();
		}
		if (!xhr) {
			try {
				xhr  = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				xhr  = null;
			}
		}
		if (xhr) {
			xhr.open('GET', url, true);
			xhr.onreadystatechange = function () {
				//!!! don't check status before readyState or IE sucks (again!)
				if (xhr.readyState < 4) {
					Hyphenator.fn.postMessage([2, {'id': id, 'url': url, state: xhr.readyState}, "readyState changed: " + url]);					
				} else if (xhr.readyState === 4 && xhr.status === 200) {
					Hyphenator.fn.postMessage([2, {'id': id, 'url': url, state: xhr.readyState, content: xhr.responseText}, "file loaded: " + url]);					
				} else {
					xhr.abort();
					Hyphenator.fn.postMessage([2, {'id': id, 'url': url, state: 42}, "failed to load file."]);					
				}
			};
			xhr.send(null);
		}
	},
	load: function (id, url, watcher, callback) {
		Hyphenator.fn.remoteLoad(id, url);
	}
});
