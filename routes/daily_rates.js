const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
 let daily_rates = require('../models/daily_rates_schema');
let product = require('../models/product_mast_schema');
let enquiry = require('../models/enquiry_schema');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var query;

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/dailyratesimage')
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
router.get('/dailyrateslist', function (req, res) {
    var masterid =  req.query.masterid;
        daily_rates.find({masterid:masterid},function (err, daily_rates){
          if (daily_rates != null)
          {  
            var data = new Array();
            for (var j = 0; j < daily_rates.length; j++)
            {
                if (daily_rates[j]['st_name'] != null) st_name = daily_rates[j]['st_name'];
                else st_name = "";
                if (daily_rates[j]['item_name'] != null) item_name = daily_rates[j]['item_name']['product_name'];
                else item_name = "";
                if (daily_rates[j]['item_name'] != null) item_id = daily_rates[j]['item_name']['_id'];
                else item_id = "";
                if (daily_rates[j]['filepath'] != null) filepath = daily_rates[j]['filepath'];
                else filepath = "public\\uploads\\dailyratesimage\\company.png";
                if (daily_rates[j]['prod_spec'] != null) prod_spec = daily_rates[j]['prod_spec'];
                else prod_spec = "";
                if (daily_rates[j]['rate_min'] != null) rate_min = daily_rates[j]['rate_min'];
                else rate_min = "";
                if (daily_rates[j]['rate_max'] != null) rate_max = daily_rates[j]['rate_max'];
                else rate_max = "";
                if (daily_rates[j]['rate_condtion'] != null) rate_condtion = daily_rates[j]['rate_condtion'];
                else rate_condtion = "";
                data[j] = {
                    "id":  daily_rates[j]._id,
                    "st_name" : st_name,
                    "item_name" : item_name,
                    "item_id":item_id,
                    "filepath" : filepath,
                    "prod_spec" : prod_spec,
                    "rate_min" : rate_min,
                    "rate_max" : rate_max,
                    "rate_condtion" : rate_condtion,
               };
            }
         }
            res.json({ 'success': true, 'daily_rates_list': data});
        }).populate('item_name','product_name');
});
router.post('/appdaily_rates_add',function(req, res){
    if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let dailyrates = new daily_rates();
        dailyrates.main_bk= "Mobile App";
        dailyrates.st_name = req.body.st_name;
        dailyrates.item_name = req.body.item_name;
        dailyrates.prod_spec = req.body.prod_spec;
        dailyrates.rate_min = req.body.rate_min;
        dailyrates.rate_max = req.body.rate_max;
        dailyrates.rate_condtion = req.body.rate_condtion;
        dailyrates.co_code =  req.body.co_code;
        dailyrates.div_code =  req.body.div_code;
        dailyrates.usrnm =  req.body.usrnm;
        dailyrates.masterid = req.body.masterid;
        dailyrates.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving daily_rates','errors':err});
                return;
            }
            else
            {
                res.json({ 'success': true, 'result':  dailyrates});
                // res.redirect('/daily_rates/daily_rates');
            }
        });
    }
});
 router.post('/edit_daily_rates_update/:id', function(req, res) {
            if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let dailyrates = {}; 
                    dailyrates.st_name = req.body.st_name;
                    dailyrates.item_name = req.body.item_name;
                    dailyrates.prod_spec = req.body.prod_spec;
                    dailyrates.rate_min = req.body.rate_min;
                    dailyrates.rate_max = req.body.rate_max;
                    dailyrates.rate_condtion = req.body.rate_condtion;
                    // dailyrates.co_code =  req.session.compid;
                    // dailyrates.div_code =  req.session.divid;
                    // dailyrates.usrnm =  req.session.user;
                    // dailyrates.masterid = req.session.masterid;
                let query = {_id:req.params.id}
                daily_rates.update(query ,dailyrates ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving daily rates', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.json({ 'success': true, 'result':  dailyrates});
                    }
                });
            }
        });
        router.post('/max_daily_rates_update/:id', function(req, res) {
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let dailyrate = {}; 
                dailyrate.rate_max = req.body.rate_max;
                let query = {_id:req.params.id}
                //console.log(query)
                daily_rates.update(query ,dailyrate ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving daily rates', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.json({ 'success': true, 'result':  dailyrate});
                    }
                });
            }
        });

        router.post('/update_token/:id', function(req, res) {
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {

                let dailyrate = {}; 
                dailyrate.rate_max = req.body.rate_max;
                let query = {_id:req.params.id}
                //console.log(query)
                daily_rates.update(query ,dailyrate ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving daily rates', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.json({ 'success': true, 'result':  dailyrate});
                    }
                });
            }
        });

// Add Route
router.get('/app_enquirylist', ensureAuthenticated, function(req, res){
    enquiry.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, enquiry){
        product.find({masterid:req.session.masterid}, function (err, product){
            if (err) {
                console.log(err);
            } else {
                res.render('app_enquirylist.hbs', {
                    pageTitle:'Enquiry List',
                    enquiry: enquiry,
                    product: product,
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
    }).populate('item_name');
 });
router.get('/daily_rates', ensureAuthenticated, function(req, res){
    daily_rates.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, daily_rates){
        product.find({masterid:req.session.masterid},'product_name', function (err, product){
            if (err) {
                console.log(err);
            } else {
                res.render('daily_rates.hbs', {
                    pageTitle:'Add daily rates',
                    daily_rates: daily_rates,
                    product: product,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'product_name':1});
    }).populate('item_name','product_name');
 });
 ///Api

router.post('/daily_rates_add', upload.single('daily_ratesimage'), (req, res, next) => {
    if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if (errors) {
        if(req.file) {
            let filename = './public/uploads/dailyratesimage/'+req.file.filename;
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
        res.render('daily_rates.hbs', {
            title: 'Daily Rates',
            errors: errors
        });
    } else {
        if (req.fileValidationError) {
            res.render('daily_rates.hbs', {
                title: 'Daily Rates',
                errors: req.fileValidationError
            });     
        } else {
            let dailyrates = new daily_rates();
            dailyrates.st_name = req.body.st_name;
            dailyrates.item_name = req.body.item_name;
            dailyrates.prod_spec = req.body.prod_spec;
            dailyrates.rate_min = req.body.rate_min;
            dailyrates.rate_max = req.body.rate_max;
            dailyrates.rate_condtion = req.body.rate_condtion;
            dailyrates.co_code =  req.session.compid;
            dailyrates.div_code =  req.session.divid;
            dailyrates.usrnm =  req.session.user;
            dailyrates.masterid = req.session.masterid;
            if(req.file) {
                dailyrates.filepath = req.file.path;
                dailyrates.filename = req.file.filename;
            }
            dailyrates.save(function (err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    res.redirect('/daily_rates/daily_rates');
                }
            });
        }
    }
});
    // router.post('/daily_rates_add',function(req, res){
    //     if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //     let errors = req.validationErrors();
    //     if(errors)
    //     {
    //         console.log(errors);
    //     }
    //     else
    //     {
    //         let dailyrates = new daily_rates();
    //         dailyrates.st_name = req.body.st_name;
    //         dailyrates.item_name = req.body.item_name;
    //         dailyrates.prod_spec = req.body.prod_spec;
    //         dailyrates.rate_min = req.body.rate_min;
    //         dailyrates.rate_max = req.body.rate_max;
    //         dailyrates.rate_condtion = req.body.rate_condtion;
    //         dailyrates.co_code =  req.session.compid;
    //         dailyrates.div_code =  req.session.divid;
    //         dailyrates.usrnm =  req.session.user;
    //         dailyrates.masterid = req.session.masterid;
    //         dailyrates.save(function (err){
    //             if(err)
    //             {
    //                 res.json({'success':false,'message':'error in saving daily_rates','errors':err});
    //                 return;
    //             }
    //             else
    //             {
    //                 // res.json({ 'success': true, 'message': 'Order added succesfully' });
    //                 res.redirect('/daily_rates/daily_rates');
    //             }
    //         });
    //     }
    // });
    router.get('/:id', ensureAuthenticated, function(req, res){
        daily_rates.findById(req.params.id, function(err, daily_rates){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching daily rates details' });
            } else {
                res.json({ 'success': true, 'daily_rates': daily_rates });
            }
            
        });
    });
        // router.post('/edit_daily_rates/:id', function(req, res) {
        //     if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        //     let errors = req.validationErrors();
        //     if (errors) {
        //         console.log(errors);
        //         res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
        //     } else {
        //         let dailyrates = {}; 
        //             dailyrates.st_name = req.body.st_name;
        //             dailyrates.item_name = req.body.item_name;
        //             dailyrates.prod_spec = req.body.prod_spec;
        //             dailyrates.rate_min = req.body.rate_min;
        //             dailyrates.rate_max = req.body.rate_max;
        //             dailyrates.rate_condtion = req.body.rate_condtion;
        //             dailyrates.co_code =  req.session.compid;
        //             dailyrates.div_code =  req.session.divid;
        //             dailyrates.usrnm =  req.session.user;
        //             dailyrates.masterid = req.session.masterid;
        //         let query = {_id:req.params.id}
        //         daily_rates.update(query ,dailyrates ,function (err) {
        //             if (err) {
        //                 res.json({ 'success': false, 'message': 'Error in Saving daily rates', 'errors': err });
        //                 return;
        //             } else {
        //                 // res.json({ 'success': true, 'message': 'Order added succesfully' });
        //                 res.redirect('/daily_rates/daily_rates');
        //             }
        //         });
        //     }
        // });
        router.post('/edit_daily_rates/:id', upload.single('daily_ratesimage'), function(req, res){
            if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            if (errors) {
                if(req.file) {
                    let filename = './public/uploads/dailyratesimage/'+req.file.filename;
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
            } else {
                if (req.fileValidationError) {
                    res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });    
                } else {
                    let dailyrates = {}; 
                    dailyrates.st_name = req.body.st_name;
                    dailyrates.item_name = req.body.item_name;
                    dailyrates.prod_spec = req.body.prod_spec;
                    dailyrates.rate_min = req.body.rate_min;
                    dailyrates.rate_max = req.body.rate_max;
                    dailyrates.rate_condtion = req.body.rate_condtion;
                    dailyrates.co_code =  req.session.compid;
                    dailyrates.div_code =  req.session.divid;
                    dailyrates.usrnm =  req.session.user;
                    dailyrates.masterid = req.session.masterid;
                    if(req.file) {
                        dailyrates.filepath = req.file.path;
                        dailyrates.filename = req.file.filename;
                        let previousFilename = './public/uploads/dailyratesimage/'+req.body.previousfilename;
                        fs.stat(previousFilename, function (err, stats) {
                            // console.log(stats);
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
                    daily_rates.update(query ,dailyrates ,function (err) {
                        if (err) {
                            res.json({ 'success': false, 'message': 'Error in Saving machine', 'errors': err });
                            return;
                        } else {;
                            res.redirect('/daily_rates/daily_rates');
                        }
                    });
                }
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              daily_rates.findById(req.params.id, function(err, daily_rates){
                daily_rates.remove(query, function(err){
                    if(err){
                      console.log(err);
                    }
                    res.send('Success');
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