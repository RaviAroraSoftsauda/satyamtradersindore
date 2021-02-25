const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let Add_Less_Parameter_Master_Array = new Schema({ 

  Description: {
    type: String
  },
  Index: {
    type: String
  },
  Parameter_Type: {
    type: String
  },
  Order: {
    type: String
  },
  Value: {
    type: String
  },
  Calculation: {
    type: String
  },
  Active: {
    type: String
  },
  Posting_Ac: {
    type: Schema.Types.ObjectId, ref:'accountSchema'
  },
  Deduction_Par: {
    type: String
  },
  Division: [{ type: Schema.Types.ObjectId, ref:'divSchema' }],

 id : Schema.Types.ObjectId  });



let Add_Less_Parameter_Master_Schema = new Schema({
  ModuleName: {
    type: String,
  },
  Module: {
    type: String,
  },
  user: {
    type: String
  },
  entrydate: {
    type: String
  },
  update: {
    type: String
  },
  masterid:{
    type: String
  },
  Add_Less_Parameter_Master_Array: {
    type: [Add_Less_Parameter_Master_Array]
  }
},{
    collection: 'Add_Less_Parameter_Master_Schema'
});

module.exports = mongoose.model('Add_Less_Parameter_Master_Schema', Add_Less_Parameter_Master_Schema);