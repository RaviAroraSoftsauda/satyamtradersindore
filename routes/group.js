const express = require('express');
const router = express.Router(); 
let group = require('../models/group_schema');
var query;

// Add Route
router.get('/group', ensureAuthenticated, function(req, res){
    group.find({masterid:req.session.masterid}, function (err, group){
            if (err) {
                console.log(err);
            } else {
                res.render('group.hbs', {
                    pageTitle:'Add Group',
                    group: group,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'group_name':1})
    });
    router.post('/group_add',function(req, res){
        // console.log(req.body);
        req.checkBody('group_name','Group Name is required').notEmpty();
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let grup = new group();
            grup.group_name = req.body.group_name;
            grup.co_code =  req.session.compid;
            grup.div_code =  req.session.divid;
            grup.usrnm =  req.session.user;
            grup.masterid = req.session.masterid;
            grup.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/group/group');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        group.findById(req.params.id, function(err, group){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching group details' });
            } else {
                res.json({ 'success': true, 'group': group });
            }
            
        });
    });
        router.post('/edit_group/:id', function(req, res) {
            // console.log(req,body);
           req.checkBody('group_name','Group Name is required').notEmpty();
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let grup = {}; 
                grup.group_name = req.body.group_name;
                grup.co_code =  req.session.compid;
                grup.div_code =  req.session.divid;
                grup.usrnm =  req.session.user;
                grup.masterid = req.session.masterid;
                let query = {_id:req.params.id}
                group.update(query ,grup ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/group/group');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              group.findById(req.params.id, function(err, group){
                group.remove(query, function(err){
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