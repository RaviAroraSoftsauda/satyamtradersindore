const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let tax_mast= require('../models/taxSchema');

var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');

router.get('/TAX', function (req, res) {
    Gs_master.findOne({group: 'TAX'},function (err, gs_master){
    var qry = req.query.term.term;
    var qryGs = [];
        for(let i=0; i<gs_master.garry.length; i++){
            qryGs.push(gs_master.garry[i])
        }
    Account_master.find({$or: [{ 'ACName': { $regex: new RegExp("^"+qry,"i")}},{'ACCode':qry}],GroupName :{ $in : qryGs },del:'N',masterid:req.session.masterid},'ACName',  function(err, party){
        // console.log(party);
        var data = new Array();
        if(party==undefined || party == null || party == []){
        }else{
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
router.get('/TDS', function (req, res) {
    Gs_master.findOne({group: 'TDS'},function (err, gs_master){
    var qry = req.query.term.term;
    var qryGs = [];
        for(let i=0; i<gs_master.garry.length; i++){
            qryGs.push(gs_master.garry[i])
        }
    Account_master.find({$or: [{ 'ACName': { $regex: new RegExp("^"+qry,"i")}},{'ACCode':qry}],GroupName :{ $in : qryGs },del:'N',masterid:req.session.masterid},'ACName',  function(err, party){
        // console.log(party);
        var data = new Array();
        if(party==undefined || party == null || party == []){
        }else{
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

router.get('/tax_mast', ensureAuthenticated, function(req, res){
    tax_mast.find({del :"N", masterid: req.session.masterid}, function (err,tax_mast){
            if (err) {
                console.log(err);
            } else {
                res.render('tax_mast.hbs', {
                    pageTitle:'Tax Master',
                    tax_mast:tax_mast,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).populate('tx_TDSAC').populate('tx_SGSTR').populate('tx_SGSTP').populate('tx_CGSTR').populate('tx_CGSTP').populate('tx_IGSTR').populate('tx_IGSTP');
 });

router.post('/tax_mast_add',function(req, res){
    // console.log(req.body.Rm_ProCode)
        if(req.body.tx_TDSAC=="" || req.body.tx_TDSAC==null) req.body.tx_TDSAC=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.tx_SGSTR=="" || req.body.tx_SGSTR==null) req.body.tx_SGSTR=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.tx_SGSTP=="" || req.body.tx_SGSTP==null) req.body.tx_SGSTP=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.tx_CGSTR=="" || req.body.tx_CGSTR==null) req.body.tx_CGSTR=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.tx_CGSTP=="" || req.body.tx_CGSTP==null) req.body.tx_CGSTP=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.tx_IGSTR=="" || req.body.tx_IGSTR==null) req.body.tx_IGSTR=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.tx_IGSTP=="" || req.body.tx_IGSTP==null) req.body.tx_IGSTP=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
    let tax = new tax_mast();
        tax.tx_Thead = req.body.tx_Thead;
        tax.tx_TDSAC = req.body.tx_TDSAC;
        tax.tx_ScCode = req.body.tx_ScCode;
        tax.tx_TDS = req.body.tx_TDS;
        tax.tx_GST = req.body.tx_GST;
        tax.tx_SGSTR = req.body.tx_SGSTR;
        tax.tx_SGSTP = req.body.tx_SGSTP;
        tax.tx_CGSTR = req.body.tx_CGSTR;
        tax.tx_CGSTP = req.body.tx_CGSTP;
        tax.tx_IGSTR = req.body.tx_IGSTR;
        tax.tx_IGSTP = req.body.tx_IGSTP;
        tax.entrydate = new Date();
        tax.del =  "N";
        tax.user =  req.session.user;
        tax.masterid =   req.session.masterid;
        tax.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving tax','errors':err});
                return;
            }
            else
            {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/tax_mast/tax_mast');
            }
        });
    }
});

router.get('/:id', ensureAuthenticated, function(req, res){
    tax_mast.findById(req.params.id, function(err, tax_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching tax' });
        } else {
            res.json({ 'success': true, 'tax_mast': tax_mast });
        }
    }).populate('tx_TDSAC').populate('tx_SGSTR').populate('tx_SGSTP').populate('tx_CGSTR').populate('tx_CGSTP').populate('tx_IGSTR').populate('tx_IGSTP');
});


router.post('/tax_mast_update/:id',function(req, res){
    if(req.body.tx_TDSAC=="" || req.body.tx_TDSAC==null) req.body.tx_TDSAC=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.tx_SGSTR=="" || req.body.tx_SGSTR==null) req.body.tx_SGSTR=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.tx_SGSTP=="" || req.body.tx_SGSTP==null) req.body.tx_SGSTP=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.tx_CGSTR=="" || req.body.tx_CGSTR==null) req.body.tx_CGSTR=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.tx_CGSTP=="" || req.body.tx_CGSTP==null) req.body.tx_CGSTP=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.tx_IGSTR=="" || req.body.tx_IGSTR==null) req.body.tx_IGSTR=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.tx_IGSTP=="" || req.body.tx_IGSTP==null) req.body.tx_IGSTP=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
    let tax = {};
        tax.tx_Thead = req.body.tx_Thead;
        tax.tx_TDSAC = req.body.tx_TDSAC;
        tax.tx_ScCode = req.body.tx_ScCode;
        tax.tx_TDS = req.body.tx_TDS;
        tax.tx_GST = req.body.tx_GST;
        tax.tx_SGSTR = req.body.tx_SGSTR;
        tax.tx_SGSTP = req.body.tx_SGSTP;
        tax.tx_CGSTR = req.body.tx_CGSTR;
        tax.tx_CGSTP = req.body.tx_CGSTP;
        tax.tx_IGSTR = req.body.tx_IGSTR;
        tax.tx_IGSTP = req.body.tx_IGSTP;
        tax.entry = new Date();tax
        tax.del =  "N";
        tax.user =  req.session.user;
        tax.masterid =   req.session.masterid;

        let query = { _id:req.params.id}
        //  console.log('xxxx'+ query);
         tax_mast.update(query, tax, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating tax', errors: err });
            } else {
                res.redirect('/tax_mast/tax_mast');
            }
        });
    }
});
router.delete('/:id', function(req, res){
      let query = {_id:req.params.id}
        var tax = {};
        tax.del = 'Y';
        tax.delete = new Date();
        tax_mast.update(query,tax, function(err){
        if(err){
            console.log(err);
        }
            res.send('Success');
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