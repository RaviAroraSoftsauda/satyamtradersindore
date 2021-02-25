let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let courierinwordSchema = mongoose.Schema({
    cou_date: {
        type: String,
    },
    party_sno: {
        type: Schema.Types.ObjectId, ref: 'party',
    },
    cou_nm: {
        type: Schema.Types.ObjectId, ref: 'courier',
    },
    cou_lotno: {
        type: String,
    },
    cou_product: {
        type: Schema.Types.ObjectId, ref: 'product_mast',
    },
    cou_brand: {
        type: Schema.Types.ObjectId, ref: 'brand',
    },
    cou_rate: {
        type: String,
    },
    cou_contdition: {
        type: String,
    },
    cou_rcpt: {
        type: String,
    },
    cou_content: {
        type: String,
    },
    remarks: {
        type: String,
    },
    cou_crgs: {
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
let courier_inword = module.exports = mongoose.model('courier_inword', courierinwordSchema);