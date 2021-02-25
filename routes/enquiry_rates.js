const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let product = require('../models/product_mast_schema');
let enquiry = require('../models/enquiry_schema');
var query;
router.get('/dailyrateslist', function (req, res) {
    enquiry.find({}, function(err, enquiry){
            res.json({ 'success': true, 'enquiry': enquiry });
        });
});
router.post('/appenquiry_add',function(req, res){
    if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let Enquiry = new enquiry();
        Enquiry.main_bk= "Mobile App";
        Enquiry.st_name = req.body.st_name;
        Enquiry.item_name = req.body.item_name;
        Enquiry.prod_spec = req.body.prod_spec;
        Enquiry.rate_min = req.body.rate_min;
        Enquiry.rate_max = req.body.rate_max;
        Enquiry.rate_condtion = req.body.rate_condtion;
        Enquiry.co_code =  req.body.co_code;
        Enquiry.div_code =  req.body.div_code;
        Enquiry.usrnm =  req.body.usrnm;
        Enquiry.masterid = req.body.masterid;
        Enquiry.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving enquiry','errors':err});
                return;
            }
            else
            {
                res.json({ 'success': true, 'result':  Enquiry});
                // res.redirect('/enquiry/enquiry');
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
        }).sort({'product_name':1});
    });
 });
router.get('/enquiry_rates', ensureAuthenticated, function(req, res){
    enquiry.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, enquiry){
        product.find({masterid:req.session.masterid},'product_name', function (err, product){
            if (err) {
                console.log(err);
            } else {
                res.render('enquiry_rates.hbs', {
                    pageTitle:'Add Enquiry',
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
 ///Api
    router.post('/enquiry_add',function(req, res){
        if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let Enquiry = new enquiry();
            Enquiry.st_name = req.body.st_name;
            Enquiry.main_bk= "System";
            Enquiry.item_name = req.body.item_name;
            Enquiry.prod_spec = req.body.prod_spec;
            Enquiry.rate_min = req.body.rate_min;
            Enquiry.rate_max = req.body.rate_max;
            Enquiry.rate_condtion = req.body.rate_condtion;
            Enquiry.co_code =  req.session.compid;
            Enquiry.div_code =  req.session.divid;
            Enquiry.usrnm =  req.session.user;
            Enquiry.masterid = req.session.masterid;
            Enquiry.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving enquiry','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/enquiry_rates/enquiry_rates');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        enquiry.findById(req.params.id, function(err, enquiry){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching daily rates details' });
            } else {
                res.json({ 'success': true, 'enquiry': enquiry });
            }
            
        });
    });
        router.post('/edit_enquiry_rates/:id', function(req, res) {
            if(req.body.item_name=="") req.body.item_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let Enquiry = {}; 
                    Enquiry.main_bk= "System";
                    Enquiry.st_name = req.body.st_name;
                    Enquiry.item_name = req.body.item_name;
                    Enquiry.prod_spec = req.body.prod_spec;
                    Enquiry.rate_min = req.body.rate_min;
                    Enquiry.rate_max = req.body.rate_max;
                    Enquiry.rate_condtion = req.body.rate_condtion;
                    Enquiry.co_code =  req.session.compid;
                    Enquiry.div_code =  req.session.divid;
                    Enquiry.usrnm =  req.session.user;
                    Enquiry.masterid = req.session.masterid;
                    let query = {_id:req.params.id}
                    enquiry.update(query ,Enquiry ,function (err) {
                        if (err) {
                            res.json({ 'success': false, 'message': 'Error in Saving daily rates', 'errors': err });
                            return;
                        } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/enquiry_rates/enquiry_rates');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              enquiry.findById(req.params.id, function(err, enquiry){
                enquiry.remove(query, function(err){
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