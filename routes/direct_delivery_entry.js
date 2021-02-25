const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let delveryentry1 = require('../models/contract_sauda_schema');
let dirdelveryentry2 = require('../models/contract_sauda2');
let brand = require('../models/brand_schema');
let product_mast = require('../models/product_mast_schema');
let term = require('../models/term_schema');
let party = require('../models/party_schema');
let narration = require('../models/narration_schema');
let city = require('../models/city_schema');
 let transport = require('../models/transport_schema');
 const moment = require('moment-timezone');
var query;
// router.get('/packname', function (req, res) {
//     if( req.query.id ) {
//         product_mast.find({sno: req.query.id}, 'product_mast_group', function(err, product_mast){
//             console.log(product_mast);
//             res.json({ 'success': true, 'sno': product_mast});
//         });
//     }
// });
router.get('/kindname', function (req, res) {
    if( req.query.id ) {
        party.findById(req.query.id, function(err, party){
            console.log(party);
            res.json({ 'success': true, 'party': party });
        });
    }
});
// Add Route
router.get('/direct_delivery_entry', ensureAuthenticated, function(req, res){
    delveryentry1.find({main_bk:"DDLV",co_code:req.session.compid,div_code:req.session.divid}, function (err, delveryentry1){
    brand.find({masterid:req.session.masterid}, function (err, brand){
      term.find({}, function (err, term){
        //  party.find({masterid:req.session.masterid}, function (err, party){
            narration.find({masterid:req.session.masterid}, function (err, narration){
            //   city.find({}, function (err, city){
                 product_mast.find({masterid:req.session.masterid}, function (err, product_mast){
                    transport.find({masterid:req.session.masterid}, function (err, transport){
            if (err) {
                console.log(err);
            } else {
                res.render('direct_delivery_entry.hbs', {
                    pageTitle:'Add delivery',
                    delveryentry1: delveryentry1,
                    brand: brand,
                    term: term,
                    // party: party,
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
            }
           }).sort({'transport_name':1});
          }).sort({'product_name':1});
        // });
      }).sort({'narration_name':1});
    // }).populate('city_name');
   }).sort({'term_name':1});
  }).sort({'brand_name':1});
}).sort('-vouch_code');
});
    router.post('/add',function(req, res){
        //console.log(req.body);
        if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.tptcode=="") req.body.tptcode=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.term=="") req.body.term=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.party_terms=="") req.body.party_terms=mongoose.Types.ObjectId('578df3efb618f5141202a196');
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
            delveryentry1.find({main_bk:"DDLV",co_code:req.session.compid,div_code:req.session.divid}, function (err, delventryno){
            var entrylength = delventryno.length+1;
            let delveryentry = new delveryentry1();
            delveryentry.brok_yn = req.body.brok_yn;
            delveryentry.main_bk ='DDLV';
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
            delveryentry.masterid=req.session.masterid;
            let delvery = new dirdelveryentry2();
            delvery.sauda1 =delveryentry._id;
            delvery.main_bk = "DDLV";
            delvery.typ = "SL";
            delvery.srno = 1;
            delvery.sd_date = sdDateObject;
            delvery.vouc_code = entrylength;
            delvery.contract_sauda_group = req.body.contract_sauda_group;
            delvery.pcode = req.body.sl_code;
            delvery.sauda_number = req.body.sauda_number;
            delvery.co_code =  req.session.compid;
            delvery.div_code =  req.session.divid;
            delvery.usrnm =  req.session.user;
            delvery.masterid=req.session.masterid;
            delvery.save();
            
            let delvery2 = new dirdelveryentry2();
            delvery2.sauda1 =delveryentry._id;
            delvery2.main_bk = "DDLV";
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
            delvery2.masterid=req.session.masterid;
            delvery2.save();

            let delvery3 = new dirdelveryentry2();
            delvery3.sauda1 =delveryentry._id;
            delvery3.main_bk = "DDLV";
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
            delvery3.masterid=req.session.masterid;
            delvery3.save();

            let delvery4 = new dirdelveryentry2();
            delvery4.sauda1 =delveryentry._id;
            delvery4.main_bk = "DDLV";
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
            delvery4.masterid=req.session.masterid;
            delvery4.save();
            delveryentry.sauda2 = delvery._id;
            delveryentry.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving delvery entry','errors':err});
                return;
            }
            else
            {
                res.redirect('/direct_delivery_entry/direct_delivery_entry_list');
            }
            });
        }).sort('-vouc_code');
        }               
    });
    router.get('/direct_delivery_entry_list', ensureAuthenticated ,function(req,res){
        delveryentry1.find({main_bk : "DDLV",co_code:req.session.compid,div_code:req.session.divid}, function (err,delveryentry1){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('direct_delivery_entry_list.hbs',{
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
       router.get('/direct_entry_list_update/:id', ensureAuthenticated, function(req, res){
        delveryentry1.findById(req.params.id, function(err, delveryentry1){
          brand.find({masterid:req.session.masterid}, function (err, brand){
            term.find({}, function (err, term){
              party.find({masterid:req.session.masterid}, function (err, party){
                narration.find({masterid:req.session.masterid}, function (err, narration){
                //   city.find({}, function (err, city){
                    product_mast.find({masterid:req.session.masterid}, function (err, product_mast){
                        transport.find({masterid:req.session.masterid}, function (err, transport){
                if (err) {
                    console.log(err);
                } else {
                    res.render('direct_delivery_entry_list_update.hbs',{
                        pageTitle:'Update delvery entry',
                        delveryentry1: delveryentry1,
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
}).populate('sauda2')
});
        
        router.post('/direct_entry_list_update/:id', function(req, res) {
            if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.tptcode=="") req.body.tptcode=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.term=="") req.body.term=mongoose.Types.ObjectId('578df3efb618f5141202a196');    
            if(req.body.party_terms=="") req.body.party_terms=mongoose.Types.ObjectId('578df3efb618f5141202a196');
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
                delveryentry.main_bk ='DDLV';
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
                delveryentry.masterid=req.session.masterid;
                let saud = {};
                saud.main_bk ="DDLV";
                saud.typ = "SL";
                saud.srno = 1;
                saud.sd_date = sdDateObject;
                saud.sd_datemilisecond = SDDateMiliSeconds;
                saud.vouc_code = req.body.vouc_code;
                saud.contract_sauda_group = req.body.contract_sauda_group;
                saud.pcode = req.body.sl_code;
                saud.co_code =  req.session.compid;
                saud.div_code =  req.session.divid;
                saud.usrnm =  req.session.user;
                saud.masterid=req.session.masterid;
               let query = {sauda1:req.params.id,typ:"SL",main_bk:"DDLV"};
               dirdelveryentry2.update(query ,saud ,function (err) {});
                    let saud1 = {};
                    saud1.main_bk ="DDLV";
                    saud1.typ = "BR";
                    saud1.srno = 1;
                    saud1.sd_date = sdDateObject;
                    saud1.sd_datemilisecond = SDDateMiliSeconds;
                    saud1.vouc_code = req.body.vouc_code;
                    saud1.contract_sauda_group = req.body.contract_sauda_group;
                    saud1.pcode = req.body.br_code;
                    saud1.co_code =  req.session.compid;
                    saud1.div_code =  req.session.divid;
                    saud1.usrnm =  req.session.user;
                    saud1.masterid=req.session.masterid;
               let q = {sauda1:req.params.id,typ:"BR",main_bk:"DDLV",co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
                    dirdelveryentry2.update(q ,saud1 ,function (err) {});
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
                dirdelveryentry2.update(SB ,saud2 ,function (err) {  });
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
                dirdelveryentry2.update(BB ,saud3 ,function (err) {  });
                    // Delibery.update
                    let quer = {_id:req.params.id}
                    delveryentry1.update(quer ,delveryentry ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving delveryentry', 'errors': err });
                        return;
                    } else {
                        res.redirect('/direct_delivery_entry/direct_delivery_entry_list');
                    }
                });
            }
        });
        router.get('/delete_direct_delivery_entry/', function(req, res){
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
                    dirdelveryentry2.remove(myObjectdealentry2,function(err){});
                }
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