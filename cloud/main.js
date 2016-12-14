// 
// main.js
// 
//
// Created by Albert Chen on 03/15/2014
// Copyright (c) 2014 Albert Chen. All rights reserved.

require('cloud/job.js');

var constants = require('cloud/constants.js'),
	mailUtil  = require('cloud/mail_util.js'),
	_ 		  = require('underscore');

/*
 *
 */
Parse.Cloud.afterSave(Parse.User, function(request) 
{
	Parse.Cloud.useMasterKey();

	if (request.object.existed())
	{
		// No need to send the Welcome Email as user is already existed 
		return;
	}

	Parse.Promise.as().then(function()
	{
		// Send Welcome Email to user
		return mailUtil.sendWelcomeEmail(
		{
			user: request.object
		}).then(null, function(error)
		{
			console.log(error.code + " : " + error.message);
		});
	}).then(function()
	{
		console.log(mailUtil.successfulMessage4WelcomeEmail({
			user: request.user
		}));
	});
});

/*
 *
 */
Parse.Cloud.afterSave(constants.kDJOrdersClassKey, function(request) 
{
	Parse.Cloud.useMasterKey();

	if (request.object.existed())
	{
		// No need to send the Order Confirmation Email 
		// as the order is already existed 
		return;
	}

	if (!request.object.get(constants.kDJOrdersGemIDKey) || 
		!request.object.get(constants.kDJOrdersUserIDKey))
	{
		// No need to send the Order Confirmation Email
		// as the Gem_id or UserID not existing 
		return;
	}

	var query4OrderedItem = function(order)
	{
		var query = new Parse.Query(constants.kDJGemInventoryClassKey);
		query.equalTo(constants.kPFObjectObjectIDKey, 
					  order.get(constants.kDJOrdersGemIDKey));
		// query.include(constants.kDJGemInventoryPicture1Key);

		return query;
	}

	var query4OrderUser = function(order)
	{
		var query = new Parse.Query(Parse.User);
		query.equalTo(constants.kPFObjectObjectIDKey, 
						order.get(constants.kDJOrdersUserIDKey));

		return query;
	}

	var orderedItem, user;

	Parse.Promise.as().then(function()
	{
		// find the user ordered an item
		var query = query4OrderUser(request.object);
		return query.first().then(null, function(error)
		{
			console.log(error.code + " : " + error.message);	
		});
	}).then(function(orderUser)
	{
		user = orderUser;

		// Find the ordered Item from Inventory
		var query = query4OrderedItem(request.object);
		return query.first().then(null, function(error)
		{
			console.log(error.code + " : " + error.message);	
		});
	}).then(function(item)
	{
		orderedItem = item;

		// Send Welcome Email to user
		return mailUtil.sendOrderConfirmationEmail(
		{
			user:  user,
			order: request.object,
			item:  orderedItem, 
		}).then(null, function(error)
		{
			console.log(error.code + " : " + error.message);
		});
	}).then(function()
	{
		console.log(mailUtil.successfulMessage4WelcomeEmail({
			user: user,
			item: request.object,
		}));
	});
});