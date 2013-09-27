var nano = require('nano')('http://localhost:5984');

var twitterydb = nano.db.use('twittery');
twitterydb.insert({
  crazy: true
}, 'rabbit too', function(err, body, header) {
  if (err) {
    console.log('[twittery.insert] ', err.message);
    return;
  }
  console.log('you have inserted the rabbit.')
  console.log(body);
});
