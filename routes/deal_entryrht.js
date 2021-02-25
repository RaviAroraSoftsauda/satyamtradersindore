const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let dealentry1 = require('../models/contract_sauda_schema');
let dealentry2 = require('../models/contract_sauda2');
let brand = require('../models/brand_schema');
let product_mast = require('../models/product_mast_schema');
let party = require('../models/party_schema');
let common = require('../routes/common');
let partysubbroker = require('../models/party_schema');
 const moment = require('moment-timezone');
 let Notification = require('../models/notification');
 var query;
router.get('/getpartydeal', function (req, res) {
    var selid =  req.query.selid;
    console.log();
    party.find({_id:selid,masterid:req.session.masterid}, function(err, party){
            res.json({ 'success': true, 'party': party ,'compstatecode': req.session.compstatecode});
        });
});
router.get('/getnotificationlist', function (req, res) {
    Notification.find({}, function(err, Notification){
            res.json({ 'success': true, 'Notification': Notification});
        });
});
router.get('/party_subbroker', function (req, res) {
    var masterid =  req.query.masterid;
    // console.log(masterid);
    party.find({$or:[{p_type:"R"},{ p_type:"T"}],masterid:masterid}, function(err, party){
        var data = new Array();
        for (var j = 0; j < party.length; j++) {
            data[j] = {
            "id": party[j]._id,
             "party_name" : party[j].party_name,
             "p_type" : party[j].p_type,
             "masterid" : party[j].masterid};
        }
        res.json({'results':  data});
        });
});
router.post('/party_list', function (req, res) {
    var ptyp =  req.query.ptyp;
    var masterid =  req.query.masterid;
    // var pcond =  new RegExp("\\.\\*"+ptyp+"\\.\\*", "i") ;//"/.*"+ptyp+".*/i";
    // console.log(pcond);
    // party.find( { "p_type": /.*S.*/i }, function(err, party){
    party.find({p_type:ptyp,masterid:masterid}, function(err, party){
        var data = new Array();
        for (var j = 0; j < party.length; j++) {
            data[j] = {"id": party[j]._id,
             "party_name" : party[j].party_name,
             "p_type" : party[j].p_type,
             "masterid" : party[j].masterid};
        }
        res.json({'results':  data});
        });
});
router.get('/product_list', function (req, res) {
    var masterid =  req.query.masterid;
    product_mast.find({masterid:masterid}, function (err, product_mast){
        var data = new Array();
        for (var j = 0; j < product_mast.length; j++) {
            data[j] = {
                "id": product_mast[j]._id,
                 "product_name" : product_mast[j].product_name,
                 "masterid" : product_mast[j].masterid
                };
        }
        res.json({'results':  data});
        });
});
router.get('/brand_list', function (req, res) {
    var masterid =  req.query.masterid;
    brand.find({masterid:masterid}, function (err, brand){
        var data = new Array();
        for (var j = 0; j < brand.length; j++) {
            data[j] = {
                "id": brand[j]._id,
                 "brand_name" : brand[j].brand_name,
                 "masterid" : brand[j].masterid
                };
        }
        res.json({'results':  data});
        });
});
///party Login dealentry List
// router.post('/appdealentry_list', function (req, res) {
//     var masterid =  req.query.masterid;
//     var slcode =  req.query.customerid;
//     var sbtype =  req.query.sbtype;
//     var qry = "";
//     if(sbtype =="B") qry = {main_bk:"DE",masterid:masterid}
//     if(sbtype =="C") qry = {$or:[{sl_code:slcode},{ br_code:slcode}],main_bk:"DE",masterid:masterid}
//     dealentry1.find(qry, function (err,dealentry1){
//         var data = new Array();
//         var i=0;
// 		for (var j = 0; j < dealentry1.length; j++) {
//             for (var c = 0; c < dealentry1[j].sauda2.contract_sauda_group.length; c++) {
// 			if (dealentry1[j]['vouc_code'] != null) vouc_code = dealentry1[j]['vouc_code'];
// 			else vouc_code = "";
// 			if (dealentry1[j]['sd_date'] != null) sd_date = dealentry1[j]['sd_date'];
// 			else sd_date = "";
// 			if (dealentry1[j]['sl_code'] != null) sl_code = dealentry1[j]['sl_code']['party_name'];
//             else sl_code = "";
//             if (dealentry1[j]['sl_code'] != null) sl_codeid = dealentry1[j]['sl_code']['_id'];
//             else sl_codeid = "";
//             if (dealentry1[j]['br_code'] != null) br_codeid = dealentry1[j]['br_code']['_id'];
// 			else br_codeid = "";
// 			if (dealentry1[j]['br_code'] != null) br_code = dealentry1[j]['br_code']['party_name'];
//             else br_code = "";
//             if (dealentry1[j]['deal_subbrokers'] != null) deal_subbrokers = dealentry1[j]['deal_subbrokers']['party_name'];
//             else deal_subbrokers = "";
//             if (dealentry1[j].sauda2.contract_sauda_group[c]['p_code']!= null) p_code = dealentry1[j].sauda2.contract_sauda_group[c]['p_code']['product_name'];
//             else p_code = "";
//             if (dealentry1[j].sauda2.contract_sauda_group[c]['brand_code']!= null) brand_code = dealentry1[j].sauda2.contract_sauda_group[c]['brand_code']['brand_name'];
//             else brand_code = "";
//             if (dealentry1[j].sauda2.contract_sauda_group[c]['bag']!= null) bag = dealentry1[j].sauda2.contract_sauda_group[c]['bag'];
//             else bag = "";
//             if (dealentry1[j].sauda2.contract_sauda_group[c]['pck']!= null) pck = dealentry1[j].sauda2.contract_sauda_group[c]['pck'];
//             else pck = "";
//             if (dealentry1[j].sauda2.contract_sauda_group[c]['wght']!= null) wght = dealentry1[j].sauda2.contract_sauda_group[c]['wght'];
//             else wght = "";
//             if (dealentry1[j].sauda2.contract_sauda_group[c]['sd_rate']!= null) sd_rate = dealentry1[j].sauda2.contract_sauda_group[c]['sd_rate'];
//             else sd_rate = "";
            
//             if (dealentry1[j]['co_code'] != null) co_code = dealentry1[j]['co_code'];
//             else co_code = "";

//             if (dealentry1[j]['div_code'] != null) div_code = dealentry1[j]['div_code'];
//             else div_code = "";

//             if (dealentry1[j]['masterid'] != null) masterid = dealentry1[j]['masterid'];
//             else masterid = "";

//             if (dealentry1[j]['usrnm'] != null) usrnm = dealentry1[j]['usrnm'];
//             else usrnm = "";
//             data[c]= {
//                         "id" :dealentry1[j]._id,
//                         "vouc_code" : vouc_code,
//                         "sd_date":  sd_date,
//                         "sl_code" : sl_code,
//                         "sl_codeid" : sl_codeid,
//                         "br_codeid" : br_codeid,
//                         "br_code" : br_code,
//                         "deal_subbrokers" : deal_subbrokers,
//                         "p_code" : p_code,
//                         "brand_code":brand_code,
//                         "qty" : bag,
//                         "pck" : pck,
//                         "wght" : wght,
//                         "sd_rate" : sd_rate,
//                         "co_code" : co_code,
//                         "div_code" : div_code,
//                         "masterid" : masterid,
//                         "usrnm" : usrnm,
//             };
//         }
//     }
//         res.json({'data':  data });
//     }).populate('sl_code').populate('br_code').populate('deal_subbrokers')
//     .populate([{path: 'sauda2',
//     populate:{ path: 'contract_sauda_group.p_code', select: 'product_name'}
//     }])
//     .populate([{path: 'sauda2',
//     populate:{ path: 'contract_sauda_group.brand_code', select: 'brand_name'}
//     }])
// });
router.post('/appdealentry_list', function (req, res) {
      var masterid =  req.query.masterid;
        var slcode =  req.query.customerid;
        var sbtype =  req.query.sbtype;
        var qry = "";
        if(sbtype =="B") qry = {main_bk:"DE",masterid:masterid,typ:"BR"}
        if(sbtype =="C") qry = {pcode:slcode,main_bk:"DE",masterid:masterid,typ:"BR"}
    dealentry2.find(qry,function (err, dealentry2){
        var data = new Array();
        for (var j = 0; j < dealentry2.length; j++) {
            if (dealentry2[j]['vouc_code'] != null)  vouccode = dealentry2[j]['vouc_code'];
            else  vouccode = "";
            if (dealentry2[j]['sd_date'] != null)  sddate = dealentry2[j]['sd_date'];
            else  sddate = "";
            if (dealentry2[j]['sauda1']['sl_code'] != null)  slcode = dealentry2[j]['sauda1']['sl_code']['party_name'];
            else  slcode = "";
            if (dealentry2[j]['sauda1']['sl_code'] != null)  slcodeid = dealentry2[j]['sauda1']['sl_code']['_id'];
            else  slcodeid = "";
            if (dealentry2[j]['sauda1']['br_code'] != null)  brcode = dealentry2[j]['sauda1']['br_code']['party_name'];
            else  brcode = "";
            if (dealentry2[j]['sauda1']['br_code'] != null)  brcodeid = dealentry2[j]['sauda1']['br_code']['_id'];
            else  brcodeid = "";
            if (dealentry2[j]['sauda1']['deal_subbrokers'] != null)  dealsubbrokers = dealentry2[j]['sauda1']['deal_subbrokers']['party_name'];
            else  dealsubbrokers = "";
            if (dealentry2[j]['sauda1']['co_code'] != null)  cocode = dealentry2[j]['sauda1']['co_code'];
            else  cocode = "";
            if (dealentry2[j]['sauda1']['div_code'] != null)  divcode = dealentry2[j]['sauda1']['div_code'];
            else  divcode = "";
            if (dealentry2[j]['sauda1']['masterid'] != null)  masterids = dealentry2[j]['sauda1']['masterid'];
            else  masterids = "";
            if (dealentry2[j]['sauda1']['usrnm'] != null)  usrnms = dealentry2[j]['sauda1']['usrnm'];
			else  usrnms = "";
            var contract_sauda = dealentry2[j]['contract_sauda_group'];
            for (var s = 0; s < contract_sauda.length; s++) {
                
                if (contract_sauda[s]['p_code'] != null)  pcode = contract_sauda[s]['p_code']['product_name'];
                else  pcode = "";
                if (contract_sauda[s]['brand_code'] != null)  brandcode = contract_sauda[s]['brand_code']['brand_name'];
                else  brandcode = "";
                if (contract_sauda[s]['bag'] != null)  qty = contract_sauda[s]['bag'];
                else  qty = "";
                if (contract_sauda[s]['pck'] != null)  pcks = contract_sauda[s]['pck'];
                else  pcks = "";
                if (contract_sauda[s]['wght'] != null)  wghts = contract_sauda[s]['wght'];
                else  wghts = "";
                if (contract_sauda[s]['sd_rate'] != null)  sdrate = contract_sauda[s]['sd_rate'];
                else  sdrate = "";
            
               data[s] = {
                "id": dealentry2[j]._id,
                "vouc_code": vouccode,
                "sd_date": sddate,
                // "typ": dealentry2[j].typ,
                "sl_code":slcode,
                "sl_codeid" : slcodeid,
                "br_code":brcode,
                "br_codeid":brcodeid,
                "deal_subbrokers" :dealsubbrokers,
                "p_code" : pcode,
                "brand_code" : brandcode,
                "qty" : qty,
                "pck" : pcks,
                "wght" : wghts,
                "sd_rate" : sdrate,
                "co_code" : cocode,
                "div_code" : divcode,
                "masterid" : masterids,
                "usrnm" : usrnms,
                };
            }    
           
    }
    
    res.json({'data':  data});
        }).populate([{path: 'sauda1',
        populate:{ path: 'sl_code', select: 'party_name'}
        }]).populate([{path: 'sauda1',
        populate:{ path: 'br_code', select: 'party_name'}
        }]).populate([{path: 'sauda1',
        populate:{ path: 'deal_subbrokers', select: 'party_name'}
        }]).populate([{path: 'contract_sauda_group.p_code',select: 'product_name',
        }]).populate([{path: 'contract_sauda_group.brand_code', select: 'brand_name',
        }])
});
// api
router.post('/submit',function(req, res){
    if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.deal_subbrokers=="") req.body.deal_subbrokers=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    // if(req.body.deal_subbrokers=="") req.body.deal_subbrokers=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var sd_date = req.body.sd_date;
    var sbtype = req.body.sbtype;
    var deal_subbrokers = req.body.deal_subbrokers;
    var sdDateObject =  moment(sd_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var SDDateMiliSeconds = sdDateObject.format('x');
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        party.find({_id:req.body.br_code}, function (err, buyer){        
            party.find({_id:req.body.sl_code}, function (err, seller){        
            dealentry1.find({main_bk:"DE",co_code:req.session.compid,div_code:req.session.divid}, function (err, dealntryno){
            var entrylength = dealntryno.length+1;
            let dealentry = new dealentry1();
            dealentry.brok_yn = req.body.brok_yn;
            dealentry.main_bk ='DE';
            dealentry.c_j_s_p = req.body.c_j_s_p;
            dealentry.vouc_code = entrylength;
            dealentry.sd_date = sdDateObject;
            dealentry.sd_datemilisecond = SDDateMiliSeconds;
            dealentry.sl_brok = req.body.sl_brok;
            dealentry.sl_code = req.body.sl_code;
            dealentry.br_brok = req.body.br_brok;
            dealentry.br_code = req.body.br_code;
            dealentry.sbtype = sbtype;
            dealentry.deal_subbrokers = deal_subbrokers;
            
            // if(sbtype =="S") dealentry.sb_code = deal_subbrokers;
            // if(sbtype =="B") dealentry.bb_code = deal_subbrokers;
            dealentry.paycond = req.body.paycond;
            dealentry.paydiscrt = req.body.paydiscrt;
            dealentry.party_remarks = req.body.party_remarks;
            dealentry.tot_bags = req.body.tot_bags;
            dealentry.tot_wght = req.body.tot_wght;
            dealentry.tot_ammount = req.body.tot_ammount;
            dealentry.c_j_s_p = req.body.c_j_s_p;
            dealentry.cre_days = req.body.cre_days;
            dealentry.co_code =  req.body.co_code;
            dealentry.div_code =  req.body.div_code;
            dealentry.usrnm =  req.body.usrnm;
            dealentry.masterid=req.body.masterid;
            let deal = new dealentry2();
            deal.sauda1 =dealentry._id;
            deal.main_bk = "DE";
            deal.typ = "SL";
            deal.srno = 1;
            deal.sd_date = sdDateObject;
            deal.sd_datemilisecond = SDDateMiliSeconds;
            deal.vouc_code = entrylength;
            deal.contract_sauda_group = req.body.contract_sauda_group;
            deal.pcode = req.body.sl_code;
            deal.sauda_number = req.body.sauda_number;
            deal.co_code =  req.body.co_code;
            deal.div_code =  req.body.div_code;
            deal.usrnm =  req.body.usrnm;
            deal.masterid=req.body.masterid;
            deal.save();
            
            let deal2 = new dealentry2();
            deal2.sauda1 =dealentry._id;
            deal2.main_bk = "DE";
            deal2.typ = "BR";
            deal2.srno = 1;
            deal2.sd_date = sdDateObject;
            deal2.sd_datemilisecond = SDDateMiliSeconds;
            deal2.vouc_code = entrylength;
            deal2.contract_sauda_group = req.body.contract_sauda_group;
            deal2.pcode = req.body.br_code;
            deal2.co_code =  req.body.co_code;
            deal2.div_code =  req.body.div_code;
            deal2.usrnm =  req.body.usrnm;
            deal2.masterid=req.body.masterid;
            deal2.save();
            dealentry.sauda2 = deal._id;
            // console.log(dealentry);
            dealentry.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving deal entry','errors':err});
                return;
            }
            else
            {
                var userid = req.session.user;
                var title = "Sauda Added";
                var offermessage = ' Sauda No :'+ deal.vouc_code+' Dated '+ dealentry.sd_date +' Buyer Name ' + buyer[0].party_name + '  Address ' + buyer[0].address1 +buyer[0].address2 +  'GSTin :' +  buyer[0].gstin;
                var notificationtime = moment().tz("Asia/Kolkata").format('x');
                var type = "All";
                console.log('buyer'+buyer);
                var sllertoken =  seller[0].smstoken;
                var flag = 0;
                let notification = new Notification();
                notification.title = title;
                notification.content = offermessage;
                notification.type = type;
                notification.notificationtime = notificationtime;
                notification.readflag = flag;
                notification.userid = userid;
                notification.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        console.log('notification saved successfully');
                    }
                });
                var sellerobj = [];
                sellerobj.push(sllertoken);
                console.log('sllerarry' + sellerobj);                
                var message = {
                    // app_id: "6847579f-a42f-45f9-8358-2e2cffbd0507",
                    app_id: "ee56d496-0ed3-4572-a1f6-2603e30cc312",
                    //app_id: "5797bcb1-162e-4d2d-bb22-48a756b7e340", // millerappid
                    headings: {"en": title, "es": title},
                    contents: {"en": offermessage, "es": "Spanish Message"},
                    //included_segments: ["Active Users"]
                    include_player_ids: sellerobj
                };
                common.sendNotification(message);
                req.flash('success', 'Sauda Added');                
                res.json({'success':true,'message':dealentry});
                // res.redirect('/deal_entry/deal_entry');
            }
            });
        }).sort('-vouc_code');
    });
    });
    }               
});


router.post('/appdealentry_update/:id', function(req, res) {
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let dealentry = {};
        dealentry.dealdlvrd_no  = req.body.dealdlvrd_no;
        dealentry.dealbill_no  = req.body.dealbill_no;
        dealentry.dealfright_no  = req.body.dealfright_no;
        dealentry.dealloory_no  = req.body.dealloory_no;
        dealentry.deallorydrive_no  = req.body.deallorydrive_no;
        let quer = {_id:req.params.id}
        dealentry2.update(quer ,dealentry ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving dealentry', 'errors': err });
                return;
            } else {
                res.json({'success':dealentry});
            }
        });
    }
});
router.post('/appdealpayment_update/:id', function(req, res) {
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let dealentry = {};
        dealentry.payment_no  = req.body.payment_no;
        dealentry.pament_amt  = req.body.pament_amt;
        dealentry.payment_narrtion  = req.body.payment_narrtion;
        let quer = {_id:req.params.id}
        dealentry2.update(quer ,dealentry ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving dealentry', 'errors': err });
                return;
            } else {
                res.json({'success':dealentry});
            }
        });
    }
});
router.get('/deal_entry', ensureAuthenticated, function(req, res){
            dealentry1.find({main_bk:"DE",co_code:req.session.compid,div_code:req.session.divid}, function (err, dealentry1){
            brand.find({masterid:req.session.masterid}, function (err, brand){
            party.find({masterid:req.session.masterid}, function (err, party){
            product_mast.find({masterid:req.session.masterid}, function (err, product_mast){
            partysubbroker.find({$or: [ { p_type: "S" }, { p_type: "B"}],masterid:req.session.masterid}, function (err, partysubbroker){
            if (err) {
                console.log(err);
            } else {
                res.render('deal_entry.hbs', {
                    pageTitle:'Add Deal Entery',
                    dealentry1: dealentry1,
                    brand: brand,
                    party: party,
                    partysubbroker: partysubbroker,
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
           }).sort({'party_name':1}).populate('city_name');
          }).sort({'product_name':1});
        }).sort({'party_name':1}).populate('city_name');
      }).sort({'brand_name':1});
    }).sort('-vouc_code');
});
    // router.post('/add',function(req, res){
    //     if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //     if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //     if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //     if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //     if(req.body.deal_subbrokers=="") req.body.deal_subbrokers=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //     let errors = req.validationErrors();
    //     var sd_date = req.body.sd_date;
    //     var sbtype = req.body.sbtype;
    //     var deal_subbrokers = req.body.deal_subbrokers;
    //     var sdDateObject =  moment(sd_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //     var SDDateMiliSeconds = sdDateObject.format('x');
    //     if(errors)
    //     {
    //         console.log(errors);
    //     }
    //     else
    //     {
    //         dealentry1.find({main_bk:"DE",co_code:req.session.compid,div_code:req.session.divid}, function (err, dealntryno){
    //         var entrylength = dealntryno.length+1;
    //         let dealentry = new dealentry1();
    //         dealentry.brok_yn = req.body.brok_yn;
    //         dealentry.main_bk ='DE';
    //         dealentry.c_j_s_p = req.body.c_j_s_p;
    //         dealentry.vouc_code = entrylength;
    //         dealentry.sd_date = sdDateObject;
    //         dealentry.sd_datemilisecond = SDDateMiliSeconds;
    //         dealentry.sl_brok = req.body.sl_brok;
    //         dealentry.sl_code = req.body.sl_code;
    //         dealentry.br_brok = req.body.br_brok;
    //         dealentry.br_code = req.body.br_code;
    //         dealentry.sbtype = sbtype;
    //         dealentry.rmks = req.body.rmks;
    //         dealentry.bno = req.body.bno;
    //         dealentry.podt = req.body.podt;
    //         dealentry.pono = req.body.pono;
    //         dealentry.add1_amt = req.body.add1_amt;
    //         dealentry.add2_amt = req.body.add2_amt;
    //         dealentry.add3_amt = req.body.add3_amt;
    //         dealentry.less1_amt = req.body.less1_amt;
    //         dealentry.less1_rmk = req.body.less1_rmk;
    //         dealentry.less2_amt = req.body.less2_amt;
    //         dealentry.less2_rmk = req.body.less2_rmk;
    //         dealentry.less3_amt = req.body.less3_amt;
    //         dealentry.bill_amt = req.body.bill_amt;
    //         dealentry.deal_subbrokers = deal_subbrokers;
    //         if(sbtype =="S") dealentry.sb_code = deal_subbrokers;
    //         if(sbtype =="B") dealentry.bb_code = deal_subbrokers;
    //         dealentry.paycond = req.body.paycond;
    //         dealentry.paydiscrt = req.body.paydiscrt;
    //         dealentry.party_remarks = req.body.party_remarks;
    //         dealentry.tot_bags = req.body.tot_bags;
    //         dealentry.tot_wght = req.body.tot_wght;
    //         dealentry.tot_ammount = req.body.tot_ammount;
    //         dealentry.c_j_s_p = req.body.c_j_s_p;
    //         dealentry.cre_days = req.body.cre_days;
    //         dealentry.co_code =  req.session.compid;
    //         dealentry.div_code =  req.session.divid;
    //         dealentry.usrnm =  req.session.user;
    //         dealentry.masterid=req.session.masterid;
    //         let deal = new dealentry2();
    //         deal.sauda1 =dealentry._id;
    //         deal.main_bk = "DE";
    //         deal.typ = "SL";
    //         deal.srno = 1;
    //         deal.sd_date = sdDateObject;
    //         deal.sd_datemilisecond = SDDateMiliSeconds;
    //         deal.vouc_code = entrylength;
    //         deal.contract_sauda_group = req.body.contract_sauda_group;
    //         deal.pcode = req.body.sl_code;
    //         deal.sauda_number = req.body.sauda_number;
    //         deal.co_code =  req.session.compid;
    //         deal.div_code =  req.session.divid;
    //         deal.usrnm =  req.session.user;
    //         deal.masterid=req.session.masterid;
    //         deal.save();
            
    //         let deal2 = new dealentry2();
    //         deal2.sauda1 =dealentry._id;
    //         deal2.main_bk = "DE";
    //         deal2.typ = "BR";
    //         deal2.srno = 1;
    //         deal2.sd_date = sdDateObject;
    //         deal2.sd_datemilisecond = SDDateMiliSeconds;
    //         deal2.vouc_code = entrylength;
    //         deal2.contract_sauda_group = req.body.contract_sauda_group;
    //         deal2.pcode = req.body.br_code;
    //         deal2.co_code =  req.session.compid;
    //         deal2.div_code =  req.session.divid;
    //         deal2.usrnm =  req.session.user;
    //         deal2.masterid=req.session.masterid;
    //         deal2.save();
    //         dealentry.sauda2 = deal._id;
    //         dealentry.save(function (err){
    //         if(err)
    //         {
    //             res.json({'success':false,'message':'error in saving deal entry','errors':err});
    //             return;
    //         }
    //         else
    //         {
    //             // res.json({'success':true,'message':dealentry});
    //             res.redirect('/deal_entry/deal_entry');
    //         }
    //         });
    //     }).sort('-vouc_code');
    //     }               
    // });
    router.post('/add', async function(req, res){
        if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.deal_subbrokers=="") req.body.deal_subbrokers=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        const brok_yn = req.body.brok_yn;
        const main_bk ='DE';
        const c_j_s_p = req.body.c_j_s_p;
        const vouc_code =  req.body.vouc_code;
        var sd_date = req.body.sd_date;
        var sbtype = req.body.sbtype;
        var deal_subbrokers = req.body.deal_subbrokers;
        var sdDateObject =  moment(sd_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var SDDateMiliSeconds = sdDateObject.format('x');
       const sl_brok = req.body.sl_brok;
       const sl_code = req.body.sl_code;
       const br_brok = req.body.br_brok;
       const br_code = req.body.br_code;
       const rmks = req.body.rmks;
       const bno = req.body.bno;
       const podt = req.body.podt;
       const pono = req.body.pono;
       const add1_amt = req.body.add1_amt;
       const add2_amt = req.body.add2_amt;
       const add3_amt = req.body.add3_amt;
       const less1_amt = req.body.less1_amt;
       const less1_rmk = req.body.less1_rmk;
       const less2_amt = req.body.less2_amt;
       const less2_rmk = req.body.less2_rmk;
       const less3_amt = req.body.less3_amt;

       const sgst_tax = req.body.sgst_tax;
       const cgst_tax = req.body.cgst_tax;
       const igst_tax = req.body.igst_tax;
       const apmc_tax = req.body.apmc_tax;

       const bill_amt = req.body.bill_amt;
       if(sbtype =="S") var deal_subbrokers = deal_subbrokers;
       if(sbtype =="B")var  deal_subbrokers = deal_subbrokers;
       const paycond = req.body.paycond;
       const paydiscrt = req.body.paydiscrt;
       const party_remarks = req.body.party_remarks;
       const tot_bags = req.body.tot_bags;
       const tot_wght = req.body.tot_wght;
       const tot_ammount = req.body.tot_ammount;
       const contract_sauda_group = req.body.contract_sauda_group;
       const cre_days = req.body.cre_days;
       const co_code =  req.session.compid;
       const div_code =  req.session.divid;
       const usrnm =  req.session.user;
       const masterid=req.session.masterid;
        let errors = req.validationErrors();
        var allowparty = "True";
        if (errors) {
            res.json({ 'success': false, 'message': 'Validation error', errors: errors });
        } else
         {
            console.log(req.body.bno);
            dealentry1.findOne({$and: [{ sl_code: req.body.sl_code},{ bno: req.body.bno}]}, function(errors, delasave){
                if(errors) {
                    console.log(errors);
                    res.json({ 'success': false, 'message': 'Error in finding usrnm', errors: errors });
                }
                     if(!delasave){
                        dealentry1.find({main_bk:"DE",co_code:req.session.compid,div_code:req.session.divid}, function (err, dealntryno){
                         var entrylength = dealntryno.length+1;
                    let dealentry = new dealentry1({
                        brok_yn : brok_yn,
                        main_bk :'DE',
                        c_j_s_p : c_j_s_p,
                        vouc_code : entrylength,
                        sd_date : sdDateObject,
                        sd_datemilisecond : SDDateMiliSeconds,
                        sl_brok : sl_brok,
                        sl_code : sl_code,
                        br_brok : br_brok,
                        br_code : br_code,
                        sbtype : sbtype,
                        rmks : rmks,
                        bno : bno,
                        podt : podt,
                        pono : pono,
                        add1_amt : add1_amt,
                        add2_amt : add2_amt,
                        add3_amt : add3_amt,
                        less1_amt : less1_amt,
                        less1_rmk : less1_rmk,
                        less2_amt : less2_amt,
                        less2_rmk : less2_rmk,
                        less3_amt : less3_amt,
                        sgst_tax : sgst_tax,
                        cgst_tax : cgst_tax,
                        igst_tax : igst_tax,
                        apmc_tax : apmc_tax,
                        bill_amt : bill_amt,
                        deal_subbrokers : deal_subbrokers,
                        sb_code : deal_subbrokers,
                        bb_code : deal_subbrokers,
                        paycond : paycond,
                        paydiscrt : paydiscrt,
                        party_remarks : party_remarks,
                        tot_bags : tot_bags,
                        tot_wght : tot_wght,
                        tot_ammount : tot_ammount,
                        cre_days : cre_days,
                        co_code :  req.session.compid,
                        div_code :  req.session.divid,
                        usrnm :  req.session.user,
                        masterid:req.session.masterid,
                    });
                    let deal = new dealentry2({
                        sauda1 :dealentry._id,
                        main_bk : "DE",
                        typ : "SL",
                        srno : 1,
                        sd_date : sdDateObject,
                        sd_datemilisecond : SDDateMiliSeconds,
                        vouc_code : entrylength,
                        contract_sauda_group : contract_sauda_group,
                        pcode : req.body.sl_code,
                        sauda_number : req.body.sauda_number,
                        co_code :  req.session.compid,
                        div_code :  req.session.divid,
                        usrnm :  req.session.user,
                        masterid:req.session.masterid,
                    });
                    let deal2 = new dealentry2({
                        sauda1 :dealentry._id,
                        main_bk : "DE",
                        typ : "BR",
                        srno : 1,
                        sd_date : sdDateObject,
                        sd_datemilisecond : SDDateMiliSeconds,
                        vouc_code : entrylength,
                        contract_sauda_group : contract_sauda_group,
                        pcode : req.body.br_code,
                        sauda_number : req.body.sauda_number,
                        co_code :  req.session.compid,
                        div_code :  req.session.divid,
                        usrnm :  req.session.user,
                        masterid:req.session.masterid,
                    });
                    deal.save();
                    deal2.save();
                    dealentry.sauda2 = deal._id;
                    dealentry.save(function(errors){
                            if(errors){
                                res.json({ 'success': false, 'message': 'Error in Saving User', errors: errors });
                            } else {
                            res.json({ 'success': true,'message': 'User added succesfully'});
                            }
                          });
                        }).sort('-vouc_code');;
                        }
                   
                        else{
                            res.json({ 'success': false,'message': 'User added succesfully'});
                        }
                        });
        }
    
    });
    router.get('/deal_entry_list', ensureAuthenticated ,function(req,res){
        dealentry1.find({main_bk : "DE",co_code:req.session.compid,div_code:req.session.divid}, function (err,dealentry1){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('deal_entry_list.hbs',{
                    pageTitle:'deal entry List',
                    dealentry1:dealentry1,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({vouc_code:'asc'}).populate('sl_code').populate('br_code').populate('deal_subbrokers').populate('sauda2');   
       });
       router.get('/deal_entry_update/:id', ensureAuthenticated, function(req, res){
        dealentry1.findById(req.params.id, function(err, dealentry1){
            brand.find({masterid:req.session.masterid}, function (err, brand){
                party.find({masterid:req.session.masterid}, function (err, party){
                product_mast.find({masterid:req.session.masterid}, function (err, product_mast){
                partysubbroker.find({$or: [ { p_type: "S" }, { p_type: "B"}],masterid:req.session.masterid}, function (err, partysubbroker){
                if (err) {
                    console.log(err);
                } else {
                    res.render('deal_entry_update.hbs',{
                        pageTitle:'Update deal entry',
                        dealentry1: dealentry1,
                        brand: brand,
                        party: party,
                        product_mast: product_mast,
                        partysubbroker:partysubbroker,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                    });
                }
            }).sort({'party_name':1});
         }).sort({'product_name':1});
      }).sort({'party_name':1}).populate('city_name');
    }).sort({'brand_name':1});
}).populate('sl_code').populate('br_code').populate('sauda2');
});
        
router.post('/update/:id', function(req, res) {
    if(req.body.sb_code=="") req.body.sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.bb_code=="") req.body.bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.sl_code=="") req.body.sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.br_code=="") req.body.br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.deal_subbrokers=="") req.body.deal_subbrokers=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var sd_date = req.body.sd_date;
    var sbtype = req.body.sbtype;
    var deal_subbrokers = req.body.deal_subbrokers;
    var sdDateObject =  moment(sd_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var SDDateMiliSeconds = sdDateObject.format('x');
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let dealentry = {};
        dealentry.brok_yn = req.body.brok_yn;
        dealentry.main_bk ='DE';
        dealentry.c_j_s_p = req.body.c_j_s_p;
        dealentry.vouc_code = req.body.vouc_code;
        dealentry.sd_date = sdDateObject;
        dealentry.sd_datemilisecond = SDDateMiliSeconds;
        dealentry.sl_brok = req.body.sl_brok;
        dealentry.sl_code = req.body.sl_code;
        dealentry.br_brok = req.body.br_brok;
        dealentry.br_code = req.body.br_code;
        dealentry.sbtype = sbtype;
        dealentry.rmks = req.body.rmks;
        dealentry.bno = req.body.bno;
        dealentry.podt = req.body.podt;
        dealentry.pono = req.body.pono;
        dealentry.add1_amt = req.body.add1_amt;
        dealentry.add2_amt = req.body.add2_amt;
        dealentry.add3_amt = req.body.add3_amt;
        dealentry.less1_amt = req.body.less1_amt;
        dealentry.less1_rmk = req.body.less1_rmk;
        dealentry.less2_amt = req.body.less2_amt;
        dealentry.less2_rmk = req.body.less2_rmk;
        dealentry.less3_amt = req.body.less3_amt;
        dealentry.bill_amt = req.body.bill_amt;
        dealentry.sgst_tax = req.body.sgst_tax;
        dealentry.cgst_tax = req.body.cgst_tax;
        dealentry.igst_tax = req.body.igst_tax;
        dealentry.apmc_tax = req.body.apmc_tax;
        dealentry.deal_subbrokers = deal_subbrokers;
        if(sbtype =="S") dealentry.sb_code = deal_subbrokers;
        if(sbtype =="B") dealentry.bb_code = deal_subbrokers;
        dealentry.paycond = req.body.paycond;
        dealentry.paydiscrt = req.body.paydiscrt;
        dealentry.party_remarks = req.body.party_remarks;
        dealentry.tot_bags = req.body.tot_bags;
        dealentry.tot_wght = req.body.tot_wght;
        dealentry.tot_ammount = req.body.tot_ammount;
        dealentry.c_j_s_p = req.body.c_j_s_p;
        dealentry.cre_days = req.body.cre_days;
        dealentry.co_code =  req.session.compid;
        dealentry.div_code =  req.session.divid;
        dealentry.usrnm =  req.session.user;
        dealentry.masterid=req.session.masterid;
        let deal = {};
        deal.main_bk = "DE";
        deal.typ = "SL";
        deal.srno = 1;
        deal.sd_date = sdDateObject;
        deal.sd_datemilisecond = SDDateMiliSeconds;
        deal.vouc_code = req.body.vouc_code;
        deal.contract_sauda_group = req.body.contract_sauda_group;
        deal.pcode = req.body.sl_code;
        deal.sauda_number = req.body.sauda_number;
        deal.co_code =  req.session.compid;
        deal.div_code =  req.session.divid;
        deal.usrnm =  req.session.user;
        deal.masterid=req.session.masterid;
        let query = {"sauda1":req.params.id,co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
        console.log(query);
        dealentry2.update(query ,deal ,function (err) {});
        let deal2 = {};
        deal2.main_bk = "DE";
        deal2.typ = "BR";
        deal2.srno = 1;
        deal2.sd_date = sdDateObject;
        deal2.sd_datemilisecond = SDDateMiliSeconds;
        deal2.vouc_code = req.body.vouc_code;
        deal2.contract_sauda_group = req.body.contract_sauda_group;
        deal2.pcode = req.body.br_code;
        deal2.sauda_number = req.body.sauda_number;
        deal2.co_code =  req.session.compid;
        deal2.div_code =  req.session.divid;
        deal2.usrnm =  req.session.user;
        deal2.masterid=req.session.masterid;
        let q = {"sauda1":req.params.id,co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
        dealentry2.update(q ,deal2 ,function (err) {});
        let quer = {_id:req.params.id}
        dealentry1.update(quer ,dealentry ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving dealentry', 'errors': err });
                return;
            } else {
                res.redirect('/deal_entry/deal_entry_list');
            }
        });
    }
});
router.get('/delete_deal_entry/', function(req, res){
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
            dealentry1.remove(myObject,function(err){});
        }
        for (var i = 0; i < delsaud2query.length; i++) {
            var myObjectdealentry2 = {
                "sauda1": delsaud2query[i],
            };
            dealentry2.remove(myObjectdealentry2,function(err){});
        }
        res.json({ 'success': true, 'message': 'Deleted Successfully'});
    //    res.redirect('/deal_entry/deal_entry_list');
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