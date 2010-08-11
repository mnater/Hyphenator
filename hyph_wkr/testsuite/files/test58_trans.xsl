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
	</head>
	<body>
		<p><a href="index.html">&lt;&lt; index</a> | <a href="test57.html">&lt;- Prev</a> | <a href="test59.html">Next -&gt;</a></p>
        <p id="desc">Run Hyphenator with XSLT.</p>
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
        <script src="../Hyphenator.js" type="text/javascript"></script>
        <script type="text/javascript">
		<![CDATA[
        	if (parent != window) {
				Hyphenator.customEvents.addEventListener('onhyphenationdone', function () {
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
				});     	
			}
        	Hyphenator.run({
        		wordhyphenchar: '|'
        	});
		]]>
        </script>
	</body>
	</html>
</xsl:template>
</xsl:stylesheet>