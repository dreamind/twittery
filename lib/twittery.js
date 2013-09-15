var _        = require('undertow');
var defaults = require('./defaults');
var sprintf  = require('sprintf').sprintf;
var vsprintf = require('sprintf').vsprintf;
var request  = require('request');
var jf       = require('jsonfile');
var fs       = require('fs');

function distance(lon1, lat1, lon2, lat2) {

  // http://www.ig.utexas.edu/outreach/googleearth/latlong.html
  // convert degrees to radians
  function toRad(number) { return number * Math.PI / 180; }

  //http://www.movable-type.co.uk/scripts/latlong.html
  var R     = 6371; // earth's mean radius in km
  var dLat  = toRad((lat2-lat1));
  var dLon  = toRad((lon2-lon1));
  var nLat1 = toRad(lat1);
  var nLat2 = toRad(lat2);
  var a     = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(nLat1) * Math.cos(nLat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
  var c     = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d     = R * c;

  return d;
}

function transformx(config) {
  var f = function (x) { return x; }
    , fx = function (x) { return _.translate1(x, {}, config.translatefs); };

  if (config.fields) {
    f = function (x) { return _.pick(x, config.fields); };
  } else if (config.translatefs) {
    return fx;
  } else if (config.translators) {
    config.translatefs = _.translatorx(config.translators);
    return fx;
  }
  config.transformf = f;
  return f;
}

var Twittery = function Twittery(options) {

  if (!(this instanceof Twittery)) { // if called as a function
    console.log('CREATING');
    return new Twittery(options); // force object construction
  }

  this.options = defaults.options; // global twittery option

  var optionFile = process.env.HOME + '/.twitteryrc';
  var userOptions = {};
  if (fs.existsSync(optionFile)) { // no API Key is supplied
    // try to get it from ~/.twitteryrc
    try {
      userOptions = jf.readFileSync(optionFile);
    } catch (e) {
      console.log('No credentials provided');
    }
  }
  this.options = _.extend(this.options, userOptions);
  this.options = _.extend(this.options, options);

  options = this.options;

  var paging = this.paging = function (config, page, results, callback){

    var pageQs     = (page === 0) ? '' : ('&max_id=' + config.max_id_str);
    var delay      = config.delay || options.DELAY || 0;
    var transformf = config.transformf || transformx(config);
    var reqOptions = {
      url: config.url + pageQs,
      oauth: options.oauth
    };

    request.get(reqOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var reqResults = JSON.parse(body);
        var tweets = [];

        if (config.api === 'search') {
          tweets = reqResults.results;
        } else if (config.api === 'timeline') {
          tweets = reqResults;
        }

        for (var i = 0, j = tweets.length; i < j; i++) {
          var tweet  = tweets[i];
          var result = transformf(tweet);
          results.push(result);
          if (config.writer) {
            // individual tweet's async dump
            config.writer.add(result);
          }
        }

        if (config.api == 'timeline') { // last tweet
          config.max_id_str = tweet.id_str;
        } else if (config.api == 'search' ) {
          config.max_id_str = reqResults.max_id_str;

          if (!('next_page' in reqResults)) {
            callback({
              status: 'success',
              config: config,
              results: results
            });
            return;
          }
        }
      } else if (error && error.statusCode === 429) {
        setTimeout(paging, delay, config, page, results, callback);
      } else {
        callback({
          status: 'error',
          config: config,
          error: error
        });
        return;
      }
      // process next page
      page++;
      if (page < config.pageNum && tweets.length > 0) {
        // try to get remaining tweets
        setTimeout(paging, delay, config, page, results, callback);
      } else {
        callback({
          status: 'success',
          config: config,
          results: results
        });
        return;
      }
    });
  }

  // config = {} could contain:
  // - userId
  // - pageNum:
  // - fields or translators or translatefs

  this.userTimeline = function userTimeline (config, callback) {

    config.api = 'timeline';
    config.url = options.USER_TIMELINE_URL + '?' +
                 'count=' + options.PAGE_SIZE +
                 '&user_id=' + config.userId;

    paging(config, 0, [], callback);
  };

  // config.userIds = [...]
  this.multiUserTimeline = function (config, callback) {

    var userIds   = config.userIds;
    var userIdx   = 0;
    config.userId = userIds[userIdx];

    var allResponse = {
      status: 'success',
      results: {}
    };

    function userHandler(response){
      if (response.status == 'error') {
        callback(response); // terminate on the first error
        return;
      }
      allResponse.results[response.userId] = response.results // tweets
      userIdx++;
      if (userIdx < userIds.length) {
        // continue with the next user

        config.userId = userIds[userIdx];
        console.log('next user', config.userId);
        Twittery.userTimeline(config, userHandler);
      } else { // all users are done
        callback(allResponse);
      }
    }
    Twittery.userTimeline(config, userHandler);
  };


  /*
    config: {
      q:
      result_type:
      extraQs:
      pageNum:
      fields:
      translatefs:
    }
  */
  this.search = function(config, callback) {
    var defaults = {
      api: "search",
      result_type: 'recent',
      q: 'tweet'
    }
    _.extendIf(config, defaults);
    config.url = options.SEARCH_URL + '?' +
      'rpp=' + options.PAGE_SIZE +
      '&q=' + config.q +
      '&result_type=' + config.result_type +
      ((config.extraQs) ? "&"+config.extraQs : "");
    console.log(config.url);
    paging(config, 0, [], callback);
  }

};

if (typeof exports !== "undefined") {
  exports = module.exports = Twittery;
}
