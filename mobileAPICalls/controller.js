var crypto = require('crypto');

// exports.retrieveUsers = function (req, res) {
//     dbClient.collection('users').find({}).toArray(function (err, results) {
//         res.json(results);
//     })
// }
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
        res.json(results);
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