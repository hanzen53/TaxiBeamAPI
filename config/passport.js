// load the auth variables
var configAuth = require('../config/config');

// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User       = require('../server/models/user');
var PassengerModel = require('../server/models/Passengers');

//var mongoose  = require('mongoose') ,
//UserModel  = mongoose.model('UserModel') ;

//console.log (configAuth)
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    // http://toon.io/understanding-passportjs-authentication-flow/ , http://passportjs.org/docs , http://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize , https://scotch.io/tutorials/easy-node-authentication-setup-and-local
    passport.serializeUser(function(user, done) {       
        //console.log( 'serial User = '+user)
        //console.log(' user .id = '+ user.id)        
        // for (var i in user) 
        // console.log(i)
        done(null, user.id);        
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {        
        //console.log( 'deserial 111111111111111111111111111111111 ')        
        //console.log( ' session = '+req.session.passport.user )
        //console.log(' id = ' + id )
         User.findById(id, function(err, user) {
            if (user==null) {
                //console.log( 'null user search passenger ')
                PassengerModel.findById(id, function(err, user) {
                    if (user==null) {
                        //console.log( 'null passenger  ')
                        done(err, user);
                    } else {
                        done(err, user);
                    }  
                });              
            } else {
                done(err, user);
            }
            //console.log( 'deserial 22222222222222222222222222222 ')
            //console.log(' err = '+ err)
            //console.log(' user = '+ user)
            //done(err, user);
         });        
    });


    // used to serialize the Passengers for the session
    /*
    passport.serializeUser(function(Passengers, done) {
        done(null, Passengers.id);
    });

    // used to deserialize the Passengers
    passport.deserializeUser(function(id, done) {
        Passenger.findById(id, function(err, Passengers) {
            done(err, Passengers);
        });
    });
    */
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        usernameField : 'username',
        cnameField      : 'name',
        cemailField     : 'email',
        cgroupField     : 'group',
        ctypeField      : 'type',        
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
            function(req, username, password, done) {
                if (username)
                    username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
                    // asynchronous
                    process.nextTick(function() {
                    User.findOne({ 'username' :  username }, function(err, user) {
                    //console.log('found'+username)
                    // if there are any errors, return the error
                if (err) {
                    return done(err);
                }

                // if no user is found, return the message
                if (!user) {
                    //console.log(' not found usernae '+username)
                    return done(null, false, req.flash('loginMessage', 'ไม่พบ Username นี้ กรุณาลองใหม่'));
                }

                if (!user.validPassword(password)){
                    //console.log('invalid password for '+username)
                    return done(null, false, req.flash('loginMessage', 'Password ผิด กรุณาลองใหม่'));
                }
                // all is well, return user
                    else {  //                 
                        //console.log(' success login '+username)
                        return done(null, user);
                }
            });
        });
    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        usernameField   : 'username',
        cnameField      : 'name',
        cemailField     : 'email',
        cgroupField     : 'group',
        ctypeField      : 'type',
        passwordField   : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, username, password, done) {   
      //console.log(username )     
        if (username)
            username = username.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'local.username': username }, function(err, psg) {
                    // if there are any errors, return the error                    
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that username
                    //if (psg) {
                    if(psg !== null) {   
                        //console.log( ' !null  '+ username)
                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                    } else {
                        //console.log( ' null   '+ username)
                        // create the user
                        var newUser            = new User();
                        newUser.username  = req.body.username;
                        newUser.local.username  = req.body.username;
                        newUser.local.cname     = req.body.cname;
                        newUser.local.cemail    = req.body.cemail;
                        newUser.local.cgroup    = req.body.cgroup;
                        newUser.local.ctype     = req.body.ctype;
                        newUser.local.password  = newUser.generateHash(password);                        
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);

                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.local.username ) {     //
                //console.log( ' login  '+ username)
                // ...presumably they're trying to connect a local account
                // BUT let's check if the username used to connect a local account is being used by another user
                User.findOne({ 'username' :  username }, function(err, psg) {
                    if (err)
                        return done(err);
                    
                    if (psg) {
                        return done(null, false, req.flash('loginMessage', 'That username is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var user = req.user;
                        user.local.username     = username;
                        user.username     = username;
                        user.local.cname     = req.body.cname;
                        user.local.cemail    = req.body.cemail;
                        user.local.cgroup    = req.body.cgroup;
                        user.local.ctype     = req.body.ctype;                        
                        user.local.password     = user.generateHash(password);
                        //console.log(user.local)
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,user);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));



    // =========================================================================
    // LOCAL LOGIN  Passenger=========================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-psg-login', new LocalStrategy({        
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form            
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            //console.log('local psg login')
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            PassengerModel.findOne({ 'local.email' :  email }, function(err, user) {
            //console.log(' try to find user : '+username)            
            // if there are any errors, return the error before anything else
            if (err) {
               console.log (' err found : '+err)
                return done(err);
            }
            // if (user)
            //     console.log(user.local)

            // if no user is found, return the message
            if (!user){                                
                //console.log(' Not found for user : ' + username)
                return done(null, false, req.flash('PSGloginMessage', 'ไม่พบ Email นี้ กรุณาลองใหม่')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            if (!user.validPassword(password)){                
                //console.log(' password is invalid for user : '+username)
                return done(null, false, req.flash('PSGloginMessage', 'Password ผิด กรุณาลองใหม่')); // create the loginMessage and save it to session as flashdata
            } else {
                // all is well, return successful user                
                // console.log(' successful login for user : ' + username )
                // console.log(user._id)                
                return done(null, user);
            }
            
        });

    }));


    // =========================================================================
    // LOCAL SIGNUP  Passenger ========================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-psg-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with username
        usernameField : 'email',        
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        console.log(' register email = '+email )  
        // asynchronous
        // Passenger.findOne wont fire unless data is sent back
        process.nextTick(function() {

            // find a Passenger whose username is the same as the forms username
            // we are checking to see if the Passenger trying to login already exists
            PassengerModel.findOne({ 'local.email' :  email }, function(err, psg) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                // check to see if theres already a psg with that username
                if (psg) {
                    console.log( ' !null  '+ email)
                    return done(null, false, req.flash('PSGsignupMessage', 'Email นี้มีผู้ใช้แล้ว กรุณาใส่ข้อมูลใหม่ '));
                } else {
                    //console.log( '  = null  '+ username)
                    // if there is no psg with that username
                    // create the psg
                            var newPassenger = new PassengerModel();
                            // set the psg's local credentials
                            newPassenger.local.email = email;                            
                            newPassenger.local.password     = newPassenger.generateHash(password); 
                            newPassenger.local.displayName = req.body.displayName;
                            newPassenger.device_id = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime();
                            newPassenger.displayName = req.body.displayName; 
                            newPassenger.fname = req.body.fname;
                            newPassenger.lname = req.body.lname;
                            newPassenger.email = req.body.email;
                            newPassenger.gender = req.body.gender;
                            newPassenger.phone   = req.body.phone;

                            // save the psg
                            newPassenger.save(function(err) {                    
                                if (err)
                                    throw err;
                                return done(null, newPassenger);
                            }); 
                    }
            });    
        });
    }));




    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    /*
        Facebook return : 
        https://www.facebook.com/dialog/oauth?
        response_type=code
        &redirect_uri=http%3A%2F%2Flite-test.taxi-beam.com%2Fauth%2Ffacebook%2Fcallback
        &scope=email
        &client_id=201498690221911
    */    
    passport.use(new FacebookStrategy({
        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.PRODUCTION.facebookAuth.clientID,
        clientSecret    : configAuth.PRODUCTION.facebookAuth.clientSecret,
        callbackURL     : configAuth.PRODUCTION.facebookAuth.callbackURL,
        //profileFields: ['id', 'name','picture.type(large)', 'emails', 'username', 'displayName', 'about', 'gender']
        profileFields: ['id', 'name','picture.type(large)', 'emails', 'displayName', 'about', 'gender']
    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
    // console.log( ' facebookxxx')

        // console.log(' facebook profile : '+profile)
        // // asynchronous
        // for (var i in profile) 
        // console.log(i + ' = ' +profile[i])
        // for (var x in profile._json)   
        // console.log( x + ' = ' +profile._json[x])
        // for (var x in profile._json.picture.data)   
        // console.log( x + ' = ' +profile._json.picture.data[x])

        process.nextTick(function() {

            // find the user in the database based on their facebook id
            PassengerModel.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newPassenger            = new PassengerModel();
                    //newUser.facebook = {};
                    // set all of the facebook information in our user model
                    newPassenger.facebook.id    = profile.id; // set the users facebook id                   
                    newPassenger.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newPassenger.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newPassenger.facebook.displayName  = profile.displayName; // look at the passport user profile to see how names are returned
                    newPassenger.facebook.pictureprofile  = profile._json.picture.data.url;
                    newPassenger.facebook.email  = profile._json.email;
                    newPassenger.facebook.first_name  = profile._json.first_name;
                    newPassenger.facebook.last_name  = profile._json.last_name;
                    newPassenger.facebook.gender  = profile._json.gender;                    
                    newPassenger.device_id = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime();
                    newPassenger.displayName = profile.displayName; 
                    newPassenger.fname = profile._json.first_name;
                    newPassenger.lname = profile._json.last_name;
                    newPassenger.email = profile._json.email;
                    newPassenger.gender = profile._json.gender;
                    newPassenger.pictureprofile = profile._json.picture.data.url;               
                    //newUser.facebook.about  = profile.about;                    
                    //newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newPassenger.save(function(error) {
                        console.log(error)
                        if (error)
                            throw error;

                        // if successful, return the new user
                        return done(null, newPassenger);
                    });
                }

            });
        });

    }));





    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID        : configAuth.PRODUCTION.googleAuth.clientID,
        clientSecret    : configAuth.PRODUCTION.googleAuth.clientSecret,
        callbackURL     : configAuth.PRODUCTION.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {
        // console.log(' google+ profile : '+profile)
        // for (var i in profile) 
        // console.log(i + ' = ' +profile[i])       
        // for (var x in profile._json)   
        // console.log( x + ' = ' +profile._json[x])
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google

        if (profile.emails[0].value) {
            email = profile.emails[0].value; // pull the first email
        } else {
            email = "";
        }

        process.nextTick(function() {

            // try to find the user based on their google id
            PassengerModel.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newPassenger          = new PassengerModel();

                    // set all of the relevant information
                    newPassenger.google.id    = profile.id;
                    newPassenger.google.token = token;
                    newPassenger.google.name  = profile.displayName;
                    newPassenger.google.email = profile._json.email;
                    newPassenger.google.given_name    = profile._json.given_name;
                    newPassenger.google.family_name    = profile._json.family_name;
                    newPassenger.google.link    = profile._json.link;
                    newPassenger.google.picture    = profile._json.picture;
                    newPassenger.google.gender    = profile._json.gender;
                    newPassenger.google.locale    = profile._json.locale;
                    newPassenger.google.hd    = profile._json.hd;
                    newPassenger.device_id = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime();
                    newPassenger.displayName = profile.displayName;
                    newPassenger.fname = profile._json.given_name;
                    newPassenger.lname = profile._json.family_name;
                    newPassenger.email = profile._json.email;
                    newPassenger.gender = profile._json.gender;
                    newPassenger.pictureprofile = profile._json.picture;

                    // save the user
                    newPassenger.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newPassenger);
                    });
                }
            });
        });

    }));





};