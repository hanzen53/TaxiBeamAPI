var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var PathLog = new Schema({
	uid: String,
	name: String,
	carLicense: String,
	lat: Number,
	lon: Number,
	distance: Number,
	detail: String,
	passengerID: String,
	status: Number,
	direction: {
		accuracy: Number,
		degree: Number
	},
	action: String,
	timeStamp: Date
},
{
	collection: 'pathLog',
	versionKey: false,
	strict : false
}
);

mongoose.model('TripLogModel', PathLog);