// 
// mail_util.js
// 
//
// Created by Albert Chen on 03/15/2014
// Copyright (c) 2014 Albert Chen. All rights reserved.

var constants = require('cloud/constants.js');

/*
 * Returns an initialized SendGrid object
 */
exports.getSendGrid = function()
{
	var SendGrid = require('sendgrid');
	SendGrid.initialize(constants.kSendGridUsername, constants.kSendGridPassword);

	return SendGrid;
}

/*
 * Returns a savings in percent from value and its original value
 */
exports.getSavingsInPercent = function(value, originalValue)
{
	var res = 100.0 * (value / originalValue);

	return res.toFixed(2);
}

/*
 * Returns today's date in "14, AUG" format
 */
exports.getTodaysDateInString = function()
{
	var months = ["January", "February", "March", "April", "May", "June", 
				  "July", "August", "September", "October", "November", 
				  "December"];

	var today = new Date();

	var dd = today.getDate();
	var mm = today.getMonth();

	if (dd<10)
	{
		dd = '0' + dd;
	}

	var res = dd + " " + months[mm];

	return res;
}

/*
 * Send a Welcome email to a newly created user
 *
 * Expected Input:
 *			data.user: 	user objet for email to be sent
 *
 */
exports.sendWelcomeEmail = function(data)
{
	var promise = new Parse.Promise();

	var SendGrid = exports.getSendGrid();
	var payload  = exports.payload4WelcomeEmail(data);

	SendGrid.sendEmail(payload, function(error, result)
	{
		if (error)
		{
			promise.reject(error);
		}
		else
		{
			promise.resolve(result)
		}
	});

	return promise;
};

/*
 * Returns payload for Welcome Email
 */
exports.payload4WelcomeEmail = function(data)
{
	var res =
	{
        to: data.user.get(constants.kDJUserEmailKey),
        from: constants.kSendGridFromEmail,
        fromname: constants.kSendGridFromName,
        subject: data.user.get(constants.kDJUserFullNameKey) + ", Welcome to !",
        html: " ",
        "x-smtpapi": {
          "category": [constants.kSendGridCategoryWelcome],
          "filters": {
              "templates": {
                  "settings": {
                      "enabled": 1,
                      "template_id": constants.kSendGridWelcomeEmailTemplateID
                  }
              }
          },
          "sub": {
            "<%name%>": [
              data.user.get(constants.kDJUserFullNameKey),
            ],
            "<%email%>": [
              data.user.get(constants.kDJUserEmailKey)
            ]
          },
        }
    };

	return res;
}

/*
 * Returns successful message after a welcome email sent
 *
 * Expected Input:
 *			data.user: 	user objet for email to be sent
 *
 */
exports.successfulMessage4WelcomeEmail = function(data)
{
	var words = [constants.LogMessageMailTag, 
				"Welcome Email successfully sent to user: ",
				data.user.get(constants.kDJUserFullNameKey)+"."];

	var res = words.join(constants.newLineSeparator);

	return res;
}

/*
 * Send a Order Confirmation email to a user
 * when a new object is added to Orders Class
 *
 * Expected Input:
 *			data.user: 	user objet for email to be sent
 *			data.order: order object of Orders Class
 *			data.item:  inventory item object of Gem_Inventory Class
 *
 */
exports.sendOrderConfirmationEmail = function(data)
{
	var promise = new Parse.Promise();

	var SendGrid = exports.getSendGrid();
	var payload  = exports.payload4OrderConfirmationEmail(data);

	SendGrid.sendEmail(payload, function(error, result)
	{
		if (error)
		{
			promise.reject(error);
		}
		else
		{
			promise.resolve(result)
		}
	});

	return promise;
};

/*
 * Returns payload for Order Confirmation Email
 */
exports.payload4OrderConfirmationEmail = function(data)
{
	var savingsInPercent = exports.getSavingsInPercent(
					data.item.get(constants.kDJGemInventoryPriceKey),
					data.item.get(constants.kDJGemInventoryOriginalPriceKey));

	var res =
	{
        to: data.user.get(constants.kDJUserEmailKey),
        from: constants.kSendGridFromEmail,
        fromname: constants.kSendGridFromName,
        subject: data.user.get(constants.kDJUserFullNameKey) + ", Welcome to !",
        html: " ",
        "x-smtpapi": {
          "category": [constants.kSendGridCategoryNewOrderConfirmation],
          "filters": {
              "templates": {
                  "settings": {
                      "enabled": 1,
                      "template_id": constants.kSendGridOrderConfirmationEmailTemplateID
                  }
              }
          },
          "sub": {
            "-todayDate-": [
              exports.getTodaysDateInString(),
            ],
            "-itemTitle-": [
              data.item.get(constants.kDJGemInventoryTitleKey),
            ],
            "-itemPictureUrl-": [
              data.item.get(constants.kDJGemInventoryPicture1Key).url(),
            ],
            "-orderedPrice-": [
              data.order.get(constants.kDJOrdersOrderPriceKey),
            ],
            "-savings-": [
              savingsInPercent,
            ],
          },
        }
    };

	return res;
}

/*
 * Returns successful message after a welcome email sent
 *
 * Expected Input:
 *			data.user: 	user objet for email to be sent
 *			data.order: order object of Orders Class
 *			data.item:  inventory item object of Gem_Inventory Class
 *
 */
exports.successfulMessage4OrderConfirmationEmail = function(data)
{
	var words = [constants.LogMessageMailTag, 
				"Order Confirmation Email successfully sent to user: ",
				data.user.get(constants.kDJUserFullNameKey)+"."];

	var res = words.join(constants.newLineSeparator);

	return res;
}

/*
 * Send a Daily Newsletter Email to a user
 *
 * Expected Input:
 *			data.user: 	user objet for email to be sent
 *			data.item:  inventory item object of Gem_Inventory Class
 *
 */
exports.sendDailyNewsletterEmail = function(data)
{
	var promise = new Parse.Promise();

	var SendGrid = exports.getSendGrid();
	var payload  = exports.payload4DailyNewsletterEmail(data);

	SendGrid.sendEmail(payload, function(error, result)
	{
		if (error)
		{
			promise.reject(error);
		}
		else
		{
			promise.resolve(result)
		}
	});

	return promise;
};

/*
 * Returns payload for Daily Newsletter Email
 */
exports.payload4DailyNewsletterEmail = function(data)
{
	var savingsInPercent = exports.getSavingsInPercent(
					data.item.get(constants.kDJGemInventoryPriceKey),
					data.item.get(constants.kDJGemInventoryOriginalPriceKey));

	var res =
	{
        to: data.user.get(constants.kDJUserEmailKey),
        from: constants.kSendGridFromEmail,
        fromname: constants.kSendGridFromName,
        subject: data.user.get(constants.kDJUserFullNameKey) + ", Welcome to !",
        html: " ",
        "x-smtpapi": {
          "category": [constants.kSendGridCategoryDailyNewsletter],
          "filters": {
              "templates": {
                  "settings": {
                      "enabled": 1,
                      "template_id": constants.kSendGridDailyNewsletterEmailTemplateID
                  }
              }
          },
          "sub": {
            "-todayDate-": [
              exports.getTodaysDateInString(),
            ],
            "-itemTitle-": [
              data.item.get(constants.kDJGemInventoryTitleKey)
            ],
            "-itemPictureUrl-": [
              data.item.get(constants.kDJGemInventoryPicture1Key).url(),
            ],
            "-itemPrice-": [
              data.item.get(constants.kDJGemInventoryPriceKey),
            ],
            "-savings-": [
              savingsInPercent,
            ],
          },
        }
    };

	return res;
}

/*
 * Returns successful message after daily newsletter email sent
 *
 * Expected Input:
 *			data.item:  inventory item object of Gem_Inventory Class
 *
 */
exports.successfulMessage4DailyNewsletterEmail = function(data)
{
	var words = [ constants.LogMessageMailTag, 
				  "Daily Newsletter Email successfully sent for item: " + 
				  data.item.get(constants.kDJGemInventoryTitleKey)];

	var res = words.join(constants.newLineSeparator);

	return res;
}

/*
 * Returns query for getting an item of today
 * Currently it supposes that only one item should be 
 * for each day in Gem_Inventory Collections
 */
exports.getDailyNewsletterItemQuery = function()
{
	var today1 = new Date(), today2 = new Date();

	with (today1)
	{
		setHours(0);
		setMinutes(0);
		setSeconds(0);
	}

	with (today2)
	{
		setHours(23);
		setMinutes(59);
		setSeconds(59);	
	}

	var query = new Parse.Query(constants.kDJGemInventoryClassKey);

	query.greaterThanOrEqualTo(constants.kPFObjectCreatedAtKey, today1);
	query.lessThanOrEqualTo(constants.kPFObjectCreatedAtKey, today2);
	query.descending(constants.kPFObjectCreatedAtKey);
	// query.include(constants.kDJGemInventoryPicture1Key);

	return query;
}