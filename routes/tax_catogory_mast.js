const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let taxctg_mast= require('../models/taxctgSchema');
router.get('/tax_catogory_mast', ensureAuthenticated, function(req, res){    
    taxctg_mast.find({del:"N"}, function (err,taxctg_mast){
    if (err) {
    console.log(err);
    }else{
        res.render('tax_catogory_mast.hbs', {
            pageTitle:'Add catogory Master',
            taxctg_mast:taxctg_mast,
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
})

router.post('/tax_ctgmast_add',function(req, res){
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let tax = new taxctg_mast();
            tax.tx_ctgnm = req.body.tx_ctgnm;
            tax.co_code =  req.session.compid;
            tax.div_code =  req.session.divid;
            tax.usrnm =  req.session.user;
            tax.masterid =   req.session.masterid;
            tax.entrydate = new Date();
            tax.del = 'N';
            tax.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving tax','errors':err});
                    return;
                }
                else
                {
                    res.redirect('/tax_catogory_mast/tax_catogory_mast');
                }
            });
    }
});
router.get('/:id', ensureAuthenticated, function(req, res){
    taxctg_mast.findById(req.params.id, function(err, taxctg_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching tax' });
        } else {
            res.json({ 'success': true, 'taxctg_mast': taxctg_mast });
        }
      
    });
});
router.post('/tax_ctgmast_update/:id',function(req, res){
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let tax = {};
        tax.tx_ctgnm = req.body.tx_ctgnm;
        tax.co_code =  req.session.compid;
        tax.div_code =  req.session.divid;
        tax.usrnm =  req.session.user;
        tax.masterid =   req.session.masterid;
        tax.updatedate = new Date();
        tax.del = 'N';
        let query = { _id:req.params.id}
        taxctg_mast.update(query, tax, function(err){
        if(err){
            res.json({ 'success': false, 'message': 'Error in Updating tax', errors: err });
        } else {
            res.redirect('/tax_catogory_mast/tax_catogory_mast');
        }
    });
}
});
router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      taxctg_mast.findById(req.params.id, function(err,taxctg_mast){
        taxctg_mast.remove(query, function(err){
            if(err){
              console.log(err);
            }
            res.send('Success');
          });
      });
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