let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var proformagroup = new Schema({ 
    item_name :  {
        type: Schema.Types.ObjectId, ref:'product_mast',
    },
    in_qty  :  Number,
    perc_cbm  :  Number,
    or_qty  :  Number ,
    cbm_perItem : Number,
    carton_price :   Number ,
    total_amount :   Number ,
    batch_no: String,
    marks_and_no: String,
    comm_unit  : {
        type: Schema.Types.ObjectId, ref:'stock_unit_mast',
    }, 
    id :Schema.Types.ObjectId });
  
    
let ProformaSchema = mongoose.Schema({
  main_bk: {
    type: String,
  },
    pro_no: {
        type: String,
    },
    vouc_code: {
        type: Number,
    },
    pro_formadt: {
        type: Date,
    },
    pro_formadtmilisecond: {
        type: Number,
    },
    ws_no: {
        type: String,
    },
    pro_cus_name:
    {
        type: Schema.Types.ObjectId, ref:'acmast',
    },
    pro_rmks: {
        type: String,
    },
    
    pro_pono: {
        type: String,
    },
    pro_podt: {
        type: Date,
    },
    pro_podtmilisecond: {
        type: Number,
    },
    tot_poq: {
        type: Number,
    },
    tot_picbm: {
        type: Number,
    },
    tot_amt: {
        type: Number,
    },
    pro_remarks: {
        type: String,
    },
    totainword: {
        type: String,
    },
    pre_carriage: {
        type: String,
    },
    place_carriage: {
        type: String,
    },
    country_good: {
        type: Schema.Types.ObjectId, ref:'country_mast',
    },
    country_destination: {
        type: Schema.Types.ObjectId, ref:'country_mast',
    },
    vessel_flightno: {
        type: String,
    },
    port_landing: {
        type: String,
    },
    port_discharge: {
        type: String,
    },
    port_delivery: {
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
    pro_forma_group:[proformagroup], 

});

let Proforma = module.exports = mongoose.model('Proforma', ProformaSchema);


