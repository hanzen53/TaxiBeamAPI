////////////////////////////////////
// Taxi-Beam Route for  API 
// version : 1.0.1
// Date revision: May 10, 2016 
// Created by Hanzen@BRET
////////////////////////////////////
var config = require('../../config/func').production;

var Controller = require('../controllers/Controller');
var DriverCS = require('../controllers/Drivercs');
var PassengerTP = require('../controllers/Passengertp');
var Hotels = require('../controllers/Hotels');
var Share = require('../controllers/Share');
var Garage = require('../controllers/Garage');
var Ecadmin = require('../controllers/Ecadmin');
var UbeamTP = require('../controllers/Ubeamtp');
var SocketController = require('../controllers/SocketController');
//var utils = require('../../config/utils');

// var fs = require('fs');
// var util = require('util');
// var log_file = fs.createWriteStream('C:/nodejs/nodebug.log', {flags : 'w'});
// var log_stdout = process.stdout;

module.exports = function (app, io, passport) {

    /* --------------------------------------------
     *    Service
     * --------------------------------------------*/
    app.get('/service/me', function (req, res) {
        var users = req.users;
        if (user) {
            //res.json({
            var user_id = user.local._id
            //});
        }
        //console.log('user_id = '.user_id);
    });

    /////
    app.post('/service/passenger/listall', isLoggedIn, Ecadmin.ListPassenger);
    app.post('/service/taxi/listall', isLoggedIn, Ecadmin.ListDrv);
    app.post('/service/users/listall', isLoggedIn, Ecadmin.ListUser);
    app.post('/service/users/getusergr', isLoggedIn, Ecadmin.getusergr);
    app.post('/manage_data/update_main', isLoggedIn, Ecadmin.update_main);

    //isAuthenticated = true ;   //     test
    // app.post('/manage_data/update_main',  function(req, res) {  
    //   var main = JSON.parse(req.body.main);
    //   var gid = req.body.gid;
    //   main.table = [];
    //   main.subform = [];
    //  console.log(main)


    // });
    ////

    // Garage api
    app.post('/service/garage/testsendmail', Garage.testsendmail);
    app.post('/service/garage/userlogin', Garage.userlogin);
    app.post('/service/garage/forgetpwd', Garage.forgetpwd);
    app.post('/service/garage/showcars', Garage.showcars);
    app.post('/service/garage/searchcars', Garage.searchcars);
    app.post('/service/garage/getdrvinfo', Garage.getdrvinfo);
    app.post('/service/garage/getdrvhistory', Garage.getdrvhistory);
    app.post('/service/garage/getjobinfo', Garage.getjobinfo);
    app.post('/service/garage/getpathinfo', Garage.getpathinfo);
    app.post('/service/garage/getdrvlist', Garage.getdrvlist);
    app.post('/service/garage/updatedrvinfo', Garage.updatedrvinfo);
    app.post('/service/garage/getcarlist', Garage.getcarlist);
    app.post('/service/garage/getcarinfo', Garage.getcarinfo);
    app.post('/service/garage/updatecarinfo', Garage.updatecarinfo);
    app.post('/service/garage/senddrvmsg', Garage.senddrvmsg);
    app.post('/service/garage/changepwd', Garage.changepwd);
    app.post('/service/garage/statsearch', Garage.statsearch);
    app.post('/service/garage/insertcars', Garage.insertcars);


    // new API driver countryside version ////////////////////////////////////////////////////////////////////////////////

    app.post('/service/drivercs/Login', DriverCS.driverLogin);
    app.post('/service/drivercs/register', DriverCS.driverRegister);
    //app.post('/service/drivercs/autoLogin'        , DriverCS.driverAutoLogin); 
    app.post('/service/drivercs/updateProfile', DriverCS.driverUpdateProfile);
    app.post('/service/drivercs/changeOnOff', DriverCS.driverchangeOnOff);
    app.post('/service/drivercs/getStatus', DriverCS.driverGetStatus(io));
    app.post('/service/drivercs/searchPassenger', DriverCS.driverSearchPassenger);
    app.post('/service/drivercs/acceptCall', DriverCS.driverAcceptCall(io));
    app.post('/service/drivercs/acceptHotel', DriverCS.driverAcceptHotel(io));    
    app.post('/service/drivercs/cancelCall', DriverCS.driverCancelCall(io));
    app.post('/service/drivercs/cancelHotel', DriverCS.driverCancelHotel(io));
    app.post('/service/drivercs/CancelCallCenter', DriverCS.driverCancelCallCenter(io));
    app.post('/service/drivercs/pickPassenger', DriverCS.driverPickPassenger(io));
    app.post('/service/drivercs/pickHotel', DriverCS.driverPickHotel(io));
    app.post('/service/drivercs/endTrip', DriverCS.driverEndTrip(io));
    app.post('/service/drivercs/EndTripHotel', DriverCS.driverEndTripHotel(io));
    app.post('/service/drivercs/getByID', DriverCS.driverGetByID);
    app.post('/service/drivercs/sendComment', DriverCS.driverSendComment);
    app.post('/service/drivercs/uploadFace', DriverCS.driveruploadFace);
    app.post('/service/drivercs/uploadLicence', DriverCS.driveruploadLicence);
    app.post('/service/drivercs/uploadCar', DriverCS.driveruploadCar);
    app.post('/service/drivercs/brokenAdd', DriverCS.driverBrokenAdd);
    app.post('/service/drivercs/brokenEdit', DriverCS.driverBrokenEdit);
    app.post('/service/drivercs/brokenDel', DriverCS.driverBrokenDel);
    app.post('/service/drivercs/brokenReport', DriverCS.driverBrokenReport);
    app.post('/service/drivercs/brokenCancel', DriverCS.driverBrokenCancel);
    app.post('/service/drivercs/drivergotmsg', DriverCS.drivergotmsg);
    app.post('/service/drivercs/gotdispatchaction', DriverCS.gotdispatchaction(io));
    app.post('/service/drivercs/driverEndTask', DriverCS.driverEndTask(io));

    app.post('/service/drivercs/sendSMSUP', DriverCS.sendSMSUP);
    app.post('/service/drivercs/ChangePWDonly', DriverCS.ChangePWDonly);
    app.post('/service/drivercs/sendSMSConfirm', DriverCS.sendSMSConfirmation);
    app.post('/service/drivercs/driverReturnCar', DriverCS.driverReturnCar);
    app.post('/service/drivercs/GetParkingQueue', DriverCS.driverGetParkingQueue);
    app.post('/service/drivercs/BookParkingQueue', DriverCS.driverBookParkingQueue);
    app.post('/service/drivercs/LeftParkingQueue', DriverCS.driverLeftParkingQueue);
    app.post('/service/drivercs/checkIconURL', DriverCS.checkIconURL);

    // This service use from UbeamTP
    app.post('/service/drivercs/announcementGet', UbeamTP.announcementGet);
    app.post('/service/drivercs/askGGcharge', UbeamTP.askGGcharge);
    app.post('/service/drivercs/DrvGGAddMoney', UbeamTP.DrvGGAddMoney);
    app.post('/service/drivercs/DrvGGAddHour', UbeamTP.DrvGGAddHour);
    app.post('/service/drivercs/askAPPcharge', UbeamTP.askAPPcharge);
    app.post('/service/drivercs/DrvAPPAddMoney', UbeamTP.DrvAPPAddMoney);
    app.post('/service/drivercs/DrvAPPAddHour', UbeamTP.DrvAPPAddHour);



    //app.post('/service/drivercs/Activation'       , DriverCS.driverActivation);   
    //app.post('/service/drivercs/testSocket'       , DriverCS.drivertestSocket);
    app.post('/service/drivercs/all', DriverCS.all);


    // new API  UBEAM  countryside version ///////////////////////////////////////////////////////////////////////////  
    app.post('/service/ubeam/searchPsg', UbeamTP.ubeamSearchPassenger);
    app.post('/service/ubeam/searchnamecar', UbeamTP.searchnamecar);
    app.post('/service/ubeam/senddrvmsg', UbeamTP.senddrvmsg);
    app.post('/service/ubeam/addjoblist', UbeamTP.addjoblist(io));
    app.post('/service/ubeam/editjoblist', UbeamTP.editjoblist(io));
    app.post('/service/ubeam/getinitiatelist', UbeamTP.getinitiatelist);
    app.post('/service/ubeam/getadvancelist', UbeamTP.getadvancelist);
    app.post('/service/ubeam/getdpendinglist', UbeamTP.getdpendinglist);
    app.post('/service/ubeam/getassignlist', UbeamTP.getassignlist);
    app.post('/service/ubeam/getsendjoblist', UbeamTP.getsendjoblist);
    app.post('/service/ubeam/getpsgsphonelist', UbeamTP.getpsgsphonelist);
    app.post('/service/ubeam/assigndrvtopsg', UbeamTP.assigndrvtopsg(io));
    app.post('/service/ubeam/checkinitiatepsg', UbeamTP.checkinitiatepsg);
    app.post('/service/ubeam/checkavailabledrv', UbeamTP.checkavailabledrv);
    app.post('/service/ubeam/matchpsgdrv', UbeamTP.matchpsgdrv);
    app.post('/service/ubeam/getpsgstatuslist', UbeamTP.getpsgstatuslist);
    app.post('/service/ubeam/addlocalpoi', UbeamTP.addlocalpoi);
    app.post('/service/ubeam/cancelpsgdrv', UbeamTP.cancelpsgdrv(io));
    app.post('/service/ubeam/searchdrv', UbeamTP.searchdrv);
    app.post('/service/ubeam/countTaxi', UbeamTP.countTaxi);
    app.post('/service/ubeam/checkdrvstatus', UbeamTP.checkdrvstatus);
    app.post('/service/ubeam/deletejob', UbeamTP.deletejob(io));
    app.post('/service/ubeam/updatedrvappversion', UbeamTP.updatedrvappversion);
    app.post('/service/ubeam/getreassignjobdetail', UbeamTP.getreassignjobdetail);
    app.post('/service/ubeam/getPassengerDetail', UbeamTP.getPassengerDetail);
    app.post('/service/ubeam/askGGcharge', UbeamTP.askGGcharge);
    app.post('/service/ubeam/DrvGGAddMoney', UbeamTP.DrvGGAddMoney);
    app.post('/service/ubeam/DrvGGAddHour', UbeamTP.DrvGGAddHour);
    app.post('/service/ubeam/askAPPcharge', UbeamTP.askAPPcharge);
    app.post('/service/ubeam/DrvAPPAddMoney', UbeamTP.DrvAPPAddMoney);
    app.post('/service/ubeam/DrvAPPAddHour', UbeamTP.DrvAPPAddHour);
    app.post('/service/ubeam/getPOIandParking', UbeamTP.getPOIandParking);
    app.post('/service/ubeam/UpdateAllDriverInfo', UbeamTP.UpdateAllDriverInfo);
    app.post('/service/ubeam/UpdateAllDrivercgroupname', UbeamTP.UpdateAllDrivercgroupname);
    
    app.post('/service/ubeam/updatedrvcgroup', UbeamTP.updatedrvcgroup);
    app.post('/service/ubeam/getjoblistbydate', UbeamTP.getjoblistbydate);

    app.post('/service/ubeam/searchFinishList', UbeamTP.searchFinishList);

    app.post('/service/ubeam/announcementAdd', UbeamTP.announcementAdd);
    app.post('/service/ubeam/announcementEdit', UbeamTP.announcementEdit);
    app.post('/service/ubeam/announcementDel', UbeamTP.announcementDel);
    app.post('/service/ubeam/announcementGet', UbeamTP.announcementGet);

    app.post('/service/ubeam/getpoirecommended', UbeamTP.getpoirecommended);
    app.post('/service/ubeam/getpoirecommendedgroup', UbeamTP.getpoirecommendedgroup);
    app.post('/service/ubeam/getpoirecommendedgrouplot', UbeamTP.getpoirecommendedgrouplot);
    
    /////////////////// for Report ////////////////////////////////////////
    app.post('/service/ubeam/CountJobPerDrv', UbeamTP.CountJobPerDrv);
    app.post('/service/ubeam/getAvgGetJobPerMinute', UbeamTP.getAvgGetJobPerMinute);
    app.post('/service/ubeam/MostHitStartPlace', UbeamTP.MostHitStartPlace);
    app.post('/service/ubeam/MostHitDestinationPlace', UbeamTP.MostHitDestinationPlace);
    app.post('/service/ubeam/MostHitDestinationPlace', UbeamTP.MostHitDestinationPlace);
    app.post('/service/ubeam/MostHitHours', UbeamTP.MostHitHours);
    app.post('/service/ubeam/PsgCallLog', UbeamTP.PsgCallLog);
    app.post('/service/ubeam/JoblistLog', UbeamTP.JoblistLog);

    app.post('/service/ubeam/announcement/all', UbeamTP.callcenterAnnounceAll);
    app.post('/service/ubeam/announcement/add', UbeamTP.callcenterAnnounceAdd);
    app.post('/service/ubeam/announcement/edit', UbeamTP.callcenterAnnounceEdit);
    app.post('/service/ubeam/announcement/delete', UbeamTP.callcenterAnnounceDel);
    
    //app.post('/service/ubeam/testjointable'       , UbeamTP.testjointable);
    app.post('/service/ubeam/UpdateExpAPPDate'    , UbeamTP.UpdateExpAPPDate); 
    //app.post('/service/ubeam/InsertRndDriver'     , UbeamTP.InsertRndDriver);   

    // new API  passenger touchpong version ///////////////////////////////////////////////////////////////////////////     
    app.post('/service/passengertp/searchDrv', PassengerTP.passengerSearchDrv);
    app.post('/service/passengertp/callDrv', PassengerTP.passengerCallDrv);
    app.get('/service/passengertp/callDrv', PassengerTP.passengerCallDrv);
    // app.get('/service/passengertp/callDrv', function(req, res) {
    //   console.log("All query strings: " + JSON.stringify(req.query));
    // });
    app.post('/service/passengertp/register', PassengerTP.passengerRegister); 
    app.post('/service/passengertp/Recall', PassengerTP.passengerReCall);
    app.post('/service/passengertp/getStatus', PassengerTP.passengerGetStatus);
    app.post('/service/passengertp/acceptDrv', PassengerTP.passengerAcceptDrv(io));
    app.post('/service/passengertp/cancelCall', PassengerTP.passengerCancelCall(io));
    app.post('/service/passengertp/cancelDrv', PassengerTP.passengerCancelDrv(io));
    app.post('/service/passengertp/getByID', PassengerTP.passengerGetByID);
    app.post('/service/passengertp/sendComment', PassengerTP.passengerSendComment);
    app.post('/service/passengertp/getDrvLoc', PassengerTP.passengerGetDrvLoc);
    app.post('/service/passengertp/endTrip', PassengerTP.passengerEndTrip);
    app.post('/service/passengertp/FavDrvAdd', PassengerTP.passengerFavDrvAdd);
    app.post('/service/passengertp/FavDrvDel', PassengerTP.passengerFavDrvDel);
    app.post('/service/passengertp/Psgcalllog', PassengerTP.Psgcalllog);
    //app.post('/service/passengertp/autoLogin'     , PassengerTP.passengerAutoLogin);
    //app.post('/service/passengertp/updateProfile' , PassengerTP.passengerUpdateProfile); 
    //app.post('/service/passengertp/editRoute'     , PassengerTP.passengerEditRoute);  
    //app.post('/service/passengertp/changeOnOff'   , PassengerTP.passengerchangeOnOff); 

    app.post('/service/hotels/register', Hotels.hotelRegister); 
    app.post('/service/hotels/updateProfile', Hotels.hotelUpdateProfile); 
    app.post('/service/hotels/GetStatus', Hotels.hotelGetStatus); 
    app.post('/service/hotels/SearchDrv', Hotels.hotelSearchDrv); 
    app.post('/service/hotels/CallDrv', Hotels.hotelCallDrv); 
    app.post('/service/hotels/viewJoblist', Hotels.hotelviewJoblist);
    app.post('/service/hotels/CancelCall', Hotels.hotelCancelCall(io));
    
    
    app.post('/socket/getDriverOnline', SocketController.getDriverOnline(io));
    

    /*Handling routes.*/
    //app.get('/',function(req,res){
    //    res.sendfile("index.html");
    //});

    app.post('/api/photo', function (req, res) {
        if (done == true) {
            //console.log(req.files);
            res.end("File uploaded.");
        }
    });


    app.get('/bot', function (req, res) {
        res.render("bot.ejs");
    });


    app.get('/callcenter/report', function (req, res) {
        res.render("callcenter/report-window.ejs");
    });


    // Use quickthumb
    //app.use(qt.static(__dirname + '/'));


    // Show the upload form 
    /*
    app.get('/', function (req, res){
      res.writeHead(200, {'Content-Type': 'text/html' });
      var form = '<form action="/service/driver/uploadFace" enctype="multipart/form-data" method="post">Add a title: <input name="title" type="text" /><br><br><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
      res.end(form); 
    }); 
    */


    // --------------------------------------------
    //      AUTHENTICATE (FIRST LOGIN)
    // --------------------------------------------
    // LOGIN ===============================
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP =================================
    // app.post('/signup', passport.authenticate('local-signup', {
    //     successRedirect: '/signup', // redirect to the secure profile section
    //     failureRedirect: '/signup', // redirect back to the signup page if there is an error
    //     failureFlash: true // allow flash messages
    // }));
    app.post('/signup', function(req, res, next) {
            passport.authenticate('local-signup', function(error, user, info) {
                if(error) {
                    return res.status(500).json(error);
                }
                if(!user) {
                    return res.status(401).json(info.message);
                }
                res.json({
                    status: true,
                    data: user
                });
            })(req, res, next);
    });

    // --------------------------------------------
    //      AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) 
    // --------------------------------------------
    app.get('/connect/local', function (req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/selectpage', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));


    // --------------------------------------------
    //      UNLINK ACCOUNTS 
    // --------------------------------------------
    app.get('/unlink/local', isLoggedIn, function (req, res) {
        var users = req.user;
        users.local.email = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect('/');
        });
    });



    app.get('/', function (req, res) {
        console.log('abc1')
        if (req.headers.host == config.testhostcallcenter || req.headers.host == config.hostcallcenter) {
            console.log('abc2')
            if (typeof req.user !== 'undefined') {
                console.log('abc3')
                Ecadmin.callcenter(req, res)
            } else {
                console.log('abc4')
                res.sendfile('./public/app/login.html');
            }
        } else if (req.headers.host == "localhost" || req.headers.host == "lite-dev.taxi-beam.com" || req.headers.host == "lite-test.taxi-beam.com") {
            //Ecadmin.calltaxi( req, res )
            console.log('abc5')
            if (typeof req.user !== 'undefined') {
                console.log('abc6')
                Ecadmin.calltaxi(req, res)
            } else {
                console.log('abc7')
                //res.render('index.ejs', { message: req.flash('PSGloginMessage') });
                //Ecadmin.calltaxi_lite(req, res)
                res.render('oktaxi.ejs');
            }
        } else {
            console.log('abc8')
            //Ecadmin.calltaxi_lite(req, res)
            res.render('oktaxi.ejs');
            //res.render('calltaxi_lite.ejs', { });
        }
        //res.sendfile('./public/app/login.html');
    });
    


    app.get('/calltaxi_lite', function (req, res) {
        Ecadmin.calltaxi_lite(req, res)
    });

    
    app.get('/passenger', Ecadmin.web);
    //app.get('/web', Ecadmin.web);
    app.get('/question', Ecadmin.question);
    app.get('/contactus', Ecadmin.contactus);
    app.get('/calltaxi', isPSGLoggedIn, Ecadmin.calltaxi);
    app.get('/user/signup', Ecadmin.signup);
    app.get('/profile', isLoggedIn, Ecadmin.profile);
    app.get('/admin', isLoggedIn, Ecadmin.admin);
    app.get('/admin/report', isLoggedIn, Ecadmin.adminReport);
    app.get('/user/changepwd', isLoggedIn, Ecadmin.changepwd);
    app.get('/user/templ.js', Ecadmin.template);
    app.get('/callcenter'       , Ecadmin.callcenter );  

    app.get('/index', function (req, res) {
        res.render('index.ejs');
    });


    // =====================================
    // Admin SECTION =====================
    // =====================================
    app.get('/login', function (req, res) {
        res.sendfile('./public/app/login.html');
    });
    app.get('/selectpage', isLoggedIn, function (req, res) {
        res.sendfile('./public/app/selectpage.html');
    });
    app.get('/signup', function (req, res) {
        res.sendfile('./public/app/signup.html');
    });
    app.get('/chat', isLoggedIn, function (req, res) {
        var user_gr = req.user.group; // ["user"]   // req.user.group ;
        res.render('chat.ejs', {
            user: req.user,  // get the user out of session and pass to template
            user_gr: user_gr
        });
    });
    app.get('/abc', UbeamTP.getinitiatelist);
    //app.get('/user/templ.js'      , isLoggedIn, Ecadmin.template ); 
    app.get('/download', Ecadmin.download);
    app.get('/psgdownload', Ecadmin.psgdownload);
    app.get('/drvdownload', Ecadmin.drvdownload);
    //app.get('/tools/jsontable'        , Ecadmin.jsontable);        
    app.get('/templ/get', Ecadmin.templ_get);
    app.get('/templ/index', isLoggedIn, Ecadmin.templ_index);
    app.get('/templ/new', isLoggedIn, Ecadmin.templ_new);
    app.get('/templ/edit', isLoggedIn, Ecadmin.templ_edit);
    app.get('/templ/get_combofile', Ecadmin.get_combofile);
    app.get('/templ/list_folder_pins', Ecadmin.list_folder_pins);
    app.get('/templ/list_pins', Ecadmin.list_pins);



    // =====================================
    // Passenger SECTION =====================
    // =====================================
    // --------------------------------------------
    //      AUTHENTICATE (FIRST LOGIN) for Passenger
    // --------------------------------------------
    // process the login form for passenger  Previous working version with passport 
    app.post('/psglogin', passport.authenticate('local-psg-login', {
        //successRedirect : '/psgcalltaxi', // redirect to the secure profile section
        successRedirect: '/calltaxi', // redirect to the secure profile section
        failureRedirect: '/psglogin', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // not working with passport
    // app.post("/psglogin", passport.authenticate('local-psg-login',
    //     { failureRedirect: '/psglogin',
    //     failureFlash: true }), function(req, res) {
    //     if (req.body.remember) {
    //         req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; 
    //     } else {
    //         req.session.cookie.expires = false; 
    //     }
    //     res.redirect('/calltaxi');
    // });

    // process the signup form for passenger
    app.post('/psgsignup', passport.authenticate('local-psg-signup', {
        successRedirect: '/psglogin', // redirect to the secure profile section
        failureRedirect: '/psgsignup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
    app.post('/psgforgetpassword', function (req, res) {
        // call forgetpassword service
        console.log(' for get password ')
    });

    //app.post('/service/ubeam/psgforgetpassword'           , UbeamTP.psgforgetpassword);

    ///////////////////////////////////////// Passenger singup 
    app.get('/psglogin', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('psglogin.ejs', { message: req.flash('PSGloginMessage') });
    });
    app.get('/psgsignup', function (req, res) {
        //res.sendfile('./public/app/psgsignup.html');
        res.render('psgsignup.ejs', { message: req.flash('PSGsignupMessage') });
    });
    app.get('/psgforgetpassword', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('psgforgetpassword.ejs', {});
    });
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/psgcalltaxi', isLoggedIn, function (req, res) {
        res.render('calltaxi.ejs', {
            appversion: "xxx",
            user: req.user, // get the user out of session and pass to template
            displayName: req.displayName
        });
    });
    app.get('/psgprofile', isLoggedIn, function (req, res) {
        //console.log(req)
        console.log(req.displayPicture)
        res.render('psgprofile.ejs', {
            user: req.user,// get the user out of session and pass to template
            displayPicture: req.user.displayPicture,
            displayName: req.user.displayName,
            email: req.user.email,
            phone: req.user.phone,
            gender: req.user.gender

        });
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/calltaxi',
            failureRedirect: '/'
        })
    );
    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        })
    );




    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/psglogout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });



    var _defaultPath = './public/app/none.html';

    app.get('/:site', function (req, res) {
        var site = req.params.site;
        //console.log('111'+site)
        if (['passenger', 'passengerdev', 'taxi', 'template', 'ecmap', 'garage', 'ubeam', 'ubeam2'].indexOf(site) != -1) {
            res.sendfile('./public/app/' + site + '/index.html');
        } else {
            res.sendfile('./public/app/login.html');
            //res.sendfile(_defaultPath);               
            //res.render('web.ejs', { });
        }
    });


    app.get('/ubeam/home', function (req, res) {
        res.sendfile('./public/app/ubeam/taxiadmin-home.html');
    });

    app.get('/ubeam/driverlist', function (req, res) {
        res.sendfile('./public/app/ubeam/taxiadmin-driver-list.html');
    });

    app.get('/ubeam/taxilist', function (req, res) {
        res.sendfile('./public/app/ubeam/taxiadmin-taxi-list.html');
    });

    app.get('/ubeam/message', function (req, res) {
        res.sendfile('./public/app/ubeam/taxiadmin-message.html');
    });

    app.get('/ubeam/stats', function (req, res) {
        res.sendfile('./public/app/ubeam/taxiadmin-stat.html');
    });

    app.get('/ubeam/settings', function (req, res) {
        res.sendfile('./public/app/ubeam/taxiadmin-setting.html');
    });

    app.get('*', function (req, res) {
        res.sendfile(_defaultPath);
        //res.render('web.ejs', { });
    });

    // =====================================
    // Testing Section  =======================
    // =====================================
    app.get('/testleaflet', function (req, res) {
        res.render('testleaflet.ejs', {
        });
    });

    app.get('/testleafletgoogle', function (req, res) {
        res.render('testleafletgoogle.ejs', {
        });
    });

    app.get('/calltaxi-bak', function (req, res) {
        res.render('calltaxi-bak.ejs', {
        });
    });




};          //------------------ end module.exports





// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    //console.log(req)
    //console.log(res)
    console.log(req.isAuthenticated)
    if (req.isAuthenticated()) {
        console.log(' is loggin = true ')
        return next();
    } else {
        console.log(' is loggin = false ')
        res.redirect('/');
    } 
}


// route middleware to make sure a user is logged in
function isPSGLoggedIn(req, res, next) {
    //console.log(req)
    //console.log(res)    
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        console.log(' is  psg loggin = true ')
        return next();
    } else {
        console.log(' is  psg loggin = false ')
        res.redirect('/index');
    }
    // if they aren't redirect them to the home page
}


// route middleware to ensure user is logged in
function isAccess(req, res, next) {
    var chk = Ecadmin.ChkAccess(req.user.group, '/admin');
    //  console.log(req.user.group)
    if (chk)
        return next();
    res.redirect('/');
}