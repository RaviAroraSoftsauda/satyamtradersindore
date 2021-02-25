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
var garu_Aavak_Group = new Schema({ 
    gdn_Cd_Name :  {
        type: Schema.Types.ObjectId, ref:'gowdawnCodeSchema',
    },
    lot_No :  {
        type: String,
    },
    item_Code_Desc :  {
        type: Schema.Types.ObjectId, ref:'fgSchema',
    },
    sale_Ac_Title: String,
    marks  :  String,  
    qntty  :  Number,
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
    entry_Tax :   String ,
    tax_Code: String,
    tax_Amt:String,
    GST: String,
    net_Amount:Number,
    vakal_Thok:String,
    dana_Rt:Number,
    id :Schema.Types.ObjectId });

// Main Schema
let Sales_Entry_Schema = mongoose.Schema({
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
    entry_Date: {
        type: Date,
    },
    entry_Datemilisecond: {
        type: Number,
    },
    bill_No: {
        type: String,
    },
    bill_Date: {
        type: Date,
    },
    do_No: {
        type: String,
    },
    do_Date: {
        type: Date,
    },
    bill_Datemilisecond: {
        type: Number,
    },
    cr_Days: {
        type: String,
    },
    due_On: {
        type: String,
    },
    lorry_Wagon_No: {
        type: String,
    },
    party_Code:{
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    broker_Code:{
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    sl_Person:{
        type: Schema.Types.ObjectId, ref:'accountSchema',
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
    cashCredit:{
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
    garu_Aavak_Group:[garu_Aavak_Group], 
    add_details:[addamt], 
    less_details:[lessamt], 
},{
    collection: 'Sales_Entry_Schema'
});

module.exports = mongoose.model('Sales_Entry_Schema', Sales_Entry_Schema);


