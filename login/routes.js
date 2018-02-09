var Strategy = require('passport-local').Strategy;

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
    // app.get('/profile',
    //     require('connect-ensure-login').ensureLoggedIn(),
    //     function (req, res) {
    //         res.render('profile', { user: req.user });
    //     });
}