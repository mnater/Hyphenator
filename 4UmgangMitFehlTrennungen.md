# Automatische Silbentrennung ist gut, aber nicht fehlerfrei #

Es gibt drei Fehlertypen:
  * **der Algorithmus findet eine Trennstelle nicht:** nicht weiter schlimm, aber auch nicht besonders schön.
  * **Der Algorithmus findet zu viel Trennstellen:** gar nicht gut!
  * **Der Algorithmus findet Trennstellen, die grammatikalisch in Ordnung sind, aber sinnentstellend:** z.B. Urin-stinkt oder bein-halten.

Für einen Algorithmus ist es so gut wie unmöglich, basierend auf dem Kontext zu entscheiden, wie ein Wort getrennt werden muss.

Um wirklich hohe Trennqualität zu erhalten, muss die Silbentrennung – wie bei jedem Layoutprogramm sonst auch – manuell überarbeitet werden.

## Silbentrennung manuell anpassen ##

Es gibt zwei Möglichkeiten:

  1. **Den Text direkt editieren:** Wenn ein Wort mindestens ein manuell eingefügtes &shy;-Zeichen enthält, wird es von Hyphenator nicht weiter getrennt. Das Wort muss aber bei jedem Vorkommen entsprechend editiert werden!
  1. **Eine Ausnahmenliste erstellen:** Wenn Hyphenator gestartet wird, kann man Ausnahmen definieren, die dann global für das ganze Script verfügbar sind:
```
<script type="text/javascript">
        Hyphenator.addExceptions('Ur-instinkt,Fortran');
        Hyphenator.run();
</script>
```
Jetzt «weiss» Hyphenator, wie Urinstinkt getrennt werden muss und dass Fortran nicht getrennt werden soll.
_Die Werte müssen in einem Komma-separierten String ohne Zwischenräume stehen._

## Silbentrennung überprüfen ##
Wenn Sie einen hohen Anspruch an die Korrektheit der Silbentrennung auf Ihrer Webseite stellen, empfehle ich folgendes Vorgehen:
  1. Schalten Sie beim Test auf ein sichtbares Trennzeichen um, es werden dann alle potentiellen Trennzeichen angezeigt:
```
	Hyphenator.setHyphenChar('·');
```
  1. Suchen Sie allfällige Fehler und tragen Sie kritische Wörter in die Ausnahmeliste (s. o.) ein. Fehlgetrennte Wörter nehme ich gerne entgegen und leite sie an die Gruppe weiter, die sich um die Erstellung der deutschen Trennmuster kümmert.
  1. Schalten Sie das sichtbare Trennzeichen wieder aus:
```
	//Hyphenator.setHyphenChar('·');
```