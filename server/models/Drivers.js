var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Drivers = new Schema(
	{
		created:		{ type: Date, default: Date.now } ,
		updated:		{ type: Date, default: Date.now } , 
		useappfreemsg:	{ type: String, trim: true, default: 'ช่วงโปรโมชั่น ใช้ฟรี ถึง 30 เม.ย.59' } , 		
		useappfree:		{ type: String, trim: true, default: 'N' } , 		
		updateprofilehistory: 	{ type: Array } ,					// Keep input update profile data
		expdategarage:	{ type: Date, default: Date.now  } , 			// Expired date สำหรับการใช้บริการ call center, default เป็น null
		moneygarage: 	{ type:Number, trim: true, default:0 } ,		// จำนวนเงินที่เหลือจริงๆในระบบสำหรับบริการ call center
		paymentgaragehistory:{ type: Array } ,					// เก็บประวัตการหักเงินสำหรับการใช้บริการ call center
		topupgaragehistory: 	{ type: Array } ,				  	//  เก็บประวัติการเติมเงินเข้าระบบสำหรับการใช้บริการ call center
		expdateapp: 		{ type: Date, default: Date.now  } , 			// Expired date สำหรับการใช้บริการ application, default เป็น null
		moneyapp: 		{ type:Number, trim: true, default:0 } ,  		// จำนวนเงินที่เหลือจริงๆในระบบสำหรับบริการ application
		paymentapphistory: 	{ type: Array } , 					// เก็บประวัตการหักเงินสำหรับการใช้บริการ application
		topupapphistory: 	{ type: Array } ,     					//  เก็บประวัติการเติมเงินเข้าระบบสำหรับการใช้บริการ application
		appversion: 		{ type: String, trimt: true, default: '1'} , 
		status:			{ type:String, trim: true, default:'PENDING' } ,	// PENDING > APPROVED > INACTIVE > OFF > ON > WAIT > BUSY > PICK // DPENDING, DEPENDING_REJECT
		psgtype: 		{ type:String, trim: true, default:'Person' } ,
		jobtype: 		{ type:String, trim: true, default:'' } ,
		psg_detail:  		{ type:String, trim: true, default:'' } ,
		psg_destination:  	{ type:String, trim: true, default:'' } ,
		psg_curaddr:  		{ type:String, trim: true, default:'' } ,
		msgstatus: 		{ type: String, trim: true, default: ''} ,	// msg status NEW: not read yet,  OLD: already read
		datereadmsg: 		{ type: Date} ,
		msgnote: 		{ type: String, trim: true, default: ''} ,
		msgphone: 		{ type: String, trim: true, default: ''} ,		
		active:			{ type:String, trim: true, default:'N' } ,	// activate by SMS
		smsconfirm:		{ type:String, trim: true, default:'0000' } ,		// random SMS
		grg_id:			{ type:String, trim: true, default:'' } ,	// garage id
		car_id:			{ type:String, trim: true, default:'' } ,	// taxi real car id 	
		psg_id: 		{ type:String, trim: true, default:'' } ,	// passenger id
		job_id:			{ type:String, trim: true, default:'' } ,
		car_no: 		{ type:String, trim: true, default:'' } ,	// car no : the car reference for  using of each garage
		brokenpicture:	{ type:Array, trim: true, default:[] } ,
		brokendetail:		{ type:String, trim: true, default:'' } ,
		brokenname:		{ type:Array, trim: true, default:[] } ,
		degree: 		{ type:Number, trim: true, default:'' } ,
		accuracy:		{ type:Number, trim: true, default:'' } ,
		curloc:			{ type:Array, trim: true, default:[] } ,	// created index:   db.drivers.createIndex({curloc:"2d"}) &  db.drivers.createIndex({ curloc : "2dsphere" }) 
		curlat:			{ type:Number, trim: true, default:'' } ,	
		curlng:			{ type:Number, trim: true, default:'' } ,
		imgczid:		{ type:String, trim: true, default:'' } ,	// รูปบัตรประชาชน
		imgcar: 		{ type:String, trim: true, default:'' } ,	// รูปรถ
		imglicence:		{ type:String, trim: true, default:'' } ,	// รูปบัตรติดหน้ารถ
		imgface:		{ type:String, trim: true, default:'' } ,	// รูปหน้าคนขับ
		carryon:		{ type:String, trim: true, default:'' } ,	// ขนของหรือไม => { 'Y','N'}่
		outbound:		{ type:String, trim: true, default:'' } ,	// รับงานเหมานอกพื้ื้นที่หรือไม่ => {'Y','N'}
		carcolor:		{ type:String, trim: true, default:'' } ,	// สีรถ
		cartype:		{ type:String, trim: true, default:'' } ,	// ชนิดของรถ => car, minican
		carprovince: 		{ type:String, trim: true, default:'' } ,	// จังหวัดที่จดทะเบียน
		carplate_formal:	{ type:String, trim: true, default:'' } ,	// ทะเบียนรถ แบบเต็ม
		carplate:		{ type:String, trim: true, default:'' } ,	// ทะเบียนรถ 
		english: 		{ type:String, trim: true, default:'' } ,	// พูดอังกฤษได้หรือไม่ => {'Y','N'}
    		zipcode: 		{ type:String, trim: true, default:'' } ,	// zipcode
    		tambon: 		{ type:String, trim: true, default:'' } ,	// tambon
    		district:  		{ type:String, trim: true, default:'' } ,	// district
    		province: 		{ type:String, trim: true, default:'' } ,	// province
    		address: 		{ type:String, trim: true, default:'' } ,	// address
		workstatus:		{ type:String, trim: true, default:'' } ,	// สถานะ ยัังขับอยู่ / ไม่ไ้ด้ขับแล้ว => {'Y','N'}
		workperiod:		{ type:String, trim: true, default:'' } ,	// ช่วงเวลาเช่า : เช้า-เย็น-ทั้งวัน => {'am','pm','all'}
		nname: 		{ type:String, trim: true, default:'' } ,	// ชื่อเล่น
		taxiID: 			{ type:String, trim: true, default:'' } ,	// บัตรประจำตัว Taxi 6 หลัก
		citizenid: 		{ type:String, trim: true, default:'' } ,  // บัตรประจำตัวประชาชน 13 หลัก
		careturnwhere: 	{ type:String, trim: true, default:'' } ,  // ส่งรถที่
		careturn: 		{ type:String, trim: true, default:'' } ,  // ส่งรถ (Y/N) => status => RETURNCAR
		carreturnwhere: 	{ type:String, trim: true, default:'' } ,  // ส่งรถที่
		carreturn: 		{ type:String, trim: true, default:'' } ,  // ส่งรถ (Y/N) => status => RETURNCAR
		allowpsgcontact:  	{ type:String, trim: true, default:'Y' } ,  // อนุญาติให้ผดส.ติดต่อหรือไม่ (Y/N)
		phone:			{ type:String, required: 'Please inset phone number', trim: true, default:'' } ,
		lname:			{ type:String, required: 'Please insert last name', trim: true, default:'' } ,
		fname:			{ type:String, required: 'Please insrt first name', trim: true, default:'' } ,
		device_id:		{ type:String, required: true, trim: true, default:'' },
		cprovincename: 	{ type:String, trim: true, default:'' } ,  
		cgroupname: 	  	{ type:String, trim: true, default:'' } ,  
		cgroup: 	  	{ type:String, trim: true, default:'' } ,  
		fb_id:			{ type:String, trim: true, default:'' } ,
		password:		{ type:String, trim: true, default:'' } ,	// Password 
		username:		{ type:String, trim: true, default:'' } 	// User name	
		//user:			{type: Schema.ObjectId, ref: 'User'}
	},
	{
		collection: 'drivers', 
		versionKey: false,
		strict : false
	}
);

mongoose.model('DriversModel', Drivers);