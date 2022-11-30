const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema ({

    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    userStatus : {
        type : String
    },
    image : {
        type : String
    },
    address : {}
    
}, { timestamps : true });


// fire a function before doc saved to the db
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login user
// userSchema.static.login = async function (email, password) {
//     const user = await this.findOne({email});
//     if (user) {
//         const auth = await bcrypt.compare(password, user.password);
//         if (auth) {
//             return user;
//         }
//         throw Error('incorrect password')
//     }
//     throw Error('incorrect email')
// }


const Users = mongoose.model('Users', userSchema);



module.exports = Users;