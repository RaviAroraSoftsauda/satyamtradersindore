const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let bank = require('../models/bank_schema');
let district_master = require('../models/district_schema');
let state_master = require('../models/state_schema');
var query;
// Add Route
router.get('/bank', ensureAuthenticated, function(req, res){
    bank.find({}, function (err, bank){
        district_master.find({}, function (err, district_master){
            state_master.find({}, function (err, state_master){
            if (err) {
                console.log(err);
            } else {
                res.render('bank.hbs', {
                    pageTitle:'Add bank',
                    bank: bank,
                    district_master: district_master,
                    state_master: state_master,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'state_name':1});
    }).sort({'dis_name':1});
    }).sort({'bank_name':1}).populate('bnk_dist').populate('state_name')
    });
    router.post('/bank_add',function(req, res){
        if(req.body.bnk_dist=="") req.body.bnk_dist=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.state_name=="") req.body.state_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let bnk = new bank();
            bnk.bank_name = req.body.bank_name;
            bnk.bnk_brnch = req.body.bnk_brnch;
            bnk.bnk_ifsc = req.body.bnk_ifsc;
            bnk.bnk_micr = req.body.bnk_micr;
            bnk.bnk_add = req.body.bnk_add;
            bnk.bnk_add1 = req.body.bnk_add1;
            bnk.bnk_center = req.body.bnk_center;
            bnk.bnk_cont = req.body.bnk_cont;
            bnk.bnk_dist = req.body.bnk_dist;
            bnk.state_name = req.body.state_name;
            bnk.co_code =  req.session.compid;
            bnk.div_code =  req.session.divid;
            bnk.usrnm =  req.session.user;
            bnk.masterid =   req.session.masterid;
            bnk.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/bank/bank');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        bank.findById(req.params.id, function(err, bank){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching bank details' });
            } else {
                res.json({ 'success': true, 'bank': bank });
            }
            
        });
    });
        router.post('/edit_bank/:id', function(req, res) {
            if(req.body.bnk_dist=="") req.body.bnk_dist=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.state_name=="") req.body.state_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let bnk = {}; 
                bnk.bank_name = req.body.bank_name;
                bnk.bnk_brnch = req.body.bnk_brnch;
                bnk.bnk_ifsc = req.body.bnk_ifsc;
                bnk.bnk_micr = req.body.bnk_micr;
                bnk.bnk_add = req.body.bnk_add;
                bnk.bnk_add1 = req.body.bnk_add1;
                bnk.bnk_center = req.body.bnk_center;
                bnk.bnk_cont = req.body.bnk_cont;
                bnk.bnk_dist = req.body.bnk_dist;
                bnk.state_name = req.body.state_name;
                bnk.co_code =  req.session.compid;
                bnk.div_code =  req.session.divid;
                bnk.usrnm =  req.session.user;
                bnk.masterid =   req.session.masterid;
                let query = {_id:req.params.id}
                bank.update(query ,bnk ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/bank/bank');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              bank.findById(req.params.id, function(err, bank){
                bank.remove(query, function(err){
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