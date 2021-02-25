let mongoose = require('mongoose');
var Schema = mongoose.Schema;

let oldouts = mongoose.Schema({
    BROKER : String,
    BROKERNAME : String,
    BROKPLACE : String,
    PARTY : String,
    PLACE : String,
    BILLNO : String,
    DATE : String,
    BILLAMT : Number,
    BALANCE : Number,
    BAGS : String,
    AGE : String,
    DEBTOR : String,
    DEBTORNAME : String,
    DEBTPLACE : String,
    LINEINFO : String,
    del:String
},{
    collection: 'oldouts'
});
let Outstading = module.exports = mongoose.model('oldouts', oldouts);


	
	
	

	
	
	
	
