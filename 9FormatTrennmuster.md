# Optimierung der Trennmuster bezüglich Grösse und Geschwindigkeit #

## Das Problem ##
Hyphenator muss neben dem eigentlichen Script-Code auch noch Trennmusterdateien für jede Sprache laden, die auf der Seite verwendet wird. Diese Trennmusterdateien sind zum Teil ziemlich gross &ndash; zu gross meinen einige.

Wenn man sich die Trennmusterdatei anschaut, sieht man, dass ein Grossteil der Daten Anführungszeichen und Nullen sind. Und der kritische Betrachter mag sich fragen, warum hier so verschwenderisch mit dem teuren Speicherplatz umgegangen wird.

Der gut informierte Betrachter weiss ausserdem, dass die ursprüglichen Trennmuster &ndash; so wie man sie von LaTeX oder OpenOffice her kennt &ndash; viel dichter gepackt sind:
| **LaTeX** | **Hyphenator** | **Delta** |
|:----------|:---------------|:----------|
| n1tr | "ntr":"0100", | 13-4=9 Zeichen |

Ich möchte im Folgenden zeigen, weshalb ich mich für das (auf den ersten Blick) ungünstige Format entschieden habe, indem ich die verschiedenen Lösungsansätze aufzeige, mit denen ich experimentiert habe und vor allem auch, wie sie im realen Umfeld perfomen.

## Lösungsansätze ##
Bis jetzt habe ich mir drei Lösungsansätze ausgedacht und diese auch umgesetzt und getestet:
  * Bereitstellung der Muster als assoziatives Array mit Schlüssel-Wert-Paaren in einem JavaScript-Objekt (_JSON-Notation_)
  * Bereitstellung der Muster als String in der _LaTeX-Notation mit Konvertierung in ein assoziatives Array_ mit Schlüssel-Wert-Paaren nach dem Download.
  * Bereitstellung der Muster als String in der _LaTeX-Notation mit Abbildung auf einen Trie_ nach dem Download.

Jeder dieser Lösungsansätze hat theoretsiche, aber auch praktische Vor- und Nachteile, die im Folgenden besprochen werden.

### JSON-Notation ###
Dieser Ansatz wird im Moment in Hyphenator eingesetzt. Die Muster werden direkt in der Javascript-Object-Notation (JSON) notiert, so dass sie der Interpreter des Browsers sofort einlesen kann:

```
Hyphenator.patterns['de']={".a":"006",".abb":"00030",".aben":"000002" /*...*/};
```

Der Zugriff auf die einzelnen Muster ist hiermit denkbar einfach und geschieht in allen Browsern in kaum messbar kurzer Zeit. Die Muster stehen sofort bereit, sobald die JavaScript-Datei geladen wurde; sie brauchen aber unverhältnismässig viel Platz.

### LaTeX-Notation mit Konvertierung in ein assoziatives Array ###
Hier werden die Muster als String in der LaTeX-Notation vom Server auf den Browser übertragen:

```
Hyphenator.patterns['de']="_a6 _ab3b _aben2 /*...*/";
```

Aschliessend werden sie im Browser mittels Javascript in ein Schlüssel-Wert-Paare-Objekt (wie oben) konvertiert.

```
function _convertPatternsToObject() {
	for(var lang in Hyphenator.patterns) {
		var sa=Hyphenator.patterns[lang].split(' ');
		Hyphenator.patterns[lang]={};
		var le=sa.length;
		var pat, val, key, i, j, c;
		var isdigit=false;
		for(i=0; i<le; i++) {
			pat=sa[i];
			val='';
			key='';
			
			for(j=0; j<pat.length; j++) {
				c=pat.charAt(j);
				if(isFinite(c)) {
					val+=c;
					isdigit=true;
				} else {
					if(!isdigit) {
						val+=0;
					}
					isdigit=false;
					key+=c;
				}
			}
				if(!isdigit) {
					val+='0';
				}
			Hyphenator.patterns[lang][key]=val;
		}
	}
};
```

Der Zugriff auf die Muster ist nach der Konvertierung, wie oben, sehr einfach und schnell. Die Muster sind sehr kompakt und werden somit schneller übertragen. Allerdings braucht die Konvertierung in ein Objekt je nach Anzahl der Muster und je nach Browser etwas Zeit und Rechenleistung.

### LaTeX-Notation mit Abbildung auf einen Trie ###
Auch in diesem Ansatz werden die Muster in der LaTeX-Notation übertragen, anschliessend aber nicht in ein einfaches Schlüssel-Wert-Paare-Objekt konvertiert, sondern in einem sogenannten Trie (sic!) abgebildet:

```
function Trie(pos) {
	this.position=pos || 0; 	//this trie is at this position
	this.leaf=null;				//holds a TrieEntry, if a string ends here
	this.branches={};			//holds a child trie
	this.insert=insert;
	this.search=search;
	this.dump=dump;
}

	function insert(key, data) {
		if(key.length==this.position) {
			this.leaf=new TrieEntry(key, data);
			return;
		}
		var i=key.charAt(this.position);
		if(this.branches[i] != null) { //there is something in this branch
			if(this.branches[i].branches) {
				this.branches[i].insert(key, data);
				return;
			}
			if(this.branches[i].key) {
				var down=new Trie(this.position+1);
				down.insert(this.branches[i].key,this.branches[i].data);
				down.insert(key,data);
				this.branches[i]=down;
			}
			return;
		}
		this.branches[i]=new TrieEntry(key, data);
	}
	
	/*
	 * function search(key, frombranch)
	 *
	 * returns the subtrie from the current position, if keylength equals the current position
	 * returns null, if nothing can be found
	 * returns data string if key equals the TrieEntry.key
	 * returns TrieEntry-Object if TrieEntry.key begins with key
	 * makes recursion if there are further branches
	 *
	 */
	function search(key, frombranch) {
		var frombranch=frombranch || this;
		if(key.length==frombranch.position) {
			return frombranch;
		}
		var c=key.charAt(frombranch.position);
		if(frombranch.branches[c]) {
			if(frombranch.branches[c].branches) { //es gibt subtries
				return frombranch.branches[c].search(key); //recursion
			} else if(frombranch.branches[c].key==key){ // es gibt einen TrieEntry für key
				return frombranch.branches[c].data; //returns string
			} else if(frombranch.branches[c].key.indexOf(key)!=-1) { //es gibt einen TrieEntry für einen Schlüssel, der mit key beginnt
				return frombranch.branches[c]; //returns object
			}
		} else {
			return null;
		}
		
	}
	
	function dump() {
		var elem=document.getElementById("output");
		var indent="";
		for(var i=0; i<this.position; i++) {
			indent+="\t";
		}
		if(this.leaf != null) {
			elem.lastChild.data+=this.position+' | '+indent+"leaf:"+this.leaf.dump()+"\n";
		}
		for(var val in this.branches) {
			if(this.branches[val] instanceof Trie) {
				elem.lastChild.data+=this.position+' | '+indent+val+" Trie:\n";
				this.branches[val].dump();
			} else if(this.branches[val] instanceof TrieEntry) {
				elem.lastChild.data+=this.position+' | '+indent+"TrieEntry: "+this.branches[val].dump()+"\n";
			}
		}
	}
	
function TrieEntry(key, data){
	this.key=key || "";
	this.data=data || "";
	this.dump=TrieEntryDump;
}
	
	function TrieEntryDump() {
		return "key: "+this.key+", data: "+this.data;
	}
```

Der Trie bietet den Vorteil, dass mit der Vergrösserung eines Ausschnittes des zu trennenden Wortes aufgehört werden kann, wenn Trie.search() null zurückgibt, d.h. wenn keine weiteren Werte für den aktuellen Wortausschnitt mehr vorhanden sind (dies ist bei einem Schlüssel-Wert-Paare-Objekt nicht möglich).
Theoretisch ist auch der 'Fussabdruck' des Tries im Arbeitsspeicher kleiner, als der eines Schlüssel-Wert-Paare-Objekts. Dies kann aber nicht überprüft werden.
Allerdings braucht auch die Abbildung auf den Trie ihre Rechenzeit.

## Experimente und Resultate ##
Nun ist es natürlich spannend zu wissen, wie diese drei Lösungsansätze in einem realen Umfeld (Übertragung über das Internet, verschiedene Browser) performen.
Dabei stellt sich das Problem der sehr unterschiedlichen Qualität der Javascript-Engines in den Browsern. Safari 3.0.

In der Folge habe ich einige Zahlen zusammengefasst:
Testumgebung: MacBook Pro 2.2GHz Intel Core 2 Duo, 4 GB 667 MHz DDR2 SDRAM.
Als Testdatenstruktur habe ich die neuesten Trennmuster für Deutsch mit 14'489 Trennmustern gewählt
Als Übertragungsgeschwindigkeit nehme ich für heutige Verhältnisse niedrige 256Bit/s (EDGE) an, da so die Datengrösse mehr ins Gewicht fällt.

### Mac OS X 10.5.5, Safari 3.1.2 ###
| | **JSON-Notation** | **String2Object** | **String2Trie**|
|:|:------------------|:------------------|:|
| Erstellung der Datenstruktur | 0ms | 192ms | 312ms |
| Dateigrösse (zip) | 57'992 Bit | 47'072 Bit | 47'072 Bit |
| Übertragung bei 256Bits/s | 0.2s | 0.2s |  0.2s |
| _Total_ | 0s+0.2s=0.2s | 0.192s+0.2s=0.392s | -- |
| Dateigrösse | 224'695 Bit | 95'576 Bit | 95'576 Bit |
| Übertragung bei 256Bits/s | 0.9s | 0.4s |  0.4s |
| _Total_ | 0s+0.9s=0.9s | 0.192s+0.4s=0.592s | -- |
| 5000 Patternzugriffe | 4ms | 4ms | 42ms |

### Mac OS X 10.5.5, Firefox 3.0.3 ###
| | **JSON-Notation** | **String2Object** | **String2Trie**|
|:|:------------------|:------------------|:|
| Erstellung der Datenstruktur | 0ms | 168ms | 273ms |
| Dateigrösse (zip) | 57'992 Bit | 47'072 Bit | 47'072 Bit |
| Übertragung bei 256Bits/s | 0.2s | 0.2s |  0.2s |
| _Total_ | 0s+0.2s=0.2s | 0.168s+0.2s=0.368s | -- |
| Dateigrösse | 224'695 Bit | 95'576 Bit | 95'576 Bit |
| Übertragung bei 256Bits/s | 0.9s | 0.4s |  0.4s |
| _Total_ | 0s+0.9s=0.9s | 0.168s+0.4s=0.568s | -- |
| 5000 Patternzugriffe | 2ms | 2ms | 42ms |

### Mac OS X 10.5.5 with Windows XP on VMWare, IE 7 ###
| | **JSON-Notation** | **String2Object** | **String2Trie**|
|:|:------------------|:------------------|:|
| Erstellung der Datenstruktur | 0ms | 540ms | 5625ms |
| Dateigrösse (zip) | 57'992 Bit | 47'072 Bit | 47'072 Bit |
| Übertragung bei 256Bits/s | 0.2s | 0.2s |  0.2s |
| _Total_ | 0s+0.2s=0.2s | 0.540s+0.2s=0.740s | -- |
| Dateigrösse | 224'695 Bit | 95'576 Bit | 95'576 Bit |
| Übertragung bei 256Bits/s | 0.9s | 0.4s |  0.4s |
| _Total_ | 0s+0.9s=0.9s | 0.540+0.4s=0.940s | -- |
| 5000 Patternzugriffe | 0ms | 0ms | 125ms |

### Interpretation der Zahlen ###
Die Zeit für die Übertragung der Daten sind theoretisch berechnet. Trotzdem lassen sich einige Schlüsse ziehen.

  1. Die JSON-Daten lassen sich sehr effizient komprimieren, dank der vielen gleichen Zeichen kann die Datei auf nahezu 25% ihrer Grösse komprimiert werden. Die LaTeX-Daten weisen schon eine hohe Dichte auf und lassen sich auf 50% komprimieren. Letztendlich beträgt der Unterschied noch ca. 10'920 Bit. Die Daten sollten auf jeden Fall komprimiert übertragen werden.
  1. Die Konvertierung der LaTeX-Daten in ein Objekt braucht im schlimmsten Fall &ndash; im Internet Explorer und somit im häufigsten Fall &ndash; etwa eine halbe Sekunde.
  1. Die Abbildung auf einen Trie und der Zugriff auf den Trie ist auf allen Systemen relativ langsam &ndash; im Internet Explorer sogar unbrauchbar.
  1. Bei unkomprimierten Daten sind die LaTeX-Daten klar im Vorteil; werden die Daten komprimiert, ist der Unterschied aber vernachlässigbar klein. Der Vorteil schwindet, je grösser die Bandbreite ist. Schon bei 300kBit/s ist  die Übertragung der (unkomprimierten!) Daten im JSON-Format gleich schnell, wie die Übertragung der (komprimierten!) Daten im LaTeX-Format plus derer Konvertierung im IE7.

## Fazit ##
Wie die obigen Tabellen zeigen, ist die Übertragung der **komprimierten** Trennmuster in der **JSON-Notation** durchs Band die schnellste Option.
Nur wenn die Daten nicht komprimiert übertragen werden (können), ist die LaTeX-Notation performanter. Der Trie kann ganz ausgeschlossen werden.
Konsequenterweise werde ich den Trie-Branch aussterben lassen müssen und stattdessen einen Branch für die LaTeX-Notation unterhalten.

