const express = require('express');
const router = express.Router();
let product_mast = require('../models/fgSchema');
const mongoose = require('mongoose');
let db = mongoose.connection;
let subquality = require('../models/subqualitySchema');
let quality = require('../models/qualitySchema');
let catogry = require('../models/CategorySchema');
let modulesch = require('../models/module');
let ptyp_mast = require('../models/partyTypeSchema');
let a_mast = require('../models/accountSchema');
let taxctg_mast = require('../models/taxctgSchema');
let Stock_Unit = require('../models/skuSchema');
var Gs_master = require('../models/gsTableSchema');
var prodmast = require('../models/prodmast');

router.get('/postingProAc', function (req, res) {
    Gs_master.findOne({ group: 'POSTING ACCOUNT' }, function (err, gs_master) {
        var qry = req.query.term.term;
        var qryGs = [];
        for (let i = 0; i < gs_master.garry.length; i++) {
            qryGs.push(gs_master.garry[i])
        }
        a_mast.find({ $or: [{ 'ACName': { $regex: new RegExp("^" + qry, "i") } }, { 'ACCode': { $regex: new RegExp("^" + qry, "i") } }], GroupName: { $in: qryGs }, del: 'N', masterid: req.session.masterid }, 'ACName', function (err, party) {
            var data = new Array();
            if (party != undefined) {
                for (var j = 0; j < party.length; j++) {
                    if (party[j]['CityName'] != null) cityname = party[j]['CityName']['CityName'];
                    else cityname = "";
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
        }).sort({ 'ACName': 1 }).populate('CityName');
    })
});
router.get('/GetLastProductMastEntry', ensureAuthenticated, function (req, res) {
    product_mast.find({ masterid: req.session.masterid, del: 'N' }, function (err, product_mast) {
        if (product_mast != null && product_mast != undefined && product_mast.length > 0) {

            // console.log('product_mast',product_mast);

            var LastSetupEntry = product_mast[product_mast.length - 1].product_setup;
            var LastPostingEntry = product_mast[product_mast.length - 1].product_posting_setup;


            res.json({ 'success': true, 'LastSetupEntry': LastSetupEntry, 'LastPostingEntry': LastPostingEntry });
        } else { res.json({ 'success': false }) }
    }).populate('product_posting_setup.accontnm').populate('product_posting_setup.selesid').populate('product_posting_setup.partypid');
});
// Add Route GetLastProductMastEntry
router.get('/add_product', ensureAuthenticated, function (req, res) {
    product_mast.find({ masterid: req.session.masterid, del: 'N' }, function (err, product_mast) {
        Stock_Unit.find({ masterid: req.session.masterid, del: 'N' }, function (err, Stock_Unit) {
            subquality.find({ del: "N" }, function (err, subquality) {
                quality.find({ del: "N" }, function (err, quality) {
                    catogry.find({ del: "N" }, function (err, catogry) {
                        modulesch.find({}, function (err, modulesch) {
                            ptyp_mast.find({ del: "N" }, function (err, ptyp_mast) {
                                taxctg_mast.find({ del: "N" }, function (err, taxctg_mast) {
                                    var LastSetupEntry = [];
                                    var LastPostingEntry = [];
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        if (product_mast != null && product_mast != undefined && product_mast.length > 0) {

                                            LastSetupEntry = product_mast[product_mast.length - 1].product_setup;
                                            LastPostingEntry = product_mast[product_mast.length - 1].product_posting_setup;
                                        }
                                        // console.log('LastSetupEntry',LastSetupEntry);
                                        // console.log('LastPostingEntry',LastPostingEntry);
                                        res.render('product_mast_add.hbs', {
                                            pageTitle: 'Add Product Master',
                                            Sno: 1,
                                            LastSetupEntry: JSON.stringify(LastSetupEntry),
                                            LastPostingEntry: JSON.stringify(LastPostingEntry),
                                            taxctg_mast: taxctg_mast,
                                            ptyp_mast: ptyp_mast,
                                            modulesch: modulesch,
                                            subquality: subquality,
                                            quality: quality,
                                            catogry: catogry,
                                            Stock_Unit: Stock_Unit,
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
                })
            })
        })
    }).populate('product_posting_setup.accontnm').populate('product_posting_setup.selesid').populate('product_posting_setup.partypid');
})

router.get('/product_mast', ensureAuthenticated, function (req, res) {
    product_mast.find({ masterid: req.session.masterid, del: 'N' }, function (err, product_mast) {
        if (err) {
            console.log(err);
        } else {
            res.render('product_mast.hbs', {
                pageTitle: 'Product Mast List',
                product_mast: product_mast,
                compnm: req.session.compnm,
                divnm: req.session.divmast,
                sdate: req.session.compsdate,
                edate: req.session.compedate,
                usrnm: req.session.user,
                security: req.session.security,
                administrator: req.session.administrator
            });
        }
    }).populate('item_group', 'Description').populate('subquality', 'Description')
        .populate('dana_class', 'Description').populate('unit_nm', 'SKUName').populate('tax_categry', 'tx_ctgnm')
});
// .limit(10) 
router.post('/product_mast_add', function (req, res) {
    if (req.body.item_group == "") req.body.item_group = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.subquality == "") req.body.subquality = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.dana_class == "") req.body.dana_class = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.unit_nm == "") req.body.unit_nm = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.tax_categry == "") req.body.tax_categry = mongoose.Types.ObjectId('578df3efb618f5141202a196');

    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
    }
    else {
        let prdt = new product_mast();

        prdt.item_code = req.body.item_code;
        prdt.item_title = req.body.item_title;
        prdt.item_group = req.body.item_group;
        prdt.subquality = req.body.subquality;
        prdt.dana_class = req.body.dana_class;
        prdt.dana_rt = req.body.dana_rt;
        prdt.apmc_code = req.body.apmc_code;
        prdt.apmc_typ = req.body.apmc_typ;
        prdt.dana_dalali = req.body.dana_dalali;
        prdt.dalali_typ = req.body.dalali_typ;
        prdt.desper = req.body.desper;
        prdt.tax_categry = req.body.tax_categry;
        prdt.container_rate = req.body.container_rate;
        prdt.rate_basedon = req.body.rate_basedon;
        prdt.packing = req.body.packing;
        prdt.laga_paisa = req.body.laga_paisa;
        prdt.unit_nm = req.body.unit_nm;
        prdt.container_code = req.body.container_code;
        prdt.containe_charges = req.body.containe_charges;
        prdt.entry_tax = req.body.entry_tax;
        prdt.GST = req.body.GST;
        prdt.co_code = req.session.compid;
        prdt.div_code = req.session.divid;
        prdt.usrnm = req.session.user;
        prdt.masterid = req.session.masterid;
        prdt.product_setup = req.body.product_setup_grop;
        var postGroup = [];


        for (let i = 0; i < req.body.selesid.length; i++) {
            if (req.body.selesid == "") req.body.selesid = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.partypid == "") req.body.partypid = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.accontnm == "") req.body.accontnm = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            postGroup[i] = {
                selesid: req.body.selesid[i],
                selesnm: req.body.selesnm[i],
                partypid: req.body.partypid[i],
                accontnm: req.body.accontnm[i],
            }
        }
        prdt.product_posting_setup = postGroup;
        console.log(postGroup)
        prdt.entrydate = new Date();
        prdt.del = 'N';
        prdt.save(function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'error in saving city', 'errors': err });
                return;
            }
            else {
                res.redirect('/product_mast/add_product');
            }
        });
    }
});

router.get('/edit_product_mast/:id', ensureAuthenticated, function (req, res) {
    product_mast.findById(req.params.id, function (err, product_mast) {
        Stock_Unit.find({ masterid: req.session.masterid, del: 'N' }, function (err, Stock_Unit) {
            subquality.find({ del: "N" }, function (err, subquality) {
                quality.find({ del: "N" }, function (err, quality) {
                    catogry.find({ del: "N" }, function (err, catogry) {
                        modulesch.find({}, function (err, modulesch) {
                            ptyp_mast.find({ del: "N" }, function (err, ptyp_mast) {
                                // a_mast.find({del:"N"}, function (err,a_mast){
                                taxctg_mast.find({ del: "N" }, function (err, taxctg_mast) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.render('product_mast_update.hbs', {
                                            pageTitle: 'Update Product Master',
                                            product_mast: product_mast,
                                            taxctg_mast: taxctg_mast,
                                            // a_mast:a_mast,
                                            ptyp_mast: ptyp_mast,
                                            modulesch: modulesch,
                                            subquality: subquality,
                                            quality: quality,
                                            catogry: catogry,
                                            Stock_Unit: Stock_Unit,
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
                                // })
                            })
                        })
                    })
                })
            })
        })
    }).populate('product_posting_setup.partypid').populate('product_posting_setup.accontnm').populate('product_posting_setup.selesid')
})
router.post('/edit_product_mast/:id', function (req, res) {
    if (req.body.item_group == "") req.body.item_group = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.subquality == "") req.body.subquality = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.dana_class == "") req.body.dana_class = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.unit_nm == "") req.body.unit_nm = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.tax_categry == "") req.body.tax_categry = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
    }
    else {
        let prdt = {};
        prdt.item_code = req.body.item_code;
        prdt.item_title = req.body.item_title;
        prdt.item_group = req.body.item_group;
        prdt.subquality = req.body.subquality;
        prdt.dana_class = req.body.dana_class;
        prdt.dana_rt = req.body.dana_rt;
        prdt.apmc_code = req.body.apmc_code;
        prdt.apmc_typ = req.body.apmc_typ;
        prdt.dana_dalali = req.body.dana_dalali;
        prdt.dalali_typ = req.body.dalali_typ;
        prdt.desper = req.body.desper;
        prdt.tax_categry = req.body.tax_categry;
        prdt.container_rate = req.body.container_rate;
        prdt.rate_basedon = req.body.rate_basedon;
        prdt.packing = req.body.packing;
        prdt.laga_paisa = req.body.laga_paisa;
        prdt.unit_nm = req.body.unit_nm;
        prdt.container_code = req.body.container_code;
        prdt.containe_charges = req.body.containe_charges;
        prdt.entry_tax = req.body.entry_tax;
        prdt.GST = req.body.GST;
        prdt.co_code = req.session.compid;
        prdt.div_code = req.session.divid;
        prdt.usrnm = req.session.user;
        prdt.masterid = req.session.masterid;
        prdt.updatedate = new Date();
        prdt.del = 'N';
        prdt.product_setup = req.body.product_setup_grop;
        var postGroup = [];
        for (let i = 0; i < req.body.product_posting_setup.length; i++) {
            if (req.body.product_posting_setup[i].selesid == "") req.body.product_posting_setup[i].selesid = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.product_posting_setup[i].partypid == "") req.body.product_posting_setup[i].partypid = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.product_posting_setup[i].accontnm == "") req.body.product_posting_setup[i].accontnm = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            postGroup[i] = {
                selesid: req.body.product_posting_setup[i].selesid,
                selesnm: req.body.product_posting_setup[i].selesnm,
                partypid: req.body.product_posting_setup[i].partypid,
                accontnm: req.body.product_posting_setup[i].accontnm
            }
        }
        prdt.product_posting_setup = postGroup;
        let query = { _id: req.params.id }
        product_mast.update(query, prdt, function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Outward Challan', 'errors': err });
                return;
            } else {
                res.redirect('/product_mast/product_mast');
            }

        });
    }
});

let GaruAavak = require('../models/Garu_Aavak_Schema');
let journalmast = require('../models/trans');
router.delete('/confirm/:id', function (req, res) {
    console.log(req.params.id)
    let query = { _id: req.params.id }
    GaruAavak.find({ $or: [{ main_bk: 'GAE' }, { main_bk: 'Sale' }], "garu_Aavak_Group": { $elemMatch: { item_Code_Desc: req.params.id } }, del: 'N', div_code: req.session.divid, co_code: req.session.compid }, function (err, daily_grocery) {
        if (err) {
            console.log(err);
        }
        if (daily_grocery == null || daily_grocery == [] || daily_grocery == '') {
            res.json({ success: 'false' });
        } else {
            res.json({ success: 'true' });
        }
    });
});

router.delete('/:id', function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }
    else {
        let query = { _id: req.params.id }
        let product = {};
        product.del = 'Y';
        product.delete = new Date();
        product_mast.update(query, product, function (err, somast) {
            if (err) {
                console.log(err);
            }
            res.send('Success');
        });
    }
});
router.post('/product_mast_add_In_Model', function (req, res) {
    if (req.body.item_group == "") req.body.item_group = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.subquality == "") req.body.subquality = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.dana_class == "") req.body.dana_class = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.unit_nm == "") req.body.unit_nm = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.tax_categry == "") req.body.tax_categry = mongoose.Types.ObjectId('578df3efb618f5141202a196');

    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
    }
    else {
        let prdt = new product_mast();
        prdt.item_code = req.body.item_code;
        prdt.item_title = req.body.item_title;
        prdt.item_group = req.body.item_group;
        prdt.subquality = req.body.subquality;
        prdt.dana_class = req.body.dana_class;
        prdt.dana_rt = req.body.dana_rt;
        prdt.apmc_code = req.body.apmc_code;
        prdt.apmc_typ = req.body.apmc_typ;
        prdt.dana_dalali = req.body.dana_dalali;
        prdt.dalali_typ = req.body.dalali_typ;
        prdt.desper = req.body.desper;
        prdt.tax_categry = req.body.tax_categry;
        prdt.container_rate = req.body.container_rate;
        prdt.rate_basedon = req.body.rate_basedon;
        prdt.packing = req.body.packing;
        prdt.laga_paisa = req.body.laga_paisa;
        prdt.unit_nm = req.body.unit_nm;
        prdt.container_code = req.body.container_code;
        prdt.containe_charges = req.body.containe_charges;
        prdt.entry_tax = req.body.entry_tax;
        prdt.GST = req.body.GST;
        prdt.co_code = req.session.compid;
        prdt.div_code = req.session.divid;
        prdt.usrnm = req.session.user;
        prdt.masterid = req.session.masterid;
        prdt.product_setup = req.body.product_setup_grop;
        var postGroup = [];
        for (let i = 0; i < req.body.selesid.length; i++) {
            if (req.body.selesid == "") req.body.selesid = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.partypid == "") req.body.partypid = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if (req.body.accontnm == "") req.body.accontnm = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            postGroup[i] = {
                selesid: req.body.selesid[i],
                selesnm: req.body.selesnm[i],
                partypid: req.body.partypid[i],
                accontnm: req.body.accontnm[i],
            }
        }
        prdt.product_posting_setup = postGroup;
        console.log(postGroup)
        prdt.entrydate = new Date();
        prdt.del = 'N';
        prdt.save(function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'error in saving city', 'errors': err });
                // return;
            }
            else {
                res.json({ 'success': true });
                // res.redirect('/product_mast/add_product');
            }
        });
    }
});

router.get('/new_product_mast', ensureAuthenticated, async function (req, res) {
    // product_mast.updateMany({del:'N'},{GST:'5'},function(err){
    //     if(err)console.log('error',err);
    //     else console.log('success');
    // })
    // product_mast.find({del:'N'},async function (err, product){
    //     var count = 0;
    //     var count_N = 0;
    //     if(product != null){
    //         for(let i=0; i<product.length; i++){
    //             // console.log(product[i].item_code)
    //             var new_Prod = await prodmast.findOne({ItemCode:product[i].item_code},function(err,pard){});
    //             // console.log(new_Prod)
    //             let prdt = {};
    //             // var item_grp = await catogry.findOne({Description:new_Prod[i].ItemGroup}, function (err,catogry){});
    //             // prdt.item_code = new_Prod[i].ItemCode;
    //             prdt.item_title = new_Prod.ItemTitle;
    //             // if(item_grp != null)prdt.item_group = item_grp._id;
    //             // prdt.subquality = req.body.subquality;
    //             // prdt.dana_class = '';
    //             // prdt.dana_rt = new_Prod[i].DanaRate;
    //             // prdt.apmc_code = new_Prod[i].HSNCode;
    //             // prdt.apmc_typ = new_Prod[i].APMC;
    //             // prdt.dana_dalali = new_Prod[i].SALESDalai;
    //             // prdt.dalali_typ = 'PBag';
    //             console.log(i,new_Prod.Packing)
    //             prdt.packing = new_Prod.Packing;
    //             // prdt.GST = req.body.GST;
    //             // prdt.co_code =  req.session.compid;
    //             // prdt.div_code =  req.session.divid;
    //             // prdt.usrnm =  req.session.user;
    //             // prdt.masterid =   req.session.masterid;
    //             // prdt.product_setup = product.product_setup;
    //             // prdt.product_posting_setup = product.product_posting_setup;;
    //             // prdt.entrydate = new Date();
    //             // prdt.del = 'N';
    //             // count = count +1;
    //             var qry = {_id:product[i]._id};
    //             // console.log(i,prdt,qry)
    //             // console.log('#####################')
    //             product_mast.update(qry,prdt,function (err){
    //                 if(err)
    //                 {
    //                     console.log('error',err)
    //                 }
    //                 else
    //                 {
    //                     console.log(i,'success');
    //                 }
    //             });
    //         }
    //     }
    //     console.log('comlete');
    // }).populate('item_group','Description').populate('subquality','Description')
    // .populate('dana_class','Description').populate('unit_nm','SKUName').populate('tax_categry','tx_ctgnm')
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