var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

	var Sockets = new Schema({
		driverId: { type: String },
		socketId: { type: String },
		_driver : { type: Schema.Types.ObjectId, ref: 'DriversModel' }
	},
	{
		collection: 'Socket', 
		versionKey: false,
		strict : false
	});

mongoose.model('SocketsModel', Sockets);