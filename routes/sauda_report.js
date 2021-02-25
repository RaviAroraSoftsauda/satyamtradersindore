const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let party = require('../models/party_schema');
let category = require('../models/category_mast_schema');
let categorytax = require('../models/category_tax_mast_schema');
let group = require('../models/group_schema');
let sauda1 = require('../models/contract_sauda_schema');
let sauda2 = require('../models/contract_sauda2');
// Add Route
router.get('/sauda_report', ensureAuthenticated ,function(req,res){
    group.find({masterid:req.session.masterid}, function (err, group){
        category.find({masterid:req.session.masterid}, function (err, category){
            categorytax.find({masterid:req.session.masterid}, function (err, categorytax){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render('sauda_report.hbs',{
                pageTitle:'Report',
                group: group,
                category: category,
                categorytax: categorytax,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
        }
    }).sort({'category_tax_name':1})
}).sort({'category_name':1})
}).sort({'group_name':1})
});
function CreateHTML(contract,req){
    return new Promise(function(fullfill){
        var html='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="panel panel-primary table light " id="tableportlet">';
        html+='<div class="panel-heading">';
        html+='Contract List';
        html+='</div>';
        html+='<div class="panel-body" id="portletbody">';
        html+='<table id="demotable" class="table table-bordered">';
        html+='<thead>';
        html+='<tr>';
        html+='<th class="excludesearch"></th>';
        html+='<th>Party Name</th>';
        html+='<th>Station</th>';
        html+='<th>Product</th>';
        html+='<th class="sum">Total Bags</th>';
        html+='<th>Pack</th>';
        html+='<th class="sum">Total Weight</th>'; 
        html+='<th>Party Type</th>'; 
        html+='<th>Brok Rate</th>';
        html+='<th>Brok Type</th>';  
        html+='</tr>';
        html+='</thead>';
        html+='<tbody>';
        var index = 0;
        for (let i = 0; i < contract.length; i++) {
           
                    var contractdet = contract[i]['contract_sauda_group'];
                    for (let j = 0; j < contractdet.length; j++) {
                        index++;
                        html+='<tr>';
                        html+='<td>'+index+'</td>';
                        if(contract[i]['pcode']!=null) var partname = contract[i]['pcode']['party_name']
                        else var partname ='';
                        html+='<td>'+partname+'</td>';
                        if(contract[i]['pcode']!=null && contract[i]['pcode']['city_name']!=null) var cityname = contract[i]['pcode']['city_name']['city_name']
                        else var cityname ='';
                        html+='<td>'+cityname+'</td>';
                        if(contractdet[j]['p_code']!=null) var pcode = contractdet[j]['p_code']['product_name']
                        else var pcode='';
                        html+='<td>'+pcode+'</td>';
                        if(contract[i]['sauda1']!=null) var totbag = contract[i]['sauda1']['tot_bags']
                        else var totbag='';
                        html+='<td>'+totbag+'</td>';
                        html+='<td>'+contractdet[j]['pck']+'</td>';
                        if(contract[i]['sauda1']!=null) var totwght = contract[i]['sauda1']['tot_wght']
                        else var totwght='';
                        html+='<td>'+totwght+'</td>'; 
                        html+='<td>'+contract[i]['typ']+'</td>'; 
                        html+='<td>'+contractdet[j]['brbrk_rt']+'</td>'; 
                        html+='<td>'+contractdet[j]['brbrk_typ']+'</td>'; 
                        html+='</tr>';
                    }
                }
        html+='</tbody>';
        html+='<tfoot>';
       
        html+='<tr>';
        html+='<th></th>';
        html+='<th></th>';
        html+='<th></th>';
        html+='<th></th>';
        html+='<th><div class="gtotal"></div></th>';
        html+='<th></th>';
        html+='<th><div class="gtotal"></div></th>';
        html+='<th></th>';
        html+='<th></th>';
        html+='<th></th>';
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
router.post('/getlist', ensureAuthenticated, function(req, res){
    var start_date= req.body.start_date;
    var end_date= req.body.end_date;
    var partygroup= req.body.partygroup;
    var partycategorytax= req.body.partycategorytax;
    var partycategory = req.body.partycategory;
    var checkvaluname = req.body.checkvaluname;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
    var qry = "";
   if(checkvaluname=='contract') qry  = {$or: [ { typ: "SL" }, { typ: "SB"},{ typ: "BB"},{ typ: "BR"} ],$and: [{main_bk:"SD",sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
   if(checkvaluname=='deliverysauda') qry  = {$and: [{main_bk:"DLV",sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
   if(checkvaluname=='directdelivery') qry  = {$and: [{main_bk:"DDLV",sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
   if(checkvaluname=='delaentry') qry  = {$and: [{main_bk:"DE",sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
        //console.log(qry);
   sauda2.find(qry,async function (err, contract) {
            var html = await CreateHTML(contract,checkvaluname,req);
            res.json({ 'success': true, 'hhtml':html});
            }).populate([{path: 'contract_sauda_group.p_code',select: 'product_name'}])
            .populate([{path: 'pcode',
            populate:{ path: 'city_name', select: 'city_name'}
            }]).populate('sauda1')
})

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