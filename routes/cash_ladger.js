const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let ledger = require('../models/trans');
let acmast= require('../models/accountSchema');
let outstanding = require('../models/outstading_schema');
let outstanding_opning = require('../models/outstading_schema');
let division= require('../models/divSchema');
let db = mongoose.connection;
let common = require('./common');
// Add Routesales_order_summary

router.get('/cash_ladger', ensureAuthenticated, function(req, res){
       res.render('cash_ladger.hbs', {
           pageTitle:'Ledger',
           compnm:req.session.compnm,
           divnm:req.session.divmast,
           sdate: req.session.compsdate,
           edate:req.session.compedate,
           usrnm:req.session.user,
           security: req.session.security,
           administrator:req.session.administrator
       });
})


router.get('/cash_bank_ladger', ensureAuthenticated, function(req, res){
    res.render('cash_bank_ladger.hbs', {
        pageTitle:'Cash / Bank',
        compnm:req.session.compnm,
        divnm:req.session.divmast,
        sdate: req.session.compsdate,
        edate:req.session.compedate,
        usrnm:req.session.user,
        security: req.session.security,
        administrator:req.session.administrator
    });
})

router.get('/Party_WiseOutstanding_report', ensureAuthenticated, function(req, res){
    division.find({masterid:req.session.masterid}, function (err,div){
       res.render('Party_WiseOutstanding_report.hbs', {
           pageTitle:'Party Wise Outstanding',
           div:div,
           compnm:req.session.compnm,
           divnm:req.session.divmast,
           sdate: req.session.compsdate,
           edate:req.session.compedate,
           usrnm:req.session.user,
           security: req.session.security,
           administrator:req.session.administrator
       });
    });
})


router.post('/cashladgerdetails', ensureAuthenticated, async function(req, res){
    var buy_cus_name = req.body.buy_cus_name;
    var acname = await acmast.findById(buy_cus_name,function(errac,acname){}).populate('GroupName');
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    if(acname)var accname = acname.GroupName.GroupName;
        cash_ladger = [];
        acnm='';
        debitamt = 0;
        crditamt = 0;
        milsec   = 0;
        op_bal   = 0.00;
        Balance  = 0.00;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
        var qry = {};
        if(accname == "CASH" || accname == "BANK ACCOUNTS" || accname == "CASH ACCOUNTS" || accname == "BANK")
        {
            // if (buy_cus_name == "") qry = {cash_edatemilisecond:{$lte:enddats},co_code:req.session.compid,div_code:req.session.divid,del:"N"};
            // if (buy_cus_name != "") qry = {cash_edatemilisecond:{$lte:enddats},cash_bank_name:buy_cus_name,co_code:req.session.compid,div_code:req.session.divid,del:"N"};
        }
        else 
        {
            if (buy_cus_name == "") qry = {cash_edatemilisecond:{$lte:enddats},co_code:req.session.compid,div_code:req.session.divid,del:"N"};
            if (buy_cus_name != "") qry = {cash_edatemilisecond:{$lte:enddats},cashac_name:buy_cus_name,co_code:req.session.compid,div_code:req.session.divid,del:"N"};
        }
        let trans =  await ledger.find(qry,async function (err, ledger) {}).sort({'cash_edatemilisecond':1}).populate('cash_bank_name').populate('cashac_name'); 
        if(trans != '' && trans.length>0){
            
            //loki
            // console.log(trans);

            if(isNaN(Balance) || Balance == '')Balance=0;
            if(isNaN(op_bal) || op_bal == '')op_bal=0;
          
          //loki
            // console.log('aft',Balance,op_bal);
            // for (let i = 0; i<1; i++)
            for (let i = 0; i < trans.length; i++)
            {
                var date = trans[i]['cash_date'];
                var filterstartdate = moment(date).tz("Asia/Kolkata").format('DD/MM/YYYY');
                
                milsec = trans[i].cash_edatemilisecond;
                trans[i]['cash_narrone']; trans[i]['cash_narrtwo'];

                if(accname == "CASH" || accname == "BANK ACCOUNTS" || accname == "CASH ACCOUNTS" || accname == "BANK")
                {   
                    acnm = trans[i]['cashac_name'].ACName 
                }
                else
                {
                    acnm = trans[i]['cash_bank_name'].ACName
                }

                if(accname == "CASH" || accname == "BANK ACCOUNTS" || accname == "CASH ACCOUNTS" || accname == "BANK")
                {
                    if(trans[i]['d_c']=="C")
                    {
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        Balance = Balance +  parseFloat(trans[i]['cash_amount'])
                        var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':trans[i]['cash_amount'], 'credit': 0, 'Balance': Balance.toFixed(2), 'milsec': milsec,'cash_remark':trans[i]['cash_remark'],'cash_narr':trans[i]['cash_narr'],'main_bk':trans[i]['main_bk']}
                        this.cash_ladger.push(arr);
                    }
                    if(trans[i]['d_c']=="D")
                    {
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        Balance = Balance -  parseFloat(trans[i]['cash_amount'])
                        var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':0, 'credit': trans[i]['cash_amount'], 'Balance': Balance.toFixed(2), 'milsec': milsec,'cash_remark':trans[i]['cash_remark'],'cash_narr':trans[i]['cash_narr'],'main_bk':trans[i]['main_bk']}
                        this.cash_ladger.push(arr);
                    }
                }
                else 
                {
                    if(trans[i]['d_c'] == "D")
                    {   
                        if(trans[i]['Amount_Deduction'] == '' || trans[i]['Amount_Deduction'] == null || trans[i]['Amount_Deduction'] == undefined)trans[i]['Amount_Deduction'] = 0
                        if(trans[i]['Add_Amount_Deduction'] == '' || trans[i]['Add_Amount_Deduction'] == null || trans[i]['Add_Amount_Deduction'] == undefined)trans[i]['Add_Amount_Deduction'] = 0
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        if(trans[i]['CNCL'] == 'N')Balance = Balance + parseFloat(trans[i]['cash_amount'])+parseFloat(trans[i]['Add_Amount_Deduction']);
                        var debit = parseFloat(trans[i]['cash_amount'])+parseFloat(trans[i]['Add_Amount_Deduction']);
                        var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':parseFloat(debit), 'credit': 0, 'Balance': Balance.toFixed(2), 'milsec': milsec,'cash_remark':trans[i]['cash_remark'],'cash_narr':trans[i]['cash_narr'],'main_bk':trans[i]['main_bk'],'CNCL':trans[i]['CNCL']}
                        this.cash_ladger.push(arr);
                    }
                    if(trans[i]['d_c'] == "C")
                    {
                        if(trans[i]['Amount_Deduction'] == '' || trans[i]['Amount_Deduction'] == null || trans[i]['Amount_Deduction'] == undefined)trans[i]['Amount_Deduction'] = 0
                        if(trans[i]['Add_Amount_Deduction'] == '' || trans[i]['Add_Amount_Deduction'] == null || trans[i]['Add_Amount_Deduction'] == undefined)trans[i]['Add_Amount_Deduction'] = 0
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        if(trans[i]['CNCL'] == 'N')Balance = Balance - parseFloat(trans[i]['cash_amount'])+parseFloat(trans[i]['Add_Amount_Deduction']);
                        var credit = parseFloat(trans[i]['cash_amount'])+parseFloat(trans[i]['Add_Amount_Deduction']);
                        var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':0, 'credit': parseFloat(credit), 'Balance': Balance.toFixed(2), 'milsec': milsec,'cash_remark':trans[i]['cash_remark'],'cash_narr':trans[i]['cash_narr'],'main_bk':trans[i]['main_bk'],'CNCL':trans[i]['CNCL']}
                        this.cash_ladger.push(arr);
                    }
                }
            }
         }
         fin_op = 0;
         count = 0;
         finel_ladger = [];
         if((this.cash_ladger != '' || this.cash_ladger != null) && this.cash_ladger.length > 0){
            for(let j = 0; j<this.cash_ladger.length; j++){
                if(strtdate <= this.cash_ladger[j].milsec &&  enddats>= this.cash_ladger[j].milsec){
                    count++;
                    if(j == 0)fin_op = op_bal;
                    if(j > 0 && count == 1)fin_op = this.cash_ladger[j-1]['Balance'];
                    this.finel_ladger.push(this.cash_ladger[j]);
                }
            }
        }
        let party = await acmast.findById(buy_cus_name,function(err, party){}).populate('GroupName');
        var qry = '';
        let outstand_opning =  await outstanding_opning.find({$and: [{outstanding_balance:{$gt:0}},{cash_edatemilisecond:{$lt:strtdate}}],$or:[{main_bk:'SB'},{main_bk:'PB'},{main_bk:'OnAcc'}],cashac_name:buy_cus_name,del:'N',CNCL:'N',co_code:req.session.compid,div_code:req.session.divid}, function (err, outstanding){});
        let outstand =  await outstanding.find({$and: [{outstanding_balance:{$gt:0}},{cash_edatemilisecond:{$lte:enddats}}],$or:[{main_bk:'SB'},{main_bk:'PB'},{main_bk:'OnAcc'},{main_bk:'OPOS'}],cashac_name:buy_cus_name,del:'N',CNCL:'N',co_code:req.session.compid,div_code:req.session.divid}, function (err, outstanding){}).populate('broker_Code');
        
        res.json({ 'success': true, 'ledger':this.finel_ladger, "op_bal": fin_op,'outstanding':outstand,'outstand_opning':outstand_opning});
})


router.post('/cash_bank_ladger_details', ensureAuthenticated, async function(req, res){
    var buy_cus_name = req.body.buy_cus_name;
    var acname = await acmast.findById(buy_cus_name,function(errac,acname){}).populate('GroupName');
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    if(acname)var accname = acname.GroupName.GroupName;
        cash_ladger = [];
        acnm='';
        debitamt = 0;
        crditamt = 0;
        milsec = 0;
        op_bal = 0.00;
        Balance = 0.00;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
        var qry = "";
        if (buy_cus_name == "") qry = {cash_edatemilisecond:{$lte:enddats},co_code:req.session.compid,div_code:req.session.divid,del:"N",CNCL:"N"};
        if (buy_cus_name != "") qry = {cash_edatemilisecond:{$lte:enddats},cash_bank_name:buy_cus_name,co_code:req.session.compid,div_code:req.session.divid,del:"N",CNCL:"N"};
        let trans =  await ledger.find(qry,async function (err, ledger) {}).sort({'cash_edatemilisecond':1}).populate('cash_bank_name').populate('cashac_name'); 
        if(trans != '' && trans.length>0){
            if(isNaN(Balance) || Balance == '')Balance=0;
            if(isNaN(op_bal) || op_bal == '')op_bal=0;
            for (let i = 0; i < trans.length; i++)
            {
                var date = trans[i]['cash_date'];
                var filterstartdate = moment(date).tz("Asia/Kolkata").format('DD/MM/YYYY');
                    milsec = trans[i].cash_edatemilisecond;
                    trans[i]['cash_narrone']; trans[i]['cash_narrtwo'];
                    // if(accname == "CASH" || accname == "BANK")
                    // {   
                        acnm = trans[i]['cashac_name'].ACName;
                    // }
                    var Type = '';
                    var ChqNo = '';
                    if(trans[i]['main_bk'] == 'BC'){
                        Type = 'Collection';
                        ChqNo = trans[i]['Chq_No'];
                    }else{
                        Type  = trans[i]['cash_type'];
                        ChqNo = trans[i]['cash_chequeno'];
                    }
                    // if(accname=="CASH" || accname=="BANK")
                    // {
                    if(trans[i]['d_c']=="C")
                    {
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        Balance = Balance +  parseFloat(trans[i]['cash_amount'])
                        var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':trans[i]['cash_amount'], 'credit': 0, 'Balance': Balance.toFixed(2), 'milsec': milsec,'cash_remark':trans[i]['cash_remark'],'cash_narr':trans[i]['cash_narr'],'main_bk':trans[i]['main_bk'],'Type':Type,'ChqNo':ChqNo};
                        this.cash_ladger.push(arr);
                    }
                    if(trans[i]['d_c']=="D")
                    {
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        Balance = Balance -  parseFloat(trans[i]['cash_amount'])
                        var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':0, 'credit': trans[i]['cash_amount'], 'Balance': Balance.toFixed(2), 'milsec': milsec,'cash_remark':trans[i]['cash_remark'],'cash_narr':trans[i]['cash_narr'],'main_bk':trans[i]['main_bk'],'Type':Type,'ChqNo':ChqNo};
                        this.cash_ladger.push(arr);
                    }
            }
        }
        fin_op = 0;
        count = 0;
        finel_ladger = [];
        if((this.cash_ladger != '' || this.cash_ladger != null) && this.cash_ladger.length > 0){
        for(let j = 0; j<this.cash_ladger.length; j++){
                if(strtdate <= this.cash_ladger[j].milsec &&  enddats>= this.cash_ladger[j].milsec){
                    count++;
                    if(j == 0)fin_op = op_bal;
                    if(j > 0 && count == 1)fin_op = this.cash_ladger[j-1]['Balance'];
                    this.finel_ladger.push(this.cash_ladger[j]);
                }
            }
        }
        res.json({ 'success': true, 'ledger':this.finel_ladger, "op_bal": fin_op});
})
router.post('/ShowPartyWiseOutStanding', ensureAuthenticated, async function(req, res){
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var  buy_cus_name = req.body.buy_cus_name;
    var  Broker = req.body.Broker;
    var  Sale = req.body.Sale;
    var  Division = req.body.Division;
    var  DATE = req.body.DATE;
    var  SCREENING = req.body.SCREENING;
        cash_ladger = [];
        acnm='';
        debitamt = 0;
        crditamt = 0;
        milsec   = 0;
        op_bal   = 0.00;
        Balance  = 0.00;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');  
        var dateCondition;
        if(DATE == 'AS_ON') dateCondition = [{outstanding_balance:{$gt:0}},{cash_edatemilisecond:{$lte:enddats}}]
        else dateCondition = [{outstanding_balance:{$gt:0}},{cash_edatemilisecond:{$gte:strtdate}},{cash_edatemilisecond:{$lte:enddats}}]
        var mainbk = [{main_bk:'SB'},{main_bk:'PB'},{main_bk:'OnAcc'},{main_bk:'OPOS'}];
        var qry = {$and: dateCondition,$or:mainbk,del:'N',co_code:req.session.compid,CNCL:'N'};
        if(buy_cus_name != ''){
            var party = {cashac_name:{ $in : buy_cus_name }};
            qry = Object.assign(qry,party)
        }
        if(Broker != ''){
            var party = {broker_Code:{ $in : Broker }};
            qry = Object.assign(qry,party)
        }
        if(Sale != ''){
            var party = {sl_Person:{ $in : Sale }};
            qry = Object.assign(qry,party)
        }
        if(Division != ''){
            var party = {div_code:{ $in : Division }};
            qry = Object.assign(qry,party)
        }
        let outstand_opning = '';
        // outstand_opning =  await outstanding_opning.find({$and: [{outstanding_balance:{$gt:0}},{cash_edatemilisecond:{$lt:strtdate}}],$or:[{main_bk:'SB'},{main_bk:'PB'},{main_bk:'OnAcc'}],cashac_name:buy_cus_name,del:'N',co_code:req.session.compid,div_code:req.session.divid}, function (err, outstanding){})
        let outstand =  await outstanding.find(qry, function (err, outstanding){}).populate('broker_Code').populate('sl_Person')
        .populate([{path: 'cashac_name',
        populate:{ path: 'CityName'}
        }]);
        let divisionschema =await  division.findById(req.session.divid, function (err,div_com){})
        res.json({ 'success': true,'outstanding':outstand,'outstand_opning':outstand_opning,"divisionschema":divisionschema});
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