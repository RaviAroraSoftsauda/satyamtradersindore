let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let stateSchema = mongoose.Schema({
    state_name: {
        type: String,
       
    },
    state_code: {
        type: Number,
       
    },
    c_name: {
        type: Schema.Types.ObjectId, ref:'country_mast',
        
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
let state_master = module.exports = mongoose.model('state_master', stateSchema);