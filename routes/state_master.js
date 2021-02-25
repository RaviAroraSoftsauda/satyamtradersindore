const express = require('express');
const router = express.Router();
let state_master = require('../models/stateSchema');

let div_com = require('../models/company_schema');
let div_mast = require('../models/division_schema');
let c_mast= require('../models/country_mast');
// Add Route    

router.get('/state_master', ensureAuthenticated, function(req, res){
    state_master.find({del:"N"}, function (err, state_master) {
       c_mast.find({}, function (err,c_mast) {
        if (err) {
            console.log(err);
        } else {
           res.render('state_master.hbs', {
                pageTitle: 'Add State',
                state_master:state_master,
                 c_mast:c_mast,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator             
            });
        }
    }).sort({'state_name':1})
}).populate('c_name')
});


router.post('/state_add', function(req, res) {
    // console.log(req.body);
   
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        var GaruEntryModel = req.body.GaruEntryModel;
        let brand = new state_master();    
        brand.StateName = req.body.state_name;
        brand.StateCode = req.body.state_code;
        brand.StateCapital = req.body.state_capital;
        brand.masterid = req.session.masterid;
        brand.del = 'N';
        brand.entry = new Date();
        brand.usrnm =  req.session.user,
     
state_master.findOne({ StateName: req.body.state_name,del:'N'}, function(errors, state_master){
    //  console.log(customer)
     //  console.log(req.body.ac_name)
     let agrfg=true;
           if(state_master==null) {
              brand.save()
               agrfg=true;
           }else{
               agrfg=false;
           }
               res.json({'success': agrfg,'GaruEntryModel':GaruEntryModel});
           })
      }
  
});


router.get('/:id', ensureAuthenticated, function(req, res){
    state_master.findById(req.params.id, function(err, state_master){
        
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching district details' });
        } else {
            res.json({ 'success': true, 'state_master': state_master });
        }
    
    });
});


router.post('/edit_state/:id', function(req, res) {
  
     let errors = req.validationErrors();
    if (errors) {
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let state = {};
        state.StateName = req.body.state_name;
        state.StateCode = req.body.state_code;
        state.StateCapital = req.body.state_capital;
        // state.co_code =  req.session.compid;
        // state.div_code =  req.session.divid;
        state.masterid =  req.session.masterid;
        state.update =  new Date();
        state.user =  req.session.user;
        let query = {_id:req.params.id}
              
    //  state_master.findOne({$and: [ { _id: { $ne:query._id } },{ state_name: req.body.state_name },{ c_name: req.body.c_name}]}, function(errors, rio){
         let trfls=false;
    //          if(rio==null) {
                    state_master.update(query , state ,function (err) {
                    if(err){
                        res.json({ 'success': false, 'message': 'Error in Updating State', errors: err });
                    } else {
                        res.json({'success':true});
                    }
                    });
                    //     trfls=true                                                     
                    //        }
                    //           else
                    //                 {
                    //                     trfls=false 
                    //                   }
 
                    // return  res.json({'success':trfls});
                    // res.json({'success':true});
                }
    })
// }

let district = require('../models/districtSchema');
let citymast = require('../models/citySchema');
let accountmast = require('../models/accountSchema');
router.delete('/confirm/:id', function(req, res){
    console.log(req.params.id)
    let query = {_id:req.params.id}
    district.find({StateName : req.params.id, del:"N"}, function(err, dist){
        citymast.find({StateName : req.params.id, del:"N"}, function(err, city){
            accountmast.find({StateName : req.params.id, del:"N"}, function(err, account){
        // state_master.remove(query, function(err){
            if(err){
              console.log(err);
            }
            // console.log(dist+"dist   "+city+"city   "+account+"acc")
            // console.log(state_master)
            if(dist == null || dist == "" || dist == undefined || city == null || city == "" || city == undefined || account == null || account == "" || account == undefined){
                res.json({success:'false'});
            }else{
                res.json({success:'true'});
            }
           });
          });
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
    state_master.update(query,state, function(err,somast){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
    }
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/userright/login');
    }
}

module.exports = router;