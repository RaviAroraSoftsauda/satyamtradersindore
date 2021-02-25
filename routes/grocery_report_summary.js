const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let ledger = require('../models/trans');
let acmast= require('../models/accountSchema');
let daily_grocery_entry = require('../models/daily_grocery_entry_Schema');
let toli_master = require('../models/toli_Schema');
let db = mongoose.connection;
let common = require('./common');
// Add Routesales_order_summary

router.get('/grocery_report_summary', ensureAuthenticated, function(req, res){
    daily_grocery_entry.find({masterid:req.session.masterid,del:'N'}, function (err,daily_grocery_entry){
        toli_master.find({masterid:req.session.masterid,del:'N'}, function (err,toli_master){
   if (err) {
       console.log(err);
   } else {
       res.render('grocery_report_summary.hbs', {
           pageTitle:'Grocery Report Summary',
           daily_grocery_entry: daily_grocery_entry,
           toli_master:toli_master,
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
}).populate('natureOfWork');
})



router.post('/cashladgerdetails', ensureAuthenticated, async function(req, res){
    var start_date = req.body.start_date;
     var end_date = req.body.end_date;
     var  buy_cus_name = req.body.buy_cus_name;
     var  accname = req.body.accname;
         cash_ladger = [];
         acnm='';
         debitamt = 0;
         crditamt = 0;
         milsec = 0;
         op_bal = 0.00;
         Balance = 0.00;
         const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
         const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
         var qry = "";
         if(accname == "CASH" || accname == "BANK")
         {
            if (buy_cus_name=="") qry = {cash_edatemilisecond:{$lte:enddats},co_code:req.session.compid,div_code:req.session.divid,del:"N"};
            if (buy_cus_name!="") qry = {cash_edatemilisecond:{$lte:enddats},cash_bank_name:buy_cus_name,co_code:req.session.compid,div_code:req.session.divid,del:"N"};
         }
         else 
         {
            if (buy_cus_name=="") qry = {cash_edatemilisecond:{$lte:enddats},co_code:req.session.compid,div_code:req.session.divid,del:"N"};
            if (buy_cus_name!="") qry = {cash_edatemilisecond:{$lte:enddats},cashac_name:buy_cus_name,co_code:req.session.compid,div_code:req.session.divid,del:"N"};
         }
         let trans =  await ledger.find(qry,async function (err, ledger) {}).sort({'cash_edatemilisecond':1}).populate('cash_bank_name').populate('cashac_name'); 
         if(trans != '' && trans.length>0){
         
        if(accname == "CASH" || accname == "BANK"){
           if(trans[0]['cash_bank_name']['OpBalance'] != ''){
           if(trans[0]['cash_bank_name']['dbcr'] == 'Debit'){
               Balance = parseFloat(trans[0]['cash_bank_name']['OpBalance'])
               op_bal =   parseFloat(trans[0]['cash_bank_name']['OpBalance'])
            }
            if(trans[0]['cash_bank_name']['dbcr'] == 'Credit'){
               Balance =  parseFloat(trans[0]['cash_bank_name']['OpBalance'])*-1
               op_bal =  parseFloat(trans[0]['cash_bank_name']['OpBalance'])*-1
            }
           }
        }else{
           if(trans[0]['cashac_name']['OpBalance'] != ''){ 
           if(trans[0]['cashac_name']['dbcr'] == 'Debit'){
               Balance =  parseFloat(trans[0]['cashac_name']['OpBalance'])
               op_bal =  parseFloat(trans[0]['cashac_name']['OpBalance'])
            }
            if(trans[0]['cashac_name']['dbcr'] == 'Credit'){
               Balance =  parseFloat(trans[0]['cashac_name']['OpBalance'])*-1
               op_bal =  parseFloat(trans[0]['cashac_name']['OpBalance'])*-1
            }
           }
        }
        console.log('bef',Balance,op_bal);
        if(isNaN(Balance) || Balance == '')Balance=0;
        if(isNaN(op_bal) || op_bal == '')op_bal=0;
         console.log('aft',Balance,op_bal);
        for (let i = 0; i < trans.length; i++)
         {
             var date = trans[i]['cash_date'];
             var filterstartdate = moment(date).tz("Asia/Kolkata").format('DD/MM/YYYY');
                
                milsec = trans[i].cash_edatemilisecond;
                trans[i]['cash_narrone']; trans[i]['cash_narrtwo'];

                 if(accname == "CASH" || accname == "BANK")
                 {   
                    acnm = trans[i]['cashac_name'].ACName 
                    // console.log('cv',acnm, accname)
                 }
                 else
                 {
                    if(trans[i]['c_j_s_p'] == 'CV'|| trans[i]['c_j_s_p'] == 'SI'){
                        // console.log(trans[i]['cash_bank_name']);
                        acnm = trans[i]['cash_bank_name'].ACName
                    }else{
                        acnm = trans[i]['cashac_name'].ACName
                    }
                 }

                 if(accname=="CASH" || accname=="BANK")
                 {
                     if(trans[i]['d_c']=="C")
                     {
                        //  console.log(i,trans[i]['cash_amount'])
                         if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        Balance = Balance +  parseFloat(trans[i]['cash_amount'])
                         var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':trans[i]['cash_amount'], 'credit': 0, 'Balance': Balance.toFixed(2), 'milsec': milsec}
                         this.cash_ladger.push(arr);
                        //  console.log(this.cash_ladger)
                     }
                    
                     if(trans[i]['d_c']=="D")
                     {
                        // console.log(i,trans[i]['cash_amount'])
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                         Balance = Balance -  parseFloat(trans[i]['cash_amount'])
                         var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':0, 'credit': trans[i]['cash_amount'], 'Balance': Balance.toFixed(2), 'milsec': milsec}
                         this.cash_ladger.push(arr);
                        //  console.log(this.cash_ladger)
                     }
                 }
                 else 
                 {
                     if(trans[i]['d_c'] == "D")
                     {   
                        // console.log(i,trans[i]['cash_amount'])
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        Balance=Balance+ parseFloat(trans[i]['cash_amount'])
                         var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':trans[i]['cash_amount'], 'credit': 0, 'Balance': Balance.toFixed(2), 'milsec': milsec}
                         this.cash_ladger.push(arr);
                        //  console.log(this.cash_ladger)
                     }
                     if(trans[i]['d_c'] == "C")
                     {
                        // console.log(i,trans[i]['cash_amount'])
                        if(trans[i]['cash_amount'] == '' || trans[i]['cash_amount'] == null)trans[i]['cash_amount'] = 0
                        Balance=Balance - parseFloat(trans[i]['cash_amount'])
                         var arr = {'cjsp': trans[i]['c_j_s_p'], 'Date': filterstartdate, 'vouc_code': trans[i]['vouc_code'], 'Narration1': trans[i]['cash_narrone'], 'Narration2': trans[i]['cash_narrtwo'], 'ACNAme': acnm, 'debit':0, 'credit': trans[i]['cash_amount'], 'Balance': Balance.toFixed(2), 'milsec': milsec}
                         this.cash_ladger.push(arr);
                        //  console.log(this.cash_ladger)
                     }
                 }
                
         }
         }
         console.log("clad",this.cash_ladger)
         fin_op = 0;
         count = 0;
         finel_ladger = [];
         if((this.cash_ladger != '' || this.cash_ladger != null) && this.cash_ladger.length > 0){
            // console.log(strtdate+"___"+enddats)
            // console.log(this.cash_ladger+"__Vikas")
            for(let j = 0; j<this.cash_ladger.length; j++){
                // console.log(this.cash_ladger[j].milsec)
                if(strtdate <= this.cash_ladger[j].milsec &&  enddats>= this.cash_ladger[j].milsec){
                    count++;
                    if(j == 0)fin_op = op_bal;
                    if(j > 0 && count == 1)fin_op = this.cash_ladger[j-1]['Balance'];
                    this.finel_ladger.push(this.cash_ladger[j]);
                }
            }
            // console.log("vikas",this.finel_ladger.length)
        }
         res.json({ 'success': true, 'ledger':this.finel_ladger, "op_bal": fin_op});
})
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