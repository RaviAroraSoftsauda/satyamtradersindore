const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let GaruAavak = require('../models/Garu_Aavak_Schema');
let SalesEntry = require('../models/Garu_Aavak_Schema');
let somast = require('../models/pur_order_Schema');
const moment = require('moment-timezone');
let journalmast = require('../models/trans');
let acmast= require('../models/ac_mast');
let state_master = require('../models/stateSchema');
let city_master = require('../models/citySchema');
let outstanding= require('../models/outstading_schema');
let product = require('../models/fgSchema');
let division = require('../models/divSchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');
let addmast = require('../models/addless_mast_schema');
let lessmast = require('../models/addless_mast_schema');
let addlessmast= require('../models/addless_mast_schema');
let gowdown= require('../models/gowdawnCodeSchema');
let AddLessParameter= require('../models/Add_Less_Parameter_Master_Schema');
let taxctg_mast= require('../models/taxctgSchema');
let Stock_Unit = require('../models/skuSchema');
let subquality= require('../models/subqualitySchema');
let quality= require('../models/qualitySchema');
let catogry= require('../models/CategorySchema');
let modulesch= require('../models/module');
let ptyp_mast= require('../models/partyTypeSchema');
let vouchMast= require('../models/vouchSchema');
let db = mongoose.connection;

//  let addmast = require('../models/addless_mast_schema');
//  let lessmast = require('../models/addless_mast_schema');

router.get('/getadddesc', function (req, res) {
    AddLessParameter.findOne({Module:'Sale Entry',masterid:req.session.masterid},function(err, AddLessParameter){
        var AddlesArr = []
        if(AddLessParameter == null || AddLessParameter == '' || AddLessParameter == [])flag= 1;
        else {
            for(let i=0; i<AddLessParameter.Add_Less_Parameter_Master_Array.length; i++){
                for(let j=0; j<AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++){
                    if(AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid){
                        AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                    }
                }
            }
        }
        res.json({ 'success': true, 'addmast': AddlesArr});
    });
});

router.get('/getlessdesc', function (req, res) {
    lessmast.find({masterid:req.session.masterid,addlesstype:"-"}, function (err, lessmast){
            res.json({ 'success': true, 'lessmast': lessmast});
        });
});

router.get('/productname', function (req, res) {
    product.find({masterid:req.session.masterid, del:"N"}, function(err, product){
        gowdown.find({masterid:req.session.masterid, del:"N"}, function (err, gowdown){ 
            Account_master.find({masterid: req.session.masterid, del: 'N'},function (err, account_masters){  
                res.json({ 'success': true, 'product': product,'gowdown':gowdown,'account_masters':account_masters});
            });
        });
    });
});

router.get('/chackstate/:party', function (req, res) {
    // console.log(req.params.party)
    var div_state = '';
    var party_state = '';
    var dg = '';
    var pg = '';
    Account_master.find({_id:req.params.party, del:"N"}, function(err, party){
        division.find({_id:req.session.divid}, function(err, division){
           
            if(division[0].ac_state == undefined)div_state = '';
            else div_state = division[0].ac_state.StateCode;

            if(party[0].StateName == undefined)party_state = '';
            else party_state = party[0].StateName.StateCode;

            if(division[0].ac_gstin == undefined)dg = '';
            else dg = division[0].ac_gstin.substr(0,2);

            if(party[0].GSTIN == undefined)pg ='';
            else pg = party[0].GSTIN.substr(0,2);

            // console.log('ds',div_state,'ps',party_state,'dg',dg,'pg',pg);
            if(div_state == party_state || dg == pg){
                res.json({ 'success': 'true'});
            }else{res.json({ 'success': 'false'})}
        }).populate('ac_state');
    }).populate([{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}]);
});

router.get('/SaleAcInSaleEntry', function (req, res) {
    Gs_master.findOne({group: 'SALE AC TITLE'},function (err, gs_master){
    var qry = req.query.term.term;
    if(qry == undefined || qry == null)FLAG = 1;
    else qry.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
    var qryGs = [];
        for(let i=0; i<gs_master.garry.length; i++){
            qryGs.push(gs_master.garry[i])
        }
    Account_master.find({$or: [{ 'ACName': { $regex: new RegExp("^"+qry,"i")}},{'ACCode': qry}],GroupName :{ $in : qryGs },del:'N',masterid:req.session.masterid},'ACName',  function(err, party){
        // console.log(party);
        var data = new Array();
        if(party==undefined || party == null || party == []){
        }else{
            for (var j = 0; j < party.length; j++) {
                if (party[j]['CityName'] == null || party[j]['CityName'] == undefined || party[j]['CityName'] == '') cityname = "";
                else cityname = party[j]['CityName']['CityName'];
                data[j] = {
                    "id": party[j]._id,
                    "text" : party[j].ACName + ','+ cityname
                    };
            }
            res.json({'results':  data, "pagination": {
                        "more": false
                    } });
        }
    }).sort({'ACName':1}).populate('CityName').limit(100);
})
});
router.get('/productlist', function (req, res) {
    var item =  req.query.item;
    product.find({_id:item,masterid:req.session.masterid,del:"N"}, function(err, product){
       res.json({ 'success': true, 'product': product});
    });
})
router.get('/BillNoData', function (req, res) {
    var BillNo =  req.query.BillNo;
    var c_j_s_p =  req.query.c_j_s_p;
    //    outstanding.find({$or:[{main_bk:'SB'},{op_main_bk:'SB'}],$or:[{c_j_s_p:c_j_s_p},{op_c_j_s_p:c_j_s_p}],vouc_code:BillNo,div_code:req.session.divid,co_code:req.session.compid,del:"N"}, function(err, garudata){
        outstanding.findOne({$or:[{main_bk:'SB'},{main_bk:'OPOS'}],$or:[{c_j_s_p:c_j_s_p},{c_j_s_p:'SB'}],vouc_code:BillNo,div_code:req.session.divid,co_code:req.session.compid,del:"N"}, function(err, garudata){
           var vouc_code;
           var cash_date;
           var cashac_name;
           var broker_Code;
           var cash_amount;
           var Balance_Due = 0;
           var op_main_bk;
           var op_c_j_s_p;
           var op_co_code;
           var op_div_code;
           if(garudata == null || garudata == '' || garudata == []){
           }else{
                for(let i=0; i<garudata.length; i++){
                    if(garudata[i].d_c == 'C'){
                        vouc_code   = garudata[i].vouc_code;
                        // c_j_s_p     = garudata[i].c_j_s_p.Vo_book;
                        cash_date   = garudata[i].cash_date;
                        cashac_name = garudata[i].cashac_name;
                        broker_Code = garudata[i].broker_Code;
                        cash_amount = garudata[i].cash_amount;
                        Balance_Due = Balance_Due + parseFloat(garudata[i].outstanding_amount);
                        op_main_bk  = garudata[i].main_bk;
                        op_c_j_s_p  = garudata[i].c_j_s_p;
                        op_co_code  = garudata[i].co_code;
                        op_div_code = garudata[i].div_code;
                    }
                    if(garudata[i].d_c == 'D'){
                        Balance_Due = Balance_Due - parseFloat(garudata[i].outstanding_amount);
                    }   
                }
           }
            var garudataArr = {'vouc_code':vouc_code,'cash_date':cash_date,'cashac_name':cashac_name,'broker_Code':broker_Code,
                                'cash_amount':cash_amount,'Balance_Due':Balance_Due,'op_main_bk':op_main_bk,'op_c_j_s_p':op_c_j_s_p,
                                'op_co_code':op_co_code,'op_div_code':op_div_code};
       res.json({ 'success': true, 'garudata': garudata});
    }).populate([{path: 'cashac_name',model:'accountSchema',populate:{path:'CityName', model:'citySchema'}}]).populate('broker_Code');
})

var a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
var b = ['Hundred', 'Thousand', 'Lakh', 'Crore'];
var c_0 = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Ninteen'];
var d   = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertNumberToWords(amount) {
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
    amount = amount.toString();
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
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
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
        words_string = words_string.split("  ").join(" ");
    }
    return words_string;
}
router.get('/Sales_Return_Entry_List', ensureAuthenticated ,function(req,res){
    GaruAavak.find({main_bk:"SR", del:"N", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid}, function (err,GaruAavak){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render('Sales_Return_Entry_List.hbs',{
                pageTitle:'Sales Return Entry List',
                GaruAavak:GaruAavak,
                compnm:req.session.compnm,
                divnm:req.session.divmast,
                sdate: req.session.compsdate,
                edate:req.session.compedate,
                usrnm:req.session.user,
                security: req.session.security,
                administrator:req.session.administrator
            });
        }
    }).sort({'vouc_code':1}).populate('party_Code').populate('broker_Code').populate('sl_Person');
});
router.get('/Sales_Return_Entry_Add', ensureAuthenticated, function(req, res){
    gowdown.find({masterid:req.session.masterid, del:"N"}, function (err, gowdown){
        AddLessParameter.findOne({Module:'Sales Return Entry',masterid:req.session.masterid},function(err, AddLessParameter){
            vouchMast.find({Module:'Sales Return Entry',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid}, function(err, vouchMast){
                GaruAavak.aggregate((
                    [{ $match: { main_bk:"SR",c_j_s_p:vouchMast[0].Vo_book,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
                    { $sort: { vouc_code: -1} },
                    { $limit :1 },
                    { $group:
                        {
                            _id: {
                                "_id": "$vouc_code",
                            },
                        }
                    }]
                ),
                function (err, lastEntryNo){
                    if (err) {
                        console.log(err);
                    } else {

                    var last = 1;
                    if(lastEntryNo == '')last = 1;
                    else last = parseInt(lastEntryNo[0]._id._id)+1;

                    var AddlesArr = []
                    if(AddLessParameter == null || AddLessParameter == '' || AddLessParameter == [])flag= 1;
                    else {
                        for(let i=0; i<AddLessParameter.Add_Less_Parameter_Master_Array.length; i++){
                            for(let j=0; j<AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++){
                                if(AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid){
                                    AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                                }
                            }
                        }
                    }
                        res.render('Sales_Return_Entry_Add.hbs', {
                            pageTitle:'Sales Return Entry Add',
                            last: last,
                            gowdown:gowdown,
                            vouchMast:vouchMast,
                            AddLessParameter:AddlesArr,
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
});

router.post('/add',async function(req, res){
    Account_master.findById(req.body.party_Code,async function (err, acmastcustumer){
    AddLessParameter.findOne({Module:'Sales Return Entry',masterid:req.session.masterid},function(err, AddLessParameter){
    division.find({_id:req.session.divid},async function(err, division){
    GaruAavak.aggregate((
        [{ $match: { main_bk:"SR",c_j_s_p:req.body.c_j_s_p,co_code:req.session.compid,div_code:req.session.divid,del:"N" } },
        { $sort: { vouc_code: -1} },
        { $limit :1 },
        { $group:
            {
                _id: {
                    "_id": "$vouc_code",
                },
            }
        }]
    ),
    async function (err, lastEntryNo){
        var last = 1;
        if(lastEntryNo == '')last = 1;
        else last = parseInt(lastEntryNo[0]._id._id)+1;

        var checkNo = await GaruAavak.findOne({vouc_code:req.body.vouc_code,del:'N',main_bk:'SR',c_j_s_p:req.body.c_j_s_p},function(err,aa){}).select('vouc_code');
        if(checkNo == null || checkNo == '')req.body.vouc_code = req.body.vouc_code;
        else req.body.vouc_code = last;

        if(req.body.party_Code=="") req.body.party_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.sl_Person=="") req.body.sl_Person=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        if(req.body.broker_Code=="") req.body.broker_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
        let errors = req.validationErrors();
        var entry_Date = req.body.entry_Date;
        var entry_DateObject =  moment(entry_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var entry_Datemilisecond = entry_DateObject.format('x');

        var do_Date = req.body.do_Date;
        var do_DateObject =  moment(do_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var do_Datemilisecond = do_DateObject.format('x');

        var po_Date = req.body.po_Date;
        var po_DateObject =  moment(po_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
        var po_Datemilisecond = po_DateObject.format('x');

        var AddlesArr = []
        if(AddLessParameter == null || AddLessParameter == '' || AddLessParameter == [])flag= 1;
        else {
            for(let i=0; i<AddLessParameter.Add_Less_Parameter_Master_Array.length; i++){
                for(let j=0; j<AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++){
                    if(AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid){
                        AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                    }
                }
            }
        }
        var custumer = '';
        var intrate = '';
        if(acmastcustumer.PartyType == undefined || acmastcustumer.PartyType == null){
            custumer = mongoose.Types.ObjectId('578df3efb618f5141202a196');
            intrate = 0;
        }
        else{
            custumer = acmastcustumer.PartyType.pur_posting_ac;
            intrate = acmastcustumer.ac_intrestper;
        }
        if(errors){
            console.log(errors);
        }
        else{ 
            let dsi = new GaruAavak();
            dsi.main_bk = "SR";
            dsi.d_c = 'C';
            dsi.c_j_s_p = req.body.c_j_s_p;
            dsi.vouc_code = req.body.vouc_code;
            dsi.entry_Date = entry_DateObject;
            dsi.entry_Datemilisecond = entry_Datemilisecond;
            dsi.do_No = req.body.do_No;
            dsi.do_Date = do_DateObject;
            dsi.do_Datemilisecond= do_Datemilisecond;
            dsi.po_No = req.body.po_No;
            dsi.po_Date = po_DateObject;
            dsi.po_Datemilisecond= po_Datemilisecond;
            dsi.cr_Days = req.body.cr_Days;
            dsi.due_On = req.body.due_On;
            dsi.cashCredit = req.body.cashCredit;
            dsi.lorry_Wagon_No = req.body.lorry_Wagon_No;
            dsi.party_Code = req.body.party_Code;
            dsi.broker_Code = req.body.broker_Code;
            dsi.SB_haste = req.body.SB_haste;
            dsi.sl_Person = req.body.sl_Person;
            dsi.garu_Remarks = req.body.garu_Remarks;
            dsi.gross_Amt = req.body.gross_Amt;
            dsi.garu_Aavak_Group = req.body.garu_Aavak_Group;
            dsi.tot_Amt = req.body.tot_Amt;
            dsi.tot_DisAmt = req.body.tot_DisAmt;
            dsi.tot_AmtBeforeDis = req.body.tot_AmtBeforeDis;
            dsi.tot_TaxAmt = req.body.tot_TaxAmt;
            dsi.tot_AmtBeforeTax = req.body.tot_AmtBeforeTax;
            dsi.tot_APMCAMT = req.body.tot_APMCAMT;
            dsi.add_details = req.body.add_details;
            dsi.less_details = req.body.less_details;
            dsi.Outstanding_Arr = req.body.outSaveArrSaleReturn;
            dsi.co_code = req.session.compid;
            dsi.div_code = req.session.divid;
            dsi.usrnm = req.session.user;
            dsi.masterid = req.session.masterid;
            var Itemarr = []
            for(let p=0; p<req.body.garu_Aavak_Group.length; p++){
                prod = await product.findById(req.body.garu_Aavak_Group[p].item_Code_Desc,function(err,aa){});
                var arr = {'Item':prod.item_title,'Qty':req.body.garu_Aavak_Group[p].qntty};
                Itemarr.push(arr)
            }
            dsi.Item_Detail = Itemarr;
            dsi.Item_Total = req.body.tot_Amt;
            dsi.Gst_Total = req.body.tot_TaxAmt;
            var add_Total = 0;
            var less_Total = 0;
            for(let add=0; add<req.body.add_details.length; add++){
                for(let j=0; j<AddlesArr.length; j++){
                    if(req.body.add_details[add]['particular_amount'] == '' || req.body.add_details[add]['particular_amount'] == null || req.body.add_details[add]['particular_amount'] == undefined || isNaN(req.body.add_details[add]['particular_amount']))req.body.add_details[add]['particular_amount'] = 0;
                    if(req.body.add_details[add]['particular_add'] == AddlesArr[j]._id){
                        if(AddlesArr[j].Description.toUpperCase() == 'SGST' || AddlesArr[j].Description.toUpperCase() == 'IGST' || AddlesArr[j].Description.toUpperCase() == 'CGST')flag = 1;
                        else add_Total = add_Total + parseFloat(req.body.add_details[add]['particular_amount'])
                    }
                }
            }
            for(let ls=0; ls<req.body.less_details.length; ls++){
                if(req.body.less_details[ls]['particular_amtless'] == '' || req.body.less_details[ls]['particular_amtless'] == null || req.body.less_details[ls]['particular_amtless'] == undefined || isNaN(req.body.less_details[ls]['particular_amtless']))req.body.less_details[ls]['particular_amtless'] = 0;
                less_Total = less_Total + parseFloat(req.body.less_details[ls]['particular_amtless'])
            }
            dsi.add_Total = add_Total;
            dsi.less_Total = less_Total;
            dsi.del = 'N';
            dsi.CNCL = 'N';
            dsi.flag = 'N';
            dsi.entrydate = new Date();
            GaruAavak.find({vouc_code:req.body.vouc_code,main_bk:'SR',c_j_s_p:req.body.c_j_s_p,del:'N'},function(err,dsidublicate){
                if(dsidublicate == null || dsidublicate == ''){
                    var acc = {};
                    var qryAcc = {_id:req.body.party_Code};
                    if(acmastcustumer.broker_Code == null || acmastcustumer.broker_Code == '' || acmastcustumer.broker_Code == '578df3efb618f5141202a196' || acmastcustumer.broker_Code == undefined){
                        acc = {};
                        acc.broker_Code = req.body.broker_Code;
                        Account_master.update(qryAcc,acc,function(err){if(err)console.log(err)});
                    }
                    if(acmastcustumer.sl_Person == null || acmastcustumer.sl_Person == '' || acmastcustumer.sl_Person == '578df3efb618f5141202a196' || acmastcustumer.sl_Person == undefined){
                        acc = {};
                        acc.sl_Person = req.body.sl_Person;
                        Account_master.update(qryAcc,acc,function(err){if(err)console.log(err)});
                    }
                    dsi.save(async function (err){
                        if(err)res.json({'success':false,'message':'error in saving domestic sales invoice ','errors':err});
                        else{
                            dsiSave = true;
                        let journal = new journalmast();
                            journal.SaleReturn_id = dsi._id;//trans scema fetech id
                            journal.main_bk = "SR";
                            journal.d_c ="C";
                            journal.vouc_code = req.body.vouc_code;
                            journal.cash_date = entry_DateObject;
                            journal.c_j_s_p = req.body.c_j_s_p;
                            journal.cash_edatemilisecond = entry_Datemilisecond;
                            journal.cashac_name = req.body.party_Code;
                            // journal.cash_bank_name = req.body.party_Code;
                            journal.cash_bank_name = req.body.garu_Aavak_Group[0].sale_Ac_Title;
                            journal.sl_Person = req.body.sl_Person;
                            journal.broker_Code = req.body.broker_Code;
                            journal.cash_narrtwo = 'By Sales Return';
                            journal.cash_narrone = 'Credit';
                            journal.cash_type = "Sales Return";
                            journal.cr_Days = req.body.cr_Days;
                            journal.due_On = req.body.due_On;
                            journal.cashCredit = req.body.cashCredit;
                            journal.ac_intrestper = intrate;
                            journal.cash_remarks = req.body.garu_Remarks
                            journal.del = "N";
                            journal.CNCL = "N";
                            journal.entrydate = new Date();
                            journal.cash_amount = req.body.gross_Amt;
                            journal.co_code = req.session.compid;
                            journal.div_code = req.session.divid;
                            journal.usrnm = req.session.user;
                            journal.masterid = req.session.masterid;
                            
                            journal.Item_Detail = Itemarr;
                            journal.Item_Total = req.body.tot_Amt;
                            journal.Gst_Total = req.body.tot_TaxAmt;
                            journal.add_Total = add_Total;
                            journal.less_Total = less_Total;
                            journal.save();
                            if(req.body.garu_Aavak_Group == null || req.body.garu_Aavak_Group == '' || req.body.garu_Aavak_Group == []){
                            }else{
                                for (let i = 0; i <req.body.garu_Aavak_Group.length; i++)
                                {
                                let journalPrdt = new journalmast();
                                    journalPrdt.SaleReturn_id = dsi._id;//trans scema fetech id
                                    journalPrdt.main_bk = "PrdtPostingSaleReturnEntry"+i;
                                    journalPrdt.d_c ="D";
                                    journalPrdt.vouc_code = req.body.vouc_code;
                                    journalPrdt.cash_date = entry_DateObject;
                                    journalPrdt.c_j_s_p = req.body.c_j_s_p;
                                    journalPrdt.cash_edatemilisecond = entry_Datemilisecond;
                                    journalPrdt.cashac_name = req.body.garu_Aavak_Group[i].sale_Ac_Title;
                                    journalPrdt.cash_bank_name = req.body.party_Code;
                                    journalPrdt.sl_Person = req.body.sl_Person;
                                    journalPrdt.broker_Code = req.body.broker_Code;
                                    journalPrdt.cash_narrone = 'Product Posting';
                                    journalPrdt.cash_narrtwo = req.body.garu_Aavak_Group[i].sale_Ac_Title_Name;
                                    journalPrdt.cash_type = "Sale Return Product Posting";
                                    journalPrdt.cash_amount = req.body.garu_Aavak_Group[i]['net_Amount'];
                                    journalPrdt.cash_remarks = req.body.garu_Remarks
                                    journalPrdt.del = "N";
                                    journalPrdt.CNCL = "N";
                                    journalPrdt.entrydate = new Date();
                                    journalPrdt.co_code = req.session.compid;
                                    journalPrdt.div_code = req.session.divid;
                                    journalPrdt.usrnm = req.session.user;
                                    journalPrdt.masterid = req.session.masterid;
                                    journalPrdt.save();
                                }
                            }
                            for (let i = 0; i <req.body.add_details.length; i++)
                            {
                                if(req.body.add_details[i]['particular_add']=="") req.body.add_details[i]['particular_add']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                for(let j=0; j<AddlesArr.length; j++){
                                    // console.log(req.body.add_details[i]['particular_add'],addlessmast[j]._id)
                                    if(req.body.add_details[i]['particular_add'] == AddlesArr[j]._id){
                                        req.body.add_details[i]['particular_add'],
                                        req.body.add_details[i]['particular_amount']
                                            let journaladd = new journalmast();
                                            journaladd.SaleReturn_id = dsi._id;//trans scema fetech id
                                            journaladd.main_bk = "XSRA"+i;
                                            journaladd.d_c ="D";
                                            journaladd.vouc_code = req.body.vouc_code;
                                            journaladd.cash_date =entry_DateObject;
                                            journaladd.c_j_s_p = req.body.c_j_s_p;
                                            journaladd.cash_edatemilisecond = entry_Datemilisecond;
                                            journaladd.cashac_name = AddlesArr[j].Posting_Ac;
                                            journaladd.cash_bank_name = req.body.party_Code;
                                            journaladd.sl_Person = req.body.sl_Person;
                                            journaladd.broker_Code = req.body.broker_Code;
                                            journaladd.cash_narrone = 'Credit';
                                            journaladd.cash_narrtwo = AddlesArr[j].Description;
                                            journaladd.cash_type = "Sales Return";
                                            journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                            journaladd.cash_remarks = req.body.garu_Remarks
                                            journaladd.del = "N";
                                            journaladd.CNCL = "N";
                                            journaladd.entrydate = new Date();
                                            journaladd.co_code = req.session.compid;
                                            journaladd.div_code = req.session.divid;
                                            journaladd.usrnm = req.session.user;
                                            journaladd.masterid = req.session.masterid;
                                            journaladd.save();
                                            // console.log('add',req.body.add_details[i]['particular_add'],addlessmast[j].sales_posting_ac)
                                            break;
                                    }
                                }
                            }
                            // less trans entry
                            for (let i = 0; i <req.body.less_details.length; i++)
                            {
                                if(req.body.less_details[i]['particular_less']=="") req.body.less_details[i]['particular_less']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                for(let j=0; j<AddlesArr.length; j++){
                                    if(req.body.less_details[i]['particular_less'] == AddlesArr[j]._id){
                                        req.body.less_details[i]['particular_less'],
                                        req.body.less_details[i]['particular_amtless']
                                        let journalless = new journalmast();
                                            journalless.SaleReturn_id = dsi._id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                            journalless.main_bk = "XSRL"+i;
                                            journalless.d_c ="C";
                                            journalless.vouc_code = req.body.vouc_code;
                                            journalless.cash_date =entry_DateObject;
                                            journalless.c_j_s_p = req.body.c_j_s_p;
                                            journalless.cash_edatemilisecond = entry_Datemilisecond;
                                            journalless.cashac_name = AddlesArr[j].Posting_Ac;
                                            journalless.cash_bank_name = req.body.party_Code;
                                            journalless.sl_Person = req.body.sl_Person;
                                            journalless.broker_Code = req.body.broker_Code;
                                            journalless.cash_narrone = 'Credit';
                                            journalless.cash_narrtwo = AddlesArr[j].Description;
                                            journalless.cash_type = "Sales Return";
                                            journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                            journalless.cash_remarks = req.body.garu_Remarks
                                            journalless.del = "N";
                                            journalless.CNCL = "N";
                                            journalless.entrydate = new Date();
                                            journalless.co_code = req.session.compid;
                                            journalless.div_code = req.session.divid;
                                            journalless.usrnm = req.session.user;
                                            journalless.masterid = req.session.masterid;
                                            journalless.save();
                                            // console.log('less',req.body.less_details[i]['particular_less'],addlessmast[j].sales_posting_ac);
                                        break;
                                    }
                                }
                            }
                            if(req.body.outSaveArrSaleReturn == null || req.body.outSaveArrSaleReturn == '' || req.body.outSaveArrSaleReturn == [] || req.body.outSaveArrSaleReturn == undefined)flag=1
                            else{
                                var outSaveArr = JSON.parse(req.body.outSaveArrSaleReturn);
                                for(let j=0; j<outSaveArr.length; j++){
                                    if(parseFloat(outSaveArr[j].ReceiveAmt) > 0){
                                        let out = new outstanding();
                                            out.SaleReturn_id = dsi._id;
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.main_bk = "OnAcc";
                                                out.OS_Type = 'ONA';
                                            }else out.main_bk = "SR";

                                            out.c_j_s_p = req.body.c_j_s_p;
                                            out.d_c ="C";
                                            out.SR_vouc_code = req.body.vouc_code;
                                            out.cash_date = entry_DateObject;
                                            out.cash_edatemilisecond = entry_Datemilisecond;

                                            out.vouc_code    = outSaveArr[j].vouc_code;
                                            out.cashac_name  = req.body.party_Code;
                                            out.cash_narrtwo = 'Sale Return '+req.body.c_j_s_p+'/'+req.body.vouc_code;
                                            out.cash_narrone = 'Sale Bill '+outSaveArr[j].c_j_s_p+'/'+outSaveArr[j].vouc_code;
                                            out.del          = "N";
                                            out.CNCL = "N";
                                            out.entrydate    = new Date();
                                            out.cash_amount  = outSaveArr[j].cash_amount;
                                            out.Bill_Amount  = outSaveArr[j].Bill_Amt;
                                            out.Bill_Date    = outSaveArr[j].Bill_Date;
                                            out.Rec_Amount   = outSaveArr[j].ReceiveAmt;
                                            
                                            out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                            out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                            if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1
                                            out.outstanding_balance = outSaveArr[j].BalanceAmt;
                                            out.outstanding_amount = parseFloat(outSaveArr[j].ReceiveAmt); //Calulate Outstanding Balance For Bill Collection
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                                out.op_outstanding_id  = '';
                                            }else{
                                                out.outstanding_id = outSaveArr[j].out_id;
                                                out.op_outstanding_id  = outSaveArr[j].out_id;
                                            }
                                            out.op_main_bk  = outSaveArr[j].main_bk;
                                            out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                            out.op_co_code  = outSaveArr[j].co_code;
                                            out.op_div_code = outSaveArr[j].div_code;
    
                                            out.co_code     = req.session.compid;
                                            out.div_code    = req.session.divid;
                                            out.usrnm       = req.session.user;
                                            out.masterid    = req.session.masterid;
                                            out.CNCL        = 'N';
                                            out.save();
                                            if(outSaveArr[j].c_j_s_p != 'OnAcc'){
                                                var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                                var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.SR_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                                OutSB.Out_recieved_Entry_Arr.push(arr);
                                                var outObj = {};
                                                outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.Bill_Amount = parseFloat(OutSB.Bill_Amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.cash_amount = parseFloat(OutSB.cash_amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                                outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                                    if(err)console.log('Error',err)
                                                    else {}
                                                });
                                            }
                                            
                                    }
                                }
                            }
                            res.redirect('/Sales_Return_Entry/Sales_Return_Entry_Add');
                        }
                    })
                }else{
                    res.send("<script>alert('This Entry No. Is Already Exist');window.location.href = '/Sales_Return_Entry/Sales_Return_Entry_Add'</script>");
                }
            })
        }
    });
    });
    });
    }).populate('PartyType');
});

router.get('/Sales_Return_Entry_Update/:id', ensureAuthenticated, function(req, res){
    var length = 0;
    gowdown.find({masterid:req.session.masterid, del:"N"}, function (err, gowdown){
        GaruAavak.findById(req.params.id, function (err, GaruAavak){  
            if(GaruAavak != null){
                AddLessParameter.findOne({Module:'Sales Return Entry',masterid:req.session.masterid},function(err, AddLessParameter){
                    vouchMast.find({Module:'Sales Return Entry',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid},async function(err, vouchMast){
                        outstanding.find({SaleReturn_id:req.params.id,del:'N'},function(err,OutEntry){
                        if (err) {
                            console.log(err);
                        } else {
                            if(GaruAavak == null || GaruAavak == '' || GaruAavak == undefined){length = length}
                            else {
                                // var outBalance = await outstanding.findOne({SaleEntry_id:GaruAavak._id},function(err,outBalance){}).select('outstanding_balance');
                                length = GaruAavak.garu_Aavak_Group.length;
                                // outBalance = outBalance.outstanding_balance
                            }
                            var AddlesArr = [];
                            if(AddLessParameter == null || AddLessParameter == '' || AddLessParameter == [])flag= 1;
                            else {
                                for(let i=0; i<AddLessParameter.Add_Less_Parameter_Master_Array.length; i++){
                                    for(let j=0; j<AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++){
                                        if(AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid){
                                            AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                                        }
                                    }
                                }
                            }
                            res.render('Sales_Return_Entry_Update.hbs',{
                                pageTitle:'Update Sale Return Entry',
                                GaruAavak:GaruAavak,
                                OutEntry:OutEntry,
                                length:length,
                                vouchMast:vouchMast,
                                gowdown:gowdown,
                                AddLessParameter:AddlesArr,
                                compnm:req.session.compnm,
                                divnm:req.session.divmast,
                                sdate: req.session.compsdate,
                                edate:req.session.compedate,
                                usrnm:req.session.user,
                                security: req.session.security,
                                administrator:req.session.administrator
                            })
                        }
                    });
                });
                });
            } 
        })
        .populate([{path: 'party_Code',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
        .populate([{path: 'broker_Code',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
        .populate([{path: 'sl_Person',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
        .populate('garu_Aavak_Group.sale_Ac_Title').populate('garu_Aavak_Group.item_Code_Desc');
    })
});

router.post('/update/:id', function(req, res) {
    Account_master.findById(req.body.party_Code, function (err, acmastcustumer){
    AddLessParameter.findOne({Module:'Sales Return Entry',masterid:req.session.masterid},async function(err, AddLessParameter){
    if(req.body.party_Code=="") req.body.party_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.sl_Person=="") req.body.sl_Person=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.broker_Code=="") req.body.broker_Code=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    var entry_Date = req.body.entry_Date;
    var entry_DateObject =  moment(entry_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var entry_Datemilisecond = entry_DateObject.format('x');

    var do_Date = req.body.do_Date;
    var do_DateObject =  moment(do_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var do_Datemilisecond = do_DateObject.format('x');

    var po_Date = req.body.po_Date;
    var po_DateObject =  moment(po_Date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    var po_Datemilisecond = po_DateObject.format('x');
    var AddlesArr = []
    if(AddLessParameter == null || AddLessParameter == '' || AddLessParameter == [])flag= 1;
    else {
        for(let i=0; i<AddLessParameter.Add_Less_Parameter_Master_Array.length; i++){
            for(let j=0; j<AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++){
                if(AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid){
                    AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                }
            }
        }
    }
    var custumer = '';
    var intrate = '';
    // console.log(acmastcustumer)
    if(acmastcustumer.PartyType == undefined || acmastcustumer.PartyType == null){
        custumer = mongoose.Types.ObjectId('578df3efb618f5141202a196');
        intrate = 0;
    }
    else{
        custumer = acmastcustumer.PartyType.pur_posting_ac;
        intrate = acmastcustumer.ac_intrestper;
    }
        // console.log(custumer);
        if(errors){
            console.log(errors);
        }
        else{ 
            let dsi = {};
            dsi.main_bk = "SR";
            dsi.d_c = 'C';
            dsi.c_j_s_p = req.body.c_j_s_p;
            dsi.vouc_code = req.body.vouc_code;
            dsi.entry_Date =entry_DateObject;
            dsi.entry_Datemilisecond = entry_Datemilisecond;
            dsi.do_No = req.body.do_No;
            dsi.do_Date = do_DateObject;
            dsi.do_Datemilisecond= do_Datemilisecond;
            dsi.po_No = req.body.po_No;
            dsi.po_Date = po_DateObject;
            dsi.po_Datemilisecond= po_Datemilisecond;
            dsi.cr_Days = req.body.cr_Days;
            dsi.due_On = req.body.due_On;
            dsi.cashCredit = req.body.cashCredit;
            dsi.lorry_Wagon_No = req.body.lorry_Wagon_No;
            dsi.party_Code = req.body.party_Code;
            dsi.broker_Code = req.body.broker_Code;
            dsi.sl_Person = req.body.sl_Person;
            dsi.garu_Remarks = req.body.garu_Remarks;
            dsi.gross_Amt = req.body.gross_Amt;
            dsi.garu_Aavak_Group = req.body.garu_Aavak_Group;
            dsi.tot_Amt = req.body.tot_Amt;
            dsi.tot_DisAmt = req.body.tot_DisAmt;
            dsi.tot_AmtBeforeDis = req.body.tot_AmtBeforeDis;
            dsi.tot_TaxAmt = req.body.tot_TaxAmt;
            dsi.tot_AmtBeforeTax = req.body.tot_AmtBeforeTax;
            dsi.tot_APMCAMT = req.body.tot_APMCAMT;
            dsi.add_details = req.body.add_details;
            dsi.less_details = req.body.less_details;
            dsi.Outstanding_Arr = req.body.outSaveArrSaleReturn;
            dsi.co_code = req.session.compid;
            dsi.div_code = req.session.divid;
            dsi.usrnm = req.session.user;
            dsi.masterid = req.session.masterid;
            var Itemarr = []
            for(let p=0; p<req.body.garu_Aavak_Group.length; p++){
                prod = await product.findById(req.body.garu_Aavak_Group[p].item_Code_Desc,function(err,aa){});
                var arr = {'Item':prod.item_title,'Qty':req.body.garu_Aavak_Group[p].qntty};
                Itemarr.push(arr)
            }
            dsi.Item_Detail = Itemarr;
            dsi.Item_Total = req.body.tot_Amt;
            dsi.Gst_Total = req.body.tot_TaxAmt;
            var add_Total = 0;
            var less_Total = 0;
            for(let add=0; add<req.body.add_details.length; add++){
                for(let j=0; j<AddlesArr.length; j++){
                    if(req.body.add_details[add]['particular_amount'] == '' || req.body.add_details[add]['particular_amount'] == null || req.body.add_details[add]['particular_amount'] == undefined || isNaN(req.body.add_details[add]['particular_amount']))req.body.add_details[add]['particular_amount'] = 0;
                    if(req.body.add_details[add]['particular_add'] == AddlesArr[j]._id){
                        if(AddlesArr[j].Description.toUpperCase() == 'SGST' || AddlesArr[j].Description.toUpperCase() == 'IGST' || AddlesArr[j].Description.toUpperCase() == 'CGST')flag = 1;
                        else add_Total = add_Total + parseFloat(req.body.add_details[add]['particular_amount'])
                    }
                }
            }
            for(let ls=0; ls<req.body.less_details.length; ls++){
                if(req.body.less_details[ls]['particular_amtless'] == '' || req.body.less_details[ls]['particular_amtless'] == null || req.body.less_details[ls]['particular_amtless'] == undefined || isNaN(req.body.less_details[ls]['particular_amtless']))req.body.less_details[ls]['particular_amtless'] = 0;
                less_Total = less_Total + parseFloat(req.body.less_details[ls]['particular_amtless'])
            }
            dsi.add_Total = add_Total;
            dsi.less_Total = less_Total;
            dsi.del = 'N';
            dsi.CNCL = 'N';
            dsi.flag = 'N';
            dsi.update = new Date();

            let query = {_id:req.params.id}
            GaruAavak.update(query ,dsi ,async function (err) {
                if (err) {
                    res.json({ 'success': false, 'message': 'Error in Saving Domestic Sales Invoice', 'errors': err });
                }else{
                        let journal = {};
                        journal.SaleReturn_id = req.params.id;//trans scema fetech id
                        journal.main_bk = "SR";
                        journal.d_c ="C";
                        journal.vouc_code = req.body.vouc_code;
                        journal.cash_date =entry_DateObject;
                        journal.c_j_s_p = req.body.c_j_s_p;
                        journal.cash_edatemilisecond = entry_Datemilisecond;
                        journal.cashac_name = req.body.party_Code;
                        // journal.cash_bank_name = req.body.party_Code;
                        req.body.garu_Aavak_Group[0].sale_Ac_Title;
                        journal.sl_Person = req.body.sl_Person;
                        journal.broker_Code = req.body.broker_Code;
                        journal.cash_narrtwo = 'By Sales Return';
                        journal.cash_narrone = 'Credit';
                        journal.cash_type = "Sales Return";
                        journal.cr_Days = req.body.cr_Days;
                        journal.due_On = req.body.due_On;
                        journal.cashCredit = req.body.cashCredit;
                        journal.ac_intrestper = intrate;
                        journal.cash_remarks = req.body.garu_Remarks
                        journal.del = "N";
                        journal.CNCL = 'N';
                        journal.entrydate = new Date();
                        journal.cash_amount = req.body.gross_Amt;
                        journal.co_code = req.session.compid;
                        journal.div_code = req.session.divid;
                        journal.usrnm = req.session.user;
                        journal.masterid = req.session.masterid;

                        journal.Item_Detail = Itemarr;
                        journal.Item_Total  = req.body.tot_Amt;
                        journal.Gst_Total   = req.body.tot_TaxAmt;
                        journal.add_Total   = add_Total;
                        journal.less_Total  = less_Total;

                        query = {SaleReturn_id:req.params.id,main_bk:'SR'}
                        journalmast.update(query , journal ,function (err) {
                            if (err) {
                                // res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                            } 
                        });
                        if(req.body.garu_Aavak_Group == null || req.body.garu_Aavak_Group == '' || req.body.garu_Aavak_Group == []){

                        }else{
                            for (let i = 0; i <req.body.garu_Aavak_Group.length; i++)
                            {
                                if(req.body.garu_Aavak_Group[i].UpdateSaleEntry == 'UpdateSaleEntry'){
                                    let journalPrdt = {};
                                    journalPrdt.SaleReturn_id = req.params.id;//trans scema fetech id
                                    journalPrdt.main_bk = "PrdtPostingSaleReturnEntry"+i;
                                    journalPrdt.d_c ="D";
                                    journalPrdt.vouc_code = req.body.vouc_code;
                                    journalPrdt.cash_date = entry_DateObject;
                                    journalPrdt.c_j_s_p = req.body.c_j_s_p;
                                    journalPrdt.cash_edatemilisecond = entry_Datemilisecond;
                                    journalPrdt.cashac_name = req.body.garu_Aavak_Group[i].sale_Ac_Title;
                                    journalPrdt.cash_bank_name = req.body.party_Code;
                                    journalPrdt.sl_Person = req.body.sl_Person;
                                    journalPrdt.broker_Code = req.body.broker_Code;
                                    journalPrdt.cash_narrone = 'Product Posting';
                                    journalPrdt.cash_narrtwo = req.body.garu_Aavak_Group[i].sale_Ac_Title_Name;
                                    journalPrdt.cash_type = "Sales Return";
                                    journalPrdt.cash_amount = req.body.garu_Aavak_Group[i]['net_Amount'];
                                    journalPrdt.cash_remarks = req.body.garu_Remarks
                                    journalPrdt.del = "N";
                                    journalPrdt.CNCL = 'N';
                                    journalPrdt.entrydate = new Date();
                                    journalPrdt.co_code = req.session.compid;
                                    journalPrdt.div_code = req.session.divid;
                                    journalPrdt.usrnm = req.session.user;
                                    journalPrdt.masterid = req.session.masterid;
                                    var main_bk = 'PrdtPostingSaleReturnEntry'+i;
                                    var queryPrdt = {SaleReturn_id:req.params.id,main_bk:main_bk};
                                    journalmast.update(queryPrdt, journalPrdt,function (err) {
                                        if (err) {
                                        } 
                                    });
                                }else{
                                    let journalPrdt = new journalmast();
                                    journalPrdt.SaleReturn_id = req.params.id;//trans scema fetech id
                                    journalPrdt.main_bk = "PrdtPostingSaleReturnEntry"+i;
                                    journalPrdt.d_c ="D";
                                    journalPrdt.vouc_code = req.body.vouc_code;
                                    journalPrdt.cash_date = entry_DateObject;
                                    journalPrdt.c_j_s_p = req.body.c_j_s_p;
                                    journalPrdt.cash_edatemilisecond = entry_Datemilisecond;
                                    journalPrdt.cashac_name = req.body.garu_Aavak_Group[i].sale_Ac_Title;
                                    journalPrdt.cash_bank_name = req.body.party_Code;
                                    journalPrdt.sl_Person = req.body.sl_Person;
                                    journalPrdt.broker_Code = req.body.broker_Code;
                                    journalPrdt.cash_narrone = 'Product Posting';
                                    journalPrdt.cash_narrtwo = req.body.garu_Aavak_Group[i].sale_Ac_Title_Name;
                                    journalPrdt.cash_type = "Sale Product Posting";
                                    journalPrdt.cash_amount = req.body.garu_Aavak_Group[i]['net_Amount'];
                                    journalPrdt.cash_remarks = req.body.garu_Remarks
                                    journalPrdt.del = "N";
                                    journalPrdt.CNCL = 'N';
                                    journalPrdt.entrydate = new Date();
                                    journalPrdt.co_code = req.session.compid;
                                    journalPrdt.div_code = req.session.divid;
                                    journalPrdt.usrnm = req.session.user;
                                    journalPrdt.masterid = req.session.masterid;
                                    journalPrdt.save();
                                }
                            }
                        }
                        for (let i = 0; i <req.body.add_details.length; i++)
                            {
                                if(req.body.add_details[i]['particular_add']=="") req.body.add_details[i]['particular_add']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                for(let j=0; j<AddlesArr.length; j++){
                                    if(req.body.add_details[i]['particular_add'] == AddlesArr[j]._id){
                                        req.body.add_details[i]['particular_add'],
                                        req.body.add_details[i]['particular_amount']
                                        if(req.body.add_details[i]['Add_Id'] != '' && req.body.add_details[i]['Add_Id'] != undefined){
                                            let journaladd = {};
                                            journaladd.SaleReturn_id = req.params.id;//trans scema fetech id
                                            journaladd.main_bk = "XSRA"+i;
                                            journaladd.d_c ="D";
                                            journaladd.vouc_code = req.body.vouc_code;
                                            journaladd.cash_date = entry_DateObject;
                                            journaladd.c_j_s_p = req.body.c_j_s_p;
                                            journaladd.cash_edatemilisecond = entry_Datemilisecond;
                                            journaladd.cashac_name = AddlesArr[j].Posting_Ac;
                                            journaladd.cash_bank_name = req.body.party_Code;
                                            journaladd.sl_Person = req.body.sl_Person;
                                            journaladd.broker_Code = req.body.broker_Code;
                                            journaladd.cash_narrone = 'Debit';
                                            journaladd.cash_narrtwo = AddlesArr[j].Description;
                                            journaladd.cash_type = "Sales Return";
                                            journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                            journaladd.cash_remarks = req.body.garu_Remarks
                                            journaladd.del = "N";
                                            journaladd.CNCL = 'N';
                                            journaladd.entrydate = new Date();
                                            journaladd.co_code = req.session.compid;
                                            journaladd.div_code = req.session.divid;
                                            journaladd.usrnm = req.session.user;
                                            journaladd.masterid = req.session.masterid
                                            var main_bk = 'XSRA'+i;
                                            var queryadd = {SaleReturn_id:req.params.id,main_bk:main_bk};
                                            journalmast.update(queryadd, journaladd,function (err) {
                                                if (err) {
                                                    // res.json({ 'success': false, 'message': 'Error in Saving Journal', 'errors': err });
                                                } 
                                            });
                                            break;
                                        }else{
                                            let journaladd = new journalmast();
                                            journaladd.SaleReturn_id = req.params.id;//trans scema fetech id
                                            journaladd.main_bk = "XSRA"+i;
                                            journaladd.d_c ="D";
                                            journaladd.vouc_code = req.body.vouc_code;
                                            journaladd.cash_date = entry_DateObject;
                                            journaladd.c_j_s_p = req.body.c_j_s_p;
                                            journaladd.cash_edatemilisecond = entry_Datemilisecond;
                                            journaladd.cashac_name = AddlesArr[j].Posting_Ac;
                                            journaladd.cash_bank_name = req.body.party_Code;
                                            journaladd.sl_Person = req.body.sl_Person;
                                            journaladd.broker_Code = req.body.broker_Code;
                                            journaladd.cash_narrone = 'Credit';
                                            journaladd.cash_narrtwo = AddlesArr[j].Description;
                                            journaladd.cash_type = "Sales Return";
                                            journaladd.cash_amount = req.body.add_details[i]['particular_amount'];
                                            journaladd.cash_remarks = req.body.garu_Remarks
                                            journaladd.del = "N";
                                            journaladd.CNCL = 'N';
                                            journaladd.entrydate = new Date();
                                            journaladd.co_code = req.session.compid;
                                            journaladd.div_code = req.session.divid;
                                            journaladd.usrnm = req.session.user;
                                            journaladd.masterid = req.session.masterid
                                            journaladd.save();
                                            break;
                                        }
                                    }
                                }
                            }
                            // less trans entry
                            for (let i = 0; i <req.body.less_details.length; i++)
                            {
                                if(req.body.less_details[i]['particular_less']=="") req.body.less_details[i]['particular_less']=mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                for(let j=0; j<AddlesArr.length; j++){
                                    if(req.body.less_details[i]['particular_less'] == AddlesArr[j]._id){
                                        req.body.less_details[i]['particular_less'],
                                        req.body.less_details[i]['particular_amtless']
                                        if(req.body.less_details[i]['Less_Id'] != '' && req.body.less_details[i]['Less_Id'] != undefined){
                                            let journalless = {};
                                            journalless.SaleReturn_id = req.params.id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                            journalless.main_bk = "XSRL"+i;
                                            journalless.d_c ="C";
                                            journalless.vouc_code = req.body.vouc_code;
                                            journalless.cash_date = entry_DateObject;
                                            journalless.c_j_s_p = req.body.c_j_s_p;
                                            journalless.cash_edatemilisecond = entry_Datemilisecond;
                                            journalless.cashac_name = AddlesArr[j].Posting_Ac;
                                            journalless.cash_bank_name = req.body.party_Code;
                                            journalless.sl_Person = req.body.sl_Person;
                                            journalless.broker_Code = req.body.broker_Code;
                                            journalless.cash_narrone = 'Credit';
                                            journalless.cash_narrtwo = AddlesArr[j].Description;
                                            journalless.cash_type = "Sales Return";
                                            journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                            journalless.cash_remarks = req.body.garu_Remarks
                                            journalless.del = "N";
                                            journalless.CNCL = "N";
                                            journalless.entrydate = new Date();
                                            journalless.co_code = req.session.compid;
                                            journalless.div_code = req.session.divid;
                                            journalless.usrnm = req.session.user;
                                            journalless.masterid = req.session.masterid;
                                                var main_bk = 'XSRL'+i;
                                                var queryless = {SaleReturn_id:req.params.id,main_bk:main_bk};
                                                journalmast.update(queryless,journalless,function (err) {
                                                    if (err) {
                                                        console.log(err);
                                                    } 
                                                });
                                                break;
                                        }else{
                                            let journalless = new journalmast();
                                            journalless.SaleReturn_id = req.params.id;//trans scema fetech id   // && req.body.less_details[i]['particular_amtless']>0
                                            journalless.main_bk = "XSRL"+i;
                                            journalless.d_c ="C";
                                            journalless.vouc_code = req.body.vouc_code;
                                            journalless.cash_date =entry_DateObject;
                                            journalless.c_j_s_p = req.body.c_j_s_p;
                                            journalless.cash_edatemilisecond = entry_Datemilisecond;
                                            journalless.cashac_name = AddlesArr[j].Posting_Ac;
                                            journalless.cash_bank_name = req.body.party_Code;
                                            journalless.sl_Person = req.body.sl_Person;
                                            journalless.broker_Code = req.body.broker_Code;
                                            journalless.cash_narrone = 'Credit';
                                            journalless.cash_narrtwo = AddlesArr[j].Description;
                                            journalless.cash_type = "Sales Return";
                                            journalless.cash_amount = req.body.less_details[i]['particular_amtless'];
                                            journalless.cash_remarks = req.body.garu_Remarks
                                            journalless.del = "N";
                                            journalless.CNCL = "N";
                                            journalless.entrydate = new Date();
                                            journalless.co_code = req.session.compid;
                                            journalless.div_code = req.session.divid;
                                            journalless.usrnm = req.session.user;
                                            journalless.masterid = req.session.masterid;
                                            journalless.save();
                                            break;
                                        }
                                    }
                                }
                            }
                            if(req.body.outSaveArrSaleReturn == null || req.body.outSaveArrSaleReturn == '' || req.body.outSaveArrSaleReturn == [] || req.body.outSaveArrSaleReturn == undefined)flag=1
                            else{
                                var outSaveArr = JSON.parse(req.body.outSaveArrSaleReturn);
                                for(let j=0; j<outSaveArr.length; j++){
                                    if(parseFloat(outSaveArr[j].ReceiveAmt) > 0){
                                        if(outSaveArr[j].OutEntry_id == null || outSaveArr[j].OutEntry_id == '' || outSaveArr[j].OutEntry_id == undefined){
                                            let out = new outstanding();
                                            out.SaleReturn_id = req.params.id;
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.main_bk = "OnAcc";
                                                out.OS_Type = 'ONA';
                                            }
                                            else out.main_bk = "SR";
                                            out.c_j_s_p = req.body.c_j_s_p;
                                            out.d_c ="C";
                                            out.CN_vouc_code = req.body.vouc_code;
                                            out.vouc_code = outSaveArr[j].vouc_code;
                                            out.cash_date = entry_DateObject;
                                            out.cash_edatemilisecond = entry_Datemilisecond;
                                            out.cashac_name = req.body.party_Code;
                                            // out.cash_bank_name = req.body.cash_bank_name;
                                            out.cash_narrtwo = 'Oustanding';
                                            out.cash_narrone = 'Sale Return Entry';
                                            out.del         = "N";
                                            out.CNCL        = "N";
                                            out.entrydate   = new Date();
                                            out.cash_amount = outSaveArr[j].ReceiveAmt;
                                            out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                            out.Bill_Date   = outSaveArr[j].Bill_Date;
                                            out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                            // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                            // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                            if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                            out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);
        
                                            out.outstanding_amount = outSaveArr[j].ReceiveAmt //Calulate Outstanding Balance For Bill Collection
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                                out.op_outstanding_id  = '';
                                            }else{
                                                out.outstanding_id = outSaveArr[j].out_id;
                                                out.op_outstanding_id  = outSaveArr[j].out_id;
                                            }
                                            
                                            out.op_main_bk  = outSaveArr[j].main_bk;
                                            out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                            out.op_co_code  = outSaveArr[j].co_code;
                                            out.op_div_code = outSaveArr[j].div_code;
        
                                            out.co_code  = req.session.compid;
                                            out.div_code = req.session.divid;
                                            out.usrnm = req.session.user;
                                            out.masterid = req.session.masterid;
                                            out.save();
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            }
                                            else{
                                                var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                                var arr = {'Out_Entry_Id':out._id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.CN_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                                OutSB.Out_recieved_Entry_Arr.push(arr);
                                                var outObj = {};
                                                outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.outstanding_amount = parseFloat(OutSB.outstanding_amount)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                                    if(err)console.log('Error',err)
                                                    else {}
                                                })
                                            }
                                        }else{
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            }
                                            else{
                                                var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                                var OutEntry = await outstanding.findById(outSaveArr[j].OutEntry_id,function(err,aa){});
                                                var outObj = {};
                                                outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)+parseFloat(OutEntry.Rec_Amount);
                                                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)-parseFloat(OutEntry.Rec_Amount);
                                                outObj.outstanding_amount = parseFloat(OutSB.outstanding_balance)+parseFloat(OutEntry.Rec_Amount);
                                                outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                                    if(err)console.log('Error',err)
                                                    else {}
                                                })
                                            }
                                            let out = {};
                                            out.SaleReturn_id = req.params.id;
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.main_bk = "OnAcc";
                                                out.OS_Type = 'ONA';
                                            }
                                            else out.main_bk = "SN";
                                            out.c_j_s_p = req.body.c_j_s_p;
                                            out.d_c ="C";
                                            out.CN_vouc_code = req.body.vouc_code;
                                            out.vouc_code = outSaveArr[j].vouc_code;
                                            out.cash_date = entry_DateObject;
                                            out.cash_edatemilisecond = entry_Datemilisecond;
                                            out.cashac_name = req.body.party_Code;
                                            // out.cash_bank_name = req.body.cash_bank_name;
                                            out.cash_narrtwo = 'Oustanding';
                                            out.cash_narrone = 'Sale Return Entry';
                                            out.del         = "N";
                                            out.CNCL         = "N";
                                            out.entrydate   = new Date();
                                            out.cash_amount = outSaveArr[j].ReceiveAmt;
                                            out.Bill_Amount = outSaveArr[j].Bill_Amt;
                                            out.Bill_Date   = outSaveArr[j].Bill_Date;
                                            out.Rec_Amount  = outSaveArr[j].ReceiveAmt;
                                            // out.Add_Ded_Amt_Tot = outSaveArr[j].Add_Ded_Amt_Tot;
                                            // out.Less_Ded_Amt_Tot = outSaveArr[j].Less_Ded_Amt_Tot;
                                            if(outSaveArr[j].BalanceAmt<0)outSaveArr[j].BalanceAmt = outSaveArr[j].BalanceAmt*-1;
                                            out.outstanding_balance = parseFloat(outSaveArr[j].BalanceAmt);
        
                                            out.outstanding_amount = parseFloat(outSaveArr[j].ReceiveAmt) //Calulate Outstanding Balance For Bill Collection
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                                out.outstanding_id = mongoose.Types.ObjectId('578df3efb618f5141202a196');
                                                out.op_outstanding_id  = '';
                                            }else{
                                                out.outstanding_id = outSaveArr[j].out_id;
                                                out.op_outstanding_id  = outSaveArr[j].out_id;
                                            }
                                            
                                            out.op_main_bk  = outSaveArr[j].main_bk;
                                            out.op_c_j_s_p  = outSaveArr[j].c_j_s_p;
                                            out.op_co_code  = outSaveArr[j].co_code;
                                            out.op_div_code = outSaveArr[j].div_code;
        
                                            out.co_code  = req.session.compid;
                                            out.div_code = req.session.divid;
                                            out.usrnm = req.session.user;
                                            out.masterid = req.session.masterid;
                                            outstanding.update({_id:outSaveArr[j].OutEntry_id},out,function(err){});
                                            if(outSaveArr[j].c_j_s_p == 'OnAcc'){
                                            }
                                            else{
                                                var OutSB = await outstanding.findById(outSaveArr[j].out_id,function(err,aa){});
                                                var outObj = {};
                                                var count = 0;
                                                var arr = {'Out_Entry_Id':outSaveArr[j].OutEntry_id,'main_bk':out.main_bk,'c_j_s_p':out.c_j_s_p,'vouc_code':out.CN_vouc_code,'Rec_Amount':outSaveArr[j].ReceiveAmt};
                                                if(OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == [])OutSB.Out_recieved_Entry_Arr.push(arr);
                                                else{
                                                    for(let r=0; r<OutSB.Out_recieved_Entry_Arr.length; r++){
                                                        if(JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outSaveArr[j].OutEntry_id)){
                                                            OutSB.Out_recieved_Entry_Arr[r] = arr;
                                                            count = count + 1;
                                                            break;
                                                        }
                                                    }
                                                    if(count == 0)OutSB.Out_recieved_Entry_Arr.push(arr);
                                                }
        
                                                outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                                outObj.Rec_Amount = parseFloat(OutSB.Rec_Amount)+parseFloat(outSaveArr[j].ReceiveAmt);
                                                outObj.outstanding_amount = parseFloat(OutSB.outstanding_balance)-parseFloat(outSaveArr[j].ReceiveAmt);
                                                outstanding.update({_id:outSaveArr[j].out_id},outObj,function(err){
                                                    if(err)console.log('Error',err)
                                                    else {}
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                        res.redirect('/Sales_Return_Entry/Sales_Return_Entry_List');
                    }
            })
        }
    });
    }).populate('PartyType');
});

router.delete('/delete/:id',async function(req, res){  
    if(!req.user._id){
      res.status(500).send();
    }else{
      let query = {_id:req.params.id}
      let Garu = {};
      Garu.del = 'Y';
      Garu.delete = new Date();
      SalesEntry.update(query,Garu, function(err,somast){
        if(err){
        console.log(err);
        }else{
            var trans = {};
            trans.del = 'Y';
            trans.delete = new Date();
            querytrans = {SaleReturn_id:req.params.id};
            journalmast.updateMany(querytrans,trans,async function(err,trans){
                if(err)res.json({'success': "false"});
                else {
                        var trans = {};
                        trans.del = 'Y';
                        trans.delete = new Date();
                        var outSR = await outstanding.find({SaleReturn_id:req.params.id},function(err,aa){});
                        outstanding.updateMany({SaleReturn_id:req.params.id},trans,function(err){});
                        if(outSR == null || outSR == '' || outSR == []){
                        }else{
                            // console.log('outSR',outSR);
                            for(let i=0; i<outSR.length; i++){
                                if(outSR[i].outstanding_id == null || outSR[i].outstanding_id == '' || outSR[i].outstanding_id == undefined){
                                    // outstanding.update({_id:outSR[i]._id},trans,function(err){});
                                }else{
                                    var OutSB = await outstanding.findById(outSR[i].outstanding_id,function(err,aa){});
                                    if(OutSB.Out_recieved_Entry_Arr == null || OutSB.Out_recieved_Entry_Arr == []){}
                                    else{
                                        for(let r=0; r<OutSB.Out_recieved_Entry_Arr.length; r++){
                                            if(JSON.stringify(OutSB.Out_recieved_Entry_Arr[r].Out_Entry_Id) == JSON.stringify(outSR[i]._id)){
                                                OutSB.Out_recieved_Entry_Arr.splice(r,1);
                                                break;
                                            }
                                        }
                                    }
                                    var outObj = {};
                                    outObj.outstanding_balance = parseFloat(OutSB.outstanding_balance)+parseFloat(outSR[i].Rec_Amount);
                                    outObj.Bill_Amount = parseFloat(OutSB.Bill_Amount)+parseFloat(outSR[i].Rec_Amount);
                                    outObj.Rec_Amount  = parseFloat(OutSB.Rec_Amount)-parseFloat(outSR[i].Rec_Amount);
                                    outObj.cash_amount = parseFloat(OutSB.cash_amount)+parseFloat(outSR[i].Rec_Amount);
                                    outObj.Out_recieved_Entry_Arr = OutSB.Out_recieved_Entry_Arr;
                                    outObj.outstanding_amount     = parseFloat(OutSB.outstanding_amount)+parseFloat(outSR[i].Rec_Amount);
                                    outstanding.update({_id:OutSB._id},outObj,function(err){
                                        if(err)console.log('Error',err)
                                        else {console.log('success')};
                                    })
                                    // outstanding.update({_id:outSR[i]._id},trans,function(err){});
                                }
                            }
                        }
                        res.json({'success': "true"});
                    }
            });
          }
      });
  }
});

router.get('/ItenCodeName', function (req, res) {
    var qry = req.query.term.term;
    product.find({$or: [{ 'item_title': { $regex: new RegExp("^"+qry,"i")}},{'item_code':qry}],del:'N',masterid:req.session.masterid},'item_title',  function(err, party){
        var data = new Array();
        if(party!=undefined){
            for (var j = 0; j < party.length; j++) {
                data[j] = {
                    "id": party[j]._id,
                    "text" : party[j].item_title
                };
            }
            res.json({'results':  data, "pagination": {
                        "more": false
                    } });
        }
    }).sort({'ACName':1}).limit(100);
});

router.get('/LotNoData', function (req, res) {
    var lot_No =  req.query.lot_No;
    GaruAavak.find({"garu_Aavak_Group": {$elemMatch: {lot_No:lot_No}},$or:[{main_bk:'GAE'},{main_bk:'Sale'}],div_code:req.session.divid,co_code:req.session.compid,masterid:req.session.masterid,del:"N"}, function(err, garudata){
        var qntty = 0;
        var gdn_Cd_Name;
        var item_Code_Desc;
        var purchase_Ac_Title;
        var marks;
        var pkng;
        var QW;
        var bardan_Gross_Amount;
        var apmc;
        var apmc_Amount;
        var ec;
        var entry_Tax;
        var GST;
        var vakal_Thok;
        var dana_Rt;
        // console.log(garudata)
        for(let i=0; i<garudata.length; i++){
            let Arr = garudata[i].garu_Aavak_Group;
            var main_bk = garudata[i].main_bk;
            for(let j=0; j<Arr.length; j++){
                if(lot_No == Arr[j].lot_No){
                    if(garudata[i].d_c == 'C'){//++++
                        qntty = qntty + parseInt(Arr[j].qntty)
                    }
                    if(garudata[i].d_c == 'D'){//----
                        qntty = qntty - parseInt(Arr[j].qntty)
                    }
                    if(main_bk == 'GAE'){
                        gdn_Cd_Name = Arr[j].gdn_Cd_Name;
                        item_Code_Desc = Arr[j].item_Code_Desc;
                        purchase_Ac_Title = Arr[j].purchase_Ac_Title;
                        marks = Arr[j].marks;
                        pkng = Arr[j].pkng;
                        QW = Arr[j].QW;
                        bardan_Gross_Amount = Arr[j].bardan_Gross_Amount;
                        apmc = Arr[j].apmc;
                        apmc_Amount = Arr[j].apmc_Amount;
                        ec = Arr[j].ec;
                        entry_Tax = Arr[j].entry_Tax;
                        GST = Arr[j].GST;
                        vakal_Thok = Arr[j].vakal_Thok;
                        dana_Rt = Arr[j].dana_Rt;
                    }
                }
            }
        }
        // if(qntty>0){}
        var GaruLotDataArr = [];
        var GaruLotData = {'gdn_Cd_Name':gdn_Cd_Name,'item_Code_Desc':item_Code_Desc,'purchase_Ac_Title':purchase_Ac_Title,'marks':marks,'qntty':qntty,
                                'pkng':pkng,'QW':QW,'bardan_Gross_Amount':bardan_Gross_Amount,'apmc':apmc,'apmc_Amount':apmc_Amount,'ec':ec,
                                'entry_Tax':entry_Tax,'GST':GST,'vakal_Thok':vakal_Thok,'dana_Rt':dana_Rt};
        GaruLotDataArr.push(GaruLotData)
       res.json({ 'success': true, 'GaruLotData': GaruLotDataArr});
    }).populate('garu_Aavak_Group.item_Code_Desc').populate('garu_Aavak_Group.purchase_Ac_Title');
})

router.get('/GetLotDataInModal',async function (req, res) {
    var lotno =  req.query.lotno;
    // console.log(lotno);
    var qry = {"garu_Aavak_Group": {$elemMatch: {qty_blc:'+'}},div_code:req.session.divid,co_code:req.session.compid,masterid:req.session.masterid,main_bk:'GAE',del:"N"};
    if(lotno == '' || lotno == undefined || lotno == null) qry = {"garu_Aavak_Group": {$elemMatch: {qty_blc:'+'}},div_code:req.session.divid,co_code:req.session.compid,main_bk:'GAE',del:"N"}
    else{qry = {$and:[{"garu_Aavak_Group": {$elemMatch: {lot_No:lotno}}},{"garu_Aavak_Group": {$elemMatch: {qty_blc:'+'}}}],div_code:req.session.divid,co_code:req.session.compid,main_bk:'GAE',del:"N"}}
    GaruAavak.find(qry,async function(err, garudata){
        // console.log('1250',garudata.length);
        var LotDataArr = [];
        var qntty = 0;
        var Startqtty = 0;
        if(garudata == '' || garudata == null || garudata == []){
        }else{
            for(let i=0; i<garudata.length; i++){
                let garudataGroup = garudata[i].garu_Aavak_Group;
                if(garudataGroup == null || garudataGroup == '' || garudataGroup == []){
                }else{
                    for(let j=0; j<garudataGroup.length; j++){
                        if(garudataGroup[j].lot_No == '' || garudataGroup[j].lot_No == '' || garudataGroup[j].lot_No == undefined){
                        }else{
                            qntty = garudataGroup[j].qntty;
                            Startqtty = qntty;
                            let Sales = await SalesEntry.find({"garu_Aavak_Group": {$elemMatch: {lot_No:garudataGroup[j].lot_No}},div_code:req.session.divid,co_code:req.session.compid,main_bk:'Sale',del:"N"},function (err, product){})
                            if(Sales == null || Sales == '' || Sales == []){
                            }else{
                                for(let a=0; a<Sales.length; a++){
                                    var SalesGroup = Sales[a].garu_Aavak_Group;
                                    if(SalesGroup == null || SalesGroup == '' || SalesGroup == []){
                                    }else{
                                       for(let b=0; b<SalesGroup.length; b++){
                                           if(lotno == '' || lotno == null || lotno == undefined){
                                                if(garudataGroup[j].lot_No == SalesGroup[b].lot_No){
                                                    qntty = qntty - parseInt(SalesGroup[b].qntty);
                                                }
                                           }else{
                                                if(lotno == SalesGroup[b].lot_No){
                                                    qntty = qntty - parseInt(SalesGroup[b].qntty);
                                                }
                                           }
                                       } 
                                    }
                                }
                            }
                        }
                        if(qntty>0){
                            var arr = {'gdn_Cd_Name':garudataGroup[j].gdn_Cd_Name,'lot_No':garudataGroup[j].lot_No,'item_Code_Desc':garudataGroup[j].item_Code_Desc,
                                    'purchase_Ac_Title':garudataGroup[j].purchase_Ac_Title,'marks':garudataGroup[j].marks,'qntty':qntty,
                                    'pkng':garudataGroup[j].pkng,'QW':garudataGroup[j].QW,'bardan_Gross_Amount':garudataGroup[j].bardan_Gross_Amount,
                                    'apmc':garudataGroup[j].apmc,'apmc_Amount':garudataGroup[j].apmc_Amount,'ec':garudataGroup[j].ec,
                                    'entry_Tax':garudataGroup[j].entry_Tax,'GST':garudataGroup[j].GST,'vakal_Thok':garudataGroup[j].vakal_Thok,
                                    'dana_Rt':garudataGroup[j].dana_Rt,'Startqtty':Startqtty};
                            LotDataArr.push(arr);
                        }else{
                            // GaruAavak.findOne({"garu_Aavak_Group": {$elemMatch: {lot_No:garudataGroup[j].lot_No}},div_code:req.session.divid,co_code:req.session.compid,main_bk:'GAE',del:"N"},async function(err, garudataupdate){});
                            db.collection('Garu_Aavak_Schema').update(
                                { _id: garudata[i]._id, "garu_Aavak_Group.lot_No": garudataGroup[j].lot_No },
                                { $set: { "garu_Aavak_Group.$.qty_blc" : '-' } }
                            );
                        }
                    }
                }
            }
        }
        res.json({ 'success': true, 'LotDataArr': LotDataArr});
    }).populate('garu_Aavak_Group.item_Code_Desc').populate('garu_Aavak_Group.gdn_Cd_Name').populate('garu_Aavak_Group.purchase_Ac_Title');
})

router.get('/Sales_Entry_Print', ensureAuthenticated, function(req, res){
    GaruAavak.findById(req.query.id, function (err, GaruAavak){ 
    AddLessParameter.findOne({Module:'Sale Entry',masterid:req.session.masterid},function(err, AddLessParameter){
        if(GaruAavak == null || GaruAavak == [])flag = 1;
        else{
            // console.log(GaruAavak.party_Code._id);
        outstanding.find({$and: [{outstanding_balance:{$gt:0}},{vouc_code:{$lt:GaruAavak.vouc_code}}],cashac_name:GaruAavak.party_Code._id,main_bk:'SB',del:'N',co_code:req.session.compid,div_code:req.session.divid}, function (err, outstanding){   
        division.findById(req.session.divid, function (err,division){
            if(err){
                console.log(err);
            } else{
                var outstanding_bal = 0;
                
                if(GaruAavak == null || GaruAavak == [])flag = 1;
                else{
                    if(outstanding == null || outstanding == [])flag = 1;
                    else{
                        for(let i=0; i<outstanding.length; i++){

                        }
                    }
                    var AddlesArr = []
                    if(AddLessParameter == null || AddLessParameter == '' || AddLessParameter == [])flag= 1;
                    else {
                        for(let i=0; i<AddLessParameter.Add_Less_Parameter_Master_Array.length; i++){
                            for(let j=0; j<AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++){
                                if(AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid){
                                    AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                                }
                            }
                        }
                    }
                   
                    if(GaruAavak.party_Code.ac_PrintType == 'Plain Printed'){
                        res.render('Sale_Entry_Print.hbs',{
                            pageTitle:'Sale Entry Print',
                            GaruAavak:GaruAavak,
                            division:division,
                            AddLessParameter:AddlesArr,
                            compnm:req.session.compnm,
                            outstanding_bal:outstanding_bal.toFixed(2),
                            outstanding:outstanding,
                            divnm:req.session.divmast,
                            sdate: req.session.compsdate,
                            edate:req.session.compedate,
                            usrnm:req.session.user,
                            security: req.session.security,
                            administrator:req.session.administrator
                        })
                    }else{
                        // console.log(GaruAavak.party_Code.ac_PrintType,'Pre Printed');
                        if(GaruAavak.party_Code.ac_PrintType == 'Pre Printed'){
                            res.render('Sale_Entry_Pri_Print.hbs',{
                                pageTitle:'Sale Entry Print',
                                GaruAavak:GaruAavak,
                                division:division,
                                AddLessParameter:AddlesArr,
                                outstanding_bal:outstanding_bal.toFixed(2),
                                outstanding:outstanding,
                                compnm:req.session.compnm,
                                divnm:req.session.divmast,
                                sdate: req.session.compsdate,
                                edate:req.session.compedate,
                                usrnm:req.session.user,
                                security: req.session.security,
                                administrator:req.session.administrator
                            })
                        }else{
                            if(GaruAavak.party_Code.ac_PrintType == 'Plain Printed (Logo)'){
                                res.render('Sale_Entry_Logo_Print.hbs',{
                                    pageTitle:'Sale Entry Print',
                                    GaruAavak:GaruAavak,
                                    division:division,
                                    AddLessParameter:AddlesArr,
                                    outstanding_bal:outstanding_bal.toFixed(2),
                                    outstanding:outstanding,
                                    compnm:req.session.compnm,
                                    divnm:req.session.divmast,
                                    sdate: req.session.compsdate,
                                    edate:req.session.compedate,
                                    usrnm:req.session.user,
                                    security: req.session.security,
                                    administrator:req.session.administrator
                                })
                            }else{
                                res.render('Sale_Entry_Pri_Print.hbs',{
                                    pageTitle:'Sale Entry Print',
                                    GaruAavak:GaruAavak,
                                    division:division,
                                    AddLessParameter:AddlesArr,
                                    outstanding_bal:outstanding_bal.toFixed(2),
                                    outstanding:outstanding,
                                    compnm:req.session.compnm,
                                    divnm:req.session.divmast,
                                    sdate: req.session.compsdate,
                                    edate:req.session.compedate,
                                    usrnm:req.session.user,
                                    security: req.session.security,
                                    administrator:req.session.administrator
                                })
                            }
                        }
                        
                    }
                    
                }
                
            }
        });
        }).sort('-vouc_code').limit(5);
        }
    })
    }).populate('broker_Code').populate('sl_Person').populate('garu_Aavak_Group.sale_Ac_Title')
    .populate('garu_Aavak_Group.item_Code_Desc')
    .populate([{path: 'party_Code',model:'accountSchema',populate:{path:'CityName', model:'citySchema',populate:{path:'StateName', model:'stateSchema'}}}])
    // .populate('add_details.particular_add')
    // .populate([{path: 'add_details.particular_add',model:'Add_Less_Parameter_Master_Schema'}])
    // .populate('less_details.particular_less')
    .populate([{path: 'garu_Aavak_Group.item_Code_Desc',model:'fgSchema',populate:{path:'item_group', model:'CategorySchema'}}])
});

router.get('/getAccMastModalInSateBillEntry', ensureAuthenticated, function(req, res){
    Account_master.findById(req.query.party_Code, function(err, a_mast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching Account Master' });
        } else {
            res.json({ 'success': true, 'a_mast': a_mast });
        }
    }).populate('StateName').populate('PartyType').populate('GroupName').populate('CityName').populate('ac_taxnm').populate('broker_Code').populate('sl_Person');
});

router.get('/getBillNumberWise', ensureAuthenticated, function(req, res){
    // console.log(req.query.vouc_code,req.query.book)
    GaruAavak.findOne({vouc_code:req.query.vouc_code,c_j_s_p:req.query.book,del:'N',main_bk:'Sale',div_code:req.session.divid,co_code:req.session.compid}, function(err, GaruAavak){
        var length = 0;
        gowdown.find({masterid:req.session.masterid, del:"N"}, function (err, gowdown){
            AddLessParameter.findOne({Module:'Sale Entry',masterid:req.session.masterid},function(err, AddLessParameter){
                vouchMast.find({Module:'Sale Entry',Vo_Division: {$elemMatch: {$eq: req.session.divid}},masterid:req.session.masterid},async function(err, vouchMast){
                    if (err) {
                        console.log(err);
                    } else {
                        
                            if(GaruAavak == null || GaruAavak == '' || GaruAavak == undefined){length = length}
                            else {
                                length = GaruAavak.garu_Aavak_Group.length;
                                var outBalance = await outstanding.findOne({SaleEntry_id:GaruAavak._id},function(err,outBalance){}).select('outstanding_balance');
                                outBalance = outBalance.outstanding_balance;
                            }
                            
                            var AddlesArr = []
                            if(AddLessParameter == null || AddLessParameter == '' || AddLessParameter == [])flag= 1;
                            else {
                                for(let i=0; i<AddLessParameter.Add_Less_Parameter_Master_Array.length; i++){
                                    for(let j=0; j<AddLessParameter.Add_Less_Parameter_Master_Array[i].Division.length; j++){
                                        if(AddLessParameter.Add_Less_Parameter_Master_Array[i].Division[j] == req.session.divid){
                                            AddlesArr.push(AddLessParameter.Add_Less_Parameter_Master_Array[i]);
                                        }
                                    }
                                }
                            }
                            res.render('Sale_Entry_Update.hbs',{
                                pageTitle:'Update Sale Entry',
                                GaruAavak:GaruAavak,
                                outBalance:outBalance,
                                length:length,
                                vouchMast:vouchMast,
                                gowdown:gowdown,
                                AddLessParameter:AddlesArr,
                                compnm:req.session.compnm,
                                divnm:req.session.divmast,
                                sdate: req.session.compsdate,
                                edate:req.session.compedate,
                                usrnm:req.session.user,
                                security: req.session.security,
                                administrator:req.session.administrator
                            })
                        
                    }
                });
            });
        })
    }).populate('party_Code').populate('broker_Code').populate('sl_Person').populate('garu_Aavak_Group.sale_Ac_Title').populate('garu_Aavak_Group.item_Code_Desc');
});

router.get('/ShowSaleEntryDetail', ensureAuthenticated, function(req, res){
    GaruAavak.findOne({vouc_code:req.query.vouc_code,c_j_s_p:req.query.c_j_s_p,del:'N',main_bk:'Sale',div_code:req.session.divid,co_code:req.session.compid}, function(err, GaruAavak){
        if(err)res.json({success:false,'err':err});
        else res.json({success:true,GaruAavak:GaruAavak});
    }).populate('party_Code').populate('broker_Code').populate('sl_Person').populate('garu_Aavak_Group.sale_Ac_Title').populate('garu_Aavak_Group.item_Code_Desc');
});
router.get('/SaleDetailModalPartyWise', ensureAuthenticated, function(req, res){
    GaruAavak.find({party_Code:req.query.party_Code,del:'N',main_bk:'Sale',div_code:req.session.divid,co_code:req.session.compid}, function(err, GaruAavak){
        if(err)res.json({success:false,'err':err});
        else res.json({success:true,GaruAavak:GaruAavak});
    }).populate('party_Code').populate('broker_Code').populate('sl_Person').populate('garu_Aavak_Group.sale_Ac_Title').populate('garu_Aavak_Group.item_Code_Desc');
});

router.get('/getBillNumberWiseConfirm', ensureAuthenticated, function(req, res){
    GaruAavak.findOne({vouc_code:req.query.vouc_code,c_j_s_p:req.query.book,del:'N',main_bk:'Sale',div_code:req.session.divid,co_code:req.session.compid}, function(err, GaruAavak){
        if(err)res.json({'success':false,'err':err});
        else{
            if(GaruAavak == null || GaruAavak == '' || GaruAavak == undefined || GaruAavak == []){
                res.json({'success':false});
            }else{
                res.json({'success':true});
            }
        }
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