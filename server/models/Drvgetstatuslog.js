var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Drvgetstatuslog = new Schema(
	{
		created:	{ type: Date, default: Date.now },
		psg_id: 	{ type: String },
		device_id: 	{ type: String},
		drv_id: 	{ type: String}
	},
	{
		collection: 'drvgetstatuslog', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('DrvgetstatuslogModel', Drvgetstatuslog);
