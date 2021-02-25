const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let somast = require('../models/salesorder_schema');
let product = require('../models/product_mast_schema');
let acmast= require('../models/ac_mast');
let workmast = require('../models/worksheet_schema');
let db = mongoose.connection;
let common = require('./common');
// Add Routesales_order_summary
router.get('/outward_details', ensureAuthenticated, function(req, res){
somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"outward"}, function (err,somast){
    acmast.find({main_bk:"customer"}, function (err, acmast){
        product.find({masterid:req.session.masterid}, function (err, product){
            workmast.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast){
   if (err) {
       console.log(err);
   } else {
       res.render('outward_details.hbs', {
           pageTitle:'Outward Details',
           somast: somast,
           acmast: acmast,
           product: product,
           workmast:workmast,
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
    }).populate('ac_city')
}).populate('buy_cus_name');
});
router.get('/outward_summary', ensureAuthenticated, function(req, res){
    somast.find({co_code:req.session.compid,div_code:req.session.divid,main_bk:"outward"}, function (err,somast){
        acmast.find({main_bk:"customer"}, function (err, acmast){
            product.find({masterid:req.session.masterid}, function (err, product){
                workmast.find({co_code:req.session.compid,div_code:req.session.divid}, function (err, workmast){
       if (err) {
           console.log(err);
       } else {
           res.render('outward_summary.hbs', {
               pageTitle:'Outward Summary',
               somast: somast,
               acmast: acmast,
               product: product,
               workmast:workmast,
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
        }).populate('ac_city')
    }).populate('buy_cus_name');
    });
    
router.get('/delivery_details', ensureAuthenticated, function(req, res){
    party.find({masterid:req.session.masterid}, function (err, party){
   if (err) {
       console.log(err);
   } else {
       res.render('delivery_details.hbs', {
           pageTitle:'Delivery Details',
           contract: contract,
           party: party,
           product_mast: product_mast,
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
router.get('/outward_register', ensureAuthenticated, function(req, res){
             party.find({masterid:req.session.masterid}, function (err, party){
            if (err) {
                console.log(err);
            } else {
                res.render('salesorder_register.hbs', {
                    pageTitle:'Sales Order Register',
                    contract: contract,
                    party: party,
                    product_mast: product_mast,
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
function CreateHTML(somast,buy_cus_name,req){
    return new Promise(function(fullfill){
        var html='<div class="showsearchdata">';
        html+='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="table-responsive">'; 
        console.log("buy_cus_name"+buy_cus_name);
    
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>Control</th>';
            html+='<th>Outward Date</th>';
            html+='<th>Outward No</th>';
            html+='<th>Buyer Name</th>';
            html+='<th>Remarks</th>';
            html+='<th>PO Number</th>';
            html+='<th>PO Date</th>'; 
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            var childarray = [];
            for (let i = 0; i <somast.length; i++) {
                const sn_date = moment(somast[i]['so_date']).format('DD/MM/YYYY');
                if(somast[i]!=null) var somastdet = somast[i]['sales_or_group'];
                else var somastdet='';
               // console.log(somastdet)
                    for (let j = 0; j < somastdet.length; j++) {
                    if (somastdet[j]['so_disc'] != null) var so_disc= somastdet[j]['so_disc']['prdt_desc'];
                    else var so_disc = '';
                    if (somastdet[j]['outin_qty'] != undefined) var outin_qty= somastdet[j]['outin_qty'];
                    else var outin_qty = '';
                    if (somastdet[j]['ocrate'] != undefined) var ocrate= somastdet[j]['ocrate'];
                    else var ocrate = '';
                    if (somastdet[j]['so_qty'] != undefined) var so_qty= somastdet[j]['so_qty'];
                    else var so_qty = '';
                    if (somastdet[j]['so_discount'] != undefined) var so_discount= somastdet[j]['so_discount'];
                    else var so_discount = '';
                    if (somastdet[j]['total_amt'] != undefined) var total_amt= somastdet[j]['total_amt'];
                    else var total_amt = '';
                   
                    var obj = {"Description":so_disc,"innerqty":outin_qty,"Rate": ocrate,"Qty": so_qty,"Discount": so_discount,"Valuet": total_amt};
                    childarray.push(obj);  
                    console.log(childarray);
                }
                html += '<tr>';
                html += '<td class="outward-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
                const sd_date = moment(somast[i]['so_date']).format('DD/MM/YYYY');
                html += '<td>' + sd_date + '</td>';
                html += '<td>' + somast[i]['vouc_code'] + '</td>';
                if (somast[i]['buy_cus_name'] != null) html +='<td>'+somast[i]['buy_cus_name']['ac_name'] + '</td>';
                else html += '<td>' +  '</td>';
                if (somast[i]['buy_rmks'] != null) html +='<td>'+somast[i]['buy_rmks'] + '</td>';
                else html += '<td>' +  '</td>';
                if (somast[i]['buy_pono'] != null) html +='<td>'+somast[i]['buy_pono'] + '</td>';
                else html += '<td>' +  '</td>';
                const sp_date = moment(somast[i]['buy_podt']).format('DD/MM/YYYY');
                if (somast[i]['buy_podt'] != null) html +='<td>'+sp_date+ '</td>';
                else html += '<td>' +  '</td>';
                html += '</tr>';
                childarray = [];
            
                }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th class="excludesearch"></th>';
                html+='<th>Outward Date</th>';
                html+='<th>Outward No</th>';
                html+='<th>Buyer Name</th>';
                html+='<th>Remarks</th>';
                html+='<th>PO Number</th>';
                html+='<th>PO Date</th>'; 
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
function CreateHTML1(somast,buy_cus_name,req){
    return new Promise(function(fullfill){
        var html='<div class="showsearchdata">';
        html+='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="table-responsive">'; 
      //  console.log("buy_cus_name"+buy_cus_name);
    
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>Outward</br> Date</th>';
            html+='<th>Outward</br> No</th>';
            html+='<th>Buyer</br> Name</th>';
            html+='<th>City</th>';
            html+='<th>Remarks</th>';
             html+='<th>Description</th>';
            html+='<th>Inner</br>qty</th>';
            html+='<th>Order</br>Qty</th?>';
            html+='<th>Rate</th>';
            html+='<th>Dis</th>';
            html+='<th>Total</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            for (let i = 0; i <somast.length; i++) {
                
                const sn_date = moment(somast[i]['so_date']).format('DD/MM/YYYY');
                if(somast[i]!=null) var somastdet = somast[i]['sales_or_group'];
                else var somastdet='';
               // console.log(somastdet)
               for (let j = 0; j < somastdet.length; j++) { 
                html += '<tr>';
                 const sd_date = moment(somast[i]['so_date']).format('DD/MM/YYYY');
                html += '<td>' + sd_date + '</td>';
                html += '<td>' + somast[i]['vouc_code'] + '</td>';
                if (somast[i]['buy_cus_name'] != null) html +='<td>'+somast[i]['buy_cus_name']['ac_name'] + '</td>';
                else html += '<td>' +  '</td>';
                if (somast[i]['buy_cus_name'] != null) html +='<td>'+somast[i]['buy_cus_name']['ac_city']['city_name'] + '</td>';
                else html += '<td>' +  '</td>';
                if (somast[i]['buy_rmks'] != null) html +='<td>'+somast[i]['buy_rmks'] + '</td>';
                else html += '<td>' +  '</td>';
                // if (somast[i]['buy_pono'] != null) html +='<td>'+somast[i]['buy_pono'] + '</td>';
                // else html += '<td>' +  '</td>';
                // const sp_date = moment(somast[i]['buy_podt']).format('DD/MM/YYYY');
                // if (somast[i]['buy_podt'] != null) html +='<td>'+sp_date+ '</td>';
                // else html += '<td>' +  '</td>';
               
              
                    if (somastdet[j]['so_disc'] != null)   html +='<td>'+somastdet[j]['so_disc']['prdt_desc']+ '</td>';
                    else html += '<td>' +  '</td>';
                    if (somastdet[j]['outin_qty'] != undefined)  html +='<td>'+somastdet[j]['outin_qty']+ '</td>';
                    else html += '<td>' +  '</td>';
                    if (somastdet[j]['ocrate'] != undefined) html +='<td>'+somastdet[j]['ocrate']+ '</td>'; 
                    else html += '<td>' +  '</td>';
                    if (somastdet[j]['so_qty'] != undefined) html +='<td>'+somastdet[j]['so_qty']+ '</td>'; 
                    else html += '<td>' +  '</td>';
                    if (somastdet[j]['so_discount'] != undefined) html +='<td>'+somastdet[j]['so_discount']+ '</td>'; 
                    else html += '<td>' +  '</td>';
                    if (somastdet[j]['total_amt'] != undefined) html +='<td>'+somastdet[j]['total_amt']+ '</td>';  
                    else html += '<td>' +  '</td>';
                   
                
                }
                html += '</tr>';
                }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                 html+='<th>Outward</br>Date</th>';
                html+='<th>Outward</br> No</th>';
                html+='<th>Buyer</br> Name</th>';
                html+='<th>City</th>';
                html+='<th>Remarks</th>';
                html+='<th>Item Name</th>';
                html+='<th>inner</br>qty</th>';
                html+='<th>percarton</br>CBM</th?>';
                html+='<th>Order</br>Qty</th>';
                html+='<th>Dis</th>';
                html+='<th>Total($)</th>';
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
router.post('/outwarddetails', ensureAuthenticated, function(req, res){
       var start_date= req.body.start_date;
        var end_date= req.body.end_date;
        var  buy_cus_name=req.body.buy_cus_name;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
        var qry = "";
        if (buy_cus_name=="") qry = {$and: [{main_bk:"outward"},{so_datemilisecond:{$gte:strtdate}},{so_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
        if (buy_cus_name!="") qry = {$and: [{main_bk:"outward"},{buy_cus_name:buy_cus_name},{so_datemilisecond:{$gte:strtdate}},{so_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
        somast.find(qry,async function (err, somast) {   
                 if (err) {
                        console.log(err);
                    } else {
                      //  console.log(somast);
                        var html = await CreateHTML(somast,buy_cus_name,req);
                        res.json({ 'success': true, 'hhtml':html});
                    }
                }).populate('buy_cus_name').populate([{path: 'sales_or_group.so_disc'}])

})
router.post('/outwardsummary', ensureAuthenticated, function(req, res){
    var start_date= req.body.start_date;
     var end_date= req.body.end_date;
     var  buy_cus_name=req.body.buy_cus_name;
     const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
     const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
     var qry = "";
     if (buy_cus_name=="") qry = {$and: [{main_bk:"outward"},{so_datemilisecond:{$gte:strtdate}},{so_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
     if (buy_cus_name!="") qry = {$and: [{main_bk:"outward"},{buy_cus_name:buy_cus_name},{so_datemilisecond:{$gte:strtdate}},{so_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
     somast.find(qry,async function (err, somast) {   
              if (err) {
                     console.log(err);
                 } else {
                     var html = await CreateHTML1(somast,buy_cus_name,req);
                     res.json({ 'success': true, 'hhtml':html});
                 }
             }).populate('buy_cus_name').populate([{path: 'sales_or_group.so_disc'}]).populate([{path: 'buy_cus_name',populate:{ path: 'ac_city'}}])  

})



function Createsaudadetails(contract,sl_brok,req){
    return new Promise(function(fullfill){
        var html='<div class="showsearchdata">';
        html+='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="panel panel-primary table light " id="tableportlet">';
        html+='<div class="panel-body" id="portletbody">';
        html+='<table id="demotable" class="table table-striped table-bordered table-hover adsearch">';
        html+='<thead>';
        html+='<tr>';
        html+='<th>CJSP</th>';
        html+='<th>Bhartiyo</th>';
        html+='<th>Del.Date</th>';
        html+='<th>Buyer Name</th>';
        html+='<th>Seller Name</th>';
        html+='<th>Product</th>';
        html+='<th>Brand</th>';
        html+='<th>Pack(KG)</th>';
        html+='<th class="sum">Katta</th>';
        html+='<th class="sum">Net Wht</th>';
        html+='<th>Rate</th>';
        html+='<th class="sum">Bill. Amt</th>';
        html+='</tr>';
        html+='</thead>';
        html+='<tbody>';
        var srno=0;
        for (let i = 0; i < contract.length; i++) {
            const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
            if(contract[i]['sauda2']!=null) var contractdet = contract[i]['sauda2']['contract_sauda_group'];
            else var contractdet='';
            for (let j = 0; j < contractdet.length; j++)
             {
                srno++;
                if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
                else var p_code = '';
                if (contractdet[j]['brand_code'] != null) var brand_code= contractdet[j]['brand_code']['brand_name'];
                else var brand_code = '';
                if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
                else var bag = '';
                if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
                else var pck = '';
                if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
                else var wght = '';
                if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
                else var sd_rate = '';
                if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
                else var amount = '';
                html += '<tr>';
                html +='<td>'+contract[i]['c_j_s_p']+ '</td>';
                html += '<td><a href="/deal_entry/deal_entry_update/'+contract[i]['_id']+'"  data-id="'+contract[i]['_id']+'" target="_blank"> '+contract[i]['vouc_code']+' </a></td>';
               
                html += '<td>'+sd_date+'</td>';
                
                if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name']+'  ('+contract[i]['br_code']['city_name']['city_name']+')</td>';
                else html += '<td>' +  '</td>';
                if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name']+'  ('+contract[i]['sl_code']['city_name']['city_name']+')</td>';
                else html += '<td>' +  '</td>';
                html +='<td>'+p_code+ '</td>';
                html +='<td>'+brand_code+ '</td>';
                html +='<td>'+pck+ '</td>';
                html +='<td>'+bag+ '</td>';
                html +='<td>'+wght+ '</td>';
                html +='<td>'+sd_rate+ '</td>';
                html += '<td>'+contract[i]['tot_ammount']+'</td>';
                html += '</tr>';
        }
        }
               html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th></th>';//cjsp
                html+='<th></th>';//Bhartiyo
                html+='<th></th>';//Del.Date
                html+='<th></th>';//Buyer Name
                html+='<th></th>';//Seller Name
                //html+='<th></th>';//Place
                html+='<th></th>';//Product
                html+='<th></th>';
                html+='<th></th>';//Pack(KG)
                html+='<th><div class="gtotal"></div></th>';//Katta
                html+='<th><div class="gtotal"></div></th>';//Net Wht
                html+='<th></th>';//Rate
                html+='<th><div class="gtotal"></div></th>';//Bill. Amt
                // html+='<th></th>';//P O Number
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
                html+='</div>';
                html+='</div>';
                html+='</div>';
                html+='</div>';
                html+='</div>';
        fullfill(html);
        // }
        // if(sl_brok=="sl_brok")
        // {
        //     html+='<table class="table table-striped table-bordered table-hover adsearch">';
        //     html+='<thead>';
        //     html+='<tr>';
        //     html+='<th>Control</th>';
        //     html+='<th>Date</th>';
        //     html+='<th>Contract Nubmer</th>';
        //     html+='<th>Buyer</th>';
        //     html+='<th>Seller Broker</th>';
        //     html+='<th>Seller</th>';
        //     html+='<th>Buyer Broker</th>';
        //     html+='</tr>';
        //     html+='</thead>';
        //     html+='<tbody>';
        //     var childarray = [];
        //         for (let i = 0; i < contract.length; i++) {
        //             const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
        //             var contractdet = contract[i]['sauda2']['contract_sauda_group'];
        //             for (let j = 0; j < contractdet.length; j++) {
        //             if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
        //             else var p_code = '';
        //             if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
        //             else var bag = '';
        //             if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
        //             else var pck = '';
        //             if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
        //             else var wght = '';
        //             if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
        //             else var sd_rate = '';
        //             if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
        //             else var amount = '';
        //             if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
        //             else var qty_exe = '';
        //             if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
        //             else var wght_bal = '';
        //             var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
        //             childarray.push(obj);    
        //         }
        //             html += '<tr>';
        //             html += '<td class="details-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
        //             html += '<td>' + sd_date + '</td>';
        //             html += '<td>' + contract[i]['vouc_code'] + '</td>';
        //             if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sb_code'] != null) html +='<td>'+contract[i]['sb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['bb_code'] != null) html +='<td>'+contract[i]['bb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             html += '</tr>';
        //             childarray = [];
            
        //         }
        //         html+='</tbody>';
        //         html+='<tfoot>';
        //         html+='<tr>';
        //         html+='<th class="excludesearch"></th>';
        //         html+='<th>Date</th>';
        //         html+='<th>Contract Nubmer</th>';
        //         html+='<th>Buyer</th>';
        //         html+='<th>Seller Broker</th>';
        //         html+='<th>Seller</th>';
        //         html+='<th>Buyer Broker</th>';
        //         html+='</tr>';
        //         html+='</tfoot>';
        //         html+='</table>';
        // }
        // if(sl_brok=="sb_brok")
        // {
        //     html+='<table class="table table-striped table-bordered table-hover adsearch">';
        //     html+='<thead>';
        //     html+='<tr>';
        //     html+='<th>Control</th>';
        //     html+='<th>Date</th>';
        //     html+='<th>Contract Nubmer</th>';
        //     html+='<th>Buyer</th>';
        //     html+='<th>Seller Broker</th>';
        //     html+='<th>Seller</th>';
        //     html+='<th>Buyer Broker</th>';
        //     html+='</tr>';
        //     html+='</thead>';
        //     html+='<tbody>';
        //     var childarray = [];
        //         for (let i = 0; i < contract.length; i++) {
        //             const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
        //             var contractdet = contract[i]['sauda2']['contract_sauda_group'];
        //             for (let j = 0; j < contractdet.length; j++) {
        //                 if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
        //                 else var p_code = '';
        //                 if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
        //                 else var bag = '';
        //                 if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
        //                 else var pck = '';
        //                 if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
        //                 else var wght = '';
        //                 if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
        //                 else var sd_rate = '';
        //                 if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
        //                 else var amount = '';
        //                 if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
        //                 else var qty_exe = '';
        //                 if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
        //                 else var wght_bal = '';
        //                 var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
        //                 childarray.push(obj);    
        //         }
        //             html += '<tr>';
        //             html += '<td class="details-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
        //             html += '<td>' + sd_date + '</td>';
        //             html += '<td>' + contract[i]['vouc_code'] + '</td>';
        //             if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sb_code'] != null) html +='<td>'+contract[i]['sb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['bb_code'] != null) html +='<td>'+contract[i]['bb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             html += '</tr>';
        //             childarray = [];
            
        //         }
        //         html+='</tbody>';
        //         html+='<tfoot>';
        //         html+='<tr>';
        //         html+='<th class="excludesearch"></th>';
        //         html+='<th>Date</th>';
        //         html+='<th>Contract Nubmer</th>';
        //         html+='<th>Buyer</th>';
        //         html+='<th>Seller Broker</th>';
        //         html+='<th>Seller</th>';
        //         html+='<th>Buyer Broker</th>';
        //         html+='</tr>';
        //         html+='</tfoot>';
        //         html+='</table>';
        // }
        // if(sl_brok=="br_brok")
        // {
        //     html+='<table class="table table-striped table-bordered table-hover adsearch">';
        //     html+='<thead>';
        //     html+='<tr>';
        //     html+='<th>Control</th>';
        //     html+='<th>Date</th>';
        //     html+='<th>Contract Nubmer</th>';
        //     html+='<th>Seller</th>';
        //     html+='<th>Seller Broker</th>';
        //     html+='<th>Buyer</th>';
        //     html+='<th>Buyer Broker</th>';
        //     html+='</tr>';
        //     html+='</thead>';
        //     html+='<tbody>';
        //     var childarray = [];
        //         for (let i = 0; i < contract.length; i++) {
        //             const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
        //             var contractdet = contract[i]['sauda2']['contract_sauda_group'];
        //             for (let j = 0; j < contractdet.length; j++) {
        //                 if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
        //                 else var p_code = '';
        //                 if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
        //                 else var bag = '';
        //                 if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
        //                 else var pck = '';
        //                 if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
        //                 else var wght = '';
        //                 if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
        //                 else var sd_rate = '';
        //                 if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
        //                 else var amount = '';
        //                 if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
        //                 else var qty_exe = '';
        //                 if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
        //                 else var wght_bal = '';
        //                 var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
        //                 childarray.push(obj);     
        //         }
        //             html += '<tr>';
        //             html += '<td class="details-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
        //             html += '<td>' + sd_date + '</td>';
        //             html += '<td>' + contract[i]['vouc_code'] + '</td>';
        //             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sb_code'] != null) html +='<td>'+contract[i]['sb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['bb_code'] != null) html +='<td>'+contract[i]['bb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             html += '</tr>';
        //             childarray = [];
        //         }
        //         html+='</tbody>';
        //         html+='<tfoot>';
        //         html+='<tr>';
        //         html+='<th class="excludesearch"></th>';
        //         html+='<th>Date</th>';
        //         html+='<th>Contract Nubmer</th>';
        //         html+='<th>Seller</th>';
        //         html+='<th>Seller Broker</th>';
        //         html+='<th>Buyer</th>';
        //         html+='<th>Buyer Broker</th>';
        //         html+='</tr>';
        //         html+='</tfoot>';
        //         html+='</table>';
        // }
        // if(sl_brok=="bb_brok")
        // {
        //     html+='<table class="table table-striped table-bordered table-hover adsearch">';
        //     html+='<thead>';
        //     html+='<tr>';
        //     html+='<th>Control</th>';
        //     html+='<th>Date</th>';
        //     html+='<th>Contract Nubmer</th>';
        //     html+='<th>Seller</th>';
        //     html+='<th>Seller Broker</th>';
        //     html+='<th>Buyer</th>';
        //     html+='<th>Buyer Broker</th>';
        //     html+='</tr>';
        //     html+='</thead>';
        //     html+='<tbody>';
        //     var childarray = [];
        //         for (let i = 0; i < contract.length; i++) {
        //             const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
        //             if(contract[i]['sauda2']!=null)var contractdet = contract[i]['sauda2']['contract_sauda_group'];
        //             else var contractdet = '';
        //             for (let j = 0; j < contractdet.length; j++) {
        //                 if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
        //                 else var p_code = '';
        //                 if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
        //                 else var bag = '';
        //                 if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
        //                 else var pck = '';
        //                 if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
        //                 else var wght = '';
        //                 if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
        //                 else var sd_rate = '';
        //                 if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
        //                 else var amount = '';
        //                 if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
        //                 else var qty_exe = '';
        //                 if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
        //                 else var wght_bal = '';
        //                 var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
        //                 childarray.push(obj);    
        //         }
        //             html += '<tr>';
        //             html += '<td class="details-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
        //             html += '<td>' + sd_date + '</td>';
        //             html += '<td>' + contract[i]['vouc_code'] + '</td>';
        //             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sb_code'] != null) html +='<td>'+contract[i]['sb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['bb_code'] != null) html +='<td>'+contract[i]['bb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             html += '</tr>';
        //             childarray = [];
        //         }
        //         html+='</tbody>';
        //         html+='<tfoot>';
        //         html+='<tr>';
        //         html+='<th class="excludesearch"></th>';
        //         html+='<th>Date</th>';
        //         html+='<th>Contract Nubmer</th>';
        //         html+='<th>Seller</th>';
        //         html+='<th>Seller Broker</th>';
        //         html+='<th>Buyer</th>';
        //         html+='<th>Buyer Broker</th>';
        //         html+='</tr>';
        //         html+='</tfoot>';
        //         html+='</table>';
        // }
            html+='</div>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
        fullfill(html);
    })
}
router.post('/cnytrctsaudadetail', ensureAuthenticated, function(req, res){
    var sl_code = req.body.sl_code;
    var sb_code = req.body.sb_code;
    var br_code = req.body.br_code;
    var bb_code = req.body.bb_code;
    var start_date= req.body.start_date;
    var end_date= req.body.end_date;
    var  sl_brok= req.body.sl_brok;
    common.UpdatePenBalNew(req,"");
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
    var qry = "";
    if ((sl_code=="") &&  (sb_code=="") && (br_code=="") && (bb_code=="")) qry = {$and: [{main_bk:"SD",sd_date:{$gte:strtdate}},{sd_date:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (br_code!="") qry = {$and: [{main_bk:"SD",br_code:br_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (sl_code!="") qry = {$and: [{main_bk:"SD",sl_code:sl_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (sb_code!="") qry = {$and: [{main_bk:"SD",sb_code:sb_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (bb_code!="") qry = {$and: [{main_bk:"SD",bb_code:bb_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    contract.find(qry,async function (err, contract) {   
             if (err) {
                    console.log(err);
                } else {
                    var html = await Createsaudadetails(contract,sl_brok,req);
                    res.json({ 'success': true, 'hhtml':html});
                }
            }).populate([{path: 'sauda2',
            populate:{ path: 'contract_sauda_group.p_code'}
            }]).populate([{path: 'sauda2',
            populate:{ path: 'contract_sauda_group.brand_code'}
            }]).populate([{path: 'sl_code',
            populate:{ path: 'city_name'}
            }]).populate([{path: 'br_code',
            populate:{ path: 'city_name',}
            }]).populate('sb_code').populate('bb_code')    

})

function Createdeliverysaudadetails(contract,sl_brok,req){
    return new Promise(function(fullfill){
        var html='<div class="showsearchdata">';
        html+='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="panel panel-primary table light " id="tableportlet">';
        html+='<div class="panel-body" id="portletbody">';
        html+='<table id="demotable" class="table table-striped table-bordered table-hover adsearch">';
        html+='<thead>';
        html+='<tr>';
        html+='<th>CJSP</th>';
        html+='<th>Bhartiyo</th>';
        html+='<th>Del.Date</th>';
        html+='<th>Buyer Name</th>';
        html+='<th>Seller Name</th>';
        html+='<th>Product</th>';
        html+='<th>Brand</th>';
        html+='<th>Pack(KG)</th>';
        html+='<th class="sum">Katta</th>';
        html+='<th class="sum">Net Wht</th>';
        html+='<th>Rate</th>';
        html+='<th class="sum">Bill. Amt</th>';
        html+='</tr>';
        html+='</thead>';
        html+='<tbody>';
        var srno=0;
        for (let i = 0; i < contract.length; i++) {
            const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
            if(contract[i]['sauda2']!=null) var contractdet = contract[i]['sauda2']['contract_sauda_group'];
            else var contractdet='';
            for (let j = 0; j < contractdet.length; j++)
             {
                srno++;
                if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
                else var p_code = '';
                if (contractdet[j]['brand_code'] != null) var brand_code= contractdet[j]['brand_code']['brand_name'];
                else var brand_code = '';
                if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
                else var bag = '';
                if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
                else var pck = '';
                if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
                else var wght = '';
                if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
                else var sd_rate = '';
                if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
                else var amount = '';
                html += '<tr>';
                html +='<td>'+contract[i]['c_j_s_p']+ '</td>';
                html += '<td><a href="/deal_entry/deal_entry_update/'+contract[i]['_id']+'"  data-id="'+contract[i]['_id']+'" target="_blank"> '+contract[i]['vouc_code']+' </a></td>';
               
                html += '<td>'+sd_date+'</td>';
                
                if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name']+'  ('+contract[i]['br_code']['city_name']['city_name']+')</td>';
                else html += '<td>' +  '</td>';
                if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name']+'  ('+contract[i]['sl_code']['city_name']['city_name']+')</td>';
                else html += '<td>' +  '</td>';
                html +='<td>'+p_code+ '</td>';
                html +='<td>'+brand_code+ '</td>';
                html +='<td>'+pck+ '</td>';
                html +='<td>'+bag+ '</td>';
                html +='<td>'+wght+ '</td>';
                html +='<td>'+sd_rate+ '</td>';
                html += '<td>'+contract[i]['tot_ammount']+'</td>';
                html += '</tr>';
        }
        }
               html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th></th>';//cjsp
                html+='<th></th>';//Bhartiyo
                html+='<th></th>';//Del.Date
                html+='<th></th>';//Buyer Name
                html+='<th></th>';//Seller Name
                //html+='<th></th>';//Place
                html+='<th></th>';//Product
                html+='<th></th>';
                html+='<th></th>';//Pack(KG)
                html+='<th><div class="gtotal"></div></th>';//Katta
                html+='<th><div class="gtotal"></div></th>';//Net Wht
                html+='<th></th>';//Rate
                html+='<th><div class="gtotal"></div></th>';//Bill. Amt
                // html+='<th></th>';//P O Number
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
                html+='</div>';
                html+='</div>';
                html+='</div>';
                html+='</div>';
                html+='</div>';
        fullfill(html);
        // }
        // if(sl_brok=="sl_brok")
        // {
        //     html+='<table class="table table-striped table-bordered table-hover adsearch">';
        //     html+='<thead>';
        //     html+='<tr>';
        //     html+='<th>Control</th>';
        //     html+='<th>Date</th>';
        //     html+='<th>Contract Nubmer</th>';
        //     html+='<th>Buyer</th>';
        //     html+='<th>Seller Broker</th>';
        //     html+='<th>Seller</th>';
        //     html+='<th>Buyer Broker</th>';
        //     html+='</tr>';
        //     html+='</thead>';
        //     html+='<tbody>';
        //     var childarray = [];
        //         for (let i = 0; i < contract.length; i++) {
        //             const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
        //             var contractdet = contract[i]['sauda2']['contract_sauda_group'];
        //             for (let j = 0; j < contractdet.length; j++) {
        //             if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
        //             else var p_code = '';
        //             if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
        //             else var bag = '';
        //             if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
        //             else var pck = '';
        //             if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
        //             else var wght = '';
        //             if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
        //             else var sd_rate = '';
        //             if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
        //             else var amount = '';
        //             if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
        //             else var qty_exe = '';
        //             if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
        //             else var wght_bal = '';
        //             var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
        //             childarray.push(obj);    
        //         }
        //             html += '<tr>';
        //             html += '<td class="details-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
        //             html += '<td>' + sd_date + '</td>';
        //             html += '<td>' + contract[i]['vouc_code'] + '</td>';
        //             if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sb_code'] != null) html +='<td>'+contract[i]['sb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['bb_code'] != null) html +='<td>'+contract[i]['bb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             html += '</tr>';
        //             childarray = [];
            
        //         }
        //         html+='</tbody>';
        //         html+='<tfoot>';
        //         html+='<tr>';
        //         html+='<th class="excludesearch"></th>';
        //         html+='<th>Date</th>';
        //         html+='<th>Contract Nubmer</th>';
        //         html+='<th>Buyer</th>';
        //         html+='<th>Seller Broker</th>';
        //         html+='<th>Seller</th>';
        //         html+='<th>Buyer Broker</th>';
        //         html+='</tr>';
        //         html+='</tfoot>';
        //         html+='</table>';
        // }
        // if(sl_brok=="sb_brok")
        // {
        //     html+='<table class="table table-striped table-bordered table-hover adsearch">';
        //     html+='<thead>';
        //     html+='<tr>';
        //     html+='<th>Control</th>';
        //     html+='<th>Date</th>';
        //     html+='<th>Contract Nubmer</th>';
        //     html+='<th>Buyer</th>';
        //     html+='<th>Seller Broker</th>';
        //     html+='<th>Seller</th>';
        //     html+='<th>Buyer Broker</th>';
        //     html+='</tr>';
        //     html+='</thead>';
        //     html+='<tbody>';
        //     var childarray = [];
        //         for (let i = 0; i < contract.length; i++) {
        //             const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
        //             var contractdet = contract[i]['sauda2']['contract_sauda_group'];
        //             for (let j = 0; j < contractdet.length; j++) {
        //                 if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
        //                 else var p_code = '';
        //                 if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
        //                 else var bag = '';
        //                 if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
        //                 else var pck = '';
        //                 if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
        //                 else var wght = '';
        //                 if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
        //                 else var sd_rate = '';
        //                 if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
        //                 else var amount = '';
        //                 if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
        //                 else var qty_exe = '';
        //                 if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
        //                 else var wght_bal = '';
        //                 var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
        //                 childarray.push(obj);    
        //         }
        //             html += '<tr>';
        //             html += '<td class="details-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
        //             html += '<td>' + sd_date + '</td>';
        //             html += '<td>' + contract[i]['vouc_code'] + '</td>';
        //             if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sb_code'] != null) html +='<td>'+contract[i]['sb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['bb_code'] != null) html +='<td>'+contract[i]['bb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             html += '</tr>';
        //             childarray = [];
            
        //         }
        //         html+='</tbody>';
        //         html+='<tfoot>';
        //         html+='<tr>';
        //         html+='<th class="excludesearch"></th>';
        //         html+='<th>Date</th>';
        //         html+='<th>Contract Nubmer</th>';
        //         html+='<th>Buyer</th>';
        //         html+='<th>Seller Broker</th>';
        //         html+='<th>Seller</th>';
        //         html+='<th>Buyer Broker</th>';
        //         html+='</tr>';
        //         html+='</tfoot>';
        //         html+='</table>';
        // }
        // if(sl_brok=="br_brok")
        // {
        //     html+='<table class="table table-striped table-bordered table-hover adsearch">';
        //     html+='<thead>';
        //     html+='<tr>';
        //     html+='<th>Control</th>';
        //     html+='<th>Date</th>';
        //     html+='<th>Contract Nubmer</th>';
        //     html+='<th>Seller</th>';
        //     html+='<th>Seller Broker</th>';
        //     html+='<th>Buyer</th>';
        //     html+='<th>Buyer Broker</th>';
        //     html+='</tr>';
        //     html+='</thead>';
        //     html+='<tbody>';
        //     var childarray = [];
        //         for (let i = 0; i < contract.length; i++) {
        //             const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
        //             var contractdet = contract[i]['sauda2']['contract_sauda_group'];
        //             for (let j = 0; j < contractdet.length; j++) {
        //                 if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
        //                 else var p_code = '';
        //                 if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
        //                 else var bag = '';
        //                 if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
        //                 else var pck = '';
        //                 if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
        //                 else var wght = '';
        //                 if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
        //                 else var sd_rate = '';
        //                 if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
        //                 else var amount = '';
        //                 if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
        //                 else var qty_exe = '';
        //                 if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
        //                 else var wght_bal = '';
        //                 var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
        //                 childarray.push(obj);     
        //         }
        //             html += '<tr>';
        //             html += '<td class="details-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
        //             html += '<td>' + sd_date + '</td>';
        //             html += '<td>' + contract[i]['vouc_code'] + '</td>';
        //             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sb_code'] != null) html +='<td>'+contract[i]['sb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['bb_code'] != null) html +='<td>'+contract[i]['bb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             html += '</tr>';
        //             childarray = [];
        //         }
        //         html+='</tbody>';
        //         html+='<tfoot>';
        //         html+='<tr>';
        //         html+='<th class="excludesearch"></th>';
        //         html+='<th>Date</th>';
        //         html+='<th>Contract Nubmer</th>';
        //         html+='<th>Seller</th>';
        //         html+='<th>Seller Broker</th>';
        //         html+='<th>Buyer</th>';
        //         html+='<th>Buyer Broker</th>';
        //         html+='</tr>';
        //         html+='</tfoot>';
        //         html+='</table>';
        // }
        // if(sl_brok=="bb_brok")
        // {
        //     html+='<table class="table table-striped table-bordered table-hover adsearch">';
        //     html+='<thead>';
        //     html+='<tr>';
        //     html+='<th>Control</th>';
        //     html+='<th>Date</th>';
        //     html+='<th>Contract Nubmer</th>';
        //     html+='<th>Seller</th>';
        //     html+='<th>Seller Broker</th>';
        //     html+='<th>Buyer</th>';
        //     html+='<th>Buyer Broker</th>';
        //     html+='</tr>';
        //     html+='</thead>';
        //     html+='<tbody>';
        //     var childarray = [];
        //         for (let i = 0; i < contract.length; i++) {
        //             const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
        //             if(contract[i]['sauda2']!=null)var contractdet = contract[i]['sauda2']['contract_sauda_group'];
        //             else var contractdet = '';
        //             for (let j = 0; j < contractdet.length; j++) {
        //                 if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
        //                 else var p_code = '';
        //                 if (contractdet[j]['bag'] != undefined) var bag= contractdet[j]['bag'];
        //                 else var bag = '';
        //                 if (contractdet[j]['pck'] != undefined) var pck= contractdet[j]['pck'];
        //                 else var pck = '';
        //                 if (contractdet[j]['wght'] != undefined) var wght= contractdet[j]['wght'];
        //                 else var wght = '';
        //                 if (contractdet[j]['sd_rate'] != undefined) var sd_rate= contractdet[j]['sd_rate'];
        //                 else var sd_rate = '';
        //                 if (contractdet[j]['amount'] != undefined) var amount= contractdet[j]['amount'];
        //                 else var amount = '';
        //                 if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
        //                 else var qty_exe = '';
        //                 if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
        //                 else var wght_bal = '';
        //                 var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
        //                 childarray.push(obj);    
        //         }
        //             html += '<tr>';
        //             html += '<td class="details-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
        //             html += '<td>' + sd_date + '</td>';
        //             html += '<td>' + contract[i]['vouc_code'] + '</td>';
        //             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['sb_code'] != null) html +='<td>'+contract[i]['sb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             if (contract[i]['bb_code'] != null) html +='<td>'+contract[i]['bb_code']['party_name'] + '</td>';
        //             else html += '<td>' +  '</td>';
        //             html += '</tr>';
        //             childarray = [];
        //         }
        //         html+='</tbody>';
        //         html+='<tfoot>';
        //         html+='<tr>';
        //         html+='<th class="excludesearch"></th>';
        //         html+='<th>Date</th>';
        //         html+='<th>Contract Nubmer</th>';
        //         html+='<th>Seller</th>';
        //         html+='<th>Seller Broker</th>';
        //         html+='<th>Buyer</th>';
        //         html+='<th>Buyer Broker</th>';
        //         html+='</tr>';
        //         html+='</tfoot>';
        //         html+='</table>';
        // }
            html+='</div>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
        fullfill(html);
    })
}
router.post('/deliverysaudadetail', ensureAuthenticated, function(req, res){
    var sl_code = req.body.sl_code;
    var sb_code = req.body.sb_code;
    var br_code = req.body.br_code;
    var bb_code = req.body.bb_code;
    var start_date= req.body.start_date;
    var end_date= req.body.end_date;
    var  sl_brok= req.body.sl_brok;
    // common.UpdatePenBalNew(req,"");
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
    var qry = "";
    if ((sl_code=="") &&  (sb_code=="") && (br_code=="") && (bb_code=="")) qry = {$and: [{main_bk:"DLV",sd_date:{$gte:strtdate}},{sd_date:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (br_code!="") qry = {$and: [{main_bk:"DLV",br_code:br_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (sl_code!="") qry = {$and: [{main_bk:"DLV",sl_code:sl_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (sb_code!="") qry = {$and: [{main_bk:"DLV",sb_code:sb_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (bb_code!="") qry = {$and: [{main_bk:"DLV",bb_code:bb_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    contract.find(qry,async function (err, contract) {   
             if (err) {
                    console.log(err);
                } else {
                    var html = await Createdeliverysaudadetails(contract,sl_brok,req);
                    res.json({ 'success': true, 'hhtml':html});
                }
            }).populate([{path: 'sauda2',
            populate:{ path: 'contract_sauda_group.p_code'}
            }]).populate([{path: 'sauda2',
            populate:{ path: 'contract_sauda_group.brand_code'}
            }]).populate([{path: 'sl_code',
            populate:{ path: 'city_name'}
            }]).populate([{path: 'br_code',
            populate:{ path: 'city_name',}
            }]).populate('sb_code').populate('bb_code')    

})
// router.post('/contractdetail', function(req, res) {
//     var sl_code = req.body.sl_code;
//     var sb_code = req.body.sb_code;
//     var br_code = req.body.br_code;
//     var bb_code = req.body.bb_code;
//     var start_date= req.body.start_date;
//     var end_date= req.body.end_date;
//     if (sl_code=="") sl_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
//     if (sb_code=="") sb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');   
//     if (br_code=="") br_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
//     if (bb_code=="") bb_code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
//     const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
//     const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
//     contract.find({$and: [{main_bk:"SD",sd_date:{$gte:strtdate}},{sd_date:{$lte:enddats}},{ $or: [{sl_code:sl_code},{sb_code:sb_code},{br_code:br_code},{bb_code:bb_code}]}],co_code:req.session.compid,div_code:req.session.divid}, function (err, contract) {   
//      if (err) {
//             console.log(err);
//         } else {
//             // common.UpdatePenBal(req);
//             res.json({ 'success': true, 'contract': contract,'product_mast': product_mast});
//         }
//     }).populate([{path: 'sauda2',
//     populate:{ path: 'contract_sauda_group.p_code'}
//     }]).populate('sl_code').populate('sb_code').populate('br_code').populate('bb_code')
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