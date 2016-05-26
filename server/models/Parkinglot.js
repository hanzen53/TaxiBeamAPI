var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Parkinglot = new Schema(
	{
		created:		{ type: Date, default: Date.now } ,
		status: 		{ type: String, default: 'Y' },
		createdby:		{ type: String, default: ''} , 		// username of admin who created this parking		
		iconimage: 		{ type: String, trim: true, default:'' } ,
		radian: 		{ type: Number, trim: true, default:'' } ,	// number of radian in meters
		curloc: 		{ type: Array, trim: true, default:[] } ,		// donot created 2d sphere for this field  **** 2d index is not working *** user 2d sphere  do not forget  => db.parkinglot.createIndex( { parkloc : "2dsphere" } )
		parkinglot:		{ type: String, trim: true, default:'' } ,		// Parkinglot's name 
		cgroup:		{ type: String, trim: true, default:'' } 		// name of group who own this parkinglot 
		//user:			{type: Schema.ObjectId, ref: 'User'}
	},
	{
		collection: 'parkinglot', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('ParkinglotModel', Parkinglot);