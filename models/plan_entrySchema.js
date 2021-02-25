let mongoose = require('mongoose');
var Schema = mongoose.Schema;
     
var mrngroup = new Schema({ 
    so_disc :  {
        type: Schema.Types.ObjectId, ref:'fgSchema',
    },
    so_qty : Number,
    so_panding_qty : Number,
    so_exe_qty : Number,
    id :Schema.Types.ObjectId });

let plan_entrySchema = mongoose.Schema({
    main_bk: {
        type: String,
    },
    d_c:{
        type: String,
    },
    plan_no: {
        type: String,
    },
    plan_date: {
        type: Date,
    },
    tot_sooq:{
        type: Number,
    },
    plan_datemilisecond: {
        type: Number,
    },
    del:{
        type:String
    },
    entry:{
        type:String
    },
    update:{
        type:String
    },
    delete:{
        type:String
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
    plan_entry_group:[mrngroup], 
});

let SalesOrder = module.exports = mongoose.model('plan_entrySchema', plan_entrySchema);


