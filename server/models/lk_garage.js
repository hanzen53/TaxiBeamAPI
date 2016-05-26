var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var lk_garage = new Schema(
	{		
		cprovincename: 	{ type:String, trim: true, default:''} ,
		cgroupname: 		{ type:String, trim: true, default:''} ,
		verson: 		{ type: String, trim:true, default:''} ,
		iconurl: 		{ type: String, trim:true, default:''} ,
		phone2: 		{ type:String, trim: true, default:''} ,
		phone: 		{ type:String, trim: true, default:''} ,
		province:     		{ type:String, trim: true, default:''} ,
		fullname: 		{ type:String, trim: true, default:''} ,
		name:			{ type:Array, trim: true, default:'' } ,		
		cgroup: 		{ type: String, trim:true, default:''} 
	},
	{
		collection: 'lk_garage',
		versionKey: false,
		strict: false
	}
);

// create the model for users and expose it to our app
module.exports = mongoose.model('Lk_garageModel', lk_garage);