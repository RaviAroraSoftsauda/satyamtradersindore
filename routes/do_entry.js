const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let GaruAavak = require('../models/Garu_Aavak_Schema');
let SalesEntry = require('../models/Garu_Aavak_Schema');
const moment = require('moment-timezone');
let journalmast = require('../models/trans');
let outstanding= require('../models/outstading_schema');
let product = require('../models/fgSchema');
let division = require('../models/divSchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');
let lessmast = require('../models/addless_mast_schema');
let gowdown= require('../models/gowdawnCodeSchema');
let AddLessParameter= require('../models/Add_Less_Parameter_Master_Schema');
let vouchMast= require('../models/vouchSchema');
let db = mongoose.connection;
router.get('/do_entry', ensureAuthenticated, function(req, res){
        res.render('do_entry.hbs', {
            pageTitle:'Do Entry',
            compnm:req.session.compnm,
            divnm:req.session.divmast,
            sdate: req.session.compsdate,
            edate:req.session.compedate,
            usrnm:req.session.user,
            security: req.session.security,
            administrator:req.session.administrator
        });
});
router.post('/getsalesentrylist', ensureAuthenticated, async function(req, res){
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;
        var  party_Code = req.body.party_Code;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');  
        var query = {$and: [{entry_Datemilisecond:{$gte:strtdate}},{entry_Datemilisecond:{$lte:enddats}}],main_bk:"Sale", del:"N", CNCL:"N", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid};
        if(party_Code != ''){
            var party = {party_Code:party_Code};
            query = Object.assign(query,party)
        }
       let GaruAavakdata = await GaruAavak.find(query, function (err,GaruAavak){})
       .populate('party_Code')
       .populate('broker_Code')
       .populate('sl_Person')
        res.json({ 'success': true,'GaruAavak':GaruAavakdata});
})
router.post('/donumberupdate', function(req, res) {
    let domast = {};
    domast.do_No = req.body.value;
    let query = {_id:req.body.id}
    GaruAavak.update(query ,domast ,function (err) {
        if (err) {
            res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
            }else{
                res.json({ 'success': true}); 
            }
    })

})
router.post('/dodateupdate', function(req, res) {
    var do_Date = req.body.value;
    console.log(do_Date);
    var do_DateObject =  moment(do_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var do_Datemilisecond = do_DateObject.format('x');
    let domast = {};
    domast.do_Date = do_DateObject;
    domast.do_Datemilisecond= do_Datemilisecond;
    let query = {_id:req.body.id}
    console.log(query);
    GaruAavak.update(query ,domast ,function (err) {
        if (err) {
            res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
            }else{
                res.json({ 'success': true}); 
            }
    })

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









// GaruAavak.findById(req.params.id, function(err, GaruAavak){
//     journalmast.find({_ID:req.params.id}, function (err, journ){
//         outstanding.find({_ID:req.params.id}, function (err, outst){
//    GaruAavak.remove(query, function(err){
//         if(err){
//           console.log(err);

//         }
//         query = {_ID:req.params.id}
//         journalmast.remove(query, function(err){
//             if(err){
//               console.log(err);

//             }
//             query = {_ID:req.params.id}
//             outstanding.remove(query, function(err){
//             if(err){
//               console.log(err);

//             }
//           })
//           })
//        res.send('Success');
//       })
//   })
// })
// })