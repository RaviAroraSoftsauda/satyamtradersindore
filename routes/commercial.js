const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let promast = require('../models/proforma_schema');
let brand = require('../models/brand_schema');
let party = require('../models/party_schema');
let partysubbroker = require('../models/party_schema');
 const moment = require('moment-timezone');
 let acmast= require('../models/ac_mast');
 let workmast = require('../models/worksheet_schema');
 let product = require('../models/product_mast_schema');
 let division = require('../models/division_schema');
 let Stock_Unit = require('../models/stock_unit_mast');
 let c_mast= require('../models/country_mast');
 var query;

 router.get('/productlist', function (req, res) {
    product.find({}, function(err, product){
        Stock_Unit.find({}, function(err, Stock_Unit){
        res.json({ 'success': true, 'product': product ,'StockUnit': Stock_Unit });
        })
    })
});
router.get('/com_modal', function(req, res) {
    var vouc_code = req.query.vouc_code;
    promast.find({vouc_code:vouc_code,co_code:req.session.compid,div_code:req.session.divid,}, function (err, promast) {
        if (err)
        {
            console.log(err);
        } 
        else
        {
            res.json({ 'success': true, 'promast': promast}); ///,'party': party
        }
    }) .populate([{path: 'pro_forma_group.item_name',select:'prdt_desc'}]);
    });
var a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
var b = ['Hundred', 'Thousand', 'Lakh', 'Crore'];
var c_0 = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Ninteen'];
var d   = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertNumberToWords(amount) {
    var words = new Array();
    words[0] = '';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    amount = amount.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
            received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                if (n_array[i] == 1) {
                    n_array[j] = 10 + parseInt(n_array[j]);
                    n_array[i] = 0;
                }
            }
        }
        value = "";
        for (var i = 0; i < 9; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                value = n_array[i] * 10;
            } else {
                value = n_array[i];
            }
            if (value != 0) {
                words_string += words[value] + " ";
            }
            if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Crores ";
            }
            if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Lakhs ";
            }
            if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Thousand ";
            }
            if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                words_string += "Hundred and ";
            } else if (i == 6 && value != 0) {
                words_string += "Hundred ";
            }
        }
        words_string = words_string.split("  ").join(" ");
    }
    return words_string;
}
 
router.get('/commercial', ensureAuthenticated, function(req, res){
    promast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"commercial"}, function (err, promast){
        party.find({masterid:req.session.masterid}, function (err, party){
           acmast.find({masterid:req.session.masterid,main_bk:"customer"}, function (err, acmast){
                product.find({masterid:req.session.masterid}, function (err, product){
                    Stock_Unit.find({}, function (err, Stock_Unit){
                        c_mast.find({}, function (err, c_mast){
                    if (err) {
                       console.log(err);
                            } else {
                res.render('commercial_entry.hbs', {
                    pageTitle:'Add commercial Entery',
                    promast: promast,
                    Stock_Unit: Stock_Unit,
                    brand: brand,
                    party: party,
                    acmast:acmast,
                    c_mast:c_mast,
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
            })
         })
        })
      }).populate('ac_city').sort({'ac_name':1})
    })
  }).sort('-vouc_code');
 });
    router.post('/add', async function(req, res){
        if(req.body.pro_cus_name=="") req.body.pro_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var proformadate = req.body.pro_formadt;
        var DateObject =  moment(proformadate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var proformadatemilisecond = DateObject.format('x');

        var pro_podt = req.body.pro_podt;
        var PodDateObject =  moment(pro_podt, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var podtmilisecond = PodDateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            { 
               
             let proforma = new promast();
             proforma.main_bk = "commercial";  
           proforma.pro_no = req.body.pro_no;
           proforma.vouc_code = req.body.vouc_code;
           proforma.pro_formadt =DateObject;
           proforma.pro_formadtmilisecond = proformadatemilisecond;
           proforma.ws_no = req.body.ws_no;
           proforma.pro_podt = PodDateObject;
           proforma.pro_podtmilisecond= podtmilisecond;
           proforma.pro_cus_name = req.body.pro_cus_name;
           proforma.pro_rmks = req.body.pro_rmks;
           proforma.pro_pono = req.body.pro_pono;
           proforma.pro_forma_group = req.body.pro_forma_group;
           proforma.tot_poq = req.body.tot_poq;
           proforma.tot_picbm = req.body.tot_picbm;
           proforma.tot_amt = req.body.tot_amt;
           proforma.pro_remarks = req.body.pro_remarks;
           proforma.totainword = convertNumberToWords(req.body.tot_amt);
           proforma.pre_carriage = req.body.pre_carriage;
           proforma.place_carriage = req.body.place_carriage;
           proforma.country_good = req.body.country_good;
           proforma.country_destination = req.body.country_destination;
           proforma.vessel_flightno = req.body.vessel_flightno;
           proforma.port_landing = req.body.port_landing;
           proforma.port_discharge = req.body.port_discharge;
           proforma.port_delivery = req.body.port_delivery;
           proforma.co_code = req.session.compid;
           proforma.div_code = req.session.divid;
           proforma.usrnm = req.session.user;
           proforma.masterid = req.session.masterid
           proforma.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving term','errors':err});
                    return;
                }
                else
                {
                    // res.json({ 'success': true, 'message': 'Order added succesfully' });
                    res.redirect('/commercial/commercial_list');
      
                }
            });
        }
    }
    });
    router.get('/commercial_list', ensureAuthenticated ,function(req,res){
        promast.find({main_bk:"commercial"}, function (err,promast){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('commercial_list.hbs',{
                    pageTitle:'Commercial List',
                    promast:promast,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).populate('pro_cus_name').populate([{path:'pro_cus_name',populate:{ path:'ac_city'}}]) ;
      });
       router.get('/commercial_update/:id', ensureAuthenticated, function(req, res){
        promast.findById(req.params.id, function (err, promast){
            Stock_Unit.find({}, function (err, Stock_Unit){
                acmast.find({masterid:req.session.masterid,main_bk:"customer"}, function (err, acmast){
                    product.find({masterid:req.session.masterid}, function (err, product){
                        c_mast.find({}, function (err, c_mast){
             if (err) {
                    console.log(err);
                } else {
                   
                    res.render('commercial_update.hbs',{
                        pageTitle:'Update Commercial entry',
                        promast: promast,
                        Stock_Unit: Stock_Unit,
                        brand: brand,
                        party: party,
                        c_mast: c_mast,
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
            })
            })
        }).populate('ac_city').sort({'ac_name':1})
    })
})
  });
  
router.get('/commercial_print/', ensureAuthenticated, function(req, res){
    promast.findById(req.query.id, function (err, promast){
        division.findById(req.query.compid, function (err, division){
            c_mast.find({}, function (err, c_mast){
            if (err) {
                console.log(err);
            } else {
               
                res.render('commercial_print.hbs',{
                    pageTitle:'PROFORMA PRINT',
                    promast: promast,
                    division:division,
                    c_mast:c_mast,
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
        }).populate('bank_name')
        }).populate('pro_cus_name').populate([{path: 'pro_forma_group.comm_unit'}])
        .populate([{path: 'pro_forma_group.item_name'}])
        .populate('country_good') .populate('country_destination')
    })


router.post('/update/:id', function(req, res) {
    if(req.body.pro_cus_name=="") req.body.pro_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var proformadate = req.body.pro_formadt;
        var DateObject =  moment(proformadate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var proformadatemilisecond = DateObject.format('x');

        var pro_podt = req.body.pro_podt;
        var PodDateObject =  moment(pro_podt, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var podtmilisecond = PodDateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        
            { 
        let proforma = {};
        proforma.main_bk = "commercial";  
        proforma.pro_no = req.body.pro_no;
        proforma.vouc_code = req.body.vouc_code;
        proforma.pro_formadt =DateObject;
        proforma.pro_formadtmilisecond = proformadatemilisecond;
        proforma.ws_no = req.body.ws_no;
        proforma.pro_podt = PodDateObject;
        proforma.pro_podtmilisecond= podtmilisecond;
        proforma.pro_cus_name = req.body.pro_cus_name;
        proforma.pro_rmks = req.body.pro_rmks;
        proforma.pro_pono = req.body.pro_pono;
        proforma.pro_forma_group = req.body.pro_forma_group;
        proforma.tot_poq = req.body.tot_poq;
        proforma.tot_picbm = req.body.tot_picbm;
        proforma.tot_amt = req.body.tot_amt;
        proforma.pro_remarks = req.body.pro_remarks;
        proforma.totainword = convertNumberToWords(req.body.tot_amt);
        proforma.pre_carriage = req.body.pre_carriage;
        proforma.place_carriage = req.body.place_carriage;
        proforma.country_good = req.body.country_good;
        proforma.country_destination = req.body.country_destination;
        proforma.vessel_flightno = req.body.vessel_flightno;
        proforma.port_landing = req.body.port_landing;
        proforma.port_discharge = req.body.port_discharge;
        proforma.port_delivery = req.body.port_delivery;
        proforma.tot_picbm = req.body.tot_picbm;
        proforma.tot_picbm = req.body.tot_picbm;
        proforma.co_code =  req.session.compid;
        proforma.div_code =  req.session.divid;
        proforma.usrnm =  req.session.user;
        proforma.masterid =   req.session.masterid;
        let query = {_id:req.params.id}
            promast.update(query ,  proforma ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Proforma', 'errors': err });
                return;
            } else {
                res.redirect('/commercial/commercial_list');
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
    router.delete('/:id', function(req, res){    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
    promast.findById(req.params.id, function(err, promast){
       promast.remove(query, function(err){
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
