////////////////////////////////////
// TaxiBeam API for Driver
// version : 1.0.2
// Date August 13, 2015 
// Created by Hanzen@BRET
////////////////////////////////////
var config = require('../../config/func').production;
var crypto = require('crypto');

var Url = require('url') ;
var mongoose  = require('mongoose') ;
var PassengerModel  = mongoose.model('PassengerModel') ;
var JoblistModel = mongoose.model('JoblistModel') ;
var ParkinglotModel = mongoose.model('ParkinglotModel') ;
var ParkingqueueModel = mongoose.model('ParkingqueueModel') ;
var CallcenterpsgModel = mongoose.model('CallcenterpsgModel') ;
var UserModel  = mongoose.model('UserModel') ;
var DriversModel = mongoose.model('DriversModel') ;
var DrvLogModel = mongoose.model('DrvLogModel') ;
var CommentModel  = mongoose.model('CommentModel') ;
var AnnounceModel	 = mongoose.model('AnnounceModel') ;
var EmgListModel = mongoose.model('EmgListModel') ;
var ErrorcodeModel =  mongoose.model('ErrorcodeModel') ;
var DrvgetstatuslogModel = mongoose.model('DrvgetstatuslogModel');
var HotelsModel  = mongoose.model('HotelsModel');
var JoblisthotelModel = mongoose.model('JoblisthotelModel');
var Lk_garageModel = mongoose.model('Lk_garageModel') ;

// for upload file
var path = require('path') ;
var formidable = require('formidable') ;
var util = require('util') ;
var fs = require('fs-extra') ;
var qt = require('quickthumb') ;
var http = require('http') ;
var qs = require('querystring') ;
var ios = require('socket.io') ;


function _joblistupdate (job_id, drv_id, drv_device_id, cgroup, drv_name, drv_phone, drv_carplate, action, cwhere){  
  JoblistModel.findOne(
    { job_id : job_id },    
    function(err, job){
          if(job == null) {
            console.log (' no job id')
          } else {  
        switch(action) {
          case "datedrvwait":
	          job.drv_id = drv_id ;
	          job.drv_device_id = drv_device_id ;
	          job.drv_name = drv_name ;
	          job.drv_phone = drv_phone ;
	          job.drv_carplate = drv_carplate ;
	          job.cgroup = cgroup ;
	          job.datedrvwait = new Date().getTime() ;
          break;
          case "datedrvpick":
          	job.datedrvpick = new Date().getTime();
          break; 
          case "datedrvdrop":
          	job.datedrvdrop = new Date().getTime();
          break; 
          case "datedrvcancel":
	          job.datedrvcancel = new Date().getTime();
	          job.drvcancelwhere = cwhere ;
          break;   
        }   
        job.save(function(err, response) {
          if (err) {
            console.log(err)
          } else {
            console.log(' update job list ')
          }
        });
      }
    }
  );
}

	
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
var device_id = req.body.device_id		;
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


// NOTE ****************************** for simulate (bot) driver
exports.all = function(req, res) {
	var driver = DriversModel.find({});
	if(req.body.number > 0) {
		driver.limit(req.body.number);
	}
	driver.exec(function(err, drivers) {
		res.send(drivers);
	});
};


// NOTE *******************************  start service for DRIVER
exports.checkIconURL = function(req,res){
	Lk_garageModel.find(
		{},
		{ _id:0, cgroup:1, fullname:1, iconurl:1, version:1, phone:1, cgroupname:1, cprovincename:1 },
		function(err, result){
			if(result==0){
				res.json({
					status: false,
					msg: "No iconurl"
				})
			} else {
				res.json({
					status: true,
					msg: "This is iconurl",
					data: result
				})
			}
		}
	)
};




exports.ChangePWDonly = function(req, res){
var _id = req.body._id 				;
var device_id = req.body.device_id		;
var username = req.body.username		;
var otp_number = req.body.otp_number	;
var newpassword = req.body.password	;
username = username.toLowerCase();
	DriversModel.findOne(
		{ username : username }, 		
		function(err, drv){	    		
		    	if(drv == null) {		    		
				_getErrDetail('err014', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail,
					});
				});
		    	} else {	    
		    		if ( drv.smsconfirm == otp_number ) {
					drv.password = newpassword;
					drv.updated = new Date().getTime();
					drv.save(function(err, response) {
						if (err) {
							_getErrDetail('err099', function (errorDetail){
								res.json({ 
									status: false, 	
									msg: errorDetail,
								});
							});
						} else {							
							res.json({ 
								status: true, 								
								data: { 									
									_id: response._id,    
									device_id: response.device_id, 
									fname: response.fname,
									lname: response.lname,
									phone: response.phone,
									citizenid: response.citizenid,
									taxiID: response.taxiID,
									address: response.address,
									province: response.province,
									district: response.district,
									tambon: response.tambon,
									zipcode: response.zipcode,
									english: response.english,
									carplate: response.carplate,
									cartype: response.cartype,
									carcolor: response.carcolor,
									outbound: response.outbound,
									carryon: response.carryon,
									imgface: response.imgface,
									imglicence: response.imglicence,
									imgcar: response.imgcar,
									allowpsgcontact: response.allowpsgcontact,
									carreturn: response.carreturn,
									carreturnwhere: response.carreturnwhere,
									status: response.status
								} 
							});
						}
					});
		    		} else {		    			
					_getErrDetail('err013', function (errorDetail){
						res.json({ 
							status: false, 	
							msg: errorDetail,
						});
					});
		    		}
			}
		}
	);	

};




exports.driverAutoLogin = function(req, res) {
	_driverAutoLogin(req,res);
};




exports.driverLogin = function(req, res) {
var username = req.body.username	;
var password = req.body.password	;
var device_id =  req.body.device_id	;

username = username.toLowerCase(); 

//console.log('MD5-1234='+MD5("1234"))
	DriversModel.findOne(
		{ username: username }, 
		{ _id:1, device_id:1, username:1, password:1, cgroup:1, citizenid:1, fname:1, lname:1, allowpsgcontact:1, taxiID:1, phone:1, carplate:1, address:1, province:1, district:1, tambon:1, zipcode:1, cartype:1, carcolor:1, outbound:1, carryon:1, english:1, imgface:1, imglicence:1, imgcar:1 },
		function(err, drv){	    		
		    	if(drv == null) { 		    		
		    		// This phone(IMEI) have never been in the system, send to registration page.
				res.json({ 
					status: false , 
					msg: "ไม่พบชื่อผู้ใช้งานในระบบ\n\nโปรดลงทะเบียนใหม่"
				});
		    	} else {	    
		    		if ( drv.password == password ) {
					drv.device_id = device_id;
					drv.updated = new Date().getTime();
					drv.save(function(err, response) {
						if (err) {
							_getErrDetail('err099', function (errorDetail){
								res.json({ 
									status: false, 	
									msg: errorDetail,
								});
							});
						} else {	
							res.json({ 
								status: true, 								
								data: { 									
									_id: response._id,    
									device_id: response.device_id, 
									cgroup: response.cgroup,
									fname: response.fname,
									lname: response.lname,
									phone: response.phone,
									allowpsgcontact: response.allowpsgcontact,
									carreturn: response.carreturn,
									carreturnwhere: response.carreturnwhere,
									citizenid: response.citizenid,
									taxiID: response.taxiID,
									address: response.address,
									province: response.province,
									district: response.district,
									tambon: response.tambon,
									zipcode: response.zipcode,
									english: response.english,
									carplate: response.carplate,
									cartype: response.cartype,
									carcolor: response.carcolor,
									outbound: response.outbound,
									carryon: response.carryon,
									imgface: response.imgface,
									imglicence: response.imglicence,
									imgcar: response.imgcar,
									status: response.status
								} 
							});
						}
					});
		    		} else {
		    			// in case of change mobile owner, send to update page to update driver info
					res.json({ 						
						status: false , 
						msg: "รหัสผ่านไม่ถูกต้อง!"			
					});
		    		}
			}
		}
	);
};




exports.driverRegister = function(req, res) {
// check only IMEI or Apple ID
console.log ( ' register na ')
var device_id = req.body.device_id;
var username = req.body.username;
var citizenid = req.body.citizenid;
username = username.toLowerCase(); 
	DriversModel.findOne(
		{ citizenid : citizenid }, 
		function(err, drv1) {
		    	if(drv1 == null) { 
		    		console.log ( ' citizenid unique ')
		    		// valid citizenid, so chekc user name
				DriversModel.findOne(
					{ username : username }, 
					function(err, drv2) {	    	
					    	if(drv2 == null) { 
					    		console.log ( ' create driver ')
					    		// valid username, so check device_id
							/*
							DriversModel.findOne(
								{ device_id : device_id }, 
								function(err, drv3) {	    	
								    	if(drv3 == null) { 

								    	} else {
									
									}
								}
							);
							*/
					    		DriversModel.create({		    			
								device_id: device_id,
								username: username,
								password: req.body.password,
								fname: req.body.fname,
								lname: req.body.lname,
								phone: req.body.phone,
								allowpsgcontact: req.body.allowpsgcontact,
								citizenid: req.body.citizenid,
								taxiID: req.body.taxiID,
								address: req.body.address,
								province: req.body.province,
								district: req.body.district,
								tambon: req.body.tambon,
								zipcode: req.body.zipcode,
								english: req.body.english,
								carplate : req.body.carplate,
								carplate_formal : req.body.carplate,
								carprovince : req.body.carprovince,
								cartype : req.body.cartype,
								carcolor : req.body.carcolor,
								outbound : req.body.outbound,
								carryon : req.body.carryon,
								active : "Y",
								status : "PENDING",
								msgphone: "" ,
								msgnote: "" ,
								msgstatus: "" ,
								psg_curaddr: "" ,
								psg_destination: "",
								psg_detail: "" ,
								jobtype: "" ,					
								appversion : config.mobileappversion ,
								created:	new Date().getTime(),
								updated:	new Date().getTime(),
								expdategarage:new Date().getTime(),
								expdateapp: 	new Date().getTime() + (7776000000*4),	//  7776000000 = 3 months		
								smsconfirm: ranSMS(),
								updateprofilehistory : {
									register_data: req.body ,
									created: new Date()
									}
								},
								function(err, response) {
									if (err) { 
										res.json({ status: false , msg: err, data: err });
									} else {
										res.json({ 
											status: true , 								
											msg: "new",
											data : { 
												_id: response._id,
												status: response.status,
												allowpsgcontact: response.allowpsgcontact	
											} 
										});
									} 
								});
					    	} else {
					    		console.log ( ' username  dup ')
							DriversModel.findOne(
								{ device_id: device_id }, 
								{ _id:1, device_id:1, fname:1, lname:1, allowpsgcontact:1, citizenid:1, taxiID:1, address:1, province:1, district:1, tambon:1, zipcode:1, phone:1, english:1, carplate:1, carplate_formal:1, carprovince:1, cartype:1, carcolor:1, outbound:1, carryon:1, status:1, updateprofilehistory:1 },
								function(err, drv) {
									if (drv == null) {				
										res.json({ 
											status: false , 
											msg: "ชื่อผู้ใช้งานนี้ มีผู้ใช้งานแล้ว กรุณาตรวจสอบ หรือสมัครใหม่" 
										});
							    		} else {
										/* update drv by _id */				
										drv.updateprofilehistory.push({
											update_data: req.body ,
											created: new Date()
										});

										if(req.body.username) { drv.username  = username ? username : drv.username; }
										if(req.body.password) 	{ drv.password  = req.body.password ? req.body.password : drv.password; }
										if(req.body.fname) 	{ drv.fname  = req.body.fname ? req.body.fname : drv.fname; }
										if(req.body.lname) 	{ drv.lname  = req.body.lname ? req.body.lname : drv.lname; }
										if(req.body.phone) 	{ drv.phone  = req.body.phone ? req.body.phone : drv.phone; }
										if(req.body.allowpsgcontact) 	{ drv.allowpsgcontact  = req.body.allowpsgcontact ? req.body.allowpsgcontact : drv.allowpsgcontact; }				
										if(req.body.taxiID) 	{ drv.taxiID  = req.body.taxiID ? req.body.taxiID : drv.taxiID; }
										if(req.body.address) 	{ drv.address  = req.body.address ? req.body.address : drv.address; }
										if(req.body.province) 	{ drv.province  = req.body.province ? req.body.province : drv.province; }
										if(req.body.district) 	{ drv.district  = req.body.district ? req.body.district : drv.district; }
										if(req.body.tambon) 	{ drv.tambon  = req.body.tambon ? req.body.tambon : drv.tambon; }
										if(req.body.zipcode) 	{ drv.zipcode  = req.body.zipcode ? req.body.zipcode : drv.zipcode; }
										if(req.body.english) 	{ drv.english  = req.body.english ? req.body.english : drv.english; }
										if(req.body.carplate) 	{ drv.carplate = req.body.carplate ? req.body.carplate : drv.carplate; }
										if(req.body.carplate_formal) 	{ drv.carplate_formal = req.body.carplate_formal ? req.body.carplate_formal : drv.carplate_formal; }
										if(req.body.carprovince) 	{ drv.carprovince = req.body.carprovince ? req.body.carprovince : drv.carprovince; }
										if(req.body.cartype) 	{ drv.cartype  = req.body.cartype ? req.body.cartype : drv.cartype; }
										if(req.body.carcolor) 	{ drv.carcolor = req.body.carcolor ? req.body.carcolor : drv.carcolor; }
										if(req.body.outbound) 	{ drv.outbound = req.body.outbound ? req.body.outbound : drv.outbound; }
										if(req.body.carryon) 	{ drv.carryon = req.body.carryon ? req.body.carryon : drv.carryon; }				
										drv.updated = new Date().getTime();
										drv.save(function(err, response) {
											if(err) {
												res.json({ status: false, msg: "error" , data: err });
											} else {
												res.json({ 
													status: true , 								
													msg: "new",
													data : { 
														_id: response._id,
														status: response.status,
														allowpsgcontact: response.allowpsgcontact	
													} 
												});
											}
										});
									}
								}
							);
						}
					}
				);
		    	} else {
		    		console.log ( ' citizenid  dup ')
				DriversModel.findOne(
					{ citizenid : citizenid , device_id: device_id }, 
					{ _id:1, device_id:1, fname:1, lname:1, allowpsgcontact:1, citizenid:1, taxiID:1, address:1, province:1, district:1, tambon:1, zipcode:1, phone:1, english:1, carplate:1, carplate_formal:1, carprovince:1, cartype:1, carcolor:1, outbound:1, carryon:1, status:1, updateprofilehistory:1 },
					function(err, drv) {
						if (drv == null) {				
							res.json({ 
								status: false , 
								msg: "หมายเลขบัตรประชาชนนี้ มีผู้ใช้งานแล้ว กรุณาตรวจสอบ หรือสมัครใหม่" 
							});
				    		} else {
				    			console.log ( ' device_id dup ')
							/* update drv by _id */				
							drv.updateprofilehistory.push({
								update_data: req.body ,
								created: new Date()
							});
							if(req.body.username) { drv.username  = username ? username : drv.username; }
							if(req.body.password) 	{ drv.password  = req.body.password ? req.body.password : drv.password; }							
							if(req.body.fname) 	{ drv.fname  = req.body.fname ? req.body.fname : drv.fname; }
							if(req.body.lname) 	{ drv.lname  = req.body.lname ? req.body.lname : drv.lname; }
							if(req.body.phone) 	{ drv.phone  = req.body.phone ? req.body.phone : drv.phone; }
							if(req.body.allowpsgcontact) 	{ drv.allowpsgcontact  = req.body.allowpsgcontact ? req.body.allowpsgcontact : drv.allowpsgcontact; }				
							if(req.body.taxiID) 	{ drv.taxiID  = req.body.taxiID ? req.body.taxiID : drv.taxiID; }
							if(req.body.address) 	{ drv.address  = req.body.address ? req.body.address : drv.address; }
							if(req.body.province) 	{ drv.province  = req.body.province ? req.body.province : drv.province; }
							if(req.body.district) 	{ drv.district  = req.body.district ? req.body.district : drv.district; }
							if(req.body.tambon) 	{ drv.tambon  = req.body.tambon ? req.body.tambon : drv.tambon; }
							if(req.body.zipcode) 	{ drv.zipcode  = req.body.zipcode ? req.body.zipcode : drv.zipcode; }
							if(req.body.english) 	{ drv.english  = req.body.english ? req.body.english : drv.english; }
							if(req.body.carplate) 	{ drv.carplate = req.body.carplate ? req.body.carplate : drv.carplate; }
							if(req.body.carplate_formal) 	{ drv.carplate_formal = req.body.carplate_formal ? req.body.carplate_formal : drv.carplate_formal; }
							if(req.body.carprovince) 	{ drv.carprovince = req.body.carprovince ? req.body.carprovince : drv.carprovince; }
							if(req.body.cartype) 	{ drv.cartype  = req.body.cartype ? req.body.cartype : drv.cartype; }
							if(req.body.carcolor) 	{ drv.carcolor = req.body.carcolor ? req.body.carcolor : drv.carcolor; }
							if(req.body.outbound) 	{ drv.outbound = req.body.outbound ? req.body.outbound : drv.outbound; }
							if(req.body.carryon) 	{ drv.carryon = req.body.carryon ? req.body.carryon : drv.carryon; }				
							drv.updated = new Date().getTime();
							drv.save(function(err, response) {
								if(err) {
									res.json({ status: false, msg: "error" , data: err });
								} else {
									res.json({ 
										status: true , 								
										msg: "new",
										data : { 
											_id: response._id,
											status: response.status,
											allowpsgcontact: response.allowpsgcontact	
										} 
									});
								}
							});
						}
					}
				);
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
								var new_location = '../upload_drivers/';
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
								var new_location = '../upload_drivers/';
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
												if ( drvupfile.status == "" ) {
												drvupfile.status = "PENDING";	
												}												
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
								var new_location = '../upload_drivers/';
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




exports.sendSMSUP = function (req, res) { 
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
var citizenid = req.body.citizenid	;

	DriversModel.findOne(
		{ citizenid : citizenid }, 
		{ _id:1, status:1, phone:1, smsconfirm:1, username:1 , password:1 },
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
				_getErrDetail('err012', function (errorDetail){
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
							  "sender"	: config.smssender ,
							  "to"		: smsphone,							  
							  "msg"	: " ชื่อผู้ใช้งาน ของคุณคือ  "+ response.username +"  เลข OTP ของคุณคือ "+ gensms
						});
						var options = {
							hostname: config.smshostname ,
							port: config.smshostport ,
							path: config.smshostpath , 
							method: config.smshostmethod ,
							headers: {								
								'Content-Type': 'application/json; charset=utf-8',
								'Content-Length': Buffer.byteLength(postData)
							}
						};
						var request = https.request(options, function(response){
							var body = '';
							response.on('data', function(d) {
								body += d;
							});
							response.on('end', function() {
								var parsed = JSON.parse(body);	
								//console.log(parsed)							
								//res.json(parsed);								
								if (parsed.SendMessageResult.ErrorCode==1) {
									//msg: "success, sms has been sent.",
									res.json({ 
										status: true,
										msg: "SMS sent Successful"								
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




exports.driverApproved = function(req, res) {
var _id	= req.body._id			;
var device_id = req.body.device_id		;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id}, 
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
					drv.status = "ACTIVE";
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
		{ _id: _id, device_id: device_id }, 
		{ device_id:1, fname:1, lname:1, allowpsgcontact:1, citizenid:1, taxiID:1, address:1, province:1, district:1, tambon:1, zipcode:1, phone:1, english:1, carplate:1, carplate_formal:1, cartype:1, carcolor:1, outbound:1, carryon:1, status:1, updateprofilehistory:1 },
		function(err, drv) {
			if (drv == null) {				
				_driverAutoLogin(req,res);
	    		} else {
				/* update drv by _id */				
				drv.updateprofilehistory.push({
					update_data: req.body ,
					created: new Date()
				});
				if(req.body.fname) 	{ drv.fname  = req.body.fname ? req.body.fname : drv.fname; }
				if(req.body.lname) 	{ drv.lname  = req.body.lname ? req.body.lname : drv.lname; }
				//if(req.body.citizenid) 	{ drv.citizenid  = req.body.citizenid ? req.body.citizenid : drv.citizenid; }				
				if(req.body.phone) 	{ drv.phone  = req.body.phone ? req.body.phone : drv.phone; }
				if(req.body.allowpsgcontact) 	{ drv.allowpsgcontact  = req.body.allowpsgcontact ? req.body.allowpsgcontact : drv.allowpsgcontact; }				
				if(req.body.taxiID) 	{ drv.taxiID  = req.body.taxiID ? req.body.taxiID : drv.taxiID; }
				if(req.body.address) 	{ drv.address  = req.body.address ? req.body.address : drv.address; }
				if(req.body.province) 	{ drv.province  = req.body.province ? req.body.province : drv.province; }
				if(req.body.district) 	{ drv.district  = req.body.district ? req.body.district : drv.district; }
				if(req.body.tambon) 	{ drv.tambon  = req.body.tambon ? req.body.tambon : drv.tambon; }
				if(req.body.zipcode) 	{ drv.zipcode  = req.body.zipcode ? req.body.zipcode : drv.zipcode; }
				if(req.body.english) 	{ drv.english  = req.body.english ? req.body.english : drv.english; }
				if(req.body.carplate) 	{ drv.carplate = req.body.carplate ? req.body.carplate : drv.carplate; }
				if(req.body.carplate_formal) 	{ drv.carplate_formal = req.body.carplate_formal ? req.body.carplate_formal : drv.carplate_formal; }
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
							status: true ,
							data: result
						});
					}
				});
			}
		}
	);
};




exports.driverReturnCar = function(req, res) {
var _id = req.body._id					;
var device_id = req.body.device_id				;
var nowdate = new Date().getTime()			;
var carreturn = req.body.carreturn 				;
var carreturnwhere = req.body.carreturnwhere 		;

	DriversModel.findOne(
		{ _id: _id, device_id: device_id },  
		{ _id:1, device_id:1, carreturn:1, carreturnwhere:1, status:1  },
		function(err, drv) {
			if (drv == null) {					
				_driverAutoLogin(req,res);
		    	} else {	
				if(req.body.carreturn) 		{ drv.carreturn = req.body.carreturn ? req.body.carreturn : drv.carreturn; }
				if(req.body.carreturnwhere) 	{ drv.carreturnwhere = req.body.carreturnwhere ? req.body.carreturnwhere : drv.carreturnwhere; }								
				drv.updated = new Date().getTime();
				drv.save(function(err, result) {
					if(err) {
						res.json({ status: false ,  msg: "error" , data: err  });
					} else {						
						res.json({ 							
							status: true , 							
							data : drv							
						});
					}
				});
			}
		}
	);
};




exports.driverGetStatus = function(socket){
	return function(req, res) {		
		//console.log(  'xxxxxxx ' +  ios )
		//ios.test1() ;
		//ios.socket.emit('message', { message: 'welcome to the teksi' }); 
		//var io = require('socket.io').listen(1115);
		// var  io = io ? io : require('socket.io').listen(1115);
		var _id = req.body._id			;
		var device_id = req.body.device_id	;
		var nowdate = new Date().getTime()	;
		var cgroup = req.body.cgroup		;
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

		DriversModel.findOne(
			{ _id: _id, device_id: device_id },  
			{ _id:1, device_id:1, cgroup:1, curlng:1, curlat:1, psg_id:1, status:1,  active:1, msgphone: 1, msgnote: 1, msgstatus: 1, curloc: 1, jobtype:1,  expdategarage:1, moneygarage:1, expdateapp:1, moneyapp:1 , psg_detail: 1, psg_destination: 1, psg_curaddr:1, appversion:1, useappfree:1, useappfreemsg:1 },
			function(err, drv) {

				if (drv == null) {					
					_driverAutoLogin(req,res);
			    	} else {	
			    		if(drv.cgroup) { // Get cgroup of Driver
			    			//console.log( drv.cgroup )		    			
						ParkinglotModel.find(
							{ cgroup: drv.cgroup },
							{ parkinglot:1, curloc:1, radian:1 }, 
							function(err,parkinglot){													    			

					    			if(drv.status == "DPENDING" && drv.msgstatus == "NEW") {					    				
					    				_drvdpendinglog(_id, device_id, drv.psg_id);
					    			}

								if(drv.expdategarage) {
									expdategarage = new Date(drv.expdategarage).getTime();
								} else {
									expdategarage = nowdate;
								}
								if(drv.expdateapp) {
									expdateapp = new Date(drv.expdateapp).getTime();
								} else {
									expdateapp = nowdate;
								}

								timegarageleft = expdategarage  - nowdate;
								timeappleft = expdateapp  - nowdate ;

								if(timegarageleft){
									timegarageleft = timegarageleft;
								} else {
									timegarageleft = 0;
								}

								if(timeappleft){
									timeappleft = timeappleft;
								} else {
									timeappleft = 0;
								}

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
										socket.emit("driverGetStatusSocketOn", result);
										socket.of('/'+drv.cgroup).emit("driverGetStatus", result);
										res.json({ 
											//msg: "success, there is your status.", 
											status: true , 
											timegarageleft : timegarageleft ,
											timeappleft : timeappleft , 
											appversion : config.mobileappversion ,
											data : drv, 
											parkinglot: parkinglot						
										});
									}
								});


							}
						);					
			    		} else {			    			

			    			if(drv.status == "DPENDING" && drv.msgstatus == "NEW") {			    			
			    				_drvdpendinglog(_id, device_id, drv.psg_id);
			    			}

						if(drv.expdategarage) {
							expdategarage = new Date(drv.expdategarage).getTime();
						} else {
							expdategarage = nowdate;
						}
						if(drv.expdateapp) {
							expdateapp = new Date(drv.expdateapp).getTime();
						} else {
							expdateapp = nowdate;
						}

						timegarageleft = expdategarage  - nowdate;
						timeappleft = expdateapp  - nowdate ;

						if(timegarageleft){
							timegarageleft = timegarageleft;
						} else {
							timegarageleft = 0;
						}

						if(timeappleft){
							timeappleft = timeappleft;
						} else {
							timeappleft = 0;
						}

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
								socket.emit("driverGetStatusSocketOn", result);
								socket.of('/'+drv.cgroup).emit("driverGetStatus", result);	
								res.json({ 
									//msg: "success, there is your status.", 
									status: true , 
									timegarageleft : timegarageleft ,
									timeappleft : timeappleft , 
									appversion : config.mobileappversion ,
									data : drv
								});
							}
						});

			    		}

				}
			}
		);
	};

};	




function _drvdpendinglog(_id, device_id, psg_id){
	console.log( ' _drvdpendinglog keep log ' )
	DrvgetstatuslogModel.create({		    			
		drv_id: _id, 
		device_id: device_id,
		psg_id: psg_id
	})
};




exports.driverGetByID = function(req, res) {
var _id = req.body._id	;
	DriversModel.findOne(	
		{ _id : _id, active: "Y"}, 
		{ _id:1, fname:1, lname:1, phone:1, allowpsgcontact: 1,  carreturn:1, carreturnwhere:1, english:1, carplate:1, carplate_formal:1, cartype:1, carcolor:1, outbound:1, carryon:1, curlat:1, curlng:1, curloc:1, imgface:1, imgcar:1, imglicence:1 , psg_id:1, status:1, cgroup:1, cgroupname:1, cprovincename:1  },
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
				});
			}
		}
	);
};	




exports.driverchangeOnOff = function(req, res) {
var _id = req.body._id			                 ;
var device_id = req.body.device_id	      ;
	DriversModel.findOne(
		{ _id : _id, device_id : device_id }, 
		{ device_id:1 , carreturn:1 , carreturnwhere:1 , status:1 },
		function(err, drv) {
			if (drv == null) {
				_driverAutoLogin(req,res);
		    	} else {							
				if(req.body.status) 	{ drv.status 	= req.body.status ? req.body.status : drv.status; }
				drv.psg_id = "";
				drv.updated = new Date().getTime();
				drv.save(function(err, result) {
					if(err) {
						res.json({ status: false ,   msg: "error", data: err  });
					} else {
						res.json({ 
							status: true ,  							
							data : {	
								status: drv.status ,
								carreturn: drv.carreturn,
								carreturnwhere: drv.carreturnwhere
							}
						});
					}
				});
			}
		}
	);
};




exports.driverSearchPassenger = function(req, res) {
var _id = req.body._id		;
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
		radian = config.drvsearchpsgradian;
	}	
	if (typeof amount == 'undefined' && amount == null) {
		amount = config.drvsearchpsgamount;
	}
	
	DriversModel.findOne(
		{ _id: _id, device_id: device_id }, 
		{ status:1 , cartype:1 },
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
						JoblisthotelModel.find(
							{ 
								curloc:  { 
									$near: {
										$geometry: {
											type: "Point" ,
											coordinates: curloc
										} , 
										$maxDistance: radian 							
									}
								}
								, status : "ON"
								, favcartype: { $in: [ [] , drv.cartype] } 								
							},
							{ _id:1, device_id:1,  job_id:1, psgtype:1, createdjob:1, phone:1, createdvia:1, curaddr:1, curlat:1, curlng:1, curloc:1, destination:1, tips:1, detail:1, job_id:1, drv_id:1, jobtype:1  },
							{limit : amount},
							function(err,hotellist){
								//console.log('hotellist = '+hotellist)								
								if(hotellist == 0){
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
											}
											, status : "ON"
											, favcartype: { $in: [ [] , drv.cartype] } 								
										},
										{ _id:1, device_id:1,  job_id:1, psgtype:1, createdjob:1, phone:1, createdvia:1, curaddr:1, curlat:1, curlng:1, curloc:1, destination:1, tips:1, detail:1, job_id:1, drv_id:1, jobtype:1  },
										{limit : amount},
										function(err,psglist){
											// Donot forget to create 2d Index for drivers collection : curloc!!!!	- > not working  user 2d sphere instead
											if(psglist == 0){
												res.json({										
													status: false,
													drvstatus: drv.status,	
													msg: "No data"
												});									
											} else {
												res.json({
													//msg: "This is passenger list", 
													status: true,
													mgs: "data passenger joblist",
													drvstatus: drv.status,									
													data: psglist,
													datahotel: hotellist
												});
												//Specifies a point for which a geospatial query returns the documents from nearest to farthest.
											}
										}
									);
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
											}
											, status : "ON"
											, favcartype: { $in: [ [] , drv.cartype] } 								
										},
										{ _id:1, device_id:1,  job_id:1, psgtype:1, createdjob:1, phone:1, createdvia:1, curaddr:1, curlat:1, curlng:1, curloc:1, destination:1, tips:1, detail:1, job_id:1, drv_id:1, jobtype:1  },
										{limit : amount},
										function(err,psglist){
											// Donot forget to create 2d Index for drivers collection : curloc!!!!	- > not working  user 2d sphere instead
											if(psglist == 0){
												res.json({
													//msg: "This is passenger list", 
													status: true,
													mgs: "data : hotel joblist",
													drvstatus: drv.status,	
													data: psglist,
													datahotel: hotellist
												});								
											} else {
												res.json({
													//msg: "This is passenger list", 
													status: true,
													mgs: "data hotel and passenger joblist",
													drvstatus: drv.status,									
													data: psglist,
													datahotel: hotellist
												});
												//Specifies a point for which a geospatial query returns the documents from nearest to farthest.
											}
										}
									);
								}
							}
						);
					}
				});
			}
		}
	);
};




exports.driverSearchHotel = function(req, res) {
var _id = req.body._id		;
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
		radian = config.drvsearchpsgradian;
	}	
	if (typeof amount == 'undefined' && amount == null) {
		amount = config.drvsearchpsgamount;
	}
	
	DriversModel.findOne(
		{ _id: _id, device_id: device_id }, 
		{ status:1 , cartype:1 },
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
						JoblisthotelModel.find(
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
								}
								, status : "ON"
								, favcartype: { $in: [ [] , drv.cartype] } 								
							},
							{ _id:1, device_id:1,  job_id:1, psgtype:1, createdjob:1, phone:1, createdvia:1, curaddr:1, curlat:1, curlng:1, curloc:1, destination:1, tips:1, detail:1, job_id:1, drv_id:1, jobtype:1  },
							{limit : amount},
							function(err,hotellist){
								// Donot forget to create 2d Index for drivers collection : curloc!!!!	- > not working  user 2d sphere instead
								if(hotellist == 0){
									res.json({										
										status: false,
										drvstatus: drv.status,	
										msg: "No data"
									});									
								} else {
									res.json({
										//msg: "This is passenger list", 
										status: true, 	
										drvstatus: drv.status,									
										data: hotellist
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




exports.driverAcceptCall = function(socket){	
	return function(req, res) {	
	var _id = req.body._id			          ;	
	var device_id = req.body.device_id			;
	var psg_id = req.body.psg_id		      	;
	var curlng = req.body.curlng		     		;
	var curlat = req.body.curlat		      		;
	var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];

		PassengerModel.findOne(
			{ _id : psg_id, status: "ON" },
			{ status: 1, job_id:1 , psgtype:1 },
			function(err,result) {				
				if(result==null) {
					//res.json({ status: false , msg:  "ผู้โดยสารท่านนี้ได้ถูกจองไปแล้ว กรุณาเลือกผู้โดยสารท่านใหม่", data:err });
					_getErrDetail('err008', function (errorDetail){
						res.json({ 
							status: false, 	
							msg: errorDetail
						});
					});				
				} else {
					DriversModel.findOne(
						{  _id: _id, device_id: device_id }, 
						{ status:1, updated:1, fname:1, lname:1, phone:1, carplate:1, cgroup:1 },
						function(err, drv) {
							if(drv==null) {
								//res.json({ status: false , msg: "Your phone does not exist. Please register and try again." });
								_driverAutoLogin(req,res);
							} else {							
								drv.psg_id = psg_id;
								drv.updated = new Date().getTime();
								drv.status = "WAIT";
								drv.save(function(err, responsedrv) {
									if(err) {
										res.json({ status: false , msg: "error", data: err });
									} else {
										PassengerModel.findOne(
											{ _id : psg_id }, 
											{ status:1, updated:1, job_id:1, _id:1, device_id:1, psgtype:1 },
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
															socket.emit("PassengerSocketOn", response);	
	                                                                              							_joblistupdate ( psg.job_id, _id, device_id , drv.cgroup, drv.fname+' '+drv.lname , drv.phone, drv.carplate, 'datedrvwait', '');
															 res.json({ 
																//msg: "Update driver and passenger to ON => driver canceled passenger",
																status: true , 															
																data: response
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
}




exports.driverAcceptHotel = function(socket){	
	return function(req, res) {	
	var _id = req.body._id			          ;	
	var device_id = req.body.device_id			;
	var psg_id = req.body.psg_id		      	;
	var curlng = req.body.curlng		     		;
	var curlat = req.body.curlat		      		;
	var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
		JoblisthotelModel.findOne(
			{ _id : psg_id, status: "ON" },
			{ status: 1, job_id:1 , psgtype:1 },
			function(err,result) {				
				if(result==null) {
					//res.json({ status: false , msg:  "ผู้โดยสารท่านนี้ได้ถูกจองไปแล้ว กรุณาเลือกผู้โดยสารท่านใหม่", data:err });
					_getErrDetail('err008', function (errorDetail){
						res.json({ 
							status: false, 	
							msg: errorDetail
						});
					});				
				} else {
					DriversModel.findOne(
						{  _id: _id, device_id: device_id }, 
						{ status:1, updated:1, _id:1, device_id:1, fname:1, lname:1, phone:1, carplate:1, cgroup:1 },
						function(err, drv) {
							if(drv==null) {
								//res.json({ status: false , msg: "Your phone does not exist. Please register and try again." });
								_driverAutoLogin(req,res);
							} else {							
								drv.psg_id = psg_id;
								drv.updated = new Date().getTime();
								drv.status = "BUSY";
								drv.save(function(err, responsedrv) {
									if(err) {
										res.json({ status: false , msg: "error", data: err });
									} else {
										JoblisthotelModel.findOne(
											{ _id : psg_id }, 
											{ status:1, updated:1, job_id:1, _id:1, device_id:1, psgtype:1 },
											function(err, psg) {
												if(psg==null) {
													res.json({ status: false , msg: "This passenger is not available." });
												} else {												          
												          psg.drv_id = _id;
												          psg.drv_device_id = drv.device_id ;
												          psg.drv_name = drv.fname+' '+drv.lname ;
												          psg.drv_phone = drv.phone ;
												          psg.drv_carplate = drv.carplate ;
												          psg.cgroup = drv.cgroup ;
												          psg.datedrvwait = new Date().getTime() ;
													psg.updated = new Date().getTime() ;
													psg.status = "BUSY" ;
													psg.save(function(err, response) {
														if(err) {
															 res.json({ status: false , msg: "error", data: err  });
														} else {															
															socket.emit("HotelSocketOn", response);	                                                                              							
															 res.json({ 																
																status: true , 															
																data: response
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
}




exports.driverCancelCall = function(socket){		
	return function(req, res) {
	var _id = req.body._id			;
	var device_id = req.body.device_id	;
	var psg_id = req.body.psg_id		;
	var curlng = req.body.curlng		;
	var curlat = req.body.curlat		;
	var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];

		DriversModel.findOne(
			{ _id: _id, device_id: device_id  }, 
			{ status:1, updated:1, fname:1, lname:1, phone:1, carplate:1, cgroup:1 },
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
					drv.save(function(err, result) {
						if(err) {
							res.json({ status: false , msg: "error", data: err  });
						} else {
							PassengerModel.findOne(
								{ _id : psg_id }, 
								{ status:1, updated:1, job_id:1, _id:1, device_id:1 },
								function(err, psg) {
								    	if(psg == null) { 
								    		//msg: "This passenger  does not exist. Please check the information."
										res.json({ status: false , msg: "error", data: err });
								    	} else {	
										if(psg.status=="ON"){
											//socket.emit("PassengerSocketOn", response);                                                        					
	                                                        					_joblistupdate ( psg.job_id, _id, device_id , drv.cgroup, drv.fname+' '+drv.lname , drv.phone, drv.carplate, 'datedrvcancel', 'driverCancelCall');                                                            						
											res.json({ 												
												status: true ,
												msg: "" ,
												//data: { status: response.status }
											});
										} else {
											psg.drv_id = "";
											psg.updated = new Date().getTime();
											psg.status = "DRVDENIED";										
											psg.save(function(err, response) {
												if (err) { 
													res.json({ status: false, msg: "error" , data: err });
												} else {
													socket.emit("PassengerSocketOn", response);
		                                                            					//socket.emit("driverCancelCall", response);
		                                                            					_joblistupdate ( psg.job_id, _id, device_id , drv.cgroup, drv.fname+' '+drv.lname , drv.phone, drv.carplate, 'datedrvcancel', 'driverCancelCall');                                                            						
													res.json({ 
														//msg: "Update driver and passenger to ON => driver canceled passenger",
														status: true , 												
														data: { status: response.status }
													});
												}
											});
										}
								    	}
								}
							);
						}
					});
			    	}
			}
		);
	};	
}		




exports.driverCancelHotel = function(socket){		
	return function(req, res) {
	var _id = req.body._id			;
	var device_id = req.body.device_id	;
	var psg_id = req.body.psg_id		;
	var curlng = req.body.curlng		;
	var curlat = req.body.curlat		;
	var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];

		DriversModel.findOne(
			{ _id: _id, device_id: device_id  }, 
			{ status:1, updated:1, fname:1, lname:1, phone:1, carplate:1 },
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
					drv.save(function(err, result) {
						if(err) {
							res.json({ status: false , msg: "error", data: err  });
						} else {
							JoblisthotelModel.findOne(
								{ _id : psg_id }, 
								{ status:1, updated:1, job_id:1, _id:1, device_id:1 },
								function(err, psg) {
								    	if(psg == null) { 
								    		//msg: "This passenger  does not exist. Please check the information."
										res.json({ status: false , msg: "error", data: err });
								    	} else {	
										psg.drv_id = "" ;
										psg.cgroup = "" ;
									          psg.datedrvcancel = new Date().getTime() ;
									          psg.drvcancelwhere = "" ;
										psg.updated = new Date().getTime() ;
										psg.status = "DRVDENIED" ;
										psg.save(function(err, response) {
											if (err) { 
												res.json({ status: false, msg: "error" , data: err });
											} else {
												socket.emit("HotelSocketOn", response);
												res.json({ 													
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
}		





exports.driverCancelCallCenter = function(socket){
	return function(req, res) {
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
							CallcenterpsgModel.findOne(
								{ _id : psg_id }, 
								{ status:1, updated:1, cgroup:1, jobhistory:1 },
								function(err, psg) {
								    	if(psg == null) { 
								    		//msg: "This passenger  does not exist. Please check the information."
										res.json({ status: false , msg: "error", data: err });
								    	} else {

										psg.jobhistory.push({ 
											action : "Drv accepted job" ,
											status : "DEPENDING_REJECT" ,     
											actionby : req.body._id ,
											created : new Date() 
										});  
										psg.drv_id = "";
										psg.updated = new Date().getTime();
										psg.status = "DEPENDING_REJECT";
										//console.log(req.body)
										psg.save(function(err, response) {
											if (err) { 
												res.json({ status: false, msg: "error" , data: err });
											} else {
												console.log( ' cancel callcenter ')
												socket.of('/'+psg.cgroup).emit("driverCancelCallCenter", response);
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
}




exports.driverPickPassenger = function(socket){		
	return function(req, res) {
	var _id  = req.body._id			;
	var device_id = req.body.device_id	;
	var psg_id = req.body.psg_id		;
	var curlng = req.body.curlng		;
	var curlat = req.body.curlat		;
	var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];

		DriversModel.findOne(
			{ _id : _id, device_id : device_id }, 
			{ device_id:1, fname:1, lname:1, phone:1, carplate:1, cgroup:1 },
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
					drv.save(function(err, result) {
						if(err) {
							res.json({ status: false , msg: "error", data: err  });
						} else {
							PassengerModel.findOne(
								{ _id : psg_id }, 
								{ status:1, updated:1, job_id:1, _id:1, device_id:1 },
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
												socket.emit("PassengerSocketOn", response);	                                                            					
	                                                            					_joblistupdate ( psg.job_id, _id, device_id , drv.cgroup,  drv.fname+' '+drv.lname , drv.phone, drv.carplate, 'datedrvpick', '');                                                            						
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
};



exports.driverPickHotel = function(socket){		
	return function(req, res) {
	var _id  = req.body._id			;
	var device_id = req.body.device_id	;
	var psg_id = req.body.psg_id		;
	var curlng = req.body.curlng		;
	var curlat = req.body.curlat		;
	var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];

		DriversModel.findOne(
			{ _id : _id, device_id : device_id }, 
			{ device_id:1, fname:1, lname:1, phone:1, carplate:1  },
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
					drv.save(function(err, result) {
						if(err) {
							res.json({ status: false , msg: "error", data: err  });
						} else {
							JoblisthotelModel.findOne(
								{ _id : psg_id }, 
								{ status:1, updated:1, job_id:1, _id:1, device_id:1 },
								function(err, psg) {
								    	if(psg == null) { 
										res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
								    	} else {	
										psg.drv_id = _id;
										psg.updated = new Date().getTime();
										psg.status = "PICK";	
										psg.datedrvpick = new Date().getTime();								
										psg.save(function(err, response) {
											if (err) { 
												res.json({ status: false, msg: "error", data: err  });
											} else {
												socket.emit("HotelSocketOn", response);
												res.json({ 													
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
};




exports.driverEndTrip = function(socket){			
	return function(req, res) {
	var _id = req.body._id		;
	var device_id = req.body.device_id	;
	var psg_id = req.body.psg_id	;
	var curlng = req.body.curlng	;
	var curlat = req.body.curlat		;
	var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];

		DriversModel.findOne(
			{ _id: _id , device_id: device_id }, 
			{ status:1, updated:1,  fname:1, lname:1, phone:1, carplate:1, cgroup:1 },
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
					drv.save(function(err, result) {
						if(err) {
							res.json({ status: false , msg: "error", data: err  });
						} else {						
							PassengerModel.findOne(
								{ _id : psg_id }, 
								{ status:1, updated:1, job_id:1, _id:1, device_id:1 },
								function(err, psg) {
								    	if(psg == null) { 
										res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
								    	} else {
								    		if(psg.status=="ON"){
											//socket.emit("PassengerSocketOn", response);	                                                            					
                                                            					_joblistupdate ( psg.job_id, _id, device_id , drv.cgroup, drv.fname+' '+drv.lname , drv.phone, drv.carplate, 'datedrvdrop', '');                                                            						
											res.json({ 													
												status: true ,
												msg: "" ,
												//data : { status: response.status }											
											});
								    		} else {
											psg.drv_id = "";
											psg.updated = new Date().getTime();
											psg.deniedTaxiIds = [];
											psg.status = "THANKS";									
											psg.save(function(err, response) {
												if (err) { 
													res.json({ status: false});
												} else {
													socket.emit("PassengerSocketOn", response);	                                                            					
		                                                            					_joblistupdate ( psg.job_id, _id, device_id , drv.cgroup, drv.fname+' '+drv.lname , drv.phone, drv.carplate, 'datedrvdrop', '');                                                            						
													res.json({ 													
														status: true ,
														data : { status: response.status }											
													});
												}
											});
								    		}
								    	}								
								}
							);				
						}
					});
			    	}						
			}
		);
	};		
};		
	



exports.driverEndTripHotel = function(socket){			
	return function(req, res) {
	var _id = req.body._id		;
	var device_id = req.body.device_id	;
	var psg_id = req.body.psg_id	;
	var curlng = req.body.curlng	;
	var curlat = req.body.curlat		;
	var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];

		DriversModel.findOne(
			{ _id: _id , device_id: device_id }, 
			{ status:1, updated:1,  fname:1, lname:1, phone:1, carplate:1  },
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
					drv.save(function(err, result) {
						if(err) {
							res.json({ status: false , msg: "error", data: err  });
						} else {						
							JoblisthotelModel.findOne(
								{ _id : psg_id }, 
								{ status:1, updated:1, job_id:1, _id:1, device_id:1 },
								function(err, psg) {
								    	if(psg == null) { 
										res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
								    	} else {										
										psg.updated = new Date().getTime();
										psg.deniedTaxiIds = [];
										psg.status = "THANKS";
										psg.datedrvdrop = new Date().getTime();							
										psg.save(function(err, response) {
											if (err) { 
												res.json({ status: false});
											} else {
												socket.emit("HotelSocketOn", response);                                                         						
												res.json({ 													
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
								var new_location = '../upload_brokens/';

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
								var new_location = '../upload_brokens/';
								
								var filePath = '../upload_brokens/'+oldimg ; 
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
								var filePath = '../upload_brokens/'+oldimg ; 
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
					var filePath = '../upload_brokens/'+arrpix[i] ; 
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
							data : { status: drv.status }
						});
					}
				});
			}
		}
	);
};




exports.gotdispatchaction = function(socket){
	return function( req, res){
	var device_id = req.body.device_id;
	var drv_id = req.body._id;
	var psg_id = req.body.passengerID;
	var drv_action = req.body.drv_action; // { yes / no }
		//console.log(' psg_id  =' + psg_id)
		switch (drv_action) {
			case "Y" : 
				updategotdispatch(psg_id, device_id, drv_id,"ASSIGNED", "ASSIGNED");
			break;
			
			case "N" :
				updategotdispatch(psg_id, device_id, drv_id,"DEPENDING_REJECT", "ON");
			break;

			case "R" : 		// = read
				updatereadmsg(drv_id, device_id );
			break;		
		}	
		//console.log(req.body)
		// user CallcenterpsgModel => จ่ายง่าน ผ่าน call center 

		function updatereadmsg(drv_id, device_id ) {
			DriversModel.findOne(
				{ _id : drv_id, device_id: device_id }, 								
				function(err, drv) {
				    	if(drv == null) { 								    		
						res.json({ status: false , msg: "Driver is missing", data: err });
				    	} else {					
						drv.msgstatus = "OLD";									
						drv.datereadmsg = new Date().getTime();	
						drv.updated = new Date().getTime();					
						drv.save(function(err, response) {
							if (err) { 
								res.json({ status: false, msg: "Cannot save drivers data" , data: err });
							} else {
								//socket.emit("gotdispatchaction", response);             
								res.json({ 
									status: true , 												
									data: { 
										status: response.status,
										psg_id: response.psg_id,
										msgphone:  response.msgphone,
										msgnote:  response.msgnote,
										msgstatus:  response.msgstatus,
										jobtype: response.jobtype
									}
								});
							}
						});
				    	}
				}
			);
		}

		function updategotdispatch(psg_id, device_id, drv_id, psg_status, drv_status) {
			CallcenterpsgModel.findOne(
				{ _id: psg_id }, 			
				function(err, psg) {
				    	if(psg == null) { 	
						DriversModel.findOne(
							{ _id : drv_id, device_id: device_id }, 								
							function(err, drv) {
							    	if(drv == null) { 								    		
									res.json({ status: false , msg: "Driver is missing", data: err });
							    	} else {
									drv.psg_id = psg_id;	
									drv.msgnote = "";
									drv.msgphone = "";
									drv.msgstatus = "OLD";									
									drv.updated = new Date().getTime();								
									drv.save(function(err, response) {
										if (err) { 
											res.json({ status: false, msg: "Cannot save drivers data" , data: err });
										} else {
											console.log( ' updategotdispatch 1 no psg_id not matched ')
											//socket.emit("gotdispatchaction", response);       
											res.json({ 
												status: true , 	
												msg: "Passenger ID is missing.",											
												data: { 
													status: response.status,
													psg_id: response.psg_id,
													msgphone:  response.msgphone,
													msgnote:  response.msgnote,
													msgstatus:  response.msgstatus,
													jobtype: response.jobtype
												}
											});
										}
									});
							    	}
							}
						);
				    	} else {
				    		if(drv_action == "N") {				    			 
							psg.deniedTaxiIds.push({ 
								device_id : req.body.device_id ,
								drv_id : req.body._id ,
								deniedDate : new Date() 
							}); 
							psg.jobhistory.push({ 
								action : "Drv denied job" ,
								status : "DEPENDING_REJECT" ,     
								actionby : req.body._id ,
								created : new Date() 
							});    
				    		}
				    		if(drv_action == "Y") {				    			 
							psg.acceptedTaxiIds.push({ 
								device_id : req.body.device_id ,
								drv_id : req.body._id ,					
								acceptedDate : new Date() 
							}); 
							psg.jobhistory.push({ 
								action : "Drv accepted job" ,
								status : "ASSIGNED" ,     
								actionby : req.body._id ,
								created : new Date() 
							});  
				    		}				    		
					    	if(psg.status == "DPENDING") {
					    		psg.status = psg_status;
					    		psg.drv_id = drv_id;
					    	} else {
					    		// งานถูกลบก่อนกดยกเลิก หรือยอมรับ
					    		psg_id = "";
					    		drv_status = "ON";
					    	}		

						psg.updated = new Date().getTime();
						psg.datereadmsg = new Date().getTime();	
						psg.dassignedjob = new Date().getTime();
						psg.save(function(err, result) {
							if(err) {
								console.log(err)
								res.json({ status: false , msg: "Cannot save passengers data", data: err  });
							} else {
								//console.log('xxxxxxx')
								DriversModel.findOne(
									{ _id : drv_id, device_id: device_id }, 								
									function(err, drv) {
									    	if(drv == null) { 								    		
											res.json({ status: false , msg: "Driver is missing", data: err });
									    	} else {
											drv.psg_id = psg_id;	
											drv.msgstatus = "OLD";
											drv.datereadmsg = new Date().getTime();										
											drv.updated = new Date().getTime();
											drv.status = drv_status;	
											drv.save(function(err, response) {
												if (err) { 
													console.log(err)
													res.json({ status: false, msg: "Cannot save drivers data" , data: err });
												} else {
													console.log( ' updategotdispatch 2  match psg_id ')
													socket.of('/'+psg.cgroup).emit("gotdispatchaction", { response: response, psg_data: result } );
													res.json({ 
														status: true , 												
														data: { 
															status: response.status,
															psg_id: response.psg_id,
															msgphone:  response.msgphone,
															msgnote:  response.msgnote,
															msgstatus:  response.msgstatus,
															jobtype: response.jobtype,
															curaddr: psg.curaddr,
															destination: psg.destination,
															detail: psg.detail,
															dassignedjob: psg.dassignedjob
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
}



exports.driverEndTask = function(socket) {	
	return function(req, res) {
	var _id = req.body._id			;
	var device_id = req.body.device_id	;
	var psg_id = req.body.passengerID	;
	var jobsendby ;
		DriversModel.findOne(
			{ _id: _id , device_id: device_id }, 		
			function(err, drv) {
			    	if(drv == null) { 
					//res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
					_driverAutoLogin(req,res);
			    	} else {	    	
			    		console.log("drv.status1 = "+drv.status)
			    		if(drv.status=="ASSIGNED") {
			    			jobsendby = "CALLCENTER";
			    		}
					drv.psg_id = "";
					drv.updated = new Date().getTime();
					drv.status = "ON";						
					drv.save(function(err, response) {
						if(err) {
							res.json({ status: false , msg: "error", data: err  });
						} else {	
							console.log("drv.status2 = "+drv.status)
							if(jobsendby=="CALLCENTER") {
								CallcenterpsgModel.findOne(
									{ _id : psg_id }, 							
									function(err, ccenter) {
									    	if(ccenter == null) { 
											res.json({ status: false , msg: "This  CC passenger  does not exist. Please check the information."});
									    	} else {	

											ccenter.jobhistory.push({ 
												action : "Drv finished job" ,
												status : "FINISHED" ,     
												actionby : req.body._id ,
												created : new Date() 
											});  

											ccenter.drv_id = "";
											ccenter.updated = new Date().getTime();
											ccenter.deniedTaxiIds = [];
											ccenter.status = "FINISHED";									
											ccenter.save(function(err, response) {
												if (err) { 
													res.json({ status: false});
												} else {
													socket.of('/'+response.cgroup).emit("driverEndTask", response);
													res.json({ 												
														status: true ,
														msg: "this is callcenter psg",
														data : { status: response.status }											
													});
												}
											});
									    	}								
									}
								);
							} else {
								PassengerModel.findOne(
									{ _id : psg_id }, 							
									function(err, psg) {
									    	if(psg == null) { 
											res.json({ status: false , msg: "This passenger  does not exist. Please check the information."});
									    	} else {	
											psg.drv_id = "";
											psg.updated = new Date().getTime();
											psg.deniedTaxiIds = [];
											psg.status = "OFF";									
											psg.save(function(err, response) {
												if (err) { 
													res.json({ status: false});
												} else {
													//socket.emit("driverEndTask", response);
													res.json({ 												
														status: true ,
														msg: "this is app psg",
														data : { status: response.status }											
													});
												}
											});
									    	}								
									}
								);	
							}			
						}
					});
			    	}						
			}
		);
	};	
}




exports.driverGetParkingQueue = function(req, res) {
	var cgroup = req.body.cgroup;
	var parkinglot = req.body.parkinglot;
	var drv_id = req.body.drv_id;

	ParkingqueueModel.count(
		{ cgroup: cgroup , parkinglot: parkinglot, drv_id: drv_id },
		function (err, result) {
			if(err) {
				res.json({ status: false , data: err  });      
			} else {
				res.json({ 
					status: true, 
					totalqueue: result				
				});
			}
		}    
	);
};




exports.driverBookParkingQueue = function(req, res) {

};




exports.driverLeftParkingQueue = function(req, res) {

};




//////////////////////////////////////////////
var MD5 = function (string) {

   function RotateLeft(lValue, iShiftBits) {
           return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
   }

   function AddUnsigned(lX,lY) {
           var lX4,lY4,lX8,lY8,lResult;
           lX8 = (lX & 0x80000000);
           lY8 = (lY & 0x80000000);
           lX4 = (lX & 0x40000000);
           lY4 = (lY & 0x40000000);
           lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
           if (lX4 & lY4) {
                   return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
           }
           if (lX4 | lY4) {
                   if (lResult & 0x40000000) {
                           return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                   } else {
                           return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                   }
           } else {
                   return (lResult ^ lX8 ^ lY8);
           }
   }

   function F(x,y,z) { return (x & y) | ((~x) & z); }
   function G(x,y,z) { return (x & z) | (y & (~z)); }
   function H(x,y,z) { return (x ^ y ^ z); }
   function I(x,y,z) { return (y ^ (x | (~z))); }

   function FF(a,b,c,d,x,s,ac) {
           a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
           return AddUnsigned(RotateLeft(a, s), b);
   };

   function GG(a,b,c,d,x,s,ac) {
           a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
           return AddUnsigned(RotateLeft(a, s), b);
   };

   function HH(a,b,c,d,x,s,ac) {
           a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
           return AddUnsigned(RotateLeft(a, s), b);
   };

   function II(a,b,c,d,x,s,ac) {
           a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
           return AddUnsigned(RotateLeft(a, s), b);
   };

   function ConvertToWordArray(string) {
           var lWordCount;
           var lMessageLength = string.length;
           var lNumberOfWords_temp1=lMessageLength + 8;
           var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
           var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
           var lWordArray=Array(lNumberOfWords-1);
           var lBytePosition = 0;
           var lByteCount = 0;
           while ( lByteCount < lMessageLength ) {
                   lWordCount = (lByteCount-(lByteCount % 4))/4;
                   lBytePosition = (lByteCount % 4)*8;
                   lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                   lByteCount++;
           }
           lWordCount = (lByteCount-(lByteCount % 4))/4;
           lBytePosition = (lByteCount % 4)*8;
           lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
           lWordArray[lNumberOfWords-2] = lMessageLength<<3;
           lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
           return lWordArray;
   };

   function WordToHex(lValue) {
           var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
           for (lCount = 0;lCount<=3;lCount++) {
                   lByte = (lValue>>>(lCount*8)) & 255;
                   WordToHexValue_temp = "0" + lByte.toString(16);
                   WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
           }
           return WordToHexValue;
   };

   function Utf8Encode(string) {
           string = string.replace(/\r\n/g,"\n");
           var utftext = "";

           for (var n = 0; n < string.length; n++) {

                   var c = string.charCodeAt(n);

                   if (c < 128) {
                           utftext += String.fromCharCode(c);
                   }
                   else if((c > 127) && (c < 2048)) {
                           utftext += String.fromCharCode((c >> 6) | 192);
                           utftext += String.fromCharCode((c & 63) | 128);
                   }
                   else {
                           utftext += String.fromCharCode((c >> 12) | 224);
                           utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                           utftext += String.fromCharCode((c & 63) | 128);
                   }

           }

           return utftext;
   };

   var x=Array();
   var k,AA,BB,CC,DD,a,b,c,d;
   var S11=7, S12=12, S13=17, S14=22;
   var S21=5, S22=9 , S23=14, S24=20;
   var S31=4, S32=11, S33=16, S34=23;
   var S41=6, S42=10, S43=15, S44=21;

   string = Utf8Encode(string);

   x = ConvertToWordArray(string);

   a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

   for (k=0;k<x.length;k+=16) {
           AA=a; BB=b; CC=c; DD=d;
           a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
           d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
           c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
           b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
           a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
           d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
           c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
           b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
           a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
           d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
           c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
           b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
           a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
           d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
           c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
           b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
           a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
           d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
           c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
           b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
           a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
           d=GG(d,a,b,c,x[k+10],S22,0x2441453);
           c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
           b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
           a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
           d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
           c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
           b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
           a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
           d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
           c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
           b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
           a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
           d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
           c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
           b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
           a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
           d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
           c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
           b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
           a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
           d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
           c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
           b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
           a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
           d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
           c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
           b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
           a=II(a,b,c,d,x[k+0], S41,0xF4292244);
           d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
           c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
           b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
           a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
           d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
           c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
           b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
           a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
           d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
           c=II(c,d,a,b,x[k+6], S43,0xA3014314);
           b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
           a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
           d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
           c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
           b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
           a=AddUnsigned(a,AA);
           b=AddUnsigned(b,BB);
           c=AddUnsigned(c,CC);
           d=AddUnsigned(d,DD);
      }

    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

    return temp.toLowerCase();
}
//////////////////////////////////////////////

