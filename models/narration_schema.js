let mongoose = require('mongoose');
let narrationSchema = mongoose.Schema({
    narration_name: {
        type: String,
        required: true
    },
    type:
    {
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
let narration = module.exports = mongoose.model('narration', narrationSchema);