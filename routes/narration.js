const express = require('express');
const router = express.Router(); 
let narration = require('../models/narration_schema');
var query;

// Add Route
router.get('/narration', ensureAuthenticated, function(req, res){
    narration.find({masterid :req.session.masterid}, function (err, narration){
            if (err) {
                console.log(err);
            } else {
                res.render('narration.hbs', {
                    pageTitle:'Add narration',
                    narration: narration,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'narration_name':1})
    });
    router.post('/narration_add',function(req, res){
        // console.log(req.body);
        req.checkBody('narration_name','narration Name is required').notEmpty();
        req.checkBody('type','type Name is required').notEmpty();
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let narrations = new narration();
            narrations.narration_name = req.body.narration_name;
            narrations.type = req.body.type;
            narrations.co_code =  req.session.compid;
            narrations.div_code =  req.session.divid;
            narrations.usrnm =  req.session.user;
            narrations.masterid = req.session.masterid;
            narrations.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving term','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/narration/narration');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        narration.findById(req.params.id, function(err, narration){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching narration details' });
            } else {
                res.json({ 'success': true, 'narration': narration });
            }
            
        });
    });
        router.post('/edit_narration/:id', function(req, res) {
            // console.log(req,body);
           req.checkBody('narration_name','narration Name is required').notEmpty();
           req.checkBody('type','type Name is required').notEmpty();
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let narrations = {}; 
                narrations.narration_name = req.body.narration_name;
                narrations.type = req.body.type;
                narrations.co_code =  req.session.compid;
                narrations.div_code =  req.session.divid;
                narrations.usrnm =  req.session.user;
                narrations.masterid = req.session.masterid;
                let query = {_id:req.params.id}
                narration.update(query ,narrations ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/narration/narration');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              narration.findById(req.params.id, function(err, narration){
                narration.remove(query, function(err){
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