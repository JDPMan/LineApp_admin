var APIServices = require('./controller');

module.exports = function (app, passport) {
    // app.get('/userManagement/retrieveUsers', userServices.retrieveUsers);
    app.get('/mobileAPI/validateLineManager',APIServices.validateLineManager);
    app.get('/mobileAPI/retrieveList',APIServices.retrieveList);
    app.post('/mobileAPI/attemptLineAccess',APIServices.attemptLineAccess);
}