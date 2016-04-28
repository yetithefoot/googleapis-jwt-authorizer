var EventEmitter = require('events').EventEmitter;
var cron = require('cron');
var fs = require('fs');

module.exports = {

	/**
	 * Start service account auth flow. 
	 * @param  {[type]} params {key - path to key, email - service account email, scope - scope to authorize, cronTimePattern - can be used to set custom time interval}
	 * @return {Object} AuthClient.  
	 */
	init: function(params) {
		var self = this;

		if(!params.key) return console.error('Google Service Account key is required');
		if(!params.email) return console.error('Google Service Account email is required');
		if(!params.scopes) return console.error('Google Service Account scope is required');
		if(!params.googleapis) return console.error('googleapis is required');
		this.googleapis = params.googleapis;

		fs.readFile(params.key, {encoding: 'utf-8'}, function(err, data){
			if (!err){
				self.auth = new params.googleapis.auth.JWT(
					params.email,
					null, //this would be the path to to the key file
					data, //this is the key file's content
					params.scopes
				);
				var authJob = new cron.CronJob({
						cronTime: params.cronTimePattern || "0 */45 * * * *",
						onTick: self.authorize.bind(self)
					}); 
				authJob.start();
				self.authorize();
			}else{
				console.error('Google JWT Autentification failed', err);
			}
		});

		return self;
	},

	// setup cron to authorize auth client every N minutes
	authorize: function(){

		var self = this;

		// authorize service account
		self.auth.authorize(function(err, tokens) {
			if(err) {
				return console.error('Can\'t authorize Google Service Account', err);
			}
			console.log('Google Service Account authorized', tokens);
			self.googleapis.options({ auth: self.auth })
			self.events.emit('authorized', self.auth);
		});
	},

	// simplest way to do event emmiter
	events: new EventEmitter()
}
