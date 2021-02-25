const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let unitArray = new Schema({ 

 Qty_Unit: {
    type: String
  },
  M_Packing: {
    type: String
  },
  W_Division: {
    type: String
  },
  Est_Capunit: {
    type: String
  },
  Sub_Unit: {
    type: String
  },
  D_Balancing: {
    type: String
  },
  Division_Name: {
    type: Schema.Types.ObjectId, ref:'divSchema',
  },
  price  :  String ,
 id : Schema.Types.ObjectId  });

let unitsetupSchema = new Schema({
  
  EntryModule: {
    type: String,
  },
  user: {
    type: String
  },
  group: {
    type: String
  },
  entrydate: {
    type: String
  },
  masterid: {
    type: String
  },
  update: {
    type: String
  },
  del: {
    type: String
  },
  del: {
    type: String
  },
  unitArray: {
    type: [unitArray]
  }
},{
    collection: 'unitsetupSchema'
});

module.exports = mongoose.model('unitsetupSchema', unitsetupSchema);