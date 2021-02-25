const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let cashmast = require('../models/trans');
let GaruAavak = require('../models/Garu_Aavak_Schema');
let outstanding= require('../models/outstading_schema');
let addmast = require('../models/addless_mast_schema');
const moment = require('moment-timezone');
let bank = require('../models/bank_schema');
let accname = require('../models/accountSchema');
let addlessMast= require('../models/Add_Less_Parameter_Master_Schema');
var Gs_master = require('../models/gsTableSchema');
let vouchMast= require('../models/vouchSchema');
let tax_mast= require('../models/taxSchema');
let division = require('../models/divSchema');
var query;


router.get('/Tax_Voucher_List', ensureAuthenticated ,function(req,res){
    GaruAavak.find({main_bk:'TV',co_code:req.session.compid,div_code:req.session.divid,del:'N'},function(err,Tax_Voucher){
        res.render('Tax_Voucher_List.hbs',{
            pageTitle:'Tax Voucher List',
            Tax_Voucher: Tax_Voucher,
            compnm:req.session.compnm,
            divnm:req.session.divmast,
            sdate: req.session.compsdate,
            edate:req.session.compedate,
            usrnm:req.session.user,
            security: req.session.security,
            administrator:req.session.administrator
        });
    }).populate('ExpenseAc').populate('Deductee').populate('Tax_Type').populate('cash_bank_name');
});

router.get('/Tax_Voucher_Add', ensureAuthenticated, function(req, res){//,GroupName :{ $in : qryGs }
vouchMast.find({Module:'Tax Voucher',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
    GaruAavak.aggregate((
        [{ $match: { main_bk:"TV",c_j_s_p:vouchMast[0].Vo_book,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
        { $sort: { vouc_code: -1} },
        { $limit :1 },
        { $group:
            {
                _id: {
                    "_id": "$vouc_code",
                },
            }
        }]
    ),
    function (err, lastEntryNo){
            if (err) {
                console.log(err);
            } else {
                var lastNo = 1;
                if(lastEntryNo == null || lastEntryNo == '' || lastEntryNo == [])lastNo = 1;
                else lastNo = parseInt(lastEntryNo[0]._id._id)+1;
                res.render('Tax_Voucher_Add.hbs', {
                    pageTitle:'Tax Voucher Add',
                    lastNo:lastNo,
                    vouchMast:vouchMast,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        });
    });
});

router.post('/add', async function(req, res){
        if(req.body.cash_bank_name == "") req.body.cash_bank_name    = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var cash_edate = req.body.cash_edate;
        var DateObject =  moment(cash_edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let dsi = new GaruAavak();
            dsi.main_bk = "TV";
            dsi.c_j_s_p = req.body.c_j_s_p;
            dsi.vouc_code = req.body.vouc_code;
            dsi.entry_Date = DateObject;
            dsi.entry_Datemilisecond = sodatemilisecond;
            dsi.HSN_SAC= req.body.HSN_SAC;
            dsi.ExpenseAc = req.body.ExpenseAc;
            dsi.Deductee = req.body.Deductee;
            dsi.GSTIN = req.body.GSTIN;
            dsi.bill_No = req.body.bill_No;

            var bill_Date = req.body.bill_Date;
            var bill_DateDateObject =  moment(bill_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var bill_Datemilisecond = bill_DateDateObject.format('x');
            dsi.bill_Date = bill_DateDateObject;
            dsi.bill_Datemilisecond = bill_Datemilisecond;

            dsi.cash_bank_name      = req.body.cash_bank_name;
            
            dsi.Basic_Amt = req.body.Basic_Amt;
            dsi.ITC = req.body.ITC;
            dsi.Tax_Type = req.body.Tax_Type;
            dsi.TDS_On = req.body.TDS_On;
            dsi.TDS_Per = req.body.TDS_Per;
            dsi.GST_Per = req.body.GST_Per;
            dsi.Narration = req.body.Narration;
            dsi.garu_Remarks = req.body.cash_remarks;
            dsi.TDS_Amt = req.body.TDS_Amt;
            dsi.del  = 'N';
            dsi.CNCL = 'N';
            dsi.entrydate = new Date();
            dsi.co_code              = req.session.compid;
            dsi.div_code             = req.session.divid;
            dsi.usrnm                = req.session.user;
            dsi.masterid             = req.session.masterid
            dsi.save();
            if(req.body.cash_bank_name == null || req.body.cash_bank_name == '' || req.body.cash_bank_name == '578df3efb618f5141202a196')flag = 1;
            else{
                let cash_bank = new cashmast();
                cash_bank.Tax_Voucher_id = dsi._id;
                cash_bank.main_bk = "CB";
                cash_bank.d_c = "D";
                cash_bank.c_j_s_p              = req.body.c_j_s_p;
                cash_bank.vouc_code            = req.body.vouc_code;
                cash_bank.cash_date            = DateObject;
                cash_bank.cash_edatemilisecond = sodatemilisecond;
                cash_bank.cash_type            = 'PAYMENT';
                cash_bank.cash_bank_name       = req.body.cash_bank_name;     
                cash_bank.del                  = "N";
                cash_bank.CNCL                 = 'N';
                cash_bank.entrydate            = new Date();

                cash_bank.HSN_SAC              = req.body.HSN_SAC;
                cash_bank.ExpenseAc            = req.body.ExpenseAc;
                cash_bank.Deductee             = req.body.Deductee;

                cash_bank.bill_Date = bill_DateDateObject;
                cash_bank.bill_Datemilisecond = bill_Datemilisecond;

                cash_bank.cashac_name          = req.body.Deductee;
                cash_bank.cash_amount          = req.body.cash_amount;
                cash_bank.Add_Amount_Deduction = 0;
                cash_bank.Less_Amount_Deduction= 0;
                cash_bank.cash_narrone         = req.body.Narration;
                cash_bank.cash_narrtwo         = '';

                cash_bank.Basic_Amt            = req.body.Basic_Amt;
                cash_bank.ITC                  = req.body.ITC;
                cash_bank.Tax_Type             = req.body.Tax_Type;
                cash_bank.TDS_On               = req.body.TDS_On;
                cash_bank.TDS_Per              = req.body.TDS_Per;
                cash_bank.GST_Per              = req.body.GST_Per;

                cash_bank.Tot_Debit            = req.body.Tot_Debit;
                cash_bank.Tot_Credit           = req.body.Tot_Credit;
                cash_bank.cash_remarks         = req.body.cash_remarks;
                cash_bank.co_code              = req.session.compid;
                cash_bank.div_code             = req.session.divid;
                cash_bank.usrnm                = req.session.user;
                cash_bank.masterid             = req.session.masterid
                cash_bank.save(function (err){});
                var Dsi_trans_id_CB_update = {}
                Dsi_trans_id_CB_update.trans_id_CB = cash_bank._id;
                var qry = {_id:dsi._id};
                GaruAavak.update(qry,Dsi_trans_id_CB_update,function(err){
                })
            }
            var Trans_id_Arr = [] 
            var Arr = req.body.Tax_Voucher_Arr;
            for(var i = 0; i<Arr.length; i++){
                    let cash_bank = new cashmast();
                    cash_bank.srno = i;
                    cash_bank.Tax_Voucher_id = dsi._id;
                    cash_bank.main_bk = "TV";
                    if(Arr[i].credit>0) cash_bank.d_c ="C";
                    if(Arr[i].debit>0) cash_bank.d_c = "D";
                    cash_bank.c_j_s_p              = req.body.c_j_s_p;
                    cash_bank.vouc_code            = req.body.vouc_code;
                    cash_bank.cash_date            = DateObject;
                    cash_bank.cash_edatemilisecond = sodatemilisecond;
                    cash_bank.cash_bank_name       = mongoose.Types.ObjectId('578df3efb618f5141202a196');     
                    cash_bank.del                  = "N";
                    cash_bank.CNCL                 = "N";
                    cash_bank.entrydate            = new Date();

                    cash_bank.HSN_SAC              = req.body.HSN_SAC;
                    cash_bank.ExpenseAc            = req.body.ExpenseAc;
                    cash_bank.Deductee             = req.body.Deductee;

                    cash_bank.bill_Date = bill_DateDateObject;
                    cash_bank.bill_Datemilisecond = bill_Datemilisecond;

                    cash_bank.cashac_name          = Arr[i].cashac_name;
                    if(Arr[i].credit>0) cash_bank.cash_amount = Arr[i].credit;
                    if(Arr[i].debit>0) cash_bank.cash_amount  = Arr[i].debit;
                    cash_bank.Add_Amount_Deduction = 0;
                    cash_bank.Less_Amount_Deduction= 0;
                    cash_bank.cash_narrone         = Arr[i].cash_narrone;
                    cash_bank.cash_narrtwo         = req.body.Narration;

                    cash_bank.Basic_Amt            = req.body.Basic_Amt;
                    cash_bank.ITC                  = req.body.ITC;
                    cash_bank.Tax_Type             = req.body.Tax_Type;
                    cash_bank.TDS_On               = req.body.TDS_On;
                    cash_bank.TDS_Per              = req.body.TDS_Per;
                    cash_bank.GST_Per              = req.body.GST_Per;

                    cash_bank.Tot_Debit            = req.body.Tot_Debit;
                    cash_bank.Tot_Credit           = req.body.Tot_Credit;
                    cash_bank.cash_remarks         = req.body.cash_remarks;
                    cash_bank.co_code              = req.session.compid;
                    cash_bank.div_code             = req.session.divid;
                    cash_bank.usrnm                = req.session.user;
                    cash_bank.masterid             = req.session.masterid
                    cash_bank.save(function (err){});
                    Trans_id_Arr.push(cash_bank._id);
            }
            var Dsi_trans_id_update = {}
            Dsi_trans_id_update.trans_id = Trans_id_Arr;
            var qry = {_id:dsi._id};
            GaruAavak.update(qry,Dsi_trans_id_update,function(err){
            })
            res.redirect('/Tax_Voucher/Tax_Voucher_Add');
        }
});

router.get('/Tax_Voucher_Update/:id', ensureAuthenticated, function(req, res){
    vouchMast.find({Module:'Tax Voucher',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
        GaruAavak.findById(req.params.id,function(err,Tax_Voucher){
            cashmast.find({Tax_Voucher_id:req.params.id,del:'N',main_bk:'TV'},function(err,Trans_Entry){
                cashmast.findOne({Tax_Voucher_id:req.params.id,del:'N',main_bk:'CB'},function(err,Trans_Entry_CB){
                    if(err){
                        
                    }
                    else{
                        res.render('Tax_Voucher_Update.hbs',{
                            pageTitle:'Tax Voucher Update',
                            Tax_Voucher: Tax_Voucher,
                            Trans_Entry:Trans_Entry,
                            Trans_Entry_CB:Trans_Entry_CB,
                            vouchMast:vouchMast,
                            compnm:req.session.compnm,
                            divnm:req.session.divmast,
                            sdate: req.session.compsdate,
                            edate:req.session.compedate,
                            usrnm:req.session.user,
                            security: req.session.security,
                            administrator:req.session.administrator
                        });
                    }
                }).populate('cash_bank_name');
            }).populate('cashac_name');
        }).populate('ExpenseAc').populate('Deductee').populate('Tax_Type').populate('cash_bank_name');
    });
});

router.post('/update/:id',ensureAuthenticated, function(req, res) {
    if(req.body.cash_bank_name == "") req.body.cash_bank_name    = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var cash_edate = req.body.cash_edate;
        var DateObject =  moment(cash_edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let dsi = {};
            dsi.main_bk = "TV";
            dsi.c_j_s_p = req.body.c_j_s_p;
            dsi.vouc_code = req.body.vouc_code;
            dsi.entry_Date = DateObject;
            dsi.entry_Datemilisecond = sodatemilisecond;
            dsi.HSN_SAC= req.body.HSN_SAC;
            dsi.ExpenseAc = req.body.ExpenseAc;
            dsi.Deductee = req.body.Deductee;
            dsi.GSTIN = req.body.GSTIN;
            dsi.bill_No = req.body.bill_No;

            var bill_Date = req.body.bill_Date;
            var bill_DateDateObject =  moment(bill_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var bill_Datemilisecond = bill_DateDateObject.format('x');
            dsi.bill_Date = bill_DateDateObject;
            dsi.bill_Datemilisecond = bill_Datemilisecond;

            dsi.cash_bank_name      = req.body.cash_bank_name;
            
            dsi.Basic_Amt = req.body.Basic_Amt;
            dsi.ITC = req.body.ITC;
            dsi.Tax_Type = req.body.Tax_Type;
            dsi.TDS_On = req.body.TDS_On;
            dsi.TDS_Per = req.body.TDS_Per;
            dsi.GST_Per = req.body.GST_Per;
            dsi.Narration = req.body.Narration;
            dsi.garu_Remarks = req.body.cash_remarks;
            dsi.TDS_Amt = req.body.TDS_Amt;
            dsi.del     = 'N';
            dsi.CNCL    = 'N';
            dsi.update = new Date();
            dsi.co_code              = req.session.compid;
            dsi.div_code             = req.session.divid;
            dsi.usrnm                = req.session.user;
            dsi.masterid             = req.session.masterid
            var qry = {_id:req.params.id};
            GaruAavak.update(qry,dsi,function(err){
                if(err){

                }else{
                    if(req.body.cash_bank_name == null || req.body.cash_bank_name == '' || req.body.cash_bank_name == '578df3efb618f5141202a196')flag = 1;
                    else{
                        let cash_bank = {};
                        cash_bank.Tax_Voucher_id = req.params.id;
                        cash_bank.main_bk = "CB";
                        cash_bank.d_c = "D";
                        cash_bank.c_j_s_p              = req.body.c_j_s_p;
                        cash_bank.vouc_code            = req.body.vouc_code;
                        cash_bank.cash_date            = DateObject;
                        cash_bank.cash_edatemilisecond = sodatemilisecond;
                        cash_bank.cash_type            = 'PAYMENT';
                        cash_bank.cash_bank_name       = req.body.cash_bank_name;     
                        cash_bank.del                  = "N";
                        cash_bank.CNCL                 = "N";
                        cash_bank.entrydate            = new Date();

                        cash_bank.HSN_SAC              = req.body.HSN_SAC;
                        cash_bank.ExpenseAc            = req.body.ExpenseAc;
                        cash_bank.Deductee             = req.body.Deductee;

                        cash_bank.bill_Date = bill_DateDateObject;
                        cash_bank.bill_Datemilisecond = bill_Datemilisecond;

                        cash_bank.cashac_name          = req.body.Deductee;
                        cash_bank.cash_amount          = req.body.cash_amount;
                        cash_bank.Add_Amount_Deduction = 0;
                        cash_bank.Less_Amount_Deduction= 0;
                        cash_bank.cash_narrone         = req.body.Narration;
                        cash_bank.cash_narrtwo         = '';

                        cash_bank.Basic_Amt            = req.body.Basic_Amt;
                        cash_bank.ITC                  = req.body.ITC;
                        cash_bank.Tax_Type             = req.body.Tax_Type;
                        cash_bank.TDS_On               = req.body.TDS_On;
                        cash_bank.TDS_Per              = req.body.TDS_Per;
                        cash_bank.GST_Per              = req.body.GST_Per;

                        cash_bank.Tot_Debit            = req.body.Tot_Debit;
                        cash_bank.Tot_Credit           = req.body.Tot_Credit;
                        cash_bank.cash_remarks         = req.body.cash_remarks;
                        cash_bank.co_code              = req.session.compid;
                        cash_bank.div_code             = req.session.divid;
                        cash_bank.usrnm                = req.session.user;
                        cash_bank.masterid             = req.session.masterid
                        var qryCBEntry = {Tax_Voucher_id:req.params.id};
                        cashmast.update(qryCBEntry,cash_bank,function(err){
                        });
                    }
                    var Arr = req.body.Tax_Voucher_Arr;
                    for(var i = 0; i<Arr.length; i++){
                        if(Arr[i].Trans_Entry_id == '' || Arr[i].Trans_Entry_id == undefined || Arr[i].Trans_Entry_id == null){
                            let cash_bank = new cashmast();
                            cash_bank.srno = i;
                            cash_bank.Tax_Voucher_id = req.params.id;
                            cash_bank.main_bk = "TV";
                            if(Arr[i].credit>0) cash_bank.d_c ="C";
                            if(Arr[i].debit>0) cash_bank.d_c = "D";
                            cash_bank.c_j_s_p              = req.body.c_j_s_p;
                            cash_bank.vouc_code            = req.body.vouc_code;
                            cash_bank.cash_date            = DateObject;
                            cash_bank.cash_edatemilisecond = sodatemilisecond;
                            cash_bank.cash_bank_name       = mongoose.Types.ObjectId('578df3efb618f5141202a196');     
                            cash_bank.del                  = "N";
                            cash_bank.CNCL                 = "N";
                            cash_bank.entrydate            = new Date();

                            cash_bank.HSN_SAC              = req.body.HSN_SAC;
                            cash_bank.ExpenseAc            = req.body.ExpenseAc;
                            cash_bank.Deductee             = req.body.Deductee;

                            cash_bank.bill_Date = bill_DateDateObject;
                            cash_bank.bill_Datemilisecond = bill_Datemilisecond;

                            cash_bank.cashac_name          = Arr[i].cashac_name;
                            if(Arr[i].credit>0) cash_bank.cash_amount = Arr[i].credit;
                            if(Arr[i].debit>0) cash_bank.cash_amount  = Arr[i].debit;
                            cash_bank.Add_Amount_Deduction = 0;
                            cash_bank.Less_Amount_Deduction= 0;
                            cash_bank.cash_narrone         = Arr[i].cash_narrone;
                            cash_bank.cash_narrtwo         = req.body.Narration;

                            cash_bank.Basic_Amt            = req.body.Basic_Amt;
                            cash_bank.ITC                  = req.body.ITC;
                            cash_bank.Tax_Type             = req.body.Tax_Type;
                            cash_bank.TDS_On               = req.body.TDS_On;
                            cash_bank.TDS_Per              = req.body.TDS_Per;
                            cash_bank.GST_Per              = req.body.GST_Per;

                            cash_bank.Tot_Debit            = req.body.Tot_Debit;
                            cash_bank.Tot_Credit           = req.body.Tot_Credit;
                            cash_bank.cash_remarks         = req.body.cash_remarks;
                            cash_bank.co_code              = req.session.compid;
                            cash_bank.div_code             = req.session.divid;
                            cash_bank.usrnm                = req.session.user;
                            cash_bank.masterid             = req.session.masterid
                            cash_bank.save(function (err){});
                        }else{
                            let cash_bank = {};
                            cash_bank.srno = i;
                            cash_bank.Tax_Voucher_id = req.params.id;
                            cash_bank.main_bk = "TV";
                            if(Arr[i].credit>0) cash_bank.d_c ="C";
                            if(Arr[i].debit>0) cash_bank.d_c = "D";
                            cash_bank.c_j_s_p              = req.body.c_j_s_p;
                            cash_bank.vouc_code            = req.body.vouc_code;
                            cash_bank.cash_date            = DateObject;
                            cash_bank.cash_edatemilisecond = sodatemilisecond;
                            cash_bank.cash_bank_name       = mongoose.Types.ObjectId('578df3efb618f5141202a196');     
                            cash_bank.del                  = "N";
                            cash_bank.CNCL                 = "N";
                            cash_bank.update               = new Date();

                            cash_bank.HSN_SAC              = req.body.HSN_SAC;
                            cash_bank.ExpenseAc            = req.body.ExpenseAc;
                            cash_bank.Deductee             = req.body.Deductee;

                            cash_bank.bill_Date = bill_DateDateObject;
                            cash_bank.bill_Datemilisecond = bill_Datemilisecond;

                            cash_bank.cashac_name          = Arr[i].cashac_name;
                            if(Arr[i].credit>0) cash_bank.cash_amount = Arr[i].credit;
                            if(Arr[i].debit>0) cash_bank.cash_amount  = Arr[i].debit;
                            cash_bank.Add_Amount_Deduction = 0;
                            cash_bank.Less_Amount_Deduction= 0;
                            cash_bank.cash_narrone         = Arr[i].cash_narrone;
                            cash_bank.cash_narrtwo         = req.body.Narration;

                            cash_bank.Basic_Amt            = req.body.Basic_Amt;
                            cash_bank.ITC                  = req.body.ITC;
                            cash_bank.Tax_Type             = req.body.Tax_Type;
                            cash_bank.TDS_On               = req.body.TDS_On;
                            cash_bank.TDS_Per              = req.body.TDS_Per;
                            cash_bank.GST_Per              = req.body.GST_Per;

                            cash_bank.Tot_Debit            = req.body.Tot_Debit;
                            cash_bank.Tot_Credit           = req.body.Tot_Credit;
                            cash_bank.cash_remarks         = req.body.cash_remarks;
                            cash_bank.co_code              = req.session.compid;
                            cash_bank.div_code             = req.session.divid;
                            cash_bank.usrnm                = req.session.user;
                            cash_bank.masterid             = req.session.masterid
                            var qryTransEntry = {_id:Arr[i].Trans_Entry_id};
                            cashmast.update(qryTransEntry,cash_bank,function (err){
                                if(err)console.log(err)
                            });
                        }
                    }
                }
            });
            res.redirect('/Tax_Voucher/Tax_Voucher_List');
        }
});
//delete_Trans_Entry
router.get('/delete/:id',ensureAuthenticated,async function(req, res){
    let cash_bank = {};
        cash_bank.del = "Y";
        cash_bank.delete = new Date();
        qry1 = {_id:req.params.id};
        qry2 = {Tax_Voucher_id:req.params.id};
        GaruAavak.update(qry1,cash_bank,function(err){
            if(err){
                res.json({'success':false,'error':err});
            }else{
                cashmast.updateMany(qry2,cash_bank,function(err){
                    if(err){
                        res.json({'success':false,'error':err});
                    }
                    else{
                        res.json({'success':true});
                    }
                });
            }
        });
});
router.get('/delete_Trans_Entry/:id',ensureAuthenticated,async function(req, res){
    let cash_bank = {};
        cash_bank.del = "Y";
        cash_bank.delete = new Date();
        qry1 = {_id:req.params.id};
        cashmast.update(qry1,cash_bank,function(err){
            if(err){
                res.json({'success':false,'error':err});
            }
            else{
                res.json({'success':true});
            }
        });
          
});
router.get('/AccountData', ensureAuthenticated, function(req, res){
    accname.findById(req.query.Account,function(err,Account){
        if(err)res.json({'success':false,'Error':err});
        else res.json({'success':true,'Account':Account});
    });
});

router.get('/getTaxMasterData', ensureAuthenticated, function(req, res){
    tax_mast.findById(req.query.TaxType,function(err,TaxType){
        if(err)res.json({'success':false,'Error':err});
        else res.json({'success':true,'TaxType':TaxType});
    }).populate('tx_TDSAC').populate('tx_SGSTR').populate('tx_SGSTP').populate('tx_CGSTR').populate('tx_CGSTP').populate('tx_IGSTR').populate('tx_IGSTP');
});


// Tds Challan ##################################################################################################################################################
router.get('/Tds_Challan', ensureAuthenticated ,function(req,res){
    division.find({masterid:req.session.masterid},function(err,division){
        res.render('Tds_Challan.hbs',{
            pageTitle:'TDS Challan',
            division: division,
            compnm:req.session.compnm,
            divnm:req.session.divmast,
            sdate: req.session.compsdate,
            edate:req.session.compedate,
            usrnm:req.session.user,
            security: req.session.security,
            administrator:req.session.administrator
        });
    }).populate('ExpenseAc').populate('Deductee').populate('Tax_Type').populate('cash_bank_name');
});

router.get('/ShowTds_Challan_List',ensureAuthenticated,function(req,res){
    var start_date = req.query.start_date;
    var end_date = req.query.end_date;
    var party = req.query.party;
    var Tax_Type = req.query.Tax_Type
    var division = req.query.division;
    var challan_No = req.query.challan_No;

    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x'); 
    var qry = {$and: [{entry_Datemilisecond:{$gte:strtdate}},{entry_Datemilisecond:{$lte:enddats}}],main_bk:'TV',co_code:req.session.compid,del:'N'};
    if(challan_No == 'Sent'){
        var challan_No = {challan_no:{$exists:true}};
        qry = Object.assign(qry,challan_No)
    }
    if(challan_No == 'Due'){
        var challan_No = {challan_no:{$exists:false}};
        qry = Object.assign(qry,challan_No)
    }
    if(division != ''){
        var division = {div_code:division};
        qry = Object.assign(qry,division)
    }
    if(party != ''){
        var party = {Deductee:party};
        qry = Object.assign(qry,party)
    }
    if(Tax_Type != ''){
        var Tax_Type = {Tax_Type:Tax_Type};
        qry = Object.assign(qry,Tax_Type)
    }
    GaruAavak.find(qry,function(err,Tax_Voucher){
        if(err)res.json({'success':false,'Error':err})
        else res.json({'success':true,'Tax_Voucher':Tax_Voucher});
    }).populate('cash_bank_name').populate('Bank')
    .populate([{path: 'Tax_Type',model:'taxSchema',populate:{path:'tx_TDSAC', model:'accountSchema',populate:{path:'CityName', model:'citySchema'}}}])
    .populate([{path: 'ExpenseAc',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
    .populate([{path: 'Deductee',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}]);
})
router.post('/UpdateTaxVoucherCheckbox',function(req,res){
    if(req.body.Bank == "") req.body.Bank    = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    var Tax_Voucher_Entry_id = req.body.Tax_Voucher_Entry_id;
    var challan_no = req.body.challan_no;
    var challan_date = req.body.challan_date;
    var Bank = req.body.Bank;
    var BSR_Code = req.body.BSR_Code;
    var Chq_No = req.body.Chq_No;
    var Chq_Date = req.body.Chq_Date;

    var challan_date_Object =  moment(challan_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var challan_date_Milisecend = challan_date_Object.format('x');

    var Selected_Amt_Of_Bills = req.body.elected_Amt_Of_Bills;
    if(Tax_Voucher_Entry_id != null){
        for(let i=0; i<Tax_Voucher_Entry_id.length; i++){
            var Tax_Voucher = {};
            Tax_Voucher.challan_no = challan_no;
            Tax_Voucher.challan_date = challan_date_Object;
            Tax_Voucher.challan_date_Milisecend = challan_date_Milisecend;
            Tax_Voucher.Bank = Bank;
            Tax_Voucher.BSR_Code = BSR_Code;
            Tax_Voucher.Chq_No = Chq_No;
            Tax_Voucher.Chq_Date = Chq_Date;
            var qry = {_id:Tax_Voucher_Entry_id[i]};
            GaruAavak.update(qry,Tax_Voucher,function(err){
            })
        }
        res.json({success:true});
    }else{
        res.json({success:false});
    }
    
});

// Tax Register ##################################################################################################################################################
router.get('/Tax_Register', ensureAuthenticated ,function(req,res){
    GaruAavak.find({main_bk:'TV',co_code:req.session.compid,div_code:req.session.divid,del:'N'},function(err,Tax_Voucher){
        res.render('Tax_Register.hbs',{
            pageTitle:'Tax Register',
            Tax_Voucher: Tax_Voucher,
            compnm:req.session.compnm,
            divnm:req.session.divmast,
            sdate: req.session.compsdate,
            edate:req.session.compedate,
            usrnm:req.session.user,
            security: req.session.security,
            administrator:req.session.administrator
        });
    }).populate('ExpenseAc').populate('Deductee').populate('Tax_Type').populate('cash_bank_name');
});
router.get('/Show_Tax_Register',ensureAuthenticated,function(req,res){
    var start_date = req.query.start_date;
    var end_date = req.query.end_date;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x'); 
    var qry = {$and: [{cash_edatemilisecond:{$gte:strtdate}},{cash_edatemilisecond:{$lte:enddats}}],main_bk:'TV',div_code:req.session.divid,co_code:req.session.compid,del:'N'};
    cashmast.find(qry,function(err,Tax_Register){
        if(err)res.json({'success':false,'Error':err})
        else res.json({'success':true,'Tax_Register':Tax_Register});
    }).sort('vouc_code').populate('cash_bank_name').populate('cashac_name').populate('Tax_Voucher_id');
})

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