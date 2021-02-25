let mongoose = require('mongoose');

// Brand Schema
let groupSchema = mongoose.Schema({
    group_name: {
        type: String,
        required: true
    },
    co_code:{
        type:String,
    },
    div_code:{
        type:String,
    },
    usrnm:{
        type:String,
    },
    masterid:{
        type:String,
    },
});
let group = module.exports = mongoose.model('group', groupSchema);