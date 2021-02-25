let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let ptypeSchema = mongoose.Schema({
    
    ptype_descr: {
        type: String,
    },
    ptype_Code: {
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
let party_type_schema = module.exports = mongoose.model('party_type_schema', ptypeSchema);