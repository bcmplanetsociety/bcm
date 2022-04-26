const {Schema, model} = require('mongoose')

const schema = new Schema({
    fullName: {
        type: String,
        requred: true
    },
    address: {
        type: String,
        requred: true
    },
    amount: {
        type: Number,
        requred: true
    },
    image: {
        type: String,
        //required: true,
        required: [true, 'Receipt image required']
    },
    phone: {
        type: Number,
        required: true,
    },
    occasion:{
       type: String,
       required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    public_id: {
        type: String,
       required: true,
    }
    
})

module.exports = model('Receipt', schema)