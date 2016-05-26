////////////////////////////////////
// Taxi-Beam Passenger API Passenger
// version : 1.0.0.2
// Date March 3, 20156
// Created by Hanzen@BRET
////////////////////////////////////
var config = require('../../config/func').production;

var Url = require('url');
var mongoose  = require('mongoose');
var DeviceModel  = mongoose.model('DeviceModel');
var PassengerModel  = mongoose.model('PassengerModel');
var PsgcalllogModel  = mongoose.model('PsgcalllogModel');
var JoblistModel = mongoose.model('JoblistModel');
var UserModel  = mongoose.model('UserModel');
var PathLogModel = mongoose.model('PathLogModel');
var DriversModel = mongoose.model('DriversModel');
var CommentModel  = mongoose.model('CommentModel');
var AnnounceModel = mongoose.model('AnnounceModel');
var EmgListModel = mongoose.model('EmgListModel');
var ErrorcodeModel =  mongoose.model('ErrorcodeModel');

// for upload file
var path = require('path') ;
var formidable = require('formidable') ;
var util = require('util') ;
var fs = require('fs-extra') ;
var qt = require('quickthumb') ;
var http = require('http') ;
var qs = require('querystring') ;
var ios = require('socket.io') ;

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


function _joblistcreate (job_id, req){	
     	JoblistModel.create({
		job_id: job_id ,
		psg_id:	 req.body.psg_id , 
		psg_device_id:	 req.body.device_id ,
		psg_phone: req.body.phone ,
		curaddr: req.body.curaddr, 
		curlng: req.body.curlng ,
		curlat: req.body.curlat ,
		destination: req.body.destination ,
		deslng:	 req.body.deslng , 		
		deslat:	req.body.deslat ,
		tips: req.body.tips ,
		detail: req.body.detail ,
		datepsgcall: new Date().getTime() ,
		createdvia : req.body.createdvia	
	 	},
	 	function(err, response) {
	 		if (err) { 
	 			console.log(err)
	 		} else {
	 			console.log('success create job')
	 		} 
	 	}
	 );	
}


function _joblistupdate (job_id, req, action, cwhere){	
	JoblistModel.findOne(
		{ job_id :  job_id }, 		
		function(err, job){
		    	if(job == null) {
		    		console.log (' no job id')
		    	} else {	
				switch(action) {
					case "datepsgaccept":
					//job.drv_id = req.body.drv_id;
					job.datepsgaccept = new Date().getTime();
					break;
					case "datepsgthanks":
					job.datepsgthanks = new Date().getTime();
					break; 
					case "datepsgcancel":
					job.datepsgcancel = new Date().getTime();
					job.psgcancelwhere = cwhere ;
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
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
	PassengerModel.findOne(
		{ device_id : device_id }, 
		function(err, psg) {
			if (psg == null) { 
		    		PassengerModel.create({
					device_id: device_id,
					displayName: req.body.displayName,
					email: req.body.email,					
					phone: req.body.phone,
					createdvia: "APP"			
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
									msg: "register success",
									status: response.status									
								} 
							});
						} 
					}
				);
	    		} else {				
		    		// duplicated IMEI/App ID => updated the current data for device_id.	
		    		psg.displayName = req.body.displayName ;
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
				psg.createdvia	= "APP";		
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
								msg: "re-register success",
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
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
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
var _id 	= req.body._id		;
var device_id	= req.body.device_id		;	// Lite version use phone as a unique key
var reallng 	= req.body.curlng		;
var reallat 	= req.body.curlat		;
var realloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	//console.log('passengerGetStatus : device_id = '+device_id)
	if (typeof reallng == 'undefined' && reallng == null) {		
		res.json({ status: false, msg: "current longitude is not valid" })
		return;	
	}
	if (typeof reallat == 'undefined' && reallat == null) {		
		res.json({ status: false, msg: "current latitude is not valid" })
		return;
	}
	PassengerModel.findOne(
		{ device_id : device_id }, 
		{ device_id:1, drv_id:1, status:1, curloc:1, updated: 1, phone: 1, curlat:1, curlng:1, curloc:1, reallat:1, reallng:1, realloc:1, createdvia:1 },
		function(err, psg) {
			if (psg == null) {
				/*		
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
								msg: "error01"
							}));							
						} else {		
							res.setHeader('Content-Type', 'application/json;charset=utf-8');
							res.setHeader('Access-Control-Allow-Origin', '*');
			    				res.send(JSON.stringify({
								//msg: "This is your driver's list.", 
								status: true, 
								msg: "finde one null ",
								data : { 
									_id: response._id,
									status: response.status,
									drv_id: response.drv_id,
									phone: response.phone,
									device_id: response.device_id
									
								} 
							}));							
						}
					} 
				);
				*/
				res.json({ 
					status: false,
					msg: "error no data" 
				});				
	    		} else {
				//Set the two dates
				var currentTime   = new Date()
				var currDate      = currentTime.getMonth() + 1 + "/" + currentTime.getDate() + "/" + currentTime.getFullYear() //Todays Date - implement your own date here.
				var iniPastedDate = psg.updated // "8/7/2012" //PassedDate - Implement your own date here.

				//currDate = 8/17/12 and iniPastedDate = 8/7/12

				function DateDiff(date1, date2) {
					var datediff = date1.getTime() - date2.getTime(); //store the getTime diff - or +
					return (datediff / (24*60*60*1000)); //Convert values to -/+ days and return value      
				}

				//Write out the returning value should be using this example equal -10 which means 
				//it has passed by ten days. If its positive the date is coming +10.    
				//console.log (DateDiff(new Date(iniPastedDate),new Date(currDate))); //Print the results...

	    			//console.log(psg.updated)

				//if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				//if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if(reallng) 		{ psg.reallng = reallng ? reallng : psg.reallng; }	
				if(reallat) 		{ psg.reallat = reallat ? reallat : psg.reallat; }	
				if(realloc) 		{ psg.realloc = realloc ? realloc : psg.realloc; }			
				//psg.updated = new Date().getTime();
				psg.save(function(err, result) {
					if(err) {
						res.json({ 
							status: false,
							msg: "error" 
						});
					} else {						
						//res.set( 'Content-type: application/json;charset=utf-8' );
						//res.set('Access-Control-Allow-Origin: *');					
						res.json({ 
							//msg: "success, there is your status.",
							status: true, 
							msg: "finde one else ",
							data: {
								_id: result._id,
								createdvia: result.createdvia,
								status: result.status,	
								drv_id: result.drv_id,								
								phone: result.phone,
								device_id: result.device_id,
								curlat: result.curlat,
								curlng: result.curlng,
								curloc: result.curloc,
								reallat: result.reallat,
								reallng: result.reallng,
								realloc: result.realloc
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
		{ _id:1, email:1, phone:1, curaddr:1, curlng:1, curlat:1, curloc:1, destination:1, des_dist:1, deslng:1, deslat:1, tips:1, detail:1, favcartype:1, favdrv:1, drv_id:1, status:1 },
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
						msg:  "Passenger detail", 
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
var favcartype	= req.body.favcartype;
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
		radian = config.psgsearchpsgradian;
	}
	if (typeof amount == 'undefined' && amount == null) {		
		amount = config.psgsearchpsgamount;
	}

	DriversModel.find(
		//{ active:"Y", status: "ON", curloc : { $near : curloc, $maxDistance: radian  }  },
		{ 						
			//curloc : { $near : curloc, $maxDistance: radian },   => for 2d index => not working
			// do not forget  => db.passengers.createIndex( { curloc : "2dsphere" } )
			status: "ON", 
			active:"Y",
			curlng: { $ne: null },
			curlat: { $ne: null },
			curloc:  { 
				$near: {
					$geometry: {
						type: "Point" ,
						coordinates: curloc
					} , 
					$maxDistance: radian 
					//$minDistance: 1 
				}
			},			
			cartype: { $in:  favcartype  } 			
		},		
		{ fname:1, lname:1, phone:1, carplate:1, cartype:1, carcolor:1, imgface:1, curlng:1, curlat:1, curloc:1, status:1 , allowpsgcontact: 1, carreturn:1, carreturnwhere:1, cgroup:1, cgroupname:1, cprovincename:1 },
		{ limit : amount },
		function(err,drvlist){
			// Donot forget to create 2d Index for passengers collection : curloc & descloc!!!!
			if(drvlist == null) {
				res.json({status: false, msg: "No data"});			
			} else {	
				res.json({
					status: true, 
					data: drvlist
				});
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
//var device_id = req.body.device_id	;
var device_id	= req.body.device_id	;	// Lite version use phone as a unique key
var phone	= req.body.phone	;
var curlng 	= req.body.curlng	;
var curlat 	= req.body.curlat	;
var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
var favcartype	= req.body.favcartype	; 
var tips	= req.body.tips	;
var job_id = new Date().getTime() + '-' + ranSMS() ;

//console.log(JSON.stringify(req.query));
//var deslng 	= req.body.deslng	;
//var deslat 	= req.body.deslat	;
//var desloc 	= [parseFloat(req.body.deslng),parseFloat(req.body.deslat)];
	PassengerModel.findOne(
		{ device_id: device_id }, 
		{ device_id:1, job_id:1, curaddr:1, curloc:1, destination:1, desloc:1, des_dist:1, tips:1, detail:1, favcartype:1, status:1, updated:1, createdjob: 1 },
		function(err, psg) {			
		    	if(psg == null) { 				
				//_passengerPassLogin (req, res);
				// CREATE Passenger *****************************************
		    		PassengerModel.create({
					device_id: device_id,
					phone: req.body.phone,
					createdvia: "MOBILE",
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
							if(req.body.favcartype) { psg.favcartype = req.body.favcartype ? req.body.favcartype : psg.favcartype; }							
							if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }
							if(req.body.destination){ psg.destination = req.body.destination ? req.body.destination : psg.destination; }				
							if(req.body.tips) 	{ psg.tips = req.body.tips ? req.body.tips : psg.tips; }
							if(req.body.detail)	{ psg.detail = req.body.detail ? req.body.detail : psg.detail; }	
							psg.job_id = job_id ;	
							psg.status = "ON";	
							psg.updated = new Date().getTime();
							psg.createdjob = new Date().getTime();
							psg.save(function(err, response) {
								if (err) {
								 	res.json({ 
										status: false , 
										msg: "error", 
										data: err							
									});
								} else {
									_joblistcreate(job_id,req);
								 	res.json({ 							
										status: true , 	
										msg: "create new a passenger",										
										data: response
									});
								}
							}
						);
					} 
				});				
		    	} else {		    		
				// Update passenger info and status to be "ON"
				if(req.body.device_id){ psg.device_id = req.body.device_id ? req.body.device_id : psg.device_id; }
				if(req.body.phone) 	{ psg.phone = req.body.phone ? req.body.phone : psg.phone; }
				if(req.body.curaddr)	{ psg.curaddr = req.body.curaddr ? req.body.curaddr : psg.curaddr; }				
				if(req.body.curlng) 	{ psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
				if(req.body.curlat) 	{ psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
				if (typeof req.body.favcartype == 'undefined' ) {		
					psg.favcartype = []; 
				} else {
					if(req.body.favcartype) { psg.favcartype = req.body.favcartype ? req.body.favcartype : psg.favcartype; }	
				}
				if(curloc) 		{ psg.curloc = curloc ? curloc : psg.curloc; }
				if(req.body.destination)	{ psg.destination = req.body.destination ? req.body.destination : psg.destination; }				
				if(req.body.tips) 	{ psg.tips = req.body.tips ? req.body.tips : psg.tips; }
				if(req.body.detail)	{ psg.detail = req.body.detail ? req.body.detail : psg.detail; }	
				psg.job_id = job_id ;			
				psg.status = "ON";
				psg.updated = new Date().getTime();
				psg.createdjob = new Date().getTime();			
				psg.save(function(err, response) {
					if (err) {
					 	res.json({ 
							status: false , 
							msg: "error", 
							data: err							
						});
					} else {
						_joblistcreate(job_id,req);
					 	res.json({ 							
							status: true , 	
							msg: "update previouse a passenger",
							data: response
						});
					}
				});
			}
		}
	);
};




exports.passengerReCall = function(req, res) {
var _id		= req.body._id		;
var device_id	= req.body.device_id	;	// Lite version use phone as a unique key
	PassengerModel.findOne(
		{ device_id: device_id }, 
		{ device_id:1, curaddr:1, curloc:1, destination:1, desloc:1, des_dist:1, tips:1, detail:1, favcartype:1, status:1, updated:1, createdjob: 1 },
		function(err, psg) {			
		    	if(psg == null) { 				
			 	res.json({ 
					status: false , 
					msg: "error", 
					data: err							
				});				
		    	} else {		    		
				// Update passenger info and status to be "ON"			
				psg.status = "ON";
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
							msg: "passenger recall",
							data: response
						});
					}
				});
			}
		}
	);
};




exports.passengerEditRoute = function(req, res) {
var _id		= req.body._id		;
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
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




exports.passengerAcceptDrv = function(socket){	
	return function(req, res) {
	var _id		= req.body._id ;
	//var device_id = req.body.device_id	;
	var device_id = req.body.device_id	;	// Lite version use phone as a unique key
	var drv_id	= req.body.drv_id ;
		PassengerModel.findOne(
			{ device_id : device_id }, 
			{ device_id:1 , status:1, job_id:1 },
			function(err, psg) {
			    	if(psg == null) { 
			    		_passengerAutoLogin (req, res);				
			    	} else {
			    		if(psg.status=="WAIT"){			
						if(req.body.drv_id) 	{ psg.drv_id = req.body.drv_id ? req.body.drv_id : psg.drv_id; }
						psg.updated = new Date().getTime();
						psg.status = "BUSY";				
						psg.save(function(err, result) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								_joblistupdate (psg.job_id, req, 'datepsgaccept', '');
								DriversModel.findOne(
									{ _id : drv_id }, 
									{ status:1, updated:1, _id:1, device_id:1, psg_id:1, cgroup:1, cgroupname:1, cprovincename:1  },
									function(err, drv) {
									    	if(drv == null) { 					
											_getErrDetail('err009', function (errorDetail){
												res.json({ 
													status: false, 
													msg: errorDetail,
												});
											});									
									    	} else {
											drv.psg_id = psg._id ;
											drv.updated = new Date().getTime();
											drv.status = "BUSY";									
											drv.save(function(err, response) {
												if(err) {
													res.json({ status: false , msg: "error" });
												} else {
													socket.emit("DriverSocketOn", response);
													//socket.emit("passengerAcceptDrv", response);												
													res.json({ 														
														status: true , 
														//msg: "Update passenger to BUSY => passenger accept driver" 
														data: response
													});
												}
											});
									    	}
									}
								);
							}
						});
			    		} else {
						psg.updated = new Date().getTime();
						psg.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								res.json({
									status: true ,
									//msg: "Update passenger to BUSY => passenger accept driver" 
									data: { status: response.status }
								});
							}	
						});
			    		}
				}
			}
		);
	};
}		




exports.passengerGetDrvLoc = function(req, res) {
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
var drv_id	= req.body.drv_id ;
	PassengerModel.findOne(
		{  device_id: device_id, drv_id: drv_id }, 
		{  _id:1, status:1 },
		function(err, psg) {
		    	if(psg == null) { 					
				//_passengerAutoLogin (req, res);		
				res.json({ 
					status: false,
					error: 001,
					msg: "No matching this passenger and driver"
				});			
		    	} else {		    	
		    		//console.log(psg._id)	
				//if (psg.status == "BUSY") {
					DriversModel.findOne(
						{ _id: drv_id, psg_id: psg._id }, 
						{ _id:1, psg_id:1, curlng:1, curlat:1, curloc:1, accuracy: 1, degree:1, status:1, active:1, fname: 1, lname: 1, carplate:1, phone: 1, carcolor:1, imgface:1, car_no:1, allowpsgcontact: 1, carreturn:1, carreturnwhere:1, cgroup:1, cgroupname:1, cprovincename:1  },						
						function(err, drv) {					
							if (drv == null) {
								_getErrDetail('err009', function (errorDetail){
									res.json({ 
										status: false,
										error: 002,
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
										data: drv
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




exports.passengerCancelCall = function(socket){	
	return function(req, res) {	
	var _id		= req.body._id			;	
	var device_id = req.body.device_id	;	// Lite version use phone as a unique key
	console.log( ' passengerCancelCall device_id = '+device_id)	
		PassengerModel.findOne(
			{ device_id: device_id }, 
			{ status:1, updated:1 , drv_id: 1, job_id:1 },
			function(err, psg) {
				old_job_id = psg.job_id ;
			    	if(psg == null) { 
			    		res.json({ status: false , msg: "error00" });			
			    	} else {	
					//drv_id = psg.drv_id;
				    	if(psg.drv_id == '') { 
				    		psg.job_id = "";
						psg.drv_id = "";
						psg.updated = new Date().getTime();
						psg.deniedTaxiIds = [];
						psg.status = "OFF";
						psg.save(function(err, response) {					
							if(err) {
								res.json({ status: false , msg: "error01" });
							} else {
								_joblistupdate (old_job_id, req, 'datepsgcancel', 'cancel before drv' );
								res.json({ 							
									status: true , 	
									msg: "yes 1",										
									data: { status: response.status } 
								});					
							}
						});		    		
				    	} else {	
				    		canceldrvid = psg.drv_id;		    						
						psg.job_id = "";
						psg.drv_id = "";
						psg.updated = new Date().getTime();
						psg.deniedTaxiIds = [];
						psg.status = "OFF";
						psg.save(function(err, response) {					
							if(err) {
								res.json({ status: false , msg: "error02" });
							} else {
								_joblistupdate (old_job_id , req, 'datepsgcancel', 'cancel after drv' );
							    	DriversModel.findOne(
							    		{ _id: canceldrvid },
							    		{ _id:1, device_id:1, cgroup:1, fname:1, lname:1, phone:1, stauts:1},
							    		function(err,drv) {
							    			if(drv==null){
							    				res.json({ status: false , msg: "error03" });
							    			}else {
							    				drv.psg_id = "";
											drv.status = "ON";											
											drv.save(function(err, result) {	
												if(err) {
													res.json({ status: false , msg: "error04" });
												} else {
													socket.emit("DriverSocketOn", result);
													//socket.emit("passengerCancelCall", result);
													res.json({ 														
														status: true , 	
														//msg: "Update passenger to ON => passenger cancel driver" 
														msg: "yes 2",											
														data: response ,
														result: result
													});
												}
											});
							    			}
							    		}				
							    	)					
							}
						});
				    	}

			    	}
			}
		);
	};
};




exports.passengerCancelDrv = function(socket){	
	return function(req, res) {		
	var _id		= req.body._id			;	
	var device_id = req.body.device_id	;	// Lite version use phone as a unique key
	var drv_id	= req.body.drv_id		;
	//var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
		PassengerModel.findOne(
			{  device_id: device_id }, 
			{ status:1, updated:1, job_id:1 },
			function(err, psg) {
			    	if(psg == null) { 
			    		_passengerAutoLogin (req, res);				
			    	} else {				
					psg.drv_id = "";
					psg.updated = new Date().getTime();
					psg.deniedTaxiIds = [];
					psg.status = "ON";
					psg.save(function(err, result) {					
						if(err) {
							res.json({ status: false , msg: "error" });
						} else {		
							_joblistupdate (psg.job_id, req, 'datepsgcancel', 'cancel the drv' );				
							DriversModel.findOne(
								{ _id : drv_id }, 								
								{ _id:1, device_id:1, cgroup:1, fname:1, lname:1, phone:1, stauts:1, updated:1 },
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
										drv.status = "ON";									
										drv.save(function(err, response) {
											if (err) {
												res.json({ status: false , msg: "error", data: err });
											}else {												
												socket.emit("DriverSocketOn", drv);
												//socket.emit("passengerCancelDrv", drv);									
												res.json({ 												
													status: true ,
													//msg: "Update passenger to ON => passenger cancel driver" 
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




exports.passengerFavDrvAdd = function(req, res) { 
var _id = req.body._id			;
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
var oldfav = req.body.favdrv;
 	PassengerModel.findOne(
		{ device_id: device_id }, 
		{ favdrv:1 },		
		function(err, psg) {				
			if (psg == null) {				
				_passengerAutoLogin (req, res);			
			} else {
				arrfav = psg.favdrv;	
				
				favorder = arrfav.indexOf(oldfav)
				//console.log('favorder='+favorder)
				if (favorder>=0){
					res.json({ status: true , msg: "You already has this favorite driver" });
					return;
				} else {
					arrfav.push(req.body.favdrv);			// push arrary at the last
				}
			
				psg.favdrv = arrfav;
				psg.updated = new Date().getTime();
				psg.save(function(err, response) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						res.json({ 
							status: true,
							msg: "Add favorite completed"							
						});							
					}
				});				
			}
		}
	);
	
};




exports.passengerFavDrvDel = function(req, res) { 
var _id = req.body._id			;
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
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
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
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
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
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
//var device_id = req.body.device_id	;
var device_id = req.body.device_id	;	// Lite version use phone as a unique key
var drv_id	= req.body.drv_id	;
var curlng 	= req.body.curlng	;
var curlat 	= req.body.curlat	;
var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	PassengerModel.findOne(
		{ device_id: device_id }, 
		{ status:1, updated:1, job_id:1 },
		function(err, psg) {
			old_job_id = psg.job_id ;
		    	if(psg == null) { 				
				_passengerAutoLogin (req, res);
		    	} else {		    		
		    		psg.job_id = "" ;		
				psg.curaddr = "" ;
				psg.destination = "" ;
				psg.desloc = [] ;
				psg.des_dist = "" ;
				psg.tips = "" ;
				psg.detail = "" ;
				psg.drv_id = "" ;
				psg.updated = new Date().getTime() ;
				psg.status = "OFF" ;	
				psg.save(function(err, response) {					
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {	
						_joblistupdate (old_job_id, req, 'datepsgthanks','');
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




exports.Psgcalllog = function(req, res) {
	var psg_id ;
	var psg_device_id ;
	var psg_phone ;
	var drv_id ;
	var drv_phone ;
	var drv_carplate ;
	var callby ;	
	PsgcalllogModel.create({
		psg_id: req.body.psg_id,
		psg_device_id: req.body.psg_device_id,
		psg_phone: req.body.psg_phone,
		drv_id: req.body.drv_id,
		drv_phone: req.body.drv_phone,
		drv_carplate: req.body.drv_carplate,
		callby: req.body.callby,				
	},
	function(err, response) {
		if (err) { 
			res.json({ status: false , msg: "error"  });
		} else {
			res.json({ 				
				status: true , 								
				data : { 
					_id: response._id,
					status: response.phone									
				} 
			});
		} 
	}
);
};



exports.transporter = function(req, res) {
var email = req.body.email		;
var nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

	PassengerModel.findOne(
		{ email: email }, 
		{ username:1, smsconfirm:1 },
		function(err, psg) {
		    	if(psg == null) { 				
				res.json({ status: false , msg: "email is invalid" });
		    	} else {								
				psg.smsconfirm = ranSMS() ;				
				psg.save(function(err, response) {					
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {	
						// setup e-mail data with unicode symbols
						var mailOptions = {
						    from: '"xxx" <foo@blurdybloop.com>', // sender address
						    to: 'bar@blurdybloop.com', // list of receivers
						    subject: 'Hello', // Subject line
						    text: 'Hello world ', // plaintext body
						    html: '<b>Hello world</b>' // html body
						};

						// send mail with defined transport object
						transporter.sendMail(mailOptions, function(error, info){
						    if(error){
						        return console.log(error);
						    }
						    console.log('Message sent: ' + info.response);
						    res.json({ status: true , msg: "error" });
						});

					}
				});
		    	}
		}
	);

/* Dialog Wongnai
ลืมรหัสผ่านใช่ไหมครับ ไม่เป็นไร เราช่วยได้

Copy and paste URL ต่อไปนี้ลงบน browser หรือกดลิงค์ทางด้านล่างนี้เพื่อเปลี่ยนรหัสผ่านใหม่

https://www.wongnai.com/guest?_f=changePassword&token=4a1c773f124ed34c54f4833a2569115a

ยินดีต้อนรับกลับมาสนุกกับการค้นหาและรีวิวร้านอาหารครับ

The Wongnai Team

*ถ้าคุณไม่ได้สมัครเป็นสมาชิกกับวงในและคิดว่านี่อาจจะเป็นข้อผิดพลาดของระบบ กรุณาแจ้งมาที่ admin@wongnai.com.
**หากมีคำถามใดๆ เกี่ยวกับการใช้งาน ขอเชิญติดต่อเราผ่านทาง หน้า webboard ที่ http://www.wongnai.com/forums/contact-us




https://www.wongnai.com/download | ค้นหาร้านเด็ดๆด้วย Wongnai ที่่ง่ายและเร็วกว่า 

Copyright @2010-2016 Wongnai.com All right reserved. https://www.wongnai.com
*/

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