let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var addamt = new Schema({ 
    particular_add  : String,
    particular_amount  :  Number ,
     id :Schema.Types.ObjectId });
 var lessamt = new Schema({ 
    particular_less  : String,
    particular_amtless  :  Number ,
          id :Schema.Types.ObjectId });
     
var mrngroup = new Schema({ 
    so_sno  :  Number,
    so_disc :  {
        type: Schema.Types.ObjectId, ref:'rawmatSchema',
    },
    // unit :  {
    //     type: Schema.Types.ObjectId, ref:'skuSchema',
    // },
    
    // so_div :  {
    //     type: Schema.Types.ObjectId, ref:'div_mast',
    // },
    pur_ord_grp_id: String,
    pur_ord_id: String,
    outin_qty  :  Number,  
    ocrate  :  Number,
    order_price  :  Number,
    sopacper_carten  :  Number ,
    so_qty : Number,
    so_discount:   Number ,
    total_amt :   Number ,
    total_amt_before: Number,
    sd2id: String,
    sd2srno:String,
    pendqty:Number,
    qty_bal:Number,
    qty_exe:Number,
    id :Schema.Types.ObjectId });

    
let mrn_Schema = mongoose.Schema({
    main_bk: {
        type: String,
    },
    c_j_s_p: {
        type: String,
    },
    d_c:{
        type: String,
    },
    cuttingEntry_id:{
        type:String,
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
    buy_cus_name :
    {
        type: Schema.Types.ObjectId, ref:'accountSchema',
    },
    production_dept_name :
    {
        type: Schema.Types.ObjectId, ref:'production_deptSchema',
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
    buy_podtmilisecond: {
        type: Number,
    },
    tot_sooq: {
        type: Number,
    },
    tot_amtso: {
        type: Number,
    },
    tot_discount: {
        type: Number,
    },
    tot_amtbefore: {
        type: Number,
    },
    grand_total: {
        type: Number,
    },
    so_remarks: {
        type: String,
    },
    del:{
        type:String
    },
    entry:{
        type:String
    },
    update:{
        type:String
    },
    delete:{
        type:String
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
    sales_or_group:[mrngroup], 
    add_details:[addamt], 
    less_details:[lessamt], 
});

let SalesOrder = module.exports = mongoose.model('mrn_Schema', mrn_Schema);


