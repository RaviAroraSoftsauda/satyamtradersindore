let mongoose = require('mongoose');
var Schema = mongoose.Schema;



let SALDAT = mongoose.Schema({
    BILL_NO : String,
    SAL_DATE : String,
    MOTOR_NO : String,
    DO_NO : String,
    CASH_CODE : String,
    BROK_CODE : String,
    SMAN_CODE : String,
    ALT_ACC : String,
    SAL_AMT : Number,
    ALT_AMT : Number,
    INT_DUE : Number,
    SAL_NAR : String,
    SAL_PLACE : String,
    OLD_RCT : Number,
    OLD_ALT : Number,
    TOT_RCT : Number,
    ALT_RCT : Number,
    INT_RCT : Number,
    APMC_IND : String,
    SAL_NAT : String,
    CHITHI_AMT : Number,
    CHIT_IND : String,
    CHIT_DATE : String,
    OTH_AMT : Number,
    FRT_AMT : Number,
    DISC_AMT : Number,
    INT_CODE : String,
    TOT_BAGS : Number,
    RO_DIFF : String,
    AREA_CODE : String,
    ITEM_GDN : String,
    DOCTRL_IND : String,
    CF_IND : String,
    BILL_IND : String,
    INTUPD_IND : String,
    DELI_DATE : String,
    del:String,
    Out_Update:String
},{
    collection: 'SALDAT'
});
let Outstading = module.exports = mongoose.model('SALDAT', SALDAT);


	
	
	

	
	
	
	
