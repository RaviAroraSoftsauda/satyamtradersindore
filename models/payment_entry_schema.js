let mongoose = require('mongoose');
var Schema = mongoose.Schema;
let paymententrySchema = mongoose.Schema({
	main_bk: {
        type: String,
    },
	c_j_s_p: {
        type: String,
    },
	vouc_code: {
        type: Number,
    },
	pay_date: {
        type: Date,
    },
    paydatemilisecond: {
        type: Number,
    },
    br_code:
    {
        type: Schema.Types.ObjectId, 
        ref:'party',
    },
    sl_code:
    {
        type: Schema.Types.ObjectId,
        ref: 'party',
    },
	chkddtyp: {
        type: String,
    },
	chkddno: {
        type: String,
    },
	chkpaydddt: {
        type: String,
    },
	chkddamt: {
        type: Number,
    },
    chkdddt: {
        type: Number,
    },
	dep_bnk: {
        type: Schema.Types.ObjectId,
        ref: 'bank',
    },
	dep_ac: {
        type: String,
    },
	courier: {
        type: Schema.Types.ObjectId,
        ref: 'courier',
    },
	cou_rec: {
        type: String,
    },
	cou_chgs: {
        type: String,
    },
	rmks1: {
        type: String,
    },
	rmks2: {
        type: String,
    },
    outstadingid:
    {
        type: Schema.Types.ObjectId, 
        ref:'outstading',
    },
    expenseid:
    {
        type: Schema.Types.ObjectId, 
        ref:'outstading_expense',
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
let payment_entry1 = module.exports = mongoose.model('payment_entry', paymententrySchema);