let mongoose = require('mongoose');

// Brand Schema
let expenseSchema = mongoose.Schema({
    expense_name: {
        type: String,
        required: true
    },
    expense_type: {
        type: String,
        required: true
    },
    paydatemilisecond: {
        type: Number,
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
let expense = module.exports = mongoose.model('expense', expenseSchema);