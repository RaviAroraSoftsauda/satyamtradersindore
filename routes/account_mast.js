const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let a_mast= require('../models/accountSchema');
let g_mast= require('../models/groupSchema');
let city = require('../models/citySchema');
let state_master = require('../models/stateSchema');
let ptyp_mast= require('../models/partyTypeSchema');
let journalmast = require('../models/trans');
let Company = require('../models/companySchema');
let tax_mast= require('../models/taxSchema');
// Add Route 

router.get('/getAccountviewlist', function (req, res) {
    var searchStr = req.query.search.value;
    if(req.query.search.value)
    {
        var regex = new RegExp(req.query.search.value, "i")
                searchStr = { $or: [{'ACName': regex},{'city_name.city_name': regex},{'ACCode': regex},{'Address1': regex},{'PanNumber': regex },{'gstin': regex }
                //,{'partshortname': regex},{'area_name': regex },{'pin_code': regex },{'pan_no': regex },{'gstin': regex },{'group_name': regex }
                //,{'phone_resi': regex },{'credit_limit': regex },{'pin_code': regex },
                ,{'ac_fccino': regex },{'fax': regex },{'address1': regex },
                {'skip': Number( req.query.start), 'limit': Number(req.query.length) },
            ] };
    }
    else
    {   
        searchStr={};
    }
    var masterid = {masterid:req.session.masterid,del:'N'};
    searchStr = Object.assign(searchStr,masterid)
    var recordsTotal = 0;
    var recordsFiltered = 0;
    a_mast.count({}, function(err, c) {
        a_mast.count(searchStr, function(err, c) {
        recordsFiltered = c;
        recordsTotal = c;
            a_mast.find(searchStr,'ACName ACCode Address1 PanNumber GSTIN',{'skip': Number(req.query.start), 'limit': Number(req.query.length) }, function (err, results) {
                if (err) {
                    console.log('error while getting results'+err);
                    return;
                }
                var data = JSON.stringify({
                    "draw": req.query.draw,
                    "recordsFiltered": recordsFiltered,
                    "recordsTotal": recordsTotal,
                    "data": results
                });
                res.send(data);
            }).populate('GroupName').populate('CityName').populate('StateName').populate('ac_taxnm').populate('PartyType');        
        });
   });
});

router.get('/getcity', function (req, res) {
    var qry = req.query.term.term;
    city.find({'CityName': new RegExp(qry ),del:'N' },'CityName',  function(err, city){
        var data = new Array();
        for (var j = 0; j < city.length; j++) {
            data[j] = {"id": city[j]._id, "text" : city[j].CityName};
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    });
});
router.get('/getstate', function (req, res) {
    var qry = req.query.term.term;
    state_master.find({'StateName': new RegExp(qry ),del:'N' },'StateName',  function(err, State){
        var data = new Array();
        for (var j = 0; j < State.length; j++) {
            data[j] = {"id": State[j]._id, "text" : State[j].StateName};
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    });
});
router.get('/getgroup', function (req, res) {
    var qry = req.query.term.term;
    g_mast.find({'GroupName': new RegExp(qry ),del:'N' },'GroupName',  function(err, city){
        var data = new Array();
        for (var j = 0; j < city.length; j++) {
            data[j] = {"id": city[j]._id, "text" : city[j].GroupName};
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    });
});
router.get('/gettax_mast', function (req, res) {
    var qry = req.query.term.term;
    tax_mast.find({'GroupName': new RegExp(qry ),del:'N' },'GroupName',  function(err, city){
        var data = new Array();
        for (var j = 0; j < city.length; j++) {
            data[j] = {"id": city[j]._id, "text" : city[j].tx_Thead};
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    });
});
router.get('/getpartytype', function (req, res) {
    var qry = req.query.term.term;
    ptyp_mast.find({'Description': new RegExp(qry ),del:'N' },'Description',  function(err, city){
        var data = new Array();
        for (var j = 0; j < city.length; j++) {
            data[j] = {"id": city[j]._id, "text" : city[j].Description};
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    });
});
router.get('/account_mast', ensureAuthenticated, function(req, res){
    var pageNo = parseInt(req.query.pageNo)
    var size = parseInt(req.query.size)
    var query = {}
    if(pageNo < 0 || pageNo === 0) {
            response = {"error" : true,"message" : "invalid page number, should start with 1"};
            return res.json(response)
    }
    query.skip = size * (pageNo - 1)
    query.limit = size
    // console.log(query);
    // a_mast.find({masterid:req.session.masterid,del:"N"}, function (err,a_mast){
    //     if (err) {
    //         console.log(err);
    //     } else {
            res.render('account_mast.hbs', {
                pageTitle:'Account Master',
                // a_mast:a_mast,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
//         }
// }).populate('GroupName').populate('CityName').populate('StateName').populate('Partytype')
})
router.get('/account_mast_list', ensureAuthenticated, function(req, res){
            res.render('account_mast_list.hbs', {
                pageTitle:'Account Master List',
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
})
router.post('/amast_add',function(req, res){
    Company.findById(req.session.compid, function(err, company){
    var date = company.sdate;
    var DateObject =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var proformadatemilisecond = DateObject.format('x');
    if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_city=="") req.body.ac_city=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_state=="") req.body.ac_state=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_ptype=="") req.body.ac_ptype=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_taxnm=="") req.body.ac_taxnm=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.broker_Code=="") req.body.broker_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.sl_Person=="") req.body.sl_Person=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    var GaruEntryModel = req.body.GaruEntryModel;
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else{
        let account = new a_mast();
        account.ACName = req.body.ac_name;
        if(req.body.ac_opbal == null || req.body.ac_opbal == '')req.body.ac_opbal = 0;
        account.OpBalance = req.body.ac_opbal;
        account.dbcr = req.body.ac_open_type
        account.GroupName = req.body.ac_groupname;
        account.broker_Code = req.body.broker_Code;
        account.sl_Person = req.body.sl_Person;
        account.PanNumber = req.body.ac_pan;
        account.ACCode = req.body.ac_code;
        account.Address1 = req.body.ac_add1;
        account.CityName = req.body.ac_city;
        account.StateName = req.body.ac_state;
        account.Area = req.body.ac_area;
        account.GSTIN = req.body.ac_gstin;
        account.bank_group= req.body.bank_group;
        account.ac_add2= req.body.ac_add2;
        account.ac_intrestper= req.body.ac_intrestper;
        account.ac_taxnm= req.body.ac_taxnm;
        account.ac_fccino= req.body.ac_fccino;
        account.FSS_DATE = req.body.FSS_DATE;
        account.ac_creditdys = req.body.ac_creditdys;
        account.ac_pincode = req.body.ac_pincode;
        account.PartyType = req.body.ac_ptype;
        account.CrLimit = req.body.ac_crelimit;
        account.ac_iecno = req.body.ac_iecno;
        account.ac_website = req.body.ac_website;
        account.Email = req.body.ac_email;
        account.ac_phoff = req.body.ac_phoff;
        account.ac_phres = req.body.ac_phres;
        account.ac_phfax = req.body.ac_phfax;
        account.MobileNo = req.body.ac_phmob;
        account.ac_PrintType = req.body.ac_PrintType;
        account.ac_APMC = req.body.ac_APMC;
        account.ac_transportCode = req.body.ac_transportCode;
        account.del =  'N';
        account.usrnm =  req.session.user;
        account.masterid =   req.session.masterid;
        a_mast.findOne({$and: [{ main_bk:"account" },{ ac_city: req.body.ac_city },{ ac_name: req.body.ac_name}]}, function(errors, a_mast){
           let agrfg=true;
            if(a_mast==null) {
                account.save();
                agrfg=true;
                let journal = new journalmast();
                    // journal.account_id = account._id;//trans scema fetech id
                    journal.main_bk = "OP";
                    if(req.body.ac_open_type == 'Debit')journal.d_c ="D";
                    if(req.body.ac_open_type == 'Credit')journal.d_c ="C";
                    journal.vouc_code = 0;
                    journal.cash_date =DateObject;
                    journal.c_j_s_p = req.body.so_no;
                    journal.cash_edatemilisecond = proformadatemilisecond;
                    journal.cashac_name = account._id;
                    journal.cash_bank_name = account._id;
                    journal.cash_narrtwo = 'Opening';
                    if(req.body.ac_open_type == 'Debit')journal.cash_narrone = 'Debit';
                    if(req.body.ac_open_type == 'Credit')journal.cash_narrone = 'Credit';
                    journal.del = "N";
                    journal.entrydate = new Date();
                    if(req.body.ac_opbal == '' || req.body.ac_opbal == null)req.body.ac_opbal = 0
                    journal.cash_amount = req.body.ac_opbal;
                    journal.co_code = req.session.compid;
                    journal.div_code = req.session.divid;
                    journal.usrnm = req.session.user;
                    journal.masterid = req.session.masterid;
                    journal.save();
            }else{
                agrfg=false;
            }
            res.json({'success': agrfg,'GaruEntryModel':GaruEntryModel});
        })
    }
    })
});

router.get('/:id', ensureAuthenticated, function(req, res){
    a_mast.findById(req.params.id, function(err, a_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            res.json({ 'success': true, 'a_mast': a_mast });
        }
    }).populate('StateName').populate('PartyType').populate('GroupName').populate('CityName').populate('ac_taxnm').populate('broker_Code').populate('sl_Person');
});
router.get('/account_mast_update/:id', ensureAuthenticated, function(req, res){
    a_mast.findById(req.params.id, function(err, a_mast){
        if (err) {
            // res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            // res.json({ 'success': true, 'a_mast': a_mast });
            res.render('account_mast_update.hbs', {
                pageTitle:'Account Master Update',
                a_mast:a_mast,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
        }
    }).populate('StateName').populate('PartyType').populate('GroupName').populate('CityName').populate('ac_taxnm').populate('broker_Code').populate('sl_Person');
});

router.post('/edit_amast/:id',function(req, res){
    Company.findById(req.session.compid, function(err, company){
        // console.log(company)
        var date = company.sdate;
        var DateObject =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var proformadatemilisecond = DateObject.format('x');
        // console.log(DateObject,proformadatemilisecond)
    if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_city=="") req.body.ac_city=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_state=="") req.body.ac_state=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_ptype=="") req.body.ac_ptype=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_taxnm=="") req.body.ac_taxnm=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.broker_Code=="") req.body.broker_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.sl_Person=="") req.body.sl_Person=mongoose.Types.ObjectId('578df3efb618f5141202a196');
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let  account = {};
        account.ACName = req.body.ac_name;
        if(req.body.ac_opbal == null || req.body.ac_opbal == '')req.body.ac_opbal = 0;
        account.OpBalance = req.body.ac_opbal;
        account.dbcr = req.body.ac_open_type
        account.GroupName = req.body.ac_groupname;
        account.broker_Code = req.body.broker_Code;
        account.sl_Person = req.body.sl_Person;
        account.PanNumber = req.body.ac_pan;
        account.ACCode = req.body.ac_code;
        account.Address1 = req.body.ac_add1;
        account.CityName = req.body.ac_city;
        account.StateName = req.body.ac_state;
        account.Area = req.body.ac_area;
        account.GSTIN = req.body.ac_gstin;
        account.bank_group= req.body.bank_group;
        account.ac_add2= req.body.ac_add2;
        account.ac_intrestper= req.body.ac_intrestper;
        account.ac_taxnm= req.body.ac_taxnm;
        account.ac_fccino= req.body.ac_fccino;
        account.FSS_DATE = req.body.FSS_DATE;
        account.ac_creditdys = req.body.ac_creditdys;
        account.ac_pincode = req.body.ac_pincode;
        account.PartyType = req.body.ac_ptype;
        account.CrLimit = req.body.ac_crelimit;
        account.Email = req.body.ac_email;
        account.MobileNo = req.body.ac_phmob;
        account.ac_phoff = req.body.ac_phoff;
        account.ac_phfax = req.body.ac_phfax;
        account.ac_phres = req.body.ac_phres;
        account.ac_iecno = req.body.ac_iecno;
        account.ac_website = req.body.ac_website;
        account.ac_PrintType = req.body.ac_PrintType;
        account.ac_APMC = req.body.ac_APMC;
        account.ac_transportCode = req.body.ac_transportCode;
        account.del =  'N';
        account.update = new Date();
        account.usrnm =  req.session.user;
        account.masterid =   req.session.masterid;
        let query = {_id:req.params.id}
        a_mast.findById(req.params.id, function(errors, rio){
        let trfls=true;
          if(rio != null) {
            a_mast.update(query , account ,function (err) {
                if(err)console.log('Acc Mast Success Fasle',err)
                else console.log('Acc Mast Success True')
            });
            trfls=true  
            journalmast.findOne({cashac_name:req.params.id,main_bk:'OP',co_code:req.session.compid,div_code:req.session.divid},function(err, op_bal){
                if(err){
                    console.log(err)
                }else{
                    if(op_bal == null || op_bal == '' || op_bal == []){
                        let journal = new journalmast();
                        // journal.account_id = req.params.id;//trans scema fetech id
                        journal.main_bk = "OP";
                        if(req.body.ac_open_type == 'Debit')journal.d_c ="D";
                        if(req.body.ac_open_type == 'Credit')journal.d_c ="C";
                        journal.vouc_code = 0;
                        journal.cash_date = DateObject;
                        journal.c_j_s_p = req.body.so_no;
                        journal.cash_edatemilisecond = proformadatemilisecond;
                        journal.cashac_name = req.params.id;
                        journal.cash_bank_name = req.params.id;
                        journal.cash_narrtwo = 'Opening';
                        if(req.body.ac_open_type == 'Debit')journal.cash_narrone = 'Debit';
                        if(req.body.ac_open_type == 'Credit')journal.cash_narrone = 'Credit';
                        journal.del = "N";
                        journal.entrydate = new Date();
                        if(req.body.ac_opbal == '' || req.body.ac_opbal == null)req.body.ac_opbal = 0
                        journal.cash_amount = req.body.ac_opbal;
                        journal.co_code = req.session.compid;
                        journal.div_code = req.session.divid;
                        journal.usrnm = req.session.user;
                        journal.masterid = req.session.masterid;
                        journal.save(function (err){
                            console.log(err);            
                        });
                    }else{
                        let journal = {};
                        // journal.account_id = req.params.id;//trans scema fetech id
                        journal.main_bk = "OP";
                        if(req.body.ac_open_type == 'Debit')journal.d_c ="D";
                        if(req.body.ac_open_type == 'Credit')journal.d_c ="C";
                        journal.vouc_code = 0;
                        journal.cash_date = DateObject;
                        journal.c_j_s_p = req.body.so_no;
                        journal.cash_edatemilisecond = proformadatemilisecond;
                        journal.cashac_name = req.params.id;
                        journal.cash_bank_name = req.params.id;
                        journal.cash_narrtwo = 'Opening';
                        if(req.body.ac_open_type == 'Debit')journal.cash_narrone = 'Debit';
                        if(req.body.ac_open_type == 'Credit')journal.cash_narrone = 'Credit';
                        journal.del = "N";
                        journal.update = new Date();
                        if(req.body.ac_opbal == '' || req.body.ac_opbal == null)req.body.ac_opbal = 0
                        journal.cash_amount = req.body.ac_opbal;
                        journal.co_code = req.session.compid;
                        journal.div_code = req.session.divid;
                        journal.usrnm = req.session.user;
                        journal.masterid = req.session.masterid;
                        let querytrans = {cashac_name:req.params.id,main_bk: "OP"}
                        journalmast.update(querytrans,journal,function (err){
                            console.log(err);            
                        });
                    }
                }
            })                                                   
        }else{
            trfls=false 
        }
        return  res.json({'success':trfls});
      })
   }
});
});
router.post('/update_accountInSaleBill/:id',function(req, res){
    if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_city=="") req.body.ac_city=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_state=="") req.body.ac_state=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_ptype=="") req.body.ac_ptype=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_taxnm=="") req.body.ac_taxnm=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.broker_Code=="") req.body.broker_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.sl_Person=="") req.body.sl_Person=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let  account = {};
        account.ACName = req.body.ac_name;
        account.GroupName = req.body.ac_groupname;
        account.broker_Code = req.body.broker_Code;
        account.sl_Person = req.body.sl_Person;
        account.PanNumber = req.body.ac_pan;
        account.ACCode = req.body.ac_code;
        account.Address1 = req.body.ac_add1;
        account.CityName = req.body.ac_city;
        account.StateName = req.body.ac_state;
        account.Area = req.body.ac_area;
        account.GSTIN = req.body.ac_gstin;
        account.bank_group= req.body.bank_group;
        account.ac_add2= req.body.ac_add2;
        account.ac_intrestper= req.body.ac_intrestper;
        account.ac_taxnm= req.body.ac_taxnm;
        account.ac_fccino= req.body.ac_fccino;
        account.ac_creditdys = req.body.ac_creditdys;
        account.ac_pincode = req.body.ac_pincode;
        account.PartyType = req.body.ac_ptype;
        account.CrLimit = req.body.ac_crelimit;
        account.Email = req.body.ac_email;
        account.MobileNo = req.body.ac_phmob;
        account.ac_phoff = req.body.ac_phoff;
        account.ac_phfax = req.body.ac_phfax;
        account.ac_phres = req.body.ac_phres;
        account.ac_iecno = req.body.ac_iecno;
        account.ac_website = req.body.ac_website;
        account.ac_PrintType = req.body.ac_PrintType;
        account.ac_APMC = req.body.ac_APMC;
        account.ac_transportCode = req.body.ac_transportCode;
        // account.del =  'N';
        account.update = new Date();
        account.usrnm =  req.session.user;
        account.masterid =   req.session.masterid;
        let query = {_id:req.params.id}
        a_mast.update(query , account ,function (err) {
            if(err){
                res.json({'success':false,'err':err});
            }
            else{
                res.json({'success':true});
            }
        });
   }
});
let taxmast = require('../models/taxSchema');
let Garu = require('../models/Garu_Aavak_Schema');

router.delete('/confirm/:id', function(req, res){
    journalmast.findOne({$or: [{cashac_name:req.params.id},{cash_bank_name:req.params.id}],div_code:req.session.divid,co_code:req.session.compid,main_bk:{$ne:'OP'},del:"N"}, function(err1, tran){
        Garu.findOne({$or: [{party_Code:req.params.id}, {broker_Code:req.params.id}, {sl_Person:req.params.id},{"garu_Aavak_Group":{$elemMatch: {sale_Ac_Title: req.params.id}}},{"garu_Aavak_Group":{$elemMatch: {purchase_Ac_Title: req.params.id}}}],div_code:req.session.divid,co_code:req.session.compid, del:"N"}, function(err2, Garu){
            taxmast.findOne({$or: [{tr_CGSTR:req.params.id}, {tr_CGSTP:req.params.id}, {tr_SGSTR:req.params.id}, {tr_SGSTP:req.params.id}, {tr_IGSTR:req.params.id}, {tr_IGSTP:req.params.id}, {tr_TDSAC:req.params.id}],masterid:req.session.masterid,del:"N"}, function(err3, tax){
                if(err1 || err2 || err3){
                console.log(err1+"  "+err2);
                }else{
                    // console.log('trans',tran);
                    // console.log('Garu',Garu);
                    // console.log('tax',tax);
                    if(tax != null || Garu != null || tran != null){
                        res.json({success:'true'});
                    }else{
                        res.json({success:'false'});
                    }
                }
            });
        });
    });
});

router.delete('/:id', function(req, res){    
    if(!req.user._id){
      res.status(500).send();
    }else{
        // console.log('Account Mast Delete ID',req.params.id);
        let query = {_id:req.params.id}
        let state = {};
        state.del = 'Y';
        state.delete = new Date();
        a_mast.update(query,state, function(err,somast){
          if(err){
            console.log(err);
          }
          var querytrans = {cashac_name:req.params.id}
          journalmast.update(querytrans,state, function(err,somast){
            if(err){
              console.log(err);
            }
            journalmast
            res.send('Success');
          });
        });
    }
});

router.get('/checkAddressdetailes/:id', ensureAuthenticated, function(req, res){
    g_mast.findById(req.params.id, function(err, g_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching Group Master'+err });
        } else {
            res.json({ 'success': true, 'g_mast': g_mast });
        }
    });
});

router.get('/getCityData/:id', ensureAuthenticated, function(req, res){
    city.findById(req.params.id, function(err, city){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching Group Master'+err });
        } else {
            res.json({ 'success': true, 'city': city });
        }
    }).populate('StateName').populate('PartyType');
});


// router.post('/amast_GroupUpdate',function(req, res){
//     g_mast.find({del:"N"},async function (err, g_mast){
//     let errors = req.validationErrors();
//     if(errors)
//     {
//         console.log(errors);
//     }
//     else{
//         for(let i=0; i<g_mast.length; i++){
//             // var acc = await a_mast.find({LEVL_CODE:g_mast[i].LEVL_CODE},async function (err, g_mast){});
//             console.log(i,g_mast[i].LEVL_CODE);
//             if(g_mast[i].LEVL_CODE == null || g_mast[i].LEVL_CODE == undefined || g_mast[i].LEVL_CODE == ''){
//             }else{
//                 let account = {};
//                 account.GroupName = g_mast[i]._id;
//                 var qry = {LEVL_CODE:g_mast[i].LEVL_CODE};
//                 console.log(qry);
//                 a_mast.updateMany(qry,account,function(err){
//                     if(err){
//                         console.log(err)
//                     }else{
//                         console.log('Success');
//                     }
//                 });
//             }
//         }
//     }
//     })
// });

// router.post('/amast_Update',function(req, res){
//     city.find({del:"N"},async function (err, city_master){
//     let errors = req.validationErrors();
//     if(errors)
//     {
//         console.log(errors);
//     }
//     else{
//         for(let i=0; i<city_master.length; i++){
//             var acc = await a_mast.find({ACC_PLACE:city_master[i].CityName},async function (err, city_master){});
//             if(acc == null || acc == [] || acc == ''){
//             }else{
//                 let account = {};
//                 account.CityName = city_master[i]._id
//                 account.StateName = city_master[i].StateName
//                 account.PartyType = city_master[i].PartyType
//                 var qry = {ACC_PLACE:city_master[i].CityName};
//                 a_mast.updateMany(qry,account,function(err){
//                     if(err){
//                         console.log(err)
//                     }else{
//                         console.log('Success');
//                     }
//                 });
//             }
//         }
//     }
//     })
// });


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/userright/login');
    }
}

module.exports = router;