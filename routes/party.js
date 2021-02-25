const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
let party = require('../models/party_schema');
let proprietor = require('../models/proprietor_schema');
let group = require('../models/group_schema');
let city = require('../models/city_schema');
let state = require('../models/state_schema');
let bank = require('../models/bank_schema');
let sauda1 = require('../models/contract_sauda_schema');
let district_master = require('../models/district_schema');
let state_master = require('../models/state_schema');
let city_master = require('../models/city_schema');
let category = require('../models/category_mast_schema');
let categorytax = require('../models/category_tax_mast_schema');
var query;
router.post('/applogin',  function(req, res, next){
    party.findOne({prtyusername: req.body.prtyusername}, function(err, party){
    if(err) {
      res.json({ 'success': false, 'message': err });
    }
    else if(!party){
      res.json({ 'success': false, 'message': 'No user found'}); 
    } 
    else {
        if(err) throw err;
        if(party.partypassword==req.body.partypassword)
        {
            if(err){
              console.log(err);
            } else {
              res.json({ 'success': true,
              'id': party._id,
              'p_type': party.p_type,
              'name': party.prtyusername,
              'co_code': party.co_code,
              'div_code': party.div_code,
              'masterid': party.masterid
            });
            }
      }
      else {
        res.json({ 'success': false, 'message': 'Wrong password' });
      }
    }
  });
});
router.get('/getdistrictbyid', function (req, res) {
    if( req.query.id ) {
        state_master.findById(req.query.id, 'state_name', function(err, state_master){
            res.json({ 'success': true, 'state_name': state_master });
        });
    }
});
router.get('/getcity', function (req, res) {
    var qry = req.query.term.term;
    city.find({'city_name': new RegExp(qry ) },'city_name',  function(err, city){
        var data = new Array();
        for (var j = 0; j < city.length; j++) {
            data[j] = {"id": city[j]._id, "text" : city[j].city_name};
        }
        res.json({'results':  data, "pagination": {
                    "more": false
                } });
    });
});
router.get('/getcitybyid', function (req, res) {
    if( req.query.id ) {
        city.findById(req.query.id, 'state_name', function(err, city){
            res.json({ 'success': true, 'state_name': city });
        }).populate('state_name');
    }
});

router.get('/getpartylist', function (req, res) {
    if(req.query)
    party.find({masterid: req.session.masterid},  function(err, party){
        var data = new Array();
        var i=0;
		for (var j = 0; j < party.length; j++) {
            i++;
			//console.log(party[j]);
        //console.log(party[j]['city_name']['city_name']);
		
			if (party[j]['party_name'] != null) PName = party[j]['party_name'];
            else PName = "";
            if (party[j]['partshortname'] != null) partshortname = party[j]['partshortname'];
			else partshortname = "";
			if (party[j]['address1'] != null) Padd1 = party[j]['address1'];
			else Padd1 = "";
			if (party[j]['area_name'] != null) Parea = party[j]['area_name'];
			else Parea = "";
			if (party[j]['city_name'] != null) CtName = party[j]['city_name']['city_name'];
			else CtName = "";
			if (party[j]['pin_code'] != null) Ppin = party[j]['pin_code'];
			else Ppin = "";
			if (party[j]['credit_limit'] != null) Pcredlmt = party[j]['credit_limit'];
			else Pcredlmt = "";
			if (party[j]['pan_no'] != null) Ppanno = party[j]['pan_no'];
			else Ppanno = "";
			if (party[j]['gstin'] != null) Pgstin = party[j]['gstin'];
			else Pgstin = "";
			if (party[j]['mob_no'] != null) Pmobno = party[j]['mob_no'];
			else Pmobno = "";
			if (party[j]['phone_resi'] != null) Pphoneresi = party[j]['phone_resi'];
			else Pphoneresi = "";
			if (party[j]['fssai'] != null) Pfssai = party[j]['fssai'];
			else Pfssai = "";
			if (party[j]['fax'] != null) Pfax = party[j]['fax'];
			else Pfax = "";
					
            data[j] = {
                        "check" : party[j]._id,
                        "id":  i,
                        "partshortname":partshortname,
                        "PartyName" : PName,
                        "Address" : Padd1,
                        "AreaName" : Parea,
						"CityName" : CtName,
                        "PinCode" : Ppin,
                        "CreditLimits" : Pcredlmt,
                        "PAN" : Ppanno,
                        "GSTIN" :Pgstin,
                        "Phoneoffice" : Pmobno,
                        "PhoneResi" : Pphoneresi,
                        "FSSAI" :  Pfssai, 
                        "FAX" :  Pfax,
                        "MobileNo" : Pmobno,
                        // "Action" :{
                        //     "edit" : "/party/party_list_update/"+party[j]._id,
                        //     "delete" : "/party/delete_party/" + party[j]._id
                        // }
            
            };
			//console.log(data[j]);
        
        }
        res.json({"draw": 1,"recordsTotal": 57,"recordsFiltered": 57,'data':  data });
    }).sort({'party_name':1}).populate('city_name');
});
router.get('/smstokenlist', function (req, res) {
    var masterid =  req.query.masterid;
    party.find({masterid:masterid},function (err, party){
            var data = new Array();
            for (var j = 0; j < party.length; j++)
            {
                if (party[j]['smstoken'] != null) smstoken = party[j]['smstoken'];
                else smstoken='';
                data[j] = {
                    "smstoken" : smstoken,
               };
            }
            res.json({ 'success': true, 'token_list': data});
        })
});
router.post('/party_smstoken_update/:id', function(req, res) {
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let prty = {}; 
        prty.smstoken = req.body.smstoken;
        let query = {_id:req.params.id}
        party.update(query ,prty ,function (err) {
            if (err) {
                res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
            } else {
                 res.json({ 'success': true, party});
                //res.redirect('/party/party_list');
            }
        });
    }
});
/////add city
router.post('/city_add',function(req, res){
    if(req.body.dis_name=="Select") req.body.dis_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.state_name=="Select") req.body.state_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let city = new city_master();
        city.state_name = req.body.state_name;
        city.city_name = req.body.city_name;
        city.dis_name = req.body.dis_name;
        city.city_code = req.body.city_code;
        city.city_std_code = req.body.city_std_code;
        city.co_code =  req.session.compid;
        city.div_code =  req.session.divid;
        city.usrnm =  req.session.user;
        city.masterid =   req.session.masterid;
        city.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving city','errors':err});
                return;
            }
            else
            {
                 res.json({ 'success': true, 'message': 'Order added succesfully' });
            }
        });
    }
});
// Add Route
router.get('/party_add', ensureAuthenticated, function(req, res){
            proprietor.find({masterid:req.session.masterid}, function (err, proprietor){
            group.find({masterid:req.session.masterid}, function (err, group){
            bank.find({}, function (err, bank){
            district_master.find({}, function (err, district_master){
            category.find({masterid:req.session.masterid}, function (err, category){
            categorytax.find({masterid:req.session.masterid}, function (err, categorytax){
            if (err) {
                console.log(err);
            } else {
                res.render('party.hbs', {
                    pageTitle:'Add party',
                    proprietor: proprietor,
                    group: group,
                    category: category,
                    categorytax: categorytax,
                    city: city,
                    district_master: district_master,
                    state: state,
                    bank: bank,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        }).sort({'category_tax_name':1});
        }).sort({'category_name':1});
        }).sort({'dis_name':1});
    }).sort({'bank_name':1});
}).sort({'group_name':1});
}).sort({'proprietor_name':1});
});

function checkpartyusrnm(usrnm,req){
    return new Promise(function(fullfill){
        
            party.findOne({prtyusername: {$exists: true,$eq: usrnm}}, function(errors, newparty){
               var allowparty="True";
                if(newparty=="undefined" || newparty==null) {
                } 
                else {
                    allowparty="False"

                }
                fullfill(allowparty);
        })
    })
}

router.post('/contractlink_add',function(req, res){
    if(req.body.city_name=="") req.body.city_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.state_name=="") req.body.state_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    let errors = req.validationErrors();
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let Party = new party();
        Party.p_type = req.body.p_type;
        Party.party_name = req.body.party_name;
        Party.address1 = req.body.address1;
        Party.address2 = req.body.address2;
        Party.area_name = req.body.area_name;
        Party.city_name = req.body.city_name;
        Party.state_name = req.body.state_name;
        Party.pin_code = req.body.pin_code;
        Party.credit_limit = req.body.credit_limit;
        Party.pan_no = req.body.pan_no;
        Party.gstin = req.body.gstin;
        Party.co_code =  req.session.compid;
        Party.div_code =  req.session.divid;
        Party.usrnm =  req.session.user;
        Party.masterid = req.session.masterid;
        Party.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving term','errors':err});
                return;
            }
            else
            {
                res.json({ 'success': true, 'message': 'Order added succesfully' });
            }
        });
    }
});
router.post('/party_add', async function(req, res){
    //console.log(req);
    if(req.body.city_name=="") req.body.city_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.state_name=="") req.body.state_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.category=="") req.body.category=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.category_tax_name=="") req.body.category_tax_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    
    const fssaidate = req.body.fssaidate;
    //var fssiDateObject =  moment(fssaidate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
    //var fssaidateMiliSeconds = fssiDateObject.format('x');
    const p_type = req.body.p_type;
    const party_name = req.body.party_name;
    const partshortname = req.body.partshortname;
    const address1 = req.body.address1;
    const address2 = req.body.address2;
    const area_name = req.body.area_name;
    const city_name = req.body.city_name;
    const state_name = req.body.state_name;
    const pin_code = req.body.pin_code;
    const credit_limit = req.body.credit_limit;
    const pan_no = req.body.pan_no;
    const gstin = req.body.gstin;
    const phone_ofc = req.body.phone_ofc;
    const phone_resi = req.body.phone_resi;
    const fssai = req.body.fssai;
    const fax = req.body.fax;
    const mob_num = req.body.mob_num;
    const mob_no = req.body.mob_no;
    const prtyusername = req.body.prtyusername;
    const partypassword = req.body.partypassword;
    const proprietor_name = req.body.proprietor_name;
    const group_name = req.body.group_name;
    const category = req.body.category;
    const category_tax_name = req.body.category_tax_name;
    const remark = req.body.remark;
    const working = req.body.working;
    const envelope = req.body.envelope;
    const party_bank = req.body.party_bank;
    const contact_group = req.body.contact_group;
    const co_code =  req.session.compid;
    const div_code =  req.session.divid;
    const usrnm =  req.session.user;
    const masterid =   req.session.masterid;
    let errors = req.validationErrors();
    var allowparty = "True";
    if (errors) {
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
       
        if (req.body.prtyusername!= "")
        {
            allowparty= await checkpartyusrnm(req.body.prtyusername,req);
        }
            if(allowparty=="True"){
                party.findOne({$and: [{ party_name: req.body.party_name },{ city_name: req.body.city_name}]}, function(errors, partname){
                    if(errors) {
                        console.log(errors);
                        res.json({ 'success': false, 'message': 'Error in finding usrnm', errors: errors });
                    }
                 if(!partname){
                let newParty = new party({
                    p_type : p_type,
                     party_name : party_name,
                     partshortname:partshortname,
                     address1 : address1,
                     address2 : address2,
                     area_name : area_name,
                     city_name : city_name,
                     state_name : state_name,
                     pin_code : pin_code,
                     credit_limit : credit_limit,
                     pan_no : pan_no,
                     gstin : gstin,
                     phone_ofc : phone_ofc,
                     phone_resi : phone_resi,
                     fssai : fssai,
                     fssaidate : fssaidate,
                     fax : fax,
                     mob_num : mob_num,
                     mob_no : mob_no,
                     prtyusername : prtyusername,
                     partypassword : partypassword,
                     proprietor_name : proprietor_name,
                     group_name : group_name,
                     category : category,
                     category_tax_name:category_tax_name,
                     remark : remark,
                     working : working,
                     envelope : envelope,
                     party_bank : party_bank,
                     contact_group : contact_group,
                     co_code : co_code,
                     div_code : div_code,
                     usrnm : usrnm,
                     masterid :  masterid,
                });
                newParty.save(function(errors){
                        if(errors){
                            res.json({ 'success': false, 'message': 'Error in Saving User', errors: errors });
                        } else {
                        res.json({ 'success': true,'message': 'User added succesfully'});
                        }
                      });
                    }
                    else{
                        res.json({ 'success': "city_name",'message': 'User added succesfully'});
                    }
                    });
                
                }
                else 
                {
                    res.json({ 'success': "partyusername", 'message': 'Mobile User Name already exist', serialerror: 'Mobile User Name already exist' });
                }
    }

});
    router.get('/party_list', ensureAuthenticated ,function(req,res){
        party.find({masterid: req.session.masterid}, function (err,party){
            sauda1.find({}, function (err,sauda1){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render('party_list.hbs',{
                    pageTitle:'party List',
                    party:party,
                    sauda1:sauda1,
                    compnm:req.session.compnm,
                    divnm:req.session.divmast,
                    sdate: req.session.compsdate,
                    edate:req.session.compedate,
                    usrnm:req.session.user,
                    security: req.session.security,
                    administrator:req.session.administrator
                });
            }
        });
        }).sort({'party_name':1}).populate('state_name').populate('city_name');   
       });
       router.get('/party_list_update/:id', ensureAuthenticated, function(req, res){
        // var p_type = req.body.p_type;
                party.findById(req.params.id, function(err, party){
                proprietor.find({masterid:req.session.masterid}, function (err, proprietor){
                group.find({masterid:req.session.masterid}, function (err, group){
                city.find({}, function (err, city){
                state.find({}, function (err, state){
                bank.find({}, function (err, bank){
                district_master.find({}, function (err, district_master){ 
                category.find({masterid:req.session.masterid}, function (err, category){ 
                categorytax.find({masterid:req.session.masterid}, function (err, categorytax){
                if (err) {
                    console.log(err);
                } else {
                    res.render('party_list_update.hbs', {
                        pageTitle:'Update Party',
                        party: party,
                        proprietor: proprietor,
                        group: group,
                        category: category,
                        categorytax: categorytax,
                        city: city,
                        state: state,
                        bank: bank,
                        district_master: district_master,
                        compnm:req.session.compnm,
                        divnm:req.session.divmast,
                        sdate: req.session.compsdate,
                        edate:req.session.compedate,
                        usrnm:req.session.user,
                        security: req.session.security,
                        administrator:req.session.administrator
                    });
                }
            }).sort({'category_tax_name':1});
            }).sort({'category_name':1});
            }).sort({'dis_name':1});
            }).sort({'bank_name':1});
         });
      }).populate('state_name');
    }).sort({'group_name':1});
  }).sort({'proprietor_name':1});
 }).populate('city_name').populate('state_name');
});
        router.post('/party_update_submit/:id', function(req, res) {
            if(req.body.city_name=="") req.body.city_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.state_name=="") req.body.state_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.category=="") req.body.category=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            if(req.body.category_tax_name=="") req.body.category_tax_name=mongoose.Types.ObjectId('578df3efb618f5141202a196');
            let party_bank = req.body.party_bank;
            let contact_group = req.body.contact_group;
            
            //var fssiDateObject =  moment(fssaidate, "DD/MM/YYYY hh:mm a").tz("Asia/Kolkata");
            let errors = req.validationErrors();
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
            } else {
                let prty = {}; 
                prty.p_type = req.body.p_type;
                prty.party_name = req.body.party_name;
                prty.partshortname= req.body.partshortname;
                prty.address1 = req.body.address1;
                prty.address2 = req.body.address2;
                prty.area_name = req.body.area_name;
                prty.city_name = req.body.city_name;
                prty.state_name = req.body.state_name;
                prty.pin_code = req.body.pin_code;
                prty.credit_limit = req.body.credit_limit;
                prty.pan_no = req.body.pan_no;
                prty.gstin = req.body.gstin;
                prty.phone_ofc = req.body.phone_ofc;
                prty.phone_resi = req.body.phone_resi;
                prty.fssai = req.body.fssai;
                prty.fssaidate = req.body.fssaidate;
                prty.fax = req.body.fax;
                prty.mob_no = req.body.mob_no;
                prty.mob_num = req.body.mob_num;
                prty.prtyusername = req.body.prtyusername,
                prty.partypassword = req.body.partypassword,
                prty.proprietor_name = req.body.proprietor_name;
                prty.group_name = req.body.group_name;
                prty.category = req.body.category;
                prty.category_tax_name = req.body.category_tax_name;
                prty.remark = req.body.remark;
                prty.working = req.body.working;
                prty.envelope = req.body.envelope;
                prty.party_bank = party_bank;
                prty.contact_group = contact_group;
                prty.co_code =  req.session.compid;
                prty.div_code =  req.session.divid;
                prty.usrnm =  req.session.user;
                let query = {_id:req.params.id}
                party.update(query ,prty ,function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/party/party_list');
                    }
                });
            }
        });
        router.get('/delete_party',function(req, res){
            var del = req.query.del;
            let errors = req.validationErrors();
            if(errors)
            {
                console.log(errors);
            }
            else
            {
                sauda1.findOne({"sl_code":req.query.data}, function(errors, sauda1){
                    if(errors) {
                        console.log(errors);
                        res.json({ 'success': false, 'message': 'Error in finding usrnm', errors: errors });
                    }
                    if(del=="yes")
                    {
                        
                        let query = req.query.data;
                        var dealarray = query.split(',');
                      for (var j = 0; j < dealarray.length; j++) {
                         var myObject = {
                             "_id": dealarray[j],
                         };
                         party.remove(myObject,function(err){});
                         res.json({ 'success': true, 'message': 'delete successfully'});
                     }
                    }
                    else if(!sauda1){
                     res.json({ 'success': true, 'message': 'Can Be Deleted'});
                    } 
                    else {
                        res.json({ 'success': false, 'message': 'Before Delete Contract Sauda'});
                    }  
                });
            }
        });
        // router.get('/delete_party/:id', function(req, res){
        //     if(!req.user.id)
        //     {
        //         res.status(500).send();
        //     }
        //     let query = {_id:req.param.id}
        //     party.findById(req.params.id, function(err, party){
        //         party.remove(query,function(err){
        //             if(err)
        //             {
        //                 console.log(err);
        //             }
        //             // res.send('Success');
        //             res.redirect('/party/party_list');
        //         });
        //     });
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