let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// company Schema;

let divisionSchema = mongoose.Schema({
    div_mast: {
        type: String,
    },
    div_code: {
        type: String,
    },
    ac_add2: {
        type: String,
    },
    ac_place: {
        type: Schema.Types.ObjectId, ref:'city_master',
    },
    ac_state: {
        type: Schema.Types.ObjectId, ref:'state_master',
    },
    bank_name :  {
        type: Schema.Types.ObjectId, ref:'bank',
    },
    bank_add  :  String,
    comp_accountno :  String,
    comp_con_person :  String,
    bank_city :  {
     type: Schema.Types.ObjectId, ref:'city_master',
 },
 bank_fax  :  String,
 bank_ifsc  :  String,
 bank_code  :  String,
 swift_code  :  String,
    ac_pin: {
        type: String,
    },
    propreietor: {
        type: String,
    },
    ac_pan: {
        type: String,
    },
    ac_pho: {
        type: String,
    },
    ac_phfax: {
        type: String,
    },
    ac_mobno: {
        type: String,
    },
    ac_gstin: {
        type: String,
    },
    // datafile: {
    //     type: String,
    // },
    filepath: {
        type: String,
    },
    filename: {
        type: String
    },
    prvyr_datafile: {
        type: String,
    },
    ac_wbsite: {
        type: String,
    },
    ac_email: {
        type: String,
    },
    ac_interfclanguge: {
        type: String,
    },
    ssevadomain: {
        type: String,
    },
    ssevausr: {
        type: String,
    },
    ssevapwd: {
        type: String,
    },
    sms_port_no: {
        type: String,
    },
    smttp_client: {
        type: String,
    },
    email_user: {
        type: String,
    },
    email_pwd: {
        type: String,
    },
    email_port: {
        type: String,
    },
    jurisdiction: {
        type: String,
    },
    ac_topline: {
        type: String,
    },
    ac_midline: {
        type: String,
    },
    ac_bottline: {
        type: String,
    },
    contract_qty: {
        type: String,
    },
    weight_calcution: {
        type: String,
    },
    character_case: {
        type: String,
    },
    fix: {
        type: String,
    },
    com_code: {
        type: String,
    },
     
});
module.exports = mongoose.model('div_mast', divisionSchema);
