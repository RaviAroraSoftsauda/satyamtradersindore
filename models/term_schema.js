let mongoose = require('mongoose');


let termSchema = mongoose.Schema({
    term_name: {
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
let term = module.exports = mongoose.model('term', termSchema);