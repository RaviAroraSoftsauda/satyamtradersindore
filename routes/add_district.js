const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let district_master = require('../models/district_schema');
let state_master = require('../models/state_schema');
var query;
// Add Route
router.get('/add_district', ensureAuthenticated, function(req, res){
    district_master.find({}, function (err, district_master) {
        state_master.find({}, function (err, state_masters) {
            if (err) {
                console.log(err);
            } else {
                res.render('add_district.hbs', {
                    pageTitle:'Edit District',
                    state_masters: state_masters,
                    district_master: district_master,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'state_name':1});
        // 
    }).populate('state_id');
});
router.post('/District_add',function(req, res){
    if(req.body.state_id=="") req.body.state_id=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let district = new district_master();
        district.state_id = req.body.state_id;
        district.dis_name = req.body.dis_name;
        district.co_code =  req.session.compid;
        district.div_code =  req.session.divid;
        district.usrnm =  req.session.user;
        district.masterid =   req.session.masterid;
        district.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving city','errors':err});
                return;
            }
            else
            {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/add_district/add_district');
            }
        });
    }
});
router.get('/:id', ensureAuthenticated, function(req, res){
    district_master.findById(req.params.id, function(err, district_master){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching district details' });
        } else {
            res.json({ 'success': true, 'district_master': district_master });
        }
        
    });
});
// router.get('/edit_district', ensureAuthenticated, function(req, res){
//     district_master.find({}, function (err, district_master) {
//         state_master.find({}, function (err, state_master) {
//             // console.log(state_master);
//             if (err) {
//                 console.log(err);
//             } else {
//                 res.render('edit_district.hbs', {
//                     pageTitle:'Edit City',
//                     state_master: state_master,
//                     district_master: district_master
//                 });
//             }
//         }).sort({state_name: 'desc'});
//     });
// });
router.post('/edit_district/:id', function(req, res) {
    if(req.body.state_id=="") req.body.state_id=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let dis = {}; 
        dis.state_id = req.body.state_id;
        dis.dis_name = req.body.dis_name;
        dis.co_code =  req.session.compid;
        dis.div_code =  req.session.divid;
        dis.usrnm =  req.session.user;
        district.masterid =   req.session.masterid;
        let query = {_id:req.params.id}
        district_master.update(query, dis, function(err){
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                return;
            } else {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/add_district/add_district');
            }
        });
    }
});
router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      district_master.findById(req.params.id, function(err, district_master){
        district_master.remove(query, function(err){
            if(err){
              console.log(err);
            }
            res.send('Success');
          });
      });
  });
// router.post('/state_update/:_id', function(req, res) {
//     // console.log(req,res);
//     req.checkBody('state_name', 'State Name is required').notEmpty();
//     let errors = req.validationErrors();
//     if (errors) {
//         console.log(errors);
//         res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
//     } else {
//         let brand = new state_master();    
//         brand.state_name = req.body.state_name;
//         let query = {_id:req.params.id}
//         // console.log({_id:req.params.id});
//         brand.update(query,brand,function (err) {
//             if (err) {
//                 res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
//                 return;
//             } else {
//                 // res.json({ 'success': true, 'message': 'Order added succesfully' });
//                 res.redirect('/state_master/all_state');
//             }
//         });
//     }
// });
// router.get('/getdistrictbyid', function (req, res) {
//     if( req.query.id ) {
//         Product.findById(req.query.id, 'district_masters', function(err, product){
//             res.json({ 'success': true, 'product': product });
//         });
//     }
// });


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