const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let transportmast= require('../models/ac_mast');
let g_mast= require('../models/group_mast');
let city = require('../models/city_schema');
let state_master = require('../models/state_schema');
let ptyp_mast= require('../models/party_type_schema');

// Add Route
router.get('/transport_mast', ensureAuthenticated, function(req, res){
    transportmast.find({main_bk:"transport"}, function (err,transportmast){
      city.find({}, function (err, city){
        state_master.find({}, function (err, state_master) {
          g_mast.find({}, function (err,g_mast){
                ptyp_mast.find({}, function (err,ptyp_mast){  
            if (err) {
                console.log(err);
            } else {
                res.render('transport_mast.hbs', {
                    pageTitle:'Transport Master',
                    transportmast:transportmast,
                    g_mast:g_mast,
                    city:city,
                    ptyp_mast:ptyp_mast,
                    state_master:state_master,
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
}).populate('ac_groupname').populate('ac_city').populate('ac_state').populate('ac_ptype')
       })

router.post('/add',function(req, res){
    if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_city=="") req.body.ac_city=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_state=="") req.body.ac_state=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_ptype=="") req.body.ac_ptype=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {

       let transport = new transportmast();
        transport.main_bk = "transport";
        transport.ac_name = req.body.ac_name;
        transport.ac_opbal = req.body.ac_opbal;
        transport.ac_open_type = req.body.ac_open_type;
        transport.ac_groupname = req.body.ac_groupname;
        transport.ac_pan = req.body.ac_pan;
        transport.ac_rmks = req.body.ac_rmks;
        transport.ac_add1 = req.body.ac_add1;
        transport.ac_city = req.body.ac_city;
        transport.ac_state = req.body.ac_state;
        transport.ac_cst = req.body.ac_cst;
        transport.ac_gstin = req.body.ac_gstin;
        transport.ac_website = req.body.ac_website;
        transport.ac_email = req.body.ac_email;
        transport.ac_phoff = req.body.ac_phoff;
        transport.ac_phres = req.body.ac_phres;
        transport.ac_phmob = req.body.ac_phmob;
        transport.ac_phfax = req.body.ac_phfax;
        transport.ac_cont = req.body.ac_cont;
        transport.co_code =  req.session.compid;
        transport.div_code =  req.session.divid;
        transport.usrnm =  req.session.user;
        transport.masterid =   req.session.masterid;
        transportmast.findOne({$and: [{ main_bk:"transport" },{ ac_city: req.body.ac_city },{ ac_name: req.body.ac_name}]}, function(errors, transportmast){
         let agrfg=true;
          if(transportmast==null) {
               transport.save()
                   agrfg=true;
              }else{
                 agrfg=false;
                }
              res.json({'success': agrfg});
            })
      }
 });

router.get('/:id', ensureAuthenticated, function(req, res){
    transportmast.findById(req.params.id, function(err, transportmast){
        
       
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            res.json({ 'success': true, 'transportmast': transportmast });
        }
      
    });
});
router.post('/edit_transport/:id',function(req, res){
    if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_city=="") req.body.ac_city=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_state=="") req.body.ac_state=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_ptype=="") req.body.ac_ptype=mongoose.Types.ObjectId('578df3efb618f5141202a196');
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let  transport = {};
         transport.main_bk = "transport";
        transport.ac_name = req.body.ac_name;
        transport.ac_opbal = req.body.ac_opbal;
        transport.ac_open_type = req.body.ac_open_type;
        transport.ac_groupname = req.body.ac_groupname;
        transport.ac_pan = req.body.ac_pan;
        transport.ac_rmks = req.body.ac_rmks;
        transport.ac_add1 = req.body.ac_add1;
        transport.ac_city = req.body.ac_city;
        transport.ac_state = req.body.ac_state;
        transport.ac_cst = req.body.ac_cst;
        transport.ac_gstin = req.body.ac_gstin;
        transport.ac_website = req.body.ac_website;
        transport.ac_email = req.body.ac_email;
        transport.ac_phoff = req.body.ac_phoff;
        transport.ac_phres = req.body.ac_phres;
        transport.ac_phmob = req.body.ac_phmob;
        transport.ac_phfax = req.body.ac_phfax;
        transport.ac_cont = req.body.ac_cont;
         transport.co_code =  req.session.compid;
         transport.div_code =  req.session.divid;
         transport.usrnm =  req.session.user;
         transport.masterid =   req.session.masterid;
        let query = { _id:req.params.id}
         console.log('xxxx'+ query);
       
transportmast.findOne({$and: [ { _id: { $ne:query._id } },{ main_bk:"transport" },{ ac_city: req.body.ac_city },{ ac_name: req.body.ac_name}]}, function(errors, rio){
    //  console.log(rio)
    //  console.log(req.body.ac_name)
    let trfls=true;
          if(rio==null) {
            transportmast.update(query , transport ,function (err) { });
               trfls=true                                                     
              }
              else
              {
                  trfls=false 
              }
              return  res.json({'success':trfls});
                      // res.json({'success':true});
                  })
      }
});


router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      transportmast.findById(req.params.id, function(err,transportmast){
        transportmast.remove(query, function(err){
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