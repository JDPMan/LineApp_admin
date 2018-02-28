var userServices = require('./controller');

module.exports = function (app) {
    // app.get('/userManagement/addUser',userServices.newUser);
    // app.post('/createUser',userServices.createUser);
    // app.post('/deleteUser',userServices.deleteUser);
    // app.get('/userManagement/searchUsers',function(req,res){
    //     res.render('searchUsers')
    // })
    // app.get('/searchUser',userServices.searchUser);

    app.post('/userManagement/submitUser',userServices.submitUser);
    app.post('/userManagement/submitAdmin', userServices.submitAdmin);
    app.post('/userManagement/submitLM', userServices.submitLM);
    app.post('/userManagement/submitLine',userServices.submitLine);
    app.post('/userManagement/deleteRecord', userServices.deleteRecord);

    app.get('/userManagement/search',userServices.search)


    app.get('/userManagement/admins',userServices.getAdmins);
    app.get('/userManagement/lineManagers', userServices.getLineManagers);
    app.get('/userManagement/users', userServices.getUsers);
    app.get('/userManagement/lines',userServices.getLines);

    app.get('/userManagement/editRecord/*',userServices.getRecord);
    app.post('/userManagement/saveRecord',userServices.saveRecord);
}