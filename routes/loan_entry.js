const express = require('express');
const router = express.Router(); 
let brand = require('../models/brand_schema');
let cashmast = require('../models/trans');
const moment = require('moment-timezone');
let bank = require('../models/bank_schema');
let accname = require('../models/accountSchema');
// let multaccname = require('../models/account_mast');
var query;



router.post('/accgroup', function (req, res) {
    accname.find({masterid:req.session.masterid},function(err, accnametyp){
        res.json({ 'success': true, 'accnametyp': accnametyp });
    }).populate('ac_groupname')
});

router.get('/cashbankname', function (req, res) {
    var qry = req.query.term.term;
    accname.find({'ACName': new RegExp(qry),masterid:req.session.masterid},function(err, accnametyp){
        var data = new Array();
        for (var j = 0; j < accnametyp.length; j++) {
            if (accnametyp[j]['GroupName'] != null) goupnm = accnametyp[j]['GroupName']['GroupName'];
            else goupnm = "";
            if(goupnm=="CASH" || goupnm=="BANK")
            {
                data[j] = {
                            "id": accnametyp[j]._id,
                            "text" : accnametyp[j].ACName
                        };
            }
            else{
                data[j] = {
                            "id": '',
                            "text" : ''
                          };
            }
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    }).populate('GroupName')
});

router.get('/accountname', function (req, res) {
    var qry = req.query.term.term;
    accname.find({'ACName': new RegExp(qry),masterid:req.session.masterid},function(err, accnametyp){
        var data = new Array();
        for (var j = 0; j < accnametyp.length; j++) {
            if (accnametyp[j]['GroupName'] != null) goupnm = accnametyp[j]['GroupName']['GroupName'];
            else goupnm = "";
            if(goupnm=="CASH" || goupnm=="BANK")
            {
                data[j] = {
                    "id":'',
                    "text" : ''
                    };
            }
            else
            {
                data[j] = {
                    "id": accnametyp[j]._id,
                    "text" : accnametyp[j].ACName
                    };
            }
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    }).populate('GroupName')
});

router.get('/loan_entry', ensureAuthenticated, function(req, res){
    cashmast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:'LoanEntry',del:"N"}, function (err,cashmast){
        if (err) {
            console.log(err);
                    } else {
        res.render('loan_entry.hbs', {
            pageTitle:'Loan Entry',
            cashmast:cashmast,
            compnm:req.session.compnm,
            divnm:req.session.divmast,
            sdate: req.session.compsdate,
            edate:req.session.compedate,
            usrnm:req.session.user,
            security: req.session.security,
            administrator:req.session.administrator
        });
    }
   }).sort('-vouc_code');
});


router.post('/add', async function(req, res){
    if(req.body.cash_bank_name=="") req.body.cash_bank_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.cashac_name=="") req.body.cashac_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
 
    let errors = req.validationErrors();
    var cash_edate = req.body.cash_edate;
    var DateObject =  moment(cash_edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var sodatemilisecond = DateObject.format('x');

    if(errors)
    {
        console.log(errors);
    }
    else
    {
            let cash_bank = new cashmast();
            cash_bank.main_bk = "LoanEntry";
            if(req.body.cash_type=="RECEIPT") cash_bank.d_c ="C";
            else cash_bank.d_c ="D";
            cash_bank.c_j_s_p = req.body.cashtypebank;
            cash_bank.vouc_code = req.body.vouc_code;
            cash_bank.cash_eno = req.body.cash_eno;
            cash_bank.vouc_code = req.body.vouc_code;
            cash_bank.cash_date =DateObject;
            cash_bank.cash_edatemilisecond = sodatemilisecond;
            cash_bank.cash_type = req.body.cash_type;
            cash_bank.cash_bank_name = req.body.cash_bank_name;  
            
            cash_bank.clearing_date = req.body.clearing_date;
            cash_bank.broker_code = req.body.broker_code;
            cash_bank.through = req.body.through;
            cash_bank.loan_period = req.body.loan_period;
            cash_bank.loan_term = req.body.loan_term;
            cash_bank.fixed = req.body.fixed;
            cash_bank.open = req.body.open;
            cash_bank.interest_rate = req.body.interest_rate;
            cash_bank.bank_commission = req.body.bank_commission;
            cash_bank.merge_amount = req.body.merge_amount;
            cash_bank.cheque_no = req.body.cheque_no;
            cash_bank.utr_no = req.body.utr_no;
            cash_bank.drawee_bank = req.body.drawee_bank;  

            cash_bank.del  = "N";
            cash_bank.CNCL = "N";
            cash_bank.entrydate = new Date();

            cash_bank.cashac_name = req.body.cashac_name;
            cash_bank.cash_chequeno = req.body.cash_chequeno;
            cash_bank.cash_chequedate = req.body.cash_chequedate;
            cash_bank.cash_amount = req.body.cash_amount;
            cash_bank.cash_narrone = req.body.cash_narrone;
            cash_bank.cash_narrtwo = req.body.cash_narrtwo;
    
            cash_bank.totcash_amt = req.body.totcash_amt;
            cash_bank.cash_remarks = req.body.cash_remarks;
            // cash_bank.cash_bank_group = req.body.cash_bank_group;
            cash_bank.co_code = req.session.compid;
            cash_bank.div_code = req.session.divid;
            cash_bank.usrnm = req.session.user;
            cash_bank.masterid = req.session.masterid
            cash_bank.save(function (err){
                if(err)console.log(err);
                else {console.log('Loan Succrss')}
            });

    
    res.redirect('/loan_entry/loan_entry');
}
});

router.get('/loan_entry_list', ensureAuthenticated ,function(req,res){
    cashmast.find({masterid:req.session.masterid,div_code:req.session.divid,co_code:req.session.compid,del:'N',main_bk:"LoanEntry"}, function (err, cashmast){
            
        if(err)
        {
            console.log(err);
        }
        else
        {
            // console.log(cashmast);
            res.render('loan_entry_list.hbs',{
                pageTitle:'Loan List',
                cashmast: cashmast,
                accname:accname,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            
                // console.log(cashmast);
            });
        }
    }).populate('broker_code').populate('cashac_name').populate('cash_bank_name')
    
});

router.get('/loanentry_update/:id', ensureAuthenticated, function(req, res){
     cashmast.findById(req.params.id, function (err,cashmast){
         console.log(req.params.id);
                   if (err) {
                console.log(err);
            } else {
               
                res.render('loan_entry_update.hbs',{
                    pageTitle:'Update Loan Entry',
                     cashmast:cashmast,
                     compnm:req.session.compnm,
                     divnm:req.session.divmast,
                     sdate: req.session.compsdate,
                     edate:req.session.compedate,
                     usrnm:req.session.user,
                     security: req.session.security,
                     administrator:req.session.administrator
                   
                });
            }
    }).populate('cash_bank_name').populate('cashac_name').populate('broker_code')

});

router.post('/update/:id', function(req, res) {
if(req.body.cash_bank_name=="") req.body.cash_bank_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
if(req.body.cashac_name=="") req.body.cashac_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
let errors = req.validationErrors();
var cash_edate = req.body.cash_edate;
var DateObject =  moment(cash_edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
var sodatemilisecond = DateObject.format('x');

    if(errors)
    {
        console.log(errors);
    }
    else
         { 
        let srno =0;
       
        let cash_bank = {};
        // cash_bank.srno = i;
        cash_bank.main_bk = "LoanEntry";
        if(req.body.cash_type=="RECEIPT")cash_bank.d_c ="C";
        else cash_bank.d_c ="D";
        cash_bank.c_j_s_p = req.body.cashtypebank;
        cash_bank.cash_eno = req.body.cash_eno;
        cash_bank.vouc_code = req.body.vouc_code;
        cash_bank.cash_date =DateObject;
        cash_bank.cash_edatemilisecond = sodatemilisecond;
        cash_bank.cash_type = req.body.cash_type;
        cash_bank.cash_bank_name = req.body.cash_bank_name;
        cash_bank.totcash_amt = req.body.totcash_amt;
        cash_bank.cash_remarks = req.body.cash_remarks;

        cash_bank.clearing_date = req.body.clearing_date;
        cash_bank.broker_code = req.body.broker_code;
        cash_bank.through = req.body.through;
        cash_bank.loan_period = req.body.loan_period;
        cash_bank.loan_term = req.body.loan_term;
        cash_bank.fixed = req.body.fixed;
        cash_bank.open = req.body.open;
        cash_bank.interest_rate = req.body.interest_rate;
        cash_bank.bank_commission = req.body.bank_commission;
        cash_bank.merge_amount = req.body.merge_amount;
        cash_bank.cheque_no = req.body.cheque_no;
        cash_bank.utr_no = req.body.utr_no;
        cash_bank.drawee_bank = req.body.drawee_bank;  

        // cash_bank.cash_bank_group = req.body.cash_bank_group;
        cash_bank.cashac_name = req.body.cashac_name;
        cash_bank.cash_chequeno = req.body.cash_chequeno;
        cash_bank.cash_chequedate = req.body.cash_chequedate;
        cash_bank.cash_amount = req.body.cash_amount;
        cash_bank.cash_narrone = req.body.cash_narrone;
        cash_bank.cash_narrtwo = req.body.cash_narrtwo;

        cash_bank.del  = "N";
        cash_bank.CNCL = "N";
        cash_bank.entrydate = new Date();

        cash_bank.co_code = req.session.compid;
        cash_bank.div_code = req.session.divid;
        cash_bank.usrnm = req.session.user;
        cash_bank.masterid = req.session.masterid;
        // let query = {_id:req.body.maincashid}
        // console.log(query);
        if(req.body.maincashid==null)
        {
            let cash_bank = new cashmast();
            // cash_bank.srno = i;
            cash_bank.main_bk = "LoanEntry";
            if(req.body.cash_type=="RECEIPT")cash_bank.d_c ="C";
            else cash_bank.d_c ="D";
            cash_bank.c_j_s_p = req.body.cashtypebank;
            cash_bank.cash_eno = req.body.cash_eno;
            cash_bank.vouc_code = req.body.vouc_code;
            cash_bank.cash_date =DateObject;
            cash_bank.cash_edatemilisecond = sodatemilisecond;
            cash_bank.cash_type = req.body.cash_type;
            cash_bank.cash_bank_name = req.body.cash_bank_name;
            cash_bank.totcash_amt = req.body.totcash_amt;
            cash_bank.cash_remarks = req.body.cash_remarks;

            cash_bank.clearing_date = req.body.clearing_date;
            cash_bank.broker_code = req.body.broker_code;
            cash_bank.through = req.body.through;
            cash_bank.loan_period = req.body.loan_period;
            cash_bank.loan_term = req.body.loan_term;
            cash_bank.fixed = req.body.fixed;
            cash_bank.open = req.body.open;
            cash_bank.interest_rate = req.body.interest_rate;
            cash_bank.bank_commission = req.body.bank_commission;
            cash_bank.merge_amount = req.body.merge_amount;
            cash_bank.cheque_no = req.body.cheque_no;
            cash_bank.utr_no = req.body.utr_no;
            cash_bank.drawee_bank = req.body.drawee_bank; 
            // cash_bank.cash_bank_group = req.body.cash_bank_group;
            cash_bank.cashac_name = req.body.cashac_name;
            cash_bank.cash_chequeno = req.body.cash_chequeno;
            cash_bank.cash_chequedate = req.body.cash_chequedate;
            cash_bank.cash_amount = req.body.cash_amount;
            cash_bank.cash_narrone = req.body.cash_narrone;
            cash_bank.cash_narrtwo = req.body.cash_narrtwo;
    
            cash_bank.co_code = req.session.compid;
            cash_bank.div_code = req.session.divid;
            cash_bank.usrnm = req.session.user;
            cash_bank.masterid = req.session.masterid;  
            // cash_bank.save();
            console.log(cash_bank);
            let query = {_id:req.params.id}
            //  console.log(raw);
            cashmast.update(query , cash_bank,function (err) {
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating Loan Entry', errors: err });
                } else {
                    res.json({'success':true});
                }
            });
        }
       

// res.redirect('/loan_entry/loan_entry_list');
}
});
router.delete('/:id', function(req, res){ 
  let query = {_id:req.params.id}
cashmast.findById(req.params.id, function(err,cashmast){
  cashmast.remove(query, function(err,cashmast){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
  });
});
router.get('/loanentry_delete', function(req, res){
    var vouc_code = req.query.vouc_code
    var cjsp = req.query.cjsp
    var mainbk =  req.query.mainbk;
    let query = {vouc_code:vouc_code,main_bk:"CB",c_j_s_p:cjsp}
    let query2 = {vouc_code:vouc_code,main_bk:"CB1",c_j_s_p:cjsp}
    // cashmast.findById(req.params.id, function(err, cashmast){
        cashmast.remove(query2,function(err){
        });
        cashmast.remove(query,function(err){
            if(err)
            {
                console.log(err);
            }
            // res.send('Success');
            res.redirect('/loan_entry/loan_entry_list');
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