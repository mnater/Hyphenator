<?xml version="1.0" encoding="utf8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
	<html lang="de">
	<head>
		<title>Hyphenator.js – Test 58</title>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
        <style type="text/css">
            body {
                width:50%;
                margin-left:25%;
                margin-right:25%;
            }
            .text {
                text-align:justify;
            }
            .test {
            	background-color: #ffd6d6;
            }
            .ref {
            	background-color: #d6ffd6;
            }
            pre {border: 1px dotted grey;}
        </style>
        <script src="../Hyphenator.js" type="text/javascript"></script>
        <script type="text/javascript">
                Hyphenator.config({hyphenchar:'|'});
                Hyphenator.run();
        </script>
	</head>
	<body>
        <h1>Test 58</h1>
        <p>Run Hyphenator with XSLT.<br />
        Firefox fails because of <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=325891">Bug 325891</a>. See <a href="http://code.google.com/p/hyphenator/issues/detail?id=69">Issue69</a>.
        </p>
		<p><a href="test57.html">&lt;- Prev</a> | <a href="index.html">Next -&gt;</a></p>
		<pre>Hyphenator.config({hyphenchar:'|'});
Hyphenator.run();</pre>
		<table>
			<tr>
				<th>Hyphenator</th>
				<th>manually</th>
			</tr>
			<xsl:for-each select="wordlist/word">
			<tr>
			<td class="hyphenate test"><xsl:value-of select="raw"/></td>
			<td class="ref"><xsl:value-of select="manhyph"/></td>
			</tr>
			</xsl:for-each>
	</table>
	</body>
	</html>
</xsl:template>
</xsl:stylesheet>