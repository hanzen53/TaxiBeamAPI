var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Comment = new Schema({

	created:		{type: Date, default: Date.now},
	updated:		{type: Date, default: Date.now},
	comment:		{type:String, trim: true, default:''},
	topic:			{type:String, trim: true, default:''},
	device_id:		{type:String, trim: true, default:''},
	user_id: 		{type:String, trim: true, default:''},
	commtype:		{type:String, trim: true, default:''}

},
{
	collection: 'comments', 
	versionKey: false,
	strict : false
}
);

mongoose.model('CommentModel', Comment);
