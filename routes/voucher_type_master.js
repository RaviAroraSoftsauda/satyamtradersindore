const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let moduleMast= require('../models/module');
let vouchMast= require('../models/vouchSchema');
let division= require('../models/divSchema');
let GaruAavak = require('../models/Garu_Aavak_Schema');
let trans = require('../models/trans');

// Add Route getDivision
router.get('/getDivision', ensureAuthenticated, function(req, res){
    division.find({masterid:req.session.masterid}, function (err,div){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching Division Master' });
        } else {
            res.json({ 'success': true, 'div': div });
        }
    });
});
router.get('/voucher_type_master', ensureAuthenticated, function(req, res){
    moduleMast.find({},function (err,moduleMast){
        division.find({masterid:req.session.masterid}, function (err,division){
            if (err) {
                console.log(err);
            } else {
                res.render('voucher_type_master.hbs', {
                    pageTitle:'Voucher Type Master',
                    moduleMast:moduleMast,
                    division:division,
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


router.get('/edit_vouc/:id', ensureAuthenticated, function(req, res){
    moduleMast.find({},function (err,moduleMast){
        vouchMast.find({ModuleName:req.params.id,masterid:req.session.masterid}, function(err, vouchMast){
            division.find({masterid:req.session.masterid}, function (err,division){
                if (err) {
                    res.json({ 'success': false, 'message': 'error in fetching raw material' });
                } else {
                    var ModulName;
                    for(let i=0; i<moduleMast.length; i++){
                        if(moduleMast[i]._id == req.params.id){
                            ModulName = moduleMast[i].ModuleName;
                            break;
                        }
                    }
                    console.log(vouchMast);
                    res.render('voucher_type_master.hbs', {
                        pageTitle:'Voucher Type Master',
                        vouchMast:vouchMast,
                        moduleMast:moduleMast,
                        ModuleNameId:req.params.id,
                        ModulName:ModulName,
                        division:division,
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

router.post('/voucher_type_master_update',function(req, res){
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        if(req.body.ModuleName == null || req.body.ModuleName == ''){
            res.redirect("/voucher_type_master/voucher_type_master");
        }else{
            for(let i=0; i<req.body.cntrer.length; i++){
                if(req.body.vouchArray[i].Vo_Division == "" || req.body.vouchArray[i].Vo_Division == []) req.body.vouchArray[i].Vo_Division = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                if(req.body.vouchArray[i].id == null || req.body.vouchArray[i].id == '' || req.body.vouchArray[i].id == undefined){
                    let vouc = new vouchMast();
                    vouc.ModuleName = req.body.ModuleName;
                    vouc.Module = req.body.Module;
                    // vouc.vouchArray = req.body.vouchArray;
                    vouc.Vo_des = req.body.vouchArray[i].Vo_des;
                    vouc.Vo_book = req.body.vouchArray[i].Vo_book;
                    vouc.Vo_notyp = req.body.vouchArray[i].Vo_notyp;
                    vouc.Vo_startNo = req.body.vouchArray[i].Vo_startNo;
                    vouc.Vo_endNo = req.body.vouchArray[i].Vo_endNo;
                    vouc.Vo_ReStartNo = req.body.vouchArray[i].Vo_ReStartNo;
                    vouc.Vo_Ldate = req.body.vouchArray[i].Vo_Ldate;
                    vouc.Vo_Active = req.body.vouchArray[i].Vo_Active;
                    vouc.Vo_Division = req.body.vouchArray[i].Vo_Division;
                    vouc.Vo_ItemList = req.body.vouchArray[i].Vo_ItemList;
                    vouc.Vo_CsCr = req.body.vouchArray[i].Vo_CsCr;

                    vouc.user =  req.session.user;
                    vouc.masterid =   req.session.masterid;
                    vouc.entrydate = new Date();
                    vouc.save(function (err) {
                        if(err){
                            // res.json({ 'success': false, 'message': 'Error in Updating Voucher Type Master', errors: err });
                        } else {
                            // res.redirect("/voucher_type_master/voucher_type_master");
                        }
                    });
                }else{
                    let vouc = {};
                    vouc.ModuleName = req.body.ModuleName;
                    vouc.Module = req.body.Module;
                    // vouc.vouchArray = req.body.vouchArray;

                    vouc.Vo_des = req.body.vouchArray[i].Vo_des;
                    vouc.Vo_book = req.body.vouchArray[i].Vo_book;
                    vouc.Vo_notyp = req.body.vouchArray[i].Vo_notyp;
                    vouc.Vo_startNo = req.body.vouchArray[i].Vo_startNo;
                    vouc.Vo_endNo = req.body.vouchArray[i].Vo_endNo;
                    vouc.Vo_ReStartNo = req.body.vouchArray[i].Vo_ReStartNo;
                    vouc.Vo_Ldate = req.body.vouchArray[i].Vo_Ldate;
                    vouc.Vo_Active = req.body.vouchArray[i].Vo_Active;
                    vouc.Vo_Division = req.body.vouchArray[i].Vo_Division;
                    vouc.Vo_ItemList = req.body.vouchArray[i].Vo_ItemList;
                    vouc.Vo_CsCr = req.body.vouchArray[i].Vo_CsCr;

                    vouc.user =  req.session.user;
                    vouc.masterid =   req.session.masterid;
                    vouc.update = new Date();
                    let query = { _id:req.body.vouchArray[i].id};
                    vouchMast.update(query , vouc,function (err) {
                        if(err){
                            // res.json({ 'success': false, 'message': 'Error in Updating Voucher Type Master', errors: err });
                        } else {
                            // res.redirect("/voucher_type_master/voucher_type_master");
                        }
                    });
                }
            }
            res.redirect("/voucher_type_master/voucher_type_master");
        }
    }
});

// Missing No Utility
router.get('/Missing_No_Utility', ensureAuthenticated, function(req, res){
    moduleMast.find({},function (err,moduleMast){
        if (err) {
            console.log(err);
        } else {
            res.render('Missing_No_Utility.hbs', {
                pageTitle:'Missing No Utility',
                moduleMast:moduleMast,
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


router.get('/getBookInMissingNo', ensureAuthenticated, function(req, res){
    division.findById(req.session.divid, function (err,division){
        console.log(req.query.module)
        vouchMast.find({Module:req.query.module,Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
            if(err){
                res.json({'success':false,'err':err});
            }else{
                res.json({'success':true,'vouchMast':vouchMast});
            }
        });
    });
})

router.get('/getMissingNo', ensureAuthenticated,async function(req, res){
    var start_date= req.query.start_date;
    var end_date= req.query.end_date;
    var Book= req.query.Book;
    var Module= req.query.Module;
    var From= req.query.From;
    var To= req.query.To;
    var start_date_DateObject =  moment(start_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var start_date_Datemilisecond = start_date_DateObject.format('x');
    var end_date_DateObject =  moment(end_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var end_date_Datemilisecond = end_date_DateObject.format('x');
    var data;
    if(Module == 'Garu Aavak Entry' || Module == 'Sale Entry' || Module == 'Vachhati Aavak Entry' || Module == 'Sales Return Entry' || Module == 'Purchase Return Entry'){
        var qry = {$and:[{entry_Datemilisecond:{$gte:start_date_Datemilisecond}},{entry_Datemilisecond:{$lte:end_date_Datemilisecond}}],
        c_j_s_p:Book,co_code:req.session.compid,div_code:req.session.divid};
        if(From != ''){
            qry = {$and:[{entry_Datemilisecond:{$gte:start_date_Datemilisecond}},{entry_Datemilisecond:{$lte:end_date_Datemilisecond}},{vouc_code:{$gte:From}}],
            c_j_s_p:Book,co_code:req.session.compid,div_code:req.session.divid};
        }
        if(To != ''){
            qry = {$and:[{entry_Datemilisecond:{$gte:start_date_Datemilisecond}},{entry_Datemilisecond:{$lte:end_date_Datemilisecond}},{vouc_code:{$lte:To}}],
            c_j_s_p:Book,co_code:req.session.compid,div_code:req.session.divid};
        }
        if(To != '' && From != ''){
            qry = {$and:[{entry_Datemilisecond:{$gte:start_date_Datemilisecond}},{entry_Datemilisecond:{$lte:end_date_Datemilisecond}},{vouc_code:{$gte:From}},{vouc_code:{$lte:To}}],
            c_j_s_p:Book,co_code:req.session.compid,div_code:req.session.divid};
        }
        console.log('Garu',qry);
        data = await GaruAavak.find(qry,function(err,aaa){}).sort('vouc_code');
    }else{
        var qry = {$and:[{cash_edatemilisecond:{$gte:start_date_Datemilisecond}},{cash_edatemilisecond:{$lte:end_date_Datemilisecond}}],
        c_j_s_p:Book,co_code:req.session.compid,div_code:req.session.divid};
        if(From != ''){
            qry = {$and:[{cash_edatemilisecond:{$gte:start_date_Datemilisecond}},{cash_edatemilisecond:{$lte:end_date_Datemilisecond}},{vouc_code:{$gte:From}}],
            c_j_s_p:Book,co_code:req.session.compid,div_code:req.session.divid};
        }
        if(To != ''){
            qry = {$and:[{cash_edatemilisecond:{$gte:start_date_Datemilisecond}},{cash_edatemilisecond:{$lte:end_date_Datemilisecond}},{vouc_code:{$lte:To}}],
            c_j_s_p:Book,co_code:req.session.compid,div_code:req.session.divid};
        }
        if(To != '' && From != ''){
            qry = {$and:[{cash_edatemilisecond:{$gte:start_date_Datemilisecond}},{cash_edatemilisecond:{$lte:end_date_Datemilisecond}},{vouc_code:{$gte:From}},{vouc_code:{$lte:To}}],
            c_j_s_p:Book,co_code:req.session.compid,div_code:req.session.divid};
        }
        data = await trans.find(qry,function(err,aaa){}).sort('vouc_code');
    }
    if(data == null || data == '' || data == []){
        res.json({'success':false});
    }else{
        var number = data[0].vouc_code;
        var Missing_Number_Arr = [];
        for(let i=0; i<data.length; i++){
            if(number == data[i].vouc_code){
                number = parseInt(number) + 1;
            }else{
                Missing_Number_Arr.push(number);
                number = parseInt(number) + 1;
                i--;
            }
        }
        res.json({'success':true,'Missing_Number_Arr':Missing_Number_Arr});
    }
})
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/userright/login');
    }
}

module.exports = router;