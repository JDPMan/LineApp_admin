var crypto = require('crypto');
var mongo = require('mongodb');
var moment = require('moment');

exports.login = function(req,res){
    var userName = req.query.userName;
    var password = req.query.password;
    
    dbClient.collection('lineManagers').find({userName:userName}).toArray(function(err,lm){
        if (lm.length > 0 && validPassword(password, lm[0].password)){
            res.json({success:true, loggedIn: lm[0], message:""})
        }else{
            dbClient.collection('admins').find({userName:userName}).toArray(function(err,admin){
                if(admin.length > 0 && validPassword(password, admin[0].password)){
                    res.json({success:true, loggedIn: admin[0], message:""})
                }else{
                    res.json({success:false,message:"Invalid Username or Password"})
                }
            })
            
        }
    })
}
exports.retrieveList = function(req,res){
    var collection = req.query.type;
    dbClient.collection(collection).find({}).limit(20).toArray(function(err,results){
        res.json(results);
    })
}
exports.attemptLineAccess = function(req,res){
    // Add fingerprint validation here
    // if no fingerprint found
        // return res.json({success:false, type: 'credentialsNotFound', recipient: {}})
    var lineID = req.query.lineID;
    var recipientID = req.query.recipientID;
    var accessFrequency = parseInt(req.query.accessFrequency);
    var accessLowerBound = moment().subtract(accessFrequency,'hours').toDate();
    
    // Check user records
    var searchObj = {
        recipientID: recipientID,
        actions: {
            $elemMatch: {
                lineID: lineID,
                date: {
                    $gte: accessLowerBound
                }
            }
        }
    }
    dbClient.collection('recipientActions').find(searchObj).toArray(function(err,result){
        if(result.length > 0){
            var recipient = result[0];
            var accessFault;
            var actions = recipient.actions.sort(function(a,b){return a.date < b.date})
            for(var i = 0; i < recipient.actions.length; i++){
                if(recipient.actions[i].date > accessLowerBound && recipient.actions[i].lineID === lineID)
                    accessFault = recipient.actions[i];
            }
            // Do we want to log when a recipient makes a fault?
            return dbClient.collection('recipients').find({ _id: mongo.ObjectID(recipientID) }).toArray(function (err1, recipient) {
                return res.json({success:false, type: 'faultyAccess', accessFault: accessFault, recipient: recipient[0]})
            })
        }
        dbClient.collection('lines').findOneAndUpdate({ _id: mongo.ObjectID(lineID)},{$inc: {currentCapacity:-1}},{returnOriginal:false},function(err2,line){
            dbClient.collection('recipients').find({_id: mongo.ObjectID(recipientID)}).toArray(function(err3,recipient){
                // Add Error Checking
                var recipient = recipient[0];
                logRecipientAction(recipient,line.value,function(actionObj){
                    return res.json({success:true,line:line.value, accessSuccess:actionObj, recipient: recipient})
                })
            });
        })
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

function logRecipientAction(recipient,line,callback){
    var actionDate = moment().toDate()
    var query = {recipientID: recipient._id.toString()};
    var sort = {};
    var actionObj = {
        lineID: line._id.toString(),
        lineName: line.name,
        date: actionDate,
        resource: line.resource,
        numTaken: 1 // Add family member access here
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
    dbClient.collection('recipientActions').findAndModify(query, sort, update, options,function(err,result){
        return callback(actionObj);
    })
}
exports.saveRecipient = function(req,res){
    var record = JSON.parse(req.query.data);
    record.type = 'recipient';
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
generateLineObj = function(lineObj){
    lineObj.currentCapacity = parseInt(lineObj.currentCapacity);
    lineObj.capacity = parseInt(lineObj.capacity);
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