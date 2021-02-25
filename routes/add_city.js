const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let city_master = require('../models/citySchema');
let district_master = require('../models/districtSchema');
let state_master = require('../models/stateSchema');
let partytype= require('../models/partyTypeSchema');
var query;
router.get('/getdistrictbyid', function (req, res) {
    if( req.query.id ) {
        state_master.findById(req.query.id, 'state_name', function(err, state_master){
            res.json({ 'success': true, 'state_name': state_master });
        });
    }
});

// Add Route
router.get('/add_city', ensureAuthenticated, function(req, res){
    district_master.find({del:"N"}, function (err, c_mast){
        state_master.find({del:"N"}, function (err, state_master) {
            partytype.find({del:"N"}, function (err, partytype) {
            city_master.find({del:"N"}, function (err, city_master){
            if (err) {
                console.log(err);
            } else {
                res.render('add_city.hbs', {
                    pageTitle:'Add City',
                    state_master: state_master,
                    c_mast: c_mast,
                    partytype:partytype,
                    city_master: city_master,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'CityName':1})
        .populate('StateName')
        .populate('DistrictName')
        .populate('PartyType')
    });
});
});
});

router.post('/city_add',function(req, res){
    if(req.body.ctry_name=="") req.body.ctry_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.state_name=="") req.body.state_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.PartyType=="") req.body.PartyType=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        var GaruEntryModel = req.body.GaruEntryModel;
        let city = new city_master();
        city.StateName = req.body.state_name;
        city.CityName = req.body.city_name;
        city.DistrictName = req.body.ctry_name;
        city.CityPinCode = req.body.city_code;
        city.StdCode = req.body.city_std_code;
        city.PartyType = req.body.PartyType;
        // city.co_code =  req.session.compid;
        city.del =  'N';
        city.user =  req.session.user;
        city.entry =   new Date();
        city_master.findOne({ CityName: req.body.city_name,del:'N'}, function(errors, city_master){
         let agrfg=false;
           if(city_master==null) {
            city.save()
               agrfg=true;
           }else{
               agrfg=false;
           }
               res.json({'success': agrfg,'GaruEntryModel':GaruEntryModel});
           })
      }
  
});
router.get('/:id', ensureAuthenticated, function(req, res){
    city_master.findById(req.params.id, function(err, city_master){
        district_master.findById(req.params.id, function (err, c_mast){
            state_master.find({}, function (err, state_master) {
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching brnad details' });
        } else {
            res.json({ 'success': true, 'city_master': city_master });
        }
    }) 
    })
})
})
router.get('/all_city', ensureAuthenticated ,function(req,res){
 city_master.find({}, function (err,city_master){
     if(err)
     {
         console.log(err);
     }
     else
     {
         res.render('all_city.hbs',{
             pageTitle:'All City',
             city_master:city_master
         });
     }
 });   
});
router.post('/edit_city/:id',function(req, res){
    if(req.body.ctry_name=="") req.body.ctry_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.state_name=="") req.body.state_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.PartyType=="") req.body.PartyType=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let city = {};
        city.StateName = req.body.state_name;
        city.CityName = req.body.city_name;
        city.DistrictName = req.body.ctry_name;
        city.CityPinCode = req.body.city_code;
        city.StdCode = req.body.city_std_code;
        city.PartyType = req.body.PartyType;
        // city.co_code =  req.session.compid;
        city.del =  'N';
        city.user =  req.session.user;
        city.entry =   new Date();
         let query = {_id:req.params.id}

        city_master.update(query , city,function (err) { if(err){
                res.json({ 'success': false, 'message': 'Error in Updating District', errors: err });
            } else {
                res.json({'success':true});
            }
        });
    }
 
});

let accountmast = require('../models/accountSchema');
router.delete('/confirm/:id', function(req, res){
    console.log(req.params.id)
    let query = {_id:req.params.id}
        accountmast.find({CityName : req.params.id, del:"N"}, function(err, account){
        // state_master.remove(query, function(err){
            if(err){
              console.log(err);
            }else{
                console.log(account)
                if( account != ""){
                    res.json({success:'true'});
                }else{
                    res.json({success:'false'});
                }
            }
            
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
    city_master.update(query,state, function(err,somast){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
    }
});


router.get('/getdisid', function (req, res) {
    console.log(req.query.id );
    if( req.query.id ) {
        city_master.findById(req.query._id, '_id', function(err, city_master){
            res.json({ 'success': true, 'product': city_master });
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