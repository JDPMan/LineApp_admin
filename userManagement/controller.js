var mongo = require('mongodb');
exports.getUsers = function(req,res){
    dbClient.collection('users').find().limit(10).toArray(function(err,users){
        res.render('userManagement',{users:users});
    })
}
exports.createUser = function(req,res){
    var userObj = req.body;
    userObj.dateCreated = new Date();
    dbClient.collection('users').insert(userObj,function(err,result){
        // Add error checking here
        res.status(200).json({success:true})
    })
    
}
exports.deleteUser = function(req,res){
    var userID = mongo.ObjectID(req.body.userID);
    dbClient.collection('users').remove({_id:userID},function(err,result){
        res.status(200).json({success:true})
    })
}
exports.searchUser = function(req,res){
    var searchObj = {};
    if(typeof req.query.firstName !== 'undefined' && req.query.firstName !== "")
        searchObj.firstName = req.query.firstName
    if (typeof req.query.lastName !== 'undefined' && req.query.lastName !== "")
        searchObj.lastName = req.query.lastName
    dbClient.collection('users').find(searchObj).toArray(function(err,users){
        res.status(200).json({users:users,success:true})
    })
}