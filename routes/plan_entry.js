const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let somast = require('../models/plan_entrySchema');
let WIPentry = require('../models/salesorder_schema');
const moment = require('moment-timezone');
let product = require('../models/fgSchema');
let division = require('../models/division_schema');
var query;


router.get('/productlist', function (req, res) {
    product.find({masterid:req.session.masterid,del:'N'}, function(err, product){
        res.json({ 'success': true, 'product': product});
    });
});

router.get('/getPlan',async function (req, res) {
    console.log(req.query.dept)
    somast.find({co_code:req.session.compid,div_code:req.session.divid,del:"N"},async function (err,finsomast){
    WIPentry.find({production_dept:req.query.dept,co_code:req.session.compid,div_code:req.session.divid,main_bk:'WIP',del:"N"},async function (err,WIPentry){
        // console.log(finsomast);
        // console.log(WIPentry);
        // var planentry = [];
        // if(WIPentry!= ''){
        //     for(let k=0; k<WIPentry.length; k++){  
        //         var WIPgrp = WIPentry[k].sales_or_group; 
        //         var planarr = [];
        //         var plid = '';
        //         var plno = '';
        //         var pldt = '';
        //         for(let j=0; j<WIPgrp.length; j++){
        //             var planid = WIPgrp[j].plan_id;
        //             for(let x=0; x<finsomast.length; x++){
        //             if(planid == finsomast[x]._id){// var plan = await somast.findById(planid, function(err, plan_entry){}).populate('plan_entry_group.so_disc');
        //                 // console.log('plan',plan);
        //                 plid = finsomast[x]._id;
        //                 plno = finsomast[x].plan_no;
        //                 pldt = finsomast[x].plan_date;
        //                 var planGRP = finsomast[x].plan_entry_group;
        //                 for(let i=0; i<planGRP.length; i++){
        //                     console.log(planGRP[i]._id,WIPgrp[j].plan_grp_id)
        //                     if(planGRP[i]._id == WIPgrp[j].plan_grp_id){
        //                         console.log('wipqty',WIPgrp[j].so_qty,'plnqty',planGRP[i].so_qty,'plnpanqty',planGRP[i].so_panding_qty,'plnexeqty',planGRP[i].so_exe_qty)
        //                         planarr[i]={
        //                             _id:planGRP[i]._id,
        //                             so_disc:planGRP[i].so_disc,
        //                             so_qty:planGRP[i].so_qty,
        //                             so_panding_qty:parseInt(planGRP[i].so_qty)-parseInt(WIPgrp[j].so_qty),
        //                             so_exe_qty:parseInt(planGRP[i].so_exe_qty)+parseInt(WIPgrp[j].so_qty),
        //                         }
        //                         break;
        //                     }
        //                     // else{
        //                     //     planarr[i]={
        //                     //         _id:planGRP[i]._id,
        //                     //         so_disc:planGRP[i].so_disc,
        //                     //         so_qty:planGRP[i].so_qty,
        //                     //         so_panding_qty:planGRP[i].so_qty,
        //                     //         so_exe_qty:planGRP[i].so_exe_qty,
        //                     //     }
        //                     // }
        //                 }
        //             }else{
        //                 plid = finsomast[x]._id;
        //                 plno = finsomast[x].plan_no;
        //                 pldt = finsomast[x].plan_date;
        //                 var planGRP = finsomast[x].plan_entry_group;
        //                 for(let i=0; i<planGRP.length; i++){
        //                     planarr[i]={
        //                         _id:planGRP[i]._id,
        //                         so_disc:planGRP[i].so_disc,
        //                         so_qty:planGRP[i].so_qty,
        //                         so_panding_qty:parseInt(planGRP[i].so_qty)-parseInt(WIPgrp[j].so_qty),
        //                         so_exe_qty:parseInt(planGRP[i].so_exe_qty)+parseInt(WIPgrp[j].so_qty),
        //                     }
        //                 }
        //             }
        //             }
        //             console.log(planarr)
        //             var arr = {'_id':plid,'plan_no':plno,'plan_date':pldt,'plan_entry_group':planarr}
        //             planentry.push(arr);
        //         }
        //     } 
        //     res.json({ 'success': true, 'plan': planentry});
        // }else{
            // console.log('a')
            res.json({ 'success': true,'plan': finsomast})
        // };
    })
    }).populate('plan_entry_group.so_disc');
});

// production_dept_name
router.get('/plan_entry', ensureAuthenticated, function(req, res){
   somast.find({co_code:req.session.compid,div_code:req.session.divid, del:"N"}, function (err,somast){
        product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
            if (err) {
               console.log(err);
            } else {
                var last = 0;
                // console.log(somast);
                if(somast=='' || somast == [])last=1;
                else last = parseInt(somast[0].plan_no)+1;
                res.render('plan_entry.hbs', {
                            pageTitle:'Plan Entry',
                            somast:somast,
                            last: last,
                            product:product,
                            compnm:req.session.compnm,
                            divnm:req.session.divmast,
                            sdate: req.session.compsdate,
                            edate:req.session.compedate,
                            usrnm:req.session.user,
                            security: req.session.security,
                            administrator:req.session.administrator
                });
            }
        })
    }).sort({'plan_no':-1});
});


    router.post('/add', async function(req, res){
        let errors = req.validationErrors();
        var sodate = req.body.plan_date;
        var DateObject =  moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');
        if(errors)
        {
            console.log(errors);
        }
        else
        {
            let saleorder = new somast();
            saleorder.main_bk = "plan";
            saleorder.d_c = '';
            saleorder.plan_no = req.body.plan_no;
            saleorder.plan_date =DateObject;
            saleorder.plan_datemilisecond = sodatemilisecond;
            saleorder.tot_sooq = req.body.tot_sooq;
            var plan_arr = [];
            for(let i=0; i<req.body.plan_entry_group.length; i++){
                plan_arr[i]={
                    so_disc:req.body.plan_entry_group[i].so_disc,
                    so_qty:req.body.plan_entry_group[i].so_qty,
                    so_panding_qty:req.body.plan_entry_group[i].so_qty,
                    so_exe_qty:0,
                }
            }
            saleorder.plan_entry_group = plan_arr;
            saleorder.co_code = req.session.compid;
            saleorder.div_code = req.session.divid;
            saleorder.usrnm = req.session.user;
            saleorder.masterid = req.session.masterid;
            saleorder.del = "N";
            saleorder.entry = new Date();
            saleorder.save(function (err){
                if(err)
                {
                    res.json({'success':false,'message':'error in saving term','errors':err});
                }
                else
                {
                    res.redirect('/plan_entry/plan_entry');
                }
            });
        }
    });

    router.get('/plan_entrylist', ensureAuthenticated ,function(req,res){
       somast.find({co_code:req.session.compid,div_code:req.session.divid,del:'N'}, function (err,somast){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('plan_entrylist.hbs',{
                    pageTitle: 'Plan Entry List',
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
        }).sort({vouc_code:1});
      });



router.get('/plan_entry_update/:id', ensureAuthenticated, function(req, res){
    somast.findById(req.params.id, function (err,somast){
        product.find({masterid:req.session.masterid, del:"N"}, function (err, product){
            if (err) {
                console.log(err);
            } else {
                res.render('plan_entryupdate.hbs',{
                    pageTitle:'Plan Entry Update',
                    somast:somast,
                    product:product,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
       
        })
    })
});

router.post('/update/:id', function(req, res) {
        let errors = req.validationErrors();
        var sodate = req.body.plan_date;
        var DateObject =moment(sodate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var sodatemilisecond = DateObject.format('x');

        if(errors)
        {
            console.log(errors);
        }
        else{ 
            let saleorder = {};
            saleorder.main_bk = "plan";
            saleorder.d_c = '';
            saleorder.plan_no = req.body.plan_no;
            saleorder.plan_date =DateObject;
            saleorder.plan_datemilisecond = sodatemilisecond;
            saleorder.tot_sooq = req.body.tot_sooq;
            var plan_arr = [];
            for(let i=0; i<req.body.plan_entry_group.length; i++){
                plan_arr[i]={
                    so_disc:req.body.plan_entry_group[i].so_disc,
                    so_qty:req.body.plan_entry_group[i].so_qty,
                    so_panding_qty:req.body.plan_entry_group[i].so_qty,
                    so_exe_qty:0,
                }
            }
            saleorder.plan_entry_group = plan_arr;
            saleorder.co_code =  req.session.compid;
            saleorder.div_code =  req.session.divid;
            saleorder.usrnm =  req.session.user;
            saleorder.masterid =   req.session.masterid;
            saleorder.del = "N";
            saleorder.update = new Date();
            let query = {_id:req.params.id}
            somast.update(query , saleorder ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving Outward Challan', 'errors': err });
                return;
            } else {
                res.redirect('/plan_entry/plan_entrylist');
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
