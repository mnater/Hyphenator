#Support for &shy; in current Browsers


# Support for &shy; in current Browsers #

| **Browser**           | **Breaking at SHY** | **Ignoring SHY at searching** | **Ignoring SHY at copying** | **Total** |
|:----------------------|:--------------------|:------------------------------|:----------------------------|:----------|
| Firefox 2           |         0         |              0              |             0             |    0    |
| Firefox 3           |         1<sup>(1)</sup>  |              1              |             0             |    2    |
| Internet Explorer 6 |         1         |              0              |             0             |    1    |
| Internet Explorer 7 |         1         |              0              |             0             |    1    |
| Opera 9.27           |         1<sup>(2)</sup>  |              1<sup>(3)</sup>              |             1<sup>(4)</sup>      |    3    |
| Opera 9.5           |         1<sup>(2)</sup>  |              0              |             1<sup>(4)</sup>      |    2    |
| Safari 3.1          |         1         |              0              |             0             |    1    |

<sup>1</sup>: Firefox doesn't break the first word in table-cells (https://bugzilla.mozilla.org/show_bug.cgi?id=418975)

<sup>2</sup>: Opera has some glitches in the Mac-version: hyphens aren't displayed until I change the size of the window

<sup>3</sup>: Opera 9.27 finds words only if SHY aren't visible. This is a regression in version 9.5

<sup>4</sup>: Opera doesn't copy invisible SHY's but copies displayed hyphens.