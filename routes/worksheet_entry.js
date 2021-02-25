const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let workmast = require('../models/worksheet_schema');
//let dealentry2 = require('../models/contract_sauda2');
let brand = require('../models/brand_schema');
let product_mast = require('../models/product_mast_schema');
let party = require('../models/party_schema');
let common = require('../routes/common');
let partysubbroker = require('../models/party_schema');
const moment = require('moment-timezone');
 let acmast= require('../models/ac_mast');
 let product = require('../models/product_mast_schema');
 let Notification = require('../models/notification');
 var query;
router.get('/productlist', function (req, res) {
    var prdtnameid =  req.query.prdtnameid;
    product.find({_id:prdtnameid,masterid:req.session.masterid}, function(err, product){
            res.json({ 'success': true, 'product': product});
        });
});
router.post('/productname', function (req, res) {
    product.find({masterid:req.session.masterid}, function(err, product){
            res.json({ 'success': true, 'product': product});
        });
});


router.get('/worksheet_entry', ensureAuthenticated, function(req, res){
    workmast.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast){
        party.find({masterid:req.session.masterid}, function (err, party){
           acmast.find({masterid:req.session.masterid,main_bk:"customer"}, function (err, acmast){
                product.find({masterid:req.session.masterid}, function (err, product){
                    if (err) {
                       console.log(err);
                            } else {
                res.render('worksheet_entry.hbs', {
                    pageTitle:'Add Worksheet Entery',
                    workmast: workmast,
                    brand: brand,
                    party: party,
                    acmast:acmast,
                    partysubbroker: partysubbroker,
                    product:product,
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
      }).populate('ac_city').sort({'ac_name':1})
    })
  }).sort('-vouc_code');
 });
    router.post('/add', async function(req, res){
        if(req.body.ws_cus_name=="") req.body.ws_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var worksheetdate = req.body.work_sheetdt;
        var DateObject =  moment(worksheetdate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var worksheetdtmilisecond = DateObject.format('x');

        var podt = req.body.podt;
        var PodDateObject =  moment(podt, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var podtmilisecond = PodDateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            { 
             let work = new workmast();
            work.ws_no = req.body.ws_no;
            work.vouc_code = req.body.vouc_code;
            work.work_sheetdt =DateObject;
            work.work_sheetdtmilisecond =worksheetdtmilisecond;
            work.ws_cus_name = req.body.ws_cus_name;
             work.w_rmks =  req.body.w_rmks;
            work.podt = PodDateObject;
            work.podtmilisecond = podtmilisecond;
            work.pono = req.body.pono;
            work.tot_order = req.body.tot_order;
            work.w_totaFr = req.body.w_totaFr;
            work.tot_fobamt = req.body.tot_fobamt;
            work.tot_cnfamt = req.body.tot_cnfamt;
            work.w_doller = req.body.w_doller;
            work.market_price = req.body.market_price;
            work.tot_pamt = req.body.tot_pamt;
            work.w_overseasFPB = req.body.w_overseasFPB;
            work.con_cbm = req.body.con_cbm;
            work.add1_amt = req.body.add1_amt;
            work.sgst_tax = req.body.sgst_tax;
            work.add2_amt = req.body.add2_amt;
            work.cgst_tax = req.body.cgst_tax;
            work.add3_amt = req.body.add3_amt;
            work.igst_tax = req.body.igst_tax;
            work.less_rmk = req.body.less_rmk;
            work.less_amt = req.body.less_amt;
            work.less1_rmk = req.body.less1_rmk;
            work.less1_amt = req.body.less1_amt;
            work.less3_rmk = req.body.less3_rmk;
            work.less3_amt = req.body.less3_amt;
            work.paydiscrt = req.body.paydiscrt;
            work.party_remarks = req.body.party_remarks;
            work.bill_amt = req.body.bill_amt;
             work.work_sheet_group = req.body.work_sheet_group;
            work.co_code =  req.session.compid;
            work.div_code =  req.session.divid;
            work.usrnm =  req.session.user;
            work.masterid =   req.session.masterid
            work.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving term','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/worksheet_entry/worksheet_entry_list');
                }
            });
        }
    }
    });
    router.get('/worksheet_entry_list', ensureAuthenticated ,function(req,res){
        workmast.find({}, function (err,workmast){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('worksheet_entry_list.hbs',{
                    pageTitle:'Worksheet List',
                    workmast:workmast,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).populate('ws_cus_name').populate([{path:'ws_cus_name',populate:{ path:'ac_city'}}])  
    });
       router.get('/worksheet_entry_update/:id', ensureAuthenticated, function(req, res){
        workmast.findById(req.params.id, function (err, workmast){
            party.find({masterid:req.session.masterid}, function (err, party){
                acmast.find({masterid:req.session.masterid,main_bk:"customer"}, function (err, acmast){
                     product.find({masterid:req.session.masterid}, function (err, product){
                if (err) {
                    console.log(err);
                } else {
                   
                    res.render('worksheet_entry_update.hbs',{
                        pageTitle:'Update Worksheet entry',
                        workmast: workmast,
                        party: party,
                        acmast: acmast,
                        product: product,
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
        }).populate('ac_city').sort({'ac_name':1})
    }) 
})  
      
});
  
router.get('/worksheet_entry_print/:id', ensureAuthenticated, function(req, res){
    workmast.findById(req.params.id, function (err, workmast){
            if (err) {
                console.log(err);
            } else {
               
                res.render('worksheet_entry_print.hbs',{
                    pageTitle:'WORK SHEET PRINT',
                    workmast: workmast,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                  
                });
               
            }
        }).populate('ws_cus_name')
        .populate([{path: 'work_sheet_group.w_pname'}]);
    })


router.post('/update/:id', function(req, res) {
    if(req.body.ws_cus_name=="") req.body.ws_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var worksheetdate = req.body.work_sheetdt;
    var DateObject =  moment(worksheetdate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var worksheetdtmilisecond = DateObject.format('x');

    var podt = req.body.podt;
    var PodDateObject =  moment(podt, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var podtmilisecond = PodDateObject.format('x');
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let work = {};
        work.ws_no = req.body.ws_no;
            work.vouc_code = req.body.vouc_code;
            work.work_sheetdt =DateObject;
            work.work_sheetdtmilisecond =worksheetdtmilisecond;
            work.ws_cus_name = req.body.ws_cus_name;
             work.w_rmks =  req.body.w_rmks;
            work.podt = PodDateObject;
            work.podtmilisecond = podtmilisecond;
            work.pono = req.body.pono;
            work.tot_order = req.body.tot_order;
            work.w_totaFr = req.body.w_totaFr;
            work.tot_fobamt = req.body.tot_fobamt;
            work.tot_cnfamt = req.body.tot_cnfamt;
            work.w_doller = req.body.w_doller;
            work.market_price = req.body.market_price;
            work.tot_pamt = req.body.tot_pamt;
            work.w_overseasFPB = req.body.w_overseasFPB;
            work.con_cbm = req.body.con_cbm;
            work.add1_amt = req.body.add1_amt;
             work.sgst_tax = req.body.sgst_tax;
             work.add2_amt = req.body.add2_amt;
             work.cgst_tax = req.body.cgst_tax;
             work.add3_amt = req.body.add3_amt;
             work.igst_tax = req.body.igst_tax;
             work.less_rmk = req.body.less_rmk;
             work.less_amt = req.body.less_amt;
             work.less1_rmk = req.body.less1_rmk;
             work.less1_amt = req.body.less1_amt;
             work.less3_rmk = req.body.less3_rmk;
             work.less3_amt = req.body.less3_amt;
             work.paydiscrt = req.body.paydiscrt;
             work.party_remarks = req.body.party_remarks;
             work.bill_amt = req.body.bill_amt;
             work.work_sheet_group = req.body.work_sheet_group;
            work.co_code =  req.session.compid;
            work.div_code =  req.session.divid;
            work.usrnm =  req.session.user;
            work.masterid =   req.session.masterid;
            let query = {_id:req.params.id}
            workmast.update(query ,work ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving WorksheetEntry', 'errors': err });
                return;
            } else {
                res.redirect('/worksheet_entry/worksheet_entry_list');
            }
        });
    }
});
// router.delete('/:id', function(req, res){
//     if(!req.user._id){
//         res.status(500).send();
//       }
//       let query = {_id:req.params.id}
//       product.findById(req.params.id, function(err, product){
//         product.remove(query, function(err){
//             if(err){
//               console.log(err);
//             }
//             res.send('Success');
//           });
//       });
//   });
  router.delete('/:id', function(req, res){    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      workmast.findById(req.params.id, function(err, workmast){
        workmast.remove(query, function(err){
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