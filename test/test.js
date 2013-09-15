var twitterx = require('./twitterx');
var assert = require('chai').assert;
var _ = require('undertow');

var tweetSample =
{
    "_id": "50207182217e884bc0000000",
    "contributors": null,
    "truncated": false,
    "text": "I'm at Blacktown Station (Platforms 4 &amp; 5) (Blacktown, NSW) http://t.co/sm9blyny",
    "in_reply_to_status_id": null,
    "id": "232651848220303360",
    "entities": {
        "user_mentions": [],
        "hashtags": [],
        "urls": [
            {
                "indices": [
                    64,
                    84
                ],
                "url": "http://t.co/sm9blyny",
                "expanded_url": "http://4sq.com/RTorbB",
                "display_url": "4sq.com/RTorbB"
            }
        ]
    },
    "retweeted": false,
    "coordinates": {
        "type": "Point",
        "coordinates": [
            150.9075752,
            -33.76859833
        ]
    },
    "source": "<a href=\"http://foursquare.com\" rel=\"nofollow\">foursquare</a>",
    "in_reply_to_screen_name": null,
    "in_reply_to_user_id": null,
    "retweet_count": 0,
    "id_str": "232651848220303360",
    "favorited": false,
    "user": {
        "follow_request_sent": null,
        "profile_use_background_image": true,
        "default_profile_image": false,
        "geo_enabled": true,
        "verified": false,
        "profile_image_url_https": "https://si0.twimg.com/profile_images/2396664451/image_normal.jpg",
        "profile_sidebar_fill_color": "CFFCED",
        "is_translator": false,
        "id": 80583499,
        "profile_text_color": "525252",
        "followers_count": 77,
        "protected": false,
        "id_str": "80583499",
        "profile_background_color": "CFFCED",
        "listed_count": 4,
        "utc_offset": 36000,
        "statuses_count": 5374,
        "description": "21| R@iNBoW ChILD | Met @ladygaga on 18.6.12 | Pop music obsessor | Occasional lyricist | on le right",
        "friends_count": 232,
        "location": "Sydney, Australia.",
        "profile_link_color": "737475",
        "profile_image_url": "http://a0.twimg.com/profile_images/2396664451/image_normal.jpg",
        "notifications": null,
        "show_all_inline_media": false,
        "profile_background_image_url_https": "https://si0.twimg.com/profile_background_images/60261585/4b291f43281ee.jpg",
        "profile_background_image_url": "http://a0.twimg.com/profile_background_images/60261585/4b291f43281ee.jpg",
        "name": "Casey-Case",
        "lang": "en",
        "profile_background_tile": false,
        "favourites_count": 8,
        "screen_name": "case_91",
        "url": null,
        "created_at": "Wed Oct 07 13:59:56 +0000 2009",
        "contributors_enabled": false,
        "time_zone": "Sydney",
        "profile_sidebar_border_color": "FFFFFF",
        "default_profile": false,
        "following": null
    },
    "geo": {
        "type": "Point",
        "coordinates": [
            -33.76859833,
            150.9075752
        ]
    },
    "in_reply_to_user_id_str": null,
    "possibly_sensitive": false,
    "created_at": "Tue Aug 07 01:38:17 +0000 2012",
    "possibly_sensitive_editable": true,
    "in_reply_to_status_id_str": null,
    "place": null
};


describe('twitterx', function(){

  describe('#transform()', function(){
    var fields = [ 'user', 'created_at', 'text', 'geo' ];
    it('should work for field-based transform', function(){
      assert.deepEqual(
        twitterx.transform(tweetSample, {fields: fields}),
        { user: tweetSample.user,
          created_at: tweetSample.created_at,
          text: tweetSample.text,
          geo: tweetSample.geo
        }
      );
    })

    var translators = [
      { "getter": ["user", "id_str"], "setter": "user_id" },
      { "getter": "created_at", "setter": function(obj, value) {
          obj.created_at = new Date(Date.parse(value));
        }
      },
      { "getter": "text" },
      { "getter": ["geo", "coordinates", 0], "setter": "lat" },
      { "getter": ["geo", "coordinates", 1], "setter": "long" }
    ];
    it('should work for translator-based transform', function(){
      assert.deepEqual(
        twitterx.transform(tweetSample, {translatefs: _.translatorx(translators)}),
        { user_id: tweetSample.user.id_str,
          created_at: new Date(Date.parse(tweetSample.created_at)),
          text: tweetSample.text,
          lat: tweetSample.geo.coordinates[0],
          'long': tweetSample.geo.coordinates[1]
        }
      );
    })
  });

  describe('#userTimeline()', function(){

    it('should work for usertimeline', function(done) {
      this.timeout(5000); // two API calls expected in 5s
      var config = {
        userId: '352158211',
        // userId: '6253282', // twitterapi
        pageNum: 2,
        fields: [ 'user', 'created_at', 'text', 'geo' ]
      };
      twitterx.userTimeline(config, function(response) {
        if (response.status == 'error') {
          throw response.error;
        } else {
          if (response.results.length != 200) {
            throw new Error("Tweet number less than expected. Expected 200, but receiving "+response.results.length)
          }
        }
        done();        
      });
    })
  });

  describe('#search()', function(){

    it('should work for search API', function(done) {
      this.timeout(10000); // two API calls expected in 5s
      var translators = [
        { "getter": ["user", "id_str"], "setter": "user_id" },
        { "getter": "created_at", "setter": function(obj, value) {
            obj.created_at = new Date(Date.parse(value));
          }
        },
        { "getter": "text" },
        { "getter": ["geo", "coordinates", 0], "setter": "lat" },
        { "getter": ["geo", "coordinates", 1], "setter": "long" }
      ];

      var config = {
        pageNum: 2,
        q: 'melbourne',
        result_type: "recent",
        extraQs: "geocode=37.7833,144.9667,10km", // latitude,longitude,radius 
        translators: translators
      };
      twitterx.search(config, function(response) {
        if (response.status == 'error') {
          throw response.error;
        } else {
          console.log('#search() provides '+response.results.length+' results');
        }
        done();        
      });
    });

  });


})