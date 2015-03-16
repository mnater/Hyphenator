# Introduction #

On dynamic pages elements are often inserted after Hyphenator.js has run. These elements won't be hyphenated. Now, while calling Hyphenator.run() again just works, this isn't the way it should be done.

When calling Hyphenator.run() a second (a third…) time, it passes all initial steps again and processes the entire page. That takes time and isn't necessary. That's why Hyphenator.js emits a warning (to the console by default) it is rerun.

To hyphenate elements _after_ Hyphenator.js has run one should use `Hyphenator.hyphenate(<target>, <lang>)` [see doc](https://code.google.com/p/hyphenator/wiki/en_PublicAPI#mixed_Hyphenator.hyphenate(mixed_target,_string_lang))