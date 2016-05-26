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
var DrvarroundID = []; 
var favcartype = [];
var animatedMarker;
var polyline_123;

var cur_status ;

var tempid;
var browser_id;	

var confirmStepwhat = '';

var defaultMapH = 329;
/* อุบล
var curlng = 104.8601933 ;
var curlat = 15.243196;
*/
/* อนุเสาวรีย์ชัย๐*/
var curlng = 100.538273 ;
var curlat = 13.765787;

var tmppsgstatus;

var flag = true ;  // to check dialog

var deviceH = $(window).height();

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

map.invalidateSize();

/*
if ( localStorage.getItem('browser_id') == null ) { 
	tempid = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime();	
	localStorage.setItem('browser_id', tempid );
} else {
	tempid = localStorage.getItem('device_id');
}
*/



if ( readCookie("browser_id") == null ) { 
	tempid = Math.floor(Math.random() * 999) + 9 + '-' + new Date().getTime();		
	createCookie("browser_id", tempid, 365) ;
} else {
	tempid = readCookie("browser_id");
}


//browser_id = localStorage.getItem('browser_id');
browser_id = readCookie("browser_id");


$(document).ready(function() {

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
	
	//if ( localStorage.getItem('firsttimehowto') >= 1 ) {
	if ( readCookie("firsttimehowto") >= 1 ) {		
		$('.taxibeampsng-howtouse').hide();
	}  else {
		//localStorage.setItem('firsttimehowto', 1 );
		createCookie("firsttimehowto", "1", 365) ;
		$('.taxibeampsng-howtouse').addClass('active');		
	}

	//if ( localStorage.getItem('device_id') != null ) {
	if ( readCookie("device_id") != null ) {
		//$('#psgphone').val(localStorage.getItem('device_id'));
		$('#psgphone').val(readCookie("device_id"));
		tempid = readCookie("device_id");
	}


	checkstatuspsg();
	
	setInterval(function() { 			
		checkstatuspsg();  
	}, 10000);
			
	checkCenter(function(  ){				
		//getDrvarround(  10000,100);
	});



	$('.hb-icon-currentlocation').removeClass('hb-icon-currentlocation');
	$('.hb-icon').addClass('icon-ico_nearme')

	//map.invalidateSize();
	//$('#map').height(deviceH - defaultMapH);
	
	//alert(deviceH+' | '+defaultMapH)
	//getMobileOperatingSystem() ;
	/*
		if ($('#car').is(":checked")) {
			favcartype.push($('#car').val());
			console.log('favcartype ='+favcartype)	
		}	
		if ($('#minivan').is(":checked")) {
			favcartype.push($('#minivan').val());
			console.log('favcartype ='+favcartype)	
		}
	*/

////////////////////////////////////////////////////////////////////////////// 
/*
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
*/
///////////////////////////////////////////////////////////////////////////////



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



	$("#car").change(function() {
		if (this.checked) {			
			getDrvarround( curlng, curlat,   1000000,500);
		} else {			
			if ($('#minivan').is(":checked")) {				
				getDrvarround( curlng, curlat,   1000000,500);
				
			} else {
				//$('.taxibeampsng-checkbox-minivan').click();				
				$('#minivan').click();
				$('label[for=minivan]').children().children('i').addClass('icon-btn_minivan_check');
				$('label[for=minivan]').children().children('i').removeClass('icon-btn_minivan_uncheck');
				$('.taxibeampsng-checkbox-minivan').children().addClass('active');

				getDrvarround( curlng, curlat,   1000000,500);
			}
		}
	});

	$("#minivan").change(function() {
		if(this.checked) {
			getDrvarround( curlng, curlat,   1000000,500);			
		} else {
			if ($('#car').is(":checked")) {				
				getDrvarround( curlng, curlat,   1000000,500);
				
			} else {				
				//$('.taxibeampsng-checkbox-car').click();
				$('#car').click();
				$('label[for=car]').children().children('i').addClass('icon-btn_sedan_check');
				$('label[for=car]').children().children('i').removeClass('icon-btn_sedan_uncheck');
				$('.taxibeampsng-checkbox-car').children().addClass('active');
				
				getDrvarround( curlng, curlat,   1000000,500);
			}
		}
	});


	//alert ('abc ')
	//intel.xdk.notification.alert("Hammertime!","STOP","Can\'t Touch This");
	//alert ('def ')
	//navigator.notification.alert(message, alertCallback, [title], [buttonName]);
	//navigator.notification.alert("Message","","Caption");
	//alert ('ghi ')	
	
	
	if ($(window).width() > 1024) {
		$('.taxibeampsng-wrapper').height(deviceH);
		/*$('.taxibeampsng-wrapper , .taxibeampsng-header').width(deviceH-256);*/
		$(window).resize(function() {
			var deviceHRD = $(window).height();
			$('.taxibeampsng-wrapper').height(deviceHRD);
			/*$('.taxibeampsng-wrapper , .taxibeampsng-header').width(deviceHRD-256);*/
		});
	}


	$('.icon-ico_nearme').click(function() {		
		checkCenter();
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
			//localStorage.setItem('status_view', '' );
			createCookie("status_view", "", 365) ;
			$('.taxibeampsng-status-gottaxi').addClass('active');
			defaultMapH = 44;
			checkstatuspsg();
		} else {
			defaultMapH = 329;
			$('.taxibeampsng-form-calltaxi').addClass('active');
			checkstatuspsg();
			map.invalidateSize();
			$('#map').height(deviceH-defaultMapH);
		}
	});

	$('.taxibeampsng-hide-form-calltaxi').click(function() {
		$('.taxibeampsng-form-calltaxi').removeClass('active');
		defaultMapH = 44;
		map.invalidateSize();
		$('#map').height(deviceH-defaultMapH);
	});

	$('.taxibeampsng-form-calltaxi .taxibeampsng-submit-btn').click(function() {
		//$('.taxibeampsng-status-waittaxi').addClass('active');
		//$('.taxibeampsng-form-calltaxi').removeClass('active');
		//alert('1')
	});

	$('.taxibeampsng-status-waittaxi .taxibeampsng-cancel-btn').click(function() {
		console.log('cancel call a taxi')
		confirmStepwhat = 'cancelCall';
		if (confirm('คุณต้องการที่จะยกเลิกบริการ?')) {
			// return false;		
			$.ajax({
				type: "POST",
				async: false, //blocks window close
				contentType: "application/json; charset=utf-8", 				     
				url : "../service/passengertp/cancelCall",
				dataType: "json", 
				data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
				success: function(data){
					defaultMapH = 329;
					checkstatuspsg();
					//$('.taxibeampsng-form-calltaxi').addClass('active');
					//$('.taxibeampsng-status-waittaxi').removeClass('active');
				} 
			});
		}

	});



	$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').click(function() {
		//alert('2')
		if (cur_status=="WAIT") {
			$.ajax({
				type: "POST",
				async: false, //blocks window close
				contentType: "application/json; charset=utf-8", 				     
				url : "../service/passengertp/acceptDrv",				
				dataType: "json", 
				data: " { \"device_id\": \""+tempid+"\" , \"drv_id\":\""+drv_id+"\" } ", 			     
				success: function(data){
					defaultMapH = 44;
					checkstatuspsg();
					//$('.taxibeampsng-status-gottaxi').removeClass('active');
					//$('.taxibeampsng-status-busy').addClass('active');
				} 
			});
		}

		if (cur_status=="BUSY" || cur_status=="PICK"){
			//alert('a')
			//if ( localStorage.getItem('status_view') == 'viewmap' ) {
			if ( readCookie("status_view") == 'viewmap' ) {
				//alert('b')
				//localStorage.setItem('status_view', '' );
				createCookie("status_view", "viewmap", 365) ;
				$('.taxibeampsng-status-gottaxi').removeClass('active');
				checkstatuspsg();	
			} else {
				//alert('c')
				//localStorage.setItem('status_view', 'viewmap' );
				createCookie("status_view", "viewmap", 365) ;
				$('.taxibeampsng-status-gottaxi').removeClass('active');
				checkstatuspsg();
			}		
		}

		if ( cur_status == 'DRVDENIED' ) {
			gatMeaTaxi ();
			/*
			$.ajax({
			    url : "../service/passengertp/callDrv",
			    type: "POST",
			    async: false, //blocks window close
			    data : data,
			    success: function(data){			       	
			       	//checkstatuspsg();
			    }
			});
			*/
		}

	});

	$('.taxibeampsng-status-thankyou .taxibeampsng-submit-btn').click(function() {
		//alert('4')
		$.ajax({
			type: "POST",
			async: false, //blocks window close
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/endTrip",				
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\" } ", 			     
			success: function(data){
				defaultMapH == 329;
				checkstatuspsg();
				//$('#map').height(deviceH);
				//$('.taxibeampsng-status-gottaxi').removeClass('active');
				//$('.taxibeampsng-status-busy').removeClass('active');
				//$('.taxibeampsng-status-thankyou').removeClass('active');
				//$('.taxibeampsng-calltaxi-btn').text('เรียกแท็กซี่ผ่านระบบ');
			} 
		});
	});	


	$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').click(function() {
		console.log('cancel call a got taxi')
		confirmStepwhat = 'cancelgottaxi';
		if (confirm('คุณต้องการที่จะยกเลิกบริการ?')) {
			$.ajax({
				type: "POST",
				async: false, //blocks window close
				contentType: "application/json; charset=utf-8", 
				url : "../service/passengertp/cancelCall",
				dataType: "json", 
				data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			
				success: function(data){
					checkstatuspsg();
				} 
			});
		}
	});	

	$('.taxibeampsng-status-busy .taxibeampsng-cancel-btn').click(function() {
		console.log('cancel busy')
		confirmStepwhat = 'cancelbusy';
		if (confirm('คุณต้องการที่จะยกเลิกบริการ?')) {
			$.ajax({
				type: "POST",
				async: false, //blocks window close
				contentType: "application/json; charset=utf-8", 			
				url : "../service/passengertp/cancelCall",
				dataType: "json", 
				data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 
				success: function(data){
					checkstatuspsg();
				} 
			});
		}
	});	

	$('.taxibeampsng-status-gottaxi , .taxibeampsng-status-thankyou').height(deviceH-44);


	$(window).resize(function() {
		var deviceHR = $(window).height();
		$('.taxibeampsng-status-gottaxi , .taxibeampsng-status-thankyou').height(deviceHR-44);

		if($('.taxibeampsng-form-calltaxi').hasClass('active')) {
			defaultMapH = 329;
			map.invalidateSize();
			$('#map').height(deviceHR-defaultMapH);
		} else {
			defaultMapH = 44;
			map.invalidateSize();
			$('#map').height(deviceHR-defaultMapH);
		}
	});

});


$(function(){
				
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
	//alert(userAgent);
	if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
	{
		return 'iOS';
		//alert('iOS')
	}
	else if( userAgent.match( /Android/i ) )
	{
		return 'Android';
		//alert('Android')
	}
	else
	{
		return 'unknown';
		//alert('unknown')
	}
}



function getfavcartype() {
	var favcartype = [];
	if ($('#car').is(":checked")) {
		favcartype.push($('#car').val());
	}	
	if ($('#minivan').is(":checked")) {
		favcartype.push($('#minivan').val());
	}
	return favcartype;
	//console.log('favcartype ='+favcartype)	
}




function Clearpsgphone(){
	$('#psgphone').val('');
}


	
function getDrvarround( curlng, curlat, radian, limits){		
	$.ajax({
		type: "POST",
		async: false, //blocks window close
	     	contentType: "application/json; charset=utf-8", 				
		url : "../service/passengertp/searchDrv",
		dataType: "json", 
		data: " { \"favcartype\": "+JSON.stringify(getfavcartype())+", \"curlng\": "+curlng+", \"curlat\": "+curlat+", \"radian\":1000000, \"amount\":100 } ", 
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
		myIcon = L.icon({			 	
			iconUrl: '../assets/img/map/tx_'+item.status+'@2x.png',
			iconRetinaUrl: '../assets/img/map/tx_'+item.status+'@2x.png',
			iconSize: [42, 47],
			//shadowUrl: 'img/map/leaf-shadow.png'
			iconAnchor: [20, 20] ,
			labelAnchor:[-50,-42] 								
		});

		if(item.curlat!=''&&item.curlng!=''){
	 		TaxiCurLayer[tempmk]  = new L.marker([item.curlat,item.curlng], { icon: myIcon, style: myStyle}).bindPopup( '<a class="bg-black" href="tel:'+item.phone+'"><p class="carno">'+item.carplate+'</p><p>'+item.fname+' '+item.lname+'</p>'+'<a href="tel:'+item.phone+'"><i class="icon-icn_phone"></i>'+item.phone+'</a></a>'  ) ;
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
	      		//socket.emit('myPsgLocation',  JsonData );
	      		addPoiJson(JsonData);
	      		/*
			$.ajax({ 
				type: "POST", 
				contentType: "application/json; charset=utf-8", 
				url: "https://locator.ecartmap.com/locator/address", 
				dataType: "json", 
				data: "{'latitude':'" + position.coords.latitude + "' , 'longitude':'"+ position.coords.longitude +"' , 'languagecode': 'TH'  }", 
				success: function (data) { 
					console.log(data)
				} 
			}); 
			*/	      		
	      		//$('#psgfrom').val('abc')

	      		//callback();			      
	    		}, function() {
	      			console.log("Can not get your location, please allow browser to get your location.");
    		});
	}
}

	

function checkGPSpsg(callback){
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {	      		
	      		curlng =  position.coords.longitude ;
	      		curlat =  position.coords.latitude ;
	      		JsonData = { "type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude], "lat": position.coords.latitude, "lng": position.coords.longitude, "time stamp" : [new Date(position.timestamp)], "tempid" : tempid }	      		
	      		addPsgPoiJson(JsonData);
	      		//callback();	      
	    		}, function() {
	      			console.log("Can not get your location, please allow browser to get your location.");
    		});
	}
}



function gatMeaTaxi () {

	//if ( localStorage.getItem('device_id') == null ) { 
		tempid = $('#psgphone').val();
		//localStorage.setItem('device_id', tempid );
		createCookie("device_id", tempid, 365) ;
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
		if ( favcartype==''  ){
			alert('กรุณาเลือกประเภทรถ')
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
			    async: false, //blocks window close
			    data : data,
			    success: function(data){
			       	checkstatuspsg();
			    }
			});
		}

	}
}



function checkstatuspsg() { 
	//console.log('checkstatuspsg')
	//console.log(' curlng = '+curlng)
	var hosttemp = 'http://ubeam.demo.taxi-beam.com';
	//alert(localStorage.getItem('status_view') )
	//console.log('checkstatuspsg')
	//console.log('curlng ='+curlng)	
	//console.log(tempid)		
	if (curlng != 0) {
		$.ajax({
			type: "POST",
			async: false, //blocks window close
			contentType: "application/json; charset=utf-8", 				     
			url : "../service/passengertp/getStatus",
			dataType: "json", 
			data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
			success: function(data){
		        		//console.log(' data.status = '+data.status);
			        	if(data.status) {
			        		var getstatus = data.data.status;
			        		//console.log(' getstatus1 = '+getstatus)
			        		cur_status= getstatus;
			        		if (data.data.drv_id){
			        			drv_id = data.data.drv_id;
			        			getDrvLoc(data.data.drv_id);	
			        		} 			
			        		$('.show-dialog-btn btn btn-warning	 span').html(getstatus)
			        		//console.log(' getstatus2 = '+cur_status)

					switch(getstatus) {
						case "OFF":							
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		}
					    		//localStorage.setItem('status_view', '' );
					    		createCookie("status_view", "", 365) ;
					    		//console.log('curlat ='+curlat)	
					    		//console.log('curlng ='+curlng)					
							getDrvarround( curlng, curlat,   1000000,500);
							map.invalidateSize();
							//$('#map').height(deviceH-defaultMapH);
							$('#map').addClass('active');
						//	alert("off");
							// $('.taxibeampsng-calltaxi-btn').text('เรียกแท็กซี่');
		
							if (defaultMapH == 329) {
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
							getDrvarround( curlng, curlat,   1000000,500);
							$('.taxibeampsng-status-waittaxi').addClass('active');
						break;						

						case "ON":
							//localStorage.setItem('status_view', '' );
							createCookie("status_view", "", 365) ;
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		}					    		
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
							getDrvarround( curlng, curlat,   1000000,500);
							//$('.taxibeampsng-status-waittaxi').addClass('active');
							$('.taxibeampsng-status-gottaxi').addClass('active');	
							$('.taxibeampsng-status-header').html('<p>ขออภัยค่ะ</p><span>ขณะนี้แท็กซี่ไม่สามารถมารับท่านได้</span>');
							//$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
							//$('.taxibeampsng-gottaxi-taxino').text( result.data.carplate);
							//$('.taxibeampsng-gottaxi-taxiname').text(result.data.fname + ' ' + result.data.lname);
							//$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
							$('.taxibeampsng-gottaxi-noted').html('ท่านต้องการเรียกแท็กซี่ใหม่หรือไม่');
							$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').html(' ยกเลิก ');
							$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').html(' เรียกใหม่ ');							
						break;

						case "MANUAL":
							//alert('manual')
							/*
							localStorage.setItem('status_view', '' );
					    		if(map.hasLayer(DrvLocMarker)) {
					    			map.removeLayer(DrvLocMarker);
					    		}							
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
									$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
									$('.taxibeampsng-gottaxi-noted').html('กรุณาเลือกตกลงหรือปฏิเสธบริการนี้');
									$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').html(' - ปฏิเสธ - ');
									$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').html(' - ตกลง - ');
								} 
							});
							*/
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
									$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
									$('.taxibeampsng-gottaxi-noted').html('กรุณาเลือกตกลงหรือปฏิเสธบริการนี้');
									$('.taxibeampsng-status-gottaxi .taxibeampsng-cancel-btn').html(' - ปฏิเสธ - ');
									$('.taxibeampsng-status-gottaxi .taxibeampsng-submit-btn').html(' - ตกลง - ');
								} 
							});
						break;	

						case "BUSY":	
						case "PICK":	
							//$('.taxibeampsng-status-gottaxi').removeClass('active');
							checkGPSpsg();			
							$.ajax({
								type: "POST",
								async: false, //blocks window close
								contentType: "application/json; charset=utf-8", 				     
								url : "../service/drivercs/getByID",
								dataType: "json", 
								data: " { \"_id\": \""+data.data.drv_id+"\" } ", 			     
								success: function(result){
									//if ( localStorage.getItem('status_view') == 'viewmap' ) {
									if ( readCookie("status_view")== 'viewmap' ) {	
										map.invalidateSize();									
										$('#map').height(deviceH-defaultMapH);
										//$('.taxibeampsng-calltaxi-btn').text('ดูรายละเอียดรถแท็กซี่');																
										$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
										$('.taxibeampsng-gottaxi-taxino').text( result.data.carplate);
										$('.taxibeampsng-gottaxi-taxiname').text(result.data.fname + ' ' + result.data.lname);								
										$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');
									} else {
										map.invalidateSize();
										$('#map').height(deviceH-defaultMapH);
										$('.menu-box taxibeampsng-form-calltaxi').removeClass('active');										
										$('.taxibeampsng-status-gottaxi').addClass('active');											
										$('.taxibeampsng-status-header').html('<p>แท็กซี่กำลังมารับคุณ</p><span>มีรายละเอียดดังนี้</span>');
										$('.taxibeampsng-status-cropimg img').attr('src', hosttemp+'/image/driver/'+ result.data.imgface );
										$('.taxibeampsng-gottaxi-taxino').text( result.data.carplate);
										$('.taxibeampsng-gottaxi-taxiname').text(result.data.fname + ' ' + result.data.lname);								
										$('.taxibeampsng-gottaxi-taxitel span').html('<i class="icon-icn_phone"></i><a href="tel:'+result.data.phone+'">'+result.data.phone+'</a>');	
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
							$('.taxibeampsng-status-thankyou').addClass('active');									
						break;					

						default:
							//default code block
					}// switch				        	
			     	}  else {
			     		console.log('not success case else ')
			     		console.log(' deviceH = '+deviceH)
			     		console.log(' defaultMapH = '+defaultMapH)
			     		var mapFirstH = deviceH - defaultMapH;
			     		console.log(' mapFirstH = '+mapFirstH)
			     		map.invalidateSize();
			     		$('#map').height(deviceH-defaultMapH);
			     		getDrvarround( curlng, curlat,   1000000,500);
			     	}
			},
            error: function (textStatus, errorThrown) {
                Success = false;//doesnt goes here
                console.log('not success')
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
	    	}, function() {
	      		console.log("Can not get your location, please allow browser to get your location.");
	    	});
	}
}



function addPoiJson(JsonData) {
	//var myIcon = L.icon({iconUrl: 'img/map/taxi_pin.png'});
	var myIcon = L.icon({			 	
	 	iconUrl: '../assets/img/map/start_pin@2x.png',
		iconRetinaUrl: '../assets/img/map/start_pin@2x.png',
		iconSize: [25, 35],
	 	//shadowUrl: 'img/map/leaf-shadow.png'
		iconAnchor: [13, 35]		 	
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



function addPsgPoiJson(JsonData) {
	var myIcon = L.icon({ 	
	 	iconUrl: '../assets/img/map/psg_pin@2x.png',
		iconRetinaUrl: '../assets/img/map/psg_pin@2x.png',
		iconSize: [25, 45],	 	
		iconAnchor: [13, 45]		 	
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
	} else {
		map.setView([JsonData.coordinates[1],JsonData.coordinates[0]],15);		
	}			
	putPsg = new L.marker([JsonData.coordinates[1],JsonData.coordinates[0]], {icon: myIcon, style: myStyle}).bindPopup('<b>พิกัด '+ JsonData.coordinates[1] +' , '+ JsonData.coordinates[0]);			
	map.addLayer(putPsg);	
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



/* -----------------------------------------
		Get Taxi
	   ----------------------------------------- */
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
			data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			     
			success: function(data){
				defaultMapH = 329;
				checkstatuspsg();
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
			data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 			
			success: function(data){
				checkstatuspsg();
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
			data: " { \"device_id\": \""+tempid+"\", \"curlng\": "+curlng+", \"curlat\": "+curlat+" } ", 
			success: function(data){
				checkstatuspsg();
			} 
		});
}


