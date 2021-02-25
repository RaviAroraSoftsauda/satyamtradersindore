const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let addlessmast= require('../models/addless_mast_schema');
let ac_mast= require('../models/accountSchema');
var Gs_master = require('../models/gsTableSchema');
var Account_master = require('../models/accountSchema');
let Garu = require('../models/Garu_Aavak_Schema');
let journalmast = require('../models/trans');

// Add Route
router.get('/addless_mast', ensureAuthenticated, function(req, res){
    addlessmast.find({masterid:req.session.masterid,del:'N'}, function (err,addlessmast){
        ac_mast.find({}, function (err,ac_mast){
            Account_master.find({masterid: req.session.masterid, del: 'N'},function (err, account_masters){
                Gs_master.findOne({group: 'POSTING ACCOUNT'},function (err, gs_master){
                    if (err) {
                        console.log(err);
                    } else {
                        accarry = [];
                        if(gs_master != null && gs_master['garry'] != null && account_masters != null){
                            for (let g = 0; g < gs_master['garry'].length; g++)
                            {     
                                for (let j = 0; j < account_masters.length; j++)
                                {
                                    if (gs_master['garry'][g]._id.equals(account_masters[j]['GroupName']._id))
                                    { 
                                        var arr={_id: account_masters[j]._id,ACName: account_masters[j]['ACName'], CityName: account_masters[j]['CityName']};
                                        this.accarry.push(arr);
                                        // console.log('r',account_masters[j]['ACName']);  
                                    }
                                }
                            }
                        // console.log(this.accarry)
                        }
                        var buyername = this.accarry;
                        res.render('addless_mast.hbs', {
                            pageTitle:'Add Less Master',
                            addlessmast: addlessmast,
                            ac_mast:buyername,
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
    }).populate('sales_posting_ac','ACName').populate('pur_posting_ac','ACName').populate('SR_posting_ac','ACName').populate('PR_posting_ac','ACName');
});

router.post('/addless_mast_add',function(req, res){
    let errors = req.validationErrors();
    if(req.body.sales_posting_ac == "") req.body.sales_posting_ac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.pur_posting_ac   == "") req.body.pur_posting_ac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.SR_posting_ac    == "") req.body.SR_posting_ac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.PR_posting_ac    == "") req.body.PR_posting_ac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let addless               = new addlessmast();
        addless.type_descr        = req.body.type_descr;
        addless.addlesstype       = req.body.addlesstype;
        addless.sales_posting_ac  = req.body.sales_posting_ac;
        addless.pur_posting_ac    = req.body.pur_posting_ac;
        addless.SR_posting_ac     = req.body.SR_posting_ac;
        addless.PR_posting_ac     = req.body.PR_posting_ac;
        addless.Parameter_posting = req.body.Parameter_posting ;
        addless.entrydate         = new Date();
        addless.del               = 'N';
        addless.co_code           = req.session.compid;
        addless.div_code          = req.session.divid;
        addless.usrnm             = req.session.user;
        addless.masterid          = req.session.masterid;
        addless.save(function (err){
            if(err)
            {
                res.json({'success':false,'message':'error in saving city','errors':err});
                return;
            }
            else
            {
                // res.json({ 'success': true, 'message': 'Order added succesfully' });
                res.redirect('/addless_mast/addless_mast');
            }
        });
    }
});
router.get('/:id', ensureAuthenticated, function(req, res){
    addlessmast.findById(req.params.id, function(err, addlessmast){
        if (err) {
            res.json({ 'success': false, 'message': 'error in fetching brnad details' });
        } else {
            res.json({ 'success': true, 'addlessmast': addlessmast });
        }
        
    });
});
router.post('/edit_addless_mast/:id',function(req, res){
   let errors = req.validationErrors();
    if(req.body.sales_posting_ac=="") req.body.sales_posting_ac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.pur_posting_ac=="") req.body.pur_posting_ac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.SR_posting_ac=="") req.body.SR_posting_ac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(req.body.PR_posting_ac=="") req.body.PR_posting_ac=mongoose.Types.ObjectId('578df3efb618f5141202a196');
    if(errors)
    {
        console.log(errors);
    }
    else
    {
        let addless = {};
        addless.type_descr = req.body.type_descr;
        addless.addlesstype= req.body.addlesstype;
        addless.sales_posting_ac = req.body.sales_posting_ac;
        addless.pur_posting_ac= req.body.pur_posting_ac;
        addless.SR_posting_ac = req.body.SR_posting_ac;
        addless.PR_posting_ac= req.body.PR_posting_ac;
        addless.Parameter_posting = req.body.Parameter_posting ;
        addless.update= new Date();
        addless.del= 'N';
        addless.co_code =  req.session.compid;
        addless.div_code =  req.session.divid;
        addless.usrnm =  req.session.user;
        addless.masterid =   req.session.masterid;
         let query = {_id:req.params.id}
         addlessmast.update(query, addless, function(err){
            if(err){
                res.json({ 'success': false, 'message': 'Error in Updating City', errors: err });
            } else {
                res.redirect('/addless_mast/addless_mast');
            }
        });
    }
});
router.delete('/confirm/:id', function(req, res){
    journalmast.findOne({$or: [{cashac_name:req.params.id},{cash_bank_name:req.params.id}],div_code:req.session.divid,co_code:req.session.compid,main_bk:{$ne:'OP'},del:"N"}, function(err1, tran){
        Garu.findOne({$or: [{"add_details":{$elemMatch: {particular_add: req.params.id}}},{"less_details":{$elemMatch: {particular_less: req.params.id}}}],div_code:req.session.divid,co_code:req.session.compid, del:"N"}, function(err2, Garu){
            if(err1 || err2){
            console.log(err1+"  "+err2);
            }else{
                if(Garu != null || tran != null){
                    res.json({success:'true'});
                }else{
                    res.json({success:'false'});
                }
            }
        });
    });
});


router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
      }
      let query = {_id:req.params.id}
      addlessmast.findById(req.params.id, function(err, add){
        let addless = {};   
        addless.delete= new Date();
        addless.del= 'Y';
        addlessmast.update(query,addless,function(err){
            if(err){
              console.log(err);
            }
            res.send('Success');
          });
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