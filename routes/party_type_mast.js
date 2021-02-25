const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let ptyp_mast = require('../models/partyTypeSchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');

// Add Route
router.get('/party_type_mast', ensureAuthenticated, function (req, res) {
    Account_master.find({ masterid: req.session.masterid, del: 'N' }, function (err, account_masters) {
        Gs_master.findOne({ group: 'POSTING ACCOUNT' }, function (err, gs_master) {
            ptyp_mast.find({ del: "N" }, function (err, ptyp_mast) {
                if (err) {
                    console.log(err);
                } else {
                    accarry = [];
                    if (gs_master != null && gs_master['garry'] != null && account_masters != null) {
                        for (let g = 0; g < gs_master['garry'].length; g++) {
                            for (let j = 0; j < account_masters.length; j++) 
                            {
                                // console.log('----',gs_master['garry'][g]._id,'----');
                                // if (gs_master['garry'][g]._id.equals(n._id)) {
                                if (gs_master['garry'][g]._id.equals(account_masters[j]._id)) {
                                    var arr = { _id: account_masters[j]._id, ACName: account_masters[j]['ACName'], CityName: account_masters[j]['CityName'] };
                                    this.accarry.push(arr);
                                    // console.log('r',account_masters[j]['ACName']);  
                                }
                            }
                        }
                        // console.log(this.accarry)
                    }
                    var buyername = this.accarry;
                    res.render('party_type_mast.hbs', {
                        pageTitle: 'PartyType',
                        ptyp_mast: ptyp_mast,
                        ac_mast: buyername,
                        compnm: req.session.compnm,
                        divnm: req.session.divmast,
                        sdate: req.session.compsdate,
                        edate: req.session.compedate,
                        usrnm: req.session.user,
                        security: req.session.security,
                        administrator: req.session.administrator
                    });
                }
            }).populate('sales_posting_ac', 'ACName').populate('pur_posting_ac', 'ACName').populate('SR_posting_ac', 'ACName').populate('PR_posting_ac', 'ACName');
        })
    })
});

router.post('/ptype_mast_add', function (req, res) {
    let errors = req.validationErrors();
    if (req.body.sales_posting_ac == "") req.body.sales_posting_ac = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.pur_posting_ac == "") req.body.pur_posting_ac = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.SR_posting_ac == "") req.body.SR_posting_ac = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.PR_posting_ac == "") req.body.PR_posting_ac = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (errors) {
        console.log(errors);
    }
    else {

        let raw = new ptyp_mast();
        raw.Description = req.body.ptype_descr;
        raw.Code = req.body.ptype_Code;
        raw.sales_posting_ac = req.body.sales_posting_ac;
        raw.pur_posting_ac = req.body.pur_posting_ac;
        raw.SR_posting_ac = req.body.SR_posting_ac;
        raw.PR_posting_ac = req.body.PR_posting_ac;
        raw.masterid = req.session.masterid
        raw.user = req.session.user;
        raw.entry = new Date();
        raw.del = 'N';
        raw.save(function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'error in saving party_type', 'errors': err });
                return;
            }
            else {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/party_type_mast/party_type_mast');
            }
        });
    }
});
router.get('/:id', ensureAuthenticated, function (req, res) {
    ptyp_mast.findById(req.params.id, function (err, ptyp_mast) {
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching brnad details' });
        } else {
            res.json({ 'success': true, 'ptyp_mast': ptyp_mast });
        }

    });
});
router.post('/edit_ptype_mat/:id', function (req, res) {
    let errors = req.validationErrors();
    if (req.body.sales_posting_ac == "") req.body.sales_posting_ac = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.pur_posting_ac == "") req.body.pur_posting_ac = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.SR_posting_ac == "") req.body.SR_posting_ac = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (req.body.PR_posting_ac == "") req.body.PR_posting_ac = mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if (errors) {
        console.log(errors);
    }
    else {
        let raw = {};
        raw.Description = req.body.ptype_descr;
        raw.Code = req.body.ptype_Code;
        raw.sales_posting_ac = req.body.sales_posting_ac;
        raw.pur_posting_ac = req.body.pur_posting_ac;
        raw.SR_posting_ac = req.body.SR_posting_ac;
        raw.PR_posting_ac = req.body.PR_posting_ac;

        raw.masterid = req.session.masterid
        raw.user = req.session.user;
        raw.entry = new Date();
        raw.del = 'N';
        let query = { _id: req.params.id }
        ptyp_mast.update(query, raw, function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Updating City', errors: err });
            } else {
                res.redirect('/party_type_mast/party_type_mast');
            }
        });
    }
});


let citymast = require('../models/citySchema');
let accountmast = require('../models/accountSchema');
router.delete('/confirm/:id', function (req, res) {
    // console.log(req.params.id)
    let query = { _id: req.params.id }
    citymast.find({ PartyType: req.params.id, del: "N" }, function (err, city) {
        accountmast.find({ PartyType: req.params.id, del: "N" }, function (err, account) {
            if (err) {
                console.log(err);
            } else {
                // console.log(account)
                if (city == [] || city == '' || account == []) {
                    res.json({ success: 'false' });
                } else {
                    res.json({ success: 'true' });
                }
            }

        });
    });
});

router.delete('/:id', function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    } else {
        let query = { _id: req.params.id }
        let state = {};
        state.del = 'Y';
        state.delete = new Date();
        ptyp_mast.update(query, state, function (err, somast) {
            if (err) {
                console.log(err);
            }
            res.send('Success');
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