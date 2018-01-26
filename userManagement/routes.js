var userServices = require('./controller');

module.exports = function (app) {
    app.get('/userManagement',userServices.getUsers)
    app.post('/createUser',userServices.createUser);
    app.post('/deleteUser',userServices.deleteUser);
    app.get('/searchUser',userServices.searchUser);
}