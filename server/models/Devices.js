var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var Device = new Schema({
	uid: String,
	//name: String,
	carLicense: String,
	latitude: Number,
	longitude: Number,
	distance: Number,
	detail: String,
	passengerID: String,
	status: Number,
	direction: {
		accuracy: Number,
		degree: Number
	},
	carType : String,
	timeStamp : Number,
	phoneNumber: String,
	action: String,
	
	altitude : String,
	light: String,
    carSpeed  : String,
	
	accelerometer: String,
	decibels : String,
	taxiName : String,
	user_id : String,
	carColor : String,
	Spamstatus : Number
	
},
{
	collection: 'devices',
	versionKey: false,
	strict : false
}
);

mongoose.model('DeviceModel', Device);