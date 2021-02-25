const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let cashmast = require('../models/trans');
let outstanding= require('../models/outstading_schema');
const moment = require('moment-timezone');
let accname = require('../models/accountSchema');
let addlessMast= require('../models/Add_Less_Parameter_Master_Schema');
var Gs_master = require('../models/gsTableSchema');
let vouchMast= require('../models/vouchSchema');
let Group= require('../models/groupSchema');
let division = require('../models/divSchema');
var query;

router.get('/AddLessMaster/:Module', function (req, res){
    console.log(req.params.Module)
    addlessMast.findOne({Module:req.params.Module,masterid:req.session.masterid},function(err, addlessmast){
        if(err){
            res.json({ 'success': false, 'Error':err});
        }else{
            var AddLessArr = [];
            if(addlessmast == null || addlessmast == '' || addlessmast == [])flag = 1;
            else{
                var addArr = addlessmast.Add_Less_Parameter_Master_Array;
                for(let i=0; i<addArr.length; i++){
                    if(addArr[i].Division == null || addArr[i].Division == undefined || addArr[i].Division == [] || addArr[i].Division == ''){
                        AddLessArr.push(addArr[i]); // If Division Arr are null than This Parameter Are Show In All Divisoin
                    }else{
                        for(let j = 0; j<addArr[i].Division.length; j++){
                            if(req.session.divid == addArr[i].Division[j]){
                                AddLessArr.push(addArr[i]);
                            }
                        }
                    }
                }
            }
            AddLessArr.sort(function(a, b){
                return a.Order-b.Order
            })
            addlessmast.Add_Less_Parameter_Master_Array = AddLessArr;
            res.json({ 'success': true, 'addlessmast':addlessmast});
        }
    }).sort('Add_Less_Parameter_Master_Array.Order');
});

router.get('/Debit_Note_List', ensureAuthenticated ,function(req,res){
    cashmast.find({main_bk:'DN',d_c:'D',co_code: req.session.compid,div_code:req.session.divid,del:'N',srno:0}, function (err, cashmast){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render('Debit_Note_List.hbs',{
                pageTitle:'Debit Note List',
                cashmast: cashmast,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
        }
    }).populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
    .populate([{path: 'cash_bank_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
});

router.get('/Debit_Note_Add', ensureAuthenticated, function(req, res){
    vouchMast.find({Module:'Debit Note',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
        cashmast.aggregate((
            [{ $match: { main_bk:"DN",c_j_s_p:vouchMast[0].Vo_book,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
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
            addlessMast.findOne({Module:'Debit Note',masterid:req.session.masterid},function(err, addlessmast){
                if (err) {
                    console.log(err);
                } else {
                    var AddLessArr = [];
                    if(addlessmast == null || addlessmast == '' || addlessmast == [])flag = 1;
                    else{
                        var addArr = addlessmast.Add_Less_Parameter_Master_Array;
                        for(let i=0; i<addArr.length; i++){
                            if(addArr[i].Division == null || addArr[i].Division == undefined || addArr[i].Division == [] || addArr[i].Division == ''){
                                AddLessArr.push(addArr[i]); // If Division Arr are null than This Parameter Are Show In All Divisoin
                            }else{
                                for(let j = 0; j<addArr[i].Division.length; j++){
                                    if(req.session.divid == addArr[i].Division[j]){
                                        AddLessArr.push(addArr[i]);
                                    }
                                }
                            }
                        }
                    }
                    AddLessArr.sort(function(a, b){
                        return a.Order-b.Order
                    })
                    addlessmast.Add_Less_Parameter_Master_Array = AddLessArr;

                    console.log(lastEntryNo);
                    var lastNo = 1;
                    if(lastEntryNo == null || lastEntryNo == '' || lastEntryNo == [])lastNo = 1;
                    else lastNo = parseInt(lastEntryNo[0]._id._id)+1;

                    res.render('Debit_Note_Add.hbs', {
                        pageTitle:'Debit Note Entry',
                        lastNo:lastNo,
                        divid:req.session.divid,
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
    addlessMast.findOne({Module:'Debit Note',masterid:req.session.masterid},async function(err, addlessmast){
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
            // Credit Account Entry
            let credit = new cashmast();
            credit.main_bk = "DN";
            credit.d_c     = "D";
            credit.srno    = 0;
            credit.c_j_s_p              = req.body.c_j_s_p;
            credit.vouc_code            = req.body.vouc_code;
            credit.cash_date            = DateObject;
            credit.cash_edatemilisecond = sodatemilisecond;
            // credit.deposit_date         = DateObject
            // credit.deposit_datemilisecond = sodatemilisecond
            credit.cashac_name          = req.body.Debit_AC;
            credit.cash_bank_name       = req.body.Credit_AC;

            credit.del                  = "N";
            credit.entrydate            = new Date();
            
            credit.cash_chequeno        = req.body.cash_chequeno;
            credit.cash_chequedate      = req.body.cash_chequedate;
            credit.Ref_Date             = req.body.Ref_Date;
            credit.cash_amount          = req.body.totcash_amt;
            credit.GST                  = req.body.GST;
            credit.Amount               = req.body.Amount;
            credit.Qty                  = req.body.Qty;
            credit.Weight               = req.body.Weight;

            credit.Add_Amount_Deduction = 0;
            credit.Less_Amount_Deduction= 0;
            credit.cash_narrone         = req.body.cash_narrone;
            credit.cash_narrtwo         = req.body.cash_narrtwo;
            credit.totcash_amt          = req.body.totcash_amt;
            credit.cash_remarks         = req.body.cash_remarks;

            credit.addlessPar_CNDN      = req.body.addlessPar_CNDN;
            credit.outStandingArr       = req.body.outSaveArr
            credit.co_code              = req.session.compid;
            credit.div_code             = req.session.divid;
            credit.usrnm                = req.session.user;
            credit.masterid             = req.session.masterid
            credit.CNCL                 = 'N';
            cashmast.findOne({main_bk:'DN',vouc_code:req.body.vouc_code,c_j_s_p:req.body.c_j_s_p,del:'N',co_code:req.session.compid,div_code:req.session.divid},function(err,data){
                if(data == null || data == ''){
                    credit.save(async function (err){
                        if(err){
                            res.send("<script>alert('Entry Not Save Error "+err+"');window.location.href = '/Credit_Note/Credit_Note_Add'</script>");
                        }else{
                            // Debit Account Entry
                            let debit = new cashmast();
                            debit.DrNote_id = credit._id;
                            debit.main_bk = "DN";
                            debit.d_c     = "C";
                            debit.srno    = 0;
                            debit.c_j_s_p              = req.body.c_j_s_p;
                            debit.vouc_code            = req.body.vouc_code;
                            debit.cash_date            = DateObject;
                            debit.cash_edatemilisecond = sodatemilisecond;
                            // debit.deposit_date         = DateObject
                            // debit.deposit_datemilisecond = sodatemilisecond
                            debit.cashac_name          = req.body.Credit_AC;
                            debit.cash_bank_name       = req.body.Debit_AC;

                            debit.del                  = "N";
                            debit.entrydate            = new Date();
                            
                            debit.cash_chequeno        = req.body.cash_chequeno;
                            debit.cash_chequedate      = req.body.cash_chequedate;
                            debit.Ref_Date             = req.body.Ref_Date;
                            debit.cash_amount          = req.body.Amount;
                            debit.GST                  = req.body.GST;
                            debit.Amount               = req.body.Amount;
                            debit.Qty                  = req.body.Qty;
                            debit.Weight               = req.body.Weight;

                            debit.Add_Amount_Deduction = 0;
                            debit.Less_Amount_Deduction= 0;
                            debit.cash_narrone         = req.body.cash_narrone;
                            debit.cash_narrtwo         = req.body.cash_narrtwo;
                            debit.totcash_amt          = req.body.totcash_amt;
                            debit.cash_remarks         = req.body.cash_remarks;

                            debit.addlessPar_CNDN      = req.body.addlessPar_CNDN;
                            debit.outStandingArr       = req.body.outSaveArr
                            debit.co_code              = req.session.compid;
                            debit.div_code             = req.session.divid;
                            debit.usrnm                = req.session.user;
                            debit.masterid             = req.session.masterid
                            debit.CNCL          = 'N';
                            debit.save(function (err){});
                            // await new Promise((resolve, reject) => setTimeout(resolve, 200));
                            if(req.body.addlessPar_CNDN == [] || req.body.addlessPar_CNDN == undefined || req.body.addlessPar_CNDN == null)flag=1
                            else{
                                var Add_Array = req.body.addlessPar_CNDN;
                                for(let a=0; a<Add_Array.length; a++){
                                    for(let b=0; b<addlessmast.Add_Less_Parameter_Master_Array.length; b++){
                                        for(let c=0; c<addlessmast.Add_Less_Parameter_Master_Array[b].Division.length; c++){
                                            if(addlessmast.Add_Less_Parameter_Master_Array[b].Division[c] == req.session.divid && Add_Array[a].Parameter_id == addlessmast.Add_Less_Parameter_Master_Array[b]._id){
                                                let credit_posting = new cashmast();
                                                credit_posting.DrNote_id            = credit._id;
                                                credit_posting.main_bk_posting      = "DN_Posting"+a;
                                                credit_posting.srno                 = 100+parseInt(a);
                                                credit_posting.main_bk              = "DN";
                                                if(Add_Array[a].Parameter_Type == '+')credit_posting.d_c = "C";
                                                else credit_posting.d_c = "D";
                                                credit_posting.c_j_s_p              = req.body.c_j_s_p;
                                                
                                                credit_posting.vouc_code            = req.body.vouc_code;
                                                credit_posting.cash_date            = DateObject;
                                                credit_posting.cash_edatemilisecond = sodatemilisecond;
                                                credit_posting.cash_type            = req.body.cash_type;
                                                    
                                                credit_posting.del                  = "N";
                                                credit_posting.CNCL                  = "N";
                                                credit_posting.entrydate            = new Date();

                                                credit_posting.cash_bank_name       = req.body.Debit_AC; 
                                                credit_posting.cashac_name          = addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac;
                                                credit_posting.cash_chequeno        = req.body.cash_chequeno;
                                                credit_posting.cash_chequedate      = req.body.cash_chequedate;
                                                credit_posting.cash_amount          = Add_Array[a].Amount;
                                                credit_posting.Add_Amount_Deduction = 0;
                                                credit_posting.Less_Amount_Deduction= 0;
                                                credit_posting.cash_narrone         = req.body.cash_narrone;
                                                credit_posting.cash_narrtwo         = req.body.cash_narrtwo;
                                                credit_posting.totcash_amt          = req.body.totcash_amt;
                                                credit_posting.cash_remarks         = req.body.cash_remarks;
                                                credit_posting.co_code              = req.session.compid;
                                                credit_posting.div_code             = req.session.divid;
                                                credit_posting.usrnm                = req.session.user;
                                                credit_posting.masterid             = req.session.masterid
                                                credit_posting.save();
                                            }
                                        }
                                    }
                                }
                            }
                            
                            if(req.body.outSaveArr == null || req.body.outSaveArr == '' || req.body.outSaveArr == [] || req.body.outSaveArr == undefined)flag=1
                            else{
                                var outSaveArr = JSON.parse(req.body.outSaveArr);
                                for(let j=0; j<outSaveArr.length; j++){
                                    if(parseFloat(outSaveArr[j].ReceiveAmt) >0){
                                        let out = new outstanding();
                                            out.DrNote_id = credit._id;
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.main_bk = "OnAcc";
                                                out.OS_Type = 'ONA';
                                            }
                                            else out.main_bk = "DN";
                                            out.c_j_s_p = req.body.c_j_s_p;
                                            out.d_c ="D";
                                            out.CN_vouc_code = req.body.vouc_code; //Debit Note Vouc Code
                                            out.vouc_code = outSaveArr[j].vouc_code;
                                            out.cash_date = DateObject;
                                            out.cash_edatemilisecond = sodatemilisecond;
                                            out.cashac_name = req.body.Debit_AC;
                                            // out.cash_bank_name = req.body.cash_bank_name;
                                            out.cash_narrtwo = 'Oustanding';
                                            out.cash_narrone = 'Debit Not';
                                            out.del         = "N";
                                            out.entrydate   = new Date();
                                            out.cash_amount = outSaveArr[j].ReceiveAmt;
                                            out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                            out.Bill_Date   = outSaveArr[j].Bill_Date;
                                            out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                            // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                            // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                            if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                            out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                            out.outstanding_amount = outSaveArr[j].ReceiveAmt //Calulate Outstanding Balance For Bill Collection
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
                                            out.save();
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){

                                            }
                                            else{
                                                var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                                var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.CN_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                                OutSB.Out_recieved_Entry_Arr.push(arr);;
                                                var outObj = {};
                                                outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                                    if(err)console.log('Error',err)
                                                    else {}
                                                })
                                            }
                                    }
                                }
                            }
                            res.redirect('/Debit_Note/Debit_Note_Add');
                        }
                    });
                }else{
                    res.send("<script>alert('This Entry No. Is Already Exist');window.location.href = '/Debit_Note/Debit_Note_Add'</script>");
                }
            })
            
        }
    });
});

router.get('/Debit_Note_Update/:id', ensureAuthenticated, function(req, res){
     cashmast.findById(req.params.id, function (err,Credit_Note){
        vouchMast.find({Module:'Debit Note',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
            addlessMast.findOne({Module:'Debit Note',masterid:req.session.masterid},function(err, addlessmast){
                outstanding.find({DrNote_id:req.params.id,del:'N'},function(err,OutEntry){
                    if(Credit_Note != null){
                        Group.findById(Credit_Note.cashac_name.GroupName,function(err,group){
                            if (err) {
                                console.log(err);
                            } else {
                                var AddLessArr = [];
                                if(addlessmast == null || addlessmast == '' || addlessmast == [])flag = 1;
                                else{
                                    var addArr = addlessmast.Add_Less_Parameter_Master_Array;
                                    for(let i=0; i<addArr.length; i++){
                                        if(addArr[i].Division == null || addArr[i].Division == undefined || addArr[i].Division == [] || addArr[i].Division == ''){
                                            AddLessArr.push(addArr[i]); // If Division Arr are null than This Parameter Are Show In All Divisoin
                                        }else{
                                            for(let j = 0; j<addArr[i].Division.length; j++){
                                                if(req.session.divid == addArr[i].Division[j]){
                                                    AddLessArr.push(addArr[i]);
                                                }
                                            }
                                        }
                                    }
                                }
                                AddLessArr.sort(function(a, b){
                                    return a.Order-b.Order
                                })
                                addlessmast.Add_Less_Parameter_Master_Array = AddLessArr;
                                res.render('Debit_Note_Update.hbs',{
                                    pageTitle:'Update Debit Note',
                                    Credit_Note:Credit_Note,
                                    OutEntry:OutEntry,
                                    group:group,
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
                        })
                    }
                });
            }).sort('Add_Less_Parameter_Master_Array.Order');
        })
    }).populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
    .populate([{path: 'cash_bank_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}]);
});

router.post('/update/:id', function(req, res) {
    addlessMast.findOne({Module:'Debit Note',masterid:req.session.masterid},async function(err, addlessmast){
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
            // Credit Account Entry
            let credit = {};
            credit.main_bk = "DN";
            credit.d_c     = "D";
            credit.srno    = 0;
            credit.c_j_s_p              = req.body.c_j_s_p;
            credit.vouc_code            = req.body.vouc_code;
            credit.cash_date            = DateObject;
            credit.cash_edatemilisecond = sodatemilisecond;
            // credit.deposit_date         = DateObject
            // credit.deposit_datemilisecond = sodatemilisecond
            credit.cashac_name          = req.body.Debit_AC;
            credit.cash_bank_name       = req.body.Credit_AC;

            credit.del                  = "N";
            credit.entrydate            = new Date();
            
            credit.cash_chequeno        = req.body.cash_chequeno;
            credit.cash_chequedate      = req.body.cash_chequedate;
            credit.Ref_Date             = req.body.Ref_Date;
            credit.cash_amount          = req.body.totcash_amt;
            credit.GST                  = req.body.GST;
            credit.Amount               = req.body.Amount;
            credit.Qty                  = req.body.Qty;
            credit.Weight               = req.body.Weight;

            credit.Add_Amount_Deduction = 0;
            credit.Less_Amount_Deduction= 0;
            credit.cash_narrone         = req.body.cash_narrone;
            credit.cash_narrtwo         = req.body.cash_narrtwo;
            credit.totcash_amt          = req.body.totcash_amt;
            credit.cash_remarks         = req.body.cash_remarks;

            credit.addlessPar_CNDN      = req.body.addlessPar_CNDN;
            credit.outStandingArr       = req.body.outSaveArr
            credit.co_code              = req.session.compid;
            credit.div_code             = req.session.divid;
            credit.usrnm                = req.session.user;
            credit.masterid             = req.session.masterid
            credit.CNCL                 = 'N';
            var qry_credit = {_id:req.params.id};
            cashmast.update(qry_credit,credit,async function (err){
                if(err){
                    res.send("<script>alert('Entry Not Save Error "+err+"');window.location.href = '/Credit_Note/Credit_Note_Add'</script>");
                }else{
                    // Debit Account Entry
                    let debit = {};
                    debit.CrNote_id = req.params.id;
                    debit.main_bk = "DN";
                    debit.d_c     = "C";
                    debit.srno    = 0;
                    debit.c_j_s_p              = req.body.c_j_s_p;
                    debit.vouc_code            = req.body.vouc_code;
                    debit.cash_date            = DateObject;
                    debit.cash_edatemilisecond = sodatemilisecond;
                    // debit.deposit_date         = DateObject
                    // debit.deposit_datemilisecond = sodatemilisecond
                    debit.cashac_name          = req.body.Credit_AC;
                    debit.cash_bank_name       = req.body.Debit_AC;

                    debit.del                  = "N";
                    debit.entrydate            = new Date();
                    
                    debit.cash_chequeno        = req.body.cash_chequeno;
                    debit.cash_chequedate      = req.body.cash_chequedate;
                    debit.Ref_Date             = req.body.Ref_Date;
                    debit.cash_amount          = req.body.Amount;
                    debit.GST                  = req.body.GST;
                    debit.Amount               = req.body.Amount;
                    debit.Qty                  = req.body.Qty;
                    debit.Weight               = req.body.Weight;

                    debit.Add_Amount_Deduction = 0;
                    debit.Less_Amount_Deduction= 0;
                    debit.cash_narrone         = req.body.cash_narrone;
                    debit.cash_narrtwo         = req.body.cash_narrtwo;
                    debit.totcash_amt          = req.body.totcash_amt;
                    debit.cash_remarks         = req.body.cash_remarks;

                    debit.addlessPar_CNDN      = req.body.addlessPar_CNDN;
                    debit.outStandingArr       = req.body.outSaveArr
                    debit.co_code              = req.session.compid;
                    debit.div_code             = req.session.divid;
                    debit.usrnm                = req.session.user;
                    debit.masterid             = req.session.masterid
                    debit.CNCL          = 'N';

                    var qry_debit = {CrNote_id:req.params.id};
                    cashmast.update(qry_debit,debit,function (err){});
                    // await new Promise((resolve, reject) => setTimeout(resolve, 200));
                    if(req.body.addlessPar_CNDN == [] || req.body.addlessPar_CNDN == undefined || req.body.addlessPar_CNDN == null)flag=1
                    else{
                        var Add_Array = req.body.addlessPar_CNDN;
                        for(let a=0; a<Add_Array.length; a++){
                            for(let b=0; b<addlessmast.Add_Less_Parameter_Master_Array.length; b++){
                                for(let c=0; c<addlessmast.Add_Less_Parameter_Master_Array[b].Division.length; c++){
                                    if(addlessmast.Add_Less_Parameter_Master_Array[b].Division[c] == req.session.divid && Add_Array[a].Parameter_id == addlessmast.Add_Less_Parameter_Master_Array[b]._id){
                                        if(Add_Array[a].id == null || Add_Array[a].id == '' || Add_Array[a].id == undefined){
                                            let credit_posting = new cashmast();
                                            credit_posting.DrNote_id            = req.params.id;
                                            credit_posting.main_bk_posting      = "DN_Posting"+a;
                                            credit_posting.srno                 = 100+parseInt(a);
                                            credit_posting.main_bk              = "DN";
                                            if(Add_Array[a].Parameter_Type == '+')credit_posting.d_c = "C";
                                            else credit_posting.d_c = "D";
                                            credit_posting.c_j_s_p              = req.body.c_j_s_p;
                                            
                                            credit_posting.vouc_code            = req.body.vouc_code;
                                            credit_posting.cash_date            = DateObject;
                                            credit_posting.cash_edatemilisecond = sodatemilisecond;
                                            credit_posting.cash_type            = req.body.cash_type;
                                                
                                            credit_posting.del                  = "N";
                                            credit_posting.CNCL                 = "N";
                                            credit_posting.entrydate            = new Date();

                                            credit_posting.cash_bank_name       = req.body.Credit_AC; 
                                            credit_posting.cashac_name          = addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac;
                                            credit_posting.cash_chequeno        = req.body.cash_chequeno;
                                            credit_posting.cash_chequedate      = req.body.cash_chequedate;
                                            credit_posting.cash_amount          = Add_Array[a].Amount;
                                            credit_posting.Add_Amount_Deduction = 0;
                                            credit_posting.Less_Amount_Deduction= 0;
                                            credit_posting.cash_narrone         = req.body.cash_narrone;
                                            credit_posting.cash_narrtwo         = req.body.cash_narrtwo;
                                            credit_posting.totcash_amt          = req.body.totcash_amt;
                                            credit_posting.cash_remarks         = req.body.cash_remarks;
                                            credit_posting.co_code              = req.session.compid;
                                            credit_posting.div_code             = req.session.divid;
                                            credit_posting.usrnm                = req.session.user;
                                            credit_posting.masterid             = req.session.masterid
                                            credit_posting.save();
                                        }else{
                                            let credit_posting_Up = {};
                                            credit_posting_Up.DrNote_id            = req.params.id;
                                            credit_posting_Up.main_bk_posting      = "DN_Posting"+a;
                                            credit_posting_Up.srno                 = 100+parseInt(a);
                                            credit_posting_Up.main_bk              = "DN";
                                            if(Add_Array[a].Parameter_Type == '+')credit_posting_Up.d_c = "C";
                                            else credit_posting_Up.d_c = "D";
                                            credit_posting_Up.c_j_s_p              = req.body.c_j_s_p;
                                            
                                            credit_posting_Up.vouc_code            = req.body.vouc_code;
                                            credit_posting_Up.cash_date            = DateObject;
                                            credit_posting_Up.cash_edatemilisecond = sodatemilisecond;
                                            credit_posting_Up.cash_type            = req.body.cash_type;
                                                
                                            credit_posting_Up.del                  = "N";
                                            credit_posting_Up.CNCL                 = "N";
                                            credit_posting_Up.entrydate            = new Date();

                                            credit_posting_Up.cash_bank_name       = req.body.Credit_AC; 
                                            credit_posting_Up.cashac_name          = addlessmast.Add_Less_Parameter_Master_Array[b].Posting_Ac;
                                            credit_posting_Up.cash_chequeno        = req.body.cash_chequeno;
                                            credit_posting_Up.cash_chequedate      = req.body.cash_chequedate;
                                            credit_posting_Up.cash_amount          = Add_Array[a].Amount;
                                            credit_posting_Up.Add_Amount_Deduction = 0;
                                            credit_posting_Up.Less_Amount_Deduction= 0;
                                            credit_posting_Up.cash_narrone         = req.body.cash_narrone;
                                            credit_posting_Up.cash_narrtwo         = req.body.cash_narrtwo;
                                            credit_posting_Up.totcash_amt          = req.body.totcash_amt;
                                            credit_posting_Up.cash_remarks         = req.body.cash_remarks;
                                            credit_posting_Up.co_code              = req.session.compid;
                                            credit_posting_Up.div_code             = req.session.divid;
                                            credit_posting_Up.usrnm                = req.session.user;
                                            credit_posting_Up.masterid             = req.session.masterid
                                            var qry_posting = {DrNote_id:req.params.id,main_bk_posting:"DN_Posting"+a};
                                            cashmast.update(qry_posting,credit_posting_Up,function(err){});
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    if(req.body.outSaveArr == null || req.body.outSaveArr == '' || req.body.outSaveArr == [] || req.body.outSaveArr == undefined)flag=1
                    else{
                        var outSaveArr = JSON.parse(req.body.outSaveArr);
                        for(let j=0; j<outSaveArr.length; j++){
                            if(parseFloat(outSaveArr[j].ReceiveAmt) >0){
                                if(outSaveArr[j].OutEntry_id == null || outSaveArr[j].OutEntry_id == '' || outSaveArr[j].OutEntry_id == undefined){
                                    let out = new outstanding();
                                    out.DrNote_id = req.params.id;
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                        out.main_bk = "OnAcc";
                                        out.OS_Type = 'ONA';
                                    }
                                    else out.main_bk = "DN";
                                    out.c_j_s_p = req.body.c_j_s_p;
                                    out.d_c ="D";
                                    out.CN_vouc_code = req.body.vouc_code; //Debit Note Vouc Code
                                    out.vouc_code = outSaveArr[j].vouc_code;
                                    out.cash_date = DateObject;
                                    out.cash_edatemilisecond = sodatemilisecond;
                                    out.cashac_name = req.body.Credit_AC;
                                    // out.cash_bank_name = req.body.cash_bank_name;
                                    out.cash_narrtwo = 'Oustanding';
                                    out.cash_narrone = 'Debit Not';
                                    out.del         = "N";
                                    out.entrydate   = new Date();
                                    out.cash_amount = outSaveArr[j].ReceiveAmt;
                                    out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                    out.Bill_Date   = outSaveArr[j].Bill_Date;
                                    out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                    // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                    // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                    if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                    out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                    out.outstanding_amount = outSaveArr[j].ReceiveAmt //Calulate Outstanding Balance For Bill Collection
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
                                    out.save();
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
                                            if(err)console.log('Error',err)
                                            else {}
                                        })
                                    }
                                }else{
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                    }
                                    else{
                                        var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                        var OutEntry = await outstanding.findById(outSaveArr[j].OutEntry_id,function(err,aa){});
                                        var outObj = {};
                                        outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)+parseFloat(OutEntry.Rec_Amount);
                                        outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)-parseFloat(OutEntry.Rec_Amount);
                                        outObj.outstanding_amount = parseFloat(OutSB.outstanding_balance)+parseFloat(OutEntry.Rec_Amount);
                                        outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                            if(err)console.log('Error',err)
                                            else {}
                                        })
                                    }
                                    let out = {};
                                    out.DrNote_id = req.params.id;
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                        out.main_bk = "OnAcc";
                                        out.OS_Type = 'ONA';
                                    }
                                    else out.main_bk = "DN";
                                    out.c_j_s_p = req.body.c_j_s_p;
                                    out.d_c ="D";
                                    out.CN_vouc_code = req.body.vouc_code; //Debit Note Vouc Code
                                    out.vouc_code = outSaveArr[j].vouc_code;
                                    out.cash_date = DateObject;
                                    out.cash_edatemilisecond = sodatemilisecond;
                                    out.cashac_name = req.body.Credit_AC;
                                    // out.cash_bank_name = req.body.cash_bank_name;
                                    out.cash_narrtwo = 'Oustanding';
                                    out.cash_narrone = 'Debit Not';
                                    out.del         = "N";
                                    out.entrydate   = new Date();
                                    out.cash_amount = outSaveArr[j].ReceiveAmt;
                                    out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                    out.Bill_Date   = outSaveArr[j].Bill_Date;
                                    out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                    // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                    // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                    if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                    out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                    out.outstanding_amount = parseFloat(outSaveArr[j].ReceiveAmt) //Calulate Outstanding Balance For Bill Collection
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
                                    outstanding.update({_id:outSaveArr[j].OutEntry_id},out,function(err){});
                                    if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                    }
                                    else{
                                        var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                        var outObj = {};
                                        var count = 0;
                                        var arr = {'Out_Entry_Id':outSaveArr[j].OutEntry_id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.CN_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                        if(OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == [])OutSB.Out_recieved_Entry_Arr.push(arr);
                                        else{
                                            for(let r=0; r<OutSB.Out_recieved_Entry_Arr.length; r++){
                                                if(JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outSaveArr[j].OutEntry_id)){
                                                    OutSB.Out_recieved_Entry_Arr[r] = arr;
                                                    count = count + 1;
                                                    break;
                                                }
                                            }
                                            if(count == 0)OutSB.Out_recieved_Entry_Arr.push(arr);
                                        }

                                        outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                        outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                        outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                        outObj.outstanding_amount = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                        outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                            if(err)console.log('Error',err)
                                            else {}
                                        })
                                    }
                                }
                            }
                        }
                    }
                    res.redirect('/Debit_Note/Debit_Note_List');
                }
            });
        }
    });
});
router.get('/Debit_Note_Print/:id', ensureAuthenticated, function(req, res){
    cashmast.findById(req.params.id, function (err,Credit_Note){
       vouchMast.find({Module:'Debit Note',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
           addlessMast.findOne({Module:'Debit Note',masterid:req.session.masterid},function(err, addlessmast){
               outstanding.find({DrNote_id:req.params.id,del:'N'},function(err,OutEntry){
                    division.findById(req.session.divid, function (err,division){
                        if(Credit_Note != null){
                            Group.findById(Credit_Note.cashac_name.GroupName,function(err,group){
                                if (err) {
                                    console.log(err);
                                } else {
                                    var AddLessArr = [];
                                    if(addlessmast == null || addlessmast == '' || addlessmast == [])flag = 1;
                                    else{
                                        var addArr = addlessmast.Add_Less_Parameter_Master_Array;
                                        for(let i=0; i<addArr.length; i++){
                                            if(addArr[i].Division == null || addArr[i].Division == undefined || addArr[i].Division == [] || addArr[i].Division == ''){
                                                AddLessArr.push(addArr[i]); // If Division Arr are null than This Parameter Are Show In All Divisoin
                                            }else{
                                                for(let j = 0; j<addArr[i].Division.length; j++){
                                                    if(req.session.divid == addArr[i].Division[j]){
                                                        AddLessArr.push(addArr[i]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    AddLessArr.sort(function(a, b){
                                        return a.Order-b.Order
                                    })
                                    addlessmast.Add_Less_Parameter_Master_Array = AddLessArr;
                                    res.render('Debit_Note_Print.hbs',{
                                        pageTitle:'Debit Note Print',
                                        Credit_Note:Credit_Note,
                                        OutEntry:OutEntry,
                                        division:division,
                                        group:group,
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
                            })
                        }
                    });
               });
           }).sort('Add_Less_Parameter_Master_Array.Order');
       })
   }).populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
   .populate([{path: 'cash_bank_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}]);
});
router.get('/delete/:id',async function(req, res){  
    if(!req.user._id){
      res.status(500).send();
    }else{
      let query = {_id:req.params.id}
      let Garu = {};
      Garu.del = 'Y';
      Garu.delete = new Date();
      cashmast.update(query,Garu, function(err,somast){
          if(err){
            console.log(err);
          }
            var trans = {};
            trans.del = 'Y';
            trans.delete = new Date();
            querytrans = {DrNote_id:req.params.id};
            cashmast.updateMany(querytrans,trans,async function(err,trans){
                if(err)res.json({'success': "false"});
                else {
                        var trans = {};
                        trans.del = 'Y';
                        trans.delete = new Date();
                        var outSR = await outstanding.find({DrNote_id:req.params.id},function(err,aa){});
                        outstanding.updateMany({DrNote_id:req.params.id},trans,function(err){});
                        if(outSR == null || outSR == '' || outSR == []){

                        }else{
                            for(let i=0; i<outSR.length; i++){
                                if(outSR[i].outstanding_id == null || outSR[i].outstanding_id == '' || outSR[i].outstanding_id == undefined){
                                    // outstanding.update({_id:outSR[i]._id},trans,function(err){});
                                }else{
                                    var OutSB = await outstanding.findById(outSR[i].outstanding_id,function(err,aa){});
                                    if(OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == []){}
                                    else{
                                        for(let r=0; r<OutSB.Out_recieved_Entry_Arr.length; r++){
                                            if(JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outSR[i]._id)){
                                                OutSB.Out_recieved_Entry_Arr.splice(r,1);
                                                break;
                                            }
                                        }
                                    }
                                    var outObj = {};
                                    outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)+parseFloat(outSR[i].Rec_Amount);
                                    outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)-parseFloat(outSR[i].Rec_Amount);
                                    outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr
                                    outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)+parseFloat(outSR[i].Rec_Amount);
                                    outstanding.update({_id:OutSB._id},outObj,function(err){
                                        if(err)console.log('Error',err)
                                        else {console.log('success')};
                                    })
                                    // outstanding.update({_id:outSR[i]._id},trans,function(err){});
                                }
                            }
                        }
                        res.send("<script>alert('SuccesFully Deleted');window.location.href = '/Credit_Note/Credit_Note_List'</script>");
                    }
            });
      });
  }
});

router.get('/DelOutEntry',async function(req,res){
        console.log(req.query.id);
        var trans = {};
        trans.del = 'Y';
        trans.delete = new Date();
        var outSR = await outstanding.findById(req.query.id,function(err,aa){});
        outstanding.update({_id:req.query.id},trans,function(err){});
        if(outSR == null || outSR == '' || outSR == []){
        }else{
            if(outSR.outstanding_id == null || outSR.outstanding_id == '' || outSR.outstanding_id == undefined){
            }else{
                var OutSB = await outstanding.findById(outSR.outstanding_id,function(err,aa){});
                var outObj = {};
                if(OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == []){}
                else{
                    for(let r=0; r<OutSB.Out_recieved_Entry_Arr.length; r++){
                        if(JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outSR._id)){
                            OutSB.Out_recieved_Entry_Arr.splice(r,1);
                            break;
                        }
                    }
                }
                outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)+parseFloat(outSR.Rec_Amount);
                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)-parseFloat(outSR.Rec_Amount);
                outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)+parseFloat(outSR.Rec_Amount);
                outstanding.update({_id:OutSB._id},outObj,function(err){
                    if(err)console.log(err);
                    else {res.json({'success':true})};
                })
            }
        }
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