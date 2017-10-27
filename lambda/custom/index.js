'use strict';

var Alexa = require('alexa-sdk');
var config = require('./configuration');
var eventHandlers = require('./eventHandlers');
var stateHandlers = require('./stateHandlers');
var intentHandlers = require('./intentHandlers');
var speechHandlers = require('./speechHandlers');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.appId = config.appId;
    alexa.dynamoDBTableName = config.dynamoDBTableName;
    alexa.registerHandlers(eventHandlers, stateHandlers.startModeIntentHandlers, stateHandlers.feedModeIntentHandlers,
        stateHandlers.noNewItemsModeIntentHandlers, stateHandlers.singleFeedModeIntentHandlers,intentHandlers, speechHandlers);
    alexa.execute();
};