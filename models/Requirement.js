const {Schema, model} = require('mongoose')

const schema = new Schema({
    /*--------For Product-------------*/
    productName: {
        type: String,
    },
    productQuantity: {
        type: Number,
    },
    productColor: {
        type: String,
    },
    budget: {
        type: String,
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

module.exports = model('Requirement', schema)