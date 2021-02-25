const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let s_mast= require('../models/ac_mast');
let city = require('../models/city_schema');
let g_mast= require('../models/group_mast');
let bank = require('../models/bank_schema');
// Add Route
router.get('/supplier_mast', ensureAuthenticated, function(req, res){
           s_mast.find({main_bk:"supplier"}, function (err,s_mast){
            g_mast.find({}, function (err,g_mast){
                bank.find({}, function (err, bank){
            city.find({}, function (err,city){
            if (err) {
                console.log(err);
            } else {
                res.render('supplier_mast.hbs', {
                    pageTitle:'Supplier Master',
                    s_mast:s_mast,
                    city:city,
                    g_mast:g_mast,
                    bank:bank,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator

                });
            }
        }).sort({'city_name':1})
    }).sort({'bank_name':1})
    }).sort({'group_name':1})
       }).populate('ac_city').populate('ac_groupname')
    })

router.post('/s_mast_add',function(req, res){
    if(req.body.type_descr=="") req.body.type_descr=mongoose.Types.ObjectId('578df3efb618f5141202a196');
      if(req.body.sub_descr=="") req.body.sub_descr=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.sku_name=="") req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
       
       let supplier = new s_mast();
        supplier.main_bk = "supplier";
        supplier.ac_name = req.body.ac_name;
        supplier.ac_add1 = req.body.ac_add1;
        supplier.ac_opbal = req.body.ac_opbal;
        supplier.ac_open_type = req.body.ac_open_type;
        supplier.ac_groupname = req.body.ac_groupname;
        supplier.ac_add2 = req.body.ac_add2;
        supplier.ac_city = req.body.ac_city;
        supplier.ac_phmob = req.body.ac_phmob;
        supplier.ac_gstin = req.body.ac_gstin;
        supplier.ac_bank = req.body.ac_bank;
        supplier.co_code =  req.session.compid;
        supplier.div_code =  req.session.divid;
        supplier.usrnm =  req.session.user;
        supplier.masterid =   req.session.masterid;
   
s_mast.findOne({$and: [{ main_bk:"supplier" },{ ac_city: req.body.ac_city },{ ac_name: req.body.ac_name}]}, function(errors, s_mast){
     console.log(s_mast)
    //  console.log(req.body.ac_name)
    let agrfg=true;
          if(s_mast==null) {
            supplier.save()
              agrfg=true;
          }else{
              agrfg=false;
          }
              res.json({'success': agrfg});
                 
                 
              
            

      })
    
  }
 
});

router.get('/:id', ensureAuthenticated, function(req, res){
   
     s_mast.findById(req.params.id, function(err,s_mast){
         if (err) {
            res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            res.json({ 'success': true, 's_mast':s_mast });
           
        }
      })
    });

    router.get('/supplier_mast_update/:id', ensureAuthenticated, function(req, res){
        // var p_type = req.body.p_type;
        s_mast.findById(req.params.id, function(err,s_mast){
            g_mast.find({}, function (err,g_mast){
                bank.find({}, function (err, bank){
                    city.find({}, function (err,city){
            if (err) {
                console.log(err);
            } else {
                res.render('supplier_mastupdate.hbs', {
                    pageTitle:'Supplier Master Update',
                    s_mast:s_mast,
                    city:city,
                    g_mast:g_mast,
                    bank:bank,
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
    })
    })
       })
    })
        router.post('/update/:id', function(req, res) {
               if(req.body.type_descr=="") req.body.type_descr=mongoose.Types.ObjectId('578df3efb618f5141202a196');
              if(req.body.sub_descr=="") req.body.sub_descr=mongoose.Types.ObjectId('578df3efb618f5141202a196');
              if(req.body.sku_name=="") req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
              if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let supplier = {}; 
                supplier.main_bk = "supplier";
            supplier.ac_name = req.body.ac_name;
            supplier.ac_add1 = req.body.ac_add1;
            supplier.ac_opbal = req.body.ac_opbal;
            supplier.ac_open_type = req.body.ac_open_type;
            supplier.ac_groupname = req.body.ac_groupname;
            supplier.ac_add2 = req.body.ac_add2;
            supplier.ac_city = req.body.ac_city;
            supplier.ac_phmob = req.body.ac_phmob;
            supplier.ac_gstin = req.body.ac_gstin;
            supplier.ac_bank = req.body.ac_bank;
            supplier.co_code =  req.session.compid;
            supplier.div_code =  req.session.divid;
            supplier.usrnm =  req.session.user;
            supplier.masterid =   req.session.masterid;
            let query = {_id:req.params.id}
            s_mast.findOne({$and: [ { _id: { $ne:query._id } },{ main_bk:"supplier" },{ ac_city: req.body.ac_city },{ ac_name: req.body.ac_name}]}, function(errors, rio){
            //  console.log(rio)
            
            let trfls=true;
                  if(rio==null) {
                    s_mast.update(query , supplier ,function (err) { });
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
     s_mast.findById(req.params.id, function(err, s_mast){
       s_mast.remove(query, function(err){
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