let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let acMstSchema = mongoose.Schema({
    
    acc_name: {
        type: String,
    },
    op_bal: {
        type: String,
    },
    grp_name: {
        type: Schema.Types.ObjectId, ref:'groupm_schema',
    },
    am_pan_no: {
        type: String,
    },
    acc_remark: {
        type: String,
    },
    acc_add: {
        type: String,
    },
    acc_city: {
        type:Schema.Types.ObjectId, ref:'city_master',
    },
    acc_state: {
        type:Schema.Types.ObjectId, ref:'state_master',
    },
    acc_cst: {
        type: String,
    },
    acc_gstin: {
        type: String,
    },
    acc_ptype: {
        type:Schema.Types.ObjectId, ref:'party_type_schema',
    },
    acc_crlimit: {
        type: String,
    },
    acc_iecno: {
        type: String,
    },
    acc_web: {
        type: String,
    },
    acc_email: {
        type: String,
    },
    acc_ono: {
        type: String,
    },
    acc_rno: {
        type: String,
    },
    acc_mno: {
        type: String,
    },
    acc_fax: {
        type: String,
    },
    acc_con_per: {
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
});
let account_mast= module.exports = mongoose.model('account_mast',acMstSchema);