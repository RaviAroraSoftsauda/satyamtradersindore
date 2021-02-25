const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let purchaseorder = require('../models/Garu_Aavak_Schema');
let Stock_Unit = require('../models/skuSchema');
let Subwarehouse = require('../models/gowdawnCodeSchema');
var Raw_master = require('../models/fgSchema');

//  let product_raw_master = require('../models/product_raw_master_Schema');
let AddLessParameter = require('../models/Add_Less_Parameter_Master_Schema');
let vouchMast = require('../models/vouchSchema');
router.get('/getfgrmdatagodown', function (req, res) {
    var so_disc = req.query.so_disc;
    product_raw_master.findOne({ _id: so_disc, masterid: req.session.masterid }, function (err, prdtrow) {
        purchaseorder.find({ sales_or_group: { $elemMatch: { so_disc: so_disc } }, main_bk: "GRN" }, function (err, grndata) {
            if (product_raw_master == null || product_raw_master == [] || product_raw_master == undefined || product_raw_master == '') {
                res.json({ 'success': false, 'prdtrow': prdtrow, "grndata": grndata })
            } else {
                res.json({ 'success': true, 'prdtrow': prdtrow, "grndata": grndata }); ///,'party': party
            }
        }).populate([{ path: 'sales_or_group.so_disc' }])
            .populate([{ path: 'sales_or_group.lot_group.pckunit' }])
            .populate([{ path: 'sales_or_group.lot_group.purchaseunit' }])
            .populate([{ path: 'sales_or_group.lot_group.standrdunit' }])
    })
});
router.get('/getcomboval', function (req, res) {
    var so_disc = req.query.prdtid;
    product_raw_master.find({ _id: { $in: so_disc }, masterid: req.session.masterid, main_bk: "FG", combo: "combo" }, function (err, prdtrow) {
        Stock_Unit.find({ del: "N", masterid: req.session.masterid }, function (err, Stock_Unit) {
            if (prdtrow == null || prdtrow == [] || prdtrow == undefined || prdtrow == '') {
                res.json({ 'success': false })
            } else {
                res.json({ 'success': true, 'prdtrow': prdtrow, "Stock_Unit": Stock_Unit })
            }
        })
    }).populate([{ path: 'fg_product_group.product_name' }])
});
// Add Route
router.get('/stock_adjustment_note', ensureAuthenticated, function (req, res) {

    // AddLessParameter.findOne({Module:'GRN Entry',masterid:req.session.masterid},function(err, AddLessParameter){
    vouchMast.find({ Module: 'Stock Adjustment Note', Vo_Division: { $elemMatch: { $eq: req.session.divid } } }, function (err, vouchMast) {
        purchaseorder.aggregate((
            [{ $match: { $and: [{ co_code: req.session.compid, div_code: req.session.divid, main_bk: "SAN" }] } },
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
                if (lastEntryNo[0] == undefined) {
                    var last = 1;
                } else {
                    var last = parseInt(lastEntryNo[0]._id._id) + 1;
                }
                Stock_Unit.find({ del: "N", masterid: req.session.masterid }, function (err, Stock_Unit) {
                    Subwarehouse.find({ masterid: req.session.masterid }, function (err, Warehouse) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(vouchMast);
                            res.render('stock_adjustment_note.hbs', {
                                pageTitle: ' Stock Adjustment Note',
                                Stock_Unit: Stock_Unit,
                                last: last,
                                // AddLessParameter:AddlesArr,
                                vouchMast: vouchMast,
                                Warehouse: Warehouse,
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
                })
            })
    })
    // })
});
router.get('/stock_adjustment_note_list', ensureAuthenticated, function (req, res) {
    var query = { co_code: req.session.compid, div_code: req.session.divid, main_bk: "SAN" };
    // var query ={co_code: req.session.compid,div_code:req.session.divid, main_bk:"SAN", srno:0};
    purchaseorder.find(query, function (err, purchaseorder) {
        if (err) {
            console.log(err);
        } else {
            res.render('stock_adjustment_note_list.hbs', {
                pageTitle: 'Stock Adjustment Note List',
                purchaseorder: purchaseorder,
                compnm: req.session.compnm,
                divnm: req.session.divmast,
                sdate: req.session.compsdate,
                edate: req.session.compedate,
                usrnm: req.session.user,
                security: req.session.security,
                administrator: req.session.administrator
            });
        }
    }).populate([{ path: 'gdn_Cd_Name' }]).populate([{ path: 'destination_location' }]).populate([{ path: 'source_Warehouse' }]).populate([{ path: 'destination_warehouse' }])
    // }).populate([{path: 'source_warehouse'}]).populate([{path: 'destination_location'}])
});
router.post('/add', async function (req, res) {
    let errors = req.validationErrors();
    var so_date = req.body.so_date;
    var DateObject = moment(so_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var datemilisecond = DateObject.format('x');

    console.log(req.body);
    if (req.body.source_warehouse == "") req.body.source_warehouse = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.destination_location == "") req.body.destination_location = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (errors) {
        console.log(errors);
    }
    else {
        let grn = new purchaseorder();
        grn.main_bk = "SAN";
    
        // grn.srno = '0'; // no idea
        // grn.so_no = req.body.so_no; // no idea
        // grn.itemtype =req.body.grn_group[0]['itemtype']; // no field

        grn.c_j_s_p = req.body.so_no;


        grn.vouc_code = req.body.vouc_code;
        grn.garu_Remarks = req.body.remarks;
        grn.entry_Date = DateObject;
        grn.entry_Datemilisecond = datemilisecond; // --
        grn.source_Warehouse = req.body.source_warehouse;
        if (req.body.itemtype == "+") {
            var d_c = "C"
        }
        else {
            var d_c = "D"
        }
        grn.d_c = d_c;
        // grn.combocheck = req.body.grn_group[0]['combocheck'];
        // grn.source_warehouseloc = req.body.source_warehouse;
        // grn.destination_location = req.body.destination_location;
        var docs = [];
        for (let i = 0; i < req.body.grn_group.length; i++) 
        {
            // var lotdocs = [];
            if (req.body.grn_group[i]['so_disc'] == "") req.body.grn_group[i]['so_disc'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');

            // if(req.body.grn_group[i]['actual_stdunit']=="") req.body.grn_group[i]['actual_stdunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if(req.body.grn_group[i]['roundup_pckunit']=="") req.body.grn_group[i]['roundup_pckunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if(req.body.grn_group[i]['purchse_unit']=="") req.body.grn_group[i]['purchse_unit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            var location = req.body.source_warehouse;

            docs[i] = {
                item_Code_Desc: req.body.grn_group[i]['so_disc'],
                qntty: req.body.grn_group[i]['actual_qty'],
                // actual_stdunit :req.body.grn_group[i]['actual_stdunit'],
                pkng: req.body.grn_group[i]['roundup_pckqty'],
                // roundup_pckunit :req.body.grn_group[i]['roundup_pckunit'],
                net_Wt: req.body.grn_group[i]['net_Wt'],
                // purchse_unit :req.body.grn_group[i]['purchse_unit'],
                lot_No: req.body.grn_group[i]['lot_no'],
                // packingtot :req.body.grn_group[i]['packingtot'],
                // purchasetot :req.body.grn_group[i]['purchasetot'],
                // standrdtot :req.body.grn_group[i]['standrdtot'],
                gdn_Cd_Name: location,

                // itemtype:req.body.grn_group[i]['itemtype'],
                // combocheck:req.body.grn_group[i]['combocheck'],
                // d_c:d_c,
                // lot_group:lotdocs,
            }
        }
        grn.garu_Aavak_Group = docs;
        grn.tot_Qty = req.body.tot_amtso;
        grn.co_code = req.session.compid;
        grn.div_code = req.session.divid;
        grn.Item_Total = req.body.net_wt_to;
        grn.usrnm = req.session.user;
        grn.masterid = req.session.masterid
        grn.del = 'N',
            grn.entry = DateObject;
        grn.save(async function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'error in saving term', 'errors': err });
                return;
            }
            else {
                // if(req.body.grn_group_debit!=null){
                //     let grnd = new purchaseorder();
                //     grnd.main_bk="SAN";
                //     grnd.purchaseid = grn._id;
                //     if(req.body.grn_group_debit[0]['itemtype']=="+") grnd.d_c ="C";
                //     if(req.body.grn_group_debit[0]['itemtype']=="-") grnd.d_c ="D";
                //     grnd.srno = '1';
                //     grnd.itemtype =req.body.grn_group_debit[0]['itemtype'];
                //     grnd.so_no = req.body.so_no;
                //     grnd.vouc_code = req.body.vouc_code;
                //     grnd.remarks = req.body.remarks;
                //     grnd.so_date = DateObject;
                //     grnd.so_datemilisecond = datemilisecond;
                //     grnd.source_warehouse = req.body.source_warehouse;
                //     grnd.destination_location = req.body.destination_location;
                //     var docs = [];
                //     for (let i = 0; i <req.body.grn_group_debit.length; i++)
                //     { 
                //         var lotdocs = [];
                //         var lot_group = req.body.grn_group_debit[i]['lot_group']
                //         if(lot_group!=undefined){
                //             if(req.body.grn_group_debit[i]['lot_no']=="Y"){
                //             for (let j = 0; j <lot_group.length; j++)
                //             {
                //                 if(lot_group[j]['standrdqtybal']>0){
                //                 if(lot_group[j]['pckunit']=="") lot_group[j]['pckunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                //                 if(lot_group[j]['purchaseunit']=="") lot_group[j]['purchaseunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                //                 if(lot_group[j]['standrdunit']=="") lot_group[j]['standrdunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                //                 lotdocs[j] = {
                //                     lot_no :lot_group[j]['lot_no'],
                //                     grnid:lot_group[j]['grnid'],
                //                     lotgrpid:lot_group[j]['lotgrpid'],
                //                     selesgrpid:lot_group[j]['selesgrpid'],
                //                     // bal_qty :lot_group[j]['standrdqty'],
                //                     pckqty:lot_group[j]['pckqty'],
                //                     pckunit:lot_group[j]['pckunit'],
                //                     purchaseqty:lot_group[j]['purchaseqty'],
                //                     purchseunitSign:lot_group[j]['purchseunitSign'],
                //                     purchseunitKg:lot_group[j]['purchseunitKg'],
                //                     purchaseunit:lot_group[j]['purchaseunit'],
                //                     standrdqty:lot_group[j]['standrdqty'],
                //                     stndrdunitSign:lot_group[j]['stndrdunitSign'],
                //                     stndrdunitKg:lot_group[j]['stndrdunitKg'],
                //                     standrdunit:lot_group[j]['standrdunit'],
                //                     standrdqtybal:lot_group[j]['standrdqtybal']
                //                 }
                //             }
                //         }
                //         }
                //         }
                //         if(req.body.grn_group_debit[i]['so_disc']=="") req.body.grn_group_debit[i]['so_disc']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                //         if(req.body.grn_group_debit[i]['actual_stdunit']=="") req.body.grn_group_debit[i]['actual_stdunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                //         if(req.body.grn_group_debit[i]['roundup_pckunit']=="") req.body.grn_group_debit[i]['roundup_pckunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                //         if(req.body.grn_group_debit[i]['purchse_unit']=="") req.body.grn_group_debit[i]['purchse_unit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                //         if(req.body.grn_group_debit[i]['itemtype']=="+"){
                //             var d_c = "C"
                //             var location =  req.body.source_warehouse;
                //            } 
                //            else{
                //             var d_c = "D"
                //             var location =  req.body.source_warehouse;

                //            } 
                //         docs[i] = { 
                //             so_disc :req.body.grn_group_debit[i]['so_disc'],
                //             actual_qty:req.body.grn_group_debit[i]['actual_qty'],
                //             actual_stdunit :req.body.grn_group_debit[i]['actual_stdunit'],
                //             roundup_pckqty :req.body.grn_group_debit[i]['roundup_pckqty'],
                //             roundup_pckunit :req.body.grn_group_debit[i]['roundup_pckunit'],
                //             purchse_rate :req.body.grn_group_debit[i]['purchse_rate'],
                //             purchse_unit :req.body.grn_group_debit[i]['purchse_unit'],
                //             lot_no :req.body.grn_group_debit[i]['lot_no'],
                //             packingtot :req.body.grn_group_debit[i]['packingtot'],
                //             purchasetot :req.body.grn_group_debit[i]['purchasetot'],
                //             standrdtot :req.body.grn_group_debit[i]['standrdtot'],
                //             location : location,
                //             itemtype:req.body.grn_group_debit[i]['itemtype'],
                //             d_c:d_c,
                //             combocheck:req.body.grn_group_debit[i]['combocheck'],
                //             lot_group:lotdocs,
                //         }
                //     }
                //     grnd.sales_or_group = docs;
                //     grnd.tot_amtso = req.body.tot_amtso;
                //     grnd.co_code = req.session.compid;
                //     grnd.div_code = req.session.divid;
                //     grnd.usrnm = req.session.user;
                //     grnd.masterid = req.session.masterid
                //     grnd.del = 'N',
                //     grnd.entry =  new Date();
                //     grnd.save();
                // }

                // }
                res.redirect('/stock_adjustment_note/stock_adjustment_note');
            }
        });
    }
});

router.get('/stock_adjustment_note_update/:id', ensureAuthenticated, function (req, res) {
    purchaseorder.findById(req.params.id, function (err, purchaseorderc) {
        Raw_master.find({ del: "N", masterid: req.session.masterid }, function (err, RawMast) {
            purchaseorder.findOne({ purchaseid: req.params.id, main_bk: "SAN" }, function (err, purdebit) {
                Subwarehouse.find({ masterid: req.session.masterid }, function (err, Subwarehouse) {

                    vouchMast.find({ Module: 'Stock Adjustment Note', Vo_Division: { $elemMatch: { $eq: req.session.divid } } }, function (err, vouchMast) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('RawMast',RawMast[0]);
                            res.render('stock_adjustment_note_update.hbs', {
                                pageTitle: 'Stock Adjustment Note Update',
                                purchaseorderc: purchaseorderc,
                                purdebit: purdebit,
                                Raw_master: RawMast,
                                vouchMast: vouchMast,
                                Subwarehouse: Subwarehouse,
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
            }).populate([{ path: 'garu_Aavak_Group.item_Code_Desc' }])
        // }).populate([{ path: 'garu_Aavak_Group.item_Code_Desc' }])
        });
    }).populate([{ path: 'garu_Aavak_Group.item_Code_Desc' }])
});
router.get('/gtn_item_print/:id', ensureAuthenticated, function (req, res) {
    purchaseorder.findById(req.params.id, function (err, purchaseorder) {
        if (err) {
            console.log(err);
        } else {
            res.render('gtn_item_print.hbs', {
                pageTitle: 'Product Barcode',
                purchaseorder: purchaseorder,
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
        .populate([{ path: 'sales_or_group.so_disc' }])
        .populate([{ path: 'sales_or_group.actual_stdunit' }])
        .populate([{ path: 'sales_or_group.lot_group.pckunit' }])
        .populate([{ path: 'sales_or_group.lot_group.purchaseunit' }])
        .populate([{ path: 'sales_or_group.lot_group.standrdunit' }])
});
router.get('/gtn_bale_barcode/:id', ensureAuthenticated, function (req, res) {
    purchaseorder.findById(req.params.id, function (err, purchaseorder) {
        if (err) {
            console.log(err);
        } else {
            res.render('gtn_bale_barcode.hbs', {
                pageTitle: 'Bale Barcode',
                purchaseorder: purchaseorder,
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
        .populate([{ path: 'sales_or_group.so_disc' }])
        .populate([{ path: 'sales_or_group.actual_stdunit' }])
        .populate([{ path: 'sales_or_group.lot_group.pckunit' }])
        .populate([{ path: 'sales_or_group.lot_group.purchaseunit' }])
        .populate([{ path: 'sales_or_group.lot_group.standrdunit' }])
});
router.post('/update/:id', async function (req, res) {
    let errors = req.validationErrors();
    var so_date = req.body.so_date;
    var DateObject = moment(so_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var datemilisecond = DateObject.format('x');
    if (req.body.source_warehouse == "") req.body.source_warehouse = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.destination_location == "") req.body.destination_location = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (errors) {
        console.log(errors);
    }
    else {
        let grn = {};
        grn.main_bk = "SAN";
        // grn.d_c ="C";
       // grn.srno = '0';
        
       grn.c_j_s_p = req.body.so_no;


       grn.vouc_code = req.body.vouc_code;
       grn.garu_Remarks = req.body.remarks;
       grn.entry_Date = DateObject;
       grn.entry_Datemilisecond = datemilisecond; // --
       grn.source_Warehouse = req.body.source_warehouse;
       if (req.body.itemtype == "+") {
        var d_c = "C"
        }
        else {
            var d_c = "D"
        }
        grn.d_c = d_c;
       var docs = [];
        for (let i = 0; i < req.body.grn_group.length; i++) 
        {
            if (req.body.grn_group[i]['so_disc'] == "") req.body.grn_group[i]['so_disc'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');

            // if(req.body.grn_group[i]['actual_stdunit']=="") req.body.grn_group[i]['actual_stdunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if(req.body.grn_group[i]['roundup_pckunit']=="") req.body.grn_group[i]['roundup_pckunit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if(req.body.grn_group[i]['purchse_unit']=="") req.body.grn_group[i]['purchse_unit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            var location = req.body.source_warehouse;

            docs[i] = {
                item_Code_Desc: req.body.grn_group[i]['so_disc'],
                qntty: req.body.grn_group[i]['actual_qty'],
                // actual_stdunit :req.body.grn_group[i]['actual_stdunit'],
                pkng: req.body.grn_group[i]['roundup_pckqty'],
                // roundup_pckunit :req.body.grn_group[i]['roundup_pckunit'],
                net_Wt: req.body.grn_group[i]['net_Wt'],
                // purchse_unit :req.body.grn_group[i]['purchse_unit'],
                lot_No: req.body.grn_group[i]['lot_no'],
                // packingtot :req.body.grn_group[i]['packingtot'],
                // purchasetot :req.body.grn_group[i]['purchasetot'],
                // standrdtot :req.body.grn_group[i]['standrdtot'],
                gdn_Cd_Name: location,

                // itemtype:req.body.grn_group[i]['itemtype'],
                // combocheck:req.body.grn_group[i]['combocheck'],
                // d_c:d_c,
                // lot_group:lotdocs,
            }
        }
        grn.garu_Aavak_Group = docs;
        grn.tot_Qty = req.body.tot_amtso;
        grn.co_code = req.session.compid;
        grn.div_code = req.session.divid;
        grn.Item_Total = req.body.net_wt_to;
        grn.usrnm = req.session.user;
        grn.masterid = req.session.masterid
        grn.del = 'N',
        grn.entry = DateObject;
        let query = { _id: req.params.id }

        
        purchaseorder.update(query, grn, function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Proforma', 'errors': err });
                return;
            } else {
                res.redirect('/stock_adjustment_note/stock_adjustment_note_list');
            }

        });
    }
});

router.get('/delete_stock_adjustment_note/:id', function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }
    let query1 = { _id: req.params.id }
    let query23 = { purchaseid: req.params.id }
    purchaseorder.findById(req.params.id, async function (err, grnEntry) {
        // if (grnEntry != null) {
        //     for (let i = 0; i < grnEntry.sales_or_group.length; i++) {
        //         var lot_group = grnEntry.sales_or_group[i]['lot_group'];
        //         if (lot_group != null) {
        //             for (let j = 0; j < lot_group.length; j++) {
        //                 var del_Entrymastd = await purchaseorder.findById(lot_group[j].grnid, function (err, somast) { })
        //                 if (del_Entrymastd != null) {
        //                     var del_Entrymast = del_Entrymastd.sales_or_group;
        //                     if (del_Entrymast != null) {
        //                         for (let d = 0; d < del_Entrymast.length; d++) {
        //                             if (JSON.stringify(del_Entrymast[d]._id) == JSON.stringify(lot_group[j].selesgrpid)) {
        //                                 var lotgroup = del_Entrymast[d]['lot_group'];
        //                                 if (lotgroup != null) {
        //                                     for (let l = 0; l < lotgroup.length; l++) {
        //                                         if (JSON.stringify(lotgroup[l]._id) == JSON.stringify(lot_group[j]['lotgrpid'])) {
        //                                             let logrp = {};
        //                                             logrp["sales_or_group." + d + ".lot_group." + l + ".bal_qty"] = parseFloat(lotgroup[l].bal_qty) + parseFloat(lot_group[j]['standrdqtybal']);
        //                                             var query2 = { _id: lot_group[j]['grnid'] };
        //                                             await purchaseorder.update(query2, logrp, function (err) { });
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }

        //     }
        // }
        purchaseorder.remove(query23, function (err) { })
        purchaseorder.remove(query1, function (err) {
            if (err) {
                console.log(err);
            } else {

                res.redirect('/stock_adjustment_note/stock_adjustment_note_list');
            }
        });
    });
});
router.get('/removelotgrpgtn', function (req, res) {
    var id = req.query.purchaseid;
    var grpid = req.query.grpid;
    purchaseorder.findById(id, async function (err, grnEntry) {
        if (grnEntry != null) {
            for (let i = 0; i < grnEntry.sales_or_group.length; i++) {
                var lot_group = grnEntry.sales_or_group[i]['lot_group'];
                if (lot_group != null) {
                    for (let j = 0; j < lot_group.length; j++) {
                        var del_Entrymastd = await purchaseorder.findById(lot_group[j].grnid, function (err, somast) { })
                        if (del_Entrymastd != null) {
                            var del_Entrymast = del_Entrymastd.sales_or_group;
                            if (del_Entrymast != null) {
                                for (let d = 0; d < del_Entrymast.length; d++) {
                                    if (JSON.stringify(del_Entrymast[d]._id) == JSON.stringify(lot_group[j].selesgrpid)) {
                                        var lotgroup = del_Entrymast[d]['lot_group'];
                                        if (lotgroup != null) {
                                            for (let l = 0; l < lotgroup.length; l++) {
                                                if (JSON.stringify(lotgroup[l]._id) == JSON.stringify(grpid)) {
                                                    let logrp = {};
                                                    logrp["sales_or_group." + d + ".lot_group." + l + ".bal_qty"] = parseFloat(lotgroup[l].bal_qty) + parseFloat(lot_group[j]['standrdqtybal']);
                                                    var query23 = { _id: lot_group[j]['grnid'] };
                                                    await purchaseorder.update(query23, logrp, function (err) { });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
        res.json({ 'success': true });
    });
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