
  $( "#popup-infoa" ).draggable();
  
  //var socket = io.connect('http://localhost:1115');
  //var socket = io.connect(document.location.hostname+':1115');
  	
  var  tempid = 0;
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

  var animatedMarker;
  var polyline_123;

  var g_puid;  
  var g_tuid;

  var PsgLayer = {};
  var TaxiCurLayer = {};
  var PsgCurLayer = {};
  var vpopupinfo;
  var ecPopup = new EC.Popup();
  var ecPopup_format = 0 ;
  map.setView([15.243196,104.8601933], 14);

  map.on('draw:created', function (e) {
    var type = e.layerType,
    layer = e.layer;
    map.addLayer(layer);
  });




/***********************start initiate pin**********************************/
  $(function(){
    //getPINAllDevices();
    //getPINAllPassengers();    
  });

$(function(){
	/*
socket.on('message', function (data) {
	if(data.message) {
		// messages.push(data.message);
		// var html = '';
		// for(var i=0; i<messages.length; i++) {
		// 	html += messages[i] + '<br />';
		// }
		// content.innerHTML = html;
		alert(data.message)
		console.log("yes:", data);
	} else {
		alert('no data');
		console.log("There is a problem:", data);
	}
	});
	*/
});
//15.243196,104.8601933
	var curlng = 104.8601933 ;
	var curlat = 15.243196;
$(function(){
	//alert(document.location.hostname)


	if(navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(function(position) {				      
//		       curlng =  position.coords.longitude ;
//		       curlat =  position.coords.latitude ;				      
		      getDrvarround( curlng, curlat,   1000000,500);
		      getPsgarround( curlng, curlat,   1000000,500);
		      console.log(0) ;
		    }, function() {
		      console.log("Can not get your location !!");
		      alert('Please turn on your location.');
		    });
		}	

	setInterval(function() { 			
//		if(navigator.geolocation) {
	//	    navigator.geolocation.getCurrentPosition(function(position) {				      
     //   var tempmk = item.uid;

         //     if (item.status == 1||item.status == 3||item.status == 4) {

	//	      var curlng =  position.coords.longitude ;
	//	      var curlat =  position.coords.latitude ;				      
		   getDrvarround( curlng, curlat,   1000000,500);
		  //    getPsgarround( curlng, curlat,   1000000,500);
		      console.log(0) ;

//		}		
	},	500000);


	checkCenter(function(  ){
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
	      addPoiJson(JsonData);
	    }, function() {
	      alert('Can not get your location, please allow browser to get your location.');
	    });
	}			
	//getAllPassenger();	
}



function getDrvarround(curlng, curlat, radian, limits){		

	 $.ajax({
	     type: "POST",
	     contentType: "application/json; charset=utf-8", 	     
	     url : "/service/passengercs/searchDrv",
	      dataType: "json", 
	      data: " { \"curlng\": "+curlng+", \"curlat\": "+curlat+", \"radian\":10000000, \"amount\":500 } ", 			     
	     success: function(data){

	        	addPoiTaxi(data);
	     } 
	 });

}



function getPsgarround(curlng, curlat, radian, limits){		
	 $.ajax({
	     type: "POST",
	     contentType: "application/json; charset=utf-8", 	     
	     url : "/service/ubeam/searchPsg",
	      dataType: "json", 
	      data: " { \"curlng\": "+curlng+", \"curlat\": "+curlat+", \"radian\":10000, \"amount\":500 } ", 			     
	     success: function(data){
	        	//console.log(data);
	        	addPoiAllPsg(data);
	     } 
	 });
}



function addPoiTaxi(JsonData) {
	/*
var myIcon = L.icon({			 	
 	iconUrl: '../assets/img/map/pin-taxi-40.png',
 	//shadowUrl: 'img/map/leaf-shadow.png'
	iconAnchor: [20, 20]			 	
 });	
 	*/
 var myIcon;	 
 var myStyle = {
 	color: '#f00',
 	fillColor: '#ffc4c4',
 	weight: 2,
 	opacity: 0.8,
 	//iconUrl: 'img/map/taxi_pin.png'
 	icon: myIcon
 	
 };	
	//test = JsonData;
	$.each(JsonData.data, function(i, item) {

	var DrvDetail = '<b>ชื่อ</b>: '+item.fname+' '+item.lname+'<br><b>โทรศัพท์</b>: <a href="tel:'+item.phone+'" ><font color="white">'+item.phone+'</font></a><br><b>ทะเบียน</b>: '+item.carplate+'<br><b>สถานะ</b>:'+item.status ;
	//DrvDetail = document.location.hostname+'/image/driver/'+item.imgface+'<br>';
	if( item.imgface != '' ){
	DrvDetail += '<br><img src="http://'+document.location.hostname+'/image/driver/'+item.imgface+'" width="150" ><br>' ;	
	}

         	tempmk = item._id;

                if(map.hasLayer(TaxiCurLayer[tempmk])) {
                  map.removeLayer(TaxiCurLayer[tempmk]);
                }   

	var myIcon = L.icon({			 	
	 	iconUrl: '/assets/img/map/pin-taxi-'+item.status+'.png',
	 	//shadowUrl: 'img/map/leaf-shadow.png'
		iconAnchor: [20, 20],
		labelAnchor:[10,0]		 	
	 });
	var tlabel =  item.carplate ; 
       	TaxiCurLayer[tempmk] = new L.marker([item.curlat,item.curlng], {icon: myIcon, style: myStyle}).bindLabel( tlabel ,{ noHide:true ,direction: 'auto' ,className:'label_taxi_'+item.status } ).bindPopup(DrvDetail) ;
     	map.addLayer( TaxiCurLayer[tempmk] );	
	 //	putMarker = new L.marker([item.curlat,item.curlng], {icon: myIcon, style: myStyle}).bindPopup(DrvDetail) ;
	//	map.addLayer(putMarker);	


	});
}


function addPoiAllPsg(JsonData) {
var myIcon = L.icon({			 	
 	iconUrl: '../assets/img/map/pin-passenger.png',
 	//shadowUrl: 'img/map/leaf-shadow.png'
	iconAnchor: [20, 20]			 	
 });		 
 var myStyle = {
 	color: '#f00',
 	fillColor: '#ffc4c4',
 	weight: 2,
 	opacity: 0.8,
 	icon: myIcon,			
 	iconUrl: 'img/map/pin-passenger.png'
 };	
	test = JsonData;
	$.each(JsonData.data, function(i, item) {
	//console.log(i)
	//console.log(item)
	//console.log(item.curlat +' , '+item.curlng) ;			  
	 	putMarker = new L.marker([item.curlat,item.curlng], {icon: myIcon, style: myStyle}).bindPopup( '<b>อีเมล์</b>: '+item.email+'<br><b>โทรศัพท์</b>: <a href="tel:'+item.phone+'"><font color="white">'+item.phone+'</font></a><br><b>ปลายทาง</b>: '+item.destination+'<br>' ) ;
		map.addLayer(putMarker);			  
	});
}



$(function() {  	
	$("#placenearby").autocomplete({ 
	    source: function (request, response) { 
	        $.ajax({ 
	            type: "POST", 
	            contentType: "application/json; charset=utf-8", 
	            url: "https://locator.ecartmap.com/locator/poi", 
	            dataType: "json", 
	            data: "{'Name':'" + request.term + "'   , 'Language': 'TH'  }", 
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




$(function() {  	
	$("#drivernearby").autocomplete({ 
	    source: function (request, response) { 
	        $.ajax({ 
	            type: "POST", 
	            contentType: "application/json; charset=utf-8", 
	            url: "/service/ubeam/searchnamecar", 
	            dataType: "json", 
	            data: "{  \"keyword\" : \"" + request.term + "\"     }", 
	            success: function (data) { 
	            	console.log(data.data)
	           		response($.map(data.data, function (item) {                			
	            	    return { 
	                	    //label: item.Name + '(' + item.Value + ')',
	                        //label: item.fname+' '+item.lname+' : '+item.carplate,   value: item._id,   latlng: item.curlat+','+item.curlng
	                        label: item.fname+' '+item.lname+' : '+item.carplate ,   value: item.fname+' '+item.lname+' : '+item.carplate,  latlng: item.curlat+','+item.curlng
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
	  		map.setView(setlatlng.split(','),17)
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



  $(function() {
  $('#btn_panel_on').click() ;
    $( "#taxiSplate" ).focus(function() {
      $( "aside[id=subNav]" ).removeClass( "hide" );  
    });

    $( "#psgSphone" ).focus(function() {
      $( "aside[id=subNav]" ).removeClass( "hide" );  
    });        

  });



  function getPINAllDevices() {     
  console.log('getPINAllDevices')
    $.ajax({
        url : "/service/getInitDevices",
        type: "GET",
        success: function(JsonData){
            console.log('success getPINAllDevices')
            console.log(JsonData);

            $.each(JsonData.data, function(i, item) {  
        console.log(item.latitude+','+item.longitude+':'+item.status)
              var myIcon = L.icon({
                iconUrl: '/assets/img/map/pin_'+item.carType+'_'+item.status+'.png',
                  iconSize: [50,50],
                  iconAnchor: [25,25],
                  shadowUrl: null  
              });   

              console.log('/assets/img/map/pin_'+item.carType+'_'+item.status+'.png')
              
        var tempmk = item.uid;

              if (item.status == 1||item.status == 3||item.status == 4) {
                if(map.hasLayer(TaxiCurLayer[tempmk])) {
                  map.removeLayer(TaxiCurLayer[tempmk]);
                }    
                
                vpopupinfo = '<b>License:</b> '+item.carLicense+'<br><b>Type:</b> '+item.carType+'<br><b>พิกัด:</b> '+ item.latitude +' , '+ item.longitude + '<br><b>Altitude:</b> ' + item.altitude + '<br><b>Decibels:</b> ' + item.decibels + '<br><b>Light:</b> ' + item.light + '<br><b>Carspeed:</b> ' + item.carSpeed + '<br><b>Accuracy:</b> ' + item.direction.accuracy;   
                
             //   $("#vpopupinfo").html(vpopupinfo);
                /*
                TaxiCurLayer[tempmk] = new L.marker([item.latitude,item.longitude], {icon: myIcon, angle:item.direction.degree}).whitePopup('License: '+item.carLicense+'<br>Type: '+item.carType+'<br>พิกัด: '+ item.latitude +' , '+ item.longitude + '<br>Altitude: ' + item.altitude + '<br>Decibels: ' + item.decibels + '<br>Light: ' + item.light + '<br>Carspeed: ' + item.carSpeed + '<br>Accuracy: ' + item.direction.accuracy);
        */
                  TaxiCurLayer[tempmk] = new L.marker([item.latitude,item.longitude], {icon: myIcon, angle:item.direction.degree});
          
        
        TaxiCurLayer[tempmk].on("click", function (e) {
             var id2 = tempmk ;      
            ecPopup_format++ ;
            if ( ecPopup_format > 9 ) { ecPopup_format = 0 ;}
             if(!ecPopup.hasPopup(id2)) {
               ecPopup.addPopup(
                 {
                 id: id2,
                 title: id2 ,
                 content: vpopupinfo ,
                 },
                 {
                   width: 200,
                   height:230,
                   focus: ecPopup_format,
                   flatlng:[item.latitude,item.longitude]                   
                 }
               );
             }
          });   
            
        
          console.log( ' TaxiCurLayer ' ) ;
        
                map.addLayer(TaxiCurLayer[tempmk]);
        
              } else {
                if(map.hasLayer(TaxiCurLayer[tempmk])) {
                  map.removeLayer(TaxiCurLayer[tempmk]);
                }
              } 

            });
        }
    });      
  } 



  function getPINAllPassengers() {   
  console.log('getPINAllPassenger')
    $.ajax({
        url : "/service/getInitPassengers",
        type: "GET",
        success: function(JsonData){
            console.log('success getPINAllPassenger')
            console.log(JsonData);
             //addPoiJson(data.geoJson);
            console.log('hey!!!!!! Pin Psg-location... ');    

            $.each(JsonData.data, function(i, item) {              
              
              var PsgmyIcon = L.icon({
                iconUrl: '/assets/img/map/pin-passenger'+item.status+'.png',
                  iconSize: [50,50],
                  iconAnchor: [25,25],
                  shadowUrl: null
              });  

              var tempmk = item.uid;

              if (item.status == 1||item.status == 3||item.status == 4) {
                if(map.hasLayer(PsgCurLayer[tempmk])) {
                  map.removeLayer(PsgCurLayer[tempmk]);
                }         
                PsgCurLayer[tempmk] = new L.marker([item.latitude,item.longitude], {icon: PsgmyIcon}).whitePopup('ID: '+item.uid+'<br>Phone: '+item.phoneNumber+'<br>Address: '+item.address+'<br>Location: '+ item.latitude +' , '+ item.longitude + '<br>Tips : ' + item.tips +'<br>Altitude: ' + item.altitude +'<br>Accelerometer: ' + item.accelerometer + '<br>Decibels: ' + item.decibels + '<br>Light: ' + item.light + '<br>Destination: ' + item.destination.name + '<br>Distance: '+ item.distance + '<br>Action : '+ item.action +'<br>Status: ' + item.status );
                map.addLayer(PsgCurLayer[tempmk]);
              } else {
                if(map.hasLayer(PsgCurLayer[tempmk])) {
                  map.removeLayer(PsgCurLayer[tempmk]);
                }
              }             

            });
  
        }
    });      
  }



/***********************end initiate pin**********************************/



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
                        } //return
                        ) //(data
                  )   //$.map
                } 
            }); 
        }, 
        minLength: 2, 
        select: function (event, ui) {          
          var setlatlng = ui.item.latlng; 
          //alert(setlatlng);
          //map.setView([.split','],15);
          map.setView(setlatlng.split(','),13)
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
  
  

  $(function() {    
    $("#psgSphone").autocomplete({ 
        source: function (request, response) { 
        var data = {
          phoneNumber : $('#psgSphone').val(),
        };        
        //var dataphone = { phoneNumber: '0843112347' } 
            $.ajax({ 
                type: "POST", 
                //contentType: "application/json; charset=utf-8", 
                url: "/service/getPsgbyPhone", 
                dataType: "json",                 
                //data: "{'phoneNumber':'" + request.term + "' }", 
                data: data,
                success: function (data) {                    
                  response($.map(data.data, function (item) {                     
                      return {
                            label: item.phoneNumber, value: item.phoneNumber, uid: item.uid
                            } 
                        } //return
                        ) //(data
                  )   //$.map
                } 
            });
        }, 
        minLength: 2, 
        select: function (event, ui) {
          g_puid = ui.item.uid;          
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
  
  
  
  $(function() {    
    $("#psgsSname").autocomplete({ 
        source: function (request, response) { 
        var data = {
          name : $('#psgsSname').val(),
        };                
            $.ajax({ 
                type: "POST",                 
                url: "/service/getPsgbyName", 
                dataType: "json",                                 
                data: data,
                success: function (data) {                    
                  response($.map(data.data, function (item) {                     
                      return {
                            label: item.name, value: item.name, uid: item.uid
                            } 
                        } //return
                        ) //(data
                  )   //$.map
                } 
            });
        }, 
        minLength: 2, 
        select: function (event, ui) {
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
  
  
  

  $(function() {    
    $("#taxiSplate").autocomplete({ 
        source: function (request, response) { 
        var data = {
          carLicense : $('#taxiSplate').val(),
        };                
            $.ajax({ 
                type: "POST",                 
                url: "/service/getDvbyPlate", 
                dataType: "json",                                 
                data: data,
                success: function (data) {                    
                  response($.map(data.data, function (item) {                   
                      return {
                            label: item.carLicense, value: item.carLicense, uid: item.uid                        
                            } 
                        } //return
                        ) //(data
                  )   //$.map
                } 
            });
        }, 
        minLength: 2, 
        select: function (event, ui) {
          g_tuid = ui.item.uid;
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
  
  
  
  $(function() {    
    $("#taxiSphone").autocomplete({ 
        source: function (request, response) { 
        var data = {
          phoneNumber : $('#taxiSphone').val(),
        };                
            $.ajax({ 
                type: "POST",                 
                url: "/service/getDvbyPhone", 
                dataType: "json",                                 
                data: data,
                success: function (data) {                    
                  response($.map(data.data, function (item) {                     
                      return {
                            label: item.phoneNumber, value: item.phoneNumber, uid: item.uid
                            } 
                        } //return
                        ) //(data
                  )   //$.map
                } 
            });
        }, 
        minLength: 2, 
        select: function (event, ui) {
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
  

  
  // Get Search List
  function getPSearchList_node(){
    var data = {
      psgSphone : $('#psgSphone').val(),
      psgsSname : $('#psgsSname').val(),      
      DPstart: $('#DPstart').val(),
      DPend: $('#DPend').val(),
    };

    $.ajax({
        url : "/service/getPSearchList",
        type: "POST",
        data: data,
        success: function(data){
            //console.log(data)
        }
    }); 
  }



  function getPSearchList(){
    /*
    var data = {      
      taxiSplate1: g_tuid ,//$('#taxiSplate').val(),
      taxiSphone: $('#taxiSphone').val(),
      DTstart: $('#DTstart').val(),
      DTend: $('#DTend').val(),
    };
    */
    ////
    var DPstart =  new Date($('#DPstart').val());  
    var stD = DPstart.toISOString();
    var DPend = new Date($('#DPend').val());  
    var enD = DPend.toISOString();
    $.ajax({
        /*   ----> Strong loop is working!!! ---*/
        url:"http://192.168.23.23:3000/api/pathlogs?access_token=12910310"+
            "&filter[fields][latitude]=true"+
            "&filter[fields][longitude]=true"+
            "&filter[fields][timeStamp]=true"+
            "&filter[fields][uid]=true"+
            "&filter[where][latitude][gt]0"+
            "&filter[where][uid]="+g_puid+                
            "&filter[where][and][0][timeStamp][gte]="+stD+
            "&filter[where][and][1][timeStamp][lte]="+enD+
            "&filter[limit]=100",
        //url:"/service/getPSearchList",
        type: "GET",        
        success: function(data){
            
        if(map.hasLayer(animatedMarker)) {
          map.removeLayer(animatedMarker);
        }
        if(map.hasLayer(polyline_123)) {
          map.removeLayer(polyline_123);
        }
        var json = data;
        var arr = []; 

        for(var i = 0; i < json.length; i++) {  
          arr.push([parseFloat(json[i].latitude),parseFloat(json[i].longitude)])
        };
        //console.log(arr[0]);
        map.setView(arr[0],13);
        polyline_123 = L.polyline(arr); // create polyline
        polyline_123.addTo(map);
        //console.log(arr);
        var line = L.polyline(arr);
        var myIcon = L.icon({
          iconUrl: '../assets/img/y-taxi-ico.png',
            iconSize: [25, 39],
            iconAnchor: [12, 39],
            shadowUrl: null         
          //iconUrl: 'img/marker-icon.png'          
        });       
        animatedMarker = L.animatedMarker(line.getLatLngs(), {
          icon: myIcon,
            //distance: 300,  // meters
            //interval: 2000, // milliseconds
            onEnd: function() {
              // TODO: blow up this marker
            }           
        });
        map.addLayer(animatedMarker);
        }
    }); 
  }



  // https://developers.google.com/maps/documentation/javascript/reference#Marker > Google Maps Javascript API V3 Reference
  // Get Search List
  function getTSearchList(){
    
    var data = {      
      taxiSplate: g_tuid ,//$('#taxiSplate').val(),
      taxiSphone: $('#taxiSphone').val(),
      DTstart: $('#DTstart').val(),
      DTend: $('#DTend').val(),
    };
    
    /* --- Use for Strongloop
    var DTstart =  new Date($('#DTstart').val());  
    var stD = DTstart.toISOString();
    var DTend = new Date($('#DTend').val()); 
    var enD = DTend.toISOString();
    */
    $.ajax({
        url:"/service/getTSearchList",
        type: "POST",
        data: data, 

        success: function(data){

        if(map.hasLayer(animatedMarker)) {
          map.removeLayer(animatedMarker);
        }
        if(map.hasLayer(polyline_123)) {
          map.removeLayer(polyline_123);
        }
        var json = data.data;
        var arr = []; 
        //console.log(json);
        //console.log(json.data);
        for(var i = 0; i < json.length; i++) {  
          arr.push([parseFloat(json[i].latitude),parseFloat(json[i].longitude)])
        };
        
        map.setView(arr[0],13);
        polyline_123 = L.polyline(arr); // create polyline
        polyline_123.addTo(map);
        //console.log(arr);
        var line = L.polyline(arr);
        var myIcon = L.icon({
          iconUrl: '../assets/img/y-taxi-ico.png',
            iconSize: [25, 39],
            iconAnchor: [12, 39],
            shadowUrl: null         
          //iconUrl: 'img/marker-icon.png'          
        });       
        animatedMarker = L.animatedMarker(line.getLatLngs(), {
          icon: myIcon,
            //distance: 300,  // meters
            //interval: 2000, // milliseconds
            onEnd: function() {
              // TODO: blow up this marker
            }           
        });

        map.addLayer(animatedMarker);
        }
    }); 
  }



  function getTSearchList_node(){
    var data = {      
      taxiSplate: g_tuid ,//$('#taxiSplate').val(),
      taxiSphone: $('#taxiSphone').val(),
      DTstart: $('#DTstart').val(),
      DTend: $('#DTend').val(),
    };

    $.ajax({
        url : "/service/getTSearchList",
        type: "POST",
        data: data,
        //url : "http://localhost:3000/api/pathlogs?filter[fields][latitude]=true&filter[fields][longitude]=true&filter[where][latitude][gt]0",
        //type: "GET",        
        success: function(data){
            console.log(data)           
            //console.log('anchor')
           if(map.hasLayer(animatedMarker)) {
              map.removeLayer(animatedMarker);
           }
        if(map.hasLayer(polyline_123)) {
          map.removeLayer(polyline_123);
        }
        var json = data;
        var arr = [];       
        for(var i = 0; i < json.data.length; i++) {         
          arr.push([parseFloat(json.data[i].latitude),parseFloat(json.data[i].longitude)])
        };
        //console.log(arr[0]);
        map.setView(arr[0],13);
        polyline_123 = L.polyline(arr); // create polyline
        polyline_123.addTo(map);
        //console.log(arr);
        var line = L.polyline(arr);
        var myIcon = L.icon({
          iconUrl: '../assets/img/y-taxi-ico.png',
            iconSize: [25, 39],
            iconAnchor: [12, 39],
            shadowUrl: null         
          //iconUrl: 'img/marker-icon.png'          
        });       
        animatedMarker = L.animatedMarker(line.getLatLngs(), {
          icon: myIcon,
            //distance: 300,  // meters
            //interval: 2000, // milliseconds
            onEnd: function() {
              // TODO: blow up this marker
            }           
        });
        map.addLayer(animatedMarker);
        }
    }); 
  }



  $(function() {
    $( "#DPstart" ).datepicker({});
    $( "#DPend" ).datepicker({});
  });



  $(function() {
    $( "#DTstart" ).datepicker({
      //dateFormat: 'dd-mm-yy' 
    });
    $( "#DTend" ).datepicker({});
  });


/*
  $(function() {
    socket.on('SendEachTaxiLocation',function(data){      
    console.log(data);
    data = decodeURIComponent(escape(data));    
    //var myIcon = L.icon({iconUrl: '/assets/img/map/taxi_pin.png'});
 
      console.log('hey!!!!!! โชว์taxi-location... ');     
      var Jsondata = JSON.parse(data);
      console.log(Jsondata.uid);
      console.log('Tx: ' + Jsondata.status);

      var myIcon = L.icon({
        iconUrl: '/assets/img/map/pin_'+Jsondata.carType+'_'+Jsondata.status+'.png',
          iconSize: [50,50],
          iconAnchor: [25,25],
          shadowUrl: null
      });  

      var tempmk = Jsondata.uid;

      if (Jsondata.status == 1||Jsondata.status == 3||Jsondata.status == 4) {
        if(map.hasLayer(TaxiCurLayer[tempmk])) {
          map.removeLayer(TaxiCurLayer[tempmk]);
        }    
        
        vpopupinfo = '<b>License:</b> '+Jsondata.carLicense+'<br><b>Type:</b> '+Jsondata.carType+'<br><b>พิกัด:</b> '+ Jsondata.latitude +' , '+ Jsondata.longitude + '<br><b>Altitude:</b> ' + Jsondata.altitude + '<br><b>Decibels:</b> ' + Jsondata.decibels + '<br><b>Light:</b> ' + Jsondata.light + '<br><b>Carspeed:</b> ' + Jsondata.carSpeed + '<br><b>Accuracy:</b> ' + Jsondata.direction.accuracy;   
        
//        $("#vpopupinfo").html(vpopupinfo);
    var latlng = [Jsondata.latitude,Jsondata.longitude ] ;
    ecPopup.setPopupContent( tempmk , vpopupinfo,latlng);   
    
    
//TaxiCurLayer[tempmk] = new L.marker([Jsondata.latitude,Jsondata.longitude], {icon: myIcon, angle:Jsondata.direction.degree}).whitePopup('License: '+Jsondata.carLicense+'<br>Type: '+Jsondata.carType+'<br>พิกัด: '+ Jsondata.latitude +' , '+ Jsondata.longitude + '<br>Altitude: ' + Jsondata.altitude + '<br>Decibels: ' + Jsondata.decibels + '<br>Light: ' + Jsondata.light + '<br>Carspeed: ' + Jsondata.carSpeed + '<br>Accuracy: ' + Jsondata.direction.accuracy);
 
     TaxiCurLayer[tempmk] = new L.marker([Jsondata.latitude,Jsondata.longitude], {icon: myIcon, angle:Jsondata.direction.degree});
   var taxi_cont = 'License: '+Jsondata.carLicense+'<br>Type: '+Jsondata.carType+'<br>พิกัด: '+ Jsondata.latitude +' , '+ Jsondata.longitude + '<br>Altitude: ' + Jsondata.altitude + '<br>Decibels: ' + Jsondata.decibels + '<br>Light: ' + Jsondata.light + '<br>Carspeed: ' + Jsondata.carSpeed + '<br>Accuracy: ' + Jsondata.direction.accuracy ;
   
    TaxiCurLayer[tempmk].on("click", function (e) {
         var id2 = tempmk ;      
                ecPopup_format++ ;
        if ( ecPopup_format > 9 ) { ecPopup_format = 0 ;}
         if(!ecPopup.hasPopup(id2)) {
           ecPopup.addPopup(
             {
             id: id2,
             title: id2 ,
             content: taxi_cont ,
             },
             {
               width: 200,
               height:230,
               focus: ecPopup_format,
               flatlng:[Jsondata.latitude,Jsondata.longitude]                   
             }
           );
         }
      });
     
     console.log( ' asasasa ' ) ;
        map.addLayer(TaxiCurLayer[tempmk]);
      } else {
        if(map.hasLayer(TaxiCurLayer[tempmk])) {
          map.removeLayer(TaxiCurLayer[tempmk]);
        }
      }   
    }); 
*/

/*
    socket.on('Getjwj000',function(data){     
      data = decodeURIComponent(escape(data));    
      $("#jwj000").val(data)
    }); 
*/

/*
    socket.on('SendEachPsgLocation',function(data){          
    data = decodeURIComponent(escape(data));    
    //var myIcon = L.icon({iconUrl: '/assets/img/map/taxi_pin.png'}); 
      //console.log('hey!!!!!! โชว์ Psg-location... ');     
      var Jsondata = JSON.parse(data);
     // console.log(Jsondata.uid);
     // console.log('psg: ' + Jsondata.status);
      var tempmk = Jsondata.uid;
      var PsgmyIcon = L.icon({
        iconUrl: '/assets/img/map/pin-passenger'+Jsondata.status+'.png',
          iconSize: [50,50],
          iconAnchor: [25,25],
          shadowUrl: null
      });  
      if (Jsondata.status == 1||Jsondata.status == 3||Jsondata.status == 4) {
        if(map.hasLayer(PsgCurLayer[tempmk])) {
          map.removeLayer(PsgCurLayer[tempmk]);
        }      
   
        //PsgCurLayer[tempmk] = new L.marker([Jsondata.latitude,Jsondata.longitude], {icon: PsgmyIcon}).whitePopup('ID: '+Jsondata.uid+'<br>Phone: '+Jsondata.phoneNumber+'<br>Address: '+Jsondata.address+'<br>Location: '+ Jsondata.latitude +' , '+ Jsondata.longitude + '<br>Tips : ' + Jsondata.tips +'<br>Altitude: ' + Jsondata.altitude +'<br>Accelerometer: ' + Jsondata.accelerometer + '<br>Decibels: ' + Jsondata.decibels + '<br>Light: ' + Jsondata.light + '<br>Destination: ' + Jsondata.destination.name + '<br>Distance: '+ Jsondata.distance + '<br>Action : '+ Jsondata.action +'<br>Status: ' + Jsondata.status );
  
        PsgCurLayer[tempmk] = new L.marker([Jsondata.latitude,Jsondata.longitude], {icon: PsgmyIcon});
    
    var Psg_cont= 'ID: '+Jsondata.uid+'<br>Phone: '+Jsondata.phoneNumber+'<br>Address: '+Jsondata.address+'<br>Location: '+ Jsondata.latitude +' , '+ Jsondata.longitude + '<br>Tips : ' + Jsondata.tips +'<br>Altitude: ' + Jsondata.altitude +'<br>Accelerometer: ' + Jsondata.accelerometer + '<br>Decibels: ' + Jsondata.decibels + '<br>Light: ' + Jsondata.light + '<br>Destination: ' + Jsondata.destination.name + '<br>Distance: '+ Jsondata.distance + '<br>Action : '+ Jsondata.action +'<br>Status: ' + Jsondata.status ; 
    
    PsgCurLayer[tempmk].on("click", function (e) {
             var id2 = tempmk ;      
            ecPopup_format++ ;
            if ( ecPopup_format > 9 ) { ecPopup_format = 0 ;}
             if(!ecPopup.hasPopup(id2)) {
               ecPopup.addPopup(
                 {
                 id: id2,
                 title: id2 ,
                 content: Psg_cont ,
                 },
                 {
                   width: 200,
                   height:230,
                   focus: ecPopup_format,
                   flatlng:[Jsondata.latitude,Jsondata.longitude]                   
                 }
               );
             }
          });   
    
    
    
        map.addLayer(PsgCurLayer[tempmk]);
      } else {
        if(map.hasLayer(PsgCurLayer[tempmk])) {
          map.removeLayer(PsgCurLayer[tempmk]);
        }
      }   
    }); 

  });
*/



function checkGPS(callback){    
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			//console.log('lat =>'+position.coords.latitude+' || lon =>'+position.coords.longitude);
			JsonData = { "type": "Point", "coordinates": [position.coords.longitude, position.coords.latitude] }
			if( jsonPoiList != 0 ){ map.removeLayer(jsonPoiList); }
			addPoiJsongps(JsonData);
			callback();
			}, function() {
			console.log("Can not get your location !!");
		});
	}
}



function addPoiJsongps(JsonData) {  
	var myIcon = L.icon({iconUrl: 'http://leafletjs.com/dist/images/marker-icon.png'});     
	var myStyle = {
		color: '#f00',
		fillColor: '#ffc4c4',
		weight: 2,
		opacity: 0.8,
		icon: myIcon,     
		iconUrl: 'img/map/taxi_pin.png'
	};
	jsonPoiList = L.geoJson(JsonData, {
		style: myStyle
	});
	map.addLayer(jsonPoiList); 
	map.fitBounds(jsonPoiList.getBounds());
	map.setZoom(15);
}



function addPoi(JsonData) {
	//console.log('add poi');    
	var myIcon = L.icon({iconUrl: 'http://leafletjs.com/dist/images/marker-icon.png'});  
	var myStyle = {
		color: '#f00',
		fillColor: '#ffc4c4',
		weight: 2,
		opacity: 0.8,
		icon: myIcon,     
		iconUrl: 'img/map/taxi_pin.png'
	};

	$.each(JsonData.data, function(i, item) {
		//   console.log(item.lat +' , '+item.lng) ;       
		putMarker = new L.marker([item.lat,item.lng], {icon: myIcon, style: myStyle});
		map.addLayer(putMarker);        
	});

}



/* -----------------------------------------
Get passenger list (all)
----------------------------------------- */
function getAllPassenger () {
	// console.log('getAllPassenger');   
	// $.ajax({
	//     url : "/service/getPassenger/all",
	//     type: "GET",
	//     success: function(data){
	//          console.log(data);
	//          addPoiJson(data.geoJson);
	//     }
	// });
	socket.emit('get all passenger',{msg:'request get all passenger'});
	socket.on('show all passenger',function(data){
	//alert('her its html show all passenger !!');
	//   console.log(data);
	addPoi(data);
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
            console.log(data)
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
            console.log(data)
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
			console.log(data)
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
			console.log(data)
		}
	});
}




/* -----------------------------------------
Get Taxi
----------------------------------------- */
function getallTaxiListInterval(){      
	getallTaxiList();   
	setInterval(function() {      
		getallTaxiList();       
	},  40000);
}



function getallTaxiList_socket() {    
	//socket.emit('get all device',{msg:'request get all device'});
	socket.on(' show all device',function(data){      
		console.log(data);
		addPoiJson(data);
	});
}


function getallTaxiList() {
	/*
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
	*/    
	$.ajax({
		url : "/service/getDeviceSocket/all",
		type: "GET",        
		success: function(data){              
			if(map.hasLayer(putTaxi)) {
				map.removeLayer(putTaxi);
			}
			addPoiJson(data);
		}
	});
}



function addPoiJson(JsonData) {
	// console.log(putTaxi);
	var myIcon = L.icon({      
		//shadowUrl: 'img/map/leaf-shadow.png',
		iconUrl: 'img/map/taxi_pin.png',
		//iconSize: [25, 39],
		//iconAnchor: [12, 39],
		shadowUrl: null       
	});
	var myStyle = {
		color: '#f00',
		fillColor: '#ffc4c4',
		weight: 2,
		opacity: 0.8,
		icon: myIcon,     
		iconUrl: 'img/map/taxi_pin.png'
	}; 

	//console.log(map.hasLayer(putTaxi))

	if(map.hasLayer(putTaxi)) {
		map.removeLayer(putTaxi);
	}       

	$.each(JsonData.data, function(i, item) {
		console.log(item.latitude +' , '+item.longitude) ;        
		putTaxi = new L.marker([item.latitude,item.longitude], {icon: myIcon, style: myStyle, angle:item.direction.degree}).whitePopup("<b>"+item.name+"</b><br />Plate:"+item.carLicense+'<br>พิกัด'+ item.latitude +','+ item.longitude );
		map.addLayer(putTaxi);  
	});
}



function getallPsgListInterval(){ 
	getallPsgList();    
	setInterval(function() {      
		getallPsgList();
	}, 10000);
}



function getallPsgList() {
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
			if(map.hasLayer(putPsg)) {
				map.removeLayer(putPsg);
			}
			addPoiJsonPsg(data);
		}
	});
}



function addPoiJsonPsg(JsonData) {
	//console.log(putPsg);
	var myIcon = L.icon({       
		iconUrl: 'img/map/pin-passenger.png',
		shadowUrl: 'img/map/leaf-shadow.png'
	});
	var myStyle = {
		color: '#f00',
		fillColor: '#ffc4c4',
		weight: 2,
		opacity: 0.8,
		icon: myIcon,     
		iconUrl: 'img/map/pin-passenger.png'
	};   
	// console.log(map.hasLayer(putTaxi))             
	$.each(JsonData.data, function(i, item) {
		console.log(item.lat +' , '+item.lng) ; 
		putPsg = new L.marker([item.lat,item.lng], {icon: myIcon, style: myStyle}).whitePopup("<b>"+item.name+"</b><br />Plate:"+item.phoneNumber+'<br>พิกัด'+ item.lat +','+ item.lng );
		map.addLayer(putPsg); 
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



function PinStart(){
	var myIcon = L.icon({
		iconUrl: '../img/map/pin-passenger.png',
		// iconRetinaUrl: 'my-icon@2x.png',
		// iconSize: [38, 95],
		iconAnchor: [25, 25],
		// popupAnchor: [-3, -76],
		// shadowUrl: 'my-icon-shadow.png',
		// shadowRetinaUrl: 'my-icon-shadow@2x.png',
		// shadowSize: [68, 95],
		// shadowAnchor: [22, 94]
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
				if (OSEPolyline!=undefined) {               
					map.removeLayer(OSEPolyline);
					OSEPolyline = L.polyline(polyDecode).addTo(map);
				} else {
					OSEPolyline = L.polyline(polyDecode).addTo(map);
				}
				//console.log(data);
				$("#idirection").show();
			}
		});

	});     
}



function PinDestination(){
	//http://proxy.hmap-dev.ecartmap.com/getDirection.php?url=https%3A//maps.googleapis.com/maps/api/directions/json%3Forigin%3D13.76339577962447%2C100.3546142578125%26destination%3D13.92073799964004%2C100.55511474609375%26waypoints%3Doptimize%3Atrue%26mode%3Ddriving%26language%3DTH%26sensor%3Dfalse%26key%3DZNViRo_sRGCtsSc3BeC280Rlprg%3D%26client%3Dgme-ecartstudiocompany&dummy=0.5774756167083979%20200%20OK%201417ms
	var myIcon = L.icon({
		iconUrl: '../img/map/pin-destination.png',
		// iconRetinaUrl: 'my-icon@2x.png',
		// iconSize: [38, 95],
		iconAnchor: [25, 25],
		// popupAnchor: [-3, -76],
		// shadowUrl: 'my-icon-shadow.png',
		// shadowRetinaUrl: 'my-icon-shadow@2x.png',
		// shadowSize: [68, 95],
		// shadowAnchor: [22, 94]
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



  function LbisLocatorClear(){
	map.removeLayer(markerS); 
	map.removeLayer(markerD); 
	map.removeLayer(OSEPolyline);
	$('#FromDir').text('');
	$('#ToDir').text('');
	$('#DistanceDir').text('');
	$('#TimeDir').text('');         
	//map.removeLayer(putTaxi);
  }


  
  function LbisLocatorClose(){
	map.removeLayer(markerS); 
	map.removeLayer(markerD); 
	map.removeLayer(OSEPolyline);
	$('#FromDir').text('');
	$('#ToDir').text('');
	$('#DistanceDir').text('');
	$('#TimeDir').text('');         
	$("#idirection").hide();
  }


/*
  socket.on('ShowPsgLocation', function (data) {          
	//console.log(data);
	addPoiPsg(data);
  });

  socket.on('testsocketb1115', function (data) {          
	console.log(data);
	//addPoiPsg(data);
  });
*/

function addPoiPsg(JsonData) {
	//console.log('add poi');    
	var myIcon = L.icon({iconUrl: '/assets/img/map/pin-passenger.png'});
	var myStyle = {
		color: '#f00',
		fillColor: '#ffc4c4',
		weight: 2,
		opacity: 0.8,
		icon: myIcon,     
		iconUrl: 'img/map/pin-passenger.png'
	};
	console.log('hey!!!!!! น้องไอยรา ... ');
	//console.log(JsonData.tempid);
	console.log(JsonData.tempid);
	var tempmk = JsonData.tempid;

	if(map.hasLayer(PsgLayer[tempmk])) {
		map.removeLayer(PsgLayer[tempmk]);
	}

	PsgLayer[tempmk] = new L.marker([JsonData.coordinates[1],JsonData.coordinates[0]], {icon: myIcon, style: myStyle}).whitePopup('<b>พิกัด '+ JsonData.coordinates[1] +' , '+ JsonData.coordinates[0]);
	//console.log(PsgLayer[tempmk])
	map.addLayer(PsgLayer[tempmk]); 
	//map.fitBounds(jsonPoiList.getBounds());
	//map.setView([JsonData.coordinates[1],JsonData.coordinates[0]],15);          
	/*
	$.each(JsonData, function(i,item) {
	console.log(item);
	//console.log(item.coordinates);
	//console.log(item.lat +' , '+item.lng) ;       
	putMarker = new L.marker([item.lat,item.lng], {icon: myIcon, style: myStyle});
	map.addLayer(putMarker);        
	});
	*/
	/*
	for (temp in JsonData) {
	console.log(JsonData[temp])
	console.log(temp)
	}
	*/
}