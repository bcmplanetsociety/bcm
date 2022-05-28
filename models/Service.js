const {Schema, model} = require('mongoose')

const schema = new Schema({
    serviceName: {
        type: String,
    },
    address:{
        type: String,
    },
    phone:{
        type: Number,
    },
    description:{
        type: String,
    },
    uid:{
        type: String,
     },
     username:{
        type: String,
     },
    completed: {
        type: Boolean,
        default: false
    },
    Date : { type : Date, default: Date.now }
})

module.exports = model('Service', schema)