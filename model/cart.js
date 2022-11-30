const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema ({

    userId : {
        type : String,
        required : true
    },
    products : [
        {
        productId : {
            type : ObjectId,
            required : true
        },
    quantity : {
        type : Number,
        require : true
    }
    }       
    ]
}, { timestamps : true })

const cartModel = mongoose.model('cart', cartSchema);



module.exports = cartModel;