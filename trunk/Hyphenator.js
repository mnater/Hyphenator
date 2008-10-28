/**************** Preamble ****************/
// This script is licensed under the creative commons license
// Attribution-Share Alike 2.5 Switzerland
// You are free to share and to remix this work under the 
// following conditions: Attribution and Share-Alike
// See http://creativecommons.org/licenses/by-sa/2.5/ch/deed.en
// Thus you are free to use it  commercial purposes.
//
// Dieses Script steht unter der Creative Commons-Lizenz
// Attribution-Share Alike 2.5 Switzerland
// Sie dürfen das Werk vervielfältigen, verbreiten und öffentlich zugänglich machen,
// sowie Bearbeitungen des Werkes anfertigen
// Zu den folgenden Bedingungen:
// Namensnennung und Weitergabe unter gleichen Bedingungen.
// Siehe http://creativecommons.org/licenses/by-sa/2.5/ch/
// Somit sind sie frei, das Script für kommerzielle Zwecke zu nutzen
//
// Mathias Nater, Zürich, 2008
// mnater at mac dot com
/**************** Preamble ****************/
var Hyphenator=(function(){
	//private properties
	/************ may be changed ************/
	var SUPPORTEDLANG={'de':true,'en':true,'fr':true, 'nl':true}; //delete languages that you won't use (for better performance)
	var LANGUAGEHINT='Deutsch: de\tEnglish: en\tFran%E7ais: fr\tNederlands: nl';
	var PROMPTERSTRINGS={'de':'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben: \n\n'+LANGUAGEHINT,
						 'en':'The language of this website could not be determined automatically. Please indicate main language: \n\n'+LANGUAGEHINT,
						 'fr':'La langue de cette site ne pouvait pas %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue: \n\n'+LANGUAGEHINT,
						 'nl':'De taal van deze website kan niet automatisch worden bepaald. Geef de hoofdtaal op: \n\n'+LANGUAGEHINT};
	
	/************ don't change! ************/
	var BASEPATH=function(){
		var s=document.getElementsByTagName('script'),i=0,p,t;
		while(t=s[i++].src) {
			p=t.indexOf('Hyphenator.js');
			if(p!=-1) {
				return t.substring(0,p);
			}
		}
		//return 'http://127.0.0.1/~mnater/newtrunk/';
		return 'http://hyphenator.googlecode.com/svn/trunk/';
	}();
	var DONTHYPHENATE={'script':true,'code':true,'pre':true,'img':true,'br':true,'samp':true,'kbd':true,'var':true,'abbr':true,'acronym':true,'sub':true,'sup':true,'button':true,'option':true,'label':true};
	var hyphenation={};
	var enableRemoteLoading=true;
	var displayToggleBox=false;
	var hyphenateclass='hyphenate'; // the CSS-Classname of Elements that should be hyphenated eg. <p class="hyphenate">Text</p>
	var hyphen=String.fromCharCode(173); // the hyphen, defaults to &shy; Change by Hyphenator.setHyphenChar(c);
	var urlhyphen=_createZeroWidthSpace(); // the hyphe for urls, defaults to zerowidthspace; Change by Hyphenator.setUrlHyphenChar(c);
	var min=6; // only hyphanete words longer then or equal to 'min'. Change by Hyphenator.setMinWordLength(n);
	var bookmarklet=false;
	var patternsloaded={}; // this is set when the patterns are loaded
	var preparestate=0; //0: not initialized, 1: loading patterns, 2: ready
	var mainlanguage=null;
	var url='(\\w*:\/\/)((\\w*:)?(\\w*)@)?([\\w\.]*)?(:\\d*)?(\/[\\w#!:.?+=&%@!\-]*)*';
	var mail='[\\w-\\.]+@[\\w\\.]+';
	var urlRE=new RegExp(url,'i');
	var mailRE=new RegExp(mail,'i');
	/************ UA related ************/
	var zerowidthspace='';
	// The zerowidthspace is inserted after a '-' in compound words
	// like this, even Firefox 2 and IE will break after '-' if necessary.
	// zerowidthspace is also used to break URLs
	// MSIE <=6 and 8b2 does NOT support zerowidthspace
	function _createZeroWidthSpace() {
		var ua=navigator.userAgent.toLowerCase();
		if(ua.indexOf('msie 6')==-1 && ua.indexOf('msie 8')==-1) {
			zerowidthspace=String.fromCharCode(8203); //Unicode zero width space
		} else {
			zerowidthspace='';
		}
		return zerowidthspace;
	};
	
	// checks if the script runs as a Bookmarklet
	function _checkIfBookmarklet() {
		var loc=null;
		var jsArray = document.getElementsByTagName('script');
		for(var i=0, l=jsArray.length; i<l; i++) {
			if(!!jsArray[i].getAttribute('src')) {
				loc=jsArray[i].getAttribute('src');
			}
			if(!loc) {
				continue;
			} else if(loc.indexOf('Hyphenator.js?bm=true')!=-1) {
				bookmarklet=true;
			}
		}
	};
    
	//private methods	
	/************ Language related methods ************/
	// looks for a language for the site. If there is no
	// hint in the html, ask the user!
	function _autoSetMainLanguage() {
		var el=document.getElementsByTagName('html')[0];
		mainlanguage=_getLang(el);
		if(!mainlanguage) {
			var m=document.getElementsByTagName('meta');
			for(var i=0; i<m.length; i++) {
				//<meta http-equiv="content-language" content="xy">	
				if(!!m[i].getAttribute('http-equiv') && (m[i].getAttribute('http-equiv')=='content-language')) {
					mainlanguage = m[i].getAttribute('content').substring(0,2);
				}
				//<meta name="DC.Language" content="xy">
				if(!!m[i].getAttribute('name') && (m[i].getAttribute('name')=='DC.Language')) {
					mainlanguage = m[i].getAttribute('content').substring(0,2);
				}			
				//<meta name="language" content="xy">
				if(!!m[i].getAttribute('name') && (m[i].getAttribute('name')=='language')) {
					mainlanguage = m[i].getAttribute('content').substring(0,2);
				}
			}
		}
		if(!mainlanguage) {
			var text='';
			var ul=(navigator.language)?navigator.language:navigator.userLanguage;
			ul=ul.substring(0,2);
			if(SUPPORTEDLANG[ul]) {
				text=PROMPTERSTRINGS[ul];
			} else {
				text=PROMPTERSTRINGS.en;
			}
			var lang=window.prompt(unescape(text), ul);
			if(SUPPORTEDLANG[lang]) {
				mainlanguage = lang;
			}
		}
	};
	//hides the elements with class .hyphenateclass (typically "hyphenate") to
	//prevent an fouhc (flash of un-hyphenated content)
	//visibility is set back to visible in Hyphenator.hyphenateElement()
	function _hideInside() {
		if(document.getElementsByClassName) {
			var elements=document.getElementsByClassName(hyphenateclass);
			for(var i=0, l=elements.length; i<l; i++)
			{
				elements[i].style.visibility='hidden';
			}
		} else {
		var body=document.getElementsByTagName('body')[0];
			var elements=body.getElementsByTagName('*');
			for(var i=0, l=elements.length; i<l; i++)
			{
				if(elements[i].className.indexOf(hyphenateclass)!=-1 && elements[i].className.indexOf('donthyphenate')==-1) {
					elements[i].style.visibility='hidden';
				}
			}
		}
	};
	
	function _switchToggleBox(s) {
		if(s) {
			var bdy=document.getElementsByTagName('body')[0];
			var myBox=document.createElement('div');
			var myIdAttribute=document.createAttribute('id');
			myIdAttribute.nodeValue='HyphenatorToggleBox';
			var myTextNode=document.createTextNode('Hy-phe-na-ti-on');
			myBox.appendChild(myTextNode);
			myBox.setAttributeNode(myIdAttribute);
			myBox.onclick=Hyphenator.toggleHyphenation;
			myBox.style.position='absolute';
			myBox.style.top='0px';
			myBox.style.right='0px';
			myBox.style.margin='0';
			myBox.style.backgroundColor='#AAAAAA';
			myBox.style.color='#FFFFFF';
			myBox.style.font='6pt Arial';
			myBox.style.letterSpacing='0.2em';
			myBox.style.padding='3px';
			myBox.style.cursor='pointer';
			myBox.style.WebkitBorderBottomLeftRadius='4px';
			myBox.style.MozBorderRadiusBottomleft='4px';
			bdy.appendChild(myBox);
		} else {
			var myBox=document.getElementById('HyphenatorToggleBox');
			myBox.style.visibility='hidden';
		}
	};

    // gets the lang for the given Element
    // if not set, use the mainlanguage of the hole site
	function _getLang(el, nofallback) {
		
		if(!!el.getAttribute('lang')) {
			return el.getAttribute('lang').substring(0,2);
		}
		// The following doesn't work in IE due to a bug when getAttribute('xml:lang') in a table
		/*if(!!el.getAttribute('xml:lang')) {
			return el.getAttribute('xml:lang').substring(0,2);
		}*/
		//instead, we have to do this (thanks to borgzor):
		try {
			if(!!el.getAttribute('xml:lang')) {
				return el.getAttribute('xml:lang').substring(0,2);
			}
		} catch (ex) {}
		if(!nofallback && mainlanguage) {
			return mainlanguage;
		}
		return null;
	};

	/************ pattern (loading) related methods ************/
	// Loads the hyphenation-patterns for specific languages
	// by adding a new <script>-Element
	// Why not using AJAX? Because it is restricted to load data
	// only from the same site - so the Bookmarklet won't work with Ajax...
	function _loadPatterns(lang) {
		if(SUPPORTEDLANG[lang] && !patternsloaded[lang]) {
	        var url=BASEPATH+'patterns/'+lang+'.js';
		} else {
			return;
		}
		if(document.createElement) {
			var head=document.getElementsByTagName('head').item(0);
			var script=document.createElement('script');
			script.src=url;
			script.type='text/javascript';
			head.appendChild(script);
		}
	};
	
	/* Converts from string '_a6' to object '_a':'_a6' */
	function _convertPatternsToObject() {
		for(var lang in Hyphenator.patterns) {
			var sa=Hyphenator.patterns[lang].split(' ');
			Hyphenator.patterns[lang]={};
			var pat, key, i=0;
			var isdigit=false;
			while(pat=sa[i++]) {
				key=pat.replace(/\d/g, '');
				Hyphenator.patterns[lang][key]=pat;
			}
		}
	};

	/************ hyphenate helper methods ************/
	// walk throug the document and do the job
	function _runHyphenation() {
		var body=document.getElementsByTagName('body')[0];
		if(Hyphenator.isBookmarklet()) {
			Hyphenator.hyphenateElement(body);
		} else {
			if(document.getElementsByClassName) {
				var elements=document.getElementsByClassName(hyphenateclass);
				for(var i=0, l=elements.length; i<l; i++)
				{
					Hyphenator.hyphenateElement(elements[i]);
				}
			} else {
				var elements=body.getElementsByTagName('*');
				for(var i=0, l=elements.length; i<l; i++)
				{
					if(elements[i].className.indexOf(hyphenateclass)!=-1) {
						Hyphenator.hyphenateElement(elements[i]);
					}
				}
			}
		}
	};
	function _removeHyphenation() {
		var body=document.getElementsByTagName('body')[0];
		if(Hyphenator.isBookmarklet()) {
			Hyphenator.deleteHyphenationInElement(body);
		} else {
			if(document.getElementsByClassName) {
				var elements=document.getElementsByClassName(hyphenateclass);
				for(var i=0, l=elements.length; i<l; i++)
				{
					Hyphenator.deleteHyphenationInElement(elements[i]);
				}
			} else {
				var elements=body.getElementsByTagName('*');
				for(var i=0, l=elements.length; i<l; i++)
				{
					if(elements[i].className.indexOf(hyphenateclass)!=-1) {
						Hyphenator.deleteHyphenationInElement(elements[i]);
					}
				}
			}
		}
	};

	
	/*
	 * ContentLoaded.js
	 *
	 * Author: Diego Perini (diego.perini at gmail.com)
	 * Summary: Cross-browser wrapper for DOMContentLoaded
	 * Updated: 17/05/2008
	 * License: MIT
	 * Version: 1.1
	 *
	 * URL:
	 * http://javascript.nwbox.com/ContentLoaded/
	 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	 *
	 * Notes:
	 * based on code by Dean Edwards and John Resig
	 * http://dean.edwards.name/weblog/2006/06/again/
	 */
	// @w	window reference
	// @f	function reference
	//function ContentLoaded(w, f) {
	function _runOnContentLoaded(w, f) {
	
		var	d = w.document,
			D = 'DOMContentLoaded',
			// user agent, version
			u = w.navigator.userAgent.toLowerCase(),
			v = parseFloat(u.match(/.+(?:rv|it|ml|ra|ie)[\/: ]([\d.]+)/)[1]);
	
		function init(e) {
			if (!document.loaded) {
				document.loaded = true;
				// pass a fake event if needed
				f((e.type && e.type == D) ? e : {
					type: D,
					target: d,
					eventPhase: 0,
					currentTarget: d,
					timeStamp: +new Date,
					eventType: e.type || e
				});
			}
		}
	
		// safari < 525.13
		if (/webkit\//.test(u) && v < 525.13) {
	
			(function () {
				if (/complete|loaded/.test(d.readyState)) {
					init('khtml-poll');
				} else {
					setTimeout(arguments.callee, 10);
				}
			})();
	
		// internet explorer all versions
		} else if (/msie/.test(u) && !w.opera) {
	
			d.attachEvent('onreadystatechange',
				function (e) {
					if (d.readyState == 'complete') {
						d.detachEvent('on'+e.type, arguments.callee);
						init(e);
					}
				}
			);
			if (w == top) {
				(function () {
					try {
						d.documentElement.doScroll('left');
					} catch (e) {
						setTimeout(arguments.callee, 10);
						return;
					}
					init('msie-poll');
				})();
			}
	
		// browsers having native DOMContentLoaded
		} else if (d.addEventListener &&
			(/opera\//.test(u) && v > 9) ||
			(/gecko\//.test(u) && v >= 1.8) ||
			(/khtml\//.test(u) && v >= 4.0) ||
			(/webkit\//.test(u) && v >= 525.13)) {
	
			d.addEventListener(D,
				function (e) {
					d.removeEventListener(D, arguments.callee, false);
					init(e);
				}, false
			);
	
		// fallback to last resort for older browsers
		} else {
	
			// from Simon Willison
			var oldonload = w.onload;
			w.onload = function (e) {
				init(e || w.event);
				if (typeof oldonload == 'function') {
					oldonload(e || w.event);
				}
			};
	
		}
	};
	/* end ContentLoaded.js */


	/************ init methods ************/
	function _autoinit() {
		for(var lang in SUPPORTEDLANG) {
			patternsloaded[lang]=false;
		}
		_autoSetMainLanguage();
		_createZeroWidthSpace();
		_checkIfBookmarklet();
	};
	_autoinit();
	return {
		//public properties
	    leftmin:{},  // How many chars can be on the old line at minimum. This is set by the patternfile
        rightmin:{}, // How many chars can be on the new line at minimum. This is set by the patternfile
        shortestPattern:{}, // this is set by the patternfile
        longestPattern:{}, // this is set by the patternfile
        specialChars:{}, // Language specific chars such as éàâç etc. This is set by the patternfile
		patterns:{}, // patterns are stored in here, when they have finished loading
		
		//public methods
		run: function() {
			_runOnContentLoaded(window, function(){
				_hideInside();
				Hyphenator.hyphenateDocument();
				if(displayToggleBox) {
					_switchToggleBox(true);
				}
			});
		},
		addExceptions: function(words) { //words is a comma separated string of words
		 	var w=words.split(',');
		 	for(var i=0, l=w.length; i<l; i++) {
		 		var key=w[i].replace(/-/g,'');
				if(!hyphenation[key]) {
					hyphenation[key]=w[i];
				}
			}
		},	
		setClassName: function(str) {
            hyphenateclass=str || 'hyphenate';
		},
		setMinWordLength: function(mymin) {
            min=mymin || 6;
		},
		setHyphenChar: function(str) {
			if(str=='&shy;') {
				str=String.fromCharCode(173);
			}
            hyphen=str || String.fromCharCode(173);
		},
		setDisplayToggleBox: function(bool) {
            displayToggleBox=bool || true;
		},
		setUrlHyphenChar: function(str) {
            urlhyphen=str || _createZeroWidthSpace();
		},
		setRemoteLoading: function(bool) {
			enableRemoteLoading=bool;
		},
		isPatternLoaded: function(lang) {
			return patternsloaded[lang];
		},
		updatePatternsLoadState:function(lang,bool) {
			patternsloaded[lang]=bool;
		},
		isBookmarklet: function() {
			return bookmarklet;
		},
		prepare: function() {
        // get all languages that are used and preload the patterns
			preparestate=1;
			var doclanguages={};
			doclanguages[mainlanguage]=true;
			var elements=document.getElementsByTagName('body')[0].getElementsByTagName('*');
			var lang=null;
			for(var i=0, l=elements.length; i<l; i++) {
				if(lang=_getLang(elements[i])) {
					if(SUPPORTEDLANG[lang]) {
						doclanguages[lang]=true;
					} else {
						//alert('Language '+lang+' is not yet supported.');
					}
				}
			}
			for(lang in doclanguages) {
				_loadPatterns(lang);
			}
			// wait until they are loaded
			interval=window.setInterval(function(){
				finishedLoading=false;
				for(lang in doclanguages) {
					if(!patternsloaded[lang]) {
						finishedLoading=false;
						break;
					} else {
						finishedLoading=true;
					}
				}
				if(finishedLoading) {
					window.clearInterval(interval);
					preparestate=2;
				}
			},100);

		},
		hyphenateDocument: function() {
			if(preparestate!=2 && enableRemoteLoading) {
				if(preparestate==0) {
					Hyphenator.prepare();               // load all language patterns that are used
				}
				var interval=window.setInterval(function(){
					if(preparestate==2) {
						window.clearInterval(interval);
						_convertPatternsToObject();
						_runHyphenation();
					}
				},10);
			} else {
				_runHyphenation();
			}
		},
		hyphenateElement : function(el,lang) {
        // if there is text hyphenate each word
        // if there are other elements, go deeper!
		// maybe this could be faster, somehow!
			if(el.className.indexOf("donthyphenate")!=-1) {
				return;
			}
			if(!lang) {
				var lang=_getLang(el);
			} else {
				var elemlang=_getLang(el, true);
 				if(elemlang!=null) {
					var lang=elemlang;
				}
			}
			var wrd='[\\w'+Hyphenator.specialChars[lang]+'@­-]{'+min+',}';
			var wrdRE=new RegExp(wrd,'i');
			function __hyphenate(word) {
				if(urlRE.test(word) || mailRE.test(word)) {
					return Hyphenator.hyphenateURL(word);
				} else {
					return Hyphenator.hyphenateWord(lang,word);
				}
			}
			var genRegExp=new RegExp('('+url+')|('+mail+')|('+wrd+')','gi');
            for(var i=0; (n=el.childNodes[i]); i++) {
				if(n.nodeType==3 && n.data.length>=min) { //type 3=#text -> hyphenate!
                    n.data=n.data.replace(genRegExp,__hyphenate);
                } else if(n.nodeType==1 && !DONTHYPHENATE[n.nodeName.toLowerCase()]) {			//typ 1=element node -> recursion
                    Hyphenator.hyphenateElement(n,lang);
                }
            }
            if(el.className.indexOf(hyphenateclass)!=-1) {
	            el.style.visibility='visible';
	        }
        },
        deleteHyphenationInElement : function(el) {
        	var h;
        	switch(hyphen) {
        		case '|':
        			h='\\|';
        			break;
        		case '+':
					h='\\+';
					break;
				case '*':
					h='\\*'
					break;
				default:
				h=hyphen;
        	}
        	for(var i=0; (n=el.childNodes[i]); i++) {
        		if(n.nodeType==3) {
        			n.data=n.data.replace(new RegExp(h,'g'), '');
        		} else if(n.nodeType==1) {
        			Hyphenator.deleteHyphenationInElement(n);
        		}
        	}
        },
		hyphenateWord    : function(lang,word) {
			if(word=='') {
				return '';
			}
			if(word.indexOf('­')!=-1) { //this String only contains the unicode char 'Soft Hyphen' wich may not be visible in some editors!
				//word already contains shy; -> leave at it is!
				return word;
			}
			if(hyphenation[word]) { //the word is in the exceptions list
				return hyphenation[word].replace(/-/g,hyphen);
			}
			if(word.indexOf('-')!=-1) {
				//word contains '-' -> put a zerowidthspace after it and hyphenate the parts separated with '-'
				var parts=word.split('-');
				for(var i=0, l=parts.length; i<l; i++) {
					parts[i]=Hyphenator.hyphenateWord(lang,parts[i]);
				}
				return parts.join('-'+zerowidthspace);
			}
			//finally the core hyphenation algorithm
			var w='_'+word+'_';
			var wl=w.length;
			var s=w.split('');
			w=w.toLowerCase();
			var hypos=new Array();
			var p, maxwins, win, pat, patl, i, c, digits, z;
			var numb3rs={'0':true,'1':true,'2':true,'3':true,'4':true,'5':true,'6':true,'7':true,'8':true,'9':true}; //check for member is faster then isFinite()
			for(p=0; p<=(wl-Hyphenator.shortestPattern[lang]); p++) {
				maxwins=Math.min((wl-p),Hyphenator.longestPattern[lang]);
				for(win=Hyphenator.shortestPattern[lang]; win<=maxwins; win++) {
					if(pat=Hyphenator.patterns[lang][w.substr(p,win)]) {
						digits=1;
						patl=pat.length;
						for(i=0; i<patl; i++) {
							c=pat.charAt(i);
							if(numb3rs[c]) {
								if(i==0) {
									z=p-1;
									if(!hypos[z] || hypos[z]<c) {
										hypos[z]=c;
									}
								} else {
									z=p+i-digits;
									if(!hypos[z] || hypos[z]<c) {
										hypos[z]=c;
									}
								}
								digits++;								
							}
						}
					}
				}
			}
			var inserted=0;
			for(i=Hyphenator.leftmin[lang]; i<(hypos.length-Hyphenator.rightmin[lang]); i++) {
				if(!!(hypos[i]&1)) {
					s.splice(i+inserted+1,0,hyphen);
					inserted++;
				}
			}
			return s.slice(1,-1).join('');
		},
		hyphenateURL: function(url) {
			return url.replace(/([:\/\.\?#&_,;!@]+)/gi,'$&'+urlhyphen);
		},
		toggleHyphenation: function() {
			var currentText=document.getElementById('HyphenatorToggleBox').firstChild.nodeValue;
			if(currentText=='Hy-phe-na-ti-on') {
				_removeHyphenation();
				document.getElementById('HyphenatorToggleBox').firstChild.nodeValue='Hyphenation';
				
			} else {
				_runHyphenation();
				document.getElementById('HyphenatorToggleBox').firstChild.nodeValue='Hy-phe-na-ti-on';
			}
		}
	};
})();
if(Hyphenator.isBookmarklet()) {
	Hyphenator.hyphenateDocument();
}