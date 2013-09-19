var Twittery = require('../lib/twittery');
var assert = require('chai').assert;
var _ = require('undertow');

describe('twittery', function (){
  var delay = 10000, pageNum = 2;

  var translators = [
      { "getter": ["user", "id_str"], "setter": "user_id" },
      { "getter": "created_at", "setter": function(obj, value) {
          obj.created_at = new Date(Date.parse(value));
        }
      },
      { "getter": "text" },
      { "getter": ["geo", "coordinates", 0], "setter": "lat" },
      { "getter": ["geo", "coordinates", 1], "setter": "long" }
    ]
  var fields = [ 'user', 'created_at', 'text', 'geo' ]
  this.timeout(2*pageNum*delay);

  describe('#userTimeline()', function(){
    it('should work for usertimeline', function(done) {

      var twittery = new Twittery();
      var config = {
        userId: '352158211',
        delay: delay,
        pageNum: pageNum,
        //fields: fields
        translators: translators

      };
      twittery.userTimeline(config, function(response) {
        if (response.status == 'error') {
          throw response.error;
        } else if (response.results.length === 0) {
            throw new Error("Tweet number less than expected. Expected 200, but receiving "+response.results.length)
        } else {
          console.log(response.results);
        }
        done();
      });
    })
  });

  describe('#multiUserTimeline()', function(){
    it('should work for usertimeline', function(done) {

      var twittery = new Twittery();
      var config = {
        userId: ['352158211', '6253282'],
        delay: delay,
        pageNum: pageNum,
        translators: translators
      };
      twittery.multiUserTimeline(config, function(response) {
        if (response.status == 'error') {
          throw response.error;
        } else if (response.results.length === 0) {
            throw new Error("Tweet number less than expected. Expected 200, but receiving "+response.results.length)
        } else {
          console.log(response.results);
        }
        done();
      });
    })
  });


})