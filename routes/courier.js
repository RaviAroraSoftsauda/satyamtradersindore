const express = require('express');
const router = express.Router(); 
let courier = require('../models/courier_schema');
var query;

// Add Route
router.get('/courier', ensureAuthenticated, function(req, res){
    courier.find({}, function (err, courier){
            if (err) {
                console.log(err);
            } else {
                res.render('courier.hbs', {
                    pageTitle:'Add courier',
                    courier: courier,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'courier_name':1})
    });
    router.post('/courier_add',function(req, res){
        // console.log(req.body);
        req.checkBody('courier_name','courier Name is required').notEmpty();
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let courer = new courier();
            courer.courier_name = req.body.courier_name;
            courer.co_code =  req.session.compid;
            courer.div_code =  req.session.divid;
            courer.usrnm =  req.session.user;
            courer.masterid = req.session.masterid
            courer.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/courier/courier');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        courier.findById(req.params.id, function(err, courier){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching courier details' });
            } else {
                res.json({ 'success': true, 'courier': courier });
            }
            
        });
    });
        router.post('/edit_courier/:id', function(req, res) {
            // console.log(req,body);
           req.checkBody('courier_name','courier Name is required').notEmpty();
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let courer = {}; 
                courer.courier_name = req.body.courier_name;
                courer.co_code =  req.session.compid;
                courer.div_code =  req.session.divid;
                courer.usrnm =  req.session.user;
                courer.masterid = req.session.masterid
                let query = {_id:req.params.id}
                courier.update(query ,courer ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/courier/courier');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              courier.findById(req.params.id, function(err, courier){
                courier.remove(query, function(err){
                    if(err){
                      console.log(err);
                    }
                    res.send('Success');
                  });
              });
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