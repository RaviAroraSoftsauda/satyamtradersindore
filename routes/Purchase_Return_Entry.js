const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let GaruAavak = require('../models/Garu_Aavak_Schema');
const moment = require('moment-timezone');
let journalmast = require('../models/trans');
let state_master = require('../models/stateSchema');
let city_master = require('../models/citySchema');
let outstanding = require('../models/outstading_schema');
let product = require('../models/fgSchema');
let division = require('../models/divSchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');
let lessmast = require('../models/addless_mast_schema');
let gowdown = require('../models/gowdawnCodeSchema');
let tax_mast = require('../models/taxSchema');
let AddLessParameter = require('../models/Add_Less_Parameter_Master_Schema');
let vouchMast = require('../models/vouchSchema');

router.get('/getadddesc', function (req, res) {
    AddLessParameter.findOne({ Module: 'Garu Aavak Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
        var AddlesArr = []
        if (AddLessParameter == null || AddLessParameter == '' || AddLessParameter == []) flag = 1;
        else {
            for (let i = 0; i < AddLessParameter.Add_Less_Parameter_Master_Array.length; i++) {
                for (let j = 0; j < AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++) {
                    if (AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid) {
                        AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                    }
                }
            }
        }
        res.json({ 'success': true, 'addmast': AddlesArr });
    });
});

router.get('/getlessdesc', function (req, res) {
    lessmast.find({ masterid: req.session.masterid, addlesstype: "-" }, function (err, lessmast) {
        res.json({ 'success': true, 'lessmast': lessmast });
    });
});
router.get('/productname', function (req, res) {
    var product = '';
    var account_masters = '';
    gowdown.find({ masterid: req.session.masterid, del: "N" }, function (err, gowdown) {
        res.json({ 'success': true, 'product': product, 'gowdown': gowdown, 'account_masters': account_masters });
    });
});
router.get('/party', function (req, res) {
    Account_master.findOne({ _id: req.query.party, masterid: req.session.masterid, del: 'N' }, function (err, account_masters) {
        Account_master.findOne({ ACCode: req.query.brCode, masterid: req.session.masterid, del: 'N' }, function (err, Direct) {
            GaruAavak.aggregate((
                [
                    { $match: { party_Code: mongoose.Types.ObjectId(req.query.party), co_code: req.session.compid, div_code: req.session.divid, main_bk: 'Sale', del: "N" } },
                    { $sort: { vouc_code: -1 } },
                    { $limit: 1 },
                    {
                        "$project": {
                            "_id": "_id",
                            "Garu_Aavak_Schema": "$$ROOT",
                        }
                    },
                    {
                        "$lookup": {
                            "localField": "Garu_Aavak_Schema.broker_Code",
                            "from": "accountSchema",
                            "foreignField": "_id",
                            "as": "accountSchema"
                        },
                    },
                    {
                        "$unwind": {
                            "path": "$accountSchema",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        "$project": {
                            "Garu_Aavak_Schema.vouc_code": "$Garu_Aavak_Schema.vouc_code",
                            "Garu_Aavak_Schema.broker_Code": "$Garu_Aavak_Schema.broker_Code",
                            "accountSchema.ACName": "$accountSchema.ACName",
                        }
                    }
                ]
            ),
                function (err, lastEntryNoBroker) {
                    GaruAavak.aggregate((
                        [
                            { $match: { party_Code: mongoose.Types.ObjectId(req.query.party), co_code: req.session.compid, div_code: req.session.divid, main_bk: 'Sale', del: "N" } },
                            { $sort: { vouc_code: -1 } },
                            { $limit: 1 },
                            {
                                "$project": {
                                    "_id": "_id",
                                    "Garu_Aavak_Schema": "$$ROOT",
                                }
                            },
                            {
                                "$lookup": {
                                    "localField": "Garu_Aavak_Schema.sl_Person",
                                    "from": "accountSchema",
                                    "foreignField": "_id",
                                    "as": "accountSchema"
                                },
                            },
                            {
                                "$unwind": {
                                    "path": "$accountSchema",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                "$project": {
                                    "Garu_Aavak_Schema.vouc_code": "$Garu_Aavak_Schema.vouc_code",
                                    "Garu_Aavak_Schema.sl_Person": "$Garu_Aavak_Schema.sl_Person",
                                    "accountSchema.ACName": "$accountSchema.ACName",
                                }
                            }
                        ]
                    ),
                        function (err, lastEntryNoSlPerson) {
                            res.json({ 'success': true, 'account_masters': account_masters, 'LastBrokerParty': lastEntryNoBroker, 'lastEntryNoSlPerson': lastEntryNoSlPerson, Direct: Direct });
                        });
                    // res.json({ 'success': true,'account_masters':account_masters,'LastBrokerParty':lastEntryNo});
                });
        })
    }).populate('broker_Code').populate('sl_Person');
});
router.get('/chackstate/:party', function (req, res) {
    // console.log(req.params.party)
    var div_state = '';
    var party_state = '';
    var dg = '';
    var pg = '';
    Account_master.find({ _id: req.params.party, del: "N" }, function (err, party) {
        division.find({ _id: req.session.divid }, function (err, division) {
            if (division[0].ac_state == undefined) div_state = '';
            else div_state = division[0].ac_state.StateCode;

            if (party[0].StateName == undefined) party_state = '';
            else party_state = party[0].StateName.StateCode;
            var party_city = '';
            if (party[0].CityName == undefined) party_city = '';
            else {
                if (party[0].CityName.StateName == undefined) party_city = '';
                else {
                    party_city = party[0].CityName.StateName.StateCode;
                }
            }

            if (division[0].ac_gstin == undefined) dg = '';
            else dg = division[0].ac_gstin.substr(0, 2);

            if (party[0].GSTIN == undefined) pg = '';
            else pg = party[0].GSTIN.substr(0, 2);

            // console.log('ds',div_state,'ps',party_state,'dg',dg,'pg',pg,'party_city',party_city);
            if (div_state == party_state || dg == pg) { //div_state == party_state|| party_city == div_state || dg == pg
                res.json({ 'success': 'true' });
            } else { res.json({ 'success': 'false' }) }
        }).populate('ac_state');
    }).populate('StateName').populate([{ path: 'CityName', model: 'citySchema', populate: { path: 'StateName', model: 'stateSchema' } }]);
});

var a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
var b = ['Hundred', 'Thousand', 'Lakh', 'Crore'];
var c_0 = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Ninteen'];
var d = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

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
        for (var i = 9 - n_length, j = 0; i < 9; i++ , j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++ , j++) {
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
router.get('/Purchase_Return_Entry_List', ensureAuthenticated, function (req, res) {
    GaruAavak.find({ main_bk: "PR", del: "N", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid }, function (err, GaruAavak) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('Purchase_Return_Entry_List.hbs', {
                pageTitle: 'Purchase Return Entry List',
                GaruAavak: GaruAavak,
                compnm: req.session.compnm,
                divnm: req.session.divmast,
                sdate: req.session.compsdate,
                edate: req.session.compedate,
                usrnm: req.session.user,
                security: req.session.security,
                administrator: req.session.administrator
            });
        }
    }).sort({ 'vouc_code': 1 }).populate('party_Code').populate('broker_Code').populate('sl_Person');
});
router.get('/Purchase_Return_Entry_Add', ensureAuthenticated, function (req, res) {
    gowdown.find({ masterid: req.session.masterid, del: "N" }, function (err, gowdown) {
        AddLessParameter.findOne({ Module: 'Purchase Return Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
            vouchMast.find({ Module: 'Purchase Return Entry', Vo_Division: { $elemMatch: { $eq: req.session.divid } }, masterid: req.session.masterid }, function (err, vouchMast) {
                GaruAavak.aggregate((
                    [{ $match: { main_bk: "PR", c_j_s_p: vouchMast[0].Vo_book, co_code: req.session.compid, div_code: req.session.divid, del: "N" } },
                    { $sort: { vouc_code: -1 } },
                    { $limit: 1 },
                    {
                        $group:
                        {
                            _id: {
                                "_id": "$vouc_code",
                            },
                            lastLotNo: { $last: "$garu_Aavak_Group" },
                        }
                    }]
                ),
                    function (err, lastEntryNo) {
                        if (err) {
                            console.log(err);
                        } else {
                            var last = 1;
                            var lotno = 1;
                            if (lastEntryNo == '') {
                                last = 1;
                                lotno = 1;
                            }
                            else {
                                last = parseInt(lastEntryNo[0]._id._id) + 1;
                                lotno = parseInt(lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No) + 1;
                            }
                            var AddlesArr = []
                            if (AddLessParameter == null || AddLessParameter == '' || AddLessParameter == []) flag = 1;
                            else {
                                for (let i = 0; i < AddLessParameter.Add_Less_Parameter_Master_Array.length; i++) {
                                    for (let j = 0; j < AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++) {
                                        if (AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid) {
                                            AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                                        }
                                    }
                                }
                            }
                            res.render('Purchase_Return_Entry_Add.hbs', {
                                pageTitle: 'Purchase Return Entry Add',
                                last: last,
                                lotno: lotno,
                                vouchMast: vouchMast,
                                gowdown: gowdown,
                                AddLessParameter: AddlesArr,
                                compnm: req.session.compnm,
                                divnm: req.session.divmast,
                                sdate: req.session.compsdate,
                                edate: req.session.compedate,
                                usrnm: req.session.user,
                                security: req.session.security,
                                administrator: req.session.administrator
                            });
                        }
                    });
            });
        });
    });
});

router.post('/add', function (req, res) {
    Account_master.findById(req.body.party_Code, function (err, acmastcustumer) {
        AddLessParameter.findOne({ Module: 'Purchase Return Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
            division.find({ _id: req.session.divid }, function (err, division) {
                GaruAavak.aggregate((
                    [{ $match: { main_bk: "PR", c_j_s_p: req.body.c_j_s_p, co_code: req.session.compid, div_code: req.session.divid, del: "N" } },
                    { $sort: { vouc_code: -1 } },
                    { $limit: 1 },
                    {
                        $group:
                        {
                            _id: {
                                "_id": "$vouc_code",
                            },
                            lastLotNo: { $last: "$garu_Aavak_Group" },
                        }
                    }]
                ),
                    async function (err, lastEntryNo) {
                        var last = 1;
                        if (lastEntryNo == '') last = 1;
                        else last = parseInt(lastEntryNo[0]._id._id) + 1;

                        var checkNo = await GaruAavak.findOne({ vouc_code: req.body.vouc_code, del: 'N', main_bk: 'PR', c_j_s_p: req.body.c_j_s_p }, function (err, aa) { }).select('vouc_code');
                        if (checkNo == null || checkNo == '') req.body.vouc_code = req.body.vouc_code;
                        else req.body.vouc_code = last;

                        if (req.body.party_Code == "") req.body.party_Code = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        if (req.body.sl_Person == "") req.body.sl_Person = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        if (req.body.broker_Code == "") req.body.broker_Code = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        let errors = req.validationErrors();
                        var entry_Date = req.body.entry_Date;
                        var entry_DateObject = moment(entry_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                        var entry_Datemilisecond = entry_DateObject.format('x');

                        var bill_Date = req.body.bill_Date;
                        var bill_DateObject = moment(bill_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                        var bill_Datemilisecond = bill_DateObject.format('x');

                        var custumer = '';
                        var intrate = '';
                        // console.log(acmastcustumer)
                        var AddlesArr = []
                        if (AddLessParameter == null || AddLessParameter == '' || AddLessParameter == []) flag = 1;
                        else {
                            for (let i = 0; i < AddLessParameter.Add_Less_Parameter_Master_Array.length; i++) {
                                for (let j = 0; j < AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++) {
                                    if (AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid) {
                                        AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                                    }
                                }
                            }
                        }
                        if (acmastcustumer.PartyType == undefined || acmastcustumer.PartyType == null) {
                            custumer = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                            intrate = 0;
                        }
                        else {
                            custumer = acmastcustumer.PartyType.pur_posting_ac;
                            intrate = acmastcustumer.ac_intrestper;
                        }
                        if (errors) {
                            console.log(errors);
                        }
                        else {
                            let dsi = new GaruAavak();
                            dsi.main_bk = "PR";
                            dsi.d_c = 'D';
                            dsi.c_j_s_p = req.body.c_j_s_p;
                            dsi.vouc_code = req.body.vouc_code;
                            dsi.entry_Date = entry_DateObject;
                            dsi.entry_Datemilisecond = entry_Datemilisecond;
                            dsi.bill_No = req.body.bill_No;
                            dsi.bill_Date = bill_DateObject;
                            dsi.bill_Datemilisecond = bill_Datemilisecond;
                            dsi.cr_Days = req.body.cr_Days;
                            dsi.due_On = req.body.due_On;
                            dsi.cashCredit = req.body.cashCredit;
                            dsi.lorry_Wagon_No = req.body.lorry_Wagon_No;
                            dsi.party_Code = req.body.party_Code;
                            dsi.broker_Code = req.body.broker_Code;
                            dsi.sl_Person = req.body.sl_Person;
                            dsi.garu_Remarks = req.body.garu_Remarks;
                            dsi.gross_Amt = req.body.gross_Amt;
                            dsi.garu_Aavak_Group = req.body.garu_Aavak_Group;
                            for (let i = 0; i < dsi.garu_Aavak_Group.length; i++) {
                                if (dsi.garu_Aavak_Group[i].purchase_Ac_Title == "") dsi.garu_Aavak_Group[i].purchase_Ac_Title = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                // dsi.garu_Aavak_Group[i].qty_blc = dsi.garu_Aavak_Group[i].qntty;
                                dsi.garu_Aavak_Group[i].qty_blc = '+';
                                dsi.garu_Aavak_Group[i].qty_exe = 0;
                            }
                            dsi.tot_Amt = req.body.tot_Amt;
                            dsi.tot_DisAmt = req.body.tot_DisAmt;
                            dsi.tot_AmtBeforeDis = req.body.tot_AmtBeforeDis;
                            dsi.tot_TaxAmt = req.body.tot_TaxAmt;
                            dsi.tot_AmtBeforeTax = req.body.tot_AmtBeforeTax;
                            dsi.add_details = req.body.add_details;
                            dsi.less_details = req.body.less_details;
                            dsi.Outstanding_Arr = req.body.outSaveArrPurReturn;
                            dsi.co_code = req.session.compid;
                            dsi.div_code = req.session.divid;
                            dsi.usrnm = req.session.user;
                            dsi.masterid = req.session.masterid;
                            dsi.del = 'N';
                            dsi.CNCL = 'N';
                            dsi.flag = 'N';
                            dsi.entrydate = new Date();
                            GaruAavak.find({ vouc_code: req.body.vouc_code, main_bk: 'PR', c_j_s_p: req.body.c_j_s_p, del: 'N' }, async function (err, dsidublicate) {
                                if (dsidublicate == null || dsidublicate == '') {
                                    dsi.save(async function (err) {
                                        if (err) res.json({ 'success': false, 'message': 'error in saving domestic sales invoice ', 'errors': err });
                                        else {
                                            dsiSave = true;
                                            let journal = new journalmast();
                                            journal.PurchaseReturn_id = dsi._id;//trans scema fetech id
                                            journal.main_bk = "PR";
                                            journal.d_c = "D";
                                            journal.vouc_code = req.body.vouc_code;
                                            journal.cash_date = entry_DateObject;
                                            journal.c_j_s_p = req.body.c_j_s_p;
                                            journal.cash_edatemilisecond = entry_Datemilisecond;
                                            journal.cashac_name = req.body.party_Code;
                                            // journal.cash_bank_name = req.body.party_Code;
                                            journal.cash_bank_name = req.body.garu_Aavak_Group[0].purchase_Ac_Title;
                                            journal.sl_Person = req.body.sl_Person;
                                            journal.broker_Code = req.body.broker_Code;
                                            journal.cash_narrtwo = 'By Purchase Return';
                                            journal.cash_narrone = 'Debit';
                                            journal.cash_type = "Purchase Return";
                                            journal.cr_Days = req.body.cr_Days;
                                            journal.due_On = req.body.due_On;
                                            journal.cashCredit = req.body.cashCredit;
                                            journal.ac_intrestper = intrate;
                                            journal.cash_remarks = req.body.garu_Remarks;
                                            journal.del = "N";
                                            journal.CNCL = 'N';
                                            journal.entrydate = new Date();
                                            journal.cash_amount = req.body.gross_Amt;
                                            journal.co_code = req.session.compid;
                                            journal.div_code = req.session.divid;
                                            journal.usrnm = req.session.user;
                                            journal.masterid = req.session.masterid;
                                            journal.save();
                                            if (req.body.garu_Aavak_Group == null || req.body.garu_Aavak_Group == '' || req.body.garu_Aavak_Group == []) {

                                            } else {
                                                for (let i = 0; i < req.body.garu_Aavak_Group.length; i++) {
                                                    let journalPrdt = new journalmast();
                                                    journalPrdt.PurchaseReturn_id = dsi._id;//trans scema fetech id
                                                    journalPrdt.main_bk = "PrdtPostingPurchaseReturn" + i;
                                                    journalPrdt.d_c = "C";
                                                    journalPrdt.vouc_code = req.body.vouc_code;
                                                    journalPrdt.cash_date = entry_DateObject;
                                                    journalPrdt.c_j_s_p = req.body.c_j_s_p;
                                                    journalPrdt.cash_edatemilisecond = entry_Datemilisecond;
                                                    journalPrdt.cashac_name = req.body.garu_Aavak_Group[i].purchase_Ac_Title;
                                                    journalPrdt.cash_bank_name = req.body.party_Code;
                                                    journalPrdt.sl_Person = req.body.sl_Person;
                                                    journalPrdt.broker_Code = req.body.broker_Code;
                                                    journalPrdt.cash_narrone = 'Product Posting';
                                                    journalPrdt.cash_narrtwo = req.body.garu_Aavak_Group[i].purchase_Ac_Title_Name;
                                                    journalPrdt.cash_type = "Purchase Return Product Posting";
                                                    journalPrdt.cash_amount = req.body.garu_Aavak_Group[i]['net_Amount'];
                                                    journalPrdt.cash_remarks = req.body.garu_Remarks
                                                    journalPrdt.del = "N";
                                                    journalPrdt.CNCL = 'N';
                                                    journalPrdt.entrydate = new Date();
                                                    journalPrdt.co_code = req.session.compid;
                                                    journalPrdt.div_code = req.session.divid;
                                                    journalPrdt.usrnm = req.session.user;
                                                    journalPrdt.masterid = req.session.masterid;
                                                    journalPrdt.save();
                                                }
                                            }
                                            for (let i = 0; i < req.body.add_details.length; i++) {
                                                if (req.body.add_details[i]['particular_add'] == "") req.body.add_details[i]['particular_add'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                                for (let j = 0; j < AddlesArr.length; j++) {
                                                    if (req.body.add_details[i]['particular_add'] == AddlesArr[j]._id) {
                                                        req.body.add_details[i]['particular_add'],
                                                            req.body.add_details[i]['particular_amount']
                                                        let journaladd = new journalmast();
                                                        journaladd.PurchaseReturn_id = dsi._id;//trans scema fetech id
                                                        journaladd.main_bk = "XPRA" + i;
                                                        journaladd.d_c = "C";
                                                        journaladd.vouc_code = req.body.vouc_code;
                                                        journaladd.cash_date = entry_DateObject;
                                                        journaladd.c_j_s_p = req.body.c_j_s_p;
                                                        journaladd.cash_edatemilisecond = entry_Datemilisecond;
                                                        journaladd.cashac_name = AddlesArr[j].Posting_Ac;
                                                        journaladd.cash_bank_name = req.body.party_Code;
                                                        journaladd.sl_Person = req.body.sl_Person;
                                                        journaladd.broker_Code = req.body.broker_Code;
                                                        journaladd.cash_narrone = 'Credit';
                                                        journaladd.cash_narrtwo = AddlesArr[j].Description;
                                                        journaladd.cash_type = "Purchase Return";
                                                        journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                                        journaladd.cash_remarks = req.body.garu_Remarks
                                                        journaladd.del = "N";
                                                        journaladd.CNCL = 'N';
                                                        journaladd.entrydate = new Date();
                                                        journaladd.co_code = req.session.compid;
                                                        journaladd.div_code = req.session.divid;
                                                        journaladd.usrnm = req.session.user;
                                                        journaladd.masterid = req.session.masterid;
                                                        journaladd.save();
                                                        // console.log('add',req.body.add_details[i]['particular_add'],addlessmast[j].sales_posting_ac)
                                                        break;
                                                    }
                                                }
                                            }
                                            // less trans entry
                                            for (let i = 0; i < req.body.less_details.length; i++) {
                                                if (req.body.less_details[i]['particular_less'] == "") req.body.less_details[i]['particular_less'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                                for (let j = 0; j < AddlesArr.length; j++) {
                                                    if (req.body.less_details[i]['particular_less'] == AddlesArr[j]._id) {
                                                        req.body.less_details[i]['particular_less'],
                                                            req.body.less_details[i]['particular_amtless']
                                                        let journalless = new journalmast();
                                                        journalless.PurchaseReturn_id = dsi._id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                                        journalless.main_bk = "XPRL" + i;
                                                        journalless.d_c = "D";
                                                        journalless.vouc_code = req.body.vouc_code;
                                                        journalless.cash_date = entry_DateObject;
                                                        journalless.c_j_s_p = req.body.c_j_s_p;
                                                        journalless.cash_edatemilisecond = entry_Datemilisecond;
                                                        journalless.cashac_name = AddlesArr[j].Posting_Ac;
                                                        journalless.cash_bank_name = req.body.party_Code;
                                                        journalless.sl_Person = req.body.sl_Person;
                                                        journalless.broker_Code = req.body.broker_Code;
                                                        journalless.cash_narrone = 'Debit';
                                                        journalless.cash_narrtwo = AddlesArr[j].Description;
                                                        journalless.cash_type = "Purchase Return";
                                                        journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                                        journalless.cash_remarks = req.body.garu_Remarks
                                                        journalless.del = "N";
                                                        journalless.CNCL = 'N';
                                                        journalless.entrydate = new Date();
                                                        journalless.co_code = req.session.compid;
                                                        journalless.div_code = req.session.divid;
                                                        journalless.usrnm = req.session.user;
                                                        journalless.masterid = req.session.masterid;
                                                        journalless.save();
                                                        break;
                                                    }
                                                }
                                            }

                                            if (req.body.outSaveArrPurReturn == null || req.body.outSaveArrPurReturn == '' || req.body.outSaveArrPurReturn == [] || req.body.outSaveArrPurReturn == undefined) flag = 1
                                            else {
                                                var outSaveArr = JSON.parse(req.body.outSaveArrPurReturn);
                                                for (let j = 0; j < outSaveArr.length; j++) {
                                                    if (parseFloat(outSaveArr[j].ReceiveAmt) > 0) {
                                                        let out = new outstanding();
                                                        out.PurchaseReturn_id = dsi._id;
                                                        // out.main_bk = "PR";
                                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                                            out.main_bk = "OnAcc";
                                                            out.OS_Type = 'ONA';
                                                        } else out.main_bk = "PR";
                                                        out.c_j_s_p = req.body.c_j_s_p;
                                                        out.d_c = "D";
                                                        out.PR_vouc_code = req.body.vouc_code;
                                                        out.cash_date = entry_DateObject;
                                                        out.cash_edatemilisecond = entry_Datemilisecond;

                                                        out.vouc_code = outSaveArr[j].vouc_code;
                                                        out.cashac_name = req.body.party_Code;
                                                        out.cash_narrtwo = 'Purchase Return ' + req.body.c_j_s_p + '/' + req.body.vouc_code;
                                                        out.cash_narrone = 'Purchase Bill ' + outSaveArr[j].c_j_s_p + '/' + outSaveArr[j].vouc_code;
                                                        out.del = "N";
                                                        out.CNCL = "N";
                                                        out.entrydate = new Date();
                                                        out.cash_amount = outSaveArr[j].cash_amount;
                                                        out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                                        out.Rec_Amount = outSaveArr[j].ReceiveAmt;

                                                        out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                                        out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                                        if (outSaveArr[j].BalanceAmt < 0) outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt * -1;
                                                        out.outstanding_balance = outSaveArr[j].BalanceAmt;
                                                        out.outstanding_amount = parseFloat(outSaveArr[j].ReceiveAmt) + parseFloat(outSaveArr[j].Add_Ded_Amt_Tot); //Calulate Outstanding Balance For Bill Collection

                                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                                            out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                                            out.op_outstanding_id = '';
                                                        } else {
                                                            out.outstanding_id = outSaveArr[j].out_id;
                                                            out.op_outstanding_id = outSaveArr[j].out_id;
                                                        }

                                                        out.op_main_bk = outSaveArr[j].main_bk;
                                                        out.op_c_j_s_p = outSaveArr[j].c_j_s_p;
                                                        out.op_co_code = outSaveArr[j].co_code;
                                                        out.op_div_code = outSaveArr[j].div_code;

                                                        out.co_code = req.session.compid;
                                                        out.div_code = req.session.divid;
                                                        out.usrnm = req.session.user;
                                                        out.masterid = req.session.masterid;
                                                        out.save();
                                                        if (outSaveArr[j].c_j_s_p != 'OnAcc') {
                                                            var OutSB = await outstanding.findById(outSaveArr[j].out_id, function (err, aa) { });
                                                            var outObj = {};
                                                            var arr = { 'Out_Entry_Id': out._id, 'main_bk': out.main_bk, 'c_j_s_p': out.c_j_s_p, 'vouc_code': out.SR_vouc_code, 'Rec_Amount': outSaveArr[j].ReceiveAmt };
                                                            OutSB.Out_recieved_Entry_Arr.push(arr);
                                                            outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance) - parseFloat(outSaveArr[j].ReceiveAmt);
                                                            outObj.Bill_Amount = parseFloat(OutSB.Bill_Amount) - parseFloat(outSaveArr[j].ReceiveAmt);
                                                            outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount) + parseFloat(outSaveArr[j].ReceiveAmt);
                                                            outObj.cash_amount = parseFloat(OutSB.cash_amount) - parseFloat(outSaveArr[j].ReceiveAmt);
                                                            outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                                            outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount) - parseFloat(outSaveArr[j].ReceiveAmt);
                                                            outstanding.update({ _id: outSaveArr[j].out_id }, outObj, function (err) {
                                                                if (err) console.log('Error', err)
                                                                else { }
                                                            })
                                                        }
                                                    }
                                                }
                                            }
                                            res.redirect('/Purchase_Return_Entry/Purchase_Return_Entry_Add');
                                        }
                                    })
                                } else {
                                    dsiSave = false;
                                    res.send("<script>alert('This Invoice No. Is Already Exist');window.location.href = '/Purchase_Return_Entry/Purchase_Return_Entry_Add'</script>");
                                }
                            })
                        }
                    })
            });
        });
    }).populate('PartyType');
});

router.get('/Purchase_Return_Entry_Update/:id', ensureAuthenticated, function (req, res) {
    var length = 0;
    gowdown.find({ masterid: req.session.masterid, del: "N" }, function (err, gowdown) {
        GaruAavak.findById(req.params.id, function (err, GaruAavak) {
            if (GaruAavak != null) {
                AddLessParameter.findOne({ Module: 'Purchase Return Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
                    vouchMast.find({ Module: 'Purchase Return Entry', Vo_Division: { $elemMatch: { $eq: req.session.divid } }, masterid: req.session.masterid }, function (err, vouchMast) {
                        outstanding.find({ PurchaseReturn_id: req.params.id, del: 'N' }, function (err, OutEntry) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (GaruAavak == null || GaruAavak == '' || GaruAavak == undefined) { length = length }
                                else length = GaruAavak.garu_Aavak_Group.length;
                                var AddlesArr = []
                                if (AddLessParameter == null || AddLessParameter == '' || AddLessParameter == []) flag = 1;
                                else {
                                    for (let i = 0; i < AddLessParameter.Add_Less_Parameter_Master_Array.length; i++) {
                                        for (let j = 0; j < AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++) {
                                            if (AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid) {
                                                AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                                            }
                                        }
                                    }
                                }
                                res.render('Purchase_Return_Entry_Update.hbs', {
                                    pageTitle: 'Update Purchase Return Entry',
                                    GaruAavak: GaruAavak,
                                    length: length,
                                    OutEntry: OutEntry,
                                    vouchMast: vouchMast,
                                    gowdown: gowdown,
                                    AddLessParameter: AddlesArr,
                                    compnm: req.session.compnm,
                                    divnm: req.session.divmast,
                                    sdate: req.session.compsdate,
                                    edate: req.session.compedate,
                                    usrnm: req.session.user,
                                    security: req.session.security,
                                    administrator: req.session.administrator
                                })
                            }
                        });
                    });
                });
            }
        }).populate('broker_Code').populate('sl_Person').populate('garu_Aavak_Group.purchase_Ac_Title').populate('garu_Aavak_Group.item_Code_Desc')
            .populate([{ path: 'party_Code', model: 'accountSchema', populate: { path: 'CityName', model: 'citySchema' } }]);
    });
});

router.post('/update/:id', function (req, res) {
    Account_master.findById(req.body.party_Code, async function (err, acmastcustumer) {
        // addlessmast.find({}, function (err,addlessmast){
        AddLessParameter.findOne({ Module: 'Purchase Return Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
            if (req.body.party_Code == "") req.body.party_Code = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.sl_Person == "") req.body.sl_Person = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.broker_Code == "") req.body.broker_Code = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let errors = req.validationErrors();
            var entry_Date = req.body.entry_Date;
            var entry_DateObject = moment(entry_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var entry_Datemilisecond = entry_DateObject.format('x');

            var bill_Date = req.body.bill_Date;
            var bill_DateObject = moment(bill_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var bill_Datemilisecond = bill_DateObject.format('x');

            var custumer = '';
            var intrate = '';
            var AddlesArr = []
            if (AddLessParameter == null || AddLessParameter == '' || AddLessParameter == []) flag = 1;
            else {
                for (let i = 0; i < AddLessParameter.Add_Less_Parameter_Master_Array.length; i++) {
                    for (let j = 0; j < AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++) {
                        if (AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid) {
                            AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                        }
                    }
                }
            }
            // console.log(acmastcustumer)
            if (acmastcustumer.PartyType == undefined || acmastcustumer.PartyType == null) {
                custumer = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                intrate = 0;
            }
            else {
                custumer = acmastcustumer.PartyType.pur_posting_ac;
                intrate = acmastcustumer.ac_intrestper;
            }
            // console.log(custumer);
            if (errors) {
                console.log(errors);
            }
            else {
                let dsi = {};
                dsi.main_bk = "PR";
                dsi.d_c = 'D';
                dsi.c_j_s_p = req.body.c_j_s_p;
                dsi.vouc_code = req.body.vouc_code;
                dsi.entry_Date = entry_DateObject;
                dsi.entry_Datemilisecond = entry_Datemilisecond;
                dsi.bill_No = req.body.bill_No;
                dsi.bill_Date = bill_DateObject;
                dsi.bill_Datemilisecond = bill_Datemilisecond;
                dsi.cr_Days = req.body.cr_Days;
                dsi.due_On = req.body.due_On;
                dsi.cashCredit = req.body.cashCredit;
                dsi.lorry_Wagon_No = req.body.lorry_Wagon_No;
                dsi.party_Code = req.body.party_Code;
                dsi.broker_Code = req.body.broker_Code;
                dsi.sl_Person = req.body.sl_Person;
                dsi.garu_Remarks = req.body.garu_Remarks;
                dsi.gross_Amt = req.body.gross_Amt;
                dsi.garu_Aavak_Group = req.body.garu_Aavak_Group;
                for (let i = 0; i < dsi.garu_Aavak_Group.length; i++) {
                    if (dsi.garu_Aavak_Group[i].purchase_Ac_Title == "") dsi.garu_Aavak_Group[i].purchase_Ac_Title = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                    // dsi.garu_Aavak_Group[i].qty_blc = dsi.garu_Aavak_Group[i].qntty;
                    dsi.garu_Aavak_Group[i].qty_blc = '+';
                    dsi.garu_Aavak_Group[i].qty_exe = 0;
                }
                dsi.tot_Amt = req.body.tot_Amt;
                dsi.tot_DisAmt = req.body.tot_DisAmt;
                dsi.tot_AmtBeforeDis = req.body.tot_AmtBeforeDis;
                dsi.tot_TaxAmt = req.body.tot_TaxAmt;
                dsi.tot_AmtBeforeTax = req.body.tot_AmtBeforeTax;
                dsi.add_details = req.body.add_details;
                dsi.less_details = req.body.less_details;
                dsi.Outstanding_Arr = req.body.outSaveArrPurReturn;
                dsi.co_code = req.session.compid;
                dsi.div_code = req.session.divid;
                dsi.usrnm = req.session.user;
                dsi.masterid = req.session.masterid;
                dsi.del = 'N';
                dsi.CNCL = 'N';
                dsi.flag = 'N';
                dsi.update = new Date();

                let query = { _id: req.params.id }
                GaruAavak.update(query, dsi, async function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
                    } else {
                        let journal = {};
                        journal.PurchaseReturn_id = req.params.id;//trans scema fetech id
                        journal.main_bk = "PR";
                        journal.d_c = "D";
                        journal.vouc_code = req.body.vouc_code;
                        journal.cash_date = entry_DateObject;
                        journal.c_j_s_p = req.body.c_j_s_p;
                        journal.cash_edatemilisecond = entry_Datemilisecond;
                        journal.cashac_name = req.body.party_Code;
                        // journal.cash_bank_name = req.body.party_Code;
                        journal.cash_bank_name = req.body.garu_Aavak_Group[0].purchase_Ac_Title;
                        journal.sl_Person = req.body.sl_Person;
                        journal.broker_Code = req.body.broker_Code;
                        journal.cash_narrtwo = 'By Purchase Return';
                        journal.cash_narrone = 'Debit';
                        journal.cash_type = "Purchase Return";
                        journal.cr_Days = req.body.cr_Days;
                        journal.due_On = req.body.due_On;
                        journal.cashCredit = req.body.cashCredit;
                        journal.ac_intrestper = intrate;
                        journal.cash_remarks = req.body.garu_Remarks
                        journal.del = "N";
                        journal.CNCL = "N";
                        journal.update = new Date();
                        journal.cash_amount = req.body.gross_Amt;
                        journal.co_code = req.session.compid;
                        journal.div_code = req.session.divid;
                        journal.usrnm = req.session.user;
                        journal.masterid = req.session.masterid;

                        query = { PurchaseReturn_id: req.params.id, main_bk: 'PR' }
                        journalmast.update(query, journal, function (err) {
                            if (err) {
                                // res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                            }
                        });
                        if (req.body.garu_Aavak_Group == null || req.body.garu_Aavak_Group == '' || req.body.garu_Aavak_Group == []) {

                        } else {
                            for (let i = 0; i < req.body.garu_Aavak_Group.length; i++) {
                                if (req.body.garu_Aavak_Group[i].UpdateGaruEntry == 'UpdateGaruEntry') {
                                    let journalPrdt = {};
                                    journalPrdt.PurchaseReturn_id = req.params.id;//trans scema fetech id
                                    journalPrdt.main_bk = "PrdtPostingPurchaseReturn" + i;
                                    journalPrdt.d_c = "C";
                                    journalPrdt.vouc_code = req.body.vouc_code;
                                    journalPrdt.cash_date = entry_DateObject;
                                    journalPrdt.c_j_s_p = req.body.c_j_s_p;
                                    journalPrdt.cash_edatemilisecond = entry_Datemilisecond;
                                    journalPrdt.cashac_name = req.body.garu_Aavak_Group[i].purchase_Ac_Title;
                                    journalPrdt.cash_bank_name = req.body.party_Code;
                                    journalPrdt.sl_Person = req.body.sl_Person;
                                    journalPrdt.broker_Code = req.body.broker_Code;
                                    journalPrdt.cash_narrone = 'Product Posting';
                                    journalPrdt.cash_narrtwo = req.body.garu_Aavak_Group[i].purchase_Ac_Title_Name;
                                    journalPrdt.cash_type = "Purchase Return";
                                    journalPrdt.cash_amount = req.body.garu_Aavak_Group[i]['net_Amount'];
                                    journalPrdt.cash_remarks = req.body.garu_Remarks
                                    journalPrdt.del = "N";
                                    journalPrdt.CNCL = "N";
                                    journalPrdt.entrydate = new Date();
                                    journalPrdt.co_code = req.session.compid;
                                    journalPrdt.div_code = req.session.divid;
                                    journalPrdt.usrnm = req.session.user;
                                    journalPrdt.masterid = req.session.masterid;
                                    var main_bk = 'PrdtPostingPurchaseReturn' + i;
                                    var queryPrdt = { PurchaseReturn_id: req.params.id, main_bk: main_bk };
                                    journalmast.update(queryPrdt, journalPrdt, function (err) {
                                        if (err) { }
                                    });
                                } else {
                                    let journalPrdt = new journalmast();
                                    journalPrdt.PurchaseReturn_id = req.params.id;//trans scema fetech id
                                    journalPrdt.main_bk = "PrdtPostingPurchaseReturn" + i;
                                    journalPrdt.d_c = "C";
                                    journalPrdt.vouc_code = req.body.vouc_code;
                                    journalPrdt.cash_date = entry_DateObject;
                                    journalPrdt.c_j_s_p = req.body.c_j_s_p;
                                    journalPrdt.cash_edatemilisecond = entry_Datemilisecond;
                                    journalPrdt.cashac_name = req.body.garu_Aavak_Group[i].purchase_Ac_Title;
                                    journalPrdt.cash_bank_name = req.body.party_Code;
                                    journalPrdt.sl_Person = req.body.sl_Person;
                                    journalPrdt.broker_Code = req.body.broker_Code;
                                    journalPrdt.cash_narrone = 'Product Posting';
                                    journalPrdt.cash_narrtwo = req.body.garu_Aavak_Group[i].purchase_Ac_Title_Name;
                                    journalPrdt.cash_type = "Purchase return";
                                    journalPrdt.cash_amount = req.body.garu_Aavak_Group[i]['net_Amount'];
                                    journalPrdt.cash_remarks = req.body.garu_Remarks
                                    journalPrdt.del = "N";
                                    journalPrdt.CNCL = "N";
                                    journalPrdt.entrydate = new Date();
                                    journalPrdt.co_code = req.session.compid;
                                    journalPrdt.div_code = req.session.divid;
                                    journalPrdt.usrnm = req.session.user;
                                    journalPrdt.masterid = req.session.masterid;
                                    journalPrdt.save();
                                }
                            }
                        }
                        for (let i = 0; i < req.body.add_details.length; i++) {
                            if (req.body.add_details[i]['particular_add'] == "") req.body.add_details[i]['particular_add'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                            for (let j = 0; j < AddlesArr.length; j++) {
                                if (req.body.add_details[i]['particular_add'] == AddlesArr[j]._id) {
                                    req.body.add_details[i]['particular_add'],
                                        req.body.add_details[i]['particular_amount']
                                    if (req.body.add_details[i]['Add_Id'] != '' && req.body.add_details[i]['Add_Id'] != undefined) {
                                        let journaladd = {};
                                        journaladd.PurchaseReturn_id = req.params.id;//trans scema fetech id AddlesArr[j].Posting_Ac;
                                        journaladd.main_bk = "XPRA" + i;
                                        journaladd.d_c = "C";
                                        journaladd.vouc_code = req.body.vouc_code;
                                        journaladd.cash_date = entry_DateObject;
                                        journaladd.c_j_s_p = req.body.c_j_s_p;
                                        journaladd.cash_edatemilisecond = entry_Datemilisecond;
                                        journaladd.cashac_name = AddlesArr[j].Posting_Ac;
                                        journaladd.cash_bank_name = req.body.party_Code;
                                        journaladd.sl_Person = req.body.sl_Person;
                                        journaladd.broker_Code = req.body.broker_Code;
                                        journaladd.cash_narrone = 'Credit';
                                        journaladd.cash_narrtwo = AddlesArr[j].Description;
                                        journaladd.cash_type = "Purchase Return";
                                        journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                        journaladd.cash_remarks = req.body.garu_Remarks
                                        journaladd.del = "N";
                                        journaladd.CNCL = "N";
                                        journaladd.update = new Date();
                                        journaladd.co_code = req.session.compid;
                                        journaladd.div_code = req.session.divid;
                                        journaladd.usrnm = req.session.user;
                                        journaladd.masterid = req.session.masterid;
                                        var main_bk = 'XPRA' + i;
                                        var queryadd = { PurchaseReturn_id: req.params.id, main_bk: main_bk };
                                        journalmast.update(queryadd, journaladd, function (err) {
                                            if (err) {
                                                // res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                                            }
                                        });
                                        break;
                                    } else {
                                        let journaladd = new journalmast();
                                        journaladd.PurchaseReturn_id = req.params.id;//trans scema fetech id
                                        journaladd.main_bk = "XPRA" + i;
                                        journaladd.d_c = "C";
                                        journaladd.vouc_code = req.body.vouc_code;
                                        journaladd.cash_date = entry_DateObject;
                                        journaladd.c_j_s_p = req.body.c_j_s_p;
                                        journaladd.cash_edatemilisecond = entry_Datemilisecond;
                                        journaladd.cashac_name = AddlesArr[j].Posting_Ac;
                                        journaladd.cash_bank_name = req.body.party_Code;
                                        journaladd.sl_Person = req.body.sl_Person;
                                        journaladd.broker_Code = req.body.broker_Code;
                                        journaladd.cash_narrone = 'Credit';
                                        journaladd.cash_narrtwo = AddlesArr[j].Description;
                                        journaladd.cash_type = "Purchase Return";
                                        journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                        journaladd.cash_remarks = req.body.garu_Remarks
                                        journaladd.del = "N";
                                        journaladd.CNCL = "N";
                                        journaladd.entrydate = new Date();
                                        journaladd.co_code = req.session.compid;
                                        journaladd.div_code = req.session.divid;
                                        journaladd.usrnm = req.session.user;
                                        journaladd.masterid = req.session.masterid;
                                        journaladd.save();
                                        break;
                                    }
                                }
                            }
                        }
                        // less trans entry
                        for (let i = 0; i < req.body.less_details.length; i++) {
                            if (req.body.less_details[i]['particular_less'] == "") req.body.less_details[i]['particular_less'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                            for (let j = 0; j < AddlesArr.length; j++) {
                                if (req.body.less_details[i]['particular_less'] == AddlesArr[j]._id) {
                                    req.body.less_details[i]['particular_less'],
                                        req.body.less_details[i]['particular_amtless']
                                    if (req.body.less_details[i]['Less_Id'] != '' && req.body.less_details[i]['Less_Id'] != undefined) {
                                        let journalless = {};
                                        journalless.PurchaseReturn_id = req.params.id;//trans scema fetech id   AddlesArr[j].Posting_Ac;
                                        journalless.main_bk = "XPRL" + i;
                                        journalless.d_c = "D";
                                        journalless.vouc_code = req.body.vouc_code;
                                        journalless.cash_date = entry_DateObject;
                                        journalless.c_j_s_p = req.body.c_j_s_p;
                                        journalless.cash_edatemilisecond = entry_Datemilisecond;
                                        journalless.cashac_name = AddlesArr[j].Posting_Ac;
                                        journalless.cash_bank_name = req.body.party_Code;
                                        journalless.sl_Person = req.body.sl_Person;
                                        journalless.broker_Code = req.body.broker_Code;
                                        journalless.cash_narrone = 'Debit';
                                        journalless.cash_narrtwo = AddlesArr[j].Description;
                                        journalless.cash_type = "Purchase Return";
                                        journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                        journalless.cash_remarks = req.body.garu_Remarks
                                        journalless.del = "N";
                                        journalless.CNCL = "N";
                                        journalless.update = new Date();
                                        journalless.co_code = req.session.compid;
                                        journalless.div_code = req.session.divid;
                                        journalless.usrnm = req.session.user;
                                        journalless.masterid = req.session.masterid;
                                        var main_bk = 'XPRL' + i;
                                        var queryless = { PurchaseReturn_id: req.params.id, main_bk: main_bk };
                                        journalmast.update(queryless, journalless, function (err) {
                                            if (err) {
                                                console.log(err);
                                                // res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                                            }
                                        });
                                        break;
                                    } else {
                                        let journalless = new journalmast();
                                        journalless.PurchaseReturn_id = req.params.id; //trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                        journalless.main_bk = "XPRL" + i;
                                        journalless.d_c = "D";
                                        journalless.vouc_code = req.body.vouc_code;
                                        journalless.cash_date = entry_DateObject;
                                        journalless.c_j_s_p = req.body.c_j_s_p;
                                        journalless.cash_edatemilisecond = entry_Datemilisecond;
                                        journalless.cashac_name = AddlesArr[j].Posting_Ac;
                                        journalless.cash_bank_name = req.body.party_Code;
                                        journalless.sl_Person = req.body.sl_Person;
                                        journalless.broker_Code = req.body.broker_Code;
                                        journalless.cash_narrone = 'Debit';
                                        journalless.cash_narrtwo = AddlesArr[j].Description;
                                        journalless.cash_type = "Purchase Return";
                                        journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                        journalless.cash_remarks = req.body.garu_Remarks
                                        journalless.del = "N";
                                        journalless.CNCL = "N";
                                        journalless.entrydate = new Date();
                                        journalless.co_code = req.session.compid;
                                        journalless.div_code = req.session.divid;
                                        journalless.usrnm = req.session.user;
                                        journalless.masterid = req.session.masterid;
                                        journalless.save();
                                        break;
                                    }
                                }
                            }
                        }
                        if (req.body.outSaveArrPurReturn == null || req.body.outSaveArrPurReturn == '' || req.body.outSaveArrPurReturn == [] || req.body.outSaveArrPurReturn == undefined) flag = 1
                        else {
                            var outSaveArr = JSON.parse(req.body.outSaveArrPurReturn);
                            for (let j = 0; j < outSaveArr.length; j++) {
                                if (parseFloat(outSaveArr[j].ReceiveAmt) > 0) {
                                    if (outSaveArr[j].OutEntry_id == null || outSaveArr[j].OutEntry_id == '' || outSaveArr[j].OutEntry_id == undefined) {
                                        let out = new outstanding();
                                        out.PurchaseReturn_id = req.params.id;
                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                            out.main_bk = "OnAcc";
                                            out.OS_Type = 'ONA';
                                        }
                                        else out.main_bk = "SR";
                                        out.c_j_s_p = req.body.c_j_s_p;
                                        out.d_c = "C";
                                        out.CN_vouc_code = req.body.vouc_code;
                                        out.vouc_code = outSaveArr[j].vouc_code;
                                        out.cash_date = entry_DateObject;
                                        out.cash_edatemilisecond = entry_Datemilisecond;
                                        out.cashac_name = req.body.party_Code;
                                        // out.cash_bank_name = req.body.cash_bank_name;
                                        out.cash_narrtwo = 'Oustanding';
                                        out.cash_narrone = 'Sale Return Entry';
                                        out.del = "N";
                                        out.CNCL = "N";
                                        out.entrydate = new Date();
                                        out.cash_amount = outSaveArr[j].ReceiveAmt;
                                        out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                        out.Bill_Date = outSaveArr[j].Bill_Date;
                                        out.Rec_Amount = outSaveArr[j].ReceiveAmt;
                                        // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                        // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                        if (outSaveArr[j].BalanceAmt < 0) outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt * -1;
                                        out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                        out.outstanding_amount = outSaveArr[j].ReceiveAmt //Calulate Outstanding Balance For Bill Collection
                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                            out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                            out.op_outstanding_id = '';
                                        } else {
                                            out.outstanding_id = outSaveArr[j].out_id;
                                            out.op_outstanding_id = outSaveArr[j].out_id;
                                        }

                                        out.op_main_bk = outSaveArr[j].main_bk;
                                        out.op_c_j_s_p = outSaveArr[j].c_j_s_p;
                                        out.op_co_code = outSaveArr[j].co_code;
                                        out.op_div_code = outSaveArr[j].div_code;

                                        out.co_code = req.session.compid;
                                        out.div_code = req.session.divid;
                                        out.usrnm = req.session.user;
                                        out.masterid = req.session.masterid;
                                        out.save();
                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                        }
                                        else {
                                            var OutSB = await outstanding.findById(outSaveArr[j].out_id, function (err, aa) { });
                                            var arr = { 'Out_Entry_Id': out._id, 'main_bk': out.main_bk, 'c_j_s_p': out.c_j_s_p, 'vouc_code': out.CN_vouc_code, 'Rec_Amount': outSaveArr[j].ReceiveAmt };
                                            OutSB.Out_recieved_Entry_Arr.push(arr);
                                            var outObj = {};
                                            outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance) - parseFloat(outSaveArr[j].ReceiveAmt);
                                            outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                            outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount) + parseFloat(outSaveArr[j].ReceiveAmt);
                                            outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount) - parseFloat(outSaveArr[j].ReceiveAmt);
                                            outstanding.update({ _id: outSaveArr[j].out_id }, outObj, function (err) {
                                                if (err) console.log('Error', err)
                                                else { }
                                            })
                                        }
                                    } else {
                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                        }
                                        else {
                                            var OutSB = await outstanding.findById(outSaveArr[j].out_id, function (err, aa) { });
                                            var OutEntry = await outstanding.findById(outSaveArr[j].OutEntry_id, function (err, aa) { });
                                            var outObj = {};
                                            outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance) + parseFloat(OutEntry.Rec_Amount);
                                            outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount) - parseFloat(OutEntry.Rec_Amount);
                                            outObj.outstanding_amount = parseFloat(OutSB.outstanding_balance) + parseFloat(OutEntry.Rec_Amount);
                                            outstanding.update({ _id: outSaveArr[j].out_id }, outObj, function (err) {
                                                if (err) console.log('Error', err)
                                                else { }
                                            })
                                        }
                                        let out = {};
                                        out.PurchaseReturn_id = req.params.id;
                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                            out.main_bk = "OnAcc";
                                            out.OS_Type = 'ONA';
                                        }
                                        else out.main_bk = "SN";
                                        out.c_j_s_p = req.body.c_j_s_p;
                                        out.d_c = "C";
                                        out.CN_vouc_code = req.body.vouc_code;
                                        out.vouc_code = outSaveArr[j].vouc_code;
                                        out.cash_date = entry_DateObject;
                                        out.cash_edatemilisecond = entry_Datemilisecond;
                                        out.cashac_name = req.body.party_Code;
                                        // out.cash_bank_name = req.body.cash_bank_name;
                                        out.cash_narrtwo = 'Oustanding';
                                        out.cash_narrone = 'Sale Return Entry';
                                        out.del = "N";
                                        out.CNCL = "N";
                                        out.entrydate = new Date();
                                        out.cash_amount = outSaveArr[j].ReceiveAmt;
                                        out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                        out.Bill_Date = outSaveArr[j].Bill_Date;
                                        out.Rec_Amount = outSaveArr[j].ReceiveAmt;
                                        // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                        // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                        if (outSaveArr[j].BalanceAmt < 0) outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt * -1;
                                        out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);

                                        out.outstanding_amount = parseFloat(outSaveArr[j].ReceiveAmt) //Calulate Outstanding Balance For Bill Collection
                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                            out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                            out.op_outstanding_id = '';
                                        } else {
                                            out.outstanding_id = outSaveArr[j].out_id;
                                            out.op_outstanding_id = outSaveArr[j].out_id;
                                        }

                                        out.op_main_bk = outSaveArr[j].main_bk;
                                        out.op_c_j_s_p = outSaveArr[j].c_j_s_p;
                                        out.op_co_code = outSaveArr[j].co_code;
                                        out.op_div_code = outSaveArr[j].div_code;

                                        out.co_code = req.session.compid;
                                        out.div_code = req.session.divid;
                                        out.usrnm = req.session.user;
                                        out.masterid = req.session.masterid;

                                        outstanding.update({ _id: outSaveArr[j].OutEntry_id }, out, function (err) { });
                                        if (outSaveArr[j].c_j_s_p == 'OnAcc') {
                                        }
                                        else {
                                            var OutSB = await outstanding.findById(outSaveArr[j].out_id, function (err, aa) { });
                                            var outObj = {};
                                            var count = 0;
                                            var arr = { 'Out_Entry_Id': outSaveArr[j].OutEntry_id, 'main_bk': out.main_bk, 'c_j_s_p': out.c_j_s_p, 'vouc_code': out.CN_vouc_code, 'Rec_Amount': outSaveArr[j].ReceiveAmt };
                                            if (OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == []) OutSB.Out_recieved_Entry_Arr.push(arr);
                                            else {
                                                for (let r = 0; r < OutSB.Out_recieved_Entry_Arr.length; r++) {
                                                    if (JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outSaveArr[j].OutEntry_id)) {
                                                        OutSB.Out_recieved_Entry_Arr[r] = arr;
                                                        count = count + 1;
                                                        break;
                                                    }
                                                }
                                                if (count == 0) OutSB.Out_recieved_Entry_Arr.push(arr);
                                            }

                                            outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance) - parseFloat(outSaveArr[j].ReceiveAmt);
                                            outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                            outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount) + parseFloat(outSaveArr[j].ReceiveAmt);
                                            outObj.outstanding_amount = parseFloat(OutSB.outstanding_balance) - parseFloat(outSaveArr[j].ReceiveAmt);
                                            outstanding.update({ _id: outSaveArr[j].out_id }, outObj, function (err) {
                                                if (err) console.log('Error', err)
                                                else { }
                                            })
                                        }
                                    }
                                }
                            }
                        }
                        res.redirect('/Purchase_Return_Entry/Purchase_Return_Entry_List');
                    }
                })
            }
        });
    }).populate('PartyType');
});

router.delete('/delete/:id', function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    } else {
        let query = { _id: req.params.id }
        let Garu = {};
        Garu.del = 'Y';
        Garu.delete = new Date();
        GaruAavak.update(query, Garu, function (err, somast) {
            if (err) {
                console.log(err);
            }
            var trans = {};
            trans.del = 'Y';
            trans.delete = new Date();
            querytrans = { PurchaseReturn_id: req.params.id };
            journalmast.updateMany(querytrans, trans, async function (err, trans) {
                if (err) res.json({ 'success': "false" });
                else {
                    var trans = {};
                    trans.del = 'Y';
                    trans.delete = new Date();
                    var outSR = await outstanding.find({ PurchaseReturn_id: req.params.id }, function (err, aa) { });
                    outstanding.updateMany({ PurchaseReturn_id: req.params.id }, trans, function (err) { });
                    if (outSR == null || outSR == '' || outSR == []) {

                    } else {
                        for (let i = 0; i < outSR.length; i++) {
                            if (outSR[i].outstanding_id == null || outSR[i].outstanding_id == '' || outSR[i].outstanding_id == undefined) {
                                outstanding.update({ _id: outSR[i]._id }, trans, function (err) { });
                            } else {
                                var OutSB = await outstanding.findById(outSR[i].outstanding_id, function (err, aa) { });
                                var outObj = {};
                                if (OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == []) { }
                                else {
                                    for (let r = 0; r < OutSB.Out_recieved_Entry_Arr.length; r++) {
                                        if (JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outSR[i]._id)) {
                                            OutSB.Out_recieved_Entry_Arr.splice(r, 1);
                                            break;
                                        }
                                    }
                                }
                                outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance) + parseFloat(outSR[i].Rec_Amount);
                                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount) - parseFloat(outSR[i].Rec_Amount);
                                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount) - parseFloat(outSR[i].Rec_Amount);
                                outObj.cash_amount = parseFloat(OutSB.cash_amount) + parseFloat(outSR[i].Rec_Amount);
                                outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount) + parseFloat(outSR[i].Rec_Amount);
                                outstanding.update({ _id: OutSB._id }, outObj, function (err) {
                                    if (err) console.log('Error', err)
                                    else { console.log('success') };
                                })
                            }
                            // outstanding.update({_id:outSR[i]._id},trans,function(err){});
                        }
                    }
                    res.json({ 'success': "true" });
                }
            });
        });
    }
});

router.get('/Tax_Master', function (req, res) {
    var qry = req.query.term.term;
    tax_mast.find({ $or: [{ 'tx_Thead': { $regex: new RegExp("^" + qry, "i") } }], del: 'N', masterid: req.session.masterid }, 'tx_Thead', function (err, party) {
        var data = new Array();
        if (party != undefined) {
            for (var j = 0; j < party.length; j++) {
                data[j] = {
                    "id": party[j]._id,
                    "text": party[j].tx_Thead
                };
            }
            res.json({
                'results': data, "pagination": {
                    "more": false
                }
            });
        }
    }).sort({ 'tx_Thead': 1 });
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









// GaruAavak.findById(req.params.id, function(err, GaruAavak){
//     journalmast.find({_ID:req.params.id}, function (err, journ){
//         outstanding.find({_ID:req.params.id}, function (err, outst){
//    GaruAavak.remove(query, function(err){
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