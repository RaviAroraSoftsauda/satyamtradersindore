let mongoose = require('mongoose');
var Schema = mongoose.Schema;

let TransSchema = mongoose.Schema({
    srno:{
        type:  Number,
    },
    main_bk:{
        type:  String,
    },
    d_c:{
        type:  String,
    },
    c_j_s_p: {
        type: String,
    },
    vouc_code: {
        type: Number,
    },    
    cash_date: {
        type: Date,
    },
    cash_datemilisecond: {
        type: Number,
    },
    type: {
        type: String,
    },
    opppcd  :  {
        type: Schema.Types.ObjectId, ref:'acmast',
    },
    pcd:  {
        type: Schema.Types.ObjectId, ref:'acmast',
    },
    _ID:
    {
        type: Schema.Types.ObjectId, 
        ref:'SalesOrder',
    },
    cash_chequeno  :  String,  
    cash_chequedate  :  String,
    tramount  :  Number,
    cash_narrone  :  String ,
    cash_narrtwo : String,
    tot_amt: {
        type: Number,
    },
    totcash_amtcr: {
        type: Number,
    },
    cash_remarks: {
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
    
    cash_eno: {
        type: String,
    },
    // cash_bank_group:[cashbankgroup], 

});

let tran = module.exports = mongoose.model('tran', TransSchema);


