var mongoose = require('mongoose');

// User Schema
var UserProfileSchema = mongoose.Schema({
    username: {
        type: String,
        index:true
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    role: {
        type: Number,
    },
    profile_img:{
        type: String,
    },
    address:{
        type: String,
    },
    phone:{
        type: Number,
    },
    uid:{
        type: String,  
    },
    public_id: {
        type: String,
       required: true,
    },
    Date : { type : Date, default: Date.now }
});

var UserProfile = module.exports = mongoose.model('UserProfile', UserProfileSchema);