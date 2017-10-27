"use strict";

var logHelper = function () {
    return{
        logSessionStarted: function(session) {
            var sessionStartedJsonEvent =
            {
                "eventType" : "SessionStarted",
                "event" : {
                    "userId" : session.user.userId,
                    "sessionId" : session.sessionId,
                    "datestring" : (new Date()).toISOString()
                }
            };
            logJsonEvent(sessionStartedJsonEvent);
        },
        logLaunchRequest: function (session, launchRequest) {
            var launchRequestJsonEvent =
            {
                "eventType" : "LaunchRequest",
                "event" : {
                    "datestring" : (new Date()).toISOString(),
                    "userId" : session.user.userId,
                    "requestId" : launchRequest.requestId,
                    "sessionId" : session.sessionId
                }
            };
            logJsonEvent(launchRequestJsonEvent);
        },
        logReceiveIntent: function(session, intentRequest) {
            var receiveIntentJsonEvent =
            {
                "eventType" : "ReceiveIntent",
                "event": {
                    "intentName": intentRequest.intent.name,
                    "datestring": (new Date()).toISOString(),
                    "userId": session.user.userId,
                    "requestId": intentRequest.requestId,
                    "intent": intentRequest.intent,
                    "sessionId": session.sessionId
                }
            };
            logJsonEvent(receiveIntentJsonEvent);
        },
        logAPICall: function(session, apiName) {
            var apiCallJsonEvent =
            {
                "eventType" : "APICall",
                "event": {
                    "apiName": apiName,
                    "datestring": (new Date()).toISOString(),
                    "userId": session.user.userId,
                    "sessionId": session.sessionId
                }
            };
            logJsonEvent(apiCallJsonEvent);
        },
        logAPISuccesses: function(session, apiName) {
            var apiSuccessJsonEvent =
            {
                "eventType" : "APISuccess",
                "event": {
                    "apiName": apiName,
                    "datestring": (new Date()).toISOString(),
                    "userId": session.user.userId,
                    "sessionId": session.sessionId
                }
            };
            logJsonEvent(apiSuccessJsonEvent);
        },
        logAPIError: function(session, apiName, error) {
            var apiErrorJsonEvent =
            {
                "eventType" : "APIError",
                "event": {
                    "apiName": apiName,
                    "error" : error,
                    "datestring": (new Date()).toISOString(),
                    "userId": session.user.userId,
                    "sessionId": session.sessionId
                }
            };
            logJsonEvent(apiErrorJsonEvent);
        }
    };
}();

module.exports = logHelper;

function logJsonEvent(jsonEvent) {
    console.log("%j", jsonEvent);
}