/**************** Preamble ****************/
// This script is licensed under the creative commons license
// Attribution-Share Alike 2.5 Switzerland
// You are free to share and to remix this work under the 
// following conditions: Attribution and Share-Alike
// See http://creativecommons.org/licenses/by-sa/2.5/ch/deed.en
// Thus you are free to use it for commercial purposes.
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
	var verbose=false; // turn visual feedback on:true/off:false
	var debug=false; // turn debug mode on:true/off:false
	var basepath='http://hyphenator.googlecode.com/svn/trunk/'; // change this if you copied the script to your webspace
	var languages={'de':true,'en':true,'fr':true}; //delete languages that you won't use (for better performance)
	var prompterStrings={'de':'Die Sprache dieser Webseite konnte nicht automatisch bestimmt werden. Bitte Sprache angeben: \n\nDeutsch: de\tEnglisch: en\tFranz%F6sisch: fr',
						 'en':'The language of these website could not be determined automatically. Please indicate main language: \n\nEnglish: en\tGerman: de\tFrench: fr',
						 'fr':'La langue de cette site ne pouvait pas %EAtre d%E9termin%E9e automatiquement. Veuillez indiquer une langue: \n\nFran%E7ais: fr\tAnglais: en\tAllemand: de'};
	var hyphenateclass='hyphenate'; // the CSS-Classname of Elements that should be hyphenated eg. <p class="hyphenate">Text</p>
	var hyphen=String.fromCharCode(173); // the hyphen, defaults to &shy;
	var min=6; // only hyphanete words longer then or equal to 'min'
	
	/************ don't change! ************/
	var bookmarklet=false;
	var patternsloaded={}; // this is set when the patterns are loaded
	var preparestate=0; //0: not initialized, 1: loading patterns, 2: ready
	var mainlanguage=null;
	var donthyphenate={'script':true,'code':true,'pre':true,'img':true,'br':true};

	
	/************ UA related ************/
	var zerowidthspace='';
	// The zerowidthspace is inserted after a '-' in compound words
	// like this, Firefox and IE will break after '-' if necessary
	function _createZeroWidthSpace() {
		var ua=navigator.userAgent.toLowerCase();
		if(ua.indexOf('firefox')!=-1 || ua.indexOf('msie 7')!=-1) {
			zerowidthspace=String.fromCharCode(8203); //UTF zero width space
		}
	}
	
	// checks if the script runs as a Bookmarklet
	function _checkIfBookmarklet() {
		var loc=null;
		var jsArray = document.getElementsByTagName('script');
		for(var i=0; i<jsArray.length; i++) {
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
			if(languages[ul]) {
				text=prompterStrings[ul];
			} else {
				text=prompterStrings.en;
			}
			var lang=window.prompt(unescape(text), ul);
			if(languages[lang]) {
				mainlanguage = lang;
			}
		}
	};

    // gets the lang for the given Element
    // if not set, use the mainlanguage of the hole site
	function _getLang(el) {
		if(!!el.getAttribute('lang')) {
			return el.getAttribute('lang').substring(0,2);
		}
		if(!!el.getAttribute('xml:lang')) {
			return el.getAttribute('xml:lang').substring(0,2);
		}
		if(mainlanguage) {
			return mainlanguage;
		}
		return null;
	};

	/************ pattern (loading) related methods ************/
	// Loads the hyphenation-patterns for specific languages
	// by adding a new <script>-Element
	// Why not using AJAX? Because it is restricted to load data
	// only from the same site - so the Bookmarklet won't work...
	function _loadPatterns(lang) {
		if(debug)
			_log("load patterns "+lang);
		if(languages[lang] && !patternsloaded[lang]) {
	        var url=basepath+'patterns/'+lang+'.js';
	        if(lang=="de") {
	        	url=basepath+'patterns/newpatterns/de.js';
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
		if(debug)
			_log('Loading '+url);
	};

	/************ hyphenate helper methods ************/
	// walk throug the document and do the job
	function _runHyphenation() {
		var body=document.getElementsByTagName('body')[0];
		if(Hyphenator.isBookmarklet()) {
			Hyphenator.hyphenateElement(body);
		} else {
			var elements=body.getElementsByTagName('*');
			for(var i=0; i<elements.length; i++)
			{
				if(elements[i].classNameindexOf(hyphenateclass)!=-1) {
					Hyphenator.hyphenateElement(elements[i]);
				}
			}
		}
	};

	/************ init methods ************/
	function _autoinit() {
		for(var lang in languages) {
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
		setMinWordLength: function(mymin) {
            min=mymin;
		},
		setHyphenChar: function(str) {
            hyphen=str;
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
			if(debug)
				_log("preparing-state: 1 (loading)");
			preparestate=1;
			var languages={};
			languages[mainlanguage]=true;
			var elements=document.getElementsByTagName('body')[0].getElementsByTagName('*');
			var lang=null;
			for(var i=0; i<elements.length; i++) {
				if((lang=_getLang(elements[i])) && !languages[lang]) {
					languages[lang]=true;
				}
			}
			if(debug) {
				for(var l in languages) {
					_log("language found: "+l);
				}
			}
			for(lang in languages) {
				_loadPatterns(lang);
			}
			// wait until they are loaded
			interval=window.setInterval(function(){
				finishedLoading=false;
				for(lang in languages) {
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
					if(debug)
						_log("preparing-state: 2 (loaded)");
				}
			},100);

		},
		hyphenateDocument: function() {
			if(debug)
				_log("hyphenateDocument");
			if(preparestate!=2) {
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
			if(debug)
				_log("hyphenateElement: "+el.tagName+" id: "+el.id);
			if(!lang) {
				if(debug)
					_log("lang not set");
				var lang=_getLang(el);
				if(debug)
					_log("set lang to "+lang);
			} else {
				if(debug)
					_log("got lang from parent ("+lang+")");
				var newlang=_getLang(el);
				if(newlang!=lang) {
					var lang=newlang;
					if(debug)
						_log("but element has own lang ("+lang+")");
				}
			}
			if(debug)
				_log("language: "+lang);
			var cn=el.childNodes;
			for(var i=0; i<cn.length; i++) {
				if(cn[i].nodeType==3) {				//type 3=#text -> hyphenate!
                    var wrd='[\\w'+Hyphenator.specialChars[lang]+'­-]{'+min+',}';
                    var url='(\\w*:\/\/)((\\w*:)?(\\w*)@)?([\\w\.]*)?(:\\d*)?(\/[\\w#!:.?+=&%@!\-]*)*';
                    var wrdRE=new RegExp(wrd,'i');
                    var urlRE=new RegExp(url,'i');
                    function hyphenate(word) {
                        //alert(word);
                        if(word.search(urlRE)!=-1) {
                            return Hyphenator.hyphenateURL(word);
                        } else {
                            return Hyphenator.hyphenateWord(lang,word);
                        }
                    }
                    var genRegExp=new RegExp('('+url+')|('+wrd+')','gi');
                    cn[i].data=cn[i].data.replace(genRegExp,hyphenate);
                } else if(cn[i].nodeType==1 && !donthyphenate[cn[i].nodeName.toLowerCase()]) {			//typ 1=element node -> recursion
                    Hyphenator.hyphenateElement(cn[i],lang);
                }
            }
        },
		hyphenateWord    : function(lang,word) {
			if(word.search(/­/)!=-1) { //this RegEx only contains the unicode char 'Soft Hyphen' wich may not be visible in some editors!
				//word already contains shy; -> leave at it is!
				return word;
			}
			//finally the core hyphenation algorithm
			if(debug)
				_log("hyphenateWord: "+word);
			var positions = new Array(); 		//hyphenating points
			var result = new Array();			//syllabs
			var w='_'+word.toLowerCase()+'_';	//mark beginning an end
			for(var i=0; i<w.length; i++) {
				positions[i]=0;
			}
			for(var s=0; s<w.length; s++) {		//walk throug word letter by letter
				var maxl=w.length-s;
				for(var l=Hyphenator.shortestPattern[lang]; l<=maxl && l<=Hyphenator.longestPattern[lang]; l++) {	//enlarge the window shortest pattern has length 2, longest length 10
					var part=w.substring(s).substring(0,l);	//window from position s with length l
					//if(debug)
					   //_log('window: '+part);
					var values=null;
					if((values=Hyphenator.patterns[lang][part])!=null) {		//get patterns and values from list
						var i=s;
                        if(debug)
                            _log('pattern found: '+part+' with value: '+values);
						for(var p=0; p<values.length; p++) {
							if(parseInt(values.charAt(p))>positions[i]) {
								positions[i]=parseInt(values.charAt(p)); //set the values, overwriting lower values
							}
							i++;
						}
					}
				}
			}
			//pop the begin-/end-markers (_) 
			positions.pop();
			positions.shift();
			for(i=0; i<word.length; i++) {
				if(parseInt(positions[i])%2 != 0 && i!=0 && i>=Hyphenator.leftmin[lang] && i<=word.length-Hyphenator.rightmin[lang]) {
					result.push(word.substring(result.join('').length,i)); //Silben eintragen
				}
			}
			result.push(word.substring(result.join('').length,i)); //Letzte Silbe eintragen
			if(hyphen=='&shy;') {
				hyphen=String.fromCharCode(173);
			}
			return result.join(hyphen);
		},
		hyphenateURL: function(url){
			var res='';
			res=url.replace(/\//gi,String.fromCharCode(8203)+'/');
			res=res.replace(/\./gi,String.fromCharCode(8203)+'.');
			return res;
		}
		
	};
})();
if(Hyphenator.isBookmarklet()) {
	Hyphenator.hyphenateDocument();
}