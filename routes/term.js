const express = require('express');
const router = express.Router(); 
let term = require('../models/term_schema');
var query;

// Add Route
router.get('/term', ensureAuthenticated, function(req, res){
    term.find({}, function (err, term){
            if (err) {
                console.log(err);
            } else {
                res.render('term.hbs', {
                    pageTitle:'Add term',
                    term: term,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'term_name':1})
    });
    router.post('/term_add',function(req, res){
        // console.log(req.body);
        req.checkBody('term_name','term Name is required').notEmpty();
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let terms = new term();
            terms.term_name = req.body.term_name;
            terms.co_code =  req.session.compid;
            terms.div_code =  req.session.divid;
            terms.usrnm =  req.session.user;
            terms.masterid=req.session.masterid;
            terms.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving term','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/term/term');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        term.findById(req.params.id, function(err, term){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching term details' });
            } else {
                res.json({ 'success': true, 'term': term });
            }
            
        });
    });
        router.post('/edit_term/:id', function(req, res) {
            // console.log(req,body);
           req.checkBody('term_name','term Name is required').notEmpty();
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let terms = {}; 
                terms.term_name = req.body.term_name;
                terms.co_code =  req.session.compid;
                terms.div_code =  req.session.divid;
                terms.usrnm =  req.session.user;
                terms.masterid=req.session.masterid;
                let query = {_id:req.params.id}
                term.update(query ,terms ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/term/term');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              term.findById(req.params.id, function(err, term){
                term.remove(query, function(err){
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