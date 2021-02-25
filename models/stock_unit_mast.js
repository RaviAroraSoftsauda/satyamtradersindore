let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let StockUnitSchema = mongoose.Schema({
   
    sku_name: {
        type: String,
       
    },
    sku_symbol: {
        type: String,
    },
    no_of_dec: {
        type: Number,
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
let stock_unit_mast = module.exports = mongoose.model('stock_unit_mast', StockUnitSchema);