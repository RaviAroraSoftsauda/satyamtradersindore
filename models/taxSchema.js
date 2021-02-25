const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Product
let taxSchema = new Schema({
  tx_Thead: {
    type: String
  },
  tx_TDSAC: {
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  tx_ScCode: {
    type: String
  },
  tx_TDS: {
    type: Number    
  },
  tx_GST:{
      type: Number
  },
  tx_SGSTR: {
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  tx_SGSTP: {
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  tx_CGSTR: {
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  tx_CGSTP: {
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  tx_IGSTR: {
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  tx_IGSTP: {
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  
  user:{
    type: String
  },
  masterid: {
    type: String
  },
  entrydate: {
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
    collection: 'taxSchema'
});

module.exports = mongoose.model('taxSchema', taxSchema);

