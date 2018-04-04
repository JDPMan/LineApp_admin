var userServices = require('./controller');

module.exports = function (app) {
    app.post('/userManagement/submitRecipient',userServices.submitRecipient);
    app.post('/userManagement/submitAdmin', userServices.submitAdmin);
    app.post('/userManagement/submitLM', userServices.submitLM);
    app.post('/userManagement/submitLine',userServices.submitLine);
    app.post('/userManagement/deleteRecord', userServices.deleteRecord);

    app.get('/userManagement/search',userServices.search)


    app.get('/userManagement/admins',userServices.getAdmins);
    app.get('/userManagement/lineManagers', userServices.getLineManagers);
    app.get('/userManagement/recipients', userServices.getRecipients);
    app.get('/userManagement/lines',userServices.getLines);

    app.get('/userManagement/editRecord/*',userServices.getRecord);
    app.post('/userManagement/saveRecord',userServices.saveRecord);

    app.get('/userManagement/settings', userServices.getSettings);
    app.post('/userManagement/saveSettings', userServices.saveSettings);
    app.post('/userManagement/deleteSettings',userServices.deleteSettings);
}