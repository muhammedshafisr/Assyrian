const mongoose = require ('mongoose');
const Schema = mongoose.Schema;


const thingSchema = new Schema(
    {},
    { strict: false });




const Admin = mongoose.model('admins', thingSchema);

module.exports = Admin
