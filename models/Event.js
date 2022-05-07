const {Schema, model} = require('mongoose')

const schema = new Schema({
    name: {
        type: String,
        requred: true
    },
    description: {
        type: String,
        requred: true
    },
    price: {
        type: Number,
        requred: true
    },
    location: {
        type: String,
        required: true,
    },
    arragedBy:{
       type: String,
       required: true,
    },
    time:{
        type: Date,
        required: true,
     },
     image: {
        type: String,
        //required: true,
        required: [true, 'Receipt image required']
    },
    uRole:{
     type: Number,
    },
    uid:{
        type: String,
     },
     public_id: {
        type: String,
       required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    Date : { type : Date, default: Date.now }
})

module.exports = model('Event', schema)