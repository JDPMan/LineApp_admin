var config = {};

// config.mongodb_url = 'mongodb://127.0.0.1/LineApp';
config.mongodb_url = "mongodb://LULineApp:LineApp1971@lineapp-shard-00-00-qryet.mongodb.net:27017,lineapp-shard-00-01-qryet.mongodb.net:27017,lineapp-shard-00-02-qryet.mongodb.net:27017/test?ssl=true&replicaSet=LineApp-shard-0&authSource=admin"

config.port = 3000;

module.exports = config;