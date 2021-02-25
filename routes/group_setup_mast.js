const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let g_mast= require('../models/groupSchema');
let g_s_mast= require('../models/gsTableSchema');



// Add Route
router.get('/group_setup_mast', ensureAuthenticated, function(req, res){
   // district_master.find({}, function (err, district_master){
      //  state_master.find({}, function (err, state_master) {
        g_mast.find({masterid: req.session.masterid, del: "N"}, function (err,g_mast){
            g_s_mast.find( function (err,g_s_mast){
            if (err) {
                console.log(err);
            } else {
                var last = g_mast[g_mast.length-1].Order+1;
                res.render('group_setup_mast.hbs', {
                    pageTitle:'Group Setup Master',
                    g_mast:g_mast,
                    g_s_mast:g_s_mast,
                    last:last,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator

                });
            }
        
        }).populate('garry');
        }).sort({'Order':1});
        });

router.post('/group_setup_mast_add',function(req, res){
//   if(req.body.type_descr=="") req.body.type_descr=mongoose.Types.ObjectId('578df3efb618f5141202a196');
//       if(req.body.sub_descr=="") req.body.sub_descr=mongoose.Types.ObjectId('578df3efb618f5141202a196');
//          if(req.body.sku_name=="") req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
    
       let group = new g_s_mast();
        group.group = req.body.group;
        group.garry = req.body.garry;
        
        
        group.user =  req.session.user;
        group.entry =  new Date();
        group.masterid =   req.session.masterid;
      
      //  console.log(g_mast)
      //  console.log(req.body.ac_name)
        group.save()
    }   
                
});



router.get('/:id', ensureAuthenticated, function(req, res){
    g_s_mast.findById(req.params.id, function(err, g_mast){
        
       
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            res.json({ 'success': true, 'g_mast': g_mast });
        }
      
    });
});
router.post('/group_setup_mast_update/:id',function(req, res){
    // if(req.body.type_descr=="") req.body.type_descr=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //   if(req.body.sub_descr=="") req.body.sub_descr=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //     if(req.body.sku_name=="") req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let group = {};
        // let group = new g_s_mast();
        group.group = req.body.group;
        group.garry = req.body.garry;
        
        group.user =  req.session.user;
        group.entry =  new Date();
        group.masterid =   req.session.masterid;
       
        let query = { _id:req.params.id}
        //  console.log( query);
       
        g_s_mast.update(query , group ,function (err) { 
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating City', errors: err });
                } else {
                    res.json({ 'success': true});
                }
            });
      
  }
 
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      g_mast.findById(req.params.id, function(err,g_mast){
        g_mast.remove(query, function(err){
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