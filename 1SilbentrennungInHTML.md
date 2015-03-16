# Silbentrennung und HTML #
[Englisch version available](http://code.google.com/p/hyphenator/wiki/1HyphenationInHTML)

## Übersicht ##
Dieser Artikel zeigt auf,
  * was Silbentrennung ist,
  * warum und wann man Silbentrennung braucht,
  * weshalb es keine gute automatische Silbentrennung geben kann,
  * welche Silbentrennungsalgorithmen es gibt,
  * wie man Silbentrennung gemäss HTML-Standard manuell durchführen kann,
  * was der CSS 3-Standard für die Zukunft vorsieht,
und
  * weshalb eine automatische Silbentrennung trotzdem cool sein kann.

Wie so eine Silbentrennung funktionieren kann, die im Browser vorgenommen wird, steht in [diesem Artikel](http://code.google.com/p/hyphenator/wiki/2AutomatischeSilbentrennungMitJS).

## Begriffserklärung: Worttrennung, Silbentrennung und Hyphenation (engl.) ##
**Worttrennung** bezeichnet die Art und Weise, wie Wörter – z.B. am Zeilenende – getrennt werden können.

**Silbentrennung** ist die Aufteilung eines Wortes nach Sprechsilben.

Bis zur Einführung der Neuen Deutschen Rechtschreibung waren diese beiden Begriffe nicht gleichbedeutend, da Fremdwörter nicht nach Silben, sondern nach Wortbestandteilen getrennt wurden.

Zum Beispiel:
| Alt: | He-li-ko-pter (aus _hélikos_ und _pterón_) |
|:-----|:---------------------------------------------|
| Neu: | He-li-ko-p-ter |

Heute werden diese Begriffe meist synonym verwendet. Ich habe mich für den Begriff «Silbentrennung» entschieden, weil er das englische Wort “Hyphenation” besser übersetzt.

Der englische Begriff “Hyphenation” steht sowohl für die Trennung eines Wortes nach Silben, als auch für die Kopplung zweier Wörter mittels Bindestrich (“Hyphen”).

## Blocksatz, Flattersatz und Leserlichkeit ##
Texte können grundsätzlich im Block- oder im Flattersatz gesetzt werden. Hier eine Übersicht über die verschiedenen (deutschen und englischen) Begriffe:
  * _linksbündig, Flattersatz rechts:_ align left, ragged right
  * _rechtsbündig, Flattersatz link:_ align right, ragged left
  * _Blocksatz:_ justified

Im traditionellen Satz werden kurze Texte wie Titel, Leads, Listen und so weiter normalerweise linksbündig gesetzt, die langen Fliesstexte hingegen im Blocksatz. Rechtsbündiger Satz ist ziemlich selten und wird höchstens als Gestaltungsmittel verwendet (in Sprachen wo von rechts nach links geschrieben wird, dürfte das umgekehrt sein).

Zur Leserlichkeit lässt sich grundsätzlich folgendes sagen:
Der linksbündige Flattersatz gibt dem Auge einen Halt, wenn es zur nächsten Zeile springen muss. Blocksatz ist deshalb bei längeren Zeilen tendenziell weniger geeignet als Flattersatz.
Der Blocksatz wirkt aber – jedenfalls für meinen Geschmack – irgendwie edler.

Die Leserlichkeit eines Textes am Bildschirm ist per se schon deutlich geringer als die des selben Textes auf Papier:
  * Es gibt viele Ablenkungen.
  * Bildschirmtexte haben eine geringe Auflösung.
  * Der Abstand zwische Auge und Text ist beim Lesen am Bildschirm grösser und somit auch die Gefahr, dass sich das Auge «verirrt».
  * Es können keine Hilfsmittel (Zeigefinger) verwendet werden.
Deshalb sollte auf weitere Dinge, die der Leserlichkeit hinderlich sind, eher verzichtet werden.

Verglichen mit professionellen Layout- und Design-Programmen erzeugen die Webbrowser einen miserablen Blocksatz: Da sie bis heute keine automatische Silbentrennung vornehmen und keine Möglichkeiten bieten, die Schriftlaufweiten anzupassen, entsteht ein ungleichmässiger, lückenhafter Blocksatz.
Deshalb sollte auch aus typographischer Sicht auf Blocksatz im Web eher verzichtet werden.

Trotzdem gibt es Gründe, Absätze im Blocksatz auszugeben. Vielleicht schreibt es ein Corporate Design so vor, vielleicht ist man mit dem Blocksatz der Browser zufrieden, vielleicht will man das Aussehen eines Buches oder einer Zeitung nachahmen? In diesem Fall verbessert nur schon die automatische Silbentrennung den Blocksatz erheblich.

Es bleibt noch zu erwähnen, das die Silbentrennung nicht nur im Blocksatz benötigt wird. Sie kann auch eingesetzt werden, um den Flattersatz zu «beruhigen» oder – und dies ist wahrscheinlich der wichtigste Anwendungsfall – um lange Wörter in engen Tabellenzellen umzubrechen.

![http://www.mnn.ch/hyph/hyph_demo.gif](http://www.mnn.ch/hyph/hyph_demo.gif)

## Automatische Silbentrennung ##
Die automatische Silbentrennung ist eine Herausforderung für die Informatik. Tatsächlich gibt es heute kein System, dass vollautomatisch **und** fehlerfrei funktioniert. Die vollautomatische Silbentrennung scheitert an mehreren Hindernissen:
  1. Ein perfekter Algorithmus müsste für jede Sprache die passenden Trennregeln beherrschen.
  1. Ein perfekter Algorithmus würde _auf Dokumentebene_ verhindern, dass mehrere Trennungen untereinander zu stehen kommen und dass es eine Trennung über einen Seitenwechsel gibt. Dies kann mittels Systemen, die mit Strafpunkten arbeiten, erreicht werden. Bei jeder Textänderung muss dann aber alles neu berechnet werden. Der Algorithmus müsste ausserdem die volle Kontrolle über das bruchteilgenaue setzen des Textes haben, um aus den vielen möglichen Kombinationen von Silbentrennstellen, optischem Randausgleich (=margin kerning o. character protrusion) und Font Expansion die unauffälligste heraus zu suchen.
  1. Ein perfekter Algorithmus würde bei doppeldeutigen Wörtern auf _Satzebene_ aus dem Zusammenhang erschliessen können, wie getrennt werden muss: Die «Versendungen» in Gedichten oder die «Versendungen» von Gedichtsbänden?
  1. Ein perfekter Algorithmus würde auf _Wortebene_ zwischen «guten» und «schlechten» Trennstellen (Silben-trennung, statt Silbentren-nung) unterscheiden und trotzdem einen schönen Blocksatz berechnen.

**Punkt 1** kann mit entsprechendem Aufwand erfüllt werden.

**Punkt 2** wird von den verschiedenen Textprogrammen unterschiedlich gut beherrscht. Microsoft Word bietet nur rudimentärste Kontrolle über die Silbentrennung. (Das Setzen von schönem Blocksatz ist mit diesem Stück Software ohnehin kaum möglich.)

![http://www.mnn.ch/hyph/img/Word_settings.png](http://www.mnn.ch/hyph/img/Word_settings.png)

Etwas mehr Kontrolle bieten QuarkXPress und Adobe InDesign.

![http://www.mnn.ch/hyph/img/Quark_settings.png](http://www.mnn.ch/hyph/img/Quark_settings.png)

![http://www.mnn.ch/hyph/img/InDesign_settings.png](http://www.mnn.ch/hyph/img/InDesign_settings.png)

Volle Automatisierung und zugleich Kontrolle bietet, soviel ich weiss, nur pdfTeX im Zusammenspiel mit dem Packet [microtype](http://www.ctan.org/tex-archive/macros/latex/contrib/microtype/).

Doppeldeutigkeiten (**Punkt 3**) wird immer der Autor manuell auflösen müssen.

Für **Punkt 4** gibt es bereits [Ansätze](http://www.apm.tuwien.ac.at/research/SiSiSi/).

Zusammenfassend kann man sagen, dass es keinen perfekten Algorithmus gibt. Der Autor muss in jedem Fall das Resultat überprüfen und gegebenenfalls manuell nachbearbeiten.

Das folgende Bild zeigt die Resultate verschiedener Programme (bei InDesign ohne und mit optischem Randausgleich und bei LaTeX ohne und mit microtype):
![http://www.mnn.ch/hyph/img/Overview.png](http://www.mnn.ch/hyph/img/Overview.png)

## Bestehende Silbentrennungsalgorithmen ##
In den meisten Textverarbeitungsprogrammen werden lexikalische Algorithmen eingesetzt, die zu jedem zu trennenden Wort die Trennstellen und Wortbestandteile in einer Wörterliste nachschlagen. Wörter oder Wortbestandteile, die nicht auf der Liste sind, müssen aber vom Benutzer manuell getrennt werden. Der Nachteil dieses Ansatzes ist der relativ hohe Speicherbedarf und der Umstand, dass Komposita nicht immer erkannt werden.

Eine andere Möglichkeit sind musterbasierte Algorithmen, die versuchen, aus einer Wörterliste Muster zu berechnen und davon Trennstellen ableiten. Der bekannteste Algorithmus stammt von Frankling Mark Liang ([Word Hy-phen-a-tion by Com-put-er](http://www.tug.org/docs/liang/liang-thesis.pdf)), wurde 1983 entwickelt und wird seither in vielen Programmen wie LaTeX oder OpenOffice verwendet. Musterbasierte Algorithmen können abhängig von der Länge der Musterliste ca. 90% aller Trennstellen finden, wobei es aber auch zu schlechten, weil sinnverzerrenden Trennstellen kommen kann (Beispiel: bein-halten), welche wiederum manuell korrigiert werden müssen.

In [diesem Artikel](http://code.google.com/p/hyphenator/wiki/2AutomatischeSilbentrennungMitJS) wird näher auf Liangs Algorithmus eingegangen.

## Silbentrennung im Web heute ##
Im Web spielt die Silbentrennung bis heute kaum eine Rolle. Dies hat verschiedene Ursachen:
  * Da es verschiedene Browser gibt, die je nach Einstellung durch den Nutzer Texte unterschiedlich darstellen, kann die Darstellung von Texten im HTML-Web vom Autor nicht abschliessend bestimmt werden; Zeilen werden je nach Schriftart und -grösse an unterschiedlichen Stellen umgebrochen.
  * Das «weiche Trennzeichen» (Soft Hyphen, Details siehe unten), wurde lange nicht von allen Browsern unterstützt. Mit dem am 17. Juni 2008 erschienenen Firefox 3 unterstützen nun alle aktuellen Browser dieses Sonderzeichen; jedoch unterschiedlich gut (Siehe [Kompatibilitätstabelle](http://code.google.com/p/hyphenator/wiki/8CompatibilityMatrix)).
  * Die Auflösung der Bildschirme (72-140ppi) wächst zwar ständig, ist im Vergleich zu gedruckten Texten (300-600dpi) aber immer noch klein.


Der [HTML401-Standard](http://edition-w3.de/TR/1999/REC-html401-19991224/struct/text.html#h-9.3.3) besagt folgendes:

_In HTML gibt es zwei Typen von Trennzeichen: den normalen Trennstrich und das weiche Trennzeichen (soft hyphen). Der normale Trennstrich sollte von den Benutzerprogrammen wie jedes andere Zeichen behandelt werden. Das weiche Trennzeichen zeigt dem Benutzerprogramm, wo ein Zeilenumbruch auftreten kann._

_Diejenigen Browser, die weiche Trennzeichen interpretieren, müssen folgende Semantik beachten: Wenn eine Zeile an einem weichen Trennzeichen umgebrochen wird, muss ein Trennstrich am Ende der ersten Zeile stehen. Wenn eine Zeile an einem weichen Trennzeichen nicht umgebrochen wird, darf das Benutzerprogramm keinen Trennstrich ausgeben. Bei Operationen wie Suchen und Sortieren sollte das weiche Trennzeichen immer ignoriert werden._

_In HTML wird der normale Trennstrich durch das '-'-Zeichen (&#45; oder &#x2D;) repräsentiert. Das weiche Trennzeichen wird repräsentiert durch die Zeichen-Entity-Referenz &shy; (soft hyphen, &#173; oder &#xAD;)_

Der HTML-Standard schreibt also nicht vor, dass Browser das &shy;-Zeichen als Trennstelle erkennen müssen. Zur Zeit nehmen aber alle aktuellen Browser (Internet Explorer ab Verion 5, Safari 2, Opera ab Version 7.1) ausser Firefox 2.0 Trennungen vor.
(Update vom 5.7.2007: Die zukünftige Browserengine von Firefox, Gecko 1.9 unterstützt &shy; seit dem [sechsten Alpha-Release](http://www.mozilla.org/projects/firefox/3.0a6/releasenotes/). Diese Entwicklungen werden in Firefox 3.0 integriert.)
Die Trennstellen (&shy;) muss der Autor aber manuell einfügen.

Der grosse Nachteil der vorgängigen Trennung mit &shy; ist, dass Wörter, welches dieses Sonderzeichen enthalten, in allen Browsern von Suchfunktionen nicht mehr gefunden werden.
Ich gehe davon aus, dass auch Suchmaschinen solche Wörter nicht indizieren.

## Silbentrennung im Web morgen ##
Mit [CSS 3](http://www.w3.org/TR/css3-text/#hyphenate) (heute ist CSS 2.1 aktuell), wird es möglich sein, das Trennungsverhalten von Textabsätzen mittels CSS zu steuern. Aber auch hier wird nicht vorgeschrieben, dass Browser diese Silbentrennung vornehmen müssen.

Ebenso wird dem Autor Kontrolle über das [Spacing](http://www.w3.org/TR/css3-text/#spacing) zu geben.

## Zusammenfassung ##
Silbentrennung im Web ist nicht so wichtig, da der Blocksatz ohnehin keinen hohen Stellenwert hat. Trotzdem kann sie – auch im Flattersatz – bei schmalen Spalten nötig bzw. hilfreich sein. Silbentrennungen müssen zur Zeit vom Autor manuell mit dem Sonderzeichen &shy; vorgenommen werden, welches aber vom Firefox bis und mit Version 2 gar nicht und von anderen Browsern zum Teil fehlerhaft unterstützt wurde. Eine automatische browserseitige Silbentrennung für HTML gibt es bislang nicht.

## Wie weiter? ##
Mit der kommenden Version 3.0 wird auch Firefox &shy; unterstützen. Eine Automatisierung der Silbentrennung wird deshalb immer interessanter. Bis die Browser selbst eine Silbentrennung integriert haben, muss diese entweder beim Schreiben der Texte (durch den Texteditor), vor dem Ausliefern auf dem Server (mittels CGI-Skript) oder im Browser (Javascript) vorgenommen werden.

Eine Umsetzung in Javascript hat Vor- und Nachteile:
  * (+) Die Silbentrennung gehört zur Darstellungsebene und findet im Browser statt – Suchmaschinen «sehen» keine Silbentrennung.
  * (+) Es wird «sauberes», schlankes HTML ausgeliefert.
  * (+) Die Silbentrennung kann deaktiviert werden.
  * (-) Die Trennmuster und der Code muss jedes mal übertragen werden.
  * (-) Für jede Seite werden die Trennstellen neu berechnet.

Lesen Sie mehr über die [Implementierung der automatischen Silbentrennung in JavaScript](http://code.google.com/p/hyphenator/wiki/2AutomatischeSilbentrennungMitJS).