/*global window, ArrayBuffer, DataView */
/*jslint
    browser: true
*/
var patternObject = {
    3: '1ab'
    /*33: '1na2ioo2n',
    4: 'he2nn2at1tio',
    5: 'hena4hy3ph',
    6: 'hen5at'*/
};

var Trie = function () {
    'use strict';
    this.chars = null;
    this.points = null;
    this.pointsLastindex = 0;
    this.countChars = 0;
    this.create = function (count) {
        this.chars = new ArrayBuffer(350);
        this.points = new ArrayBuffer(count * 6);
        return undefined;
    };
    this.add = function (patternArray, pointArray) {
        var pointsView = new DataView(this.points),
            charsView = new DataView(this.chars),
            ci,
            pi,
            pointsLocation = 0,
            chr,
            chrCode,
            bytePos = 0, //each field has 1 bytes (settings) + 2bytes (char) + 4bytes (pointer) = 7bytes
            lastBytePos = 0,
            mode = 0, //0: tranisition, 1 insert
            chrNum,
            convertArray = function (entry) {
                var r;
                if (entry === '') {
                    r = 0;
                } else {
                    r = parseInt(entry, 10);
                }
                return r;
            };
        window.console.log('adding points ' + pointArray.map(convertArray) + ' at position ' + (this.pointsLastindex + 1));
        for (pi = 0; pi < pointArray.length; pi += 1) {
            pointsLocation = this.pointsLastindex + 1;
            pointsView.setUint8(pointsLocation, pointArray[pi] === '' ? 0 : parseInt(pointArray[pi], 10));
            this.pointsLastindex = pointsLocation;
        }

        charsView.setUint8(0, 1);

        ci = 0;
        while (ci < patternArray.length) {
            chr = patternArray[ci];
            chrCode = chr.charCodeAt(0);
            chrNum = chrCode - 96; //a=1, z=26
            bytePos = bytePos + (chrNum * 7);
            window.console.log('add char ' + chr + '(' + chrCode + '): try position ' + bytePos);

            if (charsView.getUint8(bytePos) === 0) {
                window.console.log('position free');
                window.console.log('  at pos ' + bytePos);
                //mark this field as used
                charsView.setUint8(bytePos, 1);
                //insert char
                charsView.setUint16(bytePos + 1, chrCode);
                //set pointer to this field
                window.console.log('  and pointer ' + bytePos + ' at pos ' + (lastBytePos + 3));
                charsView.setUint32(lastBytePos + 3, bytePos);
                lastBytePos = bytePos;
                if (ci === (patternArray.length - 1)) {
                    //mark word
                    charsView.setUint8(bytePos, 2);
                }
                //set pointer to points
                //…                
            } else {
                window.console.log('position occupied');
            }

            while (charsView.getUint8(bytePos) !== 0) {
                window.console.log('position ' + bytePos + ' is occupied…');
                if (charsView.getUint16(bytePos + 1) === chrCode) {
                    window.console.log('    by the same char');
                    //stay on this path
                    bytePos = charsView.getUint32(bytePos + 3);
                    mode = 0;
                } else {
                    window.console.log('    by another char');
                    //make new path
                    bytePos = charsView.getUint32(bytePos + 3) + (chrNum * 7);
                    mode = 1;
                }
            }
            window.console.log('new position: ' + bytePos + ' // mode: ' + mode);
            if (mode === 1) {
                window.console.log('  at pos ' + bytePos);
                //mark this field as used
                charsView.setUint8(bytePos, 1);
                //insert char
                charsView.setUint16(bytePos + 1, chrCode);
                //set pointer to this field
                window.console.log('  and pointer ' + bytePos + ' at pos ' + (lastBytePos + 3));
                charsView.setUint32(lastBytePos + 3, bytePos);
                lastBytePos = bytePos;
                if (ci === (patternArray.length - 1)) {
                    //mark word
                    charsView.setUint8(bytePos, 2);
                }
                //set pointer to points
                //…
                this.log();
            } else {
                window.console.log('  char already set at ' + bytePos);
            }

            ci += 1;
        }

        /*for (ci = 0; ci < patternArray.length; ci += 1) {
            chr = patternArray[ci];
            chrCode = chr.charCodeAt(0);
            chrNum = chrCode - 96; //a=1, z=26
            bytePos = 0;
            window.console.log('add char ' + chr + '(' + chrCode + ')');
            while (charsView.getUint8(bytePos) !== 0) {
                window.console.log('position ' + bytePos + 'is used');
                if (charsView.getUint16(bytePos + 1) === chrCode) {
                    //stay on this path
                    bytePos = charsView.getUint32(bytePos + 3);
                } else {
                    //make new path
                    bytePos = charsView.getUint32(bytePos + 3) + (chrNum * 7);
                }
            }
            window.console.log('  at pos ' + bytePos);
            //mark this field as used
            charsView.setUint8(bytePos, 1);
            //insert char
            charsView.setUint16(bytePos + 1, chrCode);
            //set pointer to this field
            window.console.log('  and pointer ' + bytePos + ' at pos ' + (lastBytePos + 3));
            charsView.setUint32(lastBytePos + 3, bytePos);
            lastBytePos = bytePos;
            if (ci === (patternArray.length - 1)) {
                //mark word
                charsView.setUint8(bytePos, 2);
            }
            //set pointer to points
            //…
            this.log();
        }*/

        return undefined;
    };

    this.get = function () {
        return undefined;
    };

    this.log = function () {
        var pointsView = new DataView(this.points),
            charsView = new DataView(this.chars),
            i,
            r = '';
        /*window.console.log('pointsView:', pointsView);
        for (i = 0; i < pointsView.byteLength; i += 1) {
            r += pointsView.getUint8(i);
        }
        window.console.log(r);
        r = '';*/
        window.console.log('charsView:', charsView);
        for (i = 0; i < (charsView.byteLength / 7); i += 7) {
            r += charsView.getUint8(i) + ' ';
            r += charsView.getUint16(i + 1) + ' ';
            r += charsView.getUint32(i + 3) + '\n';
        }
        window.console.log(r);
    };
};

function convertPatterns(patternObject) {
    'use strict';
    var size,
        patterns,
        pattern,
        i,
        chars,
        trie,
        charCount = 0,
        exPatternObject = {},
        getPoints = (function () {
            var test = 'in3se', rf;
            //IE<9 doesn't act like other browsers: doesn't preserve the separators
            if (test.split(/\D/).length === 1) {
                rf = function (pattern) {
                    pattern = pattern.replace(/\D/gi, ' ');
                    return pattern.split(' ');
                };
            } else {
                rf = function (pattern) {
                    return pattern.split(/\D/);
                };
            }
            return rf;
        }()),
        getChars = function (pattern) {
            return pattern.replace(/[\d]/g, '');
        };

    for (size in patternObject) {
        if (patternObject.hasOwnProperty(size)) {
            patterns = patternObject[size].match(new RegExp('.{1,' + (+size) + '}', 'g'));
            i = 0;
            pattern = patterns[i];
            while (!!pattern) {
                window.console.log(pattern);
                chars = getChars(pattern);
                charCount += chars.length;
                exPatternObject[chars] = getPoints(pattern);
                i += 1;
                pattern = patterns[i];
            }
        }
    }

    trie = new Trie();
    trie.create(charCount);

    for (pattern in exPatternObject) {
        if (exPatternObject.hasOwnProperty(pattern)) {
            trie.add(pattern.split(''), exPatternObject[pattern]);
        }
    }
    //trie.log();
}

function run() {
    'use strict';
    convertPatterns(patternObject);
}