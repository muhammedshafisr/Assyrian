const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchmea = new Schema ({

    userId : {
        type : String,
        required : true
    },
    products : [
        {
        productId : {
            type : ObjectId,
            required : true
        }
    }      
    ]
}, { timestamps : true })


const wishlistModel = mongoose.model('wishlist', wishlistSchmea);



module.exports = wishlistModel