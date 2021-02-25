let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let TransacSchema = mongoose.Schema({
    
    tran_descr: {
        type: String,
    },
    tran_Code: {
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
let transmastschema = module.exports = mongoose.model('transmastschema', TransacSchema);