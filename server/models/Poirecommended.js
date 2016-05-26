var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Poirecommended = new Schema(
	{

		createdby:		{ type: String, trim: true },
		updated:		{ type: Date, trim: true, default: Date.now },
		created:		{ type: Date, trim: true, default: Date.now },
		parkingtype:		{ type:String, trim: true, default:'' },
		cgroup:		{ type:String, trim: true, default:'' },
		parkinglot:		{ type:String, trim: true, default:'' },
		curloc:			{ type:Array, trim: true, default:[] } ,
		parkingname:		{ type:String, trim: true, default:'' }

	},
	{
		collection: 'poirecommended', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('PoirecommendedModel', Poirecommended);