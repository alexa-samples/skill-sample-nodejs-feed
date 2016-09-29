'use strict';

var async = require('async');

var constants = require('./constants');
var config = require('./configuration');
var feedHelper = require('./feedHelper');
var logHelper = require('./logHelper');
var s3Helper = require('./s3Helper');

var eventHandlers = {
    'NewSession' : function () {
        logHelper.logSessionStarted(this.event.session);
        
        // Initialize session attributes
        this.attributes['start'] = true;
        this.attributes['category'] = '';

        if (!this.attributes['favoriteCategories']) {
            this.attributes['favoriteCategories'] = [];
        }
        if (!this.attributes['latestItem']) {
            this.attributes['latestItem'] = {};
        }

        /*
         *  If only one category present : STATE = _SINGLE_FEED_MODE
         *  Else : STATE = _START_MODE
         */
        if (Object.keys(config.feeds).length === 1) {
            this.handler.state = constants.states.SINGLE_FEED_MODE;
        } else {
            this.handler.state = constants.states.START_MODE;
        }
        /*
         *  If request type is LaunchRequest : Give welcome message
         *  Else If request type is IntentRequest : Call the specific intent directly
         *  Else : do nothing.
         */
        if (this.event.request.type === 'LaunchRequest') {
            logHelper.logLaunchRequest(this.event.session, this.event.request);

            if (this.handler.state === constants.states.SINGLE_FEED_MODE) {
                this.emit('launchSingleMode');
            } else {
                this.emit('welcome');
            }
        } else if (this.event.request.type === 'IntentRequest') {
            logHelper.logReceiveIntent(this.event.session, this.event.request);
            
            var intentName = this.event.request.intent.name;
            this.emitWithState(intentName);
        } else {
            console.log('Unexpected request : ' + this.event.request.type);
        }
    },
    'EndSession' : function (message) {
        /*
         *  If favorite file present : delete it
         *  If SessionEndedRequest : emit ':saveState'
         *  Else emit ':tell'
         */
        if (this.attributes['favoriteFilePresent']) {
            logHelper.logAPICall(this.event.session, 'S3');
            // Delete favorite file from S3 created in current session
            s3Helper.deleteObject(this.attributes['fileNameFavorite'], this.attributes['versionIdFavorite'], (err) => {
                if (err) {
                    logHelper.logAPIError(this.event.session, 'S3', err);
                    if (message != constants.terminate) {
                        this.emit('reportError');
                    }
                } else {
                    logHelper.logAPISuccesses(this.event.session, 'S3');
                    // Updating session attributes to store only the required attributes within DynamoDB.
                    deleteAttributes.call(this);
               
                    if (message != constants.terminate) {
                        message = message || '';
                        this.emit(':tell', message);
                    } else {
                        this.emit(':saveState', true);
                    }
                }
            });
        } else {
            // Updating session attributes to store only the required attributes within DynamoDB.
            deleteAttributes.call(this);
            
            if (message != constants.terminate) {
                message = message || '';
                this.emit(':tell', message);
            } else {
                this.emit(':saveState', true);
            }
        }
    }
};

module.exports = eventHandlers;

function deleteAttributes() {
    var latestItem = this.attributes['latestItem'];
    var favoriteCategories = this.attributes['favoriteCategories'];

    Object.keys(this.attributes).forEach((attribute) => {
        delete this.attributes[attribute];
    });

    this.attributes.latestItem = latestItem;
    
    if (this.handler.state != constants.states.SINGLE_FEED_MODE) {
        this.attributes.favoriteCategories = favoriteCategories;
    }

    this.handler.state = '';
}