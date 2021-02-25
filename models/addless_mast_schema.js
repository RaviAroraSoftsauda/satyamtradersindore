let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let addlessmastschema = mongoose.Schema({
    
    type_descr: {
        type: String,
    },
    addlesstype: {
        type: String,
    },
    sales_posting_ac:{
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    pur_posting_ac:{
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    SR_posting_ac:{
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    PR_posting_ac:{
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    Parameter_posting:{
        type: String
    },
    del:{
        type: String
    },
    entrydate:{
        type: String
    },
    delete:{
        type: String
    },
    update:{
        type: String
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
let addlessmast = module.exports = mongoose.model('addless_mast', addlessmastschema);