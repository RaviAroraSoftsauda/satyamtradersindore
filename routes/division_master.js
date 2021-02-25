const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
let division = require('../models/divSchema');
let state = require('../models/stateSchema')
let city = require('../models/citySchema');
let bank = require('../models/bank_schema');
const moment = require('moment-timezone');
var query;

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/company')
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
// Add Route
router.get('/division_master', ensureAuthenticated, function(req, res){
    division.find({}, function (err, division){
        state.find({}, function (err, state){
            city.find({}, function (err, city){
                bank.find({}, function (err, bank){
            if (err) {
                console.log(err);
            } else {
                res.render('division_master.hbs', {
                    pageTitle:'Add division',
                    state: state,
                    city: city,
                    bank:bank,
                    division: division,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                });
            }
        })
    })
    })
    })
    });


    router.post('/submit', upload.single('datafile'), (req, res, next) => {
        if(req.body.ac_place=="") req.body.ac_place=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.ac_state=="") req.body.ac_state=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        if (errors) {
            if(req.file) {
                let filename = './public/uploads/company/'+req.file.filename;
                console.log(filename);
                fs.stat(filename, function (err, stats) {
                    console.log(stats);//here we got all information of file in stats variable
                
                    if (err) {
                        return console.error(err);
                    }
                    fs.unlink(filename,function(err){
                        if(err) return console.log(err);
                        console.log('file deleted successfully');
                    });  
                });
            }
            res.render('division_master.hbs', {
                title: 'Add Offer',
                errors: errors
            });
        } else {
            if (req.fileValidationError) {
                res.render('division_master.hbs', {
                    title: 'Add Offer',
                    errors: req.fileValidationError
                });     
            } else {
              
                let div = new division();
                div.div_mast  = req.body.div_mast;
                div.div_code  = req.body.div_code;
                div.ac_add2  = req.body.ac_add2;
                div.comp_accountno  = req.body.comp_accountno;
                div.ac_cin  = req.body.ac_cin;

                div.bank_name = req.body.bank_name;
                div.bank_add = req.body.bank_add;
                div.bank_city = req.body.bank_city;
                div.bank_fax = req.body.bank_fax;
                div.bank_ifsc = req.body.bank_ifsc;
                div.bank_code = req.body.bank_code;
                div.swift_code = req.body.swift_code;
                div.comp_con_person = req.body.comp_con_person;
                div.FSSAINo = req.body.FSSAINo;
                div.NMMCNo = req.body.NMMCNo;
                div.ac_place  = req.body.ac_place;
                div.ac_state  = req.body.ac_state;
                div.ac_pin  = req.body.ac_pin;
                div.propreietor  = req.body.propreietor;
                div.ac_pan  = req.body.ac_pan;
                div.ac_pho  = req.body.ac_pho;
                div.ac_phfax  = req.body.ac_phfax;
                div.ac_mobno  = req.body.ac_mobno;
                div.ac_gstin = req.body.ac_gstin;
                div.prvyr_datafile = req.body.prvyr_datafile;
                div.ac_wbsite = req.body.ac_wbsite;
                div.ac_email = req.body.ac_email;
                div.ac_interfclanguge = req.body.ac_interfclanguge;
                div.ssevadomain = req.body.ssevadomain;
                div.ssevausr = req.body.ssevausr;
                div.ssevapwd = req.body.ssevapwd;
                div.sms_port_no = req.body.sms_port_no;
                div.smttp_client = req.body.smttp_client;
                div.email_user = req.body.email_user;
                div.email_pwd = req.body.com_name;
                div.email_port = req.body.com_name;
                div.jurisdiction = req.body.jurisdiction;
                div.ac_topline = req.body.ac_topline;
                div.ac_midline = req.body.ac_midline;
                div.ac_bottline = req.body.ac_bottline;
                div.contract_qty = req.body.contract_qty;
                div.weight_calcution = req.body.weight_calcution;
                div.character_case = req.body.character_case;
                div.fix = req.body.fix;
                div.groceryMarketRegNo = req.body.groceryMarketRegNo;
                div.Delivery = req.body.Delivery;
                div.masterid = req.session.masterid;
                if(req.file) {
                    div.filepath = req.file.path;
                    div.filename = req.file.filename;
                }
                div.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        res.redirect('/division_master/division_master');
                    }
                });
            }
        }
    });
    router.post('/update/:id', upload.single('datafile'), function(req, res){
        if(req.body.ac_place=="") req.body.ac_place=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.ac_state=="") req.body.ac_state=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        if (errors) {
            if(req.file) {
                let filename = './public/uploads/company/'+req.file.filename;
                fs.stat(filename, function (err, stats) {
                    console.log(stats);
                    if (err) {
                        return console.error(err);
                    }
                    fs.unlink(filename,function(err){
                        if(err) return console.log(err);
                        console.log('file deleted successfully');
                    });  
                });
            }
            res.json({ 'success': false, 'message': 'Validation error', errors: errors });
        }else {
            if (req.fileValidationError) {
                res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });    
            } else {
                let div = {};
                div.div_mast  = req.body.div_mast;
                div.div_code  = req.body.div_code;
                div.ac_add2  = req.body.ac_add2;
                div.bank2  = req.body.bank2;
                div.ac_cin  = req.body.ac_cin;
                div.bank1 = req.body.bank1;
                div.bank_add = req.body.bank_add;
                div.bank_city = req.body.bank_city;
                div.bank_fax = req.body.bank_fax;
                div.bank3 = req.body.bank3;
                div.bank_code = req.body.bank_code;
                div.swift_code = req.body.swift_code;
                div.ac_place  = req.body.ac_place;
                div.ac_state  = req.body.ac_state;
                div.ac_pin  = req.body.ac_pin;
                div.propreietor  = req.body.propreietor;
                div.ac_pan  = req.body.ac_pan;
                div.ac_pho  = req.body.ac_pho;
                div.ac_phfax  = req.body.ac_phfax;
                div.ac_mobno  = req.body.ac_mobno;
                div.ac_gstin = req.body.ac_gstin;
                div.prvyr_datafile = req.body.prvyr_datafile;
                div.ac_wbsite = req.body.ac_wbsite;
                div.ac_email = req.body.ac_email;
                div.ac_interfclanguge = req.body.ac_interfclanguge;
                div.ssevadomain = req.body.ssevadomain;
                div.ssevausr = req.body.ssevausr;
                div.ssevapwd = req.body.ssevapwd;
                div.sms_port_no = req.body.sms_port_no;
                div.smttp_client = req.body.smttp_client;
                div.email_user = req.body.email_user;
                div.email_pwd = req.body.com_name;
                div.email_port = req.body.com_name;
                div.jurisdiction = req.body.jurisdiction;
                div.ac_topline = req.body.ac_topline;
                div.ac_midline = req.body.ac_midline;
                div.ac_bottline = req.body.ac_bottline;
                div.contract_qty = req.body.contract_qty;
                div.weight_calcution = req.body.weight_calcution;
                div.character_case = req.body.character_case;
                div.comp_con_person = req.body.comp_con_person;
                div.FSSAINo = req.body.FSSAINo;
                div.NMMCNo = req.body.NMMCNo;
                div.fix = req.body.fix;
                div.groceryMarketRegNo = req.body.groceryMarketRegNo;
                div.Delivery = req.body.Delivery;
                div.masterid = req.session.masterid;
                if(req.file) {
                    div.filepath = req.file.path;
                    div.filename = req.file.filename;
                    let previousFilename = './public/uploads/company/'+req.body.previousfilename;
                    fs.stat(previousFilename, function (err, stats) {
                        console.log(stats);
                        if (err) {
                            return console.error(err);
                        }
                        fs.unlink(previousFilename,function(err){
                            if(err) return console.log(err);
                            console.log('file deleted successfully');
                        });  
                    });
                }
                let query = {_id:req.params.id}
                division.update(query ,div ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving machine', 'errors': err });
                        return;
                    } else {;
                        res.redirect('/division_master/division_master');
                    }
                });
            }
        }
    });


    router.get('/:id', ensureAuthenticated, function(req, res){
        division.findById(req.params.id, function(err, division){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching division details' });
            } else {
                res.json({ 'success': true, 'division': division });
            }
            
        });
    });
        router.get('/delete_divisionmaster/:id', function(req, res){
            let query = {_id:req.param.id}
            division.findById(req.params.id, function(err, division){
                division.remove(query,function(err){
                    if(err)
                    {
                        console.log(err);
                    }
                    res.redirect('/division_master/division_master');
                });
            });
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