let mongoose = require('mongoose');

// Brand Schema
let brandSchema = mongoose.Schema({
    brand_name: {
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
    }, masterid:{
        type:String,
    },
});
let brand = module.exports = mongoose.model('brand', brandSchema);