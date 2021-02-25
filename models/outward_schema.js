let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var outchallangroup = new Schema({ 
    out_item_no:  Number ,
    out_item_name :  {
        type: Schema.Types.ObjectId, ref:'product_mast',
    },
   
    outin_qty  :  Number,
    ocrate :  Number ,
    ocor_qty : Number,
    ocdiscount :   Number ,
    octotal_amount :   Number ,
    
    id :Schema.Types.ObjectId });

let OutwardSchema = mongoose.Schema({
    outchallan_no: {
        type: String,
    },
    vouc_code: {
        type: Number,
    },
    out_challandt: {
        type: Date,
    },
    out_challandtmilisecond: {
        type: Number,
    },
    so_no: {
        type: String,
    },
    out_cus_name :
    {
        type: Schema.Types.ObjectId, ref:'acmast',
    },
    out_rmks: {
        type: String,
    },
    
    out_pono: {
        type: String,
    },
    out_podt: {
        type: Date,
    },
    out_podtmilisecond: {
        type: Number,
    },
    tot_oqoc: {
        type: Number,
    },
    tot_ocamt: {
        type: Number,
    },
    tot_amt: {
        type: Number,
    },
    out_remarks: {
        type: String,
    },
    totainword: {
        type: String,
    },
    ///deal entry app
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
    out_challan_group:[outchallangroup], 

});

let Outwards = module.exports = mongoose.model('Outwards', OutwardSchema);


