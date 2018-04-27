var crypto = require('crypto');
var mongo = require('mongodb');
var moment = require('moment');

var permissionTypes = require('../Data/permissionTypes')

exports.login = function(req,res){
    var userName = req.query.userName;
    var password = req.query.password;
    
    dbClient.collection('systemUsers').find({userName:userName}).toArray(function(err,user){
        if(user.length > 0 && validPassword(password, user[0].password)){
            res.json({success:true, loggedIn: user[0], message:""})
        }else{
            res.json({success:false,message:"Invalid Username or Password"})
        }
    })
}
exports.retrieveList = function(req,res){
    var collection = req.query.type;
    var limit = parseInt(req.query.limit) || 20;
    dbClient.collection(collection).find({}).limit(limit).toArray(function(err,results){
        res.json(results);
    })
}
exports.getPermissionTypes = function(req,res){
    res.json({success:true,permissionTypes:permissionTypes});
}
exports.validateAndRetrieveLastAction = function(req,res){
    // if no fingerprint found
        // return res.json({success:false, type: 'credentialsNotFound', recipient: {}})

        
    var lineID = req.query.lineID;
    var recipientID = req.query.recipientID;
    var pipeline = [];
    pipeline.push({
        $match: {
            recipientID: recipientID
        }
    })
    pipeline.push({
        $unwind: "$actions"
    })
    pipeline.push({
        $match:{
            "actions.lineID": lineID
        }
    })
    pipeline.push({
        $group:{
            _id: lineID,
            lastAccess: {$max: '$actions.date'}
        }
    })
    dbClient.collection('recipients').find({_id: mongo.ObjectId(recipientID)}).toArray(function(err,recipient){
        dbClient.collection('recipientActions').aggregate(pipeline).toArray(function (err, lastAction) {
            if (lastAction.length === 0) {
                return res.json({ success: true, type: 'firstAccess', lastAccess:null, recipient: recipient[0]})
            }else{
                return res.json({success:true, recipient:recipient[0], lastAccess:lastAction[0].lastAccess})
            }
        })
    })
}
exports.logAction = function(req,res){
    var lineID = req.query.lineID;
    var lineName = req.query.lineName;
    var recipientID = req.query.recipientID;
    var resource = req.query.resource;

    var actionDate = new Date()


    // function logRecipientAction(recipient, line, callback) {
        // var actionDate = moment().toDate()
    var query = { recipientID: recipientID };
    var sort = {};
    var actionObj = {
        lineID: lineID,
        lineName: lineName,
        date: actionDate,
        resource: resource,
        // numTaken: 1 // Add family member access here
        // Add more items to track here for each transaction
    }
    var update = {
        $push: {
            actions: actionObj
        },
        $min: { // Only update if the item's date is less than then previously stored date
            "firstAction": actionDate
        },
        $max: { // Only update if the item's date is greater than the previously stored date
            "lastAction": actionDate
        }
    };
    var options = { upsert: true, new: true };
    dbClient.collection('recipientActions').findAndModify(query, sort, update, options, function (err, result) {
        return res.json({success:true})
    })
}
// exports.attemptLineAccess = function(req,res){
//     // Add fingerprint validation here
//     // if no fingerprint found
//         // return res.json({success:false, type: 'credentialsNotFound', recipient: {}})
//     var lineID = req.query.lineID;
//     var recipientID = req.query.recipientID;
//     // var accessFrequency = parseFloat(req.query.accessFrequency);
//     // var accessLowerBound = moment().subtract(accessFrequency,'hours').toDate();
    
//     // Check user records
//     var searchObj = {
//         recipientID: recipientID,
//         actions: {
//             $elemMatch: {
//                 lineID: lineID,
//                 date: {
//                     $gte: accessLowerBound
//                 }
//             }
//         }
//     }
//     dbClient.collection('recipientActions').find(searchObj).toArray(function(err,recipientActions){
//         if(recipientActions.length === 0){
//             return res.json({success:false, type: 'credentialsNotFound', recipient: {}})
//         }


//         // if(result.length > 0){
//             // var recipientActions = result[0];
//             // var accessFault;
//             // var actions = recipient.actions.sort(function(a,b){return a.date < b.date})
//             // for(var i = 0; i < recipient.actions.length; i++){
//             //     if(recipient.actions[i].date > accessLowerBound && recipient.actions[i].lineID === lineID)
//             //         accessFault = recipient.actions[i];
//             // }
//             // Do we want to log when a recipient makes a fault?
//             // return dbClient.collection('recipients').find({ _id: mongo.ObjectID(recipientID) }).toArray(function (err1, recipient) {
//             //     return res.json({success:false, type: 'faultyAccess', accessFault: accessFault, recipient: recipient[0]})
//             // })
//         // }
//         dbClient.collection('lines').find({ _id: mongo.ObjectID(lineID) }).toArray(function (err2, line) {
//         // dbClient.collection('lines').findOneAndUpdate({ _id: mongo.ObjectID(lineID)},{$inc: {currentCapacity:-1}},{returnOriginal:false},function(err2,line){
//             dbClient.collection('recipients').find({_id: mongo.ObjectID(recipientID)}).toArray(function(err3,recipient){
//                 // Add Error Checking
//                 recipient = recipient[0];
//                 line = line[0]
//                 logRecipientAction(recipient,line,function(lastActionDate){
//                     return res.json({success:true,line:line, lastAccess:lastActionDate, lastAction: recipientActions[0], recipient: recipient})
//                 })
//             });
//         })
//     })
// }
exports.retrieveSettings = function(req,res){
    var type = req.query.type;
    dbClient.collection('settings').find({type:type}).toArray(function(err,settings){
        res.json({success:true,settings:settings[0]})
    })
}
// // "adminRoute":"http://lineappadmin-lineappadmin.193b.starter-ca-central-1.openshiftapps.com"
exports.retrieveRecipientActions = function(req,res){
    var recipientID = req.query.recipientID
    dbClient.collection('recipientActions').find({recipientID:recipientID}).toArray(function(err,result){
        if(result.length > 0)
            return res.json({success:true,recipientActions:result[0]})
        else
            return res.json({success:false, message:'No Recipient Actions To Show'})
    })
}
exports.searchRecipient = function(req,res){
    var recipientID = mongo.ObjectID(req.query.recipientID);
    dbClient.collection('recipients').find(recipientID).toArray(function(err,result){
        if(result.length !== 0)
            res.json({success:true, recipient: result[0]})
        else
            res.json({success:false, errorMessage: 'Recipient could not be found. Please try again.'})
    })
}
exports.uploadQueue = function(req,res){
    var queue = JSON.parse(req.query.queue);
    if(queue === null || queue.length < 1)
        return res.json({success:true})
    var bulk = dbClient.collection('recipientActions').initializeUnorderedBulkOp();
    for (var i = 0; i < queue.length; i++) {
        var actionObj = {
            lineID: queue[i].lineID,
            lineName: queue[i].lineName,
            date: moment(queue[i].date).toDate(),
            resource: queue[i].resource,
            numTaken: 1 // Add family member access here
            // Add more items to track here for each transaction
        }
        var update = {
            $push: {
                actions: actionObj
            },
            $min: {
                "firstAction":moment(queue[i].date).toDate()
            },
            $max: {
                "lastAction":moment(queue[i].date).toDate()
            }
        }
        bulk.find({ recipientID: queue[i].recipientID }).upsert().updateOne(update);
    }
    bulk.execute(function (err, result) {
        if(err)
            return res.json({success:false})
        res.json({ success: true });
    });
}

// function logRecipientAction(recipient,line,callback){
//     var actionDate = moment().toDate()
//     var query = {recipientID: recipient._id.toString()};
//     var sort = {};
//     var actionObj = {
//         lineID: line._id.toString(),
//         lineName: line.name,
//         date: actionDate,
//         resource: line.resource,
//         numTaken: 1 // Add family member access here
//         // Add more items to track here for each transaction
//     }
//     var update = {
//         $push: {
//             actions: actionObj
//         },
//         $min: { // Only update if the item's date is less than then previously stored date
//             "firstAction": actionDate
//         },
//         $max: { // Only update if the item's date is greater than the previously stored date
//             "lastAction": actionDate
//         }
//     };
//     var options = { upsert: true, new: true };
//     dbClient.collection('recipientActions').findAndModify(query, sort, update, options,function(err,result){
//         return callback(actionDate);
//     })
// }
exports.saveRecipient = function(req,res){
    var record = JSON.parse(req.query.data);
    record.type = 'recipient';
    record.dateOfBirth = new Date(record.dateOfBirth);
    record.country = record.country.name;
    for(var i = 0; i < record.familyMembers.length; i++){
        record.familyMembers[i].dateOfBirth = new Date(record.familyMembers[i].dateOfBirth)
        record.familyMembers[i].country = record.familyMembers[i].country.name;
    }
    record.dateCreated = new Date();
    dbClient.collection('recipients').insert(record,function(err,result){
        res.json({success:true})
    })
}
exports.saveRecord = function(req,res){
    var record = JSON.parse(req.query.data)
    record.dateCreated = new Date(record.dateCreated)
    var recordID = mongo.ObjectID(record._id);
    delete record._id;
    var saveObj;
    if(record.type === 'line')
        saveObj = generateLineObj(record);
    else if(record.type === 'recipient')
        saveObj = generateRecipientObj;
    else
        saveObj = generateAdminLMObj(record);
    var collection = record.type + 's';
    dbClient.collection(collection).findOneAndUpdate({ _id: recordID }, { $set: saveObj }, { returnOriginal: false }, function (err, record) {
        res.json({success:true,record:record.value})
    })
}

exports.searchFMD = function(req,res){
    var fmd = req.query.fmd;
    dbClient.collection('recipients').find({fmd:fmd}).toArray(function(err,results){
        if(results.length > 0){
            res.json({fmdFound:true, recipient: results[0]})
        }else{
            res.json({fmdFound:false})
        }
    })
}


generateLineObj = function(lineObj){
    // lineObj.currentCapacity = parseInt(lineObj.currentCapacity);
    // lineObj.capacity = parseInt(lineObj.capacity);
    return lineObj
}
generateAdminLMObj = function(obj){
    return obj;
}
generateRecipientObj = function(recipientObj){

}









var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
var validPassword = function (plainPassword, hashedPass) {
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPassword + salt);
    return (hashedPass === validHash);
}