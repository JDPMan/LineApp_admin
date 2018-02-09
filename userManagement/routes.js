var userServices = require('./controller');

module.exports = function (app) {
    app.get('/userManagement/addUser',userServices.newUser);
    app.post('/createUser',userServices.createUser);
    app.post('/deleteUser',userServices.deleteUser);
    app.get('/userManagement/searchUsers',function(req,res){
        res.render('searchUsers')
    })
    app.get('/searchUser',userServices.searchUser);

    app.get('/userManagement/admin',userServices.getAdmins);
}