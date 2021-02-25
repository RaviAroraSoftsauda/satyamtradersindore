const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let grocery_master_group = new Schema({ 

  upToPacking: {
    type: String
  },
  qty: {
    type: String
  },
  basic: {
    type: String
  },
  levyPer: {
    type: String
  },
  levy: {
    type: String
  },
  price  :  String ,
 id : Schema.Types.ObjectId  });


let grocery_Schema = new Schema({

  natureOfWork: {
    type: String
  },
  effectiveDate: {
    type: Date
  },
  datemilisecond: {
    type: String
  },
  co_code: {
    type: String
  },
  div_code: {
    type: String
  },
  user: {
    type: String
  },
  masterid: {
    type: String
  },
  entrydate: {
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
  grocery_master_group: {
    type: [grocery_master_group]
  }
},{
    collection: 'grocery_Schema'
});

module.exports = mongoose.model('grocery_Schema', grocery_Schema);