const express = require('express')
const app = express()

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

var mongo = require('mongodb'),
    mongoClient = require('mongodb').MongoClient,
    config = require('./config'),
    bodyParser = require('body-parser');

// app.use(express.bodyParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/static', express.static(__dirname + '/public'));

dbClient = null; // NOTE: global variable

mongoClient.connect(config.mongodb_url, {}, function (err, db) {
    if (err) { return console.dir(err); }
    dbClient = db;
    app.listen(config.port, () => console.log('Line App Admin listening on port 3000'));
});

// Routes - Will be broken down into folders in future
require('./routes')(app);
require('./userManagement/routes')(app);
