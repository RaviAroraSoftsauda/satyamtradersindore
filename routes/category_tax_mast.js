const express = require('express');
const router = express.Router(); 
let categorytax = require('../models/category_tax_mast_schema');
var query;
// Add Route
router.get('/category_tax_mast', ensureAuthenticated, function(req, res){
    categorytax.find({masterid:req.session.masterid}, function (err, categorytax){
            if (err) {
                console.log(err);
            } else {
                res.render('category_tax_mast.hbs', {
                    pageTitle:'Add category',
                    categorytax: categorytax,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'category_name':1})
    });
    router.post('/categorytax_add',function(req, res){
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let ctg = new categorytax();
            ctg.category_tax_name = req.body.category_tax_name;
            ctg.co_code =  req.session.compid;
            ctg.div_code =  req.session.divid;
            ctg.usrnm =  req.session.user;
            ctg.masterid = req.session.masterid;
            ctg.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    res.redirect('/category_tax_mast/category_tax_mast');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        categorytax.findById(req.params.id, function(err, categorytax){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching category details' });
            } else {
                res.json({ 'success': true, 'categorytax': categorytax });
            }
            
        });
    });
        router.post('/edit_category_tax/:id', function(req, res) {
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let ctg = {}; 
                ctg.category_tax_name = req.body.category_tax_name;
                ctg.co_code =  req.session.compid;
                ctg.div_code =  req.session.divid;
                ctg.usrnm =  req.session.user;
                ctg.masterid = req.session.masterid;
                let query = {_id:req.params.id}
                categorytax.update(query ,ctg ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        res.redirect('/category_tax_mast/category_tax_mast');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              categorytax.findById(req.params.id, function(err, categorytax){
                categorytax.remove(query, function(err){
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