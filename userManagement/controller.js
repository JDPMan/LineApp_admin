var mongo = require('mongodb');
var countries = require('country-data').countries;
var crypto = require('crypto');

// exports.newUser = function(req,res){
//     res.render('newUser',{countries:countries.all});
// }

exports.submitUser = function(req,res){
    var userObj = {};
    var collection = '';
    var encryptPassword = false;
    for (key in req.body) {
        var splitKey = key.split('-');
        if (splitKey.length > 1) { // Family Members
            if (typeof userObj.familyMembers === 'undefined')
                userObj.familyMembers = [];
            if (typeof userObj.familyMembers[splitKey[0]] === 'undefined')
                userObj.familyMembers[splitKey[0]] = {};
            userObj.familyMembers[splitKey[0]][splitKey[1]] = req.body[key];
        } else { // Everything else
            if(key === 'type')
                collection = req.body[key]
            else if(key === 'dateOfBirth')
                userObj[key] = new Date(req.body[key]);
            else if(key === 'password'){
                encryptPassword = true;
            }
            else
                userObj[key] = req.body[key];
        }
    }
    if(encryptPassword){
        userObj.password = saltAndHash(req.body.password,function(){

        })
    }
    
    userObj.dateCreated = new Date();
    dbClient.collection(collection).insert(userObj, function (err, result) {
        // Add error checking here
        res.status(200).json({ success: true, user: result.ops[0]})
    })
}
exports.submitAdmin = function (req, res) {
    var adminObj = {};
    for (key in req.body) {
        if (key === 'password')
            continue;
        else
            adminObj[key] = req.body[key];
    }
    saltAndHash(req.body.password, function (hash) {
        adminObj.password = hash;

        adminObj.dateCreated = new Date();
        dbClient.collection('admins').insert(adminObj, function (err, result) {
            // Add error checking here
            res.status(200).json({ success: true, admin: result.ops[0] })
        })
    })
}
exports.submitLM = function (req, res) {
    var lmObj = req.body
    saltAndHash(req.body.password, function (hash) {
        lmObj.password = hash;

        lmObj.dateCreated = new Date();
        dbClient.collection('lineManagers').insert(lmObj, function (err, result) {
            // Add error checking here
            res.status(200).json({ success: true, lm: result.ops[0] })
        })
    })
}

exports.deleteRecord = function(req,res){
    var _id = mongo.ObjectID(req.body._id);
    var collection = req.body.collection;
    dbClient.collection(collection).remove({_id:_id},function(err,result){
        // Add error checking here
        res.status(200).json({success:true})
    })
}
exports.search = function(req,res){
    var searchObj = {};
    var collection;
    var typeReference = {
        "users":"User",
        "admins":"Admin",
        "lineManagers":"Line Managers"
    }
    if (typeof req.query.type !== 'undefined' && req.query.type !== ""){
        collection = req.query.type
    }else
        return res.status(200).json({success:false, message: "Please Select a Type"})

    if(typeof req.query.firstName !== 'undefined' && req.query.firstName !== "")
        searchObj.firstName = req.query.firstName
    if (typeof req.query.lastName !== 'undefined' && req.query.lastName !== "")
        searchObj.lastName = req.query.lastName
    if (typeof req.query.userID !== 'undefined' && req.query.userID !== "")
        req.query._id = req.query.userID
    dbClient.collection(collection).find(searchObj).toArray(function (err, results) {
        res.render('searchResults', { results: results, type: typeReference[collection] , collection: collection});
    })
}

exports.getAdmins = function(req,res){
    dbClient.collection('admins').find({}).limit(20).toArray(function(err,results){
        res.render('admin', { admins: results, user: req.user})
    })
}
exports.getLineManagers = function (req, res) {
    dbClient.collection('lineManagers').find({}).limit(20).toArray(function (err, results) {
        res.render('lineManager', { lms: results, user: req.user })
    })
}
exports.getUsers = function (req, res) {
    dbClient.collection('users').find({}).limit(20).toArray(function (err, results) {
        res.render('user', { users: results, countries: countries.all, user: req.user})
    })
}

var generateSalt = function () {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function (pass, callback) {
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
}