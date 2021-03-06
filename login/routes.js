var Strategy = require('passport-local').Strategy;
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
module.exports = function(app, passport){
    app.get('/login',
        function (req, res) {
            res.render('login');
        });

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login' }),
        function (req, res) {
            res.redirect('/');
        });
        
    app.get('/logout',
        function (req, res) {
            req.logout();
            res.redirect('/');
        });
    app.all('/*', ensureLoggedIn('/login'));
}