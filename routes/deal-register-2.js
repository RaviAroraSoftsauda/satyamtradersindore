const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let contract = require('../models/contract_sauda_schema');
let sauda2 = require('../models/contract_sauda2');
let product_mast = require('../models/product_mast_schema');
let party = require('../models/party_schema');
let db = mongoose.connection;
let common = require('./common');
// Add Route
router.get('/deal-register-2', ensureAuthenticated, function(req, res){
             party.find({masterid:req.session.masterid}, function (err, party){
            if (err) {
                console.log(err);
            } else {
                res.render('deal-register-2.hbs', {
                    pageTitle:'Deal Register-2',
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
function CreateHTML(contract,sl_brok,req){
    return new Promise(function(fullfill){
        var html='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="panel panel-primary table light " id="tableportlet">';
        html+='<div class="panel-heading">';
        html+='Contract List';
        html+='</div>';
        html+='<div class="panel-body" id="portletbody">';
        html+='<div class="table-responsive">';
        html+='<table id="product_detail_table" class="product_detail_table table table-condensed table table-striped table-bordered table-hover">';
        html+='<thead>';
        html+='<tr>';
        //html+='<th>Control</th>';
        html+='<th>Bhartiyo</th>';
        html+='<th>Bill No</th>';
        html+='<th>Del.Date</th>';
        html+='<th>Buyer Name</th>';
        html+='<th>Seller Name</th>';
        html+='<th>Place</th>';
        html+='<th>Product</th>';
        html+='<th>Pack(KG)</th>';
        html+='<th>Katta</th>';
        html+='<th>Net Wht</th>';
        html+='<th>Rate</th>';
        html+='<th>Bill. Amt</th>';
        html+='<th>P O Number</th>';
        html+='<th>Delivered</th>';
        html+='<th>Bill No</th>';
        html+='<th>Freight</th>';
        html+='<th>Lorry No</th>';
        html+='<th>Lorry Driver No.</th>';
        html+='<th>Payment No</th>';
        html+='<th>Recive Amount</th>';
        html+='<th>Discount</th>';
        html+='<th>Narration</th>';
        html+='</tr>';
        html+='</thead>';
        html+='<tbody>';
        for (let i = 0; i < contract.length; i++) {
            const sd_date = moment(contract[i]['sd_date']).format('DD/MM/YYYY');
            var contractdet = contract[i]['sauda2']['contract_sauda_group'];
            for (let j = 0; j < contractdet.length; j++) {
                if (contractdet[j]['p_code'] != null) var p_code= contractdet[j]['p_code']['product_name'];
                else var p_code = '';
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
                // if (contractdet[j]['qty_exe'] != undefined) var qty_exe= contractdet[j]['qty_exe'];
                // else var qty_exe = '';
                // if (contractdet[j]['wght_bal'] != undefined) var wght_bal= contractdet[j]['wght_bal'];
                // else var wght_bal = '';
                // var obj = {"product":p_code,"bag":bag,"pckt": pck,"wght": wght,"sd_rate": sd_rate,"amount": amount,"qty_exe": qty_exe,"wght_bal": wght_bal};
               //childarray.push(obj);   
       
            html += '<tr>';
            //html += '<td class="dealdetails-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
            html += '<td>' + contract[i]['vouc_code'] + '</td>';
            html += '<td>' +contract[i]['bno']+ '</td>';
            html += '<td>' +sd_date+ '</td>';
           
            if (contract[i]['br_code'] != null) html +='<td>'+contract[i]['br_code']['party_name'] + '</td>';
            else html += '<td>' +  '</td>';
            if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['party_name'] + '</td>';
            else html += '<td>' +  '</td>';
            // if (contract[i]['deal_subbrokers'] != null) html +='<td>'+contract[i]['deal_subbrokers']['party_name'] + '</td>';
            // else html += '<td>' +  '</td>';
             if (contract[i]['sl_code'] != null) html +='<td>'+contract[i]['sl_code']['city_name']['city_name'] + '</td>';
            else html += '<td>' +  '</td>';
            
             html +='<td>'+p_code + '</td>';
             html +='<td>'+pck + '</td>';
             html +='<td>'+bag + '</td>';
             html +='<td>'+wght + '</td>';
             html +='<td>'+sd_rate + '</td>';
             html += '<td>' + contract[i]['bill_amt'] + '</td>';
             html +='<td>'+ contract[i]['pono'] + '</td>';
            

            if (contract[i]['sauda2']['dealdlvrd_no'] != undefined) html+='<td><input type="text" name="dealdlvrd_no" id="dealdlvrdno'+i+'" value="'+contract[i]['sauda2']['dealdlvrd_no']+'" data-dealdlvrdsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealdlvrd_no"autocomplete="off"></td>';
            else html+='<td><input type="text" name="dealdlvrd_no" id="dealdlvrdno'+i+'" data-dealdlvrdsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealdlvrd_no"autocomplete="off"></td>';
            // if (contract[i]['sauda2']['dealdlvrd_no'] != undefined)html+='<td>'+contract[i]['sauda2']['dealdlvrd_no']+'</td>';
            // else html += '<td>' +  '</td>';
            if (contract[i]['sauda2']['dealbill_no'] != undefined) html+='<td><input type="text" name="dealbill_no" id="dealbillno'+i+'" value="'+contract[i]['sauda2']['dealbill_no']+'" data-dealbillnodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealbill_no"autocomplete="off"></td>';
            else html+='<td><input type="text" name="dealbill_no" id="dealbillno'+i+'" data-dealbillnodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealbill_no"autocomplete="off"></td>';
            // if (contract[i]['sauda2']['dealbill_no'] != undefined)html+='<td>'+contract[i]['sauda2']['dealbill_no']+'</td>';
            // else html += '<td>' +  '</td>';
            if (contract[i]['sauda2']['dealfright_no'] != undefined) html+='<td><input type="text" name="dealfright_no" id="dealfrightno'+i+'" value="'+contract[i]['sauda2']['dealfright_no']+'" data-dealfrightnodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealfright_no"autocomplete="off"></td>';
            else  html+='<td><input type="text" name="dealfright_no" id="dealfrightno'+i+'" data-dealfrightnodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealfright_no"autocomplete="off"></td>';
            // if (contract[i]['sauda2']['dealfright_no'] != undefined)html+='<td>'+contract[i]['sauda2']['dealfright_no']+'</td>';
            // else html += '<td>' +  '</td>';
            if (contract[i]['sauda2']['dealloory_no'] != undefined) html+='<td><input type="text" name="dealloory_no" id="deallooryno'+i+'" value="'+contract[i]['sauda2']['dealloory_no']+'" data-dealloorynodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealloory_no"autocomplete="off"></td>';
            else  html+='<td><input type="text" name="dealloory_no" id="deallooryno'+i+'"  data-dealloorynodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealloory_no"autocomplete="off"></td>';
            // if (contract[i]['sauda2']['dealloory_no'] != undefined)html+='<td>'+contract[i]['sauda2']['dealloory_no']+'</td>';
            // else html += '<td>' +  '</td>';
            if (contract[i]['sauda2']['deallorydrive_no'] != undefined) html+='<td><input type="text" name="deallorydrive_no" id="deallorydriveno'+i+'" value="'+contract[i]['sauda2']['deallorydrive_no']+'" data-deallorydrivenodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control deallorydrive_no"autocomplete="off"></td>';
            else  html+='<td><input type="text" name="deallorydrive_no" id="deallorydriveno'+i+'"  data-deallorydrivenodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control deallorydrive_no"autocomplete="off"></td>';
            // if (contract[i]['sauda2']['deallorydrive_no'] != undefined)html+='<td>'+contract[i]['sauda2']['deallorydrive_no']+'</td>';
            // else html += '<td>' +  '</td>';
            if (contract[i]['sauda2']['payment_no'] != undefined) html+='<td><input type="text" name="payment_no" id="paymentno'+i+'" value="'+contract[i]['sauda2']['payment_no']+'" data-paymentnodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control payment_no"autocomplete="off"></td>';
            else html+='<td><input type="text" name="payment_no" id="paymentno'+i+'" data-paymentnodsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control payment_no"autocomplete="off"></td>';
            // if (contract[i]['sauda2']['payment_no'] != undefined)html+='<td>'+contract[i]['sauda2']['payment_no']+'</td>';
            // else html += '<td>' +  '</td>';
          
            // if (contract[i]['sauda2']['pament_amt'] != undefined)html+='<td>'+contract[i]['sauda2']['pament_amt']+'</td>';
            // else html += '<td>' +  '</td>';
            if (contract[i]['sauda2']['pament_amt'] != undefined) html+='<td><input type="text" name="pament_amt" id="pamentamt'+j+'" value="'+contract[i]['sauda2']['pament_amt']+'" data-pamentamtdsrno="'+j+'" data-id="'+contract[i]['sauda2']['_id']+'" data-amt="'+contract[i]['bill_amt']+'" class="form-control pament_amt"autocomplete="off"></td>';
            else html+='<td><input type="text" name="pament_amt" id="pamentamt'+j+'" data-pamentamtdsrno="'+j+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control pament_amt"autocomplete="off"></td>';
            //var recvamt = contract[i]['sauda2']['dealrecv_amt']
            var dealrecv_amt =  (Number(contract[i]['bill_amt'])-Number(contract[i]['sauda2']['pament_amt']))  
            if (contract[i]['sauda2']['dealrecv_amt'] != undefined) html+='<td><input type="text" name="dealrecv_amt" id="dealrecvamt'+j+'" value="'+dealrecv_amt+'" data-dealrecvamt="'+j+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealrecv_amt"autocomplete="off"></td>';
            else html+='<td><input type="text" name="dealrecv_amt" id="dealrecvamt'+j+'" data-dealrecvamt="'+j+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control dealrecv_amt"autocomplete="off"></td>';

            if (contract[i]['sauda2']['payment_narrtion'] != undefined) html+='<td><input type="text" name="payment_narrtion" id="paymentnarrtion'+i+'" value="'+contract[i]['sauda2']['payment_narrtion']+'" data-paymentnarrtionsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control payment_narrtion"autocomplete="off"></td>';
            else html+='<td><input type="text" name="payment_narrtion" id="paymentnarrtion'+i+'" data-paymentnarrtionsrno="'+i+'" data-id="'+contract[i]['sauda2']['_id']+'" class="form-control payment_narrtion"autocomplete="off"></td>';
            // if (contract[i]['sauda2']['payment_narrtion'] != undefined)html+='<td>'+contract[i]['sauda2']['payment_narrtion']+'</td>';
            // else html += '<td>' +  '</td>';
            html += '</tr>';
            //childarray = [];
        }
        }
               html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th>Bhartiyo</th>';
                html+='<th>Bill No</th>';
                html+='<th>Del.Date</th>';
                html+='<th>Buyer Name</th>';
                html+='<th>Seller Name</th>';
                html+='<th>Place</th>';
                html+='<th>Product</th>';
                html+='<th>Pack(KG)</th>';
                html+='<th>Katta</th>';
                html+='<th>Net Wht</th>';
                html+='<th>Rate</th>';
                html+='<th>Bill. Amt</th>';
                html+='<th>P O Number</th>';
                html+='<th>Delivered</th>';
                html+='<th>Bill No</th>';
                html+='<th>Freight</th>';
                html+='<th>Lorry No</th>';
                html+='<th>Lorry Driver No.</th>';
                html+='<th>Payment No</th>';
                html+='<th>Recive Amount</th>';
                html+='<th>Discount</th>';
                html+='<th>Narration</th>';
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
            html+='</div>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
        fullfill(html);
    })
}
router.post('/contractdetail', ensureAuthenticated, function(req, res){
        var sl_code = req.body.sl_code;
        var sb_code = req.body.sb_code;
        var br_code = req.body.br_code;
        var bb_code = req.body.bb_code;
        var start_date= req.body.start_date;
        var end_date= req.body.end_date;
        var  sl_brok= req.body.sl_brok;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');
        var qry = "";
        //console.log(sl_code);
        if ((sl_code=="") &&  (sb_code=="") && (br_code=="") && (bb_code=="")) qry = {$and: [{main_bk:"DE",sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
        if (br_code!="") qry = {$and: [{main_bk:"DE",br_code:br_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
        if (sl_code!="") qry = {$and: [{main_bk:"DE",sl_code:sl_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
        if (sb_code!="") qry = {$and: [{main_bk:"DE",sb_code:sb_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
        if (bb_code!="") qry = {$and: [{main_bk:"DE",bb_code:bb_code,sd_datemilisecond:{$gte:strtdate}},{sd_datemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
        console.log(qry);
        contract.find(qry,async function (err, contract) {   
                 if (err) {
                        console.log(err);
                    } else {
                        var html = await CreateHTML(contract,sl_brok,req);
                        res.json({ 'success': true, 'hhtml':html});
                    }
                }).populate([{path: 'sauda2',
                populate:{ path: 'contract_sauda_group.p_code'}
                }]).populate([{path: 'sl_code',
                populate:{ path: 'city_name'}
                }]).populate([{path: 'br_code',
                populate:{ path: 'city_name',}
                }])

})
router.post('/dealdlvrd_no/:id', function(req, res) {
    var dealdlvrdno = req.body.dealdlvrdno;
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let contractsauda = {};     
        contractsauda.dealdlvrd_no =dealdlvrdno;
        let query = {_id:req.params.id}
        sauda2.update(query ,contractsauda ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving manufctur', 'errors': err });
                return;
            } else {
                res.json({ 'success': true });
            }
        });
    }
});
router.post('/dealbill_no/:id', function(req, res) {
    var dealbillno = req.body.dealbillno;
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let contractsauda = {};     
        contractsauda.dealbill_no =dealbillno;
        let query = {_id:req.params.id}
        sauda2.update(query ,contractsauda ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving manufctur', 'errors': err });
                return;
            } else {
                res.json({ 'success': true });
            }
        });
    }
});
router.post('/dealfright_no/:id', function(req, res) {
    var dealfrightno = req.body.dealfrightno;
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let contractsauda = {};     
        contractsauda.dealfright_no =dealfrightno;
        let query = {_id:req.params.id}
        sauda2.update(query ,contractsauda ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving manufctur', 'errors': err });
                return;
            } else {
                res.json({ 'success': true });
            }
        });
    }
});
router.post('/dealloory_no/:id', function(req, res) {
    var deallooryno = req.body.deallooryno;
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let contractsauda = {};     
        contractsauda.dealloory_no =deallooryno;
        let query = {_id:req.params.id}
        sauda2.update(query ,contractsauda ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving manufctur', 'errors': err });
                return;
            } else {
                res.json({ 'success': true });
            }
        });
    }
});
router.post('/deallorydrive_no/:id', function(req, res) {
    var deallorydriveno = req.body.deallorydriveno;
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let contractsauda = {};     
        contractsauda.deallorydrive_no =deallorydriveno;
        let query = {_id:req.params.id}
        sauda2.update(query ,contractsauda ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving manufctur', 'errors': err });
                return;
            } else {
                res.json({ 'success': true });
            }
        });
    }
});
router.post('/pament_amt/:id', function(req, res) {
    var pamentamt = req.body.pamentamt;
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let contractsauda = {};     
        contractsauda.pament_amt =pamentamt;
        let query = {_id:req.params.id}
        sauda2.update(query ,contractsauda ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving manufctur', 'errors': err });
                return;
            } else {
                res.json({ 'success': true });
            }
        });
    }
});
router.post('/payment_no/:id', function(req, res) {
    var paymentno = req.body.paymentno;
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let contractsauda = {};     
        contractsauda.payment_no =paymentno;
        let query = {_id:req.params.id}
        sauda2.update(query ,contractsauda ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving manufctur', 'errors': err });
                return;
            } else {
                res.json({ 'success': true });
            }
        });
    }
});
router.post('/payment_narrtion/:id', function(req, res) {
    var paymentnarrtion = req.body.paymentnarrtion;
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let contractsauda = {};     
        contractsauda.payment_narrtion =paymentnarrtion;
        let query = {_id:req.params.id}
        sauda2.update(query ,contractsauda ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving manufctur', 'errors': err });
                return;
            } else {
                res.json({ 'success': true });
            }
        });
    }
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