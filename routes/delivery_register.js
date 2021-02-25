const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let delveryentry1 = require('../models/contract_sauda_schema');
let delveryentry2 = require('../models/contract_sauda2');
let brand = require('../models/brand_schema');
let product_mast = require('../models/product_mast_schema');
let term = require('../models/term_schema');
let party = require('../models/party_schema');
let narration = require('../models/narration_schema');
let city = require('../models/city_schema');
// let common = require('./common');

// router.get('/updatebal', ensureAuthenticated, function(req, res){
//     common.UpdatePenBal(req);

// });
// Add Route
router.get('/delivery_register', ensureAuthenticated ,function(req,res){
        party.find({masterid:req.session.masterid}, function (err, party){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render('delivery_register.hbs',{
                pageTitle:'delvery register',
                party: party,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
        }
    }).sort({'party_name':1});
});
function CreateHTML(delveryentry1,sl_brok,req){
    return new Promise(function(fullfill){
        var html='<div class="showsearchdata">';
        html+='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="table-responsive">'; 
        if(sl_brok=="sd_date")
        {
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>Control</th>';
            html+='<th>Date</th>';
            html+='<th>Contract Nubmer</th>';
            html+='<th>Buyer</th>';
            html+='<th>Seller</th>';
            html+='<th>Seller Broker</th>';
            html+='<th>Buyer Broker</th>';
            html+='<th>Bill No</th>';
            html+='<th>Bill Date</th>';
            html+='<th>Bill Amt</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            var childarray = [];
                for (let i = 0; i < delveryentry1.length; i++) {
                    const sd_date = moment(delveryentry1[i]['sd_date']).format('DD/MM/YYYY');
                    var delveryentry1det = delveryentry1[i]['sauda2']['contract_sauda_group'];
                    for (let j = 0; j < delveryentry1det.length; j++) {
                        if (delveryentry1det[j]['p_code'] != null) var p_code= delveryentry1det[j]['p_code']['product_name'];
                        else var p_code = '';
                        if (delveryentry1det[j]['bag'] != undefined) var bag= delveryentry1det[j]['bag'];
                        else var bag = '';
                        if (delveryentry1det[j]['pck'] != undefined) var pck= delveryentry1det[j]['pck'];
                        else var pck = '';
                        if (delveryentry1det[j]['wght'] != undefined) var wght= delveryentry1det[j]['wght'];
                        else var wght = '';
                        if (delveryentry1det[j]['sd_rate'] != undefined) var sd_rate= delveryentry1det[j]['sd_rate'];
                        else var sd_rate = '';
                        if (delveryentry1det[j]['amount'] != undefined) var amount= delveryentry1det[j]['amount'];
                        else var amount = '';
                        if (delveryentry1det[j]['amount'] != undefined) var amount= delveryentry1det[j]['amount'];
                        else var amount = '';
                        var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount};
                        childarray.push(obj);   
                }
                    html += '<tr>';
                    html += '<td class="delivery-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
                    html += '<td>' + sd_date + '</td>';
                    html += '<td>' + delveryentry1[i]['vouc_code'] + '</td>';
                    if (delveryentry1[i]['br_code'] != null) html +='<td>'+delveryentry1[i]['br_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['sl_code'] != null) html +='<td>'+delveryentry1[i]['sl_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['sb_code'] != null) html +='<td>'+delveryentry1[i]['sb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['bb_code'] != null) html +='<td>'+delveryentry1[i]['bb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    html += '<td>' + delveryentry1[i]['bno'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bdt'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bill_amt'] + '</td>';
                    html += '</tr>';
                    childarray = [];
            
                }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th class="excludesearch"></th>';
                html+='<th>Date</th>';
                html+='<th>Contract Nubmer</th>';
                html+='<th>Buyer</th>';
                html+='<th>Seller</th>';
                html+='<th>Seller Broker</th>';
                html+='<th>Buyer Broker</th>'; 
                html+='<th>Bill No</th>';
                html+='<th>Bill Date</th>';
                html+='<th>Bill Amt</th>';
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
        }
        if(sl_brok=="sl_brok")
        {
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>Control</th>';
            html+='<th>Date</th>';
            html+='<th>Contract Nubmer</th>';
            html+='<th>Buyer</th>';
            html+='<th>Seller Broker</th>';
            html+='<th>Seller</th>';
            html+='<th>Buyer Broker</th>';
            html+='<th>Bill No</th>';
            html+='<th>Bill Date</th>';
            html+='<th>Bill Amt</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            var childarray = [];
            for (let i = 0; i < delveryentry1.length; i++) {
                const sd_date = moment(delveryentry1[i]['sd_date']).format('DD/MM/YYYY');
                var delveryentry1det = delveryentry1[i]['sauda2']['contract_sauda_group'];
                for (let j = 0; j < delveryentry1det.length; j++) {
                        if (delveryentry1det[j]['p_code'] != null) var p_code= delveryentry1det[j]['p_code']['product_name'];
                        else var p_code = '';
                        if (delveryentry1det[j]['bag'] != undefined) var bag= delveryentry1det[j]['bag'];
                        else var bag = '';
                        if (delveryentry1det[j]['pck'] != undefined) var pck= delveryentry1det[j]['pck'];
                        else var pck = '';
                        if (delveryentry1det[j]['wght'] != undefined) var wght= delveryentry1det[j]['wght'];
                        else var wght = '';
                        if (delveryentry1det[j]['sd_rate'] != undefined) var sd_rate= delveryentry1det[j]['sd_rate'];
                        else var sd_rate = '';
                        if (delveryentry1det[j]['amount'] != undefined) var amount= delveryentry1det[j]['amount'];
                        else var amount = '';
                        var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount};
                        childarray.push(obj);   
                }
                    html += '<tr>';
                    html += '<td class="delivery-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
                    html += '<td>' + sd_date + '</td>';
                    html += '<td>' + delveryentry1[i]['vouc_code'] + '</td>';
                    if (delveryentry1[i]['br_code'] != null) html +='<td>'+delveryentry1[i]['br_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['sb_code'] != null) html +='<td>'+delveryentry1[i]['sb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['sl_code'] != null) html +='<td>'+delveryentry1[i]['sl_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['bb_code'] != null) html +='<td>'+delveryentry1[i]['bb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    html += '<td>' + delveryentry1[i]['bno'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bdt'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bill_amt'] + '</td>';
                    html += '</tr>';
                    childarray = [];
            
                }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th class="excludesearch"></th>';
                html+='<th>Date</th>';
                html+='<th>Contract Nubmer</th>';
                html+='<th>Buyer</th>';
                html+='<th>Seller Broker</th>';
                html+='<th>Seller</th>';
                html+='<th>Buyer Broker</th>';
                html+='<th>Bill No</th>';
                html+='<th>Bill Date</th>';
                html+='<th>Bill Amt</th>';
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
        }
        if(sl_brok=="sb_brok")
        {
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>Control</th>';
            html+='<th>Date</th>';
            html+='<th>Contract Nubmer</th>';
            html+='<th>Buyer</th>';
            html+='<th>Seller Broker</th>';
            html+='<th>Seller</th>';
            html+='<th>Buyer Broker</th>';
            html+='<th>Bill No</th>';
            html+='<th>Bill Date</th>';
            html+='<th>Bill Amt</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            var childarray = [];
            for (let i = 0; i < delveryentry1.length; i++) {
                const sd_date = moment(delveryentry1[i]['sd_date']).format('DD/MM/YYYY');
                var delveryentry1det = delveryentry1[i]['sauda2']['contract_sauda_group'];
                for (let j = 0; j < delveryentry1det.length; j++) {
                        if (delveryentry1det[j]['p_code'] != null) var p_code= delveryentry1det[j]['p_code']['product_name'];
                        else var p_code = '';
                        if (delveryentry1det[j]['bag'] != undefined) var bag= delveryentry1det[j]['bag'];
                        else var bag = '';
                        if (delveryentry1det[j]['pck'] != undefined) var pck= delveryentry1det[j]['pck'];
                        else var pck = '';
                        if (delveryentry1det[j]['wght'] != undefined) var wght= delveryentry1det[j]['wght'];
                        else var wght = '';
                        if (delveryentry1det[j]['sd_rate'] != undefined) var sd_rate= delveryentry1det[j]['sd_rate'];
                        else var sd_rate = '';
                        if (delveryentry1det[j]['amount'] != undefined) var amount= delveryentry1det[j]['amount'];
                        else var amount = '';
                        var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount};
                        childarray.push(obj);   
                }
                    html += '<tr>';
                    html += '<td class="delivery-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
                    html += '<td>' + sd_date + '</td>';
                    html += '<td>' + delveryentry1[i]['vouc_code'] + '</td>';
                    if (delveryentry1[i]['br_code'] != null) html +='<td>'+delveryentry1[i]['br_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['sb_code'] != null) html +='<td>'+delveryentry1[i]['sb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['sl_code'] != null) html +='<td>'+delveryentry1[i]['sl_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['bb_code'] != null) html +='<td>'+delveryentry1[i]['bb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    html += '<td>' + delveryentry1[i]['bno'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bdt'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bill_amt'] + '</td>';
                    html += '</tr>';
                    childarray = [];
            
                }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th class="excludesearch"></th>';
                html+='<th>Date</th>';
                html+='<th>Contract Nubmer</th>';
                html+='<th>Buyer</th>';
                html+='<th>Seller Broker</th>';
                html+='<th>Seller</th>';
                html+='<th>Buyer Broker</th>';
                html+='<th>Bill No</th>';
                html+='<th>Bill Date</th>';
                html+='<th>Bill Amt</th>';
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
        }
        if(sl_brok=="br_brok")
        {
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>Control</th>';
            html+='<th>Date</th>';
            html+='<th>Contract Nubmer</th>';
            html+='<th>Seller</th>';
            html+='<th>Seller Broker</th>';
            html+='<th>Buyer</th>';
            html+='<th>Buyer Broker</th>';
            html+='<th>Bill No</th>';
            html+='<th>Bill Date</th>';
            html+='<th>Bill Amt</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            var childarray = [];
            for (let i = 0; i < delveryentry1.length; i++) {
                const sd_date = moment(delveryentry1[i]['sd_date']).format('DD/MM/YYYY');
                var delveryentry1det = delveryentry1[i]['sauda2']['contract_sauda_group'];
                for (let j = 0; j < delveryentry1det.length; j++) {
                        if (delveryentry1det[j]['p_code'] != null) var p_code= delveryentry1det[j]['p_code']['product_name'];
                        else var p_code = '';
                        if (delveryentry1det[j]['bag'] != undefined) var bag= delveryentry1det[j]['bag'];
                        else var bag = '';
                        if (delveryentry1det[j]['pck'] != undefined) var pck= delveryentry1det[j]['pck'];
                        else var pck = '';
                        if (delveryentry1det[j]['wght'] != undefined) var wght= delveryentry1det[j]['wght'];
                        else var wght = '';
                        if (delveryentry1det[j]['sd_rate'] != undefined) var sd_rate= delveryentry1det[j]['sd_rate'];
                        else var sd_rate = '';
                        if (delveryentry1det[j]['amount'] != undefined) var amount= delveryentry1det[j]['amount'];
                        else var amount = '';
                        var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount};
                        childarray.push(obj);   
                }
                    html += '<tr>';
                    html += '<td class="delivery-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
                    html += '<td>' + sd_date + '</td>';
                    html += '<td>' + delveryentry1[i]['vouc_code'] + '</td>';
                    if (delveryentry1[i]['sl_code'] != null) html +='<td>'+delveryentry1[i]['sl_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['sb_code'] != null) html +='<td>'+delveryentry1[i]['sb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['br_code'] != null) html +='<td>'+delveryentry1[i]['br_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['bb_code'] != null) html +='<td>'+delveryentry1[i]['bb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    html += '<td>' + delveryentry1[i]['bno'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bdt'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bill_amt'] + '</td>';
                    html += '</tr>';
                    childarray = [];
            
                }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th class="excludesearch"></th>';
                html+='<th>Date</th>';
                html+='<th>Contract Nubmer</th>';
                html+='<th>Seller</th>';
                html+='<th>Seller Broker</th>';
                html+='<th>Buyer</th>';
                html+='<th>Buyer Broker</th>';
                html+='<th>Bill No</th>';
                html+='<th>Bill Date</th>';
                html+='<th>Bill Amt</th>';
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
        }
        if(sl_brok=="bb_brok")
        {
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>Control</th>';
            html+='<th>Date</th>';
            html+='<th>Contract Nubmer</th>';
            html+='<th>Seller</th>';
            html+='<th>Seller Broker</th>';
            html+='<th>Buyer</th>';
            html+='<th>Buyer Broker</th>';
            html+='<th>Bill No</th>';
            html+='<th>Bill Date</th>';
            html+='<th>Bill Amt</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            var childarray = [];
            for (let i = 0; i < delveryentry1.length; i++) {
                const sd_date = moment(delveryentry1[i]['sd_date']).format('DD/MM/YYYY');
                var delveryentry1det = delveryentry1[i]['sauda2']['contract_sauda_group'];
                for (let j = 0; j < delveryentry1det.length; j++) {
                        if (delveryentry1det[j]['p_code'] != null) var p_code= delveryentry1det[j]['p_code']['product_name'];
                        else var p_code = '';
                        if (delveryentry1det[j]['bag'] != undefined) var bag= delveryentry1det[j]['bag'];
                        else var bag = '';
                        if (delveryentry1det[j]['pck'] != undefined) var pck= delveryentry1det[j]['pck'];
                        else var pck = '';
                        if (delveryentry1det[j]['wght'] != undefined) var wght= delveryentry1det[j]['wght'];
                        else var wght = '';
                        if (delveryentry1det[j]['sd_rate'] != undefined) var sd_rate= delveryentry1det[j]['sd_rate'];
                        else var sd_rate = '';
                        if (delveryentry1det[j]['amount'] != undefined) var amount= delveryentry1det[j]['amount'];
                        else var amount = '';
                        var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount};
                        childarray.push(obj);   
                }
                    html += '<tr>';
                    html += '<td class="delivery-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
                    html += '<td>' + sd_date + '</td>';
                    html += '<td>' + delveryentry1[i]['vouc_code'] + '</td>';
                    if (delveryentry1[i]['sl_code'] != null) html +='<td>'+delveryentry1[i]['sl_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['sb_code'] != null) html +='<td>'+delveryentry1[i]['sb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['br_code'] != null) html +='<td>'+delveryentry1[i]['br_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (delveryentry1[i]['bb_code'] != null) html +='<td>'+delveryentry1[i]['bb_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    html += '<td>' + delveryentry1[i]['bno'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bdt'] + '</td>';
                    html += '<td>' + delveryentry1[i]['bill_amt'] + '</td>';
                    html += '</tr>';
                    childarray = [];
            
                }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th class="excludesearch"></th>';
                html+='<th>Date</th>';
                html+='<th>Contract Nubmer</th>';
                html+='<th>Seller</th>';
                html+='<th>Seller Broker</th>';
                html+='<th>Buyer</th>';
                html+='<th>Buyer Broker</th>';
                html+='<th>Bill No</th>';
                html+='<th>Bill Date</th>';
                html+='<th>Bill Amt</th>';
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
        }
            html+='</div>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
        fullfill(html);
    })
}
router.post('/deleverydetail', ensureAuthenticated, function(req, res){
    var sl_code = req.body.sl_code;
    var sb_code = req.body.sb_code;
    var br_code = req.body.br_code;
    var bb_code = req.body.bb_code;
    var start_date= req.body.start_date;
    var end_date= req.body.end_date;
    var  sl_brok= req.body.sl_brok;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
    var qry = "";
    if ((sl_code=="") &&  (sb_code=="") && (br_code=="") && (bb_code=="")) qry = {$and: [{main_bk:"DLV",sd_date:{$gte:strtdate}},{sd_date:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (br_code!="") qry = {$and: [{main_bk:"DLV",br_code:br_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (sl_code!="") qry = {$and: [{main_bk:"DLV",sl_code:sl_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (sb_code!="") qry = {$and: [{main_bk:"DLV",sb_code:sb_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (bb_code!="") qry = {$and: [{main_bk:"DLV",bb_code:bb_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    delveryentry1.find(qry,async function (err, delveryentry1) {
             if (err) {
                    console.log(err);
                } else {
                    var html = await CreateHTML(delveryentry1,sl_brok,req);
                    res.json({ 'success': true, 'hhtml':html});
                }
            }).populate([{path: 'sauda2',
            populate:{ path: 'contract_sauda_group.p_code'}
            }]).populate('sl_code').populate('sb_code').populate('br_code').populate('bb_code')    

})
// router.post('/deleverydetail', function(req, res) {
//     var sl_code = req.body.sl_code;
//     var sb_code = req.body.sb_code;
//     var br_code = req.body.br_code;
//     var bb_code = req.body.bb_code;
//     if (sl_code=="Select") sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
//     if (sb_code=="Select") sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');   
//     if (br_code=="Select") br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
//     if (bb_code=="Select") bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
//     // { $or: [{sl_code:sl_code},{sb_code:sb_code},{br_code:br_code},{bb_code:bb_code}]}]
//     delveryentry1.find({main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid}, function (err, delveryentry1) {
//         if (err) {
//             console.log(err);
//         } else {
//             // common.UpdatePenBal(req);
//             res.json({ 'success': true, 'delveryentry1': delveryentry1 ,'product_mast': product_mast});
//         }
//     }).populate('sl_code').populate('sb_code').populate('br_code').populate('bb_code')
//        .populate([{path: 'sauda2', model: 'sauda2',
//         populate:{ path: 'contract_sauda_group.p_code',select:"product_name"}
//         }])
// });

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