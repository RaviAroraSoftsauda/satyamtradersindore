const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let daily_grocery_entry_group = new Schema({ 

  natureOfWork: {
    type: Schema.Types.ObjectId, ref:'grocery_Schema'
  },
  pck: {
    type: String
  },
  qty: {
    type: String
  },
  masterRate: {
    type: String
  },
  basic: {
    type: String
  },
  levy: {
    type: String
  },
  Amt: {
    type: String
  },
  entryRemark: {
    type: String
  },
  price  :  String ,
 id : Schema.Types.ObjectId  });


let daily_grocery_entry_Schema = new Schema({

  c_j_s_p: {
    type: String
  },
  vouc_code: {
    type: Number
  },
  date: {
    type: Date
  },
  datemilisecond: {
    type: String
  },
  remark: {
    type: String
  },
  toliCode: {
    type: Schema.Types.ObjectId, ref:'toli_Schema'
  },
  tot_basic: {
    type: String
  },
  tot_levy: {
    type: String
  },
  tot_Amt: {
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
  daily_grocery_entry_group: {
    type: [daily_grocery_entry_group]
  }
},{
    collection: 'daily_grocery_entry_Schema'
});

module.exports = mongoose.model('daily_grocery_entry_Schema', daily_grocery_entry_Schema);