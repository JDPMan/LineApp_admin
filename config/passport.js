var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var crypto = require('crypto');

module.exports = function (passport) {

    // Configure the local strategy for use by Passport.
    //
    // The local strategy require a `verify` function which receives the credentials
    // (`username` and `password`) submitted by the user.  The function must verify
    // that the password is correct and then invoke `cb` with a user object, which
    // will be set at `req.user` in route handlers after authentication.
    passport.use(new LocalStrategy(
        function (userName, password, cb) {
            dbClient.collection('admins').find({ userName: userName }).toArray(function (err, user) {
                // db.users.findByUsername(username, function (err, user) {
                if (err) { return cb(err); }
                if (!user) { return cb(null, false); }
                
                if (!validPassword(password, user[0].password)) { return cb(null, false); }
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
var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
var validPassword = function (plainPassword, hashedPass) {
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPassword + salt);
    return (hashedPass === validHash);
}