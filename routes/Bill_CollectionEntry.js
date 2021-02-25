const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let BillCollection = require('../models/trans');
let somast = require('../models/pur_order_Schema');
const moment = require('moment-timezone');
// let journalmast = require('../models/trans');
let acmast= require('../models/ac_mast');
let state_master = require('../models/stateSchema');
let city_master = require('../models/citySchema');
let outstanding= require('../models/outstading_schema');
let product = require('../models/fgSchema');
let division = require('../models/divSchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');
let addmast = require('../models/addless_mast_schema');
let lessmast = require('../models/addless_mast_schema');
let addlessmast= require('../models/addless_mast_schema');
let gowdown= require('../models/gowdawnCodeSchema');
let vouchMast= require('../models/vouchSchema');
let bank_details = require('../models/bank_details_Schema');
let db = mongoose.connection;
router.get('/GetBook', ensureAuthenticated, function(req, res){
    console.log(req.query.Module,req.query.c_j_s_p);
    vouchMast.find({Module:req.query.Module,Vo_book:req.query.c_j_s_p,Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
        console.log(vouchMast[0]._id);
        BillCollection.aggregate((
            [{ $match: { c_j_s_p:vouchMast[0].Vo_book,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
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
            console.log(lastEntryNo);
            if(err){
                console.log(err);
            }else{
                var last = 1;
                if(lastEntryNo == '' || lastEntryNo == null || lastEntryNo == [] || lastEntryNo == undefined)res.json({success:true,last:last});
                else res.json({success:true,last:parseInt(lastEntryNo[0]._id._id)+1});
            }
        });
    });
});

router.get('/Bill_CollectionEntry', ensureAuthenticated, function(req, res){
    vouchMast.find({Module:'Bill Collection',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
    // BillCollection.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"BC",del:"N"}, function (err, GaruAavak){
        BillCollection.aggregate((
            [{ $match: { main_bk:"BC",c_j_s_p:vouchMast[0].Vo_book,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
            { $sort: { vouc_code: -1} },
            { $limit :1 },
            { $group:
                {
                    _id: {
                        "_id": "$vouc_code",
                    },
                    lastBank: { $last: "$cash_bank_name" },
                }
            }]
        ),
        function (err, lastEntryNo){
            if (err) {
            console.log(err);
            }else{
                console.log(lastEntryNo);
                    var last = 1;
                    DepositeBank = '';
                    if(lastEntryNo == '' || lastEntryNo == [] || lastEntryNo == null || lastEntryNo == undefined)last=1;
                    else{
                        last = parseInt(lastEntryNo[0]._id._id)+1;
                        DepositeBank = lastEntryNo[0].lastBank;
                        // for(let i=0; i<GaruAavak.length; i++){
                        //     if(GaruAavak[i].cash_bank_name.GroupName.GroupName == 'BANK'){
                        //         DepositeBank = GaruAavak[i].cash_bank_name;
                        //         break;
                        //     }
                        // }
                    }
                    res.render('Bill_CollectionEntry.hbs', {
                        pageTitle:'Bill Collection Entry',
                        last: last,
                        vouchMast:vouchMast,
                        DepositeBank:DepositeBank,
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
    BillCollection.aggregate((
        [{ $match: { main_bk:"BC",c_j_s_p: req.body.c_j_s_p,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
        { $sort: { vouc_code: -1} },
        { $limit :1 },
        { $group:
            {
                _id: {
                    "_id": "$vouc_code",
                },
                lastBank: { $last: "$cash_bank_name" },
            }
        }]
    ),
    async function (err, lastEntryNo){
    var last = 1;
    if(lastEntryNo == '' || lastEntryNo == [] || lastEntryNo == null || lastEntryNo == undefined)last=1;
    else last = parseInt(lastEntryNo[0]._id._id)+1;
    var checkNo = await BillCollection.findOne({vouc_code:req.body.vouc_code,del:'N',main_bk:'BC',c_j_s_p:req.body.c_j_s_p},function(err,aa){}).select('vouc_code');
    if(checkNo == null || checkNo == '')req.body.vouc_code = req.body.vouc_code;
    else req.body.vouc_code = last;

    if(req.body.cash_bank_name=="") req.body.cash_bank_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.Drawee_Bank=="") req.body.Drawee_Bank=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var cash_date = req.body.cash_date;
    var DateObject =  moment(cash_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var sodatemilisecond = DateObject.format('x');
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        var vouc;
        var cjsp;
        var Lent = parseInt(req.body.cashtrn.length)-1;
        var checklen = -1;
        var print = true;
        for(var i = 0; i<req.body.cashtrn.length; i++)
        {
            if(req.body.cashac_name[i]=="") req.body.cashac_name[i]=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.broker_Code[i]=="") req.body.broker_Code[i]=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                let cash_bank = new BillCollection();
                cash_bank.srno = i;
                cash_bank.main_bk = "BC";
                cash_bank.d_c = "C";
                cash_bank.c_j_s_p = req.body.c_j_s_p;
                cash_bank.vouc_code = req.body.vouc_code;
                cash_bank.cash_date = DateObject;
                cash_bank.cash_edatemilisecond = sodatemilisecond;
                vouc = req.body.vouc_code;
                cjsp = req.body.c_j_s_p;
                // cash_bank.cBill_No = req.body.cBill_No;
                // cash_bank.cash_type = req.body.cash_type;
                cash_bank.cash_bank_name = req.body.cash_bank_name;  
                // cash_bank.Chgs = req.body.Chgs;
                // cash_bank.Bal = req.body.Bal; 
                // cash_bank.Adjusted = req.body.Adjusted;   
                cash_bank.del = "N";
                cash_bank.CNCL = "N";
                cash_bank.entrydate = new Date();
                cash_bank.Bill_No = req.body.Bill_No[i];
                    var date = req.body.Date[i];
                    var Obj =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                    var Datemilisecond = Obj.format('x');
                cash_bank.Date = Obj;
                cash_bank.Datemilisecond = Datemilisecond;
                cash_bank.cashac_name = req.body.cashac_name[i];
                cash_bank.place = req.body.place[i];
                cash_bank.broker_Code = req.body.broker_Code[i];
                
                // if(req.body.Cheq_Amount >0)cash_bank.cash_amount = req.body.Cheq_Amount;
                // if(req.body.tot_Cash_Amount >0)cash_bank.cash_amount = req.body.tot_Cash_Amount;
                
                cash_bank.Bill_Amt    = req.body.Bill_Amt[i];
                cash_bank.Amt_Settled = req.body.Amt_Settled[i];

                cash_bank.Balance_Due = req.body.Balance_Due[i];
                // cash_bank.Int_Due = req.body.Int_Due[i];
                // cash_bank.Bal_Int = req.body.Bal_Int[i];
                if(req.body.Cheq_Amount == '' || req.body.Cheq_Amount == null)req.body.Cheq_Amount = 0;
                cash_bank.Cheq_Amt = req.body.Cheq_Amount;
                if(req.body.tot_Cash_Amount == '' || req.body.tot_Cash_Amount == null)req.body.tot_Cash_Amount = 0;
                cash_bank.Cash_Amt = req.body.tot_Cash_Amount;

                cash_bank.Days = req.body.Days[i];
                cash_bank.Int_Per = req.body.Int_Per[i];
                if(req.body.Intrest[i] == '' || req.body.Intrest[i] == null)req.body.Intrest[i] = 0;
                cash_bank.Intrest = req.body.Intrest[i];
                if(req.body.discount[i] == '' || req.body.discount[i] == null)req.body.discount[i] = 0;
                cash_bank.discount = req.body.discount[i];
                if(req.body.CRChgs[i] == '' || req.body.CRChgs[i] == null)req.body.CRChgs[i] = 0;
                cash_bank.CRChgs = req.body.CRChgs[i];
                if(req.body.Chithi[i] == '' || req.body.Chithi[i] == null)req.body.Chithi[i] = 0;
                cash_bank.Chithi = req.body.Chithi[i];
                var dedAmt = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])-parseFloat(req.body.discount[i]);
                var outAmt = parseFloat(req.body.Amt_Settled[i])-parseFloat(dedAmt);
                cash_bank.Amount_Deduction = dedAmt.toFixed(2);
                cash_bank.cash_amount = outAmt.toFixed(2);
                
                cash_bank.Kasar= req.body.Kasar[i];
                cash_bank.totcash_amt = req.body.tot_Amt;
                cash_bank.Drawee_Bank = req.body.Drawee_Bank;
                cash_bank.draw_branch = req.body.draw_branch;
                cash_bank.Chq_No = req.body.Chq_No;
                

                var cdate = req.body.chq_date;
                var cObj =  moment(cdate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var chq_datemilisecond = cObj.format('x');
                cash_bank.chq_date = cObj;
                cash_bank.chq_datemilisecond = chq_datemilisecond;

                var ddate = req.body.deposit_date;
                var dObj =  moment(ddate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var Datemilisecond = dObj.format('x');
                cash_bank.deposit_date = dObj;
                cash_bank.deposit_datemilisecond = Datemilisecond;
                
                cash_bank.cash_remarks = req.body.cash_remarks;
                cash_bank.co_code = req.session.compid;
                cash_bank.div_code = req.session.divid;
                cash_bank.usrnm = req.session.user;
                cash_bank.masterid = req.session.masterid
                
                cash_bank.cash_narrone = 'Invoice No'+req.body.Bill_No[i];
                cash_bank.cash_narrtwo = req.body.cash_remarks;

                cash_bank.op_main_bk = req.body.op_main_bk[i];
                cash_bank.op_c_j_s_p = req.body.op_c_j_s_p[i];
                cash_bank.op_co_code = req.body.op_co_code[i];
                cash_bank.op_div_code = req.body.op_div_code[i];

                cash_bank.Chaq_Return          = 'N';
                
                cash_bank.save(function (err){
                    if(err)console.log(err)
                    else{
                        console.log('Success')
                            checklen = checklen+1;
                    }
                });

                let out = new outstanding();
                    out.BillColl_id = cash_bank._id; //trans scema fetech id
                    out.main_bk = "BC";
                    out.d_c = "C";
                    out.OS_Type = 'A';
                    out.vouc_code = req.body.Bill_No[i];
                    var date = req.body.Date[i];
                    var Obj =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                    var Datemilisecond = Obj.format('x');
                    out.cash_date = Obj;
                    out.cash_edatemilisecond = Datemilisecond;

                    out.c_j_s_p = req.body.c_j_s_p;
                    out.cashac_name = req.body.cashac_name[i];
                    out.cash_bank_name = req.body.cash_bank_name;
                    // out.sl_Person = req.body.sl_Person;
                    out.broker_Code = req.body.broker_Code[i];
                    out.cash_narrone = 'Invoice No'+req.body.Bill_No[i];
                    out.cash_narrtwo = req.body.cash_remarks;
                    // out.cash_type = req.body.cash_type;
                    out.del = "N";
                    out.CNCL = "N";
                    out.entrydate = new Date();
                    // out.cr_Days = req.body.cr_Days;
                    // out.due_On = req.body.due_On;
                    // out.ac_intrestper = intrate;
                    out.Kasar = req.body.Kasar[i];
                    out.Int_Per = req.body.Int_Per[i];
                    if(req.body.Intrest[i] == '' || req.body.Intrest[i] == null)req.body.Intrest[i] = 0;
                    out.Intrest = req.body.Intrest[i];
                    if(req.body.discount[i] == '' || req.body.discount[i] == null)req.body.discount[i] = 0;
                    out.discount= req.body.discount[i];
                    if(req.body.CRChgs[i] == '' || req.body.CRChgs[i] == null)req.body.CRChgs[i] = 0;
                    out.CRChgs = req.body.CRChgs[i];
                    if(req.body.Chithi[i] == '' || req.body.Chithi[i] == null)req.body.Chithi[i] = 0;
                    out.Chithi = req.body.Chithi[i];
                    var dedAmt = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])-parseFloat(req.body.discount[i]);
                    var outAmt = parseFloat(req.body.Amt_Settled[i])-parseFloat(dedAmt);
                    out.outstanding_amount = outAmt.toFixed(2);
                    out.Add_Ded_Amt_Tot = parseFloat(req.body.discount[i]);
                    out.Less_Ded_Amt_Tot = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])
                    out.Amount_Deduction = dedAmt.toFixed(2);

                    out.Bill_Amount = req.body.Bill_Amt[i];
                    out.Rec_Amount  = req.body.Amt_Settled[i];
                    out.outstanding_balance = 0;
                    out.cash_amount = req.body.Amt_Settled[i];
                    out.cash_remarks = req.body.cash_remarks;
                    
                    out.co_code = req.session.compid;
                    out.div_code = req.session.divid;
                    out.usrnm = req.session.user;
                    out.masterid = req.session.masterid;

                    out.op_main_bk = req.body.op_main_bk[i];
                    out.op_c_j_s_p = req.body.op_c_j_s_p[i];
                    out.op_co_code = req.body.op_co_code[i];
                    out.op_div_code = req.body.op_div_code[i];
                    // console.log(req.body.op_c_j_s_p[i]);
                    out.save();
        }
        for(let j=0; j<req.body.cashtrn.length; j++){
            if(parseFloat(req.body.Amt_Settled[j]) > 0){
                if(req.body.Intrest[j] == '' || req.body.Intrest[j] == null)req.body.Intrest[j] = 0;
                if(req.body.discount[j] == '' || req.body.discount[j] == null)req.body.discount[j] = 0;
                if(req.body.CRChgs[j] == '' || req.body.CRChgs[j] == null)req.body.CRChgs[j] = 0;
                if(req.body.Chithi[j] == '' || req.body.Chithi[j] == null)req.body.Chithi[j] = 0;
                var Amt_Deduction = parseFloat(req.body.Intrest[j])+parseFloat(req.body.Chithi[j])+parseFloat(req.body.CRChgs[j])-parseFloat(req.body.discount[j]);
                var dedAmt = parseFloat(req.body.Intrest[j])+parseFloat(req.body.Chithi[j])+parseFloat(req.body.CRChgs[j])-parseFloat(req.body.discount[j]);
                var recamt = parseFloat(req.body.Amt_Settled[j])-parseFloat(dedAmt);
                var LessdedAmt = parseFloat(req.body.Intrest[j])+parseFloat(req.body.Chithi[j])+parseFloat(req.body.CRChgs[j]);
                // console.log('Rec Amount',req.body.Bill_No[j],req.body.op_c_j_s_p[j],req.body.op_co_code[j],req.body.op_div_code[j]);
                var outstand = await outstanding.findOne({vouc_code:req.body.Bill_No[j],$or:[{main_bk:'SB'},{main_bk:'OPOS'}],$or:[{c_j_s_p:req.body.op_c_j_s_p[j]},{c_j_s_p:'SB'}],co_code:req.body.op_co_code[j],div_code:req.body.op_div_code[j],del:'N',CNCL:'N'}, function(err, out_statnding) {})
                    // console.log(outstand)
                    let out = {}
                    out.Rec_Amount = parseFloat(outstand.Rec_Amount)+parseFloat(recamt);
                    out.Add_Ded_Amt_Tot = parseFloat(outstand.Add_Ded_Amt_Tot)+parseFloat(req.body.discount[j]);
                    out.Less_Ded_Amt_Tot = parseFloat(outstand.Less_Ded_Amt_Tot)+parseFloat(LessdedAmt);
                    out.Amount_Deduction = parseFloat(outstand.Amount_Deduction)+parseFloat(Amt_Deduction);
                    out.outstanding_balance = parseFloat(outstand.outstanding_balance)-parseFloat(recamt);
                    // console.log('Tot Rec Amount',out);
                    var qry = {_id:outstand._id};
                    outstanding.update(qry,out,function (err) {});
            }
        }
        setInterval(function(){ 
            if(print == true){
                print = false;
                if(Lent == checklen){
                    res.redirect('/Bill_CollectionEntry/Bill_CollectionPrint?vouc_code='+vouc+'&cjsp='+cjsp+'&PrintBillCollection=Print');
                }
                print = false;
            }
        }, 500);
    // res.send("<script>window.location.href = '/Bill_CollectionEntry/Bill_CollectionPrint?vouc_code="+vouc+"&amp;cjsp="+cjsp+"'</script>");
    }
});
});

router.get('/Bill_CollectionEntry_List', ensureAuthenticated ,function(req,res){
    bank_details.find({del:"N"}, function (err, bank_details) {
    BillCollection.aggregate([{ $match: { main_bk:"BC",co_code: req.session.compid,div_code:req.session.divid,del:'N'}},
        { $group : {
        _id:{
            "vouc_code": "$vouc_code",
            "main_bk": "$main_bk",
            "c_j_s_p": "$c_j_s_p",
            "cash_type": "$cash_type",
            "cash_bank_name": "$cash_bank_name",
            "cash_date":"$cash_date",
            "cash_remarks":"$cash_remarks",
            "deposit_date":"$deposit_date",
            "Chq_No":'$Chq_No',
            "Cheq_Amt":"$Cheq_Amt",
            "Cash_Amt":'$Cash_Amt',
            "Drawee_Bank":'$Drawee_Bank'
        }}, } ], function (err, cashmast){
        Gs_master.findOne({group: 'CASH AND BANK'},function (err, gs_master){
            var qryGs = [];
            for(let i=0; i<gs_master.garry.length; i++){
                qryGs.push(gs_master.garry[i])
            }
            Account_master.find({masterid:req.session.masterid,GroupName :{ $in : qryGs },del:"N"}, function (err,accname){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    res.render('Bill_CollectionEntry_List.hbs',{
                        pageTitle:'Bill Collection List',
                        cashmast: cashmast,
                        bank_details:bank_details,
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
        });
    });
    });
});
  
router.get('/Bill_CollectionPrint', ensureAuthenticated, function(req, res){
    // console.log('261',req.query.vouc_code,req.query.cjsp)
    BillCollection.find({vouc_code:req.query.vouc_code,c_j_s_p:req.query.cjsp,main_bk:"BC",del:"N"}, function (err,cashmast){
        division.findById(req.session.divid,function(err,div){
        if (err) {
            console.log(err);
        } else {
        res.render('Bill_CollectionPrint.hbs',{
            pageTitle:'Bill Collection Print',
            cashmast:cashmast,
            compnm:req.session.compnm,
            div:div,
            divnm:req.session.divmast,
            sdate: req.session.compsdate,
            edate:req.session.compedate,
            usrnm:req.session.user,
            security: req.session.security,
            administrator:req.session.administrator
        });
    }
})
}).populate('cash_bank_name').populate('broker_Code')
.populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
.populate('Drawee_Bank');
});

router.get('/Bill_CollectionUpdate', ensureAuthenticated, function(req, res){
    BillCollection.find({vouc_code:req.query.vouc_code,c_j_s_p:req.query.c_j_s_p,main_bk:"BC",del:"N"}, function (err,cashmast){
        vouchMast.find({Module:'Bill Collection',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
                  if (err) {
               console.log(err);
           } else {
               var length = cashmast.length
               //    console.log(length);
                  console.log(cashmast);
               res.render('Bill_CollectionUpdate.hbs',{
                   pageTitle:'Update Bill Collection',
                   cashmast:cashmast,
                   length:length,
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
        })
   }).populate('cash_bank_name').populate('cashac_name').populate('broker_Code').populate('Drawee_Bank')
});

router.post('/update',async function(req, res){
    if(req.body.cash_bank_name=="") req.body.cash_bank_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.Drawee_Bank=="") req.body.Drawee_Bank=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var cash_date = req.body.cash_date;
    var DateObject =  moment(cash_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var sodatemilisecond = DateObject.format('x');
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        for(var i = 0; i<req.body.cashtrn.length; i++){
            if(req.body.BillColl_Id[i] == null || req.body.BillColl_Id[i] == '' || req.body.BillColl_Id[i] == undefined){
                if(req.body.cashac_name[i]=="") req.body.cashac_name[i]=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.broker_Code[i]=="") req.body.broker_Code[i]=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                    let cash_bank = new BillCollection();
                    cash_bank.srno = i;
                    cash_bank.main_bk = "BC";
                    cash_bank.d_c ="C";
                    cash_bank.c_j_s_p = req.body.c_j_s_p;
                    cash_bank.vouc_code = req.body.vouc_code;
                    cash_bank.cash_date = DateObject;
                    cash_bank.cash_edatemilisecond = sodatemilisecond;
                    vouc = req.body.vouc_code;
                    cjsp = req.body.c_j_s_p;
                    // cash_bank.cBill_No = req.body.cBill_No;
                    // cash_bank.cash_type = req.body.cash_type;
                    cash_bank.cash_bank_name = req.body.cash_bank_name;  
                    // cash_bank.Chgs = req.body.Chgs;
                    // cash_bank.Bal = req.body.Bal; 
                    // cash_bank.Adjusted = req.body.Adjusted;   
                    cash_bank.del = "N";
                    cash_bank.CNCL = "N";
                    cash_bank.entrydate = new Date();
                    cash_bank.Bill_No = req.body.Bill_No[i];
                        var date = req.body.Date[i];
                        var Obj =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                        var Datemilisecond = Obj.format('x');
                    cash_bank.Date = Obj;
                    cash_bank.Datemilisecond = Datemilisecond;
                    cash_bank.cashac_name = req.body.cashac_name[i];
                   //loki
                    // console.log(cash_bank.cashac_name);
                    cash_bank.place = req.body.place[i];
                    cash_bank.broker_Code = req.body.broker_Code[i];
                    
                    // if(req.body.Cheq_Amount >0)cash_bank.cash_amount = req.body.Cheq_Amount;
                    // if(req.body.tot_Cash_Amount >0)cash_bank.cash_amount = req.body.tot_Cash_Amount;
                    
                    cash_bank.Bill_Amt    = req.body.Bill_Amt[i];
                    cash_bank.Amt_Settled = req.body.Amt_Settled[i];

                    cash_bank.Balance_Due = req.body.Balance_Due[i];
                    // cash_bank.Int_Due = req.body.Int_Due[i];
                    // cash_bank.Bal_Int = req.body.Bal_Int[i];
                    if(req.body.Cheq_Amount == '' || req.body.Cheq_Amount == null)req.body.Cheq_Amount = 0;
                    cash_bank.Cheq_Amt = req.body.Cheq_Amount;
                    if(req.body.tot_Cash_Amount == '' || req.body.tot_Cash_Amount == null)req.body.tot_Cash_Amount = 0;
                    cash_bank.Cash_Amt = req.body.tot_Cash_Amount;

                    cash_bank.Days = req.body.Days[i];
                    cash_bank.Int_Per = req.body.Int_Per[i];
                    if(req.body.Intrest[i] == '' || req.body.Intrest[i] == null)req.body.Intrest[i] = 0;
                    cash_bank.Intrest = req.body.Intrest[i];
                    if(req.body.discount[i] == '' || req.body.discount[i] == null)req.body.discount[i] = 0;
                    cash_bank.discount = req.body.discount[i];
                    if(req.body.CRChgs[i] == '' || req.body.CRChgs[i] == null)req.body.CRChgs[i] = 0;
                    cash_bank.CRChgs = req.body.CRChgs[i];
                    if(req.body.Chithi[i] == '' || req.body.Chithi[i] == null)req.body.Chithi[i] = 0;
                    cash_bank.Chithi = req.body.Chithi[i];
                    var dedAmt = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])-parseFloat(req.body.discount[i]);
                    var outAmt = parseFloat(req.body.Amt_Settled[i])-parseFloat(dedAmt);
                    cash_bank.Amount_Deduction = dedAmt.toFixed(2);
                    cash_bank.cash_amount = outAmt.toFixed(2);
                    
                    cash_bank.Kasar= req.body.Kasar[i];
                    cash_bank.totcash_amt = req.body.tot_Amt;
                    cash_bank.Drawee_Bank = req.body.Drawee_Bank;
                    cash_bank.draw_branch = req.body.draw_branch;
                    cash_bank.Chq_No = req.body.Chq_No;
                    

                    var cdate = req.body.chq_date;
                    var cObj =  moment(cdate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                    var chq_datemilisecond = cObj.format('x');
                    cash_bank.chq_date = cObj;
                    cash_bank.chq_datemilisecond = chq_datemilisecond;

                    var ddate = req.body.deposit_date;
                    var dObj =  moment(ddate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                    var Datemilisecond = dObj.format('x');
                    cash_bank.deposit_date = dObj;
                    cash_bank.deposit_datemilisecond = Datemilisecond;
                    
                    cash_bank.cash_remarks = req.body.cash_remarks;
                    cash_bank.co_code = req.session.compid;
                    cash_bank.div_code = req.session.divid;
                    cash_bank.usrnm = req.session.user;
                    cash_bank.masterid = req.session.masterid
                    
                    cash_bank.cash_narrone = 'Invoice No'+req.body.Bill_No[i];
                    cash_bank.cash_narrtwo = req.body.cash_remarks;
                    
                    cash_bank.save(function (err){
                        if(err)console.log(err)
                        else{
                            console.log('Success')
                        }
                    });
    
                    let out = new outstanding();
                    out.BillColl_id = cash_bank._id; //trans scema fetech id
                    out.main_bk = "BC";
                    out.d_c ="C";
                    out.OS_Type = 'A';
                    out.vouc_code = req.body.Bill_No[i];
                    var date = req.body.Date[i];
                    var Obj =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                    var Datemilisecond = Obj.format('x');
                    out.cash_date = Obj;
                    out.cash_edatemilisecond = Datemilisecond;

                    out.c_j_s_p = req.body.c_j_s_p;
                    out.cashac_name = req.body.cashac_name[i];
                    out.cash_bank_name = req.body.cash_bank_name;
                    // out.sl_Person = req.body.sl_Person;
                    out.broker_Code = req.body.broker_Code[i];
                    out.cash_narrone = 'Invoice No'+req.body.Bill_No[i];
                    out.cash_narrtwo = req.body.cash_remarks;
                    // out.cash_type = req.body.cash_type;
                    out.del = "N";
                    out.CNCL = "N";
                    out.entrydate = new Date();
                    // out.cr_Days = req.body.cr_Days;
                    // out.due_On = req.body.due_On;
                    // out.ac_intrestper = intrate;
                    out.Kasar = req.body.Kasar[i];
                    out.Int_Per = req.body.Int_Per[i];
                    if(req.body.Intrest[i] == '' || req.body.Intrest[i] == null)req.body.Intrest[i] = 0;
                    out.Intrest = req.body.Intrest[i];
                    if(req.body.discount[i] == '' || req.body.discount[i] == null)req.body.discount[i] = 0;
                    out.discount= req.body.discount[i];
                    if(req.body.CRChgs[i] == '' || req.body.CRChgs[i] == null)req.body.CRChgs[i] = 0;
                    out.CRChgs = req.body.CRChgs[i];
                    if(req.body.Chithi[i] == '' || req.body.Chithi[i] == null)req.body.Chithi[i] = 0;
                    out.Chithi = req.body.Chithi[i];
                    var dedAmt = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])-parseFloat(req.body.discount[i]);
                    var outAmt = parseFloat(req.body.Amt_Settled[i])-parseFloat(dedAmt);
                    out.outstanding_amount = outAmt.toFixed(2);
                    out.Amount_Deduction = dedAmt.toFixed(2);
                    out.Add_Ded_Amt_Tot = parseFloat(req.body.discount[i]);
                    out.Less_Ded_Amt_Tot = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])

                    out.Bill_Amount = req.body.Bill_Amt[i];
                    out.Rec_Amount  = req.body.Amt_Settled[i];
                    out.outstanding_balance = 0;
                    out.cash_amount = req.body.Amt_Settled[i];
                    out.cash_remarks = req.body.cash_remarks;
                    // out.outstanding_amount = req.body.Amt_Settled[i];
                    // if(req.body.Cheq_Amount == '' || req.body.Cheq_Amount == null)req.body.Cheq_Amount =0;
                    // if(req.body.Cheq_Amount >0)out.cash_amount = req.body.Cheq_Amount;
                    // if(req.body.tot_Cash_Amount == '' || req.body.tot_Cash_Amount == null)req.body.tot_Cash_Amount =0;
                    // if(req.body.tot_Cash_Amount >0)out.cash_amount = req.body.tot_Cash_Amount;
                    // out.outstanding_amount = req.body.Cheq_Amount;
                    // out.outstanding_amount = req.body.tot_Cash_Amount;
                    cash_bank.op_main_bk = req.body.op_main_bk[i];
                    cash_bank.op_c_j_s_p = req.body.op_c_j_s_p[i];
                    cash_bank.op_co_code = req.body.op_co_code[i];
                    cash_bank.op_div_code = req.body.op_div_code[i];

                    out.co_code = req.session.compid;
                    out.div_code = req.session.divid;
                    out.usrnm = req.session.user;
                    out.masterid = req.session.masterid;

                    out.op_main_bk = req.body.op_main_bk[i];
                    out.op_c_j_s_p = req.body.op_c_j_s_p[i];
                    out.op_co_code = req.body.op_co_code[i];
                    out.op_div_code = req.body.op_div_code[i];
                    out.save();
            }else{
            if(req.body.cashac_name[i]=="") req.body.cashac_name[i]=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.broker_Code[i]=="") req.body.broker_Code[i]=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                let cash_bank = {};
                cash_bank.srno = i;
                cash_bank.main_bk = "BC";
                cash_bank.d_c ="C";
                cash_bank.c_j_s_p = req.body.c_j_s_p;
                cash_bank.vouc_code = req.body.vouc_code;
                cash_bank.cash_date = DateObject;
                cash_bank.cash_edatemilisecond = sodatemilisecond;
                vouc = req.body.vouc_code;
                cjsp = req.body.c_j_s_p;
                // cash_bank.cBill_No = req.body.cBill_No;
                // cash_bank.cash_type = req.body.cash_type;
                cash_bank.cash_bank_name = req.body.cash_bank_name;  
                // cash_bank.Chgs = req.body.Chgs;
                // cash_bank.Bal = req.body.Bal; 
                // cash_bank.Adjusted = req.body.Adjusted;   
                cash_bank.del = "N";
                cash_bank.CNCL = "N";
                cash_bank.entrydate = new Date();
                cash_bank.Bill_No = req.body.Bill_No[i];
                    var date = req.body.Date[i];
                    var Obj =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                    var Datemilisecond = Obj.format('x');
                cash_bank.Date = Obj;
                cash_bank.Datemilisecond = Datemilisecond;
                cash_bank.cashac_name = req.body.cashac_name[i];
                cash_bank.place = req.body.place[i];
                cash_bank.broker_Code = req.body.broker_Code[i];
                
                // if(req.body.Cheq_Amount >0)cash_bank.cash_amount = req.body.Cheq_Amount;
                // if(req.body.tot_Cash_Amount >0)cash_bank.cash_amount = req.body.tot_Cash_Amount;
                
                cash_bank.Bill_Amt    = req.body.Bill_Amt[i];
                cash_bank.Amt_Settled = req.body.Amt_Settled[i];

                cash_bank.Balance_Due = req.body.Balance_Due[i];
                // cash_bank.Int_Due = req.body.Int_Due[i];
                // cash_bank.Bal_Int = req.body.Bal_Int[i];
                if(req.body.Cheq_Amount == '' || req.body.Cheq_Amount == null)req.body.Cheq_Amount = 0;
                cash_bank.Cheq_Amt = req.body.Cheq_Amount;
                if(req.body.tot_Cash_Amount == '' || req.body.tot_Cash_Amount == null)req.body.tot_Cash_Amount = 0;
                cash_bank.Cash_Amt = req.body.tot_Cash_Amount;

                cash_bank.Days = req.body.Days[i];
                cash_bank.Int_Per = req.body.Int_Per[i];
                if(req.body.Intrest[i] == '' || req.body.Intrest[i] == null)req.body.Intrest[i] = 0;
                cash_bank.Intrest = req.body.Intrest[i];
                if(req.body.discount[i] == '' || req.body.discount[i] == null)req.body.discount[i] = 0;
                cash_bank.discount = req.body.discount[i];
                if(req.body.CRChgs[i] == '' || req.body.CRChgs[i] == null)req.body.CRChgs[i] = 0;
                cash_bank.CRChgs = req.body.CRChgs[i];
                if(req.body.Chithi[i] == '' || req.body.Chithi[i] == null)req.body.Chithi[i] = 0;
                cash_bank.Chithi = req.body.Chithi[i];
                var dedAmt = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])-parseFloat(req.body.discount[i]);
                var outAmt = parseFloat(req.body.Amt_Settled[i])-parseFloat(dedAmt);
                cash_bank.Amount_Deduction = dedAmt.toFixed(2);
                cash_bank.cash_amount = outAmt.toFixed(2);
                
                cash_bank.Kasar= req.body.Kasar[i];
                cash_bank.totcash_amt = req.body.tot_Amt;
                cash_bank.Drawee_Bank = req.body.Drawee_Bank;
                cash_bank.draw_branch = req.body.draw_branch;
                cash_bank.Chq_No = req.body.Chq_No;
                

                var cdate = req.body.chq_date;
                var cObj =  moment(cdate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var chq_datemilisecond = cObj.format('x');
                cash_bank.chq_date = cObj;
                cash_bank.chq_datemilisecond = chq_datemilisecond;

                var ddate = req.body.deposit_date;
                var dObj =  moment(ddate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var Datemilisecond = dObj.format('x');
                cash_bank.deposit_date = dObj;
                cash_bank.deposit_datemilisecond = Datemilisecond;
                
                cash_bank.cash_remarks = req.body.cash_remarks;
                cash_bank.co_code = req.session.compid;
                cash_bank.div_code = req.session.divid;
                cash_bank.usrnm = req.session.user;
                cash_bank.masterid = req.session.masterid
                
                cash_bank.cash_narrone = 'Invoice No'+req.body.Bill_No[i];
                cash_bank.cash_narrtwo = req.body.cash_remarks;

                cash_bank.op_main_bk = req.body.op_main_bk[i];
                cash_bank.op_c_j_s_p = req.body.op_c_j_s_p[i];
                cash_bank.op_co_code = req.body.op_co_code[i];
                cash_bank.op_div_code = req.body.op_div_code[i];

                var query = {_id:req.body.BillColl_Id[i]}
                BillCollection.update(query,cash_bank,function (err){
                    if(err)console.log(err)
                    else{console.log('Success')}
                });

                let out = {};
                    out.BillColl_id = req.body.BillColl_Id[i]; //trans scema fetech id
                    out.main_bk = "BC";
                    out.d_c ="C";
                    out.vouc_code = req.body.Bill_No[i];
                    var date = req.body.Date[i];
                    var Obj =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                    var Datemilisecond = Obj.format('x');
                    out.cash_date = Obj;
                    out.cash_edatemilisecond = Datemilisecond;

                    out.c_j_s_p = req.body.c_j_s_p;
                    out.cashac_name = req.body.cashac_name[i];
                    out.cash_bank_name = req.body.cash_bank_name;
                    // out.sl_Person = req.body.sl_Person;
                    out.broker_Code = req.body.broker_Code[i];
                    out.cash_narrone = 'Invoice No'+req.body.Bill_No[i];
                    out.cash_narrtwo = req.body.cash_remarks;
                    // out.cash_type = req.body.cash_type;
                    out.del = "N";
                    out.CNCL = "N";
                    out.entrydate = new Date();
                    // out.cr_Days = req.body.cr_Days;
                    // out.due_On = req.body.due_On;
                    // out.ac_intrestper = intrate;
                    out.Kasar = req.body.Kasar[i];
                    out.Int_Per = req.body.Int_Per[i];
                    if(req.body.Intrest[i] == '' || req.body.Intrest[i] == null)req.body.Intrest[i] = 0;
                    out.Intrest = req.body.Intrest[i];
                    if(req.body.discount[i] == '' || req.body.discount[i] == null)req.body.discount[i] = 0;
                    out.discount= req.body.discount[i];
                    if(req.body.CRChgs[i] == '' || req.body.CRChgs[i] == null)req.body.CRChgs[i] = 0;
                    out.CRChgs = req.body.CRChgs[i];
                    if(req.body.Chithi[i] == '' || req.body.Chithi[i] == null)req.body.Chithi[i] = 0;
                    out.Chithi = req.body.Chithi[i];
                    var dedAmt = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])-parseFloat(req.body.discount[i]);
                    var outAmt = parseFloat(req.body.Amt_Settled[i])-parseFloat(dedAmt);
                    out.outstanding_amount = outAmt.toFixed(2);
                    out.Amount_Deduction = dedAmt.toFixed(2);
                    out.Add_Ded_Amt_Tot = parseFloat(req.body.discount[i]);
                    out.Less_Ded_Amt_Tot = parseFloat(req.body.Intrest[i])+parseFloat(req.body.Chithi[i])+parseFloat(req.body.CRChgs[i])

                    out.Bill_Amount = req.body.Bill_Amt[i];
                    out.Rec_Amount  = req.body.Amt_Settled[i];
                    out.outstanding_balance = 0;
                    out.cash_amount = req.body.Amt_Settled[i];
                    out.cash_remarks = req.body.cash_remarks;

                    // out.outstanding_amount = req.body.Amt_Settled[i];
                    // if(req.body.Cheq_Amount == '' || req.body.Cheq_Amount == null)req.body.Cheq_Amount =0;
                    // if(req.body.Cheq_Amount >0)out.cash_amount = req.body.Cheq_Amount;
                    // if(req.body.tot_Cash_Amount == '' || req.body.tot_Cash_Amount == null)req.body.tot_Cash_Amount =0;
                    // if(req.body.tot_Cash_Amount >0)out.cash_amount = req.body.tot_Cash_Amount;
                    // out.outstanding_amount = req.body.Cheq_Amount;
                    // out.outstanding_amount = req.body.tot_Cash_Amount;

                    out.co_code = req.session.compid;
                    out.div_code = req.session.divid;
                    out.usrnm = req.session.user;
                    out.masterid = req.session.masterid;

                    out.op_main_bk = req.body.op_main_bk[i];
                    out.op_c_j_s_p = req.body.op_c_j_s_p[i];
                    out.op_co_code = req.body.op_co_code[i];
                    out.op_div_code = req.body.op_div_code[i];
                    
                    var outstand = await outstanding.findOne({BillColl_id:req.body.BillColl_Id[i]}, function(err, out_statnding) {})
                    var updateOut = await outstanding.findOne({vouc_code:req.body.Bill_No[i],main_bk:req.body.op_main_bk[i],c_j_s_p:req.body.op_c_j_s_p[i],co_code:req.body.op_co_code[i],div_code:req.body.op_div_code[i],del:'N',CNCL:'N'},function(err){});
                    let outup = {};
                    outup.Rec_Amount = parseFloat(updateOut.Rec_Amount)-parseFloat(outstand.Rec_Amount);
                    outup.Add_Ded_Amt_Tot = parseFloat(outstand.Add_Ded_Amt_Tot)-parseFloat(outstand.Add_Ded_Amt_Tot);
                    outup.Less_Ded_Amt_Tot = parseFloat(outstand.Less_Ded_Amt_Tot)-parseFloat(outstand.Less_Ded_Amt_Tot);
                    outup.Amount_Deduction = parseFloat(updateOut.Amount_Deduction)-parseFloat(outstand.Amount_Deduction);
                    outup.outstanding_balance = parseFloat(updateOut.outstanding_balance)+parseFloat(outstand.Rec_Amount);
                    console.log(outup)
                    var qry = {_id:updateOut._id};
                    outstanding.update(qry,outup,function(err){});
                    
                    var queryOut = {BillColl_id:req.body.BillColl_Id[i]}
                    outstanding.update(queryOut,out,function (err){
                        if(err)console.log(err)
                        else{console.log('Success')}
                    });
                }
        }
        for(let j=0; j<req.body.cashtrn.length; j++){
            if(parseFloat(req.body.Amt_Settled[j]) > 0){
                if(req.body.Intrest[j] == '' || req.body.Intrest[j] == null)req.body.Intrest[j] = 0;
                if(req.body.discount[j] == '' || req.body.discount[j] == null)req.body.discount[j] = 0;
                if(req.body.CRChgs[j] == '' || req.body.CRChgs[j] == null)req.body.CRChgs[j] = 0;
                if(req.body.Chithi[j] == '' || req.body.Chithi[j] == null)req.body.Chithi[j] = 0;
                var Amt_Deduction = parseFloat(req.body.Intrest[j])+parseFloat(req.body.Chithi[j])+parseFloat(req.body.CRChgs[j])-parseFloat(req.body.discount[j]);
                var LessdedAmt = parseFloat(req.body.Intrest[j])+parseFloat(req.body.Chithi[j])+parseFloat(req.body.CRChgs[j])
                var recamt = parseFloat(req.body.Amt_Settled[j])-parseFloat(Amt_Deduction);
                console.log('Rec Amount',recamt);
                var outstand = await outstanding.findOne({vouc_code:req.body.Bill_No[j],main_bk:req.body.op_main_bk[j],c_j_s_p:req.body.op_c_j_s_p[j],co_code:req.body.op_co_code[j],div_code:req.body.op_div_code[j],del:'N',CNCL:'N'}, function(err, out_statnding) {})
                    let out ={}
                    out.Rec_Amount = parseFloat(outstand.Rec_Amount)+parseFloat(recamt);
                    out.Add_Ded_Amt_Tot = parseFloat(outstand.Add_Ded_Amt_Tot)+parseFloat(req.body.discount[j]);
                    out.Less_Ded_Amt_Tot = parseFloat(outstand.Less_Ded_Amt_Tot)+parseFloat(LessdedAmt);
                    out.Amount_Deduction = parseFloat(outstand.Amount_Deduction)+parseFloat(Amt_Deduction);
                    out.outstanding_balance = parseFloat(outstand.outstanding_balance)-parseFloat(recamt);
                    // console.log('Tot Rec Amount',out);
                    var qry = {_id:outstand._id};
                    outstanding.update(qry,out,function (err) {});
            }
        }
        res.redirect('/Bill_CollectionEntry/Bill_CollectionEntry_List');
    }
});

router.get('/GetBillCollectionModal', function (req, res) {
    division.findById(req.session.divid,function(err,div){
    var BillNo =  req.query.BillNo;
    outstanding.find({vouc_code:BillNo,div_code:req.session.divid,co_code:req.session.compid,masterid:req.session.masterid,$or:[{main_bk:'SB'},{main_bk:'OPOS'}],del:"N",CNCL:'N'}, function(err, garu){
        if(garu == null || garu == '' || garu == []){
            res.json({ 'success': false});
        }else{
            var qryGs = [];
            for(let g=0; g<garu.length; g++){
                qryGs.push(garu[g].cashac_name._id);
            }
            outstanding.find({$and:[{outstanding_balance:{$gt:0}}],$or:[{main_bk:'SB'},{main_bk:'OPOS'}],cashac_name :{ $in : qryGs },div_code:req.session.divid,co_code:req.session.compid,del:"N",CNCL:'N'}, function(err, OutStandingData){
                res.json({ 'success': true, 'garudata': OutStandingData});
            }).populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema'}}]).populate('broker_Code');
        }
    }).populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema'}}]).populate('broker_Code');
}).select('div_mast');
});

router.get('/getSaleBillModal',async function (req, res) {
    var party_Code =  req.query.party_Code;
    division.find({masterid:req.session.masterid},function(err,division){
        outstanding.find({$and: [{outstanding_balance:{$gt:0}}],$or:[{main_bk:'SB'},{main_bk:'OPOS'}],cashac_name:party_Code,del:'N',co_code:req.session.compid,div_code:req.session.divid,CNCL:'N'}, function (err, outstand){
            res.json({ 'success': true, 'outstanding':outstand,'division':division});
        }).populate('broker_Code');
    });
});


router.get('/GetLastDepositBank', ensureAuthenticated, function(req, res){
    BillCollection.find({cashac_name:req.query.party,co_code:req.session.compid,div_code:req.session.divid,del:'N',main_bk:'BC'},function(err,bank){
        var acnm;
        var acid;
        for(let i=0; i<bank.length; i++){
            if(bank[i].cash_bank_name.GroupName.GroupName == 'Bank' || bank[i].cash_bank_name.GroupName.GroupName == 'BANK ACCOUNTS'){
                acnm = bank[i].cash_bank_name.ACName;
                acid = bank[i].cash_bank_name._id;
                break;
            }
        }
        res.json({'success': true,'acnm':acnm,'acid':acid});
    }).sort('-vouc_code').populate([{path: 'cash_bank_name',model:'accountSchema',populate:{path:'GroupName', model:'groupSchema'}}])
})
router.get('/CashAcName', ensureAuthenticated, function(req, res){
    Gs_master.findOne({group: 'CASH'},function (err, gs_master){
        var qryGs = [];
        for(let i=0; i<gs_master.garry.length; i++){
            var grp = {GroupName:gs_master.garry[i]};
            qryGs.push(grp)
        }
        Account_master.find({$or:qryGs,masterid:req.session.masterid,del:"N"}, function (err,cashmast){
            if (err) {
                console.log(err);
            } else {
                // console.log(cashmast);
                if(cashmast == null || cashmast == []){
                    res.json({'success': false});
                }else{
                    var acnm;
                    var acid;
                    for(let i = 0; i<cashmast.length; i++){
                        // console.log(cashmast[i].GroupName.GroupName);
                        if(cashmast[i].GroupName.GroupName == "CASH" || cashmast[i].GroupName.GroupName == "CASH ACCOUNTS"){
                            acnm = cashmast[i].ACName;
                            acid = cashmast[i]._id;
                            break;
                        }
                    }
                    res.json({'success': true,'acnm':acnm,'acid':acid});
                }
            }
        }).populate('GroupName');
    })
})

// Cheq Return Entry
router.get('/SaveChaqReturnEntryInBC',async function(req, res){
    vouchMast.find({Module:'Cash/Bank',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid},async function(err, vouchMast){
        BillCollection.aggregate((
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
        ),async function (err, lastEntryNo){
            // var AddLessPara = await addlessMast.findOne({Module:'Cash/Bank',masterid:req.session.masterid},async function(err, addlessmast){});
            var lastNoCB = 1;
            if(lastEntryNo == null || lastEntryNo == '' || lastEntryNo == [])lastNoCB = 1;
            else lastNoCB = parseInt(lastEntryNo[0]._id._id)+1;
            var vouc_code = req.query.vouc_code
            var cjsp = req.query.cjsp
            var mainbk =  req.query.mainbk;
            var cashac_name = req.query.cashac_name;
            var Sno = req.query.Sno;
            var BillColl_Id = req.query.BillColl_Id;
            var chaqReturnEntryRadio = req.query.chaqReturnEntryRadio;

            var c_j_s_p_chaq     = req.query.c_j_s_p_chaq;
            var vouc_code_chaq   = req.query.vouc_code_chaq;
            var cash_remarks_chaq= req.query.cash_remarks_chaq;
            var ChaqReturnDate   = req.query.ChaqReturnDate;

            let query = {_id:BillColl_Id,del:'N'};
            let query3 = {BillColl_id:BillColl_Id,del:'N',CNCL:'N'} //outStanding Qry
            
            let cash_bank = {};
                cash_bank.Chaq_Return = "Y";
                BillCollection.updateMany(query,cash_bank,function(err){});
                
                let outstanndingChaqreturnUpdate = {};
                outstanndingChaqreturnUpdate.CNCL = "Y";

                if(chaqReturnEntryRadio != 'Pass Represent Voucher'){
                    let Outstending_Entry = await outstanding.findOne(query3,function(err){});
                        if(Outstending_Entry == '' || Outstending_Entry == null || Outstending_Entry == undefined)flag=1;
                        else{
                            updateOut = await outstanding.findOne({vouc_code:Outstending_Entry.vouc_code,c_j_s_p:Outstending_Entry.op_c_j_s_p,main_bk:'SB',del:'N',co_code:Outstending_Entry.op_co_code,div_code:Outstending_Entry.op_div_code},function(err){});
                            if(updateOut == null || updateOut == '' || updateOut == [])flag=1
                            else{
                                let outup = {};
                                if(Outstending_Entry.Less_Ded_Amt_Tot == '' || Outstending_Entry.Less_Ded_Amt_Tot == null || Outstending_Entry.Less_Ded_Amt_Tot == undefined)Outstending_Entry.Less_Ded_Amt_Tot = 0;
                                if(Outstending_Entry.Add_Ded_Amt_Tot == '' || Outstending_Entry.Add_Ded_Amt_Tot == null || Outstending_Entry.Add_Ded_Amt_Tot == undefined)Outstending_Entry.Add_Ded_Amt_Tot = 0;
                                if(Outstending_Entry.Rec_Amount == '' || Outstending_Entry.Rec_Amount == null || Outstending_Entry.Rec_Amount == undefined)Outstending_Entry.Rec_Amount = 0;
                                if(Outstending_Entry.Amount_Deduction == '' || Outstending_Entry.Amount_Deduction == null || Outstending_Entry.Amount_Deduction == undefined)Outstending_Entry.Amount_Deduction = 0;
                                var dedAmt = parseFloat(Outstending_Entry.Less_Ded_Amt_Tot)-parseFloat(Outstending_Entry.Add_Ded_Amt_Tot);
                                var recAmt = parseFloat(Outstending_Entry.Rec_Amount)-parseFloat(dedAmt);
                                outup.Rec_Amount          = parseFloat(updateOut.Rec_Amount)-parseFloat(recAmt);
                                outup.Add_Ded_Amt_Tot     = parseFloat(updateOut.Add_Ded_Amt_Tot)-parseFloat(Outstending_Entry.Add_Ded_Amt_Tot);
                                outup.Less_Ded_Amt_Tot    = parseFloat(updateOut.Less_Ded_Amt_Tot)-parseFloat(Outstending_Entry.Less_Ded_Amt_Tot);
                                outup.Amount_Deduction    = parseFloat(updateOut.Amount_Deduction)-parseFloat(Outstending_Entry.Amount_Deduction);
                                outup.outstanding_balance = parseFloat(updateOut.outstanding_balance)+parseFloat(recAmt);
                                var qry = {_id:updateOut._id};
                                outstanding.update(qry,outup,function(err){});
                            }
                        }
                    outstanding.updateMany(query3,outstanndingChaqreturnUpdate,function(err){});
                }

                if(chaqReturnEntryRadio == 'Pass Return Voucher' || chaqReturnEntryRadio == 'Pass Represent Voucher'){
                        var BillCollEntry = await BillCollection.findById(BillColl_Id,function(err,cash_bank_entry){});
                        var DateObject =  moment(ChaqReturnDate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                        var sodatemilisecond = DateObject.format('x');

                        let cash_bank = new BillCollection();
                        cash_bank.srno = Sno;
                        cash_bank.main_bk = "CB";
                        cash_bank.d_c = 'D';
                        cash_bank.c_j_s_p              = vouchMast[0].Vo_book;
                        cash_bank.vouc_code            = lastNoCB;
                        cash_bank.cash_date            = DateObject;
                        cash_bank.cash_edatemilisecond = sodatemilisecond;
                        cash_bank.deposit_date         = DateObject
                        cash_bank.deposit_datemilisecond = sodatemilisecond

                        cash_bank.cash_type            = 'PAYMENT';
                        cash_bank.cash_bank_name       = BillCollEntry.cash_bank_name;     
                        cash_bank.del                  = "N";
                        cash_bank.entrydate            = new Date();
                        cash_bank.cashac_name          = BillCollEntry.cashac_name;
                        cash_bank.cash_chequeno        = BillCollEntry.Chq_No;
                        cash_bank.cash_chequedate      = BillCollEntry.chq_date;

                        var LessAmt = parseFloat(BillCollEntry.Intrest)+parseFloat(BillCollEntry.Chithi)+parseFloat(BillCollEntry.CRChgs);
                        var AddAmt = parseFloat(BillCollEntry.discount);
                        cash_bank.Add_Amount_Deduction = AddAmt;
                        cash_bank.Less_Amount_Deduction= LessAmt;
                        cash_bank.cash_amount          = BillCollEntry.cash_amount;

                        cash_bank.cash_narrone         = 'cheque return';
                        cash_bank.cash_narrtwo         = cash_remarks_chaq;
                        cash_bank.cash_remarks         = BillCollEntry.cash_remarks;

                        var arr = [];
                        // var AddLessArr = AddLessPara.Add_Less_Parameter_Master_Array;
                        // for(let i=0; i<AddLessArr.length; i++){
                        //     if(AddLessArr[i].Description == 'Discount')
                        // }
                        // var objDesc = {
                        //     "Ded_Par_dsc" : "Discount",
                        //     "Ded_Par_dsc_id" : ObjectId("5e3e4de0635c3309c8ed461d"),
                        //     "Ded_Par_value" : "0",
                        //     "Ded_Par_typ" : "+"
                        // },
                        cash_bank.addlessParameter     = arr;
                
                        cash_bank.totcash_amt          = BillCollEntry.cash_amount;
                        // cash_bank.outStandingArr       = [];
                        cash_bank.co_code              = req.session.compid;
                        cash_bank.div_code             = req.session.divid;
                        cash_bank.usrnm                = req.session.user;
                        cash_bank.masterid             = req.session.masterid

                        cash_bank.save(function (err){});
                }
                if(chaqReturnEntryRadio == 'Pass Represent Voucher'){
                    var BillCollEntry = await BillCollection.findById(BillColl_Id,function(err,cash_bank_entry){});
                    // console.log(chaqReturnEntryRadio,'cash_bank_entry',cash_bank_entry.vouc_code);
                    var DateObject =  moment(ChaqReturnDate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                    var sodatemilisecond = DateObject.format('x');

                    let cash_bank = new BillCollection();
                    cash_bank.srno = Sno;
                    cash_bank.main_bk = "BC";
                    cash_bank.d_c = "C";
                    cash_bank.c_j_s_p = c_j_s_p_chaq;
                    cash_bank.vouc_code = vouc_code_chaq;
                    cash_bank.cash_date = DateObject;
                    cash_bank.cash_edatemilisecond = sodatemilisecond;
                    // cash_bank.cBill_No = req.body.cBill_No;
                    // cash_bank.cash_type = req.body.cash_type;
                    cash_bank.cash_bank_name = BillCollEntry.cash_bank_name;  
                    // cash_bank.Chgs = req.body.Chgs;
                    // cash_bank.Bal = req.body.Bal; 
                    // cash_bank.Adjusted = req.body.Adjusted;   
                    cash_bank.del = "N";
                    cash_bank.entrydate = new Date();
                    cash_bank.Bill_No = BillCollEntry.Bill_No;
                        
                    cash_bank.Date = BillCollEntry.Date;
                    cash_bank.Datemilisecond = BillCollEntry.Datemilisecond;
                    cash_bank.cashac_name = BillCollEntry.cashac_name;
                    cash_bank.place = BillCollEntry.place;
                    cash_bank.broker_Code = BillCollEntry.broker_Code;
                    
                    cash_bank.Bill_Amt    = BillCollEntry.Bill_Amt;
                    cash_bank.Amt_Settled = BillCollEntry.Amt_Settled;

                    cash_bank.Balance_Due = BillCollEntry.Balance_Due;
                    
                    cash_bank.Cheq_Amt = BillCollEntry.Cheq_Amount;
                    
                    cash_bank.Cash_Amt = BillCollEntry.tot_Cash_Amount;

                    cash_bank.Days = BillCollEntry.Days;
                    cash_bank.Int_Per = BillCollEntry.Int_Per;
                    cash_bank.Intrest = BillCollEntry.Intrest;
                    cash_bank.discount = BillCollEntry.discount;
                    cash_bank.CRChgs = BillCollEntry.CRChgs;
                    cash_bank.Chithi = BillCollEntry.Chithi;
                    cash_bank.Amount_Deduction = BillCollEntry.Amount_Deduction;
                    cash_bank.cash_amount = BillCollEntry.cash_amount;
                    
                    cash_bank.Kasar= BillCollEntry.Kasar;
                    cash_bank.totcash_amt = BillCollEntry.tot_Amt;
                    cash_bank.Drawee_Bank = BillCollEntry.Drawee_Bank;
                    cash_bank.draw_branch = BillCollEntry.draw_branch;
                    cash_bank.Chq_No = BillCollEntry.Chq_No;
                    
                    cash_bank.chq_date = BillCollEntry.chq_date;
                    cash_bank.chq_datemilisecond = BillCollEntry.chq_datemilisecond;
                    cash_bank.deposit_date = BillCollEntry.deposit_date;
                    cash_bank.deposit_datemilisecond = BillCollEntry.deposit_datemilisecond;
                    
                    cash_bank.cash_remarks = BillCollEntry.cash_remarks;
                    cash_bank.co_code = BillCollEntry.co_code;
                    cash_bank.div_code = BillCollEntry.div_code;
                    cash_bank.usrnm = BillCollEntry.usrnm;
                    cash_bank.masterid = BillCollEntry.masterid
                    
                    cash_bank.cash_narrone = BillCollEntry.cash_narrone;
                    cash_bank.cash_narrtwo = BillCollEntry.cash_narrtwo;

                    cash_bank.op_main_bk = BillCollEntry.op_main_bk;
                    cash_bank.op_c_j_s_p = BillCollEntry.op_c_j_s_p;
                    cash_bank.op_co_code = BillCollEntry.op_co_code;
                    cash_bank.op_div_code = BillCollEntry.op_div_code;    
                    cash_bank.save(function (err){
                        if(err)console.log(err);
                    });

                    let outstanndingChaqreturnUpdate = {};
                    outstanndingChaqreturnUpdate.BillColl_id = cash_bank._id;
                    outstanding.updateMany(query3,outstanndingChaqreturnUpdate,function(err){});
                }
            res.json({'success':true});
        });
    });
});

router.get('/showAdjustEntryInBCUpdate', function (req, res) {
    var BillCollId = req.query.BillCollId;
    outstanding.find({BillColl_id:BillCollId,del:'N',CNCL:'N'},function(err, outstandingEntry){
        res.json({'success':true,'outstandingEntry':outstandingEntry});
    }).populate('cashac_name').populate('cash_bank_name');
});

router.post('/delete',async function(req, res){
    var vouc_code = req.body.vouc_code;
    var cjsp = req.body.cjsp;
    var main_bk = req.body.main_bk;
    var qryBillColl = {vouc_code:vouc_code,c_j_s_p:cjsp,main_bk:main_bk,del:'N'};
    BillCollection.find(qryBillColl,async function(err,outId){
        if(outId == null || outId == '' || outId == []){
            res.send("<script>alert('Error In deleting');window.location.href = '/Bill_CollectionEntry/Bill_CollectionEntry_List'</script>");
        }else{
            for(let i = 0; i<outId.length; i++){
                Outstending_Entry = await outstanding.findOne({BillColl_id:outId[i]._id,del:'N'},function(err){});
                updateOut = await outstanding.findOne({vouc_code:outId[i].Bill_No,c_j_s_p:outId[i].op_c_j_s_p,main_bk:outId[i].op_main_bk,del:'N'},function(err){});
                var out = {};
                out.del = 'Y';
                out.delete = new Date();
                queryout = {BillColl_id:outId[i]._id};
                outstanding.update(queryout,out,function(err,trans){});
                let outup = {};
                // var dedAmt = parseFloat(req.body.Intrest[j])+parseFloat(req.body.Chithi[j])+parseFloat(req.body.CRChgs[j])-parseFloat(req.body.discount[j]);
                var dedAmt = parseFloat(Outstending_Entry.Less_Ded_Amt_Tot)-parseFloat(Outstending_Entry.Add_Ded_Amt_Tot);
                var recAmt = parseFloat(Outstending_Entry.Rec_Amount)-parseFloat(dedAmt);
                // if(Outstending_Entry.Add_Ded_Amt_Tot<0)Outstending_Entry.Add_Ded_Amt_Tot = Outstending_Entry.Add_Ded_Amt_Tot*-1;
                outup.Rec_Amount          = parseFloat(updateOut.Rec_Amount)-parseFloat(recAmt);
                outup.Add_Ded_Amt_Tot     = parseFloat(updateOut.Add_Ded_Amt_Tot)-parseFloat(Outstending_Entry.Add_Ded_Amt_Tot);
                outup.Less_Ded_Amt_Tot    = parseFloat(updateOut.Less_Ded_Amt_Tot)-parseFloat(Outstending_Entry.Less_Ded_Amt_Tot);
                outup.Amount_Deduction    = parseFloat(updateOut.Amount_Deduction)-parseFloat(Outstending_Entry.Amount_Deduction);
                outup.outstanding_balance = parseFloat(updateOut.outstanding_balance)+parseFloat(recAmt);
                
                var qry = {_id:updateOut._id};
                outstanding.update(qry,outup,function(err){});
                var Bill = {};
                Bill.del = 'Y';
                Bill.delete = new Date();
                var qryBillColl = {_id:outId[i]._id};
                BillCollection.update(qryBillColl,Bill,async function(err,trans){});
            }
            res.redirect('/Bill_CollectionEntry/Bill_CollectionEntry_List');
        }
    })
    
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/userright/login');
    }
}

module.exports = router;





// Sale Bill outstanding Modal
// console.log('479',party_Code)
            // outArr = [];
            // outstanding.find({cashac_name:party_Code,div_code:req.session.divid,co_code:req.session.compid,masterid:req.session.masterid,main_bk:'SB',del:"N"}, function(err, garudata){
            //     if(garudata == null || garudata == '' || garudata == []){
            //     }else{
            //         outstanding.aggregate([{ $match:{cashac_name:garudata[0].cashac_name._id,div_code:req.session.divid,co_code:req.session.compid,main_bk:'SB',del:"N"}},
            //         { $group : {
            //         _id:{
            //             "vouc_code": "$vouc_code",
            //         }}, } ], function (err, BollNo){
            //             var AmtCr = 0;
            //             var AmtDr = 0;
            //             var cash_amount = 0;
            //             var cash_date;
            //             var broker_Code;
            //             var BillNoarr;
            //             var c_j_s_p;
            //             for(var b=0; b<BollNo.length; b++){
            //                 for(let i=0; i<garudata.length; i++){
            //                     if(BollNo[b]._id.vouc_code == garudata[i].vouc_code){
            //                         if(garudata[i].cash_amount == null || garudata[i].cash_amount == '' || garudata[i].cash_amount == undefined)var Flag = 0;
            //                         else {
            //                             if(garudata[i].d_c == 'C'){
            //                                 broker_Code = garudata[i].broker_Code
            //                                 cash_amount = garudata[i].cash_amount;
            //                                 cash_date = garudata[i].cash_date;
            //                                 BillNoarr = garudata[i].vouc_code;
            //                                 c_j_s_p = garudata[i].c_j_s_p;
            //                             }
            //                         }
            //                         if(garudata[i].d_c == 'C'){
            //                             AmtCr = AmtCr + parseFloat(garudata[i].outstanding_amount);
            //                         }
            //                         if(garudata[i].d_c == 'D'){
            //                             AmtDr = AmtDr + parseFloat(garudata[i].outstanding_amount);
            //                         }
            //                     }
            //                 }
            //                 var bal = parseFloat(AmtCr-AmtDr);
            //                 if (bal > 0)
            //                 {
            //                     var arr = {'vouc_code': BillNoarr,'c_j_s_p': c_j_s_p, 'cash_date': cash_date,'cash_amount': cash_amount,"outstanding_amount":bal,'broker_Code': broker_Code};
            //                     this.outArr.push(arr);
            //                     AmtCr = 0;
            //                     AmtDr = 0;
            //                 }
            //             }
            //             res.json({ 'success': true, 'garudata': outArr});
            //         });
            //     }
            // }).populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema'}}]).populate('broker_Code');



// GaruAavak.findById(req.params.id, function(err, GaruAavak){
//     journalmast.find({_ID:req.params.id}, function (err, journ){
//         outstanding.find({_ID:req.params.id}, function (err, outst){
//    GaruAavak.remove(query, function(err){
//         if(err){
//           console.log(err);

//         }
//         query = {_ID:req.params.id}
//         journalmast.remove(query, function(err){
//             if(err){
//               console.log(err);

//             }
//             query = {_ID:req.params.id}
//             outstanding.remove(query, function(err){
//             if(err){
//               console.log(err);

//             }
//           })
//           })
//        res.send('Success');
//       })
//   })
// })
// })