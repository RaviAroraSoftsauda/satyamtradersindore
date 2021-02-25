const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let somast = require('../models/mrn_Schema');
let purord = require('../models/pur_order_Schema');
let div = require('../models/divSchema');
let brand = require('../models/brand_schema');
let party = require('../models/party_schema');
let partysubbroker = require('../models/party_schema');
 const moment = require('moment-timezone');
 let acmast= require('../models/ac_mast');
 let workmast = require('../models/worksheet_schema');
 let product = require('../models/rawmatSchema');
 let division = require('../models/division_schema');
 var query;
 var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');

 router.get('/productlist', function (req, res) {
    var prdtnameid =  req.query.prdtnameid;
    product.find({_id:prdtnameid,masterid:req.session.masterid}, function(err, product){
        res.json({ 'success': true, 'product': product});
    });
});

router.get('/productname', function (req, res) {
    product.find({masterid:req.session.masterid, del:"N"}, function(err, product){
        res.json({ 'success': true, 'product': product});
    }).sort({'Rm_ProCode':1});
});

// router.get('/buyer_list', function (req, res) {
//     var masterid =  req.query.masterid;
//     acmast.find({masterid:masterid,main_bk:'customer'}, function (err, acmast){
//         var data = new Array();
//         for (var j = 0; j < acmast.length; j++) {
//             data[j] = {
//                 "id": acmast[j]._id,
//                  "product_name" : acmast[j].ac_name,
//                  "masterid" : acmast[j].masterid
//                 };
//         }
//         res.json({'results':  data});
//         });
// });

router.get('/product_list', function (req, res) {
    var masterid =  req.query.masterid;
   product.find({masterid:masterid}, function (err,product){
        var data = new Array();
        for (var j = 0; j <product.length; j++) {
            data[j] = {
                "id":product[j]._id,
                 "pro_name" :product[j].prdt_desc,
                 "masterid" :product[j].masterid
                };
        }
        res.json({'results':  data});
        });
});

router.get('/product_rate_list', function (req, res) {
    var masterid =  req.query.masterid;
   product.find({masterid:masterid}, function (err,product){
        var data = new Array();
        for (var j = 0; j <product.length; j++) {
            data[j] = {
                "id":product[j]._id,
                 "rate" :product[j].si_price,
                 "masterid" :product[j].masterid
                };
        }
        res.json({'results':  data});
        });
});

 
router.get('/mrn_mast', ensureAuthenticated, function(req, res){
   somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"MRN", del:"N"}, function (err,somast){
        party.find({masterid:req.session.masterid,masterid:req.session.masterid}, function (err, party){
           acmast.find({main_bk:"customer"}, function (err, acmast){
                product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
                    workmast.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast){
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
                                var buyername = this.accarry;
                                // console.log(buyername)
                                if(somast != '' ){
                                    var a = somast[somast.length-1]['vouc_code']
                                    var last = parseInt(a)+1
                                }else{var last = 1}
                                
                                // console.log(last)
                res.render('mrn_mast.hbs', {
                    pageTitle:'Mrn Entry',
                    somast:somast,
                    workmast: workmast,
                    brand: brand,
                    last: last,
                    party: party,
                    buyername:buyername,
                    partysubbroker:partysubbroker,
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
         }).populate('garry');
        }).populate('CityName');
        })
        }).sort({'Rm_ProCode':1});
      }).populate('ac_city')
    })
  }).sort({'vouc_code':1});
 });


    router.post('/add', async function(req, res){
       if(req.body.buy_cus_name=="") req.body.buy_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
       product.find(function (err, product){
        let errors = req.validationErrors();
        var sodate = req.body.so_date;
        var DateObject =  moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');

        // if(req.body.buy_podt !='' || req.body.buy_podt !=null || req.body.buy_podt !=undefined){
            // console.log(req.body.buy_podt)
            var buy_podtso = req.body.buy_podt;
            var PodDateObject =  moment(buy_podtso, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var podtmilisecond = PodDateObject.format('x');
        // }
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            { 
               
           let saleorder = new somast();
           saleorder.main_bk = "MRN";
           saleorder.d_c = 'C';
           saleorder.so_no = req.body.so_no;
           saleorder.vouc_code = req.body.vouc_code;
           saleorder.so_date =DateObject;
           saleorder.so_datemilisecond = sodatemilisecond;
           saleorder.ws_no = req.body.ws_no;
           saleorder.buy_podt = PodDateObject;
           saleorder.buy_podtmilisecond= podtmilisecond;
           saleorder.buy_cus_name = req.body.buy_cus_name;
           saleorder.buy_rmks = req.body.buy_rmks;
           saleorder.buy_pono = req.body.buy_pono;
           saleorder.tot_sooq = req.body.tot_sooq;
           saleorder.tot_amtso = req.body.tot_amtso;
           saleorder.tot_discount = req.body.tot_discount;
           saleorder.tot_amtbefore = req.body.tot_amtbefore;
           saleorder.so_remarks = req.body.so_remarks;
           saleorder.sales_or_group = req.body.sales_or_group;
           saleorder.grand_total = req.body.grand_total;
           saleorder.add_details = req.body.add_details;
           saleorder.less_details = req.body.less_details;
           saleorder.co_code = req.session.compid;
           saleorder.div_code = req.session.divid;
           saleorder.usrnm = req.session.user;
           saleorder.masterid = req.session.masterid
           saleorder.del = 'N',
           saleorder.entry = new Date();
           saleorder.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving term','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/mrn_challan/mrn_mast');
      
                }
            });
        }
    }
    });
    });
    
    router.get('/mrn_list_mast', ensureAuthenticated ,function(req,res){
       somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"MRN", del:"N"}, function (err,somast){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('mrn_list_mast.hbs',{
                    pageTitle:'Mrn List',
                   somast: somast,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).populate('buy_cus_name')
        .populate([{path: 'buy_cus_name',populate:{ path: 'CityName'}}])
      });



       router.get('/mrnchallan_update/:id', ensureAuthenticated, function(req, res){
          somast.findById(req.params.id, function (err,somast){
            workmast.find({masterid:req.session.masterid}, function (err, workmast){
                acmast.find({masterid:req.session.masterid,main_bk:"customer"}, function (err, acmast){
                    product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
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
                    var buyername = this.accarry;
                   
                    res.render('mrn_update.hbs',{
                        pageTitle:'Mrn Update',
                       somast:somast,
                        workmast: workmast,
                        buyername:buyername,
                        brand: brand,
                        party: party,
                        acmast:acmast,
                        partysubbroker:partysubbroker,
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
            }).populate('garry');
        }).populate('CityName');
        }).sort({'Rm_ProCode':1});
        }).populate('ac_city')
    })
    }).populate('buy_cus_name')
  });
  
  
router.get('/mrn_print/:id', ensureAuthenticated, function(req, res){
   somast.findById(req.params.id, function (err,somast){
    div.findById(req.session.divid, function(err, division){

            if (err) {
                console.log(err);
            } else {
               var add = division.ac_add2
               var divname = division.div_mast
                res.render('mrn_print.hbs',{
                    pageTitle:'Print',
                    somast:somast,
                    add:add,
                    divname:divname,
                    division:division,
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
    .populate([{path: 'buy_cus_name',populate:{ path: 'ac_city'}}])
    .populate('production_dept_name')
    .populate([{path: 'sales_or_group.so_disc'}])//,select:'prdt_desc'
    .populate([{path: 'sales_or_group.so_div'}])//,select:'prdt_desc'         
})

router.post('/update/:id', function(req, res) {
    if(req.body.buy_cus_name=="") req.body.buy_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var sodate = req.body.so_date;
        var DateObject =moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');

        var buy_podtso = req.body.buy_podt;
        var PodDateObject =  moment(buy_podtso, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var podtmilisecond = PodDateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        
             { 
           let saleorder = {};
           saleorder.main_bk = "MRN";
           saleorder.d_c = 'C';
           saleorder.so_no = req.body.so_no;
           saleorder.vouc_code = req.body.vouc_code;
           saleorder.so_date =DateObject;
           saleorder.so_datemilisecond = sodatemilisecond;
           saleorder.ws_no = req.body.ws_no;
           saleorder.buy_podt = PodDateObject;
           saleorder.buy_podtmilisecond= podtmilisecond;
           saleorder.buy_cus_name = req.body.buy_cus_name;
           saleorder.buy_rmks = req.body.buy_rmks;
           saleorder.buy_pono = req.body.buy_pono;
           saleorder.tot_sooq = req.body.tot_sooq;
           saleorder.tot_amtso = req.body.tot_amtso;
           saleorder.tot_discount = req.body.tot_discount;
           saleorder.tot_amtbefore = req.body.tot_amtbefore;
           saleorder.so_remarks = req.body.so_remarks;
           saleorder.sales_or_group = req.body.sales_or_group;
           saleorder.grand_total = req.body.grand_total;
           saleorder.add_details = req.body.add_details;
           saleorder.less_details = req.body.less_details;
           saleorder.co_code =  req.session.compid;
           saleorder.div_code =  req.session.divid;
           saleorder.usrnm =  req.session.user;
           saleorder.masterid =   req.session.masterid;
           saleorder.del = 'N',
           saleorder.update = new Date();
           let query = {_id:req.params.id}
            somast.update(query , saleorder ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Proforma', 'errors': err });
                return;
            } else {
                res.redirect('/mrn_challan/mrn_list_mast');
            }
        
        });
    }
});

router.get('/purorder', function(req, res) {
    var party = req.query.party;
    // console.log(party)
    var compobj= new mongoose.Types.ObjectId(req.session.compid);
    var divobj= new mongoose.Types.ObjectId(req.session.divid);
    purord.find({buy_cus_name:party, co_code:compobj, div_code:divobj, main_bk:"POR",del:"N"}, function (err, purord){
        if (err){
                console.log(err);
            } 
            else{
                    array = [];
                    for(let i=0; i<purord.length; i++){
                        var soarr = purord[i].sales_or_group;
                        for(let j=0; j<soarr.length; j++){
                            if(soarr[j].po_qty_blc > 0){
                                var arr = {'_id': purord[i]._id, 'buy_podt': purord[i].so_date, 'sales_or_group': [soarr[j]]}
                                this.array.push(arr)
                            }
                        }
                    }
                res.json({ 'success': true, 'pomast': this.array});
            }
        // })
    }).populate([{path: 'sales_or_group.so_disc',select:'Rm_Des'}]);
}); 

router.post('/update_pur_ord', function(req, res) {
    var countsl = req.body.countsl;
    console.log(countsl)
    var compobj= new mongoose.Types.ObjectId(req.session.compid);
    var divobj= new mongoose.Types.ObjectId(req.session.divid);
    // if(countsl.sales_ord_id !='' || countsl.sales_ord_id!=null){
    purord.findById(countsl.pur_ord_id, function (err, purord){
        if (!purord){
            res.status(404).send("Record Not Found");
        } 
        else{ 
            let arr = purord.sales_or_group;
            // console.log(arr.length)
            for(let j = 0; j<arr.length; j++){
                // console.log(arr[j]._id+"_____"+countsl.sales_ord_grp_id)
                if(arr[j]._id.equals(countsl.pur_ord_grp_id)){
                    // console.log(arr[j].so_qty_blc+"______"+countsl.orqtydsi)
                    arr[j].po_qty_blc = parseInt(arr[j].po_qty_blc) - parseInt(countsl.so_qty);
                    arr[j].po_qty_exe += parseInt(countsl.so_qty);
                    break;
                }
            }
            purord.save().then(purord => {
                res.json('Update Complite');
              }).catch(err => {
                  res.status(400).send("Unable to update database");
              });
        }
    });
// }
}); 

router.get('/productname', function (req, res) {
    product.find({masterid:req.session.masterid, del:"N"}, function(err, product){
        
        res.json({ 'success': true, 'product': product});
    });
});

router.post('/update_purord2', function(req, res) {
    var si_id = req.body.slin_id;
    var slgrp;
    // console.log(si_id)
    var compobj= new mongoose.Types.ObjectId(req.session.compid);
    var divobj= new mongoose.Types.ObjectId(req.session.divid);
    somast.findById(si_id, function (err, somast){
    slgrp = somast.sales_or_group;
    console.log(slgrp);
    for(let i=0; i<slgrp.length; i++){
    // console.log(slgrp[i].sales_ord_id)
    if(slgrp[i].pur_ord_id !=undefined){
    purord.findById(slgrp[i].pur_ord_id, function (err, purord){
        if (!purord){
            res.status(404).send("Record Not Found");
        } 
        else{ 
            // console.log(purord)
            let arr = purord.sales_or_group;
            // console.log(arr.length)
            for(let j = 0; j<arr.length; j++){
                // console.log(arr[j]._id+"_____"+countsl.pur_ord_grp_id)
                if(arr[j]._id.equals(slgrp[i].pur_ord_grp_id)){
                    // console.log(arr[j].po_qty_blc+"______"+countsl.so_qty)
                    arr[j].po_qty_blc = parseInt(arr[j].po_qty_blc) + parseInt(slgrp[i].so_qty);
                    arr[j].po_qty_exe = parseInt(arr[j].po_qty_exe)-parseInt(slgrp[i].so_qty);
                    break;
                }
            }
            purord.save().then(purord => {
                res.json({'success': "true"});
            }).catch(err => {
                res.status(400).send("Unable to update database");
            });
        }
    });
    }
    }
    });
});


  router.delete('/:id', function(req, res){    
      if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
    //   somast.findById(req.params.id, function(err,somast){
        let saleorder = {};
        saleorder.del = 'Y';
        saleorder.delete = new Date();
      somast.update(query,saleorder, function(err){
            if(err){
              console.log(err);
            }
            res.send('Success');
          });
    //   });
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
