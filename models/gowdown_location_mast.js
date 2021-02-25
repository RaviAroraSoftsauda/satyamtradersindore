let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let gowdownlocationSchema = mongoose.Schema({
    
    location_name: {
        type: String,
    },
    rack_no: {
        type: String,
    },
    row_no: {
        type: Number,
    },
    qty_cap: {
        type: String,
    },
    remark: {
        type: String,
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
let gowdown_location_mast = module.exports = mongoose.model('gowdown_location_mast',gowdownlocationSchema);