var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Cars = new Schema(
	{
		created:		{type: Date, default: Date.now},
		updated:		{type: Date, default: Date.now},
		status:			{type:String, trim: true, default:'OFF'},
		active:			{type:String, trim: true, default:'Y'},		
		owner_id:		{type:String, trim: true, default:''},	// taxi id 		
		imgcar: 		{type:String, trim: true, default:''},	// รูปรถ
		carcolor:		{type:Number, trim: true, default:''},	// สีรถ
		cartype:		{type:String, trim: true, default:''},	// ชนิดของรถ => car, minican
		carplate:		{type:String, trim: true, default:''}	// ทะเบียนรถ 		
	},
	{
		collection: 'cars', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('CarsModel', Cars);