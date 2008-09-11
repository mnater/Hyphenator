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

function Trie(par, pos) {
	this.position=pos || 0; 	//this trie is at this position
	this.previous=par || null; 	//reference to the parent trie
	this.leaf=null;				//holds a TrieEntry, if a string ends here
	this.branches={};			//holds a child trie
	this.insert=insert;
	this.search=search;
	this.dump=dump;
}

	function insert(key, data) {
		if(key.length==this.position) {
			this.leaf=new TrieEntry(key, data);
		} else {
			var i=key.charAt(this.position);
			if(this.branches[i] != null) { //there is something in this branch
				if(this.branches[i] instanceof Trie) {
					this.branches[i].insert(key, data);
				} else if(this.branches[i] instanceof TrieEntry) {
					var down=new Trie(this, (this.position+1));
					down.insert(this.branches[i].getKey(),this.branches[i].getData());
					down.insert(key,data);
					this.branches[i]=down;
				}
			} else {
				this.branches[i]=new TrieEntry(key, data);
			}
		}
	}
	
	function search(key) {
		if(key.length==this.position) {
			return this;
		}
		var i=key.charAt(this.position);
		if(this.branches[i]) {
			if(this.branches[i].branches) {
				return this.branches[i].search(key);
			} else if(this.branches[i].key==key){
				return this.branches[i].getData();
			}
		} else {
			return null;
		}
		
	}
	
	function dump(indent) {
		var elem=document.getElementById("output");
		var indent=indent || "";
		if(this.leaf != null) {
			elem.lastChild.data+=indent+"leaf:"+this.leaf.dump()+"\n";
		}
		for(var val in this.branches) {
			if(this.branches[val] instanceof Trie) {
				elem.lastChild.data+=indent+val+" Trie:\n";
				this.branches[val].dump(indent+"\t");
			} else if(this.branches[val] instanceof TrieEntry) {
				elem.lastChild.data+=indent+"TrieEntry: "+this.branches[val].dump()+"\n";
			}
		}
	}
	
function TrieEntry(key, data){
	this.key=key || "";
	this.data=data || "";
	this.getKey=getKey;
	this.getData=getData;
	this.dump=TrieEntryDump;
}
	function getKey() {
		return this.key;
	}
	
	function getData() {
		return this.data;
	}
	
	function TrieEntryDump() {
		return "key: "+this.getKey()+", data: "+this.getData();
	}