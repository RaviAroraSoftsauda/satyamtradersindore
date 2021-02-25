let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var addamt = new Schema({ 
    particular_add  : {
        type: Schema.Types.ObjectId, ref:'addless_mast'
    },
    particular_amount  :  Number ,
     id :Schema.Types.ObjectId });
var lessamt = new Schema({ 
   particular_less  : {
       type: Schema.Types.ObjectId, ref:'addless_mast'
   },
   particular_amtless  :  Number ,
         id :Schema.Types.ObjectId });

var row_mat_group = new Schema({ 
    row_mat  : {
      type: Schema.Types.ObjectId, ref:'rawmatSchema'
    },
    plan_no : Number ,
    Raw_Qty : Number ,
    plan_id: {
        type: Schema.Types.ObjectId, ref:'plan_entrySchema',
    },
    plan_grp_id : {
        type: String,
    },
    id :Schema.Types.ObjectId 
});
     
var salesordergroup = new Schema({ 
    so_sno  :  Number,
    plan_no  :  Number,
    so_disc :  {
        type: Schema.Types.ObjectId, ref:'fgSchema',
    },
    plan_grp_id : {
        type: String,
    },
    plan_id : {
        type: Schema.Types.ObjectId, ref:'plan_entrySchema',
    },
    WIP_name : {
        type: Schema.Types.ObjectId, ref:'WIP_mastSchema',
    },
    sales_ord_id :  {
        type: Schema.Types.ObjectId, ref:'pur_order_Schema',
    },
    sales_ord_grp_id : String,
    outin_qty  :  Number,  
    ocrate  :  Number,
    order_price  :  Number,
    sopacper_carten  :  Number ,
    so_qty : Number,
    so_discount:   Number ,
    so_gstrate: Number,
    so_taxvalue: Number,
    so_beforedisamt: Number,
    so_afttaxvalue: Number,
    total_amt :   Number ,
    total_amt_before: Number,
    sd2id: String,
    sd2srno:String,
    pendqty:Number,
    qty_bal:Number,
    qty_exe:Number,
    Bs_qty:Number,
    Rej_qty:Number,
    WIP_Rem:String,
    id :Schema.Types.ObjectId });

let SalesSchema = mongoose.Schema({
    main_bk: {
        type: String,
    },
    d_c: {
        type: String,
    },
    c_j_s_p: {
        type: String,
    },
    so_no: {
        type: String,
    },
    vouc_code: {
        type: Number,
    },
    ws_no: {
        type: Number,
    },
    so_date: {
        type: Date,
    },
    so_datemilisecond: {
        type: Number,
    },
    DPCD:{
        type: Schema.Types.ObjectId, ref:'production_deptSchema',
    },
    OPDPCD:{
        type: Schema.Types.ObjectId, ref:'production_deptSchema',
    },
    production_dept:{
        type: Schema.Types.ObjectId, ref:'production_deptSchema',
    },
    Ship_party_Name:{
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    Ship_party:
    {
        type: String,
    },
    Ship_party_gst:
    {
        type: String,
    },
    Ship_party_add:
    {
        type: String,
    },
    Ship_party_State:{
        type: Schema.Types.ObjectId, ref:'stateSchema',
    },
    Ship_party_City:{
        type: Schema.Types.ObjectId, ref:'citySchema',
    },
    buy_cus_name :
    {
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
   
    buy_rmks: {
        type: String,
    },
    
    buy_pono: {
        type: String,
    },
    buy_podt: {
        type: Date,
    },
    Vehicle: {
        type: String,
    },
    Transport: {
        type: String,
        
    },
    buy_podtmilisecond: {
        type: Number,
    },
    tot_sooq: {
        type: Number,
    },
    tot_amtso: {
        type: Number,
    },
    tot_beforedisamt:{
        type: Number
    },
    tot_taxvalue:{
        type: Number
    },
    tot_discount: {
        type: Number,
    },
    tot_amtbefore: {
        type: Number,
    },
    gst_taxamtot12: {
        type: Number,
    },
    gst_taxamtot18: {
        type: Number,
    },
    grand_total: {
        type: Number,
    },
    so_remarks: {
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
    tot_qty_raw:Number,
    sales_or_group:[salesordergroup], 
    add_details:[addamt], 
    less_details:[lessamt], 
    row_mat_group:[row_mat_group], 
});

let SalesOrder = module.exports = mongoose.model('SalesOrder', SalesSchema);


