const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const path = require('path');
let securitymast = require('../models/security_right_schema');
let userright = require('../models/user_rightSchema');
let div_com = require('../models/companySchema');
let div_mast = require('../models/divSchema');
let masterlogin = require('../models/masterSchema');
// let userright = require('../models/user_right_schema');
// let div_com = require('../models/company_schema');
// let div_mast = require('../models/division_schema');
// let masterlogin = require('../models/master_schema');
var nodemailer = require('nodemailer');
// const popup = require('popups');

router.post('/mailsend', function (req, res, next) {
    let errors = req.validationErrors();
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ravi.softsolutions@gmail.com',
            pass: 'R_123456'
        }
    });
    var userEmail = req.body.mailid;
    var mailOptions = {
        from: 'ravi.softsolutions@gmail.com',
        to: 'support@softsolution.org',
        subject: 'DEMO',
        html: userEmail
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.json({ 'success': false, 'message': error });
        } else {
            res.redirect('/userright/login');
            // redirect('');
            //   res.json({ 'success': true, 'message': 'email sent successfully' });
        }
    });
});

router.post('/getenquiry', function (req, res, next) {
    let errors = req.validationErrors();
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ravi.softsolutions@gmail.com',
            pass: 'R_123456'
        }
    });
    var enqmessage = req.body.enqmessage;
    var enqname = req.body.enqname;
    var enqemailid = req.body.enqemailid;
    var emailhtml = '' + enqname + '<br/>' + enqemailid + '<br/>' + enqmessage
    var mailOptions = {
        from: 'ravi.softsolutions@gmail.com',
        to: 'support@softsolution.org',
        subject: 'GET IN TOUCH',
        html: emailhtml
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.json({ 'success': false, 'message': error });
        } else {
            res.redirect('/userright/login');
            // redirect('');
            //   res.json({ 'success': true, 'message': 'email sent successfully' });
        }
    });
});
var query;
///api applogin


router.post('/appuserlogin', function (req, res, next) {
    let errors = req.validationErrors();
    if (errors) {
        res.json({ 'success': false, 'message': 'Validation Error' });
    } else {
        console.log(req.body.usrpwd + "  ")
        userright.findOne({ usrnm: req.body.usrnm }, function (err, userright) {
            div_com.findById({ _id: userright.co_code }, function (err, div_com) {
                div_mast.findById({ _id: userright.div_code.substr(0, 24) }, function (err, div_mast) {
                    if (div_mast.filepath != undefined) var filepath = div_mast.filepath;
                    else var filepath = 'public\\uploads\\dailyratesimage\\company.png';
                    if (err) {
                        res.json({ 'success': false, 'message': err });
                    }
                    if (!userright) {
                        res.json({ 'success': false, 'message': 'No user found' });

                    } else {
                        console.log(req.body.usrpwd + "  " + userright.usrpwd)
                        if (req.body.usrpwd == userright.usrpwd) {
                            // bcrypt.compare(req.body.usrpwd, userright.usrpwd, function(err, isMatch){
                            if (err) throw err;
                            if (isMatch) {
                                res.json({
                                    'success': true,
                                    'user_name': userright.usrnm,
                                    'company_name': div_com.com_name,
                                    'image': "http://www.softsauda.com:3000/" + filepath + "",
                                    "co_code": userright.co_code,
                                    "div_code": userright.div_code,
                                    "masterid": userright.masterid
                                });
                            } else {
                                res.json({ 'success': false, 'message': 'Wrong password' });
                            }
                            // });
                        }
                    }
                })
            });
        });
    }
});

// Add Route
router.get('/userright', ensureAuthenticated, function (req, res) {
    securitymast.find({}, function (err, securitymast) {
        div_com.find({}, function (err, div_com) {
            div_mast.find({}, function (err, div_mast) {
                masterlogin.find({}, function (err, masterlogin) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render('userright.hbs', {
                            pageTitle: 'Add User',
                            securitymast: securitymast,
                            div_com: div_com,
                            masterlogin: masterlogin,
                            div_mast: div_mast,
                            compnm: req.session.compnm,
                            divnm: req.session.divmast,
                            sdate: req.session.compsdate,
                            edate: req.session.compedate,
                            usrnm: req.session.user,
                            security: req.session.security,
                            administrator: req.session.administrator
                        });
                    }
                });
            });
        });
    });
});

router.post('/add', function (req, res) {
    const usrnm = req.body.usrnm;
    const usrpwd = req.body.usrpwd;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const emailid = req.body.emailid;
    const phone_num = req.body.phone_num;
    const details = req.body.details;
    const admin = req.body.admin;
    const co_code = req.body.co_code;
    const div_code = req.body.div_code;
    const administrator = req.body.administrator;
    const masterid = req.body.masterid;
    // req.checkBody('name', 'Name is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.json({ 'success': false, 'message': 'Validation error', errors: errors });
    } else {
        userright.findOne({ usrnm: req.body.usrnm }, function (errors, user) {
            if (errors) {
                console.log(errors);
                res.json({ 'success': false, 'message': 'Error in finding usrnm', errors: errors });
            }
            if (!user) {
                let newUser = new userright({
                    usrnm: usrnm,
                    usrpwd: usrpwd,
                    emailid: emailid,
                    first_name: first_name,
                    last_name: last_name,
                    phone_num: phone_num,
                    details: details,
                    admin: admin,
                    co_code: co_code,
                    div_code: div_code,
                    administrator: administrator,
                    masterid: masterid,
                });
                bcrypt.genSalt(10, function (errors, salt) {
                    bcrypt.hash(newUser.usrpwd, salt, function (errors, hash) {
                        if (errors) {
                            res.json({ 'success': false, 'message': 'Error in Generating Password Hash', errors: errors });
                        }
                        newUser.usrpwd = hash;
                        newUser.save(function (errors) {
                            if (errors) {
                                console.log(errors);
                                res.json({ 'success': false, 'message': 'Error in Saving User', errors: errors });
                            } else {
                                //   res.json({ 'success': true, 'message': 'User added succesfully'});
                                res.redirect('/userright/admin_list');
                            }
                        });
                    });
                });
            } else {
                // var errors = 'User already exist';

                // window.alert('User already exist');
                // popup.alert({
                //     content: 'User already exist!'
                // });
                // "<script>alert('Updated Succesfully');window.location.href='userright/userright'</script>";
                res.send("<script>alert('User already exist');window.location.href='/userright/userright'</script>")
                // res.redirect('userright');
                // res.json({ 'success': false, 'message': 'User already exist', serialerror: 'User already exist ' });
            }
        });
    }
});

router.get('/getdivision', ensureAuthenticated, function (req, res) {
    //     console.log (req.session.div_code);

    var lvalue = req.session.div_code
    div_com.findById(req.query.compid, function (err, div_com) {
        div_mast.find({}, function (err, div_mast) {
            if (err) {
                console.log(err);
            } else {
                req.session.compid = req.query.compid;
                req.session.compnm = div_com['com_name'];
                req.session.compsdate = div_com['sdate'];
                req.session.compedate = div_com['edate'];
                req.session.divid = req.query.divid;
                var alldivisions = [];
                var x = 0;
                for (var i = 0; i <= div_mast.length; i++) {
                    if (div_mast[i] != null) {
                        var strdivid = div_mast[i]['_id'].toString();
                        if ((lvalue).toString().search(strdivid) >= 0) {
                            var obj = {};
                            obj.compname = div_mast[i]['div_mast'];// + i;
                            obj.compcode = div_mast[i]['div_code'];
                            obj.link = 'userright/division?divid=' + div_mast[i]['_id'] + '&divname=' + div_mast[i]['div_mast'] + '&divcode=' + div_mast[i]['div_code'] + '&compid=' + req.session.compid + '&compstatecode=' + div_mast[i]['ac_state'];
                            alldivisions[x] = obj;
                            x++;
                        }
                    }
                }
                res.json({ success: true, divisions: alldivisions });
            }
        });
    });
});

router.get('/division', ensureAuthenticated, function (req, res) {
    
    req.session.divid = req.query.divid;
    req.session.divmast = req.query.divcode;
    req.session.divname = req.query.divname;
    req.session.divcode = req.query.divcode;
    req.session.compid = req.query.compid;
    req.session.compstatecode = req.query.compstatecode;
    res.render('index.hbs', {
        pageTitle: 'Division Selection',
        div_com: div_com,
        div_mast: div_mast,
        usernm: req.session.user,
        compid: req.session.compid,
        compnm: req.session.compnm,
        divnm: req.session.divcode,
        sdate: req.session.compsdate,
        edate: req.session.compedate,
        usrnm: req.session.user,
        security: req.session.security,
        administrator: req.session.administrator

    });
});
//     router.get('/company', ensureAuthenticated, function(req, res){
//         userright.findOne({usrnm: req.session.user}, function(err,userright){
//             req.session.co_code =userright['co_code'];
//             req.session.div_code =userright['div_code'];
//             div_com.findById(req.query.compid, function (err,div_com){
//                 div_mast.find({}, function (err, div_mast) {
//             // div_mast.findById(req.query, function (err,div_mast){
//             if (err) {
//                 console.log(err);
//             } else {

//                 req.session.compid = req.query.compid;
//                 // req.session.compnm = req.query.compname;
//                 req.session.compsdate = div_com['sdate'];
//                 req.session.compedate = div_com['edate'];
//                 req.session.compename = div_com['com_name'];
//                 req.session.divid = req.query.divid;
//                 res.render('divison.hbs', {
//                     pageTitle:'Company Selection',
//                     div_com: div_com,
//                     div_mast: div_mast,
//                     usernm: req.session.user,
//                     div_code: req.session.div_code,
//                     // com_name: req.session.compnm
//                     com_name:req.session.compename
//             });
//             } 
//         });         
//         });
//     });

// });
router.get('/company', ensureAuthenticated, function (req, res) {
    userright.findOne({ usrnm: req.session.user }, function (err, userright) {
        req.session.co_code = userright['co_code'];
        req.session.div_code = userright['div_code'];
        div_com.findById(req.query.compid, function (err, div_com) {
            div_mast.find({}, function (err, div_mast) {
                // div_mast.findById(req.query, function (err,div_mast){
                if (err) {
                    console.log(err);
                } else {

                    req.session.compid = req.query.compid;
                    req.session.compnm = req.query.compname;
                    req.session.compsdate = div_com['sdate'];
                    req.session.compedate = div_com['edate'];
                    req.session.divid = req.query.divid;
                    res.render('divison.hbs', {
                        pageTitle: 'Company Selection',
                        div_com: div_com,
                        div_mast: div_mast,
                        usernm: req.session.user,
                        div_code: req.session.div_code,
                        com_name: req.session.compnm
                    });
                }
            });
        });
    });

});

router.get('/login', function (req, res) {
    res.render('login.hbs', { title: 'Login', error: req.flash('error')[0] });
});
// temporarly added route to run new theme List page
router.get('/list', function (req, res) {
    res.render('list.hbs', { title: 'List Demo', error: req.flash('error')[0] });
});
// temporarly added route to run new theme form page
router.get('/form', function (req, res) {
    res.render('form.hbs', { title: 'Home', error: req.flash('error')[0] });
});
// temporarly added route to run new theme comps page
router.get('/comps', function (req, res) {
    res.render('comps.hbs', { title: 'Home', error: req.flash('error')[0] });
});
// temporarly added route to run new theme blank page
router.get('/blank', function (req, res) {
    res.render('blank.hbs', { title: 'Home', error: req.flash('error')[0] });
});
// temporarly added route to run old theme
router.get('/index_old', function (req, res) {
    res.render('index_old.hbs', { title: 'Home', error: req.flash('error')[0] });
});
// temporarly added route to test datatable data
router.get('/data', function (req, res) {
    console.log(req.params);
    res.sendFile(path.join(__dirname, '../public', 'data.json'));
});
// temporarly added route to test datatable
router.get('/datatable', function (req, res) {
    console.log(req.params);
    res.render('datatable.hbs', { title: 'Datatable', error: req.flash('error')[0] });
});
router.get('/index', function (req, res) {
    res.render('index.hbs', { title: 'Home', error: req.flash('error')[0] });
});

router.get('/print', function (req, res) {
    res.render('print.hbs', { title: 'Home', error: req.flash('error')[0] });
});

router.get('/print2', function (req, res) {
    res.render('print2.hbs', { title: 'Home', error: req.flash('error')[0] });
});


// Login Process
router.post('/login', function (req, res, next) {
    //  console.log('r', req.body.usrnm);
    req.checkBody('usrnm', 'usrnm is required');
    req.checkBody('usrpwd', 'usrpwd is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.json({ 'error': true, 'message': 'validation error' });
    } else {
        req.session.user = req.body.usrnm;
        req.session.user = req.body.usrnm;
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/userright/login',
            failureFlash: true,
        })(req, res, next);
    }
});


router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/userright/login');
});

router.get('/admin_list', ensureAuthenticated, function (req, res) {
    userright.find({}, function (err, userright) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('admin_list.hbs', {
                pageTitle: 'admin List',
                userright: userright,
                compnm: req.session.compnm,
                divnm: req.session.divmast,
                sdate: req.session.compsdate,
                edate: req.session.compedate,
                usrnm: req.session.user,
                security: req.session.security,
                administrator: req.session.administrator
            });
        }
    });
});
router.get('/admin_list_update/:id', ensureAuthenticated, function (req, res) {
    userright.findById(req.params.id, function (err, userright) {
        div_com.find({}, function (err, div_com) {
            div_mast.find({}, function (err, div_mast) {
                securitymast.find({}, function (err, securitymast) {
                    masterlogin.find({}, function (err, masterlogin) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.render('admin_list_update.hbs', {
                                pageTitle: 'Update Amin',
                                userright: userright,
                                securitymast: securitymast,
                                div_com: div_com,
                                div_mast: div_mast,
                                masterlogin: masterlogin,
                                compnm: req.session.compnm,
                                divnm: req.session.divmast,
                                sdate: req.session.compsdate,
                                edate: req.session.compedate,
                                usrnm: req.session.user,
                                security: req.session.security,
                                administrator: req.session.administrator
                            });
                        }
                    });
                });
            });
        });
    });
});
router.post('/update/:id', function (req, res) {
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ 'success': false, 'message': 'validation error', 'errors': errors });
    } else {
        let user = {};
        user.usrnm = req.body.usrnm;
        // user.usrpwd = ;
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        user.emailid = req.body.emailid;
        user.phone_num = req.body.phone_num;
        user.details = req.body.details;
        user.admin = req.body.admin;
        user.co_code = req.body.co_code;
        user.div_code = req.body.div_code;
        user.administrator = req.body.administrator;
        user.masterid = req.body.masterid;
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.usrpwd, salt, function (err, hash) {
                user.usrpwd = hash;
                let query = { _id: req.params.id }
                userright.update(query, user, function (err) {
                    if (err) {
                        res.json({ 'success': false, 'message': 'Error in Saving State', 'errors': err });
                        return;
                    } else {
                        // res.json({ 'success': true, 'message': 'Order added succesfully' });
                        res.redirect('/userright/admin_list');
                    }
                });
            });
        });
    }
});

router.get('/delete_admin/:id', function (req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }
    let query = { _id: req.param.id }
    userright.findById(req.params.id, function (err, userright) {
        userright.remove(query, function (err) {
            if (err) {
                console.log(err);
            }
            // res.send('Success');
            res.redirect('/userright/admin_list');
        });
    });
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