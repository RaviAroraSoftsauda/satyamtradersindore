let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let groupMastSchema = mongoose.Schema({
    
    gm_order: {
        type: String,
    },
    sub_group: {
        type: String,
    },
    group_name: {
        type: String,
    },
    group_type: {
        type: String,
    },
    main_out: {
        type: String,
    },
    supp_gwt: {
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
let groupm_schema = module.exports = mongoose.model('groupm_schema',groupMastSchema);