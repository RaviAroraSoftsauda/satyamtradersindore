const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user_rightSchema');

module.exports = function(passport){
  // Local Strategy
  passport.use(new LocalStrategy(
    {usernameField:'usrnm',
    passwordField:'usrpwd'},
    function(username, password, done){
    // Match Username
    // console.log('rr',username+" "+password);
    User.findOne({usrnm:username}, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'No user found'});
      }
      // Match Password
      // bcrypt.compare(password, user.usrpwd, function(err, isMatch){
        // console.log('rr1',password, user.usrpwd);
        if(err) throw err;
        if(password.trim() == user.usrpwd.trim()){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Wrong password1234'});
        }
      // });
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}
