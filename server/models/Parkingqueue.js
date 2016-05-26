var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Parkingqueue = new Schema(
	{
		created:		{ type: Date, default: Date.now } ,
		status: 		{ type: String, default: 'Y' },
		createdby:		{ type: String, default: ''} , 		// username of admin who created this parking
		drv_queue: 		{ type: Number } ,
		drv_id: 		{ type: String, trim: true, default:'' } ,		
		parkinglot:		{ type: String, trim: true, default:'' } ,		// Parkinglot's name 
		parking_id:		{ type: String, trim: true, default:'' } ,		// Parkinglot's id for reference
		cgroup:		{ type: String, trim: true, default:'' } 		// name of group who own this Parkingqueue 
		//user:			{type: Schema.ObjectId, ref: 'User'}
	},
	{
		collection: 'parkingqueue', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('ParkingqueueModel', Parkingqueue);