let mongoose = require('mongoose');
var Schema = mongoose.Schema;



let prodmast = mongoose.Schema({
    ItemCode : String,
    ItemGroup : String,
    HSNCode : String,
    DanaRate : String,
    SALESDalai : String,
    ItemTitle : String,
    Packing:String,
    del:String
},{
    collection: 'prodmast'
});
let Outstading = module.exports = mongoose.model('prodmast', prodmast);


	
	
	

	
	
	
	
