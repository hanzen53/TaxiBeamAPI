////////////////////////////////////
// TaxiBeam API Controller 
// version : 1.0.0.1 
// Date July 16, 2015 
// Wrote by Hanzen
////////////////////////////////////
var config = require('../../config/func').production;

// var hostrun = os.hostname();
var 	Url = require('url'),           
	mongoose  = require('mongoose'),
	TemplModel = mongoose.model('TemplModel'),
   	DeviceModel  = mongoose.model('DeviceModel'),
  	PassengerModel  = mongoose.model('PassengerModel'),
  	UserModel  = mongoose.model('UserModel'),
 	PathLogModel = mongoose.model('PathLogModel'),
	DriversModel = mongoose.model('DriversModel'),
	G_usergroupModel = mongoose.model('G_usergroupModel'),
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
    	hmap_key = { "localhost":"Evs0z2OaYLDO8e3sl8HwK7MwiS66Y@7Yqo-K$eeRwRQkxqrbO$" , "ubeam.demo.taxi-beam.com":"NM7SZ26ZV$jN6Ed8-TJ2@dx4cXXOuj9H9rrD5OOgU4Fh4hSavu" },
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


////////////////////////////////////////////////////
function array_include(arr,obj) {
	return (arr.indexOf(obj) != -1);
}			 		



//////
function chk_access_menu(user_gr ,acc_callback) {
	var usermenu = []		;
	//console.log('user_gr ='+user_gr)
	//   var roleall =[] ;
	TemplModel.find({},
		'', // 	filter colum	
		{   limit: 500    },
			function(err, roleall) {		               
		           	for(var i=0;  i < roleall.length ; i++){   
			   	//  var acc = roleall[i].groupacc ;    
                                        		if ( roleall[i].templtype == "menu" ) {
				      		for(var j=0, k = user_gr.length; j < k; j++){
				           		if ( array_include( roleall[i].groupacc  , user_gr[j] ) ) {
					                   	usermenu.push(roleall[i] )					              
					             	break;
					           }    
					}  
               			}       
			}   	
		//return usermenu ; 
		acc_callback( usermenu ) ;
   	})
}
////


function find_templ(gr_filter, aid, callback) {
    var templ_list = [];
    var filters = {};    
    if (typeof aid == 'string'   ) {   
          filters.aid = aid;   
      } else { 
      	         if ( gr_filter.indexOf('ecartadmin') == -1) { //
	           	         console.log('ecartadmin aid ')	    	     
	                     filters.templtype = 'templ'   
	            }         
           //filters.templtype = 'templ'    
       }

    TemplModel.find(filters,
        '', // 	filter colum	
        {   limit: 5000    },
        function(err, t_list) {
            formData_ = t_list;
          //  var gr_filter = Euser_gr; // ["ecartadmin","ecartstaff","user" ]   ; // Euser_gr ; //  user_gr_arr; // 
            var endans = [];
           if ( gr_filter.indexOf('ecartadmin') !== -1) { //
                  endans = t_list ;
           } else {
    
            for (var i = 0; i < formData_.length; i++) {
                var test_data = formData_[i].json[0];
                var upindex = [];
                var result = [];
                var result2 = [];
                test_data.rows.filter(function(row, index) {
                    upindex[index] = result2
                    result2 = []
                    row.forEach(function(obj) {
                        obj.rolegroup.forEach(function(Egroup) {
                            if (gr_filter.indexOf(Egroup) !== -1) { // 
                                var count = 0;
                                result.forEach(function(res) {
                                    res.name == obj.name && count++;
                                });
                                if (count == 0) {
                                    result.push(obj);
                                    result2.push(obj);
                                }
                            }
                        });
                    });
                    upindex[index] = result2
                    result2 = []
                });
                objA = {}
                objA = {
                    "rows": upindex,
                    "hidden": []
                }
                formData_[i].json = [objA]
                endans.push(formData_[i])
            }            

        } 
            callback( endans ) ;
        } // find
    ).sort( {templtype:1} ) ; 
}



function find_hmap_key(h) {
	var b =  h.split(':')[0]
	hmap_key = { 
		"localhost":"Evs0z2OaYLDO8e3sl8HwK7MwiS66Y@7Yqo-K$eeRwRQkxqrbO$" , 
		"ubeam.demo.taxi-beam.com":"NM7SZ26ZV$jN6Ed8-TJ2@dx4cXXOuj9H9rrD5OOgU4Fh4hSavu"  ,
		"lite.taxi-beam.com":"wi69PDxOI48nsUnEo$BfKZzo$DbRxc6IZZYd@gLOpKbpV8eSui" ,
		"lite-dev.taxi-beam.com":"jcMwkY50Yu1aTMTtKL-7B0sK4PcaaSEXbXVHHE--1swEThFfoo" ,
		"dispatcher-dev.taxi-beam.com":"XpIj4K0fKUHHRVO4LB04XHsRnXwvPMK3wyptxgKCG17YSn0QHq" ,
		"web-dev.taxi-beam.com":"5@98Q8zakZG6Cg65Wvt09Xpts0IynuwxJqjZDFO9Abp@$-NJsy" ,
		"lite-test.taxi-beam.com":"jXZ5Zzuyi_PyF6fUwB7yeyfv@EQNZ7V2yNJqNjUC6TfNGwdACj" ,
		"dispatcher-test.taxi-beam.com":"Sw34ArtWhv1x3rdAmRBCW5d7JyB7q_yMkTJzgF6jhzEgdv_keh" ,
		"web-test.taxi-beam.com":"By3R73D@ZWBktIBfnHAWqX552qae@Pr3zkf0T72igEB1LrH6cq" ,
		"dispatcher.taxi-beam.com":"1bhbrKJEK13KZknb7NqsgZ_nKsn6msiSKkr1nPfYUvgkFvRXxM" ,
		"web.taxi-beam.com":'hy16Hs@C4rMKuE1r8t2x0XQK@ZA6kLKCyd3a$Ggc2diUh1kZ5l',
		"callcenter.taxi-beam.com" : 'HJq_rFQ_AnO5AzWqA@hNPigqcR8PuXxUq9HP17G61oJTN86pYO',
		"callcenter-dev.taxi-beam.com" : '6AXnCI5p5johsESn4Z4tfTLcGqISZ5kvIfUR_YTtg1qCcECm6F',
		"callcenter-test.taxi-beam.com" : 'Vw4s021$DdaMugLVCRu_a88ZQX6sicLItBYk1jUYib2sGDlXox'
	} 
	return hmap_key[b] ;
}



exports.ChkAccess = function(Euser_gr,chkurl,ChkAccess_callback) {	
   	    var useraccess = false		;
		   TemplModel.find({},
		        '', // 	filter colum	
		        {   limit: 500    },
		        function(err, roleall) {		               
			for(var i=0, l = roleall.length; i < l; i++){   
				    var acc = roleall[i].groupacc ;     
				      for(var j=0, k = Euser_gr.length; j < k; j++){
				           if ( array_include( acc , Euser_gr[j] ) ) {
			                           if ( roleall[i].url == chkurl ) {	                      
					                   useraccess = true
					                   ChkAccess_callback( useraccess ) ;
					                }
					             break;
					           }    
					       }  
				}   	
				//return useraccess ; 
	        })
 }


exports.signup = function(req, res) {	
	var gp = [{ name:"ecartadmin" },{name:"ecartstaff"},{name:"user" } ];
	G_usergroupModel.find(		
		//	{ user_gr:"user_gr" } ,
		{ 						
		//active:"Y"
		}, ''  ,		// 	filter colum	
		{ limit : 5000 },
		function(err,t_list){
			res.render('signup.ejs', {            
		          		gp: t_list
		        	});
		}
	);        
};


exports.web = function(req, res) {	
	res.render('index.ejs', {
		appversion : config.passengerappversion			          
	});
	// this exports.web is for xxx/passenger
	//res.sendfile('./public/app/passenger/index.html');
};


exports.calltaxi_lite = function(req, res) {	
	res.render('calltaxi_lite.ejs', {
		appversion : config.passengerappversion ,
		DistoShowPhone : config.DistoShowPhone ,
		psgsearchpsgradian: config.psgsearchpsgradian ,
		psgsearchpsgamount: config.psgsearchpsgamount 
        	});
};


exports.calltaxi = function(req, res) {
	//console.log( ' calltaxi  = '+req.user )
	res.render('calltaxi.ejs', {
		appversion : config.passengerappversion ,
          		user : req.user  // get the user out of session and pass to template          		
        	});
};


exports.psgprofile = function(req, res) {	
	res.render('psgprofile.ejs', {
		appversion : config.passengerappversion ,
          		user : req.user  // get the user out of session and pass to template          		
        	});
};


exports.jsontable = function(req, res) {	
        res.render('jsontable.ejs', { });
};


exports.question = function(req, res) {	
        res.render('question.ejs', { });
};

exports.download = function(req, res) {	
        res.render('download.ejs', { });
};

exports.psgdownload = function(req, res) {	
        res.render('psgdownload.ejs', { });
};

exports.drvdownload = function(req, res) {	
        res.render('drvdownload.ejs', { });
};

exports.contactus = function(req, res) {	
        res.render('contactus.ejs', { });
};

exports.profile = function(req, res) {	
  	chk_access_menu(req.user.group , function(usermenu){
	      res.render('profile.ejs', {
	            user : req.user ,  // get the user out of session and pass to template
	            menu: usermenu
	        });
		
	})

};

exports.admin = function(req, res) {	    	        
     	chk_access_menu(req.user.group , function(usermenu){
	      res.render('admin.ejs', {
	            user : req.user ,  // get the user out of session and pass to template
	            menu: usermenu
	        });
		
	})	
      //} ) ;           	     
};


exports.adminReport = function(req, res) {	    	        
	if(!req.user){
		res.redirect('./login');
		return;
	}

	if (req.user.local.cgroup!='ecartadmin'){
		res.redirect('./login');
		return;
	}

	res.render('./admin/report.ejs', {
          		user_data : {
          			id: req.user._id,
          			username: req.user.username,
          			group: req.user.local.cgroup,
          			email: req.user.local.cemail,
          			name: req.user.local.cname
          		}            	
        	});
};


exports.callcenter = function(req, res) {	

	if(!req.user){
		res.redirect('./login');
		return;
	}

	//Ecadmin.
	var user_gr = req.user.group ; // ["user"]   // req.user.group ;
	//    var  templ =find_templ(user_gr) ;
      	var hmap = find_hmap_key(req.headers.host) ;
      	var user_gr = req.user.group ; // ["user"]   // req.user.group ;
     	chk_access_menu(req.user.group , function(usermenu){
		res.render('callcenter.ejs', {
	          		user : req.user ,  // get the user out of session and pass to template
	          		user_data : {
	          			id: req.user._id,
	          			username: req.user.username,
	          			group: req.user.local.cgroup,
	          			email: req.user.local.cemail,
	          			name: req.user.local.cname,
	          			groupNameTH: req.user.local.cgroupname,
	          			provinceTH: req.user.local.cprovincename
	          		},
	            	menu: usermenu,
		        	hmapkey:hmap ,
			//templ:  templ ,
			usercurloc: req.user.local.curloc	            
	        	});
	})	
//     var umenu = chk_access_menu(user_gr ) ;    	      
//       res.render('callcenter.ejs', {
//           user : req.user , // get the user out of session and pass to template
//           menu: umenu ,
//           hmapkey:hmap ,
// //templ:  templ ,
// usercurloc: req.user.local.curloc
//       });
};


exports.changepwd = function(req, res) {	
	var user_gr = req.user.group ; // ["user"]   // req.user.group ;
	var  umenu = chk_access_menu(user_gr ) ;
	res.render('user/changepasswd.ejs', {
		user : req.user ,  // get the user out of session and pass to template
		menu: umenu
	});
};



exports.template = function(req, res) {		
	var user_gr = req.user.group ; // ["user"]   // req.user.group ;
	find_templ(user_gr,null, function(endans){ 
		var html = 'var  formData_ ='+JSON.stringify(endans ) +'' 
		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.send(html );
	})   
};


exports.templ_index = function(req, res) {	
        res.render('templ/templ_index.ejs', { });
};



exports.templ_new = function(req, res) {	
        res.render('templ/templ_new.ejs', { });
};



exports.templ_edit = function(req, res) {	
        res.render('templ/templ_edit.ejs', { });
};



exports.templ_get = function(req, res) {	
  var aid =  req.query.aid   ; // '1' ;
  var templ = '' ;
	var user_gr = req.user.group ; // ["user"]   // req.user.group ;
	if ( typeof aid !== 'undefined' )  {	         
	         find_templ(user_gr, aid, function(endans) {  
                        	res.setHeader('Content-Type', 'text/html');
			res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
			res.setHeader('Expires', '-1');
			res.setHeader('Pragma', 'no-cache');
			res.send(endans );	          
	      }) ;
             }  else {                     
                     find_templ(user_gr, null , function(endans) {   
			//var html = templ  ; //JSON.stringify(templ )  
			res.setHeader('Content-Type', 'text/html');
			res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
			res.setHeader('Expires', '-1');
			res.setHeader('Pragma', 'no-cache');
			res.send(endans );                     		
                     	}) ;
             }


};


exports.get_combofile = function(req, res) {	
   //  var  templ =find_templ(req) ; 
    var aid = '1' ;
	var user_gr = req.user.group ; // ["user"]   // req.user.group ;
	var  html =[
		{"id":1,"combofile":"province","combofilepath":"province.json"},
		{"id":2,"combofile":"amphoe","combofilepath":"amphoe.json"},
		{"id":3,"combofile":"tambon","combofilepath":"tambon.json"},
		{"id":4,"combofile":"village","combofilepath":"village.json"}
	] ;	
	res.setHeader('Content-Type', 'text/html');
	//res.setHeader('Access-Control-Allow-Origin', '*');
	res.send(html );
};



exports.list_folder_pins = function(req, res) {	
   //  var  templ =find_templ(req) ;     
	var user_gr = req.user.group ; // ["user"]   // req.user.group ;
	var  html =["taxi","num","pins"] ;	
	res.setHeader('Content-Type', 'text/html');
	//res.setHeader('Access-Control-Allow-Origin', '*');
	res.send(html );
};


exports.list_pins = function(req, res) {	
	//  var  templ =find_templ(req) ; 
	var aid = '1' ;
	var user_gr = req.user.group ; // ["user"]   // req.user.group ;
	var  html = ["2hand.png","administrativeboundary.png"] ;	
	res.setHeader('Content-Type', 'text/html');
	//res.setHeader('Access-Control-Allow-Origin', '*');
	res.send(html );
};



exports.getusergr = function(req, res) {	       
	G_usergroupModel.find(					    
		{ 						
			//active:"Y"
		}, ''  ,		// 	filter colum	
		{ limit : 500 },
		function(err,t_list){
			//var html = JSON.stringify(t_list ) +'' 
			//res.setHeader('Content-Type', 'text/html');
			res.setHeader('Content-Type', 'application/json;charset=utf-8');
		//	res.setHeader('Access-Control-Allow-Origin', '*');
			res.send(JSON.stringify({
			//msg: "This is your driver's list.", 
			status: true, 										
			data: t_list
		}));
			//res.send(html );
		}
	);        

};


////////////////////////////////////////////
exports.ListUser = function(req, res) {	
	// amount = 400;
	// var col = req.body.req ;
	 var templ = {} ;
	// for (i = 0; i < col.length; i++) { 
	// 	 templ[ col[i] ] = 1     		
	// 	}		
	UserModel.find(		
		{ 						
           //	 query		active:"Y"
		},
		templ ,	// 	filter colum	
		{ limit : amount },
		function(err,drvlist){
			// Donot forget to create 2d Index for passengers collection : curloc & descloc!!!!
			if(drvlist == null) {
				//res.json({status: false, msg: "No data"});
				res.setHeader('Content-Type', 'application/json;charset=utf-8');
				res.setHeader('Access-Control-Allow-Origin', '*');
    				res.send(JSON.stringify({
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
};



exports.ListPassenger = function(req, res) {
	var templ = {} ;
	PassengerModel.find(
		//{ active:"Y", status: "ON", curloc : { $near : curloc, $maxDistance: radian  }  },
		{ 						
			
		}, templ  ,		
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
};



exports.ListDrv = function(req, res) {	  // taxilistall 		
	templ_filter = {}
	var user_gr = req.user.group ;	
	var col = req.body.aid ;	
	DriversModel.find(	
		{ 						
			// aid: col 
		},{
			_id:1, device_id:1, username:1, fname:1, lname:1, phone:1, citizenid:1, cgroup:1, carplate:1, status:1, created:1, imgface:1, imgcar:1, imglicence:1	// templ_filter 
		}, 
		//{ limit : amount },
		function(err,drvlist){			
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
};




exports.update_main = function(req, res) {
	var gid 	= req.body.gid		;
	var collectx = req.body.coll  ; 
	var main = JSON.parse(req.body.main) ;
	//var user_ = main.username
	//console.log(user_) ;
	if ( collectx == "drivers" ) {
		DriversModel.findOne(
	          	{ "_id" :  gid  },
		function(err, psg) {						
			if(psg == null) { 				
				//_passengerPassLogin (req, res);
				// CREATE Passenger *****************************************
				var newpsg = {} ; // { "username":'xxx',"email":"eee"} ;
					for(var index in main) { 									     
						newpsg[index] = main[index] 				     			                 
					}												
					UserModel.create( newpsg 
					,function(err, response) {
						if (err) { 
							res.json({ status: false , msg: "error"  });
						} else {
							res.json({ 
							status: true , data : { _id: response._id } 
							});
						} 
					});
			} else {
				//psg.updated = new Date().getTime();	
				for (var index in main) { 
					var attr = main[index]; 				     
					for(var psgindex in psg) { 					     
						if ( psgindex == index ) {					     	
	                             				psg[psgindex] = attr ;                             
						}				     
					}
				}										    		
				psg.save(function(err, response) {
					if (err) {
						res.json({ 
							status: false , 
							msg: "error", 
							data: err							
						});
					} else {
						res.json({ 							
							status: "OK" 							
							//data: { status: response.status }
						});
					}
				});
			}
		});
	} else if ( collectx == "passengers" ) {
		PassengerModel.findOne(
	          	{ "_id" :  gid  },
			function(err, psg) {						
				if(psg == null) { 				
						var newpsg = {} ; // { "username":'xxx',"email":"eee"} ;
							for(var index in main) { 									     
								    newpsg[index] = main[index] 				     			                 
								}												
						PassengerModel.create( newpsg 
							         ,function(err, response) {
										if (err) { 
											res.json({ status: false , msg: "error"  });
										} else {
											res.json({ 
												status: true , data : { _id: response._id	} 
											});
										} 
									}
								);
			    	} else {
					//psg.updated = new Date().getTime();	
					for(var index in main) { 
						var attr = main[index]; 				     
				     		for(var psgindex in psg) { 					     
					     		if ( psgindex == index ) {					     	
	                         						psg[psgindex] = attr ;                             
					     		}				     
					 	}
					}										    		
					psg.save(function(err, response) {
						if (err) {
						 	res.json({ 
								status: false , msg: "error",data: err
							});
						} else {
						 	res.json({ status: "OK" });
						}
					});
				}
			}
		);
	} else if ( collectx == "users" ) {
		UserModel.findOne(
	          	{  "_id" :  gid  },
			function(err, psg) {										  
				if(psg == null) { 				
					var newpsg = {} ; // { "username":'xxx',"email":"eee"} ;
					for(var index in main) { 									     
						newpsg[index] = main[index] 				     			                 
					}												
					UserModel.create( newpsg 
					, function(err, response) {
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
					});	    
			    	} else {   //  update 
					for(var index in main) { 
						var attr = main[index]; 				     
						for(var psgindex in psg) { 					     
							if ( psgindex == index ) {					     	
		                             				psg[psgindex] = attr ;                             
							}
						}
					}
					psg.save(function(err, response) {
						if (err) {
							res.json({ 
								action: false , msg: "error", data: err							
							});
						} else {
							res.json({ action: "OK" });
						}
					});
				}
			}
		);
	} else {
		res.json({ 
			status: false , 
			msg: "error", 
			data: err							
		});
	}
};