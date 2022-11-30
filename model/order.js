const { ObjectID } = require('bson');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema ({

    userId : {
        type : String,
        required : true
    },
    deliveryDetails : {
        username : {
            type : String,
            required : true
        },
        phone : {
            type : Number,
            required : true
        },
        locality : {
            type : String,
            required : true
        },
        district : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true
        },
        state : {
            type : String, 
            required : true
        },
        pincode : {
            type : Number,
            required : true
        },
        email : {
            type : String,
            required : true
        },
        paymentMethod : {
            type : String, 
            required : true
        }
    },
        products : {
            
        }
        
}, { timestamps : true })





const orderModel = mongoose.model('orders', orderSchema);



module.exports = orderModel;