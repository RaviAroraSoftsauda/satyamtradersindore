const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//###############################################################
let productsetupgroup = new Schema({ 
  moduleid :{
      type: Schema.Types.ObjectId, ref:'moduleSchema',
  }, 
  modulenm  :  String ,
  qty  :  String ,
  qtyrane  :  String ,
wght  :  String ,
  wghtrange  :  String ,
  rate  :  String ,
  raterange  :  String ,
  qtytyp  :  String ,
  wghttyp  :  String ,
  pcktyp  :  String ,
  unityp  :  String ,
  brandtyp  :  String ,
  amtro  :  String ,
  amtedit  :  String ,
id : Schema.Types.ObjectId  });

//###############################################################
let productpostingroup= new Schema({ 
    selesid :{
        type: Schema.Types.ObjectId, ref:'moduleSchema',
    }, 
    selesnm  :  String ,
    partypid  : {
        type: Schema.Types.ObjectId, ref:'paTypeSchema',
    }, 
    accontnm  : {
      type: Schema.Types.ObjectId, ref:'accountSchema',
  }, 
id : Schema.Types.ObjectId  });

//###############################################################
let fgSchema = new Schema({
  item_code: {
    type: String,
  },
  item_title:{
    type: String
  },
  item_group: {
    type: Schema.Types.ObjectId, ref:'CategorySchema',
  },
  subquality: {
    type: Schema.Types.ObjectId, ref:'subqualitySchema',
  },
  dana_class: {
    type: Schema.Types.ObjectId, ref:'qualitySchema',
  },
  container_rate: {
    type: String
  },
  dana_rt: {
    type: String
  },
  apmc_code: {
    type: String
  },
  apmc_typ: {
    type: String
  },
  dana_dalali: {
    type: String
  },
  dalali_typ: {
    type: String
  },
  desper: {
    type: String
  },
  tax_categry: {
    type: Schema.Types.ObjectId, ref:'taxctgSchema',
  },
  rate_basedon: {
    type: String
  },
  packing: {
    type: String
  },
  laga_paisa: {
    type: String
  },
  unit_nm: {
    type: Schema.Types.ObjectId, ref:'skuSchema',
  },
  container_code: {
    type: String
  },
  containe_charges: {
    type: String
  },
  entry_tax: {
    type: String
  },
  GST: {
    type: String
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
  del:{
    type:String,
    },
    updatedate: {
      type: Date
    },
  entrydate: {
    type: Date
  },
  product_setup: {
    type: [productsetupgroup]
  },
  product_posting_setup: {
    type: [productpostingroup]
  },
},{
    collection: 'fgSchema'
});

module.exports = mongoose.model('fgSchema', fgSchema);