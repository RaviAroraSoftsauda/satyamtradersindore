let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let bankSchema = mongoose.Schema({
    bank_name: {
        type: String,
    },
    bnk_brnch: {
        type: String,
    },
	bnk_ifsc: {
        type: String,
    },
	bnk_micr: {
        type: String,
    },
	bnk_add: {
        type: String,
    },
	bnk_add1: {
        type: String,
    },
	bnk_center: {
        type: String,
    },
	bnk_cont: {
        type: String,
    },
	bnk_dist: {
        type: Schema.Types.ObjectId, ref:'district_master',
    },
	state_name: {
        type: Schema.Types.ObjectId, ref:'state_master',
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
});
let bank = module.exports = mongoose.model('bank', bankSchema);