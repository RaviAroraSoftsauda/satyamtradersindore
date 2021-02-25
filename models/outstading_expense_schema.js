let mongoose = require('mongoose');
var Schema = mongoose.Schema;
var expense_group = new Schema({
    amountexpence  :  Number ,
    expense_type: String,
    expense_name: String,
    vouch_code:  Number ,
   idd : Schema.Types.ObjectId  });
let outsdingexpenseSchema = mongoose.Schema({
    main_bk: {
        type: String,
    },
    c_j_s_p: {
        type: String,
    },
    vouc_code: {
        type: Number,
    },
    pay_date: {
        type: String,
    },
    totamountexpence: {
        type: Number,
    },
    expense_group: [expense_group], 
    paymentid:
    {
        type: Schema.Types.ObjectId,
        ref: 'payment_entry',
    },
    outstadingid:
    {
        type: Schema.Types.ObjectId, 
        ref:'outstading',
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
let Outstadingexpense = module.exports = mongoose.model('outstading_expense', outsdingexpenseSchema);