# Das copy-paste Problem #
Wenn jemand einen Text, der durch Hyphenator.js getrennt wurde, kopiert und an anderer Stelle wieder einfügt, kann dies zu seltsamen Resultaten führen. In der Tat ist dies die derzeit am häufigsten geäusserte Kritik an Hyphenator:

> «das Bundesministerium der Justiz hat uns heute gebeten den Hyphenator-Code von der BMJ Site zu entfernen. Grund sind Beschwerden von Journalisten, die bisher Pressemitteilung via Copy / Paste in eigene Artikel übernommen hatten.»

Ich habe dieses Problem schon einige Male in Angriff genommen, konnte es aber nicht lösen. Dieser Artikel soll meine bisherigen Versuche dokumentieren und – hoffentlich – neue Lösungsansätze aufwerfen…

Eine englische Übersetzung folgt zu einem späteren Zeitpunkt.

## Problembeschreibung ##
Das Problem ist ziemlich komplex, da seine Ursache auf verschiedenen Ebenen liegen kann. Da ist zuerst die verschiedenen Browser, die den Text darstellen, dann das jeweilige Betriebssystem, das den Copy/Paste-Mechanismus zur Verfügung stellt und schliesslich die Programme, die den kopierten Text aufnehmen. Entsprechend ist die Problembeschreibung gegliedert.

### Browser und Betriebssysteme ###
| **OS** | **Browser** |
|:-------|:------------|
| Mac OS X 10.6 | Safari 4.0.3 |
|  | Firefox 3.5.3 |
|  | Opera 10.0 |
| Windows XP (SP2) | IE 6 |
|  | IE 7 |
|  | IE 8 |
|  | Firefox 3.5.3 |

Ich gehen davon aus, dass Benutzer von Firefox, Opera und Safari ihre Browser regelmässiger updaten, als Benutzer von IE, weshalb ich die veralteten IE-Versionen miteinbeziehe.
Die IE Versionen habe ich mit http://finalbuilds.edskes.net/iecollection.htm installiert.

### Beschreibung des problematischen Verhaltens ###
Hyphenator.js funktioniert so, dass das Script an jeder Trennstelle ein sogenanntes "Weiches Trennzeichen" (englisch: soft hyphen "shy" http://de.wikipedia.org/wiki/Weiches_Trennzeichen) einfügt. Diese Trennstellen werden normalerweise nicht angezeigt, sondern erst dann, wenn das Wort am Zeilenende umgebrochen werden muss.

Die verschiedenen Umgebungen (Browser-OS-Textprogramm) reagieren unterschiedlich und meist fehlerhaft, wenn Text mit weichen Trennzeichen kopiert und eingefügt wird.

#### Mac OS X 10.6, Safari 4.0.3 ####
Safari kopiert Text als RTF in die Zwischenablage. Shy's werden dabei erhalten. Erst die Weiterverwertung durch die jeweiligen Programme ist fehlerhaft:

  * Verändert man die Fenstergrösse der Anzeige der Zwischenablage, werden die Wörter umgebrochen (es erscheint aber kein Trennstrich). TextEdit verhält sich gleich.
  * Word for Mac 2008 speichert das Softhyphen zwar als solches (#xAD), kann aber nicht damit umgehen. Intern verwendet Word etwas anderes um optionale Trennstellen zu markieren (

Unknown end tag for &lt;/t&gt;



Unknown end tag for &lt;/r&gt;



&lt;w:r&gt;



&lt;w:softHyphen/&gt;



&lt;w:t&gt;

).
  * OpenOffice setzt die Softhyphens korrekt um.

#### Mac OS X 10.6, Firefox 3.5.3 ####
Firefox kopiert den Text als reinen Text in die Zwischenablage. Shy's werden dabei erhalten. Die Weiterverwertung durch die jeweiligen Programme ist unproblematischer:

  * Verändert man die Fenstergrösse der Anzeige der Zwischenablage, werden die Wörter umgebrochen (es erscheint aber kein Trennstrich). TextEdit verhält sich gleich.
  * Word for Mac 2008 ändert die Softhyphens in das interne Format für optionale Trennzeichen um.
  * OpenOffice setzt die Softhyphens korrekt um.

#### Mac OS X 10.6, Opera 10.0 ####
Opera kopiert den Text als reinen Text in die Zwischenablage. Shy's werden dabei nur dann erhalten, wenn Sie im Browser als Umbruch erscheinen.

  * Verändert man die Fenstergrösse der Anzeige der Zwischenablage, werden die Wörter nur dort umgebrochen, wo das Softhyphen erhalten wurde (es erscheint aber kein Trennstrich). TextEdit verhält sich gleich.
  * Word for Mac 2008 speichert das Softhyphen zwar als solches (#xAD), kann aber nicht damit umgehen. (Erstaunlicherweise; ich hätte gleiches Verhalten wie bei Firefox erwartet.)
  * OpenOffice setzt die Softhyphens korrekt um.

#### Windows XP, IE 6 - IE 8 ####
IE kopiert den Text mit allen Softhyphens in die Zwischenablage.

  * Microsoft Office 2007 scheint gut zurecht zu kommen mit den Softhyphens: Sie werden in Words interne optionale Trennstriche verwandelt.
  * Wordpad kann ebenso mit ihnen umgehen, nicht aber Notepad, dass einfach Trennstriche anzeigt, aber Softhyphens speichert.

#### Windows XP, Firefox 3.5.3 ####
Firefox kopiert den Text mit allen Softhyphens in die Zwischenablage.

  * Microsoft Office 2007 scheint gut zurecht zu kommen mit den Softhyphens: Sie werden in Words interne optionale Trennstriche verwandelt.
  * Wordpad kann ebenso mit ihnen umgehen, nicht aber Notepad, dass einfach Trennstriche anzeigt, aber Softhyphens speichert.

#### Zusammenfassung des problematischen Verhaltens ####
Unter Windows stellt sich kein eigentliches Problem dar; im Gegenteil: die Trennung stellt einen Mehrwert dar, da diese nicht mehr vom Textverarbeitungsprogramm gemacht werden muss.
Auf dem Mac hingegen (es fällt mir schwer das einzugestehen) sieht man sich aber einer Reihe von Inkonsistenzen gegenübergestellt, die das Weiterverwenden von getrennten Texten mühsam macht (v.a. wenn man Safari oder Opera und MS Office verwendet).

## Lösungsansätze ##
### Voraussetzungen ###
Grundsätzlich gibt es verschiedene Ziele, die angestrebt werden können:
  1. Der Benutzer spürt keinen Unterschied zu Seiten, die Hyphenator nicht verwenden: die Softhyphens müssen aus kopiertem Text entfernt werden.
  1. Dem Benutzer wird abhängig von der verwendeten Umgebung die optimale Lösung geboten.
  1. Der Benutzer kann selber kontrollieren, wie das Verhalten beim Kopieren ist.
Ich bin der Meinung das 1 der richtige Weg ist, weil Silbentrennung eine Frage der Darstellung ist und nicht des Inhalts. Kopiert man einen Text, ist man aber an dessen Inhalt interessiert. Ausserdem passt das zum gewohnten Verhalten der Browser.
Es geht also darum, einen Weg zu finden, wie der Benutzer egal in welchem Browser beim Kopieren lediglich den Text, nicht aber die Trennzeichen erhält.





## Wie weiter? ##
more to come