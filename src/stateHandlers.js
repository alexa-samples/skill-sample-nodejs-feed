'use strict';

var Alexa = require('alexa-sdk');
var config = require('./configuration');
var constants = require('./constants');

var stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
        /*
         *  All Intent Handlers for state : _START_MODE
         */
        'SelectCategory' : function () {
            /*
             *  If requested category is valid : call select category in intentHandler
             *  Else : report illegal category from speechHandler
             */
            categoryHelper(this.event.request.intent.slots, (category) =>{
                if (category) {
                    this.attributes['category'] = category;
                    this.emit('selectCategory');
                } else {
                    this.emit('illegalCategory');
                }
            });
        },
        'GetCategoryList' : function () {
            // List all categories to user. Call listCategories in speechHandler
            this.emit('listCategories');
        },
        'SelectFavorite' : function () {
            this.emit('selectFavorite');
        },
        'AddFavorite' : function () {
            /*
             *  If requested category is valid : call add favorite in intentHandler
             *  Else : report illegal category from speechHandler
             */
            categoryHelper(this.event.request.intent.slots, (category) =>{
                if (category) {
                    this.emit('addFavorite', category);
                } else {
                    this.emit('illegalCategory');
                }
            });
        },
        'RemoveFavorite' : function () {
            /*
             *  If requested category is valid : call remove favorite in intentHandler
             *  Else : report illegal category from speechHandler
             */
            categoryHelper(this.event.request.intent.slots, (category) =>{
                if (category) {
                    this.emit('removeFavorite', category);
                } else {
                    this.emit('illegalCategory');
                }
            });
        },
        'ListFavorite' : function () {
            // List all favorite categories to user. Call listFavorite in speechHandler
            this.emit('listFavorite');
        },
        'ItemInfo' : function() {
            this.emit('itemInfoError');
        },
        'SendItem' : function() {
            this.emit('sendItemError');
        },
        'AMAZON.HelpIntent' : function () {
            this.emit('helpStartMode');
        },
        'AMAZON.StopIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'AMAZON.CancelIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'SessionEndedRequest' : function () {
            this.emit('EndSession', constants.terminate);
        },
        'Unhandled' : function () {
            this.emit('unhandledStartMode');
        }
    }),
    feedModeIntentHandlers: Alexa.CreateStateHandler(constants.states.FEED_MODE, {
        /*
         *  All Intent Handlers for state : _FEED_MODE
         */
        'SelectCategory' : function () {
            /*
             *  If requested category is valid : call select category in intentHandler
             *  Else : report illegal category from speechHandler
             */
            categoryHelper(this.event.request.intent.slots, (category) =>{
                if (category) {
                    this.attributes['category'] = category;
                    this.emit('selectCategory');
                } else {
                    this.emit('illegalCategory');
                }
            });
        },
        'GetCategoryList' : function () {
            // List all categories to user. Call listCategories in speechHandler
            this.emit('listCategories');
        },
        'SelectFavorite' : function () {
            this.emit('selectFavorite');
        },
        'AddFavorite' : function () {
            /*
             *  If requested category is valid : call add favorite in intentHandler
             *  Else : report illegal category from speechHandler
             */
            categoryHelper(this.event.request.intent.slots, (category) =>{
                if (category) {
                    this.emit('addFavorite', category);
                } else {
                    this.emit('illegalCategory');
                }
            });
        },
        'AddCurrentToFavorite' : function () {
            this.emit('addCurrentToFavorite');
        },
        'RemoveFavorite' : function () {
            /*
             *  If requested category is valid : call remove favorite in intentHandler
             *  Else : report illegal category from speechHandler
             */
            categoryHelper(this.event.request.intent.slots, (category) =>{
                if (category) {
                    this.emit('removeFavorite', category);
                } else {
                    this.emit('illegalCategory');
                }
            });
        },
        'RemoveCurrentFromFavorite' : function () {
            this.emit('removeCurrentFromFavorite');
        },
        'ListFavorite' : function () {
            // List all categories to user. Call listFavorite in speechHandler
            this.emit('listFavorite');
        },
        'ItemInfo' : function() {
            this.emit('readItemSpeechHelper');
        },
        'SendItem' : function() {
            this.emit('sendItemSpeechHelper');
        },
        'AMAZON.NextIntent' : function () {
            this.emit('readItems');
        },
        'AMAZON.PreviousIntent' : function () {
            this.emit('readPreviousItems');
        },
        'AMAZON.StartOverIntent' : function () {
            this.emit('startOver');
        },
        'AMAZON.HelpIntent' : function () {
            this.emit('helpFeedMode');
        },
        'AMAZON.StopIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'AMAZON.CancelIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'SessionEndedRequest' : function () {
            this.emit('EndSession', constants.terminate);
        },
        'Unhandled' : function () {
            // Calling speechHandler
            this.emit('unhandledFeedMode');
        }
    }),
    noNewItemsModeIntentHandlers : Alexa.CreateStateHandler(constants.states.NO_NEW_ITEM, {
        /*
         *  All Intent Handlers for state : _NO_NEW_ITEM
         */
        'AMAZON.YesIntent' : function () {
            this.handler.state = constants.states.FEED_MODE;
            this.attributes['newItemCount'] = null;
            this.emit('readItems');
        },
        'AMAZON.NoIntent' : function () {
            this.handler.state = constants.states.START_MODE;
            this.attributes['newItemCount'] = null;
            this.emit('listCategories');
        },
        'AMAZON.HelpIntent' : function () {
            this.emit('helpNoNewItemMode');
        },
        'AMAZON.StopIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'AMAZON.CancelIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'SessionEndedRequest' : function () {
            this.emit('EndSession', constants.terminate);
        },
        'Unhandled' : function () {
            this.emit('unhandledNoNewItemMode');
        }
    }),
    singleFeedModeIntentHandlers : Alexa.CreateStateHandler(constants.states.SINGLE_FEED_MODE, {
        'ItemInfo' : function() {
            this.emit('readItemSpeechHelper');
        },
        'SendItem' : function() {
            this.emit('sendItemSpeechHelper')
        },
        'AMAZON.NextIntent' : function () {
            this.emit('readItems');
        },
        'AMAZON.PreviousIntent' : function () {
            this.emit('readPreviousItems');
        },
        'AMAZON.YesIntent' : function () {
            this.attributes['newItemCount'] = null;
            this.emit('readItems');
        },
        'AMAZON.NoIntent' : function () {
            this.attributes['newItemCount'] = null;
            this.emit('EndSession', 'Good bye .');
        },
        'AMAZON.HelpIntent' : function () {
            this.emit('helpSingleFeedMode');
        },
        'AMAZON.StopIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'AMAZON.CancelIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'SessionEndedRequest' : function () {
            this.emit('EndSession', constants.terminate);
        },
        'Unhandled' : function () {
            this.emit('unhandledSingleFeedMode');
        }
    })
};

module.exports = stateHandlers;

function categoryHelper(intentSlot, callback) {
    /*
     *  Extract the category requested by the user
     *  index stores position of category requested
     *  category requested in 3 different ways :
     *      1) Amazon.NumberIntent - (1,2,3 ...)
     *      2) Ordinal - (1st, 2nd, 3rd ...)
     *      3) Category Name - (World, Technology, Politics ...)
     */
    var categoryList = Object.keys(config.feeds);
    var index;
    if (intentSlot.Index && intentSlot.Index.value) {
        index = parseInt(intentSlot.Index.value);
        index--;
    } else if (intentSlot.Ordinal && intentSlot.Ordinal.value) {
        var str = intentSlot.Ordinal.value;
        if (str === "second") {
            /*
              * Alexa Skills Kit passes 'second' instead of '2nd' unlike the case for different numbers.
              * Thus, considering this case explicitly. 
              */
            index = 2;
        } else {
            str = str.substring(0, str.length - 2);
            index = parseInt(str);
        }
        index--;
    } else if (intentSlot.Category && intentSlot.Category.value) {
        categoryList.forEach(function (item, index, theList) {
            theList[index] = item.toLowerCase();
        });
        index = categoryList.indexOf(intentSlot.Category.value.toLowerCase());
    } else {
        index = -1;
    }
    /*
     *  If index valid : corresponding category is fetched and forwarded
     *  Else : request user to repeat the category
     */
    if (index >= 0 && index < categoryList.length) {
        var category = Object.keys(config.feeds)[index];
        callback(category);
    } else {
        console.log('Illegal index : ' + index);
        callback(null);
    }
}