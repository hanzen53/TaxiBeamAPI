var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');
//var Passenger = mongoose.Schema({
var Passenger = new Schema(
	{
		created:	{ type:Date, default: Date.now } ,
		updated:	{ type:Date, default: Date.now } ,
		createdjob:	{ type:Date } ,						// Date of create current task or date for the advance task
		appversion:	{ type: String, trimt: true, default: '1'} , 
		triggermodal: 	{ type:String, trim: true, default: ''} ,
		jobtype: 	{ type:String, trim: true, default:'' } ,			// [ "QUEUE", "ADVANCE"]		
		status:		{ type:String, trim: true, default:'OFF' } ,			// [ "OFF","ON","WAIT","BUSY","THANKS","INITIATE","DPENDING","ASSIGNED"]
		deniedTaxiIds:{ type:Array, trim: true, default:[]} ,			
		drv_carplate:	{ type:String, trim: true, default:'' } ,			// drv_carplate  for assigned task to the car which is not in the system.
		drv_id:		{ type:String, trim: true, default:'' } ,
		favdrv:		{ type:Array, trim: true, default:[] } ,
		favcartype:	{ type:Array, trim: true, default:[] } ,
		detail:		{ type:String, trim: true, default:'' } ,
		tips:		{ type:Number, trim: true, default:'' } ,
		desloc:		{ type:Array, trim: true, default:[] } ,
		deslat:		{ type:Number, trim: true, default:'' } ,
		deslng:		{ type:Number, trim: true, default:'' } ,
		des_dist:	{ type:Number, trim: true, default:'' } ,
		destination:	{ type:String, trim: true, default:'' } ,
		curloc:		{ type:Array, trim: true, default:[] } ,			// created index:   db.passengers.createIndex({curloc:"2d"}) &  db.passengers.createIndex({ curloc : "2dsphere" }) 
		curlat:		{ type:Number, trim: true, default:'' } ,			// for pick up latitude
		curlng:		{ type:Number, trim: true, default:'' } ,			// for pick up longitude
		realloc:		{ type:Array, trim: true, default:[] } ,			// real time position
		reallat:		{ type:Number, trim: true, default:'' } ,			// real time latitude
		reallng:		{ type:Number, trim: true, default:'' } ,			// real time logitude
		curaddr:	{ type:String, trim: true, default:'' } ,
		createdvia:	{ type:String, trim: true, default:'MOBILE' } ,		// This passenger has been  created via MOBILE or CALLCENTER
		psgtype: 	{ type:String, trim: true, default:'Person' } ,		// psg type: Person, Hotel
		phone:		{ type:String, trim: true, default:'' } ,
		pictureprofile: 	{ type:String, trim: true, default:'' } ,		
		email:		{ type:String, trim: true, default:'' } ,
		gender:	{ type:String, trim: true, default:'' } ,
		lname: 	{ type:String, trim: true, default:'' } ,
		fname: 	{ type:String, trim: true, default:'' } ,
		displayName: 	{ type:String, trim: true, default:'' } ,
		job_id: 	{ type:String, trim: true, default:'' } ,
		device_id:	{ type:String, trim: true, default:'' } ,
    		local            : {
    			username : String ,
        			email : String,
        			password : String,
    		},
    		facebook         : {
        			id : String,
        			token : String,
        			email : String,
        			name : String,
        			displayName : String,
        			pictureprofile: String,
        			username: String,
        			about: String,
        			gender: String,
        			first_name: String,
        			last_name: String
    		},
    		twitter          : {
        			id : String,
        			token : String,
        			displayName : String,
        			username : String
    		},
    		google           : {
        			id : String,
        			token : String,
        			email  : String,
        			name : String,
        			give_name: String,
        			family_name: String,
        			link: String,
        			picture: String,
        			gender: String,
        			locale: String,
        			hd: String
    		}

		//user:		{type: Schema.ObjectId, ref: 'User'}
	},
	{
		collection: 'passengers',
		versionKey: false,
		strict: false
	}
);

//--------->> mongoose.model('PassengerModel', Passenger);
//https://scotch.io/tutorials/easy-node-authentication-setup-and-local
// generating a hash
Passenger.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);    
};

// checking if password is valid
Passenger.methods.validPassword = function(password) {    
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('PassengerModel', Passenger);