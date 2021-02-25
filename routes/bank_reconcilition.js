const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let GaruAavak = require('../models/Garu_Aavak_Schema');
let SalesEntry = require('../models/Garu_Aavak_Schema');
const moment = require('moment-timezone');
let trans = require('../models/trans');
let outstanding= require('../models/outstading_schema');
let product = require('../models/fgSchema');
let division = require('../models/divSchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');
let lessmast = require('../models/addless_mast_schema');
let gowdown= require('../models/gowdawnCodeSchema');
let Company = require('../models/companySchema');
let vouchMast= require('../models/vouchSchema');
let db = mongoose.connection;
router.get('/reconciliation', ensureAuthenticated, function(req, res){
        res.render('reconciliation.hbs', {
            pageTitle:'Reconcilation ',
            compnm:req.session.compnm,
            divnm:req.session.divmast,
            sdate: req.session.compsdate,
            edate:req.session.compedate,
            usrnm:req.session.user,
            security: req.session.security,
            administrator:req.session.administrator
        });
});
router.get('/Bank_Slip', ensureAuthenticated, function(req, res){
    res.render('Bank_Slip.hbs', {
        pageTitle:'Bank Slip ',
        compnm:req.session.compnm,
        divnm:req.session.divmast,
        sdate: req.session.compsdate,
        edate:req.session.compedate,
        usrnm:req.session.user,
        security: req.session.security,
        administrator:req.session.administrator
    });
});
router.get('/Chaq_Return_Register', ensureAuthenticated, function(req, res){
    res.render('chaq_return_Ragister.hbs', {
        pageTitle:'Chaq Return Register',
        compnm:req.session.compnm,
        divnm:req.session.divmast,
        sdate: req.session.compsdate,
        edate:req.session.compedate,
        usrnm:req.session.user,
        security: req.session.security,
        administrator:req.session.administrator
    });
});
router.post('/getsalesentrylistcb', ensureAuthenticated, async function(req, res){
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;
        var  bankid = req.body.bankid;
        var  Old = req.body.Old;
        var  Chq = req.body.Chq;
        var  d_c = req.body.d_c;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');  
        console.log('strtdate',strtdate);
        console.log('enddats',enddats);
        var query = '';
        if(Old == 'Pick_up'){//{main_bk:"OPBR"}
            query = {$or: [{$and : [{main_bk:"CB"},{cash_edatemilisecond:{$gte:strtdate}},{cash_edatemilisecond:{$lte:enddats}}]},{$and : [{main_bk:"BC"},{cash_edatemilisecond:{$gte:strtdate}},{cash_edatemilisecond:{$lte:enddats}}]},{$and : [{main_bk:"OPBR"}]}], del:"N", div_code: req.session.divid, co_code: req.session.compid};
        }
        else query = {$and: [{cash_edatemilisecond:{$gte:strtdate}},{cash_edatemilisecond:{$lte:enddats}}],$or:[{main_bk:"CB"},{main_bk:'BC'}], del:"N", div_code: req.session.divid, co_code: req.session.compid};
        if(bankid != ''){
            var party = {cash_bank_name:bankid};
            query = Object.assign(query,party)
        }
        if(d_c == 'debit'){
            var party = {d_c:'D'};
            query = Object.assign(query,party)
        }
        if(d_c == 'credit'){
            var party = {d_c:'C'};
            query = Object.assign(query,party)
        }
        if(Chq == 'clear'){
            var party = {$or:[{Cheq_Clear_Date:{$exists:true}},{Cheq_Clear_Date:{$ne:null}}]};
            query = Object.assign(query,party)
        }
        if(Chq == 'unclear'){
            var party = {$or:[{Cheq_Clear_Date:{$exists:false}},{Cheq_Clear_Date:null}]};
            query = Object.assign(query,party)
        }
        
        if(bankid != ''){
            var totalAmt_Debit = await trans.aggregate((
                [{ $match: {$or:[{main_bk:"CB"},{main_bk:"BC"}],$and: [{ cash_edatemilisecond: { $gte: parseFloat(strtdate) } },{ cash_edatemilisecond: { $lte: parseFloat(enddats) } }],d_c:'D',co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
                { $group:
                    {
                        _id: {
                            "_id": "$vouc_code",
                        },
                        "totDebit": {"$sum": "$cash_amount"}
                    }
                }]
            ),
            function (err, lastEntryNo){});
            console.log('totalAmt_Debit',totalAmt_Debit.length)
            var totalAmt_Credit = await trans.aggregate((
                [{ $match: {$or:[{main_bk:"CB"},{main_bk:"BC"}],$and: [{ cash_edatemilisecond: { $gte: parseFloat(strtdate) } },{ cash_edatemilisecond: { $lte: parseFloat(enddats) } }],d_c:'C',co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
                { $group:
                    {
                        _id: {
                            "_id": "$vouc_code",
                        },
                        "totDebit": {"$sum": "$cash_amount"}
                    }
                }]
            ),
            function (err, lastEntryNo){});
            console.log('totalAmt_Credit',totalAmt_Credit.length);
        }
        let transdata = await trans.find(query, function (err,GaruAavak){})
        res.json({ 'success': true,'transdata':transdata});
})
router.post('/ShowBankSlip', ensureAuthenticated, async function(req, res){
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var bankid = req.body.bankid;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');  
    var query = {$and: [{deposit_datemilisecond:{$gte:strtdate}},{deposit_datemilisecond:{$lte:enddats}}],$or:[{main_bk:"CB"},{main_bk:'BC'}],d_c:'C', del:"N", div_code: req.session.divid, co_code: req.session.compid};
    if(bankid != ''){
        var party = {cash_bank_name:bankid};
        query = Object.assign(query,party);
    }
   let transdata = await trans.find(query, function (err,GaruAavak){}).populate('Drawee_Bank').populate('cashac_name');
   let div = await division.findById(req.session.divid);
    res.json({ 'success': true,'transdata':transdata,'div':div});
})
router.post('/ShowChaqReturnRegister', ensureAuthenticated, async function(req, res){
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');  
    var query = {$and: [{deposit_datemilisecond:{$gte:strtdate}},{deposit_datemilisecond:{$lte:enddats}}],$or:[{main_bk:"CB"},{main_bk:'BC'}],d_c:'C', del:"N",Chaq_Return:'Y', div_code: req.session.divid, co_code: req.session.compid};
   let transdata = await trans.find(query, function (err,GaruAavak){}).populate('Drawee_Bank').populate('cashac_name');
   let div = await division.findById(req.session.divid);
    res.json({ 'success': true,'transdata':transdata,'div':div});
})
router.post('/Update_Cheq_Clear_Date', function(req, res) {
    let domast = {};
    domast.Cheq_Clear_Date = req.body.Cheq_Clear_Date;
    let query = {_id:req.body.id}
    trans.update(query ,domast ,function (err) {
        if (err) {
            res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
            }else{
                res.json({ 'success': true}); 
            }
    })
})
router.post('/dodateupdate', function(req, res) {
    var do_Date = req.body.value;
    console.log(do_Date);
    var do_DateObject =  moment(do_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var do_Datemilisecond = do_DateObject.format('x');
    let domast = {};
    domast.do_Date = do_DateObject;
    domast.do_Datemilisecond= do_Datemilisecond;
    let query = {_id:req.body.id}
    console.log(query);
    GaruAavak.update(query ,domast ,function (err) {
        if (err) {
            res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
            }else{
                res.json({ 'success': true}); 
            }
    })

})

//Opening Entry
router.get('/bank_reconcilation_opening_entry', ensureAuthenticated, function(req, res){
    vouchMast.find({$or:[{Module:'Garu Aavak Entry'},{Module:'Sale Entry'}],Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
            res.render('bank_reconcilation_opening_entry.hbs', {
                pageTitle:'Bank Reconcilation Opening Entry',
                compnm:req.session.compnm,
                vouchMast:vouchMast,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            }); 
    });
});

router.post('/add_opening_entry',async function(req, res){
    Company.findById(req.session.compid,async function(err, company){
        if(req.body.party_name=="") req.body.party_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        var date = req.body.date;
        var DateObject =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var DateMiliSeconds = DateObject.format('x');
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            var date = company.sdate;
            var DateObject_sdate =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            DateObject_sdate = DateObject_sdate.subtract(1, "days");
            var proformadatemilisecond = DateObject_sdate.format('x');
            var CL_BANK_BAL_IN_REC = await trans.findOne({cash_bank_name : req.body.cash_bank_name,main_bk:'CL_BANK_BAL_IN_REC',co_code:req.session.compid,div_code:req.session.divid},function(err,aa){})
            if(CL_BANK_BAL_IN_REC == null || CL_BANK_BAL_IN_REC == [] || CL_BANK_BAL_IN_REC == '' || CL_BANK_BAL_IN_REC == undefined){
                let CLBAL = new trans();
                    CLBAL.main_bk = 'CL_BANK_BAL_IN_REC';
                    CLBAL.c_j_s_p = '';
                    CLBAL.vouc_code = 0;
                    CLBAL.cash_date = DateObject_sdate;
                    CLBAL.cash_edatemilisecond = proformadatemilisecond;
                    CLBAL.cash_bank_name = req.body.cash_bank_name;
                    // CLBAL.cashac_name = req.body.cashac_name[i];
                    CLBAL.cash_amount = req.body.Closing_Bal_Bank;
                    if(req.body.Bank_d_c == 'Debit')CLBAL.d_c = 'D';
                    if(req.body.Bank_d_c == 'Credit')CLBAL.d_c = 'C';
                    CLBAL.cash_remarks = 'Closing Bal As Per Bank';
                    CLBAL.cash_narrone = 'Bank Reconcilation Opening Entry';
                    CLBAL.cash_narrtwo = '';
                    CLBAL.del =  'N';
                    CLBAL.CNCL =  'Y';
                    CLBAL.entrydate =  new Date();
                    CLBAL.co_code =  req.session.compid;
                    CLBAL.div_code =  req.session.divid;
                    CLBAL.usrnm =  req.session.user;
                    CLBAL.masterid =   req.session.masterid;
                    CLBAL.save(function (err){
                        if(err){console.log(err);}
                        else{}
                    });
            }else{
                CLBAL = {};
                CLBAL.main_bk = 'CL_BANK_BAL_IN_REC';
                CLBAL.c_j_s_p = '';
                CLBAL.vouc_code = 0;
                CLBAL.cash_date = DateObject_sdate;
                CLBAL.cash_edatemilisecond = proformadatemilisecond;
                CLBAL.cash_bank_name = req.body.cash_bank_name;
                // CLBAL.cashac_name = req.body.cashac_name[i];
                CLBAL.cash_amount = req.body.Closing_Bal_Bank;
                if(req.body.Bank_d_c == 'Debit')CLBAL.d_c = 'D';
                if(req.body.Bank_d_c == 'Credit')CLBAL.d_c = 'C';
                CLBAL.cash_remarks = 'Closing Bal As Per Bank';
                CLBAL.cash_narrone = 'Bank Reconcilation Opening Entry';
                CLBAL.cash_narrtwo = '';
                CLBAL.del =  'N';
                CLBAL.CNCL =  'Y';
                CLBAL.update =  new Date();
                CLBAL.co_code =  req.session.compid;
                CLBAL.div_code =  req.session.divid;
                CLBAL.usrnm =  req.session.user;
                CLBAL.masterid =   req.session.masterid;
                trans.update({_id:CL_BANK_BAL_IN_REC._id},CLBAL,function(err){
                    if(err)console.log(err);
                })
            }
            for(var i = 0; i<req.body.OpOsArrNum.length; i++)
            {
                var date = req.body.date[i];
                var DateObject =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var DateMiliSeconds = DateObject.format('x');
                if(req.body.opmoduleid[i] == "" || req.body.opmoduleid[i] == null || req.body.opmoduleid[i] == undefined){
                    let OP = new trans();
                    OP.main_bk = 'OPBR';
                    OP.c_j_s_p = '';
                    OP.vouc_code = 0;
                    OP.cash_date = DateObject;
                    OP.cash_edatemilisecond = DateMiliSeconds;
                    OP.cash_chequedate = req.body.date[i];
                    OP.cash_bank_name = req.body.cash_bank_name;
                    OP.cashac_name = req.body.cashac_name[i];
                    OP.Bill_Amount = req.body.Amount[i];
                    OP.cash_chequeno = req.body.cash_chequeno[i];
                    OP.cash_amount = req.body.Amount[i];
                    if(req.body.d_c[i] == 'Debit')OP.d_c = 'D';
                    if(req.body.d_c[i] == 'Credit')OP.d_c = 'C';
                    OP.cash_remarks= req.body.remarks[i];
                    OP.cash_narrone = 'Bank Reconcilation Opening Entry';
                    OP.cash_narrtwo = req.body.remarks[i];
                    OP.del =  'N';
                    OP.CNCL =  'Y';
                    OP.entrydate =  new Date();
                    OP.co_code =  req.session.compid;
                    OP.div_code =  req.session.divid;
                    OP.usrnm =  req.session.user;
                    OP.masterid =   req.session.masterid;
                    OP.save(function (err){
                        if(err){console.log(err);}
                        else{}
                    });
                }else{
                    OP = {};
                    OP.main_bk = 'OPBR';
                    OP.c_j_s_p = '';
                    OP.vouc_code = 0;
                    OP.cash_date = DateObject;
                    OP.cash_edatemilisecond = DateMiliSeconds;
                    OP.cash_chequedate = req.body.date[i];
                    OP.cash_bank_name = req.body.cash_bank_name;
                    OP.cashac_name = req.body.cashac_name[i];
                    OP.Bill_Amount = req.body.Amount[i];
                    OP.cash_chequeno = req.body.cash_chequeno[i];
                    OP.cash_amount = req.body.Amount[i];
                    if(req.body.d_c[i] == 'Debit')OP.d_c = 'D';
                    if(req.body.d_c[i] == 'Credit')OP.d_c = 'C';
                    OP.cash_remarks= req.body.remarks[i];
                    OP.cash_narrone = 'Bank Reconcilation Opening Entry';
                    OP.cash_narrtwo = req.body.remarks[i];
                    OP.del =  'N';
                    OP.CNCL =  'Y';
                    OP.update =  new Date();
                    OP.co_code =  req.session.compid;
                    OP.div_code =  req.session.divid;
                    OP.usrnm =  req.session.user;
                    OP.masterid =   req.session.masterid;
                    let query = {_id:req.body.opmoduleid[i]}
                    trans.update(query,OP,function (err) {if(err) console.log(err) });
                }
            }
            res.redirect('/bank_reconcilition/bank_reconcilation_opening_entry');
        }
    });
});
router.get('/getlistopmodule', function (req, res) {
    var partyid = req.query.partyid;
    var query = {cash_bank_name:partyid,main_bk:'OPBR',del:'N',co_code:req.session.compid,div_code:req.session.divid,masterid:req.session.masterid};
    trans.find(query, function(err, oposmodule){
        trans.findOne({cash_bank_name : partyid,main_bk:'CL_BANK_BAL_IN_REC',co_code:req.session.compid,div_code:req.session.divid}, function(err, BankClBal){
        if(oposmodule== null || oposmodule==[] || oposmodule==undefined || oposmodule==''){
            res.json({'success': false});
        }else{
            res.json({'success': true,'oposmodule': oposmodule,'BankClBal':BankClBal});
        }
        });
    }).populate([{path: 'cash_bank_name',populate:{ path: 'CityName'}}])
    .populate([{path: 'cashac_name',populate:{ path: 'CityName'}}])
})
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/userright/login');
    }
}

module.exports = router;









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