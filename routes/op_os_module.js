const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let db = mongoose.connection;
let party = require('../models/accountSchema');
let oposmodule = require('../models/outstading_schema');
let g_mast= require('../models/groupSchema');
const moment = require('moment-timezone');
let vouchMast= require('../models/vouchSchema');
let RCTDET = require('../models/RCTDET');
let SALDAT = require('../models/oldouts');
var Account_master = require('../models/accountSchema');
let city = require('../models/citySchema');
// mongoose.createConnection('mongodb://localhost:27017/t');
// var Data_Base_t = require("../t_db_connect");
// const RCTDET = mongoose.model('RCTDET'); RAMBHIA@123
var query;

// Add Route
router.get('/getpartyoposmodule', function (req, res) {
    g_mast.find({masterid: req.session.masterid, del: "N",MaintainOs:'Y'}, function (err,g_mast){
        var qry = req.query.term.term;
        var qryGs = [];
        for(let i=0; i<g_mast.length; i++){
            qryGs.push(g_mast[i]._id)
        }
        party.find({$or: [{ 'ACName':{ $regex: new RegExp("^"+qry,"i")}},{'ACCode':{ $regex: new RegExp("^"+qry,"i")}}],GroupName :{ $in : qryGs },del:'N',masterid:req.session.masterid},'ACName',  function(err, party){
            var data = new Array();
            for (var j = 0; j < party.length; j++) {
                if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                else cityname = party[j]['CityName']['CityName'];
                data[j] = {
                    "id": party[j]._id,
                    "text" : party[j].ACName + ','+ cityname
                };
            }
            res.json({'results':  data, "pagination": { "more": false} });
        }).sort({'ACName':1}).populate('CityName').limit(100);
    })
});
///get proceed
router.get('/getlistopmodule', function (req, res) {
    vouchMast.find({$or:[{Module:'Garu Aavak Entry'},{Module:'Sale Entry'}],Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
    var partyid = req.query.partyid;
    var query = {cashac_name:partyid,main_bk:'OPOS',del:'N',co_code:req.session.compid,div_code:req.session.divid,masterid:req.session.masterid};
    oposmodule.find(query, function(err, oposmodule){
        if(oposmodule== null || oposmodule==[] || oposmodule==undefined || oposmodule==''){
            res.json({'success': false});
        }else{
            res.json({'success': true,'oposmodule': oposmodule,'vouchMast':vouchMast});
        }
    }).populate([{path: 'cashac_name',populate:{ path: 'CityName'}}]).populate('broker_Code');
});
})
router.get('/getBook', ensureAuthenticated, function(req, res){
    vouchMast.find({$or:[{Module:'Garu Aavak Entry'},{Module:'Sale Entry'}],Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
        res.json({'success':true,vouchMast:vouchMast})
    });
});
router.get('/op_os_module', ensureAuthenticated, function(req, res){
    vouchMast.find({$or:[{Module:'Garu Aavak Entry'},{Module:'Sale Entry'}],Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
            res.render('op_os_module.hbs', {
                pageTitle:'OP O/S Module',
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

router.get('/delete', ensureAuthenticated, function(req, res){
    var OP = {};
    OP.del =  'Y';
    OP.delete =  new Date();
    var qry = {_id:req.query.id};
    console.log(qry)
    oposmodule.update(qry,OP,function(err){
        if(err){
            res.json({'success':false});
        }else{
            res.json({'success':true});
        }
    })
});

router.post('/add',async function(req, res){
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
        for(var i = 0; i<req.body.OpOsArrNum.length; i++)
        {
            var date = req.body.date[i];
            var DateObject =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var DateMiliSeconds = DateObject.format('x');
            if(req.body.partyBillDate[i] == null || req.body.partyBillDate[i] == '')flag=1;
            else{
                var partyBillDate = req.body.partyBillDate[i];
                var partyBillDate_DateObject =  moment(partyBillDate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var partyBillDate_DateMiliSeconds = partyBillDate_DateObject.format('x');
            }
            if(req.body.discount[i] == '' || req.body.discount[i] == null)req.body.discount[i] = 0;
            if(req.body.cr_Days[i] == '' || req.body.cr_Days[i] == null)req.body.cr_Days[i] = 0;
            
            if(req.body.opmoduleid[i] == "" || req.body.opmoduleid[i] == null || req.body.opmoduleid[i] == undefined){
                let OP = new oposmodule();
                OP.main_bk = 'OPOS';
                OP.c_j_s_p = req.body.OS_Book[i];
                OP.OS_Type = req.body.OS_Type[i];
                OP.OS_Book = req.body.OS_Book[i];
                OP.vouc_code = req.body.vouc_code[i];
                OP.Chr = req.body.Chr[i]
                OP.cash_date = DateObject;
                OP.cash_edatemilisecond = DateMiliSeconds;
                OP.cashac_name = req.body.cashac_name;
                OP.broker_Code = req.body.broker_Code[i];
                OP.partyBillNo = req.body.partyBillNo[i];
                OP.Bill_Amount = 0;
                if(req.body.OS_Type[i] == 'SB')OP.Bill_Amount = req.body.Amount[i];
                if(req.body.OS_Type[i] == 'PB')OP.Bill_Amount = req.body.Amount[i];
                if(req.body.partyBillDate[i] == null || req.body.partyBillDate[i] == '')flag = 1;
                else{
                    OP.partyBillDate = partyBillDate_DateObject;
                    OP.partyBillDate_milisecond = partyBillDate_DateMiliSeconds;
                }
                OP.discount = req.body.discount[i];
                OP.cash_amount = req.body.Amount[i];
                OP.Add_Ded_Amt_Tot = req.body.discount[i]
                OP.outstanding_balance = parseFloat(req.body.Amount[i])-parseFloat(req.body.discount[i]);
                OP.Rec_Amount = 0;
                if(req.body.OS_Type[i] == 'ONA')OP.Rec_Amount = req.body.Amount[i];
                OP.Less_Ded_Amt_Tot = 0;
                if(req.body.d_c[i] == 'Debit')OP.d_c = 'D';
                if(req.body.d_c[i] == 'Credit')OP.d_c = 'C';
                
                OP.cr_Days = req.body.cr_Days[i];
                OP.cash_remarks= req.body.remarks[i];
                OP.del =  'N';
                OP.CNCL =  'N';
                OP.entrydate =  new Date();
                OP.co_code =  req.session.compid;
                OP.div_code =  req.session.divid;
                OP.usrnm =  req.session.user;
                OP.masterid =   req.session.masterid;
                OP.save(function (err){
                    if(err)
                    {
                        res.json({'success':false,'message':'error in saving city','errors':err});
                    }
                    else
                    {
                        // res.redirect('/op_os_module/op_os_module');
                    }
                });
            }else{
                OP = {};
                OP.main_bk = 'OPOS';
                OP.c_j_s_p = req.body.OS_Book[i];
                OP.OS_Type = req.body.OS_Type[i];
                OP.OS_Book = req.body.OS_Book[i];
                OP.vouc_code = req.body.vouc_code[i];
                OP.Chr = req.body.Chr[i]
                OP.cash_date = DateObject;
                OP.cash_edatemilisecond = DateMiliSeconds;
                OP.cashac_name = req.body.cashac_name;
                OP.broker_Code = req.body.broker_Code[i];
                OP.partyBillNo = req.body.partyBillNo[i];
                OP.Bill_Amount = 0;
                if(req.body.OS_Type[i] == 'SB')OP.Bill_Amount = req.body.Amount[i];
                if(req.body.OS_Type[i] == 'PB')OP.Bill_Amount = req.body.Amount[i];

                if(req.body.partyBillDate[i] == null || req.body.partyBillDate[i] == '')flag=1;
                else{
                    OP.partyBillDate = partyBillDate_DateObject;
                    OP.partyBillDate_milisecond = partyBillDate_DateMiliSeconds;
                }
                OP.cash_amount = req.body.Amount[i];
                OP.discount = req.body.discount[i];
                OP.Add_Ded_Amt_Tot = req.body.discount[i]
                var outbal = await oposmodule.findById(req.body.opmoduleid[i],function(err,out){});
                OP.outstanding_balance = parseFloat(outbal.outstanding_balance)-parseFloat(req.body.discount[i])+parseFloat(outbal.discount);
                if(req.body.OS_Type[i] == 'ONA')OP.Rec_Amount = req.body.Amount[i];
                // OP.Rec_Amount = 0;
                OP.Less_Ded_Amt_Tot = 0;
                if(req.body.d_c[i] == 'Debit')OP.d_c = 'D';
                if(req.body.d_c[i] == 'Credit')OP.d_c = 'C';
                
                OP.cr_Days = req.body.cr_Days[i];
                OP.cash_remarks= req.body.remarks[i];
                OP.del =  'N';
                OP.CNCL =  'N';
                OP.update =  new Date();
                OP.co_code =  req.session.compid;
                OP.div_code =  req.session.divid;
                OP.usrnm =  req.session.user;
                OP.masterid =   req.session.masterid;
                let query = {_id:req.body.opmoduleid[i]}
                // console.log(query)
                oposmodule.update(query,OP,function (err) { });
            }
        }
        res.redirect('/op_os_module/op_os_module');
    }
});

router.get('/FindOpeningOutstanding__Old', ensureAuthenticated,async function(req, res){
    // SALDAT.updateMany({},{Out_Update:'N'},function(err){
    //     if(err)console.log('Update Error',err);
    //     else{console.log('Update Success')};
    // });
    // SALDAT.updateMany({},{del:'N'},function(err){
    //     if(err)console.log('Update Error',err);
    //     else{console.log('Update Success')};
    // });

    // SALDAT.updateMany({del:'N'},{Out_Update:'N'},function(err){
    //     if(err)console.log('Update Error',err);
    //     else{console.log('Update Success')};
    // });


    // vouchMast.find({$or:[{Module:'Garu Aavak Entry'},{Module:'Sale Entry'}],Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
    //     SALDAT.find({del:'N',Out_Update:'N'},async function(err,SALDAT_Data){
    //         console.log('SALDAT_Data langht',SALDAT_Data.length);
    //         var count = 0
    //         for(let i=0; i<SALDAT_Data.length; i++){
    //             var SAL_AMT = parseFloat(SALDAT_Data[i].SAL_AMT);
    //             if(SAL_AMT == null || SAL_AMT == '' || SAL_AMT == undefined)SAL_AMT = 0;
    //             var RCTDET_Data = await RCTDET.find({BILL_NO:SALDAT_Data[i].BILL_NO},function(err,RCTDET){});
    //             var Broker_Code = await Account_master.findOne({'ACCode':SALDAT_Data[i].BROK_CODE},function(err){});
    //             var Sale_Man = await Account_master.findOne({'ACCode':SALDAT_Data[i].SMAN_CODE},function(err){});
    //             var CityName = SALDAT_Data[i].SAL_PLACE;
    //             if(RCTDET_Data != null){
    //                 var pcode = '';
    //                 for(let j=0; j<RCTDET_Data.length; j++){
    //                     if(SAL_AMT > 0){
    //                         if(j==0)pcode = RCTDET_Data[j].CR_ACC;
    //                         if(RCTDET_Data[j].CASH_AMT == null || RCTDET_Data[j].CASH_AMT == '' || RCTDET_Data[j].CASH_AMT == undefined)RCTDET_Data[j].CASH_AMT = 0;
    //                         if(RCTDET_Data[j].CR_CHGS == null || RCTDET_Data[j].CR_CHGS == '' || RCTDET_Data[j].CR_CHGS == undefined)RCTDET_Data[j].CR_CHGS = 0;
    //                         if(RCTDET_Data[j].INT_AMT == null || RCTDET_Data[j].INT_AMT == '' || RCTDET_Data[j].INT_AMT == undefined)RCTDET_Data[j].INT_AMT = 0;
    //                         if(RCTDET_Data[j].CHITHI_AMT == null || RCTDET_Data[j].CHITHI_AMT == '' || RCTDET_Data[j].CHITHI_AMT == undefined)RCTDET_Data[j].CHITHI_AMT = 0;
    //                         if(RCTDET_Data[j].KASAR_AMT == null || RCTDET_Data[j].KASAR_AMT == '' || RCTDET_Data[j].KASAR_AMT == undefined)RCTDET_Data[j].KASAR_AMT = 0;
    //                         if(RCTDET_Data[j].DISC_AMT == null || RCTDET_Data[j].DISC_AMT == '' || RCTDET_Data[j].DISC_AMT == undefined)RCTDET_Data[j].DISC_AMT = 0;
    //                         var cashamt = parseFloat(RCTDET_Data[j].CASH_AMT)+parseFloat(RCTDET_Data[j].DISC_AMT)+parseFloat(RCTDET_Data[j].KASAR_AMT);
    //                         SAL_AMT = SAL_AMT - cashamt// + (parseFloat(RCTDET_Data[j].CR_CHGS)+parseFloat(RCTDET_Data[j].CHITHI_AMT));//parseFloat(RCTDET_Data[j].INT_AMT)+
    //                     }
    //                 }
    //                 if(SAL_AMT>0){
    //                     if(SALDAT_Data[i].SAL_PLACE == null || SALDAT_Data[i].SAL_PLACE == '' || SALDAT_Data[i].SAL_PLACE == undefined)SALDAT_Data[i].SAL_PLACE = '';
                        
    //                     if(SALDAT_Data[i].SAL_NAR == null || SALDAT_Data[i].SAL_NAR == '' || SALDAT_Data[i].SAL_NAR == undefined)SALDAT_Data[i].SAL_NAR = '';
    //                     var qry = {};
    //                     if(pcode == 'CHQR')qry = {ACName:SALDAT_Data[i].SAL_NAR};
    //                     else qry = {ACCode:pcode};
    //                     var PartyCode = await Account_master.find(qry,function(err,aa){});
    //                     // var PartyCode = await Account_master.aggregate(
    //                     //     [   { $match: qry},
    //                     //         { 
    //                     //             "$project" : {
    //                     //                 "_id" : "_id", 
    //                     //                 "accountSchema" : "$$ROOT",
    //                     //             }
    //                     //         }, 
    //                     //         { 
    //                     //             "$lookup" : {
    //                     //                 "localField" : "accountSchema.CityName", 
    //                     //                 "from" : "citySchema", 
    //                     //                 "foreignField" : "_id", 
    //                     //                 "as" : "citySchema"
    //                     //             },
    //                     //         }, 
    //                     //         { 
    //                     //             "$unwind" : {
    //                     //                 "path" : "$citySchema", 
    //                     //                 "preserveNullAndEmptyArrays" : true
    //                     //             }
    //                     //         }, 
    //                     //         { 
    //                     //             "$match" : {
    //                     //                 "citySchema.CityName": CityName,
    //                     //             }
    //                     //         }, 
    //                     //         { 
    //                     //             "$project" : {
    //                     //                 "accountSchema._id" : "$accountSchema._id", 
    //                     //                 "accountSchema.ACName" : "$accountSchema.ACName", 
    //                     //                 "citySchema.CityName" : "$citySchema.CityName",
    //                     //             }
    //                     //         }
    //                     //     ], 
    //                     //     async function (err, prdt){});
    //                         // console.log(i,'PartyCode',PartyCode,qry);
    //                         if(PartyCode == null || PartyCode == '' || PartyCode == [])flag=1
    //                         else{
    //                             var DateObject =  moment('31/03/2020', "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //                             var DateMiliSeconds = DateObject.format('x');
    //                             count=count+1
    //                             // console.log(SALDAT_Data[i].BILL_NO,'SAL_AMT OB',SAL_AMT,   'Party',SALDAT_Data[i].SAL_NAR);
    //                             // console.log(count,'PartyCode',PartyCode[0].accountSchema._id,PartyCode[0].accountSchema.ACName,'City Name',PartyCode[0].citySchema.CityName);
    //                             let OP = new oposmodule();
    //                             OP.main_bk   = 'OPOS';
    //                             OP.c_j_s_p   = 'SB';
    //                             OP.OS_Type   = 'SB';
    //                             OP.OS_Book   = 'SB';
    //                             OP.partyBillNo = SALDAT_Data[i].BILL_NO;
    //                             var bill_no = SALDAT_Data[i].BILL_NO;
    //                             var bill_no = bill_no.replace(/[&\/\\#,+()$~%.'":*?<>{}] /g, "");
    //                             if(bill_no==null||bill_no == '' || isNaN(bill_no))OP.vouc_code = 0;
    //                             else OP.vouc_code = parseInt(bill_no);

    //                             OP.d_c       = 'D';
    //                             OP.Chr       = ''
    //                             OP.cash_date = DateObject;
    //                             OP.cash_edatemilisecond = DateMiliSeconds; 

    //                             // OP.cashac_name = PartyCode[0].accountSchema._id;
    //                             OP.cashac_name = PartyCode[0]._id;

    //                             if(Broker_Code != null)OP.broker_Code = Broker_Code._id;
    //                             if(Sale_Man != null)OP.sl_Person = Sale_Man._id;
                                
    //                             OP.Bill_Amount = SALDAT_Data[i].SAL_AMT;
    //                             OP.partyBillDate = SALDAT_Data[i].SAL_DATE;
    //                             OP.discount = '0';
    //                             OP.cash_amount = SAL_AMT;
    //                             OP.Add_Ded_Amt_Tot = '0'
    //                             OP.outstanding_balance = SAL_AMT;
    //                             OP.Rec_Amount = '0';
    //                             OP.Less_Ded_Amt_Tot = '0';
                                
    //                             OP.cr_Days = '';
    //                             OP.cash_remarks= 'Opening Outstanding';
    //                             OP.del =  'N';
    //                             OP.entrydate =  new Date();
    //                             OP.co_code =  req.session.compid;
    //                             OP.div_code =  req.session.divid;
    //                             OP.usrnm =  req.session.user;
    //                             OP.masterid =   req.session.masterid;
    //                             OP.save(function (err){
    //                                 if(err){
    //                                     console.log('Erroe',err);
    //                                 }else{
    //                                     console.log(count,'success');
    //                                 }
    //                             });
    //                             SALDAT.update({_id:SALDAT_Data[i]._id},{del:'Y'},function(err){
    //                                 if(err)console.log('Update Error',err);
    //                                 else{console.log(count,'Update Success')};
    //                             });
    //                         }
    //                 }

    //             }else{
    //                 var qry = {ACName:SALDAT_Data[i].SAL_NAR};
    //                 var PartyCode_withOut_Rec = await Account_master.find(qry,function(err,aa){});
    //                 // var PartyCode_withOut_Rec = await Account_master.aggregate(
    //                 //     [   { $match: qry},
    //                 //         { 
    //                 //             "$project" : {
    //                 //                 "_id" : "_id", 
    //                 //                 "accountSchema" : "$$ROOT",
    //                 //             }
    //                 //         }, 
    //                 //         { 
    //                 //             "$lookup" : {
    //                 //                 "localField" : "accountSchema.CityName", 
    //                 //                 "from" : "citySchema", 
    //                 //                 "foreignField" : "_id", 
    //                 //                 "as" : "citySchema"
    //                 //             },
    //                 //         }, 
    //                 //         { 
    //                 //             "$unwind" : {
    //                 //                 "path" : "$citySchema", 
    //                 //                 "preserveNullAndEmptyArrays" : true
    //                 //             }
    //                 //         }, 
    //                 //         { 
    //                 //             "$match" : {
    //                 //                 "citySchema.CityName": CityName,
    //                 //             }
    //                 //         }, 
    //                 //         { 
    //                 //             "$project" : {
    //                 //                 "accountSchema._id" : "$accountSchema._id", 
    //                 //                 "accountSchema.ACName" : "$accountSchema.ACName", 
    //                 //                 "citySchema.CityName" : "$citySchema.CityName",
    //                 //             }
    //                 //         }
    //                 //     ], 
    //                 //     async function (err, prdt){});
    //                 // console.log(i,'PartyCode_withOut_Rec',PartyCode_withOut_Rec);
    //                 if(PartyCode_withOut_Rec == null || PartyCode_withOut_Rec == '' || PartyCode_withOut_Rec == [])flag=1
    //                 else{
    //                     if(SALDAT_Data[i].SAL_AMT == null || SALDAT_Data[i].SAL_AMT == '' || SALDAT_Data[i].SAL_AMT == undefined)SALDAT_Data[i].SAL_AMT = 0;
    //                     var DateObject =  moment('31/03/2020', "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //                     var DateMiliSeconds = DateObject.format('x');
    //                     count=count+1
    //                     let OP = new oposmodule();
    //                     OP.main_bk   = 'OPOS';
    //                     OP.c_j_s_p   = 'SB';
    //                     OP.OS_Type   = 'SB';
    //                     OP.OS_Book   = 'SB';
    //                     OP.partyBillNo = SALDAT_Data[i].BILL_NO;
    //                     var bill_no = SALDAT_Data[i].BILL_NO;
    //                     var bill_no = bill_no.replace(/[&\/\\#,+()$~%.'":*?<>{}] /g, "");
    //                     if(bill_no==null||bill_no == '' || isNaN(bill_no))OP.vouc_code = 0;
    //                     else OP.vouc_code = parseInt(bill_no);

    //                     OP.d_c       = 'D';
    //                     OP.Chr       = ''
    //                     OP.cash_date = DateObject;
    //                     OP.cash_edatemilisecond = DateMiliSeconds; 

    //                     // OP.cashac_name = PartyCode_withOut_Rec[0].accountSchema._id;
    //                     OP.cashac_name = PartyCode_withOut_Rec[0]._id;
                        
    //                     if(Broker_Code != null)OP.broker_Code = Broker_Code._id;
    //                     if(Sale_Man != null)OP.sl_Person = Sale_Man._id;
                        
    //                     OP.Bill_Amount = SALDAT_Data[i].SAL_AMT;
    //                     OP.partyBillDate = SALDAT_Data[i].SAL_DATE;
    //                     OP.discount = '0';
    //                     OP.cash_amount = SALDAT_Data[i].SAL_AMT;
    //                     OP.Add_Ded_Amt_Tot = '0'
    //                     OP.outstanding_balance = SALDAT_Data[i].SAL_AMT;
    //                     OP.Rec_Amount = '0';
    //                     OP.Less_Ded_Amt_Tot = '0';
                        
    //                     OP.cr_Days = '';
    //                     OP.cash_remarks= 'Opening Outstanding';
    //                     OP.del =  'N';
    //                     OP.entrydate =  new Date();
    //                     OP.co_code =  req.session.compid;
    //                     OP.div_code =  req.session.divid;
    //                     OP.usrnm =  req.session.user;
    //                     OP.masterid =   req.session.masterid;
    //                     OP.save(function (err){
    //                         if(err){
    //                             console.log('Erroe',err);
    //                         }else{
    //                             console.log(count,'success');
    //                         }
    //                     });
    //                     SALDAT.update({_id:SALDAT_Data[i]._id},{del:'Y'},function(err){
    //                         if(err)console.log('Update Error',err);
    //                         else{console.log(count,'Update Success')};
    //                     });
    //                 }
    //             }
    //             SALDAT.update({_id:SALDAT_Data[i]._id},{Out_Update:'Y'},function(err){
    //                 if(err)console.log('Update Error',err);
    //                 else{console.log(count,'Update Success')};
    //             });
    //         }
    //         console.log('Complete');
    //         res.json({'success':true});
    //     }).limit(1000);
    // });


    // SALDAT.updateMany({},{del:'N'},function(err){
    //     if(err)console.log('Update Error',err);
    //     else{console.log('Update Success')};
    // }); 
    // vouchMast.find({$or:[{Module:'Garu Aavak Entry'},{Module:'Sale Entry'}],Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
    //     SALDAT.find({del:'N'},async function(err,SALDAT_Data){
    //         console.log('SALDAT_Data langht',SALDAT_Data.length);
    //         var count = 0
    //         for(let i=0; i<SALDAT_Data.length; i++){
    //             var SAL_AMT = parseFloat(SALDAT_Data[i].BILLAMT);
    //             if(SAL_AMT == null || SAL_AMT == '' || SAL_AMT == undefined)SAL_AMT = 0;
    //             var Broker_Code = await Account_master.findOne({$or:[{'ACCode':SALDAT_Data[i].BROKER},{'ACName':SALDAT_Data[i].BROKERNAME}]},function(err){});
    //             var CityName = SALDAT_Data[i].PLACE;
    //             var qry = {ACName:SALDAT_Data[i].PARTY};
    //             var PartyCode = await Account_master.aggregate(
    //                         [   { $match: qry},
    //                             { 
    //                                 "$project" : {
    //                                     "_id" : "_id", 
    //                                     "accountSchema" : "$$ROOT",
    //                                 }
    //                             }, 
    //                             { 
    //                                 "$lookup" : {
    //                                     "localField" : "accountSchema.CityName", 
    //                                     "from" : "citySchema", 
    //                                     "foreignField" : "_id", 
    //                                     "as" : "citySchema"
    //                                 },
    //                             }, 
    //                             { 
    //                                 "$unwind" : {
    //                                     "path" : "$citySchema", 
    //                                     "preserveNullAndEmptyArrays" : true
    //                                 }
    //                             }, 
    //                             { 
    //                                 "$match" : {
    //                                     "citySchema.CityName": CityName,
    //                                 }
    //                             }, 
    //                             { 
    //                                 "$project" : {
    //                                     "accountSchema._id" : "$accountSchema._id", 
    //                                     "accountSchema.ACName" : "$accountSchema.ACName", 
    //                                     "citySchema.CityName" : "$citySchema.CityName",
    //                                 }
    //                             }
    //                         ], 
    //                         async function (err, prdt){});
    //             if(PartyCode == null || PartyCode == '' || PartyCode == []){
    //                 //#######################################################
    //                     let account = new Account_master();
    //                     account.ACName = 'req.body.ac_name';
    //                     account.ACCode = 'req.body.ac_code';
    //                     account.OpBalance = 0;
    //                     var cityName = await city.find({CityName:CityName},function(err,aa){});
    //                     if(cityName == null || cityName == '' || cityName == undefined || cityName == [])falg=1
    //                     else account.CityName = cityName[0]._id;
    //                     account.GroupName = mongoose.Types.ObjectId('5e607f9e83811f0ed8ec267d');
    //                     account.del =  'N';
    //                     account.usrnm =  req.session.user;
    //                     account.masterid =   req.session.masterid;
    //                     account.save();
    //                 //#######################################################
    //                 // console.log(i,'PartyCode null',PartyCode,account._id)
    //                 // var date = JSON.stringify(SALDAT_Data[i].DATE);
    //                 // var new_date1 = date.charAt(4);
    //                 // var new_date2 = date.charAt(5);
    //                 // var new_date3 = date.charAt(6);
    //                 // console.log(i,new_date1,new_date2,new_date3);
    //                 var DateObject =  moment('31/03/2020', "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //                 var DateMiliSeconds = DateObject.format('x');
    //                 count = count + 1;

    //                 let OP = new oposmodule();
    //                 OP.main_bk   = 'OPOS';
    //                 OP.c_j_s_p   = 'SB';
    //                 OP.OS_Type   = 'SB';
    //                 OP.OS_Book   = 'SB';
    //                 OP.partyBillNo = SALDAT_Data[i].BILLNO;
    //                 var bill_no = SALDAT_Data[i].BILLNO;
    //                 var bill_no = bill_no.replace(/[&\/\\#,+()$~%.'":*?<>{}] /g, "");
    //                 if(bill_no==null||bill_no == '' || isNaN(bill_no))OP.vouc_code = 0;
    //                 else OP.vouc_code = parseInt(bill_no);

    //                 OP.d_c       = 'D';
    //                 OP.Chr       = ''
    //                 OP.cash_date = DateObject;
    //                 OP.cash_edatemilisecond = DateMiliSeconds; 

    //                 // OP.cashac_name = PartyCode[0].accountSchema._id;
    //                 OP.cashac_name = account._id;

    //                 if(Broker_Code != null)OP.broker_Code = Broker_Code._id;
    //                 // if(Sale_Man != null)OP.sl_Person = Sale_Man._id;
                    
    //                 OP.Bill_Amount = SALDAT_Data[i].BILLAMT;
    //                 OP.partyBillDate = SALDAT_Data[i].DATE;
    //                 OP.discount = '0';
    //                 OP.cash_amount = SALDAT_Data[i].BILLAMT;
    //                 OP.Add_Ded_Amt_Tot = '0'
    //                 OP.outstanding_balance = SALDAT_Data[i].BALANCE;
    //                 OP.Rec_Amount = '0';
    //                 OP.Less_Ded_Amt_Tot = '0';
                    
    //                 OP.cr_Days = '';
    //                 OP.cash_remarks= 'Opening Outstanding';
    //                 OP.del =  'N';
    //                 OP.entrydate =  new Date();
    //                 OP.co_code =  req.session.compid;
    //                 OP.div_code =  req.session.divid;
    //                 OP.usrnm =  req.session.user;
    //                 OP.masterid =   req.session.masterid;
    //                 OP.save(function (err){
    //                     if(err)console.log('Erroe',err);
    //                     else console.log(count,'success');
    //                 });
    //                 SALDAT.update({_id:SALDAT_Data[i]._id},{del:'Y'},function(err){
    //                     if(err)console.log('Update Error',err);
    //                     else{console.log('Update Success')};
    //                 });
    //             }else{
    //                 // var date = JSON.stringify(SALDAT_Data[i].DATE);
    //                 // var new_date1 = date.charAt(4);
    //                 // var new_date2 = date.charAt(5);
    //                 // var new_date3 = date.charAt(6);
    //                 // console.log(i,new_date1,new_date2,new_date3);
    //                 var DateObject =  moment('31/03/2020', "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //                 var DateMiliSeconds = DateObject.format('x');
    //                 count=count+1
    //                 let OP = new oposmodule();
    //                 OP.main_bk   = 'OPOS';
    //                 OP.c_j_s_p   = 'SB';
    //                 OP.OS_Type   = 'SB';
    //                 OP.OS_Book   = 'SB';
    //                 OP.partyBillNo = SALDAT_Data[i].BILLNO;
    //                 var bill_no = SALDAT_Data[i].BILLNO;
    //                 var bill_no = bill_no.replace(/[&\/\\#,+()$~%.'":*?<>{}] /g, "");
    //                 if(bill_no==null||bill_no == '' || isNaN(bill_no))OP.vouc_code = 0;
    //                 else OP.vouc_code = parseInt(bill_no);

    //                 OP.d_c       = 'D';
    //                 OP.Chr       = '';
    //                 OP.cash_date = DateObject;
    //                 OP.cash_edatemilisecond = DateMiliSeconds; 

    //                 OP.cashac_name = PartyCode[0].accountSchema._id;
    //                 // OP.cashac_name = PartyCode[0]._id;

    //                 if(Broker_Code != null)OP.broker_Code = Broker_Code._id;
    //                 // if(Sale_Man != null)OP.sl_Person = Sale_Man._id;
                    
    //                 OP.Bill_Amount = SALDAT_Data[i].BILLAMT;
    //                 OP.partyBillDate = SALDAT_Data[i].DATE;
    //                 OP.discount = '0';
    //                 OP.cash_amount = SALDAT_Data[i].BILLAMT;
    //                 OP.Add_Ded_Amt_Tot = '0'
    //                 OP.outstanding_balance = SALDAT_Data[i].BALANCE;
    //                 OP.Rec_Amount = '0';
    //                 OP.Less_Ded_Amt_Tot = '0';
                    
    //                 OP.cr_Days = '';
    //                 OP.cash_remarks= 'Opening Outstanding';
    //                 OP.del =  'N';
    //                 OP.entrydate =  new Date();
    //                 OP.co_code =  req.session.compid;
    //                 OP.div_code =  req.session.divid;
    //                 OP.usrnm =  req.session.user;
    //                 OP.masterid =   req.session.masterid;
    //                 OP.save(function (err){
    //                     if(err){
    //                         console.log('Erroe',err);
    //                     }else{
    //                         console.log(count,'success');
    //                     }
    //                 });
    //                 SALDAT.update({_id:SALDAT_Data[i]._id},{del:'Y'},function(err){
    //                     if(err)console.log('Update Error',err);
    //                     else{console.log('Update Success')};
    //                 });
    //             }
    //         }
    //         console.log('Complete');
    //         res.json({'success':true});
    //     }).limit(1000);
    // });


    // oposmodule.find({},async function(err,SALDAT_Data){
    //     // console.log('SALDAT_Data langht',SALDAT_Data.length);
    //     var count = 0
    //     for(let i=0; i<SALDAT_Data.length; i++){
    //         if(SALDAT_Data[i].partyBillDate == null || SALDAT_Data[i].partyBillDate == '' || SALDAT_Data[i].partyBillDate == null == undefined)SALDAT_Data[i].partyBillDate == '31/03/2020'; 
    //             var DateObject =  moment(SALDAT_Data[i].partyBillDate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //             var DateMiliSeconds = DateObject.format('x');
    //             // console.log(i,DateObject,moment(DateObject).format('DD/MM/YYYY'),DateMiliSeconds);
    //             let OP = {};
    //             OP.cash_date = DateObject;
    //             OP.cash_edatemilisecond = DateMiliSeconds; 
    //             var qry = {_id:SALDAT_Data[i]._id};
    //             oposmodule.update(qry,OP,function (err){
    //                 if(err)console.log('Erroe',err);
    //                 else console.log(i,'success');
    //             });
    //     }
    //     console.log('Complete');
    //     res.json({'success':true});
    // });

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

// [   { $match: qry},
//     { 
//         "$project" : {
//             "_id" : "_id", 
//             "outstanding" : "$$ROOT",
//         }
//     }, 
//     { 
//         "$lookup" : {
//             "localField" : "outstanding.cashac_name", 
//             "from" : "accountSchema", 
//             "foreignField" : "_id", 
//             "as" : "accountSchema"
//         },
//     }, 
//     { 
//         "$unwind" : {
//             "path" : "$accountSchema", 
//             "preserveNullAndEmptyArrays" : true
//         }
//     }, 
//     { 
//         "$group" : {
//             "accountSchema.ACName" : "$accountSchema.ACName",
//             "accountSchema.CityName" : "$accountSchema.CityName",
//         }
//     }, 
// ],
router.get('/FindOpeningOutstanding',async function(req, res){
    var qry = {main_bk:'OPOS',DUB_PARTY:'V',outstanding_balance:{$gt:0}};
    var OP_Oustanding_Entry = await oposmodule.find(qry,async function (err, prdt){}).populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema'}}]);
        console.log('OP_Oustanding_Entry',OP_Oustanding_Entry.length);
        var count = 0
        console.log()
        for(let i=0; i<OP_Oustanding_Entry.length; i++){
            // var city = '';
            // city = OP_Oustanding_Entry[i].cashac_name.CityName.CityName
            // console.log(i,count++,OP_Oustanding_Entry[i].partyBillNo,OP_Oustanding_Entry[i].cashac_name.ACName,'######',city)
            var Old_Out = await SALDAT.find({PARTY:OP_Oustanding_Entry[i].cashac_name.ACName,PLACE:OP_Oustanding_Entry[i].cashac_name.CityName.CityName},async function(err,SALDAT_Data){});
            var acc = await Account_master.find({ACName:OP_Oustanding_Entry[i].cashac_name.ACName,CityName:OP_Oustanding_Entry[i].cashac_name.CityName._id},function(err,aa){}).populate('CityName');
            for(let j=0; j<Old_Out.length; j++){
                // console.log(i,count++,Old_Out[j].BILLNO,acc[0]._id,acc[0].CityName.CityName);
                var accObj = {};
                accObj.cashac_name = acc[0]._id;
                accObj.DUB_PARTY = 'N';
                var qry = {partyBillNo:Old_Out[j].BILLNO,DUB_PARTY:'V'};
                oposmodule.update(qry,accObj,function(err){
                    if(err)console.log(err);
                    else console.log(count++,'success');
                })
            }
        }


    // SALDAT.find({del:'N'},async function(err,SALDAT_Data){
    //     var count = 0
    //     for(let i=0; i<SALDAT_Data.length; i++){
    //         var SAL_AMT = parseFloat(SALDAT_Data[i].BILLAMT);
    //         if(SAL_AMT == null || SAL_AMT == '' || SAL_AMT == undefined)SAL_AMT = 0;
    //         var Broker_Code = await Account_master.findOne({$or:[{'ACCode':SALDAT_Data[i].BROKER},{'ACName':SALDAT_Data[i].BROKERNAME}]},function(err){});
    //         var CityName = SALDAT_Data[i].PLACE;
    //         var qry = {ACName:SALDAT_Data[i].PARTY};
    //         var PartyCode = await Account_master.aggregate(
    //                     [   { $match: qry},
    //                         { 
    //                             "$project" : {
    //                                 "_id" : "_id", 
    //                                 "accountSchema" : "$$ROOT",
    //                             }
    //                         }, 
    //                         { 
    //                             "$lookup" : {
    //                                 "localField" : "accountSchema.CityName", 
    //                                 "from" : "citySchema", 
    //                                 "foreignField" : "_id", 
    //                                 "as" : "citySchema"
    //                             },
    //                         }, 
    //                         { 
    //                             "$unwind" : {
    //                                 "path" : "$citySchema", 
    //                                 "preserveNullAndEmptyArrays" : true
    //                             }
    //                         }, 
    //                         { 
    //                             "$match" : {
    //                                 "citySchema.CityName": CityName,
    //                             }
    //                         }, 
    //                         { 
    //                             "$project" : {
    //                                 "accountSchema._id" : "$accountSchema._id", 
    //                                 "accountSchema.ACName" : "$accountSchema.ACName", 
    //                                 "citySchema.CityName" : "$citySchema.CityName",
    //                             }
    //                         }
    //                     ], 
    //                     async function (err, prdt){});
    //         if(PartyCode == null || PartyCode == '' || PartyCode == []){
    //             //#######################################################
    //                 let account = new Account_master();
    //                 account.ACName = 'req.body.ac_name';
    //                 account.ACCode = 'req.body.ac_code';
    //                 account.OpBalance = 0;
    //                 var cityName = await city.find({CityName:CityName},function(err,aa){});
    //                 if(cityName == null || cityName == '' || cityName == undefined || cityName == [])falg=1
    //                 else account.CityName = cityName[0]._id;
    //                 account.GroupName = mongoose.Types.ObjectId('5e607f9e83811f0ed8ec267d');
    //                 account.del =  'N';
    //                 account.usrnm =  req.session.user;
    //                 account.masterid =   req.session.masterid;
    //                 account.save();
    //             //#######################################################
    //             // console.log(i,'PartyCode null',PartyCode,account._id)
    //             // var date = JSON.stringify(SALDAT_Data[i].DATE);
    //             // var new_date1 = date.charAt(4);
    //             // var new_date2 = date.charAt(5);
    //             // var new_date3 = date.charAt(6);
    //             // console.log(i,new_date1,new_date2,new_date3);
    //             var DateObject =  moment('31/03/2020', "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //             var DateMiliSeconds = DateObject.format('x');
    //             count = count + 1;

    //             let OP = new oposmodule();
    //             OP.main_bk   = 'OPOS';
    //             OP.c_j_s_p   = 'SB';
    //             OP.OS_Type   = 'SB';
    //             OP.OS_Book   = 'SB';
    //             OP.partyBillNo = SALDAT_Data[i].BILLNO;
    //             var bill_no = SALDAT_Data[i].BILLNO;
    //             var bill_no = bill_no.replace(/[&\/\\#,+()$~%.'":*?<>{}] /g, "");
    //             if(bill_no==null||bill_no == '' || isNaN(bill_no))OP.vouc_code = 0;
    //             else OP.vouc_code = parseInt(bill_no);

    //             OP.d_c       = 'D';
    //             OP.Chr       = ''
    //             OP.cash_date = DateObject;
    //             OP.cash_edatemilisecond = DateMiliSeconds; 

    //             // OP.cashac_name = PartyCode[0].accountSchema._id;
    //             OP.cashac_name = account._id;

    //             if(Broker_Code != null)OP.broker_Code = Broker_Code._id;
    //             // if(Sale_Man != null)OP.sl_Person = Sale_Man._id;
                
    //             OP.Bill_Amount = SALDAT_Data[i].BILLAMT;
    //             OP.partyBillDate = SALDAT_Data[i].DATE;
    //             OP.discount = '0';
    //             OP.cash_amount = SALDAT_Data[i].BILLAMT;
    //             OP.Add_Ded_Amt_Tot = '0'
    //             OP.outstanding_balance = SALDAT_Data[i].BALANCE;
    //             OP.Rec_Amount = '0';
    //             OP.Less_Ded_Amt_Tot = '0';
                
    //             OP.cr_Days = '';
    //             OP.cash_remarks= 'Opening Outstanding';
    //             OP.del =  'N';
    //             OP.entrydate =  new Date();
    //             OP.co_code =  req.session.compid;
    //             OP.div_code =  req.session.divid;
    //             OP.usrnm =  req.session.user;
    //             OP.masterid =   req.session.masterid;
    //             OP.save(function (err){
    //                 if(err)console.log('Erroe',err);
    //                 else console.log(count,'success');
    //             });
    //             SALDAT.update({_id:SALDAT_Data[i]._id},{del:'Y'},function(err){
    //                 if(err)console.log('Update Error',err);
    //                 else{console.log('Update Success')};
    //             });
    //         }else{
    //             // var date = JSON.stringify(SALDAT_Data[i].DATE);
    //             // var new_date1 = date.charAt(4);
    //             // var new_date2 = date.charAt(5);
    //             // var new_date3 = date.charAt(6);
    //             // console.log(i,new_date1,new_date2,new_date3);
    //             var DateObject =  moment('31/03/2020', "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //             var DateMiliSeconds = DateObject.format('x');
    //             count=count+1
    //             let OP = new oposmodule();
    //             OP.main_bk   = 'OPOS';
    //             OP.c_j_s_p   = 'SB';
    //             OP.OS_Type   = 'SB';
    //             OP.OS_Book   = 'SB';
    //             OP.partyBillNo = SALDAT_Data[i].BILLNO;
    //             var bill_no = SALDAT_Data[i].BILLNO;
    //             var bill_no = bill_no.replace(/[&\/\\#,+()$~%.'":*?<>{}] /g, "");
    //             if(bill_no==null||bill_no == '' || isNaN(bill_no))OP.vouc_code = 0;
    //             else OP.vouc_code = parseInt(bill_no);

    //             OP.d_c       = 'D';
    //             OP.Chr       = '';
    //             OP.cash_date = DateObject;
    //             OP.cash_edatemilisecond = DateMiliSeconds; 

    //             OP.cashac_name = PartyCode[0].accountSchema._id;
    //             // OP.cashac_name = PartyCode[0]._id;

    //             if(Broker_Code != null)OP.broker_Code = Broker_Code._id;
    //             // if(Sale_Man != null)OP.sl_Person = Sale_Man._id;
                
    //             OP.Bill_Amount = SALDAT_Data[i].BILLAMT;
    //             OP.partyBillDate = SALDAT_Data[i].DATE;
    //             OP.discount = '0';
    //             OP.cash_amount = SALDAT_Data[i].BILLAMT;
    //             OP.Add_Ded_Amt_Tot = '0'
    //             OP.outstanding_balance = SALDAT_Data[i].BALANCE;
    //             OP.Rec_Amount = '0';
    //             OP.Less_Ded_Amt_Tot = '0';
                
    //             OP.cr_Days = '';
    //             OP.cash_remarks= 'Opening Outstanding';
    //             OP.del =  'N';
    //             OP.entrydate =  new Date();
    //             OP.co_code =  req.session.compid;
    //             OP.div_code =  req.session.divid;
    //             OP.usrnm =  req.session.user;
    //             OP.masterid =   req.session.masterid;
    //             OP.save(function (err){
    //                 if(err){
    //                     console.log('Erroe',err);
    //                 }else{
    //                     console.log(count,'success');
    //                 }
    //             });
    //             SALDAT.update({_id:SALDAT_Data[i]._id},{del:'Y'},function(err){
    //                 if(err)console.log('Update Error',err);
    //                 else{console.log('Update Success')};
    //             });
    //         }
    //     }
    //     console.log('Complete');
    //     res.json({'success':true});
    // }).limit(1000);

    // oposmodule.find({},async function(err,SALDAT_Data){
    //     // console.log('SALDAT_Data langht',SALDAT_Data.length);
    //     var count = 0
    //     for(let i=0; i<SALDAT_Data.length; i++){
    //         if(SALDAT_Data[i].partyBillDate == null || SALDAT_Data[i].partyBillDate == '' || SALDAT_Data[i].partyBillDate == null == undefined)SALDAT_Data[i].partyBillDate == '31/03/2020'; 
    //             var DateObject =  moment(SALDAT_Data[i].partyBillDate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //             var DateMiliSeconds = DateObject.format('x');
    //             // console.log(i,DateObject,moment(DateObject).format('DD/MM/YYYY'),DateMiliSeconds);
    //             let OP = {};
    //             OP.cash_date = DateObject;
    //             OP.cash_edatemilisecond = DateMiliSeconds; 
    //             var qry = {_id:SALDAT_Data[i]._id};
    //             oposmodule.update(qry,OP,function (err){
    //                 if(err)console.log('Erroe',err);
    //                 else console.log(i,'success');
    //             });
    //     }
    //     console.log('Complete');
    //     res.json({'success':true});
    // });
});
module.exports = router;