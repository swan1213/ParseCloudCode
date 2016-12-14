// 
// job.js
// 
//
// Created by Albert Chen on 03/15/2014
// Copyright (c) 2014 Albert Chen. All rights reserved.

var constants = require('cloud/constants.js'),
	mailUtil  = require('cloud/mail_util.js'),
	_ 		  = require('underscore');

/*
 *
 */
Parse.Cloud.job("sendDailyNewsletterEmail", function (request, status) 
{
	Parse.Cloud.useMasterKey();

	 //Daily Push Notif
    Parse.Push.send({
      channels: [ "global" ],
      data: {
         alert: "Cloud Code Job! Check out our new product Today!", "sound": ""
      }
    }, { success: function() { 
      // success!
      }, error: function(err) { 
        console.log(err);
      }
    });

    var item;

    Parse.Promise.as().then(function()
	{
		// Fetch new item
		var query = mailUtil.getDailyNewsletterItemQuery();
		return query.first().then(null, function(error)
		{
			console.log(error.code + " : " + error.message);	
		});
	}).then(function(result)
	{
		item = result;

		if (!item)
		{
			console.log("No need to send Daily Newsletter Email.\n" + 
						"	Reason: There is no item uploaded today.");
			return;
		}

		// Fetch all users
		var query = new Parse.Query(Parse.User);
		return query.find().then(null, function(error)
		{
			console.log(error.code + " : " + error.message);
		});
	}).then(function(users)
	{
		var promise = Parse.Promise.as();

		_.each(users, function(user)
		{
			promise = promise.then(function()
			{
				return mailUtil.sendDailyNewsletterEmail(
				{
					user: user,
					item: item,
				});
			}).then(function()
			{

			}, function(error)
			{
				console.log(error.code + " : " + error.message);
			});
		});
		return promise;
	}).then(function()
	{	
		// Set the job's success status
    	status.success(mailUtil.successfulMessage4DailyNewsletterEmail({
    		item: item,
    	}));
  	}, function(error) {
    	// Set the job's error status
    	status.error("Uh oh, something went wrong.");
  	});
});