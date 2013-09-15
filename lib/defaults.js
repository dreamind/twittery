'use strict';

var pkginfo = {exports: []};
try {
  require('pkginfo')(pkginfo);
} catch (e) {
  pkginfo.exports = {name: 'twittery', version: '0.0.0'};
}
exports.pkginfo = pkginfo.exports;

exports.options = {

  oauth: {
    consumer_key: null,
    consumer_secret: null,
    token: null,
    token_secret: null,
  },

  PAGE_SIZE: '100',
  DELAY: 40000,
  MAX_RETRY: 200,

  USER_TIMELINE_URL: "https://api.twitter.com/1.1/statuses/user_timeline.json",
  SEARCH_URL: "https://api.twitter.com/1.1/search/tweets.json"

};