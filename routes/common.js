let outstandings = require('../models/outstading_schema');
let delveryentry2 = require('../models/salesorder_schema');
const mongoose = require('mongoose');
let db = mongoose.connection;
const https = require('https');

module.exports.sendNotification = function sendNotification(data) { // Async function statment
    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      //"Authorization": "Basic OTk2N2VkZmEtMDY0NS00MDAwLWE0MzItOWFlZTliZmUzN2Uz" //millerkey
    //   "Authorization": "Basic MWNiM2JiYmYtMjU1Ny00OGJkLWE2MDktNmUzMGVlYzlmNjk3"       
      "Authorization": "Basic ZmUyNjUyOWUtNjZiMS00NzEwLTk5OGItYjc1MmEyNmJiYTZj"       
    };    
    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };
    var req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
      });
    });
    

    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  };


function findQtyexe(item,index,sd2id,req){
    return new Promise(function(fullfill){
        var wghtexe=  0;                              
        var qtyexe=  0;
        console.log("sd2id" + sd2id+" itid " + item.sales_or_group[index].so_disc +  " idx" + index);
//,{"sales_or_group.so_disc":item._id}
        var cursum = db.collection('salesorders').aggregate([{$unwind:"$sales_or_group"},{$match : {$and:[{main_bk:"outward"},{"sales_or_group.sd2srno":sd2id.toString()}]}},{$group: { _id : {"vcd" : "$sales_or_group.sd2srno"}, "totqty": {"$sum": "$sales_or_group.so_qty"}}}]);
        cursum.each(function(err, itemsum) {
    
            console.log(itemsum+" ravi ");
            
            if (itemsum != null) {
                qtyexe =itemsum.totqty;
             }
            if (item != null) {
                if (item.sales_or_group!=null && item.sales_or_group[index]['so_qty']!=null)
                {  
                    var obj = {};
                    obj["sales_or_group."+index+".qty_exe"] = qtyexe;
                    obj["sales_or_group."+index+".qty_bal"] = item.sales_or_group[index]['so_qty'] -qtyexe;
                    console.log(obj)
                }
                fullfill(obj);
            }
        });   
    })
}
module.exports.UpdatePenBalOut = function UpdatePenBalOut(req,pcd) { // Async function statment
    var qry = {main_bk:"salesorder",co_code:req.session.compid,div_code:req.session.divid};
    // if (pcd != "") qry = {vouc_code:pcd,main_bk:"salesorder",co_code:req.session.compid,div_code:req.session.divid};
    if (pcd != "") qry = {buy_cus_name:pcd,main_bk:"salesorder",co_code:req.session.compid,div_code:req.session.divid};
    delveryentry2.find(qry, async function (err, delveryentry2){
        for(j = 0; j < delveryentry2.length; j++) {
            console.log('j'+j);
            var item = delveryentry2[j]
            if (item != null) {
                if (item.sales_or_group!=null)
                {  
                   for (let index = 0; index < item.sales_or_group.length; index++)
                   {
                        var obj = await findQtyexe(item,index,item.sales_or_group[index]._id,req);   
                        if ( obj!=null) db.collection('salesorders').update({"_id":item._id},{"$set": obj});
                   }
                }
            }
        }
    })   
}
function findBalanceexe(item,req){
    return new Promise(function(fullfill){
        var totexp=  0;                              
        var totamt=  0;
        var cursum = db.collection('outstadings').aggregate([{$unwind:"$payment_sauda_group"},{$match : {$and:[{main_bk:"PAY"},{"payment_sauda_group.outsid":item._id}]}},{$group: { _id : {"vcd" : "$payment_sauda_group.vouc_code"}, "totamt": {"$sum": "$payment_sauda_group.outs_rec"}, "totexp": {"$sum": "$payment_sauda_group.dtcton_amt"}}}]);
        cursum.each(function(err, itemsum) {
            if (itemsum != null) {
                totamt =itemsum.totamt;
                totexp =itemsum.totexp;
            }
            if (item != null) {
                if (item.payment_sauda_group!=null )
                {  
                    var obj = {};
                    obj["totamt_rec"] = totamt;
                    obj["totexp_rec"] =totexp; 
                    obj["totamt_bal"] = item['tot_ammount'] -totamt-totexp;
                }
                fullfill(obj);
            }
        });   
    })
}


module.exports.UpdatePayment = function UpdatePayment(req,pcd) { // Async function statment
    var qry = {main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid};
    if (pcd != "") qry = {br_code:pcd,main_bk:"DLV",co_code:req.session.compid,div_code:req.session.divid};
    outstandings.find(qry, async function (err, outstandings){
        // console.log('r'+outstandings);
        for(j = 0; j < outstandings.length; j++) {
            var item = outstandings[j]
            if (item != null) {
                var obj = await findBalanceexe(item,req);   
                // console.log(obj);
                if ( obj!=null) db.collection('outstadings').update({"_id":item._id},{"$set": obj});
            }
        }    
    })   
}



// module.exports.UpdatePenBal = async function UpdatePenBal(req) { // Async function statment
//     var cursorsd = db.collection('salesorders').find({main_bk:"SD",typ:"BR",co_code:req.session.compid,div_code:req.session.divid}); 
//     cursorsd.each(function(err, item) {
//         if (item != null) {
//           if (item.sales_or_group!=null)
//           {  
//             for (let index = 0; index < item.sales_or_group.length; index++)
//             {
//                 global.qtyexe =0;
//                 global.wghtexe =0;
//                  new Promise(function (fulfill,reject){
//                     fulfill();
//                 }).then( function () {
//                     var cursum = db.collection('salesorders').aggregate([{$unwind:"$sales_or_group"},{$match : {$and:[{main_bk:"DLV"},{typ:"BR"},{"sales_or_group.sd2id":item._id},{"sales_or_group.sd2srno":index+1}]}},{$group: { _id : {"vcd" : "$sales_or_group.sd2srno"}, "totqty": {"$sum": "$sales_or_group.bag"}, "totwght": {"$sum": "$sales_or_group.wght"}}}]);
//                     cursum.each(function(err, itemsum) {
//                          if (itemsum != null) {
//                             global.qtyexe =itemsum.totqty;
//                             global.wghtexe =itemsum.totwght;
//                         }
//                         var obj = {};
//                         obj["sales_or_group."+index+".qty_exe"] = global.qtyexe;
//                         obj["sales_or_group."+index+".wght_exe"] =global.wghtexe; 
//                         obj["sales_or_group."+index+".qty_bal"] = item.sales_or_group[index]['bag'] -global.qtyexe;
//                         obj["sales_or_group."+index+".wght_bal"] = parseFloat( item.sales_or_group[index]['wght']) -global.wghtexe;
//                         db.collection('salesorders').update({"_id":item._id},{"$set": obj});
//                     });                    
                    
//                 });
//             }
//            } 
//         };

//     });
//   }