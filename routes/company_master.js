const express = require('express');
const router = express.Router(); 
let company = require('../models/company_schema');
const moment = require('moment-timezone');
var query;

// Add Route
router.get('/company_master', ensureAuthenticated, function(req, res){
    company.find({}, function (err, company){
            if (err) {
                console.log(err);
            } else {
                res.render('company_master.hbs', {
                    pageTitle:'Add company',
                    company: company,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                });
            }
        })
    });
    router.post('/submit',function(req, res){
        let errors = req.validationErrors();
        var sdate = req.body.sdate;
        var startdate =  moment(sdate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var edate = req.body.edate;
        var enddate =  moment(edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let cmpny = new company();
            cmpny.com_name = req.body.com_name;
            cmpny.sdate = startdate;
            cmpny.edate = enddate;
            cmpny.mast_nm = req.body.mast_nm;
            cmpny.Dealer_miscsno = req.body.Dealer_miscsno;
            cmpny.Q_T_K = req.body.Q_T_K;
            // brnd.co_code =  req.session.compid;
            // brnd.div_code =  req.session.divid;
            // brnd.usrnm =  req.session.user;
            // brnd.masterid =   req.session.masterid;
            cmpny.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving city','errors':err});
                    return;
                }
                else
                {
                    res.redirect('/company_master/company_master');
                }
            });
        }
    });
    router.get('/:id', ensureAuthenticated, function(req, res){
        company.findById(req.params.id, function(err, company){
            if (err) {
                res.json({ 'success': false, 'message': 'error in fetching company details' });
            } else {
                res.json({ 'success': true, 'company': company });
            }
            
        });
    });
        router.post('/update/:id', function(req, res) {
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let cmpny = {}; 
             
                var sdate = req.body.sdate;
                var startdate =  moment(sdate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var edate = req.body.edate;
                var enddate =  moment(edate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var EndDate = enddate.format('x');
                cmpny.com_name = req.body.com_name;
                cmpny.sdate =startdate;
                cmpny.edate =EndDate;
                cmpny.mast_nm = req.body.mast_nm;
                cmpny.Dealer_miscsno = req.body.Dealer_miscsno;
                cmpny.Q_T_K = req.body.Q_T_K;
                let query = {_id:req.params.id}
                company.update(query ,cmpny ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        res.redirect('/company_master/company_master');
                    }
                });
            }
        });
        router.get('/delete_companymaster/:id', function(req, res){
            let query = {_id:req.param.id}
            company.findById(req.params.id, function(err, company){
                company.remove(query,function(err){
                    if(err)
                    {
                        console.log(err);
                    }
                    res.redirect('/company_master/company_master');
                });
            });
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