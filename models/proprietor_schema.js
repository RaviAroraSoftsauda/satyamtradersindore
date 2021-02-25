let mongoose = require('mongoose');

// Brand Schema
let proprietorSchema = mongoose.Schema({
    proprietor_name: {
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
        type:String
    }
});
let proprietor = module.exports = mongoose.model('proprietor', proprietorSchema);