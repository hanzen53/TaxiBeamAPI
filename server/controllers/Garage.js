////////////////////////////////////
// TaxiBeam Garage API
// version : 1.0.0.1 
// Date August 16, 2015 
// Crated by Hanzen
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
	ErrorcodeModel =  mongoose.model('ErrorcodeModel'),
	mailer = require("nodemailer");

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



// Use Smtp Protocol to send Email
var smtpTransport = mailer.createTransport("SMTP",{
	service: "Gmail",
	auth: {
		user: "krit@ecartstudio.com",
		pass: "********"
	}
});


var mail = {
	from: "Krit Lor <krit@ecartstudio.com>",
	to: "hanzen@hotmail.com",
	subject: "Send Email Using Node.js",
	text: "Node.js New world for me",
	html: "<b>Node.js New world for me</b>"
}




// NOTE *******************************  Start a new API
// the new API service for GARAGE
exports.userlogin = function(req, res) {
// check Email & Password
email = req.body.email;
password = req.body.password;
	GarageModel.findOne(
		{ email: email, password: password }, 
		function(err, grg) {	    	
		    if(drv == null) { 
				res.json({ status: false , msg: "invalid email or password" });
		    } else { 
				res.json({ 
					status: true,
					msg:  "Welcome to Taxi-Beam" ,	
					data: { 
						_id: grg._id, 
						status: grg.status,
						active: grg.active
					} 
				});
			}
		}
	);
};





exports.forgetpwd = function(req, res) {
// http://stackoverflow.com/questions/4113701/sending-emails-in-node-js
email = req.body.email;
	GarageModel.findOne(
		{ email: email }, 
		function(err, grg) {	    	
		    if(drv == null) { 
				res.json({ status: false , msg: "Your email address is invalid, please try again." });
		    } else { 
			    smtpTransport.sendMail(mail, function(error, response){
			        if(error){
			            console.log(error);
			        }else{
			            console.log("Message sent: " + response.message);
			        }

			        smtpTransport.close();
			    });
				res.json({ 
					status: true,
					msg:  "Please check your email"
				});
			}
		}
	);
};




exports.testsendmail = function(req, res) {
// http://stackoverflow.com/questions/4113701/sending-emails-in-node-js
	smtpTransport.sendMail(mail, function(error, response){
		if(error){
	        		console.log(error);
				res.json({ 
					status: false,
					msg:  "cannot send mail",
					data: error
				});
	    	}else{
	       		 console.log("Message sent: " + response.message);
				res.json({ 
					status: true,
					msg:  "Please check your email"
				});
	   	}
	    	smtpTransport.close();
	});
};




exports.showcars = function(req, res) {
_id = req.body._id			;
device_id = req.body.device_id		;
curlng = req.body.curlng		;
curlat = req.body.curlat			;
curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
	if (typeof curlng == 'undefined' && curlng == null) {		
		res.json({ status: false, msg: "current longitude is not valid" })
		return;	
	}
	if (typeof curlat == 'undefined' && curlat == null) {		
		res.json({ status: false, msg: "current latitude is not valid" })
		return;
	}
	CarsModel.find(
		{ curloc : { $near : curloc } },
		{ device_id:0, curloc:0, desloc:0, updated:0, created:0 },
		{ limit : amount },
		function(err,carlist){
			// Donot forget to create 2d Index for drivers collection : curloc!!!!	
			if(carlist == 0){
				res.json({					
					status: false, 
					msg: ""
				});									
			} else {
				res.json({				
					status: true, 
					msg: "", 
					data: carlist
				});				
			}
		}
	);
};




exports.searchcars = function(req, res) {
_id = req.body._id			;
keyword = req.body.keyword		;
	CarsModel.find(
		{ 						
			curloc : { $near : curloc }, 
		},
		{ device_id:0, curloc:0, desloc:0, updated:0, created:0 },
		{limit : amount},
		function(err,carlist){
			// Donot forget to create 2d Index for drivers collection : curloc!!!!	
			if(carlist == 0){
				res.json({					
					status: false, 
					msg: ""
				});									
			} else {
				res.json({				
					status: true, 
					msg: "", 
					data: carlist
				});				
			}
		}
	);
};




exports.getdrvinfo = function(req, res) {
_id = req.body._id	;
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
				});
			}
		}
	);
};	




exports.getdrvhistory = function(req, res) {

}




exports.getjobinfo = function(req, res) {

}




exports.getpathinfo = function(req, res) {

}




exports.getdrvlist = function(req, res) {

}




exports.updatedrvinfo = function(req, res) {

}




exports.getcarlist = function(req, res) {

}




exports.getcarinfo = function(req, res) {
_id = req.body._id	;
	CarsModel.findOne(
		{ _id : _id, active: "Y"}, 
		{ _id:0, device_id: 0, nname:0, curloc:0, imgczid:0, workperiod:0, workstatus:0, car_id:0, grg_id:0, updated:0, created:0, smsconfirm:0 },
		function(err, car) {		
	    		if(car == null) { 
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
					data: car
				});
			}
		}
	);
};




exports.updatecarinfo = function(req, res) {

}




exports.senddrvmsg = function(req, res) {

}




exports.changepwd = function(req, res) {

}




exports.statsearch = function(req, res) {

}




exports.insertcars = function(req, res) {

}