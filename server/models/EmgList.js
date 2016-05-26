var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var EmgList = new Schema({

	created:		{type: Date, default: Date.now},
	updated:		{type: Date, default: Date.now},
	emgimg:			{type:String, trim: true, default:''},
	status:			{type:String, trim: true, default:'N'},
	phone:			{type:String, trim: true, default:''},
	name:			{type:String, trim: true, default:''},
	emgtype:		{type:String, trim: true, default:''}

},
{
	collection: 'emglist', 
	versionKey: false,
	strict : false
}
);

mongoose.model('EmgListModel', EmgList);
