exports.driveruploadBroken = function (req, res){
  var form			= new formidable.IncomingForm();
  var taxi_id		= "";
  var device_id		= "";
  var imgtype		= "imgbroken";
  var imgorder		= "";
  var imgext		= "";
  var bupload		= "";
  var brokenpicture	= "";
  var imgorder		= "";
  var newimgname	= "";
  var newpix		= "";	// new picture
  var baction		= "";	// { "add"=>"push","edit"=>"replace","delete"=>"slice"}
  var newarrorder	= "";	// 

	form.parse(req, function(err, fields, files) {
		// Check if there is an upload file.
		if (typeof fields.baction == 'undefined' && fields.baction == null) {	
			console.log('fields.baction'+fields.baction)
			console.log('no action found')
			bupload = false;
			res.json({ status: false, msg : 'Please put your action.' });
			res.end();
			return;
		} else if (typeof files.upload == 'undefined' && files.upload == null) {	
			console.log('no image found')
			bupload = false;
			res.json({ status: false, msg : 'Please put some images.' });
			res.end();
			return;
		}
		
		taxi_id		= fields.taxi_id;
		device_id	= fields.device_id;
		imgorder	= fields.imgorder;
		baction		= fields.baction;
		imgext		= path.extname(files.upload.name);		
		//res.writeHead(200, {'content-type': 'text/plain'});
		//res.write('received upload:\n\n');

		switch (baction) {
		  case "add":
			  //push
			
		  break;
		  case "edit":
			  //replace
			
		  break;
		  case "delete":
			  //slice

		  break;
			bupload = false;
			res.json({ status: false, msg : 'Please specific the action.' });	
			res.end();
			return;
		  break;
		}
		
		res.end(util.inspect({
			fields: fields, 
			files: files, 
			data: { 
				"imgtype": imgtype, 
				"baction" : baction
				} 
		}));
	});
		DriversModel.find(
			{
				_id : taxi_id,
				device_id : device_id
			}, { device_id:1, brokenpicture:1},
			function(err, response) {
				if(response == 0) { // don't have drivers 
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
				} else {

				arrpix = response[0].brokenpicture;
				arrlength = arrpix.length;		// get how many objecs in array

				switch (baction) {
				  case "add":
					  //push
					console.log('1:'+baction)
					if(arrlength===0){
						newarrorder = 0;
					} else {
						newarrorder = arrlength;
					}
					newpix = taxi_id+'_'+imgtype+'_'+newarrorder+imgext
					arrpix.push(newpix);			// push arrary at the last	
					console.log('new image add => '+arrpix)
				  break;
				  case "edit":
					console.log('2:'+baction)
					  //replace
					if(imgorder>arrlength){
					res.json({ status: false , msg: "img order unavailable" });
					return;
					} else {
						findname = arrpix[imgorder];
						replaceimgname = findname ;
						newpix = taxi_id+'_'+imgtype+'_'+newarrorder+imgext
						arrpix[arrpix.indexOf(replaceimgname)] = newpix ;
					}			
				  break;
				  case "delete":
					console.log('3:'+baction)
					  //slice
					if(imgorder>arrlength){
					res.json({ status: false , msg: "img order unavailable" });
					return;
					} else {
						arrpix.splice(imgorder, 1);	// delete array at immgorder
					}
				  break;
				  default:
					console.log('4:'+baction)					
				  break;
				}					

					// Upload process

					form.on('progress', function(bytesReceived, bytesExpected) {
							var percent_complete = (bytesReceived / bytesExpected) * 100;
							console.log('%upload = '+percent_complete.toFixed(2));
					});

					form.on('end', function(fields, files) {
					console.log('333333')
					/* Temporary location of our uploaded file */
					var temp_path = this.openedFiles[0].path;
					/* The file name of the uploaded file */
					var file_name = '';//this.openedFiles[0].name;
					var extension = path.extname(this.openedFiles[0].name);
					/* Location where we want to copy the uploaded file */
					var new_location = 'uploads/';
					console.log('new_location')
						if (bupload)
						{
							//fs.copy(temp_path, new_location+taxi_id+'_'+imgtype+file_name+extension, function(err) {  
							fs.copy(temp_path, new_location+newpix, function(err) {  							
								
								imgbroken = arrpix;
								console.log('imgname='+imgbroken)
							 
							  if (err) {
								console.error(err);
							  } else {
								console.log("success! upload")
/*
Action example

				arrpix = response[0].brokenpicture;
				arrlength = arrpix.length;
				if(imgorder>arrlength){
				res.json({ status: false , msg: "img order unavailable" });
				return;
				}
				//findname = arrpix[imgorder];
				//replaceimgname = findname ;
				//arrpix[arrpix.indexOf(replaceimgname)] = newimgname ;
				////arrpix.splice(imgorder, 1);	// delete array at immgorder
				//////arrpix.push(newpix);			// push arrary at the last
*/
									DriversModel.findOne(
										{
											_id : taxi_id
										}, { status:1, updated:1, brokenpicture:1 },
										function(err, taxiupfile) {
											// update taxi by _id 
											taxiupfile.brokenpicture = imgbroken;
											taxiupfile.save(function(err, response) {
												//err ? res.send(err) : res.json({ status: true , msg: "Update passenger to BUSY => passenger accept taxi" });
												if(err) {
													res.json({ status: false , msg: "error" });
												} else {
													err ? res.send(err) : res.json({ 
														status: true , 
														msg: "success, your car is available." 
														});
												}
											});
										}
									);
								}
							});
						}	// bupload
					});

				}
			}
		);

}







exports.driveruploadBrokentest = function(req, res) { 
	var taxi_id			= req.body.taxi_id			;
	var device_id		= req.body.device_id		;
	var imgtype			= req.body.imgtype			;	//{ "imgbroken" }
	var brokenpicture	= req.body.brokenpicture	;
	var imgorder		= req.body.imgorder-1		;
	var newimgname		= req.body.newimgname		;
	var newpix			= req.body.newpix			;	// new picture
	var baction			= req.body.baction			;	// { "push","replace","slice"}

	DriversModel.find(
		{
			_id : taxi_id,
			device_id : device_id
		}, { device_id:1, brokenpicture:1 },
		function(err, response) {
	    	if(response == 0) { // don't have drivers 
				res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
	    	} else {
				// Update passenger info and status to be "BUSY"
				//console.log('brokenpicture='+brokenpicture)

				arrpix = response[0].brokenpicture;
				arrlength = arrpix.length;
				if(imgorder>arrlength){
				res.json({ status: false , msg: "img order unavailable" });
				return;
				}
				findname = arrpix[imgorder];
				replaceimgname = findname ;
				arrpix[arrpix.indexOf(replaceimgname)] = newimgname ;
				//arrpix.splice(imgorder, 1);	// delete array at immgorder
				//arrpix.push(newpix);			// push arrary at the last

				DriversModel.findOne(
					{
						_id : taxi_id
					}, { status:1, updated:1 },
					function(err, taxi) {
						/* update taxi by _id */
						taxi.brokenpicture = arrpix;
						taxi.updated = new Date().getTime();
						taxi.save(function(err, result2) {
							//err ? res.send(err) : res.json({ status: true , msg: "Update passenger to BUSY => passenger accept taxi" });
							if(err) {
								res.json({ status: false , msg: "error" });
							} else {
								// Update taxi info and status to be "BUSY"
								console.log('brokenpicture44='+arrpix)
								err ? res.send(err) : res.json({ status: true , 
									msg: "success, your 11 car is available.", 
									data : arrpix,
									imgorder : imgorder,
									findname : findname,
									arrlength : arrlength
								});
							}
						});
					}
				);

			}
		}
	);
};






exports.driveruploadImage = function (req, res){
  // see example at http://www.codediesel.com/nodejs/processing-file-uploads-in-node-js/
  // and https://github.com/felixge/node-formidable to set up form + file requirement
  var taxi_id = "";
  var device_id = "";
  var imgtype = "";	//{ "imgface", "imglicence", "imgcar" }
  var imgface = "";
  var imglicence = "";
  var imgcar = "";
  var imgext = "";
  var bupload = "";


  var form = new formidable.IncomingForm();
	// setup upload form
	form.encoding = 'utf-8';
	form.type
	form.maxFieldsSize = 2 * 1024 * 1024;
	form.maxFields = 1000;
	form.hash = false;
	form.multiples = false;
	form.bytesReceived;
	form.bytesExpected;
	console.log('form.bytesReceived='+form.bytesReceived);
	// setup upload file

	form.parse(req, function(err, fields, files) {

		if (typeof files.upload == 'undefined' && files.upload == null) {	
			console.log('no image found')
			bupload = false;
			res.write('Please put some images.');
			res.end();
			return;
		}

		taxi_id = fields.taxi_id;
		device_id = fields.device_id;
		imgtype = fields.imgtype;

		console.log('imgtype = '+imgtype)		 		
		console.log('files.upload = '+files.upload)

		//res.writeHead(200, {'content-type': 'text/plain'});
		//res.write('received upload:\n\n');

		switch (imgtype) {
		case "imgface":
			bupload = true;
			break;
		case "imglicence":
			bupload = true;
			break;
		case "imgcar":
			bupload = true;
			break;
		  default:
			bupload = false;
			res.json({status: false, msg :'your image type is not valid, please try again.'});	
			res.end();
			return;
			break;	
		}

		imgext = path.extname(files.upload.name);

		res.end(util.inspect({fields: fields, files: files, data: { "imgtype": imgtype, "imgname" : taxi_id+"_"+imgtype+imgext  } }));

	});

		// start find taxi_id to check if it's available
		DriversModel.find(
			{
				_id : taxi_id,
				device_id : device_id
			}, { device_id:1 },
			function(err, response) {
				if(response == 0) { // don't have drivers 
					res.json({ status: false , msg: "Your phone does not exist. Please register and try again."});
				} else {
					// Upload process
					// display % upload
					console.log('start uploading')

					/*
					form.on('fileBegin', function(name, file) {
						file.size = 0;
						file.path = null;
						file.name = null;
						file.type = null;
						file.lastModifiedDate = null;
						file.hash = null;
					});
					*/

					form.on('progress', function(bytesReceived, bytesExpected) {
							var percent_complete = (bytesReceived / bytesExpected) * 100;
							console.log('%upload = '+percent_complete.toFixed(2));
					});
					form.on('end', function(fields, files) {
					/* Temporary location of our uploaded file */
					var temp_path = this.openedFiles[0].path;
					/* The file name of the uploaded file */
					var file_name = '';//this.openedFiles[0].name;
					var extension = path.extname(this.openedFiles[0].name);
					/* Location where we want to copy the uploaded file */
					var new_location = 'uploads/';
					console.log('new_location')
						if (bupload)
						{
							fs.copy(temp_path, new_location+taxi_id+'_'+imgtype+file_name+extension, function(err) {  
								switch (imgtype) {
								  case "imgface":
									imgface = taxi_id+'_'+imgtype+file_name+extension;
								  console.log('imgface='+imgface)
									break;
								  case "imglicence":
									imglicence = taxi_id+'_'+imgtype+file_name+extension;
								  console.log('imglicence='+imglicence)
									break;
								  case "imgcar":
									imgcar = taxi_id+'_'+imgtype+file_name+extension;
								  console.log('imgcar='+imgcar)
									break;
								}
							 
							  if (err) {
								console.error(err);
							  } else {
								console.log("success!")

									DriversModel.findOne(
										{
											_id : taxi_id
										}, { status:1, updated:1 },
										function(err, taxiupfile) {
											// update taxi by _id 
											console.log('imgtype =>'+imgtype)
											switch (imgtype) {
											  case "imgface":
												taxiupfile.imgface = imgface;
												break;
											  case "imglicence":
												taxiupfile.imglicence = imglicence;
												break;
											  case "imgcar":
												taxiupfile.imgcar = imgcar;
												break;
											}
											taxiupfile.save(function(err, response) {
												//err ? res.send(err) : res.json({ status: true , msg: "Update passenger to BUSY => passenger accept taxi" });
												if(err) {
													res.json({ status: false , msg: "error" });
												} else {
													err ? res.send(err) : res.json({ status: true , msg: "success, your image has been uploaded." });
												}
											});
										}
									);
								}
							});
						}	// bupload
					});

				}
			}
		);
//	});
}






function checkundefine(jobs) {
	if (typeof jobs !== 'undefined' && jobs !== null) {		
		return false;
	} else {
		return true;
	}
}







