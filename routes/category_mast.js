const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let ptyp_mast= require('../models/CategorySchema');


// Add Route
router.get('/category_mast', ensureAuthenticated, function(req, res){
   // district_master.find({}, function (err, district_master){
      //  state_master.find({}, function (err, state_master) {
        ptyp_mast.find({del:"N"}, function (err,ptyp_mast){
            if (err) {
                console.log(err);
            } else {
                res.render('category_mast.hbs', {
                    pageTitle:'Item Group Master',
                    ptyp_mast: ptyp_mast,
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
    });

router.post('/category_mast_add',function(req, res){
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let raw = new ptyp_mast();
        raw.Description = req.body.ptype_descr;
        raw.Code= req.body.ptype_Code;
        
        raw.masterid = req.session.masterid;
        raw.user =  req.session.user;
        raw.entry =  new Date();
        raw.del = 'N';
        raw.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving category_mast','errors':err});
                return;
            }
            else
            {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/category_mast/category_mast');
            }
        });
    }
});
router.get('/:id', ensureAuthenticated, function(req, res){
    ptyp_mast.findById(req.params.id, function(err, ptyp_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching brnad details' });
        } else {
            res.json({ 'success': true, 'ptyp_mast': ptyp_mast});
        }
        
    });
});
router.post('/edit_category_mast/:id',function(req, res){
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let raw = {};
        raw.Description = req.body.ptype_descr;
        raw.Code= req.body.ptype_Code;
        
        raw.masterid = req.session.masterid;
        raw.user =  req.session.user;
        raw.entry =  new Date();
        raw.del = 'N';
         let query = {_id:req.params.id}
         ptyp_mast.update(query, raw, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating category_mast', errors: err });
            } else {
                res.redirect('/category_mast/category_mast');
            }
        });
    }
});


let rawmat = require('../models/rawmatSchema');
router.delete('/confirm/:id', function(req, res){
    // console.log(req.params.id)
    let query = {_id:req.params.id}
    rawmat.findOne({Rm_Category : req.params.id, del:"N"}, function(err, raw){
            if(err){
              console.log(err);
            }else{
                console.log(raw)
                if(raw != null){
                    res.json({success:'true'});
                }
                if(raw == null){
                    res.json({success:'false'});
                }
            }
      });
});

router.delete('/:id', function(req, res){    
    if(!req.user._id){
      res.status(500).send();
    }else{
    let query = {_id:req.params.id}
    let state = {};
    state.del = 'Y';
    state.delete = new Date();
    ptyp_mast.update(query,state, function(err,somast){
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