var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose'),
    User = mongoose.model('User');

module.exports.init =  () => {
    console.log('passport.local.init');
    
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        console.log('1---passport.local.find:', email);

        User.findOne({ email: email },  (err, user) => {
            console.log('2---passport.local.find:', user, err);
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            if (!user.verifyPassword(password)) {
                return done(null, false);
            }
            
            return done(null, user);
        });
    }));

    passport.serializeUser( (user, done) => {
        console.log('passport.local.serializeUser:', user);
        done(null, user._id);
    });

    passport.deserializeUser( (id, done) => {
        console.log('passport.local.deserializeUser:', id);
        User.findById(id,   (err, user) => {
            done(err, user);
        });
    });
};
