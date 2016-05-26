var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');
//var Passenger = mongoose.Schema({
var Hotels = new Schema(
	{
		created:	{ type:Date, default: Date.now } ,
		updated:	{ type:Date, default: Date.now } ,
		//status:		{ type:String, trim: true, default:'OFF' } ,			// [ "OFF","ON","WAIT","BUSY","THANKS","INITIATE","DPENDING","ASSIGNED"]
		detail:		{ type:String, trim: true, default:'' } ,
		curloc:		{ type:Array, trim: true, default:[] } ,			// created index:   db.hotels.createIndex({curloc:"2d"}) &  db.hotels.createIndex({ curloc : "2dsphere" }) 
		curlat:		{ type:Number, trim: true, default:'' } ,			// for pick up latitude
		curlng:		{ type:Number, trim: true, default:'' } ,			// for pick up longitude
		curaddr:	{ type:String, trim: true, default:'' } ,
		createdvia:	{ type:String, trim: true, default:'MOBILE' } ,		// This passenger has been  created via MOBILE or CALLCENTER		
		phone:		{ type:String, trim: true, default:'' } ,
		pictureprofile: 	{ type:String, trim: true, default:'' } ,		
		email:		{ type:String, trim: true, default:'' } ,
		displayName: 	{ type:String, trim: true, default:'' } ,		
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
		collection: 'hotels',
		versionKey: false,
		strict: false
	}
);

// create the model for users and expose it to our app
module.exports = mongoose.model('HotelsModel', Hotels);