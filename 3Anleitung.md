# Hyphenator auf einer Website verwenden #
Sie können Hyphenator auf ihrer Website einbinden. Ich freue mich auf Rückmeldungen und Erfahrungen.
Diese Seite erklärt, was sie genau machen müssen und gibt ein paar Hinweise zur Konfiguration.

## Schritt um Schritt ##
  1. Bereiten Sie ihre HTML-Documente vor, indem Sie
    * diese in UTF-8 codieren.
    * ein passendes lang-Attribut (z.B. `<html lang="de">`) setzen
    * jedes Element, dessen Text getrennt werden soll, mit `class="hyphenate"` auszeichnen. Kindelemente erben diese Auszeichnung. (Die Silbentrennung kann für ein Element wieder aufgehoben werden, indem man es mit `class="donthyphenate"` auszeichnet. )
  1. Binden Sie Script wie folgt ein:
```
<script src="http://ihreDomain.com/pfad/Hyphenator.js" type="text/javascript">
</script>
```
> > Aus Sicherheitsgründen sollten Sie das Script von http://code.google.com/p/hyphenator/downloads/list herunterladen und auf ihrem Server installieren. Es erkennt automatisch woher es kommt und lädt auch die Trennmusterdateien von Ihrem Server.
  1. das Script ausführen:
```
<script type="text/javascript">
	    Hyphenator.run();
</script>
```

> Fertig.
> Es gibt ein paar Einstellungen, die Sie ändern können, bevor Sie das Script starten:
> Um die minimale Länge von Wörtern zu ändern, die getrennt werden sollen (Voreistellung=6, je kleiner die Zahl, desto langsamer das Script), können Sie folgenden Befehl verwenden.:
```
Hyphenator.setMinWordLength(4);
```
> Um das Trennzeichen für Worttrennungen zu ändern (Voreinstellung &shy;):
```
Hyphenator.setHyphenChar('zeichen');
```
> Um das Trennzeichen für Link- und Mailadresstrennungen zu ändern (Voreinstellung je nach Browser: ZeroWidthSpace für alle ausser IE 6 und 8b2):
```
Hyphenator.setUrlHyphenChar('zeichen');
```

> Um den Namen der Klasse (Voreinstellung='hyphenate') zu ändern:
```
Hyphenator.setClassName('klassenname');
```
> Um einen kleinen Schalter oben links einzublenden, der die Trennung aus-/einschaltet:
```
Hyphenator.setDisplayToggleBox(true oder false);
```
> Um automatisch laden von Patterndateien auszuschalten (müssen manuell geladen werden):
```
Hyphenator.setRemoteLoading(true oder false);
```

Wird Hyphenator mit run() gestartet, trennt das Script sämtliche Texte der Elemente mit `class="hyphenate"` — sogar die Texte der Kindelemente.

## Das Beispiel ##
Was könnte besser sein als ein  [funktionierendes Beispiel](http://hyphenator.googlecode.com/svn/trunk/WorkingExample.html)?
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

# Hyphentor als Bookmarklet verwenden #
Wenn man Hyphenator auf einer fremden Website (einer Website deren Webmaster man nicht selbst ist) verwenden will, kann man Hyphenator als [Bookmarklet](http://de.wikipedia.org/wiki/Bookmarklet) in den Browsern «installieren». Dazu ist einfach das folgende Javascript als Bookmark zu speichern. Wenn man dann auf einer Seite ist, deren Texte man gerne nach Silben getrennt haben möchte, klickt man einfach auf dieses Bookmark.

```
javascript:if(document.createElement){void(head=document.getElementsByTagName('head').item(0));void(script=document.createElement('script'));void(script.src='http://hyphenator.googlecode.com/svn/trunk/Hyphenator.js?bm=true');void(script.type='text/javascript');void(head.appendChild(script));}
```

Falls die Seite die verwendete Sprache nicht angibt, muss man diese in einem Eingabefenster manuell angeben.