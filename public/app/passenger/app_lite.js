// var map = H.map("map");
// map.setMaxZoom(20);
// map.control.locate.disable();	// disable Getcenter on Map
// //map.control.zoom.enable();	// disable Getcenter on Map
//var drawControl = new L.Control.Draw();

//var map = L.map('map').setView([51.505, -0.09], 13);

//var map = L.map('map').setView([13.753,100.571], 10);

// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
// 	maxZoom: 18,
// 	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
// 		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
// 		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
// 	id: 'mapbox.streets'
// }).addTo(map);

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
var putCircle;
var job_id;
var device_id;
var putDrv;
var tempmk;
var AllDrvMarker;
var DrvLocMarker;
var psg_id ;
var PsgLayer = {};
var TaxiCurLayer = {};
var PsgCurLayer = {};
var DrvarroundID = []; 
var favcartype = [];
var animatedMarker;
var polyline_123;
var curaddr_add = "";
var cur_status ;
var hiddenaddress ;
var tempid = "xxx" ;
var browser_id;	
var psg_phone ;
var DrvPsgDistance ;
var PsgLat ;
var PsgLng ;
var PsgstartLat ;
var PsgstartLng ;	
var DrvLat ;
var DrvLng ;
var putPickupLocation ;

var getDrvarroundLoc ;
var getDrvarroundLat ; 
var getDrvarroundLng ; 
var temp_curaddr_add	;
var Pickuplat ;
var Pickuplng ;

var PsgOldLat = 0 ;
var PsgOldLng = 0 ;
var PsgNewLat = 0 ;
var  PsgNewLng = 0 ;

var confirmStepwhat = '' ;		// for alert function 
var FocusTaxiID = "" ;
var FocusTaxiID2 = "" ;
var FocusToggle = true ;

var defaultMapH = 260 ;

var ButAcceptTaxi ;  // for view taxi location at the first time after Accept Taxi

var hosttemp = '';// 'http://lite-test.taxi-beam.com';
var icon_sendcar = '<div style="top:5px;right:45px;position:absolute;width: 130px; height: 40px; border-radius: 40px; background-color: #252526; color: #ff9600;text-align:right;padding:6px;padding-right:36px;"><img style="width:20px; position:absolute;left:22px;top:10px;" src="../assets/img/icon_sendcar.gif"> ส่งรถ <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="-343 295 12 12" style="enable-background:new -343 295 12 12;" xml:space="preserve" width="14" fill="#ff9600"><g><polygon points="-334.6,299 -338.6,295 -340.6,296.7 -336.4,300.8 -340.6,305 -338.6,307 -332.6,301 	"/></g></svg></div>';

if ( readCookie("device_id") == null || readCookie("device_id") == 'undefined' ) { 
	tempid = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime();		
	createCookie("device_id", tempid, 365) ;
} else {
	tempid = readCookie("device_id");
}

device_id = readCookie("device_id");

var map = new L.Map('map', {center: new L.LatLng( 13.753,100.571 ), zoom: 14});

/* อุบล
var curlng = 104.8601933 ;
var curlat = 15.243196;
*/
/* อนุเสาวรีย์ชัย๐*/
var curlng = 100.538273 ;
var curlat = 13.765787;

var tmppsgstatus;
var hiddenloc;

var flag = true ;  // to check dialog

var deviceH = $(window).height();


//var socket = io.connect('http://localhost:1115');
var socket = io.connect(document.location.hostname+'');

// alert('before');

// setTimeout(function(){

// },3000);


 socket.on( 'connect', function() {
	var Semitdata = {  _id: "abc" } ;
	socket.emit("PsgLiveSocket", Semitdata);      
 });

$(function() {  

// // this is our sample object with 3 properties
// var sampleObject = socket.io;

// var alertText = ' ';
// /*Put the name of your own object after "in",
//   and you can change the text "property"
//   to be whatever you please.
// */

// for (property in sampleObject) {

//  /*this will create one string with all the Javascript 
//   properties and values to avoid multiple alert boxes: */

//   alertText += property + ':' + sampleObject[property]+'; ';

// }

// alert(alertText);
	
	//

	//alert(socket.io);

	// socket.on('driverAcceptCall', function (data) {          
	// 	if (data.device_id==device_id) {
	// 		console.log( ' driverAcceptCall ' + data.device_id )
	// 		checkstatuspsg();	
	// 	}
		
	// });


	// socket.on('driverCancelCall', function (data) {          
	// 	if (data.device_id==device_id) {
	// 		console.log( ' driverCancelCall ')
	// 		checkstatuspsg();	
	// 	}		
	// });

	// socket.on('driverPickPassenger', function (data) {          
	// 	if (data.device_id==device_id) {
	// 		console.log( ' driverPickPassenger ')
	// 		checkstatuspsg();	
	// 	}		
	// });

	// socket.on('driverEndTrip', function (data) {          
	// 	if (data.device_id==device_id) {
	// 		console.log( ' driverEndTrip ')
	// 		checkstatuspsg();	
	// 	}		
	// });


	socket.on('PassengerSocketOn', function (data) {          
		if (data.device_id==device_id) {
			console.log( ' PassengerSocketOn ' + data )
			checkstatuspsg();	
		}		
	});


	socket.on('DriverSocketOn', function (data) {          
		//if (data.device_id==device_id) {
			console.log( ' DriverSocketOn ' + data )
		//	checkstatuspsg();	
		//}		
	});	

	// socket.on('passengerAcceptDrv', function (data){
	// 	console.log( ' passengerAcceptDrv = '+data);
	// });

});

$(document).ready(function() {



	L.tileLayer('http://mt0.google.com/vt/lyrs=m&z={z}&x={x}&y={y}&hl=th', {
		attribution: ''
	}).addTo(map);

	//map.setView([13.753,100.571], 10);
	if(map.control && map.control.menu){
		map.control.menu.disable();
	}

	if(map.control && map.control.rightclick){
		map.control.rightclick.disable();
	}


setTimeout(function(){
	map.on('zoomend', function(e){	
		// hiddenloc = map.getCenter();
		// OnEndcurlat = hiddenloc.lat; 
		// OnEndcurlng = hiddenloc.lng; 
		// if(!map.hasLayer(DrvLocMarker)) { 
		// 	getDrvarround( OnEndcurlng, OnEndcurlat);
		// }
		$('.taxibeampsng-map-gps-center-tooltip').fadeOut();
		console.log('zoom changed')
	})
, 3000});


	map.on('dragstart', function(e){	
		$('.taxibeampsng-map-gps-center-tooltip').fadeOut();
		$('.taxibeampsng-map-gps-center').fadeOut();
	})

	map.on('dragend', function(e){
		if(cur_status=="OFF" || cur_status==undefined){	
			//$('.taxibeampsng-map-gps-center-tooltip').fadeIn();
		} 		
		// hiddenloc = map.getCenter();
		// OnEndcurlat = hiddenloc.lat; 
		// OnEndcurlng = hiddenloc.lng; 
		// if(!map.hasLayer(DrvLocMarker)) { 
		// 	getDrvarround( OnEndcurlng, OnEndcurlat);
		// }

	})	

	
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {		      	
		    curlng =  position.coords.longitude ;
		    curlat =  position.coords.latitude ;	
			PsgOldLat = curlat;
			PsgOldLng = curlng;

		      	JsonData = { "type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude], "lat": position.coords.latitude, "lng": position.coords.longitude, "time stamp" : [new Date(position.timestamp)], "tempid" : tempid }		      	

		      	addPoiJson(JsonData);		      	
			
			if(cur_status=="OFF" || cur_status==undefined){	
				$('.taxibeampsng-map-gps-center-tooltip').fadeIn();
			} 
		}, function() {
			console.log("Can not get your location !!");
		});
	} else {
		alert(' Please share your location');
	}
	
	showWelcomeMsg();

	if ( readCookie("firsttimehowto") >= 1 ) {		
		$('.taxibeampsng-howtouse').hide();
	}  else {	
		createCookie("firsttimehowto", "1", 365) ;
		$('.taxibeampsng-howtouse').addClass('active');		
	}
	
	if ( readCookie("psgphone_number") != null ) {
		$('#psgphone').val(readCookie("psgphone_number"));		
	}

	checkstatuspsg();

	checkCenterFirst();

	setInterval(function() {
		checkstatuspsg();  		
	}, 6000);

	setInterval(function() {	
		//console.log(' getMobileOperatingSystem = '+getMobileOperatingSystem());
		if(getMobileOperatingSystem()!='unknown') {			
			checkCenter();
		}
	}, 10000);	
			
	$('.hb-icon-currentlocation').removeClass('hb-icon-currentlocation');
	
	//$('.hb-icon').addClass('icon-ico_nearme');

	$('.hb-locator_search-poi-container').hide();

	var wrapperW = $('.taxibeampsng-wrapper').width();
	$('.taxibeampsng-status-taxidetail.showtaxidetail').height(deviceH-62);
	$('.taxibeampsng-status-taxidetail.showtaxidetail').width(wrapperW-10);

	$('.bg').height(deviceH);

	$(window).resize(function() {
		var deviceHRD = $(window).height();
		var deviceWRD = $(window).width();
		$('.taxibeampsng-status-taxidetail.showtaxidetail').height(deviceHRD-62);	
		$('.taxibeampsng-status-taxidetail.showtaxidetail').width(wrapperW-10);	
	});


	$("#car").change(function() {
		if (this.checked) {						
			getDrvarround( curlng, curlat);
		} else {			
			if ($('#minivan').is(":checked")) {								
				getDrvarround( curlng, curlat);
			} else {
				$('#minivan').click();
				$('label[for=minivan]').children().children('i').addClass('icon-btn_minivan_check');
				$('label[for=minivan]').children().children('i').removeClass('icon-btn_minivan_uncheck');
				$('.taxibeampsng-checkbox-minivan').children().addClass('active');				
				getDrvarround( curlng, curlat);
			}
		}
	});


	$("#minivan").change(function() {
		if(this.checked) {			
			getDrvarround( curlng, curlat);		
		} else {
			if ($('#car').is(":checked")) {								
				getDrvarround( curlng, curlat);
			} else {								
				$('#car').click();
				$('label[for=car]').children().children('i').addClass('icon-btn_sedan_check');
				$('label[for=car]').children().children('i').removeClass('icon-btn_sedan_uncheck');
				$('.taxibeampsng-checkbox-car').children().addClass('active');				
				getDrvarround( curlng, curlat);
			}
		}
	});


	if ($(window).width() > 1024) {
		$('.taxibeampsng-wrapper').height(deviceH);		
		$(window).resize(function() {
			var deviceHRD = $(window).height();
			$('.taxibeampsng-wrapper').height(deviceHRD);			
		});
	}


	$('.taxibeampsng-map-gps-center-tooltip').click(function(){
		hiddenloc = map.getCenter();
		PsgLat = hiddenloc.lat; 
		PsgLng = hiddenloc.lng; 

		$.ajax({ 
			type: "POST", 
			contentType: "application/json; charset=utf-8", 
			url: "https://locator.ecartmap.com/locator/address", 
			dataType: "json",        
			data: "{\"latitude\": "+PsgLat+" , "+"\"longitude\": "+PsgLng+" , \"languagecode\": \"TH\" }",
			success: function (data) { 			
				//if (data.Address) {
				//	$('#psgfrom').val(data.Address)	
				//} else {
				//	$('#psgfrom').val('ไม่สามารถระบุชื่อสถานที่ได้')
				//}   
				$('.taxibeampsng-map-gps-center-tooltip').fadeOut();
				$('.taxibeampsng-calltaxi-btn').click();    	
			} 
		});
	});

	$('.taxibeampsng-navmap').click(function() {		
		//checkCenterFirst();
		checkCenter();
		//alert(curlat +','+curlng)
		map.setView( [curlat, curlng ]) ;		
	});

	$('.icon-icn_pin').click(function() {		
		//checkCenter();
	});

	$('#psgfrom').click(function() {		
		//checkCenter();
	});	

	$('#but_showDrvLoc').click(function(){
		//console.log('  see taxi location ')
		if (DrvLat && DrvLng) {
			map.setView([ DrvLat , DrvLng ]);
		}
	});

	$('#psgphone').focus(function(){
		//$(this).val('');
	})

	$('#tips').focus(function(){
		$(this).val('');
	})	
	
	$('#but_gatMeaTaxi').click(function(){
		//$('#but_gatMeaTaxi').css({ opacity: 0.5 });		
		$(this).toggleClass('button_go_red');
		gatMeaTaxi();
	});


	function GetDrvPsgDistance(Pickuplat, Pickuplng, DrvLat, DrvLng) {
		$('.taxibeampsng-status-content.taxidetail.taxidistance').html('');	
		$('.taxibeampsng-busy-distance').text('');
		var send_data = "\"type\": \"here\", \"route\": [ \""+Pickuplat+","+Pickuplng+"\", \""+DrvLat+","+DrvLng+"\" ], \"mode\": \"driving\", \"language\": \"th\", \"options\": { \"steps\": true, \"encoded\": false, \"traffic\": true, \"bounds\": true, \"alternatives\": true, \"action\": true, \"instruction\": true }";
		console.log(send_data)
		$.ajax({
			type: "GET",
			dataType: 'jsonp',
			jsonpCallback: 'jsonCallback',
			async: false, //blocks window close
			contentType: "application/json; charset=utf-8", 				     
			url : "https://nhmap-proxy.ecartmap.com/?pxtype=direction&v=2&json={%22type%22:%22here%22,%22route%22:[%22"+Pickuplat+",%20"+Pickuplng+"%22,%22"+DrvLat+",%20"+DrvLng+"%22],%22mode%22:%22driving%22,%22language%22:%22th%22,%22options%22:{%22steps%22:true,%22encoded%22:false,%22traffic%22:true,%22bounds%22:true,%22alternatives%22:true,%22action%22:true,%22instruction%22:true}}&callback=jsonCallback",
			success: function(res){
				console.log( ' distance = '+res.routes[0].summary.distance.text)
				//console.log(res.routes[0].summary.duration.text)
				//console.log(res.routes[0].summary.distance.text);
				//return res.routes[0].summary.distance.text;	
				//$('.taxibeampsng-status-content.taxidetail.taxidistance').html('<div class="taxibeampsng-statusgroup"><p>แท็กซี่อยู่ห่างจากคุณประมาณ '+res.routes[0].summary.distance.text+' ('+distance(curlat, curlng, DrvLat, DrvLng,"K")+') </p></div>');
				$('.taxibeampsng-status-content.taxidetail.taxidistance').html('<div class="taxibeampsng-statusgroup"><p>แท็กซี่อยู่ห่างจากคุณประมาณ '+res.routes[0].summary.distance.text+'</p></div>');	
				$('.taxibeampsng-busy-distance').text('แท็กซี่อยู่ห่างจากคุณประมาณ '+res.routes[0].summary.distance.text+'');
				//$('.taxibeampsng-status-content.taxidetail.taxidistance').html('<div class="taxibeampsng-statusgroup"><p>แท็กซี่อยู่ห่างจากคุณ '+distance(Pickuplat, Pickuplng, DrvLat, DrvLng,"K") +'</p></div>');
			}
		});	
	}


	$('.taxibeampsng-taxishortdetail.wrap .taxibeampsng-taxiplatestatus , .taxibeampsng-taxishortdetail.wrap .taxibeampsng-taxinamestatus , .taxibeampsng-taxishortdetail.wrap .taxibeampsng-arrowright , .taxibeampsng-taxishortdetail.wrap .taxibeampsng-status-cropimg').click(function(){
		// show Driver info		
		if (FocusTaxiID2){
			// กดเพื่อแสดงรายละเอียดแท็กซี่		
			$.ajax({
				type: "POST",
				async: false, //blocks window close
				contentType: "application/json; charset=utf-8", 				     
				url : "../service/drivercs/getByID",
				dataType: "json", 
				data: " { \"_id\": \""+FocusTaxiID+"\" } ", 			     
				success: function(data){
					$('.taxibeampsng-status-taxidetail').fadeIn();
					//$('.taxibeampsng-status-header').css("background-color", "#F9B80F");	
					$('.taxibeampsng-status-header').html(data.data.carplate);
					$('.taxibeampsng-status-cropimg').html('<img src="'+hosttemp+'/image/driver/'+data.data.imgface+'">');
					$('.taxibeampsng-taxidetail-taxino').html(data.data.carplate);
					$('.taxibeampsng-taxidetail-taxiname').html(data.data.fname);
					if (data.data.allowpsgcontact=='Y' && distance(curlat, curlng, DrvLat, DrvLng,"K")<DistoShowPhone ) {
						$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'visible');
						$('.taxibeampsng-taxidetail-taxitel').html('<a href="tel:'+data.data.phone+'"   onclick="Psgcalllog( \''+psg_id+'\', \''+tempid+'\', \''+data.data._id+'\', \''+data.data.phone+'\', \''+data.data.carplate+'\', \'info\' )"   >'+data.data.phone+'</a>');
					} else {
						$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'hidden');
						$('.taxibeampsng-taxidetail-taxitel').html('&nbsp;');				
					}					
					$('.taxibeampsng-taxidetail-taxitype').html(data.data.cartype);
					if (data.data.carreturn=="Y"){
						$('.taxibeampsng-taxicolor').attr('src','../assets/img/icon_sendcar.gif');
						$('.taxibeampsng-taxicolor').css('width', 80);
						$('.taxibeampsng-status-content.taxicolor p').html('<span style="color:#ff9600; font-size: 16px;">ส่งรถ</span><br><span style="color:#ff9600; font-size: 22px; font-weight:bold;">'+data.data.carreturnwhere+'</span>');
					} else {
						$('.taxibeampsng-taxicolor').attr('src','../assets/img/'+data.data.cartype+'_'+getCarcolorCode(data.data.carcolor)+'@2x.png');
						$('.taxibeampsng-status-content.taxicolor p').html(data.data.cartype);						
					}
										
					GetDrvPsgDistance(curlat, curlng, data.data.curlat, data.data.curlng) ;

					if(data.data.outbound == 'Y'){
						$('#TaxiInfo_outbound').addClass('active');
					} else {
						$('#TaxiInfo_outbound').removeClass('active');
					}
					if(data.data.carryon == 'Y'){
						$('#TaxiInfo_carryon').addClass('active');	
					} else {
						$('#TaxiInfo_carryon').removeClass('active');	
					}
					if(data.data.english == 'Y'){
						$('#TaxiInfo_english').addClass('active');
					} else {
						$('#TaxiInfo_english').removeClass('active');
					}
				} 
			});	
		}
	});

	$('.taxibeampsng-taxidetail-btnbox .taxibeampsng-submit-btn').click(function(){
		console.log ('add to favorite')
		$.ajax({
			type: "POST",
			async: false, //blocks window close
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/FavDrvAdd",
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\", \"favdrv\": \""+FocusTaxiID+"\"  } ", 
			success: function(data){				
				$('.taxibeampsng-status-taxidetail').fadeOut();
			} 
		});	
	});
	
	$('#closeTaxiInfo').click(function(){		
		$('.taxibeampsng-status-taxidetail').fadeOut();
	});

	$('.taxibeampsng-taxidetail-btnbox .taxibeampsng-cancel-btn').click(function(){
		$('.taxibeampsng-status-taxidetail').fadeOut();
	});	

	$('.taxibeampsng-howtouse .skip').click(function() {
		$('.taxibeampsng-howtouse').addClass('hide');
	});

	$('.taxibeampsng-status-news .taxibeampsng-submit-btn').click(function() {
		$('.taxibeampsng-status-news , .taxibeampsng-overlay-news').removeClass('active');
		 
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
			createCookie("status_view", "", 365) ;
			$('.taxibeampsng-status-gottaxi').addClass('active');
			defaultMapH = 69;
			checkstatuspsg();
		} else {
			defaultMapH = 260;
			$('.taxibeampsng-form-calltaxi').addClass('active');
			checkstatuspsg();
			
			$('#map').height(deviceH-defaultMapH);			
			setTimeout(function(){map.invalidateSize(), 10});
		}
	});

	$('.taxibeampsng-hide-form-calltaxi').click(function() {
		//$('.taxibeampsng-form-calltaxi').hide('slide', {direction: 'down'}, 1400)
		$('.taxibeampsng-form-calltaxi').removeClass('active');
		defaultMapH = 69;		
		$('#map').height(deviceH-defaultMapH);
		setTimeout(function(){map.invalidateSize(), 10});		
	});

	$('.taxibeampsng-form-calltaxi .taxibeampsng-submit-btn').click(function() {		
	});
	

	$('.taxibeampsng-status-waittaxi .taxibeampsng-cancel-btn').click(function() {
		console.log('cancel call a taxi')
		confirmStepwhat = 'cancelCall';
		if (confirm('คุณต้องการที่จะยกเลิกบริการ?')) {
			/* Goto work on alert event*/
		}
	});



	$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').click(function() {		
		if (cur_status=="WAIT") {
			$.ajax({
				type: "POST",
				async: false, //blocks window close
				contentType: "application/json; charset=utf-8", 				     
				url : "../service/passengertp/acceptDrv",				
				dataType: "json", 
				data: " { \"device_id\": \""+tempid+"\" , \"drv_id\":\""+drv_id+"\" } ", 			     
				success: function(data){
					//console.log(' Click after acceptDrv ')					
					FocusTaxiID2 = "";
					$('.taxibeampsng-status-taxidetail').fadeOut();
					$('.taxibeampsng-info-sec .wrap').hide();
					//defaultMapH = 69;
					checkstatuspsg();	
					ButAcceptTaxi = 1;
				} 
			});
		}

		if (cur_status=="BUSY" || cur_status=="PICK"){	
			console.log(' Click after Busy or Pick ')		
			if ( readCookie("status_view") == 'viewmap' ) {
				console.log(' read cookies viewmap  ')	
				if (DrvLat && DrvLng) {
					map.setView([ DrvLat , DrvLng ]);
				}
				createCookie("status_view", "viewmap", 365) ;
				$('.taxibeampsng-status-gottaxi').removeClass('active');
				checkstatuspsg();	
			} else {	
				console.log(' not read cookies ')	
				if (DrvLat && DrvLng) {
					map.setView([ DrvLat , DrvLng ]);
				}

				if (ButAcceptTaxi==1 ) {
					ButAcceptTaxi = 0
				} else {
					createCookie("status_view", "viewmap", 365) ;
					$('.taxibeampsng-status-gottaxi').removeClass('active');
				}

				checkstatuspsg();
			}		
		}

		if ( cur_status == 'DRVDENIED' ) {
			$.ajax({
				type: "POST",
				async: false, //blocks window close
				contentType: "application/json; charset=utf-8", 				     
				url : "../service/passengertp/Recall",				
				dataType: "json", 
				data: " { \"device_id\": \""+tempid+"\" } ", 			     
				success: function(data){
				    	$('.taxibeampsng-info-sec .wrap').removeClass('active');
				    	$('.taxibeampsng-map-gps-center').fadeOut()
				    	addPoiPickupLocation(data.data.curlat, data.data.curlng);
				       	checkstatuspsg();					
				} 
			});			
		}
	});


	$('.taxibeampsng-status-thankyou .taxibeampsng-submit-btn').click(function() {		
		$.ajax({
			type: "POST",
			async: false, //blocks window close
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/endTrip",				
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\" } ", 			     
			success: function(data){
				FocusTaxiID2 = "";
				//createCookie("status_view", "", 365) ;
				defaultMapH == 260;
				checkstatuspsg();
		        		if(map.hasLayer(putPsg)) {
		        			map.removeLayer(putPsg);		        			
		        		}
		        		if(map.hasLayer(putCircle)) {
		        			map.removeLayer(putCircle);
		        		}
			    	//$('.taxibeampsng-map-gps-center').fadeIn()
			    	$('.taxibeampsng-info-sec .wrap').hide();
				if(map.hasLayer(putPickupLocation)) {
					map.removeLayer(putPickupLocation);
				} 
				$('.taxibeampsng-calltaxi-btn').click();
				$('#psgto').val('');
				$('#tips').val('');
			} 
		});
	});	


	$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').click(function() {
		console.log('cancel call a got taxi')
		confirmStepwhat = 'cancelgottaxi';
		if (confirm('คุณต้องการที่จะยกเลิกบริการ?')) {
			/* Goto work on alert event*/
		}
	});	


	$('.taxibeampsng-status-busy .taxibeampsng-cancel-btn').click(function() {
		console.log('cancel busy')
		confirmStepwhat = 'cancelbusy';
		if (confirm('คุณต้องการที่จะยกเลิกบริการ?')) {
			/* Goto work on alert event*/
		}
	});	


	$('.taxibeampsng-status-gottaxi , .taxibeampsng-status-thankyou').height(deviceH-44);


	$(window).resize(function() {
		var deviceHR = $(window).height();
		$('.taxibeampsng-status-gottaxi , .taxibeampsng-status-thankyou').height(deviceHR-44);

		if($('.taxibeampsng-form-calltaxi').hasClass('active')) {
			defaultMapH = 260;			
			$('#map').height(deviceHR-defaultMapH);			
			setTimeout(function(){map.invalidateSize(), 10});
		} else {
			defaultMapH = 44;			
			$('#map').height(deviceHR-defaultMapH);
			setTimeout(function(){map.invalidateSize(), 10});
		}
	});

				
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


function showWelcomeMsg(){
	$.ajax({
		type: "POST",
		async: false, //blocks window close
	     	contentType: "application/json; charset=utf-8",
		url : "../service/ubeam/announcementGet",
		dataType: "json",
		data: " { \"anntype\": \"PSG\" } ",
	     	success: function(data){
	     		//console.log('expdatae  = '+data.data.expired)
	     		if(new Date(data.data.expired)>new Date().getTime()){
	     			$('.taxibeampsng-overlay-news').addClass('active');
	     			$('.taxibeampsng-status-news').addClass('active');
	     			$('.taxibeampsng-news-topic').html(data.data.topic);
				$('.taxibeampsng-news-content').html(data.data.detail);
	     		} else {
	     			$('.taxibeampsng-overlay-news').removeClass('active');
	     			$('.taxibeampsng-status-news').removeClass('active');
	     		}
			
	     	} 
	 });
}


function dialog(message, yesCallback, noCallback) {
	$('.title').html(message);
	var dialog = $('#modal_dialog').dialog();

	$('#btnYes').click(function() {
		dialog.dialog('close');
		yesCallback();
	});
	$('#btnNo').click(function() {
		dialog.dialog('close');
		noCallback();
	});
}


function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}



function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}



function eraseCookie(name) {
    createCookie(name, "", -1);
}



/**
 * Determine the mobile operating system.
 * This function either returns 'iOS', 'Android' or 'unknown'
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
var userAgent = navigator.userAgent || navigator.vendor || window.opera;
	if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) ) 
	{		
		return 'iphone';
	} 
	else if( userAgent.match( /Android/i ) )
	{	
		return 'android';
	}
	else
	{
		return 'unknown';
	}
}


function getfavcartype() {
	var favcartype = ["car","minivan"];
	if ($('#car').is(":checked")) {
		favcartype.push($('#car').val());
	}	
	if ($('#minivan').is(":checked")) {
		favcartype.push($('#minivan').val());
	}
	return favcartype;
	//console.log('favcartype ='+favcartype)	
}


	
function getDrvarround( curlng, curlat){
	// getDrvarroundLoc = map.getCenter();
	// getDrvarroundLat = getDrvarroundLoc.lat; 
	// getDrvarroundLng = getDrvarroundLoc.lng; 
	//console.log(  ' getDrvarroundLat = '+getDrvarroundLat)
	//console.log(  ' getDrvarroundLng = '+getDrvarroundLng)
	// console.log('curlat getdrvarround = '+curlat)
	// console.log('curlng getdrvarround = '+curlng)
	if ( curlat > 0) {
		$.ajax({
			type: "POST",
			async: false, //blocks window close
		     	contentType: "application/json; charset=utf-8", 				
			url : "../service/passengertp/searchDrv",
			dataType: "json", 
			data: " { \"favcartype\": "+JSON.stringify(getfavcartype())+", \"curlng\": "+curlng+", \"curlat\": "+curlat+", \"radian\":"+psgsearchpsgradian+", \"amount\":"+psgsearchpsgamount+" } ", 
			//data: " { \"curlng\": "+curlng+", \"curlat\": "+curlat+", \"radian\":1000000, \"amount\":100 } ", 
		     	success: function(data){

		     		if(DrvarroundID){
		     			//console.log('DrvarroundID = '+DrvarroundID)
					for (IDvariable in DrvarroundID) {
						//console.log(DrvarroundID[IDvariable])
				        		if(map.hasLayer(TaxiCurLayer[ DrvarroundID[IDvariable] ])) {
				        			map.removeLayer(TaxiCurLayer[ DrvarroundID[IDvariable] ]);		        			
				        		}
					}
					DrvarroundID = [];
		     		}	    
		        		GroupTaxi.addPoiTaxi(data);
		     	} 
		 });		
	}
}


var GroupTaxi = {
	active: {},
	 addPoiTaxi: function(JsonData) {
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

			DrvarroundID.push(item._id);
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
	    		/*
	        		if(map.hasLayer(TaxiCurLayer[tempmk])) {
	        			map.removeLayer(TaxiCurLayer[tempmk]);		        			
	        		}
	        		*/
			myIcon1 = L.icon({			 	
				iconUrl: '../assets/img/map/tx_'+item.status+'@2x.png',
				iconRetinaUrl: '../assets/img/map/tx_'+item.status+'@2x.png',
				iconSize: [42, 47],				
				iconAnchor: [20, 20] ,
				labelAnchor:[-50,-42] 								
			});

			myIcon2 = L.icon({
			 	iconUrl: '../assets/img/map/tx_WAIT@2x.png',
			 	iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
				iconSize: [42, 47],				
				iconAnchor: [20, 20] ,
				labelAnchor:[-50,-42] 								
			});

			if(item.curlat!=''&&item.curlng!=''){

		 		//TaxiCurLayer[tempmk]  = new L.marker([item.curlat,item.curlng], { icon: myIcon, style: myStyle}).bindPopup( '<a class="bg-black" href="tel:'+item.phone+'"><p class="carno">'+item.carplate+'</p><p>'+item.fname+' '+item.lname+'</p>'+'<a href="tel:'+item.phone+'"><i class="icon-icn_phone"></i>'+item.phone+'</a></a>'  ) ;
		 		
		 		myIcon = myIcon1;
		 		if( FocusTaxiID2 == item._id ) {
		 			myIcon = myIcon2;
		 		}

				TaxiCurLayer[tempmk]  = new L.marker([item.curlat,item.curlng], { icon: myIcon, style: myStyle}) ;
				TaxiCurLayer[tempmk].options.itemData = item;

				TaxiCurLayer[tempmk].on('click', function(e) {					
					DrvLat = this.options.itemData.curlat;
		 			DrvLng = this.options.itemData.curlng;
					$('.taxibeampsng-hide-form-calltaxi').click(); //  click to hide call taxi box

					$('.se-pre-click').fadeIn();
					FocusTaxiID = this.options.itemData._id;

					if($('.taxibeampsng-info-sec .wrap').attr('data-ref') !== FocusTaxiID2) {

			 			var icon = L.icon({
			 				iconUrl: '../assets/img/map/tx_WAIT@2x.png',
			 				iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
			 				iconSize: [42, 47],
			 				iconAnchor: [20, 20] ,
			 				labelAnchor:[-50,-42]
			 			});

						this.setIcon(icon);

						$('.taxibeampsng-info-sec .wrap').show();
						if(this.options.itemData.carreturn=='Y') {
							$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate+icon_sendcar);
						} else {
							$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate );
						}
						$('.taxibeampsng-taxinamestatus').html('ชื่อ '+this.options.itemData.fname);
						//$('.taxibeampsng-info.calltaxi').attr('href', "tel:"+this.options.itemData.phone);
						if (this.options.itemData.allowpsgcontact=='Y' && distance(curlat, curlng, DrvLat, DrvLng,"K")<DistoShowPhone ) {
							$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'visible');
							$('.taxibeampsng-status-taxitel').html('<a href="tel:'+this.options.itemData.phone+'"  onclick="Psgcalllog( \''+psg_id+'\', \''+tempid+'\', \''+this.options.itemData._id+'\', \''+this.options.itemData.phone+'\', \''+this.options.itemData.carplate+'\', \'tab\' )"   ><i class="icon-icn_phone"></i> '+this.options.itemData.phone+'</a>');
						} else {
							$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'hidden');
							$('.taxibeampsng-status-taxitel').html('&nbsp;');
						}							
						$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ this.options.itemData.imgface );
						$('.taxibeampsng-info-sec .wrap').attr('data-ref', FocusTaxiID);
						defaultMapH = 164;
						$('#map').height(deviceH - defaultMapH);
						FocusTaxiID2 = FocusTaxiID;
						//console.log('aaa - '+FocusTaxiID)
						//console.log('bbb - '+FocusTaxiID2)						
						getDrvarround( curlng, curlat);

					} else {
						
						if (FocusTaxiID!=FocusTaxiID2) {
								//console.log('ccc 111 - '+FocusTaxiID)
								//console.log('ddd 222 - '+FocusTaxiID2)								
							var display = $('.taxibeampsng-info-sec .wrap').css('display');
							if(display == 'block') {															
					 			var icon = L.icon({
					 				iconUrl: '../assets/img/map/tx_WAIT@2x.png',
					 				iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
					 				iconSize: [42, 47],
					 				iconAnchor: [20, 20] ,
					 				labelAnchor:[-50,-42]
					 			});

								this.setIcon(icon);
								//console.log(this.options.itemData)
								$('.taxibeampsng-info-sec .wrap').show();
								//$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate);
								if(this.options.itemData.carreturn=='Y') {
									$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate+icon_sendcar);
								} else {
									$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate);
								}								
								$('.taxibeampsng-taxinamestatus').html('ชื่อ '+this.options.itemData.fname);
								//$('.taxibeampsng-info.calltaxi').attr('href', "tel:"+this.options.itemData.phone);
								if (this.options.itemData.allowpsgcontact=='Y' && distance(curlat, curlng, DrvLat, DrvLng,"K")<DistoShowPhone ) {
									$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'visible');
									$('.taxibeampsng-status-taxitel').html('<a href="tel:'+this.options.itemData.phone+'"   onclick="Psgcalllog( \''+psg_id+'\', \''+tempid+'\', \''+this.options.itemData._id+'\', \''+this.options.itemData.phone+'\', \''+this.options.itemData.carplate+'\', \'tab\' )"  ><i class="icon-icn_phone"></i> '+this.options.itemData.phone+'</a>');
								} else {
									$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'hidden');
									$('.taxibeampsng-status-taxitel').html('&nbsp;');
								}																
								$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ this.options.itemData.imgface );
								$('.taxibeampsng-info-sec .wrap').attr('data-ref', FocusTaxiID);

								//createCookie("status_view", "", 365) ;						
								defaultMapH = 164;
								$('#map').height(deviceH - defaultMapH);
								$('.taxibeampsng-form-calltaxi').removeClass('active');
								$('.taxibeampsng-status-waittaxi').removeClass('active');
								$('.taxibeampsng-status-gottaxi').removeClass('active');
								$('.taxibeampsng-status-busy').removeClass('active');
								$('.taxibeampsng-status-thankyou').removeClass('active');


								$('.taxibeampsng-info-sec .wrap').attr('data-ref', FocusTaxiID);
								
								//console.log('ccc - '+FocusTaxiID)
								//console.log('ddd - '+FocusTaxiID2)								
								FocusTaxiID2 = FocusTaxiID;
								getDrvarround( curlng, curlat);
							} else {
								$('.taxibeampsng-info-sec .wrap').show();
					 			var icon = L.icon({
					 				iconUrl: '../assets/img/map/tx_WAIT@2x.png',
					 				iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
					 				iconSize: [42, 47],
					 				iconAnchor: [20, 20] ,
					 				labelAnchor:[-50,-42]
					 			});
								this.setIcon(icon);
								FocusTaxiID2 = "";
								//console.log('eee - '+FocusTaxiID)
								//console.log('fff - '+FocusTaxiID2)																
								getDrvarround( curlng, curlat);
							}
						} else {

							var display = $('.taxibeampsng-info-sec .wrap').css('display');
							if(display == 'block') {	

								$('.taxibeampsng-info-sec .wrap').hide();
								$('.taxibeampsng-hide-form-calltaxi').click();
								//$('.taxibeampsng-info').html('กด <img src="../img/map/tx_ON.png" srcset="../img/map/tx_ON@2x.png 2x"> เพื่อโทรหาคนขับ <div class="taxibeampsng-submit-btn taxibeampsng-calltaxi-btn btn_show"><img src="../assets/img/collapseupx.png"  srcset="../assets/img/collapseup@2x.png 2x"></div>');				


					 			var icon = L.icon({
					 				iconUrl: '../assets/img/map/tx_ON@2x.png',
					 				iconRetinaUrl: '../assets/img/map/tx_ON@2x.png',
					 				iconSize: [42, 47],
					 				iconAnchor: [20, 20] ,
					 				labelAnchor:[-50,-42]
					 			});
								this.setIcon(icon);
								//FocusTaxiID = "";
								FocusTaxiID2 = "";								
								getDrvarround( curlng, curlat);
							} else {
								$('.taxibeampsng-info-sec .wrap').show();
					 			var icon = L.icon({
					 				iconUrl: '../assets/img/map/tx_WAIT@2x.png',
					 				iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
					 				iconSize: [42, 47],
					 				iconAnchor: [20, 20] ,
					 				labelAnchor:[-50,-42]
					 			});
								this.setIcon(icon);								
								getDrvarround( curlng, curlat);
							}
						}
					}
				});
				
				map.addLayer( TaxiCurLayer[tempmk]);

				setTimeout(function(){ $('.se-pre-click').fadeOut() , 800})
				
			}
		});

	}
}

var tempdata = {};

function checkCenter(callback){
	//console.log('checkcenter')
	if(navigator.geolocation) {
		//console.log('checkcenter2')
		//console.log(' currentposition  = '+navigator.geolocation.getCurrentPosition)
		navigator.geolocation.getCurrentPosition(function(position) {
	      		console.log('checkcenter3')
	      		console.log('lat =>'+position.coords.latitude+' || lon =>'+position.coords.longitude);
	      		curlng =  position.coords.longitude ;
	      		curlat =  position.coords.latitude ;		
	      		JsonData = { "type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude], "lat": position.coords.latitude, "lng": position.coords.longitude, "time stamp" : [new Date(position.timestamp)], "tempid" : tempid }
	      		addPoiJson(JsonData);	      		
			PsgOldLat = curlat;
			PsgOldLng = curlng;
	    		}, function() {
	      			console.log("Can not get your location, please allow browser to get your location.");
	      			//alert('กรุณาเปิดบริการแจ้งตำแหน่งบนอุปกรณ์ของคุณ');
    		});
	} else {
		//alert('กรุณาเปิดบริการแจ้งตำแหน่งบนอุปกรณ์ของคุณ');
	}
}


function checkCenterFirst(callback){	
	if(navigator.geolocation) {		
		navigator.geolocation.getCurrentPosition(function(position) {
	      		curlng =  position.coords.longitude ;
	      		curlat =  position.coords.latitude ;			
	      		JsonData = { "type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude], "lat": position.coords.latitude, "lng": position.coords.longitude, "time stamp" : [new Date(position.timestamp)], "tempid" : tempid }
	      		addPoiJsonFirst(JsonData);
	    		}, function() {
	      			console.log("Can not get your location, please allow browser to get your location.");	      			
    		});
	} else {		
	}
}



function checkPsgRequest() {
	var str = $('#psgphone').val();
	if ($('#psgto').val()=='') {
		alert('กรุณากรอกข้อมูลปลายทาง')
		return false;
	} else if  ( $('#psgphone').val().length == 0 ) {
		alert('กรุณากรอกเบอร์โทรศัพท์');
		return false;
	} else if  (  str.substring(0,1)!= '0' ) {
		alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
		return false;
	} else if  ( $('#psgphone').val().length <= 8 ) {
		alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
		return false;
	} else {
		return true;
	}
}



function gatMeaTaxi () {

	psgphone_number = $('#psgphone').val();				
	createCookie("psgphone_number", psgphone_number, 365) ;
	var favcartype = [ "car","minivan" ];

	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {		      	
		      	curlng =  position.coords.longitude ;
		      	curlat =  position.coords.latitude ;	
			PsgLat = curlat;
			PsgLng = curlng;
			map.setView([ PsgLat, PsgLng ]);

			hiddenloc = map.getCenter();
			var layerPoint = map.latLngToLayerPoint(L.latLng(hiddenloc));
			var BBString = map.getBounds().toBBoxString();
			var getSizeX = map.getSize().x;
			var getSizeY = map.getSize().y;
			var getPointX = map.layerPointToContainerPoint(layerPoint).x;
			var getPointY = map.layerPointToContainerPoint(layerPoint).y;
			$.ajax({ 
				type: "GET", 
				contentType: "application/json; charset=utf-8", 
				url: "https://nhmap-proxy.ecartmap.com/?pxtype=info&id=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9&width="+getSizeX+"&height="+getSizeY+"&x="+getPointX+"&y="+getPointY+"&bbox="+BBString+"&lang=TH&floor=1", 
				jsonCallback: 'jsonCallbackInfo',
				dataType: "jsonp", 				
				success: function (data) { 
					//tempdata = data;					
					hiddenaddress = data.info.house.name === undefined ? ' ' : data.info.house.name + ' ';
					hiddenaddress += data.info.house.number === undefined ? ' ' : data.info.house.number + ' ';
					hiddenaddress += data.info.road === undefined ? ' ' : data.info.road + ' ';
					hiddenaddress += data.info.address.subDistrict === undefined ? ' ' : data.info.address.subDistrict + ' ';
					hiddenaddress += data.info.address.district === undefined ? ' ' : data.info.address.district + ' ';
					hiddenaddress += data.info.address.province === undefined ? ' ' : data.info.address.province + ' ';
					hiddenaddress += data.info.address.postalCode === undefined ? ' ' : data.info.address.postalCode + ' ';

					temp_curaddr_add = hiddenaddress;
				} 
			});


		}, function() {
			console.log("Can not get your location !!");
		});
	}	

	if ($('#car').is(":checked")) {
		favcartype.push($('#car').val());
	}	
	if ($('#minivan').is(":checked")) {
		favcartype.push($('#minivan').val());
	}	
	//if ( $('#psgfrom').val()==''  || $('#psgto').val()=='' || $('#psgphone').val().length <= 8 ){		
	if ( $('#psgto').val()=='' || $('#psgphone').val().length <= 8 ){				
		checkPsgRequest();
	} else {
		// if ( favcartype==''  ){
		// 	alert('กรุณาเลือกประเภทรถ')
		// 	return false;
		// } else {
			if ($('#psgfrom').val() =='') {
				curaddr_add = temp_curaddr_add;
			} else {
				curaddr_add = $('#psgfrom').val();
			} 
		 

			if (typeof PsgLng == 'undefined') {
				PsgLng =  curlng;
				PsgLat =  curlat;
			}

			PsgstartLat = PsgLat;
			PsgstartLng = PsgLng;			
			psg_phone = $('#psgphone').val() ;

			job_id = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime() ;
			var data = {				
				psg_id: psg_id ,
				device_id: tempid ,
				favcartype: favcartype ,
				curaddr: curaddr_add ,
				destination: $('#psgto').val() ,
				phone: $('#psgphone').val() ,			
				curlng: parseFloat(PsgLng) ,
				curlat: parseFloat(PsgLat) ,
				tips: $('#tips').val(),
				detail: '',
				createdvia: "WEBAPP"
			};

			$.ajax({
				url : "../service/passengertp/callDrv",
				type: "POST",
				async: false, //blocks window close
				data : data,
				success: function(data){
					$('.taxibeampsng-info-sec .wrap').removeClass('active');
					$('.taxibeampsng-map-gps-center').fadeOut()
					addPoiPickupLocation(PsgLng, PsgLat);
				   	checkstatuspsg();
				}
			});
		//}
	}
}




function checkstatuspsg() { 			
	if (curlng > 0) {
		$.ajax({
			type: "POST",
			async: false, //blocks window close
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/getStatus",
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
			success: function(data){		        		
			        	if(data.status) {
			        		var getstatus = data.data.status;

			        		psg_id = data.data._id;
			        		Pickuplat = data.data.curlat; 
			        		Pickuplng = data.data.curlng;
			        		
			        		cur_status= getstatus;
			        		if (data.data.drv_id){
			        			drv_id = data.data.drv_id;
			        			getDrvLoc(data.data.drv_id);	
			        		} 			
			        		$('.show-dialog-btn btn btn-warning	 span').html(getstatus)
			        		
					switch(getstatus) {
						case "OFF":	
							//checkCenter();
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		}
					    		createCookie("status_view", "", 365) ;
							getDrvarround( curlng, curlat);						
							$('#map').height(deviceH-defaultMapH);
							setTimeout(function(){map.invalidateSize(), 10});
							//$('#map').addClass('active');
						//	alert("off");
							// $('.taxibeampsng-calltaxi-btn').text('เรียกแท็กซี่');
		
							if (defaultMapH == 260) {
								$('.taxibeampsng-form-calltaxi').addClass('active');
							} else {
								$('.taxibeampsng-form-calltaxi').removeClass('active');
							}			

							$('.taxibeampsng-status-waittaxi').removeClass('active');
							$('.taxibeampsng-status-gottaxi').removeClass('active');
							$('.taxibeampsng-status-busy').removeClass('active');
							$('.taxibeampsng-status-thankyou').removeClass('active');
						//	console.log(data.data.status);
						//	console.log(data.data.drv_id);
						break;
						
						case "INITIATE":
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		} 
					    		//localStorage.setItem('status_view', '' );
					    		createCookie("status_view", "", 365) ;											
							getDrvarround( curlng, curlat);
							$('.taxibeampsng-status-waittaxi').addClass('active');
						break;						

						case "ON":
							$('.taxibeampsng-map-gps-center').fadeOut()							
							addPoiPickupLocation( data.data.curlng, data.data.curlat );
							//localStorage.setItem('status_view', '' );
							createCookie("status_view", "", 365) ;
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		}
					    		getDrvarround( curlng, curlat);					    		
							$('.taxibeampsng-status-waittaxi').addClass('active');
							$('.taxibeampsng-status-gottaxi').removeClass('active');
							$('.taxibeampsng-status-busy').removeClass('active');
							$('.taxibeampsng-form-calltaxi').removeClass('active');
							$('.taxibeampsng-status-thankyou').removeClass('active');

							

						break;

						case "DRVDENIED":
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		} 
					    		//localStorage.setItem('status_view', '' );
					    		createCookie("status_view", "", 365) ;								
							getDrvarround( curlng, curlat);
							//$('.taxibeampsng-status-waittaxi').addClass('active');
							$('.taxibeampsng-status-gottaxi').addClass('active');	
							$('.taxibeampsng-status-header').html('<p>ขออภัยค่ะ</p><span>ขณะนี้แท็กซี่ไม่สามารถมารับท่านได้</span>');
							$('.taxibeampsng-busy-distance').text('');
							//$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
							//$('.taxibeampsng-gottaxi-taxino').text( result.data.carplate);
							//$('.taxibeampsng-gottaxi-taxiname').text(result.data.fname + ' ' + result.data.lname);
							//$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
							$('.taxibeampsng-gottaxi-noted').html('ท่านต้องการเรียกแท็กซี่ใหม่หรือไม่');
							$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').html(' ยกเลิก ');
							$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').html(' เรียกใหม่ ');							
						break;

						case "MANUAL":
						break;	

						case "WAIT":
							//localStorage.setItem('status_view', '' );
							createCookie("status_view", "", 365) ;
							$('.taxibeampsng-status-waittaxi').removeClass('active');
							$.ajax({
								type: "POST",
								async: false, //blocks window close
								contentType: "application/json; charset=utf-8", 				     
								url : "../service/drivercs/getByID",
								dataType: "json", 
								data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
								success: function(result){
									$('.taxibeampsng-status-gottaxi').addClass('active');	
									$('.taxibeampsng-status-header').html('<p>แท็กซี่ตอบรับแล้ว</p><span>มีรายละเอียดดังนี้</span>');
									$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
									$('.taxibeampsng-gottaxi-taxino').text( result.data.carplate);
									$('.taxibeampsng-gottaxi-taxiname').text(result.data.fname + ' ' + result.data.lname);
									if(result.data.allowpsgcontact=='Y' && distance(curlat, curlng, DrvLat, DrvLng,"K")<DistoShowPhone ){
										$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'visible');
										$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
									} else {  
										$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'hidden');
										$('.taxibeampsng-gottaxi-taxitel span').html('&nbsp;');
									}									
									$('.taxibeampsng-gottaxi-noted').html('กรุณาเลือกตกลงหรือปฏิเสธบริการนี้');
									$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').html(' ปฏิเสธ ');
									$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').html(' ตกลง ');
								} 
							});
						break;	

						case "BUSY":	
						case "PICK":
							//$('.taxibeampsng-calltaxi-btn').click();	// กดปุ่มลูกศรขึ้น
							$('.taxibeampsng-hide-form-calltaxi').click(); // กดปุ่มลูกศรลง
							//$('.taxibeampsng-status-gottaxi').removeClass('active');
							$('.taxibeampsng-map-gps-center').fadeOut()
							addPoiPickupLocation(data.data.curlng, data.data.curlat);
							$('.menu-box.taxibeampsng-form-calltaxi').removeClass('active');
							//$('.taxibeampsng-info-sec .wrap').removeClass('active');
							
							DrvPsgDistance = distance(Pickuplat, Pickuplng, DrvLat, DrvLng, "K") ;
							if ( DrvPsgDistance > 0 ) {
								//DrvPsgDistance = Math.round(DrvPsgDistance);
								DrvPsgDistance = DrvPsgDistance.toFixed(2);
							}

							$.ajax({
								type: "POST",
								async: false, //blocks window close
								contentType: "application/json; charset=utf-8", 				     
								url : "../service/drivercs/getByID",
								dataType: "json", 
								data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
								success: function(result){
									console.log(' readcookies = '+readCookie("status_view"));
									if ( readCookie("status_view")== 'viewmap' ) {										
										$('#map').height(deviceH-defaultMapH);
										setTimeout(function(){map.invalidateSize(), 10});
										//$('.taxibeampsng-calltaxi-btn').text('ดูรายละเอียดรถแท็กซี่');
										$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
										$('.taxibeampsng-gottaxi-taxino').text( result.data.carplate);
										$('.taxibeampsng-gottaxi-taxiname').text(result.data.fname + ' ' + result.data.lname);
										if (result.data.allowpsgcontact=='Y' && distance(curlat, curlng, DrvLat, DrvLng,"K")<DistoShowPhone ) {
											$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'visible');
											$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
										} else {
											$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'hidden');
											$('.taxibeampsng-gottaxi-taxitel span').html('&nbsp;');
										}										
									} else {					
										//console.log('oooooooooooooooooooooo')					
										$('#map').height(deviceH-defaultMapH);
										setTimeout(function(){map.invalidateSize(), 10});
										$('.menu-box.taxibeampsng-form-calltaxi').removeClass('active');									
										$('.taxibeampsng-status-gottaxi').addClass('active');											
										$('.taxibeampsng-status-header').html('<p>แท็กซี่กำลังมารับคุณ</p><span>มีรายละเอียดดังนี้</span>');
										$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
										$('.taxibeampsng-gottaxi-taxino').text( result.data.carplate);
										$('.taxibeampsng-gottaxi-taxiname').text(result.data.fname + ' ' + result.data.lname);
										if (result.data.allowpsgcontact=='Y' && distance(curlat, curlng, DrvLat, DrvLng,"K")<DistoShowPhone ){
											$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'visible');
											$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');	
										} else {
											$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'hidden');
											$('.taxibeampsng-gottaxi-taxitel span').html('&nbsp;');	
										}										
										// if (DrvPsgDistance > 0) {
										// $('.taxibeampsng-busy-distance').text('ระยะห่าง '+ DrvPsgDistance +' กิโลเมตร');
										// }

										$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').html(' ยกเลิกบริการ ');
										$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').html(' ดูตำแหน่งแท็กซี่ ');
									}
								} 
							});
						break;
						
						case "THANKS":							
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		} 
					    		$('.taxibeampsng-info-sec .wrap').removeClass('active');
							$('.taxibeampsng-status-thankyou').addClass('active');									
						break;					

						default:
							
					}// switch				        	
			     	}  else {			     		
			     		var mapFirstH = deviceH - defaultMapH;
			     		$('#map').height(deviceH-defaultMapH);
			     		setTimeout(function(){map.invalidateSize(), 10});			     		
			     		getDrvarround( curlng, curlat);
			     	}
			},
		            error: function (textStatus, errorThrown) {
		                	Success = false;//doesnt goes here
		                	console.log('not success')
		                	cur_status = "FALSE";
		            }
		});					
	}  else {
		// undefined curlat
		//alert('กรุณาเปิดบริการแจ้งตำแหน่งบนอุปกรณ์ของคุณ')
	}
}


	
	
function checkGPS(callback){
	//alert('checkGPS');
}



function addPoiPickupLocation(curlng, curlat) {	
	//console.log(' add poi pickup location ')
	var myIcon = L.icon({			 	
	 	iconUrl: '../assets/img/map/start_pin.png',
		iconRetinaUrl: '../assets/img/map/start_pin@2x.png',
		iconSize: [25, 35],	 	
		iconAnchor: [13, 35]		 	
	 });
	 var myStyle = {
	 	color: '#f00',
	 	fillColor: '#ffc4c4',
	 	weight: 2,
	 	opacity: 0.8,
	 	icon: myIcon	 	
	 };		
	if(map.hasLayer(putPickupLocation)) {
		map.removeLayer(putPickupLocation);
	} else {
		//map.setView([JsonData.coordinates[1],JsonData.coordinates[0]],16);		
	}			
	putPickupLocation = new L.marker([ curlat, curlng ], {icon: myIcon, style: myStyle}).bindPopup(' <b> ตำแหน่งต้นทาง </b> ');			
	map.addLayer(putPickupLocation);
}



function addPoiJson(JsonData) {
	//var myIcon = L.icon({iconUrl: 'img/map/taxi_pin.png'});
	var myIcon = L.icon({			 	
	 	iconUrl: '../assets/img/map/taxi_locat.png',
		iconRetinaUrl: '../assets/img/map/taxi_locat@2x.png',
		iconSize: [35, 35],
	 	//shadowUrl: 'img/map/leaf-shadow.png'
		iconAnchor: [17, 19]		 	
	 });
	 var myStyle = {
	 	color: '#f00',
	 	fillColor: '#ffc4c4',
	 	weight: 2,
	 	opacity: 0.8,
	 	icon: myIcon	 	
	 };
	 /*
	jsonPoiList = L.geoJson(JsonData, {
	   	style: myStyle
	 });
	 */
	//console.log(map.getCenter())

	PsgNewLat = JsonData.coordinates[1];
	PsgNewLng = JsonData.coordinates[0];

	if (distance(PsgOldLat, PsgOldLng, PsgNewLat, PsgNewLng, "K") > .001) {
		//alert(distance(PsgOldLat, PsgOldLng, PsgNewLat, PsgNewLng, "K"))
		if(map.hasLayer(putPsg)) {
			map.removeLayer(putPsg);
		} else {
			//map.setView([JsonData.coordinates[1],JsonData.coordinates[0]]);  suspected : Autozoom
		}
        		if(map.hasLayer(putCircle)) {
        			map.removeLayer(putCircle);
        		}
		putPsg = new L.marker([JsonData.coordinates[1],JsonData.coordinates[0]], {icon: myIcon, style: myStyle})
		putCircle = new L.circle([JsonData.coordinates[1],JsonData.coordinates[0]],2000, { stroke:true, color: "#009900", weight:1, opacity:0.2 })
		map.addLayer(putPsg);
		if(cur_status=="OFF" || cur_status==undefined){	
			map.addLayer(putCircle);
		} 	
	}	
	//putPsg = new L.marker([JsonData.coordinates[1],JsonData.coordinates[0]], {icon: myIcon, style: myStyle}).bindPopup('<b>พิกัด '+ JsonData.coordinates[1] +' , '+ JsonData.coordinates[0]);	
	//console.log(JsonData.getBounds())
	//map.fitBounds(JsonData.getBounds());
}


function addPoiJsonFirst(JsonData) {	
	var myIcon = L.icon({			 	
	 	iconUrl: '../assets/img/map/taxi_locat.png',
		iconRetinaUrl: '../assets/img/map/taxi_locat@2x.png',
		iconSize: [35, 35],	 	
		iconAnchor: [17, 19]		 	
	 });
	 var myStyle = {
	 	color: '#f00',
	 	fillColor: '#ffc4c4',
	 	weight: 2,
	 	opacity: 0.8,
	 	icon: myIcon	 	
	 };		
	if(map.hasLayer(putPsg)) {
		map.removeLayer(putPsg);
		map.setView([JsonData.coordinates[1],JsonData.coordinates[0]],14);
	} else {
		map.setView([JsonData.coordinates[1],JsonData.coordinates[0]],14);		
	}
	if(map.hasLayer(putCircle)) {
		map.removeLayer(putCircle);
	}	
	putPsg = new L.marker([JsonData.coordinates[1],JsonData.coordinates[0]], {icon: myIcon, style: myStyle});
	PsgOldLat = JsonData.coordinates[1];
	PsgOldLng = JsonData.coordinates[0];	
	putCircle = new L.circle([JsonData.coordinates[1],JsonData.coordinates[0]],2000, { stroke:true, color: "#009900", weight:1, opacity:0.2 });
	map.addLayer(putPsg);
	if(cur_status=="OFF" || cur_status==undefined){	
		map.addLayer(putCircle);
	}
}




function addPoi(JsonData) {	
	 var myIcon = L.icon({iconUrl: 'img/map/taxi_pin.png'});
	 
	 var myStyle = {
	 	color: '#f00',
	 	fillColor: '#ffc4c4',
	 	weight: 2,
	 	opacity: 0.8,
	 	icon: myIcon,			
	 	iconUrl: 'img/map/taxi_pin.png'
	 };	
	$.each(JsonData.data, function(i, item) {
	 	putMarker = new L.marker([item.lat,item.lng], {icon: myIcon, style: myStyle});
		map.addLayer(putMarker);			  
	});

}



function getDrvLoc(drv_id){			
	 $.ajax({
		type: "POST",
		async: false, //blocks window close
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

			     		if(DrvarroundID){
						for (IDvariable in DrvarroundID) {
							//console.log(DrvarroundID[IDvariable])
					        		if(map.hasLayer(TaxiCurLayer[ DrvarroundID[IDvariable] ])) {
					        			map.removeLayer(TaxiCurLayer[ DrvarroundID[IDvariable] ]);		        			
					        		}
					        		DrvarroundID = [];					
						}
			     		}	

					TaxiCurLayer = {};	

			    	} 

		    		if(map.hasLayer(DrvLocMarker)) {
		    			map.removeLayer(DrvLocMarker);
		    			addPoiDrvLoc(data);	
		    		} else {
		    			addPoiDrvLoc(data);	
		    		}

			}

		} 
	 });
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
		myIcon1 = L.icon({			 	
			iconUrl: '../assets/img/map/tx_'+JsonData.data.status+'@2x.png',
			iconRetinaUrl: '../assets/img/map/tx_'+JsonData.data.status+'@2x.png',
			iconSize: [42, 47],				
			iconAnchor: [20, 20] ,
			labelAnchor:[-50,-42] 								
		});

		myIcon2 = L.icon({
		 	iconUrl: '../assets/img/map/tx_WAIT@2x.png',
		 	iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
			iconSize: [42, 47],				
			iconAnchor: [20, 20] ,
			labelAnchor:[-50,-42] 								
		});		

		if(JsonData.data.curlat!=''&&JsonData.data.curlng!=''){
			item = JsonData.data;

	 		myIcon = myIcon1;
	 		if( FocusTaxiID2 == item._id ) {
	 			myIcon = myIcon2;
	 		}

			DrvLocMarker = new L.marker([item.curlat,item.curlng], { icon: myIcon, style: myStyle}) ;
			
			DrvLat = item.curlat;
			DrvLng = item.curlng;

			DrvLocMarker.options.itemData = item;

			DrvLocMarker.on('click', function(e) {
				FocusTaxiID = this.options.itemData._id;
				DrvLat = this.options.itemData.curlat;
				DrvLng = this.options.itemData.curlng;
				if($('.taxibeampsng-info-sec .wrap').attr('data-ref') !== FocusTaxiID2) {

		 			var icon = L.icon({
		 				iconUrl: '../assets/img/map/tx_WAIT@2x.png',
		 				iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
		 				iconSize: [42, 47],
		 				iconAnchor: [20, 20] ,
		 				labelAnchor:[-50,-42]
		 			});
					this.setIcon(icon);
					//$('.taxibeampsng-info').html('ดูรายละเอียดคนขับ');
					$('.taxibeampsng-info-sec .wrap').show();
					//$('.taxibeampsng-taxiplatestatus').html(this.options.itemData.carplate);
					if(this.options.itemData.carreturn=='Y') {
						$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate+icon_sendcar);
					} else {
						$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate);
					}					
					$('.taxibeampsng-taxinamestatus').html('ชื่อ '+this.options.itemData.fname);
					//$('.taxibeampsng-info.calltaxi').attr('href', "tel:"+this.options.itemData.phone);
					//if(this.options.itemData.allowpsgcontact=='Y' && distance(curlat, curlng, DrvLat, DrvLng,"K")<DistoShowPhone ){
					$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'visible');
					$('.taxibeampsng-status-taxitel').html('<a href="tel:'+this.options.itemData.phone+'"   onclick="Psgcalllog( \''+psg_id+'\', \''+tempid+'\', \''+this.options.itemData._id+'\', \''+this.options.itemData.phone+'\', \''+this.options.itemData.carplate+'\', \'tab\' )"   ><i class="icon-icn_phone"></i> '+this.options.itemData.phone+'</a>');	
					// } else {
					// 	$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'hidden');
					// 	$('.taxibeampsng-status-taxitel').html('&nbsp;');	
					// }
					//createCookie("status_view", "", 365) ;
					$('.taxibeampsng-hide-form-calltaxi').click()
					$('.taxibeampsng-info-sec .wrap').attr('data-ref', FocusTaxiID);
					FocusTaxiID2 = FocusTaxiID;
				} else {
					if (FocusTaxiID!=FocusTaxiID2) {						
						var display = $('.taxibeampsng-info-sec .wrap').css('display');
						if(display == 'block') {															
				 			var icon = L.icon({
				 				iconUrl: '../assets/img/map/tx_WAIT@2x.png',
				 				iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
				 				iconSize: [42, 47],
				 				iconAnchor: [20, 20] ,
				 				labelAnchor:[-50,-42]
				 			});
							this.setIcon(icon);
							$('.taxibeampsng-info-sec .wrap').show();
							//$('.taxibeampsng-taxiplatestatus').html(this.options.itemData.carplate);
							if(this.options.itemData.carreturn=='Y') {
								$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate+icon_sendcar);
							} else {
								$('.taxibeampsng-taxiplatestatus').html(''+this.options.itemData.carplate);
							}							
							$('.taxibeampsng-taxinamestatus').html('ชื่อ '+this.options.itemData.fname);
							//$('.taxibeampsng-info.calltaxi').attr('href', "tel:"+this.options.itemData.phone);
							// if(this.options.itemData.allowpsgcontact=='Y' && distance(curlat, curlng, DrvLat, DrvLng,"K")<DistoShowPhone ){
							$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'visible');
							$('.taxibeampsng-status-taxitel').html('<a href="tel:'+this.options.itemData.phone+'"  onclick="Psgcalllog( \''+psg_id+'\', \''+tempid+'\', \''+this.options.itemData._id+'\', \''+this.options.itemData.phone+'\', \''+this.options.itemData.carplate+'\', \'tab\' )"     ><i class="icon-icn_phone"></i> '+this.options.itemData.phone+'</a>');
							// } else {
							// 	$('.taxibeampsng-statusgroup-tel').find('i.icon-icn_phone').css('visibility', 'hidden');
							// 	$('.taxibeampsng-status-taxitel').html('&nbsp;');
							// }
							//createCookie("status_view", "", 365) ;						
							defaultMapH = 69;
							$('#map').height(deviceH - defaultMapH);
							$('.taxibeampsng-form-calltaxi').removeClass('active');
							$('.taxibeampsng-status-waittaxi').removeClass('active');
							$('.taxibeampsng-status-gottaxi').removeClass('active');
							$('.taxibeampsng-status-busy').removeClass('active');
							$('.taxibeampsng-status-thankyou').removeClass('active');
							$('.taxibeampsng-info-sec .wrap').attr('data-ref', FocusTaxiID);
							FocusTaxiID2 = FocusTaxiID;
						} else {
							$('.taxibeampsng-info-sec .wrap').show();
				 			var icon = L.icon({
				 				iconUrl: '../assets/img/map/tx_WAIT@2x.png',
				 				iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
				 				iconSize: [42, 47],
				 				iconAnchor: [20, 20] ,
				 				labelAnchor:[-50,-42]
				 			});
							this.setIcon(icon);
							FocusTaxiID2 = "";
						}
					} else {			
						var display = $('.taxibeampsng-info-sec .wrap').css('display');
						if(display == 'block') {								
							$('.taxibeampsng-info-sec .wrap').hide();
							$('.taxibeampsng-hide-form-calltaxi').click();
							//$('.taxibeampsng-info').html('กด <img src="../img/map/tx_ON.png" srcset="../img/map/tx_ON@2x.png 2x"> เพื่อโทรหาคนขับ');
				 			var icon = L.icon({
				 				iconUrl: '../assets/img/map/tx_ON@2x.png',
				 				iconRetinaUrl: '../assets/img/map/tx_ON@2x.png',
				 				iconSize: [42, 47],
				 				iconAnchor: [20, 20] ,
				 				labelAnchor:[-50,-42]
				 			});
							this.setIcon(icon);							
							FocusTaxiID2 = "";	
						} else {
							$('.taxibeampsng-info-sec .wrap').show();
				 			var icon = L.icon({
				 				iconUrl: '../assets/img/map/tx_WAIT@2x.png',
				 				iconRetinaUrl: '../assets/img/map/tx_WAIT@2x.png',
				 				iconSize: [42, 47],
				 				iconAnchor: [20, 20] ,
				 				labelAnchor:[-50,-42]
				 			});
							this.setIcon(icon);
							
						}
					}
				}


				// $('.taxibeampsng-info-sec .wrap').toggleClass('active');
				// $('.taxibeampsng-info-box .taxinumber .taxibeampsng-info').html(this.options.itemData.carplate);
				// $('.taxibeampsng-info-box .taxiname .taxibeampsng-info').html('ชื่อ '+this.options.itemData.fname);
				// $('.taxibeampsng-info.calltaxi').attr('href', "tel:"+this.options.itemData.phone);
				// $('.taxibeampsng-info.calltaxi').html('<i class="icon-icn_phone"></i> '+this.options.itemData.phone);
				// //createCookie("status_view", "", 365) ;						
				// defaultMapH = 44;
				// $('#map').height(deviceH - defaultMapH);
				// $('.taxibeampsng-info-sec .wrap').attr('data-ref', FocusTaxiID2);
			});

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
		    }
		});
	    //markerD.bindPopup('<p>Please confirm the destination point<br><center><input type="button" value="DESTINATION"></center></p>').openPopup();
	});			
}






// Alert and confirm box 


var ALERT_TITLE = "";
var ALERT_BUTTON_TEXT = "ปิด";
var CONFIRM_BUTTON_TEXT_NO = "ไม่";
var CONFIRM_BUTTON_TEXT_YES = "ใช่";
var CONFIRM_VALUE = "";

if(document.getElementById) {
    window.alert = function(txt) {
        createCustomAlert(txt);
    }
}


function createCustomAlert(txt) {
    d = document;

    if(d.getElementById("modalContainer")) return;

    mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
    mObj.id = "modalContainer";
    mObj.style.height = d.documentElement.scrollHeight + "px";

    alertObj = mObj.appendChild(d.createElement("div"));
    alertObj.id = "alertBox";
    if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
    alertObj.style.left = (d.documentElement.scrollWidth - alertObj.offsetWidth)/2 + "px";
    alertObj.style.visiblity="visible";

    h1 = alertObj.appendChild(d.createElement("h1"));
    h1.appendChild(d.createTextNode(ALERT_TITLE));

    msg = alertObj.appendChild(d.createElement("p"));
    //msg.appendChild(d.createTextNode(txt));
    msg.innerHTML = txt;

    btn = alertObj.appendChild(d.createElement("a"));
    btn.id = "closeBtn";
    btn.appendChild(d.createTextNode(ALERT_BUTTON_TEXT));
    btn.href = "#";
    btn.focus();
    btn.onclick = function() { removeCustomAlert(); console.log('ok'); return false; }

    alertObj.style.display = "block";

}

function removeCustomAlert() {
    document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
}






if(document.getElementById) {
    window.confirm = function(txt) {    	
        createCustomConfirm(txt);
    }
}

function createCustomConfirm(txt) {
    d = document;

    if(d.getElementById("modalContainerConfirm")) return;

    mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
    mObj.id = "modalContainerConfirm";
    mObj.style.height = d.documentElement.scrollHeight + "px";

    alertObj = mObj.appendChild(d.createElement("div"));
    alertObj.id = "confirmBox";
    if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
    alertObj.style.left = (d.documentElement.scrollWidth - alertObj.offsetWidth)/2 + "px";
    alertObj.style.visiblity="visible";

    h1 = alertObj.appendChild(d.createElement("h1"));
    h1.appendChild(d.createTextNode(ALERT_TITLE));

    msg = alertObj.appendChild(d.createElement("p"));
    //msg.appendChild(d.createTextNode(txt));
    msg.innerHTML = txt;

    btn = alertObj.appendChild(d.createElement("a"));
    btn.id = "closeBtn";
    btn.appendChild(d.createTextNode(CONFIRM_BUTTON_TEXT_NO));
    btn.href = "#";
    btn.focus();
    btn.onclick = function() { removeCustomConfirm(); console.log('ปิด'); return false;}
    


    btn1 = alertObj.appendChild(d.createElement("b"));
    btn1.id = "yesBtn";
    btn1.appendChild(d.createTextNode(CONFIRM_BUTTON_TEXT_YES));
    btn1.href = "#";
    btn1.focus();
    btn1.onclick = function() { 

	switch(confirmStepwhat) {
		case "cancelCall":
    			cancelCall();
    		break;
    		case "cancelgottaxi":
    			cancelgottaxi();
    		break;
    		case "cancelbusy":
    			cancelbusy();
    		break;

    	}
    	
    	removeCustomConfirm(); 
    }    


    alertObj.style.display = "block";

}


function removeCustomConfirm() {
    document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainerConfirm"));
}


function cancelCall() {		
	$.ajax({
		type: "POST",
		async: false, //blocks window close
		contentType: "application/json; charset=utf-8", 				     
		url : "../service/passengertp/cancelCall",
		dataType: "json", 
		data: " { \"device_id\": \""+tempid+"\" } ", 		     
		success: function(data){
			defaultMapH = 260;
			//console.log('PsgstartLat = '+PsgstartLat);
			if (PsgstartLat) {
				map.setView( [PsgstartLat, PsgstartLng ]) ;	
			}
			checkstatuspsg();
		        		if(map.hasLayer(putPsg)) {
		        			map.removeLayer(putPsg);		        			
		        		}
		        		if(map.hasLayer(putCircle)) {
		        			map.removeLayer(putCircle);
		        		}			        		
		        		$('#tips').val('');
			    	//$('.taxibeampsng-map-gps-center').fadeIn();
			    	$('.taxibeampsng-info-sec .wrap').hide();
				if(map.hasLayer(putPickupLocation)) {
					map.removeLayer(putPickupLocation);
				} 
				$('.taxibeampsng-calltaxi-btn').click();				
				$('#tips').val('');
		} 
	});
}


function cancelgottaxi() {		
	$.ajax({
		type: "POST",
		async: false, //blocks window close
		contentType: "application/json; charset=utf-8", 
		url : "../service/passengertp/cancelCall",
		dataType: "json", 
		data: " { \"device_id\": \""+tempid+"\" } ", 		
		success: function(data){
			//console.log('PsgstartLat = '+PsgstartLat);
			if (PsgstartLat) {
				map.setView( [PsgstartLat, PsgstartLng ]) ;	
			}
			checkstatuspsg();
		        		if(map.hasLayer(putPsg)) {
		        			map.removeLayer(putPsg);		        			
		        		}
		        		if(map.hasLayer(putCircle)) {
		        			map.removeLayer(putCircle);
		        		}			        		
		        		$('#tips').val('');
			    	//$('.taxibeampsng-map-gps-center').fadeIn();
			    	$('.taxibeampsng-info-sec .wrap').hide();
				if(map.hasLayer(putPickupLocation)) {
					map.removeLayer(putPickupLocation);
				} 
				$('.taxibeampsng-calltaxi-btn').click();					
				$('#tips').val('');					
		} 
	});
}


function cancelbusy() {		
	$.ajax({
		type: "POST",
		async: false, //blocks window close
		contentType: "application/json; charset=utf-8", 			
		url : "../service/passengertp/cancelCall",
		dataType: "json", 
		data: " { \"device_id\": \""+tempid+"\" } ", 
		success: function(data){
			//console.log('PsgstartLat = '+PsgstartLat);
			if (PsgstartLat) {
				map.setView( [PsgstartLat, PsgstartLng ]) ;	
			}
			checkstatuspsg();
		        		if(map.hasLayer(putPsg)) {
		        			map.removeLayer(putPsg);		        			
		        		}
		        		if(map.hasLayer(putCircle)) {
		        			map.removeLayer(putCircle);
		        		}			        		
		        		$('#tips').val('');
			    	//$('.taxibeampsng-map-gps-center').fadeIn();
			    	$('.taxibeampsng-info-sec .wrap').hide();
				if(map.hasLayer(putPickupLocation)) {
					map.removeLayer(putPickupLocation);
				} 
				$('.taxibeampsng-calltaxi-btn').click();					
				$('#tips').val('');					
		} 
	});
}



function Psgcalllog(psg_id, psg_device_id, drv_id, drv_phone, drv_carplate, callby) {
	psg_phone = $('#psgphone').val() ;
	$.ajax({
		type: "POST",
		async: false, //blocks window close
		contentType: "application/json; charset=utf-8", 			
		url : "../service/passengertp/Psgcalllog",
		dataType: "json", 
		data: " { \"psg_id\": \""+psg_id+"\", \"psg_device_id\": \""+psg_device_id+"\", \"psg_phone\": \""+psg_phone+"\", \"drv_id\": \""+drv_id+"\", \"drv_phone\": \""+drv_phone+"\", \"drv_carplate\": \""+drv_carplate+"\", \"callby\": \""+callby+"\" } ", 
		success: function(data){
			console.log(' call success ');
		} 
	});
}



function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}



function getCarcolorCode(sStr) {
	switch(sStr) {
		case "น้ำเงิน":
    			return 'c01';
    		break;
    		case "เขียว":
    			return 'c02';
    		break;
    		case "ส้ม":
    			return 'c03';
    		break;
    		case "ชมพู":
    			return 'c04';
    		break;
    		case "ชมพู-เทา":
    			return 'c05';
    		break;
    		case "แดง":
    			return 'c06';
    		break;
    		case "แดง-น้ำเงิน":
    			return 'c07';
    		break;
    		case "แดง-เทา":
    			return 'c08';
    		break;
    		case "ม่วง":
    			return 'c09';
    		break;
    		case "เหลือง":
    			return 'c10';
    		break;
    		case "เหลือง-น้ำเงิน":
    			return 'c11';
    		break;
    		case "เหลือง-เขียว":
    			return 'c12';
    		break;    		
    		default:
    			return 'c99';
    		break;

    	}
}

	/*
	create Long press action
	var pressTimer

	$("#but_gatMeaTaxi").mouseup(function(){
		  clearTimeout(pressTimer)
	  	// Clear timeout
	  	console.log('abc')
		  return false;
	}).mousedown(function(){
	  	// Set timeout
	  	console.log('def')
	  	pressTimer = window.setTimeout(function() {
	  		gatMeaTaxi();
	  	},1000)
	  	return false; 
	});
	*/ 


	// example : https://developers.google.com/maps/documentation/javascript/geocoding ::::> Reverse Geocoding by Location
	// example : http://stackoverflow.com/questions/2921745/how-to-make-cross-domain-ajax-calls-to-google-maps-api
	//<script src="http://maps.google.com/maps/api/js?sensor=false"></script>
	//		http://maps.google.com/maps/api/geocode/json?latlng=13.7563309,%20100.50176510000006&sensor=false&language=TH
	/*
	var geocoder = new google.maps.Geocoder();
	var address = 'Bangkok, TH';
	var latlng = {lat: 13.7563309, lng: 100.50176510000006}

	if (geocoder) {
		//geocoder.geocode({ 'address': address }, function (results, status) {
		geocoder.geocode({ 'location': latlng , 'language': 'TH' }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				//console.log('Bangkok = '+results[0].geometry.location);
				console.log(' address = '+results[0].formatted_address);
			}
			else {
				console.log("Geocoding failed: " + status);
			}
		});
	} 
	*/	



//hiddenloc = map.getCenter();
//PsgLat = hiddenloc.lat; 
//PsgLng = hiddenloc.lng; 
/*
	$.ajax({ 
		type: "POST", 
		contentType: "application/json; charset=utf-8", 
		url: "https://locator.ecartmap.com/locator/address", 
		dataType: "json",        
		data: "{\"latitude\": "+PsgLat+" , "+"\"longitude\": "+PsgLng+" , \"languagecode\": \"TH\" }",
		success: function (data) { 			
			//if (data.Address) {
			//	$('#psgfrom').val(data.Address)	
			//} else {
			//	$('#psgfrom').val('ไม่สามารถระบุชื่อสถานที่ได้')
			//}   
			$('.taxibeampsng-map-gps-center-tooltip').fadeOut();
			//$('.taxibeampsng-calltaxi-btn').click();    	
		} 
	});
*/

// map.on('draw:created', function (e) {
// 	var type = e.layerType,
// 	layer = e.layer;
// 	map.addLayer(layer);
// });

//setTimeout(function(){map.invalidateSize(), 10});
/*
if ( localStorage.getItem('browser_id') == null ) { 
	tempid = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime();	
	localStorage.setItem('browser_id', tempid );
} else {
	tempid = localStorage.getItem('device_id');
}
*/



	/*			
	var layerPoint = map.latLngToLayerPoint(L.latLng(hiddenloc));
	var BBString = map.getBounds().toBBoxString();
	var getSizeX = map.getSize().x;
	var getSizeY = map.getSize().y;
	var getPointX = map.layerPointToContainerPoint(layerPoint).x;
	var getPointY = map.layerPointToContainerPoint(layerPoint).y;
	$.ajax({ 
		type: "GET", 
		contentType: "application/json; charset=utf-8", 
		url: "https://nhmap-proxy.ecartmap.com/?pxtype=info&id=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9&width="+getSizeX+"&height="+getSizeY+"&x="+getPointX+"&y="+getPointY+"&bbox="+BBString+"&lang=TH&floor=1", 
		jsonCallback: 'jsonCallbackInfo',
		dataType: "jsonp", 				
		success: function (data) { 
			//tempdata = data;
			hiddenaddress = data.info.house.name === undefined ? ' ' : data.info.house.name + ' ';
			hiddenaddress += data.info.house.number === undefined ? ' ' : data.info.house.number + ' ';
			hiddenaddress += data.info.road === undefined ? ' ' : data.info.road + ' ';
			hiddenaddress += data.info.address.subDistrict === undefined ? ' ' : data.info.address.subDistrict + ' ';
			hiddenaddress += data.info.address.district === undefined ? ' ' : data.info.address.district + ' ';
			hiddenaddress += data.info.address.province === undefined ? ' ' : data.info.address.province + ' ';
			hiddenaddress += data.info.address.postalCode === undefined ? ' ' : data.info.address.postalCode + ' ';

			$('#psgfrom').val(hiddenaddress)				
		} 
	});
	*/



	/*  Locator service ==> is used to be working before 
	$.ajax({ 
		type: "POST", 
		contentType: "application/json; charset=utf-8", 
		url: "https://locator.ecartmap.com/locator/address", 
		dataType: "json",        
		data: "{\"latitude\": "+PsgLat+" , "+"\"longitude\": "+PsgLng+" , \"languagecode\": \"TH\" }",
		success: function (data) { 			
			if (data.Address) {
				console.log(' data address '+data.Address)
				temp_curaddr_add = data.Address;
			} else {
				console.log(' no address ')
				temp_curaddr_add = 'ไม่สามารถระบุชื่อสถานที่ได้'	;
			}
		} 
	});
	*/