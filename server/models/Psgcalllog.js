var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Psgcalllog = new Schema(
	{
		created:	{ type: Date, default: Date.now } ,
		callby: 		{ type:String, required: true, trim: true, default:'' } ,
		drv_carplate:	{ type:String, required: true, trim: true, default:'' } ,
		drv_phone:	{ type:String, required: true, trim: true, default:'' } ,
		drv_id:		{ type:String, required: true, trim: true, default:'' } ,
		psg_phone:	{ type:String, required: true, trim: true, default:'' } ,
		psg_device_id: { type:String, required: true, trim: true, default:'' } ,
		psg_id:		{ type:String, required: true, trim: true, default:'' }
	},
	{
		collection: 'psgcalllog', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('PsgcalllogModel', Psgcalllog);