const express = require('express');
const router = express.Router(); 
let daily_grocery_entry = require('../models/daily_grocery_entry_Schema');
let toli_master = require('../models/toli_Schema');
let grocery_master = require('../models/grocery_Schema');
let rawMat_mast= require('../models/rawmatSchema');
let division = require('../models/divSchema');
const mongoose = require('mongoose');
var query;
const moment = require('moment-timezone');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

router.get('/rawmatmastname', function (req, res) {
grocery_master.find({masterid:req.session.masterid, del:'N'}, function(err, grocery_master){
        res.json({ 'success': true, 'groceryMaster': grocery_master});
    });
});

router.get('/get_grocery_data', function (req, res) {
grocery_master.findById(req.query.grocery, function(err, grocery_master){
        res.json({ 'success': true, 'grocery': grocery_master});
        
    });
});

router.get('/grocery_report_summary', ensureAuthenticated, function(req, res){
        toli_master.find({masterid:req.session.masterid,del:'N'}, function (err,toli_master){
    if (err) {
        console.log(err);
    } else {
        res.render('grocery_report_summary.hbs', {
            pageTitle:'Grocery Report Summary',
            toli_master:toli_master,
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

router.get('/daily_grocery_entry', ensureAuthenticated, function(req, res){
    daily_grocery_entry.find({masterid:req.session.masterid, del:'N'}, function (err, daily_grocery){
        grocery_master.find({masterid:req.session.masterid, del:'N'}, function (err, grocery_master){
        toli_master.find({masterid:req.session.masterid, del:'N'}, function (err, toli_master){  
        division.find({}, function (err,division){
        daily_grocery_entry.aggregate((
            [{ $match: { co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
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
        if (err) {
            console.log(err);
        } else {
            // var last = 1;
            // if(daily_grocery_entry == null || daily_grocery_entry == '' || daily_grocery_entry == [])last = 1;
            // else {
            //     console.log(daily_grocery_entry[daily_grocery_entry.length-1].vouc_code)
            //     last = parseInt(daily_grocery_entry[daily_grocery_entry.length-1].vouc_code)+1;
            //     console.log(last)
            // }
            var last = 1;
            if(lastEntryNo == '')last = 1;
            else last = parseInt(lastEntryNo[0]._id._id)+1;
            res.render('daily_grocery_entry.hbs', {
                pageTitle:'Add Daliy Grocery Entry',
                daily_grocery_entry: daily_grocery,
                toli_master:toli_master,
                grocery_master:grocery_master,
                last:last,
                division:division,
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
    })
    }).populate('jobs')
    }).sort('vouc_code').populate('toliCode').populate('daily_grocery_entry_group.natureOfWork');
});

router.get('/daily_grocery_print/', ensureAuthenticated, function(req, res){
    // console.log('AA',req.query.date)
    // console.log('aa',req.query.toliCodeInGrocceryEntry)
    var e_date = req.query.date;
    // console.log(e_date);
    var DateObject =  moment(e_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var datemilisecond = DateObject.format('x');
    // console.log(datemilisecond)
        daily_grocery_entry.findOne({toliCode:req.query.toliCodeInGrocceryEntry,datemilisecond:datemilisecond,co_code:req.session.compid,div_code:req.session.divid, del:'N'}, function (err, daily_grocery_entry){
            division.findById(req.session.divid, function (err,division){
                // console.log(division);
            if (err) {
                console.log(err);
            } else {
                // console.log(daily_grocery_entry);
                res.render('daily_grocery_print.hbs', {
                    pageTitle:'Daliy Grocery Print',
                    daily_grocery_entry: daily_grocery_entry,
                    division:division,
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
        }).populate('toliCode').populate('daily_grocery_entry_group.natureOfWork');
});

router.get('/daily_grocery_pri_print/', ensureAuthenticated, function(req, res){
// console.log('AA',req.query.date)
// console.log('aa',req.query.toliCode)
var e_date = req.query.date;
// console.log(e_date);
var DateObject =  moment(e_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
var datemilisecond = DateObject.format('x');
// console.log(datemilisecond)
    daily_grocery_entry.findOne({toliCode:req.query.toliCodeInGrocceryEntry,datemilisecond:datemilisecond,co_code:req.session.compid,div_code:req.session.divid, del:'N'}, function (err, daily_grocery_entry){
        division.findById(req.session.divid, function (err,division){
            // console.log(division);
        if (err) {
            console.log(err);
        } else {
            // console.log(daily_grocery_entry);
            res.render('daily_grocery_pri_print.hbs', {
                pageTitle:'Daliy Grocery Pri Print',
                daily_grocery_entry: daily_grocery_entry,
                division:division,
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
    }).populate('toliCode').populate('daily_grocery_entry_group.natureOfWork');
});

router.get('/daily_grocery_summary_print/', ensureAuthenticated, function(req, res){
var start_date = req.query.start_date;
var end_date = req.query.end_date;
var toliCode = req.query.toliCode;
    // console.log(start_date)
    // console.log(end_date)
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
        var qry = "";
        qry = {$and: [{datemilisecond:{$gte:strtdate}},{datemilisecond:{$lte:enddats}}],toliCode:toliCode,co_code:req.session.compid,div_code:req.session.divid,del:"N"};
        daily_grocery_entry.find(qry, function (err, daily_grocery_entry){
        division.findById(req.session.divid, function (err,division){
        var GrocArray = [];
        var toliName = '';
        var toliCode = '';
        var totbasic =0;
        var totlevy =0;
        var totAmt =0;
        for(i=0; i<daily_grocery_entry.length; i++){
            if(i==0)toliName=daily_grocery_entry[i].toliCode.ToliName;
            if(i==0)toliCode=daily_grocery_entry[i].toliCode.ToliCode;
            totbasic = totbasic+parseFloat(daily_grocery_entry[i].tot_basic);
            totlevy = totlevy+parseFloat(daily_grocery_entry[i].tot_levy);
            totAmt = totAmt+parseFloat(daily_grocery_entry[i].tot_Amt);
            var date = moment(daily_grocery_entry[i].date).format('DD/MM/YYYY');
            var arr = {'date':date,'tot_basic':daily_grocery_entry[i].tot_basic,'tot_levy':daily_grocery_entry[i].tot_levy,'tot_Amt':daily_grocery_entry[i].tot_Amt};
            GrocArray.push(arr);
        }
            // console.log(division);
        if (err) {
            console.log(err);
        } else {
            // console.log(daily_grocery_entry);
            res.render('daily_grocery_summary_print.hbs', {
                pageTitle:'Daliy Grocery Summary Print',
                daily_grocery_entry: daily_grocery_entry,
                GrocArray:GrocArray,
                toliName:toliName,
                toliCode:toliCode,
                start_date:start_date,
                totbasic:totbasic.toFixed(2),
                totlevy:totlevy.toFixed(2),
                totAmt:totAmt.toFixed(2),
                end_date:end_date,
                division:division,
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
    }).sort('datemilisecond').populate('toliCode').populate('daily_grocery_entry_group.natureOfWork');
});

router.get('/daily_grocery_summary_pri_print/', ensureAuthenticated, function(req, res){
var start_date = req.query.start_date;
    var end_date = req.query.end_date;
    var  toliCode = req.query.toliCode;
    // console.log(start_date)
    // console.log(end_date)
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
        var qry = "";
        qry = {$and: [{datemilisecond:{$gte:strtdate}},{datemilisecond:{$lte:enddats}}],toliCode:toliCode,co_code:req.session.compid,div_code:req.session.divid,del:"N"};
        daily_grocery_entry.find(qry, function (err, daily_grocery_entry){
        division.findById(req.session.divid, function (err,division){
        var GrocArray = [];
        var toliName = '';
        var toliCode = '';
        var totbasic =0;
        var totlevy =0;
        var totAmt =0;
        for(i=0; i<daily_grocery_entry.length; i++){
            if(i==0)toliName=daily_grocery_entry[i].toliCode.ToliName;
            if(i==0)toliCode=daily_grocery_entry[i].toliCode.ToliCode;
            totbasic = totbasic+parseFloat(daily_grocery_entry[i].tot_basic);
            totlevy = totlevy+parseFloat(daily_grocery_entry[i].tot_levy);
            totAmt = totAmt+parseFloat(daily_grocery_entry[i].tot_Amt);
            var date = moment(daily_grocery_entry[i].date).format('DD/MM/YY');
            var arr = {'date':date,'tot_basic':daily_grocery_entry[i].tot_basic,'tot_levy':daily_grocery_entry[i].tot_levy,'tot_Amt':daily_grocery_entry[i].tot_Amt};
            GrocArray.push(arr);
        }
            // console.log(division);
        if (err) {
            console.log(err);
        } else {
            // console.log(daily_grocery_entry);
            res.render('daily_grocery_summary_pri_print.hbs', {
                pageTitle:'Daliy Grocery Summary Pri Print',
                daily_grocery_entry: daily_grocery_entry,
                GrocArray:GrocArray,
                toliName:toliName,
                toliCode:toliCode,
                start_date:start_date,
                totbasic:totbasic.toFixed(2),
                totlevy:totlevy.toFixed(2),
                totAmt:totAmt.toFixed(2),
                end_date:end_date,
                division:division,
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
    }).sort('datemilisecond').populate('toliCode').populate('daily_grocery_entry_group.natureOfWork');
});

router.post('/grocery_report_summary', ensureAuthenticated, async function(req, res){
    var start_date = req.body.start_date;
    var end_date   = req.body.end_date;
    var toliCode   = req.body.toliCode;
    // console.log(start_date,end_date,toliCode)
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
        var qry = "";
        qry = {$and: [{datemilisecond:{$gte:strtdate}},{datemilisecond:{$lte:enddats}}],toliCode:toliCode,co_code:req.session.compid,div_code:req.session.divid,del:"N"};
        daily_grocery_entry.find(qry, function (err, daily_grocery_entry){
        var GrocArray = [];
        for(i=0; i<daily_grocery_entry.length; i++){
            var date = moment(daily_grocery_entry[i].date).format('DD/MM/YYYY');
            var arr = {'date':date,'tot_basic':daily_grocery_entry[i].tot_basic,'tot_levy':daily_grocery_entry[i].tot_levy,'tot_Amt':daily_grocery_entry[i].tot_Amt};
            GrocArray.push(arr);
        }
        res.json({ 'success': true, 'GrocArray':GrocArray});
        });
})

router.post('/daily_grocery_entry_add', (req, res, next) => {
    if(req.body.toliCode==""||req.body.toliCode == undefined) req.body.toliCode=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var e_date = req.body.date;
    var DateObject =  moment(e_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var datemilisecond = DateObject.format('x');
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let prdt = new daily_grocery_entry();
        prdt.daily_grocery_entry= req.body.daily_grocery_entry;
        prdt.c_j_s_p= req.body.c_j_s_p;
        prdt.vouc_code= req.body.vouc_code;
        prdt.date= DateObject;
        prdt.datemilisecond=datemilisecond;
        prdt.remark= req.body.remark;
        prdt.toliCode= req.body.toliCode;
        prdt.natureOfWork= req.body.natureOfWork;
        prdt.pck= req.body.pck;
        prdt.qty= req.body.qty;
        prdt.basic= req.body.basic;
        prdt.levy= req.body.levy;
        prdt.entryRemark= req.body.entryRemark;
        prdt.masterRate= req.body.masterRate;
        prdt.tot_basic= req.body.tot_basic;
        prdt.tot_levy= req.body.tot_levy;
        prdt.tot_Amt= req.body.tot_Amt;
        prdt.daily_grocery_entry_group = req.body.daily_grocery_entry_group;
        for(let i=0; i<prdt.daily_grocery_entry_group.length; i++){
            if(prdt.daily_grocery_entry_group[i] == "" || prdt.daily_grocery_entry_group[i] == undefined)prdt.daily_grocery_entry_group[i]=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        }   
        prdt.co_code = req.session.compid;
        prdt.div_code = req.session.divid;
        prdt.user =  req.session.user;
        prdt.masterid=req.session.masterid;
        prdt.del = 'N';
        prdt.entrydate = new Date();
        daily_grocery_entry.findOne({ vouc_code: req.body.vouc_code ,del:"N"  }, function(errors, daily_grocery_entry){
            let agrfg=true;
            if(daily_grocery_entry==null  ){
                prdt.save()
                agrfg=true;
            }else{
                agrfg=false;
            }
            res.json({'success': agrfg });
        })
    }
});

router.get('/:id', ensureAuthenticated, function(req, res){
    daily_grocery_entry.findById(req.params.id, function(err, d_grocery){
        grocery_master.find({masterid:req.session.masterid, del:'N'}, function (err, grocery_master){
            toli_master.find({masterid:req.session.masterid, del:'N'}, function (err, toli_master){  
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching raw material' });
            } else {
                res.json({ 'success': true, 'd_grocery': d_grocery,'grocery_master':grocery_master,'toli_master':toli_master });
            }
            });
        });
    });
});

router.post('/edit_daily_grocery_entry/:id', function(req, res){
    if(req.body.sku_name==""||req.body.sku_name == undefined) req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.model==""||req.body.model == undefined)req.body.model=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    
    let errors = req.validationErrors();
    var e_date = req.body.date;
    var DateObject =  moment(e_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var datemilisecond = DateObject.format('x');
    if (errors) {
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        if (req.fileValidationError) {
            res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });    
        } else {
            let prdt = {};
            prdt.daily_grocery_entry= req.body.daily_grocery_entry;
            prdt.c_j_s_p= req.body.c_j_s_p;
            prdt.vouc_code= req.body.vouc_code;
            prdt.date= DateObject;
            prdt.datemilisecond=datemilisecond;
            prdt.tot_basic= req.body.tot_basic;
            prdt.tot_levy= req.body.tot_levy;
            prdt.tot_Amt= req.body.tot_Amt;
            prdt.remark= req.body.remark;
            prdt.toliCode= req.body.toliCode;
            prdt.natureOfWork= req.body.natureOfWork;
            prdt.pck= req.body.pck;
            prdt.qty= req.body.qty;
            prdt.basic= req.body.basic;
            prdt.levy= req.body.levy;
            prdt.entryRemark= req.body.entryRemark;
            prdt.masterRate= req.body.masterRate;
            prdt.daily_grocery_entry_group = req.body.daily_grocery_entry_group;
            prdt.co_code = req.session.compid;
            prdt.div_code = req.session.divid;
            prdt.user =  req.session.user;
            prdt.masterid=req.session.masterid;
            prdt.del = 'N';
            prdt.update = new Date();
            let query = {_id:req.params.id}
            // console.log(req.params.id);
            daily_grocery_entry.update(query , prdt,function (err) {
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating Product Master', errors: err });
                } else {
                    res.json({'success':true});
                }
            });
        }
    }
});

router.delete('/:id', function(req, res){
if(!req.user._id){
    res.status(500).send();
    }
    else{
    let query = {_id:req.params.id}
    let product = {};
    product.del = 'Y';
    product.delete = new Date();
    daily_grocery_entry.update(query,product, function(err,somast){
            if(err){
            console.log(err);
            }
            res.send('Success');
        });
    }
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