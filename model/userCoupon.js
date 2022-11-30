const {ObjectID} = require('bson');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userCouponSchema = new Schema({
    userId: {
        type: ObjectID
    },
    couponId : {
        type: ObjectID
    },
    couponName: {
        type: String,
        required: true
    },
    users: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    requiredAmount: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        expires: '1m',
        default: Date.now
    }
})


const UserCouponModel = mongoose.model('UserCoupons', userCouponSchema);



module.exports = UserCouponModel;
