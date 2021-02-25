let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let rawMaterialSchema = mongoose.Schema({
    
    type_descr: {
        type: Schema.Types.ObjectId, ref:'raw_mat_typ_mast',
    },
    sub_descr: {
        type: Schema.Types.ObjectId, ref:'raw_mat_sub_typ_mast',
    },
    descr_rm: {
        type: String,
    },
     manufact:{
        type: Schema.Types.ObjectId, ref:'acmast',
     },
    min_stk: {
        type: Number,
    },
    max_stack: {
        type: Number,
    },

    qty_opening: {
        type: String,
    },
    lead_time: {
        type: Number,
    },
    sku_name: {
        type: Schema.Types.ObjectId, ref:'stock_unit_mast',
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
let raw_material_mast= module.exports = mongoose.model('raw_material_mast',rawMaterialSchema);