const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let ledger = require('../models/trans_schema');
let FinishLedger = require('../models/salesorder_schema');
let product = require('../models/fgSchema');
let Gowdown = require('../models/gowdawnCodeSchema');

let Fgproduct = require('../models/fgSchema');
let acmast = require('../models/ac_mast');
let workmast = require('../models/worksheet_schema');
var Raw_master = require('../models/fgSchema');
var Mrn_master = require('../models/Garu_Aavak_Schema');
var Mrn_masterOP = require('../models/Garu_Aavak_Schema');
let db = mongoose.connection;
var debit, credit;
var bal = 0;
var toataldebit = 0;
var totalcredit = 0;
let common = require('./common');
// summary = [];
// Add Routesales_order_summary

router.get('/stock_ladger', ensureAuthenticated, function (req, res) {
    Gowdown.find({ masterid: req.session.masterid, del: 'N' }, function (err, Gowdown) {
        // console.log(Gowdown);
        // product.find({masterid:req.session.masterid, del:'N'}, function (err, product){
        if (err) {
            console.log(err);
        } else {
            res.render('stock_ladger.hbs', {
                pageTitle: 'Stock Ledger',
                // Subwarehouse:Subwarehouse,
                Gowdown: Gowdown,
                // product: product,
                compnm: req.session.compnm,
                divnm: req.session.divmast,
                sdate: req.session.compsdate,
                edate: req.session.compedate,
                usrnm: req.session.user,
                security: req.session.security,
                administrator: req.session.administrator
            });
        }
    })
});

router.get('/stock_summary', ensureAuthenticated, function (req, res) {
    Gowdown.find({ masterid: req.session.masterid, del: 'N' }, function (err, Gowdown) {

        // product.find({masterid:req.session.masterid, del:'N'}, function (err, product){
        if (err) {
            console.log(err);
        } else {
            res.render('stock_summary.hbs', {
                pageTitle: 'Stock Summary',
                // product: product,

                Gowdown: Gowdown,
                compnm: req.session.compnm,
                divnm: req.session.divmast,
                sdate: req.session.compsdate,
                edate: req.session.compedate,
                usrnm: req.session.user,
                security: req.session.security,
                administrator: req.session.administrator
            });
        }
    })
});

router.post('/stockladgerdetails', ensureAuthenticated, function (req, res) {
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
    // console.log(strtdate+" "+enddats)
    if (req.body.location != '') {
        console.log('location found' + req.body.location + '-');
        var query = { $and: [{ entry_Datemilisecond: { $gte: strtdate } }, { entry_Datemilisecond: { $lte: enddats } }], "garu_Aavak_Group": { $elemMatch: { item_Code_Desc: req.body.Product, gdn_Cd_Name: req.body.location } }, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" }
        var query2 = { $and: [{ entry_Datemilisecond: { $lt: strtdate } }], "garu_Aavak_Group": { $elemMatch: { item_Code_Desc: req.body.Product, gdn_Cd_Name: req.body.location } }, flag: { $ne: "STK" }, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" }
    } else {
        console.log('location not found');
        var query = { $and: [{ entry_Datemilisecond: { $gte: strtdate } }, { entry_Datemilisecond: { $lte: enddats } }], "garu_Aavak_Group": { $elemMatch: { item_Code_Desc: req.body.Product } }, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" }
        var query2 = { $and: [{ entry_Datemilisecond: { $lt: strtdate } }], "garu_Aavak_Group": { $elemMatch: { item_Code_Desc: req.body.Product } }, flag: { $ne: "STK" }, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" }
    }

    Raw_master.findById(req.body.Product, function (err, op_stock) {
        Mrn_master.find(query, function (err, MRN) {
            Mrn_masterOP.find(query2, function (err, Mrn_masterOP) {

                // console.log('Mrn_masterOP length', Mrn_masterOP.length);
                // accarry = [];
                if (err) {
                    console.log(err);
                }
                else {
                    balance = 0;
                    balance_net_Wt = 0;
                    op_bal = 0;
                    op_net_Wt = 0;
                    ladger = [];
                    if (Mrn_masterOP == null || Mrn_masterOP == '' || Mrn_masterOP == []) {
                        // res.json({success: false});
                    } else {
                        var array = [];
                        // console.log('Mrn_masterOP',Mrn_masterOP)
                        for (let i = 0; i < Mrn_masterOP.length; i++) {
                            array = Mrn_masterOP[i]['garu_Aavak_Group'];
                            var d_c = Mrn_masterOP[i]['d_c'];
                            for (let j = 0; j < array.length; j++) {
                                if (array[j].item_Code_Desc == req.body.Product) {
                                    if (d_c == 'C') {
                                        var qty = array[j].qntty;
                                        op_bal = op_bal + parseFloat(qty);
                                        var net_Wt = array[j].net_Wt;
                                        if (net_Wt == null || net_Wt == '' || net_Wt == undefined || isNaN(net_Wt)) net_Wt = 0;
                                        op_net_Wt = op_net_Wt + parseFloat(net_Wt);
                                    }
                                    if (d_c == 'D') {
                                        var qty = array[j].qntty;
                                        op_bal = op_bal - parseFloat(qty);
                                        var net_Wt = array[j].net_Wt;
                                        if (net_Wt == null || net_Wt == '' || net_Wt == undefined || isNaN(net_Wt)) net_Wt = 0;
                                        op_net_Wt = op_net_Wt - parseFloat(net_Wt);
                                    }
                                }
                            }
                        }
                    }
                    if (MRN == null || MRN == '' || MRN == []) {
                        // res.json({success: false});
                        res.json({ "success": true, "laststock": op_bal, 'op_net_Wt': op_net_Wt });

                    }
                    else {
                        array = [];
                        if (op_bal == null || op_bal == '' || isNaN(op_bal)) op_bal = 0;
                        this.balance = op_bal;
                        for (let i = 0; i < MRN.length; i++) {
                            this.array = MRN[i]['garu_Aavak_Group'];
                            var main_bk = MRN[i]['main_bk'];
                            var d_c = MRN[i]['d_c'];
                            var date = MRN[i]['entry_Date'];
                            var pnam = '';
                            if (MRN[i]['party_Code'] == null || MRN[i]['party_Code'] == undefined) pnam = '';
                            else pnam = MRN[i]['party_Code'].ACName;
                            var partyName = pnam;
                            var entryno = MRN[i]['vouc_code'];
                            var range = MRN[i]['entry_Datemilisecond'];

                            for (let j = 0; j < this.array.length; j++) {
                                var locationid = '';
                                var location = '';
                                if (this.array[j] != null && this.array[j].gdn_Cd_Name != null && this.array[j].gdn_Cd_Name != undefined) var location = this.array[j].gdn_Cd_Name.Description;
                                if (this.array[j] != null && this.array[j].gdn_Cd_Name != null && this.array[j].gdn_Cd_Name != undefined) var locationid = this.array[j].gdn_Cd_Name._id;

                                // console.log(j, this.array[j].so_disc, this.array[j].so_disc._id)
                                if (this.array[j].item_Code_Desc == req.body.Product && this.array[j].item_Code_Desc != undefined) {
                                    // console.log('this array',this.array[j].item_Code_Desc);
                                    // if (this.array[j].item_Code_Desc == req.body.Product) {
                                    if (req.body.location == '') {
                                        locationid = ''
                                    }
                                    if (this.array[j].item_Code_Desc._id == req.body.Product && locationid == req.body.location) {
                                        if (d_c == 'C') {
                                            var qty = this.array[j].qntty;
                                            this.balance = this.balance + parseFloat(qty);
                                            var net_Wt = this.array[j].net_Wt;
                                            var Rate_minus = this.array[j].rate;
                                            if (net_Wt == null || net_Wt == '' || net_Wt == undefined || isNaN(net_Wt)) net_Wt = 0;
                                            if (Rate_minus == null || Rate_minus == '' || Rate_minus == undefined || isNaN(Rate_minus)) Rate_minus = 0;
                                            balance_net_Wt = balance_net_Wt + parseFloat(net_Wt);
                                            var arr = { '_id': MRN[i]['_id'], 'Date': date, "Party": partyName, "location": location, "EntryNo": entryno, "challan": main_bk, "plus": qty, "minus": '', "misec": range, "Balance": this.balance, 'net_Wt_plus': net_Wt, 'net_Wt_min': '', 'balance_net_Wt': balance_net_Wt, 'Rate_minus': Rate_minus };
                                            this.ladger.push(arr)
                                        }
                                        if (d_c == 'D') {
                                            var qty = this.array[j].qntty;
                                            this.balance = this.balance - parseFloat(qty);
                                            var net_Wt = this.array[j].net_Wt;
                                            var Rate_plus = this.array[j].rate;
                                            if (net_Wt == null || net_Wt == '' || net_Wt == undefined || isNaN(net_Wt)) net_Wt = 0;
                                            if (Rate_plus == null || Rate_plus == '' || Rate_plus == undefined || isNaN(Rate_plus)) Rate_plus = 0;
                                            balance_net_Wt = balance_net_Wt - parseFloat(net_Wt);
                                            var arr = { '_id': MRN[i]['_id'], 'Date': date, "Party": partyName, "location": location, "EntryNo": entryno, "challan": main_bk, "plus": '', "minus": qty, "misec": range, "Balance": this.balance, 'net_Wt_plus': '', 'net_Wt_min': net_Wt, 'balance_net_Wt': balance_net_Wt, 'Rate_plus': Rate_plus };
                                            this.ladger.push(arr)
                                        }
                                    }
                                }
                            }
                        }
                        res.json({ "success": true, "ladger": this.ladger, "laststock": op_bal, 'op_net_Wt': op_net_Wt });
                    }
                }
            }).sort({ 'so_datemilisecond': 1 }).populate('party_Code');
        }).sort({ 'so_datemilisecond': 1 }).populate('party_Code').populate('garu_Aavak_Group.gdn_Cd_Name');
    });
})


router.post('/stocksummarydetails', ensureAuthenticated, async function (req, res) {
    let stsummary;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    const Srtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const Enddate = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
    // console.log(start_date, Srtdate, end_date, Enddate,req.body.location)

    if (req.body.location != '') {
        var qry = { $and: [{ entry_Datemilisecond: { $gte: Srtdate } }, { entry_Datemilisecond: { $lte: Enddate } }], "garu_Aavak_Group": { $elemMatch: { gdn_Cd_Name: req.body.location } }, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" };
        var qryop = { $and: [{ entry_Datemilisecond: { $lt: Srtdate } }], "garu_Aavak_Group": { $elemMatch: { gdn_Cd_Name: req.body.location } }, flag: { $ne: "STK" }, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" }
        // var query = { $and: [{ so_datemilisecond:    { $lt: strtdate } }],  flag: { $ne: "STK" }, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" }
    } else {
        var qry = { $and: [{ entry_Datemilisecond: { $gte: Srtdate } }, { entry_Datemilisecond: { $lte: Enddate } }], "co_code": req.session.compid, "div_code": req.session.divid, del: "N" };
        var qryop = { $and: [{ entry_Datemilisecond: { $lt: Srtdate } }], flag: { $ne: "STK" }, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" }
    }

    summary = [];
    mil = [];
    let product = await Raw_master.find({ masterid: req.session.masterid, del: "N" }, function (err, product) { });
    let mrnop_stk = await Mrn_masterOP.find(qryop, function (err, mrnop_stk) { });

    Mrn_master.find(qry, function (err, MRN) {
        if (err) {
            console.log(err);
        }
        else {
            if (MRN != '' && product != '') {
                for (let item of product) {
                    opStock = 0;
                    tmqty = 0;
                    toqty = 0;
                    main_bk;
                    range = 0;
                    Tot_Wtin = 0;
                    Tot_Wtout = 0;
                    opStock_Wt = 0;
                    for (let j of MRN) {
                        var main_bk = j.main_bk;
                        var d_c = j.d_c;

                        for (let i of j.garu_Aavak_Group) {
                            array = i.item_Code_Desc;
                            var locationid = '';
                            var location = '';
                            if (i != null && i.gdn_Cd_Name != null && i.gdn_Cd_Name != undefined) var location = i.gdn_Cd_Name.Description;
                            if (i != null && i.gdn_Cd_Name != null && i.gdn_Cd_Name != undefined) var locationid = i.gdn_Cd_Name._id;

                            if (i.item_Code_Desc.equals(item._id) && i.item_Code_Desc != undefined) {
                                if (req.body.location == '') {
                                    locationid = '';
                                }
                                if (i.item_Code_Desc.equals(item._id) && locationid == req.body.location) {
                                    // if (i.item_Code_Desc.equals(item._id)) {
                                    if (d_c == 'C') {
                                        tmqty = tmqty + parseInt(i.qntty);
                                        var net_Wt = i.net_Wt;
                                        if (net_Wt == null || net_Wt == '' || net_Wt == undefined || isNaN(net_Wt)) net_Wt = 0;
                                        Tot_Wtin = Tot_Wtin + parseFloat(net_Wt);
                                    }
                                    if (d_c == 'D') {
                                        toqty = toqty + parseInt(i.qntty);
                                        var net_Wt = i.net_Wt;
                                        if (net_Wt == null || net_Wt == '' || net_Wt == undefined || isNaN(net_Wt)) net_Wt = 0;
                                        Tot_Wtout = Tot_Wtout + parseFloat(net_Wt);
                                    }
                                    // }    
                                }
                            }
                        }
                    }
                    if (mrnop_stk != '' || mrnop_stk != null) {
                        for (let j of mrnop_stk) {
                            array = j.item_Code_Desc;
                            var main_bk = j.main_bk;
                            var d_c = j.d_c;
                            for (let i of j.garu_Aavak_Group) {

                                var locationid = '';
                                var location = '';

                                if (i != null && i.gdn_Cd_Name != null && i.gdn_Cd_Name != undefined) var location = i.gdn_Cd_Name.Description;
                                if (i != null && i.gdn_Cd_Name != null && i.gdn_Cd_Name != undefined) var locationid = i.gdn_Cd_Name._id;


                                if (i.item_Code_Desc.equals(item._id) && i.item_Code_Desc != undefined) {
                                // if (i.item_Code_Desc == req.body.Product && i.item_Code_Desc != undefined) {
                                    if (req.body.location == '') {
                                        locationid = '';
                                    }
                                    if (i.item_Code_Desc.equals(item._id) && locationid == req.body.location) {

                                        // if (i.item_Code_Desc.equals(item._id)) {
                                        if (d_c == 'C') {
                                            opStock = opStock + parseInt(i.qntty);
                                            var net_Wt = i.net_Wt;
                                            if (net_Wt == null || net_Wt == '' || net_Wt == undefined || isNaN(net_Wt)) net_Wt = 0;
                                            opStock_Wt = opStock_Wt + parseFloat(net_Wt);
                                        }
                                        if (d_c == 'D') {
                                            opStock = opStock - parseInt(i.qntty);
                                            var net_Wt = i.net_Wt;
                                            if (net_Wt == null || net_Wt == '' || net_Wt == undefined || isNaN(net_Wt)) net_Wt = 0;
                                            opStock_Wt = opStock_Wt - parseFloat(net_Wt);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var arr = { 'productid': item._id, 'product': item.item_title, 'opstock': opStock, 'mrn': tmqty, 'outward': toqty, 'rate': item.dana_rt, 'Tot_Wtin': Tot_Wtin, 'Tot_Wtout': Tot_Wtout, 'opStock_Wt': opStock_Wt }
                    if (arr.mrn != '' || arr.outward != '') this.summary.push(arr);
                }
            }
        }
        res.json({ success: true, summary: this.summary });
    });
})

router.post('/WIP_StockLedger', ensureAuthenticated, function (req, res) {
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    // var  buy_cus_name=req.body.buy_cus_name;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
    // console.log(strtdate+" "+enddats)
    Fgproduct.findById(req.body.Product, function (err, op_stock) {
        FinishLedger.find({ "sales_or_group": { $elemMatch: { so_disc: req.body.Product } }, "masterid": req.session.masterid, "co_code": req.session.compid, "div_code": req.session.divid, del: "N" }, function (err, MRN) {
            // accarry = [];
            if (err) {
                console.log(err);
            }
            else {
                // console.log(MRN+"jaiswal");
                if (MRN == null) {
                    // console.log(MRN+"Vikas");
                    res.json({ success: false });
                } else {
                    array = [];
                    // balance = op_stock.Fg_OpStk;
                    // op_bal = op_stock.Fg_OpStk;
                    balance = 0;
                    op_bal = 0;
                    ladger = [];
                    for (let i = 0; i < MRN.length; i++) {
                        this.array = MRN[i]['sales_or_group'];
                        var main_bk = MRN[i]['main_bk'];
                        var CJSP = MRN[i]['c_j_s_p'];
                        var d_c = MRN[i]['d_c'];
                        var date = MRN[i]['so_date'];
                        var partyName = '';
                        if (MRN[i]['buy_cus_name'] == undefined || MRN[i]['buy_cus_name'] == null) partyName = '';
                        else partyName = MRN[i]['buy_cus_name'].ACName;

                        if (MRN[i]['production_dept'] == undefined || MRN[i]['production_dept'] == null) {
                            if (MRN[i]['buy_cus_name'] == undefined || MRN[i]['buy_cus_name'] == null) partyName = '';
                            else partyName = MRN[i]['buy_cus_name'].ACName;
                        } else {
                            partyName = MRN[i]['production_dept'].Description;
                        }

                        var entryno = MRN[i]['vouc_code'];
                        var range = MRN[i]['so_datemilisecond'];
                        // console.log(this.array)
                        for (let j = 0; j < this.array.length; j++) {
                            if (this.array[j].so_disc == req.body.Product) {
                                // console.log(this.array[j]);
                                if (d_c == 'C') {
                                    var qty = this.array[j].so_qty;
                                    this.balance = this.balance + qty;
                                    var arr = { 'Date': date, "Party": partyName, "EntryNo": entryno, "challan": CJSP, "plus": qty, "minus": '', "misec": range, "Balance": this.balance };
                                    this.ladger.push(arr)
                                    // console.log(main_bk);
                                }
                                if (d_c == 'D') {
                                    var qty = this.array[j].so_qty;
                                    this.balance = this.balance - qty;
                                    var arr = { 'Date': date, "Party": partyName, "EntryNo": entryno, "challan": CJSP, "plus": '', "minus": qty, "misec": range, "Balance": this.balance };
                                    this.ladger.push(arr)
                                    // console.log(main_bk);
                                    // console.log(this.balance);
                                }
                            }
                        }
                    }
                    fladger = [];
                    fin_op = 0;
                    count = 0;
                    let sd = parseInt(strtdate);
                    let ed = parseInt(enddats);
                    let a = JSON.stringify(this.ladger);
                    let larr = JSON.parse(a);
                    for (let j = 0; j < this.ladger.length; j++) {
                        if (sd <= this.ladger[j].misec && ed >= this.ladger[j].misec) {
                            count++;
                            if (j == 0) fin_op = op_bal
                            if (j > 0 && count == 1) fin_op = this.ladger[j - 1]['Balance'];
                            this.fladger.push(this.ladger[j]);
                        }
                    }

                }
            }

            res.json({ "success": true, "ladger": this.fladger, "laststock": fin_op });
        }).sort({ 'so_datemilisecond': 1 }).populate('buy_cus_name').populate('production_dept');
    });
})

router.post('/WIP_StockSummery', ensureAuthenticated, async function (req, res) {
    let stsummary;
    //    var vart =((req.body.product).toString());
    //  console.log( req.body.Product)
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    // var  buy_cus_name=req.body.buy_cus_name;
    const Srtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const Enddate = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
    var qry = { del: "N", $and: [{ so_datemilisecond: { $gte: Srtdate } }, { so_datemilisecond: { $lte: Enddate } }], co_code: req.session.compid, div_code: req.session.divid };
    var qryop = { del: "N", so_datemilisecond: { $lt: Srtdate }, co_code: req.session.compid, div_code: req.session.divid };

    summary = [];
    mil = [];
    let product = await Fgproduct.find({ masterid: req.session.masterid, del: "N" }, function (err, product) { })
    let mrnop_stk = await FinishLedger.find(qryop, function (err, MRN) { })
    FinishLedger.find(qry, function (err, MRN) {
        if (err) {
            console.log(err);
        }
        else {
            if (MRN != '' && product != '') {
                for (let item of product) {
                    opStock = 0;
                    if (item.Fg_OpStk == null || item.Fg_OpStk == undefined) opStock = 0;
                    else opStock = item.Fg_OpStk;
                    tmqty = 0;
                    toqty = 0;
                    main_bk;
                    range = 0;
                    for (let j of MRN) {
                        array = j.so_disc;
                        var main_bk = j.main_bk;
                        var d_c = j.d_c;
                        for (let i of j.sales_or_group) {
                            if (i.so_disc.equals(item._id)) {
                                if (d_c == 'C') {
                                    tmqty = tmqty + parseInt(i.so_qty);
                                }
                                if (d_c == 'D') {
                                    toqty = toqty + parseInt(i.so_qty);
                                }
                            }
                        }
                    }
                    if (mrnop_stk != '' || mrnop_stk != null) {
                        for (let j of mrnop_stk) {
                            array = j.so_disc;
                            var main_bk = j.main_bk;
                            var d_c = j.d_c;
                            for (let i of j.sales_or_group) {
                                if (i.so_disc.equals(item._id)) {
                                    if (d_c == 'C') {
                                        opStock = opStock + parseInt(i.so_qty);
                                    }
                                    if (d_c == 'D') {
                                        opStock = opStock - parseInt(i.so_qty);
                                    }
                                }
                            }
                        }
                    }
                    var arr = { 'product': item.Fg_Des, 'opstock': opStock, 'mrn': tmqty, 'outward': toqty, 'rate': item.Fg_SPrice }
                    if (arr.mrn != '' || arr.outward != '')
                        this.summary.push(arr);
                }
            }

        }
        res.json({ success: true, summary: this.summary });
    });

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

