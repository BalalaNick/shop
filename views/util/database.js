const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://yashvekariya9510:YASH9510@product.owbokbk.mongodb.net/Shop?retryWrites=true&w=majority')
    .then(client => {
        console.log('connect!');
        _db = client.db()
        callback(client);
    })
    .catch(err => {
        console.log(err)
    });
}

const getdb = () => {
    if(_db){
        return _db;
    }

    throw 'No database Found';
}

exports.mongoConnect = mongoConnect;
exports.getdb = getdb;
