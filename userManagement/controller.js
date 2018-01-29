var mongo = require('mongodb');
var countries = require('country-data').countries;

exports.newUser = function(req,res){
    res.render('newUser',{countries:countries.all});
}
exports.createUser = function(req,res){
    var userObj = {};// req.body;
    for(key in req.body){
        var splitKey = key.split('-');
        if(splitKey.length > 1){
            if(typeof userObj.familyMembers === 'undefined')
                userObj.familyMembers = [];
            if (typeof userObj.familyMembers[splitKey[0]] === 'undefined')
                userObj.familyMembers[splitKey[0]] = {};
            userObj.familyMembers[splitKey[0]][splitKey[1]] = req.body[key];
        }else{
            userObj[key] = req.body[key];
        }
    }
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