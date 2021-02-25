const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let brand = require('../models/brand_schema');
let cashmast = require('../models/trans');
let outstanding= require('../models/outstading_schema');
let addmast = require('../models/addless_mast_schema');
const moment = require('moment-timezone');
let bank = require('../models/bank_schema');
let accname = require('../models/accountSchema');
let addlessMast= require('../models/Add_Less_Parameter_Master_Schema');
var Gs_master = require('../models/gsTableSchema');
let vouchMast= require('../models/vouchSchema');
let division = require('../models/divSchema');
var query;

router.post('/accgroup', function (req, res) {
    accname.find({masterid:req.session.masterid},function(err, accnametyp){
        res.json({ 'success': true, 'accnametyp': accnametyp });
    }).populate('ac_groupname')
});

router.get('/accountname', function (req, res) {
    var qry = req.query.term.term;
    if(qry == undefined || qry == null)FLAG = 1;
    else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
    accname.find({'ACName': new RegExp(qry),masterid:req.session.masterid,del:'N'},function(err, accnametyp){
        var data = new Array();
        for (var j = 0; j < accnametyp.length; j++) {
            if (accnametyp[j]['GroupName'] != null) goupnm = accnametyp[j]['GroupName']['GroupName'];
            else goupnm = "";
            if (accnametyp[j]['CityName'] != null) cityname = accnametyp[j]['CityName']['CityName'];
                else cityname = "";
            if(goupnm=="CASH" || goupnm=="BANK")
            {
                data[j] = {
                    "id":'',
                    "text" : ''
                    };
            }
            else
            {
                data[j] = {
                    "id": accnametyp[j]._id,
                    "text" : accnametyp[j].ACName + ','+ cityname
                    };
            }
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    }).sort({'ACName':1}).populate('GroupName').populate('CityName');
});

router.get('/getOut', function (req, res) {
    accname.findById(req.query.party,function(err, party){
        if(party.GroupName.MaintainOs == 'Y'){
            var qry = {};
            console.log(party.GroupName.MaintainOs,party.GroupName.GroupType)
            if(party.GroupName.GroupType == 'Assets' && req.query.d_c == 'C'){
                qry = {outstanding_balance:{$gt:0},cashac_name:req.query.party,OS_Type:'SB',div_code:req.session.divid,co_code:req.session.compid,del:'N',CNCL:'N'};
                outstanding.find(qry,function(err, accnametyp){
                    addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},function(err, addlessmast){
                        if(accnametyp == null || accnametyp == '' || accnametyp == []){
                            res.json({ 'success': true, 'accnametyp': accnametyp,'addlessmast':addlessmast,'division':req.session.divid});
                        }else{
                            if(accnametyp[0].cashac_name.GroupName.MaintainOs == 'Y'){
                                res.json({ 'success': true, 'accnametyp': accnametyp,'addlessmast':addlessmast,'division':req.session.divid})
                            }
                            else res.json({ 'success': false, 'accnametyp': accnametyp,'addlessmast':addlessmast,'division':req.session.divid});
                        }
                    }).sort('Add_Less_Parameter_Master_Array.Order');
                }).sort('cash_edatemilisecond').sort('vouc_code').populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'GroupName', model:'groupSchema'}}]);
            }
            if(party.GroupName.GroupType == 'Liabilities' && req.query.d_c == 'D'){
                qry = {outstanding_balance:{$gt:0},cashac_name:req.query.party,OS_Type:'PB',div_code:req.session.divid,co_code:req.session.compid,del:'N'};
                outstanding.find(qry,function(err, accnametyp){
                    addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},function(err, addlessmast){
                        if(accnametyp == null || accnametyp == '' || accnametyp == []){
                            res.json({ 'success': true, 'accnametyp': accnametyp,'addlessmast':addlessmast,'division':req.session.divid});
                        }else{
                            if(accnametyp[0].cashac_name.GroupName.MaintainOs == 'Y'){
                                res.json({ 'success': true, 'accnametyp': accnametyp,'addlessmast':addlessmast,'division':req.session.divid})
                            }
                            else res.json({ 'success': false, 'accnametyp': accnametyp,'addlessmast':addlessmast,'division':req.session.divid});
                        }
                    }).sort('Add_Less_Parameter_Master_Array.Order');
                }).sort('cash_edatemilisecond').sort('vouc_code').populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'GroupName', model:'groupSchema'}}]);
            }
            console.log('qry',qry);
        }else res.json({ 'success': false,'division':req.session.divid});
    }).populate('GroupName');
});

router.get('/AddLess', function (req, res) {
    addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},function(err, addlessmast){
        res.json({ 'success': true, 'addlessmast':addlessmast});
    }).sort('Add_Less_Parameter_Master_Array.Order');
});
router.get('/cash_bank_list', ensureAuthenticated ,function(req,res){
    cashmast.aggregate([{ $match: { co_code: req.session.compid,div_code:req.session.divid,del:'N',srno:{$lt:100}}},
        { $group : {
        _id:{
            "vouc_code": "$vouc_code",
            "main_bk": "$main_bk",
            "c_j_s_p": "$c_j_s_p",
            "cash_type": "$cash_type",
            "cash_bank_name": "$cash_bank_name",
            "cash_date":"$cash_date",
            "cash_remarks":"$cash_remarks",
        }}, } ], function (err, cashmast){
            Gs_master.findOne({group: 'CASH AND BANK'},function (err, gs_master){
                var qryGs = [];
                for(let i=0; i<gs_master.garry.length; i++){
                    qryGs.push(gs_master.garry[i])
                }
                accname.find({masterid:req.session.masterid,GroupName :{ $in : qryGs },del:"N"}, function (err,accname){
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        res.render('cash_bank_list.hbs',{
                            pageTitle:'Cash/Bank List',
                            cashmast: cashmast,
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
                });
            })
        });
});
router.get('/cash_bank', ensureAuthenticated, function(req, res){//,GroupName :{ $in : qryGs }
vouchMast.find({Module:'Cash/Bank',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
    cashmast.aggregate((
        [{ $match: { main_bk:"CB",c_j_s_p:vouchMast[0].Vo_book,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
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
            addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},function(err, addlessmast){
                if (err) {
                    console.log(err);
                } else {
                    var lastNo = 1;
                    if(lastEntryNo == null || lastEntryNo == '' || lastEntryNo == [])lastNo = 1;
                    else lastNo = parseInt(lastEntryNo[0]._id._id)+1;
                    // console.log('addlessmast',addlessmast);
                    res.render('cash_bank.hbs', {
                        pageTitle:'Cash/Bank Entry',
                        lastNo:lastNo,
                        vouchMast:vouchMast,
                        addlessmast:addlessmast,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                    });
                }
            }).sort('Add_Less_Parameter_Master_Array.Order');
        });
    });
});

router.post('/add', async function(req, res){
    addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},async function(err, addlessmast){
        if(req.body.cash_bank_name == "") req.body.cash_bank_name    = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.cashac_name    == "") req.body.cashac_name       = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    
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
            
            for(var i = 0; i<req.body.cashtrn.length; i++){
                    let cash_bank = new cashmast();
                    cash_bank.srno = i;
                    cash_bank.main_bk = "CB";
                    if(req.body.cash_type=="RECEIPT") cash_bank.d_c ="C";
                    else cash_bank.d_c             = "D";
                    cash_bank.c_j_s_p              = req.body.cashtypebank;
                    
                    cash_bank.cash_eno             = req.body.cash_eno;
                    cash_bank.vouc_code            = req.body.vouc_code;
                    cash_bank.cash_date            = DateObject;
                    cash_bank.cash_edatemilisecond = sodatemilisecond;

                    cash_bank.deposit_date         = DateObject
                    cash_bank.deposit_datemilisecond = sodatemilisecond

                    cash_bank.cash_type            = req.body.cash_type;
                    cash_bank.cash_bank_name       = req.body.cash_bank_name;     

                    cash_bank.del                  = "N";
                    cash_bank.entrydate            = new Date();

                    cash_bank.cashac_name          = req.body.cashac_name[i];
                    cash_bank.cash_chequeno        = req.body.cash_chequeno[i];
                    cash_bank.cash_chequedate      = req.body.cash_chequedate[i];
                    cash_bank.cash_amount          = req.body.cash_amount[i];
                    // cash_bank.Amount_Deduction     = req.body.Amount_Deduction[i]
                    cash_bank.Add_Amount_Deduction = req.body.Add_Amount_Deduction[i];
                    cash_bank.Less_Amount_Deduction= req.body.Less_Amount_Deduction[i];
                    cash_bank.cash_narrone         = req.body.cash_narrone[i];
                    cash_bank.cash_narrtwo         = req.body.cash_narrtwo[i];
                    cash_bank.cash_narr         = req.body.cash_narr[i];
                    if(req.body.YPara_Array[i] == null || req.body.YPara_Array[i] == '' || req.body.YPara_Array[i] == [] || req.body.YPara_Array[i] == undefined)cash_bank.addlessParameter=[];
                    else cash_bank.addlessParameter     = JSON.parse(req.body.YPara_Array[i]);
            
                    cash_bank.totcash_amt          = req.body.totcash_amt;
                    cash_bank.cash_remarks         = req.body.cash_remarks;
                    // cash_bank.cash_bank_group      = req.body.cash_bank_group;
                    cash_bank.outStandingArr       = req.body.outSaveArr[i]
                    cash_bank.co_code              = req.session.compid;
                    cash_bank.div_code             = req.session.divid;
                    cash_bank.usrnm                = req.session.user;
                    cash_bank.masterid             = req.session.masterid
                    cash_bank.Chaq_Return          = 'N';
                    cash_bank.CNCL                 = 'N';
                    cash_bank.save(function (err){});
                    if(req.body.cash_type == "RECEIPT" || req.body.cash_type == "PAYMENT"){
                        if(req.body.YPara_Array[i] == null || req.body.YPara_Array[i] == '' || req.body.YPara_Array[i] == [] || req.body.YPara_Array[i] == undefined)flag=1
                        else{
                            var Add_Array = JSON.parse(req.body.YPara_Array[i]);
                            for(let a=0; a<Add_Array.length; a++){
                                if(Add_Array[a].YDed_Par_typ == '+'){
                                    for(let b=0; b<addlessmast.Add_Less_Parameter_Master_Array.length; b++){
                                        for(let c=0; c<addlessmast.Add_Less_Parameter_Master_Array[b].Division.length; c++){
                                            if(addlessmast.Add_Less_Parameter_Master_Array[b].Division[c] == req.session.divid && Add_Array[a].YDed_Par_dsc_id == addlessmast.Add_Less_Parameter_Master_Array[b]._id){
                                                // addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac
                                                let cash_bank_posting = new cashmast();
                                                cash_bank_posting.main_bk_posting = "CB Posting"+i+""+a+"";
                                                cash_bank_posting.CashBank_id = cash_bank._id;
                                                cash_bank_posting.srno = 100+parseInt(i);
                                                cash_bank_posting.main_bk = "CB";
                                                if(req.body.cash_type=="RECEIPT") cash_bank_posting.d_c ="C";
                                                else cash_bank_posting.d_c             = "D";
                                                cash_bank_posting.c_j_s_p              = req.body.cashtypebank;
                                                
                                                cash_bank_posting.cash_eno             = req.body.cash_eno;
                                                cash_bank_posting.vouc_code            = req.body.vouc_code;
                                                cash_bank_posting.cash_date            = DateObject;
                                                cash_bank_posting.cash_edatemilisecond = sodatemilisecond;
                                                cash_bank_posting.cash_type            = req.body.cash_type;
                                                // cash_bank_posting.cash_bank_name       = req.body.cash_bank_name;     
                                                cash_bank_posting.cash_bank_name       = req.body.cashac_name[i];
                                                cash_bank_posting.del                  = "N";
                                                cash_bank_posting.entrydate            = new Date();

                                                cash_bank_posting.cashac_name          = addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac;
                                                cash_bank_posting.cash_chequeno        = req.body.cash_chequeno[i];
                                                cash_bank_posting.cash_chequedate      = req.body.cash_chequedate[i];
                                                if(Add_Array[a].YDed_Par_value == null || Add_Array[a].YDed_Par_value == '' || isNaN(Add_Array[a].YDed_Par_value))Add_Array[a].YDed_Par_value = 0;
                                                cash_bank_posting.cash_amount          = Add_Array[a].YDed_Par_value;
                                                // cash_bank_posting.Amount_Deduction     = req.body.Amount_Deduction[i]
                                                cash_bank_posting.Add_Amount_Deduction = 0;
                                                cash_bank_posting.Less_Amount_Deduction= 0;
                                                cash_bank_posting.cash_narrone         = req.body.cash_narrone[i];
                                                cash_bank_posting.cash_narrtwo         = req.body.cash_narrtwo[i];
                                                // cash_bank_posting.addlessParameter     = JSON.parse(req.body.YPara_Array[i]);
                                                cash_bank_posting.totcash_amt          = req.body.totcash_amt;
                                                cash_bank_posting.cash_remarks         = req.body.cash_remarks;
                                                // cash_bank_posting.cash_bank_group      = req.body.cash_bank_group;
                                                // cash_bank_posting.outStandingArr       = req.body.outSaveArr[i]
                                                cash_bank_posting.co_code              = req.session.compid;
                                                cash_bank_posting.div_code             = req.session.divid;
                                                cash_bank_posting.usrnm                = req.session.user;
                                                cash_bank_posting.masterid             = req.session.masterid

                                                cash_bank_posting.Chaq_Return          = 'N';
                                                cash_bank_posting.CNCL                 = 'N';
                                                cash_bank_posting.save();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        if(req.body.outSaveArr[i] == null || req.body.outSaveArr[i] == '' || req.body.outSaveArr[i] == [] || req.body.outSaveArr[i] == undefined)flag=1
                        else{
                            var outSaveArr = JSON.parse(req.body.outSaveArr[i]);
                            for(let j=0; j<outSaveArr.length; j++){
                                if(parseFloat(outSaveArr[j].ReceiveAmt) > 0){
                                    let out = new outstanding();
                                        out.CashBank_id = cash_bank._id;
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            out.main_bk = "OnAcc";
                                            out.OS_Type = 'ONA';
                                        }
                                        else out.main_bk = "CB";
                                        out.c_j_s_p = req.body.cashtypebank;
                                        if(req.body.cash_type == "RECEIPT") out.d_c ="C";
                                        else out.d_c = "D";
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc')out.vouc_code = 0;
                                        else out.vouc_code = outSaveArr[j].vouc_code;
                                        // out.vouc_code = outSaveArr[j].vouc_code;
                                        out.cash_date = DateObject;
                                        out.cash_edatemilisecond = sodatemilisecond;
                                        out.cashac_name = outSaveArr[j].cashac_name;
                                        out.cash_bank_name = req.body.cash_bank_name;
                                        out.cash_narrtwo = 'Oustanding';
                                        out.cash_narrone = 'Cash bank';
                                        out.cash_type   = req.body.cash_type;
                                        out.del         = "N";
                                        out.entrydate   = new Date();
                                        out.cash_amount = outSaveArr[j].ReceiveAmt;
                                        out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                        out.Bill_Date   = outSaveArr[j].Bill_Date;
                                        out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                        // out.Amount_Deduction = outSaveArr[j].Ded_Amt_Tot;
                                        out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                        out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;

                                        if(outSaveArr[j].BalanceAmt<0)out.outstanding_balance = outSaveArr[j].BalanceAmt*-1;
                                        out.outstanding_balance = outSaveArr[j].BalanceAmt;

                                        out.outstanding_amount = parseFloat(outSaveArr[j].ReceiveAmt)+parseFloat(outSaveArr[j].Add_Ded_Amt_Tot); //Calulate Outstanding Balance For Bill Collection
                                        
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                            out.op_outstanding_id  = '';
                                        }else{
                                            out.outstanding_id = outSaveArr[j].out_id;
                                            out.op_outstanding_id  = outSaveArr[j].out_id;
                                        }
                                        
                                        out.Cbvouc_code = req.body.vouc_code;
                                        out.addlessParameter = outSaveArr[j].Para_Array;
                                        
                                        out.op_main_bk  = outSaveArr[j].main_bk;
                                        out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                        out.op_co_code  = outSaveArr[j].co_code;
                                        out.op_div_code = outSaveArr[j].div_code;

                                        out.co_code = req.session.compid;
                                        out.div_code = req.session.divid;
                                        out.usrnm = req.session.user;
                                        out.masterid = req.session.masterid;

                                        out.CNCL  = 'N';
                                        out.save();
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                        }else{
                                                var recamt = outSaveArr[j].ReceiveAmt;
                                                var Add_Am_Deduction = outSaveArr[j].Add_Ded_Amt_Tot;
                                                var Less_Am_Deduction = outSaveArr[j].Less_Ded_Amt_Tot;
                                                var BalanceAmt = outSaveArr[j].BalanceAmt;
                                                if(BalanceAmt<0)BalanceAmt = BalanceAmt*-1;
                                                var out_id = outSaveArr[j].out_id;
                                                // console.log('Rec Amount',recamt);
                                                var outstand = await outstanding.findById(outSaveArr[j].out_id, function(err, out_statnding) {})
                                                    let outObj = {}
                                                    var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.Cbvouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt,
                                                    'Add_Ded_Amt_Tot':Add_Am_Deduction,'Less_Ded_Amt_Tot':Less_Am_Deduction};
                                                    outstand.Out_recieved_Entry_Arr.push(arr);
                                                    outObj.Rec_Amount = parseFloat(outstand.Rec_Amount)+parseFloat(recamt);
                                                    outObj.Add_Ded_Amt_Tot = parseFloat(outstand.Add_Ded_Amt_Tot)+parseFloat(Add_Am_Deduction);
                                                    outObj.Less_Ded_Amt_Tot = parseFloat(outstand.Less_Ded_Amt_Tot)+parseFloat(Less_Am_Deduction);
                                                    outObj.outstanding_balance = BalanceAmt;
                                                    outObj.Out_recieved_Entry_Arr = outstand.Out_recieved_Entry_Arr;
                                                    var qry = {_id:out_id};
                                                    outstanding.update(qry,outObj,function (err) {});
                                        }
                                }
                            }
                        }
                    }
                    if(req.body.cash_type == "CONTRA")
                    {
                        let cash_bank = new cashmast();
                        cash_bank.srno = i;
                        cash_bank.main_bk = "CB1";
                        cash_bank.d_c ="C";            
                        cash_bank.c_j_s_p = req.body.cashtypebank;
                        cash_bank.cash_eno = req.body.cash_eno;
                        cash_bank.vouc_code = req.body.vouc_code;
                        cash_bank.cash_date = DateObject;
                        cash_bank.cash_edatemilisecond = sodatemilisecond;
                        cash_bank.cash_type = req.body.cash_type;
                        cash_bank.cash_bank_name = req.body.cashac_name[i];
                        cash_bank.cashac_name = req.body.cash_bank_name;     
                        cash_bank.cash_chequeno = req.body.cash_chequeno[i];
                        cash_bank.cash_chequedate = req.body.cash_chequedate[i];
                        cash_bank.cash_amount = req.body.cash_amount[i];
                        cash_bank.cash_narrone = req.body.cash_narrone[i];
                        cash_bank.cash_narrtwo = req.body.cash_narrtwo[i];
                        cash_bank.del = "N";
                        cash_bank.CNCL = "N";
                        cash_bank.entrydate = new Date();
                        cash_bank.totcash_amt = req.body.totcash_amt;
                        cash_bank.cash_remarks = req.body.cash_remarks;
                        // cash_bank.cash_bank_group = req.body.cash_bank_group;
                        cash_bank.co_code = req.session.compid;
                        cash_bank.div_code = req.session.divid;
                        cash_bank.usrnm = req.session.user;
                        cash_bank.masterid = req.session.masterid
                        cash_bank.save(function (err){
                        });
                    } 
            }
            res.redirect('/cash_bank/cash_bank');
        }
    });
});

router.get('/cashbank_update', ensureAuthenticated, function(req, res){
     cashmast.find({vouc_code:req.query.vouc_code,c_j_s_p:req.query.cjsp,main_bk:"CB",del:"N",srno:{$lt:100},co_code:req.session.compid,div_code:req.session.divid}, function (err,cashmast){
        vouchMast.find({Module:'Cash/Bank',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
            addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},function(err, addlessmast){
                if (err) {
                    console.log(err);
                } else {
                    res.render('cash_bank_update.hbs',{
                        pageTitle:'Update Bank/Cash Entry',
                        cashmast:cashmast,
                        vouchMast:vouchMast,
                        addlessmast:addlessmast,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                    });
                }
            }).sort('Add_Less_Parameter_Master_Array.Order');
        })
    }).sort('srno').populate('cash_bank_name').populate('cashac_name')
});

router.post('/update/:id', function(req, res) {
    addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},async function(err, addlessmast){
    let errors = req.validationErrors();
    var cash_edate = req.body.cash_edate;
    var DateObject =  moment(cash_edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var sodatemilisecond = DateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else{ 
            let srno =0;
            for(var i = 0; i<req.body.cashtrn.length; i++){
                if(req.body.maincashid[i] == null || req.body.maincashid[i] == '' || req.body.maincashid[i] == undefined)//maincashid
                {
                    let cash_bank = new cashmast();
                        cash_bank.srno = i;
                        cash_bank.main_bk = "CB";
                        if(req.body.cash_type == "RECEIPT") cash_bank.d_c ="C";
                        else cash_bank.d_c             = "D";
                        cash_bank.c_j_s_p              = req.body.cashtypebank;
                        
                        cash_bank.cash_eno             = req.body.cash_eno;
                        cash_bank.vouc_code            = req.body.vouc_code;
                        cash_bank.cash_date            = DateObject;
                        cash_bank.cash_edatemilisecond = sodatemilisecond;

                        cash_bank.deposit_date         = DateObject
                        cash_bank.deposit_datemilisecond = sodatemilisecond

                        cash_bank.cash_type            = req.body.cash_type;
                        cash_bank.cash_bank_name       = req.body.cash_bank_name;     

                        cash_bank.del                  = "N";
                        cash_bank.CNCL                 = "N";
                        cash_bank.entrydate            = new Date();

                        cash_bank.cashac_name          = req.body.cashac_name[i];
                        cash_bank.cash_chequeno        = req.body.cash_chequeno[i];
                        cash_bank.cash_chequedate      = req.body.cash_chequedate[i];
                        cash_bank.cash_amount          = req.body.cash_amount[i];
                        // cash_bank.Amount_Deduction     = req.body.Amount_Deduction[i]
                        cash_bank.Add_Amount_Deduction = req.body.Add_Amount_Deduction[i];
                        cash_bank.Less_Amount_Deduction= req.body.Less_Amount_Deduction[i];
                        cash_bank.cash_narrone         = req.body.cash_narrone[i];
                        cash_bank.cash_narrtwo         = req.body.cash_narrtwo[i];
                        cash_bank.cash_narr         = req.body.cash_narr[i];
                        if(req.body.YPara_Array[i] == null || req.body.YPara_Array[i] == '' || req.body.YPara_Array[i] == [] || req.body.YPara_Array[i] == undefined)cash_bank.addlessParameter=[];
                        else cash_bank.addlessParameter     = JSON.parse(req.body.YPara_Array[i]);
                
                        cash_bank.totcash_amt          = req.body.totcash_amt;
                        cash_bank.cash_remarks         = req.body.cash_remarks;
                        // cash_bank.cash_bank_group      = req.body.cash_bank_group;
                        cash_bank.outStandingArr       = req.body.outSaveArr[i]
                        cash_bank.co_code              = req.session.compid;
                        cash_bank.div_code             = req.session.divid;
                        cash_bank.usrnm                = req.session.user;
                        cash_bank.masterid             = req.session.masterid
                        cash_bank.Chaq_Return          = 'N';
                        cash_bank.save(function (err){if(err)console.log('536',err)});

                        if(req.body.cash_type == "RECEIPT" || req.body.cash_type == "PAYMENT"){
                            if(req.body.YPara_Array[i] == null || req.body.YPara_Array[i] == '' || req.body.YPara_Array[i] == [] || req.body.YPara_Array[i] == undefined)flag=1
                            else{
                                var Add_Array = JSON.parse(req.body.YPara_Array[i]);
                                for(let a=0; a<Add_Array.length; a++){
                                    if(Add_Array[a].YDed_Par_typ == '+'){
                                        for(let b=0; b<addlessmast.Add_Less_Parameter_Master_Array.length; b++){
                                            for(let c=0; c<addlessmast.Add_Less_Parameter_Master_Array[b].Division.length; c++){
                                                if(addlessmast.Add_Less_Parameter_Master_Array[b].Division[c] == req.session.divid && Add_Array[a].YDed_Par_dsc_id == addlessmast.Add_Less_Parameter_Master_Array[b]._id){
                                                    // addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac
                                                    let cash_bank_posting = new cashmast();
                                                    cash_bank_posting.main_bk_posting = "CB Posting"+i+""+a+"";
                                                    cash_bank_posting.CashBank_id = cash_bank._id;
                                                    cash_bank_posting.srno = 100+parseInt(i);
                                                    cash_bank_posting.main_bk = "CB";
                                                    if(req.body.cash_type=="RECEIPT") cash_bank_posting.d_c ="C";
                                                    else cash_bank_posting.d_c             = "D";
                                                    cash_bank_posting.c_j_s_p              = req.body.cashtypebank;
                                                    
                                                    cash_bank_posting.cash_eno             = req.body.cash_eno;
                                                    cash_bank_posting.vouc_code            = req.body.vouc_code;
                                                    cash_bank_posting.cash_date            = DateObject;
                                                    cash_bank_posting.cash_edatemilisecond = sodatemilisecond;
                                                    cash_bank_posting.cash_type            = req.body.cash_type;
                                                    // cash_bank_posting.cash_bank_name       = req.body.cash_bank_name;     
                                                    cash_bank_posting.cash_bank_name       = req.body.cashac_name[i];
                                                    cash_bank_posting.del                  = "N";
                                                    cash_bank_posting.CNCL                 = "N";
                                                    cash_bank_posting.entrydate            = new Date();

                                                    cash_bank_posting.cashac_name          = addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac;
                                                    cash_bank_posting.cash_chequeno        = req.body.cash_chequeno[i];
                                                    cash_bank_posting.cash_chequedate      = req.body.cash_chequedate[i];
                                                    if(Add_Array[a].YDed_Par_value == null || Add_Array[a].YDed_Par_value == '' || isNaN(Add_Array[a].YDed_Par_value))Add_Array[a].YDed_Par_value = 0;
                                                    cash_bank_posting.cash_amount          = Add_Array[a].YDed_Par_value;
                                                    // cash_bank_posting.Amount_Deduction     = req.body.Amount_Deduction[i]
                                                    cash_bank_posting.Add_Amount_Deduction = 0;
                                                    cash_bank_posting.Less_Amount_Deduction= 0;
                                                    cash_bank_posting.cash_narrone         = req.body.cash_narrone[i];
                                                    cash_bank_posting.cash_narrtwo         = req.body.cash_narrtwo[i];
                                                    // cash_bank_posting.addlessParameter     = JSON.parse(req.body.YPara_Array[i]);
                                                    cash_bank_posting.totcash_amt          = req.body.totcash_amt;
                                                    cash_bank_posting.cash_remarks         = req.body.cash_remarks;
                                                    // cash_bank_posting.cash_bank_group      = req.body.cash_bank_group;
                                                    // cash_bank_posting.outStandingArr       = req.body.outSaveArr[i]
                                                    cash_bank_posting.co_code              = req.session.compid;
                                                    cash_bank_posting.div_code             = req.session.divid;
                                                    cash_bank_posting.usrnm                = req.session.user;
                                                    cash_bank_posting.masterid             = req.session.masterid

                                                    cash_bank_posting.Chaq_Return          = 'N';
                                                    cash_bank_posting.save(function(err){if(err)console.log('588',err)});
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            
                            if(req.body.outSaveArr[i] == null || req.body.outSaveArr[i] == '' || req.body.outSaveArr[i] == [] || req.body.outSaveArr[i] == undefined)flag=1
                            else{
                                var outSaveArr = JSON.parse(req.body.outSaveArr[i]);
                                for(let j=0; j<outSaveArr.length; j++){
                                    if(parseFloat(outSaveArr[j].ReceiveAmt) > 0){
                                        let out = new outstanding();
                                            out.CashBank_id = cash_bank._id;
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.main_bk = "OnAcc";
                                                out.OS_Type = 'ONA';
                                            }
                                            else out.main_bk = "CB";
                                            out.c_j_s_p = req.body.cashtypebank;
                                            if(req.body.cash_type == "RECEIPT") out.d_c ="C";
                                            else out.d_c = "D";
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc')out.vouc_code = 0;
                                            else out.vouc_code = outSaveArr[j].vouc_code;
                                            // out.vouc_code = outSaveArr[j].vouc_code;
                                            out.cash_date = DateObject;
                                            out.cash_edatemilisecond = sodatemilisecond;
                                            out.cashac_name = outSaveArr[j].cashac_name;
                                            out.cash_bank_name = req.body.cash_bank_name;
                                            out.cash_narrtwo = 'Oustanding';
                                            out.cash_narrone = 'Cash bank';
                                            out.cash_type   = req.body.cash_type;
                                            out.del         = "N";
                                            out.CNCL        = "N";
                                            out.entrydate   = new Date();
                                            out.cash_amount = outSaveArr[j].ReceiveAmt;
                                            out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                            out.Bill_Date   = outSaveArr[j].Bill_Date;
                                            out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                            // out.Amount_Deduction = outSaveArr[j].Ded_Amt_Tot;
                                            out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                            out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;

                                            if(outSaveArr[j].BalanceAmt<0)out.outstanding_balance = outSaveArr[j].BalanceAmt*-1;
                                            out.outstanding_balance = outSaveArr[j].BalanceAmt;

                                            out.outstanding_amount = outSaveArr[j].BalanceAmt; //Calulate Outstanding Balance For Bill Collection
                                            
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                                out.op_outstanding_id  = '';
                                            }else{
                                                out.outstanding_id = outSaveArr[j].out_id;
                                                out.op_outstanding_id  = outSaveArr[j].out_id;
                                            }
                                            
                                            out.Cbvouc_code = req.body.vouc_code;
                                            out.addlessParameter = outSaveArr[j].Para_Array;
                                            
                                            out.op_main_bk  = outSaveArr[j].main_bk;
                                            out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                            out.op_co_code  = outSaveArr[j].co_code;
                                            out.op_div_code = outSaveArr[j].div_code;

                                            out.co_code = req.session.compid;
                                            out.div_code = req.session.divid;
                                            out.usrnm = req.session.user;
                                            out.masterid = req.session.masterid;

                                            out.save(function(err){if(err)console.log('658',err)});
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                            }else{
                                                    var recamt = outSaveArr[j].ReceiveAmt;
                                                    var Add_Am_Deduction = outSaveArr[j].Add_Ded_Amt_Tot;
                                                    var Less_Am_Deduction = outSaveArr[j].Less_Ded_Amt_Tot;
                                                    var BalanceAmt = outSaveArr[j].BalanceAmt;
                                                    if(BalanceAmt<0)BalanceAmt = BalanceAmt*-1;
                                                    var out_id = outSaveArr[j].out_id;
                                                    // console.log('Rec Amount',recamt);
                                                    var outstand = await outstanding.findById(outSaveArr[j].out_id, function(err, out_statnding) {})
                                                        let outObj = {}
                                                        var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.Cbvouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt,
                                                        'Add_Ded_Amt_Tot':Add_Am_Deduction,'Less_Ded_Amt_Tot':Less_Am_Deduction};
                                                        outstand.Out_recieved_Entry_Arr.push(arr);
                                                        outObj.Rec_Amount = parseFloat(outstand.Rec_Amount)+parseFloat(recamt);
                                                        outObj.Add_Ded_Amt_Tot = parseFloat(outstand.Add_Ded_Amt_Tot)+parseFloat(Add_Am_Deduction);
                                                        outObj.Less_Ded_Amt_Tot = parseFloat(outstand.Less_Ded_Amt_Tot)+parseFloat(Less_Am_Deduction);
                                                        outObj.outstanding_balance = BalanceAmt;
                                                        outObj.Out_recieved_Entry_Arr = outstand.Out_recieved_Entry_Arr;
                                                        var qry = {_id:out_id};
                                                        outstanding.update(qry,outObj,function (err) {if(err)console.log('680',err)});
                                            }
                                    }
                                }
                            }
                        }
                        if(req.body.cash_type == "CONTRA")
                        {
                            let cash_bank = new cashmast();
                            cash_bank.srno = i;
                            cash_bank.main_bk = "CB1";
                            cash_bank.d_c ="C";            
                            cash_bank.c_j_s_p = req.body.cashtypebank;
                            cash_bank.cash_eno = req.body.cash_eno;
                            cash_bank.vouc_code = req.body.vouc_code;
                            cash_bank.cash_date = DateObject;
                            cash_bank.cash_edatemilisecond = sodatemilisecond;
                            cash_bank.cash_type = req.body.cash_type;
                            cash_bank.cash_bank_name = req.body.cashac_name[i];
                            cash_bank.cashac_name = req.body.cash_bank_name;     
                            cash_bank.cash_chequeno = req.body.cash_chequeno[i];
                            cash_bank.cash_chequedate = req.body.cash_chequedate[i];
                            cash_bank.cash_amount = req.body.cash_amount[i];
                            cash_bank.cash_narrone = req.body.cash_narrone[i];
                            cash_bank.cash_narrtwo = req.body.cash_narrtwo[i];
                            cash_bank.del = "N";
                            cash_bank.CNCL = "N";
                            cash_bank.entrydate = new Date();
                            cash_bank.totcash_amt = req.body.totcash_amt;
                            cash_bank.cash_remarks = req.body.cash_remarks;
                            // cash_bank.cash_bank_group = req.body.cash_bank_group;
                            cash_bank.co_code = req.session.compid;
                            cash_bank.div_code = req.session.divid;
                            cash_bank.usrnm = req.session.user;
                            cash_bank.masterid = req.session.masterid
                            cash_bank.save(function (err){
                            });
                        }  
                }
                else
                {
                    let cash_bank = {};
                    cash_bank.srno = i;
                    cash_bank.main_bk = "CB";
                    if(req.body.cash_type=="RECEIPT") cash_bank.d_c ="C";
                    else cash_bank.d_c             = "D";
                    cash_bank.c_j_s_p              = req.body.cashtypebank;
                    
                    cash_bank.cash_eno             = req.body.cash_eno;
                    cash_bank.vouc_code            = req.body.vouc_code;
                    cash_bank.cash_date            = DateObject;
                    cash_bank.cash_edatemilisecond = sodatemilisecond;

                    cash_bank.deposit_date         = DateObject
                    cash_bank.deposit_datemilisecond = sodatemilisecond

                    cash_bank.cash_type            = req.body.cash_type;
                    cash_bank.cash_bank_name       = req.body.cash_bank_name;     

                    cash_bank.del                  = "N";
                    cash_bank.CNCL                 = "N";
                    cash_bank.update               = new Date();

                    cash_bank.cashac_name          = req.body.cashac_name[i];
                    cash_bank.cash_chequeno        = req.body.cash_chequeno[i];
                    cash_bank.cash_chequedate      = req.body.cash_chequedate[i];
                    cash_bank.cash_amount          = req.body.cash_amount[i];
                    // cash_bank.Amount_Deduction     = req.body.Amount_Deduction[i]
                    cash_bank.Add_Amount_Deduction = req.body.Add_Amount_Deduction[i];
                    cash_bank.Less_Amount_Deduction= req.body.Less_Amount_Deduction[i];
                    cash_bank.cash_narrone         = req.body.cash_narrone[i];
                    cash_bank.cash_narrtwo         = req.body.cash_narrtwo[i];
                    cash_bank.cash_narr         = req.body.cash_narr[i];
                    if(req.body.YPara_Array[i] == null || req.body.YPara_Array[i] == '' || req.body.YPara_Array[i] == [] || req.body.YPara_Array[i] == undefined)cash_bank.addlessParameter=[];
                    else cash_bank.addlessParameter     = JSON.parse(req.body.YPara_Array[i]);
            
                    cash_bank.totcash_amt          = req.body.totcash_amt;
                    cash_bank.cash_remarks         = req.body.cash_remarks;
                    // cash_bank.cash_bank_group      = req.body.cash_bank_group;
                    cash_bank.outStandingArr       = req.body.outSaveArr[i]
                    cash_bank.co_code              = req.session.compid;
                    cash_bank.div_code             = req.session.divid;
                    cash_bank.usrnm                = req.session.user;
                    cash_bank.masterid             = req.session.masterid
                    // cash_bank.Chaq_Return          = 'N';
                    let query = {_id:req.body.maincashid[i]};
                    console.log(query);
                    cashmast.update(query , cash_bank ,function (err) {if(err)console.log('789',err)});

                    if(req.body.cash_type == "RECEIPT" || req.body.cash_type == "PAYMENT"){
                        if(req.body.YPara_Array[i] == null || req.body.YPara_Array[i] == '' || req.body.YPara_Array[i] == [] || req.body.YPara_Array[i] == undefined)flag=1
                        else{
                            var Add_Array = JSON.parse(req.body.YPara_Array[i]);
                            for(let a=0; a<Add_Array.length; a++){
                                if(Add_Array[a].YDed_Par_typ == '+'){
                                    for(let b=0; b<addlessmast.Add_Less_Parameter_Master_Array.length; b++){
                                        for(let c=0; c<addlessmast.Add_Less_Parameter_Master_Array[b].Division.length; c++){
                                            if(addlessmast.Add_Less_Parameter_Master_Array[b].Division[c] == req.session.divid && Add_Array[a].YDed_Par_dsc_id == addlessmast.Add_Less_Parameter_Master_Array[b]._id){
                                                // addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac
                                                let cash_bank_posting = {};
                                                cash_bank_posting.CashBank_id = req.body.maincashid[i];
                                                cash_bank_posting.main_bk_posting = "CB Posting"+i+""+a+"";
                                                cash_bank_posting.srno = 100+parseInt(i);
                                                cash_bank_posting.main_bk = "CB";
                                                if(req.body.cash_type=="RECEIPT")cash_bank_posting.d_c ="C";
                                                else cash_bank_posting.d_c             = "D";
                                                cash_bank_posting.c_j_s_p              = req.body.cashtypebank;
                                                
                                                cash_bank_posting.cash_eno             = req.body.cash_eno;
                                                cash_bank_posting.vouc_code            = req.body.vouc_code;
                                                cash_bank_posting.cash_date            = DateObject;
                                                cash_bank_posting.cash_edatemilisecond = sodatemilisecond;
                                                cash_bank_posting.cash_type            = req.body.cash_type;
                                                // cash_bank_posting.cash_bank_name       = req.body.cash_bank_name; 
                                                cash_bank_posting.cash_bank_name       = req.body.cashac_name[i];    

                                                cash_bank_posting.del                  = "N";
                                                cash_bank_posting.CNCL                 = "N";
                                                cash_bank_posting.update               = new Date();

                                                cash_bank_posting.cashac_name          = addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac;
                                                cash_bank_posting.cash_chequeno        = req.body.cash_chequeno[i];
                                                cash_bank_posting.cash_chequedate      = req.body.cash_chequedate[i];
                                                if(Add_Array[a].YDed_Par_value == null || Add_Array[a].YDed_Par_value == '' || isNaN(Add_Array[a].YDed_Par_value))Add_Array[a].YDed_Par_value = 0;
                                                cash_bank_posting.cash_amount          = Add_Array[a].YDed_Par_value;
                                                // cash_bank_posting.Amount_Deduction     = req.body.Amount_Deduction[i]
                                                cash_bank_posting.Add_Amount_Deduction = 0;
                                                cash_bank_posting.Less_Amount_Deduction= 0;
                                                cash_bank_posting.cash_narrone         = req.body.cash_narrone[i];
                                                cash_bank_posting.cash_narrtwo         = req.body.cash_narrtwo[i];
                                                // cash_bank_posting.addlessParameter     = JSON.parse(req.body.YPara_Array[i]);
                                                cash_bank_posting.totcash_amt          = req.body.totcash_amt;
                                                cash_bank_posting.cash_remarks         = req.body.cash_remarks;
                                                // cash_bank_posting.cash_bank_group      = req.body.cash_bank_group;
                                                // cash_bank_posting.outStandingArr       = req.body.outSaveArr[i]
                                                cash_bank_posting.co_code              = req.session.compid;
                                                cash_bank_posting.div_code             = req.session.divid;
                                                cash_bank_posting.usrnm                = req.session.user;
                                                cash_bank_posting.masterid             = req.session.masterid
                                                // cash_bank_posting.Chaq_Return          = 'N';
                                                let query_cash_bank_posting = {CashBank_id:req.body.maincashid[i],c_j_s_p:req.body.cashtypebank,main_bk_posting:"CB Posting"+i+""+a+"",main_bk:'CB'}
                                                cashmast.update(query_cash_bank_posting , cash_bank_posting ,function (err) {if(err)console.log('842',err)});
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if(req.body.outSaveArr[i] == null || req.body.outSaveArr[i] == '' || req.body.outSaveArr[i] == [] || req.body.outSaveArr[i] == undefined)flag=1
                        else{
                            var outSaveArr = JSON.parse(req.body.outSaveArr[i]);
                            for(let j=0; j<outSaveArr.length; j++){
                                if(parseFloat(outSaveArr[j].ReceiveAmt) >0){
                                    if(outSaveArr[j].OutEntry_id == null || outSaveArr[j].OutEntry_id == '' || outSaveArr[j].OutEntry_id == undefined){
                                        let out = new outstanding();
                                        out.CashBank_id = req.body.maincashid[i];
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            out.main_bk = "OnAcc";
                                            out.OS_Type = 'ONA';
                                        }
                                        else out.main_bk = "CB";
                                        out.c_j_s_p = req.body.cashtypebank;
                                        if(req.body.cash_type == "RECEIPT") out.d_c ="C";
                                        else out.d_c = "D";
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc')out.vouc_code = 0;
                                        else out.vouc_code = outSaveArr[j].vouc_code;
                                        // out.vouc_code = outSaveArr[j].vouc_code;
                                        out.cash_date = DateObject;
                                        out.cash_edatemilisecond = sodatemilisecond;
                                        out.cashac_name = outSaveArr[j].cashac_name;
                                        out.cash_bank_name = req.body.cash_bank_name;
                                        out.cash_narrtwo = 'Oustanding';
                                        out.cash_narrone = 'Cash bank';
                                        out.cash_type   = req.body.cash_type;
                                        out.del         = "N";
                                        out.CNCL        = "N";
                                        out.entrydate   = new Date();
                                        out.cash_amount = outSaveArr[j].ReceiveAmt;
                                        out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                        out.Bill_Date   = outSaveArr[j].Bill_Date;
                                        out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                        // out.Amount_Deduction = outSaveArr[j].Ded_Amt_Tot;
                                        out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                        out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;

                                        if(outSaveArr[j].BalanceAmt<0)out.outstanding_balance = outSaveArr[j].BalanceAmt*-1;
                                        out.outstanding_balance = outSaveArr[j].BalanceAmt;

                                        out.outstanding_amount = outSaveArr[j].BalanceAmt; //Calulate Outstanding Balance For Bill Collection
                                        
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                            out.op_outstanding_id  = '';
                                        }else{
                                            out.outstanding_id = outSaveArr[j].out_id;
                                            out.op_outstanding_id  = outSaveArr[j].out_id;
                                        }
                                        
                                        out.Cbvouc_code = req.body.vouc_code;
                                        out.addlessParameter = outSaveArr[j].Para_Array;
                                        
                                        out.op_main_bk  = outSaveArr[j].main_bk;
                                        out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                        out.op_co_code  = outSaveArr[j].co_code;
                                        out.op_div_code = outSaveArr[j].div_code;

                                        out.co_code = req.session.compid;
                                        out.div_code = req.session.divid;
                                        out.usrnm = req.session.user;
                                        out.masterid = req.session.masterid;
                                        out.save(function(err){if(err)console.log('912',err)});
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                        }else{
                                                var recamt = outSaveArr[j].ReceiveAmt;
                                                var Add_Am_Deduction = outSaveArr[j].Add_Ded_Amt_Tot;
                                                var Less_Am_Deduction = outSaveArr[j].Less_Ded_Amt_Tot;
                                                var BalanceAmt = outSaveArr[j].BalanceAmt;
                                                if(BalanceAmt<0)BalanceAmt = BalanceAmt*-1;
                                                var out_id = outSaveArr[j].out_id;
                                                // console.log('Rec Amount',recamt);
                                                var outstand = await outstanding.findById(outSaveArr[j].out_id, function(err, out_statnding) {})
                                                    let outObj = {}
                                                    var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.Cbvouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt,
                                                    'Add_Ded_Amt_Tot':Add_Am_Deduction,'Less_Ded_Amt_Tot':Less_Am_Deduction};
                                                    outstand.Out_recieved_Entry_Arr.push(arr);
                                                    outObj.Rec_Amount = parseFloat(outstand.Rec_Amount)+parseFloat(recamt);
                                                    outObj.Add_Ded_Amt_Tot = parseFloat(outstand.Add_Ded_Amt_Tot)+parseFloat(Add_Am_Deduction);
                                                    outObj.Less_Ded_Amt_Tot = parseFloat(outstand.Less_Ded_Amt_Tot)+parseFloat(Less_Am_Deduction);
                                                    outObj.outstanding_balance = BalanceAmt;
                                                    outObj.Out_recieved_Entry_Arr = outstand.Out_recieved_Entry_Arr;
                                                    var qry = {_id:out_id};
                                                    outstanding.update(qry,outObj,function (err) {});
                                        }
                                    }else{
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                        }
                                        else{
                                            var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                            var OutEntry = await outstanding.findById(outSaveArr[j].OutEntry_id,function(err,aa){});
                                            if(OutEntry.Add_Ded_Amt_Tot == null || OutEntry.Add_Ded_Amt_Tot == '' || OutEntry.Add_Ded_Amt_Tot == undefined || isNaN(OutEntry.Add_Ded_Amt_Tot))OutEntry.Add_Ded_Amt_Tot = 0;
                                            if(OutEntry.Less_Ded_Amt_Tot == null || OutEntry.Less_Ded_Amt_Tot == '' || OutEntry.Less_Ded_Amt_Tot == undefined || isNaN(OutEntry.Less_Ded_Amt_Tot))OutEntry.Less_Ded_Amt_Tot = 0;
                                            var outObj = {};
                                            outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)+parseFloat(OutEntry.Rec_Amount)+parseFloat(OutEntry.Add_Ded_Amt_Tot);
                                            outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)-parseFloat(OutEntry.Rec_Amount);
                                            outObj.Add_Ded_Amt_Tot = parseFloat(OutSB.Add_Ded_Amt_Tot)-parseFloat(OutEntry.Add_Ded_Amt_Tot);
                                            outObj.Less_Ded_Amt_Tot = parseFloat(OutSB.Less_Ded_Amt_Tot)-parseFloat(OutEntry.Less_Ded_Amt_Tot);
                                            outObj.outstanding_amount = parseFloat(OutSB.outstanding_balance)+parseFloat(OutEntry.Rec_Amount)+parseFloat(OutEntry.Add_Ded_Amt_Tot);
                                            outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                                if(err)console.log('951 Error',err)
                                                else {}
                                            })
                                        }
                                        let out = {};
                                        out.CashBank_id = req.body.maincashid[i];
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            out.main_bk = "OnAcc";
                                            out.OS_Type = 'ONA';
                                        }
                                        else out.main_bk = "CB";
                                        out.c_j_s_p = req.body.cashtypebank;
                                        if(req.body.cash_type == "RECEIPT") out.d_c ="C";
                                        else out.d_c = "D";
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc')out.vouc_code = 0;
                                        else out.vouc_code = outSaveArr[j].vouc_code;
                                        // out.vouc_code = outSaveArr[j].vouc_code;
                                        out.cash_date = DateObject;
                                        out.cash_edatemilisecond = sodatemilisecond;
                                        out.cashac_name = outSaveArr[j].cashac_name;
                                        out.cash_bank_name = req.body.cash_bank_name;
                                        out.cash_narrtwo = 'Oustanding';
                                        out.cash_narrone = 'Cash bank';
                                        out.cash_type   = req.body.cash_type;
                                        out.del         = "N";
                                        out.CNCL        = "N";
                                        out.update   = new Date();
                                        out.cash_amount = outSaveArr[j].ReceiveAmt;
                                        out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                        out.Bill_Date   = outSaveArr[j].Bill_Date;
                                        out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                        // out.Amount_Deduction = outSaveArr[j].Ded_Amt_Tot;
                                        out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                        out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;

                                        if(outSaveArr[j].BalanceAmt<0)out.outstanding_balance = outSaveArr[j].BalanceAmt*-1;
                                        out.outstanding_balance = outSaveArr[j].BalanceAmt;

                                        out.outstanding_amount = outSaveArr[j].BalanceAmt; //Calulate Outstanding Balance For Bill Collection
                                        
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                            out.op_outstanding_id  = '';
                                        }else{
                                            out.outstanding_id = outSaveArr[j].out_id;
                                            out.op_outstanding_id  = outSaveArr[j].out_id;
                                        }
                                        
                                        out.Cbvouc_code = req.body.vouc_code;
                                        out.addlessParameter = outSaveArr[j].Para_Array;
                                        
                                        out.op_main_bk  = outSaveArr[j].main_bk;
                                        out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                        out.op_co_code  = outSaveArr[j].co_code;
                                        out.op_div_code = outSaveArr[j].div_code;

                                        out.co_code = req.session.compid;
                                        out.div_code = req.session.divid;
                                        out.usrnm = req.session.user;
                                        out.masterid = req.session.masterid;

                                        let query_out = {_id:outSaveArr[j].OutEntry_id};
                                        outstanding.update(query_out,out,function (err) {if(err)console.log('1012',err)});
                                        if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                        }else{
                                                var recamt = outSaveArr[j].ReceiveAmt;
                                                var Add_Am_Deduction = outSaveArr[j].Add_Ded_Amt_Tot;
                                                var Less_Am_Deduction = outSaveArr[j].Less_Ded_Amt_Tot;
                                                var BalanceAmt = outSaveArr[j].BalanceAmt;
                                                if(BalanceAmt<0)BalanceAmt = BalanceAmt*-1;
                                                var out_id = outSaveArr[j].out_id;
                                                // console.log('Rec Amount',recamt);
                                                var outstand = await outstanding.findById(outSaveArr[j].out_id, function(err, out_statnding) {})
                                                    let outObj = {}
                                                    var count = 0;
                                                    var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.Cbvouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt,
                                                    'Add_Ded_Amt_Tot':Add_Am_Deduction,'Less_Ded_Amt_Tot':Less_Am_Deduction};
                                                    if(outstand.Out_recieved_Entry_Arr == null || outstand.Out_recieved_Entry_Arr == [])outstand.Out_recieved_Entry_Arr.push(arr);
                                                    else{
                                                        for(let r=0; r<outstand.Out_recieved_Entry_Arr.length; r++){
                                                            if(JSON.stringify(outstand.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outSaveArr[j].OutEntry_id)){
                                                                outstand.Out_recieved_Entry_Arr[r] = arr;
                                                                count = count + 1;
                                                                break;
                                                            }
                                                        }
                                                        if(count == 0)outstand.Out_recieved_Entry_Arr.push(arr);
                                                    }
                                                    outObj.Rec_Amount = parseFloat(outstand.Rec_Amount)+parseFloat(recamt);
                                                    outObj.Add_Ded_Amt_Tot = parseFloat(outstand.Add_Ded_Amt_Tot)+parseFloat(Add_Am_Deduction);
                                                    outObj.Less_Ded_Amt_Tot = parseFloat(outstand.Less_Ded_Amt_Tot)+parseFloat(Less_Am_Deduction);
                                                    outObj.outstanding_balance = BalanceAmt;
                                                    outObj.Out_recieved_Entry_Arr = outstand.Out_recieved_Entry_Arr;
                                                    var qry = {_id:out_id};
                                                    outstanding.update(qry,outObj,function (err) {if(err)console.log('1045',err)});
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if(req.body.cash_type == "CONTRA")
                    {
                            let cash_bank = {};
                            cash_bank.srno = i;
                            cash_bank.main_bk = "CB1";
                            cash_bank.d_c ="C";            
                            cash_bank.c_j_s_p = req.body.cashtypebank;
                            cash_bank.cash_eno = req.body.cash_eno;
                            cash_bank.vouc_code = req.body.vouc_code;
                            cash_bank.cash_date =DateObject;
                            cash_bank.cash_edatemilisecond = sodatemilisecond;
                            cash_bank.cash_type = req.body.cash_type;
                            cash_bank.cash_bank_name = req.body.cashac_name[i];
                            cash_bank.cashac_name = req.body.cash_bank_name;     
                            cash_bank.cash_chequeno = req.body.cash_chequeno[i];
                            cash_bank.cash_chequedate = req.body.cash_chequedate[i];
                            cash_bank.cash_amount = req.body.cash_amount[i];
                            cash_bank.cash_narrone = req.body.cash_narrone[i];
                            cash_bank.cash_narrtwo = req.body.cash_narrtwo[i];
                            cash_bank.del = "N";
                            cash_bank.CNCL = "N";
                            cash_bank.update = new Date();
                            cash_bank.totcash_amt = req.body.totcash_amt;
                            cash_bank.cash_remarks = req.body.cash_remarks;
                            // cash_bank.cash_bank_group = req.body.cash_bank_group;
                            cash_bank.co_code = req.session.compid;
                            cash_bank.div_code = req.session.divid;
                            cash_bank.usrnm = req.session.user;
                            cash_bank.masterid = req.session.masterid

                            // let query2 = {vouc_code:req.body.vouc_code,c_j_s_p:req.body.cashtypebank,main_bk:"CB1"}
                            var query2 = {_id:req.body.maincashid[i]}
                            cashmast.update(query2 , cash_bank ,function (err) {});
                    }
                }
            }
            res.redirect('/cash_bank/cash_bank_list');
        }
    });
});
 
router.get('/cashbank_delete',async function(req, res){
    var vouc_code = req.query.vouc_code
    var cjsp = req.query.cjsp
    var mainbk =  req.query.mainbk;
    let query  = {vouc_code:vouc_code,main_bk:"CB",c_j_s_p:cjsp,del:'N',co_code:req.session.compid,div_code:req.session.divid}
    let query2 = {vouc_code:vouc_code,main_bk:"CB1",c_j_s_p:cjsp,del:'N',co_code:req.session.compid,div_code:req.session.divid}
    let query3 = {Cbvouc_code:vouc_code,main_bk:"CB",c_j_s_p:cjsp,del:'N',co_code:req.session.compid,div_code:req.session.divid}
    let query4 = {Cbvouc_code:vouc_code,main_bk:"OnAcc",c_j_s_p:cjsp,del:'N',co_code:req.session.compid,div_code:req.session.divid}
    let cash_bank = {};
        cash_bank.del = "Y";
        cash_bank.delete = new Date();
        cashmast.updateMany(query2,cash_bank,function(err){});
        cashmast.updateMany(query,cash_bank,function(err){
            if(err)console.log(err);
        });
        let cbOutStanding = await outstanding.find(query3,function(err){});
        outstanding.updateMany(query4,cash_bank,function(err){});
        for(let i=0; i<cbOutStanding.length; i++){
            updateOut = await outstanding.findById(cbOutStanding[i].outstanding_id,function(err){});
            if(updateOut == null || updateOut == '' || updateOut == [])flag=1
            else{
                let out = {};
                if(cbOutStanding[i].Add_Ded_Amt_Tot == null || cbOutStanding[i].Add_Ded_Amt_Tot == '' || cbOutStanding[i].Add_Ded_Amt_Tot == undefined || isNaN(cbOutStanding[i].Add_Ded_Amt_Tot))cbOutStanding[i].Add_Ded_Amt_Tot = 0;
                if(cbOutStanding[i].Less_Ded_Amt_Tot == null || cbOutStanding[i].Less_Ded_Amt_Tot == '' || cbOutStanding[i].Less_Ded_Amt_Tot == undefined || isNaN(cbOutStanding[i].Less_Ded_Amt_Tot))cbOutStanding[i].Less_Ded_Amt_Tot = 0;
                out.Rec_Amount = parseFloat(updateOut.Rec_Amount)-parseFloat(cbOutStanding[i].Rec_Amount);
                out.Add_Ded_Amt_Tot = parseFloat(updateOut.Add_Ded_Amt_Tot)-parseFloat(cbOutStanding[i].Add_Ded_Amt_Tot);
                out.Less_Ded_Amt_Tot = parseFloat(updateOut.Less_Ded_Amt_Tot)-parseFloat(cbOutStanding[i].Less_Ded_Amt_Tot);
                out.outstanding_balance = parseFloat(updateOut.outstanding_balance)+parseFloat(cbOutStanding[i].Rec_Amount)+parseFloat(cbOutStanding[i].Add_Ded_Amt_Tot);
                var qry = {_id:cbOutStanding[i].outstanding_id};
                outstanding.update(qry,out,function(err){});
            }
        }
        outstanding.updateMany(query3,cash_bank,function(err){});
    res.redirect('/cash_bank/cash_bank_list');
});

router.get('/SaveChaqReturnEntry',async function(req, res){
    var vouc_code = req.query.vouc_code
    var cjsp = req.query.cjsp
    var mainbk =  req.query.mainbk;
    var cashac_name = req.query.cashac_name;
    var Sno = req.query.Sno;
    var cash_bank_id = req.query.cash_bank_id;
    var chaqReturnEntryRadio = req.query.chaqReturnEntryRadio;

    var c_j_s_p_chaq     = req.query.c_j_s_p_chaq;
    var vouc_code_chaq   = req.query.vouc_code_chaq;
    var cash_remarks_chaq= req.query.cash_remarks_chaq;
    var ChaqReturnDate   = req.query.ChaqReturnDate;

    let query = {_id:cash_bank_id,del:'N'};
    let queryCBParametrPosting = {CashBank_id:cash_bank_id,del:'N'};
    // let query = {vouc_code:vouc_code,cashac_name:cashac_name,Sno:Sno,main_bk:"CB",c_j_s_p:cjsp,del:'N',co_code:req.session.compid,divid:req.session.divid};
    // let query2 = {vouc_code:vouc_code,main_bk:"CB1",c_j_s_p:cjsp,del:'N'}
    let query3 = {CashBank_id:cash_bank_id,del:'N',CNCL:'N'} //outStanding Qry
    // let query4 = {CashBank_id:cash_bank_id,del:'N'} //outStanding Qry for Onacc
    
    let cash_bank = {};
        cash_bank.Chaq_Return = "Y";
        cashmast.updateMany(queryCBParametrPosting,cash_bank,function(err){});
        cashmast.updateMany(query,cash_bank,function(err){if(err)console.log(err);});
        let outstanndingChaqreturnUpdate = {};
        outstanndingChaqreturnUpdate.CNCL = "Y";
        // outstanding.updateMany(query4,outstanndingChaqreturnUpdate,function(err){});// Update CNCL in OnaAcc Oustanding entry
        if(chaqReturnEntryRadio != 'Pass Represent Voucher'){
            let cbOutStanding = await outstanding.find(query3,function(err){});
            for(let i=0; i<cbOutStanding.length; i++){
                if(cbOutStanding[i].outstanding_id == '' || cbOutStanding[i].outstanding_id == null || cbOutStanding[i].outstanding_id == undefined)flag=1;
                else{
                    updateOut = await outstanding.findById(cbOutStanding[i].outstanding_id,function(err){});
                    if(updateOut == null || updateOut == '' || updateOut == [])flag=1
                    else{
                        let out = {};
                        out.Rec_Amount = parseFloat(updateOut.Rec_Amount)-parseFloat(cbOutStanding[i].Rec_Amount);
                        out.Add_Ded_Amt_Tot = parseFloat(updateOut.Add_Ded_Amt_Tot)-parseFloat(cbOutStanding[i].Add_Ded_Amt_Tot);
                        out.Less_Ded_Amt_Tot = parseFloat(updateOut.Less_Ded_Amt_Tot)-parseFloat(cbOutStanding[i].Less_Ded_Amt_Tot);
                        if(cbOutStanding[i].Less_Ded_Amt_Tot == null || cbOutStanding[i].Less_Ded_Amt_Tot == '' || cbOutStanding[i].Less_Ded_Amt_Tot == undefined)cbOutStanding[i].Less_Ded_Amt_Tot = 0;
                        if(cbOutStanding[i].Add_Ded_Amt_Tot == null || cbOutStanding[i].Add_Ded_Amt_Tot == '' || cbOutStanding[i].Add_Ded_Amt_Tot == undefined)cbOutStanding[i].Add_Ded_Amt_Tot = 0;
                        out.outstanding_balance = parseFloat(updateOut.outstanding_balance)+parseFloat(cbOutStanding[i].Rec_Amount)+parseFloat(cbOutStanding[i].Add_Ded_Amt_Tot)-parseFloat(cbOutStanding[i].Less_Ded_Amt_Tot);;
                        console.log(i,out);
                        var qry = {_id:cbOutStanding[i].outstanding_id};
                        outstanding.update(qry,out,function(err){});
                    }
                }
            }
            outstanding.updateMany(query3,outstanndingChaqreturnUpdate,function(err){});
        }

        if(chaqReturnEntryRadio == 'Pass Return Voucher' || chaqReturnEntryRadio == 'Pass Represent Voucher'){
            var cash_bank_entry = await cashmast.findById(cash_bank_id,function(err,cash_bank_entry){});
            // console.log(chaqReturnEntryRadio,'cash_bank_entry',cash_bank_entry.vouc_code);
            var DateObject =  moment(ChaqReturnDate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var sodatemilisecond = DateObject.format('x');

                let cash_bank = new cashmast();
                cash_bank.srno = Sno;
                cash_bank.main_bk = "CB";
                if(cash_bank_entry.cash_type=="RECEIPT") cash_bank.d_c = "D";
                if(cash_bank_entry.cash_type=="PAYMENT") cash_bank.d_c = "C";
                cash_bank.c_j_s_p              = c_j_s_p_chaq;
                
                // cash_bank.cash_eno             = req.body.cash_eno;
                cash_bank.vouc_code            = vouc_code_chaq;
                cash_bank.cash_date            = DateObject;
                cash_bank.cash_edatemilisecond = sodatemilisecond;

                cash_bank.deposit_date         = DateObject
                cash_bank.deposit_datemilisecond = sodatemilisecond

                if(cash_bank_entry.cash_type=="RECEIPT") cash_bank.cash_type = "PAYMENT";
                if(cash_bank_entry.cash_type=="PAYMENT") cash_bank.cash_type = "RECEIPT";
                
                cash_bank.cash_bank_name       = cash_bank_entry.cash_bank_name;     

                cash_bank.del                  = "N";
                cash_bank.entrydate            = new Date();

                cash_bank.cashac_name          = cash_bank_entry.cashac_name;
                cash_bank.cash_chequeno        = cash_bank_entry.cash_chequeno;
                cash_bank.cash_chequedate      = cash_bank_entry.cash_chequedate;
                cash_bank.cash_amount          = cash_bank_entry.cash_amount;
                cash_bank.Add_Amount_Deduction = cash_bank_entry.Add_Amount_Deduction;
                cash_bank.Less_Amount_Deduction= cash_bank_entry.Less_Amount_Deduction;

                cash_bank.cash_narrone         = 'cheque return';
                cash_bank.cash_narrtwo         = cash_remarks_chaq;
                cash_bank.cash_remarks         = cash_bank_entry.cash_remarks;

                cash_bank.cash_narr            = cash_bank_entry.cash_narr;
                cash_bank.addlessParameter     = cash_bank_entry.addlessParameter;
        
                cash_bank.totcash_amt          = cash_bank_entry.totcash_amt;
                cash_bank.outStandingArr       = cash_bank_entry.outSaveArr
                cash_bank.co_code              = req.session.compid;
                cash_bank.div_code             = req.session.divid;
                cash_bank.usrnm                = req.session.user;
                cash_bank.masterid             = req.session.masterid
                // cash_bank.Chaq_Return          = 'N';
                cash_bank.save(function (err){});
        }
        if(chaqReturnEntryRadio == 'Pass Represent Voucher'){
            var cash_bank_entry = await cashmast.findById(cash_bank_id,function(err,cash_bank_entry){});
            // console.log(chaqReturnEntryRadio,'cash_bank_entry',cash_bank_entry.vouc_code);
            var DateObject =  moment(ChaqReturnDate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var sodatemilisecond = DateObject.format('x');

                let cash_bank = new cashmast();
                cash_bank.srno = Sno;
                cash_bank.main_bk = "CB";
                cash_bank.d_c = cash_bank_entry.d_c;
                cash_bank.c_j_s_p              = c_j_s_p_chaq;
                // cash_bank.cash_eno             = req.body.cash_eno;
                cash_bank.vouc_code            = parseInt(vouc_code_chaq)+1;
                cash_bank.cash_date            = DateObject;
                cash_bank.cash_edatemilisecond = sodatemilisecond;
                cash_bank.deposit_date         = DateObject
                cash_bank.deposit_datemilisecond = sodatemilisecond

                cash_bank.cash_type            = cash_bank_entry.cash_type;
                cash_bank.cash_bank_name       = cash_bank_entry.cash_bank_name;     
                cash_bank.del                  = "N";
                cash_bank.entrydate            = new Date();
                cash_bank.cashac_name          = cash_bank_entry.cashac_name;
                cash_bank.cash_chequeno        = cash_bank_entry.cash_chequeno;
                cash_bank.cash_chequedate      = cash_bank_entry.cash_chequedate;
                cash_bank.cash_amount          = cash_bank_entry.cash_amount;
                cash_bank.Add_Amount_Deduction = cash_bank_entry.Add_Amount_Deduction;
                cash_bank.Less_Amount_Deduction= cash_bank_entry.Less_Amount_Deduction;

                cash_bank.cash_narrone         = 'cheque return';
                cash_bank.cash_narrtwo         = cash_remarks_chaq;
                cash_bank.cash_remarks         = cash_bank_entry.cash_remarks;

                cash_bank.cash_narr            = cash_bank_entry.cash_narr;
                cash_bank.addlessParameter     = cash_bank_entry.addlessParameter;
        
                cash_bank.totcash_amt          = cash_bank_entry.totcash_amt;
                cash_bank.outStandingArr       = cash_bank_entry.outSaveArr
                cash_bank.co_code              = req.session.compid;
                cash_bank.div_code             = req.session.divid;
                cash_bank.usrnm                = req.session.user;
                cash_bank.masterid             = req.session.masterid
                // cash_bank.Chaq_Return          = 'N';
                cash_bank.save(function (err){});
                let outstanndingChaqreturnUpdate = {};
                outstanndingChaqreturnUpdate.CashBank_id = cash_bank._id;
                outstanding.updateMany(query3,outstanndingChaqreturnUpdate,function(err){});
        }
    res.json({'success':true});
});

router.get('/showAdjustEntryInCbUpdate', function (req, res) {
    var cash_bank_id = req.query.cashBankId;
    var qry = {CashBank_id:cash_bank_id,del:'N',CNCL:'N'};
    if(req.query.Module == 'JV')qry = {jv_Entry_id:cash_bank_id,del:'N',CNCL:'N'};
    outstanding.find(qry,function(err, outstandingEntry){
        res.json({'success':true,'outstandingEntry':outstandingEntry});
    }).populate('cashac_name').populate('cash_bank_name');
});

router.get('/delCBAdjustAmtEntry',async function(req, res){
    var OutEntryId = req.query.OutEntryId
    var CashBank_id = req.query.CashBank_id
    var Bill_vouc_code =  req.query.Bill_vouc_code;
    var Bill_c_j_s_p = req.query.Bill_c_j_s_p;
    var Bill_main_bk = req.query.Bill_main_bk;
    var Bill_co_code = req.query.Bill_co_code;
    var Bill_div_code = req.query.Bill_div_code;

    var OutEntry_recAmt= req.query.OutEntry_recAmt;
    var OutEntry_addAmt= req.query.OutEntry_addAmt;
    var OutEntry_lessAmt= req.query.OutEntry_lessAmt;

    let qryOutEntryDel = {_id:OutEntryId,del:'N'};// Delete Adjust Amt Outstanding Entry 
    let qryUpdateCBEntry = {_id:CashBank_id,del:'N',srno:{$lt:100}}; // Update Cash Bank Entry ( Minus Adjust Amt And Addless Amount)
    let qryUpdateBill = {vouc_code:Bill_vouc_code,c_j_s_p:Bill_c_j_s_p,main_bk:Bill_main_bk,co_code:Bill_co_code,div_code:Bill_div_code,del:'N'} //outStanding Qry
    
    // Cash Bank Entry Update
    var cash_bank_entry = await cashmast.findOne(qryUpdateCBEntry,function(err,CashBank){});
    var cash_bank = {};
    cash_bank.cash_amount           = (parseFloat(cash_bank_entry.cash_amount)-parseFloat(OutEntry_recAmt)-parseFloat(OutEntry_lessAmt)).toFixed(2);
    cash_bank.Add_Amount_Deduction  = (parseFloat(cash_bank_entry.Add_Amount_Deduction)-parseFloat(OutEntry_addAmt)).toFixed(2);
    cash_bank.Less_Amount_Deduction = (parseFloat(cash_bank_entry.Less_Amount_Deduction)-parseFloat(OutEntry_lessAmt)).toFixed(2);
    for(let i=0; i<cash_bank_entry.addlessParameter.length; i++){  // Confirm karana hai
        if(cash_bank_entry.addlessParameter[i].YDed_Par_typ == '+')cash_bank_entry.addlessParameter[i].YDed_Par_value = (parseFloat(cash_bank_entry.addlessParameter[i].YDed_Par_value)-parseFloat(OutEntry_addAmt)).toFixed(2);
        if(cash_bank_entry.addlessParameter[i].YDed_Par_typ == '-')cash_bank_entry.addlessParameter[i].YDed_Par_value = (parseFloat(cash_bank_entry.addlessParameter[i].YDed_Par_value)-parseFloat(OutEntry_lessAmt)).toFixed(2);
    }
     
    cash_bank.addlessParameter = cash_bank_entry.addlessParameter;
    // console.log('Cash Bank Entry',cash_bank);
    var totcash_amt = (parseFloat(cash_bank_entry.totcash_amt)-parseFloat(OutEntry_recAmt)-parseFloat(OutEntry_lessAmt)).toFixed(2)
    cashmast.update({_id:cash_bank_entry._id},cash_bank,function(err){if(err)console.log('Cash Bank Entry Error',err)});
    var qryForNetAmtInCB = {main_bk:cash_bank_entry.main_bk,vouc_code:cash_bank_entry.vouc_code,c_j_s_p:cash_bank_entry.c_j_s_p,co_code:cash_bank_entry.co_code,div_code:cash_bank_entry.div_code,srno:0}
    var cash_bankTotAmt = {};
    cash_bankTotAmt.totcash_amt = totcash_amt;
    cashmast.update(qryForNetAmtInCB,cash_bankTotAmt,function(err){if(err)console.log('Cash Bank Entry Tot Amt Error',err)});

    // Cash Bank Discount Posting Entry Update
    var cash_bank_entry_posting = await cashmast.findOne({CashBank_id:CashBank_id,del:'N',srno:{$gte:100}},function(err,CashBank){});
    var cash_bank_posting = {};
    cash_bank_posting.cash_amount = (cash_bank_entry_posting.cash_amount - parseFloat(OutEntry_addAmt)).toFixed(2);
    // console.log('cash bank posting Entry',cash_bank_posting);
    cashmast.update({_id:cash_bank_entry_posting._id},cash_bank,function(err){if(err)console.log('cash bank posting Entry Error',err)});

    // Update Sale Bill Entry In Oustanding
    let SBOutStandingEntry = await outstanding.findOne(qryUpdateBill,function(err){});
    if(SBOutStandingEntry == null || SBOutStandingEntry == '' || SBOutStandingEntry == [])flag=1
    else{
        let out = {};
        out.Rec_Amount = parseFloat(SBOutStandingEntry.Rec_Amount)-parseFloat(OutEntry_recAmt);
        out.Add_Ded_Amt_Tot = parseFloat(SBOutStandingEntry.Add_Ded_Amt_Tot)-parseFloat(OutEntry_addAmt);
        out.Less_Ded_Amt_Tot = parseFloat(SBOutStandingEntry.Less_Ded_Amt_Tot)-parseFloat(OutEntry_lessAmt);
        out.outstanding_balance = parseFloat(SBOutStandingEntry.outstanding_balance)+parseFloat(OutEntry_recAmt)+parseFloat(OutEntry_addAmt)-parseFloat(OutEntry_lessAmt);
        var qry = {_id:SBOutStandingEntry._id};
        // console.log('SB Entry',out);
        outstanding.update(qry,out,function(err){if(err)console.log('SB Entry Error',err)});
    }

    // Oustanding Adjust Amount Entry Delete
    var ObjDel = {};
    ObjDel.del = 'Y';
    ObjDel.delete = new Date();
    outstanding.update(qryOutEntryDel,ObjDel,function(err){if(err)console.log('Out Adjust Entry Del Error',err)});
    res.json({'success':true});
});

router.get('/cashbank_print', ensureAuthenticated, function(req, res){
    cashmast.find({vouc_code:req.query.vouc_code,c_j_s_p:req.query.cjsp,main_bk:"CB",del:"N",srno:{$lt:100},co_code:req.session.compid,div_code:req.session.divid}, function (err,cashmast){
        vouchMast.find({Module:'Cash/Bank',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
            addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},function(err, addlessmast){
                division.findById(req.session.divid, function (err,division){
                    if (err) {
                   console.log(err);
                    } else {
                        res.render('cash_bank_print.hbs',{
                            pageTitle:'Cash Bank Entry Print',
                            cashmast:cashmast,
                            vouchMast:vouchMast,
                            addlessmast:addlessmast,
                            division:division,
                            compnm:req.session.compnm,
                            divnm:req.session.divmast,
                            sdate:req.session.compsdate,
                            edate:req.session.compedate,
                            usrnm:req.session.user,
                            security: req.session.security,
                            administrator:req.session.administrator
                        });
                    }
                });
            }).sort('Add_Less_Parameter_Master_Array.Order');
        })
    }).sort('srno')
    .populate([{path: 'cash_bank_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
    .populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
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