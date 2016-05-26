var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DrvLog = new Schema(
	{
		created:		{ type: Date, default: Date.now } ,
		updated:		{ type: Date, default: Date.now } ,
		status:			{ type:String, trim: true, default:'OFF' } ,	
		//tripspath: 		{ type:Array, trim: true, default:[] } ,		
		path:  [ {   lnglat: [ ] , timestamp:  { type: Date, default: Date.now }  } ],	
		drv_id:			{ type:String, required: true, trim: true, default:'' } ,		
		drv_device_id:	{ type:String, required: true, trim: true, default:'' }
	},
	{
		collection: 'drvlog', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('DrvLogModel', DrvLog);