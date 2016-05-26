
var config = require('../../config/func').production ;
var mongoose = require('mongoose') ;
var DriversModel = mongoose.model('DriversModel') ;
var SocketsModel = mongoose.model('SocketsModel');

exports.getDriverOnline = function(socket) {
	return function(req, res) {

		var socketDriver = SocketsModel.find({ '_driver': { $ne: null } });
		
		socketDriver.populate('_driver');

		socketDriver.exec(function (err, response) {
			
			if (err) return handleError(err);

			res.json({
				status: true,
				data: response
			});
		});
	}
}