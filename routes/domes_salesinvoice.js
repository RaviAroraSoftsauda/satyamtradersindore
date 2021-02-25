const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let dsimast = require('../models/salesorder_schema');
let somast = require('../models/pur_order_Schema');
let brand = require('../models/brand_schema');
let party = require('../models/party_schema');
let partysubbroker = require('../models/party_schema');
 const moment = require('moment-timezone');
 let journalmast = require('../models/trans');
let acmast= require('../models/ac_mast');
let state_master = require('../models/stateSchema');
let city_master = require('../models/citySchema');
let outstanding= require('../models/outstading_schema');
 let product = require('../models/fgSchema');
 let division = require('../models/divSchema');
 var Gs_master = require('../models/gsTableSchema');
 var Account_master = require('../models/accountSchema');
 let addmast = require('../models/addless_mast_schema');
 let lessmast = require('../models/addless_mast_schema');
 let addlessmast= require('../models/addless_mast_schema');

//  let addmast = require('../models/addless_mast_schema');
//  let lessmast = require('../models/addless_mast_schema');
 var query;

router.get('/getadddesc', function (req, res) {
    addmast.find({masterid:req.session.masterid,addlesstype:"+"}, function (err, addmast){
        res.json({ 'success': true, 'addmast': addmast});
    });
});

router.get('/getlessdesc', function (req, res) {
    lessmast.find({masterid:req.session.masterid,addlesstype:"-"}, function (err, lessmast){
            res.json({ 'success': true, 'lessmast': lessmast});
        });
});

 
router.get('/productname', function (req, res) {
    product.find({masterid:req.session.masterid, del:"N"}, function(err, product){
        
        res.json({ 'success': true, 'product': product});
    });
});


router.get('/chackstate/:party', function (req, res) {
    // console.log(req.params.party)
    var div_state = '';
    var party_state = '';
    var dg = '';
    var pg = '';
    Account_master.find({_id:req.params.party, del:"N"}, function(err, party){
        division.find({_id:req.session.divid}, function(err, division){
           
            if(division[0].ac_state == undefined)div_state = '';
            else div_state = division[0].ac_state.StateCode;

            if(party[0].StateName == undefined)party_state = '';
            else party_state = party[0].StateName.StateCode;

            if(division[0].ac_gstin == undefined)dg = '';
            else dg = division[0].ac_gstin.substr(0,2);

            if(party[0].GSTIN == undefined)pg ='';
            else pg = party[0].GSTIN.substr(0,2);

            console.log('ds',div_state,'ps',party_state,'dg',dg,'pg',pg);
            if(div_state == party_state || dg == pg){
                res.json({ 'success': 'true'});
            }else{res.json({ 'success': 'false'})}
        }).populate('ac_state');
    }).populate([{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}]);
});
// populate([{path: 'buy_cus_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])


router.get('/productlist', function (req, res) {
    var prdtnameid =  req.query.prdtnameid;
    product.find({_id:prdtnameid,masterid:req.session.masterid,del:"N"}, function(err, product){
       res.json({ 'success': true, 'product': product});
    });
})

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

router.get('/domes_salesinvoice', ensureAuthenticated, function(req, res){
    dsimast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"SIV",del:"N"}, function (err, dsimast){
        state_master.find({del:"N"}, function (err, state_master){
        city_master.find({del:"N"}, function (err, city_master){
            product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
                addmast.find({masterid:req.session.masterid,addlesstype:"+"}, function (err, addmast){
                    lessmast.find({masterid:req.session.masterid,addlesstype:"-"}, function (err, lessmast){
                Account_master.find({masterid: req.session.masterid, del: 'N'},function (err, account_masters){
                    Gs_master.findOne({group: 'CUSTOMER'},function (err, gs_master){
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
                            var acmast = this.accarry;
                            res.render('domes_salesinvoice.hbs', {
                            pageTitle:'Sales Invoice Entry',
                            dsimast: dsimast,
                            state_master:state_master,
                            city_master:city_master,
                            acmast:acmast,
                            addmast: addmast,
                            lessmast: lessmast,
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
         }).populate('CityName')
        });
        });
        });
        });
    })
    }).sort('-vouc_code');
});

router.post('/add', function(req, res){
    Account_master.findById(req.body.buy_cus_name, function (err, acmastcustumer){
    addlessmast.find({}, function (err,addlessmast){
    division.find({_id:req.session.divid}, function(err, division){
        if(req.body.buy_cus_name=="") req.body.buy_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Ship_party_Name=="") req.body.Ship_party_Name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Ship_party_State=="") req.body.Ship_party_State=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.Ship_party_City=="") req.body.Ship_party_City=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var proformadate = req.body.so_date;
        // console.log(proformadate)
        var DateObject =  moment(proformadate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var proformadatemilisecond = DateObject.format('x');

        var buy_podt = req.body.buy_podt;
        // console.log(buy_podt)
        var PodDateObject =  moment(buy_podt, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var podtmilisecond = PodDateObject.format('x');

        var custumer = '';
        if(acmastcustumer.PartyType == undefined || acmastcustumer.PartyType == null){
            custumer = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        }
        else{
            custumer = acmastcustumer.PartyType.sales_posting_ac;
        }
        console.log(custumer);
        if(errors)
        {
            console.log(errors);
        }
        else{ 
            var dsiSave = false;
            let dsi = new dsimast();
            dsi.main_bk = "SIV";
            dsi.d_c = 'D';
            dsi.c_j_s_p = 'SI';
            dsi.so_no = req.body.so_no;
            dsi.vouc_code = req.body.vouc_code;
            dsi.so_date =DateObject;
            dsi.so_datemilisecond = proformadatemilisecond;
            dsi.ws_no = req.body.ws_no;
            dsi.buy_podt = PodDateObject;
            dsi.buy_podtmilisecond= podtmilisecond;
            dsi.buy_cus_name = req.body.buy_cus_name;

            dsi.Ship_party_Name = req.body.Ship_party_Name;
            dsi.Ship_party = req.body.Ship_party;
            dsi.Ship_party_gst = req.body.Ship_party_gst;
            dsi.Ship_party_add = req.body.Ship_party_add;
            dsi.Ship_party_State = req.body.Ship_party_State;
            dsi.Ship_party_City = req.body.Ship_party_City;

            dsi.buy_rmks = req.body.buy_rmks;
            dsi.buy_pono = req.body.buy_pono;
            dsi.tot_sooq = req.body.tot_sooq;
            dsi.tot_taxvalue = req.body.tot_taxvalue;
            dsi.tot_beforedisamt = req.body.tot_beforedisamt;
            dsi.Vehicle = req.body.Vehicle;
            dsi.Transport = req.body.Transport;
            dsi.tot_amtso = req.body.tot_amtso;
            dsi.so_remarks = req.body.so_remarks;
            dsi.sales_or_group = req.body.sales_or_group;
            if(req.body.grand_total=="0")  dsi.grand_total = req.body.tot_amtso;
            if(req.body.grand_total!=="0")  dsi.grand_total = req.body.grand_total;
            dsi.add_details = req.body.add_details;
            dsi.less_details = req.body.less_details;
            dsi.co_code = req.session.compid;
            dsi.div_code = req.session.divid;
            dsi.usrnm = req.session.user;
            dsi.masterid = req.session.masterid;
            dsi.del = 'N';
            dsi.entrydate = new Date();
            dsimast.find({vouc_code:req.body.vouc_code, main_bk:'SIV',del:'N'},function(err,dsidublicate){
                if(dsidublicate == null || dsidublicate == ''){
                    dsi.save(function (err){
                        if(err)res.json({'success':false,'message':'error in saving domestic sales invoice ','errors':err});
                        else{
                            dsiSave = true;
                        let journal = new journalmast();
                            journal.saleinvoice_id = dsi._id;//trans scema fetech id
                            journal.main_bk = "SB";
                            journal.d_c ="D";
                            journal.vouc_code = req.body.vouc_code;
                            journal.cash_date =DateObject;
                            journal.c_j_s_p = req.body.so_no;
                            journal.cash_edatemilisecond = proformadatemilisecond;
                            journal.cashac_name = req.body.buy_cus_name;
                            journal.cash_bank_name = custumer;
                            journal.cash_narrtwo = 'By Sales';
                            journal.cash_narrone = 'Credit';
                            journal.cash_type = "Sales";
                            journal.del = "N";
                            journal.entrydate = new Date();
                            journal.cash_amount = req.body.grand_total;
                            journal.co_code = req.session.compid;
                            journal.div_code = req.session.divid;
                            journal.usrnm = req.session.user;
                            journal.masterid = req.session.masterid;
                            journal.save();
                            // console.log('journal',journal)

                        var journalamount = new journalmast();
                            journalamount.saleinvoice_id = dsi._id;//trans scema fetech id
                            journalamount.main_bk = "XSB";
                            journalamount.d_c ="C";
                            journalamount.vouc_code = req.body.vouc_code;
                            journalamount.cash_date =DateObject;
                            journalamount.c_j_s_p = req.body.so_no;
                            journalamount.cash_edatemilisecond = proformadatemilisecond;
                            journalamount.cashac_name = custumer;
                            journalamount.cash_bank_name = req.body.buy_cus_name;
                            journalamount.cash_narrone = 'Credit';
                            journalamount.cash_narrtwo = 'By Sales';
                            journalamount.cash_type = "Sales";
                            journalamount.cash_amount = req.body.tot_amtso;
                            journalamount.del = "N";
                            journalamount.entrydate = new Date();
                            journalamount.co_code = req.session.compid;
                            journalamount.div_code = req.session.divid;
                            journalamount.usrnm = req.session.user;
                            journalamount.masterid = req.session.masterid;
                            journalamount.save();
                            // console.log('journalamount',journalamount)
                            // console.log(addlessmast)
                            for (let i = 0; i <req.body.add_details.length; i++)
                            {
                                if(req.body.add_details[i]['particular_add']=="") req.body.add_details[i]['particular_add']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                for(let j=0; j<addlessmast.length; j++){
                                    // console.log(req.body.add_details[i]['particular_add'],addlessmast[j]._id)
                                    if(req.body.add_details[i]['particular_add'] == addlessmast[j]._id){
                                        req.body.add_details[i]['particular_add'],
                                        req.body.add_details[i]['particular_amount']
                                            let journaladd = new journalmast();
                                            journaladd.saleinvoice_id = dsi._id;//trans scema fetech id
                                            journaladd.main_bk = "XSA"+i;
                                            journaladd.d_c ="C";
                                            journaladd.vouc_code = req.body.vouc_code;
                                            journaladd.cash_date =DateObject;
                                            journaladd.c_j_s_p = req.body.so_no;
                                            journaladd.cash_edatemilisecond = proformadatemilisecond;
                                            journaladd.cashac_name = addlessmast[j].sales_posting_ac;
                                            journaladd.cash_bank_name = req.body.buy_cus_name;
                                            journaladd.cash_narrone = 'Credit';
                                            journaladd.cash_narrtwo = addlessmast[j].type_descr;
                                            journaladd.cash_type = "Sales";
                                            journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                            journaladd.del = "N";
                                            journaladd.entrydate = new Date();
                                            journaladd.co_code = req.session.compid;
                                            journaladd.div_code = req.session.divid;
                                            journaladd.usrnm = req.session.user;
                                            journaladd.masterid = req.session.masterid;
                                            journaladd.save();
                                            // console.log('journaladd',journaladd)if(journaladd.cash_amount>0)
                                            console.log('add',req.body.add_details[i]['particular_add'],addlessmast[j].sales_posting_ac)
                                            break;
                                    }
                                }
                            }
                            // less trans entry
                            for (let i = 0; i <req.body.less_details.length; i++)
                            {
                                if(req.body.less_details[i]['particular_less']=="") req.body.less_details[i]['particular_less']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                for(let j=0; j<addlessmast.length; j++){
                                    if(req.body.less_details[i]['particular_less'] == addlessmast[j]._id){
                                        req.body.less_details[i]['particular_less'],
                                        req.body.less_details[i]['particular_amtless']

                                        let journalless = new journalmast();
                                            journalless.saleinvoice_id = dsi._id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                            journalless.main_bk = "XSL"+i;
                                            journalless.d_c ="D";
                                            journalless.vouc_code = req.body.vouc_code;
                                            journalless.cash_date =DateObject;
                                            journalless.c_j_s_p = req.body.so_no;
                                            journalless.cash_edatemilisecond = proformadatemilisecond;
                                            journalless.cashac_name = addlessmast[j].sales_posting_ac;
                                            journalless.cash_bank_name = req.body.buy_cus_name;
                                            journalless.cash_narrone = 'Credit';
                                            journalless.cash_narrtwo = addlessmast[j].type_descr;
                                            journalless.cash_type = "Sales";
                                            journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                            journalless.del = "N";
                                            journalless.entrydate = new Date();
                                            journalless.co_code = req.session.compid;
                                            journalless.div_code = req.session.divid;
                                            journalless.usrnm = req.session.user;
                                            journalless.masterid = req.session.masterid;
                                            // console.log('journalless',journalless)
                                            journalless.save();
                                        console.log('less',req.body.less_details[i]['particular_less'],addlessmast[j].sales_posting_ac);
                                        break;
                                    }
                                }
                            }
                        let out = new outstanding();
                            out.saleinvoice_id = dsi._id; //trans scema fetech id
                            out.main_bk = "SB";
                            out.d_c ="C";
                            out.vouc_code = req.body.vouc_code;
                            out.cash_date =DateObject;
                            out.c_j_s_p = req.body.so_no;
                            out.cash_edatemilisecond = proformadatemilisecond;
                            out.cashac_name = req.body.buy_cus_name;
                            out.cash_bank_name = req.body.buy_cus_name;
                            out.cash_narrtwo = 'By Sales';
                            out.cash_narrone = 'Credit';
                            out.cash_type = "Sales";
                            out.del = "N";
                            out.entrydate = new Date();
                            out.cash_amount = req.body.grand_total;
                            out.outstanding_amount = req.body.grand_total;
                            out.co_code = req.session.compid;
                            out.div_code = req.session.divid;
                            out.usrnm = req.session.user;
                            out.masterid = req.session.masterid;
                            out.save();

                            res.redirect('/domes_salesinvoice/dsi_update/'+dsi._id+'');
                        }
                    })
                }else{
                    dsiSave = false;
                    console.log('error in saving domestic sales invoice');
                    res.send("<script>alert('This Invoice No. Is Already Exist');window.location.href = '/domes_salesinvoice/domes_salesinvoice'</script>");
                }
            })
            // dsimast.find({vouc_code:req.body.vouc_code, main_bk:'SIV',del:'N'},function(err,dsidublicate){
            //     if(dsidublicate == null || dsidublicate == ''){
            //         console.log('success')
            //         dsi.save(function (err){
            //             if(err)res.json({'success':false,'message':'error in saving domestic sales invoice ','errors':err});
            //             else{
            //                 res.redirect('/domes_salesinvoice/dsi_update/'+dsi._id+'');
            //             }
            //         })
            //     }else{
            //         console.log('error in saving domestic sales invoice');
            //         res.send("<script>alert('This Invoice No. Is Already Exist');window.location.href = '/domes_salesinvoice/domes_salesinvoice'</script>");
            //     }
            // })
        }
    });
    });
    }).populate('PartyType');
});

router.get('/dsi_list', ensureAuthenticated ,function(req,res){
        dsimast.find({main_bk:"SIV", del:"N", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid}, function (err,dsimast){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('domes_salesinvoicelist.hbs',{
                    pageTitle:'Sales Invoice List',
                    dsimast:dsimast,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'vouc_code':1}).populate('dsi_cus_name').populate([{path: 'buy_cus_name',populate:{ path: 'CityName'}}]);
});


router.get('/dsi_update/:id', ensureAuthenticated, function(req, res){
            dsimast.findById(req.params.id, function (err, dsimast){   
            state_master.find({del:"N"}, function (err, state_master){
            city_master.find({del:"N"}, function (err, city_master){
            product.find({masterid:req.session.masterid,del:"N"}, function (err, product){
                addmast.find({masterid:req.session.masterid,addlesstype:"+"}, function (err, addmast){
                    lessmast.find({masterid:req.session.masterid,addlesstype:"-"}, function (err, lessmast){
            Account_master.find({masterid: req.session.masterid, del: 'N'},function (err, account_masters){
            Gs_master.findOne({group: 'CUSTOMER'},function (err, gs_master){
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
                        var acmast = this.accarry;
                   
                    res.render('domes_salesinvoiceupdate.hbs',{
                        pageTitle:'Update Sales Invoice',
                        dsimast:dsimast,
                        acmast:acmast,
                        product:product,
                        addmast: addmast,
                        state_master:state_master,
                        city_master:city_master,
                        lessmast: lessmast,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                      
                    })
                }
            });  
            }).populate('CityName');
        })
    })
    })
    })
    })
    }).populate('buy_cus_name').populate('Ship_party_Name').populate('Ship_party_State').populate('Ship_party_City');
       
});
  
router.get('/Ship_Party_data', ensureAuthenticated, function(req, res){
    Account_master.findById(req.query.Ship_Party_id, function (err,Ship_Party){
        if (err) {
            console.log(err);
        } else {
            // console.log(Ship_Party);
            res.json({'success':true,'Ship_Party':Ship_Party})
        }
    });
});      

router.get('/dsi_print/', ensureAuthenticated, function(req, res, next){
        dsimast.findById(req.query.id, function (err,dsimast){
        division.find({_id:req.session.divid},function(err, division){
            // division.findById({_id:req.session.divid},function(err, division){
            if (err) {
                console.log(err);
            } else {
                if (dsimast!=undefined && dsimast.sales_or_group!=undefined)
                {
                    var arr = dsimast.sales_or_group;
                    var length = [];
                    var a=0;
                    // console.log(arr.length);
                    if(arr.length<5){
                        for(let i=0; i<7; i++){
                            if(arr.length<i){
                                length[a] = i;
                                a++;
                            }
                        }
                    }
                    // console.log(division)
                    var div_state = '';
                    var party_state = '';
                    var dg = '';
                    var pg = '';
                    if(division[0].ac_state == undefined)div_state = '';
                    else div_state = division[0].ac_state.StateCode;
        
                    if(dsimast.buy_cus_name.StateName == undefined)party_state = '';
                    else party_state = dsimast.buy_cus_name.StateName.StateCode;
        
                    if(division[0].ac_gstin == undefined)dg = '';
                    else dg = division[0].ac_gstin.substr(0,2);
        
                    if(dsimast.buy_cus_name.GSTIN == undefined)pg ='';
                    else pg = dsimast.buy_cus_name.GSTIN.substr(0,2);
        
                    console.log('ds',div_state,'ps',party_state,'dg',dg,'pg',pg);
                    if(div_state == party_state || dg == pg){
                        for(let i = 0; i<dsimast.sales_or_group.length; i++){
                            dsimast.sales_or_group[i].so_gstrate = (parseFloat(dsimast.sales_or_group[i].so_gstrate)/2).toFixed(2)
                            dsimast.sales_or_group[i].so_taxvalue = (parseFloat(dsimast.sales_or_group[i].so_taxvalue)/2).toFixed(2)
                            console.log(i,parseInt(dsimast.sales_or_group.length)-1)
                        }
                        dsimast.tot_taxvalue = (parseFloat(dsimast.tot_taxvalue)/2).toFixed(2)
                            res.render('dsi_print2.hbs',{
                                pageTitle:'SALES INVOICE PRINT',
                                dsimast: dsimast,
                                division:division[0],
                                compnm:req.session.compnm,
                                length:length,
                                divnm:req.session.divmast,
                                sdate: req.session.compsdate,
                                edate:req.session.compedate,
                                usrnm:req.session.user,
                                security: req.session.security,
                                administrator:req.session.administrator
                            });
                            console.log('state');
                    }else{
                        if(div_state != party_state || dg != pg){
                            res.render('dsi_print.hbs',{
                                pageTitle:'SALES INVOICE PRINT',
                                dsimast: dsimast,
                                division:division[0],
                                compnm:req.session.compnm,
                                length:length,
                                divnm:req.session.divmast,
                                sdate: req.session.compsdate,
                                edate:req.session.compedate,
                                usrnm:req.session.user,
                                security: req.session.security,
                                administrator:req.session.administrator
                            });
                            console.log('other');
                        }
                    }
                }
            }
        // }).populate('bank_name').populate('ac_state')
        }).populate('bank_name').populate('ac_state')
        }).populate([{path: 'buy_cus_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
        // .populate([{path: 'Ship_party',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
        .populate('Ship_party_State')
        .populate('Ship_party_City')
        // .populate([{path: 'sales_or_group.so_disc'}])//,select:'prdt_desc' populate('buy_cus_name')
        .populate([{path: 'sales_or_group.so_disc',model:'fgSchema',populate:{path:'Fg_Unit', model:'skuSchema'}}])//,select:'prdt_desc'
    .populate([{path: 'sales_or_group.so_div'}])//,select:'prdt_desc'
    .populate([{path: 'add_details.particular_add'}])
    .populate([{path: 'less_details.particular_less'}])
})

router.get('/dsi_envolprint/', ensureAuthenticated, function(req, res, next){
    dsimast.findById(req.query.id, function (err,dsimast){
    division.find({_id:req.session.divid},function(err, division){
        // division.findById({_id:req.session.divid},function(err, division){
        if (err) {
            console.log(err);
        }else{
                res.render('dsi_envolapprint.hbs',{
                    pageTitle:'Sales Invoice Envelope Print',
                    dsimast: dsimast,
                    division:division[0],
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
        }
    // }).populate('bank_name').populate('ac_state')
    }).populate('bank_name').populate('ac_state')
    }).populate([{path: 'buy_cus_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
    // .populate([{path: 'Ship_party',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
    .populate('Ship_party_State')
    .populate('Ship_party_City')
    .populate('Ship_party_Name')
    // .populate([{path: 'sales_or_group.so_disc'}])//,select:'prdt_desc' populate('buy_cus_name')
    .populate([{path: 'sales_or_group.so_disc',model:'fgSchema',populate:{path:'Fg_Unit', model:'skuSchema'}}])//,select:'prdt_desc'
.populate([{path: 'sales_or_group.so_div'}])//,select:'prdt_desc'
.populate([{path: 'add_details.particular_add'}])
.populate([{path: 'less_details.particular_less'}])
})

router.post('/update/:id', function(req, res) {
    Account_master.findById(req.body.buy_cus_name, function (err, acmastcustumer){
    addlessmast.find({}, function (err,addlessmast){
    if(req.body.buy_cus_name=="") req.body.buy_cus_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.Ship_party_Name=="") req.body.Ship_party_Name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.Ship_party_State=="") req.body.Ship_party_State=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.Ship_party_City=="") req.body.Ship_party_City=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var proformadate = req.body.sale_invoicedt;
    var proformadate = req.body.so_date;
        var DateObject =  moment(proformadate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var proformadatemilisecond = DateObject.format('x');

        var buy_podt = req.body.buy_podt;
        var PodDateObject =  moment(buy_podt, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var podtmilisecond = PodDateObject.format('x');

        var custumer = '';
        if(acmastcustumer.PartyType == undefined || acmastcustumer.PartyType == null){
            custumer = undefined;
        }
        else{
            custumer = acmastcustumer.PartyType.sales_posting_ac;
        }
        console.log(custumer);
        if(errors)
        {
            console.log(errors);
        }
        else{ 
            let dsi = {};
            dsi.main_bk = "SIV";
            dsi.d_c = 'D';
            dsi.c_j_s_p = 'SI';
            dsi.so_no = req.body.so_no;
            dsi.vouc_code = req.body.vouc_code;
            dsi.so_date =DateObject;
            dsi.so_datemilisecond = proformadatemilisecond;
            dsi.ws_no = req.body.ws_no;
            dsi.buy_podt = PodDateObject;
            dsi.buy_podtmilisecond= podtmilisecond;
            dsi.buy_cus_name = req.body.buy_cus_name;
            dsi.Ship_party_Name = req.body.Ship_party_Name;
            dsi.Ship_party = req.body.Ship_party;
            dsi.Ship_party_gst = req.body.Ship_party_gst;
            dsi.Ship_party_add = req.body.Ship_party_add;
            dsi.Ship_party_State = req.body.Ship_party_State;
            dsi.Ship_party_City = req.body.Ship_party_City;
            dsi.buy_rmks = req.body.buy_rmks;
            dsi.tot_taxvalue = req.body.tot_taxvalue;
            dsi.tot_beforedisamt = req.body.tot_beforedisamt;
            dsi.Vehicle = req.body.Vehicle;
            dsi.Transport = req.body.Transport;
            dsi.buy_pono = req.body.buy_pono;
            dsi.tot_sooq = req.body.tot_sooq;
            dsi.tot_amtso = req.body.tot_amtso;
            dsi.so_remarks = req.body.so_remarks;
            dsi.sales_or_group = req.body.sales_or_group;
            if(req.body.grand_total===" "||req.body.grand_total===0||req.body.grand_total===null)  dsi.grand_total = req.body.tot_amtso;
            if(req.body.grand_total!==" "||req.body.grand_total!==0||req.body.grand_total!==null)  dsi.grand_total = req.body.grand_total;
                
            dsi.add_details = req.body.add_details;
            dsi.less_details = req.body.less_details;
            dsi.co_code = req.session.compid;
            dsi.div_code = req.session.divid;
            dsi.usrnm = req.session.user;
            dsi.masterid = req.session.masterid;
            dsi.del = 'N';
            dsi.update = new Date();
            let query = {_id:req.params.id}
            dsimast.update(query ,dsi ,function (err) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
                }else{
                    let journal = {};
                        journal.saleinvoice_id = req.params.id;//trans scema fetech id(pcd)
                        journal.main_bk = "SB";
                        journal.d_c ="D";
                        journal.vouc_code = req.body.vouc_code;
                        journal.cash_date =DateObject;
                        journal.c_j_s_p = req.body.so_no;
                        journal.cash_edatemilisecond = proformadatemilisecond;
                        journal.cashac_name = req.body.buy_cus_name;
                        journal.cash_bank_name = custumer;
                        journal.cash_narrtwo = 'By Sales';
                        journal.cash_narrone = 'Credit';
                        journal.cash_type = "Sales";
                        journal.cash_amount = req.body.grand_total;
                        journal.del = 'N';
                        journal.update = new Date();                        
                        journal.co_code = req.session.compid;
                        journal.div_code = req.session.divid;
                        journal.usrnm = req.session.user;
                        journal.masterid = req.session.masterid;
                        query = {saleinvoice_id:req.params.id,main_bk:'SB'}
                        journalmast.update(query , journal ,function (err) {
                            if (err) {
                                res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                            } 
                        });

                        var journalamount = {};
                            journalamount.saleinvoice_id = req.params.id;//trans scema fetech id
                            journalamount.main_bk = "XSB";
                            journalamount.d_c ="C";
                            journalamount.vouc_code = req.body.vouc_code;
                            journalamount.cash_date =DateObject;
                            journalamount.c_j_s_p = req.body.so_no;
                            journalamount.cash_edatemilisecond = proformadatemilisecond;
                            journalamount.cashac_name = custumer;
                            journalamount.cash_bank_name = req.body.buy_cus_name;
                            journalamount.cash_narrone = 'Credit';
                            journalamount.cash_narrtwo = 'By Sales';
                            journalamount.cash_type = "Sales";
                            journalamount.cash_amount = req.body.tot_amtso;
                            journalamount.del = "N";
                            journalamount.entrydate = new Date();
                            journalamount.co_code = req.session.compid;
                            journalamount.div_code = req.session.divid;
                            journalamount.usrnm = req.session.user;
                            journalamount.masterid = req.session.masterid;
                            var queryamt = {saleinvoice_id:req.params.id,main_bk:'XSB'}
                            journalmast.update(queryamt , journalamount ,function (err) {
                                if (err) {
                                    res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                                } 
                            });

                            // Add trans entry             
                        // console.log(journaladd_less);
                        for(let i = 0; i <req.body.add_details.length; i++){
                            var bk = "XSA"+i;
                            for(let j=0; j<addlessmast.length; j++){
                                if(req.body.add_details[i]['particular_add'] == addlessmast[j]._id){
                                    // for (let x=0; x<journaladd_less.length; x++){
                                        console.log('addid',req.body.add_details[i]['Add_Id']);
                                        if(req.body.add_details[i]['Add_Id'] != '' && req.body.add_details[i]['Add_Id'] != undefined){
                                            console.log('update',bk);
                                            // req.body.add_details[i]['particular_add']
                                            // req.body.add_details[i]['particular_amount']
                                            let journaladd = {};
                                            journaladd.saleinvoice_id = req.params.id;//trans scema fetech id
                                            journaladd.main_bk = "XSA"+i;
                                            journaladd.d_c ="C";
                                            journaladd.vouc_code = req.body.vouc_code;
                                            journaladd.cash_date =DateObject;
                                            journaladd.c_j_s_p = req.body.so_no;
                                            journaladd.cash_edatemilisecond = proformadatemilisecond;
                                            journaladd.cashac_name = addlessmast[j].sales_posting_ac;
                                            journaladd.cash_bank_name = req.body.buy_cus_name;
                                            journaladd.cash_narrone = 'Credit';
                                            journaladd.cash_narrtwo = addlessmast[j].type_descr;
                                            journaladd.cash_type = "Sales";
                                            journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                            journaladd.del = "N";
                                            journaladd.update = new Date();
                                            journaladd.co_code = req.session.compid;
                                            journaladd.div_code = req.session.divid;
                                            journaladd.usrnm = req.session.user;
                                            journaladd.masterid = req.session.masterid;
                                            var main_bk = 'XSA'+i;
                                            var queryadd = {saleinvoice_id:req.params.id,main_bk:main_bk};
                                            journalmast.update(queryadd, journaladd,function (err) {
                                                if (err) {
                                                    // res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                                                } 
                                            });
                                            break;
                                        }else{
                                        // if(req.body.add_details[i]['Add_Id'] == '' || req.body.add_details[i]['Add_Id'] == undefined){
                                            console.log('save',bk);
                                            let add = new journalmast();
                                            add.saleinvoice_id = req.params.id;//trans scema fetech id
                                            add.main_bk = "XSA"+i;
                                            add.d_c ="C";
                                            add.vouc_code = req.body.vouc_code;
                                            add.cash_date =DateObject;
                                            add.c_j_s_p = req.body.so_no;
                                            add.cash_edatemilisecond = proformadatemilisecond;
                                            add.cashac_name = addlessmast[j].sales_posting_ac;
                                            add.cash_bank_name = req.body.buy_cus_name;
                                            add.cash_narrone = 'Credit';
                                            add.cash_narrtwo = addlessmast[j].type_descr;
                                            add.cash_type = "Sales";
                                            add.cash_amount = req.body.add_details[i]['particular_amount'];
                                            add.del = "N";
                                            add.entrydate = new Date();
                                            add.co_code = req.session.compid;
                                            add.div_code = req.session.divid;
                                            add.usrnm = req.session.user;
                                            add.masterid = req.session.masterid;
                                            add.save();
                                            break;
                                        }
                                }
                            }
                        }
                        // less trans entry
                        // var less_det = dsimast.less_details;
                        for (let i = 0; i <req.body.less_details.length; i++)
                        {
                            for(let j=0; j<addlessmast.length; j++){
                                if(req.body.less_details[i]['particular_less'] == addlessmast[j]._id){
                                    // req.body.less_details[i]['particular_less'],
                                    // req.body.less_details[i]['particular_amtless']
                                    console.log('lessid',req.body.less_details[i]['Less_Id']);
                                    if(req.body.less_details[i]['Less_Id'] != '' || req.body.less_details[i]['Less_Id'] !=undefined){
                                        let less = {};
                                        less.saleinvoice_id = req.params.id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                        less.main_bk = "XSL"+i;
                                        less.d_c ="D";
                                        less.vouc_code = req.body.vouc_code;
                                        less.cash_date =DateObject;
                                        less.c_j_s_p = req.body.so_no;
                                        less.cash_edatemilisecond = proformadatemilisecond;
                                        less.cashac_name = addlessmast[j].sales_posting_ac;
                                        less.cash_bank_name = req.body.buy_cus_name;
                                        less.cash_narrone = 'Credit';
                                        less.cash_narrtwo = addlessmast[j].type_descr;
                                        less.cash_type = "Sales";
                                        less.cash_amount = req.body.less_details[i]['particular_amtless'];
                                        less.del = "N";
                                        less.update = new Date();
                                        less.co_code = req.session.compid;
                                        less.div_code = req.session.divid;
                                        less.usrnm = req.session.user;
                                        less.masterid = req.session.masterid;
                                            var main_bk = 'XSL'+i;
                                            var queryless = {saleinvoice_id:req.params.id,main_bk:main_bk};
                                            console.log(req.body.less_details[i]['particular_amtless'],less.cash_amount,'Update')
                                            journalmast.update(queryless,less,function (err) {
                                                if (err) {
                                                    console.log(err);
                                                    // res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                                                } 
                                            });
                                            break;
                                    }
                                    // console.log('lessid',req.body.less_details[i]['Less_Id']);
                                    if(req.body.less_details[i]['Less_Id'] == '' || req.body.less_details[i]['Less_Id'] ==undefined){
                                        let journalless = new journalmast();
                                        journalless.saleinvoice_id = req.params.id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                        journalless.main_bk = "XSL"+i;
                                        journalless.d_c ="D";
                                        journalless.vouc_code = req.body.vouc_code;
                                        journalless.cash_date =DateObject;
                                        journalless.c_j_s_p = req.body.so_no;
                                        journalless.cash_edatemilisecond = proformadatemilisecond;
                                        journalless.cashac_name = addlessmast[j].sales_posting_ac;
                                        journalless.cash_bank_name = req.body.buy_cus_name;
                                        journalless.cash_narrone = 'Credit';
                                        journalless.cash_narrtwo = addlessmast[j].type_descr;
                                        journalless.cash_type = "Sales";
                                        journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                        journalless.del = "N";
                                        journalless.entrydate = new Date();
                                        journalless.co_code = req.session.compid;
                                        journalless.div_code = req.session.divid;
                                        journalless.usrnm = req.session.user;
                                        journalless.masterid = req.session.masterid;
                                        journalless.save()
                                        console.log(req.body.less_details[i]['particular_amtless'],less.cash_amount,'Save')
                                        break;
                                    }
                                }
                            }
                        }
                        
                        let out = {};
                            out.saleinvoice_id = req.params.id;//trans scema fetech id
                            out.main_bk = "SB";
                            out.d_c ="C";
                            out.vouc_code = req.body.vouc_code;
                            out.cash_date =DateObject;
                            out.c_j_s_p = req.body.so_no;
                            out.cash_edatemilisecond = proformadatemilisecond;
                            out.cashac_name = req.body.buy_cus_name;
                            out.cash_bank_name = req.body.buy_cus_name;
                            out.cash_narrtwo = 'By Sales';
                            out.cash_narrone = 'Credit';
                            out.cash_type = "Sales";
                            out.del = "N";
                            out.entrydate = new Date();
                            out.cash_amount = req.body.grand_total;
                            out.outstanding_amount = req.body.grand_total;
                            out.co_code = req.session.compid;
                            out.div_code = req.session.divid;
                            out.usrnm = req.session.user;
                            out.masterid = req.session.masterid;

                            query = {saleinvoice_id:req.params.id};
                            outstanding.update(query,out ,function(err){
                                if (err) {
                                    res.json({ 'success': false, 'message': 'Error in Saving Domestic Outstanding', 'errors': err });
                                    return;
                                } else {
                                    res.redirect('/domes_salesinvoice/dsi_list');
                                }
                            })
                    }
            })
        }
    });
    }).populate('PartyType');
});

router.get('/salesorder', function(req, res) {
    var party = req.query.party;
    var compobj= new mongoose.Types.ObjectId(req.session.compid);
    var divobj= new mongoose.Types.ObjectId(req.session.divid);
    somast.find({buy_cus_name:party, co_code:compobj, div_code:divobj, main_bk:"SOR",del:"N"}, function (err, somast){
        // dsimast.find({buy_cus_name:party,co_code:req.session.compid,div_code:req.session.divid,main_bk:"SIV",del:"N"}, function (err, dsimast){
        if (err){
                console.log(err);
            } 
            else{
                    array = [];
                    for(let i=0; i<somast.length; i++){
                        var soarr = somast[i].sales_or_group;
                        for(let j=0; j<soarr.length; j++){
                            if(soarr[j].so_qty_blc > 0){
                                var arr = {'_id': somast[i]._id, 'sales_or_group': [soarr[j]]}
                                this.array.push(arr)
                            }
                        }
                    }
                // console.log(this.array);
                res.json({ 'success': true, 'somast': this.array});
            }
        // })
    }).populate([{path: 'sales_or_group.so_fg_disc',select:'Fg_Des'}]);
}); 

router.post('/update_sales_ord', function(req, res) {
    var countsl = req.body.countsl;
    // console.log(countsl)
    var compobj= new mongoose.Types.ObjectId(req.session.compid);
    var divobj= new mongoose.Types.ObjectId(req.session.divid);
    // if(countsl.sales_ord_id !='' || countsl.sales_ord_id!=null){
    somast.findById(countsl.sales_ord_id, function (err, somast){
        if (!somast){
            res.status(404).send("Record Not Found");
        } 
        else{ 
            let arr = somast.sales_or_group;
            // console.log(arr.length)
            for(let j = 0; j<arr.length; j++){
                // console.log(arr[j]._id+"_____"+countsl.sales_ord_grp_id)
                if(arr[j]._id.equals(countsl.sales_ord_grp_id)){
                    // console.log(arr[j].so_qty_blc+"______"+countsl.orqtydsi)
                    arr[j].so_qty_blc = parseInt(arr[j].so_qty_blc) - parseInt(countsl.orqtydsi);
                    arr[j].so_qty_exe += parseInt(countsl.orqtydsi);
                    break;
                }
            }
            somast.save().then(somast => {
                res.json('Update Complite');
              }).catch(err => {
                  res.status(400).send("Unable to update database");
              });
        }
    });
}); 

router.post('/update_salesord2', function(req, res) {
    var si_id = req.body.slin_id;
    var slgrp;
    // console.log(si_id)
    var compobj= new mongoose.Types.ObjectId(req.session.compid);
    var divobj= new mongoose.Types.ObjectId(req.session.divid);
    dsimast.findById(si_id, function (err, dsimast){
    slgrp = dsimast.sales_or_group;
    // console.log(slgrp);
    for(let i=0; i<slgrp.length; i++){
    // console.log(slgrp[i].sales_ord_id)
    if(slgrp[i].sales_ord_id !=undefined){
    somast.findById(slgrp[i].sales_ord_id, function (err, somast){
        if (!somast){
            res.status(404).send("Record Not Found");
        } 
        else{ 
            // console.log(somast)
            let arr = somast.sales_or_group;
            // console.log(arr.length)
            for(let j = 0; j<arr.length; j++){
                // console.log(arr[j]._id+"_____"+countsl.sales_ord_grp_id)
                if(arr[j]._id.equals(slgrp[i].sales_ord_grp_id)){
                    // console.log(arr[j].so_qty_blc+"______"+countsl.orqtydsi)3+
                    arr[j].so_qty_blc = parseInt(arr[j].so_qty_blc) + parseInt(slgrp[i].so_qty);
                    arr[j].so_qty_exe = parseInt(arr[j].so_qty_exe)-parseInt(slgrp[i].so_qty);
                }
            }
            somast.save().then(somast => {
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
    //   let query = {_id:req.params.id}
      if(!req.user._id){
        res.status(500).send();
      }else{
      let query = {_id:req.params.id}
      let saleorder = {};
        saleorder.del = 'Y';
        saleorder.delete = new Date();
        dsimast.update(query,saleorder, function(err,somast){
            if(err){
              console.log(err);
            }
            var trans = {};
            trans.del = 'Y';
            trans.delete = new Date();
            querytrans = {saleinvoice_id:req.params.id};
            journalmast.updateMany(querytrans,trans,function(err,trans){
                if(err)res.json({'success': "false"});
                else res.json({'success': "true"});
            });
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









// dsimast.findById(req.params.id, function(err, dsimast){
//     journalmast.find({_ID:req.params.id}, function (err, journ){
//         outstanding.find({_ID:req.params.id}, function (err, outst){
//    dsimast.remove(query, function(err){
//         if(err){
//           console.log(err);

//         }
//         query = {_ID:req.params.id}
//         journalmast.remove(query, function(err){
//             if(err){
//               console.log(err);

//             }
//             query = {_ID:req.params.id}
//             outstanding.remove(query, function(err){
//             if(err){
//               console.log(err);

//             }
//           })
//           })
//        res.send('Success');
//       })
//   })
// })
// })