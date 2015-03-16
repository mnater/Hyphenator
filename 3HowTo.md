# Using Hyphenator on your website #
You can freely use Hyphenator on your website. Send me a notice about it, if you feel alike.
This article explains what you will have to do and gives you some configuration hints.

## Step by Step ##
  1. Prepare your HTML-documents by
    * Encoding it in UTF-8.
    * Setting the appropriate lang-attributes (e.g. `<html lang="en">`).
    * Adding `class="hyphenate"` to the elements whose text should be hyphenated (children do inherit this setting). Hyphenation can be stopped by adding `class="donthyphenate"`.
  1. Include the script by adding the following code to your HTML-document:
```
<script src="http://ihreDomain.com/pfad/Hyphenator.js" type="text/javascript">
</script>
```
> > For security issues you may prefer to [download it](http://code.google.com/p/hyphenator/downloads/list) and load it from your server.
  1. Invoke the script:
```
<script type="text/javascript">
	    Hyphenator.run();
</script>
```

> Done.
> There are some settings you can change before invoking the script:
> To change the minimal length of words to be hyphenated (default=6, the lower the number the slower the script), use this:
```
Hyphenator.setMinWordLength(4);
```
> To change the hyphen character for word-hyphenation (defaults to &amp;shy;):
```
Hyphenator.setHyphenChar('|');
```
> To change the hyphen character for web- and mail-adress-hyphenation (defautls to ZeroWidthSpace except for IE6 and IE8b2).
```
Hyphenator.setUrlHyphenChar('|');
```
> To change the name of the hyphenate-class (defaults to `hyphenate`:
```
Hyphenator.setClassName('classname');
```
> To display an on/off-switch in the upper right corner of the screen:
```
Hyphenator.setDisplayToggleBox(true oder false);
```
> To turn off remote loading of pattern files (they have to be loaded manually instead):
```
Hyphenator.setRemoteLoading(true oder false);
```

When the function `Hyphenator.hyphenateDocument()` is called, the script hyphenates all text of elements having the attribute `class="hyphenate"` — even the text of their child-elements.

## The Example ##
What could be better than a [working example](http://hyphenator.googlecode.com/svn/trunk/WorkingExample.html)?
```
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
    "http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
    <head>
        <title>hyph.js</title>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <style type="text/css">
            body {
                width:50%;
                margin-left:25%;
                margin-right:25%;
            }
            .text {
                text-align:justify;
            }
        </style>
        <!--<script src="http://hyphenator.googlecode.com/svn/trunk/Hyphenator.js" type="text/javascript"></script>-->
        <script src="Hyphenator.js" type="text/javascript"></script>
        <script type="text/javascript">
                Hyphenator.setMinWordLength(4);
                Hyphenator.setHyphenChar('·');
                Hyphenator.addExceptions('ziem-lich');
                Hyphenator.run();
        </script>
    </head>
    <body>
        <h1>Example of using Hyphenator.js</h1>
        <p class="hyphenate text" lang="de">Deutschsprachige Beispieltexte haben natürlicherweise längere Wortzusammensetzungen als englischsprachige. Aber auch <span lang="en">“hyphenation”</span> ist ein ziemlich langes Wort.</p>
        <p class="hyphenate text" lang="en">English words are shorter in the average then german words. <span lang="de">«Silbentrennungsalgorithmus»</span> for example is quite long.</p>
    </body>
</html>
```

# Using Hyphenator as a Bookmarklet #
If you want to hyphenate a foreign website (a website whose webmaster aren't you) you can ”install“ hyphenator as a [Bookmarklet](http://en.wikipedia.org/wiki/Bookmarklet) in your browser(s). Simply safe the following Javascript code as a bookmark. When you're on the site to be hyphenated you click on that bookmarklet to start hyphenating the page.

```
javascript:if(document.createElement){void(head=document.getElementsByTagName('head').item(0));void(script=document.createElement('script'));void(script.src='http://hyphenator.googlecode.com/svn/trunk/Hyphenator.js?bm=true');void(script.type='text/javascript');void(head.appendChild(script));}
```

If the pages language isn't set, you will have to edit it manually in a popping-up prompt.