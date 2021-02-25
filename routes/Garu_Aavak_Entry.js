const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let GaruAavak = require('../models/Garu_Aavak_Schema');
let Sale = require('../models/Garu_Aavak_Schema');
let somast = require('../models/pur_order_Schema');
const moment = require('moment-timezone');
let journalmast = require('../models/trans');
let acmast = require('../models/ac_mast');
let state_master = require('../models/stateSchema');
let city_master = require('../models/citySchema');
let outstanding = require('../models/outstading_schema');
let product = require('../models/fgSchema');
let brand = require('../models/brandSchema');
let division = require('../models/divSchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');
let addmast = require('../models/addless_mast_schema');
let lessmast = require('../models/addless_mast_schema');
let addlessmast = require('../models/addless_mast_schema');
let gowdown = require('../models/gowdawnCodeSchema');
let g_mast = require('../models/groupSchema');
let ptyp_mast = require('../models/partyTypeSchema');
let tax_mast = require('../models/taxSchema');
let subquality = require('../models/subqualitySchema');
let quality = require('../models/qualitySchema');
let catogry = require('../models/CategorySchema');
let modulesch = require('../models/module');
let AddLessParameter = require('../models/Add_Less_Parameter_Master_Schema');
let taxctg_mast = require('../models/taxctgSchema');
let Stock_Unit = require('../models/skuSchema');
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
            if (party != null) {
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
            }
        }).populate('ac_state');
    }).populate('StateName').populate([{ path: 'CityName', model: 'citySchema', populate: { path: 'StateName', model: 'stateSchema' } }]);
});
router.get('/brparty', function (req, res) {
    Gs_master.findOne({ group: 'SUPPLIER' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        var a;
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    else cityname = party[j]['CityName']['CityName'];
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/customerName', function (req, res, next) {
    var qry = req.query.term.term;
    if (qry == undefined || qry == {} || qry == null || qry == '') {
        res.json({ 'success': false });
    }
    else {
        Gs_master.findOne({ group: 'CUSTOMER' }, function (err, gs_master) {
            if (qry == undefined || qry == null) FLAG = 1;
            else qry = qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
            var qryGs = [];
            for (let i = 0; i < gs_master.garry.length; i++) {
                qryGs.push(gs_master.garry[i])
            }
            Account_master.find({ $or: [{ 'ACName': { $regex: "^" + qry, $options: "si" } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, masterid: req.session.masterid }, 'ACName', function (err, party) {
                if (err) next(err);
                else {
                    var data = new Array();
                    if (party != undefined) {
                        for (var j = 0; j < party.length; j++) {
                            if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                            else cityname = party[j]['CityName']['CityName'];
                            data[j] = {
                                "id": party[j]._id,
                                "text": party[j].ACName + ',' + cityname
                            };
                        }
                        res.json({
                            'results': data, "pagination": {
                                "more": false
                            }
                        });
                    }
                }
            }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
        })
    }
});
router.get('/bankrenclName', function (req, res) {
    Gs_master.findOne({ group: 'BANK' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    // if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    // else cityname = party[j]['CityName']['CityName'];
                    // + ','+ cityname
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/broker_Code', function (req, res) {
    Gs_master.findOne({ group: 'BROKER' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    else cityname = party[j]['CityName']['CityName'];
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/sl_Person', function (req, res) {
    Gs_master.findOne({ group: 'SALE PERSON' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        if (qry != undefined) qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    else cityname = party[j]['CityName']['CityName'];
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/PurAcInSaleEntry', function (req, res) {
    Gs_master.findOne({ group: 'PURCHASE AC TITLE' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    else cityname = party[j]['CityName']['CityName'];
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/cashbankname', function (req, res) {
    Gs_master.findOne({ group: 'CASH AND BANK' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    else cityname = party[j]['CityName']['CityName'];
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/AllAccount', function (req, res) {
    var qry = req.query.term.term;
    if (qry == undefined || qry == null) FLAG = 1;
    else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
    Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
        var data = new Array();
        if (party != undefined) {
            for (var j = 0; j < party.length; j++) {
                if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                else cityname = party[j]['CityName']['CityName'];
                if (party[j]['GroupName'] == null || party[j]['GroupName'] == undefined || party[j]['GroupName'] == '') grpname = "";
                else grpname = party[j]['GroupName']['GroupName'];
                data[j] = {
                    "id": party[j]._id,
                    "text": party[j].ACName + ',' + cityname
                };
            }
            res.json({
                'results': data, "pagination": {
                    "more": false
                }
            });
        }
    }).sort({ 'ACName': 1 }).populate('GroupName').populate('CityName').limit(100);
});
router.get('/AllAccountWithOutCashBank', function (req, res) {
    var qry = req.query.term.term;
    if (qry == undefined || qry == null) FLAG = 1;
    else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
    Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
        var data = new Array();
        if (party != undefined) {
            for (var j = 0; j < party.length; j++) {
                var grpname = '';
                if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                else cityname = party[j]['CityName']['CityName'];
                if (party[j]['GroupName'] == null || party[j]['GroupName'] == undefined || party[j]['GroupName'] == '') grpname = "";
                else grpname = party[j]['GroupName']['GroupName'];
                if (grpname == "CASH" || grpname == "BANK ACCOUNTS" || grpname == "CASH ACCOUNTS" || grpname == "BANK") flag = 1;
                else {
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
            }
            res.json({
                'results': data, "pagination": {
                    "more": false
                }
            });
        }
    }).sort({ 'ACName': 1 }).populate('GroupName').populate('CityName').limit(100);
});
router.get('/Credit_Debit_AC', function (req, res) {
    var qry = req.query.term.term;
    if (qry == undefined || qry == null) FLAG = 1;
    else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
    Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
        var data = new Array();
        if (party != undefined) {
            for (var j = 0; j < party.length; j++) {
                if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                else cityname = party[j]['CityName']['CityName'];
                if (party[j]['GroupName'] == null || party[j]['GroupName'] == undefined || party[j]['GroupName'] == '') grpname = "";
                else grpname = party[j]['GroupName']['GroupName'];
                if (grpname == "CASH" || grpname == "BANK ACCOUNTS" || grpname == "CASH ACCOUNTS" || grpname == "BANK") flag = 1;
                else {
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
            }
            res.json({
                'results': data, "pagination": {
                    "more": false
                }
            });
        }
    }).sort({ 'ACName': 1 }).populate('GroupName').populate('CityName').limit(100);
});
router.get('/Posting_Ac', function (req, res) {
    Gs_master.findOne({ group: 'POSTING ACCOUNT' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    else cityname = party[j]['CityName']['CityName'];
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/Expense_Acc', function (req, res) {
    Gs_master.findOne({ group: 'Expense A/C' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    else cityname = party[j]['CityName']['CityName'];
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/Expense_Acc', function (req, res) {
    Gs_master.findOne({ group: 'Expense A/C' }, function (err, gs_master) {
        var qry = req.query.term.term;
        if (qry == undefined || qry == null) FLAG = 1;
        else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        Account_master.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': qry }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                    else cityname = party[j]['CityName']['CityName'];
                    data[j] = {
                        "id": party[j]._id,
                        "text": party[j].ACName + ',' + cityname
                    };
                }
                res.json({
                    'results': data, "pagination": {
                        "more": false
                    }
                });
            }
        }).sort({ 'ACName': 1 }).populate('CityName').limit(100);
    })
});
router.get('/productlist', function (req, res) {
    var item = req.query.item;
    console.log(item)
    var party = req.query.party;
    GaruAavak.find({ "garu_Aavak_Group": { $elemMatch: { item_Code_Desc: item } }, party_Code: party, co_code: req.session.compid, div_code: req.session.divid, main_bk: "GAE" }, function (err, GaruAavakRate) {
        Sale.find({ "garu_Aavak_Group": { $elemMatch: { item_Code_Desc: item } }, party_Code: party, co_code: req.session.compid, div_code: req.session.divid, main_bk: "Sale" }, function (err, SaleRate) {
            // console.log('196',SaleRate);
            product.find({ _id: item, masterid: req.session.masterid, del: "N" }, function (err, product) {
                Account_master.find({ _id: party, del: "N" }, function (err, party) {
                    division.find({ _id: req.session.divid }, function (err, division) {
                        // console.log('division',division)
                        // console.log('party',party)
                        if (division[0].ac_state == undefined) div_state = '';
                        else div_state = division[0].ac_state.StateCode;

                        if (party[0].StateName == undefined) party_state = '';
                        else party_state = party[0].StateName.StateCode;

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
                        if (div_state == party_state || party_city == div_state || dg == pg) {
                            res.json({ 'success': true, 'product': product, 'State': 'true', 'partytype': party[0].PartyType, 'GaruAavakRate': GaruAavakRate, 'SaleRate': SaleRate });
                        } else {
                            res.json({ 'success': true, 'product': product, 'State': 'false', 'partytype': party[0].PartyType, 'GaruAavakRate': GaruAavakRate, 'SaleRate': SaleRate });
                        }
                    }).select('ac_state').select('ac_gstin').populate('ac_state');
                }).populate('StateName').populate([{ path: 'CityName', model: 'citySchema', populate: { path: 'StateName', model: 'stateSchema' } }]);
            }).populate('product_posting_setup.accontnm').populate('product_posting_setup.selesid').populate('product_posting_setup.partypid');
        }).sort('-vouc_code').select('garu_Aavak_Group');
    }).sort('-vouc_code').select('garu_Aavak_Group');
})
router.get('/GetBook', ensureAuthenticated, function (req, res) {
    vouchMast.find({ Module: req.query.Module, Vo_book: req.query.c_j_s_p, Vo_Division: { $elemMatch: { $eq: req.session.divid } }, masterid: req.session.masterid }, function (err, vouchMast) {
        if (vouchMast == null || vouchMast == [] || vouchMast == '') {
            res.json({ 'success': false });
        } else {
            GaruAavak.aggregate((
                [{ $match: { c_j_s_p: vouchMast[0].Vo_book, co_code: req.session.compid, div_code: req.session.divid, del: "N" } },
                { $sort: { vouc_code: -1 } },
                { $limit: 1 },
                {
                    $group:
                    {
                        _id: {
                            "_id": "$vouc_code",
                        },
                    }
                }]
            ),
                function (err, lastEntryNo) {
                    // console.log(lastEntryNo);
                    if (err) {
                        console.log(err);
                    } else {
                        var last = 1;
                        if (lastEntryNo == '' || lastEntryNo == null || lastEntryNo == [] || lastEntryNo == undefined) res.json({ success: true, last: last });
                        else res.json({ success: true, last: parseInt(lastEntryNo[0]._id._id) + 1 });
                    }
                });
        }
    });
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

router.get('/Garu_Aavak_Entry_Add', ensureAuthenticated, function (req, res) {
    gowdown.find({ masterid: req.session.masterid, del: "N" }, function (err, gowdown) {
        AddLessParameter.findOne({ Module: 'Garu Aavak Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
            vouchMast.find({ Module: 'Garu Aavak Entry', Vo_Division: { $elemMatch: { $eq: req.session.divid } }, masterid: req.session.masterid }, function (err, vouchMast) {
                GaruAavak.aggregate((
                    [{ $match: { main_bk: "GAE", c_j_s_p: vouchMast[0].Vo_book, co_code: req.session.compid, div_code: req.session.divid, del: "N" } },
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
                            // console.log(lastEntryNo[0]._id._id);
                            // console.log(lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length-1].lot_No);
                            var last = 1;
                            var lotno = 1;
                            if (lastEntryNo == '') {
                                last = 1;
                                lotno = 1;
                            }
                            else {
                                last = parseInt(lastEntryNo[0]._id._id) + 1;
                                if (lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No == null || lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No == undefined || isNaN(lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No)) {
                                    lotno = 1;
                                } else {
                                    lotno = parseInt(lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No) + 1;
                                }
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
                            // console.log(vouchMast);
                            res.render('Garu_Aavak_Entry_Add.hbs', {
                                pageTitle: 'Garu Aavak Entry',
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

router.get('/Goods_Outward_Note_Add', ensureAuthenticated, function (req, res) {
    gowdown.find({ masterid: req.session.masterid, del: "N" }, function (err, gowdown) {
        AddLessParameter.findOne({ Module: 'Goods Outward Note', masterid: req.session.masterid }, function (err, AddLessParameter) {
            vouchMast.find({ Module: 'Goods Outward Note', Vo_Division: { $elemMatch: { $eq: req.session.divid } }, masterid: req.session.masterid }, function (err, vouchMast) {
                GaruAavak.aggregate((
                    [{ $match: { main_bk: "GOT", c_j_s_p: req.body.c_j_s_p, co_code: req.session.compid, div_code: req.session.divid, del: "N" } },
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
                            // console.log(lastEntryNo[0]._id._id);
                            // console.log(lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length-1].lot_No);
                            var last = 1;
                            var lotno = 1;
                            if (lastEntryNo == '') {
                                last = 1;
                                lotno = 1;
                            }
                            else {
                                last = parseInt(lastEntryNo[0]._id._id) + 1;
                                if (lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No == null || lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No == undefined || isNaN(lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No)) {
                                    lotno = 1;
                                } else {
                                    lotno = parseInt(lastEntryNo[0].lastLotNo[lastEntryNo[0].lastLotNo.length - 1].lot_No) + 1;
                                }
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
                            // console.log(vouchMast);
                            res.render('Goods_Outward_Note_Add.hbs', {
                                pageTitle: 'Goods Outward Note',
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
        // addlessmast.find({}, function (err,addlessmast){
        AddLessParameter.findOne({ Module: 'Garu Aavak Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
            division.find({ _id: req.session.divid }, function (err, division) {
                GaruAavak.aggregate((
                    [{ $match: { main_bk: "GAE", c_j_s_p: req.body.c_j_s_p, co_code: req.session.compid, div_code: req.session.divid, del: "N" } },
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

                        var checkNo = await GaruAavak.findOne({ vouc_code: req.body.vouc_code, del: 'N', main_bk: 'GAE', c_j_s_p: req.body.c_j_s_p }, function (err, aa) { }).select('vouc_code');
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
                            dsi.main_bk = "GAE";
                            dsi.d_c = 'C';
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

                            dsi.sl_Person = req.body.sl_Person;  // Entry Removed AkshatDalke

                            //AkshatDalke
                            dsi.transport = req.body.transport;
                            dsi.vehicle = req.body.vehicle;
                            dsi.driver = req.body.driver;
                            dsi.mobile = req.body.mobile;
                            dsi.tot_Qty = req.body.tot_Amt;
                            dsi.tot_weight = req.body.tot_weight;
                            //AkshatDalke

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
                            // dsi.less_details = req.body.less_details;
                            dsi.less_details = [];
                            dsi.co_code = req.session.compid;
                            dsi.div_code = req.session.divid;
                            dsi.usrnm = req.session.user;
                            dsi.masterid = req.session.masterid;
                            dsi.del = 'N';
                            dsi.CNCL = 'N';
                            dsi.flag = 'N';
                            dsi.entrydate = new Date();
                            GaruAavak.find({ vouc_code: req.body.vouc_code, main_bk: 'GAE', c_j_s_p: req.body.c_j_s_p, del: 'N' }, function (err, dsidublicate) {
                                if (dsidublicate == null || dsidublicate == '') {
                                    dsi.save(function (err) {
                                        if (err) res.json({ 'success': false, 'message': 'error in saving domestic sales invoice ', 'errors': err });
                                        else {
                                            dsiSave = true;
                                            let journal = new journalmast();
                                            journal.GaruEntry_id = dsi._id;//trans scema fetech id
                                            journal.main_bk = "PB";
                                            journal.d_c = "C";
                                            journal.vouc_code = req.body.vouc_code;
                                            journal.cash_date = entry_DateObject;
                                            journal.c_j_s_p = req.body.c_j_s_p;
                                            journal.cash_edatemilisecond = entry_Datemilisecond;
                                            journal.cashac_name = req.body.party_Code;
                                            // journal.cash_bank_name = req.body.party_Code;
                                            journal.cash_bank_name = req.body.garu_Aavak_Group[0].purchase_Ac_Title;

                                            journal.sl_Person = req.body.sl_Person; //Entry Removed AkshatDalke

                                            //AkshatDalke
                                            journal.transport = req.body.transport;
                                            journal.vehicle = req.body.vehicle;
                                            journal.driver = req.body.driver;
                                            journal.mobile = req.body.mobile;
                                            dsi.tot_Qty = req.body.tot_Amt;
                                            dsi.tot_weight = req.body.tot_weight;
                                            //AkshatDalke

                                            journal.broker_Code = req.body.broker_Code;
                                            journal.cash_narrtwo = 'By Purchase';
                                            journal.cash_narrone = 'Credit';
                                            journal.cash_type = "Purchase";
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
                                                    journalPrdt.GaruEntry_id = dsi._id;//trans scema fetech id
                                                    journalPrdt.main_bk = "PrdtPostingGaru" + i;
                                                    journalPrdt.d_c = "D";
                                                    journalPrdt.vouc_code = req.body.vouc_code;
                                                    journalPrdt.cash_date = entry_DateObject;
                                                    journalPrdt.c_j_s_p = req.body.c_j_s_p;
                                                    journalPrdt.cash_edatemilisecond = entry_Datemilisecond;
                                                    journalPrdt.cashac_name = req.body.garu_Aavak_Group[i].purchase_Ac_Title;
                                                    journalPrdt.cash_bank_name = req.body.party_Code;

                                                    journalPrdt.sl_Person = req.body.sl_Person; // Entry Removed AkshatDalke

                                                    //AkshatDalke
                                                    journalPrdt.transport = req.body.transport;
                                                    journalPrdt.vehicle = req.body.vehicle;
                                                    journalPrdt.driver = req.body.driver;
                                                    journalPrdt.mobile = req.body.mobile;
                                                    dsi.tot_Qty = req.body.tot_Amt;
                                                    dsi.tot_weight = req.body.tot_weight;
                                                    //AkshatDalke

                                                    journalPrdt.broker_Code = req.body.broker_Code;
                                                    journalPrdt.cash_narrone = 'Product Posting';
                                                    journalPrdt.cash_narrtwo = req.body.garu_Aavak_Group[i].purchase_Ac_Title_Name;
                                                    journalPrdt.cash_type = "Garu Product Posting";
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
                                                        journaladd.GaruEntry_id = dsi._id;//trans scema fetejournalmastch id
                                                        journaladd.main_bk = "XPA" + i;
                                                        journaladd.d_c = "D";
                                                        journaladd.vouc_code = req.body.vouc_code;
                                                        journaladd.cash_date = entry_DateObject;
                                                        journaladd.c_j_s_p = req.body.c_j_s_p;
                                                        journaladd.cash_edatemilisecond = entry_Datemilisecond;
                                                        journaladd.cashac_name = AddlesArr[j].Posting_Ac;
                                                        journaladd.cash_bank_name = req.body.party_Code;

                                                        journaladd.sl_Person = req.body.sl_Person; // Entry Removed AkshatDalke

                                                        //AkshatDalke
                                                        journaladd.transport = req.body.transport;
                                                        journaladd.vehicle = req.body.vehicle;
                                                        journaladd.driver = req.body.driver;
                                                        journaladd.mobile = req.body.mobile;
                                                        dsi.tot_Qty = req.body.tot_Amt;
                                                        dsi.tot_weight = req.body.tot_weight;
                                                        //AkshatDalke

                                                        journaladd.broker_Code = req.body.broker_Code;
                                                        journaladd.cash_narrone = 'Credit';
                                                        journaladd.cash_narrtwo = AddlesArr[j].Description;
                                                        journaladd.cash_type = "Purchase";
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
                                            for (let i = 0; i < dsi.less_details.length; i++) {
                                                if (req.body.less_details[i]['particular_less'] == "") req.body.less_details[i]['particular_less'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                                for (let j = 0; j < AddlesArr.length; j++) {
                                                    if (req.body.less_details[i]['particular_less'] == AddlesArr[j]._id) {
                                                        req.body.less_details[i]['particular_less'],
                                                            req.body.less_details[i]['particular_amtless']
                                                        let journalless = new journalmast();
                                                        journalless.GaruEntry_id = dsi._id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                                        journalless.main_bk = "XPL" + i;
                                                        journalless.d_c = "C";
                                                        journalless.vouc_code = req.body.vouc_code;
                                                        journalless.cash_date = entry_DateObject;
                                                        journalless.c_j_s_p = req.body.c_j_s_p;
                                                        journalless.cash_edatemilisecond = entry_Datemilisecond;
                                                        journalless.cashac_name = AddlesArr[j].Posting_Ac;
                                                        journalless.cash_bank_name = req.body.party_Code;

                                                        journalless.sl_Person = req.body.sl_Person; // Entry Removed AkshatDalke

                                                        //AkshatDalke
                                                        journalless.transport = req.body.transport;
                                                        journalless.vehicle = req.body.vehicle;
                                                        journalless.driver = req.body.driver;
                                                        journalless.mobile = req.body.mobile;
                                                        dsi.tot_Qty = req.body.tot_Amt;
                                                        dsi.tot_weight = req.body.tot_weight;
                                                        //AkshatDalke

                                                        journalless.broker_Code = req.body.broker_Code;
                                                        journalless.cash_narrone = 'Credit';
                                                        journalless.cash_narrtwo = AddlesArr[j].Description;
                                                        journalless.cash_type = "Purchase";
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
                                            let out = new outstanding();
                                            out.GaruEntry_id = dsi._id; //trans scema fetech id
                                            out.main_bk = "PB";
                                            out.d_c = "C";
                                            out.OS_Type = 'PB';
                                            out.vouc_code = req.body.vouc_code;
                                            out.cash_date = entry_DateObject;
                                            out.c_j_s_p = req.body.c_j_s_p;
                                            out.cash_edatemilisecond = entry_Datemilisecond;
                                            out.cashac_name = req.body.party_Code;
                                            out.cash_bank_name = req.body.party_Code;

                                            out.sl_Person = req.body.sl_Person; // Entry Removed AkshatDalke

                                            //AkshatDalke
                                            out.transport = req.body.transport;
                                            out.vehicle = req.body.vehicle;
                                            out.driver = req.body.driver;
                                            out.mobile = req.body.mobile;
                                            dsi.tot_Qty = req.body.tot_Amt;
                                            dsi.tot_weight = req.body.tot_weight;
                                            //AkshatDalke

                                            out.broker_Code = req.body.broker_Code;
                                            out.cash_narrtwo = 'By Purchase';
                                            out.cash_narrone = 'Credit';
                                            out.cash_type = "Purchase";
                                            out.cash_remarks = req.body.garu_Remarks
                                            out.del = "N";
                                            out.CNCL = 'N';
                                            out.entrydate = new Date();
                                            out.cr_Days = req.body.cr_Days;
                                            out.due_On = req.body.due_On;
                                            out.ac_intrestper = intrate;
                                            out.cashCredit = req.body.cashCredit;
                                            out.cash_amount = req.body.gross_Amt;
                                            out.Bill_Amount = req.body.gross_Amt;
                                            out.Rec_Amount = 0;
                                            out.Add_Ded_Amt_Tot = 0;
                                            out.Less_Ded_Amt_Tot = 0;
                                            out.Out_recieved_Entry_Arr = [];
                                            out.outstanding_balance = req.body.gross_Amt;
                                            out.outstanding_amount = req.body.gross_Amt;

                                            out.op_main_bk = 0;
                                            out.op_c_j_s_p = 0;
                                            out.op_co_code = 0;
                                            out.op_div_code = 0;
                                            out.co_code = req.session.compid;
                                            out.div_code = req.session.divid;
                                            out.usrnm = req.session.user;
                                            out.masterid = req.session.masterid;
                                            out.save();

                                            res.render('Sale_Entry_Print.hbs')
                                            
                                            // res.redirect('/Garu_Aavak_Entry/GAE_Print');
                                        }
                                    })
                                } else {
                                    dsiSave = false;
                                    // console.log('error in saving domestic sales invoice');
                                    res.send("<script>alert('This Invoice No. Is Already Exist');window.location.href = '/Garu_Aavak_Entry/Garu_Aavak_Entry_Add'</script>");
                                }
                            })
                        }
                    })
            });
        });
    }).populate('PartyType');
});

router.post('/Goods_Outward_Note_Add', function (req, res) {
    Account_master.findById(req.body.party_Code, function (err, acmastcustumer) {
        // addlessmast.find({}, function (err,addlessmast){
        AddLessParameter.findOne({ Module: 'Goods Outward Note', masterid: req.session.masterid }, function (err, AddLessParameter) {
            division.find({ _id: req.session.divid }, function (err, division) {
                GaruAavak.aggregate((
                    [{ $match: { main_bk: "GOT", c_j_s_p: req.body.c_j_s_p, co_code: req.session.compid, div_code: req.session.divid, del: "N" } },
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

                        var checkNo = await GaruAavak.findOne({ vouc_code: req.body.vouc_code, del: 'N', main_bk: 'GAE', c_j_s_p: req.body.c_j_s_p }, function (err, aa) { }).select('vouc_code');
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
                            dsi.main_bk = "GOT";
                            // dsi.d_c = 'C';
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

                            dsi.sl_Person = req.body.sl_Person;  // Entry Removed AkshatDalke

                            //AkshatDalke
                            dsi.transport = req.body.transport;
                            dsi.vehicle = req.body.vehicle;
                            dsi.driver = req.body.driver;
                            dsi.mobile = req.body.mobile;
                            dsi.tot_Qty = req.body.tot_Amt;
                            dsi.tot_weight = req.body.tot_weight;
                            //AkshatDalke

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
                            // dsi.less_details = req.body.less_details;
                            dsi.less_details = [];
                            dsi.co_code = req.session.compid;
                            dsi.div_code = req.session.divid;
                            dsi.usrnm = req.session.user;
                            dsi.masterid = req.session.masterid;
                            dsi.del = 'N';
                            dsi.CNCL = 'N';
                            dsi.flag = 'N';
                            dsi.entrydate = new Date();
                            GaruAavak.find({ vouc_code: req.body.vouc_code, main_bk: 'GAE', c_j_s_p: req.body.c_j_s_p, del: 'N' }, function (err, dsidublicate) {
                                if (dsidublicate == null || dsidublicate == '') {
                                    dsi.save(function (err) {
                                        if (err) res.json({ 'success': false, 'message': 'error in saving domestic sales invoice ', 'errors': err });
                                        else {
                                            dsiSave = true;

                                            res.redirect('/Garu_Aavak_Entry/Garu_Aavak_Entry_Add');
                                        }
                                    })
                                } else {
                                    dsiSave = false;
                                    // console.log('error in saving domestic sales invoice');
                                    res.send("<script>alert('This Invoice No. Is Already Exist');window.location.href = '/Garu_Aavak_Entry/Garu_Aavak_Entry_Add'</script>");
                                }
                            })
                        }
                    })
            });
        });
    }).populate('PartyType');
});

router.get('/Garu_Aavak_Entry_List', ensureAuthenticated, function (req, res) {
    GaruAavak.find({ main_bk: "GAE", del: "N", d_c: "C", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid }, function (err, GaruAavak) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('Garu_Aavak_Entry_List.hbs', {
                pageTitle: 'Garu Aavak Entry List',
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

router.get('/Goods_Outward_Note_list', ensureAuthenticated, function (req, res) {
    GaruAavak.find({ main_bk: "GOT", del: "N", d_c: "D", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid }, function (err, GaruAavak) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('Goods_Outward_Note_list.hbs', {
                pageTitle: 'Goods Outwards Note list',
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

router.get('/Garu_Aavak_Entry_Update/:id', ensureAuthenticated, function (req, res) {
    var length = 0;
    // brand.find({ masterid: req.session.masterid }, function (err, brand) {
    gowdown.find({ masterid: req.session.masterid, del: "N" }, function (err, gowdown) {
        GaruAavak.findById(req.params.id, function (err, GaruAavak) {
            AddLessParameter.findOne({ Module: 'Garu Aavak Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
                vouchMast.find({ Module: 'Garu Aavak Entry', Vo_Division: { $elemMatch: { $eq: req.session.divid } }, masterid: req.session.masterid }, function (err, vouchMast) {
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
                        res.render('Garu_Aavak_Entry_Update.hbs', {
                            pageTitle: 'Update Garu Aavak Entry',
                            GaruAavak: GaruAavak,
                            length: length,
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
        }).populate('broker_Code').populate('sl_Person').populate('garu_Aavak_Group.purchase_Ac_Title').populate('garu_Aavak_Group.item_Code_Desc')
            .populate('garu_Aavak_Group.brand').populate([{ path: 'party_Code', model: 'accountSchema', populate: { path: 'CityName', model: 'citySchema' } }]);
    });

    // });
});

router.get('/Goods_Outward_Note_Update/:id', ensureAuthenticated, function (req, res) {
    var length = 0;
    gowdown.find({ masterid: req.session.masterid, del: "N" }, function (err, gowdown) {
        GaruAavak.findById(req.params.id, function (err, GaruAavak) {
            AddLessParameter.findOne({ Module: 'Goods Outward Note', masterid: req.session.masterid }, function (err, AddLessParameter) {
                vouchMast.find({ Module: 'Goods Outward Note', Vo_Division: { $elemMatch: { $eq: req.session.divid } }, masterid: req.session.masterid }, function (err, vouchMast) {
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
                        res.render('Goods_Outward_Note_Update.hbs', {
                            pageTitle: 'Goods Outward Note Update',
                            GaruAavak: GaruAavak,
                            length: length,
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
        }).populate('broker_Code').populate('sl_Person').populate('garu_Aavak_Group.purchase_Ac_Title').populate('garu_Aavak_Group.item_Code_Desc')
            .populate([{ path: 'party_Code', model: 'accountSchema', populate: { path: 'CityName', model: 'citySchema' } }]);
    });
});

router.post('/update/:id', function (req, res) {
    Account_master.findById(req.body.party_Code, function (err, acmastcustumer) {
        // addlessmast.find({}, function (err,addlessmast){
        AddLessParameter.findOne({ Module: 'Garu Aavak Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
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
                dsi.main_bk = "GAE";
                dsi.d_c = 'C';
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

                //AkshatDalke
                dsi.transport = req.body.transport;
                dsi.vehicle = req.body.vehicle;
                dsi.driver = req.body.driver;
                dsi.mobile = req.body.mobile;
                dsi.tot_Qty = req.body.tot_Amt;
                dsi.tot_weight = req.body.tot_weight;

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
                // dsi.add_details = req.body.add_details;
                dsi.add_details = [];
                // dsi.less_details = req.body.less_details;
                dsi.less_details = [];
                dsi.co_code = req.session.compid;
                dsi.div_code = req.session.divid;
                dsi.usrnm = req.session.user;
                dsi.masterid = req.session.masterid;
                dsi.del = 'N';
                dsi.CNCL = 'N';
                dsi.flag = 'N';
                dsi.update = new Date();

                let query = { _id: req.params.id }
                var id = req.params.id
                GaruAavak.update(query, dsi, function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
                    } else {
                        res.redirect("/Garu_Aavak_Entry/GAE_Print?id=" + id + "&PrintSaleBill='Print'");
                        // res.redirect('/Garu_Aavak_Entry/Garu_Aavak_Entry_List');
                    }
                })
            }
        });
    }).populate('PartyType');
});

router.post('/Goods_Outward_Note_Update/:id', function (req, res) {
    Account_master.findById(req.body.party_Code, function (err, acmastcustumer) {
        // addlessmast.find({}, function (err,addlessmast){
        AddLessParameter.findOne({ Module: 'Goods Outward Note', masterid: req.session.masterid }, function (err, AddLessParameter) {
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
                dsi.main_bk = "GOT";
                // dsi.d_c = 'C';
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

                //AkshatDalke
                dsi.transport = req.body.transport;
                dsi.vehicle = req.body.vehicle;
                dsi.driver = req.body.driver;
                dsi.mobile = req.body.mobile;
                dsi.tot_Qty = req.body.tot_Amt;
                dsi.tot_weight = req.body.tot_weight;

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
                // dsi.add_details = req.body.add_details;
                dsi.add_details = [];
                // dsi.less_details = req.body.less_details;
                dsi.less_details = [];
                dsi.co_code = req.session.compid;
                dsi.div_code = req.session.divid;
                dsi.usrnm = req.session.user;
                dsi.masterid = req.session.masterid;
                dsi.del = 'N';
                dsi.CNCL = 'N';
                dsi.flag = 'N';
                dsi.update = new Date();

                let query = { _id: req.params.id }
                var id = req.params.id
                GaruAavak.update(query, dsi, function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
                    } else {
                        res.redirect('/Garu_Aavak_Entry/Goods_Outward_Note_List');

                    }
                })
            }
        });
    }).populate('PartyType');
});

router.get('/GAE_Print', ensureAuthenticated, function (req, res) {
    console.log('req.session.divmast', req.session.divmast);
    division.findById(req.session.divid, function (err, div_mast) {
        console.log('div_mast', div_mast)
        GaruAavak.find({ _id: req.query.id, main_bk: "GAE", del: "N", d_c: "C", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid }, function (err, GaruAavak) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('session', req.session)
                res.render('Sale_Entry_Print.hbs', {
                    pageTitle: 'Goods Inward Print',
                    GaruAavak: GaruAavak,
                    div_mast: div_mast,
                    compnm: req.session.compnm,
                    divnm: req.session.divmast,
                    sdate: req.session.compsdate,
                    edate: req.session.compedate,
                    usrnm: req.session.user,
                    security: req.session.security,
                    administrator: req.session.administrator
                });
            }
        }).sort({ 'vouc_code': 1 }).populate('party_Code').populate('broker_Code').populate('sl_Person').populate([{ path: 'garu_Aavak_Group.item_Code_Desc' }]).populate([{ path: 'garu_Aavak_Group.brand' }]).populate([{ path: 'party_Code', model: 'accountSchema', populate: { path: 'CityName', model: 'citySchema' } }])
    });

});


router.get('/outward_print', ensureAuthenticated, function (req, res) {

    GaruAavak.find({ _id: req.query.id, main_bk: "GOT", del: "N", d_c: "D", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid }, function (err, GaruAavak) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('GaruAavak', GaruAavak)
            res.render('Outward_print.hbs', {
                pageTitle: 'Outward Print',
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
    }).sort({ 'vouc_code': 1 }).populate('party_Code').populate('broker_Code').populate('sl_Person').populate([{ path: 'garu_Aavak_Group.item_Code_Desc' }]).populate([{ path: 'garu_Aavak_Group.brand' }]).populate([{ path: 'party_Code', model: 'accountSchema', populate: { path: 'CityName', model: 'citySchema' } }])
});


// GaruAavak.findById(req.query.id, function (err, GaruAavak) {
// GaruAavak.findById(req.query.id, function (err, GaruAavak) {
//     brand.find({ masterid: req.session.masterid }, function (err, brand) {
//         AddLessParameter.findOne({ Module: 'Sale Entry', masterid: req.session.masterid }, function (err, AddLessParameter) {
//             if (GaruAavak == null || GaruAavak == []) flag = 1;
//             else {
//                 // console.log(GaruAavak.party_Code._id);
//                 division.findById(req.session.divid, function (err, division) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         var outstanding_bal = 0;
//                         if (GaruAavak == null || GaruAavak == []) flag = 1;
//                         else {
//                             console.log('Garu Aavak', GaruAavak)
//                             res.render('Sale_Entry_Print.hbs', {
//                                 pageTitle: 'Sale Entry Print',
//                                 GaruAavak: GaruAavak,
//                                 brand: brand,
//                                 length: GaruAavak.garu_Aavak_Group.length - 1,
//                                 division: division,
//                                 compnm: req.session.compnm,
//                                 outstanding_bal: outstanding_bal.toFixed(2),
//                                 divnm: req.session.divmast,
//                                 sdate: req.session.compsdate,
//                                 edate: req.session.compedate,
//                                 usrnm: req.session.user,
//                                 security: req.session.security,
//                                 administrator: req.session.administrator
//                             })

//                         }

//                     }
//                 });
//             }
//         })
// })

// }).populate('broker_Code').populate('sl_Person').populate('garu_Aavak_Group.sale_Ac_Title')
//     .populate('garu_Aavak_Group.item_Code_Desc')
//     .populate([{ path: 'party_Code', model: 'accountSchema', populate: { path: 'CityName', model: 'citySchema', populate: { path: 'StateName', model: 'stateSchema' } } }])
//     // .populate('add_details.particular_add')
//     // .populate([{path: 'add_details.particular_add',model:'Add_Less_Parameter_Master_Schema'}])
//     // .populate('less_details.particular_less')
//     .populate([{ path: 'garu_Aavak_Group.item_Code_Desc', model: 'fgSchema', populate: { path: 'item_group', model: 'CategorySchema' } }])
// });



router.delete('/delete/:id', function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    } else {
        // console.log(req.params.id)
        let query = { _id: req.params.id }
        let Garu = {};
        Garu.del = 'Y';
        Garu.delete = new Date();
        GaruAavak.update(query, Garu, function (err, somast) {
            if (err) {
                console.log(err);
            }
            else res.json({ 'success': "true" });
        });
    }
});

router.get('/ItenCodeName', function (req, res) {
    var qry = req.query.term.term;
    product.find({ $or: [{ 'item_title': { $regex: new RegExp("^" + qry, "i") } }, { 'item_code': qry }], del: 'N', masterid: req.session.masterid }, 'item_title', function (err, party) {
        var data = new Array();
        if (party != undefined) {
            for (var j = 0; j < party.length; j++) {
                data[j] = {
                    "id": party[j]._id,
                    "text": party[j].item_title
                };
            }
            res.json({
                'results': data, "pagination": {
                    "more": false
                }
            });
        }
    }).sort({ 'ACName': 1 });
});

router.get('/brandName', function (req, res) {
    var qry = req.query.term.term;
    brand.find({ $or: [{ 'Description': { $regex: new RegExp("^" + qry, "i") } }, { 'Code': '' }], del: 'N', masterid: req.session.masterid }, 'Description', function (err, party) {
        var data = new Array();
        if (party != undefined) {
            for (var j = 0; j < party.length; j++) {
                data[j] = {
                    "id": party[j]._id,
                    "text": party[j].Description
                };
            }
            res.json({
                'results': data, "pagination": {
                    "more": false
                }
            });
        }
    });
    // }).sort({ 'ACName': 1 });
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





