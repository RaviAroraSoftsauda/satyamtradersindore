const express = require('express');
const router = express.Router(); 
let transport = require('../models/transport_schema');
var query;

// Add Route
router.get('/transport', ensureAuthenticated, function(req, res){
    transport.find({masterid:req.session.masterid}, function (err, transport){
            if (err) {
                console.log(err);
            } else {
                res.render('transport.hbs', {
                    pageTitle:'Add transport',
                    transport: transport,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'transport_name':1})
    });
    router.post('/transport_add',function(req, res){
        // console.log(req.body);
        req.checkBody('transport_name','transport Name is required').notEmpty();
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let transprt = new transport();
            transprt.transport_name = req.body.transport_name;
            transprt.co_code =  req.session.compid;
            transprt.div_code =  req.session.divid;
            transprt.usrnm =  req.session.user;
            transprt.masterid =req.session.masterid;
            transprt.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/transport/transport');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        transport.findById(req.params.id, function(err, transport){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching transport details' });
            } else {
                res.json({ 'success': true, 'transport': transport });
            }
            
        });
    });
        router.post('/edit_transport/:id', function(req, res) {
            // console.log(req,body);
           req.checkBody('transport_name','transprt Name is required').notEmpty();
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let transprt = {};
                transprt.transport_name = req.body.transport_name;
                transprt.co_code =  req.session.compid;
                transprt.div_code =  req.session.divid;
                transprt.usrnm =  req.session.user;
                transprt.masterid =req.session.masterid;
                let query = {_id:req.params.id}
                transport.update(query ,transprt ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/transport/transport');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              transport.findById(req.params.id, function(err, transport){
                transport.remove(query, function(err){
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