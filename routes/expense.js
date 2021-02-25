const express = require('express');
const router = express.Router(); 
let expense = require('../models/expense_schema');
var query;

// Add Route
router.get('/expense', ensureAuthenticated, function(req, res){
    expense.find({masterid: req.session.masterid}, function (err, expense){
            if (err) {
                console.log(err);
            } else {
                res.render('expense.hbs', {
                    pageTitle:'Add expense',
                    expense: expense,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'expense_name':1});
    });
    router.post('/expense_add',function(req, res){
        // console.log(req.body);
        req.checkBody('expense_name','Item Name is required').notEmpty();
        req.checkBody('expense_type','Item Name is required').notEmpty();
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let expns = new expense();
            expns.expense_name = req.body.expense_name;
            expns.expense_type = req.body.expense_type;
            expns.co_code =  req.session.compid;
            expns.div_code =  req.session.divid;
            expns.usrnm =  req.session.user;
            expns.masterid= req.session.masterid;
            expns.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/expense/expense');
                }
            });
        }
    });
       router.get('/:id', ensureAuthenticated, function(req, res){
        expense.findById(req.params.id, function(err, expense){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching brnad details' });
            } else {
                res.json({ 'success': true, 'expense': expense });
            }
            
        });
    });
        router.post('/edit_expense/:id', function(req, res) {
            // console.log(req,body);
           req.checkBody('expense_name','Item Name is required').notEmpty();
           req.checkBody('expense_type','Item Name is required').notEmpty();
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let expns = {}; 
                expns.expense_name = req.body.expense_name;
                expns.expense_type = req.body.expense_type;
                expns.co_code =  req.session.compid;
                expns.div_code =  req.session.divid;
                expns.usrnm =  req.session.user;
                expns.masterid= req.session.masterid;
                let query = {_id:req.params.id}
                expense.update(query ,expns ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/expense/expense');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              expense.findById(req.params.id, function(err, expense){
                expense.remove(query, function(err){
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