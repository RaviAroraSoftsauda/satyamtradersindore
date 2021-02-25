const express = require('express');
const router = express.Router();
// let state_master = require('../models/stateSchema');
let toli_master = require('../models/toli_Schema');

let div_com = require('../models/company_schema');
let div_mast = require('../models/division_schema');
let c_mast= require('../models/country_mast');
// Add Route    

router.get('/toli_master', ensureAuthenticated, function(req, res){
    toli_master.find({masterid:req.session.masterid,del:"N"}, function (err, toli_master) {
        if (err) {
            console.log(err);
        } else {
           res.render('toli_master.hbs', {
                pageTitle: 'Add Toli',
                toli_master:toli_master,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator             
            });
        }
    });
});

router.post('/toli_add', function(req, res) {
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let brand = new toli_master();    
        brand.ToliName = req.body.toli_name;
        brand.ToliCode = req.body.toli_code;
        brand.co_code = req.session.compid;
        brand.div_code = req.session.divid;
        brand.masterid = req.session.masterid;
        brand.del = 'N';
        brand.entry = new Date();
        brand.usrnm =  req.session.user,
        toli_master.findOne({ ToliName: req.body.toli_name,masterid:req.session.masterid }, function(errors, toli_master){
            let agrfg=true;
                if(toli_master==null) {
                    brand.save()
                    agrfg=true;
                }else{
                    agrfg=false;
                }
            res.json({'success': agrfg});
        })
    }
});

router.get('/:id', ensureAuthenticated, function(req, res){
    toli_master.findById(req.params.id, function(err, toli_master){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching district details' });
        } else {
            res.json({ 'success': true, 'toli_master': toli_master });
        }
    });
});


router.post('/edit_toli/:id', function(req, res) {
    let errors = req.validationErrors();
    if (errors) {
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let state = {};
        state.ToliName = req.body.toli_name;
        state.ToliCode = req.body.toli_code;
        state.co_code = req.session.compid;
        state.div_code = req.session.divid;
        state.masterid =  req.session.masterid;
        state.update =  new Date();
        state.user =  req.session.user;
        let query = {_id:req.params.id}
        let trfls=false;
        toli_master.update(query , state ,function (err) {
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating State', errors: err });
            } else {
                res.json({'success':true});
            }
        });
    }
})
//"sales_or_group": {$elemMatch: {so_disc: req.body.Product}}
let daily_grocery_entry = require('../models/daily_grocery_entry_Schema');
router.delete('/confirm/:id', function(req, res){
    console.log(req.params.id)
    let query = {_id:req.params.id}
    daily_grocery_entry.find({toliCode:req.params.id,del:'N',masterid:req.session.masterid,div_code:req.session.divid,co_code:req.session.compid}, function(err, daily_grocery){
        if(err){
            console.log(err);
        }
        if(daily_grocery == null || daily_grocery == [] || daily_grocery == ''){
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
    toli_master.update(query,state, function(err,somast){
          if(err){
            console.log(err);
          }
          res.send('Success');
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