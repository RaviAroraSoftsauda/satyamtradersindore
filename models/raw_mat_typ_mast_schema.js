let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let rawmattypSchema = mongoose.Schema({
    
    type_descr: {
        type: String,
    },
    type_Code: {
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
let raw_mat_typ_mast = module.exports = mongoose.model('raw_mat_typ_mast', rawmattypSchema);