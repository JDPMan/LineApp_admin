var mongo = require('mongodb');
var countries = require('country-data').countries;
var crypto = require('crypto');

var permissionTypes = require('../Data/permissionTypes')

exports.submitRecipient = function(req,res){
    var recipientObj = {};
    for (key in req.body) {
        var splitKey = key.split('-');
        if (splitKey.length > 1) { // Family Members
            if (typeof recipientObj.familyMembers === 'undefined')
                recipientObj.familyMembers = [];
            if (typeof recipientObj.familyMembers[splitKey[0]] === 'undefined')
                recipientObj.familyMembers[splitKey[0]] = {};
            recipientObj.familyMembers[splitKey[0]][splitKey[1]] = req.body[key];
        } else { // Everything else
            if(key === 'dateOfBirth' && req.body[key] !== "")
                recipientObj[key] = new Date(req.body[key]);
            else if(key === 'password'){
                encryptPassword = true;
            }
            else
                recipientObj[key] = req.body[key];
        }
    }
    if(typeof recipientObj.familyMembers === 'undefined')
        recipientObj.familyMembers = [];
    
    recipientObj.dateCreated = new Date();
    dbClient.collection('recipients').insert(recipientObj, function (err, result) {
        // Add error checking here
        res.status(200).json({ success: true, recipient: result.ops[0]})
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
        dbClient.collection('admins').save(adminObj, function (err, result) {
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
exports.submitLine = function (req, res) {
    var lineObj = req.body
    lineObj.dateCreated = new Date();
    // lineObj.capacity = parseInt(lineObj.capacity) || 0;
    // lineObj.currentCapacity = parseInt(lineObj.capacity);
    dbClient.collection('lines').insert(lineObj, function (err, result) {
        // Add error checking here
        res.status(200).json({ success: true, line: result.ops[0] })
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
        "recipients":"Recipient",
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
        dbClient.collection('settings').find({ name: "Admins" }).toArray(function (err, settings) {
            res.render('admin', { admins: results, settings: settings[0], currentlyLoggedIn: req.user})
        })
    })
}
exports.getLineManagers = function (req, res) {
    dbClient.collection('lineManagers').find({}).limit(20).toArray(function (err, results) {
        dbClient.collection('settings').find({ name: "Line Managers" }).toArray(function (err, settings) {
            res.render('lineManager', { lms: results, settings: settings[0], currentlyLoggedIn: req.user })
        })
    })
}
exports.getRecipients = function (req, res) {
    dbClient.collection('recipients').find({}).limit(20).toArray(function (err, results) {
        dbClient.collection('settings').find({name:"Recipients"}).toArray(function(err,settings){
            res.render('recipient', { recipients: results, settings: settings[0], countries: countries.all, currentlyLoggedIn: req.user})
        });
    })
}

exports.getLines = function (req, res) {
    dbClient.collection('lines').find({}).limit(20).toArray(function (err, results) {
        dbClient.collection('settings').find({ name: "Lines" }).toArray(function (err, settings) {
            res.render('line', { lines: results, settings: settings[0], currentlyLoggedIn: req.user })
        })
    })
}

exports.getRecord = function(req,res){
    var id = req.url.split('/');
    id = id[id.length - 1];
    id = id.split('?')[0]
    id = mongo.ObjectId(id);
    var collection = req.query.type + 's';
    dbClient.collection(collection).find({_id:id}).toArray(function(err,result){
        dbClient.collection('settings').find({type:req.query.type}).toArray(function(err,settings){
            // Add error checking
            res.render('editRecord', { record: result[0], countries: countries.all, settings:settings[0], permissionTypes:permissionTypes})
        })
    })
}
exports.saveRecord = function(req,res){
    var record = {};
    if(req.body.type === 'systemUser')
        record.permissions = [];
    for (key in req.body) {
        var splitKey = key.split('-');
        if (splitKey.length > 1) { // Family Members
            if (typeof record.familyMembers === 'undefined')
                record.familyMembers = [];
            if (typeof record.familyMembers[splitKey[0]] === 'undefined')
                record.familyMembers[splitKey[0]] = {};
            record.familyMembers[splitKey[0]][splitKey[1]] = req.body[key];
        } else if(key === 'dateCreated' || key === 'dateOfBirth'){
            record[key] = new Date(req.body[key]);
        }else if(req.body[key] === 'on'){
            if(typeof record.permissions === 'undefined') record.permissions = [];
            record.permissions.push(key)
        }else{
            record[key] = req.body[key];
        }
    }
    var collection = record.type + 's';
    record._id = mongo.ObjectId(record._id)
    dbClient.collection(collection).save(record,function(err,result){
        res.status(200).json({success:true})
    })
}

exports.retrieveRecipients = function(req,res){
    dbClient.collection('recipients').find({}).toArray(function(err,results){
        res.json(results);
    })
}

exports.getSettings = function(req,res){
    dbClient.collection('settings').find({}).toArray(function(err,settings){
        if(settings.length === 0){
            settings = [
                { name: 'Recipients', type: 'recipient', fields: [] },
                { name: 'Line Managers', type: 'lineManager', fields: [] },
                { name: 'Lines', type: 'line', fields: [] },
                { name: 'Admins', type: 'admin', fields: [] },
            ]
        }
        res.render('settings',{settings:settings});
    })
}
exports.saveSettings = function(req,res){
    var settings = req.body.settings;
    var bulk = dbClient.collection('settings').initializeUnorderedBulkOp();
    for(var i = 0; i < settings.length; i++){
        if(typeof settings[i].fields === 'undefined') settings[i].fields = [];
        bulk.find({name:settings[i].name}).upsert().updateOne(settings[i]);
    }
    bulk.execute(function(err,result){
        res.json({success:true});
    });
}
exports.deleteSettings = function(req,res){
    var type = req.body.type
    var fieldToDelete = req.body.name;
    dbClient.collection("settings").update({type:type},{$pull:{fields:fieldToDelete}},function(err,result){
        res.json({success:true})
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










exports.getSystemUsers = function (req, res) {
    dbClient.collection('systemUsers').find({}).limit(20).toArray(function (err, results) {
        dbClient.collection('settings').find({ name: "SystemUsers" }).toArray(function (err, settings) {
            res.render('SystemUsers', { users: results, settings: settings[0], countries: countries.all, currentlyLoggedIn: req.user, permissionTypes: permissionTypes })
        });
    })
}
exports.submitSystemUser = function (req, res) {
    var userObj = {permissions:[]};
    for(key in req.body){
        if(req.body[key] === "on")
            userObj.permissions.push(key);
        else
            userObj[key] = req.body[key];
    }
    saltAndHash(userObj.password, function (hash) {
        userObj.password = hash;

        userObj.dateCreated = new Date();
        dbClient.collection('systemUsers').insert(userObj, function (err, result) {
            // Add error checking here
            res.status(200).json({ success: true, user: result.ops[0] })
        })
    })
}