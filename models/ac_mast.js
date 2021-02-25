let mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Brand Schema
let ac_Schema = mongoose.Schema({
	main_bk: {
		type: String,
	},
      ac_name: {
        type: String,
		  },
		ac_code: {
        type: String,
		 },
		ac_tranType:  {
			type: Schema.Types.ObjectId, ref:'transmastschema',
		   },
		ac_groupname: {
			type: Schema.Types.ObjectId, ref:'groupm_schema',
		},
		ac_transport: {
			type: Schema.Types.ObjectId, ref:'acmast',
		},
		ac_opbal: {
         type: String,
			},
			ac_open_type: {
				type: String,
		 },
      ac_add1: {
        type: String,
       },
      ac_add2: {
         type: String,
		 },
		
		ac_city: {
			type: Schema.Types.ObjectId, ref:'city_master',
		  },
		ac_city1: {
			 type: Schema.Types.ObjectId, ref:'city_master',
		 },
		ac_payterm: {
		 	type: String,
			},
		ac_state: {
			type:Schema.Types.ObjectId, ref:'state_master',
	     },
		ac_phoff: {
        type: String,
		  },
		ac_phfax: {
        type: String,
       },
		ac_phres: {
        type: String,
		 },
		ac_phmob: {
        type: String,
		 },
		 fac_phoff: {
			type: String,
		  },
		 fac_phfax: {
			type: String,
		  },
		 fac_phres: {
		   type: String,
		 },
		 fac_phmob: {
		   type: String,
		  },
		 ac_bank:{
        type: Array
       },
		 ac_ptype: {
        type:Schema.Types.ObjectId, ref:'party_type_schema',
		 }, 
		ac_crelimit: {
          type: String,
	     },
		ac_credate: {
          type: String,
		  },
		ac_rmks: {
         type: String,
		 }, 
		ac_cst: {
          type: String,
		 },
		ac_website: {
         type: String,
		 },
		ac_rmks: {
         type: String,
		},
	
		ac_gstin: {
         type: String,
	 	},
		ac_pan: {
          type: String,
		 },
	   ac_actype: {
         type: String,
		 },
		ac_iecno: {
        type: String,
		 },
		
		ac_cont: {
        type: String,
		 },
		ac_pin: {
			type: String,
		 },
		fac_pin: {
			type: String,
		},  
		ac_gstin: {
         type: String,
		 }, 
		ac_masttype: {
         type: String,
		 }, 
		ac_email: {
        type: String,
		 },
		 ac_oth: {
				type: String,
			 }, 
	   ac_nftparty: {
			type: String,
		  },  
	   ac_port: {
			type: String,
		 }, 
		 port_dicharge: {
			type: String,
		 },  
		 ac_advafter: {
			type: String,
		 }, 
		 ac_advbefore: {
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
let acmast = module.exports = mongoose.model('acmast',ac_Schema);



	
	
