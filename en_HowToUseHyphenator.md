# Download and Install #
## Using Hyphenator as a Bookmarklet ##
As a normal websurfer you'll have to create a [bookmarklet](http://en.wikipedia.org/wiki/Bookmarklet) by saving the following line of code as a bookmark:

```
javascript:if(document.createElement){void(head=document.getElementsByTagName('head').item(0));void(script=document.createElement('script'));void(script.src='http://hyphenator.googlecode.com/svn/tags/4.3.0/Hyphenator.js?bm=true');void(script.type='text/javascript');void(head.appendChild(script));}
```

When you're on the website to be hyphenated you click on that bookmarklet to start hyphenating the page.
If the pages language isn't set, you will have to edit it manually in a popping-up prompt.

All [settings](http://code.google.com/p/hyphenator/wiki/en_PublicAPI#void_Hyphenator.config(object_settings)) that are not functions (the literals) can be made in the Bookmarklet, too. Append them as query string in the link above (just after `bm=true`):
E.g. `bm=true&safecopy=false&displaytogglebox=false`

## Using Hyphenator on your website ##
For a webdeveloper who wishes to hyphenate his website, things are slightly more complicated. You'll need basic knowledge about HTML and JavaScript to do the following steps.

### Step by Step (easy): w/o Hyphenator\_Loader.js ###
  1. Prepare your HTML-documents by
    * Encoding them in UTF-8 (not absolutely necessary, but highly recommended)
    * Setting the appropriate lang-attributes (e.g. `<html lang="en">`).
    * Adding `class="hyphenate"` to the elements whose text should be hyphenated (children do inherit this setting). Hyphenation can be stopped by adding `class="donthyphenate"`.
    * Validating (not absolutely necessary, but again highly recommended): http://validator.w3.org/
  1. Use the [mergeAndPack-Tool](https://hyphenator.googlecode.com/svn/tags/4.3.0/mergeAndPack.html). Here you can define what languages will be used and set all the configuration options you want (click the info buttons for details).
  1. Save the resulting "all-in-one"-script in a file (call it for example "hyphenate.js") load it to the server and hook it into your html:
```
<script src="http://yourdomain.com/path/hyphenate.js" type="text/javascript">
</script>
```
> It will then load and execute automatically.

### Step by Step (advanced): w/o Hyphenator\_Loader.js ###
  1. [Download](https://docs.google.com/folderview?id=0B70aJF1epiRqa3BLWnpVRzh0Ym8&usp=docslist_api#) an actual version of Hyphenator.js and copy it to your server (make sure to copy the folder called `patterns`, too).
  1. Prepare your HTML-documents by
    * Encoding them in UTF-8 (not absolutely necessary, but highly recommended)
    * Setting the appropriate lang-attributes (e.g. `<html lang="en">`).
    * Adding `class="hyphenate"` to the elements whose text should be hyphenated (children do inherit this setting). Hyphenation can be stopped by adding `class="donthyphenate"`.
    * Validating (not absolutely necessary, but again highly recommended): http://validator.w3.org/
  1. Include the script by adding the following code to your HTML-document:
```
<script src="http://yourdomain.com/path/Hyphenator.js" type="text/javascript">
</script>
```
  1. Invoke the script:
```
<script type="text/javascript">
	    Hyphenator.run();
</script>
```
> Done.
> There are many interesting and useful settings you can change before you invoke the script. See [Documentation](http://code.google.com/p/hyphenator/wiki/en_PublicAPI) for more details.

### Example ###
What could be better than a [working example](http://hyphenator.googlecode.com/svn/tags/Version%204.2.0/WorkingExample.html)?
```
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
    "http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
    <head>
        <title>Hyphenator.js</title>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <style type="text/css">
            body {
                width:30%;
                margin-left:35%;
                margin-right:35%;
            }
            .text {
                text-align:justify;
            }
        </style>
        <script src="Hyphenator.js" type="text/javascript"></script>
        <script type="text/javascript">
        	Hyphenator.config({
        		displaytogglebox : true,
        		minwordlength : 4
        	});
        	Hyphenator.run();
        </script>
    </head>
    <body>
        <h1>Example of using Hyphenator.js</h1>
        <h2>Deutsch</h2>
        <p class="hyphenate text" lang="de">Deutschsprachige Beispieltexte haben natürlicherweise längere Wortzusammensetzungen als englischsprachige. Aber auch <span lang="en">“hyphenation”</span> ist ein ziemlich langes Kompositum.</p>
        <p class="hyphenate text" lang="de">Verändern Sie die Fenstergrösse um den Effekt der Silbentrennung zu sehen.</p>
        <h2>English</h2>
        <p class="hyphenate text" lang="en">English words are shorter in the average then german words. <span lang="de">«Silbentrennungsalgorithmus»</span> for example is quite long.</p>
        <p class="hyphenate text" lang="en">Resize the window to see hyphenation in effect.</p>
        <h2>Links</h2>
        <p class="hyphenate text" lang="en">Not only words but also links like <a href="http://code.google.com/p/hyphenator/">http://code.google.com/p/hyphenator/</a> are processed. But in a special manner (using zero width space).</p>
    </body>
</html>
```

## Hyphenator\_Loader.js ##
Loading Hyphenator.js and the pattern files is expensive in matters of loading time: Even if you merge and minify the script and the pattern files it's kind of wheighty (~74kB for Hyphenator.js plus the patterns for us-en).

In many cases it's not necessary nor advisable to load the full package:
**more and more browsers support css3 hyphenation for a certain set of languages (http://caniuse.com/#feat=css-hyphens).** on a mobile client Hyphenator.js is too expensive in matters of loaded data and computation.

This is where Hyphenator\_Loader.js comes in handy. It tests if the client supports css3 hyphenation for the required languages and only loads Hyphenator.js if at least one of the required languages isn't supported.

To use Hyphenator\_Loader.js follow the following steps:

### Step by Step (easy): with Hyphenator\_Loader.js ###
  1. Prepare your HTML-documents by
    * Encoding them in UTF-8 (not absolutely necessary, but highly recommended)
    * Setting the appropriate lang-attributes (e.g. `<html lang="en">`).
    * Adding `class="hyphenate"` to the elements whose text should be hyphenated (children do inherit this setting). Hyphenation can be stopped by adding `class="donthyphenate"`.
    * Validating (not absolutely necessary, but again highly recommended): http://validator.w3.org/
  1. Use the [mergeAndPack-Tool](http://hyphenator.googlecode.com/svn/trunk/mergeAndPack.html). Here you can opt-in for Hyphenator\_Loader and set all the configuration options you want (click the info buttons for details).
  1. Hit 'create' and save the resulting scripts as described at the bottom of the mergeAndPack-page.


## Legal ##
Hyphenator.js and its documentation are published under the [LGPL v3](http://www.gnu.org/licenses/lgpl.html):
```
/** @license Hyphenator 4.2.0 - client side hyphenation for webbrowsers
 *  Copyright (C) 2013  Mathias Nater, Zürich (mathias at mnn dot ch)
 *  Project and Source hosted on http://code.google.com/p/hyphenator/
 * 
 *  This JavaScript code is free software: you can redistribute
 *  it and/or modify it under the terms of the GNU Lesser
 *  General Public License (GNU LGPL) as published by the Free Software
 *  Foundation, either version 3 of the License, or (at your option)
 *  any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS
 *  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *  As additional permission under GNU GPL version 3 section 7, you
 *  may distribute non-source (e.g., minimized or compacted) forms of
 *  that code without the copy of the GNU GPL normally required by
 *  section 4, provided you include this license notice and a URL
 *  through which recipients can access the Corresponding Source.
 *
 * 
 *  Hyphenator.js contains code from Bram Steins hypher.js-Project:
 *  https://github.com/bramstein/Hypher
 *  
 *  Code from this project is marked in the source and belongs 
 *  to the following license:
 *  
 *  Copyright (c) 2011, Bram Stein
 *  All rights reserved.
 *  
 *  Redistribution and use in source and binary forms, with or without 
 *  modification, are permitted provided that the following conditions 
 *  are met:
 *   
 *   1. Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer. 
 *   2. Redistributions in binary form must reproduce the above copyright 
 *      notice, this list of conditions and the following disclaimer in the 
 *      documentation and/or other materials provided with the distribution. 
 *   3. The name of the author may not be used to endorse or promote products 
 *      derived from this software without specific prior written permission. 
 *  
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED 
 *  WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF 
 *  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO 
 *  EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 *  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY 
 *  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING 
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *  
 */
```
Most of the patterns in the pattern files have different licenses specified in the pattern files.

## Stay up to date ##
Subscribe to the RSS on the downloads page to get information about updates of Hyphenator.
It's recommended to replace older versions upon release of a new version.