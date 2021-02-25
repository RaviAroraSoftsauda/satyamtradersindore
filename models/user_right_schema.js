let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let userSchema = mongoose.Schema({
    // sno:{
    //     type: String,
    // },
    usrnm: {
        type: String,
        required: true
    },
    usrpwd: {
        type: String,
        
    },
    emailid: {
        type: String,
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    phone_num: {
        type: String,
    },
    details: {
        type: String,
    },
    admin: {
        type: String,
    },
    co_code: {
        type: String,
    },
    div_code: {
        type: String,
    },
    administrator: {
        type: String,
    },
    masterid: {
        type: Schema.Types.ObjectId, ref:'master_login',
    }
    // superadmin: {
    //     type: String,
    // }
});
let user = module.exports = mongoose.model('user', userSchema);