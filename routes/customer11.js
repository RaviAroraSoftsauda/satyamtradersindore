const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let customer= require('../models/ac_mast');
let transportmast= require('../models/ac_mast');
let group = require('../models/group_schema');
let city = require('../models/city_schema');
let state = require('../models/state_schema');
let bank = require('../models/bank_schema');
let sauda1 = require('../models/contract_sauda_schema');
let district_master = require('../models/district_schema');
let state_master = require('../models/state_schema');
let g_mast= require('../models/group_mast');
let tm_mast= require('../models/trans_mast_schema');
let ptyp_mast= require('../models/party_type_schema');
var query;
// Add Route
router.get('/getcitybyid', function (req, res) {
    if( req.query.id ) {
        city.findById(req.query.id,  function(err, city){
            res.json({ 'success': true, 'state_name': city });
        }).populate('state_name');
        
    }
  
});
router.get('/customer', ensureAuthenticated, function(req, res){
           customer.find({masterid:req.session.masterid}, function (err, customer){
            transportmast.find({main_bk:"transport"}, function (err,transportmast){
              group.find({masterid:req.session.masterid}, function (err, group){
               bank.find({}, function (err, bank){
                g_mast.find({}, function (err, g_mast){
                  tm_mast.find({masterid:req.session.masterid}, function (err, tm_mast){
                     ptyp_mast.find({masterid:req.session.masterid}, function (err, ptyp_mast){
                        city.find({}, function (err, city){
                 
            if (err) {
                console.log(err);
            } else {
                res.render('customer.hbs', {
                    pageTitle:'Add Customer',
                    group: group,
                    customer:customer,
                    ptyp_mast: ptyp_mast,
                    tm_mast:tm_mast,
                    city:city,
                    transportmast:transportmast,
                    g_mast:g_mast,
                    state: state,
                    bank: bank,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'city_name':1})
        }).sort({'group_name':1})
    }).sort({'tran_descr':1})
}).sort({'group_name':1})
        })
    }).sort({'group_name':1})
}).sort({'ac_name':1})
})
});
router.post('/customer_add',function(req, res){
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
            let cust = new customer();
            cust.main_bk = "customer";
            cust.ac_name = req.body.ac_name;
           // cust.ac_code = req.body.ac_code;
            cust.ac_tranType = req.body.ac_tranType;
            cust.ac_groupname = req.body.ac_groupname;
            cust.ac_transport = req.body.ac_transport;
            cust.ac_ptype = req.body.ac_ptype;
            cust.ac_opbal = req.body.ac_opbal;
            cust.ac_open_type = req.body.ac_open_type;
            cust.ac_add1 = req.body.ac_add1;
            cust.ac_city = req.body.ac_city;
            cust.ac_pin = req.body.ac_pin;
            cust.ac_phfax = req.body.ac_phfax;
            cust.ac_phoff = req.body.ac_phoff;
            cust.ac_phres= req.body.ac_phres; 
            cust.ac_phmob = req.body.ac_phmob;
            cust.ac_add2 = req.body.ac_add2;
            cust.ac_city1= req.body.ac_city1;
            cust.fac_pin = req.body.fac_pin;
            cust.fac_phfax = req.body.fac_phfax;
            cust.fac_phoff = req.body.fac_phoff;
            cust.fac_phres = req.body.fac_phres;
            cust.fac_phmob = req.body.fac_phmob;
            cust.ac_cont = req.body.ac_cont;
            cust.ac_port= req.body.ac_port;
            cust.port_dicharge= req.body.port_dicharge;
            cust.ac_email = req.body.ac_email;
            cust.ac_gstin = req.body.ac_gstin;
            cust.ac_nftparty= req.body.ac_nftparty;
            cust.ac_crelimit = req.body.ac_crelimit;
            cust.ac_website = req.body.ac_website;
            cust.ac_iecno = req.body.ac_iecno;
            cust.ac_credate = req.body.ac_credate;
            cust.ac_bank = req.body.ac_bank;
            cust.ac_oth = req.body.ac_oth;
            cust.ac_payterm = req.body.ac_payterm;
            cust.ac_advafter = req.body.ac_advafter;
            cust.ac_advbefore = req.body.ac_advbefore;
            cust.co_code =  req.session.compid;
            cust.div_code =  req.session.divid;
            cust.usrnm =  req.session.user;
            cust.masterid = req.session.masterid;
          cust.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving customer','errors':err});
                return;
            }
            else
            {
                res.redirect('/customer/customer_list');
            }
        });
    }
});
    router.get('/customer_list', ensureAuthenticated ,function(req,res){
        customer.find({masterid: req.session.masterid,main_bk:"customer"}, function (err,customer){
            city.find({}, function (err, city){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('customer_list.hbs',{
                    pageTitle:'customer List',
                    customer:customer,
                    sauda1:sauda1,
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
      
        }).populate('ac_groupname').populate('ac_transport').populate('ac_tranType').populate('ac_ptype').populate('ac_city')
        .sort({'ac_groupname':1})
      
       });
       router.get('/customer_list_update/:id', ensureAuthenticated, function(req, res){
        // var p_type = req.body.p_type;
        customer.findById(req.params.id, function (err, customer){
            transportmast.find({main_bk:"transport"}, function (err,transportmast){
            group.find({masterid:req.session.masterid}, function (err, group){
             bank.find({}, function (err, bank){
              g_mast.find({}, function (err, g_mast){
                tm_mast.find({masterid:req.session.masterid}, function (err, tm_mast){
                   ptyp_mast.find({masterid:req.session.masterid}, function (err, ptyp_mast){
                       city.find({}, function (err, city){
                if (err) {
                    console.log(err);
                } else {
                    res.render('customer_list_update.hbs', {
                        pageTitle:'Update customer',
                        customer: customer,
                        group: group,
                        g_mast: g_mast,
                        tm_mast:tm_mast,
                        ptyp_mast:ptyp_mast,
                        city: city,
                        state: state,
                        transportmast:transportmast,
                        bank: bank,
                        district_master: district_master,
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
         })
      })
     }).populate('ac_pin').populate('fac_pin').populate('bank_pin');
  
});
        router.post('/customer_update_submit/:id', function(req, res) {
            if(req.body.ac_tranType=="") req.body.ac_tranType=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.ac_groupname=="") req.body.ac_groupname=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.ac_transport=="") req.body.ac_transport=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.ac_ptype=="") req.body.ac_ptype=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.ac_city=="") req.body.ac_city=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.ac_city1=="") req.body.ac_city1=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let cust = {}; 
            cust.main_bk = "customer";
            cust.ac_name = req.body.ac_name;
            //cust.ac_code = req.body.ac_code;
            cust.ac_tranType = req.body.ac_tranType;
            cust.ac_groupname = req.body.ac_groupname;
            cust.ac_transport = req.body.ac_transport;
            cust.ac_ptype = req.body.ac_ptype;
            cust.ac_opbal = req.body.ac_opbal;
            cust.ac_open_type = req.body.ac_open_type;
            cust.ac_add1 = req.body.ac_add1;
            cust.ac_city = req.body.ac_city;
            cust.ac_pin = req.body.ac_pin;
            cust.ac_phfax = req.body.ac_phfax;
            cust.ac_phoff = req.body.ac_phoff;
            cust.ac_phres= req.body.ac_phres; 
            cust.ac_phmob = req.body.ac_phmob;
            cust.ac_add2 = req.body.ac_add2;
            cust.ac_city1= req.body.ac_city1;
            cust.fac_pin = req.body.fac_pin;
            cust.fac_phfax = req.body.fac_phfax;
            cust.fac_phoff = req.body.fac_phoff;
            cust.fac_phres = req.body.fac_phres;
            cust.fac_phmob = req.body.fac_phmob;
            cust.ac_cont = req.body.ac_cont;
            cust.ac_port= req.body.ac_port;
            cust.port_dicharge= req.body.port_dicharge;
            cust.ac_email = req.body.ac_email;
            cust.ac_gstin = req.body.ac_gstin;
            cust.ac_nftparty= req.body.ac_nftparty;
            cust.ac_crelimit = req.body.ac_crelimit;
            cust.ac_website = req.body.ac_website;
            cust.ac_iecno = req.body.ac_iecno;
            cust.ac_credate = req.body.ac_credate;
            cust.ac_bank = req.body.ac_bank;
            cust.ac_oth = req.body.ac_oth;
            cust.ac_payterm = req.body.ac_payterm;
            cust.ac_advafter = req.body.ac_advafter;
            cust.ac_advbefore = req.body.ac_advbefore;
            cust.co_code =  req.session.compid;
            cust.div_code =  req.session.divid;
            cust.usrnm =  req.session.user;
            cust.masterid = req.session.masterid;
            let query = {_id:req.params.id}
                customer.update(query ,cust ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving Customer', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });delete_customer
                        res.redirect('/customer/customer_list');
                    }
                });
            }
        });
        router.delete('/:id', function(req, res){  
          let query = {_id:req.params.id}
          customer.findById(req.params.id, function(err, customer){
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