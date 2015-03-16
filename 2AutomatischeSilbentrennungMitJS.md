# Automatische Silbentrennung im Browser mit JavaScript #

## Zusammenfassung ##
Dieser Artikel behandelt im [ersten Teil](http://code.google.com/p/hyphenator/wiki/1SilbentrennungInHTML) die Problematik der Silbentrennung (Hyphenation) in Webbrowsern und führt in diesem  [zweiten Teil](http://code.google.com/p/hyphenator/wiki/2AutomatischeSilbentrennungMitJS) als möglichen Lösungsansatz eine automatische Silbentrennung an. Diese beruht auf dem Ansatz von Liang, verwendet die Trennmuster für die deutsche Silbentrennung aus der LaTeX-Distribution und ist in JavaScript implementiert.

## Liangs Thesis ##
Frankling Mark Liang erarbeitete 1983 im Rahmen seiner Doktorarbeit einen Algorithmus für die automatische Silbentrennung für das Textsatzsystem (La)TeX. Damals war es wichtig, dass das Programm möglichst wenig Arbeitsspeicher brauchte – eine Wörterliste mit allen Wörtern und Trennstellen kam also nicht in Frage.
Liangs Doktorvater und Schöpfer von (La)Tex, Donald Knuth, hatte bereits einen Algorithmus programmiert, der englische Wörter trennen konnte, indem unter anderem Präfixe und Suffixe abgetrennt wurden. Liang ging aber weiter.

Er hat aus einer Wortliste mit Trennstellen eine Reihe von Zeichenmustern berechnet, die zusammen mit Zahlwerten auf mögliche Trenn- und Nichttrennstellen rückschliessen lassen. Dabei markieren ungerade Zahlen mögliche Trennstellen. Diese Muster (patterns) sehen etwa so aus:

`1be 2il 2lb n1tr 1nu 1si tr6`.

Möchte man für ein bestimmtes Wort Trennstellen finden, sucht man alle passenden Muster heraus und kombiniert die Zahlen – eine höhere Zahl überschreibt dabei eine kleinere.

Für das Wort `Silbentrennung` passen die oben bereits aufgezeigten Muster und ergeben:

```
 s i l b e n t r e n n u n g 
      1b e
  2i l
    2l b
           n1t r
                    1n u
1s i
             t r6
-----------------------------
1s2i2l1b e n1t r6e n1n u n g
```
Es wird also `Sil|ben|tren|nung` getrennt.

Liang hat bei der Berechnung der Muster mit verschiedenen Parametern experimentiert, wobei er lieber eine Trennstelle nicht fand, statt eine falsche auszugeben. Bei seinen Tests stellte sich heraus, dass mit nur knapp 5000 Mustern beinahe 90% aller Trennstellen gefunden werden konnten. Um aber alle Trennstellen zu finden waren an die 20'000 Muster nötig – zuviel für damalige Rechner.

Nach diesem Schema wurden daraufhin für viele Sprachen Trennmuster berechnet und es wird heute für die Silbentrennung unter anderem in OpenOffice und LaTeX verwendet.
Die Trennmuster sind online bei [CTAN](http://www.ctan.org/tex-archive/language/hyphenation/") erhältlich und stehen unter der «LaTeX Project Public License».

## Implementierung in JavaScript ##
Dank des geringen Speicherbedarfs und seiner Einfachheit eignet sich Liangs Algorithmus hervorragend für den Einsatz im Web. Wie sich zeigen wird, benötigt das gesammte Skript inklusive Trennmuster höchstens 100KB und ist hinreichend schnell.

(Alle Zeitmessungen fanden auf einem älteren PowerMac G4/933MHz in Safari 2.0.4 statt. Neuere Rechnermodelle dürften wesentlich schneller sein.)

### Aufbereitung der Trennmusters ###
Zuerst habe ich versucht, die Trennmuster direkt, also in der Form `n1tr` zu übernehmen. In dieser Form ist auch der sprachenspezifische Ersatz der Trennmuster denkbar. Das Skript brauchte so nur etwa 40KB, dafür aber zwei Sekunden, um diese Trennmuster einzulesen.

Deshalb habe ich die Muster direkt in JSON notiert (`{"ntr":"0100"}`), wodurch der Speicherbedarf auf 92KB aufgebläht wurde. Das Einlesen der Muster gelang so aber in 30ms.

Für die Implementierung eines Tries, wie sie Liang vorschlägt, ist JavaScript allerding zu langsam (vorausgesetzt, ich habe alles richtig gemacht). Mit einem Trie könnten zwar viele Suchläufe nach Mustern vermieden werden; das Suchen im Trie war in meinen Tests aber viel zu langsam. Wirklich schneller wäre ein Trie nur, wenn er von der JavaScript-Core zur Verfügung gestellt würde.

Es dauerte eine Weile, bis ich die aktuelle Lösung (seit Version 9) gefunden habe. Die Muster werden jetzt in ihrer ursprünglichen Form `n1tr` übertragen und dann in ein Objekt `{"ntr":"n1tr"}` gefüllt. Die Konvertierung dauert nur ca. 200ms auf dem IE (andere Browser sind viel schneller) und es müssen viel weniger Daten übertragen werden.

## Wie es funktioniert (Übersicht) ##
Es gibt zwei Modi:
  1. Start, wenn die Seite geladen ist
  1. Start, wenn der Benutzer ein Bookmarklet klickt

### Start, wenn die Seite geladen ist ###
Dieser Modus wird verwendet, wenn Sie Hyphenator auf Ihrer Website verwenden. Er ist hoch anpassungsfähig und schnell.

Das Script läuft in groben Zügen wie folgt ab:
  1. Indem Sie `Hyphenator.js` in ihrer HTML-Datei laden, wird automatisch ein Hyphenator-Objekt erzeugt. Die Trennungen werden aber noch nicht ausgeführt.
  1. Während dieses Vorgangs versucht das Script die Sprache der Seite zu ermitteln und bestimmt, ob es als Bookmarklet läuft oder nicht. Wenn es keinen Hinweis auf die verwendete Sprache findet, verlangt es eine Benutzerangabe.
  1. Wenn die Seite fertig geladen ist, startet das Script den Trennungsprozess `Hyphenator.hyphenateDocument();`:
    1. Die `Hyphenator.prepare`-Funktion durchsucht das Dokument nach weiteren Sprachen und lädt die entsprechenden Trennmuster.
    1. Sobald alle Trennmuster geladen sind, werden die Elemente mit `class="hyphenate"` gesucht.
    1. Die Funktion `Hyphenator.hyphenateElement()` bearbeitet nun diese Elemente, indem sie rekursiv in deren Kind-Knoten sucht, bis sie Text-Knoten findet. Die Inhalte dieser Textknoten werden ersetzt durch nach Silben getrennten Text.

Indem nur eine kleine Auswahl von Elementen mit `class="hyphenate"`  ausgezeichnet werden, kann das Script stark beschleunigt werden. Unabhängig von der Bestimmung der Trennstellen beansprucht das Herunterladen der Trennmuster – abhängig von der Bandbreite – seine Zeit.

### Verwendung als Bookmarklet ###
Dieser Modus ist dann nützlich, wenn Texte einer beliebige Website, die Sie besuchen, getrennt werden sollen. Der Ablauf des Scripts ist langsamer und weniger beeinflussbar.

Das Script macht seine Arbeit fast gleich wie oben bereits beschrieben. Es gibt aber einige kleine Unterschiede:
  1. Wen das Bookmarklet gestartet wird, wird das Script in die Website eingebunden und muss erst einmal geladen werden.
  1. Indem Sie `Hyphenator.js` in ihrer HTML-Datei laden, wird automatisch ein Hyphenator-Objekt erzeugt. Die Trennungen werden aber noch nicht ausgeführt.
  1. Während dieses Vorgangs versucht das Script die Sprache der Seite zu ermitteln und bestimmt, ob es als Bookmarklet läuft oder nicht. Wenn es keinen Hinweis auf die verwendete Sprache findet, verlangt es eine Benutzerangabe.
  1. Wenn die Seite fertig geladen ist, startet das Script den Trennungsprozess `Hyphenator.hyphenateDocument();`:
    1. Die `Hyphenator.prepare`-Funktion durchsucht das Dokument nach weiteren Sprachen und lädt die entsprechenden Trennmuster.
    1. Sobald alle Trennmuster geladen sind, wird das `<body>`-Element getrennt.
    1. Die Funktion `Hyphenator.hyphenateElement()` bearbeitet das `<body>`-Element, indem sie rekursiv in dessen Kind-Knoten sucht, bis sie Text-Knoten findet. Die Inhalte dieser Textknoten werden ersetzt durch nach Silben getrennten Text.

Weil das Script alle Elemente unterhalb des `<body>`-Elements durchläuft und alle Text-Knoten nach Silben trennt, braucht das Script in diesem Modus etwas länger. Ausserdem müssen auch hier die Trennmuster und _zusätzlich das Script_ heruntergeladen werden, was auch Zeit beansprucht.

## Wie es funktioniert (en Détail) ##
Studier den Code!

## Das Script herunterladen und einbinden ##
Einfach [downloaden](http://code.google.com/p/hyphenator/downloads/list), entpacken und die [Anleitung](3Anleitung.md) lesen, wie man das Script auf einer Website einbindet.

Sie können es auch als Bookmarklet verwenden. Wenn man dann auf das Bookmarklet klickt kann man auf jeder beliebiegen Website die Silbentrennung durchführen.
Einfach das folgende Script als Bookmark abspeichern:

```
javascript:if(document.createElement){void(head=document.getElementsByTagName('head').item(0));void(script=document.createElement('script'));void(script.src='http://www.mnn.ch/hyph/v5/Hyphenator.js?bm=true');void(script.type='text/javascript');void(head.appendChild(script));}
```