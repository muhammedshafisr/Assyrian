const mongoose = require('mongoose');
const Schema = mongoose.Schema

const couponSchema = new Schema ({
    couponName : {
        type : String,
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    requiredAmount : {
        type : Number,
        required : true
    },
    image : {
        type : String,
        required : true
    },
    users : []
}, { timestamps : true })


const couponModel  = mongoose.model('coupons', couponSchema);



module.exports = couponModel;