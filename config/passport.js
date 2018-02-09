var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/admin');
var mongo = require('mongodb');

module.exports = function (passport) {

    // Configure the local strategy for use by Passport.
    //
    // The local strategy require a `verify` function which receives the credentials
    // (`username` and `password`) submitted by the user.  The function must verify
    // that the password is correct and then invoke `cb` with a user object, which
    // will be set at `req.user` in route handlers after authentication.
    passport.use(new LocalStrategy(
        function (username, password, cb) {
            dbClient.collection('admins').find({ userName: username }).toArray(function (err, user) {
                // db.users.findByUsername(username, function (err, user) {
                if (err) { return cb(err); }
                if (!user) { return cb(null, false); }
                if (user[0].password != password) { return cb(null, false); }
                return cb(null, user[0]);
            });
        }));


    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  The
    // typical implementation of this is as simple as supplying the user ID when
    // serializing, and querying the user record by ID from the database when
    // deserializing.
    passport.serializeUser(function (user, cb) {
        cb(null, user._id);
    });

    passport.deserializeUser(function (id, cb) {
        dbClient.collection('admins').find({ _id: mongo.ObjectID(id) }).toArray(function (err, user) {
            // db.users.findById(id, function (err, user) {
            if (err) { return cb(err); }
            cb(null, user[0]);
        });
    });
};