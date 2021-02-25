const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let courier_outword = require('../models/courier_outword_schem');
let party = require('../models/party_schema');
let product = require('../models/product_mast_schema');
let brand = require('../models/brand_schema');
let courier = require('../models/courier_schema');
var query;

// Add Route
router.get('/courier_outword', ensureAuthenticated, function(req, res){
    courier_outword.find({co_code:req.session.compid,div_code:req.session.divid}, function (err,courier_outword){
    courier.find({}, function (err, courier){
        party.find({masterid:req.session.masterid}, function (err, party){
            product.find({masterid:req.session.masterid},'product_name', function (err, product){
                brand.find({masterid:req.session.masterid}, function (err, brand){
            if (err) {
                console.log(err);
            } else {
                res.render('courier_outword.hbs', {
                    pageTitle:'Add courier',
                    courier_outword: courier_outword,
                    courier: courier,
                    party: party,
                    product: product,
                    brand: brand,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'brand_name':1})
    }).sort({'product_name':1});
}).sort({'party_name':1}).populate('city_name');;
}).sort({'courier_name':1});;
}).populate('party_sno','party_name').populate('cou_nm').populate('cou_product','product_name').populate('cou_brand');;
});
    router.post('/courier_outword_add',function(req, res){
        if(req.body.party_sno=="") req.body.party_sno=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.cou_nm=="") req.body.cou_nm=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.cou_product=="") req.body.cou_product=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.cou_brand=="") req.body.cou_brand=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let courer = new courier_outword();
            courer.cou_date = req.body.cou_date;
            courer.party_sno = req.body.party_sno;
            courer.cou_nm = req.body.cou_nm;
            courer.cou_lotno = req.body.cou_lotno;
            courer.cou_product = req.body.cou_product;
            courer.cou_brand = req.body.cou_brand;
            courer.cou_rate = req.body.cou_rate;
            courer.cou_contdition = req.body.cou_contdition;
            courer.cou_rcpt = req.body.cou_rcpt;
            courer.cou_content = req.body.cou_content;
            courer.remarks = req.body.remarks;
            courer.cou_crgs = req.body.cou_crgs;
            courer.co_code =  req.session.compid;
            courer.div_code =  req.session.divid;
            courer.usrnm =  req.session.user;
            courer.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/courier_outword/courier_outword');
                }
            });
        }
    });
       router.get('/:id', ensureAuthenticated, function(req, res){
        courier_outword.findById(req.params.id, function(err, courier_outword){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching courier inword details' });
        } else {
            res.json({ 'success': true, 'courier_outword': courier_outword });
        }
        
    });
});
    
        router.post('/edit_courier_outword/:id', function(req, res) {
            if(req.body.party_sno=="") req.body.party_sno=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.cou_nm=="") req.body.cou_nm=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.cou_product=="") req.body.cou_product=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.cou_brand=="") req.body.cou_brand=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let courer = {}; 
                courer.cou_date = req.body.cou_date;
                courer.party_sno = req.body.party_sno;
                courer.cou_nm = req.body.cou_nm;
                courer.cou_lotno = req.body.cou_lotno;
                courer.cou_product = req.body.cou_product;
                courer.cou_brand = req.body.cou_brand;
                courer.cou_rate = req.body.cou_rate;
                courer.cou_contdition = req.body.cou_contdition;
                courer.cou_rcpt = req.body.cou_rcpt;
                courer.cou_content = req.body.cou_content;
                courer.remarks = req.body.remarks;
                courer.cou_crgs = req.body.cou_crgs;
                courer.co_code =  req.session.compid;
                courer.div_code =  req.session.divid;
                courer.usrnm =  req.session.user;
                let query = {_id:req.params.id}
                courier_outword.update(query ,courer ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/courier_outword/courier_outword');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){
            if(!req.user._id){
                res.status(500).send();
              }
              let query = {_id:req.params.id}
              courier_outword.findById(req.params.id, function(err, courier_outword){
                courier_outword.remove(query, function(err){
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