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
        isMobilePhone: {
            options: ['en-IN'],
            errorMessage: 'Must provide a valid India phone number.'
          },
    },
    occasion:{
       type: String,
       required: true,
    },
    familyMembers:{
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
    public_id: {
        type: String,
       required: true,
    },
    Date : { type : Date, default: Date.now }
    
})

module.exports = model('Receipt', schema)