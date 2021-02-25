const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let districtSchema = new Schema({
  DistrictName: {
    type: String
  },
  StateName: {
    type: Schema.Types.ObjectId, ref:'stateSchema',
  },
  Population: {
    type: Number
  },
  Area: {
    type: Number
  },
  entry: {
    type: String
  },
  user:{
    type:String
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
    collection: 'districtSchema'
});

module.exports = mongoose.model('districtSchema', districtSchema);