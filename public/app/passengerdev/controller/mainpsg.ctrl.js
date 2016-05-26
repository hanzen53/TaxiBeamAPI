var app = angular.module("PassengersApp", []);
var TaxiCurLayer = {};
var PsgCurLayer = {};


/*
app.controller("MyCatCtrl", function($scope, $http) {    
    $scope.postes = [];        
    //$scope.pulltaxi();
    console.log('z is z') 
    $scope.colors  = function (status) {
        //console.log(status)
        $http.get('/service/getBikeWin').
            success(function(data) {
            consoloe.log('a is a')     
            $scope.postes = data.data;
        }
        else {
            console.log('b is b')
        }).
        error(function(data, status, headers, config) {
          // log error
        });
    }

});
*/




app.controller("PostsCtrl", function($scope, $http) {
    $scope.title = ''; 
    $scope.postes = [];    
    $scope.title = 'Devices'; 
    //$scope.pulltaxi();

    $scope.pulltaxi = function (status) {
        //console.log(status)

            $http.get('/service/getDeviceOnOff/all?status='+status).
            success(function(data) {          
            $scope.postes = data.data;
        }).
        error(function(data, status, headers, config) {
          // log error
        });

    }

    $scope.pullbackTxPlate = function (data) {
        g_tuid = data.uid;
        $('#taxiSplate').val(data.carLicense);
        var myIcon = L.icon({
        iconUrl: '/assets/img/map/pin_'+data.carType+'_'+data.status+'.png',
          iconSize: [50,50],
          iconAnchor: [25,25],
          shadowUrl: null  
        }); 

        var tempmk = g_tuid;
        
        if(map.hasLayer(TaxiCurLayer[tempmk])) {
          
          map.removeLayer(TaxiCurLayer[tempmk]);
          
        } else {   
        
        TaxiCurLayer[tempmk] = new L.marker([data.latitude,data.longitude], {icon: myIcon, angle:data.direction.degree}).whitePopup('License: '+data.carLicense+'<br>Type: '+data.carType+'<br>พิกัด: '+ data.latitude +' , '+ data.longitude + '<br>Altitude: ' + data.altitude + '<br>Decibels: ' + data.decibels + '<br>Light: ' + data.light + '<br>Carspeed: ' + data.carSpeed + '<br>Accuracy: ' + data.direction.accuracy);
        map.setView([data.latitude,data.longitude],15);
        map.addLayer(TaxiCurLayer[tempmk]);        
        }

    }
});




// app.controller("PostsCtrlPsg", function($scope, $http) {
//     $scope.title = ''; 
//     $scope.postes = [];    
//     $scope.title = 'Passengers'; 
//     //$scope.pulltaxi();

//     $scope.pullPsg = function (status) {
//         //console.log(status)

//             $http.get('/service/getPassengerOnOff/all?status='+status).
//             success(function(data) {          
//             $scope.postes = data.data;
//         }).
//         error(function(data, status, headers, config) {
//           // log error
//         });

//     }

//     $scope.pullbackPsg = function (data) {
//         var tempmk = data.uid;
//         $('#psgSphone').val(data.phoneNumber);
//         var myIcon = L.icon({
//         iconUrl: '/assets/img/map/pin-passenger'+data.status+'.png',
//           iconSize: [50,50],
//           iconAnchor: [25,25],
//           shadowUrl: null  
//         }); 

//         if(map.hasLayer(PsgCurLayer[tempmk])) {
//           map.removeLayer(PsgCurLayer[tempmk]);
//         } else {        
//         PsgCurLayer[tempmk] = new L.marker([data.latitude,data.longitude], {icon: PsgmyIcon}).whitePopup('ID: '+data.uid+'<br>Phone: '+data.phoneNumber+'<br>Address: '+data.address+'<br>Location: '+ data.latitude +' , '+ data.longitude + '<br>Tips : ' + data.tips +'<br>Altitude: ' + data.altitude +'<br>Accelerometer: ' + data.accelerometer + '<br>Decibels: ' + data.decibels + '<br>Light: ' + data.light + '<br>Destination: ' + data.destination.name + '<br>Distance: '+ data.distance + '<br>Action : '+ data.action +'<br>Status: ' + data.status );
//         map.setView([data.latitude,data.longitude],15);
//         map.addLayer(PsgCurLayer[tempmk]);                  
//         }     


//     }
// });
