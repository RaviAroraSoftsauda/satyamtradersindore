const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let production_deptSchema = new Schema({
  Description: {
    type: String
  },
  Code: {
    type: String
  },
  Order: {
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
    collection:  'production_deptSchema'
});

module.exports = mongoose.model( 'production_deptSchema', production_deptSchema);