# Wie schnell ist Hyphenator? #

Es gibt nur eine Antwort:«Das hängt von vielen Parametern ab!»
Für die meisten Aufgaben ist Hyphenator schnell genug. Aber Speed ist cool und es gibt einige Dinge, die Hyphenator schneller und somit noch cooler machen ;-)

## Ausführungsgeschwindigkeit ##
Ich arbeite ständig an der Ausführungsgeschwindigkeit. Wenn es eine Millisekunde zu sparen gibt, dann will ich diese sparen!
Trotzdem gibt es je nach Browser Unterschiede in der Ausführungsgeschwindigkeit. Allgemein gesagt ist ein modernerer Browser auch schneller.

**Was ein Webmaster tun kann:**
Die Tiefe des DOM-Baums hat einen grossen Einfluss auf die Geschwindigkeit von Hyphenator. So braucht es ziemlich viel Zeit, ein Dokument mit `<body class="hyphenate">` und stark verschachteltem Code (Layouttabellen, viele div's in div's in div's…), aber Hyphenator ist ziemlich schnell, wenn er nur alle `<p>`-Elemente trennen muss.

Fazit: Schreiben Sie sauberen, standardkonformen Code und verwenden sie `class="hyphenate"` in den äussersten «Blättern» des Baumes und nicht in den «Wurzeln».

## Ladegeschwindigkeit ##
Das Script an sich ist nicht so gross (gepacktes Hyphenator.js: ca. 16Kb). Was etwas mehr Zeit braucht, ist das Laden der Trennmuster (84KB für die deutschen Trennmuster, 28KB für englische).

Mit einem Javascript-Packer (http://dean.edwards.name/packer/) kann Hyphenator.js auf 50% seiner Grösse komprimiert werden. Die Datenstruktur der Trennmuster ist dagegen bereits hochoptimiert im Speicherbedarf (und Geschwindigkeit). Hier kann fast nichts eingespart werden.

**Was ein Webmaster tun kann:**
  * **Dateien gezippt ausliefern:** Abhängig vom Server können Sie die Dateien gezippt ausliefern. Aktuelle Browser kommen ohne Probleme zurecht mit gezippten Inhalten. Zippen spart typischerweise 50% ein.
  * **Trennmuster vorladen:** Oft wird nur eine Sprache auf einer Website verwendet. Der Mechanismus, die Trennmuster dynamisch zu laden ist dann ziemlich überflüssig. Um Trennmuster vorzuladen, können Sie z.B.
```
<script src="http://yourdomain.com/pfad/patterns/de.js" type="text/javascript"></script>
```
> nach dem Scriptblock, der Hyphenator lädt, aber bevor das Script ausgeführt wird, schreiben.
> Das «
> [working example](http://hyphenator.googlecode.com/svn/trunk/WorkingExample.html)» würde dann so aussehen:
```
<script src="http://hyphenator.googlecode.com/svn/trunk/Hyphenator.js" type="text/javascript"></script>
<script src="http://hyphenator.googlecode.com/svn/trunk/patterns/de.js" type="text/javascript"></script>
<script type="text/javascript">
    Hyphenator.run();
</script>
```
> Vorgeladene Trennmuster werden nicht ein zweites Mal geladen!

> Wenn Sie verhindern möchten, dass Hyphenator Trennmuster dynamisch hinzulädt, können Sie diese Funktionalität explizit ausschalten:
```
Hyphenator.setRemoteLoading(false);
```
> In diesem Fall trennt Hyphenator nur Texte, für die passende Trennmuster geladen sind.
  * **Trennmuster cachen:** Wenn Ihre Seite Hyphenator oft verwendet, könnte es sich lohnen, die Trennmuster mittels eines passenden HTTP-Header zu cachen.