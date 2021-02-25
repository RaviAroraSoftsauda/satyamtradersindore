const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let toli_Schema = new Schema({
  ToliName: {
    type: String
  },

  ToliCode: {
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
    collection: 'toli_Schema'
});

module.exports = mongoose.model('toli_Schema', toli_Schema);