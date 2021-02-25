const express = require('express');
const router = express.Router(); 
let grocery_master = require('../models/grocery_Schema');
let rawMat_mast= require('../models/rawmatSchema');
let division = require('../models/division_schema');
const mongoose = require('mongoose');
var query;
const moment = require('moment-timezone');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

router.get('/rawmatmastname', function (req, res) {
        rawMat_mast.find({masterid:req.session.masterid, del:'N'}, function(err, rawMat_mast){
            res.json({ 'success': true, 'rowmatname': rawMat_mast });
        });
});
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/product_image')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf') {
            req.fileValidationError = "Forbidden extension";
            return callback(null, false, req.fileValidationError);
        }
        callback(null, true)
    },
    limits:{
        fileSize: 420 * 150 * 200
    }
});
var data=[];

router.get('/pricelist', function (req, res) {
    var masterid =  req.query.masterid;
    grocery_master.find({masterid:masterid}, function (err, grocery_master){
          if (grocery_master != null)
          {  
            for (var j = 0; j < grocery_master.length; j++)
            {
                if (grocery_master[j]['product_name'] != null) pname = grocery_master[j]['product_name'];
                else product_name = "";
                if (product_mast[j]['filepath'] != null) filepath = product_mast[j]['filepath'];
                else filepath = "public\\uploads\\product_image\\company.png";
                if (product_mast[j]['si_price'] != null) si_price = product_mast[j]['si_price'];
                else si_price = "";
                if (product_mast[j]['mrp_pcs'] != null) mrp_pcs = product_mast[j]['mrp_pcs'];
                else mrp_pcs = "";
                if (product_mast[j]['export_price'] != null) export_price = product_mast[j]['export_price'];
                else export_price = "";
                data.push({
                    "id":  grocery_master[j]._id,
                    // "prdt_desc" : prdt_desc,
                    "filepath" : filepath,
                    "mrp_pcs" : mrp_pcs,
                    "si_price" : si_price,
                    "export_price" : export_price,
                   
               })
            }
         }
        })
        
        console.log(data);
        res.json({ 'success': true, 'product_mast_list':data});

});
// Add Route
router.get('/grocery_master', ensureAuthenticated, function(req, res){    
        grocery_master.find({masterid:req.session.masterid, del:'N'}, function (err, grocery_master){
            division.find({}, function (err,division){
                if (err) {
                console.log(err);
            } else {
                res.render('grocery_master.hbs', {
                    pageTitle:'Add Grocery Master',
                    grocery_master:grocery_master,
                    division: division,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'Rm_ProCode':1}) 
    }).populate('jobs')
});

router.get('/grocery_master', ensureAuthenticated, function(req, res){
        grocery_master.find({masterid:req.session.masterid, del:'N'}, function (err, grocery_master){
                    division.find({}, function (err,division){
            if (err) {
                console.log(err);
            } else {
                res.render('grocery_master.hbs', {
                    pageTitle:'Grocery List',
                    grocery_master: grocery_master,
                    // brand: brand,
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
        }).populate('jobs')
        })
});

router.post('/grocery_master_add', (req, res, next) => {
        if(req.body.sku_name==""||req.body.sku_name == undefined) req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.model==""||req.body.model == undefined)req.body.model=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        // if(req.body.brand==""||req.body.brand == undefined)req.body.brand=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var e_date = req.body.effectiveDate;
        // console.log(j_date);
        var DateObject =  moment(e_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var datemilisecond = DateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let prdt = new grocery_master();
            prdt.grocery_master= req.body.grocery_master;
            prdt.natureOfWork= req.body.natureOfWork;
            prdt.effectiveDate= DateObject;
            prdt.datemilisecond=datemilisecond;
            // prdt.jobs= req.body.jobs;
            prdt.upToPacking= req.body.upToPacking;
            prdt.qty= req.body.qty;
            prdt.basic= req.body.basic;
            prdt.levyPer= req.body.levyPer;
            prdt.levy= req.body.levy;
            prdt.grocery_master_group = req.body.grocery_master_group;
            prdt.co_code = req.session.compid;
            prdt.div_code = req.session.divid;
            prdt.user =  req.session.user;
            prdt.masterid=req.session.masterid;
            prdt.del = 'N';
            prdt.entrydate = new Date();
            // console.log(prdt);
            grocery_master.findOne({ natureOfWork: req.body.natureOfWork ,del:"N"  }, function(errors, grocery_master){
                let agrfg=true;
                if(grocery_master == null){
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
    grocery_master.findById(req.params.id, function(err, g_master){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            res.json({ 'success': true, 'g_mast': g_master });
        }
    });
});

router.post('/edit_grocery_master/:id', function(req, res){
    if(req.body.sku_name==""||req.body.sku_name == undefined) req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.model==""||req.body.model == undefined)req.body.model=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    // if(req.body.brand==""||req.body.brand == undefined)req.body.brand=mongoose.Types.ObjectId('578df3efb618f5141202a196');

    let errors = req.validationErrors();
    var e_date = req.body.effectiveDate;
    var DateObject =  moment(e_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var datemilisecond = DateObject.format('x');
    if (errors) {
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        if (req.fileValidationError) {
            res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });    
        } else {
            let prdt = {};
            prdt.grocery_master= req.body.grocery_master;
            prdt.natureOfWork= req.body.natureOfWork;
            prdt.effectiveDate= DateObject;
            prdt.datemilisecond=datemilisecond;
            prdt.upToPacking= req.body.upToPacking;
            prdt.qty= req.body.qty;
            prdt.basic= req.body.basic;
            prdt.levyPer= req.body.levyPer;
            prdt.levy= req.body.levy;
            prdt.grocery_master_group = req.body.grocery_master_group;
            prdt.co_code = req.session.compid;
            prdt.div_code = req.session.divid;
            prdt.user =  req.session.user;
            prdt.masterid=req.session.masterid;
            prdt.del = 'N';
            prdt.update = new Date();
            let query = {_id:req.params.id}
            // console.log(req.params.id);
            grocery_master.update(query , prdt,function (err) {
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating Product Master', errors: err });
                } else {
                    res.json({'success':true});
                }
            });
        }
    }
});

let daily_grocery_entry = require('../models/daily_grocery_entry_Schema');
router.delete('/confirm/:id', function(req, res){
    console.log(req.params.id)
    let query = {_id:req.params.id}
    daily_grocery_entry.find({"daily_grocery_entry_group": {$elemMatch: {natureOfWork: req.params.id}},del:'N',masterid:req.session.masterid,div_code:req.session.divid,co_code:req.session.compid}, function(err, daily_grocery){
        if(err){
            console.log(err);
        }
        if(daily_grocery == null || daily_grocery == [] || daily_grocery == ''){
            res.json({success:'false'});
        }else{
            res.json({success:'true'});
        }
    });
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
        grocery_master.update(query,product, function(err,somast){
            if(err){
            console.log(err);
            }
            res.send('Success');
        });
    }
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