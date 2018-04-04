var config = {};

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

// config.mongodb_url = 'mongodb://127.0.0.1/LineApp';
// config.mongodb_url = "mongodb://LULineApp:LineApp1971@lineapp-shard-00-00-qryet.mongodb.net:27017,lineapp-shard-00-01-qryet.mongodb.net:27017,lineapp-shard-00-02-qryet.mongodb.net:27017/test?ssl=true&replicaSet=LineApp-shard-0&authSource=admin"
config.mongodb_url = 'mongodb://LULineApp:LineApp1971@ds111336.mlab.com:11336/line-app'
config.port = port;
config.ip = ip;
// config.port = 3000;

module.exports = config;