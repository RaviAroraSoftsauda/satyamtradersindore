const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let bank_details_Schema = new Schema({
  bankName: {
    type: String
  },

  branchName: {
    type: String
  },
  ifscCode: {
    type: String
  },

  micrCode: {
    type: String
  },
  address: {
    type: String
  },

  address3: {
    type: String
  },
  address2: {
    type: String
  },

  contact: {
    type: String
  },
  remark: {
    type: String
  },

  entry: {
    type: String
  },
  update: {
    type: String
  },
  co_code: {
    type: String
  },
  div_code: {
    type: String
  },
  masterid: {
    type: String
  },
  delete: {
    type: String
  },
  del: {
    type: String
  }
},{
    collection: 'bank_details_Schema'
});

module.exports = mongoose.model('bank_details_Schema', bank_details_Schema);