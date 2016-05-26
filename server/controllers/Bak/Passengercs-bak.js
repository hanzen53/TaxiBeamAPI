////////////////////////////////////
// Taxi-Beam Passenger API Passenger
// version : 1.0.0.2
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
	qs = require('querystring');

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


function _passengerAutoLogin (req, res) {
device_id = req.body.device_id	;
_id = req.body._id			;
	PassengerModel.findOne(
		{ device_id :  device_id }, 		
		function(err, psg){	    		
		    	if(psg == null) { 
		    		// This phone(IMEI) have never been in the system, send to registration page.
				res.json({ 
					status: false , 
					target: "REGISTRATION"					
				});
		    	} else {	    
		    		if ( psg._id == _id ) {
					psg.status = "OFF";
					psg.updated = new Date().getTime();
					psg.save(function(err, response) {
						if (err) {
							res.json({ status: false , msg: "error" ,  data: err });
						} else {
							// device_id: Y, _id: Y =>  Welcome to Taxi-Beam ]
							res.json({ 
								status: true, 										
								data: { 									
									status: psg.status											
								} 
							});
						}
					});
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




function _passengerPassLogin (req, res) {
device_id = req.body.device_id	;
_id = req.body._id			;
	PassengerModel.findOne(
		{ device_id :  device_id }, 		
		function(err, psg){	    		
		    	if(psg == null) { 
		    		// This phone(IMEI) have never been in the system, send to registration page.
				res.json({ 
					status: false , 
					target: "REGISTRATION"					
				});
		    	} else {	    
		    		if ( psg._id == _id ) {
					psg.status = "OFF";
					psg.updated = new Date().getTime();
					psg.save(function(err, response) {
						if (err) {
							res.json({ status: false , msg: "error" ,  data: err });
						} else {
							// device_id: Y, _id: Y =>  Welcome to Taxi-Beam ]
							res.json({ 
								status: true, 										
								data: { 									
									status: psg.status											
								} 
							});
						}
					});
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




// start ::: Passenger API Mobile Version
exports.passengerAutoLogin = function(req, res) {
 	_passengerAutoLogin (req, res);
};




exports.passengerRegister = function(req, res) {
var device_id = req.body.device_id	;
	PassengerModel.findOne(
		{ device_id : device_id }, 
		function(err, psg) {
			if (psg == null) { 
		    		PassengerModel.create({
					device_id: device_id,
					email: req.body.email,					
					phone: req.body.phone				
					},
					function(err, response) {
						if (err) { 
							res.json({ status: false , msg: "error"  });
						} else {
							res.json({ 
								//msg:  "Your account has been created.", 
								status: true , 								
								data : { 
									_id: response._id,
									status: response.status									
								} 
							});
						} 
					}
				);
	    		} else {				
		    		// duplicated IMEI/App ID => updated the current data for device_id.				
				psg.email = req.body.email;
				psg.phone = req.body.phone;
				psg.curaddr = "";
				psg.curlng = null;
				psg.curlat = null;
				psg.curloc = [];
				psg.destination = "";
				psg.des_dist = "";
				psg.deslng = null;
				psg.deslat = null;
				psg.desloc = [];
				psg.tips = "";
				psg.detail = "";
				psg.favcartype = [];
				psg.favdrv = [];
				psg.drv_id = "";
				psg.status = "OFF";				
				psg.created = new Date().getTime();
				psg.updated = new Date().getTime();			
				psg.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error"  });
					} else {					
						res.json({ 
							//msg:  "Your account has been updated." , 
							status: true, 								
							msg:  "" , 
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




exports.passengerUpdateProfile = function(req, res) {
var _id		= req.body._id		;
var device_id	= req.body.device_id	;
//var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ device_id : device_id }, 
		{ device_id:1, status:1 },
		function(err, psg) {	    	
			if (psg == null) { 				
				_passengerAutoLogin (req, res);
	    		} else {
				//if(req.body.curlng) 	{ psg.curlng	= req.body.curlng ? req.body.curlng : psg.curlng; }
				//if(req.body.curlat) 	{ psg.curlat	= req.body.curlat ? req.body.curlat : psg.curlat; }
				//if(curloc) 		{ psg.curloc	= curloc ? curloc : psg.curloc; }	
				if(req.body.email) 	{ psg.email 	= req.body.email ? req.body.email : psg.email; }
				if(req.body.phone) 	{ psg.phone 	= req.body.phone ? req.body.phone : psg.phone; }					
				psg.updated = new Date().getTime();
				psg.save(function(err, result) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						res.json({ 
							//msg: "success, passenger profile updated",
							status: true 
						});
					}
				});
			}
		}
	);
};




exports.passengerGetStatus = function(req, res) {
var _id = req.body._id			;
var device_id = req.body.device_id	;
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
	PassengerModel.findOne(
		{ device_id : device_id }, 
		{ device_id:1, drv_id:1, status:1, curloc:1, updated: 1},
		function(err, psg) {
			if (psg == null) { 				
		    		PassengerModel.create({
					device_id: device_id,
					email: req.body.email,					
					phone: req.body.phone,
					status: "OFF"			
					},
					function(err, response) {
						if (err) { 
							//res.json({ status: false , msg: "error"  });
							res.setHeader('Content-Type', 'application/json;charset=utf-8');
							res.setHeader('Access-Control-Allow-Origin', '*');
			    				res.send(JSON.stringify({
								//msg: "error", 
								status: false,
							}));							
						} else {		
							res.setHeader('Content-Type', 'application/json;charset=utf-8');
							res.setHeader('Access-Control-Allow-Origin', '*');
			    				res.send(JSON.stringify({
								//msg: "This is your driver's list.", 
								status: true, 										
								data : { 
									_id: response._id,
									status: response.status,
									drv_id: response.drv_id									
								} 
							}));							
						}
					} 
				);
	    		} else {
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }			
				psg.updated = new Date().getTime();
				psg.save(function(err, result) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {						
						//res.set( 'Content-type: application/json;charset=utf-8' );
						res.set('Access-Control-Allow-Origin: *');					
						res.json({ 
							//msg: "success, there is your status.",
							status: true , 							
							data: {
								_id: result._id,
								status: result.status,	
								drv_id: result.drv_id						
							}
						});
					}
				});
			}
		}
	);
};




exports.passengerGetByID = function(req, res) {
var _id = req.body._id	;
	PassengerModel.findOne(
		{ _id : _id }, 
		{ _id:0, updated:0, created:0 },
		function(err, psg) {
		    	if(psg == null) { 
				//res.json({ status: false , msg: "There is some data missing, please try again."});
				//ระบบมีการเปลี่ยนแปลงข้อมูลล่าสุดของแท็กซี่ กรุณาลองอีกครั้ง
				_getErrDetail('err011', function (errorDetail){
					res.json({ 
						status: false, 	
						msg: errorDetail
					});
				});
		    	} else {
				if (err) {
					res.json({ status: false , msg:  "error", data : err });
				} else {
					res.json({ 
						status: true , 
						msg:  "", 
						data: {
							email: psg.email,
							phone: psg.phone,
							curaddr: psg.curaddr,
							curlng: psg.curlng,
							curlat: psg.curlat,							
							destination: psg.destination,
							des_dist: psg.des_dist,
							deslng: psg.deslng,
							deslat: psg.deslat,							
							tips: psg.tips,
							detail: psg.detail,
							favcartype: psg.favcartype,
							favdrv: psg.favdrv,
							drv_id: psg.drv_id,
							status: psg.status							
						}
					});				
				} 
			}
		}
	);
};




exports.passengerSearchDrv = function(req, res) {
var curlng 	= req.body.curlng	;
var curlat 	= req.body.curlat	;
var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
var radian	= req.body.radian	;
var amount	= req.body.amount	;
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
	radian = "10000";
	}
	if (typeof amount == 'undefined' && amount == null) {		
	amount = "200";
	}	
	DriversModel.find(
		//{ active:"Y", status: "ON", curloc : { $near : curloc, $maxDistance: radian  }  },
		{ 						
			//curloc : { $near : curloc, $maxDistance: radian },   => for 2d index => not working
			// do not forget  => db.passengers.createIndex( { curloc : "2dsphere" } )
			status: "ON", 
			active:"Y",
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
		},

		{ device_id:0,  nname:0, english:0, cartype:0, outbound:0, carryon:0, imglicence:0, imgcar:0, psg_id:0, active:0,  workperiod:0, workstatus:0, imgczid:0, curloc:0, brokenname:0, brokendetail:0, brokenpicture:0, grg_id:0, car_id:0, smsconfirm:0, updated:0, created:0 },					
		{ limit : amount },
		function(err,drvlist){
			// Donot forget to create 2d Index for passengers collection : curloc & descloc!!!!
			if(drvlist == null) {
				//res.json({status: false, msg: "No data"});
				res.setHeader('Content-Type', 'application/json;charset=utf-8');
				res.setHeader('Access-Control-Allow-Origin', '*');
    				res.send(JSON.stringify({
					//msg: "No data", 
					status: false,
				}));				
			} else {				
				res.setHeader('Content-Type', 'application/json;charset=utf-8');
				res.setHeader('Access-Control-Allow-Origin', '*');
    				res.send(JSON.stringify({
					//msg: "This is your driver's list.", 
					status: true, 										
					data: drvlist
				}));
				//Specifies a point for which a geospatial query returns the documents from nearest to farthest.
			}
		}
	);
	/*	
	PassengerModel.findOne(
		{ device_id : device_id }, 
		function(err, psg) {
			if (psg == null) { 
				// CREATE Passenger *****************************************
		    		PassengerModel.create({
					device_id: device_id,
					phone: req.body.phone,
					status: "OFF"			
					},
					function(err, psg) {
						if (err) { 
							res.json({ status: false , msg: "error", data: err  });
						} else {							
							//if(req.body.favcartype) { psg.favcartype = req.body.favcartype ? req.body.favcartype : psg.favcartype; }
							if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
							if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
							if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }				
							psg.updated = new Date().getTime();
							psg.save(function(err, response) {
								if(err) {
									res.json({ status: false , msg: "error" , data: err });
								} else {
									DriversModel.find(
										condition,
										{ device_id:0,  nname:0, workperiod:0, workstatus:0, imgczid:0, curloc:0, brokenname:0, brokendetail:0, brokenpicture:0, grg_id:0, car_id:0, smsconfirm:0, updated:0, created:0 },					
										{ limit : amount },
										function(err,drvlist){
											// Donot forget to create 2d Index for passengers collection : curloc & descloc!!!!								
											if(drvlist == null) {												
												res.json({status: false, msg: "No data 1"});
											} else {
												res.json({
													//msg: "This is your driver's list.", 
													status: true, 										
													data: drvlist
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
	    			
	    		} else {	    		
				//if(req.body.favcartype) 	{ psg.favcartype = req.body.favcartype ? req.body.favcartype : psg.favcartype; }
				if(req.body.phone) 	{ psg.phone = req.body.phone ? req.body.phone : psg.phone; }
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }				
				psg.updated = new Date().getTime();
				psg.save(function(err, response) {
					if(response == null) {
						res.json({ status: false , msg: "error" , data: err });
					} else {

					}
				});
			}
		}
	);
	*/
};




exports.passengerCallDrv = function(req, res) {
var _id		= req.body._id		;
var device_id	= req.body.device_id	;
var phone	= req.body.phone	;
var curlng 	= req.body.curlng	;
var curlat 	= req.body.curlat	;
var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
//var deslng 	= req.body.deslng	;
//var deslat 	= req.body.deslat	;
//var desloc 	= [parseFloat(req.body.deslng),parseFloat(req.body.deslat)];
	PassengerModel.findOne(
		{ device_id: device_id }, 
		{ device_id:1, curaddr:1, curloc:1, destination:1, desloc:1, des_dist:1, tips:1, detail:1, favcartype:1, status:1, updated:1 },
		function(err, psg) {			
		    	if(psg == null) { 				
				//_passengerPassLogin (req, res);
				// CREATE Passenger *****************************************
		    		PassengerModel.create({
					device_id: device_id,
					phone: req.body.phone,
					status: "OFF"			
					},
					function(err, psg) {
						if (err) { 
							res.json({ status: false , msg: "error", data: err  });
						} else {														
							if(req.body.phone) 	{ psg.phone = req.body.phone ? req.body.phone : psg.phone; }
							if(req.body.curaddr)	{ psg.curaddr = req.body.curaddr ? req.body.curaddr : psg.curaddr; }				
							if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
							if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
							if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }
							if(req.body.destination)	{ psg.destination = req.body.destination ? req.body.destination : psg.destination; }				
							if(req.body.tips) 	{ psg.tips = req.body.tips ? req.body.tips : psg.tips; }
							if(req.body.detail)	{ psg.detail = req.body.detail ? req.body.detail : psg.detail; }				
							psg.status = "INITIATE";			
							psg.updated = new Date().getTime();
							psg.save(function(err, response) {
								if (err) {
								 	res.json({ 
										status: false , 
										msg: "error", 
										data: err							
									});
								} else {
								 	res.json({ 							
										status: true , 							
										data: { status: response.status }
									});
								}
							}
						);
					} 
				});				
		    	} else {
				// Update passenger info and status to be "ON"
				if(req.body.phone) 	{ psg.phone = req.body.phone ? req.body.phone : psg.phone; }
				if(req.body.curaddr)	{ psg.curaddr = req.body.curaddr ? req.body.curaddr : psg.curaddr; }				
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }
				if(req.body.destination)	{ psg.destination = req.body.destination ? req.body.destination : psg.destination; }				
				if(req.body.tips) 	{ psg.tips = req.body.tips ? req.body.tips : psg.tips; }
				if(req.body.detail)	{ psg.detail = req.body.detail ? req.body.detail : psg.detail; }				
				psg.status = "INITIATE";
				psg.updated = new Date().getTime();				
				psg.save(function(err, response) {
					if (err) {
					 	res.json({ 
							status: false , 
							msg: "error", 
							data: err							
						});
					} else {
					 	res.json({ 							
							status: true , 							
							data: { status: response.status }
						});
					}
				});
			}
		}
	);
};




exports.passengerEditRoute = function(req, res) {
var _id		= req.body._id		;
var device_id	= req.body.device_id	;
	PassengerModel.findOne(
		{ device_id:device_id }, 
		{ device_id:1, status:1 },
		function(err, psg) {
	    		if(psg == null) { // don't have passengers 				
				_passengerAutoLogin (req, res);
	    		} else {				
				psg.updated = new Date().getTime();
				psg.status = "OFF";
				psg.save(function(err, response) {
					if (err) {
						res.json({ 
							status: false , 
							msg: "error"
						});
					} else {
						res.json({ 
							//msg: "Update passenger to OFF => edit route", 
							status: true , 							
							data: { status: response.status }
						});
					}
				});
			}
		}
	);
};




exports.passengerAcceptDrv = function(req, res) {
var _id		= req.body._id ;
var device_id	= req.body.device_id ;
var drv_id	= req.body.drv_id ;
//var curlng 	= req.body.curlng	;
//var curlat 	= req.body.curlat	;
//var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ device_id : device_id }, 
		{ device_id:1 },
		function(err, psg) {
		    	if(psg == null) { 
		    		_passengerAutoLogin (req, res);				
		    	} else {
				//if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				//if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				//if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }				
				if(req.body.drv_id) 	{ psg.drv_id = req.body.drv_id ? req.body.drv_id : psg.drv_id; }
				psg.updated = new Date().getTime();
				psg.status = "BUSY";				
				psg.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						DriversModel.findOne(
							{ _id : drv_id }, 
							{ status:1, updated:1 },
							function(err, drv) {
							    	if(drv == null) { 					
									_getErrDetail('err009', function (errorDetail){
										res.json({ 
											status: false, 
											msg: errorDetail,
										});
									});									
							    	} else {
									drv.psg_id = _id ;
									drv.updated = new Date().getTime();
									drv.status = "BUSY";									
									drv.save(function(err, response) {
										if(err) {
											res.json({ status: false , msg: "error" });
										} else {
											res.json({ 
												//msg: "Update passenger to BUSY => passenger accept driver" 
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




exports.passengerGetDrvLoc = function(req, res) {
var device_id	= req.body.device_id ;
var drv_id	= req.body.drv_id ;
	PassengerModel.findOne(
		{  device_id: device_id, drv_id: drv_id }, 
		{  _id:1, status:1 },
		function(err, psg) {
		    	if(psg == null) { 					
				_passengerAutoLogin (req, res);					
		    	} else {		    	
		    		//console.log(psg._id)	
				//if (psg.status == "BUSY") {
					DriversModel.findOne(
						{ _id: drv_id, psg_id: psg._id }, 
						{ _id:1, psg_id:1, curlng:1, curlat:1, curloc:1, accuracy: 1, degree:1, status:1, active:1 },
						function(err, drv) {					
							if (drv == null) {
								_getErrDetail('err009', function (errorDetail){
									res.json({ 
										status: false, 	
										msg: errorDetail
									});
								});
							} else {
								if (err) {
									res.json({ status: false , msg: "error " });
								} else {
									res.json({ 
										//msg: "success: get drv location ", 
										status: true , 										
										data: {
											_id: drv._id,
											psg_id: drv.psg_id,
											accuracy: drv.accuracy,
											degree: drv.degree,
											curlng: drv.curlng,
											curlat: drv.curlat,											
											status: drv.status	
										} 
									});
								}
							}
						}
					);
				//} else {
				//	_getErrDetail('err009', function (errorDetail){
				//		res.json({ 
				//			status: false, 	
				//			msg: errorDetail
				//		});
				//	});
				//}
		    	}
		}		
	);
};




exports.passengerCancelCall = function(req, res) {
var _id		= req.body._id			;
var device_id	= req.body.device_id		;
//var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{  device_id: device_id }, 
		{ status:1, updated:1 },
		function(err, psg) {
		    	if(psg == null) { 
		    		_passengerAutoLogin (req, res);				
		    	} else {				
				//if(req.body.curlng) 	{ psg.curlng	= req.body.curlng ? req.body.curlng : psg.curlng; }
				//if(req.body.curlat) 	{ psg.curlat	= req.body.curlat ? req.body.curlat : psg.curlat; }
				//if(curloc) 		{ psg.curloc	= curloc ? curloc : psg.curloc; }		    						
				psg.drv_id = "";
				psg.updated = new Date().getTime();
				psg.status = "OFF";
				psg.save(function(err, response) {					
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {						
						res.json({ 
							//msg: "Update passenger to ON => passenger cancel driver" 
							status: true , 												
							data: { status: response.status } 
						});
					}
				});
		    	}
		}
	);
};




exports.passengerCancelDrv = function(req, res) {
var _id		= req.body._id			;
var device_id	= req.body.device_id		;
var drv_id	= req.body.drv_id		;
//var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{  device_id: device_id }, 
		{ status:1, updated:1 },
		function(err, psg) {
		    	if(psg == null) { 
		    		_passengerAutoLogin (req, res);				
		    	} else {				
				//if(req.body.curlng) 	{ psg.curlng	= req.body.curlng ? req.body.curlng : psg.curlng; }
				//if(req.body.curlat) 	{ psg.curlat	= req.body.curlat ? req.body.curlat : psg.curlat; }
				//if(curloc) 		{ psg.curloc	= curloc ? curloc : psg.curloc; }		    						
				psg.drv_id = "";
				psg.updated = new Date().getTime();
				psg.status = "ON";
				psg.save(function(err, response) {					
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {						
						DriversModel.findOne(
							{ _id : drv_id }, 
							{ status:1, updated:1 },
							function(err, drv) {
							    	if(drv == null) { 
									_getErrDetail('err009', function (errorDetail){
										res.json({ 
											status: false, 	
											msg: errorDetail
										});
									});
							    	} else {									
									drv.psg_id = "";
									drv.updated = new Date().getTime();
									drv.status = "ON";									
									drv.save(function(err, response) {
										if (err) {
											res.json({ status: false , msg: "error", data: err });
										}else {
											res.json({ 
												//msg: "Update passenger to ON => passenger cancel driver" 
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




exports.passengerFavDrvAdd = function(req, res) { 
var _id = req.body._id			;
var device_id = req.body.device_id	;	
 	PassengerModel.findOne(
		{ device_id: device_id }, 
		{ favdrv:1 },		
		function(err, psg) {				
			if (psg == null) {				
				_passengerAutoLogin (req, res);			
			} else {
				arrfav = psg.favdrv;	
				arrfav.push(req.body.favdrv);			// push arrary at the last

				psg.favdrv = arrfav;
				psg.updated = new Date().getTime();
				psg.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });							
					} else {
						res.json({ 
							status: true
						});							
					}
				});				
			}
		}
	);
	
};




exports.passengerFavDrvDel = function(req, res) { 
var _id = req.body._id			;
var device_id = req.body.device_id	;
var oldfav = req.body.favdrv;
	PassengerModel.findOne(
		{ device_id : device_id }, 
		{ favdrv:1 },
		function(err, psg) {
			if (psg == null) {	
				_passengerAutoLogin (req, res);										
			} else {
				arrfav = psg.favdrv;	
				//console.log('arrfav='+arrfav)
				favorder = arrfav.indexOf(oldfav)
				//console.log('favorder='+favorder)
				if (favorder>=0){
					arrfav.splice(favorder, 1);	// delete array at favorder
				}
				//console.log('arrfav2='+arrfav)
				psg.favdrv = arrfav;
				psg.updated = new Date().getTime();
				psg.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {																
						res.json({ 
							status: true 							
						});
					}
				});
			}
		}
	);
};




exports.passengerSendComment = function(req, res) {
var _id = req.body._id			;
var device_id = req.body.device_id		;
var commtype = "PSG"		;
var topic = req.body.topic			;
var comment = req.body.comment		;
	PassengerModel.findOne(
		{  device_id : device_id }, 
		function(err, psg) {
	    		if(psg == null) { 				
				_passengerAutoLogin (req, res);	
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




exports.passengerchangeOnOff = function(req, res) {
var _id = req.body._id				;
var device_id = req.body.device_id		;
	PassengerModel.findOne(
		{  device_id : device_id }, 
		{ device_id:1 },
		function(err, psg) {
			if (psg == null) {
				_passengerAutoLogin(req,res);
		    	} else {							
				if(req.body.status) 	{ psg.status 	= req.body.status ? req.body.status : psg.status; }
				psg.updated = new Date().getTime();
				psg.save(function(err, result) {
					if(err) {
						res.json({ status: false ,  msg: "error"  });
					} else {
						res.json({ 
							status: true ,  							
							data : {	status: psg.status }
						});
					}
				});
			}
		}
	);
};




exports.passengerEndTrip = function(req, res) {
var _id		= req.body._id		;
var device_id	= req.body.device_id	;
var drv_id	= req.body.drv_id	;
var curlng 	= req.body.curlng	;
var curlat 	= req.body.curlat	;
var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ device_id: device_id }, 
		{ status:1, updated:1 },
		function(err, psg) {
		    	if(psg == null) { 				
				_passengerAutoLogin (req, res);
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
				psg.drv_id = "";
				psg.updated = new Date().getTime();
				psg.status = "OFF";				
				psg.save(function(err, response) {					
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {	
					/*					
						DriversModel.findOne(
							{ _id : drv_id }, 
							{ status:1, updated:1 },
							function(err, drv) {
							    	if(drv == null) { 
									_getErrDetail('err009', function (errorDetail){
										res.json({ 
											status: false, 	
											msg: errorDetail
										});
									});
							    	} else {									
									drv.psg_id = "";
									drv.updated = new Date().getTime();
									drv.status = "ON";									
									drv.save(function(err, response) {
										if (err) {
											res.json({ status: false , msg: "error", data: err });
										} else {
											res.json({ 
												//msg: "Update passenger to ON => passenger end trip" 
												status: true , 												
												data: {
													psg_id: response.psg_id,
													status: response.status
												} 												
											});
										}										
									});
							    	}
							}
						);
					*/
						 res.json({ 							
							//msg: "Update passenger to OFF => passenger end trip" 
							status: true , 							
							data : { status: response.status }
						});					
					}
				});
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