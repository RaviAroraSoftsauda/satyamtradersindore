const express = require('express');
const router = express.Router(); 
let proprietor = require('../models/proprietor_schema');
var query;

// Add Route
router.get('/proprietor', ensureAuthenticated, function(req, res){
    proprietor.find({masterid:req.session.masterid}, function (err, proprietor){
            if (err) {
                console.log(err);
            } else {
                res.render('proprietor.hbs', {
                    pageTitle:'Add proprietor',
                    proprietor: proprietor,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'proprietor_name':1})
    });
    router.post('/proprietor_add',function(req, res){
        // console.log(req.body);
        req.checkBody('proprietor_name','proprietor Name is required').notEmpty();
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let propr = new proprietor();
            propr.proprietor_name = req.body.proprietor_name;
            propr.co_code =  req.session.compid;
            propr.div_code =  req.session.divid;
            propr.usrnm =  req.session.user;
            propr.masterid=req.session.masterid;
            propr.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/proprietor/proprietor');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        proprietor.findById(req.params.id, function(err, proprietor){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching brnad details' });
            } else {
                res.json({ 'success': true, 'proprietor': proprietor });
            }
            
        });
    });
        router.post('/edit_proprietor/:id', function(req, res) {
            // console.log(req,body);
           req.checkBody('proprietor_name','proprietor Name is required').notEmpty();
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let propr = {}; 
                propr.proprietor_name = req.body.proprietor_name;
                propr.co_code =  req.session.compid;
                propr.div_code =  req.session.divid;
                propr.usrnm =  req.session.user;
                propr.masterid=req.session.masterid;
                let query = {_id:req.params.id}
                proprietor.update(query ,propr ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/proprietor/proprietor');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              proprietor.findById(req.params.id, function(err, proprietor){
                proprietor.remove(query, function(err){
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