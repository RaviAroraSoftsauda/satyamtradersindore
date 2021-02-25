const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let groupSetupSchema = new Schema({
  group: String,
  garry: [{ type: Schema.Types.ObjectId, ref: 'groupSchema' }],
  user: {
    type: String
  },
  update: {
    type: String
  }
  },{
    collection: 'groupSetupSchema'
  });

module.exports = mongoose.model('groupSetupSchema', groupSetupSchema);