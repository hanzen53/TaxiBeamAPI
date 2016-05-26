////////////////////////////////////
// TaxiBeam API Controller 
// version : 1.0.0.1 
// Date July 16, 2015 
// Wrote by Hanzen
////////////////////////////////////

var 	Url = require('url'),
	mongoose  = require('mongoose'),
   	DeviceModel  = mongoose.model('DeviceModel'),
  	PassengerModel  = mongoose.model('PassengerModel'),
  	UserModel  = mongoose.model('UserModel'),
 	PathLogModel = mongoose.model('PathLogModel'),
	DriversModel = mongoose.model('DriversModel'),
	CommentModel  = mongoose.model('CommentModel'),
	AnnounceModel	 = mongoose.model('AnnounceModel'),
	EmgListModel = mongoose.model('EmgListModel'),
	ErrorcodeModel =  mongoose.model('ErrorcodeModel');

// for upload file
var 	path = require('path'),
	formidable = require('formidable'),
	util = require('util'),
	fs = require('fs-extra'),
 	qt = require('quickthumb'),
	http = require('http'),
	qs = require('querystring');

// for all API
var 	_id = "",
	device_id = "",
	smsconfirm = "",
	newimgupload = "",
	bupload = "",
	imgtype = "",
	curloc = "",
	cartype = "",
	radian = "5000",		// in meters
	amount = "",
	psg_id = "",
	commtype = "",
	topic = "",
	comment = "",
	favcartype = "",
	favtaxi = "",
	radian = "",
	amount = "",
	curaddr = "",
	destination = "",
	desloc = "",
	des_dist = "",
	tips = "",
	detail = "",
	favcartype = "",
	taxi_id = "",
	emgtype = "";

// Test javascript at "http://js.do/"
function ranSMS(){
    var str = Math.random();
    var str1 = str.toString();
	var res = str1.substring(2,6);
	return res;
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function tryParseJSON (jsonString){
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object", 
        // so we must check for that, too.
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) { }
    return false;
};


function _pathLog(data,res){
	//console.log(data);
	//data.timestamp = data.timestamp
	PathLogModel.create(data)
}


function _getErrDetail (errid) {
	ErrorcodeModel.findOne( 
		{ errid: errid },
		{ erren:1, errth:1 }, 		
		function(err, response) {
		    	if (response==null) { 
		    		return "";
		    	}  else  {
			    	
				return response[0];
		    	}	    	
		}
	);
};


// NOTE *******************************  Start a new API by Hanzen
// the new API service for DRIVER(TAXI)
exports.driverRegister = function(req, res) {
device_id = req.body.device_id	;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ device_id : device_id }, 
		function(err, drivers) {	    	
	    	if(drivers == null) { 
	    		DriversModel.create({
				device_id: device_id		,
				fname: req.body.fname		,
				lname: req.body.lname		,
				phone: req.body.phone		,
				english: req.body.english	,
				carplate : req.body.carplate	,
				cartype : req.body.cartype	,
				carcolor : req.body.carcolor	,
				outbound : req.body.outbound	,
				carryon : req.body.carryon	,
				curlng : req.body.curlng		,
				curlat : req.body.curlat		,
				curloc : curloc			,
				accuracy: req.body.accuracy	,
				degree: req.body.degree	,
				smsconfirm: ranSMS()
				},
				function(err, response) {
					if (err) {
						res.send(err)
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg:  "Your account has been created.", 
							data : { _id: response._id, status: response.status, active: response.active } 
						});
					} 
				});
	    	} else 	{ res.json({ 
	    			status: false , 
	    			msg: "Your phone has been used by another user. Please contact our support team at 02-XXX-XXXX." 
	    			});
			}
			
		}
	);
};




exports.driveruploadFace = function (req, res){
var form = new formidable.IncomingForm();
imgtype = "imgface";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" });
			} else {
				err ? res.send(err) : res.json({status: false , msg : 'Please put some images.'});				
			}
		}
		else {
			// check image type			
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				findandUpload(_id, device_id);
			}
			else {
				// kick out
				res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });				
			}
		}
	});
	function findandUpload(taxiId, deviceId) {
	 	DriversModel.findOne(
			{ _id : taxiId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response == null) { 
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});				
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploads/';
								newimgupload = taxiId+'_'+imgtype+extension;
								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload !")
										DriversModel.findOne(
											{ _id : taxiId }, 
											{ status:1, updated:1 },
											function(err, taxiupfile) {
												taxiupfile.imgface = newimgupload;
												taxiupfile.updated = new Date().getTime();
												taxiupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error" });													
													} else {
														err ? res.send(err) : res.json({ 
															satus: true , 
															msg: "success, your image has been uploaded.",
															data : {
																imgname: newimgupload
																}
															});
													}
												});
											}
										);
									}
								});
							}
							
						}
					}
					else {
						console.log("do not have form")
						res.json({ status: false , msg: "do not have form" });
					}				
				}
			}
		);
	}
}




exports.driveruploadLicence = function (req, res){
var form = new formidable.IncomingForm();
imgtype = "imglicnece";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" });
			} else {
				err ? res.send(err) : res.json({status: false , msg : 'Please put some images.'});	
			}
		}
		else {
			// check image type
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				findandUpload(_id, device_id);
			}
			else {
				// kick out
				res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });	
			}
		}
	});
	function findandUpload(taxiId, deviceId) {
	 	DriversModel.findOne(
			{ _id : taxiId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response == null) { 
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploads/';
								newimgupload = taxiId+'_'+imgtype+extension;
								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload !")
										DriversModel.findOne(
											{ _id : taxiId }, 
											{ status:1, updated:1 },
											function(err, taxiupfile) {
												taxiupfile.imglicence = newimgupload;
												taxiupfile.updated = new Date().getTime();
												taxiupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error" });
													} else {
														err ? res.send(err) : res.json({ 
															satus: true , 
															msg: "success, your image has been uploaded.",
															data : {
																imgname: newimgupload
																}
															});
													}
												});
											}
										);
									}
								});
							}
							
						}
					}
					else {
						console.log("do not have form")
						res.json({ status: false , msg: "do not have form" });
					}				
				}
			}
		);
	}
}




exports.driveruploadCar = function (req, res){
var form = new formidable.IncomingForm();
imgtype = "imgcar";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" });
			} else {
				err ? res.send(err) : res.json({status: false , msg : 'Please put some images.'});	
			}
		}
		else {
			// check image type
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				findandUpload(_id, device_id);
			}
			else {
				// kick out
				res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });	
			}
		}
	});
	function findandUpload(taxiId, deviceId) {
	 	DriversModel.findOne(
			{ _id : taxiId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response ==  null) { 
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again.", data: response });
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploads/';
								newimgupload = taxiId+'_'+imgtype+extension;
								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload !")
										DriversModel.findOne(
											{ _id : taxiId }, 
											{ status:1, updated:1 },
											function(err, taxiupfile) {
												taxiupfile.imgcar = newimgupload;
												taxiupfile.updated = new Date().getTime();
												taxiupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error" });
													} else {
														err ? res.send(err) : res.json({ 
															satus: true , 
															msg: "success, your image has been uploaded.",
															data : {
																imgname: newimgupload
																}
															});
													}
												});
											}
										);
									}
								});
							}
							
						}
					}
					else {
						console.log("do not have a form")
						res.json({ status: false , msg: "do not have form" });
					}				
				}
			}
		);
	}
}




exports.sendSMSConfirmation = function (req, res) { 
/*
http.get("http://www.google.com/index.html", function(res) {
  console.log("Got response: " + res.statusCode);
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
*/
var gensms =  ranSMS()		;
_id = req.body._id			;
device_id = req.body.device_id	;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id  }, 
		{ _id:1, status:1, phone:1, smsconfirm:1 },
		function(err, response) {	    	
		    	if(response == null) { 
					res.json({ 
						"SendMessageResult": {
						"ErrorCode": 0,
						"ReferenceCode": "",
						"Success": false
						}
						//status: false , msg: "The phone number does not exist. Please register and try again."
					});
		    	} else {

				response.smsconfirm = gensms;			
				response.save(function(err, result) {							
					if(err) {
						res.json({ status: false, msg: "error", data: err });
					} else {	

				    		////////////////////////////////////////////////////////
						var smsconfirm = gensms ;
						var smsphone = response.phone ;
						var https = require('https') ;
						var postData = JSON.stringify({
						  "sender"	: "ECART",
						  "to"		: smsphone,
						  "msg"	: "TaxiBeam OTP code is "+smsconfirm+", Please use it for verification."
						});
						var options = {
						  hostname: 'sms.narun.me',
						  port: 443,
						  path: '/SMSMeJson.svc/SendMessage',
						  method: 'POST',
						  headers: {
							'Content-Type': 'application/json',
							'Content-Length': postData.length
						  }
						};
						var request = https.request(options, function(response){
							var body = '';
							response.on('data', function(d) {
								body += d;
							});
							response.on('end', function() {
								var parsed = JSON.parse(body);
								res.json(parsed);
							});
						});
						request.write(postData);
						request.end();
						////////////////////////////////////////////////////////

					}
				});
			}
		}
	);
	/*
	1=Successful
	21=SMS Sending Failed
	22=Invalid username/password combination
	23=Credit exhausted
	24=Gateway unavailable
	25=Invalid schedule date format
	26=Unable to schedule
	27=Username is empty
	28=Password is empty
	29=Recipient is empty
	30=Message is empty
	31=Sender is empty
	32=One or more required fields are empty
	*/
};




exports.driverActivation = function(req, res) {
_id		= req.body._id		;
device_id	= req.body.device_id		;
smsconfirm	= req.body.smsconfirm	;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id, smsconfirm : smsconfirm }, 
		{ device_id:1, status:1, updated:1 },
		function(err, taxi) {
	    	if( taxi == null ) {
				res.json({ status: false , msg: "Your sms confirmation is not valid, Please try again."});
	    	} else {				
				taxi.active = "Y";
				taxi.updated = new Date().getTime();
				taxi.save(function(err, response) {							
					if(err) {
						res.json({ status: false, msg: "error", data: err });
					} else {					
						err ? res.send(err) : res.json({ 
							status: true , 
							msg: "success, your account has been activated." ,
							_id: response._id, 
							status: response.status,
							active: response.active
						});
					}
				});
			}
		}
	);
};




exports.driverAutoLogin = function(req, res) {
device_id = req.body.device_id	;
phone = req.body.phone	;
	DriversModel.findOne(
		{ device_id :  device_id, 	phone : phone, active : "Y" }, 
		{ smsconfirm:0 },
		function(err, taxi) {	    		
		    	if(taxi == null) { 
				res.json({ status: false , msg: "The phone does not exist. Please register and try again."});
		    	} else {	    		
				taxi.status = "ON";
				taxi.updated = new Date().getTime();
				taxi.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" , data: err });
					} else {
						err ? res.send(err) : res.json({ 
							status: true, 
							msg: "Welcome to TaxiBeam", 
							data: { 
								_id: response._id, 
								status: response.status, 
								active: response.active, 
								curlng: response.curlng,
								curlat: response.curlat,
								curloc: response.curloc
							} 
						});
					}
				});
			}
			
		}
	);
};




exports.driverUpdateProfile = function(req, res) {
_id = req.body._id				;
device_id = req.body.device_id			;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ _id: _id, device_id: device_id, active: "Y" }, 
		{ device_id:1, fname:1, lname:1, phone:1, englist:1, carplate:1, cartype:1, carcolor:1, outbound:1, carryon:1, carlng:1, carlat:1, accuracy:1, degree:1, statsu:1 },
		function(err, taxi) {
			if (taxi == null) {
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    		} else {
				/* update taxi by _id */
				if(req.body.fname) 	{ taxi.fname  = req.body.fname ? req.body.fname : taxi.fname; }
				if(req.body.lname) 	{ taxi.lname  = req.body.lname ? req.body.lname : taxi.lname; }
				if(req.body.phone) 	{ taxi.phone  = req.body.phone ? req.body.phone : taxi.phone; }
				if(req.body.english) 	{ taxi.english  = req.body.english ? req.body.english : taxi.english; }
				if(req.body.carplate) 	{ taxi.carplate = req.body.carplate ? req.body.carplate : taxi.carplate; }
				if(req.body.cartype) 	{ taxi.cartype  = req.body.cartype ? req.body.cartype : taxi.cartype; }
				if(req.body.carcolor) 	{ taxi.carcolor = req.body.carcolor ? req.body.carcolor : taxi.carcolor; }
				if(req.body.outbound) 	{ taxi.outbound = req.body.outbound ? req.body.outbound : taxi.outbound; }
				if(req.body.carryon) 	{ taxi.carryon = req.body.carryon ? req.body.carryon : taxi.carryon; }
				//if(req.body.direction) 	{ taxi.direction.degree  = req.body.direction.degree ? req.body.direction.degree : taxi.direction.degree; }
				//if(req.body.direction) 	{ taxi.direction.accuracy  = req.body.direction.accuracy ? req.body.direction.accuracy : taxi.direction.accuracy; }
				if(req.body.accuracy) 	{ taxi.accuracy = req.body.accuracy ? req.body.accuracy : taxi.accuracy; }
				if(req.body.degree) 	{ taxi.degree = req.body.degree ? req.body.degree : taxi.degree; }
				if(req.body.curlng) 	{ taxi.curlng = req.body.curlng ? req.body.curlng : taxi.curlng; }
				if(req.body.curlat) 	{ taxi.curlat = req.body.curlat ? req.body.curlat : taxi.curlat; }
				if(curloc) 		{ taxi.curloc = curloc ? curloc : taxi.curloc; }				
				if(req.body.brokenname) { taxi.brokenname = req.body.brokenname ? req.body.brokenname : taxi.brokenname; }
				if(req.body.brokendetail)	{ taxi.brokendetail = req.body.brokendetail ? req.body.brokendetail : taxi.brokendetail; }	
				taxi.updated = new Date().getTime();
				taxi.save(function(err, result) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg: "success, driver profile updated",
							data: result
							});
					}
				});

			}
		}
	);
};




exports.driverGetStatus = function(req, res) {
_id = req.body._id		;
device_id = req.body.device_id	;
curlng = req.body.curlng	;
curlat = req.body.curlat		;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	if (typeof curlng == 'undefined' && curlng == null) {		
		res.json({ status: false, msg: "current longitude is not valid" })
		return;	
	}
	if (typeof curlat == 'undefined' && curlat == null) {		
		res.json({ status: false, msg: "current latitude is not valid" })
		return;
	}
	DriversModel.findOne(
		{ _id: _id, device_id: device_id, active: "Y" },  
		{ _id:1, device_id:1, curlng:1, curlat:1, psg_id:1, status:1,  active:1 },
		function(err, taxi) {
			if (taxi == null) {	
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {				
				if(req.body.accuracy) 	{ taxi.accuracy = req.body.accuracy ? req.body.accuracy : taxi.accuracy; }
				if(req.body.degree) 	{ taxi.degree = req.body.degree ? req.body.degree : taxi.degree; }				
				if(req.body.curlng) 	{ taxi.curlng	= req.body.curlng ? req.body.curlng : taxi.curlng; }
				if(req.body.curlat) 	{ taxi.curlat	= req.body.curlat ? req.body.curlat : taxi.curlat; }
				if(curloc) 		{ taxi.curloc	= curloc ? curloc : taxi.curloc; }				
				taxi.updated = new Date().getTime();
				taxi.save(function(err, result) {
					if(err) {
						res.json({ status: false ,  msg: "error"  });
					} else {
						err ? res.send(err) : res.json({ 
							status: true ,  
							msg: "success, there is your status.", 
							data: result
							});
					}
				});
			}
		}
	);
};




exports.driverGetByID = function(req, res) {
_id = req.body._id	;
	DriversModel.findOne(
		{ _id : _id, active: "Y"}, 
		{ device_id: 0, grg_id:0, updated:0, created:0, smsconfirm:0 },
		function(err, taxi) {		
	    	if(taxi == null) { 
				res.json({ status: false , msg: "The data that you are looking for is not valid, please try again." });
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "success, driver's information", 
					data :  taxi  
				});
			}
		}
	);
};	




exports.driverchangeOnOff = function(req, res) {
_id = req.body._id				;
device_id = req.body.device_id			;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1 },
		function(err, taxi) {
			if (taxi == null) {
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {							
				if(req.body.status) 	{ taxi.status 	= req.body.status ? req.body.status : taxi.status; }
				taxi.updated = new Date().getTime();
				taxi.save(function(err, response) {
					if(err) {
						res.json({ status: false ,  msg: "error"  });
					} else {
						err ? res.send(err) : res.json({ 
							status: true ,  
							msg: "success, taxi's status updated", 
							data:response  
							});
					}
				});
			}
		}
	);
};




exports.driverSearchPassenger = function(req, res) {
_id = req.body._id		;
device_id = req.body.device_id	;
curlng = req.body.curlng	;
curlat = req.body.curlat		;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
cartype = req.body.cartype	;
radian = req.body.radian	;
amount = req.body.amount	;	
	if (typeof curlng == 'undefined' && curlng == null) {		
		res.json({ status: false, msg: "current longitude is not valid" })
		return;	
	}
	if (typeof curlat == 'undefined' && curlat == null) {		
		res.json({ status: false, msg: "current latitude is not valid" })
		return;
	}	
	if (typeof radian == 'undefined' && radian == null) {
		radian = "50000";
	}	
	if (typeof amount == 'undefined' && amount == null) {
		amount = "200";
	}
	DriversModel.findOne(
		{ _id: _id, device_id: device_id, active: "Y" }, 
		{ status:1 },
		function(err, taxi) {			
			if (taxi == null) {
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    		} else {
				if(req.body.accuracy) 	{ taxi.accuracy = req.body.accuracy ? req.body.accuracy : taxi.accuracy; }
				if(req.body.degree) 	{ taxi.degree = req.body.degree ? req.body.degree : taxi.degree; }				
				if(req.body.curlng) 	{ taxi.curlng	= req.body.curlng ? req.body.curlng : taxi.curlng; }
				if(req.body.curlat) 	{ taxi.curlat	= req.body.curlat ? req.body.curlat : taxi.curlat; }
				if(curloc) 		{ taxi.curloc	= curloc ? curloc : taxi.curloc; }				
				taxi.updated = new Date().getTime();
				taxi.save(function(err, result) {
					if(err) {
						res.json({ status: false ,  msg: "error"  });
					} else {

						PassengerModel.find(
							{ 						
								curloc : { $near : curloc, $maxDistance: radian }, 
								favcartype : cartype,
								status : "ON"
							},
							{ device_id:0, updated:0, created:0 },{limit : amount},
							function(err,psglist){
								// Donot forget to create 2d Index for drivers collection : curloc!!!!	
								if(psglist == 0){
									res.json({status: false, msg: "No data"});									
								} else {
									res.json({status: true, msg: "This is passenger list", data: psglist});
									//Specifies a point for which a geospatial query returns the documents from nearest to farthest.
								}
							}
						);
					}
				});
			}
		}
	);
};



 
exports.driverAcceptCall = function(req, res) {
_id = req.body._id		;
device_id = req.body.device_id	;
psg_id = req.body.psg_id	;
curlng = req.body.curlng	;
curlat = req.body.curlat		;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ _id : psg_id, status: "ON" },
		{ status: 1 },
		function(err,response) {				
			if(response==null) {
				res.json({ status: false , msg: "This passenger is not available.", data:err });
			} else {		
				DriversModel.findOne(
					{ _id : _id }, 
					{ status:1, updated:1 },
					function(err, taxi) {
						if(taxi==null) {
							res.json({ status: false , msg: "Your phone does not exist. Please register and try again." });
						} else {
							if(req.body.curlng) 	{ taxi.curlng	= req.body.curlng ? req.body.curlng : taxi.curlng; }
							if(req.body.curlat) 	{ taxi.curlat	= req.body.curlat ? req.body.curlat : taxi.curlat; }
							if(curloc) 		{ taxi.curloc	= curloc ? curloc : taxi.curloc; }							
							taxi.psg_id = psg_id;
							taxi.updated = new Date().getTime();
							taxi.status = "WAIT";
							taxi.save(function(err, response) {
								if(err) {
									res.json({ status: false , msg: "error" });
								} else {
									PassengerModel.findOne(
										{ _id : psg_id }, 
										{ status:1, updated:1 },
										function(err, psg) {
											if(psg==null) {
												res.json({ status: false , msg: "This passenger is not available." });
											} else {											
												psg.taxi_id = _id;
												psg.updated = new Date().getTime();
												psg.status = "WAIT";												
												psg.save(function(err, response) {
													err ? res.send(err) : res.json({ 
														status: true , 
														msg: "Update driver and passenger to ON => driver canceled passenger",
														data: response
														});
												});
											}
										}
									);

								}

							});
						}
					}
				);
			}
		}
	);
};




exports.driverCancelCall = function(req, res) {
_id	= req.body._id		;
device_id = req.body.device_id	;
psg_id = req.body.psg_id	;
curlng = req.body.curlng	;
curlat = req.body.curlat		;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ _id: _id, device_id: device_id  }, 
		{ status:1, updated:1 },
		function(err, taxi) {
		    	if(taxi == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {	
				if(req.body.curlng) 	{ taxi.curlng	= req.body.curlng ? req.body.curlng : taxi.curlng; }
				if(req.body.curlat) 	{ taxi.curlat	= req.body.curlat ? req.body.curlat : taxi.curlat; }
				if(curloc) 		{ taxi.curloc	= curloc ? curloc : taxi.curloc; }		    		
				taxi.psg_id = "";
				taxi.updated = new Date().getTime();
				taxi.status = "ON";
				taxi.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						PassengerModel.findOne(
							{ _id : psg_id }, 
							{ status:1, updated:1 },
							function(err, psg) {
							    	if(psg == null) { 
									res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
							    	} else {	
									psg.taxi_id = "";
									psg.updated = new Date().getTime();
									psg.status = "ON";
									//console.log(req.body)
									psg.save(function(err, response) {
										err ? res.send(err) : res.json({ 
											status: true , 
											msg: "Update driver and passenger to ON => driver canceled passenger",
											data: response
											});
									});
							    	}
							}
						);
					}
				});
		    	}
		}
	);
};	




exports.driverPickPassenger = function(req, res) {
_id  = req.body._id		;
device_id = req.body.device_id	;
psg_id = req.body.psg_id	;
curlng = req.body.curlng	;
curlat = req.body.curlat		;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1 },
		function(err, taxi) {
		    	if(taxi == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {	
				if(req.body.curlng) 	{ taxi.curlng	= req.body.curlng ? req.body.curlng : taxi.curlng; }
				if(req.body.curlat) 	{ taxi.curlat	= req.body.curlat ? req.body.curlat : taxi.curlat; }
				if(curloc) 		{ taxi.curloc	= curloc ? curloc : taxi.curloc; }
				taxi.psg_id = psg_id;
				taxi.updated = new Date().getTime();
				taxi.status = "PICK";
				taxi.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						PassengerModel.findOne(
							{ _id : psg_id }, 
							{ status:1, updated:1 },
							function(err, psg) {
							    	if(psg == null) { 
									res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
							    	} else {	
									psg.taxi_id = _id;
									psg.updated = new Date().getTime();
									psg.status = "PICK";									
									psg.save(function(err, response) {
										err ? res.send(err) : res.json({ 
											status: true , 
											msg: "Update driver and passenger to PICK => driver picked passenger",
											data: response
											});
									});
							    	}
							}
						);

					}

				});

			}
		}
	);
};	




exports.driverEndTrip = function(req, res) {
_id = req.body._id		;
device_id = req.body.device_id	;
psg_id = req.body.psg_id	;
curlng = req.body.curlng	;
curlat = req.body.curlat		;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ _id: _id , device_id: device_id }, 
		{ status:1, updated:1 },
		function(err, taxi) {
		    	if(taxi == null) { 
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {
				if(req.body.curlng) 	{ taxi.curlng	= req.body.curlng ? req.body.curlng : taxi.curlng; }
				if(req.body.curlat) 	{ taxi.curlat	= req.body.curlat ? req.body.curlat : taxi.curlat; }
				if(curloc) 		{ taxi.curloc	= curloc ? curloc : taxi.curloc; }		    		
				taxi.psg_id = "";
				taxi.updated = new Date().getTime();
				taxi.status = "ON";						
				taxi.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						PassengerModel.findOne(
							{ _id : psg_id }, 
							{ status:1, updated:1 },
							function(err, psg) {
							    	if(psg == null) { 
									res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
							    	} else {	
									psg.taxi_id = "";
									psg.updated = new Date().getTime();
									psg.status = "OFF";									
									psg.save(function(err, response) {
										err ? res.send(err) : res.json({ 
											status: true , 
											msg: "Update driver to ON and passenger to OFF => driver dropped passenger" ,
											data: response
											});
									});
							    	}								
							}
						);
					}
				});
		    	}						
		}
	);
};	




exports.driverSendComment = function(req, res) {
_id = req.body._id		;
device_id = req.body.device_id	;
commtype = "Taxi"		;
topic = req.body.topic		;
comment = req.body.comment	;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id },
		function(err, drivers) {
	    		if(drivers == null) { 
				res.json({ status: false , msg: "Your phone number does not exist, please register"});
	    		} else {
	    			CommentModel.create({
				commtype: commtype		, 
				user_id: _id			,
				device_id: device_id		,
				topic: topic			,
				comment: comment
				},
    				function(err, response) {
					if (err) {
						res.send(err)
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg:  "Your comment has been sent, Thank you."
						}); 

					}
				});		
			}
		}
	);
};	




exports.driverBrokenAdd = function(req, res) { 
var form = new formidable.IncomingForm();
imgtype = "imgbroken";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" });
			} else {				
				res.json({status: false , msg : 'Please put some images.'});
			}
		}
		else {
			// check image type
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				findandUpload(_id, device_id);
			}
			else {
				// kick out
				res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });
			}
		}
	});

	function findandUpload(taxiId, deviceId) {
	 	DriversModel.findOne(
			{ _id : taxiId, device_id : deviceId }, 
			{ device_id:1, brokenpicture:1 },
			function(err, response) {				
				if (response == null) {	
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
					return;
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploadb/';

								newimgupload = taxiId+'_'+imgtype+'_'+ranSMS()+extension;
								arrpix = response.brokenpicture;																
								arrpix.push(newimgupload);			// push arrary at the last

								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload ! a broken image > name : "+newimgupload)
										DriversModel.findOne(
											{ _id : taxiId }, 
											{ status:1, updated:1 },
											function(err, taxiupfile) {
												taxiupfile.brokenpicture = arrpix;
												taxiupfile.updated = new Date().getTime();
												taxiupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error" });
														//res.end(err);
													} else {
														err ? res.send(err) : res.json({ 
															satus: true , 
															msg: "success, your image has been uploaded.",
															data : {
																imgname: newimgupload
																}
															});
														//res.end('success, your image has been uploaded.');
													}
												});
											}
										);
									}
								});
							}
							
						}
					}
					else {
						console.log("do not have form")
						res.json({ status: false , msg: "do not have form" });
					}				
				}
			}
		);
	}
};




exports.driverBrokenEdit = function(req, res) {
var form = new formidable.IncomingForm();
imgtype = "imgbroken";
var oldimg = "";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" });
			} else {				
				res.json({status: false , msg : 'Please put some images.'});
			}
		}
		else {
			// check image type
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				oldimg = fields.oldimg;
				findandUpload(_id, device_id);
			}
			else {
				// kick out
				res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });
			}
		}
	});

	function findandUpload(taxiId, deviceId) {
	 	DriversModel.findOne(
			{ _id : taxiId, device_id : deviceId }, 
			{ device_id:1, brokenpicture:1 },
			function(err, response) {
				if (response == null) {	
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploadb/';
								
								var filePath = 'uploadb/'+oldimg ; 
								fs.exists(filePath, function(exists) {
									if (exists) {
										fs.unlinkSync(filePath);
									}
								});

								newimgupload = taxiId+'_'+imgtype+'_'+ranSMS()+extension;
								arrpix = response.brokenpicture;																
								arrpix[arrpix.indexOf(oldimg)] = newimgupload ;

								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload !")
										DriversModel.findOne(
											{ _id : taxiId }, 
											{ status:1, updated:1 },
											function(err, taxiupfile) {
												taxiupfile.brokenpicture = arrpix;
												taxiupfile.updated = new Date().getTime();
												taxiupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error" });
													} else {
														err ? res.send(err) : res.json({ 
															satus: true , 
															msg: "success, your image has been replaced." 
															});
													}
												});
											}
										);
									}
								});
							}
							
						}
					}
					else {
						console.log("do not have form")
						res.json({ status: false , msg: "do not have form" });
					}				
				}
			}
		);
	}
};




exports.driverBrokenDel = function(req, res) { 
_id = req.body._id	;
device_id = req.body.device_id	;
var oldimg = req.body.oldimg;
	DriversModel.findOne(
		{ _id: _id, device_id : device_id }, 
		{ device_id:1, brokenpicture:1 },
		function(err, response) {
			if (response == null) {	
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});										
			} else {
				arrpix = response.brokenpicture;	
				imgorder = arrpix.indexOf(oldimg)
				if(imgorder>0){
					arrpix.splice(imgorder, 1);	// delete array at immgorder	
				}				
				DriversModel.findOne(
					{ _id : _id }, 
					{ status:1, updated:1 },
					function(err, taxi) {						
						taxi.brokenpicture = arrpix;
						taxi.updated = new Date().getTime();
						taxi.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {

								var fs = require('fs');
								var filePath = 'uploadb/'+oldimg ; 
								fs.exists(filePath, function(exists) {
									if (exists) {
										fs.unlinkSync(filePath);
									}
								});																
								err ? res.send(err) : res.json({ satus: true , msg: "success, your image has been deleted." });
							}
						});
					}
				);
			}
		}
	);
};




exports.driverBrokenReport = function(req, res) { 
_id = req.body._id		;
device_id = req.body.device_id	;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ _id : _id, device_id : device_id },
		{ status:1, updated:1 },
		function(err, taxi) {
		    	if(taxi == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {
				if(req.body.curlng) 	{ taxi.curlng	= req.body.curlng ? req.body.curlng : taxi.curlng; }
				if(req.body.curlat) 	{ taxi.curlat	= req.body.curlat ? req.body.curlat : taxi.curlat; }
				if(curloc) 		{ taxi.curloc	= curloc ? curloc : taxi.curloc; }		    		
				if(req.body.brokenname) { taxi.brokenname	= req.body.brokenname ? req.body.brokenname : taxi.brokenname; }
				if(req.body.brokendetail)	 { taxi.brokendetail	= req.body.brokendetail ? req.body.brokendetail : taxi.brokendetail; }
				taxi.status	= "BROKEN";
				taxi.updated = new Date().getTime();
				taxi.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "Please input latitude and longitude." });
					} else {
						err ? res.send(err) : res.json({ status: true , msg: "success, your broken report has benn sent." });
					}
				});
		    	}	
		}
	);
};




exports.driverBrokenCancel = function(req, res) { 
_id = req.body._id				;
device_id = req.body.device_id			;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1, brokenpicture:1  },
		function(err, response) {
			if (response == null) {	
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    		} else {
				arrpix = response.brokenpicture;
				var i;
				for (i=0; i<arrpix.length; i++){					
					var filePath = 'uploadb/'+arrpix[i] ; 
					// fs.removeSync(filePath);
					// fs.exists(filePath, function(exists) {	
					// 	console.log('filePath2 = '+filePath)	
					// 	console.log('exists='+exists)
					// 	if (exists) {
					// 		console.log('exists2='+exists)
					// 		fs.removeSync(filePath);
					// 	}
					// });

					if (fs.existsSync(filePath)) {
					    fs.removeSync(filePath);
					}
				}
				DriversModel.findOne(
					{ _id : _id }, 
					{ status:1, updated:1 },
					function(err, taxi) {						
						taxi.brokenname = [];
						taxi.brokendetail = "";
						taxi.brokenpicture = [];
						taxi.status = "ON";
						taxi.updated = new Date().getTime();
						taxi.save(function(err, result) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								err ? res.send(err) : res.json({ status: true , msg: "success, your car is back to available." });
							}
						});
					}
				);
			}
		}
	);
};


	
	


// start ::: Passenger API
exports.passengerRegister = function(req, res) {
device_id = req.body.device_id	;
	PassengerModel.findOne(
		{ device_id : device_id }, 
		function(err, psg) {
			if (psg == null) { 
	    		PassengerModel.create(req.body, 
					function(err, response) {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg:  "Your account has been created.", 
							data : response 
						});
					}
				);
	    	} else {
				res.json({ 
					status: false, 
					msg: "Email or phone number has been used by the other user, please contact  xx-xxx-xxxx."
				});
			}
			
		}
	);
};




exports.passengerAutoLogin = function(req, res) {
device_id = req.body.device_id	;
phone = req.body.phone	;
	PassengerModel.findOne(
		{ device_id:device_id, phone:phone }, 
		function(err, psg) {			
	    	if(psg == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
			psg.status = "OFF";
			psg.updated = new Date().getTime();
			psg.save(function(err, response) {
				if(err) {
					res.json({ status: false , msg: "error" , data: err });
				} else {
					err ? res.send(err) : res.json({ 
						status: true, 
						msg: "Welcome to TaxiBeam", 
						data: { 
							_id: response._id, 
							status: response.status, 							
							curlng: response.curlng,
							curlat: response.curlat,
							curloc: response.curloc
						} 
					});
				}
			});
			}
			
		}
	);
};




exports.passengerUpdateProfile = function(req, res) {
_id		= req.body._id		;
device_id	= req.body.device_id	;
curloc 		= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1, status:1 },
		function(err, psg) {	    	
			if (psg == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    		} else {
				if(req.body.curlng) 	{ psg.curlng	= req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat	= req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc	= curloc ? curloc : psg.curloc; }	
				if(req.body.email) 	{ psg.email 	= req.body.email ? req.body.email : psg.email; }
				if(req.body.phone) 	{ psg.phone 	= req.body.phone ? req.body.phone : psg.phone; }					
				psg.updated = new Date().getTime();
				psg.save(function(err, result) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg: "success, passenger profile updated",
							data: result
							});
					}
				});
			}
		}
	);
};




exports.passengerGetStatus = function(req, res) {
_id = req.body._id	;
device_id = req.body.device_id	;
curlng = req.body.curlng	;
curlat = req.body.curlat		;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	if (typeof curlng == 'undefined' && curlng == null) {		
		res.json({ status: false, msg: "current longitude is not valid" })
		return;	
	}
	if (typeof curlat == 'undefined' && curlat == null) {		
		res.json({ status: false, msg: "current latitude is not valid" })
		return;
	}
	PassengerModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1, taxi_id:1, status:1, curloc:1, updated: 1},
		function(err, psg) {
			if (psg == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }			
				psg.updated = new Date().getTime();
				psg.save(function(err, result) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg: "success, there is your status.",
							data: result
							});
					}
				});
			}
		}
	);
};




exports.passengerGetByID = function(req, res) {
_id = req.body._id	;
	PassengerModel.findOne(
		{ _id : _id }, { _id:0, updated:0, created:0 },
		function(err, psg) {
	    	if(psg == null) { 
				res.json({ status: false , msg: "There is some data missing, please try again."});
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "success, passenger's information", 
					data : psg 
				});
			}
		}
	);
};




exports.passengerSearchTaxi = function(req, res) {
_id		= req.body._id		;
device_id	= req.body.device_id	;
favcartype	= req.body.favcartype	; 
favtaxi		= req.body.favtaxi	;
curlng 		= req.body.curlng	;
curlat 		= req.body.curlat	;
curloc 		= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
radian		= req.body.radian	;
amount		= req.body.amount	;
	// short form : if(req.body.uid) { device.uid = req.body.uid ? req.body.uid : device.uid; }		
	if (typeof curlng == 'undefined' && curlng == null) {		
		res.json({ status: false, msg: "current longitude is not valid" })
		return;	
	}
	if (typeof curlat == 'undefined' && curlat == null) {		
		res.json({ status: false, msg: "current latitude is not valid" })
		return;
	}
	if (typeof radian == 'undefined' && radian == null) {		
	radian = "5000";
	}
	if (typeof amount == 'undefined' && amount == null) {		
	amount = "200";
	}
	if (typeof favtaxi == 'undefined' && favtaxi == null) {
		condition = { active:"Y", status: "ON", curloc : { $near : curloc, $maxDistance: radian },	cartype: { $in: favcartype } };
	}
	else{
		condition = { active:"Y", status: "ON", curloc : { $near : curloc, $maxDistance: radian },	cartype: { $in: favcartype }, _id : { $in: favtaxi }  };
	}
	PassengerModel.findOne( 
		{ _id: _id, device_id: device_id }, 
		{ psg_id:1, status:1 },
		function(err, psg) {
			if (psg == null) {  
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again." });
	    		} else {	    		
				if(req.body.favcartype) 	{ psg.favcartype = req.body.favcartype ? req.body.favcartype : psg.favcartype; }
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }				
				psg.updated = new Date().getTime();
				psg.save(function(err, response) {
					if(response == null) {
						res.json({ status: false , msg: "error" , data: err });
					} else {
						DriversModel.find(
							condition,
							{ device_id:0,  grg_id:0, smsconfirm:0, updated:0, created:0 },					
							{ limit : amount },
							function(err,taxilist){
								// Donot forget to create 2d Index for passengers collection : curloc & descloc!!!!								
								if(taxilist == null){
									res.json({status: false, msg: "No data"});
								} else {
									res.json({
										status: true, 
										msg: "This is your taxi list.", 
										data: taxilist
										});
									//Specifies a point for which a geospatial query returns the documents from nearest to farthest.
								}
							}
						);

					}
				});

			}
		}
	);
};




exports.passengerCallTaxi = function(req, res) {
_id		= req.body._id		;
device_id	= req.body.device_id	;
curlng 		= req.body.curlng	;
curlat 		= req.body.curlat	;
curloc 		= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
deslng 		= req.body.deslng	;
deslat 		= req.body.deslat	;
desloc 		= [parseFloat(req.body.deslng),parseFloat(req.body.deslat)];
	PassengerModel.findOne(
		{ _id:_id, device_id:device_id }, 
		{ device_id:1, curaddr:1, curloc:1, destination:1, desloc:1, des_dist:1, tips:1, detail:1, favcartype:1, status:1, updated:1 },
		function(err, psg) {
		    	if(psg == null) { 
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {
				// Update passenger info and status to be "ON"
				if(req.body.curaddr)	{ psg.curaddr = req.body.curaddr ? req.body.curaddr : psg.curaddr; }				
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }
				if(req.body.destination)	{ psg.destination = req.body.destination ? req.body.destination : psg.destination; }				
				if(req.body.deslng) 	{ psg.deslng = req.body.deslng ? req.body.deslng : psg.deslng; }
				if(req.body.deslat) 	{ psg.deslat = req.body.deslat ? req.body.deslat : psg.deslat; }
				if(desloc) 		{ psg.desloc = desloc ? desloc : psg.desloc; }				
				if(req.body.des_dist)	{ psg.des_dist = req.body.des_dist ? req.body.des_dist : psg.des_dist; }
				if(req.body.tips) 	{ psg.tips = req.body.tips ? req.body.tips : psg.tips; }
				if(req.body.detail)	{ psg.detail = req.body.detail ? req.body.detail : psg.detail; }
				if(req.body.favcartype)	{ psg.favcartype = req.body.favcartype ? req.body.favcartype : psg.favcartype; }
				psg.status = "ON";
				psg.updated = new Date().getTime();				
				psg.save(function(err, response) {
					err ? res.send(err) : res.json({ 
							status: true , 
							msg: "Update passenger to ON => call taxi", 
							data: response
						});
				});
			}
		}
	);
};




exports.passengerEditRoute = function(req, res) {
_id		= req.body._id		;
device_id	= req.body.device_id	;
	PassengerModel.findOne(
		{ _id: _id, device_id:device_id }, 
		{ device_id:1, status:1 },
		function(err, psg) {
	    	if(psg == null) { // don't have passengers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {				
				psg.updated = new Date().getTime();
				psg.status = "OFF";
				psg.save(function(err, response) {
					err ? res.send(err) : res.json({ 
						status: true , 
						msg: "Update passenger to OFF => edit route", 
						data: response
					});
				});
			}
		}
	);
};




exports.passengerAcceptTaxi = function(req, res) {
_id		= req.body._id ;
device_id	= req.body.device_id ;
taxi_id		= req.body.taxi_id ;
curlng 		= req.body.curlng	;
curlat 		= req.body.curlat	;
curloc 		= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1 },
		function(err, psg) {
		    	if(psg == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }				
				if(req.body.taxi_id) 	{ psg.taxi_id = req.body.taxi_id ? req.body.taxi_id : psg.taxi_id; }
				psg.updated = new Date().getTime();
				psg.status = "BUSY";				
				psg.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						DriversModel.findOne(
							{ _id : taxi_id }, 
							{ status:1, updated:1 },
							function(err, taxi) {
							    	if(taxi == null) { 
									res.json({ status: false , msg: "Driver id  does not exist. Please register and try again."});
							    	} else {
									taxi.psg_id = _id ;
									taxi.updated = new Date().getTime();
									taxi.status = "BUSY";									
									taxi.save(function(err, response) {
										err ? res.send(err) : res.json({ status: true , msg: "Update passenger to BUSY => passenger accept taxi" });
									});
							    	}
							}
						);
					}
				});
			}
		}
	);
};




exports.passengerGetTaxiLoc = function(req, res) {
_id		= req.body._id ;
device_id	= req.body.device_id ;
taxi_id		= req.body.taxi_id ;
	PassengerModel.findOne(
		{ _id : _id, taxi_id: taxi_id, status: "BUSY" }, 
		{ _id: 0, status:1 },
		function(err, psg) {		
			if (psg == null) {
				res.json({ status: false , msg: "Your account does not exist, please register and try again.", data: err});
			} else {
				DriversModel.findOne(
					{ _id: taxi_id, psg_id: _id, status: "BUSY" }, 
					{ _id:1, psg_id:1, curlng:1, curlat:1, curloc:1, accuracy: 1, degree:1, status:1, active:1 },
					function(err, taxi) {					
						if (taxi == null) {
							res.json({ status: false , msg: "error2", data: err});
						} else {
							err ? res.send(err) : res.json({ status: true , msg: "success: get taxi location ", data: taxi });
						}
					}
				);
			}						
		}
	);

};




/*
device.save(function(err,response){
	if(err) {
		res.json({ status: false , msg: "error" });
	}				
	else {
		// waiting to on , busy to on 
		if(req.body.passengerID) {
			PassengerModel.findOne(
			{
				uid : req.body.passengerID
			}, 
			function(err, psg) {
				// update psg by UID 
				if(req.body.action) { 	psg.status 	= statusValue.psg; }

				if(device.status==statusConstant.on){ msg = 'on';}
				else{ msg = 'waiting'; }

				psg.save(function(err, response) {
					err ? res.send(err) : res.json({ status: true , msg: "success: taxi status "+msg });
				});
			});
		}
		else {
			res.json({ status: true , msg: "no taxi" });
		}
	}
});
*/


exports.passengerCancelCall = function(req, res) {
_id		= req.body._id			;
device_id	= req.body.device_id		;
taxi_id		= req.body.taxi_id		;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ _id : _id }, 
		{ status:1, updated:1 },
		function(err, psg) {
		    	if(psg == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {				
				if(req.body.curlng) 	{ psg.curlng	= req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat	= req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc	= curloc ? curloc : psg.curloc; }		    						
				psg.taxi_id = "";
				psg.updated = new Date().getTime();
				psg.status = "ON";
				psg.save(function(err, response) {					
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {						
						DriversModel.findOne(
							{ _id : taxi_id }, 
							{ status:1, updated:1 },
							function(err, taxi) {
							    	if(taxi == null) { 
									res.json({ status: false , msg: "This taxi  does not exist. Please register and try again."});
							    	} else {									
									taxi.psg_id = "";
									taxi.updated = new Date().getTime();
									taxi.status = "ON";									
									taxi.save(function(err, response) {
										err ? res.send(err) : res.json({ status: true , msg: "Update passenger to ON => passenger cancel taxi" });
									});
							    	}
							}
						);
					}
				});
		    	}
		}
	);
};




exports.passengerEndTrip = function(req, res) {
_id		= req.body._id		;
device_id	= req.body.device_id	;
taxi_id		= req.body.taxi_id	;
curlng 		= req.body.curlng	;
curlat 		= req.body.curlat	;
curloc 		= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ _id : _id }, 
		{ status:1, updated:1 },
		function(err, psg) {
		    	if(psg == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
		    	} else {				
				psg.curaddr = "";				
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }				
				psg.destination = "";
				psg.desloc = [];
				psg.des_dist = "";
				psg.tips = "";
				psg.detail = "";
				psg.taxi_id = "";
				psg.updated = new Date().getTime();
				psg.status = "OFF";				
				psg.save(function(err, response) {					
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {						
						DriversModel.findOne(
							{ _id : taxi_id }, 
							{ status:1, updated:1 },
							function(err, taxi) {
							    	if(taxi == null) { 
									res.json({ status: false , msg: "This taxi  does not exist. Please register and try again."});
							    	} else {									
									taxi.psg_id = "";
									taxi.updated = new Date().getTime();
									taxi.status = "ON";									
									taxi.save(function(err, response) {
										err ? res.send(err) : res.json({ status: true , msg: "Update passenger to ON => passenger end trip" });
									});
							    	}
							}
						);
					}
				});
		    	}
		}
	);	
};




exports.passengerFavTaxiAdd = function(req, res) { 
_id = req.body._id			;
device_id = req.body.device_id		;	
 	PassengerModel.findOne(
		{ _id: _id, device_id: device_id }, 
		{ favtaxi:1 },		
		function(err, psg) {				
			if (psg == null) {	
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again." });				
			} else {
				arrfav = psg.favtaxi;	
				arrfav.push(req.body.favtaxi);			// push arrary at the last

				psg.favtaxi = arrfav;
				psg.updated = new Date().getTime();
				psg.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });							
					} else {
						err ? res.send(err) : res.json({ 
							satus: true , 
							msg: "success, added your favorite taxi.",
							data : psg
							});							
					}
				});				
			}
		}
	);
	
};




exports.passengerFavTaxiDel = function(req, res) { 
_id = req.body._id	;
device_id = req.body.device_id	;
var oldfav = req.body.favtaxi;
	PassengerModel.findOne(
		{ _id: _id, device_id : device_id }, 
		{ favtaxi:1 },
		function(err, psg) {
			if (psg == null) {	
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});										
			} else {
				arrfav = psg.favtaxi;	
				//console.log('arrfav='+arrfav)
				favorder = arrfav.indexOf(oldfav)
				//console.log('favorder='+favorder)
				if (favorder>0){
					arrfav.splice(favorder, 1);	// delete array at favorder
				}
				//console.log('arrfav2='+arrfav)
				psg.favtaxi = arrfav;
				psg.updated = new Date().getTime();
				psg.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {																
						err ? res.send(err) : res.json({ satus: true , msg: "success, your favorite taxi has been deleted.", data: psg });
					}
				});
			}
		}
	);
};




exports.passengerSendComment = function(req, res) {
_id = req.body._id			;
device_id = req.body.device_id		;
commtype = "Passenger"		;
topic = req.body.topic			;
comment = req.body.comment		;
	PassengerModel.findOne(
		{ _id : _id, device_id : device_id }, 
		function(err, psg) {
	    		if(psg == null) { 
				res.json({ status: false , msg: "Your phone number does not exist, please register", data : err });
	    		} else {	    			
		    		CommentModel.create({
					commtype: commtype		, 
					user_id: _id			,
					device_id: device_id		,
					topic: topic			,
					comment: comment
					},
	    				function(err, response) {
					if (err) {
						res.send(err)
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg:  "Your comment has been sent, Thank you."
						}); 
					}
				});		
			}
		}
	);
};











// --------- start shared API
exports.announcementAdd = function(req, res) {
user_id = req.body.user_id	;
	UserModel.findOne(
		{ _id : user_id }, 
		function(err, user) {				
			if (user == null) {		
				res.json({ 
					status: false , 
					msg:  "Your account is not valid, please try again."
				});
			} else {
	    		AnnounceModel.create(req.body, function(err, response) {
					if (err) {
						res.send(err)
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg:  "The announcement has been created.",
							data: {
								ann_id : response._id,
								anntype : response.anntype,
								topic : response.topic,
								detail : response.detail,
								status : response.status,
								expired : response.expired,
								created : response.created
							}
						});
					}					
				});
			}
		}
	);
};




exports.announcementEdit = function(req, res) {
user_id = req.body.user_id	;
ann_id = req.body.ann_id	;
	UserModel.findOne(
		{ _id : user_id }, 
		function(err, user) {				
			if ( user == null) {		
				res.json({ 
					status: false , 
					msg:  "Your account is not valid, please try again."
				});
			} else {
				AnnounceModel.findOne(
					{ _id : ann_id }, 
					{ status:1, updated:1 },
					function(err, announce) {						
						if(req.body.anntype) 	{ announce.anntype 	= req.body.anntype ? req.body.anntype : announce.anntype; }
						if(req.body.topic) 		{ announce.topic 	= req.body.topic ? req.body.topic : announce.topic; }
						if(req.body.detail) 	{ announce.detail 	= req.body.detail ? req.body.detail : announce.detail; }
						if(req.body.status) 	{ announce.status 	= req.body.status ? req.body.status : announce.status; }
						if(req.body.expired) 	{ announce.expired 	= req.body.expired ? req.body.expired : announce.expired; }
						announce.updated = new Date().getTime();
						announce.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								res.json({ 
									status: true , 
									msg: "success, announcement has been updated",
									data: {
										ann_id : response._id,
										anntype : response.anntype,
										topic : response.topic,
										detail : response.detail,
										status : response.status,
										expired : response.expired,
										created : response.created
									}									
								});
							}
						});
					}
				);
			}
		}
	);
};




exports.announcementDel = function(req, res) {
user_id = req.body.user_id	;
ann_id = req.body.ann_id		;
	UserModel.findOne(
		{ _id : user_id }, 
		function(err, user) {
			if ( user == null) {		
				res.json({ 
					status: false , 
					msg:  "Your account is not valid, please try again."
				});
			} else {
				AnnounceModel.findOne(
					{ _id : ann_id }, 
					function(err, announce) {
						if (announce == null) {		
							res.json({ 
								status: false , 
								msg:  "Your announce id is not valid, please try again."
							});
						} else {
							announce.remove({ _id : ann_id },
								function(err, response) {
								console.log(response)
									if(err) {
										res.json({ status: false , msg: "error" });
									} else {
										res.json({ 
											status: true , 
											msg: "success, the announcement has been deleted"									
										});
									}
								}
							);
							res.json({ 
								status: true , 
								msg: "success, the announcement has been deleted"									
							});
						}
					}
				);
			}
		}
	);
};




exports.announcementGet	= function(req, res) {
anntype = req.body.anntype	;
	AnnounceModel.findOne(
		{ anntype: anntype, topic: { $ne: '' }, status:"Y" },
		{ user_id:0 },
		function(err, response) {
	    	if(response == null) { 
				res.json({ status: false , msg: "There is no data."});
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "success, this is announcements.", 
					data :  response
				});
			}
		}
	);
};




exports.emglistAdd = function(req, res) {
user_id = req.body.user_id	;
	UserModel.findOne(
		{ _id : user_id }, 
		function(err, user) {				
			if ( user == null) {		
				res.json({ 
					status: false , 
					msg:  "Your account is not valid, please try again."
				});
			} else {
	    		EmgListModel.create(req.body, function(err, response) {
					if (err) {
						res.send(err)
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg:  "The announcement has been created.",
							data: {
								emg_id : response._id,
								emgtype : response.emgtype,
								name : response.name,
								phone : response.phone,
								status : response.status,
								emgimg : response.emgimg
							}
						});
					}					
				});
			}
		}
	);
};




exports.emglistEdit = function(req, res) {
user_id = req.body.user_id	;
emg_id = req.body.emg_id		;
	UserModel.findOne(
		{ _id : user_id }, 
		function(err, user) {				
			if ( user == null) {		
				res.json({ 
					status: false , 
					msg:  "Your account is not valid, please try again."
				});
			} else {
				EmgListModel.findOne(
					{ _id : emg_id }, 
					{ status:1, updated:1 },
					function(err, emg) {
						/* update taxi by _id */
						if(req.body.emgtype) 	{ emg.emgtype 	= req.body.emgtype ? req.body.anntype : emg.emgtype; }
						if(req.body.name) 		{ emg.name 	= req.body.name ? req.body.name : emg.name; }
						if(req.body.phone) 	{ emg.phone 	= req.body.phone ? req.body.phone : emg.phone; }
						if(req.body.status) 	{ emg.status 	= req.body.status ? req.body.status : emg.status; }
						emg.updated = new Date().getTime();
						emg.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								res.json({ 
									status: true , 
									msg: "success, the emergency list has been updated",
									data: {
										emg_id : response._id,
										emgtype : response.emgtype,
										name : response.name,
										phone : response.phone,
										status : response.status,
										emgimg : response.emgimg
									}									
								});
							}
						});
					}
				);
			}
		}
	);
};




exports.emglistDel = function(req, res) {
user_id = req.body.user_id	;
emg_id = req.body.emg_id		;
	UserModel.findOne(
		{ _id : user_id }, 
		function(err, user) {
			if ( user == null) {		
				res.json({ 
					status: false , 
					msg:  "Your account is not valid, please try again."
				});
			} else {
				EmgListModel.findOne(
					{ _id : emg_id }, 
					function(err, emg) {
						if (emg == null) {		
							res.json({ 
								status: false , 
								msg:  "Your emergencylist id is not valid, please try again."
							});
						} else {
							emg.remove({ _id : emg_id },
								function(err, response) {
									if(err) {
										res.json({ status: false , msg: "error" });
									} else {
										res.json({ 
											status: true , 
											msg: "success, the emergencylist has been deleted"									
										});
									}
								}
							);

							res.json({ 
								status: true , 
								msg: "success, the emergencylist has been deleted"									
							});

						}

					}
				);
			}
		}
	);
};




exports.emglistGet	= function(req, res) {
emgtype = req.body.emgtype	;
	EmgListModel.findOne(
		{ emgtype : emgtype, status: "Y", name: { $ne: '' } }, 
		{ _id:0 },
		function(err, response) {
	    	if(response == null) { 
				res.json({ status: false , msg: "There is no data."});
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "success, emergency list", 
					data : response 
				});
			}
		}
	);
};
	



exports.viewComment	= function(req, res) {
commtype = req.body.commtype	;
	CommentModel.find(
		{ commtype : commtype, topic: { $ne: '' } }, 
		{ _id:0 , updated:0},
		function(err, response) {
	    	if(response == null) { 
				res.json({ status: false , msg: "There is no data."});
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "success, here is the comment list", 
					data : response 
				});
			}
		}
	);
};




exports.getPathlog = function(req, res) {

};




exports.testapi = function(req,res) {
	 res.json({ 
		status: true , 
		msg:  "success, you device is valid."
		
	});
};




exports.passengerTestFind = function(req, res) {
/*
example: 
{
    "user_id" : "557e5923ef08ecc410cba32c",
    "user_id2":"557e5931ef08ecc410cba32d"
}
*/
	var user_id = req.body.user_id;
	var user_id2 = req.body.user_id2;
	PassengerModel.find(
		{
			_id : { $in:[ user_id,user_id2] } 
			
		}, {_id:1},
		function(err, passennger) {
			 
	    	if (err) {
				res.send(err); 
				}

	    	if(passennger == null) {
				res.json({ status: false , msg: "Your phone number does not exist, please register", data: passennger });
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "Your comment has been sent, Thank you.",
					data: passennger
				}); 	
			}
		}
	);
};




////////////////////// This comment is for an example, please do not delete. ///////////////////////////////////
// SchemaModel.findOne() => can not return _id (ObjectId) , notfound return NULL
// SchemaModel.find() => can return _id (ObjectId), notfound return Fetched 0 record
// gen Json data
	/*
	var _res = {
			status: true,
			msg : "Welcome to TaxiBeam.",
			data: response
		};
	res.json(_res);
	*/
// update data
	/* how to update
	if(req.body.fname)	{ drivers.fname 	= req.body.fname ? req.body.fname : psg.fname; }
	drivers.save(function(err, response) {
	err ? res.send(err) : res.json({ status: true , msg: "success: passenger status " });
	});
	*/
// how to set index 2d : db.collectionName.createIndex({curloc:"2d"})
//$near  :  Specifies a point for which a geospatial query returns the documents from nearest to farthest. The $near operator can specify either a GeoJSON point or legacy coordinate point.
// express validation : http://blog.ijasoneverett.com/2013/04/form-validation-in-node-js-with-express-validator/

/* how to exit from function
exports.driverSearchPassenger = function(req, res) {
	var amount = req.body.amount;
	console.log(amount)
	res.json({ status: false, msg: "not valid _id" })
	return ;
	};
*/
// update to now : psg.updated = new Date().getTime();

/*
function replaceinArray {
//http://stackoverflow.com/questions/5915789/replace-item-in-array-with-javascript
var arr = Array("1","2","3","4","5");
var brr = arr[arr.indexOf("2")] = "1010";
alert(arr);
}
*/

/* array technique
findname = arrpix[imgorder];
replaceimgname = findname ;
arrpix[arrpix.indexOf(replaceimgname)] = newimgname ;
arrpix.splice(imgorder, 1);	// delete array at immgorder
arrpix.push(newpix);			// push arrary at the last	
*/

/*
node port EADDRINUSE
netstat -a -n -o to find PID of the port
taskkill /F /PID xxx  to kill the particular port
*/

// short form : if(req.body.uid) { device.uid = req.body.uid ? req.body.uid : device.uid; }
// there is no way to use something like Select abc AS xyz on MongoDB



/*
Geo Command

db.passengers.find({ 
   curloc:{$near: [ 100.1134500000000100, 12.1134500000000000 ] , $maxDistance: 1000 }    
    }).sort( { _id:-1 } )



// return distance : The following spherical query, returns all documents in the collection places within 100 miles 
db.runCommand( { 
    geoNear: "drivers",
    near: [ 100.1134500000000100, 12.1134500000000000 ],
    spherical: true,
    distanceMultiplier: 3963.2,
    query: (  { "cartype":{ $in:["car","minivan"]} }   ),
    maxDistance: 10,
    includeLocs: true,
    uniqueDocs : true,
    limit: 1
               } )



// GeoWithin
db.drivers.find(
{ 
    cartype: {$in: ["car","minivan"]}, 
    curloc: { 
        $geoWithin: { 
                        $centerSphere: [ 
                                            [ 100.1134500000000100, 12.1134500000000000 ], 1  
                                        ] 
                    } 
            }
 },
 {smsconfirm:0, device_id:0} )




*/