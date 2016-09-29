'use strict';

var config = require('./configuration');
var constants = require('./constants');

var speechHandlers = {
    'welcome' : function() {
        // Output welcome message with card
        var message = config.welcome_message + constants.breakTime['100'] +
            ' You can select any of the following feeds : ';
        var reprompt = 'You can ask for any of the following feeds : ';
        var cardTitle = config.welcome_message;
        var cardContent = config.welcome_message + ' You can select any of the following feeds : \n';
        // Call category helper to get list of all categories
        categoryHelper((categoryList, cardCategoryList) => {
            message += categoryList;
            reprompt += categoryList;
            cardContent += cardCategoryList;
            this.emit(':askWithCard', message, reprompt, cardTitle, cardContent, null);
        });
    },
    'listCategories' : function () {
        // Output the list of all feeds with card
        var message;
        var reprompt = 'You can ask for any of the following feeds : ';
        var cardTitle = 'Feed List';
        var cardContent;

        // changing state to START MODE
        this.handler.state = constants.states.START_MODE;
        // Call category helper to get list of all categories
        categoryHelper((categoryList, cardCategoryList) => {
            message = categoryList;
            reprompt += categoryList;
            cardContent = cardCategoryList;
            this.emit(':askWithCard', message, reprompt, cardTitle, cardContent, null);
        })
    },
    'illegalCategory' : function () {
        // Output sorry message when category not recognized along with a request to choose the category
        var message = 'Sorry, I could not understand. You can select any of the following categories : ';
        var reprompt = 'You can ask for any of the following categories : ';
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            message += categoryList;
            reprompt += categoryList;
            this.emit(':ask', message, reprompt);
        })
    },
    'listFavorite' : function () {
        // Output list of feeds marked as favorite by the user
        var message;
        var reprompt;
        var cardTitle = 'Favorites';
        var cardContent;

        var favoriteList = this.attributes['favoriteCategories'];
        var favoriteListLength = favoriteList.length;
        if (favoriteListLength === 0) {
            return this.emit('favoriteListEmpty');
        } else if (favoriteListLength === 1) {
            message = favoriteList[0] + ' is your favorite feed. ' +
                'You can say open favorite to hear your favorite feeds.';
            cardContent = message;
            reprompt = 'You have marked ' + favoriteList[0] + ' as your favorite feed.' +
                'You can say open favorite to hear your favorite feeds.';
        } else {
            message = '';
            reprompt = 'Your favorite feeds are : ';
            cardContent = 'Your favorite feeds are : \n';
            for (var index = 0; index < favoriteListLength; index++) {
                message += (index+1) + ' . ' + favoriteList[index] + constants.breakTime['300'];
                cardContent += (index+1) + '. ' + favoriteList[index] + '\n';
                reprompt += (index+1) + ' . ' + favoriteList[index] + constants.breakTime['300'];
            }
            message += ' You can say open favorites to hear your favorite feeds.';
            cardContent += 'You can say open favorites to hear your favorite feeds.';
            reprompt += ' You can say open favorites to hear your favorite feeds.';
        }
        this.emit(':askWithCard', message, reprompt, cardTitle, cardContent, null);
    },
    'favoriteAdded' : function (category) {
        // Output success message when feed marked as favorite
        if (this.attributes['category'] === 'Favorite') {
            // Switch to START MODE since favorite feed has been altered
            this.handler.state = constants.states.START_MODE;
        }
        var message = category + ' has been added to your favorites. ' +
            'You can say, open favorites, to hear your favorite feeds.';
        var reprompt = 'You can say, open favorites, to hear your favorite feeds.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteRemoved' : function (category) {
        // Output success message when feed removed as favorite
        if (this.attributes['category'] === 'Favorite') {
            // Switch to START MODE since favorite feed has been altered
            this.handler.state = constants.states.START_MODE;
        }
        var message = category + ' has been removed from your favorites. ' +
            'You can say, open favorites, to hear your favorite feeds.';
        var reprompt = 'You can say, open favorites, to hear your favorite feeds.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteAddExistingError' : function (category) {
        // Output message when feed is already marked as favorite
        var message = category + ' is already present in your favorites. ' +
            'You can say, open favorites, to hear your favorite feeds.';
        var reprompt = 'You can say, open favorites, to hear your favorite feeds.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteRemoveExistingError' : function (category) {
        // Output message when feed is already absent from favorite
        var message = category + ' was not present in your favorites. ' +
            'You can say, open favorites, to hear your favorite feeds.';
        var reprompt = 'You can say, open favorites, to hear your favorite feeds.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteAddCurrentError' : function () {
        var message = 'Sorry, cannot add favorite to favorites.';
        var reprompt = 'You can say next for more items.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteRemoveCurrentError' : function () {
        var message = 'Sorry, cannot remove favorite from favorites.';
        var reprompt = 'You can say next for more items.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteListEmpty' : function () {
        var message = 'You have no feed marked as favorite. ' +
            'You can say mark ' + Object.keys(config.feeds)[0] + '  as favorite.';
        var reprompt = 'Your list of favorite feeds is empty. ' +
            'You can say mark ' + Object.keys(config.feeds)[0] + '  as favorite.';
        this.emit(':ask', message, reprompt);
    },
    'noNewItems' : function () {
        // Output message when no new items present in the feed
        var message = '';
        if (Object.keys(config.feeds).length === 1) {
            if (this.attributes['start']) {
                message = config.welcome_message + " ";
                this.attributes['start'] = false;
            }
            message += 'There are no new items. Would you like to hear older items? ';
            this.emit(':ask', message, message);
        } else {
            message = this.attributes['category'] + ' has no new items. Would you like to hear older items? ';
            var reprompt = 'There are no new items in the feed. ' +
                'You can say yes to hear older items and no to select other feeds.';
            // change state to NO_NEW_ITEM
            this.handler.state = constants.states.NO_NEW_ITEM;
            this.emit(':ask', message, reprompt);
        }
    },
    'readPagedItems' : function (items) {
        // Read items to the user
        var category = this.attributes['category'];

        var message = '';
        var reprompt = '';
        var cardTitle = category;
        var cardContent = '';
        var content = '';

        var feedEndedKey = 'feedEnded' + category;
        var justStartedKey = 'justStarted' + category;

        // change state to FEED_MODE
        this.handler.state = constants.states.FEED_MODE;
        // add message to notify number of new items in the feed
        if (this.attributes['newItemCount'] && this.attributes['newItemCount'] > 0) {
            var msg;
            if (this.attributes['newItemCount'] == 1) {
                msg = ' new item. ';
            } else {
                msg = ' new items. ';
            }
            cardContent = this.attributes['category'] + ' has ' + this.attributes['newItemCount'] + msg + '\n';
            message = this.attributes['category'] + ' has ' + this.attributes['newItemCount'] + msg +
                constants.breakTime['200'];
            this.attributes['newItemCount'] = null;
        }

        items.forEach(function (feed) {
            content += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + ". " + feed.title + ". ";
            cardContent += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + ". " + feed.title;
            // If config flag set to display description, append description
            if (!config.display_only_title_in_card) {
                cardContent += "  -  ";
                cardContent += feed.description;
            }
            if (!config.speak_only_feed_title) {
                content += constants.breakTime['300'];
                content += feed.description + " ";
            }
            cardContent += '\n';
            content += constants.breakTime['500'];
        });
        message += content;
        if (this.attributes[feedEndedKey]) {
            message += ' You have reached the end of the feed. ' + constants.breakTime['200'] +
                ' You can choose any other category, or restart the feed. ';
            cardContent += 'You have reached the end of the feed. ' +
                'You can choose any other category, or restart the feed. ';
            reprompt = ' You can say, list all feeds, to hear all categories or' +
                ' say, restart, to start over the current feed. ';
        } else if (this.attributes[justStartedKey]) {
            message += 'You can say next for more.';
            cardContent += 'You can say next for more.';
            reprompt = 'You can say next for more items. You can also say, list all feeds, to hear all categories. ';
        } else {
            message += 'You can say next for more. ';
            cardContent += 'You can say next for more. ';
            reprompt = 'You can say next for more items, or say previous for previous items. ' +
                'You can also say, list all feeds, to hear all categories. ';
        }
        this.emit(':askWithCard', message, reprompt, cardTitle, cardContent, null);
    },
    'readPagedItemsSingleMode' : function (items) {
        // Read items to the user
        var category = this.attributes['category'];

        var message = '';
        var cardTitle = 'Items';
        var cardContent = '';
        var content = '';

        var feedEndedKey = 'feedEnded' + category;
        // add message to notify number of new items in the feed
        if (this.attributes['newItemCount']) {
            message += config.welcome_message + constants.breakTime['100'];
            if (this.attributes['newItemCount'] > 0) {
                var msg;
                if (this.attributes['newItemCount'] == 1) {
                    msg = ' new item. ';
                } else {
                    msg = ' new items. ';
                }
                cardContent = 'There are ' + this.attributes['newItemCount'] + msg + '\n';
                message += this.attributes['category'] + ' has ' + this.attributes['newItemCount'] + msg +
                    constants.breakTime['200'];
            } else {
                message += 'There are ' + this.attributes['feedLength'] + ' items in the feed. ';
            }
            this.attributes['newItemCount'] = null;
            // Setting start flag as false
            if (this.attributes['start']) {
                this.attributes['start'] = false;
            }
        }

        items.forEach(function (feed) {
            content += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + ". " + feed.title + ". ";
            cardContent += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + ". " + feed.title;
            // If config flag set to display description, append description
            if (!config.display_only_title_in_card) {
                cardContent += "  -  ";
                cardContent += feed.description;
            }
            if (!config.speak_only_feed_title) {
                content += constants.breakTime['300'];
                content += feed.description + " ";
            }
            cardContent += '\n';
            content += constants.breakTime['500'];
        });
        message += content;
        if (this.attributes[feedEndedKey]) {
            message += ' You have reached the end of the feed. ' + constants.breakTime['200'] +
                ' You can say restart to hear the feed from the beginning or say previous to hear newer items. ';
            cardContent += 'You have reached the end of the feed. ' +
                ' You can say restart to hear the feed from the beginning or say previous to hear newer items. ';
            return this.emit(':askWithCard', message, message, cardTitle, cardContent, null);
        } else {
            message += 'You can say next for more. ';
            cardContent += 'You can say next for more. ';
        }
        this.emit(':askWithCard', message, message, cardTitle, cardContent, null);
    },
    'feedEmptyError' : function () {
        // Output sorry message when requested feed has no items
        var message = 'Sorry, the feed is empty. Please select another feed.';
        var reprompt = 'Sorry, the feed is empty. Please select another feed.';
        this.emit(':ask', message, reprompt);
    },
    'justStarted' : function () {
        // Outputs message when user says previous when already at start of feed
        var message = 'Sorry, you are at the start of the feed. ' +
            'You can say next to hear subsequent items or you can say list categories to select other feeds.';
        var reprompt = 'You can say next to hear subsequent items or ' +
            'you can say list categories to select other feeds.';
        this.emit(':ask', message, reprompt);
    },
    'alreadyEnded' : function () {
        // Outputs message when user says next when already at end of feed
        var message = 'Sorry, you are at the end of the feed. ' +
            'You can say list categories to select other feeds or you can say previous to hear previous feeds.';
        var reprompt = 'You can say list categories to select other categories or ' +
            'you can say previous to hear previous feeds.';
        this.emit(':ask', message, reprompt);
    },
    'helpStartMode' : function () {
        // Outputs helps message when in START MODE
        var message = config.welcome_message + constants.breakTime['100'] +
            'To hear any news feed, you can select any category using its name or number. ' +
            constants.breakTime['100'] +
            'You can also mark one or more categories as your favorite ' +
            ' and ask alexa, open favorites, to hear those feeds. ' +
            constants.breakTime['100'] +
            'To mark any category as your favorite, you can say, mark Top Stories as favorite.' +
            constants.breakTime['100'] +
            'Here are the available categories : ' +
            constants.breakTime['100'];
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            message += categoryList;
            this.emit(':ask', message, message);
        });
    },
    'helpFeedMode' : function () {
        // Outputs helps message when in FEED MODE
        var category = this.attributes['category'];
        var message = 'You are listening to ' + category +
            constants.breakTime['100'] +
            'You can say next or previous to navigate through the feed. ' +
            constants.breakTime['100'] +
            ' To hear all categories, you can say, get category list.' +
            constants.breakTime['100'] +
            ' And say restart to start over the current feed. ' +
            constants.breakTime['100'] +
            'You can also ask, give details for item 1 to get more information about the item. ' +
            constants.breakTime['100'] +
            'What would you like to do?';
        this.emit(':ask', message, message);
    },
    'helpNoNewItemMode' : function () {
        // Outputs helps message when in NO NEW ITEM MODE
        var message = this.attributes['category'] + ' has no new items. ' +
            'You can say yes to hear older items and no to select other feeds.'
            + constants.breakTime['100'] +
            'What would you like to do?';
        this.emit(':ask', message, message);
    },
    'helpSingleFeedMode' : function () {
        var message = config.welcome_message + 'To navigate through the feed, you can say commands like next and previous.';
        this.emit(':ask', message, message);
    },
    'readItemSpeechHelper' : function () {
        // Output sorry message to user. Metrics created using cloudwatch logs to see how many users requests are made
        var message = 'Sorry, this feature is not available.'
            + constants.breakTime['250'] +
            'You can continue navigating through the feed by saying next.';
        this.emit(':ask', message, message);
    },
    'sendItemSpeechHelper' : function () {
        // Output sorry message to user. Metrics created using cloudwatch logs to see how many users requests are made
        var message = 'Sorry, this feature is not available.'
            + constants.breakTime['250'] +
            'You can continue navigating through the feed by saying next.';
        this.emit(':ask', message, message);
    },
    'itemInfoError' : function () {
        // Handle itemInfo request when not in feed mode
        var message = 'Sorry, you need to select a feed before requesting item details. ' +
            'What would you like to hear?';
        var reprompt = 'You can select any feed using its name or number' +
            constants.breakTime['100'] + 'Here are the available feeds : ' +
            constants.breakTime['100'];
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            reprompt += categoryList;
            this.emit(':ask', message, reprompt);
        });
        this.emit(':ask', message, reprompt);
    },
    'sendItemError' : function () {
        // Handle sendItem request when not in feed mode
        var message = 'Sorry, you need to select a feed before requesting item details. ' +
            'What would you like to hear?';
        var reprompt = 'You can select any feed using its name or number' +
            constants.breakTime['100'] + 'Here are the available feeds : ' +
            constants.breakTime['100'];
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            reprompt += categoryList;
            this.emit(':ask', message, reprompt);
        });
        this.emit(':ask', message, reprompt);
    },
    'unhandledStartMode' : function () {
        // Help user with possible options in _FEED_MODE
        var message = 'Sorry, to hear any news feed, you can select any category using its name or number. ' +
            constants.breakTime['100'] +
            'Here are the available categories : ' +
            constants.breakTime['100'];
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            message += categoryList;
            this.emit(':ask', message, message);
        });
    },
    'unhandledFeedMode' : function () {
        // Help user with possible options in _FEED_MODE
        var message = 'Sorry, you can say next or previous to navigate through the feed. ' +
            constants.breakTime['100'] +
            ' To hear all categories, you can say, get category list.' +
            constants.breakTime['100'] +
            ' And say restart to start over the current feed. ' +
            constants.breakTime['100'] +
            'You can also ask, give details for item one to get more information about the item. ' +
            constants.breakTime['100'] +
            'What would you like to do?';
        this.emit(':ask', message, message);
    },
    'unhandledNoNewItemMode' : function () {
        // Help user with possible options in _NO_NEW_ITEM_MODE
        var message = 'Sorry, you can say yes to hear older items and no to select other feeds.';
        var reprompt = this.attributes['category'] + ' has no new items. ' +
            'You can say yes to hear older items and no to select other feeds.'
            + constants.breakTime['100'] +
            'What would you like to do?';
        this.emit(':ask', message, reprompt);
    },
    'unhandledSingleFeedMode' : function () {
        var message = 'Sorry, you can say next and previous to navigate through the feed. What would you like to do?';
        this.emit(':ask', message, message);
    },
    'reportError' : function () {
        // Output error message and close the session
        var message = 'Sorry, there are some technical difficulties in fetching the requested information. Please try again later.';
        this.emit('EndSession', message);
    }
};

function categoryHelper(callback) {
    // Generate a list of categories to serve several functions
    var categories = Object.keys(config.feeds);
    var categoryList = '';
    var cardCategoryList = '';
    var index = 0;
    categories.forEach(function (category) {
        categoryList += (++index) + constants.breakTime['100'] + category + constants.breakTime['200'];
        cardCategoryList += (index) + ') ' + category + ' \n';
    });
    categoryList += '. Which one would you like to hear?';
    cardCategoryList += 'Which one would you like to hear?';
    callback(categoryList, cardCategoryList);
}

module.exports = speechHandlers;