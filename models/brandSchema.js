const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let brandSchema = new Schema({
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
    collection: 'brandSchema'
});

module.exports = mongoose.model('brandSchema', brandSchema);