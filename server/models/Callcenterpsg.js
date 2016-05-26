var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var Callcenterpsg = new Schema(
	{
		created:		{ type:Date, default: Date.now } ,
		updated:		{ type:Date, default: Date.now } ,
		cccommentby: 	{ type:String, trim: true, default:'' } ,				// 
		cccommenttype: 	{ type:String, trim: true, default:'' } ,				// 
		cccomment:  		{ type:String, trim: true, default:'' } ,				// 
		deletejobby: 		{ type:String, trim: true, default:'' } ,				// 
		datedeletejob:  	{ type: Date} ,	
		datereadmsg: 		{ type: Date} ,				// Date driver read msg Y/N
		editingby: 		{ type: String } , 				// username of admin who set edit job
		assignlineby: 		{ type: String } , 				// username of admin who set assign line job 
		assigningby: 		{ type: String } , 				// username of admin who set assigning job
		dassignedjob:		{ type:Date } ,					// Date of assigning job to a driver		
		dpendingjob:		{ type:Date } ,					// Date of Sending Job to a driver		
		createdby: 		{ type:String } , 					// username of admin who created job
		createdjob:		{ type:Date } ,						// Date of create current task or date for the advance task
		appversion:		{ type: String, trimt: true, default: '1'} , 
		triggermodal: 		{ type:String, trim: true, default: ''} ,
		jobhistory: 		{ type:Array, trim: true, default:[]} ,
		jobtype: 		{ type:String, trim: true, default:'' } ,			// [ "QUEUE", "ADVANCE"]		
		status:			{ type:String, trim: true, default:'OFF' } ,		// [ "OFF","ON","WAIT","BUSY","THANKS","INITIATE","DPENDING","ASSIGNED"]		
		acceptedTaxiIds: 	{ type:Array, trim: true, default:[]} ,			// Accept job by 
		deniedTaxiIds: 	{ type:Array, trim: true, default:[]} ,			// Denied job by
		drv_carplate:		{ type:String, trim: true, default:'' } ,			// drv_carplate  for assigned task to the car which is not in the system.
		drv_id:			{ type:String, trim: true, default:'' } ,
		job_id:			{ type:String, trim: true, default:'' } ,
		favdrv:			{ type:Array, trim: true, default:[] } ,
		favcartype:		{ type:Array, trim: true, default:[] } ,
		detail:			{ type:String, trim: true, default:'' } ,
		tips:			{ type:Number, trim: true, default:'' } ,
		desloc:			{ type:Array, trim: true, default:[] } ,
		deslat:			{ type:Number, trim: true, default:'' } ,
		deslng:			{ type:Number, trim: true, default:'' } ,
		des_dist:		{ type:Number, trim: true, default:'' } ,
		destination:		{ type:String, trim: true, default:'' } ,
		curloc:			{ type:Array, trim: true, default:[] } ,			// for pick up location 
		curlat:			{ type:Number, trim: true, default:'' } ,		// for pick up latitude
		curlng:			{ type:Number, trim: true, default:'' } ,		// for pick up longitude
		realloc:			{ type:Array, trim: true, default:[] } ,			// real time position
		reallat:			{ type:Number, trim: true, default:'' } ,		// real time latitude
		reallng:			{ type:Number, trim: true, default:'' } ,		// real time logitude
		curaddr:		{ type:String, trim: true, default:'' } ,
		provincearea: 		{} ,
		iscontractjob: 		{ type:String, trim: true, default:'' } ,			// isContractJob : -1 ผู้โดยสารทั่ว,  1 โรงแรม/อื่นๆ		
		createdvia:		{ type:String, trim: true, default:'CALLCENTER' } ,		// This passenger has been  created via MOBILE or CALLCENTER		
		phone:			{ type:String, trim: true, default:'' } ,
		ccstation: 		{ type:String, time: true, default:'' } ,				// Callcenter Station Number
		fb_id:			{ type:String, trim: true, default:'' } ,
		cgroup:  		{ type:String, trim: true, default:'' } ,			// cgroup from callcenter login
		password:		{ type:String, trim: true, default:'' } ,
		email:			{ type:String, trim: true, default:'' } ,
		device_id:		{ type:String, required: 'Please enter device id ', trim: true, default:'' }
		//user:		{type: Schema.ObjectId, ref: 'User'}
	},
	{
		collection: 'callcenterpsg',
		versionKey: false,
		strict: false
	}
);

// create the model for users and expose it to our app
module.exports = mongoose.model('CallcenterpsgModel', Callcenterpsg);