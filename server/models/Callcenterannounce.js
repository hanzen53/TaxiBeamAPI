var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Callcenterannounce = new Schema({

	createdby:		{type: String, trim: true },
	created:		{type: Date, trim: true, default: Date.now},
	updated:		{type: Date, trim: true, default: Date.now},
	expired:		{type: Date, trim: true, default: Date.now},
	status:			{type:String, trim: true, default:'N'},
	detail:			{type:String, trim: true, default:''},
	topic:			{type:String, trim: true, default:''},
	detailEn:		{type:String, trim: true, default:''},
	topicEn:		{type:String, trim: true, default:''},	
	anntype:		{type:String, trim: true, default:''}	// data : { DRV / PSG }

},
{
	collection: 'callcenterannounce', 
	versionKey: false,
	strict : false
}
);

mongoose.model('CallcenterannounceModel', Callcenterannounce);
