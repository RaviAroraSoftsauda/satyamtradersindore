const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let citySchema = new Schema({
  CityName: {
    type: String
  },
  DistrictName: {
    type: Schema.Types.ObjectId, ref:'districtSchema',
  },
  StateName: {
    type: Schema.Types.ObjectId, ref:'stateSchema',
  },
  CityPinCode: {
    type: String
  },
  StdCode: {
    type: String
  },
  PartyType: {
    type: Schema.Types.ObjectId, ref:'paTypeSchema',
  },
  user: {
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
    collection: 'citySchema'
});

module.exports = mongoose.model('citySchema', citySchema);