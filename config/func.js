
/* ------------------------------------------------
 *		Configuration
 * ------------------------------------------------ */

var CONFIG 	= require('./config.js');

module.exports = {
	
	/*=== production ======================================================*/

	production: {

		app_name: CONFIG.PRODUCTION.APP_NAME,

		app_version: CONFIG.PRODUCTION.APP_VERSION,

		PORT: CONFIG.PRODUCTION.SERVER_PORT,

		socketIoPort: CONFIG.PRODUCTION.SOCKETIO_PORT,

		database: {
			name: "",
			url: "mongodb://" + CONFIG.PRODUCTION.DB_HOST + ":" + CONFIG.PRODUCTION.DB_PORT + "/" + CONFIG.PRODUCTION.DB_NAME
		},
		
		passengerappversion : CONFIG.PRODUCTION.passengerappversion ,
		mobileappversion : CONFIG.PRODUCTION.mobileappversion ,

		testhostcallcenter : CONFIG.PRODUCTION.testhostcallcenter ,
		hostcallcenter : CONFIG.PRODUCTION.hostcallcenter ,		 

		smshostname : CONFIG.PRODUCTION.smshostname ,
		smshostport : CONFIG.PRODUCTION.smshostport ,
		smshostpath : CONFIG.PRODUCTION.smshostpath ,
		smshostmethod : CONFIG.PRODUCTION.smshostmethod ,
		smssender : CONFIG.PRODUCTION.smssender ,

		MoneyPerUse : CONFIG.PRODUCTION.MoneyPerUse ,
		TimePerUse : CONFIG.PRODUCTION.TimePerUse ,

		MoneyPerUseAPP : CONFIG.PRODUCTION.MoneyPerUseAPP ,
		TimePerUseAPP : CONFIG.PRODUCTION.TimePerUseAPP ,

		ccsearchpsgradian : CONFIG.PRODUCTION.ccsearchpsgradian ,
		ccsearchpsgamount : CONFIG.PRODUCTION.ccsearchpsgamount ,

		ccsearchdrvradian : CONFIG.PRODUCTION.ccsearchdrvradian ,
		ccsearchdrvamount : CONFIG.PRODUCTION.ccsearchdrvamount ,

		psgsearchpsgradian : CONFIG.PRODUCTION.psgsearchpsgradian ,
		psgsearchpsgamount  : CONFIG.PRODUCTION.psgsearchpsgamount ,

		drvsearchpsgradian : CONFIG.PRODUCTION.drvsearchpsgradian ,
		drvsearchpsgamount  : CONFIG.PRODUCTION.drvsearchpsgamount ,

		uploadsPath: CONFIG.PRODUCTION.UPLOADS_PATH ,		

		DistoShowPhone : CONFIG.PRODUCTION.DistoShowPhone,

		ccgroupNSP : CONFIG.PRODUCTION.ccgroupNSP 

	}
	
}