const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let payment = require('../models/payment_entry_schema');
let party = require('../models/party_schema');
// Add Route
router.get('/payment_register', ensureAuthenticated ,function(req,res){
        party.find({masterid:req.session.masterid}, function (err, party){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render('payment_register.hbs',{
                pageTitle:'Payment register',
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
function CreateHTML(payment,sl_brok,req){
    return new Promise(function(fullfill){
        var html='<div class="showsearchdata">';
        html+='<div class="row">';
        html+='<div class="col-md-12">';
        html+='<div class="table-responsive">';
        // if(sl_brok=="sd_date")
        // {
            html+='<table class="table table-striped table-bordered table-hover adsearch">';
            html+='<thead>';
            html+='<tr>';
            html+='<th>Control</th>';
            html+='<th>Date</th>';
            html+='<th>Ref Number</th>';
            html+='<th>Buyer</th>';
            html+='<th>Seller</th>';
            html+='<th>Deposited</th>';
            html+='</tr>';
            html+='</thead>';
            html+='<tbody>';
            var childarray = [];
            for (let i = 0; i < payment.length; i++) {
                var outstading = payment[i]['outstadingid']['payment_sauda_group'];
                for (let j = 0; j < outstading.length; j++) {
                    var vouc_code = outstading[j]['vouc_code'];
                    var sd_date = outstading[j]['sd_date'];
                    var barg_amt = outstading[j]['barg_amt'];
                    var tot_ammount = outstading[j]['tot_ammount'];
                    var outs_rec = outstading[j]['outs_rec'];
                    var dtcton_amt = outstading[j]['dtcton_amt'];
                    var outs_bal = outstading[j]['outs_bal'];
                    var rmks = outstading[j]['rmks'];
                        var obj = {"vouc_code":vouc_code,"sd_date":sd_date,"barg_amt":barg_amt,"tot_ammount":tot_ammount,"outs_rec": outs_rec,"dtcton_amt": dtcton_amt,"outs_bal": outs_bal,"rmks": rmks};
                        childarray.push(obj);   
                }
                    html += '<tr>';
                    html += '<td class="payment-control" data-child="'+ encodeURI(JSON.stringify(childarray))+'"><i class="fa fa-plus-square handicon"></i> </td>';
                    const pay_date = moment(payment[i]['pay_date']).format('DD/MM/YYYY');
                    html += '<td>' + pay_date + '</td>';
                    html += '<td>' + payment[i]['vouc_code'] + '</td>';
                    console.log(payment[i]['br_code']['party_name']);
                    if (payment[i]['br_code'] != null) html +='<td>'+payment[i]['br_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    if (payment[i]['sl_code'] != null) html +='<td>'+payment[i]['sl_code']['party_name'] + '</td>';
                    else html += '<td>' +  '</td>';

                    if (payment[i]['dep_bnk'] != null) html +='<td>'+payment[i]['dep_bnk']['bank_name'] + '</td>';
                    else html += '<td>' +  '</td>';
                    html += '</tr>';
                    childarray = [];
            
                }
                html+='</tbody>';
                html+='<tfoot>';
                html+='<tr>';
                html+='<th class="excludesearch"></th>';
                html+='<th>Date</th>';
                html+='<th>Ref Number</th>';
                html+='<th>Buyer</th>';
                html+='<th>Seller</th>';
                html+='<th>Deposited</th>';
                html+='</tr>';
                html+='</tfoot>';
                html+='</table>';
        //}
            html+='</div>';
            html+='</div>';
            html+='</div>';
            html+='</div>';
        fullfill(html);
    })
}
router.post('/paymentdetail', ensureAuthenticated, function(req, res){
    var sl_code = req.body.sl_code;
    var brcode = req.body.brcode;
    var start_date= req.body.start_date;
    var end_date= req.body.end_date;
    var  sl_brok= req.body.sl_brok;
    const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('month').format('x');
    const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('month').format('x');
    var qry = "";
    if ((sl_code=="") &&  (brcode=="")) qry = {$and: [{main_bk:"PAY",paydatemilisecond:{$gte:strtdate}},{paydatemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (sl_code!="") qry = {$and: [{main_bk:"PAY",sl_code:sl_code,paydatemilisecond:{$gte:strtdate}},{paydatemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    if (brcode!="") qry = {$and: [{main_bk:"PAY",br_code:brcode,paydatemilisecond:{$gte:strtdate}},{paydatemilisecond:{$lte:enddats}}],co_code:req.session.compid,div_code:req.session.divid};
    //console.log(qry)
    payment.find(qry,async function (err, payment) {
             if (err) {
                    console.log(err);
                } else {
                    var html = await CreateHTML(payment,sl_brok,req);
                    res.json({ 'success': true, 'hhtml':html});
                }
            }).populate('outstadingid').populate('sl_code').populate('br_code').populate('dep_bnk')   

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