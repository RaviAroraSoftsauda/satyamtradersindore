const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let ptyp_mast= require('../models/production_deptSchema');

// Add Route
router.get('/production_dept_master', ensureAuthenticated, function(req, res){
   // district_master.find({}, function (err, district_master){
      //  state_master.find({}, function (err, state_master) {
        ptyp_mast.find({masterid:req.session.masterid,del:"N"}, function (err,ptyp_mast){
            if (err) {
                console.log(err);
            } else {
                res.render('production_dept_master.hbs', {
                    pageTitle:'Production Department',
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

router.post('/production_dept_master_add',function(req, res){
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
        raw.Order= req.body.Order;

        raw.masterid = req.session.masterid;
        raw.user =  req.session.user;
        raw.entry =  new Date();
        raw.del = 'N';
        raw.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving production_dept_master','errors':err});
                return;
            }
            else
            {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/production_dept_master/production_dept_master');
            }
        });
    }
});
router.get('/:id', ensureAuthenticated, function(req, res){
    ptyp_mast.findById(req.params.id, function(err, ptyp_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching production_dept_mastert details' });
        } else {
            res.json({ 'success': true, 'ptyp_mast': ptyp_mast});
        }
        
    });
});
router.post('/edit_production_dept_master/:id',function(req, res){
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
        raw.Order= req.body.Order;
        
        raw.user =  req.session.user;
        raw.masterid = req.session.masterid;
        raw.update =  new Date();
        raw.del = 'N';
         let query = {_id:req.params.id}
         ptyp_mast.update(query, raw, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating production_dept_master', errors: err });
            } else {
                res.redirect('/production_dept_master/production_dept_master');
            }
        });
    }
});
router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      ptyp_mast.findById(req.params.id, function(err, ptyp_mast){
        ptyp_mast.remove(query, function(err){
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