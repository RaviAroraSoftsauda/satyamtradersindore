const express = require('express');
const router = express.Router(); 
let brand = require('../models/brand_schema');
let journalmast = require('../models/trans');
 const moment = require('moment-timezone');
//  let bank = require('../models/bank_schema');
let accname = require('../models/accountSchema');
let vouchMast= require('../models/vouchSchema');
let outstanding= require('../models/outstading_schema');
const mongoose = require('mongoose');
let division = require('../models/divSchema');
var query;
// Add Route


router.get('/journalname', function (req, res) {
    var qry = req.query.term.term;
    accname.find({'ACName': new RegExp(qry),masterid:req.session.masterid,del:'N'},function(err, accnametyp){
        var data = new Array();
        for (var j = 0; j < accnametyp.length; j++) {
            if (accnametyp[j]['GroupName'] != null) goupnm = accnametyp[j]['GroupName']['GroupName'];
            else goupnm = "";
            if(goupnm=="CASH" || goupnm=="BANK" || goupnm=="CASH ACCOUNTS" || goupnm=="BANK ACCOUNTS")
            {
                data[j] = {
                    "id": '',
                    "text" : ''
                };
            }
            else{
                data[j] = {
                    "id": accnametyp[j]._id,
                    "text" : accnametyp[j].ACName
                };
            }
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                }});
    }).populate('GroupName').limit(100);
});

router.get('/journal_entry_list', ensureAuthenticated ,function(req,res){
    journalmast.aggregate([{ $match: { main_bk:"JV",co_code:req.session.compid,div_code:req.session.divid,del:'N'}}, { $group : {
        _id:{
            "vouc_code": "$vouc_code",
            "c_j_s_p": "$c_j_s_p",
            "main_bk": "$main_bk",
            "cash_date":"$cash_date",
            "cash_remarks":"$cash_remarks",
        }}, }], function (err, journalmast){
            accname.find({co_code:req.session.compid,div_code:req.session.divid}, function (err,accname){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render('journal_entry_list.hbs',{
                pageTitle:'Journal Entry List',
                journalmast: journalmast,
                accname:accname,
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
})
});

router.get('/journal_entry', ensureAuthenticated, function(req, res){
    vouchMast.find({Module:'Journal Entry',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
        journalmast.aggregate((
            [{ $match: { main_bk:"JV",c_j_s_p:vouchMast[0].Vo_book,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
            { $sort: { vouc_code: -1} },
            { $limit :1 },
            { $group:
                {
                    _id: {
                        "_id": "$vouc_code",
                    },
                }
            }]
        ),function (err, lastEntryNo){
            if(err){
                console.log(err);
            }else{
                var lastNo = 1;
                if(lastEntryNo == null || lastEntryNo == '' || lastEntryNo == [])lastNo = 1;
                else lastNo = parseInt(lastEntryNo[0]._id._id)+1;
                res.render('journal_entry.hbs', {
                    pageTitle:'Journal Entry',
                    journalmast:journalmast,
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
    })
});

router.post('/add', async function(req, res){
    // if(req.body.cashac_name == "") req.body.cashac_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        journalmast.aggregate((
            [{ $match: { main_bk:"JV",c_j_s_p:req.body.c_j_s_p,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
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
        async function (err, lastEntryNo){
            var last = 1;
            if(lastEntryNo == '')last = 1;
            else last = parseInt(lastEntryNo[0]._id._id)+1;
    
            var checkNo = await journalmast.findOne({vouc_code:req.body.vouc_code,del:'N',main_bk:'JV',c_j_s_p:req.body.c_j_s_p},function(err,aa){}).select('vouc_code');
            if(checkNo == null || checkNo == '')req.body.vouc_code = req.body.vouc_code;
            else req.body.vouc_code = last;

            var cash_edate = req.body.cash_edate;
            var DateObject =  moment(cash_edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var sodatemilisecond = DateObject.format('x');
            for(var i = 0; i<req.body.jourtrn.length; i++){
                let journal = new journalmast();
                journal.srno = i;
                journal.main_bk = "JV";
                if(req.body.cash_type[i]=="Debit") journal.d_c ="D";
                if(req.body.cash_type[i]=="Credit")journal.d_c ="C";
                journal.vouc_code            = req.body.vouc_code;
                journal.cash_date            = DateObject;
                journal.c_j_s_p              = req.body.c_j_s_p;
                journal.cash_edatemilisecond = sodatemilisecond;
                
                journal.del              = "N";
                journal.entrydate        = new Date();

                journal.cash_type        = req.body.cash_type[i];
                journal.cashac_name      = req.body.cashac_name[i];
                journal.cash_narrone     = req.body.cash_narrone[i];
                journal.cash_narrtwo     = req.body.cash_narrtwo[i];

                if(req.body.cash_type[i] == "Debit") journal.cash_amount  = req.body.cash_debitamount[i];
                if(req.body.cash_type[i] == "Credit")journal.cash_amount = req.body.cash_creditamount[i];
                
                if(req.body.cash_type[i] == "Debit") journal.totcash_amt  = req.body.tot_amtdebit;
                if(req.body.cash_type[i] == "Credit")journal.totcash_amt = req.body.tot_amtcridit;

                journal.tot_amtdebit     = req.body.tot_amtdebit;
                journal.tot_amtcridit    = req.body.tot_amtcridit;
                journal.cash_remarks     = req.body.cash_remarks;
                journal.outStandingArr   = req.body.outSaveArr[i]
                journal.co_code          = req.session.compid;
                journal.div_code         = req.session.divid;
                journal.usrnm            = req.session.user;
                journal.masterid         = req.session.masterid;
                journal.save(function(err){if(err)console.log(err)});
                if(req.body.outSaveArr[i] == null || req.body.outSaveArr[i] == '' || req.body.outSaveArr[i] == [] || req.body.outSaveArr[i] == undefined)flag=1
                else{
                    var outSaveArr = JSON.parse(req.body.outSaveArr[i]);
                    for(let j=0; j<outSaveArr.length; j++){
                        if(parseFloat(outSaveArr[j].ReceiveAmt) >0){
                            let out = new outstanding();
                                out.jv_Entry_id = journal._id;
                                if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                    out.main_bk = "OnAcc";
                                    out.OS_Type = 'ONA';
                                }
                                else out.main_bk = "JV";
                                out.c_j_s_p = req.body.c_j_s_p;
                                if(req.body.cash_type[i]=="Debit") out.d_c = "D";
                                if(req.body.cash_type[i]=="Credit")out.d_c = "C";
                                out.JV_vouc_code = req.body.vouc_code;
                                out.vouc_code    = outSaveArr[j].vouc_code;
                                out.cash_date    = DateObject;
                                out.cash_edatemilisecond = sodatemilisecond;
                                out.cashac_name = req.body.Credit_AC;
                                // out.cash_bank_name = req.body.cash_bank_name;
                                out.cash_narrtwo = 'Oustanding';
                                out.cash_narrone = 'Journal Entry';
                                out.del          = "N";
                                out.entrydate    = new Date();
                                out.cash_amount  = outSaveArr[j].ReceiveAmt;
                                out.Bill_Amount  = outSaveArr[j].Bill_Amt;
                                out.Bill_Date    = outSaveArr[j].Bill_Date;
                                out.Rec_Amount   = outSaveArr[j].ReceiveAmt;
                                // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                out.outstanding_amount = outSaveArr[j].ReceiveAmt;
                               
                                if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                    out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                    out.op_outstanding_id  = '';
                                }else{
                                    out.outstanding_id = outSaveArr[j].out_id;
                                    out.op_outstanding_id  = outSaveArr[j].out_id;
                                }
                                
                                out.op_main_bk  = outSaveArr[j].main_bk;
                                out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                out.op_co_code  = outSaveArr[j].co_code;
                                out.op_div_code = outSaveArr[j].div_code;

                                out.co_code  = req.session.compid;
                                out.div_code = req.session.divid;
                                out.usrnm = req.session.user;
                                out.masterid = req.session.masterid;

                                out.CNCL  = 'N';
                                out.save(function(err){if(err)console.log(err)});
                                if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                }
                                else{
                                    var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                    var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.CN_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                    OutSB.Out_recieved_Entry_Arr.push(arr);
                                    var outObj = {};
                                    outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                    outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                    outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                    outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                    outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                        if(err)console.log('Error',err);
                                        else {}
                                    });
                                }
                        }
                    }

                }
            } 
            res.redirect('/journal_entry/journal_entry');
        });
    }
});

router.get('/journal_update',ensureAuthenticated, function(req, res){
     journalmast.find({"vouc_code":req.query.vouc_code,"c_j_s_p":req.query.cjsp,main_bk:'JV',co_code:req.session.compid,div_code:req.session.divid,del:'N'}, function (err,journalmast){
        vouchMast.find({Module:'Journal Entry',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
            if (err) {
                console.log(err);
            } else {
                res.render('journal_entry_update.hbs',{
                    pageTitle:'Update Journal Entry',
                    journalmast:journalmast,
                    compnm:req.session.compnm,
                    vouchMast:vouchMast,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        });
    }).populate('cashac_name');
});

router.post('/update/:id',ensureAuthenticated,async function(req, res) {
    let trfls=false;
    // if(req.body.cashac_name=="") req.body.cashac_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var cash_edate = req.body.cash_date;
    var DateObject =  moment(cash_edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var sodatemilisecond = DateObject.format('x');
    if(errors)
    {
        console.log(errors);
    }
    else{ 
        for(var i = 0; i<req.body.jourtrn.length; i++){
            if(req.body.maincashid[i] == null || req.body.maincashid[i] == undefined || req.body.maincashid[i] == ''){
                let journal = new journalmast();
                journal.srno = i;
                journal.main_bk = "JV";
                if(req.body.cash_type[i]=="Debit") journal.d_c ="D";
                if(req.body.cash_type[i]=="Credit")journal.d_c ="C";
                journal.vouc_code            = req.body.vouc_code;
                journal.cash_date            = DateObject;
                journal.c_j_s_p              = req.body.c_j_s_p;
                journal.cash_edatemilisecond = sodatemilisecond;
                
                journal.del              = "N";
                journal.entrydate        = new Date();

                journal.cash_type        = req.body.cash_type[i];
                journal.cashac_name      = req.body.cashac_name[i];
                journal.cash_narrone     = req.body.cash_narrone[i];
                journal.cash_narrtwo     = req.body.cash_narrtwo[i];

                if(req.body.cash_type[i] == "Debit") journal.cash_amount  = req.body.cash_debitamount[i];
                if(req.body.cash_type[i] == "Credit")journal.cash_amount = req.body.cash_creditamount[i];
                
                if(req.body.cash_type[i] == "Debit") journal.totcash_amt  = req.body.tot_amtdebit;
                if(req.body.cash_type[i] == "Credit")journal.totcash_amt = req.body.tot_amtcridit;

                journal.tot_amtdebit     = req.body.tot_amtdebit;
                journal.tot_amtcridit    = req.body.tot_amtcridit;
                journal.cash_remarks     = req.body.cash_remarks;
                journal.outStandingArr   = req.body.outSaveArr[i]
                journal.co_code          = req.session.compid;
                journal.div_code         = req.session.divid;
                journal.usrnm            = req.session.user;
                journal.masterid         = req.session.masterid;
                journal.save(function(err){if(err)console.log(err)});
                if(req.body.outSaveArr[i] == null || req.body.outSaveArr[i] == '' || req.body.outSaveArr[i] == [] || req.body.outSaveArr[i] == undefined)flag=1
                else{
                    var outSaveArr = JSON.parse(req.body.outSaveArr[i]);
                    for(let j=0; j<outSaveArr.length; j++){
                        if(parseFloat(outSaveArr[j].ReceiveAmt) >0){
                            let out = new outstanding();
                                out.jv_Entry_id = journal._id;
                                if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                    out.main_bk = "OnAcc";
                                    out.OS_Type = 'ONA';
                                }
                                else out.main_bk = "JV";
                                out.c_j_s_p = req.body.c_j_s_p;
                                if(req.body.cash_type[i]=="Debit") out.d_c = "D";
                                if(req.body.cash_type[i]=="Credit")out.d_c = "C";
                                out.JV_vouc_code = req.body.vouc_code;
                                out.vouc_code    = outSaveArr[j].vouc_code;
                                out.cash_date    = DateObject;
                                out.cash_edatemilisecond = sodatemilisecond;
                                out.cashac_name = req.body.Credit_AC;
                                // out.cash_bank_name = req.body.cash_bank_name;
                                out.cash_narrtwo = 'Oustanding';
                                out.cash_narrone = 'Journal Entry';
                                out.del          = "N";
                                out.entrydate    = new Date();
                                out.cash_amount  = outSaveArr[j].ReceiveAmt;
                                out.Bill_Amount  = outSaveArr[j].Bill_Amt;
                                out.Bill_Date    = outSaveArr[j].Bill_Date;
                                out.Rec_Amount   = outSaveArr[j].ReceiveAmt;
                                // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                out.outstanding_amount = outSaveArr[j].ReceiveAmt;
                               
                                if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                    out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                    out.op_outstanding_id  = '';
                                }else{
                                    out.outstanding_id = outSaveArr[j].out_id;
                                    out.op_outstanding_id  = outSaveArr[j].out_id;
                                }
                                
                                out.op_main_bk  = outSaveArr[j].main_bk;
                                out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                out.op_co_code  = outSaveArr[j].co_code;
                                out.op_div_code = outSaveArr[j].div_code;

                                out.co_code  = req.session.compid;
                                out.div_code = req.session.divid;
                                out.usrnm = req.session.user;
                                out.masterid = req.session.masterid;

                                out.CNCL  = 'N';
                                out.save(function(err){if(err)console.log(err)});
                                if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                }
                                else{
                                    var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                    var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.CN_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                    OutSB.Out_recieved_Entry_Arr.push(arr);
                                    var outObj = {};
                                    outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                    outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                    outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                    outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                    outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                        if(err)console.log('Error',err);
                                        else {}
                                    });
                                }
                        }
                    }
                }
            } 
            else
            {
                let journal = {};
                journal.srno = i;
                journal.main_bk = "JV";
                if(req.body.cash_type[i]=="Debit") journal.d_c ="D";
                if(req.body.cash_type[i]=="Credit")journal.d_c ="C";
                journal.vouc_code            = req.body.vouc_code;
                journal.cash_date            = DateObject;
                journal.c_j_s_p              = req.body.c_j_s_p;
                journal.cash_edatemilisecond = sodatemilisecond;
                
                journal.del              = "N";
                journal.update           = new Date();

                journal.cash_type        = req.body.cash_type[i];
                journal.cashac_name      = req.body.cashac_name[i];
                journal.cash_narrone     = req.body.cash_narrone[i];
                journal.cash_narrtwo     = req.body.cash_narrtwo[i];

                if(req.body.cash_type[i] == "Debit") journal.cash_amount  = req.body.cash_debitamount[i];
                if(req.body.cash_type[i] == "Credit")journal.cash_amount = req.body.cash_creditamount[i];
                
                if(req.body.cash_type[i] == "Debit") journal.totcash_amt  = req.body.tot_amtdebit;
                if(req.body.cash_type[i] == "Credit")journal.totcash_amt = req.body.tot_amtcridit;

                journal.tot_amtdebit     = req.body.tot_amtdebit;
                journal.tot_amtcridit    = req.body.tot_amtcridit;
                journal.cash_remarks     = req.body.cash_remarks;
                journal.outStandingArr   = req.body.outSaveArr[i]
                journal.co_code          = req.session.compid;
                journal.div_code         = req.session.divid;
                journal.usrnm            = req.session.user;
                journal.masterid         = req.session.masterid;
                journalmast.update({_id:req.body.maincashid[i]},journal, function(err){if(err)console.log(err)});
                if(req.body.outSaveArr[i] == null || req.body.outSaveArr[i] == '' || req.body.outSaveArr[i] == [] || req.body.outSaveArr[i] == undefined)flag=1
                else{
                    var outSaveArr = JSON.parse(req.body.outSaveArr[i]);
                    for(let j=0; j<outSaveArr.length; j++){
                        if(outSaveArr[j].OutEntry_id == null || outSaveArr[j].OutEntry_id == undefined || outSaveArr[j].OutEntry_id == ''){
                            if(parseFloat(outSaveArr[j].ReceiveAmt) >0){
                                let out = new outstanding();
                                    out.jv_Entry_id = req.body.maincashid[i];
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                        out.main_bk = "OnAcc";
                                        out.OS_Type = 'ONA';
                                    }
                                    else out.main_bk = "JV";
                                    out.c_j_s_p = req.body.c_j_s_p;
                                    if(req.body.cash_type[i]=="Debit") out.d_c = "D";
                                    if(req.body.cash_type[i]=="Credit")out.d_c = "C";
                                    out.JV_vouc_code = req.body.vouc_code;
                                    out.vouc_code    = outSaveArr[j].vouc_code;
                                    out.cash_date    = DateObject;
                                    out.cash_edatemilisecond = sodatemilisecond;
                                    out.cashac_name = req.body.Credit_AC;
                                    // out.cash_bank_name = req.body.cash_bank_name;
                                    out.cash_narrtwo = 'Oustanding';
                                    out.cash_narrone = 'Journal Entry';
                                    out.del          = "N";
                                    out.entrydate    = new Date();
                                    out.cash_amount  = outSaveArr[j].ReceiveAmt;
                                    out.Bill_Amount  = outSaveArr[j].Bill_Amt;
                                    out.Bill_Date    = outSaveArr[j].Bill_Date;
                                    out.Rec_Amount   = outSaveArr[j].ReceiveAmt;
                                    // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                    // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                    if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                    out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                    out.outstanding_amount = outSaveArr[j].ReceiveAmt;
                                
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                        out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                        out.op_outstanding_id  = '';
                                    }else{
                                        out.outstanding_id = outSaveArr[j].out_id;
                                        out.op_outstanding_id  = outSaveArr[j].out_id;
                                    }
                                    
                                    out.op_main_bk  = outSaveArr[j].main_bk;
                                    out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                    out.op_co_code  = outSaveArr[j].co_code;
                                    out.op_div_code = outSaveArr[j].div_code;

                                    out.co_code  = req.session.compid;
                                    out.div_code = req.session.divid;
                                    out.usrnm = req.session.user;
                                    out.masterid = req.session.masterid;

                                    out.CNCL  = 'N';
                                    out.save(function(err){if(err)console.log(err)});
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                    }
                                    else{
                                        var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                        var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.CN_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                        OutSB.Out_recieved_Entry_Arr.push(arr);
                                        var outObj = {};
                                        outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                        outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                        outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                        outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                        outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                            if(err)console.log('Error',err);
                                            else {}
                                        });
                                    }
                            }
                        }else{
                            if(parseFloat(outSaveArr[j].ReceiveAmt) >0){
                                if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                }
                                else{
                                    var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                    var OutEntry = await outstanding.findById(outSaveArr[j].OutEntry_id,function(err,aa){});
                                    if(OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == []){}
                                    else{
                                        for(let r=0; r<OutSB.Out_recieved_Entry_Arr.length; r++){
                                            if(JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(OutEntry._id)){
                                                OutSB.Out_recieved_Entry_Arr.splice(r,1);
                                                break;
                                            }
                                        }
                                    }
                                    var outObj = {};
                                    outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)+parseFloat(OutEntry.Rec_Amount);
                                    outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)-parseFloat(OutEntry.Rec_Amount);
                                    outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                    outObj.outstanding_amount = parseFloat(OutSB.outstanding_balance)+parseFloat(OutEntry.Rec_Amount);
                                    outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                        if(err)console.log('529 Error',err)
                                        else {}
                                    })
                                }
                                let out = {};
                                    out.jv_Entry_id = req.body.maincashid[i];
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                        out.main_bk = "OnAcc";
                                        out.OS_Type = 'ONA';
                                    }
                                    else out.main_bk = "JV";
                                    out.c_j_s_p = req.body.c_j_s_p;
                                    if(req.body.cash_type[i]=="Debit") out.d_c = "D";
                                    if(req.body.cash_type[i]=="Credit")out.d_c = "C";
                                    out.JV_vouc_code = req.body.vouc_code;
                                    out.vouc_code    = outSaveArr[j].vouc_code;
                                    out.cash_date    = DateObject;
                                    out.cash_edatemilisecond = sodatemilisecond;
                                    out.cashac_name = req.body.Credit_AC;
                                    // out.cash_bank_name = req.body.cash_bank_name;
                                    out.cash_narrtwo = 'Oustanding';
                                    out.cash_narrone = 'Journal Entry';
                                    out.del          = "N";
                                    out.update       = new Date();
                                    out.cash_amount  = outSaveArr[j].ReceiveAmt;
                                    out.Bill_Amount  = outSaveArr[j].Bill_Amt;
                                    out.Bill_Date    = outSaveArr[j].Bill_Date;
                                    out.Rec_Amount   = outSaveArr[j].ReceiveAmt;
                                    // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                    // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                    if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                    out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                    out.outstanding_amount = outSaveArr[j].ReceiveAmt;
                                
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                        out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                        out.op_outstanding_id  = '';
                                    }else{
                                        out.outstanding_id = outSaveArr[j].out_id;
                                        out.op_outstanding_id  = outSaveArr[j].out_id;
                                    }
                                    
                                    out.op_main_bk  = outSaveArr[j].main_bk;
                                    out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                    out.op_co_code  = outSaveArr[j].co_code;
                                    out.op_div_code = outSaveArr[j].div_code;

                                    out.co_code  = req.session.compid;
                                    out.div_code = req.session.divid;
                                    out.usrnm = req.session.user;
                                    out.masterid = req.session.masterid;

                                    out.CNCL  = 'N';
                                    outstanding.update({_id:outSaveArr[j].OutEntry_id},out, function(err){if(err)console.log(err)});
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                    }
                                    else{
                                        var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                        var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.CN_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                        OutSB.Out_recieved_Entry_Arr.push(arr);
                                        var outObj = {};
                                        outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                        outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                        outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                        outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                        outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                            if(err)console.log('Error',err);
                                            else {}
                                        });
                                    }
                            }
                        }
                    }
                }
            }       
        }
        res.redirect('/journal_entry/journal_entry_list');  
    }
});

router.get('/journal_entry_print',ensureAuthenticated, function(req, res){
    journalmast.find({"vouc_code":req.query.vouc_code,"c_j_s_p":req.query.cjsp,main_bk:'JV',co_code:req.session.compid,div_code:req.session.divid,del:'N'}, function (err,journalmast){
        vouchMast.find({Module:'Journal Entry',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
            division.findById(req.session.divid, function (err,division){   
                if (err) {
                    console.log(err);
                } else {
                    res.render('journal_entry_print.hbs',{
                        pageTitle:'Journal Entry Print',
                        journalmast:journalmast,
                        division:division,
                        compnm:req.session.compnm,
                        vouchMast:vouchMast,
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
   }).sort('srno')
   .populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
});

router.get('/journal_entry_delete',async function(req, res){
    var vouc_code = req.query.vouc_code;
    var c_j_s_p = req.query.cjsp;
    let query = {vouc_code:vouc_code,c_j_s_p:c_j_s_p,main_bk:"JV",co_code:req.session.compid,div_code:req.session.divid,del:'N'}
    let cash_bank = {};
        cash_bank.del = "Y";
        cash_bank.delete = new Date();
    journalmast.updateMany(query,cash_bank,async function(err){});
    var outEntry = await outstanding.find({JV_vouc_code:vouc_code,c_j_s_p:c_j_s_p,main_bk:"JV",co_code:req.session.compid,div_code:req.session.divid,del:'N'},function(err){});
    outstanding.updateMany({JV_vouc_code:vouc_code,c_j_s_p:c_j_s_p,main_bk:"JV",co_code:req.session.compid,div_code:req.session.divid,del:'N'},cash_bank,function(err){});
    if(outEntry != null){
        for(let i=0; i<outEntry.length; i++){
            if(outEntry[i].outstanding_id == null || outEntry[i].outstanding_id == undefined || outEntry[i].outstanding_id == ''){}
            else{
                var OutSB = await outstanding.findById(outEntry[i].outstanding_id,function(err,aa){});
                if(OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == []){}
                else{
                    for(let r=0; r<OutSB.Out_recieved_Entry_Arr.length; r++){
                        if(JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outEntry[i]._id)){
                            OutSB.Out_recieved_Entry_Arr.splice(r,1);
                            break;
                        }
                    }
                }
                var outObj = {};
                outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)+parseFloat(outEntry[i].Rec_Amount);
                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)-parseFloat(outEntry[i].Rec_Amount);
                outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)+parseFloat(outEntry[i].Rec_Amount);
                await outstanding.update({_id:OutSB._id},outObj,function(err){if(err)console.log('Error',err)});
            }
        }
    }
    res.redirect('/journal_entry/journal_entry_list');
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