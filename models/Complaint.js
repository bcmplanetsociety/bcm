const {Schema, model} = require('mongoose')

const schema = new Schema({
    name: {
        type: String,
        requred: true
    },
    phone: {
        type: String,
        requred: true
    },
    profession: {
        type: String,
        required: true,
    },
    uid:{
        type: String,
     },
    completed: {
        type: Boolean,
        default: false
    },
    Date : { type : Date, default: Date.now }
})

module.exports = model('Complaint', schema)