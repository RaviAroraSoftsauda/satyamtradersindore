const express = require('express');
const router = express.Router(); 
let brand = require('../models/brand_schema');
var query;

// Add Route
router.get('/brand', ensureAuthenticated, function(req, res){
    brand.find({masterid:req.session.masterid}, function (err, brand){
            if (err) {
                console.log(err);
            } else {
                res.render('brand.hbs', {
                    pageTitle:'Add brand',
                    brand: brand,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'brand_name':1})
    });
    router.post('/brand_add',function(req, res){
        // console.log(req.body);
        req.checkBody('brand_name','brand Name is required').notEmpty();
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let brnd = new brand();
            brnd.brand_name = req.body.brand_name;
            brnd.co_code =  req.session.compid;
            brnd.div_code =  req.session.divid;
            brnd.usrnm =  req.session.user;
            brnd.masterid =   req.session.masterid;
            brnd.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/brand/brand');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        brand.findById(req.params.id, function(err, brand){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching brand details' });
            } else {
                res.json({ 'success': true, 'brand': brand });
            }
            
        });
    });
        router.post('/edit_brand/:id', function(req, res) {
            // console.log(req,body);
           req.checkBody('brand_name','Brand Name is required').notEmpty();
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let brnd = {}; 
                brnd.brand_name = req.body.brand_name;
                brnd.co_code =  req.session.compid;
                brnd.div_code =  req.session.divid;
                brnd.usrnm =  req.session.user;
                brnd.masterid =   req.session.masterid;
                let query = {_id:req.params.id}
                brand.update(query ,brnd ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/brand/brand');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              brand.findById(req.params.id, function(err, brand){
                brand.remove(query, function(err){
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