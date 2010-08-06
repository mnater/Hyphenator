load("build/jslint.js");

var fileList = {
	'Hyphenator_debug.js': readFile("dist/Hyphenator_debug.js"), 
	'Hyphenator_worker_debug.js': readFile("dist/Hyphenator_worker_debug.js")
},
fileName;

function run (filename, src) {
	//Options are to be set in magic comment in the source file
	JSLINT(src);
	
	var errors = JSLINT.errors, l = errors.length, i;
	if (l > 0) {
		for (i = 0; i < l; i++ ) {
			print("\n" + errors[i].evidence + "\n");
			print("    Problem in file " + filename + " at line " + errors[i].line + " character " + errors[i].character + ": " + errors[i].reason);
		}
	} else {
		print(filename + " has JSLint check passed." );
	}
}

for (fileName in fileList) {
	if (fileList.hasOwnProperty(fileName)) {
		run(fileName, fileList[fileName]);
	}
}