const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Product
let skuSchema = new Schema({
  SKUName:{
    type: String
  },
  SKUSymbol: {
    type: String
  },
  NoOfDecimal: {
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
  }
},{
    collection: 'skuSchema'
});

module.exports = mongoose.model('skuSchema', skuSchema);