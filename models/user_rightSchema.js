let mongoose = require('mongoose');
var Schema = mongoose.Schema;

let userSchema = mongoose.Schema({
    
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
        type: [{ type: Schema.Types.ObjectId, ref: 'companySchema' }]
    },
    div_code: {
        type: [{ type: Schema.Types.ObjectId, ref: 'divSchema' }]
    },
    administrator: {
        type: String,
    },
    masterid: {
        type: Schema.Types.ObjectId, ref:'masterSchema',
    }
},{
    collection: 'userSchema'
});
module.exports = mongoose.model('userSchema', userSchema);