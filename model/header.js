const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const headerSchema = new Schema({

    slider1 : {
        backgroundImage: {
            type: String,
            required: true
        },
        smallTextImage: {
            type: String,
            required: true
        },
        headImage: {
            type: String,
            required: true
        },
        titleOne: {
            type: String,
            required: true
        },
        titleTwo: {
            type: String,
            required: true
        },
        titleThree: {
            type: String,
            required: true
        },
        titleFour : {
            type: String,
            required: true
        }
    },
    slider2 : {
        backgroundImage : {
            type : String,
            required : true
        },
        smallTextImage : {
            type : String,
            required : true
        },
        headImage : {
            type : String,
            required : true
        },
        titleOne : {
            type : String,
            required : true
        },
        titleTwo : {
            type : String,
            required : true
        },
        titleThree : {
            type : String,
            required : true
        },
        titleFour : {
            type: String,
            required: true
        }
    }

})


const headerModel = mongoose.model('header', headerSchema);


module.exports = headerModel;
