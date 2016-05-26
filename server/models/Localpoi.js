var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Localpoi = new Schema(
	{
		created:	{ type: Date, default: Date.now } ,
		updated:	{ type: Date, default: Date.now } ,
		status:		{ type: Boolean, trim: true, default: true } ,
		iconimg:	{ type: String, trim: true, default: '' } ,
		poitype: 	{ type: Number, trim: true, default: '' } ,	// { 1: landmark, 2: parkinglocation }
		curloc:		{ type:Array, trim: true, default:[] } ,		// format  [ long,lat ]
		curlat:		{ type:Number, trim: true, default:'' } ,
		curlng:		{ type:Number, trim: true, default:'' } ,
		zipcode:     	{ type:Number, trim: true, default:'' } ,
		subdistrictid:	{ type: String, trim: true, default: '' } ,
		districtid: 	{ type: String, trim: true, default: '' } ,
		provinceid:	{ type: String, trim: true, default: '' } ,
		addr: 		{ type: String, trim: true, default: '' } ,
		name: 		{ type: String, trim: true, default: '' } 
	},
	{
		collection: 'localpoi', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('LocalpoiModel', Localpoi);