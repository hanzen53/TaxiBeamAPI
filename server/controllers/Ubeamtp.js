////////////////////////////////////
// Taxi-Beam Ubeam API Callcenter
// version : 1.0.1
// Date revision: May 10, 2016 
// Created by Hanzen@BRET
////////////////////////////////////
var config = require('../../config/func').production ;
var bcrypt   = require('bcrypt-nodejs') ;
var Url = require('url') ;
var mongoose = require('mongoose') ;
var DeviceModel = mongoose.model('DeviceModel') ;
var PassengerModel = mongoose.model('PassengerModel') ;
var CallcenterpsgModel  = mongoose.model('CallcenterpsgModel') ;
var CallcenterannounceModel = mongoose.model('CallcenterannounceModel') ;
var UserModel = mongoose.model('UserModel') ;
var PoirecommendedModel = mongoose.model('PoirecommendedModel');
var PathLogModel = mongoose.model('PathLogModel') ;
var DriversModel = mongoose.model('DriversModel') ;
var CommentModel = mongoose.model('CommentModel') ;
var AnnounceModel = mongoose.model('AnnounceModel') ;
var EmgListModel = mongoose.model('EmgListModel') ;
var LocalpoiModel = mongoose.model('LocalpoiModel') ;
var ErrorcodeModel  =  mongoose.model('ErrorcodeModel') ;
var ParkinglotModel = mongoose.model('ParkinglotModel') ;
var ParkingqueueModel = mongoose.model('ParkingqueueModel') ;
var PsgcalllogModel  = mongoose.model('PsgcalllogModel');
var JoblistModel = mongoose.model('JoblistModel');
var Lk_garageModel = mongoose.model('Lk_garageModel') ;

// for upload file
var path = require('path') ;
var formidable = require('formidable') ;
var util = require('util') ;
var fs = require('fs-extra') ;
var qt = require('quickthumb') ;
var http = require('http') ;
var ios = require('socket.io') ;
var qs = require('querystring') ;

var MoneyPerUse = config.MoneyPerUse;
var TimePerUse = config.TimePerUse ;
var MoneyPerUseAPP= config.MoneyPerUseAPP ;
var TimePerUseAPP= config.TimePerUseAPP ;

var TimePerDay = 86400000 ;
var TimePerHour = 3600000 ;




exports.ubeamSearchPassenger = function(req, res) {
var radian = req.body.radian        ;
var amount = req.body.amount    ;   
var curlng = req.body.curlng        ;
var curlat = req.body.curlat        ;
var curloc = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
//console.log(curloc)
    if (typeof curlng == 'undefined' && curlng == null) {       
        res.json({ status: false, msg: "current longitude is not valid" })
        return; 
    }
    if (typeof curlat == 'undefined' && curlat == null) {       
        res.json({ status: false, msg: "current latitude is not valid" })
        return;
    }   
    if (typeof radian == 'undefined' && radian == null) {
        radian =  config.ccsearchradian ;
    }   
    if (typeof amount == 'undefined' && amount == null) {
        amount = config.ccsearchamount ;
    }

    CallcenterpsgModel.find(
        {                       
            //curloc : { $near : curloc, $maxDistance: radian },   => for 2d index => not working
            // do not forget  => db.passengers.createIndex( { curloc : "2dsphere" } )
            curloc:  { 
                $near: {
                    $geometry: {
                        type: "Point" ,
                        coordinates: curloc
                    } , 
                    $maxDistance: radian 
                    //$minDistance: 1 
                }
            } ,
            status : "ON"
        },
        { _id:1, createdjob:1, phone:1, createdvia:1, curaddr:1, curlat:1, curlng:1, curloc:1, destination:1, tips:1, detail:1, job_id:1, jobtype:1 },
        {limit : amount},
        function(err,psglist){
            // Donot forget to create 2d Index for drivers collection : curloc!!!!  - > not working  user 2d sphere instead
            if(psglist == 0){
                res.json({                                      
                    status: false,
                    msg: "No data"
                });                                 
            } else {
                res.json({
                    //msg: "This is passenger list", 
                    status: true,                                       
                    data: psglist
                });
                //Specifies a point for which a geospatial query returns the documents from nearest to farthest.
            }
        }
    );
};



exports.getpoirecommended = function (req,res){
// reference : http://docs.mongodb.org/manual/reference/sql-comparison/
var keyword = req.body.keyword      ;

    PoirecommendedModel.find(      
        //{ fname :  new RegExp( '^'+ keyword+'^' )   },
        { "parkingname" :  new RegExp( keyword ), "cgroup" : req.user.local.cgroup },        
        { _id:1, parkingname:1, curloc:1, parkinglot:1, parkingtype:1},
        { sort: { 'parkinglot': 1, 'parkingname' : 1  } },     
        function(err, response) {
            if (response == 0) {                    
                res.json({                  
                    status: false ,
                    msg: 'No data'              
                });
                } else {
                res.json({ 
                    status: true,               
                    data: response
                });
            }
        }
    );
};


            
exports.getpoirecommendedgroup = function (req, res){ 
    // example: http://stackoverflow.com/questions/22932364/mongodb-group-values-by-multiple-fields
    // plus : http://www.mkyong.com/mongodb/mongodb-aggregate-and-group-example/
    myquery = { $match: 
        {
            "cgroup" : req.user.local.cgroup
        }        
    };    

   PoirecommendedModel.aggregate([
        myquery ,
        { "$group": 
            {
                "_id": {
                    "parkingtype": "$parkingtype",
                    "parkingname": "$parkingname",
                    "parkinglot": "$parkinglot",
                    "curloc": "$curloc"
                },
                "parkingCount": { "$sum": 1 },
            }
        },
        { "$group": {
            "_id": "$_id.parkingtype",
            "parkinglist": { 
                "$push": { 
                    "parkingname": "$_id.parkingname",
                    "parkinglot": "$_id.parkinglot",
                    "curloc": "$_id.curloc",
                    //"parkingCount": "$parkingCount"
                },
            },
            "parkingCount": { "$sum": "$parkingCount" }
        }},
        { "$sort": { "parkingCount": -1 } }
    ], function (err, result) {
       if(err) {
           res.json({ status: false , data: err  });      
       } else {
            res.json({ 
                status: true,                
                data: result
            });    
        }
    });

};




exports.getpoirecommendedgrouplot = function (req,res){
    // example : http://stackoverflow.com/questions/16772156/nested-grouping-with-mongodb
    // plus : http://www.mkyong.com/mongodb/mongodb-aggregate-and-group-example/
   PoirecommendedModel.aggregate([
        { $match: 
            {
                "cgroup" : req.user.local.cgroup
            }        
        },
        { "$group": 
            {
                "_id": {
                    "parkingtype": "$parkingtype",                    
                    "parkinglot": "$parkinglot"              
                },
                "parkingname": { "$addToSet": "$parkingname" } 
            }
        },
        { "$group": {
            "_id": "$_id.parkingtype",
            "parkinglist" : {
                "$addToSet": { "parkinglot": "$_id.parkinglot", "parkingname": "$parkingname"
                }
            }
        }}
    ], function (err, result) {
       if(err) {
           res.json({ status: false , data: err  });      
       } else {
            res.json({ 
                status: true,                
                data: result
            });    
        }
    });
};

    // Example : http://stackoverflow.com/questions/22932364/mongodb-group-values-by-multiple-fields
    // db.books.aggregate([
    //     { "$group": {
    //         "_id": {
    //             "addr": "$addr",
    //             "book": "$book"
    //         },
    //         "bookCount": { "$sum": 1 }
    //     }},
    //     { "$group": {
    //         "_id": "$_id.addr",
    //         "books": { 
    //             "$push": { 
    //                 "book": "$_id.book",
    //                 "count": "$bookCount"
    //             },
    //         },
    //         "count": { "$sum": "$bookCount" }
    //     }},
    //     { "$sort": { "count": -1 } },
    //     { "$limit": 2 }
    // ])
    // or /////////////////
    // db.books.aggregate([
    //     { "$group": {
    //         "_id": {
    //             "addr": "$addr",
    //             "book": "$book"
    //         },
    //         "bookCount": { "$sum": 1 }
    //     }},
    //     { "$group": {
    //         "_id": "$_id.addr",
    //         "books": { 
    //             "$push": { 
    //                 "book": "$_id.book",
    //                 "count": "$bookCount"
    //             },
    //         },
    //         "count": { "$sum": "$bookCount" }
    //     }},
    //     { "$sort": { "count": -1 } },
    //     { "$limit": 2 },
    //     { "$project": {
    //         "books": { "$slice": [ "$books", 2 ] },
    //         "count": 1
    //     }}
    // ])  


exports.searchnamecar = function(req, res) { 
// reference : http://docs.mongodb.org/manual/reference/sql-comparison/
var keyword = req.body.keyword      ;
    DriversModel.find(      
        //{ fname :  new RegExp( '^'+ keyword+'^' )   },
        { $or: [ { fname :  new RegExp( keyword ) }, { lname :  new RegExp( keyword ) }, { carplate :  new RegExp( keyword ) }  ,   { car_no :  new RegExp( keyword ) }  ], status: "ON"  },        
        { _id:1, device_id:1, fname:1, lname:1, phone:1, taxiID:1, carplate:1, cartype:1, curlng:1, curlat:1, curloc:1, car_no:1, status:1 },
        function(err, response) {
            if (response == 0) {                    
                res.json({                  
                    status: false ,
                    msg: 'No data'              
                });
                } else {
                res.json({ 
                    status: true,               
                    data: response
                });
            }
        }
    );
};




exports.senddrvmsg = function(req, res) { 
var drvid = req.body.drvid          ;
var msgphone = req.body.todrvphone  ;
var msgnote = req.body.todrvtext        ;

    DriversModel.findOne(
        { _id : drvid },
        { status:1, updated:1 },
        function(err, drv) {
                if(drv == null) {               
                _driverAutoLogin(req,res);
                } else {                        
                if(req.body.todrvphone) { drv.msgphone= req.body.todrvphone ? req.body.todrvphone : drv.msgphone; }
                if(req.body.todrvtext)   { drv.msgnote  = req.body.todrvtext ? req.body.todrvtext : drv.msgnote; }
                drv.msgstatus   = "NEW";
                drv.updated = new Date().getTime();
                drv.save(function(err, response) {
                    if(err) {
                        res.json({ 
                            status: false , 
                            msg: "" ,
                            data: err
                        });
                    } else {
                        res.json({ 
                            //msg: "success, your broken report has benn sent." 
                            status: true ,                          
                            data: { status: response.status }
                        });
                    }
                });
                }   
        }
    );
};




exports.addjoblist = function (socket) {
    return function (req, res) {
        var results = [];
        var username = req.user.local.username ;
        var iscontractjob = req.body.isContractJob ;
        var provincearea = req.body.provincearea ;
        var curaddr = req.body.curaddr;
        var destination = req.body.destination;
        var phone = req.body.phone;
        var detail = req.body.detail;
        var curlng = req.body.curlng;
        var curlat = req.body.curlat;
        var amount = req.body.amount;
        var ccstation = req.body.ccstation;        
        var jobtype = req.body.jobtype; // { "QUEUE","ADVANCE" }
        var createdjob = req.body.createdjob;   //  TIMESTAMP (millisec)
        var cgroup = req.user.local.cgroup;
        // generate unique id  
        var jobid;


        if (amount) {
            amount = amount;
        } else {
            amount = 0;
        }

        if (createdjob) {
            createdjob = new Date(parseInt(createdjob));
        } else {
            createdjob = new Date().getTime();
        }

        if (typeof curlng == 'undefined' && typeof curlat == 'undefined') {
            var curloc = [];
        } else {
            var curloc = [parseFloat(req.body.curlng), parseFloat(req.body.curlat)];
        }
        if (typeof curlng == 'undefined' && curlng == null) {
            curlng = "";
        }
        if (typeof curlat == 'undefined' && curlat == null) {
            curlat = "";
        }
        var deslng = req.body.deslng;
        var deslat = req.body.deslat;
        if (typeof deslng == 'undefined' && typeof deslat == 'undefined') {
            var desloc = [];
        } else {
            var desloc = [parseFloat(req.body.deslng), parseFloat(req.body.deslat)];
        }
        if (typeof deslng == 'undefined' && deslng == null) {
            deslng = "";
        }
        if (typeof deslat == 'undefined' && deslat == null) {
            deslat = "";
        }

        //var results = [];             
        for (i = 0; i < amount; i++) {
            //console.log(' i = '+i)     
            InsertPsgLoop(i, cgroup, iscontractjob, provincearea, curaddr, destination, phone, detail, curlng, curlat, curloc, deslat, deslng, desloc, amount, jobtype, createdjob, ccstation, username );
        }
        res.json({
            status: true,
            msg: "Add job completed",
            data: {
                "jobtype": jobtype
            }
        })

        function InsertPsgLoop(i, cgroup,  iscontractjob, provincearea, curaddr, destination, phone, detail, curlng, curlat, curloc, deslat, deslng, desloc, amount, jobtype, createdjob, ccstation, createdby) {
            jobid = new Date().valueOf() + '-' + i;
            var d = {
                device_id: jobid,
                cgroup: cgroup, 
                iscontractjob: iscontractjob,
                email: jobid + "@temp.com",
                phone: phone,
                provincearea : provincearea ,
                curaddr: curaddr,
                curlng: curlng,
                curlat: curlat,
                curloc: curloc,
                destination: destination,
                deslng: deslng,
                deslat: deslat,
                desloc: desloc,
                detail: detail,
                jobtype: jobtype,
                status: "INITIATE",
                createdvia: "CALLCENTER",
                ccstation: ccstation ,
                createdby: username ,
                updated: new Date().getTime(),
                createdjob: createdjob,
                created: new Date().getTime(),

                jobhistory : [{ 
                    action : "add job list" ,
                    status : "INITIATE" ,                    
                    actionby : username ,
                    created : new Date() 
                }]

            }
            
            CallcenterpsgModel.create(d, function (err, response) {
                if (err) {
                    console.log(err)
                } else {
                    socket.of('/'+req.user.local.cgroup).emit('addjoblist', response);
                }
            }
        );
        }
    };
};




exports.editjoblist = function (socket) {
    return function (req, res) {
        var username = req.user.local.username ;
        var psg_id = req.body.psg_id;
        var curaddr = req.body.curaddr;
        var destination = req.body.destination;
        var phone = req.body.phone;
        var detail = req.body.detail;
        var curlng = req.body.curlng;
        var curlat = req.body.curlat;
        var jobtype = req.body.jobtype; // { "QUEUE","ADVANCE" }
        var createdjob = req.body.createdjob;   //  TIMESTAMP (millisec)
        var drv_carplate = req.body.drv_carplate;
        var cccomment = req.body.cccomment;

        var checklinejob                                        ;           

        if (typeof drv_carplate == 'undefined' && drv_carplate == null) {       
            drv_carplate = "";
            checklinejob = "";
        } else {
            drv_carplate = drv_carplate.trim();
            checklinejob = drv_carplate.substring(drv_carplate.length-1, drv_carplate.length)   ;            
            // clear_drv_carplate = drv_carplate.substring(0, drv_carplate.length-1)   ;
            // clear_drv_carplate = drv_carplate.replace("+", "");
        }

        if (createdjob) {
            createdjob = new Date(parseInt(createdjob));
        } else {
            createdjob = new Date().getTime();
        }

        if (typeof curlng == 'undefined' && typeof curlat == 'undefined') {
            var curloc = [];
        } else {
            var curloc = [parseFloat(req.body.curlng), parseFloat(req.body.curlat)];
        }
        if (typeof curlng == 'undefined' && curlng == null) {
            curlng = "";
        }
        if (typeof curlat == 'undefined' && curlat == null) {
            curlat = "";
        }
        var deslng = req.body.deslng;
        var deslat = req.body.deslat;
        if (typeof deslng == 'undefined' && typeof deslat == 'undefined') {
            var desloc = [];
        } else {
            var desloc = [parseFloat(req.body.deslng), parseFloat(req.body.deslat)];
        }
        if (typeof deslng == 'undefined' && deslng == null) {
            deslng = "";
        }
        if (typeof deslat == 'undefined' && deslat == null) {
            deslat = "";
        }

        CallcenterpsgModel.findOne(
            { _id: psg_id },
            function (err, psg) {
                if (psg == null) {
                    res.json({ status: false, msg: "No psg_id", data: err });
                } else {

                    psg.jobhistory.push({ 
                        action : "CC editjob" ,
                        psg_id : psg_id ,
                        curaddr : curaddr ,
                        destination : destination ,
                        phone : phone ,
                        detail : detail ,
                        jobtype : jobtype , // { "QUEUE","ADVANCE" }
                        createdjob : createdjob ,   //  TIMESTAMP (millisec)
                        drv_carplate : drv_carplate  ,
                        cccomment : cccomment ,
                        actionby : username ,
                        created : new Date() 
                    }); 

                    if (req.body.phone) { psg.phone = req.body.phone ? req.body.phone : psg.phone; }
                    if (req.body.curaddr) { psg.curaddr = req.body.curaddr ? req.body.curaddr : psg.curaddr; }                    
                    if (req.body.curlng) { psg.curlng = req.body.curlng ? req.body.curlng : psg.curlng; }
                    if (req.body.curlat) { psg.curlat = req.body.curlat ? req.body.curlat : psg.curlat; }
                    if (curloc) { psg.curloc = curloc ? curloc : psg.curloc; }
                    if (req.body.destination) { psg.destination = req.body.destination ? req.body.destination : psg.destination; }
                    if (req.body.deslng) { psg.deslng = req.body.deslng ? req.body.deslng : psg.deslng; }
                    if (req.body.deslat) { psg.deslat = req.body.deslat ? req.body.deslat : psg.deslat; }
                    if (desloc) { psg.desloc = desloc ? desloc : psg.desloc; }
                    if (req.body.detail) { psg.detail = req.body.detail ? req.body.detail : psg.detail; }
                    if (req.body.jobtype) { psg.jobtype = req.body.jobtype ? req.body.jobtype : psg.jobtype; }                    
                    if (req.body.createdjob) { psg.createdjob = createdjob ? createdjob : psg.createdjob; }
                    if (req.body.drv_carplate) { psg.drv_carplate = drv_carplate ? drv_carplate : psg.drv_carplate; }
                    if (req.body.cccomment!==undefined) { psg.cccomment = req.body.cccomment ; }                    
                    if (req.body.cccomment!==undefined) { psg.cccommentby = username }
                    if (checklinejob=='+'){                        
                        psg.status = "DPENDING_LINE" ;
                        psg.createdvia = "LINE" ;                        
                    }
                    psg.editingby = username;
                    psg.updated = new Date().getTime();
                    psg.save(function (err, response) {
                        if (err) {
                            res.json({ status: false, msg: "error", data: err });
                        } else {
                            var data = {
                                "psg_id": response._id,
                                "cgroup": response.cgroup,
                                "curaddr": response.curaddr,
                                "destination": response.destination,
                                "phone": response.phone,
                                "detail": response.detail,
                                "status": response.status,
                                "updated": response.updated,
                                "curlng": response.curlng,
                                "curlat": response.curlat,
                                "curloc": response.curloc,
                                "deslng": response.deslng,
                                "deslat": response.deslat,
                                "desloc": response.desloc,
                                "jobtype": response.jobtype,
                                "createdjob": response.createdjob,
                                "createdvia": response.createdvia,
                                "ccstation": response.ccstation,
                                "drv_carplate": response.drv_carplate,
                                "cccomment": response.cccomment
                            };
                            socket.of('/'+req.user.local.cgroup).emit('editjoblist', data);
                            res.json({
                                status: true,
                                data: data
                            });
                        }
                    });
                }
            }
        );
    };
};




exports.getinitiatelist = function (req, res) {
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js 
    //console.log ( ' cgroup = ' + req.user.local.cgroup )
    var currentdatetime = new Date().getTime(); 
    CallcenterpsgModel.find(        
        { status:"INITIATE" ,  "createdjob": { $lt: new Date(currentdatetime+10800000) } , cgroup : req.user.local.cgroup  },
        { _id: 1, status: 1, phone: 1, curaddr: 1, curlng:1, curlat:1, curloc:1, destination: 1, deslng:1, deslat:1, desloc:1, detail:1, createdjob:1, drv_id: 1, jobtype:1, createdvia:1, ccstation:1, cgroup:1, cccomment:1 },
        { sort: { 'createdjob' : 1 } },         
        function(err,psglist){      
            if(psglist == 0) {              
                res.json({                              
                    status: false                       
                });             
            } else {                
                res.json({                              
                    status: true,                   
                    data: psglist                       
                });
            }
        }
    );
}




exports.getadvancelist = function (req, res) {
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
    var currentdatetime = new Date().getTime(); 
    CallcenterpsgModel.find(        
        { status:"INITIATE" , jobtype: "ADVANCE",  "createdjob": { $gt: new Date(currentdatetime+11100000) } , cgroup : req.user.local.cgroup  },
        { _id: 1, status: 1, phone: 1, curaddr: 1, curlng:1, curlat:1, curloc:1, destination: 1, deslng:1, deslat:1, desloc:1, createdjob:1, drv_id: 1, jobtype:1, detail:1, createdvia:1, ccstation:1, cgroup:1, cccomment:1 },
        { sort: { 'createdjob' : 1 } },         
        function(err,psglist){      
            if(psglist == 0) {              
                res.json({                              
                    status: false                       
                });             
            } else {                
                res.json({                              
                    status: true,
                    data: psglist                       
                });
            }
        }
    );
}




exports.getdpendinglist = function (req, res) {
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
    var currentdatetime = new Date().getTime(); 
    CallcenterpsgModel.find(        
        { status: { $in : ["DPENDING","DEPENDING_REJECT","DPENDING_LINE"] } , cgroup : req.user.local.cgroup },
        { _id: 1, status: 1, phone: 1, curaddr: 1, curlng:1, curlat:1, curloc:1, destination: 1, deslng:1, deslat:1, desloc:1, createdjob:1, drv_id: 1, jobtype:1, detail:1, createdvia:1, drv_carplate:1, ccstation:1, cgroup:1, cccomment:1 },
        { sort: { 'createdjob' : 1 } },         
        function(err,psglist){      
            if(psglist == 0) {              
                res.json({                              
                    status: false                       
                });             
            } else {                    
                res.json({                              
                    status: true,
                    data: psglist                       
                });
            }
        }
    );
}




exports.getreassignjobdetail = function(req,res) {
var psg_id = req.body.psg_id; 
    CallcenterpsgModel.findOne (
        { _id: psg_id },
        { _id:1, phone:1, curaddr:1, destination:1, curloc:1, desloc:1, detail:1, status:1, jobtype:1, createdjob:1, drv_id:1, drv_carplate:1, createdvia:1, ccstation:1, cccomment:1 },
        function(err,psgdata){
            if(!err)    {               
                DriversModel.findOne(                   
                    { _id: psgdata.drv_id }, 
                    { _id: 1, fname:1, lname:1, carplate:1, curloc:1, status: 1,  jobtype:1, imgface:1, psg_id: 1, imgface:1, phone:1 },                    
                    function(err, drvdata){                         
                            if (!err){                                  
                            res.json({ 
                                status: true,
                                drv_register: true,
                                psg_data : psgdata,                         
                                drv_data: drvdata                   
                            });                         
                            } else {
                            //res.json({ status: false, msg: "No data for this driver", err: err}) 
                            res.json({ 
                                status: true,
                                msg: "No driver's data in our system.", 
                                drv_register: false,
                                psg_data : psgdata
                            });                         
                            }
                        }
                )
            } else {
                res.json({ status: false, msg: "No data for this passenger", err: err})
            }
        }
    )   

}



    
exports.deletejob = function (socket) {
    return function (req, res) {
        var psg_id  = req.body.psg_id;
        CallcenterpsgModel.findOne(
            { _id : psg_id }, 
            { status:1, updated:1, jobtype:1, cgroup:1 , jobhistory:1},
            function(err, psg) {
                if(psg==null) {
                    res.json({ status: false , msg: "No passenger found for this id" });
                } else {
                    var old_status = psg.status;                    
                    psg.updated = new Date().getTime();
                    psg.deletejobby = req.user.local.username ;
                    psg.datedeletejob =  new Date().getTime();
                    psg.status = "DELETED";     
                    psg.jobhistory.push({ 
                        action : "CC delete job" ,
                        actionby : req.user.local.username ,
                        created : new Date() 
                    });                                                             
                    psg.save(function(err, response) {
                        if(err) {
                            res.json({ status: false , msg: "error", data: err  });
                        } else {
                            socket.of('/'+req.user.local.cgroup).emit('deletejob', {
                                _id: response._id,
                                status: old_status,
                                jobtype: response.jobtype,
                                cgroup: response.cgroup
                            });
                            res.json({                                                          
                                status: true ,                                                          
                                data: { 
                                    psg_id: psg_id,                             
                                    status: response.status
                                }
                            });
                        }
                    });
                }
            }
        );
    }
}




exports.checkdrvstatus = function(req, res){
var carplate    = req.body.carplate ;
var drv_id  = req.body.drv_id   ;
    DriversModel.findOne(       
        { carplate : carplate }, //new RegExp( carplate ) },
        { _id:1, device_id:1, fname:1, lname:1, phone:1, taxiID:1, carplate:1, imgface:1, curlng:1, curlat:1, curloc:1, status:1 },
        //{ carplate : carplate },
        function(err,drv) {
            if(drv==null){
                 res.json({ 
                    status: false ,     
                    msg: "No carplate was found"
                });
            } else if (typeof drv_id == 'undefined' && drv_id == null) {
                 res.json({ 
                    status: true ,  
                    msg: "Matched carplate but  drv_id is null",
                    data : drv
                });
            } else if( drv_id == "" ) {
                 res.json({ 
                    status: true ,  
                    msg: "Matched carplate but didnot give drv_id",
                    data : drv 
                });             
            } else if (drv._id!=drv_id) {
                 res.json({ 
                    status: true ,
                    msg: "Matched carplate but did not match drv_id",
                    data : drv                  
                });
            }else if (drv.status!="ON") {
                 res.json({ 
                    status: true ,
                    msg: "Status is not ON, this car is unavailable",
                    data : drv                  
                });             
            } else {
                 res.json({ 
                    status: true ,
                    msg: "Status is ON, this car is available",
                    data : drv
                }); 
            }
        }
    )
}




exports.assigndrvtopsg = function (socket) {
    return function (req, res) {
        var psg_id = req.body.psg_id                            ;
        var drv_id = req.body.drv_id                        ;
        var lineconfirm = req.body.lineconfirm          ;
        var drv_carplate = req.body.drv_carplate    ;
        var username = req.user.local.username           ;
        var checklinejob                                        ;   

        if (typeof drv_carplate == 'undefined' && drv_carplate == null) {       
            drv_carplate = "";
            checklinejob = "";
        } else {
            drv_carplate = drv_carplate.trim();
            checklinejob = drv_carplate.substring(drv_carplate.length-1, drv_carplate.length)   ;
            clear_drv_carplate = drv_carplate.substring(0, drv_carplate.length-1)   ;
            clear_drv_carplate = clear_drv_carplate.replace("+", "");
        }        
        CallcenterpsgModel.findOne(
            { _id : psg_id }, 
            { _id:1, cgroup:1, phone:1, curaddr:1, destination:1, curloc:1, desloc:1, detail:1, status:1, jobtype:1, createdjob:1, drv_id:1, update:1, drv_carplate:1, createdvia:1, assigningby:1, ccstation:1, dpendingjob:1, cccomment:1 },
            function(err,response) {                
                if(response==null) { 
                    res.json({ status: false , msg:  "No passenger found for this id", data:err });         
                } else if (response.status  == "ASSIGNED" ) {
                    res.json({ status: false , msg: "This passenger has been assigned.", data: err  });
                } else {        
                    DriversModel.findOne(
                        {  _id: drv_id , status: "ON" }, 
                        { _id: 1, fname:1, lname:1, carplate:1, curloc:1, status: 1,  jobtype:1, imgface:1, psg_id: 1},
                        function(err, drv) {
                            if(drv==null) {
                                //res.json({ status: false , msg:  "No driver found for this id", data:err });                          
                                CallcenterpsgModel.findOne(
                                    { _id : psg_id }, 
                                    { _id:1, cgroup:1, phone:1, curaddr:1, destination:1, curloc:1, desloc:1, detail:1, status:1, jobtype:1, createdjob:1, drv_id:1, update:1, drv_carplate:1, createdvia:1, assigningby:1, ccstation:1, dpendingjob:1, cccomment:1 , jobhistory:1},
                                    function(err, psg) {
                                        if(psg==null) {
                                            res.json({ status: false , msg: "No passenger found for this id" });
                                        } else {                                             
                                            psg.drv_carplate = drv_carplate;
                                            psg.drv_id = "";
                                            psg.dpendingjob = new Date().getTime();
                                            psg.dassignedjob = new Date().getTime();
                                            psg.updated = new Date().getTime();                                            
                                            if (checklinejob=='+'){
                                                if(lineconfirm=='Y'){
                                                    psg.status = "ASSIGNED";
                                                    psg.assignlineby = username;
                                                    psg.drv_carplate = clear_drv_carplate ;
                                                    psg.createdvia = "LINE";

                                                    psg.jobhistory.push({ 
                                                        action : "Line confirmed" ,
                                                        status : "ASSIGNED" ,
                                                        drv_carplate : clear_drv_carplate ,
                                                        actionby : username ,
                                                        created : new Date() 
                                                    }); 
                                                } else {                                                    
                                                    psg.assigningby = username ;
                                                    psg.status = "DPENDING_LINE";
                                                    psg.createdvia = "LINE";  

                                                    psg.jobhistory.push({ 
                                                        action : "Line inserted" ,
                                                        status : "DPENDING_LINE" ,
                                                        drv_carplate : drv_carplate ,
                                                        actionby : username ,
                                                        created : new Date() 
                                                    }); 
                                                }
                                            } else {                                                
                                                psg.assigningby = username ;
                                                psg.status = "ASSIGNED";    
                                                psg.createdvia = "CALLCENTER";
                                                psg.jobhistory.push({ 
                                                    action : "CC assigned" ,
                                                    status : "ASSIGNED" ,
                                                    drv_carplate : drv_carplate ,
                                                    actionby : username ,
                                                    created : new Date() 
                                                }); 

                                            }
                                            psg.save(function(err, result) {
                                                if(err) {
                                                    res.json({ status: false , msg: "error", data: err  });
                                                } else {
                                                    socket.of('/'+req.user.local.cgroup).emit("assigndrvtopsg", psg);
                                                    res.json({                                                          
                                                        status: true ,                                                          
                                                        psg_data: psg 
                                                    });
                                                }
                                            });
                                        }
                                    }
                                );
                            } else {
                                drv.psg_detail = response.detail ;
                                drv.psg_destination = response.destination ;
                                drv.psg_curaddr = response.curaddr ;
                                drv.psg_id = psg_id;
                                drv.msgnote = "จาก : "+response.curaddr+"\n\nที่หมาย : "+ response.destination+"\n\n"+response.phone;
                                drv.msgphone = response.phone ;
                                drv.msgstatus = "NEW";
                                drv.status = "DPENDING";
                                drv.jobtype = response.jobtype;
                                drv.updated = new Date().getTime();
                                //drv.status = "OFF";
                                drv.save(function(err, response) {
                                    if(err) {
                                        res.json({ status: false , msg: "error", data: err });
                                    } else {
                                        CallcenterpsgModel.findOne(
                                            { _id : psg_id }, 
                                            { _id:1, cgroup:1, phone:1, curaddr:1, destination:1, curloc:1, desloc:1, detail:1, status:1, jobtype:1, createdjob:1, drv_id:1, update:1, drv_carplate:1, createdvia:1, assigningby:1, ccstation:1, dpendingjob:1, cccomment:1, jobhistory:1 },
                                            function(err, psg) {
                                                if(psg==null) {
                                                    res.json({ status: false , msg: "No passenger found for this id" });
                                                } else {                    

                                                    psg.jobhistory.push({ 
                                                        action : "CC dpending" ,
                                                        status : "DPENDING" ,
                                                        drv_id : drv_id ,
                                                        drv_carplate : drv.carplate ,
                                                        actionby : username ,
                                                        created : new Date() 
                                                    }); 

                                                    psg.drv_id = drv_id;
                                                    psg.drv_carplate = drv.carplate;
                                                    psg.updated = new Date().getTime();
                                                    psg.status = "DPENDING";                                                    
                                                    psg.assigningby = username ;
                                                    psg.dpendingjob = new Date().getTime();                                                    
                                                    psg.save(function(err, result) {
                                                        if(err) {
                                                            res.json({ status: false , msg: "error", data: err  });
                                                        } else {
                                                            socket.emit("DriverSocketOn", drv);
                                                            socket.of('/'+req.user.local.cgroup).emit("assigndrvtopsg", psg);
                                                            res.json({                                                          
                                                                status: true ,                                                          
                                                                psg_data: psg ,
                                                                drv_data: drv 
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    }
                                });
                            }
                        }
                    );
                }
            }
        );
    };
};




exports.getassignlist = function (req, res) {
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
    //db.getCollection('passengers').find({"status":"INITIATE" , "createdjob": { $gt : new Date(10800000) } }, { _id:1, device_id:1,curaddr: 1, destination:1, phone:1 , createdjob:1 })
    var currentdatetime = new Date().getTime();
    CallcenterpsgModel.find(                        
        { status:"ASSIGNED", cgroup : req.user.local.cgroup },      
        { _id: 1, status: 1, phone: 1, curaddr: 1, destination: 1, updated: 1, createdjob:1, created: 1, jobtype:1, drv_id: 1, drv_carplate:1, createdvia:1, dassignedjob:1 ,dpendingjob:1, ccstation:1, assigningby:1, cgroup:1, cccomment:1 },
        { sort: { 'createdjob' : -1 } },            
        function(err,psglist){      
            if(psglist == 0) {
                res.json({                              
                    status: false                       
                });             
            } else {                                
                res.json({                              
                    status: true,
                    data: psglist                       
                });
            }
        }
    );
}




exports.getsendjoblist = function (req, res) {
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
     CallcenterpsgModel.find(   
        { status: { $in: [ "INITIATE" ] } , cgroup : req.user.local.cgroup  } ,
        { _id: 1, status: 1, phone: 1, curaddr: 1, curlng:1, curlat:1, curloc:1, destination: 1, deslng:1, deslat:1, desloc:1, createdjob:1,  jobtype:1, drv_id:1, createdvia:1, dassignedjob:1 ,dpendingjob:1, ccstation:1, assigningby:1, cgroup:1, cccomment:1 },
        { sort: { 'createdjob' : 1 } }, 
        function(err,psglist){      
            if(psglist == 0) {              
                res.json({                              
                    status: false                       
                });             
            } else {                
                res.json({                              
                    status: true,
                    data: psglist                       
                });
            }
        }
     );
}     
/*
    CallcenterpsgModel.find(
        { status: { $in: [ "INITIATE","TIMEOUT" ] } },
        // ['created'],
        { _id: 1, status: 1, phone: 1, curaddr: 1, destination: 1, updated: 1, createdjob:1, created:1, drv_id: 1 },
        {sort:{'created':1}},
        function(err,psglist){      
            if(psglist == 0) {              
                res.setHeader('Content-Type', 'application/json;charset=utf-8');
                res.setHeader('Access-Control-Allow-Origin', '*');
                    res.send(JSON.stringify({                   
                    status: false,
                }));                
            } else {                
                res.json({                              
                    status: true,
                    data: psglist                       
                });
            }
        }
    ); 
*/




exports.getpsgsphonelist = function (req, res) {
// sql compare: https://docs.mongodb.org/manual/reference/sql-comparison/
var phone = req.body.phone      ;   
    CallcenterpsgModel.find(        
        { phone :  new RegExp( phone ), cgroup : req.user.local.cgroup },     
        { _id: 1, phone: 1 },
        //{sort: '-created'},
        function(err,psglist){      
            if(psglist == 0) {
                res.json({                              
                    status: false                       
                });             
            } else {                
                res.json({                              
                    status: true,
                    data: psglist                       
                });
            }
        }
    );
}




exports.getpsgstatuslist = function (req, res) {
var status  = req.body.status               ;
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
    CallcenterpsgModel.find(        
        { status: status, cgroup : req.user.local.cgroup },     
        { _id: 1, status: 1, phone: 1, curaddr: 1, destination: 1, updated: 1, drv_id: 1, created: 1, createdvia: 1, ccstation:1, assigningby:1, cgroup:1, cccomment:1 },
        //{sort: '-created'},
        function(err,psglist){      
            if(psglist == 0) {
                res.json({                              
                    status: false                       
                });     
            } else {    
                res.json({                              
                    status: true,
                    data: psglist                       
                });
            }
        }
    );
}




exports.getPassengerDetail = function(req,res) {
//console.log('getPassengerDetail')
var psg_id = req.body.psg_id; 
var drv_id = '' ; 
//console.log ( ' psg_id = '+ psg_id)
    CallcenterpsgModel.findOne (
        { _id: psg_id },
        { _id:1, phone:1, curaddr:1, destination:1, curloc:1, desloc:1, detail:1, status:1, jobtype:1, createdjob:1, drv_id:1, drv_carplate:1, createdvia:1, ccstation:1, assigningby:1, cgroup:1, dpendingjob:1, cccomment:1, provincearea:1 },
        function(err,psgdata){
            if(!err)    {   
                try {
                    //console.log( ' con 1 ')
                    //console.log( ' psgdata.drv_id = '+ psgdata.drv_id)
                    if (psgdata.drv_id) {
                        drv_id = psgdata.drv_id;
                    } 
                }
                catch(err) {
                    //console.log( ' con 2 ')
                    drv_id = '';
                }  
                    //console.log( 'drv_id = ' + drv_id  )
                    DriversModel.findOne(                   
                        { _id: drv_id }, 
                        { _id: 1, fname:1, lname:1, carplate:1, curloc:1, status: 1,  jobtype:1, imgface:1, psg_id: 1, imgface:1 },                 
                        function(err, drvdata){                         
                            if (!err){                                  
                                res.json({ 
                                    status: true,
                                    drv_register: true,
                                    psg_data : psgdata,                         
                                    drv_data: drvdata                   
                                });                         
                            } else {
                                //res.json({ status: false, msg: "No data for this driver", err: err}) 
                                res.json({ 
                                    status: true,
                                    msg: "No driver's data in our system.", 
                                    drv_register: false,
                                    psg_data : psgdata
                                });                         
                            }
                            }
                    )

                
            } else {
                res.json({ status: false, msg: "No data for this passenger", err: err})
            }
        }
    )   

}




exports.checkinitiatepsg = function (req, res) {
var psg_id      = req.body.psg_id       ;
    CallcenterpsgModel.findOne(
        { _id : psg_id , cgroup : req.user.local.cgroup }, 
        function(err, psg) {
            if (psg == null) { 
                res.json({                              
                    status: false,
                    msg: "no passengers"                            
                });
                }  else {
                    if (psg.status == 'INITIATE') {
                    res.json({                              
                        status: true,
                        msg: "available"                        
                    });
                    } else {
                    res.json({                              
                        status: false,
                        msg: "n/a"                          
                    });
                    }
                }
        }
    );
}




exports.checkavailabledrv = function (req, res) {
var drv_id = req.body.drv_id            ;
    DriversModel.findOne(
        { _id : drv_id },
        { status:1, updated:1 },
        function(err, drv) {
                if(drv == null) {               
                res.json({                              
                    status: false,
                    msg: "no drivers"                           
                });
                } else {     
                    if (drv.status == 'ON') {
                    res.json({                              
                        status: true,
                        msg: "available"                        
                    });
                    } else {
                    res.json({                              
                        status: false,
                        msg: "n/a"                          
                    });
                    }
                }   
        }
    );
}




exports.matchpsgdrv = function(req, res) {
/*
var _id = req.body._id          ;
var psg_id = req.body.psg_id        ;

    CallcenterpsgModel.findOne(
        { _id : psg_id, status: "INITIATE" },
        { status: 1 },
        function(err,pass) {                
            if(pass==null) {
                res.json({                              
                    status: false,
                    msg: "A passenger is not available."                            
                });             
            } else {        
                DriversModel.findOne(
                    {  _id: drv_id, status: "ON"}, 
                    { status:1, updated:1 },
                    function(err, drv) {
                        if(drv==null) {
                            res.json({                              
                                status: false,
                                msg: "drv n/a"                          
                            });
                        } else {                        
                            drv.psg_id = psg_id;
                            drv.msgnote = "กรุณาไปรับผู้โดยสารจาก "+pass.curaddr+" ไปส่งที่ "+ pass.destination+" เบอร์ติดต่อลูกค้า "+pass.phone;
                            drv.msgphone = pass.phone ;
                            drv.msgstatus = "NEW";
                            drv.updated = new Date().getTime();
                            drv.status = "BUSY";
                            drv.save(function(err, response) {
                                if(err) {
                                    res.json({ status: false , msg: "error", data: err });
                                } else {
                                    CallcenterpsgModel.findOne(
                                        { _id : psg_id }, 
                                        { status:1, updated:1 },
                                        function(err, psg) {
                                            if(psg==null) {
                                                res.json({ status: false , msg: "This passenger is not available." });
                                            } else {                                            
                                                psg.drv_id = _id;
                                                psg.updated = new Date().getTime();
                                                psg.status = "BUSY";                                                
                                                psg.save(function(err, response) {
                                                    if(err) {
                                                         res.json({ status: false , msg: "error", data: err  });
                                                    } else {
                                                         res.json({ 
                                                            //msg: "Update driver and passenger to ON => driver canceled passenger",
                                                            status: true ,                                                          
                                                            data: { 
                                                                drv_id: response.drv_id,
                                                                status: response.status
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    );
                                }
                            });
                        }
                    }
                );
            }
        }
    );
*/
};




exports.cancelpsgdrv = function (socket) {
    return function (req, res) {
var psg_id = req.body.psg_id        ;
    CallcenterpsgModel.findOne(
        { _id : psg_id },       
        function(err,response) {                
            if(response==null) {
                res.json({                              
                    status: false,
                    msg: "psg n/a"                          
                });             
            } else {        
                DriversModel.findOne(
                    {  _id: response.drv_id },                  
                    function(err, drv) {
                        if(drv==null) {
                            CallcenterpsgModel.findOne(
                                { _id : psg_id },                                       
                                function(err, psg) {
                                    if(psg==null) {
                                        res.json({ status: false , msg: "This passenger is not available." });
                                    } else {
                                        psg.jobhistory.push({ 
                                            action : "CC cancel job" ,                                            
                                            old_drv_carplate : response.drv_carplate,
                                            status : "INITIATE" ,     
                                            actionby : req.user.local.username ,
                                            created : new Date() 
                                        }); 
                                        psg.createdvia = "" ;
                                        psg.drv_id =  "" ;
                                        psg.drv_carplate = "" ;
                                        psg.cccomment = "" ;
                                        psg.updated = new Date().getTime() ;
                                        psg.status = "INITIATE" ;
                                        psg.save(function(err, response) {
                                            if(err) {
                                                res.json({ status: false , msg: "error", data: err  });
                                            } else {
                                                socket.of('/'+req.user.local.cgroup).emit("cancelpsgdrv", psg);          
                                                res.json({ 
                                                    //msg: "Update driver and passenger to ON => driver canceled passenger",
                                                    status: true ,                                                          
                                                    data: { 
                                                        psg_id: psg_id,
                                                        status: response.status,
                                                        cgroup: response.cgroup
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            );
                        } else {                        
                            drv.psg_id = "";
                            drv.updated = new Date().getTime();
                            drv.status = "ON";
                            drv.save(function(err, response) {
                                if(err) {
                                    res.json({ status: false , msg: "error", data: err });
                                } else {
                                    CallcenterpsgModel.findOne(
                                        { _id : psg_id },                                       
                                        function(err, psg) {
                                            if(psg==null) {
                                                res.json({ status: false , msg: "This passenger is not available." });
                                            } else {                                            
                                                psg.drv_id =  "";
                                                psg.drv_carplate = "";
                                                psg.cccomment = "";
                                                psg.updated = new Date().getTime();
                                                psg.status = "INITIATE";     
                                                psg.jobhistory.push({ 
                                                    action : "CC cancel job" ,
                                                    old_drv_id : response.drv_id,
                                                    old_drv_carplate : response.drv_carplate,                                                    
                                                    status : "INITIATE" ,     
                                                    actionby : req.user.local.username ,
                                                    created : new Date() 
                                                });       
                                                psg.save(function(err, response) {
                                                    if(err) {
                                                         res.json({ status: false , msg: "error", data: err  });
                                                    } else {
                                                            socket.of('/'+req.user.local.cgroup).emit("cancelpsgdrv", psg);                                                        
                                                         res.json({ 
                                                            //msg: "Update driver and passenger to ON => driver canceled passenger",
                                                            status: true ,                                                          
                                                            data: { 
                                                                psg_id: psg_id,
                                                                status: response.status,
                                                                cgroup: response.cgroup
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    );
                                }
                            });
                        }
                    }
                );
            }
        }
    );
};
};




exports.searchdrv = function(req, res) {
var _id     = req.body._id      ;
var device_id   = req.body.device_id    ;
var status  = req.body.status   ; 
var curlng  = req.body.curlng   ;
var curlat  = req.body.curlat   ;
var curloc  = [parseFloat(req.body.curlng),parseFloat(req.body.curlat)];
var radian  = req.body.radian   ;
var amount  = req.body.amount   ;
    // short form : if(req.body.uid) { device.uid = req.body.uid ? req.body.uid : device.uid; }     
    if (typeof curlng == 'undefined' && curlng == null) {       
        res.json({ status: false, msg: "current longitude is not valid" })
        return; 
    }
    if (typeof curlat == 'undefined' && curlat == null) {       
        res.json({ status: false, msg: "current latitude is not valid" })
        return;
    }
    if (typeof radian == 'undefined' && radian == null) {       
        radian = config.ccsearchdrvradian; 
    }
    if (typeof amount == 'undefined' && amount == null) {       
        amount = config.ccsearchdrvamount;
    }   
    if (typeof status == 'undefined' && status == null) {   
    status = ["ON", "OFF","WAIT","BUSY","PICK","BROKEN","ASSIGNED","DPENDING","DEPENDING_REJECT"] ;
    } else {
    status = [ status ];
    }
    
    condition = { active:"Y", curloc : { $near : curloc, $maxDistance: radian } ,  status: { $in: status  }, cgroup: req.user.local.cgroup  };
    
    DriversModel.find(
        condition,
        { _id: 1, device_id: 1, fname: 1, lname: 1, phone:1, taxiID: 1 , carplate: 1, cartype:1, carcolor: 1, imgface: 1, curlng: 1, curlat: 1, curloc: 1 , car_no: 1, psg_id: 1, active: 1, jobtype: 1, status: 1, moneyapp: 1, moneygarage: 1, expdateapp:1, expdategarage:1 , brokenname:1, brokendetail:1 },
        { limit : amount },
        function(err,drvlist){
            // Donot forget to create 2d Index for passengers collection : curloc & descloc!!!!                             
            if(drvlist == 0) {
                res.json({status: false, msg: "No data"});
            } else {
                res.json({
                    //msg: "This is your driver's list.", 
                    status: true,  
                    //msg: condition,                 
                    data: drvlist
                    });
                //Specifies a point for which a geospatial query returns the documents from nearest to farthest.
            }
        }
    );
};




exports.countTaxi = function (req, res) {
    var _id = req.body._id;
    var device_id = req.body.device_id;
    var status = req.body.status;
    var curlng = req.body.curlng;
    var curlat = req.body.curlat;
    var curloc = [parseFloat(req.body.curlng), parseFloat(req.body.curlat)];
    var radian = req.body.radian;
    var amount = req.body.amount;
    // short form : if(req.body.uid) { device.uid = req.body.uid ? req.body.uid : device.uid; }     
    if (typeof curlng == 'undefined' && curlng == null) {
        res.json({ status: false, msg: "current longitude is not valid" })
        return;
    }
    if (typeof curlat == 'undefined' && curlat == null) {
        res.json({ status: false, msg: "current latitude is not valid" })
        return;
    }
    if (typeof radian == 'undefined' && radian == null) {
        radian = config.ccsearchdrvradian;
    }
    if (typeof amount == 'undefined' && amount == null) {
        amount = config.ccsearchdrvamount;
    }
    if (typeof status == 'undefined' && status == null) {
        status = ["ON", "OFF", "WAIT", "BUSY", "PICK", "BROKEN", "ASSIGNED", "DPENDING", "DEPENDING_REJECT"];
    } else {
        status = [status];
    }

    condition = { active: "Y", curloc: { $near: curloc, $maxDistance: radian }, status: { $in: status }, cgroup : req.user.local.cgroup };

    DriversModel.find(
        condition,
        { _id: 1, status: 1 },
        { limit: config.ccsearchdrvamount },
        function (err, drivers) {
            if (drivers == 0) {
                res.json({ status: false, msg: "No data" });
            } else {
                res.json({
                    status: true,
                    data: drivers
                });
            }
        }
        );
};




exports.DrvGGAddMoney = function(req,res){
// add to array example: http://tech-blog.maddyzone.com/node/add-update-delete-object-array-schema-mongoosemongodb
var _id = req.body._id                      ;
var device_id = req.body.device_id              ;
var moneygarage =  parseInt(req.body.moneygarage)   ;

    DriversModel.findOne(
        { _id: _id, device_id: device_id },         
        function(err, drv) {
            if(drv==null) {
                res.json({ status: false , msg: "No driver found for this id" });
            } else {                                            
                drv.moneygarage = drv.moneygarage + moneygarage ;   
                drv.topupgaragehistory.push({ moneyadded: moneygarage, addeddate: new Date() });                                
                drv.save(function(err, response) {
                    if(err) {
                         res.json({ status: false , msg: "error", data: err  });
                    } else {
                         res.json({                                                             
                            status: true ,                                                          
                            data: {
                                moneygarage : response.moneygarage
                            } 
                        });
                    }
                });
            }
        }
    );
};




exports.DrvGGAddHour = function(req,res){
var device_id = req.body.device_id      ;
var moneygarage = req.body.moneygarage  ;
    DriversModel.findOne(
        { device_id: device_id }, 
        function(err, drv) {
            if(drv==null) {
                res.json({ status: false , msg: " No driver was found " });
            } else {                    
                drv.moneygarage = drv.moneygarage+moneygarage ;
                drv.save(function(err, response) {
                    if(err) {
                        res.json({ status: false , msg: "error", data: err });
                    } else {
                         res.json({                             
                            status: true ,                                                          
                            data: { 
                                device_id: response.device_id,
                                moneygarage: response.moneygarage
                            }
                        });
                    }
                });
            }
        }
    );
};




exports.askGGcharge = function(req, res) {
var _id = req.body._id          ;
var device_id = req.body.device_id  ;
var drv_ans = req.body.drv_ans  ;
var nowdate = new Date().getTime() ;
var drvexpdategrg ;
var newexpdate; 
    if (drv_ans == 'Y') {
        DriversModel.findOne(
            { _id: _id , device_id: device_id }, 
            { moneygarage: 1, expdategarage: 1 , paymentgaragehistory: 1 },
            function(err, drv) {
                if(drv==null) {
                    res.json({ status: false , msg: " No driver was found " });
                } else {    
                    previousmoney = drv.moneygarage;
                    currentmoney =  drv.moneygarage - MoneyPerUse ;
                    oldexpdate =  drv.expdategarage;
                    console.log(drv.expdategarage)
                    if (drv.expdategarage) {
                        drvexpdategrg = new Date(drv.expdategarage).getTime() ; 
                    } else {
                        drvexpdategrg = 0 ;
                    }
                    

                    if  ( drv.moneygarage < MoneyPerUse ) {
                         res.json({                                                             
                            status: false ,                                                             
                            msg: "จำนวนเงินในระบบเหลือไม่เพียงพอต่อการใช้งาน กรุณาเติมเงินค่ะ"
                        });
                    } else {
                        
                        
                        if (nowdate >= drvexpdategrg) {
                            newexpdate = new Date().getTime() + (TimePerUse*TimePerHour);

                            drv.moneygarage = drv.moneygarage - MoneyPerUse ;
                            drv.expdategarage= newexpdate;
                            drv.paymentgaragehistory.push({ 
                                previousmoney: previousmoney, 
                                currentmoney: currentmoney,
                                moneypayment: MoneyPerUse, 
                                oldexpdate: oldexpdate,
                                newexpdate: new Date(newexpdate) ,
                                actiondate: new Date() 
                            });                                 
                            drv.save(function(err, response) {
                                if(err) {
                                     res.json({ status: false , msg: "error", data: err  });
                                } else {
                                     res.json({                                                             
                                        status: true , 
                                        msg: "สามารถใช้งานระบบได้",                                                     
                                        data: {
                                            id : response._id,
                                            device_id : response.device_id,
                                            moneygarage : response.moneygarage,
                                            expdategarage: response.expdategarage
                                        } 
                                    });
                                }
                            });
                        } else {
                            res.json({ 
                                status: true , 
                                msg: "คนขับ ยังมีเวลาเพียงพอในการใช้งานระบบ",
                                data: {
                                    id : drv._id,
                                    device_id : drv.device_id,
                                    moneygarage : drv.moneygarage,
                                    expdategarage: drv.expdategarage
                                } 
                            });
                            /*
                            newexpdate = drvexpdategrg+ (TimePerUse*TimePerHour);

                            drv.moneygarage = drv.moneygarage - MoneyPerUse ;
                            drv.expdategarage= newexpdate ;                                     
                            drv.paymentgaragehistory.push({ 
                                previousmoney: previousmoney,  
                                currentmoney: currentmoney ,
                                moneypayment: MoneyPerUse, 
                                oldexpdate: oldexpdate,
                                newexpdate: new Date(newexpdate) ,
                                addeddate: new Date() 
                            });                                 
                            drv.save(function(err, response) {
                                if(err) {
                                     res.json({ status: false , msg: "error", data: err  });
                                } else {
                                     res.json({                                                             
                                        status: true ,  
                                        msg: "002",                                                     
                                        data: {
                                            id : response._id,
                                            device_id : response.device_id,
                                            moneygarage : response.moneygarage,
                                            expdategarage: response.expdategarage
                                        } 
                                    });
                                }
                            });
                            */
                        }                   
                    }
                }
            }
        );
    } else {
        res.json({                                              
            status: false ,
            msg: "Driver does not want to pay and use callcenter service"                                       
        });
    }
};  




exports.DrvAPPAddMoney = function(req,res){
// add to array example: http://tech-blog.maddyzone.com/node/add-update-delete-object-array-schema-mongoosemongodb
var _id = req.body._id                      ;
var device_id = req.body.device_id              ;
var moneyapp =  parseInt(req.body.moneyapp) ;

    DriversModel.findOne(
        { _id: _id, device_id: device_id },         
        function(err, drv) {
            if(drv==null) {
                res.json({ status: false , msg: "No driver found for this id" });
            } else {                                            
                drv.moneyapp = drv.moneyapp + moneyapp ;    
                drv.topupapphistory.push({ moneyadded: moneyapp, addeddate: new Date() });                              
                drv.save(function(err, response) {
                    if(err) {
                         res.json({ status: false , msg: "error", data: err  });
                    } else {
                         res.json({                                                             
                            status: true ,                                                          
                            data: {
                                moneyapp : response.moneyapp
                            } 
                        });
                    }
                });
            }
        }
    );
};




exports.DrvAPPAddHour = function(req,res){
var device_id = req.body.device_id      ;
var moneyapp = req.body.moneyapp    ;
    DriversModel.findOne(
        { device_id: device_id }, 
        function(err, drv) {
            if(drv==null) {
                res.json({ status: false , msg: " No driver was found " });
            } else {                    
                drv.moneyapp = drv.moneyapp+moneyapp ;
                drv.save(function(err, response) {
                    if(err) {
                        res.json({ status: false , msg: "error", data: err });
                    } else {
                         res.json({                             
                            status: true ,                                                          
                            data: { 
                                device_id: response.device_id,
                                moneyapp: response.moneyapp
                            }
                        });
                    }
                });
            }
        }
    );
};




exports.askAPPcharge = function(req, res) {
var _id = req.body._id          ;
var device_id = req.body.device_id  ;
var drv_ans = req.body.drv_ans  ;
var nowdate = new Date().getTime() ;
var drvexpdategrg ;
var newexpdate; 
    if (drv_ans == 'Y') {
        DriversModel.findOne(
            { _id: _id , device_id: device_id }, 
            { moneyapp: 1, expdateapp: 1 , paymentapphistory: 1 },
            function(err, drv) {
                if(drv==null) {
                    res.json({ status: false , msg: " No driver was found " });
                } else {    
                    previousmoney = drv.moneyapp;
                    currentmoney =  drv.moneyapp - MoneyPerUseAPP ;
                    oldexpdate =  drv.expdateapp;
                    console.log(drv.expdateapp)
                    if (drv.expdateapp) {
                        drvexpdategrg = new Date(drv.expdateapp).getTime() ; 
                    } else {
                        drvexpdategrg = 0 ;
                    }
                    

                    if  ( drv.moneyapp < MoneyPerUseAPP ) {
                         res.json({                                                             
                            status: false ,                                                             
                            msg: "จำนวนเงินในระบบเหลือไม่เพียงพอต่อการใช้งาน กรุณาเติมเงินค่ะ"
                        });
                    } else {
                        
                        
                        if (nowdate >= drvexpdategrg) {
                            newexpdate = new Date().getTime() + (TimePerUseAPP*TimePerHour);

                            drv.moneyapp = drv.moneyapp - MoneyPerUseAPP ;
                            drv.expdateapp= newexpdate;
                            drv.paymentapphistory.push({ 
                                previousmoney: previousmoney, 
                                currentmoney: currentmoney,
                                moneypayment: MoneyPerUseAPP, 
                                oldexpdate: oldexpdate,
                                newexpdate: new Date(newexpdate) ,
                                actiondate: new Date() 
                            });                                 
                            drv.save(function(err, response) {
                                if(err) {
                                     res.json({ status: false , msg: "error", data: err  });
                                } else {
                                     res.json({                                                             
                                        status: true , 
                                        msg: "สามารถใช้งานระบบได้",                                                     
                                        data: {
                                            id : response._id,
                                            device_id : response.device_id,
                                            moneyapp : response.moneyapp,
                                            expdateapp: response.expdateapp
                                        } 
                                    });
                                }
                            });
                        } else {
                            /*
                            res.json({ 
                                status: true , 
                                msg: "คนขับ ยังมีเวลาเพียงพอในการใช้งานระบบ",
                                data: {
                                    id : drv._id,
                                    device_id : drv.device_id,
                                    moneyapp : drv.moneyapp,
                                    expdateapp: drv.expdateapp
                                } 
                            });
                            */
                            newexpdate = drvexpdategrg+ (TimePerUseAPP*TimePerHour);
                            drv.moneyapp = drv.moneyapp - MoneyPerUseAPP ;
                            drv.expdateapp= newexpdate ;                                        
                            drv.paymentapphistory.push({ 
                                previousmoney: previousmoney,  
                                currentmoney: currentmoney ,
                                moneypayment: MoneyPerUseAPP, 
                                oldexpdate: oldexpdate,
                                newexpdate: new Date(newexpdate) ,
                                addeddate: new Date() 
                            });                                 
                            drv.save(function(err, response) {
                                if(err) {
                                     res.json({ status: false , msg: "error", data: err  });
                                } else {
                                     res.json({                                                             
                                        status: true ,  
                                        msg: "002",                                                     
                                        data: {
                                            id : response._id,
                                            device_id : response.device_id,
                                            moneyapp : response.moneyapp,
                                            expdateapp: response.expdateapp
                                        } 
                                    });
                                }
                            });                         
                        }                   
                    }
                }
            }
        );
    } else {
        res.json({                                              
            status: false ,
            msg: "Driver does not want to pay and use callcenter service"                                       
        });
    }
};  




function _joblistlog (data, psg_data, drv_data, res, options) {
    if(options.status==statusConstant.busy){
            condition = { "status" : statusConstant.busy , "uid" : options.taxiUid } ; 
        }
            else{
                condition = { "status" : statusConstant.on } ;
            }
            DeviceModel.find( /* find( {query}, {fields}, {options}, callbackFunction ) */
            condition,  
        { _id: 0, registrationId: 0 }, /* not show in json result */
        { 
            limit : options.limit 
        },
        function(err, response) {
            if (err) { 
                res.send(err); 
            }
            else {
                var _res = {
                    status: true,
                    msg : "success",
                    data: response
                };
                res.json(_res);
            }           
    });
};




// --------- start shared API
exports.announcementAdd = function(req, res) {
username = req.user.local.username    ;
password = req.body.password    ;
encpassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

    UserModel.findOne(
        { username : username }, 
        function(err, user) {               
            //console.log (' real = ' + user.local.password)
            //console.log( ' encryp = ' + encpassword)
            //console.log(bcrypt.compareSync(encpassword, user.local.password));

            if (user == null) {     
                res.json({ 
                    status: false , 
                    msg:  "Your account is not valid, please try again."
                });
            } else {
                    AnnounceModel.create({
                    createdby: req.user.local.username ,
                    anntype: req.body.anntype ,
                    topic: req.body.topic ,
                    detail: req.body.detail ,
                    status: req.body.status ,
                    expired: new Date(req.body.expired).getTime() - 25200000 ,
                        updated: new Date().getTime() , 
                        created: new Date().getTime()               
                    }, function(err, response) {
                    if (err) {
                        res.send(err)
                    } else {
                        err ? res.send(err) : res.json({ 
                            status: true , 
                            msg:  "The announcement has been created.",
                            data: response
                        });
                    }                   
                });
            }
        }
    );
};




exports.announcementEdit = function(req, res) {
user_id = req.body.user_id  ;
ann_id = req.body.ann_id    ;
    UserModel.findOne(
        { _id : user_id }, 
        function(err, user) {               
            if ( user == null) {        
                res.json({ 
                    status: false , 
                    msg:  "Your account is not valid, please try again."
                });
            } else {
                AnnounceModel.findOne(
                    { _id : ann_id }, 
                    { status:1, updated:1 },
                    function(err, announce) {                       
                        if(req.body.anntype)    { announce.anntype  = req.body.anntype ? req.body.anntype : announce.anntype; }
                        if(req.body.topic)  { announce.topic    = req.body.topic ? req.body.topic : announce.topic; }
                        if(req.body.detail)     { announce.detail   = req.body.detail ? req.body.detail : announce.detail; }
                        if(req.body.status)     { announce.status   = req.body.status ? req.body.status : announce.status; }
                        if(req.body.expired)    { announce.expired  = req.body.expired ? req.body.expired : announce.expired; }
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
                );
            }
        }
    );
};




exports.announcementDel = function(req, res) {
user_id = req.body.user_id  ;
ann_id = req.body.ann_id        ;
    UserModel.findOne(
        { _id : user_id }, 
        function(err, user) {
            if ( user == null) {        
                res.json({ 
                    status: false , 
                    msg:  "Your account is not valid, please try again."
                });
            } else {
                AnnounceModel.findOne(
                    { _id : ann_id }, 
                    function(err, announce) {
                        if (announce == null) {     
                            res.json({ 
                                status: false , 
                                msg:  "Your announce id is not valid, please try again."
                            });
                        } else {
                            announce.remove({ _id : ann_id },
                                function(err, response) {
                                console.log(response)
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
                            res.json({ 
                                status: true , 
                                msg: "success, the announcement has been deleted"                                   
                            });
                        }
                    }
                );
            }
        }
    );
};




exports.announcementGet = function(req, res) {
anntype = req.body.anntype  ;
    AnnounceModel.findOne(
        { 
            anntype: anntype, 
            topic: { $ne: '' }, status:"Y", 
            expired: { $gt: new Date().getTime() }
        },
        { username: 0 },
        {sort: '-created'},
        //{sort:{'created':-1}},
        function(err, response) {
            if(response == null) { 
                res.json({ status: false , msg: "No data."});
            } else {
                err ? res.send(err) : res.json({ 
                    status: true ,                  
                    data :  response
                });
            }
        }
    );
};




exports.callcenterAnnounceAll = function (req, res) {
    var announcement = CallcenterannounceModel.find({});
    announcement.limit(20);
    announcement.sort({ created: -1 });
    announcement.exec(function (err, announcements) {
        res.send({
            status: true,
            data: announcements
        });
    });
};




exports.callcenterAnnounceFind = function (req, res) {
    CallcenterannounceModel.findOne({})
};




exports.callcenterAnnounceAdd = function (req, res) {
    username = req.user.local.username ;
    UserModel.findOne({ username: username }, function (err, user) {

        if (user == null) {
            res.json({
                status: false,
                msg: "Your account is not valid, please try again."
            });
        }
        else {
            CallcenterannounceModel.create({

                topic: req.body.topic,
                detail: req.body.detail,
                createdby: req.user.local.username ,

                updated: new Date().getTime(),
                created: new Date().getTime()
            }, function (err, response) {
                if (err) {
                    res.send(err);
                }
                else {
                    err ? res.send(err) : res.json({
                        status: true,
                        msg: "The announcement has been created.",
                        data: response
                    });
                }
            });
        }
    });
};




exports.callcenterAnnounceEdit = function (req, res) {
    user_id = req.body.user_id;
    ann_id = req.body.ann_id;

    UserModel.findOne(
        { _id: user_id },
        function (err, user) {
            if (user == null) {
                res.json({
                    status: false,
                    msg: "Your account is not valid, please try again."
                });
            } else {
                CallcenterannounceModel.findOne(
                    { _id: ann_id },
                    { status: 1, updated: 1 },
                    function (err, announce) {
                        if (req.body.topic) { announce.topic = req.body.topic ? req.body.topic : announce.topic; }
                        if (req.body.detail) { announce.detail = req.body.detail ? req.body.detail : announce.detail; }
                        announce.updated = new Date().getTime();
                        announce.save(function (err, response) {
                            if (err) {
                                res.json({ status: false, msg: "error" });
                            } else {
                                res.json({
                                    status: true,
                                    msg: "success, announcement has been updated",
                                    data: {
                                        ann_id: response._id,
                                        topic: response.topic,
                                        detail: response.detail
                                    }
                                });
                            }
                        });
                    });
            }
        });
};




exports.callcenterAnnounceDel = function (req, res) {
    user_id = req.body.user_id;
    ann_id = req.body.ann_id;

    UserModel.findOne(
        { _id: user_id },
        function (err, user) {
            if (user == null) {
                res.json({
                    status: false,
                    msg: "Your account is not valid, please try again."
                });
            } else {
                CallcenterannounceModel.findOne(
                    { _id: ann_id },
                    function (err, announce) {
                        if (announce == null) {
                            res.json({
                                status: false,
                                msg: "Your announce id is not valid, please try again."
                            });
                        } else {
                            announce.remove({ _id: ann_id },
                                function (err, response) {
                                    console.log(response)
                                    if (err) {
                                        res.json({ status: false, msg: "error" });
                                    } else {
                                        res.json({
                                            status: true,
                                            msg: "success, the announcement has been deleted"
                                        });
                                    }
                                });
                            res.json({
                                status: true,
                                msg: "success, the announcement has been deleted"
                            });
                        }
                    });
            }
        });
};




exports.addlocalpoi = function(req, res) {
    LocalpoiModel.findOne(
        { _id: req.body._id }, 
        function(err, localpoi) {
            if (localpoi == null) { 
                    LocalpoiModel.create({                      
                    name: req.body.name,
                    addr: req.body.addr,
                    provinceid: req.body.provinceid,
                    districtid: req.body.districtid,
                    subdistrictid: req.body.subdistrictid,
                    curlng: req.body.curlng,
                    curlat: req.body.curlat,
                    curloc: req.body.curloc,
                    status: "Y",
                        updated: new Date().getTime(), 
                        created: new Date().getTime()
                    },
                    function(err, response) {
                        if (err) { 
                            res.json({ status: false , msg: "error"  });
                        } else {
                            res.json({                              
                                status: true,
                                data: response                          
                            });
                        } 
                    }
                );
                }  
        }
    );
};




exports.getPOIandParking = function(req,res){
    LocalpoiModel.find(     
        { "name" : { "$exists" : true, "$ne" : "" } }, 
        { name:1, curloc:1, poitype:1, iconimg:1, status:1 },
        function(err, localpoi) {
            if (localpoi == 0) { 
                res.json({ status: false , msg: "no place"  });             
                }  else {
                res.json({                              
                    status: true, 
                    data: localpoi                          
                });
                }
        }
    );  
}




exports.getAvgGetJobPerMinute = function(req,res){
    var startTime = parseInt(req.body.startTime);
    var endTime = parseInt(req.body.endTime);
    var MinDiff = (endTime - startTime)/1000/60;
    var myquery ;
    CallcenterpsgModel.count({ 
       "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
       "status": "FINISHED",
       "cgroup": req.user.local.cgroup
    }, function (err, result) {
       if(err) {
           res.json({ status: false , data: err  });      
       } else {
            res.json({ 
                status: true, 
                Total: result,
                Avg: result/MinDiff
            });    
        }
    })
}


    // myquery = { $match: {
    //         "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
    //         "curaddr": { $ne: '' } ,
    //         "status": "FINISHED",
    //         "cgroup" : req.user.local.cgroup
    //     }};

   // CallcenterpsgModel.aggregate([
   //      myquery ,
   //      { $group: {_id: "$drv_carplate", count: {$sum : 1 }}},
   //      { $sort: { count: -1 }},
   //  ], function (err, return1) {
   //     if(err) {
   //         res.json({ status: false , data: err  });      
   //     } else {
   //          res.json({ 
   //              status: true,
   //              data: return1
   //          });    
   //      }
   //  });


exports.MostHitStartPlace = function(req,res){
    var startTime = parseInt(req.body.startTime);
    var endTime = parseInt(req.body.endTime);
    //http://www.kdelemme.com/2014/03/19/how-to-aggregate-data-from-mongodb-with-node-js-and-mongoose/
   CallcenterpsgModel.aggregate([
        { $match: {
            "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
             "curaddr": { $ne: '' } ,
             "cgroup": req.user.local.cgroup
        }},
        //{ $unwind: "$records" },  
        { $group: {_id: "$curaddr" , count: {$sum : 1 }}},
        { $sort: { count: -1 }},
    ], function (err, result) {
       if(err) {
           res.json({ status: false , data: err  });      
       } else {
            res.json({ 
                status: true,
                data: result
            });    
        }
    });
}



exports.MostHitDestinationPlace = function(req,res){
    var startTime = parseInt(req.body.startTime);
    var endTime = parseInt(req.body.endTime);
    //http://www.kdelemme.com/2014/03/19/how-to-aggregate-data-from-mongodb-with-node-js-and-mongoose/
   CallcenterpsgModel.aggregate([
        { $match: {
            "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
             "destination": { $ne: '' } ,
             "cgroup": req.user.local.cgroup
        }},
        //{ $unwind: "$records" },  
        { $group: {_id: "$destination" , count: {$sum : 1 }}},
        { $sort: { count: -1 }},
    ], function (err, result) {
       if(err) {
           res.json({ status: false , data: err  });      
       } else {
            res.json({ 
                status: true,
                data: result
            });    
        }
    });
}



exports.MostHitHours = function(req,res){
    var startTime = parseInt(req.body.startTime);
    var endTime = parseInt(req.body.endTime);
    
    CallcenterpsgModel.aggregate([
    {
        $match: {
            "created": { $gt: new Date(startTime), $lt: new Date(endTime) } ,
             "cgroup": req.user.local.cgroup
        }
    },
     { 
        "$project": {
          "y":{"$year":"$created"},
          "m":{"$month":"$created"},
          "d":{"$dayOfMonth":"$created"},
          "h":{"$hour":"$created"},
          "device_id":1
           }
     },
     { "$group":{ 
           "_id": { "year":"$y","month":"$m","day":"$d","hour":"$h"},
           "total":{ "$sum": 1}
       }},
       ],function (err, result) {
       if(err) {
           res.json({ status: false , data: err  });      
       } else {
            res.json({ 
                status: true,
                data: result
            });    
        }
     });
}




exports.CountJobPerDrv = function(req,res){
    var startTime = parseInt(req.body.startTime);
    var endTime = parseInt(req.body.endTime);
    var drv_id = req.body._id;
    var drv_carplate = req.body.drv_carplate;
    var myquery ;

    // if(drv_id){
    //     myquery = { $match: {
    //             "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
    //             "curaddr": { $ne: '' } ,
    //             "status": "FINISHED" ,
    //             "drv_id" : drv_id
    //         }};
    // } else {
    //     myquery = { $match: {
    //             "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
    //             "curaddr": { $ne: '' } ,
    //             "status": "FINISHED" 
    //         }};
    // }

    if(drv_carplate){
        myquery = { $match: {
                "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
                "curaddr": { $ne: '' } ,
                "status": { $in: [ "FINISHED","OFF" ] }, 
                "drv_carplate" : drv_carplate,
                "cgroup" : req.user.local.cgroup
            }};
    } else {
        myquery = { $match: {
                "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
                "curaddr": { $ne: '' } ,
                "status": { $in: [ "FINISHED","OFF" ] }, 
                "cgroup" : req.user.local.cgroup
            }};
    }
    //console.log( myquery)
    CallcenterpsgModel.aggregate([
        myquery ,
        { 
            "$group": { 
                "_id": "$drv_carplate", 
                "count" : {"$sum" : 1 }
            },           

        },
        { $sort: { count: -1 }},
    ], function (err, result) {
       if(err) {
           res.json({ status: false , data: err  });      
       } else {
            res.json({ 
                status: true,
                data: result
            });    
        }
    });

}




exports.searchFinishList = function (req,res) {
// sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
// reference : http://docs.mongodb.org/manual/reference/sql-comparison/
//{ fname :  new RegExp( '^'+ keyword+'^' )   },
var startTime = parseInt(req.body.startTime);
var endTime = parseInt(req.body.endTime);    
var keyword = req.body.keyword      ;
    CallcenterpsgModel.find(          
        { 
            $or: [ { curaddr :  new RegExp( keyword ) }, { destination :  new RegExp( keyword ) }, { phone :  new RegExp( keyword ) }  ,   { drv_carplate :  new RegExp( keyword ) }  ], 
            "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,            
            "cgroup" : req.user.local.cgroup
        }, 
        { _id:1, phone:1, curaddr:1, destination:1, curloc:1, desloc:1, detail:1, status:1, jobtype:1, createdjob:1, drv_id:1, drv_carplate:1, createdvia:1, ccstation:1, assigningby:1, cgroup:1, cccomment:1 },        
        { sort: { 'createdjob' : -1 } }, 
        function(err, response) {
            if (response == 0) {                    
                res.json({                  
                    status: false ,
                    msg: 'No data'              
                });
                } else {
                res.json({ 
                    status: true,               
                    data: response
                });
            }
        }
    );
};




exports.getjoblistbydate = function (req, res) {
    var startTime = parseInt(req.body.startTime);
    var endTime = parseInt(req.body.endTime);    
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
     CallcenterpsgModel.find(   
        { 
            "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } ,
            //"status": { $in: [ "FINISHED","OFF" ] }, 
            "cgroup" : req.user.local.cgroup  
        } ,
        { _id: 1, status: 1, phone: 1, curaddr: 1, curlng:1, curlat:1, curloc:1, destination: 1, deslng:1, deslat:1, desloc:1, detail:1, createdjob:1,  jobtype:1, drv_id:1, drv_carplate:1, createdvia:1, dassignedjob:1 ,dpendingjob:1, ccstation:1, assigningby:1, cgroup:1, cccomment:1 },
        { sort: { 'createdjob' : -1 } }, 
        function(err,psglist){      
            if(psglist == 0) {              
                res.json({                              
                    status: false                       
                });             
            } else {                
                res.json({                              
                    status: true,
                    data: psglist                       
                });
            }
        }
     );
}




exports.PsgCallLog = function (req, res) {
    var startTime = parseInt(req.body.startTime);
    var endTime = parseInt(req.body.endTime);    
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
     PsgcalllogModel.find(   
        { 
            "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } 
        } ,
        { _id:0, psg_phone:1, drv_phone:1, drv_carplate:1, callby:1, created:1 } ,
        { sort: { 'created' : -1 } }, 
        function(err,response){      
            if(response == 0) {              
                res.json({                              
                    status: false                       
                });             
            } else {                
                res.json({                              
                    status: true,
                    data: response                       
                });
            }
        }
     );
}




exports.JoblistLog = function (req, res) {
    var startTime = parseInt(req.body.startTime);
    var endTime = parseInt(req.body.endTime);    
    // sort mongoose ; http://stackoverflow.com/questions/5825520/in-mongoose-how-do-i-sort-by-date-node-js
     JoblistModel.find(   
        { 
            "created": { $gt: new  Date(startTime), $lt: new Date(endTime) } 
        } ,
        { _id:0, drvcancelwhere:1, datedrvcancel:1, psgcancelwhere:1, datepsgcancel:1, datepsgthanks:1, datedrvdrop:1, datedrvpick:1, datepsgaccept:1, datedrvwait:1, datepsgcall:1, destination:1, curaddr:1, drv_carplate:1, drv_phone:1, drv_name:1, psg_phone:1 },
        { sort: { 'created' : -1 } }, 
        function(err,response){      
            if(response == 0) {              
                res.json({                       
                    status: false
                });    
            } else {                
                res.json({                              
                    status: true,
                    data: response                       
                });
            }
        }
     );
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////// for the particular purpose ////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// exports.updatedrvcgroup = function(req, res) {
// var cgroup = "ccubon"       ;
//     DriversModel.find(
//         {  },                             
//         function(err, drv) {
//             if(drv==0) {
//                 res.json({ status: false , msg: "cgroup is not empty" });
//             } else {    
//                 drv.forEach(function(record){                   
//                     DriversModel.findOne(
//                         { _id: record._id },
//                         function(err, result) {
//                             if(result==null) {
//                                 res.json({ status: false , msg: "This driver is not available." });
//                             } else {                                
//                                 result.cgroup = cgroup; 
//                                 result.save(function(err, response) {
//                                     if(err) {
//                                          res.json({ status: false , msg: "error", data: err  });
//                                     } else {
//                                         /*
//                                          res.json({                             
//                                             status: true ,                                                          
//                                             data: { 
//                                                 drv_id: response._id,
//                                                 appversion: response.appversion
//                                             }
//                                         });
//                                         */
//                                     }
//                                 });
//                             }
//                         }
//                     )
//                 });             
//                 res.json({ status: true , data: drv });
//             }
//         }
//     );
// };
exports.updatedrvcgroup = function(req, res) {
var cgroupname = "แท็กซี่พัฒนา"       ;
var cprovincename = "(จ.อุบล)"       ;
console.log( ' updatedrvcgroup ')
    DriversModel.find(
        {  },                             
        function(err, drv) {
            if(drv==0) {
                res.json({ status: false , msg: "cgroup is not empty" });
            } else {    
                drv.forEach(function(record){                   
                    DriversModel.findOne(
                        { _id: record._id },
                        function(err, result) {
                            if(result==null) {
                                res.json({ status: false , msg: "This driver is not available." });
                            } else {                                
                                result.cgroupname = cgroupname; 
                                result.cprovincename = cprovincename; 
                                result.save(function(err, response) {
                                    if(err) {
                                         res.json({ status: false , msg: "error", data: err  });
                                    } else {
                                        /*
                                         res.json({                             
                                            status: true ,                                                          
                                            data: { 
                                                drv_id: response._id,
                                                appversion: response.appversion
                                            }
                                        });
                                        */
                                    }
                                });
                            }
                        }
                    )
                });             
                res.json({ status: true , data: drv });
            }
        }
    );
};



exports.updatedrvappversion = function(req, res) {
var appversion = req.body.appversion        ;
    DriversModel.find(
        { appversion : { $ne: appversion } }, 
        {_id: 1  },                             
        function(err, drv) {
            if(drv==0) {
                res.json({ status: false , msg: "all appversion is "+appversion });
            } else {    
                drv.forEach(function(record){                   
                    DriversModel.findOne(
                        { _id: record._id },
                        function(err, result) {
                            if(result==null) {
                                res.json({ status: false , msg: "This driver is not available." });
                            } else {                                
                                result.appversion = appversion; 
                                result.save(function(err, response) {
                                    if(err) {
                                         res.json({ status: false , msg: "error", data: err  });
                                    } else {
                                        /*
                                         res.json({                             
                                            status: true ,                                                          
                                            data: { 
                                                drv_id: response._id,
                                                appversion: response.appversion
                                            }
                                        });
                                        */
                                    }
                                });
                            }
                        }
                    )
                });             
                res.json({ status: true , data: drv });
            }
        }
    );
};




exports.UpdateExpAPPDate = function(req, res) {
    strDate = new Date(req.body.strDate).getTime() - 25200000 ;   // for example  "2016-05-23"
    drv_id = req.body.drv_id;
    if (drv_id) {
        drv_id = drv_id;
    } else {
        drv_id = "";
    }

    _UpdateExpAPPDate(strDate, drv_id);

    function _UpdateExpAPPDate(strDate, drv_id) {
        console.log(typeof strDate)
        console.log(strDate)
        //strDate = new Date(strDate).getTime();
        DriversModel.find(
            { "device_id" : { "$exists" : true, "$ne" : "" } }, 
            {_id: 1  },                             
            function(err, drv) {
                if(drv==0) {
                    console.log (' not found driver')
                    res.json({ status: false , msg: "No data was found" });
                } else {    
                    drv.forEach(function(record){
                        if (drv_id) {
                            DriversModel.findOne(
                                { _id: drv_id },
                                function(err, result) {
                                    if(result==null) {
                                        console.log (' not found ' + drv_id )
                                        res.json({ status: false , msg: "This driver is not available." });
                                    } else {                                
                                        result.expdateapp = strDate;
                                        result.save(function(err, response) {
                                            if(err) { 
                                                console.log (' err ' + err )
                                            } else {
                                                console.log (' update ' + strDate + ' to '+drv_id )
                                            }
                                        });
                                    }
                                }
                            )
                        } else {
                            DriversModel.findOne(
                                { _id: record._id },
                                function(err, result) {
                                    if(result==null) {
                                        res.json({ status: false , msg: "This driver is not available." });
                                    } else {                                
                                        result.expdateapp = strDate;
                                        result.save(function(err, response) {
                                            if(err) {
                                                console.log (' err ' + err )
                                            } else {
                                                console.log (' update ' + strDate + ' to '+record._id )
                                            }
                                        });
                                    }
                                }
                            )
                        }       
                    });     
                    console.log (' log = res ' )        
                    res.json({ status: true , data: drv });
                }
            }
        );
    };
};




exports.UpdateAllDriverInfo = function(req, res) {
    sfield1 = req.body.sfield1;
    sfield2 = req.body.sfield2;

    _UpdateAllDriverInfo(sfield1, sfield2);

    function _UpdateAllDriverInfo(sfield1, sfield2) {
        DriversModel.find(
            { "device_id" : { "$exists" : true, "$ne" : "" } }, 
            {_id: 1  },                       
            function(err, drv) {
                if(drv==0) {
                    console.log (' not found driver')
                    res.json({ status: false , msg: "No data was found" });
                } else {    
                    drv.forEach(function(record){
                        DriversModel.findOne(
                            { _id: record._id },
                            function(err, result) {
                                if(result==null) {
                                    res.json({ status: false , msg: "This driver is not available." });
                                } else {                                
                                    result.useappfree = sfield1;
                                    result.useappfreemsg = sfield2;
                                    result.save(function(err, response) {
                                        if(err) {
                                            console.log (' err ' + err )
                                        } else {
                                            console.log (' update : ' + sfield1 + ' and '+ sfield2 )
                                        }
                                    });
                                }
                            }
                        )
                    });     
                    console.log (' log = res ' )        
                    res.json({ status: true , data: drv });
                }
            }
        );
    };
};




exports.UpdateAllDrivercgroupname = function(req, res) {
    sfield1 = req.body.sfield1;
    sfield2 = req.body.sfield2;

    _UpdateAllDrivercgroupname(sfield1, sfield2);

    function _UpdateAllDrivercgroupname(sfield1, sfield2) {
        DriversModel.find(
            { "device_id" : { "$exists" : true, "$ne" : "" } }, 
            {_id: 1, cgroup:1, fname:1, lname:1, cgroupname:1, cprovincename:1, status:1 },                        
            function(err, drv) {
                if(drv==0) {
                    console.log (' not found driver')
                    res.json({ status: false , msg: "No data was found" });
                } else {
                    drv.forEach(function(record){
                        Lk_garageModel.findOne(
                            { cgroup: record.cgroup},
                            { cgroupname:1, cprovincename:1 },
                            function(err, response){
                                if(response==null){
                                } else {
                                    DriversModel.findOne(
                                        { _id: record._id },
                                        function(err, result) {
                                            if(result==null) {
                                                res.json({ status: false , msg: "This driver is not available." });
                                            } else {                                
                                                result.cgroupname = response.cgroupname ;
                                                result.cprovincename = response.cprovincename ;
                                                result.save(function(err, response) {
                                                    if(err) {
                                                        console.log (' err ' + err )
                                                    } else {
                                                        console.log (' update : ' + response.cgroupname + ' and '+ response.cprovincename )
                                                    }
                                                });
                                            }
                                        }
                                    )
                                }
                            }
                        ) 
                    }); 
                    console.log (' log = resx ' )        
                    res.json({ status: true , data: drv });
                }
            }
        );
    };
};




// exports.UpdateAllDrivercgroupname = function(req, res) {

//     _UpdateAllDrivercgroupname();

//     function _UpdateAllDrivercgroupname() {
//         DriversModel.find(
//             { "cgroup" : { "$exists" : false} }, 
//             {_id: 1, cgroup:1, fname:1, lname:1, cgroupname:1, cprovincename:1, status:1 },                        
//             function(err, drv) {
//                 if(drv==0) {
//                     console.log (' not found driver')
//                     res.json({ status: false , msg: "No data was found" });
//                 } else {
//                     drv.forEach(function(record){
//                         DriversModel.findOne(
//                             { _id: record._id },
//                             function(err, result) {
//                                 if(result==null) {
//                                     res.json({ status: false , msg: "This driver is not available." });
//                                 } else {                                
//                                     result.cgroup = "ccubon" ;                                                
//                                     result.save(function(err, response) {
//                                         if(err) {
//                                             console.log (' err ' + err )
//                                         } else {
//                                             console.log (' update cgroup to ccubon success '  )
//                                         }
//                                     });
//                                 }
//                             }
//                         )
//                     }); 
//                     console.log (' log = resx ' )        
//                     res.json({ status: true , data: drv });
//                 }
//             }
//         );
//     };
// };



exports.InsertRndDriver = function(req, res){
    var nY = 0; 
    var nN = 0;
    // Test javascript at "http://js.do/"
    function ranCarplate(){
        var str = Math.random();
        var str1 = str.toString();
        var res = str1.substring(2,6);
        return res;
    }

    function ranTel(){
        var str = Math.random();
        var str1 = str.toString();
        var res = str1.substring(2,9);
        return res;
    }

    // Test javascript at "http://js.do/"
    function ranCZID(){
        var str = Math.random();
        var str1 = str.toString();
        var res = str1.substring(2,15);
        return res;
    }

    function ranYN(){
        var str = Math.random();
        var str1 = str.toString();
        var res = str1.substring(2,3);
        if(res%2){
            res = "N";
        } else {
            res = "Y";
        }
        return res;
    }

    function ranCartype(){
        var str = Math.random();
        var str1 = str.toString();
        var res = str1.substring(2,3);
        if(res%2){
            res = "car";
        } else {
            res = "minivan";
        }
        return res;
    }

    function ranCarcolor() {
        var str = Math.random();
        var str1 = str.toString();
        var res = str1.substring(2,3);
        //console.log(res)
        switch(res) {
            case "1":
                    return "น้ำเงิน" ;
                break;
                case "2":
                    return  "เขียว";
                break;
                case "3":
                    return  "ส้ม" ;
                break;
                case "4":
                    return "ชมพู" ;
                break;
                case "5":
                    return "ชุมพู-เทา" ;
                break;
                case "6":
                    return "แดง" ;
                break;
                case "7":
                    return "แดง-น้ำเงิน" ;
                break;
                case "8":
                    return  "แดง-เทา";
                break;
                case "9":
                    return "ม่วง" ;
                break;
                case "0":
                    return  "เหลือง-เขียว" ;
                break;          
            }   
        
    }

    for ( i=0; i<100; i++ ) { 
        device_id = new Date().getTime() + ranCarplate() ;
        //console.log(i)
            DriversModel.create({                       
            device_id: device_id,
            username: "test" + i ,
            password: "123456",
            fname: "fname-test-" + ranCarplate() ,
            lname: "lname-test-" + ranCarplate() ,
            phone: "081"+ranTel() ,
            citizenid: ranCZID() ,
            taxiID: "testsimulation",                       
            english: ranYN() , 
            carplate : ranCarplate() , 
            cartype : ranCartype() ,
            carcolor : ranCarcolor() , 
            outbound : ranYN() , 
            carryon : ranYN() , 
            address:  ranCarplate() , 
            province:  ranCarplate() , 
            district:  ranCarplate() ,
            tambon:  ranCarplate() ,
            zipcode:  ranCarplate() ,                       
            imgface : "56e92c4a7e6eb6f9c2a12f64_imgface.png",
            imglicence : "56e92c4a7e6eb6f9c2a12f64_imglicence.png",
            imgcar : "56e92c4a7e6eb6f9c2a12f64_imgcar.png",                     
            active : "Y",
            status : "OFF",
            created:    new Date().getTime(),
            updated:    new Date().getTime(),
            expdategarage:new Date().getTime(),
            expdateapp:     new Date().getTime() + 7776000000,                  
            smsconfirm: ranCarplate()
            },
            function(err, response) {
                if (err) { 
                    nN++;
                } else {
                    nY++;
                } 
            }
        );
    }
    res.json({ status: true, msg: "Success = "+nY+" : Not = "+nN })
}




exports.testjointable = function(req,res) {
//var MongoClient = require('mongodb').MongoClient;
//var assert = require('assert');
//var ObjectId = require('mongodb').ObjectID;
//var url = 'mongodb://localhost:27017/test';
var psg_id = req.body.psg_id; 
var namearray = [];

    // CallcenterpsgModel.find({}, function (err, db_users) {
    //  if(err) {/*error!!!*/}
    //      DriversModel.find({}, function (err, db_articles) {
    //      if(err) {/*error!!!*/}
    //          res.render('profile/profile', {
    //          users: db_users,
    //          articles: db_articles
    //      });
    //  });
    // });
    CallcenterpsgModel.findOne (
        { _id: psg_id },
        { _id:1, phone:1, curaddr:1, destination:1, drv_id:1 },
        function(err,position){
            if(!err)    { 
                //console.log(' drv_id: '+position._id)
                    //var total = position.length;
                    //console.log(" total ="+total)
                //for (i=0;i< position.length; i++) {  
                    //var obj = JSON.stringify(position[i]);
                    //var pos = JSON.parse(obj);
                    //var p = pos["player_stats_daily"]["content"]["team_sport_content"]["league_content"]["season_content"]["team_content"]["team"]["id"]
                    //var p = pos["fname"]["lname"]["carplate"]
                    DriversModel.find(                  
                        { _id: position.drv_id }, 
                        { _id: 1, carplate:1, curloc:1 },                   
                        function(err, team){                            
                                if (!err){
                                    //var obj = JSON.stringify(team);
                                    //var pos = JSON.parse(obj);
                                    //namearray.push(team);
                                res.json({ 
                                    status: true,   
                                    psg_data : position,                        
                                    drv_data: team                  
                                });                         
                                }
                            }
                    )
                //}
            }
        }
    )

    /*
    example : http://stackoverflow.com/questions/16584921/how-to-query-two-collection-in-mongoose-on-nodejs  for Mongoose   
     action(function getpositions(req){
     var namearray = [];
     NHLPlayerStatsDaily.find ({"created_at": {$gt: new Date(y+"-"+m+"-"+d)}}, function(err,position){
        if(!err)
        { 
        for (i=0;i< position.length; i++)
        {  
            var obj = JSON.stringify(position[i]);
            var pos = JSON.parse(obj);

            var p = pos["player_stats_daily"]["content"]["team_sport_content"]["league_content"]["season_content"]["team_content"]["team"]["id"]
            NHLTeam.find({"sdi_team_id": p}, "first_name nick_name short_name sport_id", function(err, team){
                     if (!err){
                        var obj = JSON.stringify(team);
                        var pos = JSON.parse(obj);
                        namearray.push(team)
                       }
                })
            }
          return send(namearray);
        }
          })
           })

    NHLPlayerStatsDaily.find ({"created_at": {$gt: new Date(y+"-"+m+"-"+d)}}, function(err,position){
      if(!err)
      { 
        var total = position.length;

        for (i=0;i< position.length; i++)
        {  
          var obj = JSON.stringify(position[i]);
          var pos = JSON.parse(obj);

          var p = pos["player_stats_daily"]["content"]["team_sport_content"]["league_content"]["season_content"]["team_content"]["team"]["id"]
          NHLTeam.find({"sdi_team_id": p}, "first_name nick_name short_name sport_id", function(err, team){
            total--;
            if (!err){
              var obj = JSON.stringify(team);
              var pos = JSON.parse(obj);
              namearray.push(team);
            }
            if(total == 0)
                send(namearray);
          })
        }

      }
    })



    example : select from 2 tables without Map reduce // http://stackoverflow.com/questions/6502541/mongodb-query-multiple-collections-at-once
    users
    {
     "_id":"12345",
     "admin":1
    },
    {
     "_id":"123456789",
     "admin":0
    }

    posts
    {
     "content":"Some content",
     "owner_id":"12345",
     "via":"facebook"
    },
    {
     "content":"Some other content",
     "owner_id":"123456789",
     "via":"facebook"
    }

    var myCursor = db.users.find({admin:1});
    var user_id = myCursor.hasNext() ? myCursor.next() : null;
        db.passengers.find({owner_id : user_id._id});

    posts
    {
     "content":"Some content",
     "user":{"_id":"12345", "admin":1},
     "via":"facebook"
    },
    {
     "content":"Some other content",
     "user":{"_id":"123456789", "admin":0},
     "via":"facebook"
    }   
    */  
}
