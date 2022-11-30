const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productsSchema = new Schema ({

    productName : {
        type : String,
        required : true,
        index : true
    },
    category : {
        type : String,
        required : true,
        index : true
    },
    sleeve : {
        type : String
    },
    fabric : {
        type : String,
        required : true
    },
    idealFor : {
        type : String,
        required : true
    },
    size : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    packOf : {
        type : String,
        required : true
    },
    imageOne : {
        type : String,
        required : true
    },
    imageTwo : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    discount : {
        type : Number
    },
    status : {
        type : String
    }
    
}, { timestamps : true });


productsSchema.index({ productName : 'text', category : 'text' })
const Products = mongoose.model('Products', productsSchema);


module.exports = Products;