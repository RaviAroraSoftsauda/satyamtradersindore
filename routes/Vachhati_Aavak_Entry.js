const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
// let GaruAavak = require('../models/Garu_Aavak_Schema');
let VachhatiAavak = require('../models/Vachhati_Aavak_Schema');
let somast = require('../models/pur_order_Schema');
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
let addlessmast = require('../models/addless_mast_schema');
let gowdown = require('../models/gowdawnCodeSchema');


//  let addmast = require('../models/addless_mast_schema');
//  let lessmast = require('../models/addless_mast_schema');

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
        gowdown.find({masterid:req.session.masterid, del:"N"}, function (err, gowdown){ 
            Account_master.find({masterid: req.session.masterid, del: 'N'},function (err, account_masters){  
                res.json({ 'success': true, 'product': product,'gowdown':gowdown,'account_masters':account_masters});
            });
        });
    });
});
router.get('/party', function (req, res) {
    Account_master.findOne({_id:req.query.party,masterid: req.session.masterid, del: 'N'},function (err, account_masters){  
        res.json({ 'success': true,'account_masters':account_masters});
    });
});

router.get('/chackstate/:party', function (req, res) {
    // console.log(req.params.party)
    var div_state = '';
    var party_state = '';
    var dg = '';
    var pg = '';
    Account_master.find({_id:req.params.party, del:"N"}, function(err, party){
        division.findById(req.session.divid, function(err, division){
        //    console.log(division);
            if(division.ac_state == undefined)div_state = '';
            else div_state = division.ac_state.StateCode;

            if(party.StateName == undefined)party_state = '';
            else party_state = party.StateName.StateCode;

            if(division.ac_gstin == undefined)dg = '';
            else dg = division.ac_gstin.substr(0,2);

            if(party.GSTIN == undefined)pg ='';
            else pg = party.GSTIN.substr(0,2);

            console.log('ds',div_state,'ps',party_state,'dg',dg,'pg',pg);
            if(div_state == party_state || dg == pg){
                res.json({ 'success': 'true'});
            }else{res.json({ 'success': 'false'})}
        }).populate('ac_state');
    }).populate([{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}]);
});

router.get('/brparty', function (req, res) {
    Gs_master.findOne({group: 'SUPPLIER'},function (err, gs_master){
    console.log(gs_master.garry)
    var qry = req.query.term.term;
    Account_master.find({$or: [{ 'ACName': { $regex: new RegExp("^"+qry,"i")}},{'ACCode':{ $regex: new RegExp("^"+qry,"i")}}],del:'N',masterid:req.session.masterid},'ACName',  function(err, party){
        var data = new Array();
        if(party!=undefined){
            for (var j = 0; j < party.length; j++) {
                if (party[j]['CityName'] != null) cityname = party[j]['CityName']['CityName'];
                else cityname = "";
                data[j] = {
                    "id": party[j]._id,
                    "text" : party[j].ACName + ','+ cityname
                };
            }
            res.json({'results':  data, "pagination": {
                        "more": false
                    } });
        }
    }).sort({'ACName':1}).populate('CityName');
})
});

router.get('/broker_Code', function (req, res) {
    Gs_master.findOne({group: 'BROKER'},function (err, gs_master){
    console.log(gs_master.garry)
    var qry = req.query.term.term;
    Account_master.find({$or: [{ 'ACName': { $regex: new RegExp("^"+qry,"i")}},{'ACCode':{ $regex: new RegExp("^"+qry,"i")}}],del:'N',masterid:req.session.masterid},'ACName',  function(err, party){
        var data = new Array();
        if(party!=undefined){
            for (var j = 0; j < party.length; j++) {
                if (party[j]['CityName'] != null) cityname = party[j]['CityName']['CityName'];
                else cityname = "";
                data[j] = {
                    "id": party[j]._id,
                    "text" : party[j].ACName + ','+ cityname
                    };
            }
            res.json({'results':  data, "pagination": {
                        "more": false
                    } });
        }
    }).sort({'ACName':1}).populate('CityName');
})
});

router.get('/sl_Person', function (req, res) {
    Gs_master.findOne({group: 'SALE PERSON'},function (err, gs_master){
    var qry = req.query.term.term;
    Account_master.find({$or: [{ 'ACName': { $regex: new RegExp("^"+qry,"i")}},{'ACCode':{ $regex: new RegExp("^"+qry,"i")}}],del:'N',masterid:req.session.masterid},'ACName',  function(err, party){
        var data = new Array();
        if(party!=undefined){
            for (var j = 0; j < party.length; j++) {
                if (party[j]['CityName'] != null) cityname = party[j]['CityName']['CityName'];
                else cityname = "";
                data[j] = {
                    "id": party[j]._id,
                    "text" : party[j].ACName + ','+ cityname
                    };
            }
            res.json({'results':  data, "pagination": {
                        "more": false
                    } });
        }
    }).sort({'ACName':1}).populate('CityName');
})
});

router.get('/productlist', function (req, res) {
    var item =  req.query.item;
    product.find({_id:item,masterid:req.session.masterid,del:"N"}, function(err, product){
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

router.get('/Vachhati_Aavak_Entry_Add', ensureAuthenticated, function(req, res){
    gowdown.find({masterid:req.session.masterid, del:"N"}, function (err, gowdown){
        VachhatiAavak.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"GAE",del:"N"}, function (err, VachhatiAavak){
        state_master.find({del:"N"}, function (err, state_master){
        city_master.find({del:"N"}, function (err, city_master){
            product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
                addmast.find({masterid:req.session.masterid,addlesstype:"+",del:"N"}, function (err, addmast){
                    lessmast.find({masterid:req.session.masterid,addlesstype:"-",del:"N"}, function (err, lessmast){
                    Account_master.find({masterid: req.session.masterid, del: 'N'},function (err, account_masters){
                    Gs_master.findOne({group: 'SUPPLIER'},function (err, gs_master){
                    Gs_master.findOne({group: 'BROKER'},function (err, broker){
                    Gs_master.findOne({group: 'SALE PERSON'},function (err, slPerson){
                           if (err) {
                            console.log(err);
                           } else {
                            var last = 1;
                            if(VachhatiAavak == '')last=1;
                            else last = parseInt(VachhatiAavak[0].vouc_code)+1;
                            // accarry = [];
                            // if(gs_master != null && gs_master['garry'] != null && account_masters != null){
                            // for (let g = 0; g < gs_master['garry'].length; g++)
                            // {     
                            //     for (let j = 0; j < account_masters.length; j++)
                            //     {
                            //         if (gs_master['garry'][g]._id.equals(account_masters[j]['GroupName']._id))
                            //         { 
                            //         var arr={_id: account_masters[j]._id,ACName: account_masters[j]['ACName'], CityName: account_masters[j]['CityName']};
                            //         this.accarry.push(arr);
                            //         // console.log('r',account_masters[j]['ACName']);  
                            //         }
                            //     }
                            // }
                            // }
                            // brokerarr = [];
                            // if(broker != null && broker['garry'] != null && account_masters != null){
                            //     for (let g = 0; g < broker['garry'].length; g++)
                            //     {     
                            //         for (let j = 0; j < account_masters.length; j++)
                            //         {
                            //             if (broker['garry'][g]._id.equals(account_masters[j]['GroupName']._id))
                            //             { 
                            //             var arr={_id: account_masters[j]._id,ACName: account_masters[j]['ACName'], CityName: account_masters[j]['CityName']};
                            //             this.brokerarr.push(arr);
                            //             // console.log('r',account_masters[j]['ACName']);  
                            //             }
                            //         }
                            //     }
                            // }
                            // slPersonarr = [];
                            // if(slPerson != null && slPerson['garry'] != null && account_masters != null){
                            //     for (let g = 0; g < slPerson['garry'].length; g++)
                            //     {     
                            //         for (let j = 0; j < account_masters.length; j++)
                            //         {
                            //             if (slPerson['garry'][g]._id.equals(account_masters[j]['GroupName']._id))
                            //             { 
                            //             var arr={_id: account_masters[j]._id,ACName: account_masters[j]['ACName'], CityName: account_masters[j]['CityName']};
                            //             this.slPersonarr.push(arr);
                            //             // console.log('r',account_masters[j]['ACName']);  
                            //             }
                            //         }
                            //     }
                            // }
                            var acmast = this.accarry;
                            var brok = this.brokerarr;
                            var slpr = this.slPersonarr;
                            res.render('Vachhati_Aavak_Entry_Add.hbs', {
                            pageTitle:'Vachhati Aavak Entry',
                            last: last,
                            state_master:state_master,
                            city_master:city_master,
                            puchaseAc:account_masters,
                            acmast:acmast,
                            gowdown:gowdown,
                            brokerName:brok,
                            Slperson: slpr,
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
            })
            })
         }).populate('CityName')
        });
        });
        });
        });
    })
    }).sort('-vouc_code');
})
});

router.post('/add', function(req, res){
    Accountm_aster.findById(req.body.party_Code, function (err, acmastcustumer){
    addlessmast.find({}, function (err,addlessmast){
    division.find({_id:req.session.divid}, function(err, division){
        if(req.body.party_Code=="") req.body.party_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.sl_Person=="") req.body.sl_Person=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.broker_Code=="") req.body.broker_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var date = req.body.date;
        var dateObject =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var datemilisecond = dateObject.format('x');


        var godown_rcpt_date = req.body.godown_rcpt_date;
        var godown_rcpt_dateObject =  moment(godown_rcpt_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var godown_rcpt_datemilisecond = godown_rcpt_dateObject.format('x');

        var custumer = '';
        var intrate = '';
        console.log(acmastcustumer)
        // if(acmastcustumer.PartyType == undefined || acmastcustumer.PartyType == null){
        //     custumer = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        //     intrate = 0;
        // }
        // else{
        //     custumer = acmastcustumer.PartyType.pur_posting_ac;
        //     intrate = acmastcustumer.ac_intrestper;
        // }
        if(errors){
            console.log(errors);
        }
        else{ 
            // alert('ok');
            let dsi = new VachhatiAavak();
            dsi.main_bk = "VAE";
            dsi.d_c = 'C';
            dsi.c_j_s_p = req.body.c_j_s_p;
            dsi.vouc_code = req.body.vouc_code;

            dsi.moter_no = req.body.moter_no;
            
            dsi.invoice_refno = req.body.invoice_refno;
            dsi.lr_no = req.body.lr_no;
            dsi.nature_of_aavak = req.body.nature_of_aavak;
            // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
            dsi.Lot_No = req.body.Lot_No;
            dsi.vachhati_code = req.body.vachhati_code;
            dsi.tapalee_code = req.body.tapalee_code;
            dsi.despatched_from_to = req.body.despatched_from_to;
            dsi.date =dateObject;
            dsi.datemilisecond = datemilisecond;
            dsi.godown_rcpt_date = godown_rcpt_dateObject;
            dsi.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;

            // dsi.cr_Days = req.body.cr_Days;
            // dsi.due_On = req.body.due_On;
            // dsi.cashCredit = req.body.cashCredit;
            // dsi.lorry_Wagon_No = req.body.lorry_Wagon_No;
            // dsi.party_Code = req.body.party_Code;
            // dsi.broker_Code = req.body.broker_Code;
            // dsi.sl_Person = req.body.sl_Person;
            dsi.garu_Remarks = req.body.garu_Remarks;
            dsi.gross_Amt = req.body.gross_Amt;
            dsi.vachhati_Aavak_Group = req.body.vachhati_Aavak_Group;
            dsi.tot_Amt = req.body.tot_Amt;
            dsi.tot_DisAmt = req.body.tot_DisAmt;
            dsi.tot_AmtBeforeDis = req.body.tot_AmtBeforeDis;
            dsi.tot_TaxAmt = req.body.tot_TaxAmt;
            dsi.tot_AmtBeforeTax = req.body.tot_AmtBeforeTax;
            dsi.add_details = req.body.add_details;
            dsi.less_details = req.body.less_details;
            dsi.co_code = req.session.compid;
            dsi.div_code = req.session.divid;
            dsi.usrnm = req.session.user;
            dsi.masterid = req.session.masterid;
            dsi.del = 'N';
            dsi.entrydate = new Date();
            VachhatiAavak.find({vouc_code:req.body.vouc_code, main_bk:'VAE',del:'N'},function(err,dsidublicate){
                if(dsidublicate == null || dsidublicate == ''){
                    dsi.save(function (err){
                        if(err)res.json({'success':false,'message':'error in saving domestic sales invoice ','errors':err});
                        else{
                            dsiSave = true;
                        let journal = new journalmast();
                            journal.VachhatiEntry_id = dsi._id;//trans scema fetech id
                            journal.main_bk = "VA";
                            journal.d_c ="C";
                            journal.vouc_code = req.body.vouc_code;
                            journal.cash_date =dateObject;
                            journal.c_j_s_p = req.body.c_j_s_p;
                            journal.cash_edatemilisecond = datemilisecond;

                            journal.moter_no = req.body.moter_no;
                            dsi.invoice_refno = req.body.invoice_refno;
                            journal.lr_no = req.body.lr_no;
                            journal.nature_of_aavak = req.body.nature_of_aavak;
                            journal.Lot_No = req.body.Lot_No;
                            journal.vachhati_code = req.body.vachhati_code;
                            journal.tapalee_code = req.body.tapalee_code;
                            journal.despatched_from_to = req.body.despatched_from_to;
                            journal.date =dateObject;
                            journal.datemilisecond = datemilisecond;
                            journal.godown_rcpt_date = godown_rcpt_dateObject;
                            journal.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;
                            journal.cash_narrtwo = 'By Purchase';
                            journal.cash_narrone = 'Credit';
                            journal.cash_type = "Purchase";
                            journal.ac_intrestper = intrate;
                            journal.del = "N";
                            journal.entrydate = new Date();
                            journal.cash_amount = req.body.gross_Amt;
                            journal.co_code = req.session.compid;
                            journal.div_code = req.session.divid;
                            journal.usrnm = req.session.user;
                            journal.masterid = req.session.masterid;
                            journal.save();
                           
                        var journalamount = new journalmast();
                            journalamount.VachhatiEntry_id = dsi._id;//trans scema fetech id
                            journalamount.main_bk = "XVA";
                            journalamount.d_c ="D";
                            journalamount.vouc_code = req.body.vouc_code;
                            journalamount.c_j_s_p = req.body.c_j_s_p;
                            journalamount.cashac_name = custumer;

                            journalamount.moter_no = req.body.moter_no;
                            dsi.invoice_refno = req.body.invoice_refno;
                            journalamount.lr_no = req.body.lr_no;
                            journalamount.nature_of_aavak = req.body.nature_of_aavak;
                             // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                             journalamount.Lot_No = req.body.Lot_No;
                             journalamount.vachhati_code = req.body.vachhati_code;
                             journalamount.tapalee_code = req.body.tapalee_code;
                             journalamount.despatched_from_to = req.body.despatched_from_to;
                             journalamount.date =dateObject;
                             journalamount.datemilisecond = datemilisecond;
                             journalamount.godown_rcpt_date = godown_rcpt_dateObject;
                             journalamount.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;

                            journalamount.cash_narrone = 'Credit';
                            journalamount.cash_narrtwo = 'By Purchase';
                            journalamount.cash_type = "Purchase";
                            journalamount.cash_amount = req.body.tot_Amt;
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
                                            journaladd.VachhatiEntry_id = dsi._id;//trans scema fetech id
                                            journaladd.main_bk = "XVAA"+i;
                                            journaladd.d_c ="D";
                                            journaladd.vouc_code = req.body.vouc_code;
                                            journaladd.cash_date =dateObject;
                                            journaladd.c_j_s_p = req.body.c_j_s_p;
                                            journaladd.cash_edatemilisecond = datemilisecond;
                                            journaladd.cashac_name = addlessmast[j].pur_posting_ac;

                                            journaladd.moter_no = req.body.moter_no;
                                            dsi.invoice_refno = req.body.invoice_refno;
                                            journaladd.lr_no = req.body.lr_no;
                                            journaladd.nature_of_aavak = req.body.nature_of_aavak;
                                            // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                                            journaladd.Lot_No = req.body.Lot_No;
                                            journaladd.vachhati_code = req.body.vachhati_code;
                                            journaladd.tapalee_code = req.body.tapalee_code;
                                            journaladd.despatched_from_to = req.body.despatched_from_to;
                                            journaladd.date =dateObject;
                                            journaladd.datemilisecond = datemilisecond;
                                            journaladd.godown_rcpt_date = godown_rcpt_dateObject;
                                            journaladd.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;


                                            journaladd.cash_narrone = 'Credit';
                                            journaladd.cash_narrtwo = addlessmast[j].type_descr;
                                            journaladd.cash_type = "Purchase";
                                            journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                            journaladd.del = "N";
                                            journaladd.entrydate = new Date();
                                            journaladd.co_code = req.session.compid;
                                            journaladd.div_code = req.session.divid;
                                            journaladd.usrnm = req.session.user;
                                            journaladd.masterid = req.session.masterid;
                                            journaladd.save();
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
                                            journalless.VachhatiEntry_id = dsi._id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                            journalless.main_bk = "XVAL"+i;
                                            journalless.d_c ="C";
                                            journalless.vouc_code = req.body.vouc_code;
                                            journalless.c_j_s_p = req.body.c_j_s_p;
                                            journalless.cashac_name = addlessmast[j].pur_posting_ac;

                                            journalless.moter_no = req.body.moter_no;
                                            dsi.invoice_refno = req.body.invoice_refno;
                                            journalless.lr_no = req.body.lr_no;
                                            journalless.nature_of_aavak = req.body.nature_of_aavak;
                                            // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                                            journalless.Lot_No = req.body.Lot_No;
                                            journalless.vachhati_code = req.body.vachhati_code;
                                            journalless.tapalee_code = req.body.tapalee_code;
                                            journalless.despatched_from_to = req.body.despatched_from_to;
                                            journalless.date =dateObject;
                                            journalless.datemilisecond = datemilisecond;
                                            journalless.godown_rcpt_date = godown_rcpt_dateObject;
                                            journalless.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;
                                           
                                            journalless.cash_narrone = 'Credit';
                                            journalless.cash_narrtwo = addlessmast[j].type_descr;
                                            journalless.cash_type = "Purchase";
                                            journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                            journalless.del = "N";
                                            journalless.entrydate = new Date();
                                            journalless.co_code = req.session.compid;
                                            journalless.div_code = req.session.divid;
                                            journalless.usrnm = req.session.user;
                                            journalless.masterid = req.session.masterid;
                                            journalless.save();
                                            console.log('less',req.body.less_details[i]['particular_less'],addlessmast[j].sales_posting_ac);
                                        break;
                                    }
                                }
                            }
                        let out = new outstanding();
                            out.VachhatiEntry_id = dsi._id; //trans scema fetech id
                            out.main_bk = "VAB";
                            out.d_c ="D";
                            out.vouc_code = req.body.vouc_code;
                            // out.cash_date =entry_DateObject;
                            out.c_j_s_p = req.body.c_j_s_p;
                            // out.cash_edatemilisecond = entry_Datemilisecond;

                            out.moter_no = req.body.moter_no;
                            dsi.invoice_refno = req.body.invoice_refno;
                            out.lr_no = req.body.lr_no;
                            out.nature_of_aavak = req.body.nature_of_aavak;
                            // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                            out.Lot_No = req.body.Lot_No;
                            out.vachhati_code = req.body.vachhati_code;
                            out.tapalee_code = req.body.tapalee_code;
                            out.despatched_from_to = req.body.despatched_from_to;
                            out.date =dateObject;
                            out.datemilisecond = datemilisecond;
                            out.godown_rcpt_date = godown_rcpt_dateObject;
                            out.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;
                           
                            out.cash_narrtwo = 'By Purchase';
                            out.cash_narrone = 'Credit';
                            out.cash_type = "Purchase";
                            out.del = "N";
                            out.entrydate = new Date();
                            out.ac_intrestper = intrate;
                            out.cash_amount = req.body.gross_Amt;
                            out.outstanding_amount = req.body.gross_Amt;
                            out.co_code = req.session.compid;
                            out.div_code = req.session.divid;
                            out.usrnm = req.session.user;
                            out.masterid = req.session.masterid;
                            out.save();
                            res.redirect('/Vachhati_Aavak_Entry/Vachhati_Aavak_Entry_Add');
                        }
                    })
                }else{
                    dsiSave = false;
                    console.log('error in saving domestic sales invoice');
                    res.send("<script>alert('This Invoice No. Is Already Exist');window.location.href = '/Vachhati_Aavak_Entry/Vachhati_Aavak_Entry_Add'</script>");
                }
            })
        }
    });
    });
    }).populate('PartyType');
});

router.get('/Vachhati_Aavak_Entry_List', ensureAuthenticated ,function(req,res){
    VachhatiAavak.find({main_bk:"VAE", del:"N", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid}, function (err,VachhatiAavak){
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log(VachhatiAavak)
                res.render('Vachhati_Aavak_Entry_List.hbs',{
                    pageTitle:'Vachhati Aavak Entry List',
                    VachhatiAavak:VachhatiAavak,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'vouc_code':1}).populate('party_Code').populate('broker_Code').populate('sl_Person');
});


router.get('/Vachhati_Aavak_Entry_Update/:id', ensureAuthenticated, function(req, res){
    VachhatiAavak.findById(req.params.id, function (err, VachhatiAavak){   
            state_master.find({del:"N"}, function (err, state_master){
            city_master.find({del:"N"}, function (err, city_master){
            product.find({masterid:req.session.masterid,del:"N"}, function (err, product){
            addmast.find({masterid:req.session.masterid,addlesstype:"+",del:"N"}, function (err, addmast){
            lessmast.find({masterid:req.session.masterid,addlesstype:"-",del:"N"}, function (err, lessmast){
            Account_master.find({masterid: req.session.masterid, del: 'N'},function (err, account_masters){
            gowdown.find({masterid: req.session.masterid, del: 'N'},function (err, gowdown){
            Gs_master.findOne({group: 'CUSTOMER'},function (err, gs_master){
             if (err) {
                    console.log(err);
                } else {
                    // console.log(Account_master[]);
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
                   
                    res.render('Vachhati_Aavak_Entry_Update.hbs',{
                        pageTitle:'Update Vachhati Aavak Entry',
                        VachhatiAavak:VachhatiAavak,
                        acmast:acmast,
                        product:product,
                        gowdown:gowdown,
                        Account_master:Account_master,
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
        });  
            }).populate('CityName');
        })
    })
    })
    })
    })
    }).populate('vachhati_Aavak_Group.item_Code_Desc').populate('vachhati_Aavak_Group.purchase_Ac_Title').populate('vachhati_Aavak_Group.gdn_Cd_Name');
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
    VachhatiAavak.findById(req.query.id, function (err,VachhatiAavak){
        division.find({_id:req.session.divid},function(err, division){
            // division.findById({_id:req.session.divid},function(err, division){
            if (err) {
                console.log(err);
            } else {
                if (VachhatiAavak!=undefined && VachhatiAavak.sales_or_group!=undefined)
                {
                    var arr = VachhatiAavak.sales_or_group;
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
        
                    if(VachhatiAavak.buy_cus_name.StateName == undefined)party_state = '';
                    else party_state = VachhatiAavak.buy_cus_name.StateName.StateCode;
        
                    if(division[0].ac_gstin == undefined)dg = '';
                    else dg = division[0].ac_gstin.substr(0,2);
        
                    if(VachhatiAavak.buy_cus_name.GSTIN == undefined)pg ='';
                    else pg = VachhatiAavak.buy_cus_name.GSTIN.substr(0,2);
        
                    console.log('ds',div_state,'ps',party_state,'dg',dg,'pg',pg);
                    if(div_state == party_state || dg == pg){
                        for(let i = 0; i<VachhatiAavak.sales_or_group.length; i++){
                            VachhatiAavak.sales_or_group[i].so_gstrate = (parseFloat(VachhatiAavak.sales_or_group[i].so_gstrate)/2).toFixed(2)
                            VachhatiAavak.sales_or_group[i].so_taxvalue = (parseFloat(VachhatiAavak.sales_or_group[i].so_taxvalue)/2).toFixed(2)
                            console.log(i,parseInt(VachhatiAavak.sales_or_group.length)-1)
                        }
                        VachhatiAavak.tot_taxvalue = (parseFloat(VachhatiAavak.tot_taxvalue)/2).toFixed(2)
                            res.render('dsi_print2.hbs',{
                                pageTitle:'SALES INVOICE PRINT',
                                VachhatiAavak: VachhatiAavak,
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
                                VachhatiAavak: VachhatiAavak,
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
    VachhatiAavak.findById(req.query.id, function (err,VachhatiAavak){
    division.find({_id:req.session.divid},function(err, division){
        // division.findById({_id:req.session.divid},function(err, division){
        if (err) {
            console.log(err);
        }else{
                res.render('dsi_envolapprint.hbs',{
                    pageTitle:'Sales Invoice Envelope Print',
                    VachhatiAavak: VachhatiAavak,
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
    var date = req.body.date;
    var dateObject =  moment(date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var datemilisecond = dateObject.format('x');


    var godown_rcpt_date = req.body.godown_rcpt_date;
    var godown_rcpt_dateObject =  moment(godown_rcpt_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var godown_rcpt_datemilisecond = godown_rcpt_dateObject.format('x');

    var custumer = '';
    var intrate = '';
    console.log(acmastcustumer)
    // if(acmastcustumer.PartyType == undefined || acmastcustumer.PartyType == null){
    //     custumer = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    //     intrate = 0;
    // }
    // else{
    //     custumer = acmastcustumer.PartyType.pur_posting_ac;
    //     intrate = acmastcustumer.ac_intrestper;
    // }
    if(errors){
        console.log(errors);
    }
    else{ 
        let dsi = new VachhatiAavak();
        dsi.main_bk = "VAE";
        dsi.d_c = 'C';
        dsi.c_j_s_p = req.body.c_j_s_p;
        dsi.vouc_code = req.body.vouc_code;

        dsi.moter_no = req.body.moter_no;
        dsi.invoice_refno = req.body.invoice_refno;
        dsi.lr_no = req.body.lr_no;
        dsi.nature_of_aavak = req.body.nature_of_aavak;
        // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
        dsi.Lot_No = req.body.Lot_No;
        dsi.vachhati_code = req.body.vachhati_code;
        dsi.tapalee_code = req.body.tapalee_code;
        dsi.despatched_from_to = req.body.despatched_from_to;
        dsi.date =dateObject;
        dsi.datemilisecond = datemilisecond;
        dsi.godown_rcpt_date = godown_rcpt_dateObject;
        dsi.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;

        // dsi.cr_Days = req.body.cr_Days;
        // dsi.due_On = req.body.due_On;
        // dsi.cashCredit = req.body.cashCredit;
        // dsi.lorry_Wagon_No = req.body.lorry_Wagon_No;
        // dsi.party_Code = req.body.party_Code;
        // dsi.broker_Code = req.body.broker_Code;
        // dsi.sl_Person = req.body.sl_Person;
        dsi.garu_Remarks = req.body.garu_Remarks;
        dsi.gross_Amt = req.body.gross_Amt;
        dsi.vachhati_Aavak_Group = req.body.vachhati_Aavak_Group;
        dsi.tot_Amt = req.body.tot_Amt;
        dsi.tot_DisAmt = req.body.tot_DisAmt;
        dsi.tot_AmtBeforeDis = req.body.tot_AmtBeforeDis;
        dsi.tot_TaxAmt = req.body.tot_TaxAmt;
        dsi.tot_AmtBeforeTax = req.body.tot_AmtBeforeTax;
        dsi.add_details = req.body.add_details;
        dsi.less_details = req.body.less_details;
        dsi.co_code = req.session.compid;
        dsi.div_code = req.session.divid;
        dsi.usrnm = req.session.user;
        dsi.masterid = req.session.masterid;
        dsi.del = 'N';
        dsi.entrydate = new Date();
        VachhatiAavak.find({vouc_code:req.body.vouc_code, main_bk:'GAE',del:'N'},function(err,dsidublicate){
            if(dsidublicate == null || dsidublicate == ''){
                dsi.save(function (err){
                    if(err)res.json({'success':false,'message':'error in saving domestic sales invoice ','errors':err});
                    else{
                        dsiSave = true;
                    let journal = new journalmast();
                        journal.VachhatiEntry_id = dsi._id;//trans scema fetech id
                        journal.main_bk = "VA";
                        journal.d_c ="C";
                        journal.vouc_code = req.body.vouc_code;
                        journal.cash_date =dateObject;
                        journal.c_j_s_p = req.body.c_j_s_p;
                        journal.cash_edatemilisecond = datemilisecond;

                        journal.moter_no = req.body.moter_no;
                        dsi.invoice_refno = req.body.invoice_refno;
                        journal.lr_no = req.body.lr_no;
                        journal.nature_of_aavak = req.body.nature_of_aavak;
                         // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                        journal.Lot_No = req.body.Lot_No;
                        journal.vachhati_code = req.body.vachhati_code;
                        journal.tapalee_code = req.body.tapalee_code;
                        journal.despatched_from_to = req.body.despatched_from_to;
                        journal.date =dateObject;
                        journal.datemilisecond = datemilisecond;
                        journal.godown_rcpt_date = godown_rcpt_dateObject;
                        journal.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;

                        
                        journal.cash_narrtwo = 'By Purchase';
                        journal.cash_narrone = 'Credit';
                        journal.cash_type = "Purchase";
                        journal.ac_intrestper = intrate;
                        journal.del = "N";
                        journal.entrydate = new Date();
                        journal.cash_amount = req.body.gross_Amt;
                        journal.co_code = req.session.compid;
                        journal.div_code = req.session.divid;
                        journal.usrnm = req.session.user;
                        journal.masterid = req.session.masterid;
                        journal.save();
                       
                    var journalamount = new journalmast();
                        journalamount.VachhatiEntry_id = dsi._id;//trans scema fetech id
                        journalamount.main_bk = "XVA";
                        journalamount.d_c ="D";
                        journalamount.vouc_code = req.body.vouc_code;
                        journalamount.c_j_s_p = req.body.c_j_s_p;
                        journalamount.cashac_name = custumer;

                        journalamount.moter_no = req.body.moter_no;
                        dsi.invoice_refno = req.body.invoice_refno;
                        journalamount.lr_no = req.body.lr_no;
                        journalamount.nature_of_aavak = req.body.nature_of_aavak;
                         // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                         journalamount.Lot_No = req.body.Lot_No;
                         journalamount.vachhati_code = req.body.vachhati_code;
                         journalamount.tapalee_code = req.body.tapalee_code;
                         journalamount.despatched_from_to = req.body.despatched_from_to;
                         journalamount.date =dateObject;
                         journalamount.datemilisecond = datemilisecond;
                         journalamount.godown_rcpt_date = godown_rcpt_dateObject;
                         journalamount.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;

                        journalamount.cash_narrone = 'Credit';
                        journalamount.cash_narrtwo = 'By Purchase';
                        journalamount.cash_type = "Purchase";
                        journalamount.cash_amount = req.body.tot_Amt;
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
                                        journaladd.VachhatiEntry_id = dsi._id;//trans scema fetech id
                                        journaladd.main_bk = "XVAA"+i;
                                        journaladd.d_c ="D";
                                        journaladd.vouc_code = req.body.vouc_code;
                                        journaladd.cash_date =dateObject;
                                        journaladd.c_j_s_p = req.body.c_j_s_p;
                                        journaladd.cash_edatemilisecond = datemilisecond;
                                        journaladd.cashac_name = addlessmast[j].pur_posting_ac;

                                        journaladd.moter_no = req.body.moter_no;
                                        dsi.invoice_refno = req.body.invoice_refno;
                                        journaladd.lr_no = req.body.lr_no;
                                        journaladd.nature_of_aavak = req.body.nature_of_aavak;
                                        // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                                        journaladd.Lot_No = req.body.Lot_No;
                                        journaladd.vachhati_code = req.body.vachhati_code;
                                        journaladd.tapalee_code = req.body.tapalee_code;
                                        journaladd.despatched_from_to = req.body.despatched_from_to;
                                        journaladd.date =dateObject;
                                        journaladd.datemilisecond = datemilisecond;
                                        journaladd.godown_rcpt_date = godown_rcpt_dateObject;
                                        journaladd.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;


                                        journaladd.cash_narrone = 'Credit';
                                        journaladd.cash_narrtwo = addlessmast[j].type_descr;
                                        journaladd.cash_type = "Purchase";
                                        journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                        journaladd.del = "N";
                                        journaladd.entrydate = new Date();
                                        journaladd.co_code = req.session.compid;
                                        journaladd.div_code = req.session.divid;
                                        journaladd.usrnm = req.session.user;
                                        journaladd.masterid = req.session.masterid;
                                        journaladd.save();
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
                                        journalless.VachhatiEntry_id = dsi._id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                        journalless.main_bk = "XVAL"+i;
                                        journalless.d_c ="C";
                                        journalless.vouc_code = req.body.vouc_code;
                                        journalless.c_j_s_p = req.body.c_j_s_p;
                                        journalless.cashac_name = addlessmast[j].pur_posting_ac;

                                        journalless.moter_no = req.body.moter_no;
                                        dsi.invoice_refno = req.body.invoice_refno;
                                        journalless.lr_no = req.body.lr_no;
                                        journalless.nature_of_aavak = req.body.nature_of_aavak;
                                        // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                                        journalless.Lot_No = req.body.Lot_No;
                                        journalless.vachhati_code = req.body.vachhati_code;
                                        journalless.tapalee_code = req.body.tapalee_code;
                                        journalless.despatched_from_to = req.body.despatched_from_to;
                                        journalless.date =dateObject;
                                        journalless.datemilisecond = datemilisecond;
                                        journalless.godown_rcpt_date = godown_rcpt_dateObject;
                                        journalless.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;
                                       
                                        journalless.cash_narrone = 'Credit';
                                        journalless.cash_narrtwo = addlessmast[j].type_descr;
                                        journalless.cash_type = "Purchase";
                                        journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                        journalless.del = "N";
                                        journalless.entrydate = new Date();
                                        journalless.co_code = req.session.compid;
                                        journalless.div_code = req.session.divid;
                                        journalless.usrnm = req.session.user;
                                        journalless.masterid = req.session.masterid;
                                        journalless.save();
                                        console.log('less',req.body.less_details[i]['particular_less'],addlessmast[j].sales_posting_ac);
                                    break;
                                }
                            }
                        }
                    let out = new outstanding();
                        out.VachhatiEntry_id = dsi._id; //trans scema fetech id
                        out.main_bk = "VAB";
                        out.d_c ="D";
                        out.vouc_code = req.body.vouc_code;
                        // out.cash_date =entry_DateObject;
                        out.c_j_s_p = req.body.c_j_s_p;
                        // out.cash_edatemilisecond = entry_Datemilisecond;

                        out.moter_no = req.body.moter_no;
                        dsi.invoice_refno = req.body.invoice_refno;
                        out.lr_no = req.body.lr_no;
                        out.nature_of_aavak = req.body.nature_of_aavak;
                        // dsi.godown_rcpt_date = req.body.godown_rcpt_date;
                        out.Lot_No = req.body.Lot_No;
                        out.vachhati_code = req.body.vachhati_code;
                        out.tapalee_code = req.body.tapalee_code;
                        out.despatched_from_to = req.body.despatched_from_to;
                        out.date =dateObject;
                        out.datemilisecond = datemilisecond;
                        out.godown_rcpt_date = godown_rcpt_dateObject;
                        out.godown_rcpt_datemilisecond= godown_rcpt_datemilisecond;
                       
                        out.cash_narrtwo = 'By Purchase';
                        out.cash_narrone = 'Credit';
                        out.cash_type = "Purchase";
                        out.del = "N";
                        out.entrydate = new Date();
                        out.ac_intrestper = intrate;
                        out.cash_amount = req.body.gross_Amt;
                        out.outstanding_amount = req.body.gross_Amt;
                        out.co_code = req.session.compid;
                        out.div_code = req.session.divid;
                        out.usrnm = req.session.user;
                        out.masterid = req.session.masterid;
                        out.save();
                        res.redirect('/Vachhati_Aavak_Entry/Vachhati_Aavak_Entry_Add');
                    }
                })
            }else{
                dsiSave = false;
                console.log('error in saving domestic sales invoice');
                res.send("<script>alert('This Invoice No. Is Already Exist');window.location.href = '/Vachhati_Aavak_Entry/Vachhati_Aavak_Entry_Add'</script>");
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
        // VachhatiAavak.find({buy_cus_name:party,co_code:req.session.compid,div_code:req.session.divid,main_bk:"SIV",del:"N"}, function (err, VachhatiAavak){
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
    VachhatiAavak.findById(si_id, function (err, VachhatiAavak){
    slgrp = VachhatiAavak.sales_or_group;
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
      if(!req.user._id){
        res.status(500).send();
      }else{
      let query = {_id:req.params.id}
      let saleorder = {};
        saleorder.del = 'Y';
        saleorder.delete = new Date();
        VachhatiAavak.update(query,saleorder, function(err,somast){
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

router.get('/ItenCodeName', function (req, res) {
    var qry = req.query.term.term;
    product.find({$or: [{ 'item_title': { $regex: new RegExp("^"+qry,"i")}},{'item_code':{ $regex: new RegExp("^"+qry,"i")}}],del:'N',masterid:req.session.masterid},'item_title',  function(err, party){
        var data = new Array();
        if(party!=undefined){
            for (var j = 0; j < party.length; j++) {
                data[j] = {
                    "id": party[j]._id,
                    "text" : party[j].item_title
                };
            }
            res.json({'results':  data, "pagination": {
                        "more": false
                    } });
        }
    }).sort({'ACName':1});
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









// VachhatiAavak.findById(req.params.id, function(err, VachhatiAavak){
//     journalmast.find({_ID:req.params.id}, function (err, journ){
//         outstanding.find({_ID:req.params.id}, function (err, outst){
//    VachhatiAavak.remove(query, function(err){
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