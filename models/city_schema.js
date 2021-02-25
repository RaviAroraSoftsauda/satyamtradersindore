let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let citySchema = mongoose.Schema({
    state_name: {
        type: Schema.Types.ObjectId, ref:'state_master',
    },
    city_name: {
        type: String,
    },
    ctry_name: {
        type: Schema.Types.ObjectId, ref:'country_mast',
    },
    city_code: {
        type: Number,
    },
    city_std_code: {
        type: Number,
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
let city_master = module.exports = mongoose.model('city_master', citySchema);