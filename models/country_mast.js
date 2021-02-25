let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let countrySchema = mongoose.Schema({
    
    country_name: {
        type: String,
    },
    country_Code: {
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
let country_mast = module.exports = mongoose.model('country_mast',countrySchema);