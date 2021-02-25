const express = require('express');
//var popup = require('popups');
const router = express.Router(); 

const mongoose = require('mongoose');
const moment = require('moment-timezone');
let finishgood= require('../models/fgSchema');
let brand= require('../models/brandSchema');
let model= require('../models/modelSchema');
let sku= require('../models/skuSchema');



router.post('/finish_goods_add',function(req, res){
    if(req.body.ac_tranType=="") req.body.ac_tranType=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_transport=="") req.body.ac_transport=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_ptype=="") req.body.ac_ptype=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_city=="") req.body.ac_city=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.ac_city1=="") req.body.ac_city1=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        //     let cust = new customer();
        //     cust.main_bk = "customer";
        //     cust.ac_name = req.body.ac_name;
        //    // cust.ac_code = req.body.ac_code;
        //     cust.ac_tranType = req.body.ac_tranType;
        //     cust.ac_groupname = req.body.ac_groupname;
        //     cust.ac_transport = req.body.ac_transport;
        //     cust.ac_ptype = req.body.ac_ptype;
        //     cust.ac_opbal = req.body.ac_opbal;
        //     cust.ac_open_type = req.body.ac_open_type;
        //     cust.ac_add1 = req.body.ac_add1;
        //     cust.ac_city = req.body.ac_city;
        //     cust.ac_pin = req.body.ac_pin;
        //     cust.ac_phfax = req.body.ac_phfax;
        //     cust.ac_phoff = req.body.ac_phoff;
        //     cust.ac_phres= req.body.ac_phres; 
        //     cust.ac_phmob = req.body.ac_phmob;
        //     cust.ac_add2 = req.body.ac_add2;
        //     cust.ac_city1= req.body.ac_city1;
        //     cust.fac_pin = req.body.fac_pin;
        //     cust.fac_phfax = req.body.fac_phfax;
        //     cust.fac_phoff = req.body.fac_phoff;
        //     cust.fac_phres = req.body.fac_phres;
        //     cust.fac_phmob = req.body.fac_phmob;
        //     cust.ac_cont = req.body.ac_cont;
        //     cust.ac_port= req.body.ac_port;
        //     cust.port_dicharge= req.body.port_dicharge;
        //     cust.ac_email = req.body.ac_email;
        //     cust.ac_gstin = req.body.ac_gstin;
        //     cust.ac_nftparty= req.body.ac_nftparty;
        //     cust.ac_crelimit = req.body.ac_crelimit;
        //     cust.ac_website = req.body.ac_website;
        //     cust.ac_iecno = req.body.ac_iecno;
        //     cust.ac_credate = req.body.ac_credate;
        //     cust.ac_bank = req.body.ac_bank;
        //     cust.ac_oth = req.body.ac_oth;
        //     cust.ac_payterm = req.body.ac_payterm;
        //     cust.ac_advafter = req.body.ac_advafter;
        //     cust.ac_advbefore = req.body.ac_advbefore;
        //     cust.co_code =  req.session.compid;
        //     cust.div_code =  req.session.divid;
        //     cust.usrnm =  req.session.user;
        //     cust.masterid = req.session.masterid;
        
        //     customer.findOne({$and: [{ main_bk:"customer" },{ ac_city: req.body.ac_city },{ ac_name: req.body.ac_name}]}, function(errors, customer){
        //      //  console.log(customer)
        //       //  console.log(req.body.ac_name)
        //       let agrfg=true;
        //             if(customer==null) {
        //                 cust.save()
        //                 agrfg=true;
        //             }else{
        //                 agrfg=false;
        //             }
        //                 res.json({'success': agrfg});
        //             })
               }
           
        });
    
        router.get('/finish_goods_add', ensureAuthenticated ,function(req,res){
            finishgood.find({masterid: req.session.masterid, del:"N"}, function (err,finishgood){
                
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    res.render('finish_goods_add.hbs',{
                        pageTitle:'finish goods add',
                        finishgood:finishgood,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                    });
                }
            
          
            }).sort({'Fg_PrCode':1}).populate('Fg_Brand').populate('Fg_Model').populate('Fg_Unit');
           });
        
    router.get('/finish_goods_list', ensureAuthenticated ,function(req,res){
        finishgood.find({masterid: req.session.masterid, del:"N"}, function (err,finishgood){
            
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('finish_goods_list.hbs',{
                    pageTitle:'finish goods List',
                    finishgood:finishgood,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        
      
        }).sort({'Fg_PrCode':1}).populate('Fg_Brand').populate('Fg_Model').populate('Fg_Unit');
       });



//        router.get('/customer_list_update/:id', ensureAuthenticated, function(req, res){
//            try {
//          customer.findById(req.params.id, function (err, customer){
//             transportmast.find({main_bk:"transport"}, function (err,transportmast){
//             group.find({masterid:req.session.masterid}, function (err, group){
//              bank.find({}, function (err, bank){
//               g_mast.find({}, function (err, g_mast){
//                 tm_mast.find({masterid:req.session.masterid}, function (err, tm_mast){
//                    ptyp_mast.find({masterid:req.session.masterid}, function (err, ptyp_mast){
//                        city.find({}, function (err, city){
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     res.render('customer_list_update.hbs', {
//                         pageTitle:'Update customer',
//                         customer: customer,
//                         group: group,
//                         g_mast: g_mast,
//                         tm_mast:tm_mast,
//                         ptyp_mast:ptyp_mast,
//                         city: city,
//                         state: state,
//                         transportmast:transportmast,
//                         bank: bank,
//                         district_master: district_master,
//                         compnm:req.session.compnm,
//                         divnm:req.session.divmast,
//                         sdate: req.session.compsdate,
//                         edate:req.session.compedate,
//                         usrnm:req.session.user,
//                         security: req.session.security,
//                         administrator:req.session.administrator
//                     });
//                 }
//             })
//             })
//             })
//             })
//         })
//          });
//       })
//     })
// }
// catch(err)
// {
//     console.log(err);
// }
// });
        // router.post('/customer_update_submit/:id', function(req, res) {
        //     if(req.body.ac_tranType=="") req.body.ac_tranType=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        //     if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        //     if(req.body.ac_transport=="") req.body.ac_transport=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        //     if(req.body.ac_ptype=="") req.body.ac_ptype=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        //     if(req.body.ac_city=="") req.body.ac_city=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        //     if(req.body.ac_city1=="") req.body.ac_city1=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        //     let errors = req.validationErrors();
        //     if (errors) {
        //         console.log(errors);
        //         res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
        //     } else {
        //         let cust = {}; 
        //     cust.main_bk = "customer";
        //     cust.ac_name = req.body.ac_name;
        //     //cust.ac_code = req.body.ac_code;
        //     cust.ac_tranType = req.body.ac_tranType;
        //     cust.ac_groupname = req.body.ac_groupname;
        //     cust.ac_transport = req.body.ac_transport;
        //     cust.ac_ptype = req.body.ac_ptype;
        //     cust.ac_opbal = req.body.ac_opbal;
        //     cust.ac_open_type = req.body.ac_open_type;
        //     cust.ac_add1 = req.body.ac_add1;
        //     cust.ac_city = req.body.ac_city;
        //     cust.ac_pin = req.body.ac_pin;
        //     cust.ac_phfax = req.body.ac_phfax;
        //     cust.ac_phoff = req.body.ac_phoff;
        //     cust.ac_phres= req.body.ac_phres; 
        //     cust.ac_phmob = req.body.ac_phmob;
        //     cust.ac_add2 = req.body.ac_add2;
        //     cust.ac_city1= req.body.ac_city1;
        //     cust.fac_pin = req.body.fac_pin;
        //     cust.fac_phfax = req.body.fac_phfax;
        //     cust.fac_phoff = req.body.fac_phoff;
        //     cust.fac_phres = req.body.fac_phres;
        //     cust.fac_phmob = req.body.fac_phmob;
        //     cust.ac_cont = req.body.ac_cont;
        //     cust.ac_port= req.body.ac_port;
        //     cust.port_dicharge= req.body.port_dicharge;
        //     cust.ac_email = req.body.ac_email;
        //     cust.ac_gstin = req.body.ac_gstin;
        //     cust.ac_nftparty= req.body.ac_nftparty;
        //     cust.ac_crelimit = req.body.ac_crelimit;
        //     cust.ac_website = req.body.ac_website;
        //     cust.ac_iecno = req.body.ac_iecno;
        //     cust.ac_credate = req.body.ac_credate;
        //     cust.ac_bank = req.body.ac_bank;
        //     cust.ac_oth = req.body.ac_oth;
        //     cust.ac_payterm = req.body.ac_payterm;
        //     cust.ac_advafter = req.body.ac_advafter;
        //     cust.ac_advbefore = req.body.ac_advbefore;
        //     cust.co_code =  req.session.compid;
        //     cust.div_code =  req.session.divid;
        //     cust.usrnm =  req.session.user;
        //     cust.masterid = req.session.masterid;
        //     let query = {_id:req.params.id}               
        //     customer.findOne({$and: [ { _id: { $ne:query._id } },{ main_bk:"customer" },{ ac_city: req.body.ac_city },{ ac_name: req.body.ac_name}]}, function(errors, rio){
        //       //  console.log(rio)
        //       //  console.log(req.body.ac_name)
        //       let trfls=true;
        //             if(rio==null) {
        //                 customer.update(query , cust ,function (err) { });
        //                 //customer.update(query ,cust);
        //                 console.log("query",query)
        //                 //console.log(cust)
        //                 trfls=true                                                     
        //                 }
        //                 else
        //                 {
        //                     trfls=false 
        //                 }

        //             //  customer.update(query ,cust ,function (customer){
        //             //         if (rio!==null) {
        //                         return  res.json({'success':trfls});
        //                         // res.json({'success':true});
                        
                       
                       
        //         })
              
        //     }
           
        // });



              
        router.delete('/:id', function(req, res){  
          let query = {_id:req.params.id}
          finishgood.findById(req.params.id, function(err, customer){
            customer.remove(query, function(err){
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