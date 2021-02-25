const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let somast = require('../models/salesorder_schema');
let outwardChalan = require('../models/mrn_Schema');
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
            res.json({ 'success': true, 'product': product,'WIP_mast':WIP_mast});
        });
    });
});
router.get('/getWIPRaw', function (req, res) {
    console.log(req.query.WIPname);
        WIP_mast.findById(req.query.WIPname, function(err, WIP_mast){
            res.json({ 'success': true,'WIP_mast':WIP_mast});
        });
});

// router.get('/lastno/:cjsp', function (req, res) {
//     somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:'WIP',del:"N"}, function (err,somast){
//         production_dept.find({masterid:req.session.masterid,del:"N"}, function (err,production_dept){
//             var last = 0;
//             var cjsp = req.params.cjsp;
//             if(somast=='' || somast == []){
//                 last=1;
//             }else {
//                 for(let i=0; i<somast.length; i++){
//                     if(somast[i].c_j_s_p == cjsp){
//                         last = parseInt(somast[i].vouc_code)+1;
//                     }
//                 }
//             } 
//             if(last==0)last=1;  
//             var fg = production_dept[production_dept.length-1]._id;              
//             res.json({ 'success': true, 'last': last,'fg':fg});
//         }).sort({'Order':1});
//     }).sort({'vouc_code':1});
// });

// production_dept_name
router.get('/Cutting_entry', ensureAuthenticated, function(req, res){
   somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:'CUT',del:"N"}, function (err,somast){
        product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
            production_dept.find({masterid:req.session.masterid,Code:'CUT',del:"N"}, function (err,production_dept){
                WIP_mast.find({masterid:req.session.masterid,del:"N"}, function (err,WIP_mast){
                    rawMat_mast.find({del :"N", masterid: req.session.masterid}, function (err,rawMat_mast){
                        if (err) {
                        console.log(err);
                        } else {
                            var last = 0;
                            if(somast=='' || somast == []){
                                last=1;
                            }else {last = parseInt(somast[0].vouc_code)+1;}
                            res.render('Cutting_entry.hbs', {
                                        pageTitle:'Cutting Entry',
                                        somast:somast,
                                        production_dept:production_dept,
                                        last: last,
                                        product:product,
                                        rawMat_mast:rawMat_mast,
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
        });
    }).sort({'vouc_code':-1});
});


    router.post('/add', async function(req, res){
        let errors = req.validationErrors();
        var sodate = req.body.so_date;
        var DateObject =  moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');
        if(req.body.production_dept=="") req.body.production_dept=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            // var WIPgrp = req.body.sales_or_group;          C
            let saleorder = new somast();
            saleorder.main_bk = "CUT";
            saleorder.d_c = '';
            saleorder.c_j_s_p = req.body.c_j_s_p;
            saleorder.vouc_code = req.body.vouc_code;
            saleorder.so_date =DateObject;
            saleorder.so_datemilisecond = sodatemilisecond;
            saleorder.production_dept = req.body.production_dept
            saleorder.tot_sooq = req.body.tot_sooq;
            saleorder.tot_qty_raw = req.body.tot_qty_raw;
            saleorder.buy_rmks = req.body.buy_rmks;
            var salearr = [];
            for(let i=0; i<req.body.sales_or_group.length; i++){
                if(req.body.sales_or_group[i].so_disc == '')req.body.sales_or_group[i].so_disc=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.sales_or_group[i].WIP_name == '')req.body.sales_or_group[i].WIP_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.sales_or_group[i].plan_id == '')req.body.sales_or_group[i].plan_id=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                // if(req.body.sales_or_group[i].plan_grp_id == '')req.body.sales_or_group[i].plan_grp_id=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                salearr[i]={
                    plan_no:req.body.sales_or_group[i].plan_no,
                    so_disc:req.body.sales_or_group[i].so_disc,
                    WIP_name:req.body.sales_or_group[i].WIP_name,
                    so_qty:req.body.sales_or_group[i].so_qty,
                    plan_id:req.body.sales_or_group[i].plan_id,
                    plan_grp_id:req.body.sales_or_group[i].plan_grp_id,
                }
            }
            saleorder.sales_or_group = salearr;
            var rawarr = [];
            for(let j=0; j<req.body.row_mat_group.length; j++){
                if(req.body.row_mat_group[j].row_mat == '')req.body.row_mat_group[j].row_mat=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.row_mat_group[j].plan_id == '')req.body.row_mat_group[j].plan_id=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                rawarr[j]={
                    plan_no:req.body.row_mat_group[j].plan_no,
                    row_mat:req.body.row_mat_group[j].row_mat,
                    Raw_Qty:req.body.row_mat_group[j].Raw_Qty,
                    plan_id:req.body.row_mat_group[j].plan_id,
                    plan_grp_id:req.body.row_mat_group[j].plan_grp_id,
                }
            }
            saleorder.row_mat_group = rawarr;
            saleorder.co_code = req.session.compid;
            saleorder.div_code = req.session.divid;
            saleorder.usrnm = req.session.user;
            saleorder.masterid = req.session.masterid;
            saleorder.del = "N";
            saleorder.entry = new Date();
            saleorder.save(async function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving term','errors':err});
                }
                else{
                    let outchl = new outwardChalan();
                    outchl.main_bk = "CHL";
                    outchl.cuttingEntry_id=saleorder._id;
                    outchl.d_c = 'D';
                    outchl.c_j_s_p = req.body.c_j_s_p;
                    outchl.vouc_code = req.body.vouc_code;
                    outchl.so_date =DateObject;
                    outchl.so_datemilisecond = sodatemilisecond;
                    var rawarr=[];
                    for(let j=0; j<req.body.row_mat_group.length; j++){
                        if(req.body.row_mat_group[j].row_mat == '')req.body.row_mat_group[j].row_mat=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        rawarr[j]={
                            so_disc:req.body.row_mat_group[j].row_mat,
                            so_qty:req.body.row_mat_group[j].Raw_Qty,
                        }
                    }
                    outchl.sales_or_group = rawarr;
                    outchl.co_code = req.session.compid;
                    outchl.div_code = req.session.divid;
                    outchl.usrnm = req.session.user;
                    outchl.masterid = req.session.masterid;
                    outchl.del = "N";
                    outchl.entry = new Date();
                    outchl.save();
                    res.redirect('/Cutting_entry/Cutting_entry');
                }
            });
        }
    });

router.get('/Cutting_entrylist', ensureAuthenticated ,function(req,res){
   somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:'CUT',del:'N'}, function (err,somast){
        if(err)
        {
            console.log(err);
        }
        else{
            res.render('Cutting_entrylist.hbs',{
                pageTitle: 'Cutting Entry List',
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
    }).sort({vouc_code:1}).populate('production_dept');
});

router.get('/Cutting_entryupdate/:id', ensureAuthenticated, function(req, res){
    somast.findById(req.params.id, function (err,somast){
        product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
            production_dept.find({masterid:req.session.masterid,del:"N",Code:'CUT'}, function (err,production_dept){
                WIP_mast.find({masterid:req.session.masterid,del:"N"}, function (err,WIP_mast){
                    rawMat_mast.find({del :"N", masterid: req.session.masterid}, function (err,rawMat_mast){
                        if (err) {
                            console.log(err);
                        } else {
                            res.render('Cutting_entryupdate.hbs',{
                                pageTitle:'Cutting Entry Update',
                                somast:somast,
                                product:product,
                                WIP_mast:WIP_mast,
                                rawMat_mast:rawMat_mast,
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
});


router.post('/update/:id', function(req, res) {
        let errors = req.validationErrors();
        var sodate = req.body.so_date;
        var DateObject = moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');
        if(req.body.production_dept=="") req.body.production_dept=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(errors)
        {
            console.log(errors);
        }
        else{ 
            let saleorder = {};
            saleorder.main_bk = "CUT";
            saleorder.c_j_s_p = req.body.c_j_s_p;
            saleorder.vouc_code = req.body.vouc_code;
            saleorder.so_date = DateObject;
            saleorder.so_datemilisecond = sodatemilisecond;
            saleorder.production_dept = req.body.production_dept
            saleorder.tot_sooq = req.body.tot_sooq;
            saleorder.buy_rmks = req.body.buy_rmks;
            saleorder.tot_qty_raw = req.body.tot_qty_raw;
            var salearr = [];
            for(let i=0; i<req.body.sales_or_group.length; i++){
                if(req.body.sales_or_group[i].so_disc == '')req.body.sales_or_group[i].so_disc=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.sales_or_group[i].WIP_name == '')req.body.sales_or_group[i].WIP_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.sales_or_group[i].plan_id == '')req.body.sales_or_group[i].plan_id=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                // if(req.body.sales_or_group[i].plan_grp_id == '')req.body.sales_or_group[i].plan_grp_id=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                salearr[i]={
                    plan_no:req.body.sales_or_group[i].plan_no,
                    so_disc:req.body.sales_or_group[i].so_disc,
                    WIP_name:req.body.sales_or_group[i].WIP_name,
                    so_qty:req.body.sales_or_group[i].so_qty,
                    plan_id:req.body.sales_or_group[i].plan_id,
                    plan_grp_id:req.body.sales_or_group[i].plan_grp_id,
                }
            }
            saleorder.sales_or_group = salearr;
            var rawarr = [];
            for(let j=0; j<req.body.row_mat_group.length; j++){
                if(req.body.row_mat_group[j].row_mat == '')req.body.row_mat_group[j].row_mat=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.row_mat_group[j].plan_id == '')req.body.row_mat_group[j].plan_id=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                rawarr[j]={
                    plan_no:req.body.row_mat_group[j].plan_no,
                    row_mat:req.body.row_mat_group[j].row_mat,
                    Raw_Qty:req.body.row_mat_group[j].Raw_Qty,
                    plan_id:req.body.row_mat_group[j].plan_id,
                    plan_grp_id:req.body.row_mat_group[j].plan_grp_id,
                }
            }
            saleorder.row_mat_group = rawarr;
            saleorder.co_code = req.session.compid;
            saleorder.div_code = req.session.divid;
            saleorder.usrnm = req.session.user;
            saleorder.masterid = req.session.masterid;
            saleorder.del = "N";
            saleorder.entry = new Date();
            let query = {_id:req.params.id}
            somast.update(query , saleorder ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Cutting_entry', 'errors': err });
                return;
            } else {
                let outchl = {};
                    outchl.main_bk = "CHL";
                    outchl.cuttingEntry_id=req.params.id;
                    outchl.d_c = 'D';
                    outchl.c_j_s_p = req.body.c_j_s_p;
                    outchl.vouc_code = req.body.vouc_code;
                    outchl.so_date =DateObject;
                    outchl.so_datemilisecond = sodatemilisecond;
                    var rawarr=[];
                    for(let j=0; j<req.body.row_mat_group.length; j++){
                        if(req.body.row_mat_group[j].row_mat == '')req.body.row_mat_group[j].row_mat=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        rawarr[j]={
                            so_disc:req.body.row_mat_group[j].row_mat,
                            so_qty:req.body.row_mat_group[j].Raw_Qty,
                        }
                    }
                    outchl.sales_or_group = rawarr;
                    outchl.co_code = req.session.compid;
                    outchl.div_code = req.session.divid;
                    outchl.usrnm = req.session.user;
                    outchl.masterid = req.session.masterid;
                    outchl.del = "N";
                    outchl.update = new Date();
                    let qry = {cuttingEntry_id:req.params.id};
                    outwardChalan.update(qry,outchl,function (err) {});
                res.redirect('/Cutting_entry/Cutting_entrylist');
            }
        });
    }
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
        let qry = {cuttingEntry_id:req.params.id};
        outwardChalan.update(qry,saleorder, function(err,somast){});
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
