var APIServices = require('./controller');

module.exports = function (app, passport) {
    app.get('/mobileAPI/login',APIServices.login);
    app.get('/mobileAPI/retrieveList',APIServices.retrieveList);
    // app.post('/mobileAPI/attemptLineAccess',APIServices.attemptLineAccess);
    app.get('/mobileAPI/retrieveRecipientActions',APIServices.retrieveRecipientActions);
    app.post('/mobileAPI/saveRecord',APIServices.saveRecord);
    app.post('/mobileAPI/saveRecipient',APIServices.saveRecipient);
    app.get('/mobileAPI/retrieveSettings',APIServices.retrieveSettings);
    app.get('/mobileAPI/searchRecipient',APIServices.searchRecipient);
    app.post('/mobileAPI/uploadQueue',APIServices.uploadQueue);
    app.get('/mobileAPI/validateAndRetrieveLastAction',APIServices.validateAndRetrieveLastAction);
    app.post('/mobileAPI/logAction',APIServices.logAction);
    app.get('/mobileAPI/getPermissionTypes',APIServices.getPermissionTypes);
}