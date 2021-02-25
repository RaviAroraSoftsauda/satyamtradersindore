const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let rawMat_mast= require('../models/rawmatSchema');
let categiry= require('../models/CategorySchema');
let Stock_Unit = require('../models/skuSchema');
let quality= require('../models/qualitySchema');
let subquality= require('../models/subqualitySchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');




router.get('/raw_material_mast', ensureAuthenticated, function(req, res){
    
        rawMat_mast.find({del :"N", masterid: req.session.masterid}, function (err,rawMat_mast){
            
            categiry.find({del :"N", masterid: req.session.masterid}, function (err,categiry){
                Stock_Unit.find({del :"N", masterid: req.session.masterid}, function (err,Stock_Unit){
                    quality.find({del :"N", masterid: req.session.masterid}, function (err,quality){
                        subquality.find({del :"N", masterid: req.session.masterid}, function (err,subquality){
                            Account_master.find({masterid: req.session.masterid, del: 'N'},function (err, account_masters){
                                Gs_master.findOne({group: 'SUPPLIER'},function (err, gs_master){
            if (err) {
                console.log(err);
            } else {
                accarry = [];
                if(gs_master != null && gs_master['garry'] != null && account_masters != null){
                    for (let g = 0; g < gs_master['garry'].length; g++)
                    {     
                      for (let j = 0; j < account_masters.length; j++)
                      {
                            if (gs_master['garry'][g]._id.equals(account_masters[j]['GroupName']._id))
                            { 
                              var arr={_id: account_masters[j]._id,ACName: account_masters[j]['ACName'], CityName: account_masters[j]['CityName']};
                              this.accarry.push(arr);
                              // console.log('r',account_masters[j]['ACName']);  
                            }
                      }
                   }
                //    console.log(this.accarry)
                }
                // console.log(this.accarry)
                var last = rawMat_mast[rawMat_mast.length-1].Rm_ProCode+1;
                var manufac = this.accarry
                res.render('raw_material_mast.hbs', {
                    pageTitle:'Raw Material Master',
                    last: last,
                    rawMat_mast:rawMat_mast,
                    categiry:categiry,
                    Stock_Unit:Stock_Unit,
                    quality:quality,
                    manufac:manufac,
                    subquality:subquality,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator

                });
                // console.log("com- "+req.session.compnm+"div-"+req.session.divmast)
                // console.log("user- "+req.session.user+"administrator-"+req.session.administrator)
                // console.log("compsdate- "+req.session.compsdate+"compedate-"+req.session.compedate)
                // console.log("security- "+req.session.security)
            }
        }).populate('garry');
        }).populate('CityName');
        });
        });
    });
    });
    
    }).sort({'Rm_ProCode':1}).populate('Rm_Quality').populate('Rm_Sub_Qua').populate('Rm_Category').populate('Rm_Unit').populate('Rm_ManuFac')
    });

router.post('/raw_location_mast_add',function(req, res){
    // console.log(req.body.Rm_ProCode)
        if(req.body.Rm_Quality=="") req.body.Rm_Quality=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Rm_Sub_Qua=="") req.body.Rm_Sub_Qua=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Rm_Category=="") req.body.Rm_Category=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Rm_Unit=="") req.body.Rm_Unit=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Rm_ManuFac=="") req.body.Rm_ManuFac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
       let raw = new rawMat_mast();
        raw.Rm_ProCode = req.body.Rm_ProCode;
        raw.Rm_Quality = req.body.Rm_Quality;
        raw.Rm_Sub_Qua = req.body.Rm_Sub_Qua;
        raw.Rm_Category = req.body.Rm_Category;
        raw.Rm_Des = req.body.Rm_Des;
        raw.Rm_OpStk = req.body.Rm_OpStk;
        raw.Rm_Unit = req.body.Rm_Unit;
        raw.Rm_Price = req.body.Rm_Price;
        raw.Rm_ManuFac = req.body.Rm_ManuFac;
        raw.Rm_StRate = req.body.Rm_StRate;
        raw.Rm_StMin = req.body.Rm_StMin;
        raw.Rm_StMax = req.body.Rm_StMax;
        raw.Rm_Lead = req.body.Rm_Lead;
        raw.entry = new Date();
        // raw.co_code =  req.session.compid;
        // raw.div_code =  req.session.divid;
        raw.del =  "N";
        raw.user =  req.session.user;
        raw.masterid =   req.session.masterid;
        raw.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving raw sub type','errors':err});
                return;
            }
            else
            {
                res.redirect('/raw_material_mast/raw_material_mast');
            }
        });
    }
});
router.get('/:id', ensureAuthenticated, function(req, res){
    rawMat_mast.findById(req.params.id, function(err, rawMat_mast){
        
       
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching raw material' });
        } else {
            res.json({ 'success': true, 'rawMat_mast': rawMat_mast });
        }
      
    });
});
router.post('/edit_mat_mast/:id',function(req, res){
    if(req.body.Rm_Quality=="") req.body.Rm_Quality=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Rm_Sub_Qua=="") req.body.Rm_Sub_Qua=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Rm_Category=="") req.body.Rm_Category=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Rm_Unit=="") req.body.Rm_Unit=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Rm_ManuFac=="") req.body.Rm_ManuFac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
   let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let raw = {};
        raw.Rm_ProCode = req.body.Rm_ProCode;
        raw.Rm_Quality = req.body.Rm_Quality;
        raw.Rm_Sub_Qua = req.body.Rm_Sub_Qua;
        raw.Rm_Category = req.body.Rm_Category;
        raw.Rm_Des = req.body.Rm_Des;
        raw.Rm_OpStk = req.body.Rm_OpStk;
        raw.Rm_Unit = req.body.Rm_Unit;
        raw.Rm_Price = req.body.Rm_Price;
        raw.Rm_ManuFac = req.body.Rm_ManuFac;
        raw.Rm_StRate = req.body.Rm_StRate;
        raw.Rm_StMin = req.body.Rm_StMin;
        raw.Rm_StMax = req.body.Rm_StMax;
        raw.Rm_Lead = req.body.Rm_Lead;
        
        // raw.co_code =  req.session.compid;
        // raw.div_code =  req.session.divid;
        raw.del =  "N";
        raw.usrnm =  req.session.user;
        raw.masterid =   req.session.masterid;
        let query = { _id:req.params.id}
        //  console.log('xxxx'+ query);
         rawMat_mast.update(query, raw, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating City', errors: err });
            } else {
                res.redirect('/raw_material_mast/raw_material_mast');
            }
        });
    }
});




let mrn = require('../models/mrn_Schema');
let por = require('../models/pur_order_Schema');
router.delete('/confirm/:id', function(req, res){
    // console.log(req.params.id)
    mrn.findOne({"sales_or_group": {$elemMatch: {so_disc: req.params.id}}, del:"N"}, function(err1, mrnitem){
        por.findOne({"sales_or_group": {$elemMatch: {so_disc: req.params.id}}, main_bk: "POR", del:"N"}, function(err2, poritem){
            if(err1 || err2){
              console.log(err1+"  "+err2);
            }else{
                // console.log(mrnitem)
                if(mrnitem != null || poritem != null){
                    res.json({success:'true'});
                }else{
                    res.json({success:'false'});
                }
            }
        });
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
    rawMat_mast.update(query,state, function(err,somast){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
    }
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