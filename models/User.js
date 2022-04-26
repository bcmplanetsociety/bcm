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
    profile_img:{
        type: String,
        default: "https://i.ibb.co/CskQ1h8/profile1.png",
        //default: "https://i.ibb.co/pyYyC4B/profile2.png"
    },
    
    Date : { type : Date, default: Date.now }
});

var User = module.exports = mongoose.model('User', UserSchema);
