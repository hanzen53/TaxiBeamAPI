/*
 * TaxiBeam 1.0 .5
 * Copyright 2016 Ecartstudio.
 */  

// Modules Dependencies ====================================
var express	= require('express');
var path	= require('path');
var http = require('http');
var mongoose = require('mongoose');
var fs = require('fs');
var fs = require('fs-extra');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var util = require('util');
var pg = require("pg");
var im = require('imagemagick');
var request = require('request');
var split = require('split');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var formidable = require('formidable');    
var qt = require('quickthumb');

var MongoStore = require('connect-mongo')(session);

var app = express();

// Passport Configuration ===========================================
require('./config/passport')(passport);


// Configuration ===========================================
var env = process.env.NODE_ENV || 'production',
config = require('./config/func')[env];

app.version = config.app_version;

exports.config = config;

app.set('view engine', 'ejs'); // set up ejs for templating

var ejs = require('ejs'); ejs.open = '{{'; ejs.close = '}}';
/*  

{{       }}

<%    %>
app.set('view options', {
    open: '{{',
    close: '}}'
});
*/

// Connect Database ========================================
var dbUrl = config.database.url;

var db = mongoose.connect(dbUrl, function(err) {
    var _log = err ?
        'Error Connecting Database to: ' + dbUrl + '. ' + err :
        'Database Succeeded Connecting to: ' + dbUrl;

    console.log(_log); // log in cmd
});


// set files location
app.use(express.static(path.join(__dirname, 'public'))); // set the static files location
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

// required for passport
app.use(session({ 
    secret: 'taxi-beam',
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({ mongooseConnection:  mongoose.connection, 
      ttl: 1*24*60*60 // -> session persist for 1 days
     })
})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
//app.use(passport.authenticate('remember-me'));
//app.use(app.router);

app.use("/assets/css", express.static(__dirname + '/public/css'));
app.use("/assets/libs", express.static(__dirname + '/public/libs'));
app.use("/assets/img", express.static(__dirname + '/public/img'));

app.use("/assets/data", express.static(__dirname + '/public/data'));
app.use("/assets/sounds", express.static(__dirname + '/public/sounds'));
app.use("/assets/plugins", express.static(__dirname + '/public/plugins'));
app.use("/assets/stylesheets", express.static(__dirname + '/public/stylesheets'));
app.use("/assets/javascripts", express.static(__dirname + '/public/javascripts'));

// Bower Componenets
app.use("/bower_components", express.static(__dirname + '/bower_components'));

app.use("/template", express.static(__dirname + '/public/app/template'));
app.use("/ecmap", express.static(__dirname + '/public/app/ecmap'));
//app.use("/passenger", express.static(__dirname + '/public/app/passenger'));
app.use("/passengerdev", express.static(__dirname + '/public/app/passengerdev'));

app.use("/image/driver", express.static(__dirname + '/../upload_drivers'));
app.use("/image/broken", express.static(__dirname + '/../upload_brokens'));


/* start Configure the multer.*/
//https://codeforgeek.com/2014/11/file-uploads-using-node-js/
/*
app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));
*/
/* end Configure the multer.*/


// Include models ==========================================
var models_path = __dirname + '/server/models';
fs.readdirSync(models_path).forEach(function(file) {
    require(models_path + '/' + file);
})


//************* start quick thumb ***********************
// Use quickthumb
/*
app.use(qt.static(__dirname + '/'));

app.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });

  form.on('end', function(fields, files) {
    //* Temporary location of our uploaded file 
    var temp_path = this.openedFiles[0].path;
    //* The file name of the uploaded file 
    var file_name = this.openedFiles[0].name;
    //* Location where we want to copy the uploaded file 
    var new_location = 'uploads/';

    fs.copy(temp_path, new_location + file_name, function(err) {  
      if (err) {
        console.error(err);
      } else {
        console.log("success!")
      }
    });
  });
});

// Show the upload form	
app.get('/', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  var form = '<form action="/upload" enctype="multipart/form-data" method="post">Add a title: <input name="title" type="text" /><br><br><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
  res.end(form); 
}); 
*/
//************* end quick thumb *************************



// Start App ===============================================
//var port = process.env.PORT || config.PORT;

//app.listen(port,function(){
//	console.log('Server running on port ' + port);
//});
//app.listen(1118,function(){
//	console.log('Server running on port ' + 1118);
//});

//expose app
//exports = module.exports = app;



// Connect Socket.io ===========================================
//var io = socket();
//io.listen(config.socketIoPort);
//var serv = require('http').createServer(app)
//var io = io.listen(serv)


// Start App ===============================================
 var os = require("os");
 var hostrun = os.hostname();

var port = process.env.PORT || config.PORT;

var server = app.listen(port);
console.log('Server running ' + hostrun +' on port ' + port);

//expose app
exports = module.exports = app;

var io = require('socket.io').listen(server);
require('./server/sockets/sockets')(io);

// Routes ==================================================
require('./server/routes')(app, io, passport);  //with passport Pang+
//require('./server/routes')(app);


var allowCrossDomain = function(req, res, next) {
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);


DriversModel = mongoose.model('DriversModel');
PassengerModel = mongoose.model('PassengerModel');
CallcenterpsgModel  = mongoose.model('CallcenterpsgModel');


var i = 0;

setInterval(function() {    
  closeIdleTaxis(i);
  closeIdlePassengers(i);
  closeNotOFFPassengers(i);
}, 1500);


function closeIdleTaxis(i) {
  //Reset 
  if (i > 3) {
    i = 0
  };

  findAllTaxis_StatusNotOff();
  

  // Bot functions
  function findAllTaxis_StatusNotOff(req, res) {
    DriversModel.find({              
        status: { $in: [  "ON","DPENDING" ] } 
      },

      function doChangeStatusToOFF(err, taxi) {
        if (taxi == null || taxi.length == 0) {
           //console.log("No Passenger Left.");
        } else {

          var currentTimeInSeconds = new Date();
          for(j=0;j<taxi.length;j++){
              // console.log("PHONEEEE = " + taxi[0].phone);
              
              var d1 = new Date(taxi[j].updated).getTime(), // 10:09 to
              d2 = new Date(currentTimeInSeconds.toISOString()).getTime(); // 10:20 is 11 mins

              var diff = d2 - d1;
              //console.log(diff);

              // if (diff > 60e3) console.log(
              //     Math.floor(diff / 60e3), 'minutes ago'
              // );
             // else
              var secondsDifference = Math.floor(diff / 1e3) + 35
              
               //console.log(Math.floor(diff / 1e3) + 35, 'seconds ago');

               if(secondsDifference > 1200  ){
                    taxi[j].status = "OFF";
                    taxi[j].save(function(err, response) {
                      if (err) {
                        //console.log("Error Change Status To OFF. " + err);
                      } else {
                        //console.log("Success write matched Taxi.");
                      }
                    });
               }
         }
        }
      }
    );
  };
}


////////////////////////// turn Passenger to OFF after 5 mins request taxi process

 function closeIdlePassengers(i) {
  //Reset 
  if (i > 3) {
    i = 0
  };

  findAllPassengers_StatusOn();

  // Bot functions
  function findAllPassengers_StatusOn(req, res) {
    PassengerModel.find({
       // phone: "085005434399",
        status: { $in : [ "ON" ] }
       // status:{$ne : "ON"},
      },

      function doChangeStatusToTIMEOUT(err, psg) {
        if (psg == null || psg.length == 0) {
           //console.log("No Passenger Left.");
        } else {

          var currentTimeInSeconds = new Date();
          for(j=0;j<psg.length;j++){
              // console.log("PHONEEEE = " + psg[0].phone);
              
              var d1 = new Date(psg[j].updated).getTime(), // 10:09 to
              d2 = new Date(currentTimeInSeconds.toISOString()).getTime(); // 10:20 is 11 mins

              var diff = d2 - d1;
              //console.log(diff);

              var secondsDifference = Math.floor(diff / 1e3) + 35       
               //console.log(Math.floor(diff / 1e3) + 35, 'seconds ago');

               if(secondsDifference > 3600){
                    psg[j].status = "OFF";
                    psg[j].save(function(err, response) {
                      if (err) {
                        //console.log("Error Change Passenger Status To OFF. " + err);
                      } else {
                        //console.log("Success change Passenger Status to OFF.");
                      }
                    });
               }
         }
        }
      }
    );
  };
}



////////////////////////// turn Passenger to OFF after 5 mins request taxi process
function closeNotOFFPassengers(i) {
  //Reset 
  if (i > 3) {
    i = 0
  };

  findAllPassengers_StatusNotOFF();

  // Bot functions
  function findAllPassengers_StatusNotOFF(req, res) {
    PassengerModel.find({
       // phone: "085005434399",
        status: { $in : [ "ON","DRVDENIED", "THANKS" ] }
       // status:{$ne : "ON"},
      },

      function doChangeStatusToTIMEOUT(err, psg) {
        if (psg == null || psg.length == 0) {
           //console.log("No Passenger Left.");
        } else {

          var currentTimeInSeconds = new Date();
          for(j=0;j<psg.length;j++){
              // console.log("PHONEEEE = " + psg[0].phone);
              
              var d1 = new Date(psg[j].updated).getTime(), // 10:09 to
              d2 = new Date(currentTimeInSeconds.toISOString()).getTime(); // 10:20 is 11 mins

              var diff = d2 - d1;
              //console.log(diff);

              var secondsDifference = Math.floor(diff / 1e3) + 35       
               //console.log(Math.floor(diff / 1e3) + 35, 'seconds ago');

               if(secondsDifference > 3600){
                    psg[j].status = "OFF";
                    psg[j].save(function(err, response) {
                      if (err) {
                        //console.log("Error Change Passenger Status To OFF. " + err);
                      } else {
                        //console.log("Success change Passenger Status to OFF.");
                      }
                    });
               }
         }
        }
      }
    );
  };
}



/////////////// Bot to clear callcenterpsg collection 
setInterval(function() {    
  closeCallcenterJob(i);
}, 300000); // 600,000 = run every 1 minute

////////////////////////// turn Passenger to OFF after 5 mins request taxi process
function closeCallcenterJob(i) {
  //console.log( ' closeCallcenterJob ' )
  //Reset 
  if (i > 3) {
    i = 0
  };
  
  findAllCallcenterpsg_Assigned();

  // Bot functions
  function findAllCallcenterpsg_Assigned(req, res) {
    CallcenterpsgModel.find({
      status: { $in : [ "ASSIGNED" ] }
    },
    function doChangeStatus(err, psg) {
      if (psg == null || psg.length == 0) {   
      //console.log('null')        
      } else {
      //console.log('not null ')   
      //console.log(psg[i]._id)
      //console.log(psg.length)
        var currentTimeInSeconds = new Date();
        for(j=0;j<psg.length;j++){
              // console.log("PHONEEEE = " + psg[0].phone);
              var d1 = new Date(psg[j].updated).getTime(); // 10:09 to
              var d2 = new Date(currentTimeInSeconds.toISOString()).getTime(); // 10:20 is 11 mins
              var diff = d2 - d1;
              // console.log(d1)
              // console.log(d2)
              // console.log(diff)
              // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
              //console.log(diff);
              //var secondsDifference = Math.floor(diff / 1e3) + 35       
               //console.log(Math.floor(diff / 1e3) + 35, 'seconds ago');
               //console.log(secondsDifference)
               if(diff > 3600000){   // clear after 1 hr.
                if(psg[j].drv_id){
                  psg[j].status = "OFF";
                } else {
                  psg[j].status = "FINISHED";
                }                
                psg[j].save(function(err, response) {
                  if (err) {
                        //console.log("Error Change Passenger Status To OFF. " + err);
                      } else {
                        io.on('connection', function(socket) {
                          socket.emit('closeCallcenterJob', response);
                        });
                        //console.log("Success change Passenger Status to OFF.");
                      }
                    });
              }
            }
          }
        }
      );
  };
}



  

module.exports = function (io) {
  //
}







/*
https://docs.nodejitsu.com/articles/javascript-conventions/what-are-the-built-in-timer-functions
var recursive = function () {
    console.log("It has been one second!");
    setTimeout(recursive,1000);
}
recursive();
setTimeout(function() { console.log("setTimeout: It's been one second!"); }, 1000);
setInterval(function() { console.log("setInterval: It's been one second!"); }, 1000);
setTimeout(console.log, 1000, "This", "has", 4, "parameters");
setInterval(console.log, 1000, "This only has one");
*/




/**************************

var i = 0;
setInterval(function() {
  i++
  bot0(i);
}, 1500);




function bot0(i) {
  //Reset 
  if (i > 3) {
    i = 0
  };

  findInitiatePassenger();

  // Bot functions
  function findInitiatePassenger(req, res) {
    PassengerModel.findOne({
        status: "INITIATE",
      },

      function doMatching(err, psg) {
        if (psg == null || psg.length == 0) {
          //console.log(". ");
          //console.log("No Passenger Left. ");
        } else {
          var deniedTaxiIds = psg.deniedTaxiIds;
          var radian = "10000";
          var curloc = psg.curloc; //[100.5720846, 13.7556048]; //psg.curloc;

          DriversModel.find({
              status: "ON",
              curloc: {
                $near: {
                  $geometry: {
                    type: "Point",
                    coordinates: curloc
                  },
                  $maxDistance: radian
                }
              },
            },
            //{ device_id:0, email:0, des_dist:0, deslng:0, deslat:0, favcartype:0, favdrv:0, drv_id:0, status:0, curloc:0, desloc:0, updated:0, created:0 },

            function(err, taxilist) {
              var noMatchTaxi = true;
              if (typeof taxilist == 'undefined' || taxilist.length == 0) {
                 console.log("No Taxi Left");
              } else {
                for (i = 0; i < taxilist.length; i++) {

                  console.log(taxilist[i].psg_id + " " + taxilist[i].psg_id.length);
                  var alreadyDenyThisPassenger = false;
                  if(taxilist[i].psg_id.length > 0){
                    alreadyDenyThisPassenger = true;
                  }

                  for (j = 0; j < psg.deniedTaxiIds.length; j++) {
                    if (psg.deniedTaxiIds[j] == taxilist[i].device_id) {
                      console.log("Deny Passenger");
                      alreadyDenyThisPassenger = true;
                      break;
                    }
                  }

                  //Found a taxi that did not deny this passenger and still available(Status "ON").
                  if (!alreadyDenyThisPassenger) {
                    noMatchTaxi = false;
                    psg.drv_id = taxilist[i]._id;
                    psg.status = "ON";
                    psg.deniedTaxiIds.push(taxilist[i].device_id);
                    psg.save(function(err, response) {
                      if (err) {
                        console.log("Error Writing Passenger = ", taxilist.length);
                      } else {
                        console.log("Success write matched Taxi ", taxilist.length);
                      }
                    });

                    taxilist[i].psg_id = psg._id;
                    taxilist[i].save(function(err, response) {
                      if (err) {
                        console.log("Error Writing Passenger = ", taxilist.length);
                      } else {
                        console.log("Success write matched Taxi ", taxilist.length);
                      }
                    });
                    break;
                  }
                }
              }

              if (noMatchTaxi) {
                psg.drv_id = "";
                psg.status = "MANUAL";
                psg.deniedTaxiIds = [];
                psg.save(function(err, response) {
                  if (err) {
                    console.log("Error Writing Passenger");
                  } else {
                    console.log("Success Change Passenger Status To Manual.");
                  }
                });
              }


            }
          );
        }
      }
    );
  };
}



***********************/