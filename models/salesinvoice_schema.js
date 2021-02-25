let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var domesalesinvoice = new Schema({ 
    dsi_item_no:  Number ,
    dsi_item_name :  {
        type: Schema.Types.ObjectId, ref:'product_mast',
    },
   
    dsiin_qty  :  Number,
    dsior_qty :  Number ,
    dsirate : Number,
    dsidiscount :   Number ,
    dsitotal_amount :   Number ,
    
    id :Schema.Types.ObjectId });

let DsiSchema = mongoose.Schema({
    salesinvoice_no: {
        type: String,
    },
    vouc_code: {
        type: Number,
    },
    sale_invoicedt: {
        type: Date,
    },
    sale_invoicedtmilisecond: {
        type: Number,
    },
    outchallan_no: {
        type: String,
    },
    dsi_cus_name :
    {
        type: Schema.Types.ObjectId, ref:'acmast',
    },
    dsi_rmks: {
        type: String,
    },
    
    dsi_pono: {
        type: String,
    },
    dsi_podt: {
        type: Date,
    },
    dsi_podtmilisecond: {
        type: Number,
    },
    tot_oqdsi: {
        type: Number,
    },
    tot_dsiamt: {
        type: Number,
    },
  
    dsi_remarks: {
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
    domes_sales_invoice:[domesalesinvoice], 

});

let DpmesticSales = module.exports = mongoose.model('DpmesticSales', DsiSchema);


