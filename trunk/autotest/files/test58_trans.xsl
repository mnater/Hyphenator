<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
	<html lang="de">
	<head>
		<title>Hyphenator.js - Test 58</title>
        <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1" />
        <style type="text/css">
            body {
                width:50%;
                margin-left:25%;
                margin-right:25%;
            }
            #test {
            	background-color: #ffd6d6;
            }
            #ref {
            	background-color: #d6ffd6;
            }
        </style>
        <script src="../Hyphenator.js" type="text/javascript"></script>
        <script type="text/javascript">
		<![CDATA[
                Hyphenator.config({hyphenchar:'|'});
                Hyphenator.run();
		]]>
        </script>
	</head>
	<body>
        <h1>Test 58</h1>
        <p id="desc">Run Hyphenator with XSLT.<br />
        Some browsers may fail on DOMContentLoaded here...</p>
		<p><a href="test57.html">&lt;- Prev</a> | <a href="test59.html">Next -&gt;</a></p>
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
		<img src="http://www.nasa.gov/images/content/84857main_EC04-0325-23_lg.jpg" width="30" hight="24" />
	</body>
	</html>
</xsl:template>
</xsl:stylesheet>