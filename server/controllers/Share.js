////////////////////////////////////
// TaxiBeam Share API
// version : 1.0.0.1 
// Date August 8, 2015 
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



// --------- start shared API
exports.announcementAdd = function(req, res) {
user_id = req.body.user_id	;
//	UserModel.findOne(
//		{ _id : user_id }, 
//		function(err, user) {				
//			if (user == null) {		
//				res.json({ 
//					status: false , 
//					msg:  "Your account is not valid, please try again."
//				});
//			} else {
		    		AnnounceModel.create(req.body, function(err, response) {
					if (err) {
						res.send(err)
					} else {
						res.json({ 
							//msg:  "The announcement has been created.",
							status: true , 
							msg: ""
							/*
							data: {
								ann_id : response._id,
								anntype : response.anntype,
								topic : response.topic,
								detail : response.detail,
								status : response.status,
								expired : response.expired,
								created : response.created
							}
							*/
						});
					}					
				});
//			}
//		}	
//	);
};




exports.announcementEdit = function(req, res) {
user_id = req.body.user_id	;
ann_id = req.body.ann_id	;
//	UserModel.findOne(
//		{ _id : user_id }, 
//		function(err, user) {				
//			if ( user == null) {		
//				res.json({ 
//					status: false , 
//					msg:  "Your account is not valid, please try again."
//				});
//			} else {
				AnnounceModel.findOne(
					{ _id : ann_id }, 
					{ status:1, updated:1 },
					function(err, announce) {	
						if (announce == null) {
							res.json({  status: false ,  msg: "Can not edit this announcement, please check your data."  });
						} else {
							if(req.body.anntype) 	{ announce.anntype 	= req.body.anntype ? req.body.anntype : announce.anntype; }
							if(req.body.topic) 	{ announce.topic 	= req.body.topic ? req.body.topic : announce.topic; }
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
					}
				);
//			}
//		}
//	);
};




exports.announcementDel = function(req, res) {
user_id = req.body.user_id	;
ann_id = req.body.ann_id	;
//	UserModel.findOne(
//		{ _id : user_id }, 
//		function(err, user) {
//			if ( user == null) {		
//				res.json({ 
//					status: false , 
//					msg:  "Your account is not valid, please try again."
//				});
//			} else {
				AnnounceModel.findOne(
					{ _id : ann_id }, 
					function(err, announce) {
						if (announce == null) {		
							res.json({ 
								status: false , 
								msg:  "Your announce id is not valid, please try again."
							});
						} else {
							announce.remove(								
								function(err, response) {
									//console.log(response)
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
//							res.json({ 
//								status: true , 
//								msg: "success, the announcement has been deleted"									
//							});
						}
					}
				);
//			}
//		}
//	);
};




exports.announcementGet	= function(req, res) {
anntype = req.body.anntype	;
	AnnounceModel.findOne(
		{ anntype: anntype, topic: { $ne: '' }, status:"Y" },
		{ created:0 },
		function(err, response) {
	    		if(response == null) { 
				res.json({ status: false , msg: "There is no data."});
	    		} else {
				res.json({ 
					status: true , 
					msg:  "", 
					data :  response
				});
			}
		}
	);
};




exports.emglistAdd = function(req, res) {
user_id = req.body.user_id	;
//	UserModel.findOne(
//		{ _id : user_id }, 
//		function(err, user) {				
//			if ( user == null) {		
//				res.json({ 
//					status: false , 
//					msg:  "Your account is not valid, please try again."
//				});
//			} else {
	    		EmgListModel.create(req.body, function(err, response) {
				if (err) {
					res.send(err)
				} else {
					res.json({ 
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
//			}
//		}
//	);
};




exports.emglistEdit = function(req, res) {
user_id = req.body.user_id	;
emg_id = req.body.emg_id		;
//	UserModel.findOne(
//		{ _id : user_id }, 
//		function(err, user) {				
//			if ( user == null) {		
//				res.json({ 
//					status: false , 
//					msg:  "Your account is not valid, please try again."
//				});
//			} else {
				EmgListModel.findOne(
					{ _id : emg_id }, 
					{ status:1, updated:1 },
					function(err, emg) {
						if(emg==null) {
							res.json({ status: false , msg: "Can not edit this data, please try again." });
						} else {
							/* update taxi by _id */
							if(req.body.emgtype) 	{ emg.emgtype = req.body.emgtype ? req.body.anntype : emg.emgtype; }
							if(req.body.name) 	{ emg.name 	= req.body.name ? req.body.name : emg.name; }
							if(req.body.phone) 	{ emg.phone 	= req.body.phone ? req.body.phone : emg.phone; }
							if(req.body.status) 	{ emg.status 	= req.body.status ? req.body.status : emg.status; }
							emg.updated = new Date().getTime();
							emg.save(function(err, response) {
								if(err) {
									res.json({ status: false , msg: "error" });
								} else {
									res.json({ 
										status: true , 
										msg: "",
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
//			}
//		}
//	);
};




exports.emglistDel = function(req, res) {
user_id = req.body.user_id	;
emg_id = req.body.emg_id		;
//	UserModel.findOne(
//		{ _id : user_id }, 
//		function(err, user) {
//			if ( user == null) {		
//				res.json({ 
//					status: false , 
//					msg:  "Your account is not valid, please try again."
//				});
//			} else {
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
//							res.json({ 
//								status: true , 
//								msg: "success, the emergencylist has been deleted"									
//							});
						}
					}
				);
//			}
//		}
//	);
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
					msg:  "", 
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
	    		if(response == 0) { 
				res.json({ status: false , msg: "There is no data."});
	    		} else {
				err ? res.send(err) : res.json({ 
					status: true , 
					msg:  "", 
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