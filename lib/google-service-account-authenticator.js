var google = require('googleapis');
var cron = require('cron');
// service account authClient - will use for all interactions with users' GD
var fs = require('fs');

module.exports = {

	auth: undefined,
	/**
	 * Start service account auth flow. 
	 * @param  {[type]} params {key - path to key, email - service account email, scope - scope to authorize, cronTimePattern - can be used to set custom time interval}
	 * @return {Object} AuthClient.  
	 */
	init: function(params) {
		var self = this;

		if(!params.key) return console.error('Google Service Account key is required');
		if(!params.email) return console.error('Google Service Account email is required');
		if(!params.scope) return console.error('Google Service Account scope is required');

		fs.readFile(params.key, {encoding: 'utf-8'}, function(err, data){
			if (!err){
				self.auth = new google.auth.JWT(
					params.email,
					null,                               //this would be the path to to the key file
					data,                               //this is the key file's content
					params.scope
				);
				// setup cron to authorize auth client every 30 minutes
				var authorizeServiceAccount = function(){
					// authorize service account
					self.auth.authorize(function(err, tokens) {
						if(err) console.error('Can\'t authorize Google Service Account', err);
						console.log('Google Service Account authorized', tokens);
						google.options({ auth: self.auth })
					})
				}

				var authJob = new cron.CronJob({
						cronTime: params.cronTimePattern || "0 */15 * * * *",
						onTick: authorizeServiceAccount
					}); 
				authJob.start();
				authorizeServiceAccount();

			}else{
				console.error('Google JWT Autentification failed', err);
			}
		})
	}
}
