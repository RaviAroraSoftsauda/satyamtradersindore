const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let taxSchema = new Schema({
  tx_ctgnm: {
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
});

module.exports = mongoose.model('taxctgSchema', taxSchema);

