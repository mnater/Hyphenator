load("build/jslint.js");


var  files = readFile("tmp/srcfiles.txt"), fileList = {},
fileName, i, name, path;
	//'Hyphenator_debug.js': readFile("dist/Hyphenator_debug.js")

files = files.split(':');
for (i=0; i<files.length; i++) {
	name = files[i].replace(/src\//, '');
	path = files[i];
	fileList[name] = readFile(path);
}

function run (filename, src) {
	var options = {white: true, browser: true, devel: true, onevar: true, undef: false, nomen: true, eqeqeq: false, bitwise: false, regexp: true, newcap: true, immed: true};
	JSLINT(src, options);
	
	var errors = JSLINT.errors, l = errors.length, i;
	if (l > 0) {
		for (i = 0; i < l; i++ ) {
			print("\n" + errors[i].evidence + "\n");
			print("    Problem in file " + filename + " at line " + errors[i].line + " character " + errors[i].character + ": " + errors[i].reason);
		}
	} else {
		print(filename + " passed JSLint check." );
	}
}

for (fileName in fileList) {
	if (fileList.hasOwnProperty(fileName)) {
		run(fileName, fileList[fileName]);
	}
}