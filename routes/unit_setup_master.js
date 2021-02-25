const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let g_mast= require('../models/groupSchema');
// let g_s_mast= require('../models/unitsetupSchema');
let unit_setup_master= require('../models/unitsetupSchema');
let rawMat_mast= require('../models/rawmatSchema');
let division= require('../models/divSchema');

router.get('/rawmatmastname', function (req, res) {
    division.find({}, function(err, division){
        unit_setup_master.find({masterid:req.session.masterid, del:'N'}, function(err, unit_setup_master){
        res.json({ 'success': true, 'rowmatname': division,'StockUnit': unit_setup_master });
    });
}).sort({'Rm_ProCode':1});
});

// Add Route
router.get('/unit_setup_master', ensureAuthenticated, function(req, res){
        g_mast.find({masterid: req.session.masterid, del: "N"}, function (err,g_mast){
            unit_setup_master.find({masterid: req.session.masterid, del: "N"}, function (err,unit_setup_master){
                division.find({}, function (err,division){
            if (err) {
                console.log(err);
            } else {
                // console.log(unit_setup_master);
                // console.log(division);
                var last = g_mast[g_mast.length-1].Order+1;
                res.render('unit_setup_master.hbs', {
                    pageTitle:'Unit Setup Master',
                    
                    g_mast:g_mast,
                    unit_setup:unit_setup_master,
                    last:last,
                    division:division,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                   

                });
            }
        
        });
        }).sort({'Order':1});
        });
        });

router.post('/unit_setup_master_add',function(req, res){
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
       let group = new unit_setup_master();
        group.EntryModule = req.body.EntryModule;
 
        group.Qty_Unit = req.body.Qty_Unit;
        group.M_Packing = req.body.M_Packing;
        group.W_Division = req.body.W_Division;
        group.Est_Capunit = req.body.Est_Capunit;
        group.Sub_Unit = req.body.Sub_Unit;
        group.D_Balancing = req.body.D_Balancing;
        group.Division_Name = req.body.Division_Name;
        group.unitArray = req.body.unitArray;
     
        group.user =  req.session.user;
        group.del = 'N';
        group.entry =  new Date();
        group.masterid =   req.session.masterid;
      
    //    console.log(group)
      //  console.log(req.body.ac_name)
        group.save()
    }   
});

router.get('/edit_unit/:id', ensureAuthenticated, function(req, res){
    unit_setup_master.findById(req.params.id, function(err, unit){
        unit_setup_master.find({masterid: req.session.masterid, del: "N"}, function (err,unit_setup){
        division.find({}, function (err,division){

        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            // console.log(unit_setup);
            res.render('unit_setup_master.hbs', {
                pageTitle:'Unit Setup Master',
                
                g_mast:g_mast,
                unit_setup_master:unit,
                unit_setup:unit_setup,
                division:division,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,   
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
               

            });
        }
        });
    });
    });
});
router.post('/unit_setup_master_update/:id',function(req, res){
   
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let group = {};
        // let group = new g_s_mast();
        group.EntryModule = req.body.EntryModule;
        group.unitArray = req.body.unitArray;
        group.user =  req.session.user;
        group.entry =  new Date();
        group.masterid =   req.session.masterid;
        group.del = 'N';
        let query = { _id:req.params.id}
        // console.log(req.params.id);
        //  console.log(group);

        unit_setup_master.update(query , group,function (err) {
            
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating Voucher Type Master', errors: err });
            } else {
                // console.log(group);
                // res.json({'success':true});
                res.redirect("/unit_setup_master/unit_setup_master");
            }
        });
  }
 
});

// router.delete('/:id', function(req, res){
//     if(!req.user._id){
//         res.status(500).send();
//       }
//       let query = {_id:req.params.id}
//       g_mast.findById(req.params.id, function(err,g_mast){
//         g_mast.remove(query, function(err){
//             if(err){
//               console.log(err);
//             }
//             res.send('Success');
//           });
//       });
//   });

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/userright/login');
    }
}

module.exports = router;