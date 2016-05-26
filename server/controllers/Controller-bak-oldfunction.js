var Url = require('url'),
	mongoose  = require('mongoose'),
   	DeviceModel  = mongoose.model('DeviceModel'),
  	PassengerModel  = mongoose.model('PassengerModel'),
  	UserModel  = mongoose.model('UserModel'),
 	PathLogModel = mongoose.model('PathLogModel'),
	DriversModel = mongoose.model('DriversModel');
	CommentModel  = mongoose.model('CommentModel');
	AnnounceModel	 = mongoose.model('AnnounceModel');
	EmgListModel = mongoose.model('EmgListModel');

// for upload file
var path = require('path');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs-extra');
var qt = require('quickthumb');
var http = require('http');
var qs = require('querystring');

var taxi_id = "";
var device_id = "";
var smsconfirm = "";
var newimgupload = "";
var bupload = "";
var imgtype = "";
var curloc = "";
var cartype = "";
var radian = "";
var amount = "";
var match_psg_id = "";
var commtype = "";
var topic = "";
var comment = "";

var psg_id = "";
var favcartype = "";
var favtaxi = "";
var radian = "";
var amount = "";

var curaddr = "";
var destination = "";
var desloc = "";
var des_dist = "";
var tips = "";
var detail = "";
var favcartype = "";
var match_taxi_id = "";
var emgtype = "";

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




// NOTE *******************************  Start a new API by Hanzen
// start ::: Passenger API
exports.passengerRegister = function(req, res) {
device_id = req.body.device_id	;
	PassengerModel.findOne(
		{
			device_id : device_id
		}, 
		function(err, passenger) {
			if (passenger == null) { // don't have drivers :>-> create 
	    		PassengerModel.create(req.body, 
					function(err, response) {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg:  "The account has been created.", 
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
		{	device_id:device_id, phone:phone }, 
		function(err, response) {
			console.log(response)
	    	if(response == null) { // passenger doesn't exist. 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "Welcome to TaxiBeam.", 
					data : response
				});
			}
			
		}
	);
};




exports.passengerSearchTaxi = function(req, res) {
psg_id		= req.body.psg_id	;
device_id	= req.body.device_id	;
favcartype	= req.body.favcartype	;
favtaxi		= req.body.favtaxi	;
curloc		= req.body.curloc	;
radian		= req.body.radian	;
amount		= req.body.amount	;
	// short form : if(req.body.uid) { device.uid = req.body.uid ? req.body.uid : device.uid; }
		// check saparete lng,lat
		if (typeof curloc == 'undefined' && curloc == null) {
			res.json({ status: false, msg: "current locaiton is not valid" })
			return ;
		}

		if (typeof radian == 'undefined' && radian == null) {		
		radian = "5";
		}

		if (typeof amount == 'undefined' && amount == null) {		
		amount = "200";
		}

		if (typeof favtaxi == 'undefined' && favtaxi == null) {
		   condition = { status: "ON", curloc : { $near : curloc, $maxDistance: radian },	cartype: { $in: favcartype }, _id : { $in: favtaxi } };
		}
		else{
		   condition = { status: "ON", curloc : { $near : curloc, $maxDistance: radian },	cartype: { $in: favcartype } };
		}

	PassengerModel.findOne(
		{ _id : psg_id, device_id : device_id }, 
		{ match_psg_id:1, status:1 },
		function(err, response) {
			if (response == null) { 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				DriversModel.find(
					condition,
					{ device_id:0, updated:0, created:0 },					
					{limit : amount},
					function(err,taxilist){
						// Donot forget to create 2d Index for drivers collection!!!!
						if(taxilist == 0){
							res.json({status: false, msg: "No data"});
						} else {
							res.json({
								status: true, 
								msg: "This is a taxi list.", 
								data: taxilist
								});
						}
					}
				);
			}
		}
	);
};




exports.passengerUpdateProfile = function(req, res) {
psg_id			= req.body.psg_id			;
device_id		= req.body.device_id		;
	PassengerModel.findOne(
		{ _id : psg_id, device_id : device_id }, 
		{ device_id:1, status:1 },
		function(err, psg) {	    	
			if (psg == null) { // don't have drivers :> 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				if(req.body.curloc)	{ psg.curloc	= req.body.curloc ? req.body.curloc : psg.curloc; }
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
psg_id = req.body.psg_id	;
device_id = req.body.device_id	;
	PassengerModel.findOne(
		{ _id : psg_id, device_id : device_id }, 
		{ device_id:1, match_taxi_id:1, status:1, curloc:1, updated: 1},
		function(err, psg) {
			if (psg == null) { // don't have drivers :> 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				if(req.body.curloc)	{ psg.curloc	= req.body.curloc ? req.body.curloc : psg.curloc; }				
				psg.updated = new Date().getTime();
				psg.save(function(err, result) {
					if(err) {
						res.json({ status: false , msg: "error" });
					} else {
						err ? res.send(err) : res.json({ 
							status: true , 
							msg: "success, your device is valid.",
							data: result
							});
					}
				});
			}
		}
	);
};




exports.passengerCallTaxi = function(req, res) {
psg_id		= req.body.psg_id				;
device_id	= req.body.device_id			;
	PassengerModel.findOne(
		{ _id:psg_id, device_id:device_id }, 
		{ device_id:1, curaddr:1, curloc:1, destination:1, desloc:1, des_dist:1, tips:1, detail:1, favcartype:1, status:1, updated:1 },
		function(err, psg) {
	    	if(psg == null) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				// Update passenger info and status to be "ON"
				if(req.body.curaddr)	{	psg.curaddr = req.body.curaddr ? req.body.curaddr : psg.curaddr; }
				if(req.body.curloc)		{	psg.curloc = req.body.curloc ? req.body.curloc : psg.curloc; }
				if(req.body.destination){	psg.destination = req.body.destination ? req.body.destination : psg.destination; }
				if(req.body.desloc)		{	psg.desloc = req.body.desloc ? req.body.desloc : psg.desloc; }
				if(req.body.des_dist)	{	psg.des_dist = req.body.des_dist ? req.body.des_dist : psg.des_dist; }
				if(req.body.tips) 		{	psg.tips = req.body.tips ? req.body.tips : psg.tips; }
				if(req.body.detail)		{	psg.detail = req.body.detail ? req.body.detail : psg.detail; }
				if(req.body.favcartype)	{	psg.favcartype = req.body.favcartype ? req.body.favcartype : psg.favcartype; }
				psg.status = "ON";
				psg.updated = new Date().getTime();
				//console.log(req.body)
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
psg_id		= req.body.psg_id		;
device_id	= req.body.device_id	;
	PassengerModel.findOne(
		{ _id:psg_id, device_id:device_id }, 
		{ device_id:1, status:1 },
		function(err, psg) {
	    	if(psg == null) { // don't have passengers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				/* update psg by _id */
				if(req.body.curloc)		{	psg.curloc = req.body.curloc ? req.body.curloc : psg.curloc; }
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
psg_id		= req.body.psg_id ;
device_id	= req.body.device_id ;
match_taxi_id	= req.body.match_taxi_id ;
	PassengerModel.find(
		{ _id : psg_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				PassengerModel.findOne(
					{ _id : psg_id }, 
					{ status:1, updated:1 },
					function(err, psg) {
						/* update psg by _id */
						if(req.body.curloc)		{	psg.curloc = req.body.curloc ? req.body.curloc : psg.curloc; }
						if(req.body.match_taxi_id)	{	psg.match_taxi_id = req.body.match_taxi_id ? psg.match_taxi_id : req.body.match_taxi_id; }
						psg.updated = new Date().getTime();
						psg.status = "BUSY";
						//console.log(req.body)
						psg.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								DriversModel.findOne(
									{ _id : match_taxi_id }, 
									{ status:1, updated:1 },
									function(err, taxi) {
										/* update taxi by _id */
										taxi.match_psg_id = "";
										taxi.updated = new Date().getTime();
										taxi.status = "BUSY";
										//console.log(req.body)
										taxi.save(function(err, response) {
											err ? res.send(err) : res.json({ status: true , msg: "Update passenger to BUSY => passenger accept taxi" });
										});
									}
								);
							}
						});
					}
				);
			}
		}
	);
};




exports.passengerGetTaxiLoc = function(req, res) {
psg_id		= req.body.psg_id ;
device_id	= req.body.device_id ;
match_taxi_id	= req.body.match_taxi_id ;
	PassengerModel.findOne(
		{ _id : psg_id, device_id : device_id },
		{ _id: 0 },
		function(err, response) {
			if (typeof response == 'undefined' && response == null) {
				res.json({ status: false , msg: "Your account does not exist, please register and try again."});
	    	} else {
				PassengerModel.findOne(
					{ _id : psg_id, match_taxi_id: match_taxi_id, status: "BUSY" }, 
					{ _id: 0, status:1 },
					function(err, psg) {
					console.log('psg = '+psg)
						if (typeof psg == 'undefined' && psg == null) {
							res.json({ status: false , msg: "error1", data: err});
						} else {
							DriversModel.findOne(
								{ _id:match_taxi_id, match_psg_id:psg_id, status:"BUSY" }, 
								{ _id:1, curloc:1, direction: 1, status:1 },
								function(err, taxi) {
								console.log('taxi = '+taxi)
									if (typeof taxi == 'undefined' && taxi == null) {
										res.json({ status: false , msg: "error2", data: err});
									} else {
										err ? res.send(err) : res.json({ status: true , msg: "success: get taxi location ", data: taxi });
									}
								}
							);
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
psg_id			= req.body.psg_id			;
device_id		= req.body.device_id			;
match_taxi_id	= req.body.match_taxi_id		;
	PassengerModel.find(
		{ _id : psg_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				// Update passenger info and status to be "BUSY"
				PassengerModel.findOne(
					{ _id : psg_id }, 
					{ status:1, updated:1 },
					function(err, psg) {
						/* update psg by _id */
						//if(req.body.match_taxi_id)	{	psg.match_taxi_id = req.body.match_taxi_id ? psg.match_taxi_id : req.body.match_taxi_id; }
						if(req.body.curloc)		{	psg.curloc = req.body.curloc ? req.body.curloc : psg.curloc; }
						psg.match_taxi_id = "";
						psg.updated = new Date().getTime();
						psg.status = "ON";
						psg.save(function(err, response) {
							//err ? res.send(err) : res.json({ status: true , msg: "Update passenger to BUSY => passenger accept taxi" });
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								// Update taxi info and status to be "BUSY"
								DriversModel.findOne(
									{ _id : match_taxi_id }, 
									{ status:1, updated:1 },
									function(err, taxi) {
										/* update taxi by _id */
										taxi.match_psg_id = "";
										taxi.updated = new Date().getTime();
										taxi.status = "ON";
										//console.log(req.body)
										taxi.save(function(err, response) {
											err ? res.send(err) : res.json({ status: true , msg: "Update passenger to ON => passenger cancel taxi" });
										});
									}
								);
							}
						});
					}
				);
			}
		}
	);
};




exports.passengerEndTrip = function(req, res) {
psg_id			= req.body.psg_id			;
device_id		= req.body.device_id			;
match_taxi_id	= req.body.match_taxi_id		;
	PassengerModel.find(
		{ _id : psg_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				// Update passenger info and status to be "BUSY"
				PassengerModel.findOne(
					{ _id : psg_id }, 
					{ status:1, updated:1 },
					function(err, psg) {
						/* update psg by _id */
						//if(req.body.match_taxi_id)	{	psg.match_taxi_id = req.body.match_taxi_id ? psg.match_taxi_id : req.body.match_taxi_id; }
						psg.curaddr = "";
						if(req.body.curloc)		{	psg.curloc = req.body.curloc ? req.body.curloc : psg.curloc; }
						psg.destination = "";
						psg.desloc = [];
						psg.des_dist = "";
						psg.tips = "";
						psg.detail = "";
						psg.match_taxi_id = "";
						psg.updated = new Date().getTime();
						psg.status = "OFF";
						psg.save(function(err, response) {
							//err ? res.send(err) : res.json({ status: true , msg: "Update passenger to BUSY => passenger accept taxi" });
							if(err) {
								res.json({ status: false , msg: "error", data: err });
							} else {
								DriversModel.findOne(
									{ _id : match_taxi_id }, 
									{ status:1, updated:1 },
									function(err, taxi) {
										/* update taxi by _id */
										taxi.match_psg_id = "";
										taxi.updated = new Date().getTime();
										taxi.status = "ON";
										//console.log(req.body)
										taxi.save(function(err, response) {
											err ? res.send(err) : res.json({ status: true , msg: "Update passenger to ON => passenger cancel taxi" });
										});
									}
								);
							}
						});
					}
				);
			}
		}
	);
};




exports.passengerGetByID = function(req, res) {
psg_id = req.body.psg_id	;
	PassengerModel.find(
		{ _id : psg_id }, { _id:0, updated:0, created:0 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "There is some data missing, please try again."});
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "success, passenger's information", 
					data : response 
				});
			}
		}
	);
};




exports.passengerSendComment = function(req, res) {
psg_id = req.body.psg_id			;
device_id = req.body.device_id	;
commtype = "Passenger"					;
topic = req.body.topic			;
comment = req.body.comment		;
	PassengerModel.findOne(
		{ _id : psg_id, device_id : device_id }, 
		function(err, passenger) {
	    	if (err) {
				res.send(err); 
				}
	    	if(passenger === null) { // don't have drivers :>-> err
				res.json({ status: false , msg: "Your phone number does not exist, please register", data : err });
	    	} else {
	    		CommentModel.create(req.body, function(err, response) {
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





// the new API service for DRIVER(TAXI)
exports.driverRegister = function(req, res) {
device_id = req.body.device_id	;
	DriversModel.findOne(
		{ device_id : device_id }, 
		function(err, drivers) {
	    	if (err) { res.send(err) }
	    	if(drivers === null) { // don't have drivers :>-> create 
	    		//DriversModel.create(req.body,{smsconfirm: ranSMS()}, function(err, response) {
	    		DriversModel.create({
				device_id: req.body.device_id	,
				fname: req.body.fname	,
				lname: req.body.lname	,
				phone: req.body.phone	,
				english: req.body.phone	,
				carplate : req.body.carplate	,
				cartype : req.body.cartype	,
				carcolor : req.body.carcolor	,
				outbound : req.body.outbound	,
				carryon : req.body.carryon	,
				imgface : req.body.imgface	,
				imglicence : req.body.imglicence	,
				imgcar : req.body.imgcar	,
				curloc : req.body.curloc	,
				smsconfirm: ranSMS()
				},
				function(err, response) {
					if (err) {
						res.send(err)
					} else {
					DriversModel.find(
						{ device_id : device_id }, 
						{ _id:1, status:1 }, // 0: not show in Json result, 1: show in Json result
						function(err, response) {
							if (err) { 
								res.send(err); 
							} else {
								err ? res.send(err) : res.json({ 
									status: true , 
									msg:  "Your account has been created.", 
									data : response//{ taxi_id: response[0]._id, status: response[0].status } 
								});
							} 
						});

					}
				});
	    	} else 	{ res.json({ 
	    			status: false , 
	    			msg: "Your phone has been used by aother user. Please contact our support team at 02-XXX-XXXX." 
	    			});
			}
			
		}
	);
};




exports.sendSMSConfirmation = function (req, res) { 
/*
http.get("http://www.google.com/index.html", function(res) {
  console.log("Got response: " + res.statusCode);
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
*/
taxi_id = req.body.taxi_id		;
device_id = req.body.device_id	;
phone =	req.body.phone			;
	DriversModel.find(
		{ _id : taxi_id, device_id : device_id , phone : phone }, 
		{ _id:1, status:1, phone:1, smsconfirm:1 },
		function(err, response) {
	    	if (err) {
				res.send(err); 
				res.json( response );
				}
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "The phone number does not exist. Please register and try again."});
	    	} else {
				/*err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "Welcome to TaxiBeam.", 
					data : { taxi_id: response[0]._id, status: response[0].status } 
				});
				*/
			var smsconfirm = response[0].smsconfirm;
			var smsphone = response[0].phone;
			var https = require('https');
			var postData = JSON.stringify({
			  "sender"	: "ECART",
			  "to"		: smsphone,
			  "msg"		: "TaxiBeam OTP code is "+smsconfirm+", Please verify your a/c."
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
taxi_id		= req.body.taxi_id		;
device_id	= req.body.device_id		;
smsconfirm	= req.body.smsconfirm	;
	DriversModel.find(
		{ _id : taxi_id, device_id : device_id, smsconfirm : smsconfirm }, 
		{ device_id:1 },
		function(err, response) {
		console.log(response)		
	    	if( response == 0 ) { // don't have drivers 
				res.json({ status: false , msg: "Your sms confirmation is not valid, Please try again."});
	    	} else {				
				DriversModel.findOne(
					{
						_id : taxi_id
					}, { status:1, updated:1 },
					function(err, taxi) {
						/* update taxi by _id */
						taxi.active = "Y";
						taxi.updated = new Date().getTime();
						taxi.save(function(err, response) {							
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								// Update taxi info and status to be "BUSY"
								err ? res.send(err) : res.json({ status: true , msg: "success, this account has been activated." });
							}
						});
					}
				);

			}
		}
	);
};




exports.driverAutoLogin = function(req, res) {
device_id = req.body.device_id	;
phone = req.body.phone			;
curloc = req.body.curloc		;
	DriversModel.find(
		{ device_id :  device_id, 	phone : phone }, 
		{ smsconfirm:0 },
		function(err, response) {
	    	if (err) {
				res.send(err); 
				res.json( response );
				}
	    	if(response == 0) { // don't have drivers  // user =>if (typeof response !== 'undefined' && response !== null) { in case of find _id 			
				res.json({ status: false , msg: "The phone does not exist. Please register and try again."});
	    	} else {
				/*
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "Welcome to TaxiBeam.", 				
					data: response
				});
				*/
				DriversModel.findOne(
					{ device_id :  device_id, 	phone : phone }, 
					{ smsconfirm:0 },
					function(err, taxi) {
						if(req.body.curloc) 	{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						taxi.status = "ON";
						taxi.updated = new Date().getTime();
						taxi.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								err ? res.send(err) : res.json({ status: true , msg: "Welcome to TaxiBeam", data: { taxi_id: taxi._id, status: taxi.status} });
							}
						});
					}
				);
			}
			
		}
	);
};




exports.driverSearchPassenger = function(req, res) {
taxi_id = req.body.taxi_id		;
device_id = req.body.device_id	;
curloc = req.body.curloc			;
cartype = req.body.cartype		;
radian = req.body.radian			;
amount = req.body.amount			;
	// check saparete lng,lat
	if (typeof curloc !== 'undefined' && curloc !== null) {	
	} else {
		res.json({ status: false, msg: "current locaiton is not valid" })
		return ;
	}
		
	if (typeof radian !== 'undefined' && radian !== null) {		
	} else {
		radian = "5";
	}

	if (typeof amount !== 'undefined' && amount !== null) {		
	} else {
		amount = "200";
	}

	DriversModel.findOne(
		{ _id : taxi_id, device_id : device_id }, 
		{ status:1 },
		function(err, response) {
			if (typeof response == 'undefined' && response == null) {
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				PassengerModel.find(
					{ 						
						curloc : { $near : curloc, $maxDistance: radian }, 
						favcartype : cartype,
						status : "ON"
					},{ device_id:0, updated:0, created:0 },{limit : amount},
					function(err,psglist){
						if(psglist == 0){
							res.json({status: false, msg: "No data"});
						} else {
							res.json({status: true, msg: "This is passenger list", data: psglist});
						}
					}
				);
			}
		}
	);
};




exports.driverUpdateProfile = function(req, res) {
taxi_id = req.body.taxi_id				;
device_id = req.body.device_id			;
	DriversModel.findOne(
		{ _id : taxi_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
			if (typeof response == 'undefined' && response == null) {
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				DriversModel.findOne(
					{ _id : taxi_id }, 
					{ status:1, updated:1 },
					function(err, taxi) {
						/* update taxi by _id */
						if(req.body.fname) 		{ taxi.fname 	= req.body.fname ? req.body.fname : taxi.fname; }
						if(req.body.lname) 		{ taxi.lname 	= req.body.lname ? req.body.lname : taxi.lname; }
						if(req.body.phone) 		{ taxi.phone 	= req.body.phone ? req.body.phone : taxi.phone; }
						if(req.body.english) 	{ taxi.english 	= req.body.english ? req.body.english : taxi.english; }
						if(req.body.carplate) 	{ taxi.carplate = req.body.carplate ? req.body.carplate : taxi.carplate; }
						if(req.body.cartype) 	{ taxi.cartype 	= req.body.cartype ? req.body.cartype : taxi.cartype; }
						if(req.body.carcolor) 	{ taxi.carcolor = req.body.carcolor ? req.body.carcolor : taxi.carcolor; }
						if(req.body.outbound) 	{ taxi.outbound = req.body.outbound ? req.body.outbound : taxi.outbound; }
						if(req.body.carryon) 	{ taxi.carryon	= req.body.carryon ? req.body.carryon : taxi.carryon; }
						if(req.body.imgface) 	{ taxi.imgface	= req.body.imgface ? req.body.imgface : taxi.imgface; }
						if(req.body.imglicence)	{ taxi.imglicence = req.body.imglicence ? req.body.imglicence : taxi.imglicence; }
						if(req.body.imgcar) 	{ taxi.imgcar	= req.body.imgcar ? req.body.imgcar : taxi.imgcar; }
						if(req.body.direction) 	{ taxi.direction.degree 	= req.body.direction.degree ? req.body.direction.degree : taxi.direction.degree; }
						if(req.body.direction) 	{ taxi.direction.accuracy 	= req.body.direction.accuracy ? req.body.direction.accuracy : taxi.direction.accuracy; }
						if(req.body.curloc) 	{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						if(req.body.brokenname) { taxi.brokenname	= req.body.brokenname ? req.body.brokenname : taxi.brokenname; }
						if(req.body.brokendetail)	{ taxi.brokendetail	= req.body.brokendetail ? req.body.brokendetail : taxi.brokendetail; }	
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
				);

			}
		}
	);
};	




exports.driverchangeOnOff = function(req, res) {
taxi_id		= req.body.taxi_id			;
device_id	= req.body.device_id			;
	DriversModel.findOne(
		{ _id : taxi_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
			if (typeof response == 'undefined' && response == null) {
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				DriversModel.findOne(
					{ _id : taxi_id }, 
					{ status:1, updated:1 },
					function(err, taxi) {
						/* update taxi by _id */
						if(req.body.curloc) 	{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						if(req.body.status) 	{ taxi.status 	= req.body.status ? req.body.status : taxi.status; }
						taxi.updated = new Date().getTime();
						taxi.save(function(err, result) {
							if(err) {
								res.json({ status: false ,  msg: "error"  });
							} else {
								err ? res.send(err) : res.json({ 
									status: true ,  
									msg: "success, taxi's status updated", 
									data:result  
									});
							}
						});
					}
				);

			}
		}
	);
};	




exports.driverGetStatus = function(req, res) {
taxi_id = req.body.taxi_id	;
device_id = req.body.device_id	;
curloc = req.body.curloc;
	DriversModel.findOne(
		{ _id : taxi_id, device_id : device_id }, 
		{ match_psg_id:1, status:1 },
		function(err, response) {
			if (typeof response == 'undefined' && response == null) {	
				res.json({ status: false , msg: "There is some data missing, please try again."});
	    	} else {
				DriversModel.findOne(
					{ _id : taxi_id }, 
					{ curloc:1, status:1, updated:1, match_psg_id:1 },
					function(err, taxi) {
						/* update taxi by _id */
						if(req.body.curloc) 	{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						if(req.body.status) 	{ taxi.status 	= req.body.status ? req.body.status : taxi.status; }
						taxi.updated = new Date().getTime();
						taxi.save(function(err, result) {
							if(err) {
								res.json({ status: false ,  msg: "error"  });
							} else {
								err ? res.send(err) : res.json({ 
									status: true ,  
									msg: "success, taxi's status updated", 
									data: result
									});
							}
						});
					}
				);
			}
		}
	);
};



 
exports.driverAcceptCall = function(req, res) {
taxi_id = req.body.taxi_id			;
device_id = req.body.device_id		;
match_psg_id = req.body.match_psg_id	;
	PassengerModel.findOne(
		{
			_id : match_psg_id
		},{ status: 1 },
		function(err,response) {
			//console.log(response.status)
			if(response.status != "ON") {
				res.json({ status: false , msg: "This passenger is not avvailable" });
			} else {
		
				// Update driver info and status to be "BUSY"
				DriversModel.findOne(
					{
						_id : taxi_id
					}, { status:1, updated:1 },
					function(err, taxi) {
						if(req.body.curloc) 	{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						taxi.match_psg_id = match_psg_id;
						taxi.updated = new Date().getTime();
						taxi.status = "WAIT";
						taxi.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								PassengerModel.findOne(
									{
										_id : match_psg_id
									}, { status:1, updated:1 },
									function(err, psg) {
										/* update taxi by _id */
										psg.match_taxi_id = taxi_id;
										psg.updated = new Date().getTime();
										psg.status = "WAIT";
										//console.log(req.body)
										psg.save(function(err, response) {
											err ? res.send(err) : res.json({ 
												status: true , 
												msg: "Update driver and passenger to ON => driver canceled passenger",
												data: response
												});
										});
									}
								);

							}

						});
					}
				);

			}
		}
	);
};




exports.driverCancelCall = function(req, res) {
taxi_id	= req.body.taxi_id				;
device_id = req.body.device_id			;
match_psg_id = req.body.match_psg_id		;
	DriversModel.find(
		{ _id : taxi_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				// Update driver info and status to be "BUSY"
				DriversModel.findOne(
					{
						_id : taxi_id
					}, { status:1, updated:1 },
					function(err, taxi) {
						if(req.body.curloc) 	{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						taxi.match_psg_id = "";
						taxi.updated = new Date().getTime();
						taxi.status = "ON";
						taxi.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								PassengerModel.findOne(
									{
										_id : match_psg_id
									}, { status:1, updated:1 },
									function(err, psg) {
										/* update taxi by _id */
										psg.match_taxi_id = "";
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
								);

							}

						});
					}
				);

			}
		}
	);
};	




exports.driverPickPassenger = function(req, res) {
taxi_id  = req.body.taxi_id			;
device_id = req.body.device_id		;
match_psg_id = req.body.match_psg_id	;
	DriversModel.find(
		{ _id : taxi_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				// Update passenger info and status to be "BUSY"
				DriversModel.findOne(
					{ _id : taxi_id }, 
					{ status:1, updated:1 },
					function(err, taxi) {
						/* update psg by _id */	
						if(req.body.curloc) 	{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						taxi.match_psg_id = match_psg_id;
						taxi.updated = new Date().getTime();
						taxi.status = "PICK";
						taxi.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								PassengerModel.findOne(
									{
										_id : match_psg_id
									}, { status:1, updated:1 },
									function(err, psg) {
										/* update taxi by _id */
										psg.match_taxi_id = taxi_id;
										psg.updated = new Date().getTime();
										psg.status = "PICK";
										//console.log(req.body)
										psg.save(function(err, response) {
											err ? res.send(err) : res.json({ 
												status: true , 
												msg: "Update driver and passenger to PICK => driver picked passenger",
												data: response
												});
										});
									}
								);

							}

						});
					}
				);

			}
		}
	);
};	




exports.driverEndTrip = function(req, res) {
taxi_id = req.body.taxi_id				;
device_id = req.body.device_id			;
match_psg_id = req.body.match_psg_id		;
	DriversModel.find(
		{ _id : taxi_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				DriversModel.findOne(
					{ _id : taxi_id }, 
					{ status:1, updated:1 },
					function(err, taxi) {
						/* update psg by _id */	
						if(req.body.curloc) 	{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						taxi.match_psg_id = "";
						taxi.updated = new Date().getTime();
						taxi.status = "ON";						
						taxi.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								PassengerModel.findOne(
									{ _id : match_psg_id }, 
									{ status:1, updated:1 },
									function(err, psg) {
										/* update taxi by _id */
										psg.match_taxi_id = "";
										psg.updated = new Date().getTime();
										psg.status = "OFF";
										//console.log(req.body)
										psg.save(function(err, response) {
											err ? res.send(err) : res.json({ 
												status: true , 
												msg: "Update driver to ON and passenger to OFF => driver dropped passenger" ,
												data: response
												});
										});
									}
								);
							}
						});
					}
				);
			}
		}
	);
};	




exports.driverGetByID = function(req, res) {
taxi_id = req.body.taxi_id	;
	DriversModel.find(
		{ _id : taxi_id}, 
		{ _id:0, grg_id:0, updated:0, created:0, smscomfirm:0, active:0, smsconfirm:0 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "There is some data missing, please try again."});
	    	} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "success, driver's information", 
					data :  response  
				});
			}
		}
	);
};	




exports.driverSendComment = function(req, res) {
taxi_id = req.body.taxi_id		;
device_id = req.body.device_id	;
commtype = "Taxi"						;
topic = req.body.topic			;
comment = req.body.comment		;
	DriversModel.findOne(
		{
			_id : taxi_id,
			device_id : device_id
		}, 
		function(err, drivers) {
			 
	    	if (err) {
				res.send(err); 
				}

	    	if(drivers === null) { // don't have drivers :>-> err
				res.json({ status: false , msg: "Your phone number does not exist, please register"});
	    	} else {
	    		CommentModel.create(req.body, function(err, response) {
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
				taxi_id = fields.taxi_id;
				device_id = fields.device_id;
				findandUpload(taxi_id, device_id);
			}
			else {
				// kick out
				res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });				
			}
		}
	});

	function findandUpload(taxiId, deviceId) {
	 	DriversModel.find(
			{ _id : taxiId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response == 0) { // don't have drivers 
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
				taxi_id = fields.taxi_id;
				device_id = fields.device_id;
				findandUpload(taxi_id, device_id);
			}
			else {
				// kick out
				res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });	
			}
		}
	});

	function findandUpload(taxiId, deviceId) {
	 	DriversModel.find(
			{ _id : taxiId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response == 0) { // don't have drivers 
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
				taxi_id = fields.taxi_id;
				device_id = fields.device_id;
				findandUpload(taxi_id, device_id);
			}
			else {
				// kick out
				res.json({ status: false , msg: "Invalid image type, Please input type JPEG or PNG" });	
			}
		}
	});

	function findandUpload(taxiId, deviceId) {
	 	DriversModel.find(
			{ _id : taxiId, device_id : deviceId }, 
			{ device_id:1 },
			function(err, response) {
				if(response == 0) { // don't have drivers 
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
				taxi_id = fields.taxi_id;
				device_id = fields.device_id;
				findandUpload(taxi_id, device_id);
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
				//if(response == 0) { // don't have drivers 
				if (typeof response == 'undefined' && response == null) {	
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
				taxi_id = fields.taxi_id;
				device_id = fields.device_id;
				oldimg = fields.oldimg;
				findandUpload(taxi_id, device_id);
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
				if (typeof response == 'undefined' && response == null) {	
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

								newimgupload = oldimg;//taxiId+'_'+imgtype+'_'+ranSMS()+extension;
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
taxi_id = req.body.taxi_id		;
device_id = req.body.device_id	;
var oldimg = req.body.oldimg;
	DriversModel.find(
		{ _id : taxi_id, device_id : device_id }, 
		{ device_id:1, brokenpicture:1 },
		function(err, response) {
			if (typeof response == 'undefined' && response == null) {	
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});										
			} else {
				arrpix = response[0].brokenpicture;	
				imgorder = arrpix.indexOf(oldimg)
				arrpix.splice(imgorder, 1);	// delete array at immgorder
				DriversModel.findOne(
					{ _id : taxi_id }, 
					{ status:1, updated:1 },
					function(err, taxi) {
						if(req.body.curloc) 		{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
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
taxi_id = req.body.taxi_id		;
device_id = req.body.device_id	;
	DriversModel.find(
		{ _id : taxi_id, device_id : device_id }, 
		{ device_id:1 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				DriversModel.findOne(
					{ _id : taxi_id }, 
					{ status:1, updated:1 },
					function(err, taxi) {
						/* update taxi by _id */
						if(req.body.curloc) 		{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						if(req.body.brokenname)		{ taxi.brokenname	= req.body.brokenname ? req.body.brokenname : taxi.brokenname; }
						if(req.body.brokendetail)	{ taxi.brokendetail	= req.body.brokendetail ? req.body.brokendetail : taxi.brokendetail; }
						taxi.status	= "BROKEN";
						taxi.updated = new Date().getTime();
						taxi.save(function(err, response) {
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								err ? res.send(err) : res.json({ status: true , msg: "success, your broken report has benn sent." });
							}
						});
					}
				);
			}
		}
	);
};




exports.driverBrokenCancel = function(req, res) { 
taxi_id = req.body.taxi_id				;
device_id = req.body.device_id			;
	DriversModel.find(
		{ _id : taxi_id, device_id : device_id }, 
		{ device_id:1, brokenpicture:1  },
		function(err, response) {
			if (typeof response == 'undefined' && response == null) {	
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    		} else {
				arrpix = response[0].brokenpicture;
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
					{ _id : taxi_id }, 
					{ status:1, updated:1 },
					function(err, taxi) {
						if(req.body.curloc) 		{ taxi.curloc	= req.body.curloc ? req.body.curloc : taxi.curloc; }
						taxi.brokenname = [];
						taxi.brokendetail = "";
						taxi.brokenpicture = [];
						taxi.status = "ON";
						taxi.updated = new Date().getTime();
						taxi.save(function(err, response2) {
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


	
	



/*
	app.post('/service/shared/announcementAdd'	, Controller.announcementAdd);
	app.post('/service/shared/announcementDel'	, Controller.announcementDel);
	app.post('/service/shared/announcementGet'	, Controller.announcementGet);
	app.post('/service/shared/emglistAdd'		, Controller.emglistAdd);
	app.post('/service/shared/emglistDel'		, Controller.emglistDel);
	app.post('/service/shared/emglistGet'		, Controller.emglistGet);
*/
exports.announcementAdd = function(req, res) {
user_id = req.body.user_id	;
	UserModel.find(
		{
			_id : user_id
		}, 
		function(err, user) {				
			if (typeof user == 'undefined' && user == null) {		
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
ann_id = req.body.ann_id		;
	UserModel.find(
		{
			_id : user_id
		}, 
		function(err, user) {				
			if (typeof user == 'undefined' && user == null) {		
				res.json({ 
					status: false , 
					msg:  "Your account is not valid, please try again."
				});
			} else {
				AnnounceModel.findOne(
					{ _id : ann_id }, 
					{ status:1, updated:1 },
					function(err, announce) {
						/* update taxi by _id */
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
	UserModel.find(
		{
			_id : user_id
		}, 
		function(err, user) {
			if (typeof user == 'undefined' && user == null) {		
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
	AnnounceModel.find(
		{ anntype: anntype, topic: { $ne: '' }, status:"Y" },
		{ user_id:0 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
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
	UserModel.find(
		{
			_id : user_id
		}, 
		function(err, user) {				
			if (typeof user == 'undefined' && user == null) {		
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
	UserModel.find(
		{
			_id : user_id
		}, 
		function(err, user) {				
			if (typeof user == 'undefined' && user == null) {		
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
	UserModel.find(
		{
			_id : user_id
		}, 
		function(err, user) {
			if (typeof user == 'undefined' && user == null) {		
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
	EmgListModel.find(
		{ emgtype : emgtype, status: "Y", name: { $ne: '' } }, 
		{ _id:0 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
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
	    	if(response == 0) { // don't have drivers 
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

	    	if(passennger === null) { // don't have drivers :>-> err
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


































// --------------------------------- OLD FUNCTION -----------------------------------------


/* -----------------------------------------
	Defined Status
   ----------------------------------------- */

var statusConstant = {
	null: 0,
	on: 1,
	off: 2,
	busy: 3,
	acceptedWaiting: 4,
	arrive: 5
}
/* -----------------------------------------
	Get device list (all)
   ----------------------------------------- */

function _getAllDevice (data, res, options) {
    if(options.status==statusConstant.busy){
       condition = { "status" : statusConstant.busy , "uid" : options.taxiUid } ; 
    }
    else{
       condition = { "status" : statusConstant.on } ;
    }
    DeviceModel.find( /* find( {query}, {fields}, {options}, callbackFunction ) */
    	condition,
	
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		{ 
			limit : options.limit 
		},
		function(err, response) {
	    	if (err) { 
	    		res.send(err); 
	    	}
	    	else {
		    	var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
				res.json(_res);
	    	}	    	
		});
};



exports.getAllDevice = function (req, res) { 	
	DeviceModel.find(
		{  
			"status" : statusConstant.on
		}, 
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
			res.json(_res);
    	}
	});
};



exports.getAllDeviceOnOff = function (req, res) { 	
	var query = Url.parse(req.url, true).query,
		jsonQuery = query.status ? { "status" : query.status } : {};

	DeviceModel.find(
		jsonQuery, 
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
			res.json(_res);
    	}
	});
};



exports.getInitDevices = function (req, res) { 

	//console.log(req.user._id)	
	var user_id = '';
	
	if(typeof req.user._id !== "undefined" || req.user._id !== '') {
		user_id = req.user._id;
	} else {
		user_id = 0;
	}
	
	DeviceModel.find(
		{  	
			"latitude": { $ne: '' },
			"longitude": { $ne: '' },
			"user_id" :  user_id ,
			$or: [ { "status": statusConstant.on }, { "status": statusConstant.busy } , { "status": statusConstant.acceptedWaiting}]
			//"status" : statusConstant.on
		}, 
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
			res.json(_res);
    	}
	});
};



exports.getAllDevice_socket = function (callback) { //function (req, res) { 	
	DeviceModel.find(
		{  
			"status" : statusConstant.on
		}, 
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
			//res.json(_res);
			callback(_res);
    	}
	});
};



/* -----------------------------------------
	Get passenger list (all)
   ----------------------------------------- */
function _getAllPassenger (data, res, options) {
    var condition = {};
	if(options.status==statusConstant.on){
       condition = { "status" : options.status } ;
    }
    else if(options.status==statusConstant.busy){
       condition = { "status" : statusConstant.busy, "uid" : options.passengerID } ; 
    }
    PassengerModel.find( /* find( {query}, {fields}, {options}, callbackFunction ) */
		condition,
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		{ 
			limit : options.limit 
		},
		function(err, response) {
	    	if (err) { 
	    		res.send(err); 
	    	}
	    	else {
	    	 	var _res = {
	    	 		status: true,
	    	 		msg: "success",
		    		data: response
		    	};

				res.json(_res);
	    	}	    	
		});
};



exports.getAllPassenger = function (req, res) {	
	PassengerModel.find(
		{  
			"status" : 1
		}, 
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
			res.json(_res);
    	}
	});
};



exports.getAllPassengerOnOff = function (req, res) {	
	var query = Url.parse(req.url, true).query,
		jsonQuery = query.status ? { "status" : query.status } : {};

	PassengerModel.find(
		jsonQuery, 
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
			res.json(_res);
    	}
	});
};



exports.getInitPassengers = function (req, res) {	
	PassengerModel.find(
		{  
			"latitude": { $ne: '' },
			"longitude": { $ne: '' },			
			$or: [ { "status": statusConstant.on }, { "status": statusConstant.busy } , { "status": statusConstant.acceptedWaiting}]
		}, 
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};

			res.json(_res);
    	}
	});
};



/* -----------------------------------------
	Get passenger by id
   ----------------------------------------- */
function _getPassengerById (passengerId, data, res, options) {
    PassengerModel.find( /* find( {query}, {fields}, {options}, callbackFunction ) */
		{ 
			"uid": passengerId,
			"status" : options.status
		},
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		{},
		function(err, response) {
	    	if (err) { 
	    		res.send(err); 
	    	}
	    	else {
		    	var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
				res.json(_res);
	    	}	    	
		});
};



/* -----------------------------------------
	Update device and get passenger list
   ----------------------------------------- */
exports.getPassenger = function(req, res) {
	// Create and Update --> Query by condition --> Return JSON
	DeviceModel.findOne(
		{
			uid : req.body.uid
		}, 
		function(err, device) {
			// error 
	    	if (err) { res.send(err); }
	    	// create and update
	    	//if(device === null) { /* dont have device : create */
	    	//	DeviceModel.create(req.body, function(err, response) {
			//		err ? res.send(err) : _getAllPassenger(device, res, { limit: 15,status: statusConstant.on , passengerID: device.passengerID });
			//	});
	    	//}
	    	if(device === null) { /* dont have device : create */
	    		DeviceModel.create(req.body, function(err, response) {
					//err ? res.send(err) : _getAllDevice(psg, res, { limit: 15, status: statusConstant.off , taxiUid: psg.taxiUid });
					if (err) {
						res.send(err)
					} else {
						DeviceModel.find().limit(1).sort({timestamp:-1}),
						function(err,psg1) {
						_getAllDevice(psg1, res, { limit: 15, status: statusConstant.off , taxiUid: psg.taxiUid });
						}
					}
				});
	    	}
	    	else if(req.body.status==statusConstant.off){
	    		var _res = {
		    		status: true,
		    		msg : "Your status is off can not get passenger",
		    		data: [] 
		    	};
	    		res.json(_res);
	    	}
	    	else { /* update device by UID */

	    		if(req.body.uid) { 			device.uid 	= req.body.uid ? req.body.uid : device.uid; }
				if(req.body.name) { 		device.name 	= req.body.name ? req.body.name : device.name; }
				if(req.body.carLicense) { 	device.carLicense = req.body.carLicense ? req.body.carLicense : device.carLicense; }
				if(req.body.distance) { 	device.distance 	= req.body.distance ? req.body.distance : device.distance; }
				if(req.body.detail) { 		device.detail = req.body.detail ? req.body.detail : device.detail; }
				if(req.body.passengerID) { 	device.passengerID 	= req.body.passengerID ? req.body.passengerID : device.passengerID; }
				if(req.body.status) { 		device.status 	= req.body.status ? req.body.status : device.status; }
				if(req.body.lat) { 			device.lat 	= req.body.lat ? req.body.lat : device.lat; }
				if(req.body.lng) { 			device.lng 	= req.body.lng ? req.body.lng : device.lng; }
				if(req.body.direction) { 			
					       device.direction.accuracy 	= req.body.direction.accuracy;
					       device.direction.degree      = req.body.direction.degree;
			    }	       
	    		device.save(function(err, response) {
	    			err ? res.send(err) : _getAllPassenger(device, res, { limit: 10, status: device.status , passengerID: device.passengerID });
				});
	    	}
		});
};



/* -----------------------------------------
	- update device 
	- get passenger by psg id
	- change status psg to -1
    - update taxi uid to psg json
   ----------------------------------------- */
exports.getPassengerById = function(req, res) {
	// Create and Update --> Query by condition --> Return JSON
	//console.log(req.body);
	DeviceModel.findOne(
		{
			uid : req.body.uid
		}, 
		function(err, device) {
			// error 
	    	if (err) { res.send(err); }

	    	var passengerId = req.params.passenger_uid;

	    	// create and update
	    	if(device === null) { /* dont have device : create */

	    		DeviceModel.create(req.body, function(err, response) {
					err ? res.send(err) : _getPassengerById(passengerId, device, res, { limit: 10, status: statusConstant.on });
				});
	    	}
	    	else { /* update device by UID */
	    		if(req.body.uid) { 			device.uid 	= req.body.uid ? req.body.uid : device.uid; }
				if(req.body.name) { 		device.name 	= req.body.name ? req.body.name : device.name; }
				if(req.body.carLicense) { 	device.carLicense = req.body.carLicense ? req.body.carLicense : device.carLicense; }
				if(req.body.distance) { 	device.distance 	= req.body.distance ? req.body.distance : device.distance; }
				if(req.body.detail) { 		device.detail = req.body.detail ? req.body.detail : device.detail; }
				if(req.body.passengerID) { 	device.passengerID 	= req.body.passengerID ? req.body.passengerID : device.passengerID; }
				if(req.body.status) { 		device.status 	= req.body.status ? req.body.status : device.status; }
				if(req.body.lat) { 			device.lat 	= req.body.lat ? req.body.lat : device.lat; }
				if(req.body.lng) { 			device.lng 	= req.body.lng ? req.body.lng : device.lng; }
				device.save(function(err, response) {
	    			if(err) {
	    				var _res = {
			    	 		status: false,
			    	 		msg: "error",
				    		timestamp: new Date().getTime(),
				    		sentBy: 'device'
				    	};
						res.json(_res);
	    			}
	    			else {
						if(device.status == statusConstant.busy) {
							// get passenger by psg id
							PassengerModel.findOne( 
							{ 
								"uid": passengerId
							},
							function(err, psg) {
						    	if (err) { 
						    		res.send(err); 
						    	}
						    	else {
						    		// change status psg to -1
						    		psg.status = statusConstant.acceptedWaiting;
						    		// add taxi uid
						    		psg.taxiUid = device.uid;
						    		// update psg
						    		psg.save(function(err, response) {
						    			var _res = {
								    		status: true,
					    	 				msg: "success",
								    		timestamp: new Date().getTime(),
								    		sentBy: 'device',
								    		data: [ psg ]
								    	};
										res.json(_res);
						    		});
						    	}	    	
							});
						}
	    			}
	    		});
			}
		});
};



/* -----------------------------------------
	Update passenger and get device list
   ----------------------------------------- */
exports.getDevice = function(req, res) {
	// Create and Update --> Query by condition --> Return JSON
	console.log('-*** getDevice ***-')
	//console.log(req.body)
	console.log('-*** getDevice ***-')
	PassengerModel.findOne(
		{
			uid : req.body.uid
		}, 
		function(err, psg) {
			// error 
	    	if (err) { res.send(err); }
	    	// create and update
	    	if(psg === null) { /* dont have psg : create */

	    		PassengerModel.create(req.body, function(err, response) {
					//err ? res.send(err) : _getAllDevice(psg, res, { limit: 15, status: statusConstant.off , taxiUid: psg.taxiUid });
					if (err) {
						res.send(err)
					} else {
						PassengerModel.find().limit(1).sort({timestamp:-1}),
						function(err,psg1) {
						_getAllDevice(psg1, res, { limit: 15, status: statusConstant.off , taxiUid: psg1.taxiUid });
						}
					}
				});
	    	}
	    	else { /* update psg by UID */
	    		if(req.body.uid) 			{	psg.uid 	= req.body.uid ? req.body.uid : psg.uid; }
				if(req.body.name) 			{	psg.name 	= req.body.name ? req.body.name : psg.name; }
				if(req.body.registrationId) {	psg.registrationId = req.body.registrationId ? req.body.registrationId : psg.registrationId; }
				if(req.body.phoneNumber) 	{	psg.phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : psg.phoneNumber; }
				if(req.body.distance) 		{	psg.distance 	= req.body.distance ? req.body.distance : psg.distance; }
				if(req.body.detail) 		{	psg.detail = req.body.detail ? req.body.detail : psg.detail; }
				if(req.body.description) 	{	psg.description 	= req.body.description ? req.body.description : psg.description; }
				if(req.body.status) 		{	psg.status 	= req.body.status ? req.body.status : psg.status; }
				if(req.body.lat)			{	psg.lat 	= req.body.lat ? req.body.lat : psg.lat; }
				if(req.body.lng)			{	psg.lng 	= req.body.lng ? req.body.lng : psg.lng; }
	    		psg.save(function(err, response) {
	    			err ? res.send(err) : _getAllDevice(psg, res, { limit: 200, status: psg.status , taxiUid: psg.taxiUid });
				});
	    	}
		});
};



function _checkAction ( action, res ) {
	// Check case action
	var statusValue = Array()
	if(action){
		//update device and passenger status to waiting for accept
		if(action=="choose"){
	    	statusValue.psg = statusConstant.acceptedWaiting
	    	statusValue.taxi = statusConstant.acceptedWaiting
		}
		//update device and passenger status to busy 
		else if(action=="accept"||action=="pickup"){
			statusValue.psg = statusConstant.busy
			statusValue.taxi = statusConstant.busy
		}
		//update device and passenger status to on 
		else if(action=="cancel"||action=="reject"||action=="on"){
			statusValue.psg = statusConstant.on
			statusValue.taxi = statusConstant.on
		}
		//update device and passenger status to off 
		else if(action=="off"){
			statusValue.psg = statusConstant.off
			statusValue.taxi = statusConstant.off
		}
		else if(action=="arrive"){
			statusValue.psg = statusConstant.on
			statusValue.taxi = statusConstant.on
		}
	    else{
	    	statusValue.psg = statusConstant.null
	    	statusValue.taxi = statusConstant.null
	    }
	}
	return statusValue 
}


/*
exports.test = function(){

	var _res = {
			    	 		status: false,
			    	 		msg: "error",
				    		timestamp: new Date().getTime(),
				    		sentBy: 'device'
				};
	console.log({uid:"test"});
	DeviceModel.create({timestamp: new Date().getTime()});

}
*/


/* Update status when taxi need to cancel deal*/
var updateStatusDevice = function(req, res) {
	// Check case action
	var statusValue = _checkAction(req.body.action);
	_pathLog(req.body);
	//console.log('S:updateStatusDevice => req.body.uid =>'+req.body.uid);
	if(req.body.uid==''){
		DeviceModel.create(req.body);
		updateStatusDevice(req, res);
	}

	//console.log(req.body)
	/*
	DeviceModel.update({uid:req.body.uid},req.body,{upsert:true},function(err,response){
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

	else {

		DeviceModel.findOne(
			{
				uid : req.body.uid
			}, 
			function(err, device) {

				var device = device ? device : {};

				if(req.body.uid) 		{ 	device.uid 	= req.body.uid ? req.body.uid : device.uid; }
				if(req.body.name) 		{ 	device.name 	= req.body.name ? req.body.name : device.name; }
				if(req.body.carLicense) { 	device.carLicense = req.body.carLicense ? req.body.carLicense : device.carLicense; }
				if(req.body.distance) 	{ 	device.distance 	= req.body.distance ? req.body.distance : device.distance; }
				if(req.body.detail) 	{ 	device.detail = req.body.detail ? req.body.detail : device.detail; }
				if(req.body.passengerID){ 	device.passengerID 	= req.body.passengerID ? req.body.passengerID : device.passengerID; }
				//if(req.body.lat) 		{	device.lat 	= req.body.lat ? req.body.lat : device.lat; }
				//if(req.body.lng) 		{	device.lng 	= req.body.lng ? req.body.lng : device.lng; }
				if(req.body.timeStamp) 	{	device.timeStamp 	= req.body.timeStamp; }
				if(req.body.carType) 	{	device.carType 	= req.body.carType; }
				if(req.body.latitude) 	{	device.latitude 	= req.body.latitude ? req.body.latitude : device.latitude; }
				if(req.body.longitude) 	{	device.longitude 	= req.body.longitude ? req.body.longitude : device.longitude; }
				if(req.body.phoneNumber){	device.phoneNumber 	= req.body.phoneNumber ? req.body.phoneNumber : device.phoneNumber; }
				if(req.body.direction)	{ 	
					device.direction = device.direction ? device.direction : {};		
					device.direction.accuracy 	= req.body.direction.accuracy;
					device.direction.degree      = req.body.direction.degree;
				}	  
				if(req.body.action) 	{	device.action 	= req.body.action ? req.body.action : device.action; }
				if(req.body.altitude) 	{	device.altitude     = req.body.altitude; }
	            if(req.body.light) 		{	device.light    = req.body.light; }
	            if(req.body.carSpeed) 	{	device.carSpeed     = req.body.carSpeed; }
				if(req.body.accelerometer){	device.accelerometer     = req.body.accelerometer; }
				if(req.body.decibels) 	{	device.decibels     = req.body.decibels; }
				if(req.body.taxiName) 	{	device.taxiName     = req.body.taxiName; }
				if(req.body.user_id) 	{	device.user_id     = req.body.user_id; }
				
				device.status 	= statusValue.taxi;
				console.log('req.body.carType =>'+req.body.carType);
	            console.log('start device =>...');
				//console.log(device)
				console.log('<=...end device');
	            var deviceModel = new DeviceModel(device);

				console.log('deviceModel =>'+deviceModel);

				//deviceModel.save(function(err,response){

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
			});
	}
};

exports.updateStatusDevice = function(req, res) {
	return updateStatusDevice(req, res);
}


exports.updateStatusPassenger = function(req, res) {	
	// Check case action
	var msg = '';
	var statusValue = _checkAction(req.body.action);		
	

	//console.log(req.body.action)
    // Create and Update --> Query by condition --> Return JSON
	PassengerModel.findOne(
		{
			uid : req.body.uid
		}, 
		function(err, psg) {
			/* update psg by UID */
			if(req.body.uid) 			{ psg.uid 	= req.body.uid ? req.body.uid : psg.uid; }
			if(req.body.destination) 	{ psg.destination.name 	= req.body.destination.name ? req.body.destination.name : psg.destination.name; }
			if(req.body.destination) 	{ psg.destination.lat 	= req.body.destination.lat ? req.body.destination.lat : psg.destination.lat; }
			if(req.body.destination) 	{ psg.destination.lng 	= req.body.destination.lng ? req.body.destination.lng : psg.destination.lng; }
			if(req.body.taxiUid) 		{ psg.taxiUid 	= req.body.taxiUid ? req.body.taxiUid : psg.taxiUid; }
			if(req.body.tips) 			{ psg.tips = req.body.tips ? req.body.tips : psg.tips; }
			if(req.body.action) 		{ psg.action 	= req.body.action }
			if(req.body.phoneNumber) 	{ psg.phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : psg.phoneNumber; }
			if(req.body.latitude) 		{ psg.latitude 	= req.body.latitude ? req.body.latitude : psg.latitude; }
			if(req.body.longitude) 		{ psg.longitude 	= req.body.longitude ? req.body.longitude : psg.longitude; }
			if(req.body.altitude) 		{ psg.altitude     = req.body.altitude; }
            if(req.body.light) 			{ psg.light    = req.body.light; }
			if(req.body.accelerometer) 	{ psg.accelerometer     = req.body.accelerometer; }
			if(req.body.decibels) 		{ psg.decibels     = req.body.decibels; }
			if(req.body.taxiName) 		{ psg.taxiName     = req.body.taxiName; }
			if(req.body.user_id) 		{ psg.user_id     = req.body.user_id; }
			if(req.body.favCarType) 	{ psg.favCarType     = req.body.favCarType; }
			if(req.body.matchingTaxiUID) 	{ psg.matchingTaxiUID     = req.body.matchingTaxiUID; }
			psg.status 	= statusValue.psg;
		 	//console.log(req.body)
			psg.save(function(err,response){

				if(err) {
					res.json({ status: false , msg: "error" });
				}
				else {
					// Accepted , busy to on 
					if(req.body.taxiUid) {
						DeviceModel.findOne(
						{
							uid : req.body.taxiUid
						}, 
						function(err, device) {
							// update device by UID 
							if(psg.status){								
							    device.status = statusValue.taxi; 							    
							}

							if(psg.status==statusConstant.off){								
								DeviceModel.findOne({uid : req.body.taxiUid}, function(err, document) {
								  device.status = document.status ;	
								  msg = 'off';	
								  device.save(function(err, response) {
									err ? res.send(err) : res.json({ status: true , msg: "success: passenger status "+msg });
									});							  
								});															
																							
							    //device.status = xxx;
							} else {
								if(psg.status==statusConstant.on){ msg = 'on';}
								else if(psg.status==statusConstant.busy){ msg = 'busy'; }
								//console.log(device);
								device.save(function(err, response) {
									err ? res.send(err) : res.json({ status: true , msg: "success: passenger status "+msg });
								});							
							}
							


/*
							if(psg.status==statusConstant.on){ 
								msg = 'on';					            
								device.save(function(err, response) {
									err ? res.send(err) : res.json({ status: true , msg: "success: passenger status "+msg });
								});
							}
				            if(psg.status==statusConstant.busy){ 
				            	msg = 'busy'; 					            
								device.save(function(err, response) {
									err ? res.send(err) : res.json({ status: true , msg: "success: passenger status "+msg });
								});				            	
				            }
*/
				            //else if(psg.status==statusConstant.off){ msg = 'off'; }

						});
					}
	                else {
	                	res.json({ status: true , msg: "no passenger" });
	                }
			    }
			});
		});
};



/* Update device for show passenger on list by update status = 1 */
exports.updatePassengerOn = function(req, res) {
	// Create and Update --> Query by condition --> Return JSON
	PassengerModel.findOne(
		{
			uid : req.body.uid
		}, 
		function(err, psg) {
			/* update psg by UID */
    		if(req.body.uid) 				{	psg.uid 	= req.body.uid ? req.body.uid : psg.uid; }
				if(req.body.name) 			{	psg.name 	= req.body.name ? req.body.name : psg.name; }
				//if(req.body.registrationId) {	psg.registrationId = req.body.registrationId ? req.body.registrationId : psg.registrationId; }
				if(req.body.phoneNumber) 	{	psg.phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : psg.phoneNumber; }
				if(req.body.distance) 		{	psg.distance 	= req.body.distance ? req.body.distance : psg.distance; }
				if(req.body.detail) 		{	psg.detail = req.body.detail ? req.body.detail : psg.detail; }
				if(req.body.description) 	{	psg.description 	= req.body.description ? req.body.description : psg.description; }
				if(req.body.status) 		{	psg.status 	= req.body.status == 0 ? psg.status : req.body.status; }
				if(req.body.latitude) 		{	psg.latitude 	= req.body.latitude ? req.body.latitude : psg.latitude; }
				if(req.body.longitude) 		{	psg.longitude 	= req.body.longitude ? req.body.longitude : psg.longitude; }

			//console.log(req.body)
    		psg.save(function(err, response) {
    			err ? res.send(err) : res.json({ status: true , msg: "success" });
			});
		});
};



exports.getStatusPassenger = function(req, res) {
	// Create and Update --> Query by condition --> Return JSON]	
	//console.log('getStatusPassenger + passenger_uid is = '+req.param("passenger_uid"));
	PassengerModel.findOne(
		{
			uid : req.param("passenger_uid")
		}, 
		function(err, psg) {
			//_updatePassengerDetail();
			if (err) { res.send(err); } else {
				err ? res.send(err) : res.json({ status: true , msg: "success" , data : { statusID: psg.status , taxiUid : psg.taxiUid ,action: psg.action } });
			}
    		//err ? res.send(err) : res.json({ status: true , msg: "success" , data : { statusID: psg.status , taxiUid : psg.taxiUid ,action: psg.action } });
			//console.log('psg status = '+psg.status)
			//console.log('psg action = '+psg.action)
		}); 
}; 



exports.getStatusDevice = function(req, res) {
	// Create and Update --> Query by condition --> Return JSON]	
	DeviceModel.findOne(
		{
			uid : req.param("device_uid")
		}, 
		function(err, device) {
			if (err) { res.send(err); } else {
				err ? res.send(err) : res.json({ status: true , msg: "success" , data : { statusID: device.status , passengerID : device.passengerID , action: device.action} });
			}
    		//err ? res.send(err) : res.json({ status: true , msg: "success" , data : { statusID: device.status , passengerID : device.passengerID , action: device.action} });
		}); 
};      



exports.getPSearchList = function (req, res) { 	
	//var start = new Date(2014, 4, 11);
	//var end = new Date(2014, 5, 11);	
	PathLogModel.find({
		//{ "status" : statusConstant.on }, 
		//{ _id: 0, registrationId: 0 }, /* not show in json result */		
			//uid : req.body.psgsSname,
			//$or: [ { uid: req.body.psgSphone } , { uid: req.body.psgSname } ] ,
			timeStamp: {$gte: req.body.DPstart, $lt: req.body.DPend}
			,latitude: { $exists: true }
		},{ latitude: 1, longitude: 1, _id: 0 },
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data:  response
		    	};
			res.json(_res);
    	}
	});
};



exports.getTSearchList = function (req, res) { 	
	//var start = new Date(2014, 4, 11);
	//var end = new Date(2014, 5, 11);	
	//console.log(req.body.taxiSplate);
	//console.log(req.body.taxiSphone);
	//console.log(req.body.DTstart);
	//console.log(req.body.DTend);
	
	var DTstart = req.body.DTstart.split('/');
	DTstart = (DTstart[2]+'-'+DTstart[0]+'-'+DTstart[1]);

	var DTend = req.body.DTend.split('/');
	DTend = (DTend[2]+'-'+DTend[0]+'-'+DTend[1]);
	
	PathLogModel.find({
		//{ "status" : statusConstant.on }, 
		//{ _id: 0, registrationId: 0 }, /* not show in json result */
			//uid : req.body.taxiSphone,	
			//$or: [ { uid: req.body.taxiSplate } , { uid: req.body.taxiSphone } ] ,
			uid:req.body.taxiSplate,
			//timeStamp:{$gte: req.body.DTstart, $lt: req.body.DTend}	
			timeStamp:{$gte:new Date(DTstart), $lt:new Date(DTend)}
			,latitude:{$exists: true}
		},{ timeStamp: 1 , latitude: 1 , longitude: 1 , _id: 0 },
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data:  response
		    	};
			res.json(_res);
    	}
	});
};



function _getPsgbyPhone (psgPhone, data, res, options) {
    PassengerModel.find( /* find( {query}, {fields}, {options}, callbackFunction ) */
		{ 
			"phoneNumber": psgPhone,
			"status" : options.status
		},
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		{},
		function(err, response) {
	    	if (err) { 
	    		res.send(err); 
	    	}
	    	else {
		    	var _res = {
		    		status: true,
		    		msg : "success ja",
		    		data: response
		    	};
				res.json(_res);
	    	}	    	
		});
};



exports.getPsgbyPhone = function (req, res) { 	
	//var start = new Date(2014, 4, 11);
	//var end = new Date(2014, 5, 11);	
	//console.log(req.body.phoneNumber)
	//db.users.find({name: /a/})  //like '%m%'
	//db.users.find({name: /^pa/}) //like 'm%' 
	//db.users.find({name: /ro$/}) //like '%m'
	//http://docs.mongodb.org/manual/reference/sql-comparison/
	//var re = /ab+c/; ====> var re = new RegExp("ab+c");
	//https://developer.mozilla.org/th/docs/Web/JavaScript/Guide/Regular_Expressions
	PassengerModel.find({
		//{ "status" : statusConstant.on }, 
		//{ _id: 0, registrationId: 0 }, /* not show in json result */
			phoneNumber:  new RegExp(req.body.phoneNumber)
		},
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data:  response
		    	};
			res.json(_res);
    	}
	});
};



exports.getPsgbyName = function(req, res) {
	//console.log(req.body.name)
	PassengerModel.find({		
			name: new RegExp(req.body.name)
		},
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data:  response
		    	};
			res.json(_res);
    	}
	});
};



exports.getDvbyPlate = function(req, res) {
	//console.log(req.body.name)
	DeviceModel.find({		
			carLicense: new RegExp(req.body.carLicense)
		},
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data:  response
		    	};
			res.json(_res);
    	}
	});
};



exports.getDvbyPhone = function(req, res) {
	//console.log(req.body.name)
	DeviceModel.find({		
			phoneNumber: new RegExp(req.body.phoneNumber)
		},
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success", 
		    		data:  response
		    	};
			res.json(_res);
    	}
	});
};



exports.getBikeWin = function (req, res) { 	
	UserModel.find(
		{  			
			"local.ctype": "taxi" 
		}, 
		{ _id: 0, registrationId: 0 }, /* not show in json result */
		function(err, response) {
    	if (err) { 
    		res.send(err); 
    	}
    	else {
    		var _res = {
		    		status: true,
		    		msg : "success",
		    		data: response
		    	};
			res.json(_res);
    	}
	});
};