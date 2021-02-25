const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
var mongo = require('mongodb');
let delveryentry1 = require('../models/contract_sauda_schema');
let delveryentry2 = require('../models/contract_sauda2');
let brand = require('../models/brand_schema');
let product_mast = require('../models/product_mast_schema');
let term = require('../models/term_schema');
let party = require('../models/party_schema');
let narration = require('../models/narration_schema');
let city = require('../models/city_schema');
let transport = require('../models/transport_schema');
let outstading = require('../models/outstading_schema');
let db = mongoose.connection;
let common = require('./common');
var query;
router.get('/productname', function (req, res) {
    product_mast.find({masterid: req.session.masterid}, function(err, product_mast){
        brand.find({masterid: req.session.masterid}, function(err, brand){
        res.json({ 'success': true, 'product_mast': product_mast,'brand': brand });
    });
});
});
// Add Route
router.get('/delivery_entry', ensureAuthenticated, function(req, res){
    delveryentry1.find({main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid}, function (err, delveryentry1){
            brand.find({masterid: req.session.masterid},'brand_name', function (err, brand){
                term.find({},'term_name', function (err, term){
                    party.find({masterid: req.session.masterid}, function (err, party){
                    narration.find({masterid: req.session.masterid}, function (err, narration){
                 product_mast.find({masterid: req.session.masterid},'product_name', function (err, product_mast){
                    transport.find({masterid: req.session.masterid},'transport_name', function (err, transport){

//             if (err) {
//                 console.log(err);
//             } else {
                res.render('delivery_entry.hbs', {
                    pageTitle:'Add delivery',
                    delveryentry1: delveryentry1,
                    brand: brand,
                    term: term,
                    party: party,
                    narration: narration,
                    // city: city,
                    product_mast: product_mast,
                    transport: transport,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
//             }
           }).sort({'transport_name':1});
          }).sort({'product_name':1});
        }).sort({'narration_name':1});
      }).sort({'party_name':1}).populate('city_name');
    }).sort({'term_name':1});
//     });
//    });
  }).sort({'brand_name':1});
}).sort('-vouc_code');
});
router.get('/saudaname', function(req, res) {
var br_code = req.query.ID;
    common.UpdatePenBalNew(req,br_code);
    delveryentry2.find({main_bk:"SD",typ:"BR",pcode:br_code,co_code:req.session.compid,div_code:req.session.divid,"contract_sauda_group.wght_bal":{ $gt:0 }}, function (err, delveryentry2) {
    // product_mast.find({masterid: req.session.masterid}, function (err, product_mast) {
    // delveryentry1.find({main_bk:"SD",co_code:req.session.compid,div_code:req.session.divid}, function (err, delveryentry1) {
    // brand.find({masterid: req.session.masterid}, function (err, brand) {
    // party.find({masterid: req.session.masterid}, function (err, party) {
    if (err)
    {
        console.log(err);
    } 
    else
    {
        // console.log(delveryentry2);
        res.json({ 'success': true, 'delveryentry2': delveryentry2,'product_mast': product_mast,'brand': brand}); ///,'party': party
    }
    //  });
//    });
//   });
//  });
}).populate([{path: 'sauda1',
populate:{ path: 'sl_code', select: 'party_name'}
}]).populate([{path: 'sauda1',
populate:{ path: 'sb_code', select: 'party_name'}
}]).populate([{path: 'contract_sauda_group.p_code',select: 'product_name',
// populate:{ path: 'location', select: 'rackloc_name'}
}]).populate([{path: 'contract_sauda_group.brand_code',select: 'brand_name',
// populate:{ path: 'location', select: 'rackloc_name'}
}])
// .populate({
//     path: 'sauda1',
//     model: 'sauda1',
//     populate: {
//       path: 'sl_code',
//       model: 'party'
//     }
//   })
});
    router.post('/add',function(req, res){
       if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.party_terms=="") req.body.party_terms=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.term=="") req.body.term=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.tptcode=="") req.body.tptcode=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var sd_date = req.body.sd_date;
        var sdDateObject =  moment(sd_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var SDDateMiliSeconds = sdDateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            delveryentry1.find({main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid}, function (err, delventryno){
            var entrylength = delventryno.length+1;
            let delveryentry = new delveryentry1();
            delveryentry.brok_yn = req.body.brok_yn;
            delveryentry.main_bk ='DLV';
            delveryentry.c_j_s_p = req.body.c_j_s_p;
            delveryentry.vouc_code = entrylength;
            delveryentry.sd_date = sdDateObject;
            delveryentry.sd_datemilisecond = SDDateMiliSeconds;
            delveryentry.sl_brok = req.body.sl_brok;
            delveryentry.sl_code = req.body.sl_code;
            delveryentry.sl_cont = req.body.sl_cont;
            delveryentry.sb_brok = req.body.sb_brok;
            delveryentry.sb_code = req.body.sb_code;
            delveryentry.sb_cont = req.body.sb_cont;
            delveryentry.br_brok = req.body.br_brok;
            delveryentry.br_code = req.body.br_code;
            delveryentry.br_cont = req.body.br_cont;
            delveryentry.bb_brok = req.body.bb_brok;
            delveryentry.bb_code = req.body.bb_code;
            delveryentry.bb_cont = req.body.bb_cont;
            delveryentry.term = req.body.term;
            delveryentry.paycond = req.body.paycond;
            delveryentry.paydiscrt = req.body.paydiscrt;
            delveryentry.paycond = req.body.paycond;
            delveryentry.cre_days = req.body.cre_days;
            delveryentry.paydet = req.body.paydet;
            delveryentry.party_terms = req.body.party_terms;
            delveryentry.party_remarks = req.body.party_remarks;
            delveryentry.tot_bags = req.body.tot_bags;
            delveryentry.tot_wght = req.body.tot_wght;
            delveryentry.tot_ammount = req.body.tot_ammount;
            delveryentry.c_j_s_p = req.body.c_j_s_p;
            delveryentry.bno = req.body.bno;
            delveryentry.bdt = req.body.bdt;
            delveryentry.mot_no = req.body.mot_no;
            delveryentry.tptcode = req.body.tptcode;
            delveryentry.tpt_col = req.body.tpt_col;
            delveryentry.frght = req.body.frght;
            delveryentry.frght_rt = req.body.frght_rt;
            delveryentry.frght_adv = req.body.frght_adv;
            delveryentry.cre_days = req.body.cre_days;
            delveryentry.add1_rmk = req.body.add1_rmk;
            delveryentry.add1_amt = req.body.add1_amt;
            delveryentry.less1_rmk = req.body.less1_rmk;
            delveryentry.less1_amt = req.body.less1_amt;
            delveryentry.add2_rmk = req.body.add2_rmk;
            delveryentry.add2_amt = req.body.add2_amt;
            delveryentry.less2_rmk = req.body.less2_rmk;
            delveryentry.less2_amt = req.body.less2_amt;
            delveryentry.add3_rmk = req.body.add3_rmk;
            delveryentry.add3_amt = req.body.add3_amt;
            delveryentry.less3_rmk = req.body.less3_rmk;
            delveryentry.less3_amt = req.body.less3_amt;
            delveryentry.barg_amt = req.body.barg_amt;
            delveryentry.bill_amt = req.body.bill_amt;
            delveryentry.co_code =  req.session.compid;
            delveryentry.div_code =  req.session.divid;
            delveryentry.usrnm =  req.session.user;
            delveryentry.masterid= req.session.masterid
            // let qu = {sauda2:req.query.sauda,vouc_code:req.query.vcd,typ:"BR",main_bk:"SD",co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
            // console.log(qu);
            let delvery = new delveryentry2();
            delvery.sauda1 =delveryentry._id;
            delvery.main_bk = "DLV";
            delvery.typ = "SL";
            delvery.srno = 1;
            delvery.sd_date = sdDateObject;
            delvery.sd_datemilisecond = SDDateMiliSeconds;
            delvery.vouc_code = entrylength;
            delvery.contract_sauda_group = req.body.contract_sauda_group;
            delvery.pcode = req.body.sl_code;
            delvery.sauda_number = req.body.sauda_number;
            delvery.co_code =  req.session.compid;
            delvery.div_code =  req.session.divid;
            delvery.usrnm =  req.session.user;
            delvery.masterid= req.session.masterid;
            delvery.save();

            let delvery2 = new delveryentry2();
            delvery2.sauda1 =delveryentry._id;
            delvery2.main_bk = "DLV";
            delvery2.typ = "BR";
            delvery2.srno = 1;
            delvery2.sd_date = sdDateObject;
            delvery2.sd_datemilisecond = SDDateMiliSeconds;
            delvery2.vouc_code = entrylength;
            delvery2.contract_sauda_group = req.body.contract_sauda_group;
            delvery2.pcode = req.body.br_code;
            delvery2.co_code =  req.session.compid;
            delvery2.div_code =  req.session.divid;
            delvery2.usrnm =  req.session.user;
            delvery2.masterid= req.session.masterid;
            delvery2.save();

            let delvery3 = new delveryentry2();
            delvery3.sauda1 =delveryentry._id;
            delvery3.main_bk = "DLV";
            delvery3.typ = "SB";
            delvery3.srno = 1;
            delvery3.sd_date = sdDateObject;
            delvery3.sd_datemilisecond = SDDateMiliSeconds;
            delvery3.vouc_code = entrylength;
            delvery3.contract_sauda_group = req.body.contract_sauda_group;
            delvery3.pcode = req.body.sb_code;
            delvery3.co_code =  req.session.compid;
            delvery3.div_code =  req.session.divid;
            delvery3.usrnm =  req.session.user;
            delvery3.masterid= req.session.masterid;
            delvery3.save();

            let delvery4 = new delveryentry2();
            delvery4.sauda1 =delveryentry._id;
            delvery4.main_bk = "DLV";
            delvery4.typ = "BB";
            delvery4.srno = 1;
            delvery4.sd_date = sdDateObject;
            delvery4.sd_datemilisecond = SDDateMiliSeconds;
            delvery4.vouc_code = entrylength;
            delvery4.contract_sauda_group = req.body.contract_sauda_group;
            delvery4.pcode = req.body.bb_code;
            delvery4.co_code =  req.session.compid;
            delvery4.div_code =  req.session.divid;
            delvery4.usrnm =  req.session.user;
            delvery4.masterid= req.session.masterid;
            delvery4.save();
            delveryentry.sauda2 = delvery._id;

         ///outstading
            let outst = new outstading();
            outst.saudaid =delveryentry._id;
            outst.main_bk = "DLV";
            outst.c_j_s_p = req.body.c_j_s_p;
            outst.srno = 1;
            outst.sd_date = sdDateObject;
            outst.sd_datemilisecond = SDDateMiliSeconds;
            outst.vouc_code = entrylength;
            outst.sl_code = req.body.sl_code;
            outst.sb_code = req.body.sb_code;
            outst.br_code = req.body.br_code;
            outst.bb_code = req.body.bb_code;
            outst.term = req.body.term;
            outst.paycond = req.body.paycond;
            outst.paydiscrt = req.body.paydiscrt;
            outst.tot_ammount = req.body.tot_ammount;
            outst.barg_amt = req.body.barg_amt;
            outst.bill_amt = req.body.bill_amt;
            outst.outs_amt = req.body.outs_amt;
            outst.outs_rec = req.body.outs_rec;
            outst.outs_exp = req.body.outs_exp;
            outst.outs_clr = req.body.outs_clr;
            outst.pono = req.body.bno;
            outst.podt = req.body.bdt;
            outst.adj_yr = req.body.adj_yr;
            outst.adj_cocode = req.body.adj_cocode;
            outst.adj_main_bk = req.body.adj_main_bk;
            outst.adj_c_j_s_p = req.body.adj_c_j_s_p;
            outst.adj_vouc_chr = req.body.adj_vouc_chr;
            outst.co_code =  req.session.compid;
            outst.div_code =  req.session.divid;
            outst.usrnm =  req.session.user;
            outst.masterid= req.session.masterid;
            outst.save();
            for(var i = 0; i<req.body.contract_sauda_group.length; i++){
                var obj = {};
                new Promise(function (fulfill,reject){
                    fulfill(i);
                }).then( function (i) {                   
                    var value = req.body.contract_sauda_group[i];
                    console.log(i);
                     console.log(value.sd2srno);
                     // ,{"contract_sauda_group.sd2srno":value.sd2srno}
                       var cursum = db.collection('sauda2').aggregate([{$unwind:"$contract_sauda_group"},{$match : {$and:[{main_bk:"DLV"},{typ:"BR"},{"contract_sauda_group.sd2id":mongo.ObjectId(value.sd2id)}]}},{$group: { _id : {"vcd" : "$contract_sauda_group.sd2srno"}, "totqty": {"$sum": "$contract_sauda_group.bag"}, "totwght": {"$sum": "$contract_sauda_group.wght"}}}]);
                    cursum.each(async function (err, itemsum) {
                        global.qtyexe=0;
                        global.wghtexe=0;
                         if (itemsum != null) {
                            global.qtyexe =itemsum.totqty;
                            global.wghtexe =itemsum.totwght;
                        // await f(value,global.qtyexe,global.wghtexe)
                        // return ;             
                            var index = value.sd2srno-1;
                            obj["contract_sauda_group."+index+".qty_exe"] =  qtyexe;
                            obj["contract_sauda_group."+index+".wght_exe"] =wghtexe; 
                            // obj["contract_sauda_group."+index+".qty_bal"] = item.contract_sauda_group[index]['bag'] -global.qtyexe;
                            // obj["contract_sauda_group."+index+".wght_bal"] = parseFloat( item.contract_sauda_group[index]['wght']) -global.wghtexe;
                            // var outp = db.collection('sauda2').update({"_id":value.sd2id},{"$set": obj});
                            // console.log(outp);

                            delveryentry2.update({"_id":value.sd2id} ,obj ,function (err) { });
                                // if (err) {
                                //     res.json({ 'success': false, 'message': 'Error in Saving contract', 'errors': err });
                                //     return;
                                // } 
                                // else 
                                // {
                                    // res.json({ 'success': true, 'message': 'contract saved', 'errors': err });
                                // }
                            
        
                            // console.log(obj);   
                         }
                    });                
                });
              
            };
            delveryentry.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving delvery entry','errors':err});
                    return;
                }
                
                else
                {
                    common.UpdatePenBalNew(req,req.body.br_code);    
                    res.redirect('/delivery_entry/delivery_entry');
                }
            })
         }).sort('-vouc_code');
        }               
    });
    router.get('/delivery_entry_list', ensureAuthenticated ,function(req,res){
        delveryentry1.find({main_bk : "DLV",co_code:req.session.compid,div_code:req.session.divid}, function (err,delveryentry1){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('delivery_entry_list.hbs',{
                    pageTitle:'delvery entry List',
                    delveryentry1:delveryentry1,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({vouc_code:'asc'}).populate('sl_code').populate('br_code').populate('sauda2');    
       });
       router.get('/delivery_entry_list_update/:id', ensureAuthenticated, function(req, res){
        delveryentry1.findById(req.params.id, function(err, delivsauda1){
          brand.find({masterid: req.session.masterid},'brand_name', function (err, brand){
            term.find({},'term_name', function (err, term){
              party.find({masterid: req.session.masterid}, function (err, party){
                narration.find({masterid: req.session.masterid},'narration_name', function (err, narration){
                //   city.find({}, function (err, city){
                    product_mast.find({masterid: req.session.masterid},'product_name', function (err, product_mast){
                        transport.find({masterid: req.session.masterid},'transport_name', function (err, transport){
                if (err) {
                    console.log(err);
                } else {
                    res.render('delivery_entry_list_update.hbs',{
                        pageTitle:'Update delvery entry',
                        delivsauda1: delivsauda1,
                        brand: brand,
                        term: term,
                        party: party,
                        narration: narration,
                        city: city,
                        product_mast: product_mast,
                        transport: transport,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                    });
                }
            }).sort({'transport_name':1});
         }).sort({'product_name':1});
    //   });
    }).sort({'narration_name':1});
}).sort({'party_name':1}).populate('city_name');
}).sort({'term_name':1});
}).sort({'brand_name':1});
}).populate('sauda2');
});
        router.post('/delivery_entry_list_update/:id', function(req, res) {
            if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.term=="") req.body.term=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.party_terms=="") req.body.party_terms=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.tptcode=="") req.body.tptcode=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            var sd_date = req.body.sd_date;
            var sdDateObject =  moment(sd_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var SDDateMiliSeconds = sdDateObject.format('x');
           
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let delveryentry = {};
                delveryentry.brok_yn = req.body.brok_yn;
                delveryentry.main_bk ='DLV';
                delveryentry.c_j_s_p = req.body.c_j_s_p;
                delveryentry.vouc_code = req.body.vouc_code;
                delveryentry.sd_date = sdDateObject;
                delveryentry.sd_datemilisecond = SDDateMiliSeconds;
                delveryentry.sl_brok = req.body.sl_brok;
                delveryentry.sl_code = req.body.sl_code;
                delveryentry.sl_cont = req.body.sl_cont;
                delveryentry.sb_brok = req.body.sb_brok;
                delveryentry.sb_code = req.body.sb_code;
                delveryentry.sb_cont = req.body.sb_cont;
                delveryentry.br_brok = req.body.br_brok;
                delveryentry.br_code = req.body.br_code;
                delveryentry.br_cont = req.body.br_cont;
                delveryentry.bb_brok = req.body.bb_brok;
                delveryentry.bb_code = req.body.bb_code;
                delveryentry.bb_cont = req.body.bb_cont;
                delveryentry.term = req.body.term;
                delveryentry.paycond = req.body.paycond;
                delveryentry.paydiscrt = req.body.paydiscrt;
                delveryentry.paycond = req.body.paycond;
                delveryentry.cre_days = req.body.cre_days;
                delveryentry.paydet = req.body.paydet;
                delveryentry.party_terms = req.body.party_terms;
                delveryentry.party_remarks = req.body.party_remarks;
                delveryentry.tot_bags = req.body.tot_bags;
                delveryentry.tot_wght = req.body.tot_wght;
                delveryentry.tot_ammount = req.body.tot_ammount;
                delveryentry.c_j_s_p = req.body.c_j_s_p;
                delveryentry.bno = req.body.bno;
                delveryentry.bdt = req.body.bdt;
                delveryentry.mot_no = req.body.mot_no;
                delveryentry.tptcode = req.body.tptcode;
                delveryentry.tpt_col = req.body.tpt_col;
                delveryentry.frght = req.body.frght;
                delveryentry.frght_rt = req.body.frght_rt;
                delveryentry.frght_adv = req.body.frght_adv;
                delveryentry.cre_days = req.body.cre_days;
                delveryentry.add1_rmk = req.body.add1_rmk;
                delveryentry.add1_amt = req.body.add1_amt;
                delveryentry.less1_rmk = req.body.less1_rmk;
                delveryentry.less1_amt = req.body.less1_amt;
                delveryentry.add2_rmk = req.body.add2_rmk;
                delveryentry.add2_amt = req.body.add2_amt;
                delveryentry.less2_rmk = req.body.less2_rmk;
                delveryentry.less2_amt = req.body.less2_amt;
                delveryentry.add3_rmk = req.body.add3_rmk;
                delveryentry.add3_amt = req.body.add3_amt;
                delveryentry.less3_rmk = req.body.less3_rmk;
                delveryentry.less3_amt = req.body.less3_amt;
                delveryentry.barg_amt = req.body.barg_amt;
                delveryentry.bill_amt = req.body.bill_amt;
                delveryentry.co_code =  req.session.compid;
                delveryentry.div_code =  req.session.divid;
                delveryentry.usrnm =  req.session.user;
                delveryentry.masterid = req.session.masterid;
               
                let saud = {};
                saud.main_bk = "DLV";
                saud.typ = "SL";
                saud.srno = 1;
                saud.sd_date = sdDateObject;
                saud.sd_datemilisecond = SDDateMiliSeconds;
                saud.vouc_code = req.body.vouc_code;
                saud.contract_sauda_group = req.body.contract_sauda_group;
                saud.pcode = req.body.sl_code;
                saud.sauda_number = req.body.sauda_number;
                saud.co_code =  req.session.compid;
                saud.div_code =  req.session.divid;
                saud.usrnm =  req.session.user;
                saud.masterid = req.session.masterid;
               let query = {sauda1:req.params.id,typ:"SL",main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
            //    console.log(query);
               delveryentry2.update(query ,saud ,function (err) {   });
                    let saud1 = {};
                    saud1.main_bk = "DLV";
                    saud1.typ = "BR";
                    saud1.srno = 1;
                    saud1.sd_date = sdDateObject;
                    saud1.sd_datemilisecond = SDDateMiliSeconds;
                    saud1.vouc_code = req.body.vouc_code;
                    saud1.contract_sauda_group = req.body.contract_sauda_group;
                    saud1.pcode = req.body.br_code;
                    saud1.sauda_number = req.body.sauda_number;
                    saud1.co_code =  req.session.compid;
                    saud1.div_code =  req.session.divid;
                    saud1.usrnm =  req.session.user;
                    saud1.masterid = req.session.masterid;
               let q = {sauda1:req.params.id,typ:"BR",main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
                //    console.log(q);
                    delveryentry2.update(q ,saud1 ,function (err) {  });
                    let saud2 = {};
                    saud2.main_bk = "DLV";
                    saud2.typ = "SB";
                    saud2.srno = 1;
                    saud2.sd_date = sdDateObject;
                    saud2.sd_datemilisecond = SDDateMiliSeconds;
                    saud2.vouc_code = req.body.vouc_code;
                    saud2.contract_sauda_group = req.body.contract_sauda_group;
                    saud2.pcode = req.body.sb_code;
                    saud2.sauda_number = req.body.sauda_number;
                    saud2.co_code =  req.session.compid;
                    saud2.div_code =  req.session.divid;
                    saud2.usrnm =  req.session.user;
                    saud2.masterid = req.session.masterid;
               let SB = {sauda1:req.params.id,typ:"SB",main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
                //    console.log(q);
                    delveryentry2.update(SB ,saud2 ,function (err) {  });
                    let saud3 = {};
                    saud3.main_bk = "DLV";
                    saud3.typ = "BB";
                    saud3.srno = 1;
                    saud3.sd_date = sdDateObject;
                    saud3.sd_datemilisecond = SDDateMiliSeconds;
                    saud3.vouc_code = req.body.vouc_code;
                    saud3.contract_sauda_group = req.body.contract_sauda_group;
                    saud3.pcode = req.body.bb_code;
                    saud3.sauda_number = req.body.sauda_number;
                    saud3.co_code =  req.session.compid;
                    saud3.div_code =  req.session.divid;
                    saud3.usrnm =  req.session.user;
                    saud3.masterid = req.session.masterid;
               let BB = {sauda1:req.params.id,typ:"BB",main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
                //    console.log(q);
                    delveryentry2.update(BB ,saud3 ,function (err) {  });
                    let outst = {};
                    outst.main_bk = "DLV";
                    outst.c_j_s_p = req.body.c_j_s_p;
                    outst.srno = 1;
                    outst.sd_date = sdDateObject;
                    outst.sd_datemilisecond = SDDateMiliSeconds;
                    outst.vouc_code = req.body.vouc_code;
                    outst.sl_code = req.body.sl_code;
                    outst.sb_code = req.body.sb_code;
                    outst.br_code = req.body.br_code;
                    outst.bb_code = req.body.bb_code;
                    outst.term = req.body.term;
                    outst.paycond = req.body.paycond;
                    outst.paydiscrt = req.body.paydiscrt;
                    outst.tot_ammount = req.body.tot_ammount;
                    outst.barg_amt = req.body.barg_amt;
                    outst.bill_amt = req.body.bill_amt;
                    outst.outs_amt = req.body.outs_amt;
                    outst.outs_rec = req.body.outs_rec;
                    outst.outs_exp = req.body.outs_exp;
                    outst.outs_clr = req.body.outs_clr;
                    outst.pono = req.body.bno;
                    outst.podt = req.body.bdt;
                    outst.adj_yr = req.body.adj_yr;
                    outst.adj_cocode = req.body.adj_cocode;
                    outst.adj_main_bk = req.body.adj_main_bk;
                    outst.adj_c_j_s_p = req.body.adj_c_j_s_p;
                    outst.adj_vouc_chr = req.body.adj_vouc_chr;
                    outst.co_code =  req.session.compid;
                    outst.div_code =  req.session.divid;
                    outst.usrnm =  req.session.user;
                    outst.masterid= req.session.masterid;
                    let out = {sauda1:req.params.id,main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
                //    console.log(out);
                   outstading.update(out ,outst ,function (err) { });
                    let quer = {_id:req.params.id}
                    delveryentry1.update(quer ,delveryentry ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving delveryentry', 'errors': err });
                        return;
                    } else {
                        res.redirect('/delivery_entry/delivery_entry_list');
                    }
                });
            }
        });
        router.get('/delete_delivery_entry/', function(req, res){
                let query = req.query.data;
                let saud2query = req.query.sauda2;
                let del = req.query.del;
                var dealarray = query.split(',');
                var delsaud2query = saud2query.split(',');
                if(del=="no")
                {
                    res.json({ 'success': true, 'message': 'Can Be Deleted'});
                }
                else if(del == "yes")
                {
                    for (var j = 0; j < dealarray.length; j++) {
                        var myObject = {
                            "_id": dealarray[j],
                        };
                        delveryentry1.remove(myObject,function(err){});
                    }
                    for (var i = 0; i < delsaud2query.length; i++) {
                        var myObjectdealentry2 = {
                            "sauda1": delsaud2query[i],
                        };
                        delveryentry2.remove(myObjectdealentry2,function(err){});
                    }
                    for (var i = 0; i < delsaud2query.length; i++) {
                    var myObjectoutstading = {
                        "saudaid": delsaud2query[i],
                    };
                    outstading.remove(myObjectoutstading,function(err){});
                    }
                    //  res.redirect('/delivery_entry/delivery_entry_list');
                    res.json({ 'success': true, 'message': 'Deleted Successfully'});
        }
                });
// Access Control 
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/userright/login');
    }
}

module.exports = router;