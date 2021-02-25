const express = require('express');
const router = express.Router(); 
let Stock_Unit = require('../models/skuSchema');
const mongoose = require('mongoose');
let db = mongoose.connection;
const moment = require('moment-timezone');
let gowdown= require('../models/gowdawnCodeSchema');
let product_raw_master = require('../models/fgSchema');
let MRNSchema = require('../models/Garu_Aavak_Schema')
let Rmcategory= require('../models/CategorySchema');
let Rmattyp= require('../models/subqualitySchema');
let compeny = require('../models/companySchema');
router.get('/rawmatmastname', function (req, res) {
    Stock_Unit.find({masterid:req.session.masterid, del:'N'}, function(err, Stock_Unit){
            res.json({ 'success': true, 'Stock_Unit': Stock_Unit });
    })
});

router.get('/rmproductdetails', function (req, res) {
    var subquality = req.query.subquality;
    var item_group = req.query.item_group;
    var Godown = req.query.Godown;
    var query = {masterid:req.session.masterid,del: "N"};
    var query2 = {masterid:req.session.masterid,del: "N",main_bk:"OP"};
    if(subquality!=''){
        var prdtctg = {subquality:subquality}
        query = Object.assign(query,prdtctg)
        query2 = Object.assign(query2,prdtctg)
    }
    if(Godown!=''){
        var gdn = {gdn_Name:Godown}
        query2 = Object.assign(query2,gdn)
    }
    if(item_group!=''){
        var prdtyp = {item_group:item_group}
       query = Object.assign(query,prdtyp)
       query2 = Object.assign(query2,prdtyp)
    }
    product_raw_master.find(query,'item_title', function(err, prdt){
        Stock_Unit.find({masterid:req.session.masterid, del:'N'}, function(err, Stock_Unit){
            MRNSchema.find(query2,'garu_Aavak_Group', function (err, MRN){
                if(prdt== null || prdt==[] || prdt==undefined || prdt==''){
                    res.json({'success': false});
                }else{
                    res.json({'success': true,'prdtrm': prdt,"Stock_Unit":Stock_Unit,"MRN":MRN });
                }
            })
        })
    })
});

//ajax rm sortdescription in raw material master
router.get('/getshortdesciption', function (req, res) {
    var qry = req.query.term.term;
    product_raw_master.find({'mainshortdescnm':{ $regex: new RegExp("^"+qry,"i")},main_bk: "RM",masterid:req.session.masterid},'mainshortdescnm',  function(err, prdt){
        var data = new Array();
        for (var j = 0; j < prdt.length; j++) {
            data[j] = {"id": prdt[j]._id, "text" : prdt[j].mainshortdescnm};
        }
        res.json({'results':  data, "pagination": { "more": false}});
    });
});

// Add Route
router.get('/stock_opening_module_rm_add', ensureAuthenticated, function(req, res){   
    // product_raw_master.find({main_bk: "RM",masterid:req.session.masterid},'mainshortdescnm', function (err, raw_master){
        gowdown.find({masterid:req.session.masterid, del:"N"}, function (err,gowdown){
            Rmcategory.find({del:"N",masterid:req.session.masterid}, function (err, Rmcategory){  
                Rmattyp.find({del:"N",masterid:req.session.masterid, del:'N'}, function (err, Rmattyp){ 
                    Stock_Unit.find({masterid:req.session.masterid, del:'N'}, function (err, Stock_Unit){    
        if (err) {
                console.log(err);
            } else {
                res.render('stock_opening_module_rm_add.hbs', {
                    pageTitle:'Add Godown Wise Opening Stock',
                    gowdown:gowdown,
                    Rmcategory:Rmcategory,
                    Rmattyp:Rmattyp,
                    Stock_Unit:Stock_Unit,
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
    })
})
    // })
});
router.get('/stock_opening_module_rm', ensureAuthenticated, function(req, res){
    MRNSchema.find({masterid:req.session.masterid, del:'N',main_bk:"OP"}, function (err, MRN){
            if (err) {
                console.log(err);
            } else {
                res.render('stock_opening_module_rm_list.hbs', {
                    pageTitle:'Godown Wise Opening Stock List',
                    MRN: MRN,
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
        .populate('gdn_Name','Description')
        .populate('item_group','Description')
        .populate('subquality','Description')
        .populate('garu_Aavak_Group.item_Code_Desc','item_title')
});

router.post('/stock_opening_module_add',ensureAuthenticated,async (req, res, next) => {
    compeny.findById(req.session.compid,function(err,comp){
        if(req.body.Godown == "") req.body.Godown = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.item_group == "")req.body.item_group = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.subquality == "")req.body.subquality = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        if (errors) {
            console.log(errors)
        } else {
            var entry_Date = comp.sdate;
            var entry_DateObject =  moment(entry_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            var entry_Datemilisecond = entry_DateObject.format('x');
            for (let i = 0; i <req.body.stock_opening_module_group.length; i++)
            {
                var docs = [];
                if(parseInt(req.body.stock_opening_module_group[i]['qntty'])>0){
                    if(req.body.stock_opening_module_group[i]['mrn_id'] =='' || req.body.stock_opening_module_group[i]['mrn_id']==undefined || req.body.stock_opening_module_group[i]['mrn_id']==null){
                        let mrn = new MRNSchema();
                        mrn.gdn_Name = req.body.Godown;
                        mrn.item_group = req.body.item_group;
                        mrn.subquality = req.body.subquality;
                        mrn.entry_Date = entry_DateObject;
                        mrn.entry_Datemilisecond = entry_Datemilisecond;
                        mrn.main_bk = "OP";
                        mrn.d_c = 'C';
                        mrn.vouc_code = 0;
                        mrn.c_j_s_p = "OP";
                        
                        if(req.body.stock_opening_module_group[i]['item_Code_Desc']=="") req.body.stock_opening_module_group[i]['item_Code_Desc']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        if(req.body.stock_opening_module_group[i]['unit']=="") req.body.stock_opening_module_group[i]['unit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        var arr = { 
                            gdn_Cd_Name:req.body.Godown,
                            item_Code_Desc:req.body.stock_opening_module_group[i]['item_Code_Desc'],
                            qntty:req.body.stock_opening_module_group[i]['qntty'],
                            rate:req.body.stock_opening_module_group[i]['rate'],
                            unit:req.body.stock_opening_module_group[i]['unit'],
                            minStkQty:req.body.stock_opening_module_group[i]['minStkQty'],
                            reOrderQty:req.body.stock_opening_module_group[i]['reOrderQty'],
                            maxStkQty:req.body.stock_opening_module_group[i]['maxStkQty'],
                            masterPack:req.body.stock_opening_module_group[i]['masterPack'],
                        };
                        if(arr == null || arr == undefined || arr == '')flag =1;
                        else docs.push(arr);

                        mrn.garu_Aavak_Group = docs;
                        mrn.del = 'N';
                        mrn.flag = 'N';
                        mrn.usrnm =  req.session.user,
                        mrn.masterid =  req.session.masterid;
                        mrn.co_code =  req.session.compid;
                        mrn.div_code =  req.session.divid;
                        mrn.entrydate = new Date();
                        mrn.save(function(err){
                            if(err)console.log(err);
                        })
                    }else{ 
                        let mrn = {};
                        mrn.gdn_Name = req.body.Godown;
                        mrn.item_group = req.body.item_group;
                        mrn.subquality = req.body.subquality;
                        mrn.entry_Date = entry_DateObject;
                        mrn.entry_Datemilisecond = entry_Datemilisecond;
                        mrn.main_bk = "OP";
                        mrn.d_c = 'C';
                        mrn.vouc_code = 0;
                        mrn.c_j_s_p = "OP";
                        docs = [];
                        if(req.body.stock_opening_module_group[i]['item_Code_Desc']=="") req.body.stock_opening_module_group[i]['item_Code_Desc']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        if(req.body.stock_opening_module_group[i]['unit']=="") req.body.stock_opening_module_group[i]['unit']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                        var arr = { 
                            gdn_Cd_Name:req.body.Godown,
                            item_Code_Desc:req.body.stock_opening_module_group[i]['item_Code_Desc'],
                            qntty:req.body.stock_opening_module_group[i]['qntty'],
                            rate:req.body.stock_opening_module_group[i]['rate'],
                            unit:req.body.stock_opening_module_group[i]['unit'],
                            minStkQty:req.body.stock_opening_module_group[i]['minStkQty'],
                            reOrderQty:req.body.stock_opening_module_group[i]['reOrderQty'],
                            maxStkQty:req.body.stock_opening_module_group[i]['maxStkQty'],
                            masterPack:req.body.stock_opening_module_group[i]['masterPack'],
                        };
                        if(arr == null || arr == undefined || arr == '')flag =1;
                        else docs.push(arr);
                        mrn.garu_Aavak_Group = docs;
                        mrn.del = 'N';
                        mrn.flag = 'N';
                        mrn.usrnm =  req.session.user,
                        mrn.masterid =  req.session.masterid;
                        mrn.co_code =  req.session.compid;
                        mrn.div_code =  req.session.divid;
                        mrn.update = new Date();
                        var qry = {_id:req.body.stock_opening_module_group[i]['mrn_id'],main_bk:'OP'}
                        console.log(qry);
                        MRNSchema.update(qry,mrn,function(err){
                            if(err)console.log(err);
                        })
                    }
                }
            }
            // MRNSchema.findOne({wareHouseName:req.body.wareHouseName,masterid:req.session.masterid,del:"N",main_bk:"OP"}, function(erro;rs, wogrop){
            //     let agrfg=true;
            //         if(wogrop==null) {
                        
            //             res.redirect('/stock_opening_module_rm/stock_opening_module_rm_add');
            //         }else{
            //             // res.send('<script>alert("Duplicate Sub Warehouse Name is not allowed");window.location.href="/stock_opening_module_rm/stock_opening_module_rm_add"</script>')
            //         }
            // })
            res.redirect('/stock_opening_module_rm/stock_opening_module_rm_add');
        }
    });
});

router.get('/delete', function(req, res){
        let query = {_id:req.query.mrn_id}
        console.log(query)
        let work = {};
        work.del = 'Y';
        work.delete = new Date();
        MRNSchema.update(query,work, function(err,somast){
            if(err){
            console.log(err);
            }
            else res.json({'success':true});
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