var mongoEndpoint = 'mongodb://db2.aurin.org.au:27017/twitdb'
  , couchEndpoint = 'http://192.43.209.41:5984/tweetbix';

//couchEndpoint ='http://localhost:5984/twittery'

//java -jar cbmgimporter.jar -n http://192.43.209.41:5984 -b twitau5 -mh db2.aurin.org.au:27017 -db twitdb

var couchDb = require('nano')(couchEndpoint);

var mongo = require('mongodb')
  , MongoClient = mongo.MongoClient;

function couchInsert (tweet, callback) {
  couchDb.insert(
    tweet, null
  , function(err, body, header) {
      if (err) {
        console.log('[couch insert] ', err.message);
        throw err;
      }
      callback();
    }
  );
}

MongoClient.connect(mongoEndpoint, function(err, db) {
  if (err) throw err;

  var i = 0;
  var collection = db.collection('twitau5');
  console.log('tqitau5');
  var cursor = collection.find();

  readNext();

  function readNext () {
    cursor.nextObject(function(err, tweet) {

      if (err) {
        throw err;
        return;
      }
      if (!tweet) {
        console.log('null doc')
        return;
      }
      delete tweet['_id'];
      console.log('insert:', i);
      couchInsert (tweet, readNext);
      i++;
    });
  }

});




