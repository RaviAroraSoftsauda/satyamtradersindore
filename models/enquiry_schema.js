let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let enquirySchema = mongoose.Schema({
    st_name: {
        type: String,
    },
    main_bk:{
        type:String,
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
let enquiry = module.exports = mongoose.model('enquiry', enquirySchema);