const express = require('express')
const app = express()

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

var mongo = require('mongodb'),
    mongoClient = require('mongodb').MongoClient,
    config = require('./config'),
    passport = require('passport'),
    mongoose = require('mongoose');
var Strategy = require('passport-local').Strategy;

mongoose.connect(config.mongodb_url)


// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'LA_Admin', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.use('/static', express.static(__dirname + '/public'));

require('./config/passport')(passport); // pass passport for configuration

dbClient = null; // NOTE: global variable

mongoClient.connect(config.mongodb_url, {}, function (err, db) {
    if (err) { return console.dir(err); }
    dbClient = db;
    app.listen(config.port, () => console.log('Line App Admin listening on port ' + config.port));
    
});

require('./routes')(app);
require('./userManagement/routes')(app);
require('./login/routes')(app, passport);

// module.exports = app;