const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let somast = require('../models/pur_order_Schema');
let brand = require('../models/brand_schema');
let party = require('../models/party_schema');
let partysubbroker = require('../models/party_schema');
let div = require('../models/divSchema');
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

router.get('/buyer_list', function (req, res) {
    var masterid =  req.query.masterid;
    acmast.find({masterid:masterid,main_bk:'customer'}, function (err, acmast){
        var data = new Array();
        for (var j = 0; j < acmast.length; j++) {
            data[j] = {
                "id": acmast[j]._id,
                 "product_name" : acmast[j].ac_name,
                 "masterid" : acmast[j].masterid
                };
        }
        res.json({'results':  data});
        });
});
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

 
router.get('/pur_order', ensureAuthenticated, function(req, res){
   somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"POR", del:"N"}, function (err,somast){
        party.find({masterid:req.session.masterid,masterid:req.session.masterid}, function (err, party){
           acmast.find({main_bk:"customer"}, function (err, acmast){
                product.find({masterid:req.session.masterid, del:'N'}, function (err, product){
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
                                    var a = somast[0]['vouc_code']
                                    var last = parseInt(a)+1
                                }else{var last = 1}
                                
                                // console.log(last)
                res.render('pur_order.hbs', {
                    pageTitle:'Purchase Order Entry',
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
  }).sort({'vouc_code':-1});
 });


    router.post('/add', async function(req, res){
        if(req.body.buy_cus_name=="") req.body.buy_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
     
        let errors = req.validationErrors();
        var sodate = req.body.so_date;
        var DateObject =  moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
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
            { 
               
           let saleorder = new somast();
           saleorder.main_bk = "POR";
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
                    res.redirect('/pur_order/pur_order');
      
                }
            });
        }
    }
    });
    
//     router.get('/mrn_list_mast', function (req, res) {
//         var masterid =  req.query.masterid;
       
       
//       somast.find({masterid:req.session.masterid,main_bk:"MRN"},function (err, somast){
      
//         var data = new Array();
//           for (var j = 0; j <somast.length; j++) {
//               if (somast[j]['so_date'] != null)  so_date = somast[j]['so_date'];
//               else  so_date = "";
//               if (somast[j]['buy_cus_name'] != null)  buy_cus_name = somast[j]['buy_cus_name']['ACName'];
//               else  buy_cus_name = "";
//               if (somast[j]['buy_podt'] != null)  buy_podt = somast[j]['buy_podt'];
//               else  buy_podt = "";
           
//               var salesordergroup = somast[j]['sales_or_group'];
//               for (var s = 0; s < salesordergroup.length; s++) {
                  
//                   if (salesordergroup[s]['so_disc'] != null)  so_disc = salesordergroup[s]['so_disc']['Rm_Des'];
//                   else  so_disc = "";
//                   if (salesordergroup[s]['soor_qty'] != null)  soor_qty = salesordergroup[s]['soor_qty'];
//                   else  soor_qty = "";
//                   if (salesordergroup[s]['so_rate'] != null)  so_rate = salesordergroup[s]['so_rate'];
//                   else  so_rate = "";
//                   if (salesordergroup[s]['so_discount'] != null)  so_discount = salesordergroup[s]['so_discount'];
//                   else  so_discount = "";
//                   if (salesordergroup[s]['total_amt'] != null)  total_amt = salesordergroup[s]['total_amt'];
//                   else total_amt = "";
                 
              
//                  data[j] = {
//                   "id": somast[j]._id,
//                   "so_date": so_date,
//                   // "typ": somast[j].typ,
//                   "buy_podt": buy_podt,
//                   "buy_cus_name" : buy_cus_name,
//                   "so_disc" : so_disc,
//                   "soor_qty" : soor_qty,
//                   "so_rate" : so_rate,
//                   "so_discount" : so_discount,
//                   "total_amt" : total_amt,
//                   };
//               }    
             
//       }
     
//       res.json({'data':  data});
      
//            }).populate([{path: 'sales_or_group.so_disc',select: 'Rm_Des',
//         }]).populate([{path: 'buy_cus_name',select: 'ACName',
//     }])
  
//   });
    router.get('/pur_order_list', ensureAuthenticated ,function(req,res){
       somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"POR", del:"N"}, function (err,somast){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('pur_order_list.hbs',{
                    pageTitle:'Purchase Order List',
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



       router.get('/pur_order_update/:id', ensureAuthenticated, function(req, res){
          somast.findById(req.params.id, function (err,somast){
            workmast.find({masterid:req.session.masterid}, function (err, workmast){
                acmast.find({masterid:req.session.masterid,main_bk:"customer"}, function (err, acmast){
                    product.find({masterid:req.session.masterid, del:'N'}, function (err, product){
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
                   
                    res.render('pur_orderupdate.hbs',{
                        pageTitle:'Purchase Order Update',
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

  router.get('/pur_print/:id', ensureAuthenticated, function(req, res){
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
           saleorder.main_bk = "POR";
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
                res.redirect('/pur_order/pur_order_list');
            }
        
        });
    }
});

router.get('/worksheetname', function(req, res) {
    var vouc_code = req.query.vouc_code;
    workmast.find({vouc_code:vouc_code,co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast) {
        if (err)
        {
            console.log(err);
        } 
        else
        {
            res.json({ 'success': true, 'workmast': workmast}); ///,'party': party
        }
    }) .populate([{path: 'work_sheet_group.w_pname',select:'prdt_desc'}]);
    });


    router.delete('/:id', function(req, res){   
        if(!req.user._id){
            res.status(500).send();
        }
        let query = {_id:req.params.id}
        let saleorder = {};
        saleorder.del = 'Y';
        saleorder.delete = new Date();
        // somast.findById(req.params.id, function(err,somast){
        somast.update(query,saleorder, function(err,somast){
            if(err){
              console.log(err);
            }else{
                res.send('Success');
            }
            
          });
        // });
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
