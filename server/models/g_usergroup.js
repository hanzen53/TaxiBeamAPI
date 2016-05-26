var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var G_usergroup = new Schema(
	{
		created:	{ type:Date, default: Date.now } ,
		updated:	{ type:Date, default: Date.now } ,
		status:		{ type:String, trim: true, default:'OFF' } ,
		group:      { type:String, trim: true, default:'user'} ,
		topon:		{ type:Array, trim: true, default:'user' } ,		
		remark:		{type: Schema.ObjectId, ref: 'User'}
	},
	{
		collection: 'g_usergroup',
		versionKey: false,
		strict: false
	}
);

//--------->> mongoose.model('PassengerModel', Passenger);


// create the model for users and expose it to our app
module.exports = mongoose.model('G_usergroupModel', G_usergroup);