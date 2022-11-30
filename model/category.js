const mongoose = require('mongoose');
const Schema = mongoose.Schema

const categorySchema = new Schema({
    category: {
        type: String,
        required: true
    }
}, {timestamps: true})


const categoryModel = mongoose.model('categories', categorySchema)

module.exports = categoryModel