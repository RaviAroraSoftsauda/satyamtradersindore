let mongoose = require('mongoose');

// Brand Schema
let categorytaxSchema = mongoose.Schema({
    category_tax_name: {
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
let category_tax_mast = module.exports = mongoose.model('category_tax_mast', categorytaxSchema);