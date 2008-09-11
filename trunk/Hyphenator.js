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
// Mathias Nater, Zürich, 2007
// mnater at mac dot com
/**************** Preamble ****************/
var Hyphenator=(function(){
	//private properties
	/************ may be changed ************/
	var DEBUG=false; // turn DEBUG mode on:true/off:false
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
		return 'http://hyphenator.googlecode.com/svn/trunk/';
	}();
	var DONTHYPHENATE={'script':true,'code':true,'pre':true,'img':true,'br':true,'samp':true,'kbd':true,'var':true,'abbr':true,'acronym':true,'sub':true,'sup':true,'button':true,'option':true,'label':true};
	var hyphenation={};
	var enableRemoteLoading=true;
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
	}
	
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
    
	function _log(msg) {
	   if(window.console) {
	       window.console.log(msg); //Safari
	   } else if(window.opera) { 
	       window.opera.postError(msg);
	   }  else {
	       //alert(msg);
	   }
	}
		
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
		if(DEBUG)
			_log("load patterns "+lang);
		if(SUPPORTEDLANG[lang] && !patternsloaded[lang]) {
	        var url=BASEPATH+'patterns/'+lang+'.js';
	        if(lang=="de") {
	        	url=BASEPATH+'patterns/newpatterns/de.js';
	        }
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
		if(DEBUG)
			_log('Loading '+url);
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
	
	//Run automatically when the DOM is loaded
	/*  
	 *  Code by Stuart Langridge
	 *  http://www.kryogenix.org/days/2007/09/26/shortloaded
	 *  based on code by Dean Edwards and John Resig
	 *  http://dean.edwards.name/weblog/2006/06/again/
	 *	http://javascript.nwbox.com/ContentLoaded/
	 *
	 */
	function _runOnContentLoaded() {
		(function(i) {
			var u =navigator.userAgent;
			var e=/*@cc_on!@*/false;
			var st =setTimeout;
			if(/webkit/i.test(u)) {
				st(function(){
						var dr=document.readyState;
						if(dr=="loaded"||dr=="complete") {
							i()
						} else {
							st(arguments.callee,10);
						}
					},
				10);
			}
			else if((/mozilla/i.test(u)&&!/(compati)/.test(u)) || (/opera/i.test(u))) {
				document.addEventListener("DOMContentLoaded",i,false);
			} else if(e) {
				(function(){
					var t=document.createElement('doc:rdy');
					try{
						t.doScroll('left');
						i();
						t=null;
					} catch(e) {
						st(arguments.callee,0);
					}
				})();
			} else {
				window.onload=i;
			}
		})(Hyphenator.hyphenateDocument);
	};


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
			_runOnContentLoaded();
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
            hyphen=str || String.fromCharCode(173);
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
			if(DEBUG)
				_log("preparing-state: 1 (loading)");
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
			if(DEBUG) {
				for(var l in doclanguages) {
					_log("language found: "+l);
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
					if(DEBUG)
						_log("preparing-state: 2 (loaded)");
				}
			},100);

		},
		hyphenateDocument: function() {
			if(DEBUG)
				_log("hyphenateDocument");
			if(preparestate!=2 && enableRemoteLoading) {
				if(preparestate==0) {
					Hyphenator.prepare();               // load all language patterns that are used
				}
				var interval=window.setInterval(function(){
					if(preparestate==2) {
						window.clearInterval(interval);
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
			if(DEBUG)
				_log("hyphenateElement: "+el.tagName+" id: "+el.id);
			if(!lang) {
				if(DEBUG)
					_log("lang not set");
				var lang=_getLang(el);
				if(DEBUG)
					_log("set lang to "+lang);
			} else {
				if(DEBUG)
					_log("got lang from parent ("+lang+")");
				var elemlang=_getLang(el, true);
 				if(elemlang!=null) {
					var lang=elemlang;
					if(DEBUG)
						_log("but element has own lang ("+lang+")");
				}
			}
			if(DEBUG)
				_log("language: "+lang);
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
                    if(DEBUG)
						_log("hyphenation done for: "+el.tagName+" id: "+el.id);
                } else if(n.nodeType==1 && !DONTHYPHENATE[n.nodeName.toLowerCase()]) {			//typ 1=element node -> recursion
                    if(DEBUG)
						_log("traversing: "+n.nodeName.toLowerCase());
                    Hyphenator.hyphenateElement(n,lang);
                }
            }
            el.style.visibility='visible';
        },
		hyphenateWord    : function(lang,word) {
			if(word=='') {
				return '';
			}
			if(word.indexOf('­')!=-1) { //this String only contains the unicode char 'Soft Hyphen' wich may not be visible in some editors!
				//word already contains shy; -> leave at it is!
				return word;
			}
			if(hyphen=='&shy;') {
				hyphen=String.fromCharCode(173);
			}
			if(hyphenation[word]) {
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
			var positions = []; 		//hyphenating points
			var result = [];			//syllabs
			var w='_'+word.toLowerCase()+'_';	//mark beginning an end
			var wl=w.length;
			var i=wl-2;
			do {
				positions[i]=0;
			} while(i--);
			var s=wl-1;
			do {
				var maxl=wl-s;
				var window=w.substring(s);
				for(var l=Hyphenator.shortestPattern[lang]; l<=maxl && l<=Hyphenator.longestPattern[lang]; l++) {
					var part=window.substring(0,l);	//window from position s with length l
					var values=null;
					if(Hyphenator.patterns[lang][part]!==undefined) {
						values=Hyphenator.patterns[lang][part];
						var i=s-1;
						var v;
						for(var p=0, le=values.length; p<le; p++, i++) {
							v=parseInt(values.charAt(p));
							if(v>positions[i]) {
								positions[i]=v; //set the values, overwriting lower values
							}
						}
					}
				}
			} while(s--)
			wl=word.length;
			for(i=1; i<wl; i++) {
				if(!!(positions[i]&1) && i>=Hyphenator.leftmin[lang] && i<=word.length-Hyphenator.rightmin[lang]) {
					result.push(word.substring(result.join('').length,i)); //Silben eintragen
				}
			}
			result.push(word.substring(result.join('').length,i)); //Letzte Silbe eintragen
			return result.join(hyphen);
		},
		hyphenateURL: function(url){
			return url.replace(/([:\/\.\?#&_,;!@]+)/gi,'$&'+urlhyphen);
		}

	};
})();
if(Hyphenator.isBookmarklet()) {
	Hyphenator.hyphenateDocument();
}