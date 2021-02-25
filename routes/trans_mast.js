const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let tm_mast= require('../models/trans_mast_schema');
//let district_master = require('../models/district_schema');
//let state_master = require('../models/state_schema');

// Add Route
router.get('/trans_mast', ensureAuthenticated, function(req, res){
   // district_master.find({}, function (err, district_master){
      //  state_master.find({}, function (err, state_master) {
        tm_mast.find({}, function (err,tm_mast){
            if (err) {
                console.log(err);
            } else {
                res.render('trans_mast.hbs', {
                    pageTitle:'Transaction Mater',
                    tm_mast: tm_mast,
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

router.post('/tm_add',function(req, res){
     let errors = req.validationErrors();
      if(errors)
       {
           console.log(errors);
       }
      else
         {
             let raw = new tm_mast();
             raw.tran_descr = req.body.tran_descr;
             raw.tran_Code= req.body.tran_Code;
             raw.co_code =  req.session.compid;
             raw.div_code =  req.session.divid;
             raw.usrnm =  req.session.user;
             raw.masterid =   req.session.masterid;
           tm_mast.findOne({$and: [{ tran_descr: req.body.tran_descr }]}, function(errors, tm_mast){
             
             if(tm_mast==null) {
               raw.save()
                  agrfg=true;
              }else{
                  agrfg=false;
              }
                  res.json({'success': agrfg});
                 
                })
      }
 
});

router.get('/:id', ensureAuthenticated, function(req, res){
    tm_mast.findById(req.params.id, function(err, tm_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching trans master' });
        } else {
            res.json({ 'success': true, 'tm_mast': tm_mast });
        }
        
    });
});
router.post('/edit_tm/:id',function(req, res){
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let raw = {};
        raw.tran_descr = req.body.tran_descr;
        raw.tran_Code= req.body.tran_Code;
        raw.co_code =  req.session.compid;
        raw.div_code =  req.session.divid;
        raw.usrnm =  req.session.user;
        raw.masterid =   req.session.masterid;
         let query = {_id:req.params.id}
       console.log("gg"+query._id )
tm_mast.findOne({$and: [ { _id: { $ne:query._id} },{ tran_descr: req.body.tran_descr}]}, function(errors, rio){
    let trfls=false;
          if(rio==null) {
            //tm_mast.update(query , raw ,function (err) { });
            tm_mast.update(query , raw ,function (err) { });
              trfls=true                                                     
              }
              else
              {
                  trfls=false 
              }
              return  res.json({'success':trfls});
                 
      })
    
  }
 
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      tm_mast.findById(req.params.id, function(err, tm_mast){
        tm_mast.remove(query, function(err){
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