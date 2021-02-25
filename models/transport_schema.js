let mongoose = require('mongoose');

// Brand Schema
let transportSchema = mongoose.Schema({
    transport_name: {
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
let transport = module.exports = mongoose.model('transport', transportSchema);