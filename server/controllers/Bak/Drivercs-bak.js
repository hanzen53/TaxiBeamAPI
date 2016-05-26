////////////////////////////////////
// TaxiBeam API for Driver
// version : 1.0.2
// Date August 13, 2015 
// Created by Hanzen@BRET
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
	ios = require('socket.io'),
	qs = require('querystring');

// var app = require("express");

// var server = require("http").Server(app);
// var io = require('socket.io')(server);
 // var io = require('socket.io').listen(server);
// require('./server/sockets/sockets')(io);

// for all API
var 	radian = "10000";		// in meters
var 	amount = "";
	
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


function _getErrDetail (errCode, callback) {
	ErrorcodeModel.findOne( 
		{ errcode: errCode },	
		{ errth: 1}, 
		function(err, response) {
		    	if (response==null) { 
		    		callback('');
		    	}  else  {
			    	callback(response.errth)
		    	}	    	
		}
	);
};


function _driverAutoLogin (req, res) {
var device_id = req.body.device_id	;
var _id = req.body._id			;
	DriversModel.findOne(
		{ device_id :  device_id }, 		
		function(err, drv){	    		
		    	if(drv == null) { 		    		
		    		// This phone(IMEI) have never been in the system, send to registration page.
				res.json({ 
					status: false , 
					target: "REGISTRATION"				
				});
		    	} else {	    
		    		if ( drv._id == _id ) {
			    		if ( drv.active == 'Y' ) {
			    			if ( drv.status == 'BROKEN') {
			    				// Already in the system and SMS :Y but status BROKEN, send to broken page
							res.json({ 							
								status: false , 
								target: "BROKEN"							
							});	
			    			} else {
							drv.status = "ON";
							drv.updated = new Date().getTime();
							drv.save(function(err, response) {
								if (err) {
									console.log('_driverAutoLogin = '+err)
									res.json({ 
										status: false , 
										msg: "error" 								
									});
								} else {
									// device_id: Y, _id: Y, SMScofirm: Y [ Welcome to Taxi-Beam ]
									res.json({ 
										status: true, 								
										data: { 
											_id: response._id, 
											status: response.status
										} 
									});
								}
							});			    				
			    			}
			    		} else {
						// Already in the system but SMS: N, send to SMS page			    			
						res.json({ 
							status: false , 
							target: "SMSCONFIRM"					
						});
			    		}
		    		} else {
		    			// in case of change mobile owner, send to update page to update driver info
					res.json({ 						
						status: false , 
						target: "BLANKPROFILE"			
					});
		    		}
			}
		}
	);
};


function _driverCheckLogin (device_id,_id, res) {	
	DriversModel.findOne(
		{ device_id :  device_id }, 		
		function(err, drv){	    		
		    	if(drv == null) { 		    		
		    		// This phone(IMEI) have never been in the system, send to registration page.
				res.json({ 
					status: false , 
					target: "REGISTRATION"				
				});
		    	} else {	    
		    		if ( drv._id == _id ) {
			    		if ( drv.active == 'Y' ) {
			    			if ( drv.status == 'BROKEN') {
			    				// Already in the system and SMS :Y but status BROKEN, send to broken page
							res.json({ 							
								status: false , 
								target: "BROKEN"							
							});	
			    			} else {
							drv.status = "ON";
							drv.updated = new Date().getTime();
							drv.save(function(err, response) {
								if (err) {
									console.log('driverchecklogin = '+err)
									res.json({ 
										status: false , 
										msg: "error" 								
									});
								} else {
									// device_id: Y, _id: Y, SMScofirm: Y [ Welcome to Taxi-Beam ]
									res.json({ 
										status: true, 								
										data: { 
											_id: response._id, 
											status: response.status
										} 
									});
								}
							});			    				
			    			}
			    		} else {
						// Already in the system but SMS: N, send to SMS page			    			
						res.json({ 
							status: false , 
							target: "SMSCONFIRM"					
						});
			    		}
		    		} else {
		    			// in case of change mobile owner, send to update page to update driver info
					res.json({ 						
						status: false , 
						target: "BLANKPROFILE"			
					});
		    		}
			}
		}
	);
};




// NOTE *******************************  start service for DRIVER
exports.driverAutoLogin = function(req, res) {
	_driverAutoLogin(req,res);
};




exports.driverRegister = function(req, res) {
// check only IMEI or Apple ID
var device_id = req.body.device_id;
	DriversModel.findOne(
		{ device_id : device_id }, 
		function(err, drv) {	    	
		    	if(drv == null) { 
		    		DriversModel.create({
					device_id: device_id,
					fname: req.body.fname,
					lname: req.body.lname,
					phone: req.body.phone,
					english: req.body.english,
					carplate : req.body.carplate,
					cartype : req.body.cartype,
					carcolor : req.body.carcolor,
					outbound : req.body.outbound,
					carryon : req.body.carryon,				
					active : "Y",
					status : "ON",
					smsconfirm: ranSMS()
					},
					function(err, response) {
						if (err) { 
							res.json({ status: false , msg: err, data: err });
						} else {
							res.json({ 
								status: true , 								
								data : { 
									_id: response._id,
									status: response.status									
								} 
							});
						} 
					});
		    	} else { 
		    		// duplicated IMEI/App ID => updated the current data for device_id.
				drv.fname = req.body.fname;
				drv.lname = req.body.lname;
				drv.phone = req.body.phone;
				drv.english = req.body.english;
				drv.carplate = req.body.carplate;
				drv.cartype = req.body.cartype;
				drv.carcolor = req.body.carcolor;
				drv.outbound = req.body.outbound;
				drv.carryon = req.body.carryon;
				drv.smsconfirm = ranSMS();
				drv.active = "Y";
				drv.status = "ON";
				drv.created = new Date().getTime();
				drv.updated = new Date().getTime();
				drv.nname = "";
				drv.workperiod = "";
				drv.workstatus = "";
				drv.imgface = "";
				drv.imglicence = "";
				drv.imgcar = "";
				drv.imgczid = "";
				drv.curlng = null;	
				drv.curlat = null;	
				drv.curloc = [];
				drv.accuracy = null;
				drv.degree = null; 
				drv.brokenname = [];	
				drv.brokendetail = "";	
				drv.brokenpicture = [];	
				drv.psg_id = "";
				drv.car_id = "";	
				drv.grg_id = "";				
				drv.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" , data: err });
					} else {					
						res.json({ 
							status: true, 
							data: { 
								_id: response._id, 
								status: response.status								
							} 
						});
					}
				});
			}
		}
	);
};




exports.driveruploadFace = function (req, res){
var form = new formidable.IncomingForm();
var imgtype = "imgface";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" ,data: err });
			} else {
				_getErrDetail('err004', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail
					});
				});
			}
		} else {
			// check image type			
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				findandUpload(_id, device_id);
			} else {
				// kick out
				//res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });
				_getErrDetail('err005', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail,
					});
				});
			}
		}
	});
	function findandUpload(drvId, deviceId) {
	 	DriversModel.findOne(
			{ _id : drvId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response == null) { 
					_driverCheckLogin( deviceId,drvId,res );	
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploads/';
								newimgupload = drvId+'_'+imgtype+extension;
								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload !")
										DriversModel.findOne(
											{ _id : drvId }, 
											{ status:1, updated:1 },
											function(err, drvupfile) {
												drvupfile.imgface = newimgupload;
												drvupfile.updated = new Date().getTime();
												drvupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error", data: err  });													
													} else {
														//success, your image has been uploaded.
														res.json({ 
															status: true , 															
															data : { imgname: newimgupload }
														});
													}
												});
											}
										);
									}
								});
							}
						}
					} else {
						console.log("do not have form")
						res.json({ status: false , msg: "no form" });
					}				
				}
			}
		);
	}
}




exports.driveruploadLicence = function (req, res){
var form = new formidable.IncomingForm();
var imgtype = "imglicence";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error", data: err  });
			} else {
				_getErrDetail('err004', function (errorDetail){
					res.json({ 
						status: false, 
						msg: errorDetail,
					});
				});
			}
		} else {
			// check image type
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				findandUpload(_id, device_id);
			} else {
				// kick out
				//res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });	
				_getErrDetail('err005', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail
					});
				});				
			}
		}
	});
	function findandUpload(drvId, deviceId) {
	 	DriversModel.findOne(
			{ _id : drvId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response == null) { 
					_driverCheckLogin( deviceId,drvId,res );	
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploads/';
								newimgupload = drvId+'_'+imgtype+extension;
								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload !")
										DriversModel.findOne(
											{ _id : drvId }, 
											{ status:1, updated:1 },
											function(err, drvupfile) {
												drvupfile.imglicence = newimgupload;
												drvupfile.updated = new Date().getTime();
												drvupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error", data: err  });
													} else {
														res.json({ 
															status: true , 															
															data : { imgname: newimgupload }
														});
													}
												});
											}
										);
									}
								});
							}
						}
					} else {
						console.log("do not have form")
						res.json({ status: false , msg: "no form" });
					}				
				}
			}
		);
	}
}




exports.driveruploadCar = function (req, res){
var form = new formidable.IncomingForm();
var imgtype = "imgcar";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" , data: err });
			} else {
				_getErrDetail('err004', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail
					});
				});
			}
		} else {
			// check image type
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				findandUpload(_id, device_id);
			} else {
				// kick out
				//res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });	
				_getErrDetail('err005', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail,
					});
				});				
			}
		}
	});
	function findandUpload(drvId, deviceId) {
	 	DriversModel.findOne(
			{ _id : drvId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response ==  null) { 
					_driverCheckLogin( deviceId,drvId,res );
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploads/';
								newimgupload = drvId+'_'+imgtype+extension;
								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload !")
										DriversModel.findOne(
											{ _id : drvId }, 
											{ status:1, updated:1 },
											function(err, drvupfile) {
												drvupfile.imgcar = newimgupload;
												drvupfile.updated = new Date().getTime();
												drvupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error", data: err  });
													} else {
														res.json({ 
															status: true ,															
															data : { imgname: newimgupload }
														});
													}
												});
											}
										);
									}
								});
							}
						}
					} else {
						//console.log("do not have a form")
						res.json({ status: false , msg: "no form" });
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
var _id = req.body._id			;
var device_id = req.body.device_id	;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id  }, 
		{ _id:1, status:1, phone:1, smsconfirm:1 },
		function(err, response) {	    	
		    	if(response == null) { 
		    		//status: false , msg: "The phone number does not exist. Please register and try again."
				/*
				res.json({ 
					"SendMessageResult": {
					"ErrorCode": 0,
					"ReferenceCode": "",
					"Success": false
					}
					
				});
				*/
				//msg: "ระบบไม่สามารถส่งเลขรหัสยืนยันการเข้าใช้บริการได้ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง"
				_getErrDetail('err006', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail
					});
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
							  //"msg"	: "Taxi-Beam OTP code is "+smsconfirm+", Please use it for verification."
							  "msg"	: "กรุณาใส่เลขรหัส 4 หลักนี้  "+smsconfirm+" ในช่องที่กำหนด เพื่อยืนยันการเข้าใช้บริการค่ะ  "
						});
						var options = {
							hostname: 'sms.narun.me',
							port: 443,
							path: '/SMSMeJson.svc/SendMessage', 
							method: 'POST',
							headers: {								
								'Content-Type': 'application/json; charset=utf-8'
								//'Content-Length': postData.length
							}
						};
						var request = https.request(options, function(response){
							var body = '';
							response.on('data', function(d) {
								body += d;
							});
							response.on('end', function() {
								var parsed = JSON.parse(body);								
								//res.json(parsed);								
								if (parsed.SendMessageResult.ErrorCode==1) {
									//msg: "success, sms has been sent.",
									res.json({ 
										status: true										
									});
								} else {
									//msg: "ระบบไม่สามารถส่งเลขรหัสยืนยันการเข้าใช้บริการได้ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง"
									_getErrDetail('err006', function (errorDetail){
										res.json({ 
											status: false, 	
											msg: errorDetail
										});
									});
								}
								
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
var _id	= req.body._id			;
var device_id = req.body.device_id		;
var smsconfirm = req.body.smsconfirm	;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id, smsconfirm : smsconfirm }, 
		{ device_id:1, status:1, updated:1 },
		function(err, drv) {
			if(err) {
				res.json({ status: false , msg: "error", data: err  });
			} else {					
			    	if( drv == null ) {
		    			//"msg": "ขออภัยค่ะ ท่านใส่รหัสยืนยันการเข้าใช้บริการ  4 ตัวไม่ถูกต้อง กรุณาใส่รหัส
					_getErrDetail('err002', function (errorDetail){
						res.json({ 
							status: false, 	
							msg: errorDetail
						});
					});
			    	} else {				
					drv.active = "Y";
					drv.updated = new Date().getTime();
					drv.save(function(err, response) {							
						if(err) {
							res.json({ status: false, msg: "error", data: err });
						} else {					
							res.json({ 
								//msg: "success, your account has been activated." ,
								status: true								
								/*
								data : {
									_id: response._id, 
									status: response.status,
									active: response.active
								}
								*/
							});
						}
					});
				}
			}
		}
	);
};




exports.driverUpdateProfile = function(req, res) {
var _id = req.body._id	;
var device_id = req.body.device_id ;
	DriversModel.findOne(
		{ _id: _id, device_id: device_id, active: "Y" }, 
		{ device_id:1, fname:1, lname:1, phone:1, englist:1, carplate:1, cartype:1, carcolor:1, outbound:1, carryon:1, carlng:1, carlat:1, accuracy:1, degree:1, statsu:1 },
		function(err, drv) {
			if (drv == null) {				
				_driverAutoLogin(req,res);
	    		} else {
				/* update drv by _id */
				if(req.body.fname) 	{ drv.fname  = req.body.fname ? req.body.fname : drv.fname; }
				if(req.body.lname) 	{ drv.lname  = req.body.lname ? req.body.lname : drv.lname; }
				if(req.body.phone) 	{ drv.phone  = req.body.phone ? req.body.phone : drv.phone; }
				if(req.body.english) 	{ drv.english  = req.body.english ? req.body.english : drv.english; }
				if(req.body.carplate) 	{ drv.carplate = req.body.carplate ? req.body.carplate : drv.carplate; }
				if(req.body.cartype) 	{ drv.cartype  = req.body.cartype ? req.body.cartype : drv.cartype; }
				if(req.body.carcolor) 	{ drv.carcolor = req.body.carcolor ? req.body.carcolor : drv.carcolor; }
				if(req.body.outbound) 	{ drv.outbound = req.body.outbound ? req.body.outbound : drv.outbound; }
				if(req.body.carryon) 	{ drv.carryon = req.body.carryon ? req.body.carryon : drv.carryon; }					
				drv.updated = new Date().getTime();
				drv.save(function(err, result) {
					if(err) {
						res.json({ status: false, msg: "error" , data: err });
					} else {
						res.json({ 
							//msg: "success, driver profile updated",
							status: true 
						});
					}
				});
			}
		}
	);
};



///////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////




exports.driverGetStatus = function(req, res, ios) {

//console.log(  'xxxxxxx ' +  ios )
//ios.test1() ;
//ios.socket.emit('message', { message: 'welcome to the teksi' }); 
//var io = require('socket.io').listen(1115);
// var  io = io ? io : require('socket.io').listen(1115);

var _id = req.body._id		;
var device_id = req.body.device_id	;
var curlng = req.body.curlng	;
var curlat = req.body.curlat		;
var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
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
		{ _id:1, device_id:1, curlng:1, curlat:1, psg_id:1, status:1,  active:1, msgphone: 1, msgnote: 1, msgstatus: 1 },
		function(err, drv) {
			if (drv == null) {					
				_driverAutoLogin(req,res);
		    	} else {				    		
				/************ emit socket  here ********************/		    		
				/*
				io.sockets.on('connection', function (socket) {
					socket.emit('testsocket1115', { hello: 'world' });
					
					socket.on('my other event', function (data) {
						console.log(data);
					});
				});	
				*/
				//socket.test1()  ;
		//		socket.io.emit('message', { message: 'welcome to the teksi' });
				/*
				io.sockets.on('connection', function (socket) {
					socket.emit('message', { message: 'welcome to the teksi' });
					//socket.on('send', function (data) {
					//io.sockets.emit('message', data);
					//});
					socket.on('disconnect', function () {
					    	console.log('disconnect')
					 });

					socket.on('close', function () {
					    	console.log('close')
					 });
				});	
				*/			
				//------------------ end io.on
				if(req.body.accuracy) 	{ drv.accuracy = req.body.accuracy ? req.body.accuracy : drv.accuracy; }
				if(req.body.degree) 	{ drv.degree = req.body.degree ? req.body.degree : drv.degree; }				
				if(req.body.curlng) 	{ drv.curlng	= req.body.curlng ? req.body.curlng : drv.curlng; }
				if(req.body.curlat) 	{ drv.curlat	= req.body.curlat ? req.body.curlat : drv.curlat; }
				if(curloc) 		{ drv.curloc	= curloc ? curloc : drv.curloc; }				
				drv.updated = new Date().getTime();
				drv.save(function(err, result) {
					if(err) {
						res.json({ status: false ,  msg: "error" , data: err  });
					} else {
						if (result.status=='ON') {
							res.json({ 
								//msg: "success, there is your status.", 
								status: true , 
								target: "SEARCHPASSENGER" ,								
								data : {								
									status: result.status,
									msgphone:  result.msgphone,
									msgnote:  result.msgnote,
									msgstatus:  result.msgstatus
								}							
							});
						} else {
							res.json({ 
								//msg: "success, there is your status.", 
								status: true ,  
								data : {								
									status: result.status,
									psg_id: result.psg_id,
									msgphone:  result.msgphone,
									msgnote:  result.msgnote,
									msgstatus:  result.msgstatus
								}							
							});							
						}

					}
				});
			}
		}
	);
};




exports.driverGetByID = function(req, res) {
var _id = req.body._id	;
	DriversModel.findOne(
		{ _id : _id, active: "Y"}, 
		{ _id:0, device_id: 0, nname:0, curloc:0, imgczid:0, workperiod:0, workstatus:0, car_id:0, grg_id:0, updated:0, created:0, smsconfirm:0 },
		function(err, drv) {		
	    		if(drv == null) { 
				//res.json({ status: false , msg: " ระบบมีการเปลี่ยนแปลงข้อมูลล่าสุดของแท็กซี่ กรุณาลองอีกครั้ง" });
				_getErrDetail('err009', function (errorDetail){
					res.json({ 
						status: false, 
						msg: errorDetail
					});
				});				
	    		} else {
				res.json({ 
					status: true , 
					msg:  "", 
					data: drv
					/*
					data : {	
						fname: drv.fname,
						nname: drv.nname,
						lname: drv.lname,
						phone: drv.phone,
						english: drv.english,
						carplate: drv.carplate,
						cartype: drv.cartype,
						carcolor: drv.carcolor,
						outbound: drv.outbound,
						carryon: drv.carryon,
						accuracy: drv.accuracy,
						degree: drv.degree,
						curlng: drv.curlng,
						curlat: drv.curlat,
						curloc: drv.curloc,
						workperiod: drv.workperiod,
						workstatus: drv.workstatus,
						imgface: drv.imgface,
						imglicence: drv.imglicence,
						imgcar: drv.imgcar,
						imgczid: drv.imgczid,
						brokenname: drv.brokenname,
						brokendetail: drv.brokendetail,
						brokenpicture: drv.brokenpicture,
						psg_id: drv.psg_id,
						car_id: drv.car_id,
						grg_id: drv.grg_id,
						status: drv.status,
						active: drv.active
					}
					*/
				});
			}
		}
	);
};	




exports.driverchangeOnOff = function(req, res) {
var _id = req.body._id				;
var device_id = req.body.device_id		;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1 },
		function(err, drv) {
			if (drv == null) {
				_driverAutoLogin(req,res);
		    	} else {							
				if(req.body.status) 	{ drv.status 	= req.body.status ? req.body.status : drv.status; }
				drv.updated = new Date().getTime();
				drv.save(function(err, result) {
					if(err) {
						res.json({ status: false ,   msg: "error", data: err  });
					} else {
						res.json({ 
							status: true ,  							
							data : {	status: drv.status }
						});
					}
				});
			}
		}
	);
};




exports.driverSearchPassenger = function(req, res) {
var _id = req.body._id			;
var device_id = req.body.device_id	;
var radian = req.body.radian		;
var amount = req.body.amount	;	
var curlng = req.body.curlng		;
var curlat = req.body.curlat		;
var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	if (typeof curlng == 'undefined' && curlng == null) {		
		res.json({ status: false, msg: "current longitude is not valid" })
		return;	
	}
	if (typeof curlat == 'undefined' && curlat == null) {		
		res.json({ status: false, msg: "current latitude is not valid" })
		return;
	}	
	if (typeof radian == 'undefined' && radian == null) {
		radian = "10000";
	}	
	if (typeof amount == 'undefined' && amount == null) {
		amount = "200";
	}
	DriversModel.findOne(
		{ _id: _id, device_id: device_id }, 
		{ status:1 },
		function(err, drv) {			
			if (drv == null) {
				_driverAutoLogin(req,res);
	    		} else {
				if(req.body.accuracy) 	{ drv.accuracy = req.body.accuracy ? req.body.accuracy : drv.accuracy; }
				if(req.body.degree) 	{ drv.degree = req.body.degree ? req.body.degree : drv.degree; }				
				if(req.body.curlng) 	{ drv.curlng	= req.body.curlng ? req.body.curlng : drv.curlng; }
				if(req.body.curlat) 	{ drv.curlat	= req.body.curlat ? req.body.curlat : drv.curlat; }
				if(curloc) 		{ drv.curloc	= curloc ? curloc : drv.curloc; }				
				drv.updated = new Date().getTime();
				drv.save(function(err, result) {
					if(err) {
						res.json({ status: false ,  msg: "error", data: err  });
					} else {
						PassengerModel.find(
							{ 						
								//curloc : { $near : curloc, $maxDistance: radian },   => for 2d index => not working
								// do not forget  => db.passengers.createIndex( { curloc : "2dsphere" } )
								curloc:  { 
									$near: {
										$geometry: {
											type: "Point" ,
											coordinates: curloc
										} , 
										$maxDistance: radian 
										//$minDistance: 1 
									}
								} ,
								status : "ON"
							},
							{ device_id:0, email:0, des_dist:0, deslng:0, deslat:0, favcartype:0, favdrv:0, drv_id:0, status:0, curloc:0, desloc:0, updated:0, created:0 },
							{limit : amount},
							function(err,psglist){
								// Donot forget to create 2d Index for drivers collection : curloc!!!!	- > not working  user 2d sphere instead
								if(psglist == 0){
									res.json({										
										status: false,
										msg: "No data"
									});									
								} else {
									res.json({
										//msg: "This is passenger list", 
										status: true, 										
										data: psglist
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




exports.driverAcceptCall = function(req, res) {
var _id = req.body._id			;
var device_id = req.body.device_id	;
var psg_id = req.body.psg_id		;
var curlng = req.body.curlng		;
var curlat = req.body.curlat		;
var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ _id : psg_id, status: "ON" },
		{ status: 1 },
		function(err,response) {				
			if(response==null) {
				//res.json({ status: false , msg:  "ผู้โดยสารท่านนี้ได้ถูกจองไปแล้ว กรุณาเลือกผู้โดยสารท่านใหม่", data:err });
				_getErrDetail('err008', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail
					});
				});				
			} else {		
				DriversModel.findOne(
					{  device_id: device_id }, 
					{ status:1, updated:1 },
					function(err, drv) {
						if(drv==null) {
							//res.json({ status: false , msg: "Your phone does not exist. Please register and try again." });
							_driverAutoLogin(req,res);
						} else {
							if(req.body.curlng) 	{ drv.curlng	= req.body.curlng ? req.body.curlng : drv.curlng; }
							if(req.body.curlat) 	{ drv.curlat	= req.body.curlat ? req.body.curlat : drv.curlat; }
							if(curloc) 		{ drv.curloc	= curloc ? curloc : drv.curloc; }							
							drv.psg_id = psg_id;
							drv.updated = new Date().getTime();
							drv.status = "WAIT";
							drv.save(function(err, response) {
								if(err) {
									res.json({ status: false , msg: "error", data: err });
								} else {
									PassengerModel.findOne(
										{ _id : psg_id }, 
										{ status:1, updated:1 },
										function(err, psg) {
											if(psg==null) {
												res.json({ status: false , msg: "This passenger is not available." });
											} else {											
												psg.drv_id = _id;
												psg.updated = new Date().getTime();
												psg.status = "WAIT";												
												psg.save(function(err, response) {
													if(err) {
														 res.json({ status: false , msg: "error", data: err  });
													} else {
														 res.json({ 
															//msg: "Update driver and passenger to ON => driver canceled passenger",
															status: true , 															
															data: { 
																drv_id: response.drv_id,
																status: response.status
															}
														});
													}
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
var _id = req.body._id			;
var device_id = req.body.device_id	;
var psg_id = req.body.psg_id		;
var curlng = req.body.curlng		;
var curlat = req.body.curlat		;
var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ _id: _id, device_id: device_id  }, 
		{ status:1, updated:1 },
		function(err, drv) {
		    	if(drv == null) { 
				//res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
				_driverAutoLogin(req,res);
		    	} else {	
				if(req.body.curlng) 	{ drv.curlng	= req.body.curlng ? req.body.curlng : drv.curlng; }
				if(req.body.curlat) 	{ drv.curlat	= req.body.curlat ? req.body.curlat : drv.curlat; }
				if(curloc) 		{ drv.curloc	= curloc ? curloc : drv.curloc; }		    		
				drv.psg_id = "";
				drv.updated = new Date().getTime();
				drv.status = "ON";
				drv.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error", data: err  });
					} else {
						PassengerModel.findOne(
							{ _id : psg_id }, 
							{ status:1, updated:1 },
							function(err, psg) {
							    	if(psg == null) { 
							    		//msg: "This passenger  does not exist. Please check the information."
									res.json({ status: false , msg: "error", data: err });
							    	} else {	
									psg.drv_id = "";
									psg.updated = new Date().getTime();
									psg.status = "ON";
									//console.log(req.body)
									psg.save(function(err, response) {
										if (err) { 
											res.json({ status: false, msg: "error" , data: err });
										} else {
											res.json({ 
												//msg: "Update driver and passenger to ON => driver canceled passenger",
												status: true , 												
												data: { status: response.status }
											});
										}
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
var _id  = req.body._id			;
var device_id = req.body.device_id	;
var psg_id = req.body.psg_id		;
var curlng = req.body.curlng		;
var curlat = req.body.curlat		;
var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1 },
		function(err, drv) {
		    	if(drv == null) { 
				//res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
				_driverAutoLogin(req,res);
		    	} else {	
				if(req.body.curlng) 	{ drv.curlng	= req.body.curlng ? req.body.curlng : drv.curlng; }
				if(req.body.curlat) 	{ drv.curlat	= req.body.curlat ? req.body.curlat : drv.curlat; }
				if(curloc) 		{ drv.curloc	= curloc ? curloc : drv.curloc; }
				drv.psg_id = psg_id;
				drv.updated = new Date().getTime();
				drv.status = "PICK";
				drv.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error", data: err  });
					} else {
						PassengerModel.findOne(
							{ _id : psg_id }, 
							{ status:1, updated:1 },
							function(err, psg) {
							    	if(psg == null) { 
									res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
							    	} else {	
									psg.drv_id = _id;
									psg.updated = new Date().getTime();
									psg.status = "PICK";									
									psg.save(function(err, response) {
										if (err) { 
											res.json({ status: false, msg: "error", data: err  });
										} else {
											res.json({ 
												//msg: "Update driver and passenger to PICK => driver picked passenger",
												status: true , 												
												data: { status: response.status }
											});
										}
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
var _id = req.body._id		;
var device_id = req.body.device_id	;
var psg_id = req.body.psg_id	;
var curlng = req.body.curlng	;
var curlat = req.body.curlat		;
var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	DriversModel.findOne(
		{ _id: _id , device_id: device_id }, 
		{ status:1, updated:1 },
		function(err, drv) {
		    	if(drv == null) { 
				//res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
				_driverAutoLogin(req,res);
		    	} else {
				if(req.body.curlng) 	{ drv.curlng	= req.body.curlng ? req.body.curlng : drv.curlng; }
				if(req.body.curlat) 	{ drv.curlat	= req.body.curlat ? req.body.curlat : drv.curlat; }
				if(curloc) 		{ drv.curloc	= curloc ? curloc : drv.curloc; }		    		
				drv.psg_id = "";
				drv.updated = new Date().getTime();
				drv.status = "ON";						
				drv.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error", data: err  });
					} else {						
						PassengerModel.findOne(
							{ _id : psg_id }, 
							{ status:1, updated:1 },
							function(err, psg) {
							    	if(psg == null) { 
									res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
							    	} else {	
									psg.drv_id = "";
									psg.updated = new Date().getTime();
									psg.status = "OFF";									
									psg.save(function(err, response) {
										if (err) { 
											res.json({ status: false});
										} else {
											res.json({ 
												//msg:  "Update driver to ON and passenger to OFF => driver dropped passenger" ,
												status: true ,
												data : { status: response.status }											
											});
										}
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
var _id = req.body._id			;
var device_id = req.body.device_id	;
var commtype = "DRV"			;
var topic = req.body.topic			;
var comment = req.body.comment	;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id },
		function(err, drivers) {
	    		if(drivers == null) { 
				//res.json({ status: false , msg: "Your phone number does not exist, please register"});
				_driverAutoLogin(req,res);
	    		} else {
	    			CommentModel.create({
				commtype: commtype	, 
				user_id: _id			,
				device_id: device_id		,
				topic: topic			,
				comment: comment
				},
    				function(err, response) {
					if (err) {
						res.send(err)
					} else {
						// "ขอขอบคุณสำหรับคำแนะนำ/ความคิดเห็นของท่าน ทางเราจะนำมาพิจารณาเพื่อพัฒนาบริการให้ดียิ่งขึ้นต่อไป"
						_getErrDetail('err010', function (errorDetail){
							res.json({ 
								status: true, 	
								msg: errorDetail
							});
						});
					}
				});
			}
		}
	);
};




exports.driverBrokenAdd = function(req, res) { 
var form = new formidable.IncomingForm();
var imgtype = "imgbroken";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" , data: err });
			} else {								
				_getErrDetail('err004', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail,
					});
				});				
			}
		} else {
			// check image type
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;    					
					DriversModel.aggregate( 
					{ $match: { _id:   new mongoose.Types.ObjectId(_id)  } } ,   // Aggregate not accept normal _id, has to convert type
					{ $project: { _id: 0, brokenpicCount: {$size: "$brokenpicture"} } } ,					
						function(err, result){
							xcount = result[0].brokenpicCount
							//console.log(result)
							/*
							res.json({ 
								status: true, 	
								msg: result,
								count: result[0].brokenpicCount
							});
							*/
							if ( xcount == 4 ) {
								res.json({ 
									status: false, 	
									msg: "Max upload images is 4"
								});
							} else {
								findandUpload(_id, device_id)
							}					
						}
					)
			} else {
				// kick out
				//res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });
				_getErrDetail('err005', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail
					});
				});				
			}
		}
	});

	function findandUpload(drvId, deviceId) {
	 	DriversModel.findOne(
			{ _id : drvId, device_id : deviceId }, 
			{ device_id:1, brokenpicture:1 },
			function(err, response) {				
				if (response == null) {	
					_driverCheckLogin( deviceId,drvId,res );
				} else {
					if(form) {
						var files = form.openedFiles;
						if(files) {
							var file = files[0];
							if(file) {
								var temp_path = file.path;
								var extension = path.extname(file.name);
								var new_location = 'uploadb/';

								newimgupload = drvId+'_'+imgtype+'_'+ranSMS()+extension;
								arrpix = response.brokenpicture;																
								arrpix.push(newimgupload);			// push arrary at the last

								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload ! a broken image > name : "+newimgupload)
										DriversModel.findOne(
											{ _id : drvId }, 
											{ status:1, updated:1 },
											function(err, drvupfile) {
												drvupfile.brokenpicture = arrpix;
												drvupfile.updated = new Date().getTime();
												drvupfile.save(function(err, response) {
													if(err) {
														res.json({  status: false ,  msg: "error" , data: err  });														
													} else {
														res.json({ 
															//msg: "success, your image has been uploaded.",
															status: true ,															
															data : { imgname: newimgupload }
														});														
													}
												});
											}
										);
									}
								});
							}
						}
					} else {
						console.log("do not have form")
						res.json({ status: false , msg: "no form" });
					}				
				}
			}
		);
	}
};




exports.driverBrokenEdit = function(req, res) {
var form = new formidable.IncomingForm();
var imgtype = "imgbroken";
var oldimg = "";
	// processing
	form.parse(req, function(err, fields, files) {
		if (typeof files.upload == 'undefined' && files.upload == null) {
			console.log("fail upload ! ; no image input")
			if(err) {
				res.json({ status: false , msg: "error" , data: err });
			} else {				
				//res.json({status: false , msg : 'Please put some images.'});
				_getErrDetail('err004', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail,
					});
				});					
			}
		} else {
			// check image type
			if(files.upload.type == 'image/jpeg' || files.upload.type == 'image/jpg' || files.upload.type == 'image/png' || files.upload.type == 'application/octet-stream') {
				_id = fields._id;
				device_id = fields.device_id;
				oldimg = fields.oldimg;
				findandUpload(_id, device_id);
			} else {
				// kick out
				//res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });
				_getErrDetail('err005', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail,
					});
				});				
			}
		}
	});

	function findandUpload(drvId, deviceId) {
	 	DriversModel.findOne(
			{ _id : drvId, device_id : deviceId }, 
			{ device_id:1, brokenpicture:1 },
			function(err, response) {
				if (response == null) {	
					_driverCheckLogin( deviceId,drvId,res );
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

								newimgupload = drvId+'_'+imgtype+'_'+ranSMS()+extension;
								arrpix = response.brokenpicture;																
								arrpix[arrpix.indexOf(oldimg)] = newimgupload ;

								fs.copy(temp_path, new_location+newimgupload, function(err) {				
									if (err) {
										console.log(err);
									} else {
										console.log("success upload !")
										DriversModel.findOne(
											{ _id : drvId }, 
											{ status:1, updated:1 },
											function(err, drvupfile) {
												drvupfile.brokenpicture = arrpix;
												drvupfile.updated = new Date().getTime();
												drvupfile.save(function(err, response) {
													if(err) {
														res.json({ status: false , msg: "error", data: err });
													} else {
														 res.json({ 
															//msg: "success, your image has been replaced." ,
															status: true ,															
															data : { imgname: newimgupload }
														});
													}
												});
											}
										);
									}
								});
							}
						}
					} else {
						console.log("do not have form")
						res.json({ status: false , msg: "no form" });
					}				
				}
			}
		);
	}
};




exports.driverBrokenDel = function(req, res) { 
var _id = req.body._id	;
var device_id = req.body.device_id	;
var oldimg = req.body.oldimg;
	DriversModel.findOne(
		{ _id: _id, device_id : device_id }, 
		{ device_id:1, brokenpicture:1 },
		function(err, response) {
			if (response == null) {	
				_driverAutoLogin(req,res);
			} else {
				arrpix = response.brokenpicture;	
				imgorder = arrpix.indexOf(oldimg)
				if(imgorder>0){
					arrpix.splice(imgorder, 1);	// delete array at immgorder	
				}				
				DriversModel.findOne(
					{ _id : _id }, 
					{ status:1, updated:1 },
					function(err, drv) {						
						drv.brokenpicture = arrpix;
						drv.updated = new Date().getTime();
						drv.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error", data: err });
							} else {
								var fs = require('fs');
								var filePath = 'uploadb/'+oldimg ; 
								fs.exists(filePath, function(exists) {
									if (exists) {
										fs.unlinkSync(filePath);
									}
								});
								//msg: "success, your image has been deleted."
								res.json({ 
									status: true 								
								});								
							}
						});
					}
				);
			}
		}
	);
};




exports.driverBrokenReport = function(req, res) { 
var _id = req.body._id			;
var device_id = req.body.device_id	;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id },
		{ status:1, updated:1 },
		function(err, drv) {
		    	if(drv == null) { 				
				_driverAutoLogin(req,res);
		    	} else {	    		
				if(req.body.brokenname) { drv.brokenname	= req.body.brokenname ? req.body.brokenname : drv.brokenname; }
				if(req.body.brokendetail)	 { drv.brokendetail	= req.body.brokendetail ? req.body.brokendetail : drv.brokendetail; }
				drv.status	= "BROKEN";
				drv.updated = new Date().getTime();
				drv.save(function(err, response) {
					if(err) {
						res.json({ 
							status: false , 
							msg: "Please input latitude and longitude." ,
							data: err
						});
					} else {
						res.json({ 
							//msg: "success, your broken report has benn sent." 
							status: true , 							
							data: { status: response.status }
						});
					}
				});
		    	}	
		}
	);
};




exports.driverBrokenCancel = function(req, res) { 
var _id = req.body._id				;
var device_id = req.body.device_id		;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1, brokenpicture:1  },
		function(err, response) {
			if (response == null) {					
				_driverAutoLogin(req,res);
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
					{ _id : _id, device_id : device_id }, 
					{ status:1, updated:1 },
					function(err, drv) {						
						drv.brokenname = [];
						drv.brokendetail = "";
						drv.brokenpicture = [];
						drv.status = "ON";
						drv.updated = new Date().getTime();
						drv.save(function(err, result) {
							if(err) {
								res.json({ status: false, msg: "error", data: err });
							} else {
								res.json({ 
									//msg: "success, your car is back to available." 
									status: true , 									
									data: { status: result.status }									
								});
							}
						});
					}
				);
			}
		}
	);
};




exports.drivertestSocket = function(req, res) { 
	var io = require('socket.io').listen(80);

	io.sockets.on('connection', function (socket) {
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});

	res.json({ 
		//msg: "success, your car is back to available." 
		status: true , 
		msg: ""
	});
};




exports.drivergotmsg = function(req, res) {
var _id = req.body._id				;
var device_id = req.body.device_id		;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1 },
		function(err, drv) {
			if (drv == null) {
				_driverAutoLogin(req,res);
		    	} else {					
				drv.msgstatus = "OLD";
				drv.save(function(err, result) {
					if(err) {
						res.json({ status: false ,   msg: "error", data: err  });
					} else {
						res.json({ 
							status: true ,  							
							data : {	status: drv.status }
						});
					}
				});
			}
		}
	);
};