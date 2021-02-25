const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let raw_mat_typ_mast= require('../models/raw_mat_typ_mast_schema');
//let district_master = require('../models/district_schema');
//let state_master = require('../models/state_schema');

// Add Route
router.get('/raw_mat_typ_mast', ensureAuthenticated, function(req, res){
   // district_master.find({}, function (err, district_master){
      //  state_master.find({}, function (err, state_master) {
        raw_mat_typ_mast.find({}, function (err,raw_mat_typ_mast){
            if (err) {
                console.log(err);
            } else {
                res.render('raw_mat_typ_mast.hbs', {
                    pageTitle:'Raw Material',
                    raw_mat_typ_mast: raw_mat_typ_mast,
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

router.post('/raw_mat_typ_mast_add',function(req, res){
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let raw = new raw_mat_typ_mast();
        raw.type_descr = req.body.type_descr;
        raw.type_Code= req.body.type_Code;
        raw.co_code =  req.session.compid;
        raw.div_code =  req.session.divid;
        raw.usrnm =  req.session.user;
        raw.masterid =   req.session.masterid;
        raw.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving city','errors':err});
                return;
            }
            else
            {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/raw_mat_typ_mast/raw_mat_typ_mast');
            }
        });
    }
});
router.get('/:id', ensureAuthenticated, function(req, res){
    raw_mat_typ_mast.findById(req.params.id, function(err, raw_mat_typ_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching brnad details' });
        } else {
            res.json({ 'success': true, 'raw_mat_typ_mast': raw_mat_typ_mast });
        }
        
    });
});
router.post('/edit_raw_mat/:id',function(req, res){
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let raw = {};
        raw.type_descr = req.body.type_descr;
        raw.type_Code= req.body.type_Code;
        raw.co_code =  req.session.compid;
        raw.div_code =  req.session.divid;
        raw.usrnm =  req.session.user;
        raw.masterid =   req.session.masterid;
         let query = {_id:req.params.id}
         raw_mat_typ_mast.update(query, raw, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating City', errors: err });
            } else {
                res.redirect('/raw_mat_typ_mast/raw_mat_typ_mast');
            }
        });
    }
});
router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      raw_mat_typ_mast.findById(req.params.id, function(err, raw_mat_typ_mast){
        raw_mat_typ_mast.remove(query, function(err){
            if(err){
              console.log(err);
            }
            res.send('Success');
          });
      });
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