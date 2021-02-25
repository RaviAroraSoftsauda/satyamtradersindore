const express = require('express');
const router = express.Router();
let bank_details = require('../models/bank_details_Schema');

let div_com = require('../models/company_schema');
let div_mast = require('../models/division_schema');
let c_mast= require('../models/country_mast');
// Add Route    

router.get('/DraweeBank', function (req, res) {
    var qry = req.query.term.term;
    bank_details.find({$or: [{ 'bankName': { $regex: new RegExp("^"+qry,"i")}},{'ifscCode':qry},{'micrCode': qry}],del:'N',masterid:req.session.masterid},  function(err, party){
        var data = new Array();
        if(party!=undefined){
            for (var j = 0; j < party.length; j++) {
                data[j] = {
                    "id": party[j]._id,
                    "text" : party[j].bankName +',('+ party[j].ifscCode+ '),'+ party[j].branchName
                    };
            }
            res.json({'results':  data, "pagination": {
                        "more": false
                    } });
        }
    }).sort({'bankName':1});
});

router.get('/bank_details', ensureAuthenticated, function(req, res){
    bank_details.find({del:"N"}, function (err, bank_details) {
        if (err) {
            console.log(err);
        } else {
           res.render('bank_details.hbs', {
                pageTitle: 'Add Bank Details',
                bank_details:bank_details,
                 c_mast:c_mast,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator             
            });
        }
    }).populate('c_name')
});

router.post('/bank_details_add', function(req, res) {
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    }else{
        var GaruEntryModel = req.body.GaruEntryModel;
        let brand = new bank_details();    
        brand.bankName = req.body.bankName;
        brand.branchName = req.body.branchName;
        brand.ifscCode = req.body.ifscCode;
        brand.micrCode = req.body.micrCode;
        brand.address = req.body.address;
        brand.address3 = req.body.address3;
        brand.address2 = req.body.address2;
        // brand.address3 = req.body.address3;
        brand.contact = req.body.contact;
        brand.remark = req.body.remark;
        // brand.StateCapital = req.body.state_capital;
        brand.co_code = req.session.compid;
        brand.div_code = req.session.divid;
        brand.masterid = req.session.masterid;
        brand.del = 'N';
        brand.entry = new Date();
        brand.usrnm =  req.session.user,
        bank_details.findOne({ifscCode: req.body.ifscCode,masterid:req.session.masterid,div_code:req.session.divid,co_code:req.session.compid,del:'N'}, function(errors, bank_details){
        let agrfg=true;
            if(bank_details==null) {
                brand.save()
                agrfg=true;
            }else{
                agrfg=false;
            }
            res.json({'success': agrfg,'GaruEntryModel':GaruEntryModel});
        })
    }
});


router.get('/:id', ensureAuthenticated, function(req, res){
    bank_details.findById(req.params.id, function(err, bank_details){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching district details' });
        } else {
            res.json({ 'success': true, 'bank_details': bank_details });
        }
    });
});


router.post('/edit_bank_details/:id', function(req, res) {
    let errors = req.validationErrors();
    if (errors) {
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let state = {};
        state.bankName = req.body.bankName;
        state.branchName = req.body.branchName;
        state.ifscCode = req.body.ifscCode;
        state.micrCode = req.body.micrCode;
        state.address = req.body.address;
        state.address2 = req.body.address2;
        state.address3 = req.body.address3;
        // brand.address3 = req.body.address3;
        state.contact = req.body.contact;
        state.remark = req.body.remark;
        state.co_code = req.session.compid;
        state.div_code = req.session.divid;
        state.masterid =  req.session.masterid;
        state.update =  new Date();
        state.user =  req.session.user;
        let query = {_id:req.params.id}
         let trfls=false;
        bank_details.update(query , state ,function (err) {
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating State', errors: err });
            } else {
                res.json({'success':true});
            }
        });
    }
})

let BillCollection = require('../models/trans');
router.delete('/confirm/:id', function(req, res){
    console.log(req.params.id)
    BillCollection.find({Drawee_Bank:req.params.id,main_bk:'BC',del:"N",masterid:req.session.masterid,div_code:req.session.divid,co_code:req.session.compid}, function(err, BillCollection){
        if(err){
          console.log(err);
        }else{
            if(BillCollection == null || BillCollection == "" || BillCollection == []){
                res.json({success:'false'});
            }else{
                res.json({success:'true'});
            }
        }
    });
});

router.delete('/:id', function(req, res){    
    if(!req.user._id){
      res.status(500).send();
    }else{
    let query = {_id:req.params.id}
    let state = {};
    state.del = 'Y';
    state.delete = new Date();
    bank_details.update(query,state, function(err,somast){
          if(err){
            console.log(err);
          }
          res.send('Success');
        });
    }
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