Twittery
========

<!-- TO DO:
[![Build Status](https://travis-ci.org/dreamind/twittery.png)](https://travis-ci.org/dreamind/mtwittery)
[![NPM version](https://badge.fury.io/js/twittery.png)](http://npmjs.org/package/twittery)
[![Dependency Status](https://gemnasium.com/dreamind/twittery.png)](https://gemnasium.com/dreamind/twittery)
-->

Twitter API Keys
----------------

Create `.twitteryrc` in your home directory, and put in your Twitter API keys

  { consumer_key: 'Twitter',
    consumer_secret: 'API',
    access_token_key: 'keys',
    access_token_secret: 'go here'
  }

The keys for accessing Twitter API can be obtained from
[dev.twitter.com][b1] after [setting up a new App][b2].

[b1]: https://dev.twitter.com
[b2]: https://dev.twitter.com/apps/new

``` javascript
var twitter = require('twittery');
```

Debugging
---------

  mocha --debug-brk test/test.js

And then run node-inspector in a second shell:

  node-inspector --web-port=9999 &

Bringing up the URL that node-inspector spits out in a browser allows me to debug with the web inspector.

  http://127.0.0.1:9999/debug?port=5858


Dependencies
------------

mtwitter


Community & Contributions
-------------------------

License: Public Domain or [CC0][c0].

