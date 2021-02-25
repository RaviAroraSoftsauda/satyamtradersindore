const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let trans = require('../models/trans_schema');
let division = require('../models/division_schema');
let sauda2 = require('../models/contract_sauda2');
// let delveryentry2 = require('../models/contract_sauda2');
let db = mongoose.connection;
let common = require('./common');
// Add Route
router.get('/bill_register_print/:id', ensureAuthenticated, function(req, res){
    trans.findById(req.params.id, function (err, trans){
        division.findById(req.session.divid, function (err, division){
            sauda2.find({transid:req.params.id,co_code:req.session.compid,div_code:req.session.divid}, function (err, delveryentry2){
                //console.log("delveryentry2"+delveryentry2);
            if (err) {
                console.log(err);
            } else {
                res.render('bill_register_print.hbs', {
                    pageTitle:'Bill Print',
                    trans: trans,
                    division: division,
                    delveryentry2: delveryentry2,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).populate('pcode','party_name').populate('sauda1')
        .populate([{path: 'contract_sauda_group.p_code',select: 'product_name',}])
    })
    }).populate([{path: 'pcd',
    populate:{ path: 'city_name'}
    }])
    });
router.get('/bill_ragister', ensureAuthenticated, function(req, res){
                res.render('bill_ragister.hbs', {
                    pageTitle:'Bill Register',
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
});
router.get('/bill_view', ensureAuthenticated, function(req, res){
    res.render('bill_view.hbs', {
        pageTitle:'Bill View',
        compnm:req.session.compnm,
        divnm:req.session.divmast,
        sdate: req.session.compsdate,
        edate:req.session.compedate,
        usrnm:req.session.user,
        security: req.session.security,
        administrator:req.session.administrator
    });
});
function CreateHTML(trans,req){
    return new Promise(function(fullfill){
        var html='<div class="showsearchdata">';
        html+='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="table-responsive">'; 
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th class="excludesearch noExport">Action</th>';
            html+='<th>Bill No</th>';
            html+='<th>Bill Date</th>';
            html+='<th>Party Name</th>';
            html+='<th>Station</th>';
            html+='<th>Bill Amount</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            for (let i = 0; i < trans.length; i++) {
                const d_a_t_e = moment(trans[i]['d_a_t_e']).format('DD/MM/YYYY');
                html+='<tr>';
                html+='<td class="excludesearch">';
                html+='<div class="btn-group dropdown">';
                html+='<button class="btn btn-xs blue dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false"> Actions';
                html+='<i class="fa fa-angle-down"></i>';
                html+='</button>';
                html+='<ul class="dropdown-menu pull-right" role="menu">';
                html+='<li>';
                html+='<a href="/bill_ragister/bill_register_print/'+trans[i]['_id']+'">';
                html+='<i class="icon-print"></i> Print';
                html+='</a>';
                html+='</li>';
                html+='</ul>';
                html+='</div>';
                html+='</td>';
                html+='<td>'+trans[i]['vouc_code']+'</td>';
                html+='<td>'+d_a_t_e+'</td>';
                if (trans[i]['pcd'] != null) html +='<td>'+trans[i]['pcd']['party_name'] + '</td>';
                else html += '<td>' +  '</td>';
                if (trans[i]['pcd']['city_name'] != null) html +='<td>'+trans[i]['pcd']['city_name']['city_name'] + '</td>';
                else html += '<td>' +  '</td>';
                html+='<td>'+trans[i]['amount']+'</td>';
                html+='</tr>';
            }

                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th class="excludesearch noExport">Action</th>';
                html+='<th>Bill No</th>';
                html+='<th>Bill Date</th>';
                html+='<th>Party Name</th>';
                html+='<th>Station</th>';
                html+='<th>Bill Amount</th>';
               
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
        fullfill(html);
    })
}
router.post('/billregdetail', ensureAuthenticated, function(req, res){
        var start_date= req.body.start_date;
        var end_date= req.body.end_date;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
        trans.find({$and: [{main_bk:"BL",billdatemilisecond:{$gte:strtdate}},{billdatemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid},async function (err, trans) {   
                 if (err) {
                        console.log(err);
                    } else {
                        var html = await CreateHTML(trans,req);
                        res.json({ 'success': true, 'hhtml':html});
                    }
                }).populate([{path: 'pcd',
                populate:{ path: 'city_name'}
                }])  

})
//sauda2
function CreateHTMLsauda2(sauda2,req){
  
    return new Promise(function(fullfill){
        var html='<div class="showsearchdata">';
        html+='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="table-responsive">'; 
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>SaudaN</th>';
            html+='<th>Date</th>';
            html+='<th>Buyer Name</th>';
            html+='<th>Station</th>';
            html+='<th>Item Name</th>';
            html+='<th>Qty</th>';
            html+='<th>Wght</th>';
            html+='<th>Rate</th>';
            html+='<th>Brok RT.</th>';
            html+='<th>Brok Type</th>';
            html+='<th>Brokerage</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            for (let i = 0; i < sauda2.length; i++)
             {
                const bltodate = moment(sauda2[i]['bltodate']).format('DD/MM/YYYY');
                 var contractsaudagroup = sauda2[i]['contract_sauda_group']
                 for (let j = 0; j < contractsaudagroup.length; j++)
                {
                    html+='<tr>';
                    html+='<td>'+sauda2[i]['blvouc_code']+'</td>';
                    html+='<td>'+bltodate+'</td>';
                    // delveryentry1[i]['sauda1'].sl_code.party_name
                    if (sauda2[i]['sauda1'] != null) html +='<td>'+sauda2[i]['sauda1']['sl_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    // console.log(sauda2[i]['sauda1']['sl_code']['party_name'])
                    // if (sauda2[i]['sauda1']['sl_code']['city_name'] != null) html +='<td>'+sauda2[i]['sauda1']['sl_code']['city_name'] + '</td>';
                    // else html += '<td>' +  '</td>';
                    html+='<td>Stationravi</td>';
                    if (contractsaudagroup[j]['p_code'] != null) html +='<td>'+contractsaudagroup[j]['p_code']['product_name']+ '</td>';
                    else html += '<td>' +  '</td>';
                    html+='<td>'+contractsaudagroup[j]['bag']+'</td>';
                    html+='<td>'+contractsaudagroup[j]['wght']+'</td>';
                    html+='<td>'+contractsaudagroup[j]['sd_rate']+'</td>';
                    html+='<td>'+contractsaudagroup[j]['brbrk_rt']+'</td>';
                    html+='<td>'+contractsaudagroup[j]['brbrk_typ']+'</td>';
                    html+='<td>'+contractsaudagroup[j]['brbrk_amt']+'</td>';
                    html+='</tr>';
                }
            }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th>SaudaN</th>';
                html+='<th>Date</th>';
                html+='<th>Buyer Name</th>';
                html+='<th>Station</th>';
                html+='<th>Item Name</th>';
                html+='<th>Qty</th>';
                html+='<th>Wght</th>';
                html+='<th>Rate</th>';
                html+='<th>Brok RT.</th>';
                html+='<th>Brok Type</th>';
                html+='<th>Brokerage</th>';
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
        fullfill(html);
    })
}
router.post('/getbillsauda2', ensureAuthenticated, function(req, res){
    var billno= req.body.billno;
    sauda2.find({blmain_bk:"BL",blvouc_code:billno,typ:"BR",co_code:req.session.compid,div_code:req.session.divid},async function (err, sauda2) {   
             if (err) {
                    console.log(err);
                } else {
                    var html = await CreateHTMLsauda2(sauda2,req);
                    res.json({ 'success': true, 'hhtml':html, 'sauda2':sauda2});
                }
            }).populate('pcode','party_name')
            .populate({
                path: 'sauda1',
                model: 'sauda1',
                populate: {
                  path: 'sl_code',
                  model: 'party'
                }
                // populate: {
                //     path: 'city_name',
                //     model: 'city_master'
                //   }
              }).populate([{path: 'contract_sauda_group.p_code'}]) 

})
//ravi for cityname
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