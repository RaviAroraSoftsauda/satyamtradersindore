let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let SupplierSchema = mongoose.Schema({
    
   
    s_name: {
        type: String,
      },
    s_add: {
        type: String,
      },
    s_add2: {
        type: String,
      },
    s_city: {
        type: Schema.Types.ObjectId, ref:'city_master',
       },
    s_mobile: {
        type: Number,
      },
    s_gstin: {
        type: String,
    },
     co_code:{
        type:String,
    },
    div_code:{
        type:String,
    },
    usrnm:{
        type:String,
    },
    masterid:{
        type:String,
    }, 
});
let supplier_mast = module.exports = mongoose.model('supplier_mast',SupplierSchema);