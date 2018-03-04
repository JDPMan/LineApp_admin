var APIServices = require('./controller');

module.exports = function (app, passport) {
    app.get('/mobileAPI/validateLineManager',APIServices.validateLineManager);
    app.get('/mobileAPI/retrieveList',APIServices.retrieveList);
    app.post('/mobileAPI/attemptLineAccess',APIServices.attemptLineAccess);
    app.get('/mobileAPI/retrieveRecipientActions',APIServices.retrieveRecipientActions)
    app.post('/mobileAPI/saveRecord',APIServices.saveRecord)
}