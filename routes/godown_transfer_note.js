const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment-timezone');
// let purchaseorder = require('../models/pur_order_Schema');
let purchaseorder = require('../models/Garu_Aavak_Schema');
let Stock_Unit = require('../models/skuSchema');
let Subwarehouse = require('../models/gowdawnCodeSchema');

//   it is in gangaur => let Subwarehouse = require('../models/subwarehouse_Schema');
var Raw_master = require('../models/fgSchema');
var Mrn_master = require('../models/Garu_Aavak_Schema');
var Mrn_masterOP = require('../models/Garu_Aavak_Schema');


//let product_raw_master = require('../models/product_raw_master_Schema');
let AddLessParameter = require('../models/Add_Less_Parameter_Master_Schema');
let vouchMast = require('../models/vouchSchema');
let div = require('../models/divSchema');
// router.get('/getfgrmdatagodown', function (req, res) {
//     var so_disc = req.query.so_disc;
//     product_raw_master.findOne({ _id: so_disc, masterid: req.session.masterid }, function (err, prdtrow) {
//         purchaseorder.find({ sales_or_group: { $elemMatch: { so_disc: so_disc } }, main_bk: "GRN" }, function (err, grndata) {
//             if (product_raw_master == null || product_raw_master == [] || product_raw_master == undefined || product_raw_master == '') {
//                 res.json({ 'success': false, 'prdtrow': prdtrow, "grndata": grndata })
//             } else {
//                 res.json({ 'success': true, 'prdtrow': prdtrow, "grndata": grndata }); ///,'party': party
//             }
//         }).populate([{ path: 'sales_or_group.so_disc' }])
//             .populate([{ path: 'sales_or_group.lot_group.pckunit' }])
//             .populate([{ path: 'sales_or_group.lot_group.purchaseunit' }])
//             .populate([{ path: 'sales_or_group.lot_group.standrdunit' }])
//     })
// });
// Add Route
router.get('/godown_transfer_note', ensureAuthenticated, function (req, res) {
    // AddLessParameter.findOne({Module:'GRN Entry',masterid:req.session.masterid},function(err, AddLessParameter){
    vouchMast.find({ Module: 'Godown Transfer Note', Vo_Division: { $elemMatch: { $eq: req.session.divid } } }, function (err, vouchMast) {
        purchaseorder.aggregate((
            [{ $match: { $and: [{ co_code: req.session.compid, div_code: req.session.divid, main_bk: "GTN" }] } },
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
                // console.log(lastEntryNo[0],co_code,dividnmid,'r');
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

                        
                            res.render('godown_transfer_note.hbs', {
                                pageTitle: 'Godown Transfer Note',
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
router.get('/godown_transfer_note_list', ensureAuthenticated, function (req, res) {
    var query ={ co_code: req.session.compid, div_code: req.session.divid, main_bk: "GTN" ,d_c: "C"};
    Mrn_master.find(query, function (err, purchaseorder) {
        // console.log(' purchaseorder.length',purchaseorder[0].source_Warehouse);  //.subwarehose_name
        if (err) {
            console.log(err);
        } else {
            res.render('godown_transfer_note_list.hbs', {
                pageTitle: 'Goods Transfer Note List',
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
    }).sort({ 'vouc_code': -1 }).populate([{ path: 'gdn_Cd_Name' }]).populate([{ path: 'destination_location' }]).populate([{ path: 'source_Warehouse' }]).populate([{ path: 'destination_warehouse' }])
});
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


router.post('/add', async function (req, res) {
    let errors = req.validationErrors();
    var so_date = req.body.so_date;
    var DateObject = moment(so_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var datemilisecond = DateObject.format('x');
    
    // console.log('body: ',req.body);
    // console.log('DateObject: ',DateObject);
    // console.log('body.sales_group: ',req.body.sales_group[0]['lot_group']);

    if (req.body.source_warehouse == "") req.body.source_warehouse = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.destination_location == "") req.body.destination_location = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (errors) {
        console.log(errors);
    }
    else {
        let grn = new purchaseorder();
        grn.main_bk = "GTN";
        grn.d_c = "C";
        grn.c_j_s_p = req.body.so_no;
        // grn.so_no = req.body.so_no;
        grn.vouc_code = req.body.vouc_code;
        grn.garu_Remarks = req.body.remarks;
        grn.entry_Date = DateObject;
        grn.entry_Datemilisecond = datemilisecond; // --
        // grn.source_warehouse = req.body.destination_location;
        grn.source_Warehouse = req.body.source_warehouse;
        grn.destination_warehouse = req.body.destination_warehouse;
        var docs = [];
       
        for (let i = 0; i < req.body.grn_group.length; i++) { 
            // if (req.body.grn_group[i]['so_disc'] == "") req.body.grn_group[i]['so_disc'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.gtn_product[i]['so_disc'] == "") req.body.gtn_product[i]['so_disc'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['actual_stdunit'] == "") req.body.grn_group[i]['actual_stdunit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['roundup_pckunit'] == "") req.body.grn_group[i]['roundup_pckunit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['purchse_unit'] == "") req.body.grn_group[i]['purchse_unit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');

            docs[i] = {
                item_Code_Desc: req.body.gtn_product[i]['so_disc'],
                qntty: req.body.grn_group[i]['actual_qty'],
                // actual_stdunit: req.body.grn_group[i]['actual_stdunit'],
                pkng: req.body.grn_group[i]['roundup_pckqty'],
                // roundup_pckunit: req.body.grn_group[i]['roundup_pckunit'],
                net_Wt: req.body.grn_group[i]['net_Wt'],
                // purchse_unit: req.body.grn_group[i]['purchse_unit'],
                lot_No: req.body.grn_group[i]['lot_no'], // not added yet
                // packingtot: req.body.grn_group[i]['packingtot'],
                // purchasetot: req.body.grn_group[i]['purchasetot'],
                // standrdtot: req.body.grn_group[i]['sta  ndrdtot'],
                // lot_group: lotdocs,
                gdn_Cd_Name: req.body.destination_warehouse,
            }
        }
        grn.garu_Aavak_Group = docs;
        grn.tot_Qty = req.body.tot_amtso;
        grn.co_code = req.session.compid;
        grn.div_code = req.session.divid;
        grn.usrnm = req.session.user;
        grn.masterid = req.session.masterid
        grn.del = 'N',
        grn.entrydate = DateObject;
        grn.save(async function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'error in saving term', 'errors': err });
                return;
            }
            else {
                let grnD = new purchaseorder();
                grnD.purchaseid = grn._id;

                // console.log('grn id ',grn._id);

                grnD.main_bk = "GTN1";
                grnD.d_c = "D";
                grnD.c_j_s_p = req.body.so_no;
                grnD.garu_Remarks = req.body.remarks;
                // grnD.so_no = req.body.so_no;
                grnD.vouc_code = req.body.vouc_code;
                grnD.entry_Date = DateObject;
                grnD.entry_Datemilisecond =datemilisecond;
                grnD.source_Warehouse = req.body.source_warehouse;
                grnD.destination_warehouse = req.body.destination_warehouse;
                var docs1 = [];
                for (let i = 0; i < req.body.grn_group.length; i++) {
                    
                    if (req.body.gtn_product[i]['so_disc'] == "") req.body.gtn_product[i]['so_disc'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                    // if (req.body.grn_group[i]['actual_stdunit'] == "") req.body.grn_group[i]['actual_stdunit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                    // if (req.body.grn_group[i]['roundup_pckunit'] == "") req.body.grn_group[i]['roundup_pckunit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                    // if (req.body.grn_group[i]['purchse_unit'] == "") req.body.grn_group[i]['purchse_unit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                    docs1[i] = {
                        item_Code_Desc: req.body.gtn_product[i]['so_disc'],
                        qntty: req.body.grn_group[i]['actual_qty'],
                        // actual_stdunit: req.body.grn_group[i]['actual_stdunit'],
                        pkng: req.body.grn_group[i]['roundup_pckqty'],
                        // roundup_pckunit: req.body.grn_group[i]['roundup_pckunit'],
                        net_Wt: req.body.grn_group[i]['net_Wt'],
                        // purchse_unit: req.body.grn_group[i]['purchse_unit'],
                        lot_no: req.body.grn_group[i]['lot_no'],
                        gdn_Cd_Name:req.body.source_warehouse,
                        // packingtot: req.body.grn_group[i]['packingtot'],
                        // purchasetot: req.body.grn_group[i]['purchasetot'],
                        // standrdtot: req.body.grn_group[i]['standrdtot'],
                        location: req.body.source_warehouse,
                        // lot_group: lotdocs,
                    }
                }
                grnD.garu_Aavak_Group = docs1;

                grnD.tot_Qty = req.body.tot_amtso;
                // grnD.so_remarks = req.body.so_remarks;
                // grnD.grand_total = req.body.grand_total;
                grnD.co_code = req.session.compid;
                grnD.div_code = req.session.divid;
                grnD.usrnm = req.session.user;
                grnD.masterid = req.session.masterid
                grnD.del = 'N',
                grnD.entryDate= DateObject;
                grnD.save();
                res.redirect('/godown_transfer_note/godown_transfer_note');
            }
        });
    }
});
router.get('/godown_transfer_note_update/:id', ensureAuthenticated, function (req, res) {
    purchaseorder.findById(req.params.id, function (err, purchaseorder) {

        
        Raw_master.find({ del: "N", masterid: req.session.masterid }, function (err, RawMast) {
            Subwarehouse.find({ masterid: req.session.masterid }, function (err, Subwarehouse) {
                vouchMast.find({ Module: 'Godown Transfer Note', Vo_Division: { $elemMatch: { $eq: req.session.divid } } }, function (err, vouchMast) {
                    if (err) {
                        console.log(err);
                    } else {

                        res.render('godown_transfer_note_update.hbs', {
                            pageTitle: 'Godown Transfer Note Update',
                            purchaseorder: purchaseorder,
                            // Stock_Unit: Stock_Unit,
                            RawMast:RawMast,
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
        });
    })
        .populate([{ path: 'garu_Aavak_Group.item_Code_Desc' }])
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


router.get('/godown_transfer_note_print/:id', ensureAuthenticated, function (req, res) {
    purchaseorder.findById(req.params.id, function (err, somast) {
        Subwarehouse.find({ masterid: req.session.masterid }, function (err, Subwarehouse) {
            div.findById(req.session.divid, function (err, division) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('godown_transfer_note_print.hbs', {
                        pageTitle: 'Goods Transfer Note Print',
                        somast: somast,
                        division: division,
                        compnm: req.session.compnm,
                        Subwarehouse: Subwarehouse,
                        divnm: req.session.divmast,
                        sdate: req.session.compsdate,
                        edate: req.session.compedate,
                        usrnm: req.session.user,
                        security: req.session.security,
                        administrator: req.session.administrator

                    });
                }

            }).populate('ac_place')
        })
    }).populate([{ path: 'sales_or_group.so_disc' }])
        .populate([{ path: 'sales_or_group.actual_stdunit' }])
        .populate([{ path: 'sales_or_group.roundup_pckunit' }])
        .populate([{ path: 'buy_cus_name', populate: { path: 'CityName' } }])
});
router.post('/update/:id', async function (req, res) {

    console.log('req.body ',req.body);

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
        // let grn = new purchaseorder();
        let grn ={};
        grn.main_bk = "GTN";
        grn.d_c = "C";
        grn.c_j_s_p = req.body.so_no;
        // grn.so_no = req.body.so_no;
        grn.vouc_code = req.body.vouc_code;
        grn.garu_Remarks = req.body.remarks;
        grn.entry_Date = DateObject;
        grn.entry_Datemilisecond = datemilisecond; // --
        // grn.source_warehouse = req.body.destination_location;
        grn.source_Warehouse = req.body.source_warehouse;
        // grn.destination_warehouse = req.body.destination_warehouse;
        grn.destination_warehouse = req.body.destination_location;
        var docs = [];

        for (let i = 0; i < req.body.grn_group.length; i++) { 
            // if (req.body.grn_group[i]['so_disc'] == "") req.body.grn_group[i]['so_disc'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.gtn_product[i]['so_disc'] == "") req.body.gtn_product[i]['so_disc'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['actual_stdunit'] == "") req.body.grn_group[i]['actual_stdunit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['roundup_pckunit'] == "") req.body.grn_group[i]['roundup_pckunit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['purchse_unit'] == "") req.body.grn_group[i]['purchse_unit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');

            docs[i] = {
                item_Code_Desc: req.body.gtn_product[i]['so_disc'],
                qntty: req.body.grn_group[i]['actual_qty'],
                // actual_stdunit: req.body.grn_group[i]['actual_stdunit'],
                pkng: req.body.grn_group[i]['roundup_pckqty'],
                // roundup_pckunit: req.body.grn_group[i]['roundup_pckunit'],
                net_Wt: req.body.grn_group[i]['net_Wt'],
                // purchse_unit: req.body.grn_group[i]['purchse_unit'],
                lot_No: req.body.grn_group[i]['lot_no'], // not added yet
                // packingtot: req.body.grn_group[i]['packingtot'],
                // purchasetot: req.body.grn_group[i]['purchasetot'],
                // standrdtot: req.body.grn_group[i]['sta  ndrdtot'],
                // lot_group: lotdocs,e,

                gdn_Cd_Name: req.body.destination_location,
                // gdn_Cd_Name: req.body.destination_location,
            }
        }

        grn.garu_Aavak_Group = docs;
        grn.tot_Qty = req.body.tot_amtso;
        grn.co_code = req.session.compid;
        grn.div_code = req.session.divid;
        grn.usrnm = req.session.user;
        grn.masterid = req.session.masterid
        grn.del = 'N',
        grn.entrydate = DateObject;

            grn.update = new Date();
        let query = { _id: req.params.id }
        let grnD = {};
        
        // grnD.purchaseid = grn._id;

        // console.log('grn id ',grn._id);

        grnD.main_bk = "GTN1";
        grnD.d_c = "D";
        grnD.c_j_s_p = req.body.so_no;
        grnD.garu_Remarks = req.body.remarks;
        // grnD.so_no = req.body.so_no;
        grnD.vouc_code = req.body.vouc_code;
        grnD.entry_Date = DateObject;
        grnD.entry_Datemilisecond =datemilisecond;
        grnD.source_Warehouse = req.body.source_warehouse;
        grnD.destination_warehouse = req.body.destination_location;
        
        // grnD.destination_warehouse = req.body.destination_warehouse; 
        // grnD.destination_warehouse = req.body.destination_location; 
        var docs1 = [];
        for (let i = 0; i < req.body.grn_group.length; i++) {
            
            if (req.body.gtn_product[i]['so_disc'] == "") req.body.gtn_product[i]['so_disc'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['actual_stdunit'] == "") req.body.grn_group[i]['actual_stdunit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['roundup_pckunit'] == "") req.body.grn_group[i]['roundup_pckunit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            // if (req.body.grn_group[i]['purchse_unit'] == "") req.body.grn_group[i]['purchse_unit'] = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            docs1[i] = {
                item_Code_Desc: req.body.gtn_product[i]['so_disc'],
                qntty: req.body.grn_group[i]['actual_qty'],
                // actual_stdunit: req.body.grn_group[i]['actual_stdunit'],
                pkng: req.body.grn_group[i]['roundup_pckqty'],
                // roundup_pckunit: req.body.grn_group[i]['roundup_pckunit'],
                net_Wt: req.body.grn_group[i]['net_Wt'],
                // purchse_unit: req.body.grn_group[i]['purchse_unit'],
                lot_no: req.body.grn_group[i]['lot_no'],
                // packingtot: req.body.grn_group[i]['packingtot'],
                // purchasetot: req.body.grn_group[i]['purchasetot'],
                // standrdtot: req.body.grn_group[i]['standrdtot'],
                gdn_Cd_Name:  req.body.source_warehouse,
                location: req.body.source_warehouse,
                // lot_group: lotdocs,
            }
        }
        grnD.garu_Aavak_Group = docs1;

        grnD.tot_Qty = req.body.tot_amtso;
        // grnD.so_remarks = req.body.so_remarks;
        // grnD.grand_total = req.body.grand_total;
        grnD.co_code = req.session.compid;
        grnD.div_code = req.session.divid;
        grnD.usrnm = req.session.user;
        grnD.masterid = req.session.masterid
        grnD.del = 'N',
        grnD.entryDate= DateObject;



        grnD.update = new Date();
        let query2 = { purchaseid: req.params.id }
        purchaseorder.update(query2, grnD, function (err) {
            if (err) 
          {
              console.log('error:::',err);
          }      // res.json({ 'success': false, 'message': 'Error in Saving Proforma', 'errors': err });
                // return;
            // } else {
            //     res.redirect('/godown_transfer_note/godown_transfer_note_list');
            // }
         });
        purchaseorder.update(query, grn, function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Proforma', 'errors': err });
                return;
            } else {
                res.redirect('/godown_transfer_note/godown_transfer_note_list');
            }

        });
    }
});

router.get('/delete_godown_transfer_note/:id', async function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }
    let query1 = { _id: req.params.id }
    var  grnEntry  = await purchaseorder.findById(req.params.id,  function (err, grnEntry) { });
    let query2 = { main_bk: 'GTN1',c_j_s_p: grnEntry.c_j_s_p,vouc_code:grnEntry.vouc_code,co_code: grnEntry.co_code,div_code: grnEntry.div_code }

        purchaseorder.remove(query2, function (err) { });        
        purchaseorder.remove(query1, function (err) {
            if (err) {
                console.log(err);
            } else {

                res.redirect('/godown_transfer_note/godown_transfer_note_list');
            }
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