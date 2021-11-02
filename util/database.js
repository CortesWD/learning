const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
  MongoClient.connect('mongodb://localhost:27017/shop')
    .then(client => {
      console.log('connected');
      _db = client.db();
      cb(client);
    })
    .catch(err => {
      console.log('err connection mongodb\n', err)
      throw err;
    })
}

const getDb = () => {
  if (_db) return _db;
  throw 'No db found';
}

const connectToCollection = (name) => {
  const db = getDb();
  return db.collection(name);
}

module.exports = {
  mongoConnect,
  getDb,
  connectToCollection
};