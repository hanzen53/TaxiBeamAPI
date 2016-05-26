////////////////////////////////////
// TaxiBeam API for Driver
// version : 1.1.2
// Date January 4, 2016 
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

// for all API
var 	radian = "100000";		// in meters
var 	amount = "200";


exports.ubeamSearchPassenger = function(req, res) {
var radian = req.body.radian		;
var amount = req.body.amount	;	
var curlng = req.body.curlng		;
var curlat = req.body.curlat		;
var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	/*if (typeof curlng == 'undefined' && curlng == null) {		
		res.json({ status: false, msg: "current longitude is not valid" })
		return;	
	}
	if (typeof curlat == 'undefined' && curlat == null) {		
		res.json({ status: false, msg: "current latitude is not valid" })
		return;
	}*/
	if (typeof radian == 'undefined' && radian == null) {
		radian = "100000";
	}	
	if (typeof amount == 'undefined' && amount == null) {
		amount = "200";
	}

	PassengerModel.find(
		{ 						
			//curloc : { $near : curloc, $maxDistance: radian },   => for 2d index => not working
			//do not forget  => db.passengers.createIndex( { curloc : "2dsphere" } )
			/*curloc:  { 
				$near: {
					$geometry: {
						type: "Point" ,
						coordinates: curloc
					} , 
					$maxDistance: radian 
					//$minDistance: 1 
				}
			} ,*/
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
};




exports.searchnamecar = function(req, res) { 
// reference : http://docs.mongodb.org/manual/reference/sql-comparison/
var keyword = req.body.keyword		;
	DriversModel.find(		
		//{ fname :  new RegExp( '^'+ keyword+'^' )   },
		{ $or: [ { fname :  new RegExp( keyword ) }, { lname :  new RegExp( keyword ) }, { carplate :  new RegExp( keyword ) }  ,   { car_no :  new RegExp( keyword ) }   ]  },		
		{ psg_id:0, car_id:0, grg_id:0, active:0, carcolor:0, nname:0, workperiod:0, workstatus:0, english:0, outbound:0, carryon:0, imgface:0, imglicence:0, imgcar:0, imgczid:0, accuracy:0, brokenname:0, brokendetail:0, brokenpicture:0, smsconfirm:0, updated:0, created:0 },
		function(err, response) {
			if (response == 0) {					
				res.json({ 					
					status: false ,
					msg: 'No data'				
				});
	    		} else {
				res.json({ 					
					data: response
				});
			}
		}
	);
};




exports.senddrvmsg = function(req, res) { 
var drvid = req.body.drvid			;
var msgphone = req.body.todrvphone	;
var msgnote = req.body.todrvtext		;

	DriversModel.findOne(
		{ _id : drvid },
		{ status:1, updated:1 },
		function(err, drv) {
		    	if(drv == null) { 				
				_driverAutoLogin(req,res);
		    	} else {	 

		    		console.log('yes')

				if(req.body.todrvphone) { drv.msgphone= req.body.todrvphone ? req.body.todrvphone : drv.msgphone; }
				if(req.body.todrvtext)	 { drv.msgnote	= req.body.todrvtext ? req.body.todrvtext : drv.msgnote; }
				drv.msgstatus	= "NEW";
				drv.updated = new Date().getTime();
				drv.save(function(err, response) {
					if(err) {
						res.json({ 
							status: false , 
							msg: "" ,
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




exports.addjoblist = function(req, res) {
var curaddr 		= req.body.curaddr				;
var destination 	= req.body.destination			;
var phone 		= req.body.phone				;
var detail 		= req.body.detail				;

// generate unique id 
var jobid 	= new Date().valueOf()					;
var temid 	= new Date().getUTCMilliseconds()			;

	PassengerModel.findOne(
		{ phone : phone }, 
		function(err, psg) {
			if (psg == null) { 
		    		PassengerModel.create({
		    			email: jobid+"@temp.com",
					phone: phone,		    			
		    			curaddr: curaddr,
		    			destination: destination,
					device_id: jobid,
		    			detail: detail,
		    			status: "INITIATE",
		    			updated: new Date().getTime(), 
		    			created: new Date().getTime()
					},
					function(err, response) {
						if (err) { 
							res.json({ status: false , msg: "error"  });
						} else {
							res.json({ 								
								"success":"1",
								"row_id": response._id,
								"curaddr": response.curaddr,
								"destination": response.destination,
								"phone": response.phone,
								"detail": response.detail,
								"status": response.status,
								"updated": response.updated								
							});
						} 
					}
				);
	    		}  else {
		    		if ( psg.phone == phone ) {
		    			psg.curaddr = curaddr;
		    			psg.destination = destination;
					psg.device_id = jobid;
		    			psg.detail = detail;
		    			psg.status = "INITIATE";					
					psg.updated = new Date().getTime();
					psg.save(function(err, response) {
						if (err) {
							res.json({ status: false , msg: "error" ,  data: err });
						} else {
							res.json({ 								
								"success":"1",
								"row_id": response._id,
								"curaddr": response.curaddr,
								"destination": response.destination,
								"phone": response.phone,
								"detail": response.detail,
								"status": response.status,
								"updated": response.updated								
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




exports.getinitiatelist = function (req, res) {
	// sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
	PassengerModel.find(		
		{ status:"INITIATE" },		
		{ _id: 1, status: 1, phone: 1, curaddr: 1, destination: 1, updated: 1, drv_id: 1 },
		//{sort: '-created'},
		function(err,psglist){		
			if(psglist == 0) {				
				res.setHeader('Content-Type', 'application/json;charset=utf-8');
				res.setHeader('Access-Control-Allow-Origin', '*');
    				res.send(JSON.stringify({					
					status: false,
				}));				
			} else {				
				//res.setHeader('Content-Type', 'application/json;charset=utf-8');
				//res.setHeader('Access-Control-Allow-Origin', '*');
    				//res.send(JSON.stringify({					
				//	status: true, 										
				//	data: psglist
				//}));	
				res.json({ 								
					status: true,
					data: psglist						
				});
			}
		}
	);
}



exports.getpsgstatuslist = function (req, res) {
var status 	= req.body.status				;
	// sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
	PassengerModel.find(		
		{ status: status },		
		{ _id: 1, status: 1, phone: 1, curaddr: 1, destination: 1, updated: 1, drv_id: 1, created: 1 },
		//{sort: '-created'},
		function(err,psglist){		
			if(psglist == 0) {				
				res.setHeader('Content-Type', 'application/json;charset=utf-8');
				res.setHeader('Access-Control-Allow-Origin', '*');
    				res.send(JSON.stringify({					
					status: false,
				}));				
			} else {				
				//res.setHeader('Content-Type', 'application/json;charset=utf-8');
				//res.setHeader('Access-Control-Allow-Origin', '*');
    				//res.send(JSON.stringify({					
				//	status: true, 										
				//	data: psglist
				//}));	
				res.json({ 								
					status: true,
					data: psglist						
				});
			}
		}
	);
}




exports.checkinitiatepsg = function (req, res) {
var psg_id 		= req.body.psg_id				;

	PassengerModel.findOne(
		{ _id : psg_id }, 
		function(err, psg) {
			if (psg == null) { 
				res.json({ 								
					status: false,
					msg: "no passengers"							
				});
	    		}  else {
	    			if (psg.status == 'INITIATE') {
					res.json({ 								
						status: true,
						msg: "available"						
					});
	    			} else {
					res.json({ 								
						status: false,
						msg: "n/a"							
					});
	    			}
	    		}
		}
	);
}




exports.checkavailabledrv = function (req, res) {
var drv_id = req.body.drv_id			;

	DriversModel.findOne(
		{ _id : drv_id },
		{ status:1, updated:1 },
		function(err, drv) {
		    	if(drv == null) { 				
				res.json({ 								
					status: false,
					msg: "no drivers"							
				});
		    	} else {	 
	    			if (drv.status == 'ON') {
					res.json({ 								
						status: true,
						msg: "available"						
					});
	    			} else {
					res.json({ 								
						status: false,
						msg: "n/a"							
					});
	    			}
		    	}	
		}
	);
}




exports.matchpsgdrv = function(req, res) {
var _id = req.body._id			;
var psg_id = req.body.psg_id		;

	PassengerModel.findOne(
		{ _id : psg_id, status: "INITIATE" },
		{ status: 1 },
		function(err,response) {				
			if(response==null) {
				res.json({ 								
					status: false,
					msg: "psg n/a"							
				});				
			} else {		
				DriversModel.findOne(
					{  _id: drv_id, status: "ON"}, 
					{ status:1, updated:1 },
					function(err, drv) {
						if(drv==null) {
							res.json({ 								
								status: false,
								msg: "drv n/a"							
							});
						} else {						
							drv.psg_id = psg_id;
							drv.updated = new Date().getTime();
							drv.status = "BUSY";
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
												psg.status = "BUSY";												
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






exports.addlocalpoi = function(req, res) {

	LocalpoiModel.findOne(
		{ _id: req.body._id }, 
		function(err, localpoi) {
			if (localpoi == null) { 
		    		LocalpoiModel.create({		    			
					name: req.body.name,
					addr: req.body.addr,
					provinceid: req.body.provinceid,
					districtid: req.body.districtid,
					subdistrictid: req.body.subdistrictid,
					curlng: req.body.curlng,
					curlat: req.body.curlat,
					curloc: req.body.curloc,
					status: "Y",
		    			updated: new Date().getTime(), 
		    			created: new Date().getTime()
					},
					function(err, response) {
						if (err) { 
							res.json({ status: false , msg: "error"  });
						} else {
							res.json({ 								
								"success":"1",
								data: response							
							});
						} 
					}
				);
	    		}  
		}
	);
};