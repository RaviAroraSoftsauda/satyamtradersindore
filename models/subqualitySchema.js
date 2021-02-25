const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for Product
let subqualitySchema = new Schema({
  Description: {
    type: String
  },
  Code: {
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
    collection: 'subqualitySchema'
});

module.exports = mongoose.model('subqualitySchema', subqualitySchema);