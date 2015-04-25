# Download and Install #
## Using Hyphenator as a Bookmarklet ##
As a normal websurfer you'll have to create a [bookmarklet](http://en.wikipedia.org/wiki/Bookmarklet) by saving the following line of code as a bookmark:

```JavaScript
javascript:if(document.createElement){void(head=document.getElementsByTagName('head').item(0));void(script=document.createElement('script'));void(script.src='http://mnater.github.io/Hyphenator/Hyphenator.js?bm=true');void(script.type='text/javascript');void(head.appendChild(script));}
```

When you're on the website to be hyphenated you click on that bookmarklet to start hyphenating the page.
If the pages language isn't set, you will have to edit it manually in a popping-up prompt.

All [settings](https://github.com/mnater/Hyphenator.js/blob/wiki/en_PublicAPI.md#void-hyphenatorconfigobject-settings) that are not functions (the literals) can be made in the Bookmarklet, too. Append them as query string in the link above (just after `bm=true`):
E.g. `bm=true&safecopy=false&displaytogglebox=false`

## Using Hyphenator on your website ##
For a webdeveloper who wishes to hyphenate his website, things are slightly more complicated. You'll need basic knowledge about HTML and JavaScript to do the following steps.

### Step by Step (easy): w/o Hyphenator\_Loader.js ###
  1. Prepare your HTML-documents by
    * Encoding them in UTF-8 (not absolutely necessary, but highly recommended)
    * Setting the appropriate lang-attributes (e.g. `<html lang="en">`).
    * Adding `class="hyphenate"` to the elements whose text should be hyphenated (children do inherit this setting). Hyphenation can be stopped by adding `class="donthyphenate"`.
    * Validating (not absolutely necessary, but again highly recommended): http://validator.w3.org/
  1. Use the [mergeAndPack-Tool](http://mnater.github.io/Hyphenator/mergeAndPack.html). Here you can define what languages will be used and set all the configuration options you want (click the info buttons for details).
  1. Save the resulting "all-in-one"-script in a file (call it for example "hyphenate.js") load it to the server and hook it into your html:
```HTML
<script src="http://yourdomain.com/path/hyphenate.js" type="text/javascript">
</script>
```

It will then load and execute automatically.

### Step by Step (advanced): w/o Hyphenator\_Loader.js ###
  1. [Download](https://github.com/mnater/Hyphenator.js/releases/tag/5.0.0) an actual version of Hyphenator.js and copy it to your server (make sure to copy the folder called `patterns`, too).
  1. Prepare your HTML-documents by
    * Encoding them in UTF-8 (not absolutely necessary, but highly recommended)
    * Setting the appropriate lang-attributes (e.g. `<html lang="en">`).
    * Adding `class="hyphenate"` to the elements whose text should be hyphenated (children do inherit this setting). Hyphenation can be stopped by adding `class="donthyphenate"`.
    * Validating (not absolutely necessary, but again highly recommended): http://validator.w3.org/
  1. Include the script by adding the following code to your HTML-document:
```HTML
<script src="http://yourdomain.com/path/Hyphenator.js" type="text/javascript">
</script>
```

  1. Invoke the script:
```HTML
<script type="text/javascript">
	    Hyphenator.run();
</script>
```

Done.
There are many interesting and useful settings you can change before you invoke the script. See [Documentation](https://github.com/mnater/Hyphenator.js/blob/wiki/en_PublicAPI.md) for more details.

### Example ###
What could be better than a [working example](http://mnater.github.io/Hyphenator/WorkingExample.html)?
```HTML
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
        <p class="hyphenate text" lang="en">Not only words but also links like <a href="http://mnater.github.io/Hyphenator/">http://mnater.github.io/Hyphenator/</a> are processed. But in a special manner (using zero width space).</p>
    </body>
</html>
```

## Hyphenator\_Loader.js ##
Loading Hyphenator.js and the pattern files is expensive in matters of loading time: Even if you merge and minify the script and the pattern files it's kind of wheighty (~74kB for Hyphenator.js plus the patterns for us-en).

In many cases it's not necessary nor advisable to load the full package:
**more and more browsers support css3 hyphenation for a certain set of languages (http://caniuse.com/#feat=css-hyphens).** On a mobile client Hyphenator.js is too expensive in matters of loaded data and computation.

This is where Hyphenator\_Loader.js comes in handy. It tests if the client supports css3 hyphenation for the required languages and only loads Hyphenator.js if at least one of the required languages isn't supported.

To use Hyphenator\_Loader.js follow the following steps:

### Step by Step (easy): with Hyphenator\_Loader.js ###
  1. Prepare your HTML-documents by
    * Encoding them in UTF-8 (not absolutely necessary, but highly recommended)
    * Setting the appropriate lang-attributes (e.g. `<html lang="en">`).
    * Adding `class="hyphenate"` to the elements whose text should be hyphenated (children do inherit this setting). Hyphenation can be stopped by adding `class="donthyphenate"`.
    * In CSS set the class `.hyphenate` to `hyphens: auto; -webkit-hyphens: auto; -moz-hyphens: auto; -ms-hyphens: auto;`
    * Validating (not absolutely necessary, but again highly recommended): http://validator.w3.org/
  1. Use the [mergeAndPack-Tool](http://mnater.github.io/Hyphenator/mergeAndPack.html). Here you can opt-in for Hyphenator\_Loader and set all the configuration options you want (click the info buttons for details).
  1. Hit 'create' and save the resulting scripts as described at the bottom of the mergeAndPack-page.

### Example ###
See this [example](https://github.com/mnater/Hyphenator/blob/master/Loader_Example.html):
```HTML
<!DOCTYPE HTML>
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
            .hyphenate {
                text-align:justify;
                hyphens: auto;
                -webkit-hyphens: auto;
                -ms-hyphens: auto;
                -moz-hyphens: auto;
            }
        </style>
        <script src="Hyphenator_Loader.js" type="text/javascript"></script>
        <script type="text/javascript">
            Hyphenator_Loader.init(
                {
                    "en": "automatically",
                    "de": "Silbentrennungsalgorithmus"
                },
                "./Hyphenator.js"
            );
        </script>
    </head>
    <body>
        <h1>Example of using Hyphenator.js</h1>
        <h2>Deutsch</h2>
        <p class="hyphenate" lang="de">Deutschsprachige Beispieltexte haben natürlicherweise längere Wortzusammensetzungen als englischsprachige. Aber auch <span lang="en">“hyphenation”</span> ist ein ziemlich langes Kompositum.</p>
        <p class="hyphenate" lang="de">Verändern Sie die Fenstergrösse um den Effekt der Silbentrennung zu sehen.</p>
        <h2>English</h2>
        <p class="hyphenate" lang="en">English words are shorter in the average then german words. <span lang="de">«Silbentrennungsalgorithmus»</span> for example is quite long.</p>
        <p class="hyphenate" lang="en">Resize the window to see hyphenation in effect.</p>
        <h2>Links</h2>
        <p class="hyphenate" lang="en">Not only words but also links like <a href="https://github.com/mnater/Hyphenator">https://github.com/mnater/Hyphenator</a> are processed. But in a special manner (using zero width space).</p>
    </body>
</html>
```

## Legal ##
Hyphenator.js and its documentation are published under the [MIT License](http://mnater.github.io/Hyphenator/LICENSE.txt):
```
Copyright (c) 2015  Mathias Nater, Zürich (mathiasnater at gmail dot com)

The following license applies to all parts of this software except as
documented below:

====

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

====

Some files located in the patterns and testuite/files directories are
externally maintained files used by this software which have their
own licenses; we recommend you read them, as their terms may differ from
the terms above.
```
Most of the patterns in the pattern files have different licenses specified in the pattern files.

## Stay up to date ##
Subscribe to the RSS on the downloads page to get information about updates of Hyphenator.
It's recommended to replace older versions upon release of a new version.
