let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let cus_Schema = mongoose.Schema({
    party_name: {
      type: String,
    },
    party_code: {
       type: String,
    },
    c_trType:  {
       type: Schema.Types.ObjectId, ref:'tm_mast',
    },
    c_pg: {
       type: String,
    },
    c_ptm: {
        type: Schema.Types.ObjectId, ref:'ptyp_mast',
    },
    bill_add: {
        type: String,
    },
    city_name: {
        type: Schema.Types.ObjectId, ref:'city_master',
    },
    zip_cd: {
        type: Number,
    },
    fax: {
        type:Number,
    },
    o_no: {
        type: String,
    },
    party_bank:
    {
        type: Array
    },
    r_no: {
        type: String,
    },
    c_mob: {
        type:Number,
    },
    ship_add: {
        type: String,
    },
    city_nameS: {
         type: Schema.Types.ObjectId, ref:'city_master',

    },
    ship_zip_cd: {
        type:Number,
    },
    ship_fax: {
        type: Number,
    },
    ship_o_no: {
        type: String,
    },
    ship_r_no: {
        type: Number,
    },
    ship_mobile: {
        type: Number,
    },
    c_con1: {
        type: String,
    },
    c_port: {
        type: String,
    },
    c_email:{
        type: String,
    },
    c_gstin:{
        type:String,
    },
    nft_party: {
        type: String,
    },
    credit_limit: {
        type: Number,
    },
    c_iec:{
         type: Number, 
    },
    c_web:{
        type:String
    },
    c_crday:{
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
let customermast = module.exports = mongoose.model('customermast',cus_Schema);