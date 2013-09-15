var twitterx = require('./twitterx');
var _ = require('undertow');
var mongo = require('mongodb'),
  Db = mongo.Db,
  Connection = mongo.Connection,
  Server = mongo.Server,
  BSON = mongo.BSONNative;

function mongoWriter(mongoSetup, callback){
  var writer = {};
  var db = new Db(mongoSetup.db, new Server(mongoSetup.host, mongoSetup.port, {}));

	db.open(function(err, db) { // mongodb open
    db.collection(mongoSetup.collection, function(err, collection) {
      
      if (err) throw err;
      writer = collection;
      callback(writer);
    });
  });
}

var mongoSetup = {
  host: 'localhost',
  port: Connection.DEFAULT_PORT,
  db: 'testdb',
  collection: 'twitterxcoll'
}

mongoWriter(mongoSetup, function(writer) {

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
    userId: '352158211',
    pageNum: 1,
    //fields: [ 'user', 'created_at', 'text', 'geo' ],
    writer: writer,
    translators: translators
  };
  
  twitterx.userTimeline(config, function(response) {
    if (response.status == 'error') {
      console.log('Error', response.error);
    } else {
      console.log('Success', response.results.length != 200);
    }
  });

});
