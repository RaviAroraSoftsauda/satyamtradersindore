const express = require('express');
const router = express.Router(); 
let product_mast = require('../models/WIP_mastSchema');
let Stock_Unit = require('../models/skuSchema');
let brand = require('../models/brandSchema');
let model = require('../models/modelSchema');
let producttax = require('../models/product_tax_mast_schema');
let rawMat_mast= require('../models/rawmatSchema');
let division = require('../models/division_schema');
const mongoose = require('mongoose');
var query;
var multer = require('multer');
var fs = require('fs');
var path = require('path');

router.get('/rawmatmastname', function (req, res) {
        rawMat_mast.find({masterid:req.session.masterid, del:'N'}, function(err, rawMat_mast){
            Stock_Unit.find({masterid:req.session.masterid, del:'N'}, function(err, Stock_Unit){
            res.json({ 'success': true, 'rowmatname': rawMat_mast,'StockUnit': Stock_Unit });
        });
    }).sort({'Rm_ProCode':1});
});

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/product_image')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf') {
            req.fileValidationError = "Forbidden extension";
            return callback(null, false, req.fileValidationError);
        }
        callback(null, true)
    },
    limits:{
        fileSize: 420 * 150 * 200
    }
});

var data=[];
router.get('/pricelist', function (req, res) {
    var masterid =  req.query.masterid;
        product_mast.find({masterid:masterid}, function (err, product_mast){
            // console.log(product_mast);
            // console.log(product_mast.length);
          if (product_mast != null)
          {  
            for (var j = 0; j < product_mast.length; j++)
            {
                if (product_mast[j]['prdt_desc'] != null) prdt_desc = product_mast[j]['prdt_desc'];
                else prdt_desc = "";
                if (product_mast[j]['filepath'] != null) filepath = product_mast[j]['filepath'];
                else filepath = "public\\uploads\\product_image\\company.png";
                if (product_mast[j]['si_price'] != null) si_price = product_mast[j]['si_price'];
                else si_price = "";
                if (product_mast[j]['mrp_pcs'] != null) mrp_pcs = product_mast[j]['mrp_pcs'];
                else mrp_pcs = "";
                if (product_mast[j]['export_price'] != null) export_price = product_mast[j]['export_price'];
                else export_price = "";
                data.push({
                    "id":  product_mast[j]._id,
                    "prdt_desc" : prdt_desc,
                    "filepath" : filepath,
                    "mrp_pcs" : mrp_pcs,
                    "si_price" : si_price,
                    "export_price" : export_price,
               })
            }
         //console.log(data);
         }
        })
        // }).populate('prdt_desc')
        console.log(data);
        res.json({ 'success': true, 'product_mast_list':data});
});

// Add Route
router.get('/WIP_master_add', ensureAuthenticated, function(req, res){    
    brand.find({masterid:req.session.masterid,del:'N'}, function (err, brand){
        product_mast.find({masterid:req.session.masterid, del:'N'}, function (err, product_mast){
            Stock_Unit.find({masterid:req.session.masterid,del:'N'}, function (err,Stock_Unit){
                rawMat_mast.find({masterid:req.session.masterid,del:'N'}, function (err,rawMat_mast){
                    model.find({masterid:req.session.masterid,del:'N'}, function (err, model){
                    division.find({}, function (err,division){
                if (err) {
                console.log(err);
            } else {
                if(product_mast[0] == undefined)var last = 1;
                else var last = product_mast[0].Fg_PrCode+1;

                res.render('WIP_master_add.hbs', {
                    pageTitle:'Add WIP',
                    product_mast: last,
                    brand: brand,
                    model:model,
                    division: division,
                    Stock_Unit:Stock_Unit,
                    rawMat_mast:rawMat_mast,
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
        }).sort({'Rm_ProCode':1}) 
        })
        }).sort({'Fg_PrCode':-1}) 
    })
});
router.get('/WIP_master', ensureAuthenticated, function(req, res){
    brand.find({masterid:req.session.masterid,del:'N'}, function (err, brand){
        product_mast.find({masterid:req.session.masterid, del:'N'}, function (err, product_mast){
            Stock_Unit.find({}, function (err,Stock_Unit){
                rawMat_mast.find({}, function (err,rawMat_mast){
                    division.find({}, function (err,division){
                        model.find({masterid:req.session.masterid,del:'N'}, function (err, model){
                if(err){
                    console.log(err);
                }else{
                res.render('WIP_master.hbs', {
                    pageTitle:'WIP Master List',
                    product_mast: product_mast,
                    brand: brand,
                    model:model,
                    rawMat_mast:rawMat_mast,
                    division:division,
                    Stock_Unit:Stock_Unit,
                    producttax: producttax,
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
        })
        })
        }).sort({'Fg_PrCode':1}).populate('Fg_Unit').populate('Fg_Brand').populate('Fg_Model');
        })
    });
    router.post('/WIP_master_add', (req, res, next) => {
        if(req.body.sku_name==""||req.body.sku_name == undefined) req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.model==""||req.body.model == undefined)req.body.model=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.brand==""||req.body.brand == undefined)req.body.brand=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        if (errors) {
        }else{
            if (req.fileValidationError) {
            }else {
                let prdt = new product_mast();
                prdt.Fg_PrCode = req.body.p_code;
                prdt.Fg_Des = req.body.prdt_desc;
                prdt.Fg_Model= req.body.model;
                prdt.Fg_Brand= req.body.brand;
                prdt.Fg_Unit =req.body.sku_name;
                prdt.product_mast_group = req.body.product_mast_group;
                prdt.user =  req.session.user;
                prdt.masterid=req.session.masterid;
                prdt.del = 'N';
                prdt.entrydate = new Date();
                
            product_mast.findOne({$and: [{ Fg_PrCode: req.body.p_code },{Fg_Des: req.body.prdt_desc}]}, function(errors, product_mast){
            let agrfg=true;
               if(product_mast==null) {
                prdt.save()
                   agrfg=true;
               }else{
                   agrfg=false;
               }
                   res.json({'success': agrfg});
            })
         
       }
    }
      
   });

    
    // router.get('/:id', ensureAuthenticated, function(req, res){
    //     product_mast.findById(req.params.id, function(err, product_mast){
    //         if (err) {
    //             res.json({ 'success': false, 'message': 'error in fetching product_mast details' });
    //         } else {
    //             res.json({ 'success': true, 'product_mast': product_mast });addEventListener
                
    //         }
            
    //     });
    // });
       router.get('/edit_WIP_master/:id', ensureAuthenticated, function(req, res){
        brand.find({masterid:req.session.masterid,del:'N'}, function (err, brand){
            product_mast.findById(req.params.id, function (err, product_mast){
                producttax.find({masterid:req.session.masterid,del:'N'}, function (err, producttax){
                    Stock_Unit.find({masterid:req.session.masterid,del:'N'}, function (err,Stock_Unit){
                        rawMat_mast.find({masterid:req.session.masterid,del:'N'}, function (err, rawMat_mast){
                            division.find({}, function (err,division){
                                model.find({masterid:req.session.masterid,del:'N'}, function (err, model){
                if (err) {
                    console.log(err);
                } else {
                    res.render('WIP_master_update.hbs', {
                        pageTitle:'Update WIP Master',
                        brand: brand,
                        model:model,
                        division: division,
                        product_mast: product_mast,
                        Stock_Unit:Stock_Unit,
                        rawMat_mast: rawMat_mast,
                        producttax: producttax,
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
            })
            })
            })
            }).sort({'Fg_PrCode':1});
         });
      });
   


    router.post('/edit_WIP_master/:id', function(req, res){
        if(req.body.sku_name==""||req.body.sku_name == undefined) req.body.sku_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.model==""||req.body.model == undefined)req.body.model=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.brand==""||req.body.brand == undefined)req.body.brand=mongoose.Types.ObjectId('578df3efb618f5141202a196');
      
        let errors = req.validationErrors();
        if (errors) {
            res.json({ 'success': false, 'message': 'Validation error', errors: errors });
        } else {
            if (req.fileValidationError) {
                res.json({ 'success': false, 'message': 'File Validation error', errors: req.fileValidationError });    
            } else {
                let prdt = {};
                prdt.Fg_PrCode = req.body.p_code;
                prdt.Fg_Des = req.body.prdt_desc;
                prdt.Fg_Model= req.body.model;
                prdt.Fg_Brand= req.body.brand;
                prdt.Fg_Unit =req.body.sku_name;
                prdt.product_mast_group = req.body.product_mast_group;
                prdt.user =  req.session.user;
                prdt.masterid=req.session.masterid;
                prdt.del = 'N';
                prdt.update = new Date();
                let query = {_id:req.params.id}
                // product_mast.findOne({$and: [ { _id: { $ne:query._id } },{ Fg_PrCode: req.body.p_code },{ prdt_desc: req.body.prdt_desc}]}, function(errors, rio){
                // console.log(prdt)
                let trfls=true;
                product_mast.update(query , prdt ,function (err) {if(err){res.json({'success':false});}else{res.json({'success':trfls});}});
                //   }
                //   else
                //   {
                //       trfls=false 
                //   }
                
                //})
      }
    }
     
  });

router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      product_mast.findById(req.params.id, function(err, product_mast){
        product_mast.remove(query, function(err){
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