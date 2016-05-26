
	var socket ; 

	if(document.location.hostname=='localhost'){
		socket = io.connect(document.location.hostname+':1114');  	// for  localhost
	} else {
		socket = io.connect('/');						// for server
	} 

		

		var map = H.map("map");
		var drawControl = new L.Control.Draw();

		var marker;
		var nLayer;
		var kml;
		var fires24;
		var toggleState = true;
		var jsonPoiList = 0;

		var CStartingP;
		var CEndingP;
		var CStartingPlat;
		var CStartingPlng;
		var CEndingPlat;
		var CEndingPlng;

		var OSEPolyline;
		var SEPolyline;

		var markerS;
		var markerD;
		var putTaxi;		
		var putPsg;
		var putDrv;
		var tempmk;
		var AllDrvMarker;
		var DrvLocMarker;

		var PsgLayer = {};
		var TaxiCurLayer = {};
		var PsgCurLayer = {};

		var animatedMarker;
		var polyline_123;

		var tempid;		
	var curlng = 104.8601933 ;
	var curlat = 15.243196;
		var tmppsgstatus;

		var flag = true ;  // to check dialog
			
		//tempid = "xxx";
		tempid = localStorage.getItem('device_id');
		map.setView([13.753,100.571], 10);
		map.control.menu.disable();
		map.control.rightclick.disable();

		map.on('draw:created', function (e) {
			var type = e.layerType,
			layer = e.layer;
			map.addLayer(layer);
		});

		$(function(){
			//alert(tempid);
			//setInterval(function() { 			
		
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
				      	//console.log('lat =>'+position.coords.latitude+' || lon =>'+position.coords.longitude);
				      	curlng =  position.coords.longitude ;
				      	curlat =  position.coords.latitude ;				      
				      	//JsonData = { "type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude], "lat": position.coords.latitude, "lng": position.coords.longitude, "time stamp" : [new Date(position.timestamp)], "tempid" : tempid }
				      	//console.log(JsonData)
				      	//socket.emit('myPsgLocation',  JsonData );
				      	getDrvarround( curlng, curlat,   1000000,50);				      	
				      	checkstatuspsg();
				}, function() {
					console.log("Can not get your location !!");
				});
			}
		
			//},	5000);
			checkCenter(function(  ){				
				//getDrvarround(  10000,100);
			});			
			// socket.on('news', function (data) {
			//     console.log(data);
			//     socket.emit('my other event', { my: 'data' });
			// });
			
  
   
   
   	setInterval(function() { 			
		   getDrvarround( curlng, curlat,   1000000,500);	  
	},	10000);
	

			setInterval(			
				checkstatuspsg
               			
			,10000);
			


			
			// click to check status + show dialog
			$('#but_checkstatus').click(function(){
				flag = true;
				checkstatuspsg();
			})




			$('#psgfrom').keydown(function () {
				// Allow special chars + arrows                 
				if ($(this).val() != '') { /* do stuff here */
					$(this).removeClass('error');
				} else {
					$(this).addClass('error');
				}
			});

			
			$('#psgto').keydown(function () {
				// Allow special chars + arrows                 
				if ($(this).val() != '') { /* do stuff here */
					$(this).removeClass('error');
				} else {
					$(this).addClass('error');
				}
			});


			$('#psgphone').keydown(function (event) {
				// Allow special chars + arrows                                 
				if ($(this).val().length < 8) { /* do stuff here */
					$(this).addClass('error');
				} else {
					$(this).removeClass('error');
				}
				if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9
				|| event.keyCode == 27 || event.keyCode == 13
				|| (event.keyCode == 65 && event.ctrlKey === true)
				|| (event.keyCode >= 35 && event.keyCode <= 39)) {
				return;
				} else {
					// If it's not a number stop the keypress
					if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
						event.preventDefault();
					}
				}
			});


		});
		


		function checkCenter(callback){
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
			      		//console.log('lat =>'+position.coords.latitude+' || lon =>'+position.coords.longitude);
			      		curlng =  position.coords.longitude ;
			      		curlat =  position.coords.latitude ;
			      		JsonData = { "type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude], "lat": position.coords.latitude, "lng": position.coords.longitude, "time stamp" : [new Date(position.timestamp)], "tempid" : tempid }
			      		//console.log(JsonData)
			      		//socket.emit('myPsgLocation',  JsonData );
			      		addPoiJson(JsonData);
			      		//callback();			      
			    		}, function() {
			      			console.log("Can not get your location, please allow browser to get your location.");
		    		});
			}			
			//getAllPassenger();			
		}



		
		
		function checkstatuspsg() { 
			//console.log('checkstatuspsg')
			//console.log('curlng ='+curlng)			
			if (curlng != 0) {
				$.ajax({
					type: "POST",
					contentType: "application/json; charset=utf-8", 				     
					url : "../service/passengercs/getStatus",
					dataType: "json", 
					data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
					success: function(data){
			        		//console.log(data.data.status);
			        		var getstatus = data.data.status;
			        		if (data.data.drv_id){
			        			getDrvLoc(data.data.drv_id);	
			        		}					
					switch(getstatus) {
						case "OFF":							
							if (tmppsgstatus != "OFF" ) {
								tmppsgstatus = "OFF"; 	
								BootstrapDialog.closeAll()
								flag = false;
							}							
							$(".menu-box").show();
							$(".process-loading-topic").hide();
							$(".process-loading").hide();						
						//	console.log(data.data.status);
						//	console.log(data.data.drv_id);
						break;
						
						case "ON":
							if (tmppsgstatus != "ON" ) {
								tmppsgstatus = "ON"; 	
								BootstrapDialog.closeAll()
								flag = true;
							}
							$(".menu-box").hide();
							//$(".process-loading-topic").hide();
							//$(".process-loading").show();		
							if  ( flag ) {
								flag= false  ;		
								var text =  'รอสักครู่ เรากำลังดำเนินการ<br>' ;	
								text += '<img src="../img/loadingwaiting.gif"><br>';
								
							        	BootstrapDialog.show({
							            		title: 'กำลังเรียกแท็กซี่',
							            		message:  text,
							            		buttons: [{
							                		label: 'ยกเลิก',
							                		cssClass: 'btn-warning',
							                		action: function(dialogItself) {
											$.ajax({
												type: "POST",
												contentType: "application/json; charset=utf-8", 				     
												url : "../service/passengercs/cancelCall",
												dataType: "json", 
												data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
												success: function(data){									     
												} 
											});
											dialogItself.close();
											$(".menu-box").show();
							            			}
							            		}]
							       	 });
							}								
							//$('#myModal').modal('show');
						//	console.log(data.data.status);
						//	console.log(data.data.drv_id);	
						break;

						case "WAIT":
							$(".menu-box").hide();
							//$(".process-loading-topic").hide();
							//$(".process-loading").show();							
							//console.log(flag)
							if (tmppsgstatus != "WAIT" ) {
								tmppsgstatus = "WAIT"; 	
								BootstrapDialog.closeAll()
								flag = true;
							}
							if  (  flag    ) {
								flag= false  ;
								$.ajax({
									type: "POST",
									contentType: "application/json; charset=utf-8", 				     
									url : "../service/drivercs/getByID",
									dataType: "json", 
									data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
									success: function(result){
										var  text = 'This taxi has chose you,<br>'  ;
										text += 'ชื่อ : '+ result.data.fname + ' ' + result.data.lname +'<br>';
										text += 'ทะเบียน : '+ result.data.carplate  +'<br>';
										text += 'เบอร์ติดต่อ : <a href="tel:'+result.data.phone+'" >'+ result.data.phone  +'</a><br>';	
										//var hosttemp = document.location.hostname;
										var hosttemp = 'http://ecvttaxiapp1.ecartstudio.com';
										if (result.data.imgface!='') {
										text += '<img src="'+hosttemp+'/image/driver/'+ result.data.imgface  +'" width="150" ><br>';	
										}

										text += '<br>please select to accept or cancel'  ;
																				
										BootstrapDialog.show({
											title: '<h3>You got  a taxi</h3>',
											message:  text  ,
											buttons: [{
												label: 'Accept this Taxi',
												cssClass: 'btn-primary',
												action: function(dialogItself) { 
													flag= true  ;
													$.ajax({
														type: "POST",
														contentType: "application/json; charset=utf-8", 				     
														url : "../service/passengercs/acceptDrv",
														dataType: "json", 
														data: " { \"device_id\": \""+tempid+"\" , \"drv_id\":\""+data.data.drv_id+"\" } ", 			     
														success: function(result){
														}
													});	
													dialogItself.close();
												}
											} , {
												label: 'Cancel this Taxi',
												cssClass: 'btn-warning',
												action: function(dialogItself) {
													flag= true  ;
													$.ajax({
														type: "POST",
														contentType: "application/json; charset=utf-8", 				     
														url : "../service/passengercs/cancelDrv",
														dataType: "json", 
														data: " { \"device_id\": \""+tempid+"\" , \"drv_id\":\""+data.data.drv_id+"\" } ", 			     
														success: function(result){
														}
													});
													dialogItself.close();
												}
											}]
										});
									} 
								});
							}
							//$('#myModal').modal('show');							
						//	console.log(data.data.status);	
						//	console.log(data.data.drv_id);							
						break;	

						case "BUSY":
							if (tmppsgstatus != "BUSY" ) {
								tmppsgstatus = "BUSY"; 	
								BootstrapDialog.closeAll()
								flag = true;
							}						
							$(".menu-box").hide();
							//$(".process-loading-topic").hide();
							//$(".process-loading").show();							
							if  ( flag ) {
								flag= false  ;
								$.ajax({
									type: "POST",
									contentType: "application/json; charset=utf-8", 				     
									url : "../service/drivercs/getByID",
									dataType: "json", 
									data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
									success: function(result){
										var  text = 'He will be get to you soon.<br>'  ;		
										text += '<img src="../img/taxi_going_1.gif"><br>';
										text += 'ชื่อ : '+ result.data.fname + ' ' + result.data.lname +'<br>';
										text += 'ทะเบียน : '+ result.data.carplate  +'<br>';
										text += 'เบอร์ติดต่อ : <a href="tel:'+result.data.phone+'" >'+ result.data.phone  +'</a><br>';
										//var hosttemp = document.location.hostname;
										var hosttemp = 'http://ecvttaxiapp1.ecartstudio.com';
										if (result.data.imgface!='') {
										text += '<img src="'+hosttemp+'/image/driver/'+ result.data.imgface  +'" width="150" ><br>';	
										}											
										BootstrapDialog.closeAll()
										BootstrapDialog.show({
											title: '<h3>Please wait </h3>',
											message:  text  ,
											
											buttons: [{
												label: 'Hide dialog',
												action: function(dialogItself) { 
													dialogItself.close();					
												}
											} , {
											
												label: 'Cancel this Taxi',
												cssClass: 'btn-warning',
												action: function(dialogItself) {
													//flag= true  ;
													$.ajax({
														type: "POST",
														contentType: "application/json; charset=utf-8", 				     
														url : "../service/passengercs/cancelCall",
														dataType: "json", 
														data: " { \"device_id\": \""+tempid+"\" , \"drv_id\":\""+data.data.drv_id+"\" } ", 			     
														success: function(result){
														}
													});
													dialogItself.close();
												}
											}]
										});
									} 
								});
							}
							//$('#myModal').modal('show');
							//console.log(data.data.status);
							//console.log(data.data.drv_id);								
						break;

						case "PICK":
							if (tmppsgstatus != "PICK" ) {
								tmppsgstatus = "PICK"; 	
								BootstrapDialog.closeAll()
								flag = true;
							}						
							$(".menu-box").hide();
							//$(".process-loading-topic").hide();
							//$(".process-loading").show();							
							if  ( flag ) {
								flag= false  ;
								$.ajax({
									type: "POST",
									contentType: "application/json; charset=utf-8", 				     
									url : "../service/drivercs/getByID",
									dataType: "json", 
									data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
									success: function(result){
										var  text = 'Your driver info: <br>'  ;
										text += 'ชื่อ : '+ result.data.fname + ' ' + result.data.lname +'<br>';
										text += 'ทะเบียน : '+ result.data.carplate  +'<br>';
										text += 'เบอร์ติดต่อ : <a href="tel:'+result.data.phone+'" >'+ result.data.phone  +'</a><br>';
										//var hosttemp = document.location.hostname;
										var hosttemp = 'http://ecvttaxiapp1.ecartstudio.com';
										if (result.data.imgface!='') {
										text += '<img src="'+hosttemp+'/image/driver/'+ result.data.imgface  +'" width="150" ><br>';
										}
										BootstrapDialog.closeAll()
										BootstrapDialog.show({
											title: '<h3>Your driver is with you.</h3>',
											message:  text ,
											buttons: [{
												label: 'Hide this dialog',
											    	action: function(dialogRef){
											        		dialogRef.close();
											    	}
											}]
										});
									} 
								});
							}
							//$('#myModal').modal('show');
							//console.log(data.data.status);
							//console.log(data.data.drv_id);								
						break;

						default:
							//default code block
						}				        	
			     		} // switch
				});					
			} // undefined curlat
		}




		/*
		$(function() {  	
			$("#psgnearby").autocomplete({ 
			    source: function (request, response) { 
			        $.ajax({ 
			            type: "POST", 
			            contentType: "application/json; charset=utf-8", 
			            url: "http://locator-dev.ecartmap.com/locator/poi", 
			            dataType: "json", 
			            data: "{'Name':'" + request.term + "'}", 
			            success: function (data) { 
			            	//console.log(data)
			           		response($.map(data, function (item) {                			
			            	    return { 
			                	    //label: item.Name + '(' + item.Value + ')',
			                        label: item.Name, value: item.Name, latlng: item.Lat+','+item.Long
			                        } 
			                    }	//return
			                    )	//(data
			           		)		//$.map
			            } 
			        }); 
			    }, 
			    minLength: 2, 
			    select: function (event, ui) {      		
			  		var setlatlng = ui.item.latlng; 
			  		//alert(setlatlng);
			  		//map.setView([.split','],15);
			  		map.setView(setlatlng.split(','),13)
			  		PinDestination();
			    }, 
			    open: function () { 
			        $(this).removeClass("ui-corner-all").addClass("ui-corner-top"); 
			    }, 
			    close: function () { 
			        $(this).removeClass("ui-corner-top").addClass("ui-corner-all"); 
			    }, 
			    error: function (XMLHttpRequest, textStatus, errorThrown) { 
			        alert(textStatus); 
			    } 
			}); 
		});	
		*/
	
	
		function checkGPS(callback){			
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					//console.log('lat =>'+position.coords.latitude+' || lon =>'+position.coords.longitude);
					curlng =  position.coords.longitude ;
					curlat =  position.coords.latitude ;
					JsonData = { "type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude], "lat": position.coords.latitude, "lng": position.coords.longitude, "time stamp" : [new Date(position.timestamp)], "tempid" : tempid }
					//console.log(JsonData)
					//socket.emit('myPsgLocation',  JsonData );
			      		//addPoiJson(JsonData);
					//callback();
					//getDrvarround( curlng, curlat,   10000,100);
			    	}, function() {
			      		console.log("Can not get your location, please allow browser to get your location.");
			    	});
			}			
			//getAllPassenger();			
		}



		function addPoiJson(JsonData) {
			//var myIcon = L.icon({iconUrl: 'img/map/taxi_pin.png'});
			var myIcon = L.icon({			 	
			 	iconUrl: '../assets/img/map/pin-passenger.png',
			 	//shadowUrl: 'img/map/leaf-shadow.png'
				iconAnchor: [25, 25]			 	
			 });
			 var myStyle = {
			 	color: '#f00',
			 	fillColor: '#ffc4c4',
			 	weight: 2,
			 	opacity: 0.8,
			 	icon: myIcon,			
			 	iconUrl: 'img/map/pin-passenger.png'
			 };
			 /*
			jsonPoiList = L.geoJson(JsonData, {
			   	style: myStyle
			 });
			 */
			//console.log(map.getCenter())			
			if(map.hasLayer(putPsg)) {
				map.removeLayer(putPsg);
			} else {
				map.setView([JsonData.coordinates[1],JsonData.coordinates[0]],15);
				//PinStart();
			}			
			putPsg = new L.marker([JsonData.coordinates[1],JsonData.coordinates[0]], {icon: myIcon, style: myStyle}).whitePopup('<b>พิกัด '+ JsonData.coordinates[1] +' , '+ JsonData.coordinates[0]);			
			map.addLayer(putPsg);
			//console.log(JsonData.getBounds())
			//map.fitBounds(JsonData.getBounds());
			//console.log(typeof )	
		}



		function addPoi(JsonData) {
		//console.log('add poi');		 
		 var myIcon = L.icon({iconUrl: 'img/map/taxi_pin.png'});
		 
		 var myStyle = {
		 	color: '#f00',
		 	fillColor: '#ffc4c4',
		 	weight: 2,
		 	opacity: 0.8,
		 	icon: myIcon,			
		 	iconUrl: 'img/map/taxi_pin.png'
		 };
			
		//	console.log('hey!!!!!!');
			$.each(JsonData.data, function(i, item) {
			  //console.log(item.lat +' , '+item.lng) ;			  
			 	putMarker = new L.marker([item.lat,item.lng], {icon: myIcon, style: myStyle});
				map.addLayer(putMarker);			  
			});

		}



		/* -----------------------------------------
				Get passenger list (all)
	  	   ----------------------------------------- */

		function getAllPassenger () {

			//console.log('getAllPassenger');
			// $.ajax({
			//     url : "/service/getPassenger/all",
			//     type: "GET",
			//     success: function(data){
			//        	console.log(data);
			//        	addPoiJson(data.geoJson);
			//     }
			// });

			socket.emit('PsgCurLatLng',{msg:'request'});

			socket.on('show all passenger',function(data){
				//alert('her its html show all passenger !!');
				//console.log(data);
				addPoi(data);
			});
		}





		function getDrvarround(curlng, curlat, radian, limits){		
			$.ajax({
				type: "POST",
			     	contentType: "application/json; charset=utf-8", 				
				url : "../service/passengercs/searchDrv",
				dataType: "json", 
				data: " { \"curlng\": "+curlng+", \"curlat\": "+curlat+", \"radian\":1000000, \"amount\":100 } ", 			     
			     	success: function(data){			        		
			        		addPoiTaxi(data);
			     	} 
			 });
		}



		function getDrvLoc(drv_id){			
			 $.ajax({
			     type: "POST",
			     contentType: "application/json; charset=utf-8", 			     
			     url : "../service/passengercs/getDrvLoc",
			      dataType: "json", 
			      data: " { \"device_id\": \""+tempid+"\", \"drv_id\": \""+drv_id+"\" } ", 			     
			     success: function(data){			        				        	
			        	if(TaxiCurLayer) { 			        		
					/*
					for (var i in TaxiCurLayer) {
					  console.log(i)
					}
					*/
					$.each(TaxiCurLayer, function(i) {						
						if(map.hasLayer(TaxiCurLayer[i])){
							map.removeLayer(TaxiCurLayer[i]);							
						} else {
							//map.setView([JsonData.coordinates[1],JsonData.coordinates[0]],15);
						}						
					});
					TaxiCurLayer = '';			        		
			        	} else {
			        		//console.log('no layer object')
			        		if(map.hasLayer(DrvLocMarker)) {
			        			map.removeLayer(DrvLocMarker);
			        			addPoiDrvLoc(data);	
			        		} else {
			        			addPoiDrvLoc(data);	
			        		}
			        		
			        	}
				
				/*
				if(map.hasLayer(putDrv)) {
					map.removeLayer(putDrv);
				} else {
					console.log('putDrv')
				}	
				*/		        	
			        	//addPoiTaxi(data);
			     } 
			 });
		}




		/* -----------------------------------------
				Get passenger by ID
	  	   ----------------------------------------- */
		function getPassengerById () {
			var data = {
				uid: '555',
				name: 'สมหมาย',
				carLicense: 'ดก-4448',
				lat: 13.3, 
				lng: 100.1,
				distance: 200,
				detail: '',
				status: 3
			};
			$.ajax({
			    url : "/service/getPassenger/5555",
			    type: "POST",
			    data : data,
			    success: function(data){
			       	//console.log(data)
			    }
			});
		}





		/* -----------------------------------------
				Get passenger
	  	   ----------------------------------------- */
		function updatePassenger () {
			var data = {
				uid: '555',
				registrationId: 'sdfadsgjakfdg',
				name: 'สมหมาย',
				carLicense: 'ดก-4448',
				lat: 13.33333333, 
				lng: 100.11243256,
				distance: 200,
				detail: '',
				passengerID: '',
				status: 1
			};
			$.ajax({
			    url : "/service/getPassenger",
			    type: "POST",
			    data : data,
			    success: function(data){
			       	//console.log(data)
			    }
			});
		}


		/* -----------------------------------------
			POST Taxi need to cancel passenger 
	  	   ----------------------------------------- */
	  	   function updateDevice () {
			var data = {
				uid: '555',
				name: 'สมหมาย',
				carLicense: 'ดก-4448',
				lat: 13.456, 
				lng: 100.11243256,
				distance: 4564,
				detail: '',
				passengerID: '0001',
				status: 1
			};
			$.ajax({
			    url : "service/device/updateStatus",
			    type: "POST",
			    data : data,
			    success: function(data){
			       	//console.log(data)
			    }
			});
		}


		/* -----------------------------------------
			POST Taxi need to picup passenger
	  	   ----------------------------------------- */
		function updateDeviceWaiting () {
			var data = {
				uid: '555',
				name: 'สมหมาย',
				carLicense: 'ดก-4448',
				lat: 13.456, 
				lng: 100.11243256,
				distance: 4564,
				detail: '',
				passengerID: '0001',
				status: 5
			};
			$.ajax({
			    url : "service/device/updateStatus",
			    type: "POST",
			    data : data,
			    success: function(data){
			       	//console.log(data)
			    }
			});
		}




		/* -----------------------------------------
				Get Taxi
	  	   ----------------------------------------- */

		function getTaxi () {

			var data = {
				uid: '5555',
				registrationId: 'ljfglkdf',
				name: 'สมบัติ',
				phoneNumber: '0843112347',
				lat: 13.0, 
				lng: 100.9,
				distance: 200,
				detail: '',
				destination: 'กรุงเทพ',
				status: 1
			};

			$.ajax({
			    url : "/service/getDevice",
			    type: "POST",
			    data : data,
			    success: function(data){
			       	//console.log(data)
			    }
			});

		}





		/* -----------------------------------------
				Get Taxi list (all)
	  	----------------------------------------- */
		function getAllTaxi () {
			$.ajax({
			    url : "/service/getDevice/all",
			    type: "GET",
			    success: function(data){
			       	//console.log(data)
			    }
			});

		}



		socket.on('ShowTaxiLocation', function (data) {	  	    
		    //console.log(data);
		    addPoiTaxi(data);
		});
 
 
		var test = ''

		function addPoiTaxi(JsonData) {			
		 
			 var  myIcon  ; 
			 var myStyle = {
			 	color: '#f00',
			 	fillColor: '#ffc4c4',
			 	weight: 1,
			 	opacity: 0.8,
			 	icon: myIcon,			
			 	iconUrl: 'img/map/taxi_pin.png'
			 };
			 
			 
				//console.log('hey!!!!!! น้องไอยรา ... ');
				test = JsonData;



				$.each(JsonData.data, function(i, item) {
					 tempmk = item._id;
					/* 		  
				 	AllDrvMarker = new L.marker([item.curlat,item.curlng], {icon: myIcon, style: myStyle}).bindPopup( '<b>ชื่อ</b>:'+item.fname+' '+item.lname+'<br><b>โทรศัพท์</b>: <a href="tel:'+item.phone+'">'+item.phone+'</a><br><b>ทะเบียน</b>: '+item.carplate+'<br>' ) ;
					map.addLayer(AllDrvMarker);
					*/ 
		        		if(map.hasLayer(TaxiCurLayer[tempmk]) ) {
		        			map.removeLayer(TaxiCurLayer[tempmk]);		        			
		        		} 
						 
				
					
						myIcon = L.icon({			 	
							iconUrl: '../assets/img/map/pin-taxi-'+item.status+'.png',
							//shadowUrl: 'img/map/leaf-shadow.png'
							iconAnchor: [20, 20] ,
                            labelAnchor:[10,0] 								
						 });
				    var tlabel =  item.carplate +' ' ; //  + item.status ; 
				 	TaxiCurLayer[tempmk]  = new L.marker([item.curlat,item.curlng], {icon: myIcon, style: myStyle}).bindLabel( tlabel ,{ noHide:true ,direction: 'auto' ,className:'label_taxi_'+item.status } ).bindPopup( '<b>ชื่อ</b>:'+item.fname+' '+item.lname+'</a><br><b>ทะเบียน </b> : '+item.carplate+'<br>'+'<br><b> โทรศัพท์ </b> : <a href="tel:'+item.phone+'">'+item.phone  ) ;
					
					
					map.addLayer( TaxiCurLayer[tempmk]);		  
					
				});
		}



		function addPoiDrvLoc(JsonData) {			
			var myIcon = L.icon({			 	
			 	iconUrl: '../assets/img/map/pin-taxi-40.png',
			 	//shadowUrl: 'img/map/leaf-shadow.png'
				iconAnchor: [20, 20]			 	
			 });		 
			 var myStyle = {
			 	color: '#f00',
			 	fillColor: '#ffc4c4',
			 	weight: 2,
			 	opacity: 0.8,
			 	icon: myIcon,			
			 	iconUrl: 'img/map/taxi_pin.png'
			 };
				//console.log('hey!!!!!! น้องไอยรา ... ');
				//test = JsonData;
			 	DrvLocMarker = new L.marker([JsonData.data.curlat,JsonData.data.curlng], {icon: myIcon, style: myStyle}).bindPopup( '<b>ชื่อ</b>:'+JsonData.data.fname+' '+JsonData.data.lname+'<br><b>โทรศัพท์</b>: <a href="tel:'+JsonData.data.phone+'">'+JsonData.data.phone+'</a><br><b>ทะเบียน</b>: '+JsonData.data.carplate+'<br>' ) ;
				map.addLayer(DrvLocMarker);
		}



	function PinStart(){
		var myIcon = L.icon({
			iconUrl: 'img/map/pin-passenger.png',
			iconAnchor: [25, 25],		    
		});
		var pinCenter = map.getCenter();			
		markerS = L.marker(pinCenter,{icon: myIcon, draggable: true });			
		markerS.bindLabel('Start', {noHide: true});
		markerS.addTo(map);
		map.setView(pinCenter,15);
		//markerS.dragging.enable();
		markerS.on('dragend', function(e) {			    
		    //CStartingP = markerS.getLatLng();
			CStartingPlat = markerS.getLatLng().lat;
		    	CStartingPlng = markerS.getLatLng().lng;			    
			//markerS.bindPopup('<p>Please confirm the starting point<br><center><input type="button" value="START"></center></p>').openPopup();
			$.ajax({
				url : "http://proxy.hmap-dev.ecartmap.com/getDirection.php?url=https%3A//maps.googleapis.com/maps/api/directions/json%3Forigin%3D"+CStartingPlat+"%2C"+CStartingPlng+"%26destination%3D"+CEndingPlat+"%2C"+CEndingPlng+"%26waypoints%3Doptimize%3Atrue%26mode%3Ddriving%26language%3DTH%26sensor%3Dfalse%26key%3DZNViRo_sRGCtsSc3BeC280Rlprg%3D%26client%3Dgme-ecartstudiocompany&dummy=0.5774756167083979%20200%20OK%201417ms",
				type: "GET",
				success: function(data){
			    		if (data.status=='OK') {
			    			var enc = data.routes[0].overview_polyline.points;
			    			var straddr = data.routes[0].legs[0].start_address;
			    			var endaddr = data.routes[0].legs[0].end_address;
			    			var tim = data.routes[0].legs[0].duration.text;
			    			var dis = data.routes[0].legs[0].distance.text;
			    			$('#FromDir').text(straddr);
			    			$('#ToDir').text(endaddr);
			    			$('#DistanceDir').text(dis);
			    			$('#TimeDir').text(tim);
			    			var polyDecode = map.navigation._decodeGoogle(enc);
			    			//console.log(polyDecode)
			    			if (OSEPolyline!=undefined) {				    		
			    				map.removeLayer(OSEPolyline);
			    				OSEPolyline = L.polyline(polyDecode).addTo(map);
			    			} else {
			    				OSEPolyline = L.polyline(polyDecode).addTo(map);
			    			}
			       			//console.log(data);
			       			$("#idirection").show();
			    		}
			    	}
			});

		});			
	}


	function PinDestination(){		
		var myIcon = L.icon({
		    iconUrl: 'img/map/pin-destination.png',		    
		    iconAnchor: [25, 25],		    
		});
		var pinCenter = map.getCenter();			
		markerD = L.marker(pinCenter, {icon: myIcon, draggable: true});
		markerD.bindLabel('Destination', {noHide: true});
		markerD.addTo(map);
		map.setView(pinCenter,15);
		//markerD.dragging.enable();
		markerD.on('dragend', function(e) {			    
		    //CEndingP = markerD.getLatLng();
			CEndingPlat = markerD.getLatLng().lat;
		CEndingPlng = markerD.getLatLng().lng;
			$.ajax({					
				url : "http://proxy.hmap-dev.ecartmap.com/getDirection.php?url=https%3A//maps.googleapis.com/maps/api/directions/json%3Forigin%3D"+CStartingPlat+"%2C"+CStartingPlng+"%26destination%3D"+CEndingPlat+"%2C"+CEndingPlng+"%26waypoints%3Doptimize%3Atrue%26mode%3Ddriving%26language%3DTH%26sensor%3Dfalse%26key%3DZNViRo_sRGCtsSc3BeC280Rlprg%3D%26client%3Dgme-ecartstudiocompany&dummy=0.5774756167083979%20200%20OK%201417ms",
			    	type: "GET",
			    	success: function(data){
			    		var enc = data.routes[0].overview_polyline.points;
			    		var straddr = data.routes[0].legs[0].start_address;
			    		var endaddr = data.routes[0].legs[0].end_address;
			    		var tim = data.routes[0].legs[0].duration.text;
			    		var dis = data.routes[0].legs[0].distance.text;
			    		$('#FromDir').text(straddr);
			    		$('#ToDir').text(endaddr);
			    		$('#DistanceDir').text(dis);
			    		$('#TimeDir').text(tim);				    	
			    			var polyDecode = map.navigation._decodeGoogle(enc);				    	
			    			//console.log(polyDecode)
			    	if (OSEPolyline!=undefined) {				    		
			    		map.removeLayer(OSEPolyline);
			    		OSEPolyline = L.polyline(polyDecode).addTo(map);
			    	} else {
			    		OSEPolyline = L.polyline(polyDecode).addTo(map);
			    	}
			    	$("#idirection").show();
			    	//console.log(dis);
			    	//console.log(tim);
			       	//console.log(data);
			       	//map.clearLayer();
			    }
			});
		    //markerD.bindPopup('<p>Please confirm the destination point<br><center><input type="button" value="DESTINATION"></center></p>').openPopup();
		});			
	}






	function gatMeaTaxi () {
		//alert('getmeataxi')
		if ( $('#psgfrom').val()==''  || $('#psgto').val()=='' || $('#psgphone').val()==''  ){
			alert('กรุณากรอกข้อมูลให้ครบถ้วน')
		} else {
			var data = {
				device_id: tempid,
				curaddr: $('#psgfrom').val(),
				destination: $('#psgto').val(),
				phone: $('#psgphone').val(),			
				curlng: curlng,
				curlat: curlat,
				tip: 0,
				detail: ''
			};

			$.ajax({
			    url : "../service/passengercs/callDrv",
			    type: "POST",
			    data : data,
			    success: function(data){
			       	//console.log(data)
			       	checkstatuspsg();
				/*if  ( flag ) {
					flag= false  ;		
					var text =  'please wait for taxi to get the queue<br>' ;								
					text += '<img src="../img/taxi_going_1.gif"><br>';
					text += '<img src="../img/loadingwaiting.gif"><br>';
				        	BootstrapDialog.show({
				            		title: '<h1>Calling a taxi</h1>',
				            		message:  text,
				            		buttons: [{
				                		label: 'Cancel',
				                		cssClass: 'btn-warning',
				                		action: function(dialogItself) {
								$.ajax({ 
									type: "POST",
									contentType: "application/json; charset=utf-8", 				     
									url : "../service/passengercs/cancelCall",
									dataType: "json", 
									data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
									success: function(data){									     
						 			} 
								});
								dialogItself.close();
								$(".menu-box").show();
				            			}
				            		}]
				       	 });
				}*/
			    }
			});
		}
	}