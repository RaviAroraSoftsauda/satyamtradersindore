const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let c_mast= require('../models/districtSchema');
let state_mast= require('../models/stateSchema');


// Add Route
router.get('/district_mast', ensureAuthenticated, function(req, res){
   // district_master.find({}, function (err, district_master){
      
       c_mast.find({del:"N"}, function (err, c_mast){
        state_mast.find({del:"N"}, function (err, state_mast) {
            if (err) {
                console.log(err);
            } else {
                res.render('district_mast.hbs', {
                    pageTitle:'District Master',
                    c_mast:c_mast,
                    state_mast:state_mast,
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
        }).populate('StateName');
    });

router.post('/district_mast_add',function(req, res){
    if(req.body.StateName=="") req.body.StateName=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let count = new c_mast();
       count.DistrictName = req.body.DistrictName;
       count.StateName= req.body.StateName;
       count.Population = req.body.Population;
       count.Area= req.body.Area;
    //    count.co_code =  req.session.compid;
    //    count.div_code =  req.session.divid;
       count.user =  req.session.user;
       count.entry =  new Date();
       count.del =   "N";
       
c_mast.findOne({$and: [{ DistrictName: req.body.DistrictName }]}, function(errors, c_mast){
    //  console.log(c_mast)
     //  console.log(req.body.ac_name)
     let agrfg=true;
           if(c_mast==null) {
            count.save()
               agrfg=true;
           }else{
               agrfg=false;
           }
               res.json({'success': agrfg});
           })
      }
  
});
router.get('/:id', ensureAuthenticated, function(req, res){
   c_mast.findById(req.params.id, function(err, c_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching brnad details' });
        } else {
            res.json({ 'success': true, 'c_mast':c_mast});
        }
        
    });
});
router.post('/edit_district/:id',function(req, res){
    if(req.body.StateName=="") req.body.StateName=mongoose.Types.ObjectId('578df3efb618f5141202a196');
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let count = {};
        count.DistrictName = req.body.DistrictName;
       count.StateName= req.body.StateName;
       count.Population = req.body.Population;
       count.Area= req.body.Area;
    //    count.co_code =  req.session.compid;
    //    count.div_code =  req.session.divid;
       count.user =  req.session.user;
       count.update =  new Date();
        let query = {_id:req.params.id}
       c_mast.update(query , count,function (err) {
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating District', errors: err });
            } else {
                res.json({'success':true});
            }
        });
   }       
             
             
})
    


let citymast = require('../models/citySchema');

router.delete('/confirm/:id', function(req, res){
    console.log(req.params.id)
    let query = {_id:req.params.id}
        citymast.find({DistrictName : req.params.id, del:"N"}, function(err, city){
            if(err){
              console.log(err);
            }
            // console.log(dist+"dist   "+city+"city   "+account+"acc")
            // console.log(state_master)
            if(city == null || city == "" || city == undefined){
                res.json({success:'false'});
            }else{
                res.json({success:'true'});
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
    c_mast.update(query,state, function(err,somast){
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