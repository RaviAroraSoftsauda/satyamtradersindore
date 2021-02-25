let mongoose = require('mongoose');

// Brand Schema
let categorytaxSchema = mongoose.Schema({
    product_tax_name: {
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
let product_tax_mast = module.exports = mongoose.model('product_tax_mast', categorytaxSchema);