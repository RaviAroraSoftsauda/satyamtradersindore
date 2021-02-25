let mongoose = require('mongoose');
var Schema = mongoose.Schema;

let RCTDET = mongoose.Schema({
    RCT_NO : String,
    CASH_DATE : String,
    BILL_NO : String,
    DELAY_DAY : String,
    INT_RATE : String,
    DISC_AMT : String,
    CR_CHGS : String,
    INT_AMT : String,
    CHITHI_AMT : String,
    CASH_AMT : String,
    KASAR_AMT : String,
    ALT_AMT : String,
    LESS_INT : String,
    LESS_CHIT : String,
    LESS_CHGS : String,
    MERGE_INT : String,
    BROK_ACC : String,
    CR_ACC : String,
    BROK_AMT : String,
    RCT_TAG : String,
    GST_AMT : String,
    DRN_NO : String,
    DRN_TYPE : String
},{
    collection: 'RCTDET'
});
let Outstading = module.exports = mongoose.model('RCTDET', RCTDET);


	
	
	

	
	
	
	
