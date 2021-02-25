const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let g_mast= require('../models/groupSchema');



// Add Route
router.get('/group_mast', ensureAuthenticated, function(req, res){
   // district_master.find({}, function (err, district_master){
      //  state_master.find({}, function (err, state_master) {
    g_mast.find({masterid: req.session.masterid, del: "N"}, function (err,g_mast){
        
        if (err) {
            console.log(err);
        } else {
            var last = g_mast[g_mast.length-1].Order+1;
            res.render('group_mast.hbs', {
                pageTitle:'Group Master',
                g_mast:g_mast,
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
    }).sort({'Order':1});
});

router.post('/gmast_add',function(req, res){
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
        var GaruEntryModel = req.body.GaruEntryModel;
        let group = new g_mast();
        group.Order = req.body.gm_order;
        group.MainGroupName = req.body.sub_group;
        group.GroupName = req.body.group_name;
        group.GroupType = req.body.group_type;
        group.MaintainOs = req.body.main_out;
        group.Suppress = req.body.supp_gwt;
        group.Address = req.body.Address;
        group.Ledger = req.body.Ledger;
        // group.co_code =  req.session.compid;
        // group.div_code =  req.session.divid;
        group.user =  req.session.user;
        group.entry =  new Date();
        group.del = 'N';
        group.masterid =   req.session.masterid;
      
       g_mast.findOne({ GroupName: req.body.group_name,del:'N'}, function(errors, g_mast){
       //  console.log(g_mast)
      //  console.log(req.body.ac_name)
        let agrfg=true;
              if(g_mast==null) {
                  group.save()
                  agrfg=true;
                }else{
                   agrfg=false;
                     }
                    res.json({'success': agrfg,'GaruEntryModel':GaruEntryModel});
                    })
                }
            });
router.get('/:id', ensureAuthenticated, function(req, res){
    g_mast.findById(req.params.id, function(err, g_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            res.json({ 'success': true, 'g_mast': g_mast });
        }
      
    });
});
router.post('/edit_gmast/:id',function(req, res){
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
        group.Order = req.body.gm_order;
        group.MainGroupName = req.body.sub_group;
        group.GroupName = req.body.group_name;
        group.GroupType = req.body.group_type;
        group.MaintainOs = req.body.main_out;
        group.Suppress = req.body.supp_gwt;
        group.Address = req.body.Address;
        group.Ledger = req.body.Ledger;
        // group.co_code =  req.session.compid;
        // group.div_code =  req.session.divid;
        group.user =  req.session.user;
        group.entry =  new Date();
        group.del = 'N';
        group.masterid =   req.session.masterid;
        let query = { _id:req.params.id}
        //  console.log( query);
       
            g_mast.update(query , group ,function (err) { 
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating City', errors: err });
                } else {
                    res.json({ 'success': true});
                }
            });
      
  }
 
});

let accountmast = require('../models/accountSchema');
let grpsetup = require('../models/gsTableSchema');
router.delete('/confirm/:id',ensureAuthenticated, function(req, res){
    // console.log(req.params.id)
    let query = {_id:req.params.id}
    accountmast.find({GroupName : req.params.id, del:"N"}, function(err, account){
        grpsetup.find({garry : req.params.id}, function(err, group){
            if(err){
              console.log(err);
            }else{
                // console.log(group)
                // console.log(account)
                if( account != '' || group != ''){
                    res.json({success:'true'});
                }else{res.json({success:'false'});}
            }
        });
    });
});

router.delete('/:id',ensureAuthenticated, function(req, res){    
    if(!req.user._id){
      res.status(500).send();
    }else{
    let query = {_id:req.params.id}
    let state = {};
    state.del = 'Y';
    state.delete = new Date();
    g_mast.update(query,state, function(err,somast){
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