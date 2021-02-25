const express = require('express');
const router = express.Router(); 
const mongoose = require('mongoose');
let GaruAavak = require('../models/Garu_Aavak_Schema');
const moment = require('moment-timezone');
let division = require('../models/divSchema');
let db = mongoose.connection;
var multer = require('multer');
var fs = require('fs');
var path = require('path');
const XLSX = require('xlsx');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/form_3b')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        // if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf') {
        //     req.fileValidationError = "Forbidden extension";
        //     return callback(null, false, req.fileValidationError);
        // }
        callback(null, true)
    },
    limits:{
        fileSize: 420 * 150 * 200
    }
});

router.get('/sales_register', ensureAuthenticated, function(req, res){
    division.find({masterid:req.session.masterid}, function (err,div){
        res.render('sales_register.hbs', {
            pageTitle:'Sales Register',
            div:div,
            compnm:req.session.compnm,
            divnm:req.session.divmast,
            sdate: req.session.compsdate,
            edate:req.session.compedate,
            usrnm:req.session.user,
            security: req.session.security,
            administrator:req.session.administrator
        }); 
     });
});
router.post('/getsalesentrylist', ensureAuthenticated, async (req, res) =>{
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;
        var  party_Code = req.body.party_Code;
        var  Broker = req.body.Broker;
        var  Sale = req.body.Sale;
        var  Division = req.body.Division;
        var SCREENING = req.body.SCREENING;
        const strtdate = moment(start_date, "DD/MM/YYYY").tz("Asia/Kolkata").startOf('day').format('x');
        const enddats = moment(end_date, "DD/MM/YYYY").tz("Asia/Kolkata").endOf('day').format('x');  
        // main_bk:"Sale",
        var query = {$and: [{entry_Datemilisecond:{$gte:strtdate}},{entry_Datemilisecond:{$lte:enddats}}], del:"N", CNCL:"N", div_code: req.session.divid, co_code: req.session.compid, masterid: req.session.masterid};
        if(party_Code != ''){
            var party = {party_Code:party_Code};
            query = Object.assign(query,party)
        }
        if(Broker != ''){
            var b = {broker_Code: Broker };
            query = Object.assign(query,b)
        }
        if(Sale != ''){
            var s = {sl_Person: Sale };
            query = Object.assign(query,s)
        }
        if(Division != ''){
            var d = {div_code: Division};
            query = Object.assign(query,d)
        }
       let GaruAavakdata = await GaruAavak.find(query, function (err,GaruAavak){})
       .populate([{path: 'party_Code',
       populate:{ path: 'CityName'}
       }]) .populate([{path: 'party_Code',
       populate:{ path: 'StateName'}
       }]).populate([{path: 'garu_Aavak_Group.item_Code_Desc',
       populate:{ path: 'unit_nm'}
       }]) .populate('broker_Code').populate('sl_Person');
       if(SCREENING=="FORM_3"){
        let Divisiondata = await division.findOne({_id:req.session.divid}, function (err,division){});
        
         var gstin = Divisiondata.ac_gstin;
         var divnamesession =Divisiondata.div_mast;
         
       var allcodes = []; 
        for (let i = 0; i < gstin.length; i++){
            allcodes.push(gstin[i]);
        }
        if(gstin.length==1)  console.log(allcodes[0])
      
        var taxable=[];
        var taxfree=[];
        var purchasetaxable=[];
        var purchasetaxfree=[];
        var indeid = GaruAavakdata[0]['gross_Amt'];
        for (let i = 0; i < GaruAavakdata.length; i++){
            if(GaruAavakdata[i]['party_Code']!=null && GaruAavakdata[i]['GSTIN']!='' && GaruAavakdata[i]['GSTIN']!=undefined) var gstin = GaruAavakdata[i]['party_Code']['GSTIN'];
            else var gstin = '';
            if(GaruAavakdata[i]['gross_Amt']!=null) var gross_Amt = GaruAavakdata[i]['gross_Amt'];
            else var gross_Amt = 0;
            var garu_Aavak_Group = GaruAavakdata[i]['garu_Aavak_Group'];
            for (let j = 0; j < garu_Aavak_Group.length; j++){
                    if(garu_Aavak_Group[j]['net_Amount']!=null) var net_Amount = garu_Aavak_Group[j]['net_Amount'];
                    else var net_Amount = 0;
                    if(garu_Aavak_Group[j]['Item_SGST']!=null)var SGSTot=garu_Aavak_Group[j]['Item_SGST'];
                    else var SGSTot=0;
                    if(garu_Aavak_Group[j]['Item_IGST']!=null) var IGSTot=garu_Aavak_Group[j]['Item_IGST'];
                    else var IGSTot=0;
                    if(garu_Aavak_Group[j]['Item_CGST']!=null) var ScGSTot=garu_Aavak_Group[j]['Item_CGST'];
                    else var ScGSTot=0;
                    if(i>0)
                    {
                        if (GaruAavakdata[i].gross_Amt!= indeid){
                            var grossval = gross_Amt;
                            indeid = GaruAavakdata[i].gross_Amt;
                        }else{
                            var grossval = 0;
                        }
                    }
                    else{
                        if(j>0){
                            var grossval = 0;
                        }
                        else{
                            var grossval = gross_Amt;
                        }
                    }
                    if(GaruAavakdata[i]['main_bk']=="Sale"){
                    if(SGSTot==0 && IGSTot==0 && ScGSTot==0){
                        var taxamount = parseFloat(SGSTot+ScGSTot+IGSTot);
                        var obj = {
                            "net_Amount": net_Amount,
                            "CGST": ScGSTot,
                            "SGST": SGSTot,
                            "IGST": IGSTot,
                            "taxamount": taxamount,
                            "NONTAXABLE": 0.00,
                            "billamt": grossval,
                            };
                            taxfree.push(obj);
                    }else{
                        var taxamount = parseFloat(SGSTot+ScGSTot+IGSTot);
                        var obj = {
                            "net_Amount": net_Amount,
                            "CGST": ScGSTot,
                            "SGST": SGSTot,
                            "IGST": IGSTot,
                            "taxamount": taxamount,
                            "NONTAXABLE": 0.00,
                            "billamt": grossval,
                            };
                            taxable.push(obj);
                    }
                }else{
                    if(GaruAavakdata[i]['main_bk']=="GAE"){
                        if(SGSTot>0 || IGSTot>0 || ScGSTot>0){
                            var taxamount = parseFloat(SGSTot+ScGSTot+IGSTot);
                            var obj = {
                                "net_Amount": net_Amount,
                                "CGST": ScGSTot,
                                "SGST": SGSTot,
                                "IGST": IGSTot,
                                "taxamount": taxamount,
                                "NONTAXABLE": 0.00,
                                "billamt": grossval,
                                };
                                purchasetaxfree.push(obj);
                        }
                    }
                }
            }

        }
        ////tax free
        var netamttaxfree=0;
        var CGSTtaxfree=0;
        var SGSTtaxfree=0;
        var igsttaxfree=0;
        var taxamttaxfree=0;
        var nontaxtaxfree=0;
        var billamttaxfree=0;
        for(var k=0, l=taxfree.length; k<l; k++) {
            netamttaxfree+=parseFloat(taxfree[k]['net_Amount']);
            CGSTtaxfree+=parseFloat(taxfree[k]['CGST']);
            SGSTtaxfree+=parseFloat(taxfree[k]['SGST']);
            igsttaxfree+=parseFloat(taxfree[k]['IGST']);
            taxamttaxfree+=parseFloat(taxfree[k]['taxamount']);
            nontaxtaxfree+=parseFloat(taxfree[k]['NONTAXABLE']);
            billamttaxfree+=parseFloat(taxfree[k]['billamt']);
        }

        ////taxable
        var netamttaxable=0;
        var CGSTtaxable=0;
        var SGSTtaxable=0;
        var igsttaxable=0;
        var taxamttaxable=0;
        var nontaxtaxable=0;
        var billamttaxable=0;
        for(var k=0, l=taxable.length; k<l; k++) {
            netamttaxable+=parseFloat(taxable[k]['net_Amount']);
            CGSTtaxable+=parseFloat(taxable[k]['CGST']);
            SGSTtaxable+=parseFloat(taxable[k]['SGST']);
            igsttaxable+=parseFloat(taxable[k]['IGST']);
            taxamttaxable+=parseFloat(taxable[k]['taxamount']);
            nontaxtaxable+=parseFloat(taxable[k]['NONTAXABLE']);
            billamttaxable+=parseFloat(taxable[k]['billamt']);
        }
        ////purchase tax free
        var purcsenetamttaxfree=0;
        var purcseCGSTtaxfree=0;
        var purcseSGSTtaxfree=0;
        var purcseigsttaxfree=0;
        var purcsetaxamttaxfree=0;
        var purcsenontaxtaxfree=0;
        var purcsebillamttaxfree=0;
        for(var k=0, l=purchasetaxfree.length; k<l; k++) {
            purcsenetamttaxfree+=parseFloat(purchasetaxfree[k]['net_Amount']);
            purcseCGSTtaxfree+=parseFloat(purchasetaxfree[k]['CGST']);
            purcseSGSTtaxfree+=parseFloat(purchasetaxfree[k]['SGST']);
            purcseigsttaxfree+=parseFloat(purchasetaxfree[k]['IGST']);
            purcsetaxamttaxfree+=parseFloat(purchasetaxfree[k]['taxamount']);
            purcsenontaxtaxfree+=parseFloat(purchasetaxfree[k]['NONTAXABLE']);
            purcsebillamttaxfree+=parseFloat(purchasetaxfree[k]['billamt']);
        }
        /////purchase taxable 
        var Excel = require('exceljs');
        const workbook =  new Excel.Workbook(); // XLSX.readFile(req.file.path)
         var fileexcelpath = path.join(__dirname, '../backup/GSTR-3B.xlsx');
        workbook.xlsx.readFile(fileexcelpath)
            .then(function(){
                var worksheet = workbook.getWorksheet('SHEET1');
                var row8 = worksheet.getRow(8);
                row8.getCell(4).value = allcodes[0]; 
                row8.getCell(5).value = allcodes[1];
                row8.getCell(6).value = allcodes[2]; 
                row8.getCell(7).value = allcodes[3];
                row8.getCell(8).value = allcodes[4]; 
                row8.getCell(8).value = allcodes[5];
                row8.getCell(9).value = allcodes[6]; 
                row8.getCell(10).value = allcodes[7];
                row8.getCell(11).value = allcodes[8]; 
                row8.getCell(12).value = allcodes[9];
                row8.getCell(13).value = allcodes[10];
                row8.getCell(14).value = allcodes[11];
                row8.getCell(15).value = allcodes[12];
                row8.getCell(16).value = allcodes[13];
                row8.getCell(17).value = allcodes[14];
                row8.getCell(18).value = allcodes[15];
                row8.commit();
                var row9 = worksheet.getRow(9);
                row9.getCell(4).value = divnamesession; 
                row9.commit();
                var row15 = worksheet.getRow(15);
                row15.getCell(4).value = taxamttaxable; 
                row15.getCell(7).value = igsttaxable;  
                row15.getCell(10).value = CGSTtaxable; 
                row15.getCell(13).value = SGSTtaxable;
                row15.commit();
                var row17 = worksheet.getRow(17);
                row17.getCell(4).value = taxamttaxfree; 
                row17.getCell(7).value = igsttaxfree;  
                row17.getCell(10).value = CGSTtaxfree; 
                row17.getCell(13).value = SGSTtaxfree;
                row17.commit();
                var row5 = worksheet.getRow(5);
                var newdt = moment(end_date, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
                var filteryear = moment(newdt).tz("Asia/Kolkata").format('YYYY');
                row5.getCell(17).value = filteryear; 
                row5.commit();
                var row6 = worksheet.getRow(6);
                var filtermonth = moment(newdt).tz("Asia/Kolkata").format('MM');
                row6.getCell(17).value = filtermonth; 
                row6.commit();
                ////purchase
                var row35 = worksheet.getRow(35);
                row35.getCell(4).value = purcsetaxamttaxfree; 
                row35.getCell(7).value = purcseigsttaxfree;  
                row35.getCell(10).value = purcseCGSTtaxfree; 
                row35.getCell(13).value = purcseSGSTtaxfree;
                row35.commit();
                var row40 = worksheet.getRow(40);
                row40.getCell(4).value = purcsetaxamttaxfree; 
                row40.getCell(7).value = purcseigsttaxfree;  
                row40.getCell(10).value = purcseCGSTtaxfree; 
                row40.getCell(13).value = purcseSGSTtaxfree;
                row40.commit();
                workbook.xlsx.writeFile(path.join(__dirname, '../backup/GSTR-3B.xlsx'));
            //    console.log(filePath);
                
            })
            var filenamepath = path.join(__dirname, '../backup/GSTR-3B.xlsx');
            res.json({ 'success': true,"filenamepath":filenamepath,'GaruAavak':GaruAavakdata,"dividmast":req.session.compstatecode});
       }else{
             res.json({ 'success': true,'GaruAavak':GaruAavakdata,"dividmast":req.session.compstatecode});
       }
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