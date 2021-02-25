let mongoose = require('mongoose');

// Brand Schema
let courierSchema = mongoose.Schema({
    courier_name: {
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
let courier = module.exports = mongoose.model('courier', courierSchema);