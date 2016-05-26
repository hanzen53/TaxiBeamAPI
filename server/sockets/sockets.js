var config = require('../../config/func').production;
var mongoose = require('mongoose') ;

var SocketsModel = mongoose.model('SocketsModel');
var Lk_garageModel = mongoose.model('Lk_garageModel') ;

module.exports = function (io) {
    // 'use strict';

    var handler = function (socket) {

        var state = [];

        socket.on("message", function(data) {
            socket.broadcast.emit("message", data);
        });

        socket.on('radio', function (data) {
            socket.broadcast.emit('voice', data);
            console.log('voice incomming');
        });
        
        socket.on('inline edit', function (data) {
            state.push(data);
            socket.broadcast.emit('inline edit', data);
        });
        
        socket.on('unlock line', function (data) {
            state = state.filter(function (task) {
                return task.id !== data.id;
            });
            
            socket.broadcast.emit('unlock line', data);
        });
        
        socket.on('assigning task', function (data) {
            state.push(data);
            console.log(state.length);
            socket.broadcast.emit('assigning task', data);
        });
        
        socket.on('update state', function (data) {
            if (state.length > 0) {
                state = state.filter(function (task) {
                    if (task.user.username === data.user.username) {
                        socket.broadcast.emit('unlock line', task);
                    }
                    return task.user.username !== data.user.username;
                });
            }
            socket.emit('update state', state);
        });
        
        socket.on('window beforeunload', function (data) {
            if (state.length > 0) {
                state = state.filter(function (task) {
                    if (task.user.username === data.username) {
                        socket.broadcast.emit('unlock line', task);
                    }
                    return task.user.username !== data.username;
                });
            }
        });

        socket.on("driver logged in", function(data) {

            SocketsModel.create({ socketId: socket.id, _driver: data.id }, function(err, res) {

                if(err) return handlerError(err);

                var socketDriver = SocketsModel.findOne({ '_driver': data.id });

                socketDriver.populate('_driver');

                socketDriver.exec(function (err, response) {

                    if (err) return handleError(err);

                    socket.broadcast.emit('driver logged in', response);
                });
            });
        });
    };

    Lk_garageModel.find(
        { },
        { _id:0, cgroup:1 },
        function(err, response) {
            if (response == 0) {
                groups = "";
            } else {
                groups = response;
                //console.log(groups)
                groups.filter(function (group) {

                    group.socket = io.of('/' + group.cgroup);

                    group.socket.on("connection", function (socket) {

                        socket.on('disconnect', function() {

                            console.log('one user disconnected ' + socket.id);

                            SocketsModel.remove({ socketId: socket.id }, function(err, res) {
                                if(err) return handlerError(err);

                                socket.broadcast.emit('driver logged out', socket.id);

                                return;
                            });

                        });

                        var handlerObj = new handler(socket);
                    });
                });
            }
        }
    );


    io.on('connection', function(socket) {

        socket.on('PassengerSocketOn', function(data) {
          socket.broadcast.emit('PassengerSocketOn', data);
        });      

        socket.on('DriverSocketOn', function(data) {
          socket.broadcast.emit('DriverSocketOn', data);
        });  

        socket.on('driverGetStatusSocketOn', function(data) {
          socket.broadcast.emit('driverGetStatusSocketOn', data);
        });  

        socket.on('HotelSocketOn', function(data) {
          socket.broadcast.emit('HotelSocketOn', data);
        });  


        socket.on("PsgLiveSocket", function(data) {
            console.log('one passenger live1 : ' + socket.id);
            console.log('one passenger live2 : ' + socket._id);
            SocketsModel.create({ socketId: socket.id, _driver: data._id }, function(err, res) {
                // if(err) return handlerError(err);
                // var socketDriver = SocketsModel.findOne({ '_driver': data._id });
                // socketDriver.populate('_driver');
                // socketDriver.exec(function (err, response) {
                //     if (err) return handleError(err);
                //     socket.broadcast.emit('driver logged in', response);
                // });
            });
        });


        socket.on('disconnect', function() {
            console.log('one passenger disconnected : ' + socket.id);
            SocketsModel.remove({ socketId: socket.id }, function(err, res) {
                // if(err) return handlerError(err);
                // socket.broadcast.emit('driver logged out', socket.id);
                // return;
            });
        });


    });


// socket.on( 'connect', function() {

// });

// socket.on( 'disconnect', function() {

// });

// socket.on( 'connect_failed', function() {

// });

// socket.on( 'error', function() {

// });

};