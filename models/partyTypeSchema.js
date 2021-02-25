const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let paTypeSchema = new Schema({
  Description: {
    type: String
  },
  Code: {
    type: String
  },
  sales_posting_ac:{
    type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  pur_posting_ac:{
      type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  SR_posting_ac:{
      type: Schema.Types.ObjectId, ref:'accountSchema',
  },
  PR_posting_ac:{
      type: Schema.Types.ObjectId, ref:'accountSchema',
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
    collection: 'paTypeSchema'
});

module.exports = mongoose.model('paTypeSchema', paTypeSchema);