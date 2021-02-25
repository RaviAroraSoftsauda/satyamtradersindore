const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let Stock_Unit = require('../models/skuSchema');
var query;

// Add Route
router.get('/stock_unit_mast', ensureAuthenticated, function(req, res){
    Stock_Unit.find({}, function (err, Stock_Unit){
          if (err) {
                console.log(err);
            } else {
                res.render('stock_unit_mast.hbs', {
                    pageTitle:'Stock Keeping Unit Master',
                    Stock_Unit: Stock_Unit,
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
        .limit(1000);
    });

router.post('/StockUnit_add',function(req, res){
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let unit = new  Stock_Unit();
        unit.SKUName = req.body.sku_name;
        unit.SKUSymbol = req.body.sku_symbol;
        unit.NoOfDecimal = req.body.no_of_dec;
        // unit.co_code =  req.session.compid;
        // unit.div_code =  req.session.divid;
        unit.user =  req.session.user;
        unit.masterid =   req.session.masterid;
        unit.del =   "N";
        unit.entry = new Date();
        Stock_Unit.findOne({ SKUName: req.body.sku_name }, function(errors, Stock_Unit){
            //  console.log(Stock_Unit)
             //  console.log(req.body.ac_name)
         let agrfg=true;
             if(Stock_Unit==null) {
                unit.save()
                 agrfg=true;
              }else{
                 agrfg=false;
             }
                  res.json({'success': agrfg});
              })
         }
    });
router.get('/:id', ensureAuthenticated, function(req, res){
    Stock_Unit.findById(req.params.id, function(err, Stock_Unit){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching brnad details' });
        } else {
            res.json({ 'success': true, 'Stock_Unit': Stock_Unit });
        }
        
    });
});


router.post('/su_update/:id',function(req, res){
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let unit = {};
        unit.SKUName = req.body.sku_name;
        unit.SKUSymbol = req.body.sku_symbol;
        unit.NoOfDecimal = req.body.no_of_dec;
        // unit.co_code =  req.session.compid;
        // unit.div_code =  req.session.divid;
        unit.user =  req.session.user;
        unit.masterid =   req.session.masterid;
        unit.del =   "N";
        unit.entry = new Date();

         let query = {_id:req.params.id}
       
                Stock_Unit.update(query , unit,function (err) {
                    if(err){
                        res.json({ 'success': false, 'message': 'Error in Updating State', errors: err });
                    } else {
                        res.json({'success':true});
                    }
                });
    }
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      Stock_Unit.findById(req.params.id, function(err, city_master){
        Stock_Unit.remove(query, function(err){
            if(err){
              console.log(err);
            }
            res.send('Success');
          });
      });
  });
router.get('/getdisid', function (req, res) {
    console.log(req.query.id );
    if( req.query.id ) {
        city_master.findById(req.query._id, '_id', function(err, city_master){
            res.json({ 'success': true, 'product': city_master });
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