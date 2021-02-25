let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let dailyratesSchema = mongoose.Schema({
    st_name: {
        type: String,
    },
    item_name: {
        type: Schema.Types.ObjectId, ref: 'product_mast',
    },
    prod_spec: {
        type: String,
    },
    rate_min: {
        type: String,
    },
    rate_max: {
        type: String,
    },
    rate_condtion: {
        type: String,
    },
    filepath: {
        type: String,
    },
    filename: {
        type: String
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
let daily_rates = module.exports = mongoose.model('daily_rates', dailyratesSchema);