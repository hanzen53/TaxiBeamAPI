////////////////////////////////////
// Taxi-Beam Hotel API 
// version : 1.0.0
// Date May 10, 2016 
// Created by Hanzen@BRET
////////////////////////////////////

var config = require('../../config/func').production;

var Url = require('url');
var mongoose  = require('mongoose');
var HotelsModel  = mongoose.model('HotelsModel');
var PsgcalllogModel  = mongoose.model('PsgcalllogModel');
var UserModel  = mongoose.model('UserModel');
var DriversModel = mongoose.model('DriversModel');
var CommentModel  = mongoose.model('CommentModel');
var AnnounceModel = mongoose.model('AnnounceModel');
var EmgListModel = mongoose.model('EmgListModel');
var ErrorcodeModel =  mongoose.model('ErrorcodeModel');
var JoblisthotelModel = mongoose.model('JoblisthotelModel');


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



function _hotelAutoLogin (req, res) {
device_id = req.body.device_id	;
_id = req.body._id			;
	HotelsModel.findOne(
		{ device_id :  device_id }, 		
		function(err, result){	    		
		    	if(result == null) { 
		    		// This phone(IMEI) have never been in the system, send to registration page.
				res.json({ 
					status: false , 
					target: "REGISTRATION"					
				});
		    	} else {	    
		    		if ( result._id == _id ) {
					result.status = "OFF";
					result.updated = new Date().getTime();
					result.save(function(err, response) {
						if (err) {
							res.json({ status: false , msg: "error" ,  data: err });
						} else {
							// device_id: Y, _id: Y =>  Welcome to Taxi-Beam ]
							res.json({ 
								status: true, 										
								data: { 									
									status: result.status											
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




function _hotelPassLogin (req, res) {
device_id = req.body.device_id	;
_id = req.body._id			;
	HotelsModel.findOne(
		{ device_id :  device_id }, 		
		function(err, result){	    		
		    	if(result == null) { 
		    		// This phone(IMEI) have never been in the system, send to registration page.
				res.json({ 
					status: false , 
					target: "REGISTRATION"					
				});
		    	} else {	    
		    		if ( result._id == _id ) {
					result.status = "OFF";
					result.updated = new Date().getTime();
					result.save(function(err, response) {
						if (err) {
							res.json({ status: false , msg: "error" ,  data: err });
						} else {
							// device_id: Y, _id: Y =>  Welcome to Taxi-Beam ]
							res.json({ 
								status: true, 										
								data: { 									
									status: result.status											
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




function isNumeric(n) { 
      return !isNaN(parseFloat(n)) && isFinite(n); 
}




// start ::: Passenger API Mobile Version
exports.hotelAutoLogin = function(req, res) {
 	//_passengerAutoLogin (req, res);
	res.json({ 
		status: false,
		msg: "Your account is not valid"
	}); 	
};




exports.hotelRegister = function(req, res) {
var device_id = req.body.device_id	;
var curlng 	= req.body.curlng		;
var curlat 	= req.body.curlat		;
var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	HotelsModel.findOne(
		{ device_id : device_id }, 
		function(err, result) {
			if (result == null) { 
		    		HotelsModel.create({
					device_id: device_id ,
					displayName: req.body.displayName ,
					curaddr: req.body.displayName ,
					email: req.body.email ,
					phone: req.body.phone ,
					curlng: curlng , 
					curlat: curlat , 
					curloc: curloc ,
					createdvia: req.body.createdvia
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
		    		result.displayName = req.body.displayName ;
				result.email = req.body.email ;
				result.phone = req.body.phone ;
				result.curaddr = req.body.displayName ;
				result.curlng = curlng ;
				result.curlat = curlat ;
				result.curloc = curloc ; 
				result.destination = "" ;
				result.des_dist = "" ;
				result.deslng = null ;
				result.deslat = null ;
				result.desloc = [] ;
				result.tips = "" ;
				result.detail = "" ;
				result.favcartype = [] ;
				result.favdrv = [] ;
				result.drv_id = "" ;
				result.status = "OFF" ;	
				result.createdvia = req.body.createdvia ;
				result.created = new Date().getTime() ;
				result.updated = new Date().getTime() ;			
				result.save(function(err, response) {
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




exports.hotelUpdateProfile = function(req, res) {
var _id		= req.body._id		;
var device_id = req.body.device_id		;
var curlng 	= req.body.curlng		;
var curlat 	= req.body.curlat		;


if (typeof curlng == 'undefined' && curlng == null) {		
	res.json({ status: false, msg: "current longitude is not valid" })
	return;	
}
if (typeof curlat == 'undefined' && curlat == null) {		
	res.json({ status: false, msg: "current latitude is not valid" })
	return;
}

var curloc 	= [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];

	HotelsModel.findOne(
		{ _id: _id , device_id : device_id }, 		
		function(err, result) {	    	
			if (result == null) { 				
				res.json({ 
					status: false,
					msg: "Your account is not valid"
				});
	    		} else {
				if(req.body.curlng) 	{ result.curlng	= req.body.curlng ? req.body.curlng : result.curlng; }
				if(req.body.curlat) 	{ result.curlat	= req.body.curlat ? req.body.curlat : result.curlat; }
				if(curloc) 		{ result.curloc	= curloc ? curloc : result.curloc; }	
				if(req.body.displayName) 	{ result.displayName 	= req.body.displayName ? req.body.displayName : result.displayName; }
				if(req.body.curaddr) 	{ result.curaddr 	= req.body.curaddr ? req.body.curaddr : result.curaddr; }
				if(req.body.phone) 	{ result.phone 	= req.body.phone ? req.body.phone : result.phone; }					
				result.updated = new Date().getTime();
				result.save(function(err, result) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						res.json({ 
							status: true ,
							msg: "success, hotel profile updated"
						});
					}
				});
			}
		}
	);
};




exports.hotelGetStatus = function(req, res) {
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
	HotelsModel.findOne(
		{ device_id : device_id }, 
		{ device_id:1, drv_id:1, status:1, curloc:1, updated: 1, phone: 1, curlat:1, curlng:1, curloc:1, reallat:1, reallng:1, realloc:1, createdvia:1 },
		function(err, result) {
			if (result == null) {
				res.json({ 
					status: false,
					msg: "error no data" 
				});				
	    		} else {
				//Set the two dates
				var currentTime   = new Date() ;
				var currDate      = currentTime.getMonth() + 1 + "/" + currentTime.getDate() + "/" + currentTime.getFullYear()  	; //Todays Date - implement your own date here.
				var iniPastedDate = result.updated 	; // "8/7/2012" //PassedDate - Implement your own date here.

				//currDate = 8/17/12 and iniPastedDate = 8/7/12

				function DateDiff(date1, date2) {
					var datediff = date1.getTime() - date2.getTime(); //store the getTime diff - or +
					return (datediff / (24*60*60*1000)); //Convert values to -/+ days and return value      
				}

				//Write out the returning value should be using this example equal -10 which means 
				//it has passed by ten days. If its positive the date is coming +10.    
				//console.log (DateDiff(new Date(iniPastedDate),new Date(currDate))); //Print the results...

	    			//console.log(result.updated)

				//if(req.body.curlng) 	{ result.curlng = req.body.curlng ? req.body.curlng : result.curlng; }
				//if(req.body.curlat) 	{ result.curlat = req.body.curlat ? req.body.curlat : result.curlat; }
				if(reallng) 		{ result.reallng = reallng ? reallng : result.reallng; }	
				if(reallat) 		{ result.reallat = reallat ? reallat : result.reallat; }	
				if(realloc) 		{ result.realloc = realloc ? realloc : result.realloc; }			
				//result.updated = new Date().getTime();
				result.save(function(err, result) {
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




exports.hotelGetByID = function(req, res) {
var _id = req.body._id	;
	HotelsModel.findOne(
		{ _id : _id }, 
		{ _id:1, email:1, phone:1, curaddr:1, curlng:1, curlat:1, curloc:1, destination:1, tips:1, detail:1, favcartype:1, favdrv:1, drv_id:1, status:1 },
		function(err, result) {
		    	if(result == null) { 
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
						msg:  "Hotel detail", 
						data: result
					});				
				} 
			}
		}
	);
};




exports.hotelSearchDrv = function(req, res) {
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
};




exports.hotelCallDrv = function(req, res) {
var _id		= req.body._id		;
var device_id	= req.body.device_id		;
var psg_name = req.body.psg_name	;
var psg_phone = req.body.psg_phone	;
var amount 	= req.body.amount		;
var curlng 	= req.body.curlng		;
var curlat 	= req.body.curlat		;
var curloc 					; 
var destination = req.body.destination	;
var detail 	= req.body.detail		;
var favcartype	= req.body.favcartype	; 
var tips		= req.body.tips		;
var deslat 					;
var deslng 					;
var desloc 					; 
var favcartype = req.body.favcartype 	;
//var job_id = new Date().getTime() + '-' + ranSMS() 				;

if (isNumeric(amount)) {
	amount = amount;
} else {
	amount = 1;
}

if (typeof curlng == 'undefined' && typeof curlat == 'undefined') {
    curloc = [];
} else {
    curloc = [parseFloat(req.body.curlng), parseFloat(req.body.curlat)];
}
if (typeof curlng == 'undefined' && curlng == null) {
    curlng = "";
}
if (typeof curlat == 'undefined' && curlat == null) {
    curlat = "";
}

deslng = req.body.deslng;
deslat = req.body.deslat;
if (typeof deslng == 'undefined' && typeof deslat == 'undefined') {
    desloc = [];
} else {
    desloc = [parseFloat(req.body.deslng), parseFloat(req.body.deslat)];
}
if (typeof deslng == 'undefined' && deslng == null) {
    deslng = "";
}
if (typeof deslat == 'undefined' && deslat == null) {
    deslat = "";
}

job_id = new Date().valueOf() ; //+ '-' + i 	;

	HotelsModel.findOne(
		{ device_id: device_id }, 		
		function(err, result) {			
		    	if(result == null) {
			 	res.json({ 
					status: false , 
					msg: "error no device id was found.", 
					data: err							
				});				
		    	} else {
		    		hotel_phone = result.phone ; 
		    		displayName = result.displayName ;
		    		curaddr = result.curaddr ;
		    		curlng = result.curlng ;
		    		curlat = result.curlat ;
		    		curloc 	= [parseFloat(result.curlng),parseFloat(result.curlat)] ;
				//var results = [];             
				for (i = 0; i < amount; i++) {					
					InsertHotelLoop(job_id, _id, displayName , hotel_phone, psg_name, psg_phone, favcartype, curaddr, destination, detail, curlng, curlat, curloc, deslat, deslng, desloc, tips );
				}
				res.json({
					status: true,
					msg: "Add jobs completed"
				})	
			}
		}
	);

	function InsertHotelLoop(job_id, hotel_id, displayName, hotel_phone, psg_name, psg_phone, favcartype,  curaddr, destination, detail, curlng, curlat, curloc, deslat, deslng, desloc, tips, createdvia) {
		var d = {
			job_id: job_id ,
			hotel_id : hotel_id ,
			displayName : displayName , 
			hotel_phone: hotel_phone ,
			psg_name: psg_name ,
			psg_phone: psg_phone ,
			favcartype : favcartype , 			
			curaddr: curaddr ,
			curlng: curlng ,
			curlat: curlat ,
			curloc: curloc ,
			destination: destination ,
			deslng: deslng ,
			deslat: deslat ,
			desloc: desloc ,
			detail: detail ,	
			tips: tips , 
			status: "ON" ,	
			createdvia: createdvia ,					
			updated: new Date().getTime() ,
			created: new Date().getTime() ,
			datepsgcall: new Date().getTime() ,
			jobhistory : [{ 
				action : "add hotel job list" ,
				status : "ON" ,
				created : new Date() 
			}]
		}
		JoblisthotelModel.create(d, function (err, response) {
			if (err) {
				//console.log(err)
			} else {
				//socket.of('/'+req.user.local.cgroup).emit('addjoblist', response);				
			}
		});
	}
};




exports.hotelviewJoblist = function(req, res) {
var _id		= req.body._id		;
var device_id	= req.body.device_id		;	// Lite version use phone as a unique key
	JoblisthotelModel.find(
		{ hotel_id: _id , status: { $in : ["ON", "BUSY", "DRVDENIED"] } }, 
		{ _id:1, job_id:1, hotel_id:1, psg_name:1, psg_phone:1, curaddr:1, curlng:1, curlat:1, curloc:1, destination:1, detail:1, status:1 },
		function(err, psg) {			
		    	if(psg == 0) { 				
			 	res.json({ 
					status: false , 
					msg: "error", 
					data: err							
				});				
		    	} else {
			 	res.json({
					status: true ,
					msg: "Joblist detail",
					data: psg
				});
			}
		}
	);
};




exports.hotelCancelCall = function(socket){	
	return function(req, res) {	
	var _id		= req.body._id			;	
	var device_id = req.body.device_id			;	
	var psg_id	= req.body.psg_id			;	
	console.log ( 'cancel  call')
		JoblisthotelModel.findOne(
			{ _id: psg_id }, 
			{ status:1, updated:1 , drv_id: 1, job_id:1 },
			function(err, psg) {
			    	if(psg == null) { 
			    		res.json({ status: false , msg: "error00" });			
			    	} else {	
					//drv_id = psg.drv_id;
				    	if(psg.drv_id == '') { 
						psg.drv_id = "";
						psg.updated = new Date().getTime();
						psg.deniedTaxiIds = [];
						psg.status = "OFF";
						psg.save(function(err, response) {					
							if(err) {
								res.json({ status: false , msg: "error01" });
							} else {
								res.json({ 							
									status: true , 	
									msg: "cancelled a call",										
									data: { status: response.status } 
								});					
							}
						});		    		
				    	} else {	
				    		canceldrvid = psg.drv_id						
						psg.drv_id = "";
						psg.updated = new Date().getTime();
						psg.deniedTaxiIds = [];
						psg.status = "OFF";
						psg.save(function(err, response) {					
							if(err) {
								res.json({ status: false , msg: "error02" });
							} else {
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
													res.json({ 														
														status: true , 	
														//msg: "Update passenger to ON => passenger cancel driver" 
														msg: "cancelled a driver",											
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




exports.hotelCancelDrv = function(socket){	
	return function(req, res) {		
	var _id		= req.body._id			;	
	var device_id = req.body.device_id	;	// Lite version use phone as a unique key
	var drv_id	= req.body.drv_id		;
	//var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
		JoblisthotelModel.findOne(
			{  device_id: device_id }, 
			{ status:1, updated:1, job_id:1 },
			function(err, psg) {
			    	if(psg == null) { 
					res.json({ 
						status: false,
						msg: "Your account is not valid"
					});			
			    	} else {				
					psg.drv_id = "";
					psg.updated = new Date().getTime();
					psg.deniedTaxiIds = [];
					psg.status = "ON";
					psg.save(function(err, result) {					
						if(err) {
							res.json({ status: false , msg: "error" });
						} else {		
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
