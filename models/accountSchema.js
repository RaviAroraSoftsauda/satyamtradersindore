const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let accountSchema = new Schema({
  ACCode: {
    type: String
  },
  ACName: {
    type: String
  },
  GroupName: {
    type: Schema.Types.ObjectId, ref:'groupSchema',
  },
  broker_Code:{
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  sl_Person:{
      type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  Address1: {
    type: String
  },
  Address2: {
    type: String
  },
  Address3: {
    type: String
  },
  Area: {
    type: String
  },
  CityName: {
    type: Schema.Types.ObjectId, ref:'citySchema',
  },
  ac_pincode: {
    type: String
  },
  StateName: {
    type: Schema.Types.ObjectId, ref:'stateSchema',
  },
  MobileNo: {
    type: String
  },
  PartyType: {
    type: Schema.Types.ObjectId, ref:'paTypeSchema',
  },
  OpBalance: {
    type: Number
  },
  dbcr: {
    type: String
  },
  CommRate: {
    type: String
  },
  IntRate: {
    type: String
  },
  TDS: {
    type: Schema.Types.ObjectId, ref:'taxSchema',
  },
  CrDays: {
    type: String
  },
  CrLimit: {
    type: String
  },
  PanNumber: {
    type: String
  },
 
  GSTIN: {
    type: String
  },
  ac_add2: {
    type: String
  },
  ac_intrestper: {
    type: String
  },
  ac_taxnm: {
    type: Schema.Types.ObjectId, ref:'taxSchema',
  },
  ac_fccino: {
    type: String
  },
  FSS_DATE:{
    type:String
  },
  ac_creditdys : {
    type: String
  },
  bank_group:{
    type: Array
  },
  SMS: {
    type: String
  },
  Email: {
    type: String
  },
  
  
  LockD: {
    type: String
  },
  ShName: {
    type: String
  },
  ac_iecno: {
    type: String
  },
  ac_website: {
    type: String
  },
  ac_phoff: {
    type: String
  },
  ac_phres: {
    type: String
  },
  ac_phfax: {
    type: String
  },
  ac_PrintType: {
    type: String
  },
  ac_APMC: {
    type: String
  },
  ac_transportCode: {
    type: String
  },
  user: {
    type: String
  },
  masterid: {
    type: String
  },
  entry: {
    type: String
  },
  update: {
    type: String
  },
  delete: {
    type: String
  },
  del: {
    type: String
  },
  banks: {
    type: Array
  },
  LEVL_CODE:{
    type:String
  },
  DUB_PARTY:String,
},{
    collection: 'accountSchema'
});

module.exports = mongoose.model('accountSchema', accountSchema);