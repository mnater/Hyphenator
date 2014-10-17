<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html"
 encoding="UTF-8"
 doctype-public="-//W3C//DTD HTML 4.01//EN"
 doctype-system="http://www.w3.org/TR/html4/strict.dtd"/>
<xsl:template match="/">
	<html lang="de">
	<head>
		<title>Hyphenator.js - Test 58</title>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
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
        	if (parent != window) {
				Hyphenator.config({
					'onhyphenationdonecallback': function () {
						var t1 = document.getElementById('test').innerHTML,
						t2 = document.getElementById('ref').innerHTML,
						desc = document.getElementById('desc').firstChild.data,
						msg = {
							desc: desc,
							index: 58
						};
						if (t1 == t2) {
							msg.result = 'passed';
						} else {
							msg.result = 'failed';
						}
						parent.postMessage(JSON.stringify(msg), window.location.href);
					}
				});
			}
			Hyphenator.config({hyphenchar:'|'});
			Hyphenator.run();
		]]>
        </script>
	</head>
	<body>
		<p><a href="index.html">&lt;&lt;- index</a> | <a href="test57.html">&lt;- Prev</a> | <a href="test59.html">Next -&gt;</a></p>
        <h1>Test 58</h1>
        <p id="desc">Run Hyphenator with XSLT.<br />
        Some browsers may fail on DOMContentLoaded here...</p>

		<table>
			<tr>
				<th>Hyphenator</th>
				<th>manually</th>
			</tr>
			<xsl:for-each select="wordlist/word">
			<tr>
			<td id="test" class="hyphenate"><xsl:value-of select="raw"/></td>
			<td id="ref"><xsl:value-of select="manhyph"/></td>
			</tr>
			</xsl:for-each>
		</table>
		<img src="http://www.nasa.gov/images/content/84857main_EC04-0325-23_lg.jpg" width="30" hight="24" />
	</body>
	</html>
</xsl:template>
</xsl:stylesheet>