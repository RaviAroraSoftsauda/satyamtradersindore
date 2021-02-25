const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let trans_balance = require('../models/trans');
let product = require('../models/rawmatSchema');
let acmast= require('../models/ac_mast');
let workmast = require('../models/worksheet_schema');
var Raw_master = require('../models/rawmatSchema');
var Account_Mast = require('../models/accountSchema');
let db = mongoose.connection;
var debit,credit;
var bal=0;
var toataldebit=0;
var totalcredit=0;
let common = require('./common');


router.get('/Trail_Balance', ensureAuthenticated, function(req, res){
    acmast.find({co_code:req.session.compid,div_code:req.session.divid,masterid:req.session.masterid}, function (err, acmast){
        product.find({masterid:req.session.masterid, del:'N'}, function (err, product){
            workmast.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast){
   if (err) {
       console.log(err);
   } else {
       res.render('Trail_Balance.hbs', {
           pageTitle:'Trail Balance',
           
           acmast: acmast,
           product: product,
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
    })
        })
    }).populate('ac_city')
});
router.get('/Trail_Balance_Group_Wise', ensureAuthenticated, function(req, res){
        acmast.find({co_code:req.session.compid,div_code:req.session.divid,masterid:req.session.masterid}, function (err, acmast){
            product.find({masterid:req.session.masterid, del:'N'}, function (err, product){
                workmast.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast){
       if (err) {
           console.log(err);
       } else {
           res.render('Trail_Balance_Group_Wise.hbs', {
               pageTitle:'Trail Balance[Group Wise]',
               
               acmast: acmast,
               product: product,
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
        })
            })
        }).populate('ac_city')
});
router.get('/Profit_loss', ensureAuthenticated, function(req, res){
            acmast.find({co_code:req.session.compid,div_code:req.session.divid,masterid:req.session.masterid}, function (err, acmast){
                product.find({masterid:req.session.masterid, del:'N'}, function (err, product){
                    workmast.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast){
           if (err) {
               console.log(err);
           } else {
               res.render('Profit_loss.hbs', {
                   pageTitle:'Profit_loss',
                   
                   acmast: acmast,
                   product: product,
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
            })
                })
            }).populate('ac_city')
});
router.get('/Balance_Sheet', ensureAuthenticated, function(req, res){
                acmast.find({co_code:req.session.compid,div_code:req.session.divid,masterid:req.session.masterid}, function (err, acmast){
                    product.find({masterid:req.session.masterid, del:'N'}, function (err, product){
                        workmast.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast){
               if (err) {
                   console.log(err);
               } else {
                   res.render('Balance_Sheet.hbs', {
                       pageTitle:'Balance_Sheet',
                       
                       acmast: acmast,
                       product: product,
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
                })
                    })
                }).populate('ac_city')
});

// Trail Balance Group Wise
router.post('/Trail_Balance_Group_Wise',ensureAuthenticated,async function(req, res){
                let stsummary;
                 var start_date= req.body.start_date;
                  var end_date= req.body.end_date;
                  const Srtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
                  const Enddate = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
                    summary = [];  
                    credit = 0;
                    debit = 0;
                    bal = 0;
                    op_bal = [];
                        
                    let Account = await Account_Mast.find({masterid:req.session.masterid,del:"N"},function (err, Account){ }).populate('GroupName').sort('GroupName')
                    var grpnm = Account[0]['GroupName']['GroupName'];
                    for(let i= 0; i<Account.length; i++){
                        var qry = {};
                        if (Account[i]['GroupName']['GroupName'] == "CASH" || Account[i]['GroupName']['GroupName'] == "BANK")
                        {
                            qry = { "cash_bank_name":Account[i]._id,$and: [{cash_edatemilisecond:{$gte:Srtdate}},{cash_edatemilisecond:{$lte:Enddate}}],co_code: req.session.compid,div_code:req.session.divid,del:'N',CNCL:'N'};
                        }
                        else 
                        {
                            qry = {"cashac_name":Account[i]._id,$and: [{cash_edatemilisecond:{$gte:Srtdate}},{cash_edatemilisecond:{$lte:Enddate}}],co_code: req.session.compid,div_code:req.session.divid,del:'N',CNCL:'N'};
                        }
                        let  trans = await trans_balance.find(qry,function (err, trans){ }).populate("cashac_name").populate("cash_bank_name")
                        if (trans.length>0)
                        {  
                              if(trans != '' && Account[i] != ''){
                                for(let item of trans){
                                    // console.log('r',i,Account[i]['GroupName']['GroupName']);
                                    if (Account[i]['GroupName']['GroupName'] != grpnm)
                                    {
                                        // console.log("oparr",grpnm,i,this.op_bal)
                                        bal = parseFloat(debit-credit);
                                        if (bal !=0)
                                        {
                                          var arr = {'GroupName': grpnm, 'debit': debit,'credit': credit,"bal":bal,'op_bal': this.op_bal};
                                          this.summary.push(arr);
                                        }                                      
                                        grpnm = Account[i]['GroupName']['GroupName']
                                        credit = 0;
                                        debit = 0;
                                        bal = 0;
                                        this.op_bal = [];
                                    }
                                    
                                    let d_c = item.d_c;
                                    // console.log(item.cashac_name.dbcr, item.cashac_name.OpBalance) 
                                    if (Account[i]['GroupName']['GroupName'] == "CASH" || Account[i]['GroupName']['GroupName'] == "BANK")
                                    {
                                        if(d_c == 'D'){
                                            credit = credit + parseFloat(item.cash_amount);                            
                                        }else{
                                            debit = debit + parseFloat(item.cash_amount);
                                        }
                                    }   
                                    else 
                                    {
                                        if(d_c == 'C'){
                                            if(item.Add_Amount_Deduction == '' || item.Add_Amount_Deduction == null || item.Add_Amount_Deduction == undefined)item.Add_Amount_Deduction = 0
                                            credit = credit + parseFloat(item.cash_amount)+parseFloat(item.Add_Amount_Deduction);                            
                                        }else{
                                            if(item.Add_Amount_Deduction == '' || item.Add_Amount_Deduction == null || item.Add_Amount_Deduction == undefined)item.Add_Amount_Deduction = 0
                                            debit = debit + parseFloat(item.cash_amount)+parseFloat(item.Add_Amount_Deduction);
                                        }
                                    }                     
                               }
                            }
                        } 
                    }
                    bal = parseFloat(debit-credit);                        
                    if (bal !=0)
                    {
                      var arr = {'GroupName': grpnm, 'debit': debit,'credit': credit,"bal":bal,'op_bal':this.op_bal};
                      this.summary.push(arr);
                    }
                    for(let x=0; x<this.summary.length; x++){
                        var arr = this.summary[x].op_bal
                        drcr = 0
                        if(arr!="" && arr!=null){
                        drcr = 0
                        for(let y=0; y<arr.length; y++){
                            if(parseFloat(arr[y])<0){
                                drcr = drcr+parseFloat(arr[y])
                            }
                            if(parseFloat(arr[y])>=0){
                                drcr = drcr+parseFloat(arr[y])
                            }
                        }
                        }
                        if(drcr<0)this.summary[x].bal=this.summary[x].bal-drcr
                        if(drcr>=0)this.summary[x].bal=this.summary[x].bal+drcr
                    }
                    res.json({success:'true',summary:this.summary}); 
})
// Balance Sheet
router.post('/Balance_Sheet',ensureAuthenticated,async function(req, res){
                let stsummary;
                 var start_date= req.body.start_date;
                  var end_date= req.body.end_date;
                  const Srtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
                  const Enddate = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
                    summary = [];
                    balance_sheet = [];  
                    credit = 0;
                        debit = 0;
                        bal = 0;
                        op_bal = [];
                        
                    let Account = await Account_Mast.find({masterid:req.session.masterid,del:'N'},function (err, Account){ }).populate('GroupName').sort('GroupName')
                    var grpnm = Account[0]['GroupName']['GroupName'];
                    var grtyp = Account[0]['GroupName']['GroupType'].trim();
                              
                    for(let i= 0; i<Account.length; i++){
                        if ((Account[i]['GroupName']['GroupType'].trim() == "Liabilities") ||  (Account[i]['GroupName']['GroupType'].trim() == "Assets"))
                        {
                            // console.log('grp',Account[i]['GroupName']['GroupName'],Account[i]['GroupName']['GroupName'].trim());
                            var qry = {};
                            if (Account[i]['GroupName']['GroupName'] == "CASH" || Account[i]['GroupName']['GroupName'] == "BANK")
                            {
                                qry = { "cash_bank_name":Account[i]._id,$and: [{cash_edatemilisecond:{$gte:Srtdate}},{cash_edatemilisecond:{$lte:Enddate}}],co_code: req.session.compid,div_code:req.session.divid,del:'N',CNCL:'N'};
                            }
                            else 
                            {
                                qry = {"cashac_name":Account[i]._id,$and: [{cash_edatemilisecond:{$gte:Srtdate}},{cash_edatemilisecond:{$lte:Enddate}}],co_code: req.session.compid,div_code:req.session.divid,del:'N',CNCL:'N'};
                            }
                            let  trans = await trans_balance.find(qry,function (err, trans){ }).populate("cashac_name").populate("cash_bank_name")
                            if (trans.length>0)
                            {
                                if(trans != '' && Account[i] != '')
                                {
                                    for(let item of trans){
                                        
                                        if (Account[i]['GroupName']['GroupName'] != grpnm)
                                        {
                                            bal = parseFloat(debit-credit);
                                        
                                            if (bal !=0)
                                            {
                                            var arr = {'GroupName': grpnm,'GroupType': grtyp, 'debit': debit,'credit': credit,"bal":bal, 'op_bal':this.op_bal};
                                            this.summary.push(arr);
                                            }                                      
                                            grpnm = Account[i]['GroupName']['GroupName']
                                            grtyp = Account[i]['GroupName']['GroupType'].trim()
                                            credit = 0;
                                            debit = 0;
                                            bal = 0;
                                            op_bal = [];
                                        }
            
                                        let d_c = item.d_c;
                                        if (Account[i]['GroupName']['GroupName'] == "CASH" || Account[i]['GroupName']['GroupName'] == "BANK")
                                        {
                                            if(d_c == 'D'){
                                                credit = credit + parseFloat(item.cash_amount);                            
                                            }else{
                                                debit = debit + parseFloat(item.cash_amount);
                                            }
                                        }   
                                        else 
                                        {
                                            if(d_c == 'C'){
                                                if(item.Add_Amount_Deduction == '' || item.Add_Amount_Deduction == null || item.Add_Amount_Deduction == undefined)item.Add_Amount_Deduction = 0
                                                credit = credit + parseFloat(item.cash_amount)+ parseFloat(item.Add_Amount_Deduction);                            
                                            }else{
                                                if(item.Add_Amount_Deduction == '' || item.Add_Amount_Deduction == null || item.Add_Amount_Deduction == undefined)item.Add_Amount_Deduction = 0
                                                debit = debit + parseFloat(item.cash_amount)+ parseFloat(item.Add_Amount_Deduction);
                                            }
                                        }                     
                                    }
                                }
                            } 
                        }
                    }
            
                    if ((grtyp == "Liabilities") ||  (grtyp  == "Assets"))
                    {
                        bal = parseFloat(debit-credit);                        
                        if (bal !=0)
                        {
                        var arr = {'GroupName': grpnm,'GroupType': grtyp, 'debit': debit,'credit': credit,"bal":bal,'op_bal':this.op_bal};
                        this.summary.push(arr);
                        }   
                    }
                    for(let x=0; x<this.summary.length; x++){
                        var arr = this.summary[x].op_bal
                        drcr = 0
                        if(arr!="" && arr!=null){
                        drcr = 0
                        for(let y=0; y<arr.length; y++){
                            if(parseFloat(arr[y])<0){
                                drcr = drcr+parseFloat(arr[y])
                            }
                            if(parseFloat(arr[y])>=0){
                                drcr = drcr+parseFloat(arr[y])
                            }
                        }
                        }
                        if(drcr<0)this.summary[x].bal=this.summary[x].bal-drcr
                        if(drcr>=0)this.summary[x].bal=this.summary[x].bal+drcr
                    }
                    var arrnew ={};
                    for(let x=0; x<this.summary.length; x++){   
                        if(this.summary[x].GroupType == 'Liabilities'){
                            var arr = {'Liabilities': this.summary[x]['GroupName'],'Amount': this.summary[x]['bal'], 'Assets': '.','AmountA':0};
                            this.balance_sheet.push(arr);
                        }  
                    }
                    var y= 0;
                    for(let x=0; x<this.summary.length; x++){            
                        if(this.summary[x].GroupType == 'Assets')
                        {        
                            if (this.balance_sheet[y]==undefined)
                            {
                                if (this.summary[x].GroupType == 'Assets')
                                {
                                    var arr = {'Liabilities': '','Amount': 0, 'Assets': this.summary[x]['GroupName'],'AmountA':this.summary[x]['bal']};
                                    this.balance_sheet.push(arr)
                                }
                            }
                            else 
                            {
                                if (this.balance_sheet[y]['Assets']=="." )
                                {
                                    this.balance_sheet[y]['Assets']=this.summary[x]['GroupName'];
                                    this.balance_sheet[y]['AmountA']=this.summary[x]['bal'];
                                }
                            }
                            y=y+1;       
                        }
                        
                    }
                    res.json({success:'true',summary:this.balance_sheet}); 
})
// Profit & Loss
router.post('/Profit_loss',ensureAuthenticated,async function(req, res){
                let stsummary;
                 var start_date= req.body.start_date;
                  var end_date= req.body.end_date;
                  const Srtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
                  const Enddate = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
                    summary = [];
                    balance_sheet = [];  
                    credit = 0;
                        debit = 0;
                        bal = 0;
                        op_bal = [];
                        
                    let Account = await Account_Mast.find({masterid:req.session.masterid,del:'N'},function (err, Account){ }).populate('GroupName').sort('GroupName')
                    var grpnm = Account[0]['GroupName']['GroupName'];
                    var grtyp = Account[0]['GroupName']['GroupType'].trim();
                              
                    for(let i= 0; i<Account.length; i++){
                        if ((Account[i]['GroupName']['GroupType'].trim() == "Income") ||  (Account[i]['GroupName']['GroupType'].trim() == "Expenditure"))
                        {
                            var qry = {};
                            if (Account[i]['GroupName']['GroupName'] == "CASH" || Account[i]['GroupName']['GroupName'] == "BANK")
                            {
                                qry = { "cash_bank_name":Account[i]._id,$and: [{cash_edatemilisecond:{$gte:Srtdate}},{cash_edatemilisecond:{$lte:Enddate}}],co_code: req.session.compid,div_code:req.session.divid,del:'N',CNCL:'N'};
                            }
                            else 
                            {
                                qry = {"cashac_name":Account[i]._id,$and: [{cash_edatemilisecond:{$gte:Srtdate}},{cash_edatemilisecond:{$lte:Enddate}}],co_code: req.session.compid,div_code:req.session.divid,del:'N',CNCL:'N'};
                            }
                            let  trans = await trans_balance.find(qry,function (err, trans){ }).populate("cashac_name").populate("cash_bank_name")
                            if (trans.length>0)
                            {
                                if(trans != '' && Account[i] != '')
                                {
                                    for(let item of trans){
                                        
                                        if (Account[i]['GroupName']['GroupName'] != grpnm)
                                        {
                                            bal = parseFloat(debit-credit);
                                        
                                            if (bal !=0)
                                            {
                                            var arr = {'GroupName': grpnm,'GroupType': grtyp, 'debit': debit,'credit': credit,"bal":bal,'op_bal':this.op_bal};
                                            this.summary.push(arr);
                                            }                                      
                                            grpnm = Account[i]['GroupName']['GroupName']
                                            grtyp = Account[i]['GroupName']['GroupType'].trim()
                                            credit = 0;
                                            debit = 0;
                                            bal = 0;
                                            this.op_bal = [];
                                        }
            
                                        let d_c = item.d_c;
                                        if (Account[i]['GroupName']['GroupName'] == "CASH" || Account[i]['GroupName']['GroupName'] == "BANK")
                                        {
                                            if(d_c == 'D'){
                                                credit = credit + parseFloat(item.cash_amount);                            
                                            }else{
                                                debit = debit + parseFloat(item.cash_amount);
                                            }
                                        }   
                                        else 
                                        {
                                            if(d_c == 'C'){
                                                if(item.Add_Amount_Deduction == '' || item.Add_Amount_Deduction == null || item.Add_Amount_Deduction == undefined)item.Add_Amount_Deduction = 0
                                                credit = credit + parseFloat(item.cash_amount)+ parseFloat(item.Add_Amount_Deduction);                            
                                            }else{
                                                if(item.Add_Amount_Deduction == '' || item.Add_Amount_Deduction == null || item.Add_Amount_Deduction == undefined)item.Add_Amount_Deduction = 0
                                                debit = debit + parseFloat(item.cash_amount)+ parseFloat(item.Add_Amount_Deduction);
                                            }
                                        }                     
                                    }
                                }
                            } 
                        }
                    }
                    if ((grtyp == "Income") ||  (grtyp  == "Expenditure"))
                    {
                        bal = parseFloat(debit-credit);                        
                        if (bal !=0)
                        {
                        var arr = {'GroupName': grpnm,'GroupType': grtyp, 'debit': debit,'credit': credit,"bal":bal,'op_bal':this.op_bal};
                        this.summary.push(arr);
                        }   
                    }
                    for(let x=0; x<this.summary.length; x++){
                        var arr = this.summary[x].op_bal
                        drcr = 0
                        if(arr!="" && arr!=null){
                        drcr = 0
                        for(let y=0; y<arr.length; y++){
                            if(parseFloat(arr[y])<0){
                                drcr = drcr+parseFloat(arr[y])
                            }
                            if(parseFloat(arr[y])>=0){
                                drcr = drcr+parseFloat(arr[y])
                            }
                        }
                        }
                        if(drcr<0)this.summary[x].bal=this.summary[x].bal-drcr
                        if(drcr>=0)this.summary[x].bal=this.summary[x].bal+drcr
                    }
                    var arrnew ={};
                    for(let x=0; x<this.summary.length; x++){   
                        if(this.summary[x].GroupType == 'Income'){
                            var arr = {'Liabilities': this.summary[x]['GroupName'],'Amount': this.summary[x]['bal'], 'Assets': '.','AmountA':0};
                            this.balance_sheet.push(arr);
                        }  
                    }
                    var y= 0;
                    for(let x=0; x<this.summary.length; x++){            
                        if(this.summary[x].GroupType == 'Expenditure')
                        {        
                            if (this.balance_sheet[y]==undefined)
                            {
                                if (this.summary[x].GroupType == 'Expenditure')
                                {
                                    var arr = {'Liabilities': '','Amount': 0, 'Assets': this.summary[x]['GroupName'],'AmountA':this.summary[x]['bal']};
                                    this.balance_sheet.push(arr)
                                }
                            }
                            else 
                            {
                                if (this.balance_sheet[y]['Assets']=="." )
                                {
                                    this.balance_sheet[y]['Assets']=this.summary[x]['GroupName'];
                                    this.balance_sheet[y]['AmountA']=this.summary[x]['bal'];
                                }
                            }
                            y=y+1;       
                        }
                    }
                    res.json({success:'true',summary:this.balance_sheet}); 
})
// Trail_Balance
router.post('/Trail_Balance',ensureAuthenticated,async function(req, res){
                let stsummary;
                 var start_date= req.body.start_date;
                  var end_date= req.body.end_date;
                  const Srtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
                  const Enddate = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
                    summary = []; 
                    op_bal = 0;
                    let Account = await Account_Mast.find({masterid:req.session.masterid,del:'N'},function (err, Account){ }).populate('GroupName').sort('GroupName');
                    for(let i = 0; i<Account.length; i++){
                    if(Account[i]['GroupName'] == null || Account[i]['GroupName'] == '' || Account[i]['GroupName'] == undefined)flag=1;
                    else{
                            var qry = {};
                            if (Account[i]['GroupName']['GroupName'] == "CASH" || Account[i]['GroupName']['GroupName'] == "BANK")
                            {   
                                qry = { "cash_bank_name":Account[i]._id,$and: [{cash_edatemilisecond:{$gte:Srtdate}},{cash_edatemilisecond:{$lte:Enddate}}],co_code: req.session.compid,div_code:req.session.divid,del:'N',CNCL:'N'};
                            }
                            else 
                            {
                                qry = {"cashac_name":Account[i]._id,$and: [{cash_edatemilisecond:{$gte:Srtdate}},{cash_edatemilisecond:{$lte:Enddate}}],co_code: req.session.compid,div_code:req.session.divid,del:'N',CNCL:'N'};
                            }
                            credit = 0;
                            debit = 0;
                            bal = 0;
                            let  trans = await trans_balance.find(qry,function (err, trans){ }).populate("cashac_name").populate("cash_bank_name");
                            if (trans.length>0)
                            {
                                if(trans != '' && Account[i] != ''){
                                    for(let item of trans){
                                        let d_c = item.d_c;
                                        if (Account[i]['GroupName']['GroupName'] == "CASH" || Account[i]['GroupName']['GroupName'] == "BANK")
                                        {
                                            if(d_c == 'D'){
                                                credit = credit + parseFloat(item.cash_amount);                            
                                            }else{
                                                debit = debit + parseFloat(item.cash_amount);
                                            }
                                        }   
                                        else 
                                        {
                                            if(d_c == 'C'){
                                                // if(item.Amount_Deduction == '' || item.Amount_Deduction == null || item.Amount_Deduction == undefined)item.Amount_Deduction = 0
                                                if(item.Add_Amount_Deduction == '' || item.Add_Amount_Deduction == null || item.Add_Amount_Deduction == undefined)item.Add_Amount_Deduction = 0
                                                credit = credit + parseFloat(item.cash_amount)+parseFloat(item.Add_Amount_Deduction); 
                                                // console.log('credit',Account[i]['ACName'],credit,item.cash_amount,item.Add_Amount_Deduction,item.Amount_Deduction)                           
                                            }else{
                                                // if(item.Amount_Deduction == '' || item.Amount_Deduction == null || item.Amount_Deduction == undefined)item.Amount_Deduction = 0
                                                if(item.Add_Amount_Deduction == '' || item.Add_Amount_Deduction == null || item.Add_Amount_Deduction == undefined)item.Add_Amount_Deduction = 0
                                                debit = debit + parseFloat(item.cash_amount)+parseFloat(item.Add_Amount_Deduction);
                                                // console.log('debit',Account[i]['ACName'],debit,item.cash_amount,item.Add_Amount_Deduction,item.Amount_Deduction)  
                                            }
                                        }
                                    }
                                //   console.log('credit',Account[i]['ACName'],debit,credit)  
                                    bal = parseFloat(debit-credit);
                                    if (bal != 0)
                                    {
                                        if(op_bal<0 && op_bal != NaN){
                                            // console.log("-__",op_bal)
                                            bal += parseFloat(op_bal);
                                        }
                                        if(op_bal>=0 && op_bal != NaN){
                                            // console.log("+__",op_bal)
                                            bal += parseFloat(op_bal);
                                        }
                                        op_bal = 0;
                                        var arr = {'GroupName': Account[i]['GroupName']['GroupName'], 'ACName': Account[i]['ACName'],'debit': debit,'credit': credit,"bal":bal, "op_bal":op_bal};
                                        this.summary.push(arr);
                                    }
                                }
                            }
                        }
                    }
                    // console.log(this.summary+"____Vikas");
                    res.json({success:'true',summary:this.summary}); 
})
  
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/userright/login');
    }
}

module.exports = router;

