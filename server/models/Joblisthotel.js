var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Joblisthotel = new Schema(
	{
		created:		{ type: Date, default: Date.now } ,		
		updated:		{ type:Date, default: Date.now } ,		
		drvcancelwhere: 	{ type:String, trim: true, default:'' } ,
		datedrvcancel: 	{ type: Date } ,
		psgcancelwhere: 	{ type:String, trim: true, default:'' } ,
		datepsgcancel: 	{ type: Date } ,
		datepsgthanks: 	{ type: Date } ,
		datedrvdrop: 		{ type: Date } ,
		datedrvpick: 		{ type: Date } ,		
		datepsgaccept: 	{ type: Date } ,		
		datedrvwait: 		{ type: Date } ,	
		datepsgcall:		{ type: Date } ,
		createdvia: 		{ type: String } ,
		jobhistory:     		{} ,
		deniedTaxiIds: 	{ type:Array, trim: true, default:[]} ,
		cgroup: 		{ type:String, trim: true, default:'' } ,
		detail:			{ type:String, trim: true, default:'' } ,
		status:			{ type:String, trim: true, default:'ON' } ,
		favcartype:		{ type:Array, trim: true, default:[] } ,
		tips:			{ type:String, trim: true, default:'' } ,
		desloc:			{ type:Array, trim: true, default:[] } ,			// for drop off location [ lng,lat ]
		deslat:			{ type:Number, trim: true, default:'' } ,
		deslng:			{ type:Number, trim: true, default:'' } ,
		destination:		{ type:String, trim: true, default:'' } ,
		curloc:			{ type:Array, trim: true, default:[] } ,			// created index:   db.Joblisthotel.createIndex({curloc:"2d"}) &  db.Joblisthotel.createIndex({ curloc : "2dsphere" }) 
		curlat:			{ type:Number, trim: true, default:'' } ,
		curlng:			{ type:Number, trim: true, default:'' } ,
		curaddr:		{ type:String, trim: true, default:'' } ,
		path:  			[ { lnglat: [] , timestamp:  { type: Date, default: Date.now } } ] ,
		drv_carplate: 		{ type:String, trim: true, default:'' } ,
		drv_phone: 		{ type:String, trim: true, default:'' } ,
		drv_name: 		{ type:String, trim: true, default:'' } ,
		drv_device_id:	 	{ type:String, trim: true, default:'' } ,
		drv_id:			{ type:String, trim: true, default:'' } ,
		psg_phone: 		{ type:String, trim: true, default:'' } ,
		psg_name: 		{ type:String, trim: true, default:'' } ,	
		hotel_phone: 		{ type:String, trim: true, default:'' } ,
		displayName: 		{ type:String, trim: true, default:'' } ,
		hotel_id:		{ type:String, trim: true, default:'' } ,
		job_id: 		{ type:String, trim: true, default:'' } 		
	},
	{
		collection: 'joblisthotel', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('JoblisthotelModel', Joblisthotel);