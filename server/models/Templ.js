var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Templ = new Schema(
	{
		created:	            { type: Date, default: Date.now } ,
		updated:	{ type: Date, default: Date.now } , 
		expdate: 	{ type: Date, default: Date.now } ,
		groupacc:         { type: Array, trim: true , default: ''} ,
		templtype: 	{ type: String, trim: true, default: ''} ,
		title: 	            {type: Array }   ,
		name:		{ type:String, trim: true, default:'PENDING' } ,	// PENDING > APPROVED > INACTIVE > OFF > ON > WAIT > BUSY > PICK
		url: 		{ type: String, trim: true, default: ''} ,	// msg status NEW: not read yet,  OLD: already read
		coll: 		{ type: String, trim: true, default: ''} ,
		json: 		{ type: Array, trim: true, default: ''} ,		

		//user:			{type: Schema.ObjectId, ref: 'User'}
	},
	{
		collection: 'templ', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('TemplModel', Templ);