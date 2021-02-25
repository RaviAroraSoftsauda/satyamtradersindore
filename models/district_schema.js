let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let districtSchema = mongoose.Schema({
    state_id: {
        type: Schema.Types.ObjectId, ref: 'state_master',
    },
    dis_name: {
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
let district_master = module.exports = mongoose.model('district_master', districtSchema);