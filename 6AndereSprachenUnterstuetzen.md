# Was haben wir jetzt #

Momentan werden folgende Sprachen unterstützt:
  * Englisch
  * Deutsch
  * Französisch
  * Niederländisch
  * Schwedisch
  * Spanisch
  * Malayalam, Tamil, Hindi, Oriya, Kannda, Telugu, Bengali, Gujarati und Panjabi
  * Italienisch


Hyphenator ist aber so programmiert, dass es relativ einfach ist, die Unterstützung weiterer Sprachen hinzuzufügen.

# Was Sie tun können #

Um weitere Sprachen hinzuzufügen, werden Trennmuster benötigt. Falls Sie über eine (komplette) Liste mit getrennten Wörtern verfügen, können Sie die Trennmuster selbst berechnen (if you can, you know how). Wenn nicht, können sie auf http://www.ctan.org die LaTeX-Trennmuster für Ihre Sprache suchen.

Danach müssen Sie folgende Schritte durchführen:
  1. Trennmuster aufbereiten
  1. Hyphenator.js anpassen
  1. Änderungen und Trennmuster mir einsenden, wenn Sie Lust haben (Sie werden dann Supporter für diese Sprache)

## Trennmuster konvertieren ##
  * Trennmuster haben Form `.ab3s2`. Zur Unterscheidung verwende ich in Hyphenator statt des Punktes einen Unterstrich, um den Begin oder das Ende eines Wortes zu markieren. Durch einfaches Suchen&amp;Ersetzen können Sie alle Punkte in den Trennmustern durch Unterstriche ersetzen: `_ab3s2`
  * Alle Trennmuster-Dateien sollten mit **UTF-8 (with BOM)** codiert sein.
  * Duplizieren Sie eine andere Trennmusterdateien und ersetzen Sie die Muster.
  * Die anderen Variablen müssen gemäss den Rechtschreiberegeln der jeweiligen Sprache angepasst werden:
> | _Name_ | _Beschreibung_ |
|:-------|:---------------|
> | Hyphenator.leftmin | Auf der oberen Zeile sollen mindestens so viele Zeichen zu stehen kommen (verhindert z.B. '  a-') |
> | Hyphenator.rightmin | Auf der unteren Zeile sollen mindestens so viele Zeichen stehen (verhindert z.B. ' -a') |
> | Hyphenator.shortestPattern | Die Länge des kürzesten Musters in der Liste (für bessere Performance) |
> | Hyphenator.longestPattern | Die Länge des längsten Musters in der Liste (für bessere Performance) |
> | Hyphenator.specialChars | Nicht-ASCII-Buchstaben, die in dieser Sprache verwendet werden |
  * Vergessen Sie nicht, die Sprache in jeder Variable zu ändern und den Dateinamen entsprechend anzupassen.

## Hyphenator.js anpassen ##
Es gibt drei Variablen die angepasst werden müssen:
  * `SUPPORTEDLANG`: Bitte verwenden Sie den [ISO 639-1-Code](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
  * `LANGUAGEHINT` und
  * `PROMPTERSTRINGS`: Diese Strings werden benötigt, falls die Sprache nicht ermittelt werden kann. Bitte übersetzen Sie diesen kurzen Text in die zu unterstützende Sprache.

Machen Sie ein paar Tests!

## Änderungen und Muster einsenden ##
Wenn Sie Hyphenator unterstützen wollen, können Sie Ihre Arbeit einsenden. Sie bekommen dafür volle Namensnennung. Ich werde Sie fragen, Ihre E-Mail-Adresse im Kopf der Trennmusterdatei zu veröffentlichen (siehe nl.js).