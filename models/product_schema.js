let mongoose = require('mongoose');

// Brand Schema
let productSchema = mongoose.Schema({
    item_name: {
        type: String,
        required: true
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
let product = module.exports = mongoose.model('product', productSchema);