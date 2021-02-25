const express = require('express');
const router = express.Router(); 
const session = require('express-session');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
//let contract = require('../models/contract_sauda_schema');
let brand = require('../models/brand_schema');
let product_mast = require('../models/product_mast_schema');
let productname = require('../models/product_mast_schema');
let term = require('../models/term_schema');
let party = require('../models/party_schema');
let narration = require('../models/narration_schema');
let city = require('../models/city_schema');
//let sauda = require('../models/contract_sauda2');
let div_com = require('../models/company_schema');
let transport = require('../models/transport_schema');
let district_master = require('../models/district_schema');
let state_master = require('../models/state_schema');
// let bank = require('../models/bank_schema');
var query;

////pdf
var phantom = require('phantom');   
router.get('/newjobentry_pdf1/:id', ensureAuthenticated, function(req, res){
phantom.create().then(function(ph) {
    ph.createPage().then(function(page) {
        page.open("http://localhost:3000/newjobentry/newjobentry_print?id="+req.params.id+"").then(function(status) {
            page.render('softsauda.pdf').then(function() {
                console.log(req.params.id);
                console.log('Page Rendered');
                ph.exit();
            });
        });
    });
});
});

router.get('/getparty', function (req, res) {
    var qry = req.query.term.term;
    party.find({$or: [{ 'party_name': new RegExp(qry)},{'partshortname':new RegExp(qry)}],'p_type': /.*S.*/i,masterid:req.session.masterid},'party_name',  function(err, party){
        var data = new Array();
        for (var j = 0; j < party.length; j++) {
            if (party[j]['city_name'] != null) cityname = party[j]['city_name']['city_name'];
            else cityname = "";
            data[j] = {
                "id": party[j]._id,
                "text" : party[j].party_name + ','+ cityname
                };
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    }).sort({'party_name':1}).populate('city_name');
});
router.get('/sbparty', function (req, res) {
    var qry = req.query.term.term;
    party.find({$or: [{ 'party_name': new RegExp(qry)},{'partshortname':new RegExp(qry)}],'p_type': /.*T.*/i,masterid:req.session.masterid},'party_name',  function(err, party){
        var data = new Array();
        for (var j = 0; j < party.length; j++) {
            if (party[j]['city_name'] != null) cityname = party[j]['city_name']['city_name'];
            else cityname = "";
            data[j] = {
                "id": party[j]._id,
                "text" : party[j].party_name + ','+ cityname
                };
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    }).sort({'party_name':1}).populate('city_name');
});
router.get('/brparty', function (req, res) {
    var qry = req.query.term.term;
    party.find({$or: [{ 'party_name': new RegExp(qry)},{'partshortname':new RegExp(qry)}],'p_type': /.*B.*/i,masterid:req.session.masterid},'party_name',  function(err, party){
        var data = new Array();
        for (var j = 0; j < party.length; j++) {
            if (party[j]['city_name'] != null) cityname = party[j]['city_name']['city_name'];
            else cityname = "";
            data[j] = {
                "id": party[j]._id,
                "text" : party[j].party_name + ','+ cityname
                };
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    }).sort({'party_name':1}).populate('city_name');
});


router.get('/bbparty', function (req, res) {
    var qry = req.query.term.term;
    party.find({$or: [{ 'party_name': new RegExp(qry)},{'partshortname':new RegExp(qry)}],'p_type': /.*R.*/i,masterid:req.session.masterid},'party_name',  function(err, party){
        var data = new Array();
        for (var j = 0; j < party.length; j++) {
            if (party[j]['city_name'] != null) cityname = party[j]['city_name']['city_name'];
            else cityname = "";
            data[j] = {
                "id": party[j]._id,
                "text" : party[j].party_name + ','+ cityname
                };
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    }).sort({'party_name':1}).populate('city_name');
});

router.get('/getproductname', function (req, res) {
    var qry = req.query.term.term;
    console.log(qry)
    product_mast.find({'short_name': new RegExp(qry),masterid:req.session.masterid},function(err, product_mast){
        var data = new Array();
        for (var j = 0; j < product_mast.length; j++) {
            data[j] = {
                "id": product_mast[j]._id,
                "text" : product_mast[j].product_name
                };
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    }).sort({'party_name':1}).populate('city_name');
});
router.get('/getcontractlist', function (req, res) {
    contract.find({main_bk:"SD",co_code:req.session.compid,div_code:req.session.divid},  function(err, contract){
        var data = new Array();
        var i=0;
        for (var j = 0; j < contract.length; j++) {
            i++;
            var sdDateObject = moment(contract[j].sd_date).tz("Asia/Kolkata").format('DD/MM/YYYY');
            if (contract[j]['sl_code'] != null) slcode = contract[j]['sl_code']['party_name'];
            else slcode = "";
            if (contract[j]['br_code'] != null) brcode = contract[j]['br_code']['party_name'];
			else brcode = "";
            data[j] = {
                        // "id":  i,
                        "Sno" : contract[j].main_bk,
                        // "vouchcode" :contract[j].vouc_code,
                        "Date" : sdDateObject,
                        "Seller" : slcode,
                        "Buyer" : brcode,
                        "Action" : contract[j]._id,
            
            };
        }
        res.json({"draw": 1,"recordsTotal": 57,"recordsFiltered": 57,'data':  data });
    }).populate('sl_code').populate('br_code');
});
router.get('/packname', function (req, res) {
    if( req.query.id ) {
        product_mast.findById(req.query.id, function(err, product_mast){
            // console.log(party);
            res.json({ 'success': true, 'product_mast': product_mast,'compstatecode': req.session.compstatecode });
        });
    }
});
router.get('/brokrate', function (req, res) {
    if( req.query.id ) {
        product_mast.findById(req.query.id, function(err, product_mast){
            productname.find({masterid:req.session.masterid}, function(err, productname){
            res.json({ 'success': true, 'product_mast': product_mast,'productname': productname});
        });
    });
    }
});
router.get('/kindname', function (req, res) {
    if( req.query.id ) {
        party.findById(req.query.id, function(err, party){
            // console.log(party);
            res.json({ 'success': true, 'party': party });
        }).populate('city_name');
    }
});
router.get('/productname', function (req, res) {
        product_mast.find({masterid:req.session.masterid}, function(err, product_mast){
            brand.find({masterid:req.session.masterid}, function(err, brand){
            res.json({ 'success': true, 'product_mast': product_mast,'brand': brand });
        }).sort({'brand_name':1});
}).sort({'product_name':1});
});
// Add Route
router.get('/contract_sauda', ensureAuthenticated, function(req, res){
  contract.find({main_bk:"SD",co_code:req.session.compid,div_code:req.session.divid}, function (err, contract){
    brand.find({masterid:req.session.masterid},'brand_name', function (err, brand){
      term.find({}, 'term_name',function (err, term){
            narration.find({masterid:req.session.masterid}, 'narration_name',function (err, narration){
                 product_mast.find({masterid:req.session.masterid},'product_name', function (err, product_mast){
                    transport.find({masterid:req.session.masterid}, 'transport_name',function (err, transport){
            if (err) {
                console.log(err);
            } else {
                  res.render('contract_sauda.hbs', {
                    pageTitle:'Add contract',
                    contract: contract,
                    brand: brand,
                    term: term,
                    party: party,
                    narration: narration,
                    city: city,
                    district_master: district_master,
                    transport: transport,
                    product_mast: product_mast,
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
        }).sort({'narration_name':1});
    }).sort({'term_name':1});
   }).sort({'brand_name':1});
  }).populate('sl_code').sort('-vouc_code');
});
    router.post('/add',function(req, res){
       if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.party_terms=="") req.body.party_terms=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       if(req.body.term=="") req.body.term=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       
        let errors = req.validationErrors();
        var lastdlvid='';
        var sd_date = req.body.sd_date;
        var sdDateObject =  moment(sd_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var SDDateMiliSeconds = sdDateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            contract.find({main_bk:"SD",co_code:req.session.compid,div_code:req.session.divid}, function (err, contractno){
            var entrylength = contractno.length+1;
            let contrct = new contract();
            contrct.brok_yn = req.body.brok_yn;
            contrct.main_bk ='SD';
            contrct.c_j_s_p = req.body.c_j_s_p;
            contrct.vouc_code = entrylength;
            contrct.sd_date = sdDateObject;
            contrct.sd_datemilisecond = SDDateMiliSeconds;
            contrct.sl_brok = req.body.sl_brok;
            contrct.sl_code = req.body.sl_code;
            contrct.sl_cont = req.body.sl_cont;
            contrct.sb_brok = req.body.sb_brok;
            contrct.sb_code = req.body.sb_code;
            contrct.sb_cont = req.body.sb_cont;
            contrct.br_brok = req.body.br_brok;
            contrct.br_code = req.body.br_code;
            contrct.br_cont = req.body.br_cont;
            contrct.bb_brok = req.body.bb_brok;
            contrct.bb_code = req.body.bb_code;
            contrct.bb_cont = req.body.bb_cont;
            contrct.pono = req.body.pono;
            contrct.podt = req.body.podt;
            contrct.buy_whouse = req.body.buy_whouse;
            contrct.rmks = req.body.rmks;
            contrct.delv_load = req.body.delv_load;
            contrct.delv_fr = req.body.delv_fr;
            contrct.delv_to = req.body.delv_to;
            contrct.term = req.body.term;
            contrct.delvdt = req.body.delvdt;
            contrct.from_ct = req.body.from_ct;
            contrct.to_ct = req.body.to_ct;
            contrct.paycond = req.body.paycond;
            contrct.paydiscrt = req.body.paydiscrt;
            contrct.paycond = req.body.paycond;
            contrct.cre_days = req.body.cre_days;
            contrct.paydet = req.body.paydet;
            contrct.party_terms = req.body.party_terms;
            contrct.party_remarks = req.body.party_remarks;
            contrct.tot_bags = req.body.tot_bags;
            contrct.tot_wght = req.body.tot_wght;
            contrct.tot_ammount = req.body.tot_ammount;
            contrct.co_code =  req.session.compid;
            contrct.div_code =  req.session.divid;
            contrct.usrnm =  req.session.user;
            contrct.masterid =   req.session.masterid
            let saud = new sauda();
            saud.sauda1 =contrct._id;
            saud.main_bk = "SD";
            saud.typ = "SL";
            saud.srno = 1;
            saud.sd_date = sdDateObject;
            saud.sd_datemilisecond = SDDateMiliSeconds;
            saud.vouc_code =entrylength;
            saud.contract_sauda_group = req.body.contract_sauda_group;
            saud.pcode = req.body.sl_code;
            saud.sauda_number = req.body.sauda_number;
            saud.co_code =  req.session.compid;
            saud.div_code =  req.session.divid;
            saud.usrnm =  req.session.user;
            saud.masterid =   req.session.masterid
            saud.save();
            
            let saud1 = new sauda();
            saud1.sauda1 =contrct._id;
            saud1.main_bk = "SD";
            saud1.typ = "BR";
            saud1.srno = 1;
            saud1.sd_date =sdDateObject;
            saud1.sd_datemilisecond = SDDateMiliSeconds;
            saud1.vouc_code = entrylength;
            saud1.contract_sauda_group = req.body.contract_sauda_group;
            saud1.pcode = req.body.br_code;
            saud1.sauda_number = req.body.sauda_number;
            saud1.co_code =  req.session.compid;
            saud1.div_code =  req.session.divid;
            saud1.usrnm =  req.session.user;
            saud1.masterid =   req.session.masterid
             lastdlvid = saud1._id;
            // console.log(lastdlvid);
            saud1.save();

            let saud2 = new sauda();
            saud2.sauda1 =contrct._id;
            saud2.main_bk = "SD";
            saud2.typ = "SB";
            saud2.srno = 1;
            saud2.sd_date =sdDateObject;
            saud2.sd_datemilisecond = SDDateMiliSeconds;
            saud2.vouc_code = entrylength;
            saud2.contract_sauda_group = req.body.contract_sauda_group;
            saud2.pcode = req.body.sb_code;
            saud2.sauda_number = req.body.sauda_number;
            saud2.co_code =  req.session.compid;
            saud2.div_code =  req.session.divid;
            saud2.usrnm =  req.session.user;
            saud2.masterid =   req.session.masterid
            saud2.save();
            let saud3 = new sauda();
            saud3.sauda1 =contrct._id;
            saud3.main_bk = "SD";
            saud3.typ = "BB";
            saud3.srno = 1;
            saud3.sd_date =sdDateObject;
            saud3.sd_datemilisecond = SDDateMiliSeconds;
            saud3.vouc_code =entrylength;
            saud3.contract_sauda_group = req.body.contract_sauda_group;
            saud3.pcode = req.body.bb_code;
            saud3.sauda_number = req.body.sauda_number;
            saud3.co_code =  req.session.compid;
            saud3.div_code =  req.session.divid;
            saud3.usrnm =  req.session.user;
            saud3.masterid =   req.session.masterid
            saud3.save();


            contrct.sauda2 = saud._id;
            contrct.save(function (err){ });
        }).sort('-vouc_code');      
      
        if(req.body.printormessage=="msg")
        {

            phantom.create().then(function(ph) {
                ph.createPage().then(function(page) {
                    page.open("http://www.softsauda.com:3000/contract_sauda/contract_sauda_print?id="+contrct._id+"&compid="+req.session.compid).then(function(status) {
                        page.render('public/pdf/ssd'+contrct._id+'.'+req.session.compid+'.pdf').then(function() {
                            console.log(req.params.id);
                            // console.log('Page Rendered');
                            ph.exit();
                        });
                    });

                });
                ph.createPage().then(function(page1) {
                    var mmsgmatt = "http://www.softsauda.com:3000/pdf/ssd"+contrct._id+"."+req.session.compid+".pdf";
                    var mmsgapikey ="81489Ap1xYSudcQzr57565808";
                    var mmsgmobnm =req.body.sl_mob +","+req.body.br_mob;
                    // console.log(mmsgmobnm);
                    page1.open("http://sms.sandeshseva.com/api/sendhttp.php?authkey="+mmsgapikey+"&mobiles="+mmsgmobnm+"&message="+mmsgmatt+"&sender=SOFTSD&route=4").then(function(status) {
                });    

            });
            });
        }
        // console.log(req.body.printormessage);
        if(req.body.printormessage=="submitDelv")
          {
            contract.find({main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid}, function (err, contractno){
            var entrylength = contractno.length+1;
            let contrct = new contract();
            contrct.brok_yn = req.body.brok_yn;
            contrct.main_bk ='DLV';
            contrct.c_j_s_p = req.body.c_j_s_p;
            contrct.vouc_code = entrylength;
            contrct.sd_date = sdDateObject;
            contrct.sd_datemilisecond = SDDateMiliSeconds;
            contrct.sl_brok = req.body.sl_brok;
            contrct.bno = req.body.bno;
            contrct.bdt = req.body.bdt;
            contrct.mot_no = req.body.mot_no;
            contrct.tptcode = req.body.tptcode;
            contrct.tpt_col = req.body.tpt_col;
            contrct.frght = req.body.frght;
            contrct.frght_rt = req.body.frght_rt;
            contrct.frght_adv = req.body.frght_adv;
            contrct.sl_code = req.body.sl_code;
            contrct.sl_cont = req.body.sl_cont;
            contrct.sb_brok = req.body.sb_brok;
            contrct.sb_code = req.body.sb_code;
            contrct.sb_cont = req.body.sb_cont;
            contrct.br_brok = req.body.br_brok;
            contrct.br_code = req.body.br_code;
            contrct.br_cont = req.body.br_cont;
            contrct.bb_brok = req.body.bb_brok;
            contrct.bb_code = req.body.bb_code;
            contrct.bb_cont = req.body.bb_cont;
            contrct.pono = req.body.pono;
            contrct.podt = req.body.podt;
            contrct.buy_whouse = req.body.buy_whouse;
            contrct.rmks = req.body.rmks;
            contrct.delv_load = req.body.delv_load;
            contrct.delv_fr = req.body.delv_fr;
            contrct.delv_to = req.body.delv_to;
            contrct.term = req.body.term;
            contrct.delvdt = req.body.delvdt;
            contrct.from_ct = req.body.from_ct;
            contrct.to_ct = req.body.to_ct;
            contrct.paycond = req.body.paycond;
            contrct.paydiscrt = req.body.paydiscrt;
            contrct.paycond = req.body.paycond;
            contrct.cre_days = req.body.cre_days;
            contrct.paydet = req.body.paydet;
            contrct.party_terms = req.body.party_terms;
            contrct.party_remarks = req.body.party_remarks;
            contrct.tot_bags = req.body.tot_bags_dlv;
            contrct.tot_wght = req.body.tot_wght_dlv;
            contrct.tot_ammount = req.body.tot_ammount_dlv;
            contrct.co_code =  req.session.compid;
            contrct.div_code =  req.session.divid;
            contrct.usrnm =  req.session.user;
            contrct.masterid =   req.session.masterid
            let saud = new sauda();
            saud.sauda1 =contrct._id;
            saud.main_bk = "DLV";
            saud.typ = "SL";
            saud.srno = 1;
            saud.sd_date = sdDateObject;
            saud.sd_datemilisecond = SDDateMiliSeconds;
            saud.vouc_code = entrylength;
            saud.contract_sauda_group = req.body.contract_sauda_group_dlv;
            saud.pcode = req.body.sl_code;
            saud.sauda_number = req.body.sauda_number;
            saud.co_code =  req.session.compid;
            saud.div_code =  req.session.divid;
            saud.usrnm =  req.session.user;
            saud.masterid =   req.session.masterid
            saud.save();
            
            let saud1 = new sauda();
            saud1.sauda1 =contrct._id;
            saud1.main_bk = "DLV";
            saud1.typ = "BR";
            saud1.srno = 1;
            saud1.sd_date =sdDateObject;
            saud1.sd_datemilisecond = SDDateMiliSeconds;
            saud1.vouc_code = entrylength;
            var index=0;
            for(var i = 0; i<req.body.contract_sauda_group_dlv.length; i++)
            {
                req.body.contract_sauda_group_dlv[i]['sd2id'] =lastdlvid;
                req.body.contract_sauda_group_dlv[i]['sd2srno'] =index++;                
            }            
            saud1.contract_sauda_group = req.body.contract_sauda_group_dlv;
            saud1.usrnm = req.session.user;
            saud1.pcode = req.body.br_code;
            saud1.sauda_number = req.body.sauda_number;
            saud1.co_code =  req.session.compid;
            saud1.div_code =  req.session.divid;
            saud1.masterid =   req.session.masterid
            saud1.save();

            let saud2 = new sauda();
            saud2.sauda1 =contrct._id;
            saud2.main_bk = "DLV";
            saud2.typ = "SB";
            saud2.srno = 1;
            saud2.sd_date =sdDateObject;
            saud2.sd_datemilisecond = SDDateMiliSeconds;
            saud2.vouc_code = entrylength;
            saud2.contract_sauda_group = req.body.contract_sauda_group_dlv;
            saud2.pcode = req.body.sb_code;
            saud2.sauda_number = req.body.sauda_number;
            saud2.co_code =  req.session.compid;
            saud2.div_code =  req.session.divid;
            saud2.usrnm =  req.session.user;
            saud2.masterid =   req.session.masterid
            saud2.save();

            let saud3 = new sauda();
            saud3.sauda1 =contrct._id;
            saud3.main_bk = "DLV";
            saud3.typ = "BB";
            saud3.srno = 1;
            saud3.sd_date =sdDateObject;
            saud3.sd_datemilisecond = SDDateMiliSeconds;
            saud3.vouc_code = entrylength;
            saud3.contract_sauda_group = req.body.contract_sauda_group_dlv;
            saud3.pcode = req.body.bb_code;
            saud3.sauda_number = req.body.sauda_number;
            saud3.co_code =  req.session.compid;
            saud3.div_code =  req.session.divid;
            saud3.usrnm =  req.session.user;
            saud3.masterid =   req.session.masterid
            saud3.save();

            contrct.sauda2 = saud._id;
            contrct.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving contrct','errors':err});
                return;
            }
            else
            {
                res.redirect('/contract_sauda/contract_sauda');
            }
            });  
        }).sort('-vouc_code');  
          }
           else 
           {
                res.redirect('/contract_sauda/contract_sauda');
           } 
       
            } 
                          
    });
    router.get('/contract_sauda_list', ensureAuthenticated ,function(req,res){
        contract.find({main_bk:"SD",co_code:req.session.compid,div_code:req.session.divid}, function (err,contract){
            if(err)
            {
                console.log(err);
            }
            else
            {
                
                res.render('contract_sauda_list.hbs',{
                    pageTitle:'contract List',
                    contract:contract,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).populate('sl_code').populate('br_code').populate('sauda2');   
       });
       
       router.get('/contract_sauda_list_update/:id', ensureAuthenticated, function(req, res){
            contract.findById(req.params.id, function(err, contract){
          brand.find({masterid:req.session.masterid},'brand_name', function (err, brand){
            term.find({}, 'term_name',function (err, term){
            //   party.find({masterid:req.session.masterid}, function (err, party){
                narration.find({masterid:req.session.masterid},'narration_name', function (err, narration){
                //   city.find({},'city_name', function (err, city){
                    product_mast.find({masterid:req.session.masterid},'product_name', function (err, product_mast){
                if (err) {
                    console.log(err);
                } else {
                    res.render('contract_sauda_list_update.hbs', {
                        pageTitle:'Update Party',
                        contract: contract,
                        sauda: sauda,
                        brand: brand,
                        term: term,
                        party: party,
                        narration: narration,
                        // city: city,
                        product_mast: product_mast,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                    });
                }
            }).sort({'product_name':1});
        //  }).sort({'city_name':1});
      }).sort({'narration_name':1});
    // }).sort({'party_name':1}).populate('city_name'); 
}).sort({'term_name':1});
}).sort({'brand_name':1});
}).populate('sl_code').populate('sb_code').populate('br_code').populate('bb_code').populate('from_ct')
.populate('to_ct')
.populate('sauda2');
});
router.get('/contract_sauda_print/', ensureAuthenticated, function(req, res){
    contract.findById(req.query.id, function(err, contract){
        div_com.findById(req.query.compid, function (err,div_com){
        if (err) {
            console.log(err);
        } else {
            res.render('contract_sauda_print.hbs', {
                pageTitle:'contract sauda print',
                contract: contract,
                sauda: sauda,
                brand: brand,
                term: term,
                party: party,
                narration: narration,
                city: city,
                product_mast: product_mast,
                div_com: div_com,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
        }
    })
}).populate([{path: 'sl_code',
populate:{ path: 'city_name'}
}]).populate([{path: 'sl_code',
populate:{ path: 'state_name'}
}]).populate([{path: 'br_code',
populate:{ path: 'city_name',}
}]).populate([{path: 'br_code',
populate:{ path: 'state_name'}
}]).populate('sauda2');
});

        router.post('/update/:id', function(req, res) {
            if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.party_terms=="") req.body.party_terms=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.term=="") req.body.term=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            var sd_date = req.body.sd_date;
            var sdDateObject =  moment(sd_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var SDDateMiliSeconds = sdDateObject.format('x');
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let contrct = {};
                contrct.brok_yn = req.body.brok_yn;
                contrct.main_bk ='SD';
                contrct.c_j_s_p = req.body.c_j_s_p;
                contrct.vouc_code = req.body.vouc_code;
                contrct.sd_date = sdDateObject;
                contrct.sd_datemilisecond = SDDateMiliSeconds;
                contrct.sl_brok = req.body.sl_brok;
                contrct.sl_code = req.body.sl_code;
                contrct.sl_cont = req.body.sl_cont;
                contrct.sb_brok = req.body.sb_brok;
                contrct.sb_code = req.body.sb_code;
                contrct.sb_cont = req.body.sb_cont;
                contrct.br_brok = req.body.br_brok;
                contrct.br_code = req.body.br_code;
                contrct.br_cont = req.body.br_cont;
                contrct.bb_brok = req.body.bb_brok;
                contrct.bb_code = req.body.bb_code;
                contrct.bb_cont = req.body.bb_cont;
                contrct.pono = req.body.pono;
                contrct.podt = req.body.podt;
                contrct.buy_whouse = req.body.buy_whouse;
                contrct.rmks = req.body.rmks;
                contrct.delv_load = req.body.delv_load;
                contrct.delv_fr = req.body.delv_fr;
                contrct.delv_to = req.body.delv_to;
                contrct.term = req.body.term;
                contrct.delvdt = req.body.delvdt;
                contrct.from_ct = req.body.from_ct;
                contrct.to_ct = req.body.to_ct;
                contrct.paycond = req.body.paycond;
                contrct.paydiscrt = req.body.paydiscrt;
                contrct.paycond = req.body.paycond;
                contrct.cre_days = req.body.cre_days;
                contrct.paydet = req.body.paydet;
                contrct.party_terms = req.body.party_terms;
                contrct.party_remarks = req.body.party_remarks;
                contrct.tot_bags = req.body.tot_bags;
                contrct.tot_wght = req.body.tot_wght;
                contrct.tot_ammount = req.body.tot_ammount;
                contrct.co_code =  req.session.compid;
                contrct.div_code =  req.session.divid;
                contrct.usrnm =  req.session.user;
                contrct.masterid = req.session.masterid;
                // contrct.sauda2 = contrct._id
                let saud = {};
                saud.main_bk = "SD";
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
               let query = {sauda1:req.params.id,typ:"SL",main_bk:"SD"};
                   console.log("SL",query);
               sauda.update(query ,saud ,function (err) {});
                    let saud1 = {};
                    saud1.main_bk = "SD";
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
               let q = {sauda1:req.params.id};
                    sauda.update(q ,saud1 ,function (err) {});
                    
                    let saud2 = {};
                    saud2.main_bk = "SD";
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
               let SB = {sauda1:req.params.id,typ:"SB",main_bk:"SD"};
                    sauda.update(SB ,saud2 ,function (err) { });
                    let saud3 = {};
                    saud3.main_bk = "SD";
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
               let BB = {sauda1:req.params.id,typ:"BB",main_bk:"SD"};
                    sauda.update(BB ,saud3 ,function (err) {});
                    let quer = {_id:req.params.id}
                    contract.update(quer ,contrct ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving contract', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/contract_sauda/contract_sauda_list');
                    }
                });
            }
        });
        router.get('/delete_contract_sauda', function(req, res){
            let query = req.query.data;
            let del = req.query.del;
            let saud2query = req.query.sauda2;
            var delcontractarray = query.split(',');
            var delsaud2query = saud2query.split(',');
            if(del=="no")
            {
                res.json({ 'success': true, 'message': 'Can Be Deleted'});
            }
            else if(del == "yes")
            {
                for (var j = 0; j < delcontractarray.length; j++) {
                    var myObject = {
                        "_id": delcontractarray[j],
                    };
                    contract.remove(myObject,function(err){});
                }
                for (var i = 0; i < delsaud2query.length; i++) {
                    var myObjectsauda2 = {
                        "sauda1": delsaud2query[i],
                    };
                    sauda.remove(myObjectsauda2,function(err){});
                }
                res.json({ 'success': true, 'message': 'Deleted Successfully'});
                // res.redirect('/contract_sauda/contract_sauda_list');
        }
            });
// Access Control 
function ensureAuthenticated(req, res, next) {
    // if (req.isAuthenticated()) {
        return next();
    // } else {
    //     req.flash('danger', 'Please login');
    //     res.redirect('/userright/login');
    // }
}

module.exports = router;