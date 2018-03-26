const express = require('express')
const app = express()

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

var mongo = require('mongodb'),
    mongoClient = require('mongodb').MongoClient,
    config = require('./config'),
    passport = require('passport'),
    Strategy = require('passport-local').Strategy;

/* Log in Stuff */
// Use application-level middleware for common functionality, including logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'LA_Admin', resave: false, saveUninitialized: false }));
// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.use('/static', express.static(__dirname + '/public'));
require('./config/passport')(passport); // pass passport for configuration
dbClient = null; // NOTE: global variable

// Connect to database
mongoClient.connect(config.mongodb_url, {}, function (err, db) {
    if (err) { 
        console.log('Mongo connection Failed...')
        return console.dir(err);
    }
    console.log("Successfully connected to Mongo!");
    dbClient = db;
    app.listen(config.port, () => console.log('Line App Admin listening on port ' + config.port));
    
});

// List of routes
require('./routes')(app);
require('./userManagement/routes')(app);
require('./login/routes')(app, passport);
require('./mobileAPICalls/routes')(app,passport);