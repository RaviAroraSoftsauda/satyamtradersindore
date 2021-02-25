const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Product
let rawmatSchema = new Schema({
  Rm_ProCode: {
    type: Number
  },
  Rm_Quality: {
    type: Schema.Types.ObjectId, ref:'qualitySchema',
  },
  Rm_Sub_Qua: {
    type: Schema.Types.ObjectId, ref:'subqualitySchema',
  },
  Rm_Category: {
    type: Schema.Types.ObjectId, ref:'CategorySchema',
  },
  Rm_ManuFac: {
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  // Schema.Types.ObjectId, ref:'accountSchema',
  Rm_Des: {
    type: String
  },
  Rm_Price: {
    type: Number
  },
  Rm_Unit: {
    type: Schema.Types.ObjectId, ref:'skuSchema',
  },
  Rm_OpStk: {
    type: Number
  },
  Rm_StRate: {
    type: Number
  },
  Rm_StMin: {
    type: Number
  },
  Rm_StMax: {
    type: Number
  },
  Rm_Lead: {
    type: Number
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
  }
},{
    collection: 'rawmatSchema'
});

module.exports = mongoose.model('rawmatSchema', rawmatSchema);