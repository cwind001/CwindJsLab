var mongoose = require('mongoose');

// Mongoose Schema definition
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    _id: String,
    name: String,
    age: String,
    status: String,
    groups: [String]
});

// Mongoose Model definition
var User = mongoose.model('users', UserSchema);

// Mongoose connection to MongoDB 
mongoose.connect('mongodb://makingsense:1qaz2wsx@ds037272.mongolab.com:37272/demo', function (error) {
    if (error)return console.log(error); 

    User.find({}, function (err, docs) {
            console.log(docs);
            mongoose.connection.close(function () {
               process.exit(0);
            });
    });   
});