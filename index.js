const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const hbs = require('hbs');
const moment = require('moment');
const div_com = require('./models/companySchema');
let userright = require('./models/user_rightSchema');
// const div_com = require('./models/company_schema');
// let userright = require('./models/user_right_schema');
var url = "mongodb+srv://satyam_mongo:C00lwater1@cluster0.mnlwe.mongodb.net/satyamstock?retryWrites=true&w=majority";
// var url = "mongodb://localhost:27017/APMC";
// var urlt = "mongodb://localhost:27017/t";////RAMBHIA@123
var onlineurl = "mongodb://ravisoftsolution:ravi123@ds243212.mlab.com:43212/suda";
var pladd = 0;

/* You might want to check first if the file exists and stuff but this is an example. */
const fs = require('fs')
module.exports = function (filePath) {
    let data = fs.readFileSync(filePath).toString() /* open the file as string */
    let object = JSON.parse(data) /* parse the string to object */
    return JSON.stringify(object, false, 3) /* use 3 spaces of indentation */
}

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGOLAB_URI || url);
let db = mongoose.connection;
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// const PORT = process.env.PORT || 3000;
// mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://ravisoftsolution:ravi123@ds243212.mlab.com:43212/suda');
// let db = mongoose.connection;
// db.once('open', function () {
//     console.log('Connected to MongoDB');
// });

// Check for DB errors
db.on('error', function (err) {
    console.log(err);
});

var app = express();

// app.use()

hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

app.use('*/front/css', express.static('public/front/css'));
app.use('*/front/js', express.static('public/front/js'));
app.use('*/front/images', express.static('public/front/images'));
app.use('*/front/fonts', express.static('public/front/fonts'));


app.use('*/css', express.static('public/css'));
app.use('*/js', express.static('public/js'));
app.use('*/images', express.static('public/images'));
app.use('*/fonts', express.static('public/fonts'));
app.use('*/uploads', express.static('public/uploads'));
app.use('*/logo', express.static('public/logo'));
app.use('*/img', express.static('public/img'));
app.use(express.static(path.join(__dirname, 'pdf')));

let outEntry = require('./models/outstading_schema');
hbs.registerHelper('OutEntryInCashBankPrint', function (CashBankId, outEntryCB) {
    // outEntry.find({CashBank_id:CashBankId,del:'N',CNCL:'N'},function(err,out){;
    var out = JSON.parse(outEntryCB);
    // console.log(out)
    var ret = "";
    if (out != null) {
        ret += '<table class="tableOutEntry" style="float:right">';
        ret += '<thead>';
        ret += '<tr>';
        ret += '<th style="">Bill Date</th>';
        ret += '<th style="">Adj. Bill No</th>';
        ret += '<th style="text-align:right">Amount</th>';
        // ret += '<th align="right" style="width: 100px">Deduction</th>';
        ret += '</tr>';
        ret += '</thead>';
        ret += '<tbody>';
        var count = 0;
        for (var i = 0; i < out.length; i++) {
            ret += '<tr>';
            ret += '<td align="center">';
            ret += '' + out[i].Bill_Date + '';
            ret += '</td>';
            ret += '<td align="center">';
            ret += '' + out[i].main_bk + '/' + out[i].c_j_s_p + '/' + out[i].vouc_code + '';
            ret += '</td>';
            ret += '<td align="right">';
            var lessAmt = out[i].Less_Ded_Amt_Tot;
            if (lessAmt == null || lessAmt == '' || lessAmt == undefined) lessAmt = 0;
            var recAmt = parseFloat(out[i].ReceiveAmt) + parseFloat(lessAmt)
            ret += '' + recAmt + '';
            ret += '</td>';
            // ret += '<td align="right">';
            // ret += '0.00';
            // ret += '</td>';
            ret += '</tr>'; 
            count = count + 1;
        }
        ret += '</tbody>';
        ret += '</table>';
    }
    return ret;
    // });/
});

let addlessMast = require('./models/Add_Less_Parameter_Master_Schema');
hbs.registerHelper('ShowAddLessInCashBank', function (context, lvalue, div, index, chaqReturn) {
    var ret = "";
    var index = parseInt(index) + 1;
    var divid = div;
    for (var i = 0; i < context.length; i++) {
        if (context[i].Deduction_Par == 'Y') {
            for (var k = 0; k < context[i].Division.length; k++) {
                if (context[i].Division[k] == divid) {
                    ret += '<td>';
                    ret += '<input type="hidden" value="' + i + '" name="YDed_Par_len" id="YDed_Par_len' + index + '">';
                    ret += '<input type="text"   name="YDed_Par_value"';
                    for (var j = 0; j < lvalue.length; j++) {
                        if (JSON.stringify(context[i]._id) == JSON.stringify(lvalue[j].YDed_Par_dsc_id)) {
                            // console.log(context[i]._id,lvalue[j].YDed_Par_dsc_id,lvalue[j].YDed_Par_value);
                            ret += 'value="' + lvalue[j].YDed_Par_value + '"';
                            if (chaqReturn == 'Y') ret += 'style="background-color:#ff6666"';
                            break;
                        }
                    }
                    ret += 'id="YDed_Par_value' + index + '' + i + '"  oninput="calcashbank(' + index + ')"';
                    ret += 'class="form-control "style="text-align: -webkit-right;"';
                    ret += '>';
                    ret += '<input type="hidden" value="' + context[i].Description + '" name="YDed_Par_dsc" id="YDed_Par_dsc' + index + '' + i + '">'
                    ret += '<input type="hidden" value="' + context[i]._id + '" name="YDed_Par_dsc_id" id="YDed_Par_dsc_id' + index + '' + i + '">'
                    ret += '<input type="hidden" value="' + context[i].Parameter_Type + '" name="YDed_Par_typ" id="YDed_Par_typ' + index + '' + i + '">'
                    ret += '</td>';

                }
            }
          //  ro oirom WIP_DeptEntryro \
           // fs.appendFileSyncsw
            //rddg
        }
    }
    return ret + "";
});
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear()
});
hbs.registerHelper('DataStrigify', function (val) {
    return JSON.stringify(val)
});
hbs.registerHelper('equal', function (lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

hbs.registerHelper('dateformat', function (datetime, format) {
    // console.log('vi',datetime,format)
    return moment(datetime).tz("Asia/Kolkata").format(format);
});

hbs.registerHelper('findcityid', function (context, i_d) {
    context.findById(i_d, function (err, city) {
        if (err) {
            console.log(err);
        } else {
            return city.city_name;
        }
    });
});

hbs.registerHelper('ifCond', function (v1, v2, options) {
    if (v1 == v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs.registerHelper('ifCond_id', function (v1, v2, options) {
    // console.log(v1,v2)
    if (JSON.stringify(v1) == JSON.stringify(v2)) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs.registerHelper('ifLessThen', function (v1, v2, options) {
    var v2 = parseInt(v2) - 1
    if (v1 < v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs.registerHelper('ifLessThenForSaleBill', function (v1, options) {
    if (v1 < 12) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs.registerHelper('ifLessThenEqualTo', function (v1, v2, options) {
    // console.log(v1,v2)ifLessThenEqualTo
    if (v1 == (v2 - 1)) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs.registerHelper('ifCondcheck', function (v1, v2) {
    if (v1 == v2) {
        return true;
    }
    return false;
});
hbs.registerHelper('ifCondNot', function (v1, v2, options) {
    // if(v1.toString().trim() == v2.toString().trim()) {       
    if (v1 != v2) {
        return options.fn(this);

    }
    return options.inverse(this);
});
hbs.registerHelper('ifGreter', function (v1, v2, options) {
    // if(v1.toString().trim() == v2.toString().trim()) {       
    if (v1 > v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});
hbs.registerHelper('toFixed2', function (context) {
    var lstcode = context;
    if (isNaN(context) == false) {
        // console.log(context)
        lstcode = parseFloat(context).toFixed(2);
    }
    if (isNaN(lstcode)) lstcode = '';
    return lstcode;
});
hbs.registerHelper('TotAmtInSaleBillPrePrint', function (ItemAmt, apmcAmt, totAmt, LessArr, addless, length) {
    var apmcAmt = apmcAmt;
    var totAmt = totAmt;
    var LessArr = LessArr;
    var addless = addless;
    var Itemlength = length.length;
    var ItemAmt = ItemAmt;
    var discTotAmt = 0;
    if (ItemAmt == '' || ItemAmt == null || ItemAmt == undefined || isNaN(ItemAmt)) ItemAmt = 0;
    if (apmcAmt == '' || apmcAmt == null || apmcAmt == undefined || isNaN(apmcAmt)) apmcAmt = 0;
    if (totAmt == '' || totAmt == null || totAmt == undefined || isNaN(totAmt)) totAmt = 0;
    var count = 0;
    for (let i = 0; i < LessArr.length; i++) {
        for (let j = 0; j < addless.length; j++) {
            if (JSON.stringify(LessArr[i].particular_less) == JSON.stringify(addless[j]._id)) {
                if (addless[j].Description == 'Discount') {
                    discTotAmt = LessArr[i].particular_amtless;
                    count = count + 1;
                    break;
                }
            }
        }
        if (count > 0) break;
    }
    if (discTotAmt == '' || discTotAmt == null || discTotAmt == undefined || isNaN(discTotAmt)) discTotAmt = 0;
    var DiscPer = (discTotAmt / totAmt) * 100;
    // var DiscPerItem = DiscPer/Itemlength;
    var DiscPerItem = DiscPer;
    var DiscAmtPerItem = (ItemAmt * DiscPerItem) / 100;
    var PlusMinusAmt = parseFloat(apmcAmt) - parseFloat(DiscAmtPerItem)
    var NetAmt = parseFloat(ItemAmt) + parseFloat(PlusMinusAmt);
    return NetAmt.toFixed(2)
});
hbs.registerHelper('CalPlusMinusAmt', function (ItemAmt, apmcAmt, totAmt, LessArr, addless, length) {
    var apmcAmt = apmcAmt;
    var totAmt = totAmt;
    var LessArr = LessArr;
    var addless = addless;
    var Itemlength = length.length;
    var ItemAmt = ItemAmt;
    var discTotAmt = 0;
    var html = 0;
    if (ItemAmt == '' || ItemAmt == null || ItemAmt == undefined || isNaN(ItemAmt)) ItemAmt = 0;
    if (apmcAmt == '' || apmcAmt == null || apmcAmt == undefined || isNaN(apmcAmt)) apmcAmt = 0;
    if (totAmt == '' || totAmt == null || totAmt == undefined || isNaN(totAmt)) totAmt = 0;
    var count = 0;
    for (let i = 0; i < LessArr.length; i++) {
        for (let j = 0; j < addless.length; j++) {
            if (JSON.stringify(LessArr[i].particular_less) == JSON.stringify(addless[j]._id)) {
                if (addless[j].Description == 'Discount') {
                    discTotAmt = LessArr[i].particular_amtless;
                    count = count + 1;
                    break;
                }
            }
        }
        if (count > 0) break;
    }
    if (discTotAmt == '' || discTotAmt == null || discTotAmt == undefined || isNaN(discTotAmt)) discTotAmt = 0;
    // console.log('discTotAmt',discTotAmt,apmcAmt,totAmt,Itemlength,ItemAmt)
    var DiscPer = (discTotAmt / totAmt) * 100;
    // console.log('DiscPer',DiscPer)
    // var DiscPerItem = DiscPer/Itemlength;
    var DiscPerItem = DiscPer;
    var DiscAmtPerItem = (ItemAmt * DiscPerItem) / 100;
    var PlusMinusAmt = parseFloat(apmcAmt) - parseFloat(DiscAmtPerItem)
    return PlusMinusAmt.toFixed(2);
});
hbs.registerHelper('CalGstAmtInSaleBillPrePrint', function (gstRate, ItemAmt, addArr, addless, apmcAmt, totAmt, LessArr, length) {
    var gstRate = gstRate;
    var addArr = addArr;
    var addless = addless;
    var ItemAmt = ItemAmt;
    var apmcAmt = apmcAmt;
    var totAmt = totAmt;
    var LessArr = LessArr;
    var Itemlength = length.length;
    var discTotAmt = 0;
    var check = ''
    if (gstRate == '' || gstRate == null || gstRate == undefined || isNaN(gstRate)) gstRate = 0;
    if (ItemAmt == '' || ItemAmt == null || ItemAmt == undefined || isNaN(ItemAmt)) ItemAmt = 0;
    if (apmcAmt == '' || apmcAmt == null || apmcAmt == undefined || isNaN(apmcAmt)) apmcAmt = 0;
    if (totAmt == '' || totAmt == null || totAmt == undefined || isNaN(totAmt)) totAmt = 0;
    var count = 0;
    for (let i = 0; i < addArr.length; i++) {
        for (let j = 0; j < addless.length; j++) {
            if (JSON.stringify(addArr[i].particular_add) == JSON.stringify(addless[j]._id)) {
                if (addless[j].Description == 'IGST') {
                    if (addArr[i].particular_amount == '' || addArr[i].particular_amount == null || addArr[i].particular_amount == 0 || isNaN(addArr[i].particular_amount)) {
                    } else {
                        check = 'IGST';
                        count = count + 1;
                        break;
                    }
                }
                if (addless[j].Description == 'SGST') {
                    if (addArr[i].particular_amount == '' || addArr[i].particular_amount == null || addArr[i].particular_amount == 0 || isNaN(addArr[i].particular_amount)) {
                    } else {
                        check = 'SGST';
                        count = count + 1;
                        break;
                    }
                }
            }
        }
        if (count > 0) break;
    }
    var count2 = 0;
    for (let i = 0; i < LessArr.length; i++) {
        for (let j = 0; j < addless.length; j++) {
            if (JSON.stringify(LessArr[i].particular_less) == JSON.stringify(addless[j]._id)) {
                if (addless[j].Description == 'Discount') {
                    discTotAmt = LessArr[i].particular_amtless;
                    count2 = count2 + 1;
                    break;
                }
            }
        }
        if (count2 > 0) break;
    }
    if (discTotAmt == '' || discTotAmt == null || discTotAmt == undefined || isNaN(discTotAmt)) discTotAmt = 0;
    // console.log('discTotAmt',discTotAmt,apmcAmt,totAmt,Itemlength)
    var DiscPer = (discTotAmt / totAmt) * 100;
    // var DiscPerItem = DiscPer/Itemlength;
    var DiscPerItem = DiscPer;
    var DiscAmtPerItem = (ItemAmt * DiscPerItem) / 100;
    var PlusMinusAmt = parseFloat(apmcAmt) - parseFloat(DiscAmtPerItem);
    var GstAmtPerItem = (parseFloat(ItemAmt) + parseFloat(PlusMinusAmt)) * gstRate / 100;
    var html = '';
    if (check == 'IGST') {
        html += '' + GstAmtPerItem.toFixed(2) + '</br>';
    }
    if (check == 'SGST') {
        html += '' + (parseFloat(GstAmtPerItem) / 2).toFixed(2) + '</br>' + (parseFloat(GstAmtPerItem) / 2).toFixed(2) + '';
    }
    return html;
});
hbs.registerHelper('CalGstRateSaleBillPrePrint', function (context, gstPer, addless) {
    var rate = context;
    var gst = gstPer;
    var addless = addless;
    var check = ''
    if (rate == '' || rate == null || rate == undefined || isNaN(rate)) rate = 0;
    for (let i = 0; i < gst.length; i++) {
        for (let j = 0; j < addless.length; j++) {
            if (JSON.stringify(gst[i].particular_add) == JSON.stringify(addless[j]._id)) {
                if (addless[j].Description == 'IGST') {
                    if (gst[i].particular_amount == '' || gst[i].particular_amount == null || gst[i].particular_amount == 0 || isNaN(gst[i].particular_amount)) {
                    } else {
                        check = 'IGST';
                        break;
                    }
                }
                if (addless[j].Description == 'SGST') {
                    if (gst[i].particular_amount == '' || gst[i].particular_amount == null || gst[i].particular_amount == 0 || isNaN(gst[i].particular_amount)) {
                    } else {
                        check = 'SGST';
                        break;
                    }
                }
            }
        }
    }
    var html = '';
    if (check == 'IGST') {
        html += '<a style="font-size: 10px;color: black">IGST ' + rate + '</a></br>';
    }
    if (check == 'SGST') {
        html += '<a style="font-size: 10px;color: black">SGST ' + (parseFloat(rate) / 2).toFixed(1) + '</br>CGST-' + (parseFloat(rate) / 2).toFixed(1) + '</a>';
    }
    // console.log('check',check)
    return html;
});
hbs.registerHelper('tot_AmountWithAPMCInSaleBillPrint', function (totAmt, LessArr, addless, length) {
    var totAmt = totAmt;
    var LessArr = LessArr;
    var addless = addless;
    var Itemlength = length.length;
    var ItemArr = length;
    var discTotAmt = 0;
    var totNetAmt = 0;
    var count = 0;
    for (let i = 0; i < LessArr.length; i++) {
        for (let j = 0; j < addless.length; j++) {
            if (JSON.stringify(LessArr[i].particular_less) == JSON.stringify(addless[j]._id)) {
                if (addless[j].Description == 'Discount') {
                    discTotAmt = LessArr[i].particular_amtless;
                    count = count + 1;
                    break;
                }
            }
        }
        if (count > 0) break;
    }
    if (discTotAmt == '' || discTotAmt == null || discTotAmt == undefined || isNaN(discTotAmt)) discTotAmt = 0;
    var DiscPer = (discTotAmt / totAmt) * 100;
    // var DiscPerItem = DiscPer/Itemlength;
    var DiscPerItem = DiscPer;

    for (let i = 0; i < ItemArr.length; i++) {
        if (ItemArr[i].amount == '' || ItemArr[i].amount == null || ItemArr[i].amount == undefined || isNaN(ItemArr[i].amount)) ItemArr[i].amount = 0;
        if (ItemArr[i].apmc_Amount == '' || ItemArr[i].apmc_Amount == null || ItemArr[i].apmc_Amount == undefined || isNaN(ItemArr[i].apmc_Amount)) ItemArr[i].apmc_Amount = 0;
        var DiscAmtPerItem = (ItemArr[i].amount * DiscPerItem) / 100;
        var PlusMinusAmt = parseFloat(ItemArr[i].apmc_Amount) - parseFloat(DiscAmtPerItem);
        totNetAmt = totNetAmt + parseFloat(ItemArr[i].amount) + parseFloat(PlusMinusAmt);
    }
    return totNetAmt.toFixed(2)
});
hbs.registerHelper('CalTotPlusMinusAmtInSaleBillPrint', function (totAmt, LessArr, addless, length) {
    var totAmt = totAmt;
    var LessArr = LessArr;
    var addless = addless;
    var Itemlength = length.length;
    var ItemArr = length;
    var discTotAmt = 0;
    var totPlusMinusAmt = 0;
    var count = 0;
    for (let i = 0; i < LessArr.length; i++) {
        for (let j = 0; j < addless.length; j++) {
            if (JSON.stringify(LessArr[i].particular_less) == JSON.stringify(addless[j]._id)) {
                if (addless[j].Description == 'Discount') {
                    discTotAmt = LessArr[i].particular_amtless;
                    count = count + 1;
                    break;
                }
            }
        }
        if (count > 0) break;
    }
    if (discTotAmt == '' || discTotAmt == null || discTotAmt == undefined || isNaN(discTotAmt)) discTotAmt = 0;
    var DiscPer = (discTotAmt / totAmt) * 100;
    // var DiscPerItem = DiscPer/Itemlength;
    var DiscPerItem = DiscPer;

    for (let i = 0; i < ItemArr.length; i++) {
        if (ItemArr[i].amount == '' || ItemArr[i].amount == null || ItemArr[i].amount == undefined || isNaN(ItemArr[i].amount)) ItemArr[i].amount = 0;
        if (ItemArr[i].apmc_Amount == '' || ItemArr[i].apmc_Amount == null || ItemArr[i].apmc_Amount == undefined || isNaN(ItemArr[i].apmc_Amount)) ItemArr[i].apmc_Amount = 0;
        var DiscAmtPerItem = (ItemArr[i].amount * DiscPerItem) / 100;
        var PlusMinusAmt = parseFloat(ItemArr[i].apmc_Amount) - parseFloat(DiscAmtPerItem);
        totPlusMinusAmt = totPlusMinusAmt + parseFloat(PlusMinusAmt)
    }
    return totPlusMinusAmt.toFixed(2);
});
hbs.registerHelper('tot_GSTWithAPMCInSaleBillPrint', function (context, Addless) {
    var totQtty = 0;
    if (context != null) {
        for (let i = 0; i < context.length; i++) {
            for (let j = 0; j < Addless.length; j++) {
                if (JSON.stringify(context[i].particular_add) == JSON.stringify(Addless[j]._id)) {
                    if ((Addless[j].Calculation == 'SGST' || Addless[j].Calculation == 'IGST' || Addless[j].Calculation == 'CGST')) {
                        if (context[i].particular_amount == null || context[i].particular_amount == '' || context[i].particular_amount == undefined || isNaN(context[i].particular_amount)) context[i].particular_amount = 0;
                        totQtty = totQtty + parseFloat(context[i].particular_amount);
                    }
                }
            }
        }
        if (totQtty == null || isNaN(totQtty) || totQtty == undefined) totQtty = 0;
        return totQtty.toFixed(2);
    }
});
hbs.registerHelper('tot_OTHERWithAPMCInSaleBillPrint', function (context, LessPar, Addless) {
    // var totAdd = 0;
    // var totLess = 0;
    // for(let i=0; i<context.length; i++){
    //     for(let j=0; j<Addless.length; j++){
    //         if(JSON.stringify(context[i].particular_add) == JSON.stringify(Addless[j]._id) ){
    //             if((Addless[j].Calculation == 'SGST' || Addless[j].Calculation == 'IGST' || Addless[j].Calculation == 'CGST' || Addless[j].Calculation == 'APMC')){
    //             }else{
    //                 if(context[i].particular_amount == null || context[i].particular_amount == '' || context[i].particular_amount == undefined || isNaN(context[i].particular_amount))context[i].particular_amount = 0;
    //                 totAdd = totAdd + parseFloat(context[i].particular_amount);
    //             }
    //         }
    //     }
    // }
    // for(let l=0; l<LessPar.length; l++){
    //     if(LessPar[l].particular_amtless == null || LessPar[l].particular_amtless == '' || LessPar[l].particular_amtless == undefined || isNaN(LessPar[l].particular_amtless))LessPar[l].particular_amtless = 0;
    //     totLess = totLess + LessPar[l].particular_amtless;
    // }
    // if(totAdd == null || isNaN(totAdd) || totAdd == undefined)totAdd = 0;
    // if(totLess == null || isNaN(totLess) || totLess == undefined)totLess = 0;
    // return (parseFloat(totAdd)-parseFloat(totLess)).toFixed(2);
    return '--';
});
hbs.registerHelper('CalApmcDesInSbPrint', function (addArr, addLess) {
    var html = '';
    var apmc = '';
    var count = 0;
    for (let i = 0; i < addArr.length; i++) {
        for (let j = 0; j < addLess.length; j++) {
            if (JSON.stringify(addArr[i].particular_add) == JSON.stringify(addLess[j]._id) && addArr[i].particular_amount > 0) {
                if (addLess[j].Description == 'APMC') {
                    apmc = addLess[j].Description;
                    count = count + 1;
                    break;
                }
            }
        }
        if (count > 0) break;
    }
    html += '<td style="padding-top: 1px;padding-bottom: 1px;padding-right: 4px;padding-left: 4px;text-align: left"><b>' + apmc + '</b></td>'
    return html;
});
hbs.registerHelper('CalApmcAmtInSbPrint', function (addArr, addLess) {
    var html = '';
    var apmcAmt = 0;
    var count = 0;
    for (let i = 0; i < addArr.length; i++) {
        for (let j = 0; j < addLess.length; j++) {
            if (JSON.stringify(addArr[i].particular_add) == JSON.stringify(addLess[j]._id) && addArr[i].particular_amount > 0) {
                if (addLess[j].Description == 'APMC') {
                    apmcAmt = apmcAmt + parseFloat(addArr[i].particular_amount);
                    // count = count+1;
                }
            }
        }
        // if(count>0)break;
    }
    html += '<td style="padding-top: 1px;padding-bottom: 1px;padding-right: 4px;padding-left: 4px;text-align: left"><b>' + apmcAmt.toFixed(2) + '</b></td>'
    return html;
});
hbs.registerHelper('CheckItemtitleLength', function (ItemTitle) {
    var html = '';
    if (ItemTitle.length > 20) html = '' + ItemTitle + '';
    else html = '' + ItemTitle + '</br>';
    return html;
});
hbs.registerHelper('CheckItemtitleLengthForOther', function (ItemTitle) {
    var html = '';
    if (ItemTitle.length > 20) html = '' + ItemTitle + '';
    else html = '' + ItemTitle + '</br>';
    return html;
});
hbs.registerHelper('TotoutRecAmount', function (OutEntry) {
    var totRecAmt = 0;
    if (OutEntry != null) {
        for (let i = 0; i < OutEntry.length; i++) {
            if (OutEntry[i].Rec_Amount == null || OutEntry[i].Rec_Amount == '' || OutEntry[i].Rec_Amount == undefined) OutEntry[i].Rec_Amount = 0;
            totRecAmt = totRecAmt + parseFloat(OutEntry[i].Rec_Amount);
        }
    }
    return totRecAmt.toFixed(2);
});
hbs.registerHelper('totQttyInSaleEntry', function (context) {
    var totQtty = 0;
    if (context != null) {
        for (let i = 0; i < context.length; i++) {
            if (context[i].qntty == null || context[i].qntty == '' || context[i].qntty == undefined || isNaN(context[i].qntty)) context[i].qntty = 0;
            totQtty = totQtty + context[i].qntty;
        }
        return totQtty;
    }
});
hbs.registerHelper('tot_netWtInSaleEntry', function (context) {
    var totQtty = 0;
    if (context != null) {
        for (let i = 0; i < context.length; i++) {
            totQtty = totQtty + context[i].net_Wt;
        }
        return totQtty;
    }
});
hbs.registerHelper('tot_AmountInSaleBillPrint', function (context) {
    var totQtty = 0;
    if (context != null) {
        for (let i = 0; i < context.length; i++) {
            if (context[i].amount == null || context[i].amount == '' || context[i].amount == undefined || isNaN(context[i].amount)) context[i].amount = 0;
            totQtty = totQtty + context[i].amount;
        }
        if (totQtty == null || isNaN(totQtty) || totQtty == undefined) totQtty = 0;
        return totQtty.toFixed(2);
    }
});
hbs.registerHelper('totDiscInSaleEntry', function (context) {
    var totQtty = 0;
    if (context != null) {
        for (let i = 0; i < context.length; i++) {
            totQtty = totQtty + parseFloat(context[i].Dis_Amt);
        }
        if (totQtty == null || isNaN(totQtty) || totQtty == '') totQtty = 0;
        return totQtty.toFixed(2);
    }
});
hbs.registerHelper('totGSTInSaleEntry', function (context) {
    var totQtty = 0;
    if (context != null) {
        for (let i = 0; i < 3; i++) {
            totQtty = totQtty + context[i].particular_amount;
        }
        return totQtty.toFixed(2);
    }
});
hbs.registerHelper('maxno', function (context) {
    var lstcode = 0;
    if (context.toString().length == 0) lstcode = 0;
    else lstcode = context[0].vouc_code;
    var maxsno = parseInt(lstcode) + 1;
    return maxsno;
});
hbs.registerHelper('softsolution', function (m1, m2) {
    var lstcode = 0;
    lstcode = (m1 * m2).toFixed(2);
    return lstcode;
});
hbs.registerHelper('dateconvert', function (m1) {
    //  console.log(m1)
    var data = m1.toString();
    var milisegundos = parseInt(data.replace("/Date(", "").replace(")/", ""));
    var newDate = new Date(milisegundos).toLocaleDateString("en-UE");
    return newDate;
});
hbs.registerHelper('discountsolution', function (h1, h2, h3) {
    var lstcode = 0;
    var lstcode = ((h1 * h2) * h3) / 100;
    var lstcode = (h1 * h2) - lstcode;
    return lstcode;
});

hbs.registerHelper('totalone', function (h1) {

    var pladd = pladd + h1;
    //  console.log(pladd)
    return pladd;
});
hbs.registerHelper('profmaxno', function (context) {
    var lstcode = 0;
    if (context.toString().length == 0) lstcode = 0;
    else lstcode = context[0].vouc_code;
    var maxsno = parseInt(lstcode) + 1;
    return maxsno;
});
hbs.registerHelper('somaxno', function (context) {
    var lstcode = 0;
    if (context.toString().length == 0) lstcode = 0;
    else lstcode = context[0].vouc_code;
    var maxsno = parseInt(lstcode) + 1;
    return maxsno;
});
hbs.registerHelper('maxcjspname', function (context) {
    var lstcode = "SO";
    if (context.toString().length == 0) lstcode = "SO";
    else lstcode = context[0].c_j_s_p;
    var maxcjsp = lstcode;
    return maxcjsp;
});
hbs.registerHelper('maxprdt', function (context) {
    var lstcode = 0;
    if (context.toString().length == 0) lstcode = 0;
    else lstcode = context[0].p_code;
    var maxsno = parseInt(lstcode) + 1;
    return maxsno;
});
hbs.registerHelper("contains", function (value, strval) {
    var xx = "Y";
    if (strval.search(value) > -1) xx = "checked";
    else xx = "Y";
    return xx;
});
hbs.registerHelper('chkchecked', function (vlu, cvlu) {
    var ret = "no";
    if (vlu == cvlu) ret = "yes";
    else ret = "no";
    return ret;
});
hbs.registerHelper('partychkchecked', function (vlu, cvlu) {
    var ret = "no";
    if (vlu != null && cvlu != null && (vlu).search(cvlu) >= 0) ret = "yes";
    else ret = "no";
    return ret;
});
hbs.registerHelper('chkdel', function (vlu, cvlu) {
    var ret = "";
    if (vlu == cvlu) ret = "checked";
    else ret = "";
    return ret;
});
hbs.registerHelper("compare", function (value, strval) {
    // fallback...
    // array = ( array instanceof Array ) ? array : [array];
    // console.log(value);
    var xx = "Y";
    if (value == strval) xx = "selected";
    else xx = "";
    return xx;
});

hbs.registerHelper('notequal', function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue == rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

hbs.registerHelper('subtract', function (lvalue, rvalue, options) {
    if (arguments.length < 3) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    var newvalue = lvalue - rvalue;
    return newvalue;
});

hbs.registerHelper('sum', function (lvalue, rvalue, options) {
    if (arguments.length < 3) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    var newvalue = lvalue + rvalue;
    return newvalue;
});
hbs.registerHelper('listbsrtopt', function (context, BSRT, rvalue, listid, req, req1, options) {
    // console.log(req);
    var ret = "<select class='form-control add_btn " + req + "'  " + req1 + " placeholder='Please select' name='" + rvalue + "' id='" + listid + "'><option></option>";
    for (var i = 0, j = context.length; i < j; i++) {

        if ((context[i].p_type).search(BSRT) >= 0) {
            ret = ret + "<option data-city='cityname' value='" + context[i]._id + "' data-party_id='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "</option>";
        }
    }
    // console.log(ret);
    return ret + "</select>";

    // options.fn(context[i]).trim()
});
hbs.registerHelper('listbsrt', function (context, BSRT, rvalue, listid, options) {
    var ret = "<select class='form-control select2  add_btn' placeholder='Please select' name='" + rvalue + "' id='" + listid + "'><option></option>";
    for (var i = 0, j = context.length; i < j; i++) {

        if ((context[i].p_type).search(BSRT) >= 0) {
            ret = ret + "<option data-city='cityname' value='" + context[i]._id + "' data-party_id='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "</option>";
        }
    }
    return ret + "</select>";

});
hbs.registerHelper('list', function (context, BSRT, lvalue, listid, rvalue, options) {

    var ret = "<select class='form-control select2' placeholder='Please select' name='" + rvalue + "' id='" + listid + "'><option></option>";
    for (var i = 0, j = context.length; i < j; i++) {
        if (context[i] != null && lvalue != null) {
            if ((context[i]._id).toString().trim() == lvalue.toString().trim()) {
                ret = ret + "<option value='" + context[i]._id + "' selected='' data-party_id='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "</option>";
            } else {
                if ((context[i].p_type).search(BSRT) >= 0) {
                    ret = ret + "<option value='" + context[i]._id + "' data-party_id='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "</option>";
                }
            }
        }
    }
    return ret + "</select>";
});
hbs.registerHelper('listrt', function (context, lvalue, rvalue, options) {
    var ret = "<select class='form-control' placeholder='Please select' name='" + rvalue + "' id='offerproductname'><option></option>";
    for (var i = 0, j = context.length; i < j; i++) {
        if ((context[i]._id).toString().trim() == lvalue.toString().trim()) {
            ret = ret + "<option value='" + context[i]._id + "' selected='' data-productid='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "</option>";
        } else {
            ret = ret + "<option value='" + context[i]._id + "' data-productid='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "</option>";

        }
    }
    return ret + "</select>";
});

////
hbs.registerHelper('divcom', function (context, lvalue, options) {
    var ret = "";
    for (var i = 0, j = context.length; i < j; i++) {
        if ((lvalue).toString().search(context[i]._id) >= 0) {
            ret = ret + "" + options.fn(context[i]).trim() + "";
        }
    }

    return ret + "";
});
hbs.registerHelper('prabal', function (context, lvalue, s) {
    // console.log("p"+context)
    var ret = "";
    if (context == s) {
        return ret = lvalue;
    }



    return ret + 0;
});
hbs.registerHelper('checkdynmc', function (context, lvalue, options) {
    var ret = "";
    for (var i = 0, j = context.length; i < j; i++) {
        if ((lvalue).toString().search(context[i]._id) >= 0) {
            ret = ret + "<input type='checkbox' name='" + lvalue + "' checked value='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "";
        }
        else {
            ret = ret + "<input type='checkbox' name='" + lvalue + "' value='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "";
        }

    }

    return ret + "";
});
hbs.registerHelper('checkdynmcprdt', function (context, lvalue, options) {
    var ret = "";
    for (var i = 0, j = context.length; i < j; i++) {
        var found = false;
        for (var x = 0, y = lvalue.length; x < y; x++) {
            if ((context[i]._id).toString().trim() == lvalue[x].toString().trim()) {
                found = true;
            }
        }
        if (found) {
            ret = ret + " <label class='checkbox-inline checkboxradiotop' style='width: 30%'><input type='checkbox' id='prdtdiv_code' name='prdtdiv_code[]' data-id='" + options.fn(context[i]).trim() + "' checked value='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "</label>";
        }
        else {
            ret = ret + " <label class='checkbox-inline checkboxradiotop' style='width: 30%'><input type='checkbox' id='prdtdiv_code' name='prdt_deprtmnt[]'  data-id='" + options.fn(context[i]).trim() + "' value='" + context[i]._id + "'>" + options.fn(context[i]).trim() + "</label>";
        }
    }
    return ret + "";
});

hbs.registerHelper('cashbaname', function (context, lvalue, options) {
    var ret = '';
    var back = '';
    //console.log("njjjjj"+lvalue);
    for (var i = 0, j = context.length; i < j; i++) {
        if (context[i]['_id'].equals(lvalue)) {
            ret += context[i]['ACName'];

        }
    }
    return ret;
});
hbs.registerHelper('draweeBank', function (context, lvalue, options) {
    var ret = '';
    var back = '';
    for (var i = 0, j = context.length; i < j; i++) {
        if (context[i]['_id'].equals(lvalue)) {
            if (context[i]['micrCode'] == undefined) context[i]['micrCode'] = '';
            ret += context[i]['micrCode'];
        }
    }
    return ret;
});
hbs.registerHelper('dsigst', function (context) {
    // console.log("context"+context)
    // console.log("contextdfhdfhfde"+context[0].sales_or_group[1].so_disc.Fg_GstRate)
    var ret = '';
    // gst_rate
    for (var i = 0, j = context.length; i < j; i++) {
        // console.log("contextdfhdfhfde"+context[i].sales_or_group[j].so_disc.Fg_GstRate)
        if (context[i].sales_or_group[j].so_disc.Fg_GstRate.equals("12%")) {
            ret += context[i]['ac_name'];

        }
    }


    return ret;
});

hbs.registerHelper('userdepartment', function (context, lvalue, options) {
    var ret = "";
    for (var i = 0, j = context.length; i < j; i++) {
        if ((lvalue).toString().search(context[i]._id) >= 0) {
            ret = ret + " <label class='checkbox-inline checkboxradiotop' style='width: 30%'><input type='checkbox' checked id='" + context[i]._id + "' value='" + context[i]._id + "' name='div_code[]'>" + options.fn(context[i]).trim() + "</label>";
        }
        else {
            ret = ret + " <label class='checkbox-inline checkboxradiotop' style='width: 30%'><input type='checkbox' id='" + context[i]._id + "' value='" + context[i]._id + "' name='div_code[]'>" + options.fn(context[i]).trim() + "</label>";
        }
    }
    return ret + "";
});
hbs.registerHelper('Sort', function (context, lvalue, options) {

    var ret = "";
    ret = context.sort(lvalue.sort());

    return ret;
});

hbs.registerHelper('pageadd', function (context, lvalue, adev, options) {
    var ret = "";
    if (lvalue != null) {
        if ((lvalue).toString().search(context + '-' + adev + '') >= 0) {
            ret = ret + 'checked';
        }
    }
    return ret + "";
});
hbs.registerHelper('saudabagtot', function (context, lvalue, adev, options) {
    var ret = 0;
    for (var i = 0, j = context.length; i < j; i++) {
        for (var x = 0, y = context[i].contract_sauda_group.length; x < y; x++) {
            ret = ret + parseInt(context[i].contract_sauda_group[x].bag);
        }

    }
    return ret;
});

hbs.registerHelper('quantitytwlvepercnt', function (context, lvalue, adev, options) {
    var ret = 0;
    //console.log(context);
    for (var i = 0, j = context.length; i < j; i++) {
        // console.log()
        if (context[i]['so_disc']['Fg_GstRate'] == "12") {
            ret = ret + parseFloat(context[i].total_amt);
        }


    }
    ret = parseFloat((ret * 12) / 100);
    return ret.toFixed(2);
});


hbs.registerHelper('quantityeighteenper', function (context, lvalue, adev, options) {
    var ret = 0;
    //console.log(context);
    for (var i = 0, j = context.length; i < j; i++) {
        // console.log()
        if (context[i]['so_disc']['Fg_GstRate'] == "18") {
            ret = ret + parseFloat(context[i].total_amt);

        }
        // for(var x=0, y=context[i].sales_or_group.length; x<y; x++) {
        //     
        // //
        // }

    }

    ret = parseFloat((ret * 18) / 100);
    return ret.toFixed(2);
});
hbs.registerHelper('quantitot', function (context, lvalue, adev, options) {
    var ret12 = 0;
    var ret18 = 0;
    //    console.log("lvalue"+lvalue);
    for (var i = 0, j = context.length; i < j; i++) {
        // console.log()
        if (context[i]['so_disc']['Fg_GstRate'] == "18") {
            ret18 = ret18 + parseFloat(context[i].total_amt);

        }
        if (context[i]['so_disc']['Fg_GstRate'] == "12") {
            ret12 = ret12 + parseFloat(context[i].total_amt);

        }

    }
    ret18 = parseFloat((ret18 * 18) / 100);
    ret12 = parseFloat((ret12 * 12) / 100);
    var tot = parseFloat(ret12 + ret18 + lvalue);
    ret = tot - Math.round(tot);
    return ret.toFixed(2);
});
hbs.registerHelper('toalldsi', function (context, lvalue, adev, options) {
    var ret12 = 0;
    var ret18 = 0;
    //    console.log("lvalue"+lvalue);
    for (var i = 0, j = context.length; i < j; i++) {
        // console.log()
        if (context[i]['so_disc']['Fg_GstRate'] == "18") {
            ret18 = ret18 + parseFloat(context[i].total_amt);

        }
        if (context[i]['so_disc']['Fg_GstRate'] == "12") {
            ret12 = ret12 + parseFloat(context[i].total_amt);

        }

    }
    ret18 = parseFloat((ret18 * 18) / 100);
    ret12 = parseFloat((ret12 * 12) / 100);
    var tot = parseFloat(ret12 + ret18 + lvalue);
    ret = Math.round(tot);
    return ret.toFixed(2);
});
hbs.registerHelper('dsiamountinword', function (context, lvalue, adev, options) {
    var ret12 = 0;
    var ret18 = 0;
    //    console.log("lvalue"+lvalue);
    for (var i = 0, j = context.length; i < j; i++) {
        // console.log()
        if (context[i]['so_disc']['Fg_GstRate'] == "18") {
            ret18 = ret18 + parseFloat(context[i].total_amt);
        }
        if (context[i]['so_disc']['Fg_GstRate'] == "12") {
            ret12 = ret12 + parseFloat(context[i].total_amt);
        }

    }
    ret18 = parseFloat((ret18 * 18) / 100);
    ret12 = parseFloat((ret12 * 12) / 100);
    var tot = parseFloat(ret12 + ret18 + lvalue);
    ret = Math.round(tot);
    var words = new Array();
    words[0] = '';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    var amount = ret.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
            received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++ , j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++ , j++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                if (n_array[i] == 1) {
                    n_array[j] = 10 + parseInt(n_array[j]);
                    n_array[i] = 0;
                }
            }
        }
        value = "";
        for (var i = 0; i < 9; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                value = n_array[i] * 10;
            } else {
                value = n_array[i];
            }
            if (value != 0) {
                words_string += words[value] + " ";
            }
            if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Crores ";
            }
            if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Lakhs ";
            }
            if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Thousand ";
            }
            if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                words_string += "Hundred and ";
            } else if (i == 6 && value != 0) {
                words_string += "Hundred ";
            }
        }
    }
    words_string = words_string.split("  ").join(" ");
    return words_string;
});
hbs.registerHelper('SaleBilamountinword', function (context, options) {
    var tot = parseFloat(context);
    ret = Math.round(tot);
    var words = new Array();
    words[0] = '';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    var amount = ret.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
            received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++ , j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++ , j++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                if (n_array[i] == 1) {
                    n_array[j] = 10 + parseInt(n_array[j]);
                    n_array[i] = 0;
                }
            }
        }
        value = "";
        for (var i = 0; i < 9; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                value = n_array[i] * 10;
            } else {
                value = n_array[i];
            }
            if (value != 0) {
                words_string += words[value] + " ";
            }
            if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Crores ";
            }
            if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Lakhs ";
            }
            if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Thousand ";
            }
            if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                words_string += "Hundred and ";
            } else if (i == 6 && value != 0) {
                words_string += "Hundred ";
            }
        }
    }
    words_string = words_string.split("  ").join(" ");
    return words_string;
});
hbs.registerHelper('totalroundoff', function (context, lvalue, adev, ) {
    var ret = 0;
    //console.log(context);
    var total = parseFloat(context + lvalue + adev);
    ret = Math.round(total);
    return ret;
});
hbs.registerHelper('outwordchlnoutinqty', function (context) {
    var ret = 0;
    // console.log("ret1"+context.length);
    for (var i = 0, j = context.length; i < j; i++) {
        // console.log("ret2"+ret);
        for (var x = 0, y = context[i].sales_or_group.length; x < y; x++) {
            // console.log("ret3"+ret);
            ret = ret + parseInt(context[i].sales_or_group[x].outin_qty);
            // console.log("ret"+ret);
        }
    }
    return ret;
});
hbs.registerHelper('totbrbrkamt', function (context, lvalue, adev, options) {
    var ret = 0;
    for (var i = 0, j = context.length; i < j; i++) {
        for (var x = 0, y = context[i].contract_sauda_group.length; x < y; x++) {
            ret = ret + parseInt(context[i].contract_sauda_group[x].brbrk_amt);
        }

    }
    return ret;
});
hbs.registerHelper('scuritylogin', function (context, lvalue, adev, options) {
    if (context != null) {
        if ((context).search(lvalue + '-' + adev + '') >= 0) {
            return options.fn(this);
        }
    }
});
// hbs.registerHelper('dateformat', function(datetime, format) {
//     console.log(datetime)
//     return moment(datetime).format(format);
// });
hbs.registerHelper('datet', function (datetime, format) {
    return moment(datetime).format(format);
});
app.use(session({
    key: 'user_sid',
    secret: 'keyboard sesskey',
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: 60000000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
// app.use((req, res, next) => {
//     if (req.cookies.user_sid && !req.session.user) {
//         res.clearCookie('user_sid');        
//     }
//     next();
// });


// // middleware function to check for logged-in users
// var sessionChecker = (req, res, next) => {
//     if (req.session.user && req.cookies.user_sid) {
//         res.redirect('/dashboard');
//     } else {
//         next();
//     }    
// };


// // route for Home-Page
// app.get('/', sessionChecker, (req, res) => {
//     res.redirect('/login');
// });



app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// var sess;
// app.get('/',function(req,res) {
//     sess=req.session;
//     sess.usernm;
//     sess.sdate ;
// });

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/userright/login');
    }
}

// Home Route
app.get('/', loggedIn, function (req, res, err) {
    userright.findOne({ usrnm: req.session.user }, function (err, userright) {
        req.session.co_code = userright['co_code'];
        req.session.div_code = userright['div_code'];
        req.session.masterid = userright['masterid'];
        req.session.security = userright['admin'];
        req.session.administrator = userright['administrator'];
        div_com.find({}, function (err, div_com) {
            // console.log(req.session.co_code);
            if (err) {
                console.log(err);
            } else {
                res.render('company.hbs', {
                    div_com: div_com,
                    usrname: req.session.co_code,
                    pageTitle: 'Company Selection',
                });
            }
        });
    });
});

// Route Files
// let users = require('./routes/users');
let state_master = require('./routes/state_master');
let add_city = require('./routes/add_city');
let add_district = require('./routes/add_district');
let product = require('./routes/product');
let expense = require('./routes/expense');
let proprietor = require('./routes/proprietor');
let group = require('./routes/group');
let bank = require('./routes/bank');
let brand = require('./routes/brand');
let courier = require('./routes/courier');
let transport = require('./routes/transport');
let term = require('./routes/term');
let narration = require('./routes/narration');
let party = require('./routes/party');
let courier_inword = require('./routes/courier_inword');
let courier_outword = require('./routes/courier_outword');
let daily_rates = require('./routes/daily_rates');
let product_mast = require('./routes/product_mast');
let contract_sauda = require('./routes/contract_sauda');
let delivery_entry = require('./routes/delivery_entry');
let direct_delivery_entry = require('./routes/direct_delivery_entry');
let users = require('./routes/userright');
let security_right = require('./routes/security_right');
let salesorder_register = require('./routes/salesorder_register');
let delivery_register = require('./routes/delivery_register');
let payment_entry = require('./routes/payment_entry');
let worksheet_entry = require('./routes/worksheet_entry');
let payment_register = require('./routes/payment_register');
let company_master = require('./routes/company_master');
let division_master = require('./routes/division_master');
let deal_register = require('./routes/deal_register');
let enquiry_rates = require('./routes/enquiry_rates');

let category_tax_mast = require('./routes/category_tax_mast');
let sauda_report = require('./routes/sauda_report');
let product_tax_mast = require('./routes/product_tax_mast');
let dealregister = require('./routes/deal-register-2');
let raw_mat_typ_mast = require('./routes/raw_mat_typ_mast');
let raw_mat_sub_typ_mast = require('./routes/raw_mat_sub_typ_mast');
let gowdown_location_mast = require('./routes/gowdown_location_mast');
let raw_material_mast = require('./routes/raw_material_mast');
let stock_unit_mast = require('./routes/stock_unit_mast');
let party_type_mast = require('./routes/party_type_mast');
let trans_mast = require('./routes/trans_mast');
let finish_goods = require('./routes/finish_goods');
let district_mast = require('./routes/district_mast');
let supplier_mast = require('./routes/supplier_mast');
let account_mast = require('./routes/account_mast');
let group_mast = require('./routes/group_mast');
let sales_order_mast = require('./routes/sales_order_mast');
let profarma = require('./routes/profarma');
let outward_challan = require('./routes/outward_challan');
let domes_salesinvoice = require('./routes/domes_salesinvoice');
let transport_mast = require('./routes/transport_mast');
let cash_bank = require('./routes/cash_bank');
let commercial = require('./routes/commercial');
let outward_register = require('./routes/outward_register');
let domestic_register = require('./routes/domestic_register');
let cash_ladger = require('./routes/cash_ladger');
let journal_entry = require('./routes/journal_entry');
let mrn_challan = require('./routes/mrn_challan');
let pur_order = require('./routes/pur_order');
let st_ladger = require('./routes/st_ladger');
let quality_mast = require('./routes/quality_mast');
let sub_quality_mast = require('./routes/sub_quality_mast');
let category_mast = require('./routes/category_mast');
let model_mast = require('./routes/model_mast');
let brand_mast = require('./routes/brand_mast');
let group_setup_mast = require('./routes/group_setup_mast');
let tax_mast = require('./routes/tax_mast');
let Trail_Balance = require('./routes/Trail_Balance');
let addless_mast = require('./routes/addless_mast');
let WIP_master = require('./routes/WIP_master');
let production_dept_master = require('./routes/production_dept_master');
let plan_entry = require('./routes/plan_entry');
let WIP_entry = require('./routes/WIP_entry');
let Cutting_entry = require('./routes/Cutting_entry');
let WIP_DeptEntry = require('./routes/WIP_DeptEntry');
let Garu_Aavak_Entry = require('./routes/Garu_Aavak_Entry');
let GowdawnCode = require('./routes/GowdawnCode');
let tax_catogory_mast = require('./routes/tax_catogory_mast');
let Sales_Entry = require('./routes/Sales_Entry');
let Bill_CollectionEntry = require('./routes/Bill_CollectionEntry');
let loan_entry = require('./routes/loan_entry');
let toli_master = require('./routes/toli_master');
let grocery_master = require('./routes/grocery_master');
let daily_grocery_entry = require('./routes/daily_grocery_entry');
let voucher_type_master = require('./routes/voucher_type_master');
let unit_setup_master = require('./routes/unit_setup_master');
let Vachhati_Aavak_Entry = require('./routes/Vachhati_Aavak_Entry');
let bank_details = require('./routes/bank_details');
let grocery_report_summary = require('./routes/grocery_report_summary');
let Add_Less_Parameter_Master = require('./routes/Add_Less_Parameter_Master');
let op_os_module = require('./routes/op_os_module');
let stock_opening_module_rm = require('./routes/stock_opening_module_rm');
let do_entry = require('./routes/do_entry');
let bank_reconcilition = require('./routes/bank_reconcilition');
let sales_register = require('./routes/sales_register');
let Tax_Voucher = require('./routes/Tax_Voucher');
let Sales_Return_Entry = require('./routes/Sales_Return_Entry');
let Purchase_Return_Entry = require('./routes/Purchase_Return_Entry');
let Credit_Note = require('./routes/Credit_Note');
let Debit_Note = require('./routes/Debit_Note');
// app.use('/users', users); 
let godown_transfer_note= require('./routes/godown_transfer_note');
let stock_adjustment_note= require('./routes/stock_adjustment_note');

// loki
app.use('/godown_transfer_note',godown_transfer_note);
app.use('/stock_adjustment_note',stock_adjustment_note);

app.use('/Debit_Note', Debit_Note);
app.use('/Credit_Note', Credit_Note);
app.use('/Purchase_Return_Entry', Purchase_Return_Entry);
app.use('/Sales_Return_Entry', Sales_Return_Entry);
app.use('/Tax_Voucher', Tax_Voucher);
app.use('/stock_opening_module_rm', stock_opening_module_rm);
app.use('/op_os_module', op_os_module);
app.use('/Add_Less_Parameter_Master', Add_Less_Parameter_Master);
app.use('/toli_master', toli_master);
app.use('/grocery_master', grocery_master);
app.use('/daily_grocery_entry', daily_grocery_entry);
app.use('/voucher_type_master', voucher_type_master);
app.use('/unit_setup_master', unit_setup_master);
app.use('/Vachhati_Aavak_Entry', Vachhati_Aavak_Entry);
app.use('/bank_details', bank_details);
app.use('/grocery_report_summary', grocery_report_summary);
app.use('/loan_entry', loan_entry);
app.use('/Bill_CollectionEntry', Bill_CollectionEntry);
app.use('/Sales_Entry', Sales_Entry);
app.use('/tax_catogory_mast', tax_catogory_mast);
app.use('/GowdawnCode', GowdawnCode);
app.use('/Garu_Aavak_Entry', Garu_Aavak_Entry);
app.use('/WIP_DeptEntry', WIP_DeptEntry);
app.use('/Cutting_entry', Cutting_entry);
app.use('/WIP_entry', WIP_entry);
app.use('/plan_entry', plan_entry);
app.use('/production_dept_master', production_dept_master);
app.use('/WIP_master', WIP_master);
app.use('/addless_mast', addless_mast);
app.use('/Trail_Balance', Trail_Balance);
app.use('/tax_mast', tax_mast);
app.use('/group_setup_mast', group_setup_mast);
app.use('/quality_mast', quality_mast);
app.use('/sub_quality_mast', sub_quality_mast);
app.use('/category_mast', category_mast);
app.use('/model_mast', model_mast);
app.use('/brand_mast', brand_mast);
app.use('/st_ladger', st_ladger);
app.use('/pur_order', pur_order);
app.use('/mrn_challan', mrn_challan);
app.use('/state_master', state_master);
app.use('/add_city', add_city);
app.use('/add_district', add_district);
app.use('/product', product);
app.use('/expense', expense);
app.use('/proprietor', proprietor);
app.use('/group', group);
app.use('/bank', bank);
app.use('/brand', brand);
app.use('/courier', courier);
app.use('/transport', transport);
app.use('/term', term);
app.use('/narration', narration);
app.use('/party', party);
app.use('/courier_inword', courier_inword);
app.use('/courier_outword', courier_outword);
app.use('/daily_rates', daily_rates);
app.use('/product_mast', product_mast);
app.use('/contract_sauda', contract_sauda);
app.use('/delivery_entry', delivery_entry);
app.use('/direct_delivery_entry', direct_delivery_entry);
app.use('/userright', users);
app.use('/security_right', security_right);
app.use('/salesorder_register', salesorder_register);
app.use('/delivery_register', delivery_register);
app.use('/payment_entry', payment_entry);
app.use('/worksheet_entry', worksheet_entry);
app.use('/payment_register', payment_register);
app.use('/company_master', company_master);
app.use('/division_master', division_master);
app.use('/deal_register', deal_register);
app.use('/enquiry_rates', enquiry_rates);

app.use('/category_tax_mast', category_tax_mast);
app.use('/sauda_report', sauda_report);
app.use('/product_tax_mast', product_tax_mast);
app.use('/deal-register-2', dealregister);
app.use('/raw_mat_typ_mast', raw_mat_typ_mast);
app.use('/raw_mat_sub_typ_mast', raw_mat_sub_typ_mast);
app.use('/gowdown_location_mast', gowdown_location_mast);

app.use('/raw_material_mast', raw_material_mast);
app.use('/stock_unit_mast', stock_unit_mast);
app.use('/party_type_mast', party_type_mast);
app.use('/trans_mast', trans_mast);
app.use('/finish_goods', finish_goods);
app.use('/district_mast', district_mast);
app.use('/supplier_mast', supplier_mast);
app.use('/account_mast', account_mast);
app.use('/group_mast', group_mast);
app.use('/sales_order_mast', sales_order_mast);
app.use('/profarma', profarma);
app.use('/outward_challan', outward_challan);
app.use('/domes_salesinvoice', domes_salesinvoice);
app.use('/transport_mast', transport_mast);
app.use('/cash_bank', cash_bank);
app.use('/commercial', commercial);
app.use('/outward_register', outward_register);
app.use('/domestic_register', domestic_register);
app.use('/cash_ladger', cash_ladger);
app.use('/journal_entry', journal_entry);
app.use('/do_entry', do_entry);
app.use('/bank_reconcilition', bank_reconcilition);
app.use('/sales_register', sales_register);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

