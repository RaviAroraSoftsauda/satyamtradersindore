let mongoose = require('mongoose');

// Brand Schema
let categorySchema = mongoose.Schema({
    category_name: {
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
let category = module.exports = mongoose.model('category_mast', categorySchema);