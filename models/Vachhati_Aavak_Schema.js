let mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Add Detailes
var addamt = new Schema({ 
    particular_add  : {
        type: Schema.Types.ObjectId, ref:'addless_mast'
    },
    particular_amount  :  Number,
    id :Schema.Types.ObjectId });

// Less Detailes
var lessamt = new Schema({ 
    particular_less  : {
       type: Schema.Types.ObjectId, ref:'addless_mast'
    },
    particular_amtless  :  Number ,
    id :Schema.Types.ObjectId });

// Garu Aavak Group    
var vachhati_Aavak_Group = new Schema({ 
    gdn_Cd_Name :  {
        type: Schema.Types.ObjectId, ref:'gowdawnCodeSchema',
    },
    lot_No :  {
        type: String,
    },
    item_Code_Desc :  {
        type: Schema.Types.ObjectId, ref:'fgSchema',
    },
    purchase_Ac_Title: {
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    sale_Ac_Title: {
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    marks  :  String,  
    qntty  :  Number,
    blc_qntty  :  Number,
    pkng:Number,
    net_Wt  :  Number,
    rate  :  Number ,
    QW:String,
    amount : Number,
    discount:Number ,
    Dis_Amt:String,
    bardan_Gross_Amount: Number,
    apmc: String,
    apmc_Amount: Number,
    ec: String,
    // entry_Tax :   String ,
    commission_gdn_rent :   String ,
    tax_Code: String,

    tax_Amt:String,
    GST: String,
    net_Amount:Number,
    vakal_Thok:String,
    dana_Rt:Number,
    id :Schema.Types.ObjectId });

// Main Schema
let Vachhati_Aavak_Schema = mongoose.Schema({
    main_bk: {
        type: String,
    },
    d_c: {
        type: String,
    },
    c_j_s_p: {
        type: String,
    },
    vouc_code: {
        type: String,
    },
    date: {
        type: Date,
    },
    datemilisecond: {
        type: Number,
    },
    bill_No: {
        type: String,
    },
    godown_rcpt_date: {
        type: Date,
    },
    do_No: {
        type: String,
    },
    do_Date: {
        type: Date,
    },
    do_Datemilisecond: {
        type: Number,
    },
    godown_rcpt_datemilisecond: {
        type: Number,
    },
    moter_no: {
        type: String,
    },
    invoice_refno: {
        type: String,
    },
    Lot_No :  {
        type: String,
    },
    lr_no: {
        type: String,
    },
    vachhati_code: {
        type: String,
    },
    despatched_from_to: {
        type: String,
    },
    tapalee_code: {
        type: String,
    },
    garu_Remarks: {
        type: String,
    },
    tot_Qty: {
        type: Number,
    },
    tot_Amt: {
        type: Number,
    },
    tot_AmtBeforeDis:{
        type: Number
    },
    tot_DisAmt: {
        type: Number,
    },
    tot_TaxAmt:{
        type: Number
    },
    tot_AmtBeforeTax:{
        type: Number
    },
    gst_TaxAmtTot5: {
        type: Number,
    },
    gst_TaxAmtTot12: {
        type: Number,
    },
    gst_TaxAmtTot18: {
        type: Number,
    },
    gross_Amt: {
        type: Number,
    },
    nature_of_aavak:{
        type:String,
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
    del:{
        type:String,
    },
    entrydate:{
        type:String,
    },
    update:{
        type:String,
    }, 
    delete:{
        type:String,
    },
    vachhati_Aavak_Group:[vachhati_Aavak_Group], 
    add_details:[addamt], 
    less_details:[lessamt], 
},{
    collection: 'Vachhati_Aavak_Schema'
});

module.exports = mongoose.model('Vachhati_Aavak_Schema', Vachhati_Aavak_Schema);


