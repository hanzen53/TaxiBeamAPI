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
var browser_id;	
var curlng = 104.8601933 ;
var curlat = 15.243196;
var tmppsgstatus;

var flag = true ;  // to check dialog

map.setView([13.753,100.571], 10);

if(map.control && map.control.menu){
	map.control.menu.disable();
}
if(map.control && map.control.rightclick){
	map.control.rightclick.disable();
}

map.on('draw:created', function (e) {
	var type = e.layerType,
	layer = e.layer;
	map.addLayer(layer);
});


if ( localStorage.getItem('browser_id') == null ) { 
	tempid = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime();	
	localStorage.setItem('browser_id', tempid );
} else {
	tempid = localStorage.getItem('device_id');
}

browser_id = localStorage.getItem('browser_id');

$(document).ready(function() {

	checkstatuspsg();
	//alert(localStorage.getItem('firsttimehowto'));

	if ( localStorage.getItem('firsttimehowto') >= 1 ) {
		$('.taxibeampsng-howtouse').hide();
	}  else {
		localStorage.setItem('firsttimehowto', 1 );
		$('.taxibeampsng-howtouse').addClass('active');		
	}


	if ( localStorage.getItem('device_id') != null ) { 
		 $('#psgphone').val(localStorage.getItem('device_id'));
	}	

	var deviceH = $(window).height();

	if ($(window).width() > 1024) {
		$('.taxibeampsng-wrapper').height(deviceH);
		$('.taxibeampsng-wrapper').width(deviceH-256);
		$(window).resize(function() {
			var deviceHRD = $(window).height();
			$('.taxibeampsng-wrapper').height(deviceHRD);
			$('.taxibeampsng-wrapper').width(deviceHRD-256);
		});
	}

//	$('.taxibeampsng-howtouse .skip').click(function() {
//		$('.taxibeampsng-howtouse').addClass('hide');
//	});

		$('.taxibeampsng-howtouse .skip').on('click touchstart' ,function() {
		$('.taxibeampsng-howtouse').addClass('hide');
	});
	$('.taxibeampsng-checkbox-minivan').click(function() {
		$(this).children().toggleClass('active');
		if($(this).children().hasClass('active')){
			$(this).children().children('i').addClass('icon-btn_minivan_check');
			$(this).children().children('i').removeClass('icon-btn_minivan_uncheck');
		} else {
			$(this).children().children('i').removeClass('icon-btn_minivan_check');
			$(this).children().children('i').addClass('icon-btn_minivan_uncheck');
		}
	});

	$('.taxibeampsng-checkbox-car').click(function() {
		$(this).children().toggleClass('active');
		if($(this).children().hasClass('active')){
			$(this).children().children('i').addClass('icon-btn_sedan_check');
			$(this).children().children('i').removeClass('icon-btn_sedan_uncheck');
		} else {
			$(this).children().children('i').removeClass('icon-btn_sedan_check');
			$(this).children().children('i').addClass('icon-btn_sedan_uncheck');
		}
	});

	$('.taxibeampsng-calltaxi-btn').click(function() {
		if(cur_status=="BUSY" || cur_status=="PICK"){
			localStorage.setItem('status_view', '' );
			$('.taxibeampsng-status-busy').addClass('active');
		} else {
			$('.taxibeampsng-form-calltaxi').addClass('active');
			$('#map').height(deviceH-285);
		}

	});

	$('.taxibeampsng-hide-form-calltaxi').click(function() {
		$('.taxibeampsng-form-calltaxi').removeClass('active');
		$('#map').height(deviceH);
	});

	$('.taxibeampsng-form-calltaxi .taxibeampsng-submit-btn').click(function() {
		//$('.taxibeampsng-status-waittaxi').addClass('active');
		//$('.taxibeampsng-form-calltaxi').removeClass('active');
	});

	$('.taxibeampsng-status-waittaxi .taxibeampsng-cancel-btn').click(function() {
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/cancelCall",
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
			success: function(data){									     
				$('.taxibeampsng-form-calltaxi').addClass('active');
				$('.taxibeampsng-status-waittaxi').removeClass('active');
			} 
		});
	});


	$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').click(function() {

		if(cur_status=="WAIT"){
			$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8", 				     
				url : "../service/passengertp/acceptDrv",				
				dataType: "json", 
				data: " { \"device_id\": \""+tempid+"\" , \"drv_id\":\""+drv_id+"\" } ", 			     
				success: function(data){									     
					$('.taxibeampsng-status-gottaxi').removeClass('active');
					$('.taxibeampsng-status-busy').addClass('active');
				} 
			});
		}

		if(cur_status=="BUSY"){			
			//$('.taxibeampsng-status-waittaxi').addClass('active');
			$('.taxibeampsng-status-gottaxi').removeClass('active');
			$('.menu-box taxibeampsng-form-calltaxi').removeClass('active');			
			$('.taxibeampsng-calltaxi-btn').text('ดูรายละเอียดรถแท็กซี่');			
			$('#map').height(deviceH);
		}		

		if(cur_status=="PICK"){			
			//$('.taxibeampsng-status-waittaxi').addClass('active');
			$('.taxibeampsng-status-gottaxi').removeClass('active');
			$('.menu-box taxibeampsng-form-calltaxi').removeClass('active');			
			$('.taxibeampsng-calltaxi-btn').text('ดูรายละเอียดรถแท็กซี่');			
			$('#map').height(deviceH);
		}

	});


	$('.taxibeampsng-status-busy .taxibeampsng-submit-btn').click(function() {
			//$('.taxibeampsng-status-waittaxi').addClass('active');
		if(cur_status=="BUSY"){
			localStorage.setItem('status_view', '' );
		} 			
			$('.taxibeampsng-status-busy').removeClass('active');
			$('.menu-box taxibeampsng-form-calltaxi').removeClass('active');			
			$('.taxibeampsng-calltaxi-btn').text('ดูรายละเอียดรถแท็กซี่');
			$('#map').height(deviceH);
	});


	$('.taxibeampsng-status-thankyou .taxibeampsng-submit-btn').click(function() {
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/endTrip",				
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\" } ", 			     
			success: function(data){									     
				$('.taxibeampsng-status-thankyou').removeClass('active');
				$('.taxibeampsng-calltaxi-btn').text('เรียกแท็กซี่ผ่านระบบ');
			} 
		});
	});	



	$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').click(function() {
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/cancelDrv",
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\" , \"drv_id\":\""+drv_id+"\" } ", 			     
			success: function(data){									     
				$('.taxibeampsng-status-gottaxi').removeClass('active');
				$('.taxibeampsng-status-waittaxi').addClass('active');
			} 
		});
	});	

	$('.taxibeampsng-status-busy .taxibeampsng-cancel-btn').click(function() {
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/cancelDrv",
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\" , \"drv_id\":\""+drv_id+"\" } ", 			     
			success: function(data){									     
				$('.taxibeampsng-status-busy').removeClass('active');
				$('.taxibeampsng-status-waittaxi').addClass('active');
			} 
		});
	});	


	$(window).resize(function() {
		var deviceHR = $(window).height();
		if($('.taxibeampsng-form-calltaxi').hasClass('active')) {
			$('#map').height(deviceHR-285);
		} else {
			$('#map').height(deviceHR);
		}
	});

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
	
	/*
	setInterval(function() { 			
		getDrvarround( curlng, curlat,   1000000,500);
	}, 10000);
	*/

	setInterval(function() { 			
		checkstatuspsg();  
	}, 10000);
			
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
		if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13	|| (event.keyCode == 65 && event.ctrlKey === true)	|| (event.keyCode >= 35 && event.keyCode <= 39)) {
			return;
		} else {
			// If it's not a number stop the keypress
			if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
				event.preventDefault();
			}
		}
	});
});


	
function getDrvarround(curlng, curlat, radian, limits){		
	$.ajax({
		type: "POST",
	     	contentType: "application/json; charset=utf-8", 				
		url : "../service/passengertp/searchDrv",
		dataType: "json", 
		data: " { \"curlng\": "+curlng+", \"curlat\": "+curlat+", \"radian\":1000000, \"amount\":100 } ", 			     
	     	success: function(data){			        		
	        		addPoiTaxi(data);
	     	} 
	 });
}



function addPoiTaxi(JsonData) {
	 var myIcon  ; 
	 var myStyle = {
	 	color: '#f00',
	 	fillColor: '#ffc4c4',
	 	weight: 1,
	 	opacity: 0.8,
	 	icon: myIcon,			
	 	iconUrl: 'img/map/taxi_pin.png'
	 };	
	test = JsonData;
	$.each(JsonData.data, function(i, item) {
		tempmk = item._id;
		tempstatus = item.status;
		//console.log(item.curlat,item.curlng)
		/* 		  
	 	AllDrvMarker = new L.marker([item.curlat,item.curlng], {icon: myIcon, style: myStyle}).bindPopup( '<b>ชื่อ</b>:'+item.fname+' '+item.lname+'<br><b>โทรศัพท์</b>: <a href="tel:'+item.phone+'">'+item.phone+'</a><br><b>ทะเบียน</b>: '+item.carplate+'<br>' ) ;
		map.addLayer(AllDrvMarker);
		*/ 

    		if(map.hasLayer(DrvLocMarker)) {
    			map.removeLayer(DrvLocMarker);
    		} 

        		if(map.hasLayer(TaxiCurLayer[tempmk])) {
        			map.removeLayer(TaxiCurLayer[tempmk]);		        			
        		}
		myIcon = L.icon({			 	
			iconUrl: '../assets/img/map/tx_'+item.status+'@2x.png',
			iconRetinaUrl: '../assets/img/map/tx_'+item.status+'@2x.png',
			iconSize: [42, 47],
			//shadowUrl: 'img/map/leaf-shadow.png'
			iconAnchor: [20, 20] ,
			labelAnchor:[-50,-42] 								
		});
		if(item.curlat!=''&&item.curlng!=''){
	 		TaxiCurLayer[tempmk]  = new L.marker([item.curlat,item.curlng], { icon: myIcon, style: myStyle}).bindPopup( '<p>'+item.fname+' '+item.lname+'</p><p class="carno">'+item.carplate+'</p>'+'<a href="tel:'+item.phone+'"><i class="icon-icn_phone"></i>'+item.phone+'</a>'  ) ;
			map.addLayer( TaxiCurLayer[tempmk]);
		}
			
	});
}



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

	

function gatMeaTaxi () {

	//if ( localStorage.getItem('device_id') == null ) { 
		tempid = $('#psgphone').val();
		localStorage.setItem('device_id', tempid );
	//}

	var favcartype = [];
	if ($('#car').is(":checked")) {
		favcartype.push($('#car').val());
	}	
	if ($('#minivan').is(":checked")) {
		favcartype.push($('#minivan').val());
	}	
	if ( $('#psgfrom').val()==''  || $('#psgto').val()=='' || $('#psgphone').val()==''  ){
		alert('กรุณากรอกข้อมูลให้ครบถ้วน')
		return false;
	} else {
		var data = {
			device_id: tempid,
			favcartype: favcartype,
			curaddr: $('#psgfrom').val(),
			destination: $('#psgto').val(),
			phone: $('#psgphone').val(),			
			curlng: curlng,
			curlat: curlat,
			tip: 0,
			detail: ''
		};

		$.ajax({
		    url : "../service/passengertp/callDrv",
		    type: "POST",
		    data : data,
		    success: function(data){
		       	//console.log(data)
		       	checkstatuspsg();		       	
		    }
		});
	}
}

var cur_status ;

function checkstatuspsg() { 
	//console.log('checkstatuspsg')
	//console.log('curlng ='+curlng)	
	//console.log(tempid)		
	if (curlng != 0) {
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/getStatus",
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
			success: function(data){
		        		//console.log(data.status);
			        	if(data.status) {
			        		var getstatus = data.data.status;
			        		cur_status= getstatus;
			        		if (data.data.drv_id){
			        			drv_id = data.data.drv_id;
			        			getDrvLoc(data.data.drv_id);	
			        		}					
					switch(getstatus) {
						case "OFF":
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		} 						
							getDrvarround( curlng, curlat,   1000000,500);
						//	console.log(data.data.status);
						//	console.log(data.data.drv_id);
						break;
						
						case "INITIATE":
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		} 						
							getDrvarround( curlng, curlat,   1000000,500);
							$('.taxibeampsng-status-waittaxi').addClass('active');
						break;

						case "ON":
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		} 						
							$('.taxibeampsng-status-waittaxi').addClass('active');
							$('.taxibeampsng-status-busy').removeClass('active');
							$('.taxibeampsng-status-gottaxi').removeClass('active');
							$('.taxibeampsng-form-calltaxi').removeClass('active');				
						break;

						case "WAIT":
							$('.taxibeampsng-status-waittaxi').removeClass('active');
							$.ajax({
								type: "POST",
								contentType: "application/json; charset=utf-8", 				     
								url : "../service/drivercs/getByID",
								dataType: "json", 
								data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
								success: function(result){
									var hosttemp = 'http://ubeam.demo.taxi-beam.com';
									$('.taxibeampsng-status-gottaxi').addClass('active');	
									$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
									$('.taxibeampsng-gottaxi-taxino').text( result.data.carplate);
									$('.taxibeampsng-gottaxi-taxiname').text(result.data.fname + ' ' + result.data.lname);
									$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
								} 
							});
						break;	

						case "BUSY":		
							//$('.taxibeampsng-status-gottaxi').removeClass('active');						
							$.ajax({
								type: "POST",
								contentType: "application/json; charset=utf-8", 				     
								url : "../service/drivercs/getByID",
								dataType: "json", 
								data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
								success: function(result){
									var hosttemp = 'http://ubeam.demo.taxi-beam.com';
									$('.taxibeampsng-status-busy').addClass('active');	
									if ( localStorage.getItem('status_view') == 'viewmap' ) {								
									//	$('.taxibeampsng-status-busy').removeClass('active');
										$('.taxibeampsng-status-gottaxi').removeClass('active');
										$('.taxibeampsng-status-busy').removeClass('active');
										$('.menu-box taxibeampsng-form-calltaxi').removeClass('active');			
										$('.taxibeampsng-calltaxi-btn').text('ดูรายละเอียดรถแท็กซี่');									
										$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
										$('.taxibeampsng-busy-taxino').text( result.data.carplate);
										$('.taxibeampsng-busy-taxiname').text(result.data.fname + ' ' + result.data.lname);								
										$('.taxibeampsng-busy-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');									
									} else {									
									//	$('.taxibeampsng-status-busy').addClass('active');
										$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
										$('.taxibeampsng-busy-taxino').text( result.data.carplate);
										$('.taxibeampsng-busy-taxiname').text(result.data.fname + ' ' + result.data.lname);								
										$('.taxibeampsng-busy-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
									}								

								} 
							});
						break;

						case "PICK":
							//$('.taxibeampsng-status-gottaxi').removeClass('active');						
							$.ajax({
								type: "POST",
								contentType: "application/json; charset=utf-8", 				     
								url : "../service/drivercs/getByID",
								dataType: "json", 
								data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
								success: function(result){
									var hosttemp = 'http://ubeam.demo.taxi-beam.com';
									$('.taxibeampsng-status-busy').addClass('active');	
									if ( localStorage.getItem('status_view') == 'viewmap' ) {								
									//	$('.taxibeampsng-status-busy').removeClass('active');
										$('.taxibeampsng-status-gottaxi').removeClass('active');
										$('.taxibeampsng-status-busy').removeClass('active');
										$('.menu-box taxibeampsng-form-calltaxi').removeClass('active');			
										$('.taxibeampsng-calltaxi-btn').text('ดูรายละเอียดรถแท็กซี่');									
										$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
										$('.taxibeampsng-busy-taxino').text( result.data.carplate);
										$('.taxibeampsng-busy-taxiname').text(result.data.fname + ' ' + result.data.lname);								
										$('.taxibeampsng-busy-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');									
									} else {									
									//	$('.taxibeampsng-status-busy').addClass('active');
										$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
										$('.taxibeampsng-busy-taxino').text( result.data.carplate);
										$('.taxibeampsng-busy-taxiname').text(result.data.fname + ' ' + result.data.lname);								
										$('.taxibeampsng-busy-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
									}								

								} 
							});								
						break;


						case "THANKS":
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		} 
							$('.taxibeampsng-status-thankyou').addClass('active');									
						break;					

						default:
							//default code block
					}// switch				        	
			     	}  else {
			     		getDrvarround( curlng, curlat,   1000000,500);
			     	}
			}
		});					
	} // undefined curlat
}


	
	
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
	 	iconUrl: '../assets/img/map/psg_pin@2x.png',
		iconRetinaUrl: '../assets/img/map/psg_pin@2x.png',
		iconSize: [27, 47],
	 	//shadowUrl: 'img/map/leaf-shadow.png'
		iconAnchor: [25, 25]		 	
	 });
	 var myStyle = {
	 	color: '#f00',
	 	fillColor: '#ffc4c4',
	 	weight: 2,
	 	opacity: 0.8,
	 	icon: myIcon,			
	 	/*iconUrl: 'img/map/pin-passenger.png'*/
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
	putPsg = new L.marker([JsonData.coordinates[1],JsonData.coordinates[0]], {icon: myIcon, style: myStyle}).bindPopup('<b>พิกัด '+ JsonData.coordinates[1] +' , '+ JsonData.coordinates[0]);			
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









	function getDrvLoc(drv_id){			
		 $.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8", 			     
			url : "../service/passengertp/getDrvLoc",
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\", \"drv_id\": \""+drv_id+"\" } ", 			     
			success: function(data){
				if(data.status){
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
				}

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



		function addPoiDrvLoc_old(JsonData) {			
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




		 function addPoiDrvLoc(JsonData) {
			 var myIcon  ; 
			 var myStyle = {
			 	color: '#f00',
			 	fillColor: '#ffc4c4',
			 	weight: 1,
			 	opacity: 0.8,
			 	icon: myIcon,			
			 	iconUrl: 'img/map/taxi_pin.png'
			 };	
			//alert(JsonData.data.curlat)			
			//$.each(JsonData.data, function(i, item) {
				//alert(item.curlat)
				//tempmk = item._id;
				//tempstatus = item.status;
		        		if(map.hasLayer(DrvLocMarker)) {
		        			map.removeLayer(DrvLocMarker);		        			
		        		}
				myIcon = L.icon({			 	
					iconUrl: '../assets/img/map/tx_'+JsonData.data.status+'@2x.png',
					iconRetinaUrl: '../assets/img/map/tx_'+JsonData.data.status+'@2x.png',
					iconSize: [42, 47],
					//shadowUrl: 'img/map/leaf-shadow.png'
					iconAnchor: [20, 20] ,
					labelAnchor:[-50,-42] 								
				});
				if(JsonData.data.curlat!=''&&JsonData.data.curlng!=''){
			 		DrvLocMarker = new L.marker([JsonData.data.curlat,JsonData.data.curlng], { icon: myIcon, style: myStyle}).bindPopup( '<p>'+JsonData.data.fname+' '+JsonData.data.lname+'</p><p class="carno">'+JsonData.data.carplate+'</p>'+'<a href="tel:'+JsonData.data.phone+'"><i class="icon-icn_phone"></i>'+JsonData.data.phone+'</a>'  ) ;
					map.addLayer(DrvLocMarker);
				}
					
			//});
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






