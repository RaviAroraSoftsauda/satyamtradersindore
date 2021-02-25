const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let product_mast_group = new Schema({ 
  raw_matrl_nm :{
      type: Schema.Types.ObjectId, ref:'rawmatSchema',
  }, 
  qty_pcs  :  String ,
  // pck_unit  :  String ,
  sku  : {
      type: Schema.Types.ObjectId, ref:'skuSchema',
  }, 
  price  :  String ,
  id : Schema.Types.ObjectId  });


let WIP_mastSchema = new Schema({
  Fg_PrCode: {
    type: Number,
  },
  Fg_Model:{
    type: Schema.Types.ObjectId, ref:'modelSchema',
  },
  Fg_Des: {
    type: String
  },
  Fg_Brand: {
    type: Schema.Types.ObjectId, ref:'brandSchema',
  },
  Fg_Unit: {
    type: Schema.Types.ObjectId, ref:'skuSchema',
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
  product_mast_group: {
    type: [product_mast_group]
  }
},{
    collection: 'WIP_mastSchema'
});

module.exports = mongoose.model('WIP_mastSchema', WIP_mastSchema);