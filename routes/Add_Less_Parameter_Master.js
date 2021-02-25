const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let moduleMast= require('../models/module');
let vouchMast= require('../models/Add_Less_Parameter_Master_Schema');
let division= require('../models/divSchema');

// Add Route
router.get('/Add_Less_Parameter_Master', ensureAuthenticated, function(req, res){
    moduleMast.find({},function (err,moduleMast){
        division.find({masterid:req.session.masterid}, function (err,division){
            if (err) {
                console.log(err);
            } else {
                res.render('Add_Less_Parameter_Master.hbs', {
                    pageTitle:'Add Less Parameter Master',
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


router.get('/edit_Add_Less_Parameter_Master/:id', ensureAuthenticated, function(req, res){
    moduleMast.find({},function (err,moduleMast){
        vouchMast.findOne({ModuleName:req.params.id,masterid:req.session.masterid}, function(err, vouchMast){
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
                        // console.log('vouchMast',vouchMast)
                        res.render('Add_Less_Parameter_Master.hbs', {
                            pageTitle:'Add Less Parameter Master',
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
        }).populate('Add_Less_Parameter_Master_Array.Posting_Ac');
    });
});

router.post('/Add_Less_Parameter_Master_update',function(req, res){
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        console.log('req.query.id',req.query.id)
        if(req.query.id == null || req.query.id == ''){
            console.log('If null',req.query.id)
            let vouc = new vouchMast();
            vouc.ModuleName = req.body.ModuleName;
            vouc.Module = req.body.Module;
            vouc.Add_Less_Parameter_Master_Array = req.body.vouchArray;
            for(let i = 0; i<vouc.Add_Less_Parameter_Master_Array.length; i++){
                vouc.Add_Less_Parameter_Master_Array[i].Index = i;
            }
            vouc.user =  req.session.user;
            vouc.masterid =   req.session.masterid;
            vouc.entrydate = new Date();
            vouc.save(function (err) {
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating Add Less Parameter Master', errors: err });
                } else {
                    res.redirect("/Add_Less_Parameter_Master/Add_Less_Parameter_Master");
                }
            });
        }else{
            console.log('Not null',req.query.id)
            let vouc = {};
            vouc.ModuleName = req.body.ModuleName;
            vouc.Module = req.body.Module;
            vouc.Add_Less_Parameter_Master_Array = req.body.vouchArray;
            for(let i = 0; i<vouc.Add_Less_Parameter_Master_Array.length; i++){
                vouc.Add_Less_Parameter_Master_Array[i].Index = i;
                console.log(req.body.vouchArray[i].id)
                vouc.Add_Less_Parameter_Master_Array[i]._id = req.body.vouchArray[i].id;
            }
            vouc.user =  req.session.user;
            vouc.masterid =   req.session.masterid;
            vouc.update = new Date();
            let query = { _id:req.query.id}
            vouchMast.update(query , vouc,function (err) {
                if(err){
                    res.json({ 'success': false, 'message': 'Error in Updating Add Less Parameter Master', errors: err });
                } else {
                    res.redirect("/Add_Less_Parameter_Master/Add_Less_Parameter_Master");
                }
            });
        }
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