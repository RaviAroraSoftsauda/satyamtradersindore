let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var worksheet_group = new Schema({ 
     sd2srno  :  Number ,
     w_pname :  {
        type: Schema.Types.ObjectId, ref:'product_mast',
    },
    in_qty  :  Number,
    perc_cbm  :  Number,
    or_qty  :  Number ,
    w_cost  : Number,
    w_profit  :   Number ,
    w_profitamt  :   Number ,
    w_sellprice  :   Number ,
    w_sellpriceD  :   Number ,
    w_boxpricedoller  :   Number ,
    w_boxperC  :   Number ,
    w_boxperFR  :   Number ,
    w_boxperFD  :   Number ,
    w_finalb  :   Number ,
    w_finalc  :   Number ,
    w_fobAmt  :   Number ,
    w_cnfAmt  :   Number ,
    tot_cbm  :   Number ,
    fr_cbm  :   Number ,
    id : Schema.Types.ObjectId  });

let worksheetSchema = mongoose.Schema({
    ws_no: {
        type: String,
    },
    vouc_code: {
        type: Number,
    },
    work_sheetdt: {
        type: Date,
    },
    work_sheetdtmilisecond: {
        type: Number,
    },
    ws_cus_name:
    {
        type: Schema.Types.ObjectId, ref:'acmast',
    },
    w_rmks: {
        type: String,
    },
    
    pono: {
        type: String,
    },
    podt: {
        type: Date,
    },
    podtmilisecond: {
        type: Number,
    },
   
    tot_order: {
        type: Number,
    },
    tot_pamt: {
        type: Number,
    },
    tot_fobamt: {
        type: Number,
    },
    tot_cnfamt: {
        type:Number,
    },
   
    w_doller: {
        type:Number,
    },
    market_price: {
        type:Number,
    },
    w_totaFr: {
        type:Number,
    },
    w_overseasFPB: {
        type:Number,
    },
    con_cbm: {
        type:Number,
    },
    add1_amt: {
        type:Number,
    },
    sgst_tax: {
        type:Number,
    },
    add2_amt: {
        type:Number,
    },
    cgst_tax: {
        type:Number,
    },
    add3_amt: {
        type:Number,
    },
    igst_tax: {
        type:Number,
    },
    less_rmk: {
        type:Number,
    },
    less_amt: {
        type:Number,
    },
    less1_rmk: {
        type:Number,
    },
    less1_amt: {
        type:Number,
    },
    less3_rmk: {
        type:Number,
    },
    less3_amt: {
        type:Number,
    },
    paydiscrt: {
        type:String,
    },
    party_remarks: {
        type:String,
    },
    bill_amt: {
        type:Number,
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
    work_sheet_group: [worksheet_group], 

});

let sauda = module.exports = mongoose.model('worksheet', worksheetSchema);


