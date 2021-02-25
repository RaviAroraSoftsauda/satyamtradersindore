const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let somast = require('../models/salesorder_schema');
const moment = require('moment-timezone');
let product = require('../models/fgSchema');
let WIP_mast = require('../models/WIP_mastSchema');
let rawMat_mast= require('../models/rawmatSchema');
let production_dept = require('../models/production_deptSchema');
let plan_entry = require('../models/plan_entrySchema');
let division = require('../models/division_schema');
var query;

router.get('/productlist', function (req, res) {
    product.find({masterid:req.session.masterid,del:'N'}, function(err, product){
        WIP_mast.find({masterid:req.session.masterid,del:'N'}, function(err, WIP_mast){
            rawMat_mast.find({del :"N", masterid: req.session.masterid}, function (err,rawMat_mast){
                res.json({ 'success': true, 'product': product,'WIP_mast':WIP_mast,'rawMat_mast':rawMat_mast});
            });
        });
    });
});

router.get('/lastno/:cjsp', function (req, res) {
    somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:'WIPDEPT',del:"N"}, function (err,somast){
        production_dept.find({masterid:req.session.masterid,del:"N"}, function (err,production_dept){
            var last = 0;
            var cjsp = req.params.cjsp;
            if(somast=='' || somast == []){
                last=1;
            }else {
                for(let i=0; i<somast.length; i++){
                    if(somast[i].c_j_s_p == cjsp){
                        last = parseInt(somast[i].vouc_code)+1;
                    }
                }
            } 
            if(last==0)last=1;  
            var fg = production_dept[production_dept.length-1]._id;              
            res.json({ 'success': true, 'last': last,'fg':fg});
        }).sort({'Order':1});
    }).sort({'vouc_code':1});
});

// production_dept_name
router.get('/WIP_DeptEntry', ensureAuthenticated, function(req, res){
   somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:'WIPDEPT',del:"N"}, function (err,somast){
        product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
            production_dept.find({masterid:req.session.masterid,Code:'WIP',del:"N"}, function (err,production_dept){
                WIP_mast.find({masterid:req.session.masterid,del:"N"}, function (err,WIP_mast){
                    if (err) {
                    console.log(err);
                    } else {
                        var last = 0;
                        // console.log(WIP_mast);
                        if(somast=='' || somast == []){
                            last=1;
                        }else{last = parseInt(somast[0].vouc_code)+1;}
                        if(last==0)last=1;
                        res.render('WIP_DeptEntry.hbs', {
                                    pageTitle:'WIP Entry',
                                    somast:somast,
                                    production_dept:production_dept,
                                    last: last,
                                    product:product,
                                    WIP_mast:WIP_mast,
                                    compnm:req.session.compnm,
                                    divnm:req.session.divmast,
                                    sdate: req.session.compsdate,
                                    edate:req.session.compedate,
                                    usrnm:req.session.user,
                                    security: req.session.security,
                                    administrator:req.session.administrator
                        });
                    }
                });
            });    
        });
    }).sort({'vouc_code':-1});
});


router.post('/add', async function(req, res){
        let errors = req.validationErrors();
        var sodate = req.body.so_date;
        var DateObject =  moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');
        if(req.body.DPCD=="") req.body.DPCD=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.OPDPCD=="") req.body.OPDPCD=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            console.log(req.body.vouc_code)
            // var WIPgrp = req.body.sales_or_group;
            let saleorder = new somast();
            saleorder.main_bk = "WIPDEPT";
            saleorder.c_j_s_p = req.body.c_j_s_p;
            saleorder.vouc_code = req.body.vouc_code;
            saleorder.so_date =sodate;
            saleorder.so_datemilisecond = sodatemilisecond;
            saleorder.DPCD = req.body.DPCD;
            saleorder.OPDPCD = req.body.OPDPCD;
            saleorder.tot_sooq = req.body.tot_sooq;
            saleorder.buy_rmks = req.body.buy_rmks;
            var salearr = [];
            for(let i=0; i<req.body.sales_or_group.length; i++){
                if(req.body.sales_or_group[i].so_disc == '')req.body.sales_or_group[i].so_disc=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.sales_or_group[i].WIP_name == '')req.body.sales_or_group[i].WIP_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                salearr[i]={
                    plan_no:req.body.sales_or_group[i].plan_no,
                    so_disc:req.body.sales_or_group[i].so_disc,
                    WIP_name:req.body.sales_or_group[i].WIP_name,
                    so_qty:req.body.sales_or_group[i].so_qty,
                    Bs_qty:req.body.sales_or_group[i].Bs_qty,
                    Rej_qty:req.body.sales_or_group[i].Rej_qty,
                    WIP_Rem:req.body.sales_or_group[i].WIP_Rem,
                }
            }
            saleorder.sales_or_group = salearr;
            saleorder.co_code = req.session.compid;
            saleorder.div_code = req.session.divid;
            saleorder.usrnm = req.session.user;
            saleorder.masterid = req.session.masterid;
            saleorder.del = "N";
            saleorder.entry = new Date();
            saleorder.save(async function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving WIP_entry','errors':err});
                }
                else
                {
                    res.redirect('/WIP_DeptEntry/WIP_DeptEntry');
                }
            });
        }
    });

router.get('/WIP_DeptEntrylist', ensureAuthenticated ,function(req,res){
   somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:'WIPDEPT',del:'N'}, function (err,somast){
        if(err)
        {
            console.log(err);
        }
        else{
            res.render('WIP_DeptEntrylist.hbs',{
                pageTitle: 'WIP Entry List',
                somast: somast,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
        }
    }).sort({vouc_code:1}).populate('DPCD').populate('OPDPCD');
});

router.get('/WIP_Register', ensureAuthenticated ,function(req,res){
             res.render('WIP_Register.hbs',{
                 pageTitle: 'WIP Register',
                 compnm:req.session.compnm,
                 divnm:req.session.divmast,
                 sdate: req.session.compsdate,
                 edate:req.session.compedate,
                 usrnm:req.session.user,
                 security: req.session.security,
                 administrator:req.session.administrator
             });
 });


router.get('/WIP_DeptEntry_update/:id', ensureAuthenticated, function(req, res){
    somast.findById(req.params.id, function (err,somast){
        product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
            production_dept.find({masterid:req.session.masterid,Code:'WIP',del:"N"}, function (err,production_dept){
                WIP_mast.find({masterid:req.session.masterid,del:"N"}, function (err,WIP_mast){
                    if (err) {
                        console.log(err);
                    } else {
                        res.render('WIP_DeptEntryupdate.hbs',{
                            pageTitle:'WIP Entry Update',
                            somast:somast,
                            product:product,
                            WIP_mast:WIP_mast,
                            production_dept:production_dept,
                            compnm:req.session.compnm,
                            divnm:req.session.divmast,
                            sdate: req.session.compsdate,
                            edate:req.session.compedate,
                            usrnm:req.session.user,
                            security: req.session.security,
                            administrator:req.session.administrator
                        });
                    }
                }); 
            });    
        });
    });
});

router.post('/update/:id', function(req, res) {
        let errors = req.validationErrors();
        var sodate = req.body.so_date;
        var DateObject = moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');
        if(req.body.DPCD=="") req.body.DPCD=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.OPDPCD=="") req.body.OPDPCD=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(errors)
        {
            console.log(errors);
        }
        else{ 
            let saleorder = {};
            saleorder.main_bk = "WIPDEPT";
            saleorder.c_j_s_p = req.body.c_j_s_p;
            saleorder.vouc_code = req.body.vouc_code;
            saleorder.so_date = sodate;
            saleorder.so_datemilisecond = sodatemilisecond;
            saleorder.DPCD = req.body.DPCD;
            saleorder.OPDPCD = req.body.OPDPCD;
            saleorder.tot_sooq = req.body.tot_sooq;
            saleorder.buy_rmks = req.body.buy_rmks;
            var salearr = [];
            for(let i=0; i<req.body.sales_or_group.length; i++){
                if(req.body.sales_or_group[i].so_disc == '')req.body.sales_or_group[i].so_disc=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.sales_or_group[i].WIP_name == '')req.body.sales_or_group[i].WIP_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                salearr[i]={
                    plan_no:req.body.sales_or_group[i].plan_no,
                    so_disc:req.body.sales_or_group[i].so_disc,
                    WIP_name:req.body.sales_or_group[i].WIP_name,
                    so_qty:req.body.sales_or_group[i].so_qty,
                    Bs_qty:req.body.sales_or_group[i].Bs_qty,
                    Rej_qty:req.body.sales_or_group[i].Rej_qty,
                    WIP_Rem:req.body.sales_or_group[i].WIP_Rem,
                }
            }
            saleorder.sales_or_group = salearr;
            // saleorder.sales_or_group = req.body.sales_or_group;
            saleorder.co_code = req.session.compid;
            saleorder.div_code = req.session.divid;
            saleorder.usrnm = req.session.user;
            saleorder.masterid = req.session.masterid;
            saleorder.del = "N";
            saleorder.entry = new Date();
            let query = {_id:req.params.id}
            somast.update(query , saleorder ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving WIP_entry', 'errors': err });
                return;
            } else {
                res.redirect('/WIP_DeptEntry/WIP_DeptEntrylist');
            }
        
        });
    }
});


router.post('/WIP_RegisterShow', ensureAuthenticated ,function(req,res){
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
    console.log(start_date,end_date,strtdate,enddats)
    var soArray = []
    somast.find({$and: [{so_datemilisecond:{$gte:strtdate}},{so_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid,main_bk:'WIPDEPT',del:'N'}, function (err,somast){
        console.log(somast)
        for(let i=0; i<somast.length; i++){
            var date = moment(somast[i].so_date).format("DD/MM/YYYY");
            var sogrp = somast[i].sales_or_group;
            for(let j=0; j<sogrp.length; j++){
                var arr = {'EntryNo':somast[i].vouc_code,'EntryDate':date,"BaseDept":somast[i].DPCD.Description,"NextDept":somast[i].OPDPCD.Description,'FgName':sogrp[j].so_disc.Fg_Des,'WIPName':sogrp[j].WIP_name.Fg_Des,'Qty':sogrp[j].so_qty};
                soArray.push(arr)
            }
        }
        res.json({"success":true,"ladger":soArray});
    }).populate('DPCD').populate('OPDPCD').populate([{path: 'sales_or_group.so_disc'}]).populate([{path: 'sales_or_group.WIP_name'}]);
});

router.delete('/:id', function(req, res){    
    if(!req.user._id){
        res.status(500).send();
    }
    // console.log(req.params.id)
    let saleorder = {};
    saleorder.del = 'Y';
    saleorder.delete = new Date();
    let query = {_id:req.params.id}
    somast.update(query,saleorder, function(err,somast){
        if(err){
          console.log(err);
        }
        res.send('Success');
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
