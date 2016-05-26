var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ErrCode = new Schema({

	created:	{type: Date, default: Date.now},
	updated:	{type: Date, default: Date.now},
	status:		{type:Boolean, trim: true, default:true},
	desc:		{type:String, trim: true, default:''},
	erren:		{type:String, trim: true, default:''},
	errth:		{type:String, trim: true, default:''},
	errcode:	{type:String, trim: true, default:''}

},
{
	collection: 'errorcode', 
	versionKey: false,
	strict : false
}
);

mongoose.model('ErrorcodeModel', ErrCode);
