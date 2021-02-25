const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let gowdown_mast= require('../models/gowdown_location_mast');
//let district_master = require('../models/district_schema');
//let state_master = require('../models/state_schema');

// Add Route
router.get('/gowdown_location_mast', ensureAuthenticated, function(req, res){
   // district_master.find({}, function (err, district_master){
      //  state_master.find({}, function (err, state_master) {
        gowdown_mast.find({}, function (err,gowdown_mast){
            if (err) {
                console.log(err);
            } else {
                res.render('gowdown_location_mast.hbs', {
                    pageTitle:'Gowdown Location Master',
                    gowdown_mast:gowdown_mast,
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

router.post('/gowdown_location_mast_add',function(req, res){
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
       
        let raw = new gowdown_mast();
        raw.location_name = req.body.location_name;
        raw.rack_no = req.body.rack_no;
        raw.row_no = req.body.row_no;
        raw.qty_cap = req.body.qty_cap;
        raw.remark = req.body.remark;
        raw.co_code =  req.session.compid;
        raw.div_code =  req.session.divid;
        raw.usrnm =  req.session.user;
        raw.masterid =   req.session.masterid;
        raw.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving raw sub type','errors':err});
                return;
            }
            else
            {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/gowdown_location_mast/gowdown_location_mast');
            }
        });
    }
});
router.get('/:id', ensureAuthenticated, function(req, res){
    gowdown_mast.findById(req.params.id, function(err, gowdown_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching brnad details' });
        } else {
            res.json({ 'success': true, 'gowdown_mast': gowdown_mast });
        }
        
    });
});
router.post('/edit_location/:id',function(req, res){
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let raw = {};
        raw.location_name = req.body.location_name;
        raw.rack_no = req.body.rack_no;
        raw.row_no = req.body.row_no;
        raw.qty_cap = req.body.qty_cap;
        raw.remark = req.body.remark;
        raw.co_code =  req.session.compid;
        raw.div_code =  req.session.divid;
        raw.usrnm =  req.session.user;
        raw.masterid =   req.session.masterid;
         let query = {_id:req.params.id}
         gowdown_mast.update(query, raw, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating City', errors: err });
            } else {
                res.redirect('/gowdown_location_mast/gowdown_location_mast');
            }
        });
    }
});
router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      gowdown_mast.findById(req.params.id, function(err,gowdown_mast){
        gowdown_mast.remove(query, function(err){
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