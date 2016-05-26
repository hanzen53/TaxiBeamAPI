var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DrvLog = new Schema(
	{
		triplog: { type: Array },
		action: { type: String },
		drv_id: { type: String }
	},
	{
		collection: 'drvLog',
		versionKey: false,
		strict : false
	}
);

mongoose.model('DrvLogModel_old', DrvLog);