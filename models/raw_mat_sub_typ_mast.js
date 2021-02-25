let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let rawmatsubtypSchema = mongoose.Schema({
    
    sub_descr: {
        type: String,
    },
    sub_Code: {
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
let raw_mat_sub_typ_mast = module.exports = mongoose.model('raw_mat_sub_typ_mast',rawmatsubtypSchema);