var mongoose = require('mongoose');

// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index:true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    role: {
        type: Number,
        default: 2
    },
    Date : { type : Date, default: Date.now }
});

var User = module.exports = mongoose.model('User', UserSchema);
