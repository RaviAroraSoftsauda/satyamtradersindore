const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let groupSchema = new Schema({
  Order: {
    type: Number
  },
  MainGroupName: {
    type: String
  },
  GroupName: {
    type: String
  },
  GroupType: {
    type: String
  },
  MaintainOs: {
    type: String
  },
  Suppress: {
    type: String
  },
  Address: {
    type: String
  },
  Ledger: {
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
  LEVL_CODE:String,
},{
    collection: 'groupSchema'
});

module.exports = mongoose.model('groupSchema', groupSchema);