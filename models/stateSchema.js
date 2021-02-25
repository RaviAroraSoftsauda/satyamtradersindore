const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let stateSchema = new Schema({
  StateName: {
    type: String
  },
  StateCapital: {
    type: String
  },
  StateCode: {
    type: String
  },
  StateCodeName: {
    type: String
  },
  StateArea: {
    type: Number
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
    collection: 'stateSchema'
});

module.exports = mongoose.model('stateSchema', stateSchema);