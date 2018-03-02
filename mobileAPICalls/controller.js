var crypto = require('crypto');
var mongo = require('mongodb');

exports.validateLineManager = function(req,res){
    var userName = req.query.userName;
    var password = req.query.password;
    
    dbClient.collection('lineManagers').find({userName:userName}).toArray(function(err,result){
        if (result.length > 0 && validPassword(password, result[0].password)){
            res.json({success:true,message:""})
        }else{
            res.json({success:false,message:"Invalid Username or Password"})
        }
    })
}
exports.retrieveList = function(req,res){
    var collection = req.query.type;
    dbClient.collection(collection).find({}).limit(20).toArray(function(err,results){
        // setTimeout(function () {
            res.json(results);
        // },3000)
    })
}
exports.attemptLineAccess = function(req,res){
    // Add fingerprint validation here
    var lineID = mongo.ObjectID(req.query.lineID);
    var recipientID = mongo.ObjectID(req.query.recipientID);
    dbClient.collection('lines').findOneAndUpdate({_id: lineID},{$inc: {currentCapacity:-1}},{returnOriginal:false},function(err,line){
        dbClient.collection('recipients').find({_id: recipientID}).toArray(function(err,recipient){
            // Add Error Checking
            logRecipientAction(recipient[0],line.value,function(){
                res.json({success:true,line:line.value})
            })
        })
    })
}
exports.retrieveRecipientActions = function(req,res){
    var recipientID = req.query.recipientID
    dbClient.collection('recipientActions').find({recipientID:recipientID}).toArray(function(err,result){
        return res.json({success:true,recipientActions:result[0]})
    })
}

function logRecipientAction(recipient,line,callback){
    var actionDate = new Date();
    var query = {recipientID: recipient._id.toString()};
    var sort = {};
    var update = {
        $push: {
            actions: {
                lineID: line._id.toString(),
                date: actionDate,
                resource: line.resource,
                numTaken: 1 // Add family member access here
                // Add more items to track here for each transaction
            }
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
        return callback();
    })
}









var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
var validPassword = function (plainPassword, hashedPass) {
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPassword + salt);
    return (hashedPass === validHash);
}