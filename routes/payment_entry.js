const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let party = require('../models/party_schema');
let city = require('../models/city_schema');
let courier = require('../models/courier_schema');
let outstading = require('../models/outstading_schema');
let expense = require('../models/expense_schema');
let payment_entry= require('../models/payment_entry_schema');
let outstading_expense= require('../models/outstading_expense_schema');
let bank = require('../models/bank_schema');
let common = require('./common');                 
var query;
router.get('/expenseaname', function(req, res) {
    expense.find({}, function (err, expense) {
         if (err) {
             console.log(err);
         } else {
             res.json({ 'success': true, 'expense': expense});
         }
     });
 });

 router.get('/saudaname', function(req, res) {
    var brcode = req.query.brcode;
    var slcode = req.query.slcode;
    common.UpdatePayment(req,brcode);    

    outstading.find({main_bk:"DLV",br_code:brcode,co_code:req.session.compid,div_code:req.session.divid}, function (err, outstading) {
         //   console.log(delveryentry1);
         if (err) {
             console.log(err);
         } else {
             res.json({ 'success': true, 'outstading': outstading});
         }
     }).populate('sl_code').sort('sl_code');
 });
// Add Route
router.get('/payment_entry', ensureAuthenticated, function(req, res){
            party.find({masterid:req.session.masterid}, function (err, party){
            expense.find({masterid:req.session.masterid}, function (err, expense){
                courier.find({}, function (err, courier){
            payment_entry.find({main_bk:"PAY",co_code:req.session.compid,div_code:req.session.divid}, function (err, payment_entry){
                bank.find({},'bank_name', function (err, bank){
            if (err) {
                console.log(err);
            } else {
                res.render('payment_entry.hbs', {
                    pageTitle:'Add Payment',
                    party: party,
                    expense: expense,
                    courier: courier,
                    bank: bank,
                    payment_entry: payment_entry,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
           }).sort({'bank_name':1});
        }).sort('-vouc_code');;
        }).sort({'courier_name':1});
    }).populate('city_name');
}).sort({'party_name':1});
});
    router.post('/add',function(req, res){
        if(req.body.courier=="") req.body.courier=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.dep_bnk=="") req.body.dep_bnk=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        var pay_date = req.body.pay_date;
        var PayateObject =  moment(pay_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var payDateMiliSeconds = PayateObject.format('x');
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            payment_entry.find({main_bk:"PAY",co_code:req.session.compid,div_code:req.session.divid}, function (err, payentryno){
            var entrylength = payentryno.length+1;
            let payment = new payment_entry();
            payment.main_bk= "PAY";
            payment.c_j_s_p = req.body.c_j_s_p;
            payment.vouc_code = entrylength;
            payment.pay_date = PayateObject;
            payment.paydatemilisecond = payDateMiliSeconds;
            payment.br_code = req.body.br_code;
            payment.sl_code = req.body.sl_code;
            payment.chkddamt = req.body.chkddamt;
            payment.chkdddt = req.body.chkdddt;
            payment.chkpaydddt = req.body.chkpaydddt;
            payment.chkddtyp = req.body.chkddtyp;
            payment.chkddno = req.body.chkddno;
            payment.dep_ac = req.body.dep_ac;
            payment.dep_bnk = req.body.dep_bnk;
            payment.courier = req.body.courier;
            payment.cou_rec = req.body.cou_rec;
            payment.cou_chgs = req.body.cou_chgs;
            payment.rmks1 = req.body.rmks1;
            payment.rmks2 = req.body.rmks2;
            payment.co_code =  req.session.compid;
            payment.div_code =  req.session.divid;
            payment.usrnm =  req.session.user;
            payment.masterid = req.session.masterid;

            let outs = new outstading();
            outs.paymentid =payment._id;
            outs.main_bk= "PAY";
            outs.c_j_s_p = req.body.c_j_s_p;
            outs.vouc_code = entrylength;
            outs.pay_date = PayateObject;
            outs.sd_datemilisecond = payDateMiliSeconds;
            outs.payment_sauda_group = req.body.payment_sauda_group;
            outs.br_code = req.body.br_code;
            outs.sl_code = req.body.sl_code;
            outs.co_code =  req.session.compid;
            outs.div_code =  req.session.divid;
            outs.usrnm =  req.session.user;
            outs.masterid=req.session.masterid;
            outs.save();

            let expense = new outstading_expense();
            expense.paymentid =payment._id;
            expense.outstadingid = outs._id;
            expense.main_bk= "PAY";
            expense.c_j_s_p = req.body.c_j_s_p;
            expense.vouc_code = entrylength;
            expense.totamountexpence  = req.body.totamountexpence;
            expense.pay_date = PayateObject;
            expense.paydatemilisecond = payDateMiliSeconds;
            expense.expense_group = req.body.expense_group;
            expense.co_code =  req.session.compid;
            expense.div_code =  req.session.divid;
            expense.usrnm =  req.session.user;
            expense.masterid=req.session.masterid;
            expense.save();

            payment.outstadingid = outs._id;
            payment.expenseid = expense._id;
            payment.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving delvery entry','errors':err});
                return;
            }
            else
            {
                common.UpdatePayment(req,req.body.br_code);    
                res.redirect('/payment_entry/payment_entry');
            }
            });
        }).sort('-vouc_code');
        }               
    });
    router.get('/payment_entry_list', ensureAuthenticated ,function(req,res){
        payment_entry.find({main_bk : "PAY",co_code:req.session.compid,div_code:req.session.divid}, function (err,payment_entry){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('payment_entry_list.hbs',{
                    pageTitle:'Payment Entry List',
                    payment_entry:payment_entry,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).populate([{path: 'br_code',select: 'party_name',
        populate:{ path: 'city_name',select: 'city_name',}
        }])
        .populate([{path: 'sl_code',select: 'party_name',
            populate:{ path: 'city_name',select: 'city_name',}
            }])
        .populate('courier')
        .populate('dep_bnk'); 
       });
       router.get('/payment_entry_update/:id', ensureAuthenticated, function(req, res){
        payment_entry.findById(req.params.id, function(err, payment_entry){
            party.find({masterid:req.session.masterid}, function (err, party){
                expense.find({masterid:req.session.masterid}, function (err, expense){
                    courier.find({}, function (err, courier){
                        bank.find({},'bank_name', function (err, bank){
                if (err) {
                    console.log(err);
                } else {
                    res.render('payment_entry_update.hbs',{
                        pageTitle:'Update Payment entry',
                        party: party,
                        expense: expense,
                        courier: courier,
                        bank: bank,
                        payment_entry: payment_entry,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                    });
                }
            }).sort({'bank_name':1});
         }).sort({'courier_name':1});
    }).populate('city_name');;
}).sort({'party_name':1});
}).populate('outstadingid')
// .populate([{path: 'expenseid',
//     populate:{ path: 'paymentid'}
//     }])
.populate('expenseid');;
});
        
        router.post('/update/:id', function(req, res) {
            if(req.body.courier=="") req.body.courier=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.dep_bnk=="") req.body.dep_bnk=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            var pay_date = req.body.pay_date;
            var PayateObject =  moment(pay_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var payDateMiliSeconds = PayateObject.format('x');
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let payment = {};
                    payment.main_bk= "PAY";
                    payment.c_j_s_p = req.body.c_j_s_p;
                    payment.vouc_code = req.body.vouc_code;
                    payment.pay_date = PayateObject;
                    payment.paydatemilisecond = payDateMiliSeconds;
                    payment.br_code = req.body.br_code;
                    payment.sl_code = req.body.sl_code;
                    payment.chkddamt = req.body.chkddamt;
                    payment.chkdddt = req.body.chkdddt;
                    payment.chkpaydddt = req.body.chkpaydddt;
                    payment.chkddtyp = req.body.chkddtyp;
                    payment.chkddno = req.body.chkddno;
                    payment.dep_ac = req.body.dep_ac;
                    payment.dep_bnk = req.body.dep_bnk;
                    payment.courier = req.body.courier;
                    payment.cou_rec = req.body.cou_rec;
                    payment.cou_chgs = req.body.cou_chgs;
                    payment.rmks1 = req.body.rmks1;
                    payment.rmks2 = req.body.rmks2;
                    payment.co_code =  req.session.compid;
                    payment.div_code =  req.session.divid;
                    payment.usrnm =  req.session.user;
                    payment.masterid = req.session.masterid;

                let outs = {};
                    outs.main_bk= "PAY";
                    outs.c_j_s_p = req.body.c_j_s_p;
                    outs.vouc_code = req.body.vouc_code;
                    outs.pay_date = PayateObject;
                    outs.sd_datemilisecond = payDateMiliSeconds;
                    outs.payment_sauda_group = req.body.payment_sauda_group;
                    outs.br_code = req.body.br_code;
                    outs.sl_code = req.body.sl_code;
                    outs.co_code =  req.session.compid;
                    outs.div_code =  req.session.divid;
                    outs.usrnm =  req.session.user;
                    outs.masterid=req.session.masterid;
                    let outsquery = {paymentid:req.params.id,main_bk:"PAY",
                    co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
                   outstading.update(outsquery ,outs ,function (err) {});

                    let expense = {};
                        expense.main_bk= "PAY";
                        expense.c_j_s_p = req.body.c_j_s_p;
                        expense.vouc_code = req.body.vouc_code;
                        expense.totamountexpence  = req.body.totamountexpence;
                        expense.pay_date = PayateObject;
                        expense.paydatemilisecond = payDateMiliSeconds;
                        expense.expense_group = req.body.expense_group;
                        expense.co_code =  req.session.compid;
                        expense.div_code =  req.session.divid;
                        expense.usrnm =  req.session.user;
                        expense.masterid=req.session.masterid;
                        let expensequery = {paymentid:req.params.id,main_bk:"PAY",
                        co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
                    outstading_expense.update(expensequery ,expense ,function (err) {});
                    let paymentquer = {_id:req.params.id}
                    payment_entry.update(paymentquer ,payment ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving delveryentry', 'errors': err });
                        return;
                    } else {
                        res.redirect('/payment_entry/payment_entry_list');
                    }
                });
            }
        });
        router.get('/delete_payment_entry/', function(req, res){
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
                    payment_entry.remove(myObject,function(err){});
                }
                for (var i = 0; i < delsaud2query.length; i++) {
                    var myObjectdealentry2 = {
                        "paymentid": delsaud2query[i],
                    };
                    outstading.remove(myObjectdealentry2,function(err){});
                    outstading_expense.remove(myObjectdealentry2,function(err){});
                }
                res.json({ 'success': true, 'message': 'Deleted Successfully'});
            //    res.redirect('/deal_entry/deal_entry_list');
            }
            });
        // router.get('/delete_payment_entry/', function(req, res){
        //     let qouts = {vouc_code:req.query.vcd,main_bk:"PAY",
        //     co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
              
        //     outstading.remove(qouts,function(err){
        //            if(err)
        //            {
        //                console.log(err);
        //            }
        //        });
        //        let expense = {vouc_code:req.query.vcd,main_bk:"PAY",
        //        co_code:req.session.compid,div_code:req.session.divid,usrnm:req.session.user};
             
        //        outstading_expense.remove(expense,function(err){
        //            if(err)
        //            {
        //                console.log(err);
        //            }
        //        });
        //    let query = {_id:req.query.id}
        //    payment_entry.remove(query,function(err){
        //            if(err)
        //            {
        //                console.log(err);
        //            }
        //            // res.send('Success');
        //            res.redirect('/payment_entry/payment_entry_list');
        //        });
        //    });
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