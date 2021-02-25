let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Product_mast_group = new Schema({ 
    raw_matrl_nm :{
        type: Schema.Types.ObjectId, ref:'raw_material_mast',
    }, 
    qty_pcs  :  String ,
    pck_unit  :  String ,
    sku  : {
        type: Schema.Types.ObjectId, ref:'stock_unit_mast',
    }, 
    price  :  String ,
   id : Schema.Types.ObjectId  });
let productmastSchema = mongoose.Schema({
    p_code:{
        type:String,
    },
    prdt_desc:{
        type:String,
    },
    p_pck:{
        type:String,
    },
    prdtdiv_code:[{
        type: Schema.Types.ObjectId, ref:'div_mast',
    }],
    p_crtn:{
        type:String,
    },
  
    si_price:{
        type:String,
    },
    gst_rate:{
        type:String,
    },
    sku_name: {
        type: Schema.Types.ObjectId, ref:'stock_unit_mast',
},
    mrp_pcs:{
        type:String,
    },
 
    rp_box:{
        type:String,
    },
    export_price:{
        type:String,
    },
    cbm_length:{
        type:Number,
    },
    cbm_width:{
        type:Number,
    },
    cbm_height:{
        type:Number,
    },
    shelf_life:{
        type:String,
    },
    per_pcs_wght:{
        type:Number,
    },
    gross_diff:{
        type:String,
    },
    slife_exp:{
        type:String,
    },
    tot_bpc:{
        type:Number,
    },
    filepath: {
        type: String,
    },
    filename: {
        type: String
    },
    hsn_code: {
        type: String
    },
    product_mast_group: [Product_mast_group], 
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
let product_mast = module.exports = mongoose.model('product_mast', productmastSchema);