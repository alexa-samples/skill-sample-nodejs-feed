'use strict';

var async = require('async');
var config = require('./configuration');
var constants = require('./constants');
var feedHelper = require('./feedHelper');
var logHelper = require('./logHelper');
var s3Helper = require('./s3Helper');

var items = [];

var intentHandlers = {
    'selectCategory' : function () {
        /*
         *  If file present for given category : 
         *      * If file never read : initialize parameters and read items
         *      * Else : continue from last stopped position 
         *  Else : Call feedHelper to fetch feeds.
         */
        var category = this.attributes['category'];
        var fileNameKey = 'fileName' + category;
        var versionIdKey = 'versionId' + category;
        var indexKey = 'index' + category;
        var directionKey = 'direction' + category;
        // All files will have following naming convention : '<CATEGORY NAME>_feeds.json'
        this.attributes[fileNameKey] = category + '_feeds.json';

        if (this.attributes[versionIdKey]) {
            if (this.attributes[indexKey] === -1) {
                /*
                 *  Feed never read.
                 *  Call new item notification to compute number of new items available.
                 */
                newItemNotification.call(this, (newItemCount) => {
                    /*
                     *  If number of new items = 0 : notify user and ask whether to continue with feed
                     *  Else : notify user the number of new items and begin feed with first page
                     */
                    if (newItemCount === 0) {
                        this.emit('noNewItems');
                    } else {
                        this.emit('readItems');
                    }
                });
            } else {
                if (this.attributes[indexKey] != 0) {
                    // feed pointer not at start, thus adjust pointer to resume from last read item
                    this.attributes[indexKey] -= config.number_feeds_per_prompt;
                }
                this.attributes[directionKey] = 'forward';
                this.emit('readItems');
            }
        } else {
            // Category fetched for the first time in the session.
            logHelper.logAPICall(this.event.session, 'S3');
            s3Helper.getObject(this.attributes[fileNameKey], null, (err, data) => {
               if (err) {
                   logHelper.logAPIError(this.event.session, 'S3');

                   if (err.code === 'NoSuchKey') {
                       fetchFeed.call(this, (newItemCount) => {
                           if (newItemCount === 0) {
                               this.emit('noNewItems');
                           } else {
                               this.emit('readItems');
                           }
                       });
                   } else {
                       this.emit('reportError');
                   }
               } else {
                   var allowedTimePeriod = constants.updateFeedTime*60*1000; // Convert minutes to milliSeconds
                   var timeSinceLastModified = (new Date()).getTime() - new Date(data.LastModified);
                   if (timeSinceLastModified < allowedTimePeriod) {
                       // File is created within allowed time period. Using this feed version.
                       items = JSON.parse(data.Body);
                       this.attributes[versionIdKey] = data.VersionId;
                       // Call new item notification to compute number of new items available
                       newItemNotification.call(this, (newItemCount) => {
                           if (newItemCount === 0) {
                               this.emit('noNewItems');
                           } else {
                               this.emit('readItems');
                           }
                       });
                   } else {
                       // File is much older than allowed time. Calling feedHelper and storing file in S3.
                       fetchFeed.call(this, (newItemCount) => {
                           if (newItemCount === 0) {
                               this.emit('noNewItems');
                           } else {
                               this.emit('readItems');
                           }
                       });
                   }
               }
            });
        }
    },
    'readItems' : function () {
        /*
         *  Find the items to be read in current pagination using current index position and previous direction
         *  Store these items in an array and call speechHandler function to process for output
         */
        loadItems.call(this, () => {
            var category = this.attributes['category'];
            var indexKey = 'index' + category;
            var directionKey = 'direction' + category;
            var feedEndedKey = 'feedEnded' + category;
            var justStartedKey = 'justStarted' + category;
            if (!this.attributes[feedEndedKey]) {
                var pagedItems = [];
                var feedLength = items.length;
                var index;
                var currentIndex = this.attributes[indexKey];
                if (currentIndex === 0) {
                    // Mark flag to signify start of feed
                    this.attributes[justStartedKey] = true;
                } else {
                    this.attributes[justStartedKey] = null;
                }
                if (this.attributes[directionKey] === 'backward') {
                    // Adjustment for change in direction
                    this.attributes[directionKey] = 'forward';
                    currentIndex += config.number_feeds_per_prompt;
                }
                var currentPaginationEnd = currentIndex + config.number_feeds_per_prompt;
                for (index = currentIndex; index < currentPaginationEnd && index < feedLength; index++) {
                    pagedItems.push(items[index]);
                }
                if (index === feedLength) {
                    // Mark flag to signify end of feed
                    this.attributes[feedEndedKey] = true;
                }
                this.attributes[indexKey] = currentPaginationEnd;
                if (Object.keys(config.feeds).length === 1) {
                    this.emit('readPagedItemsSingleMode', pagedItems);
                } else {
                    this.emit('readPagedItems', pagedItems);
                }
            } else {
                this.emit('alreadyEnded');
            }
        })
    },
    'readPreviousItems' : function () {
        /*
         *  Find the items to be read in current pagination using current index position and previous direction
         *  Store these items in an array and call speechHandler function to process for output
         */
        loadItems.call(this, () => {
            var category = this.attributes['category'];
            var indexKey = 'index' + category;
            var directionKey = 'direction' + category;
            var feedEndedKey = 'feedEnded' + category;
            var justStartedKey = 'justStarted' + category;
            if (!this.attributes[justStartedKey]) {
                var pagedItems = [];
                var index;
                var currentIndex = this.attributes[indexKey];
                if (this.attributes[directionKey] === 'forward') {
                    // Adjustment for change in direction
                    currentIndex -= config.number_feeds_per_prompt;
                    this.attributes[directionKey] = 'backward';
                }
                var currentPaginationStart = currentIndex - config.number_feeds_per_prompt;
                if (this.attributes[feedEndedKey]) {
                    this.attributes[feedEndedKey] = null;
                }
                currentIndex--;
                for (index = currentIndex; index >= currentPaginationStart && index >= 0; index--) {
                    pagedItems.unshift(items[index]);
                }
                if (index === -1) {
                    // Mark flag to signify start of feed
                    this.attributes[justStartedKey] = true;
                    currentPaginationStart = 0;
                }
                this.attributes[indexKey] = currentPaginationStart;
                if (Object.keys(config.feeds).length === 1) {
                    this.emit('readPagedItemsSingleMode', pagedItems);
                } else {
                    this.emit('readPagedItems', pagedItems);
                }
            } else {
                this.emit('justStarted');
            }
        })
    },
    'startOver' : function () {
        /*
         * To re-initialize all attributes
         * Call load feeds to read first page of items 
         */
        var category = this.attributes['category'];
        var indexKey = 'index' + category;
        var directionKey = 'direction' + category;
        var feedEndedKey = 'feedEnded' + category;
        // Reset index and direction
        this.attributes[indexKey] = 0;
        this.attributes[directionKey] = 'forward';
        if (this.attributes[feedEndedKey]) {
            this.attributes[feedEndedKey] = null;
        }
        // Call get feed function to read first page
        this.emit('readItems');
    },
    'selectFavorite' : function () {
        var directionKey = 'directionFavorite';
        this.attributes[directionKey] = 'forward';

        if (this.attributes['favoriteFilePresent']) {
            // Favorite file present : call get feed to resume favorite feed
            var category = 'Favorite';
            this.attributes['category'] = category;
            var indexKey = 'index' + category;
            if (this.attributes[indexKey] != 0) {
                // Feed pointer not at start, thus adjust pointer to resume from last read item
                this.attributes[indexKey] -= config.number_feeds_per_prompt;
            }
            // Call readItems since file already present
            this.emit('readItems');
        } else {
            /*
             * Fetch the list of favorite categories
             * If favorite categories present :
             *      * For all favorite categories asynchronously - do the following :
             *          ** If feeds for a category exists in S3, fetch it
             *          ** Else call Feed Helper
             *      * Merge all items, remove duplicates, and sort them using time
             * Else : give appropriate message to the user
             */
            var favoriteCategories = this.attributes['favoriteCategories'];
            if (favoriteCategories.length > 0) {
                var asyncDataCollection = [];
                // Add tasks that needs to be performed asynchronously
                favoriteCategories.forEach((category) => {
                    var fileNameKey = 'fileName' + category;
                    var versionIdKey = 'versionId' + category;

                    asyncDataCollection.push((asyncCallback) => {
                        if (this.attributes[versionIdKey]) {
                            // File present, thus fetch all items
                            logHelper.logAPICall(this.event.session, 'S3');
                            // retrieve feed data stored in S3 storage
                            s3Helper.getObject(this.attributes[fileNameKey], this.attributes[versionIdKey], (err, data) => {
                                if (err) {
                                    logHelper.logAPIError(this.event.session, 'S3', err);
                                    asyncCallback(err, data);
                                } else {
                                    logHelper.logAPISuccesses(this.event.session, 'S3');
                                    if (data && data.Body) {
                                        var feeds = JSON.parse(data.Body);
                                        asyncCallback(null, feeds);
                                    } else {
                                        console.log('Data Retrieved is empty.');
                                        this.emit('feedEmptyError');
                                    }
                                }
                            });
                        } else {
                            // File not present, thus fetch feeds, store in S3 and return items
                            var indexKey = 'index' + category;
                            // Initialize attributes
                            this.attributes[fileNameKey] = category + '_feeds.json';
                            this.attributes[indexKey] = -1;

                            s3Helper.getObject(this.attributes[fileNameKey], null, (err, data) => {
                               if (err) {
                                   if (err.code === 'NoSuchKey') {
                                       // File for the category does not exists. Thus parse feed and store in S3.
                                       logHelper.logAPICall(this.event.session, 'Feed Parser');
                                       // Call feedHelper to fetch feeds for given category
                                       feedHelper.getFeed(category, this.attributes[fileNameKey],(error, feed) => {
                                           if (error) {
                                               logHelper.logAPIError(this.event.session, 'Feed Parser', error);
                                               asyncCallback(error, feed)
                                           } else {
                                               logHelper.logAPISuccesses(this.event.session, 'Feed Parser');
                                               if (feed.items) {
                                                   this.attributes[versionIdKey] = feed.VersionId;
                                                   asyncCallback(null, feed.items);
                                               } else {
                                                   console.log('Feed parsed is empty');
                                                   this.emit('feedEmptyError');
                                               }
                                           }
                                       });
                                   } else {
                                       asyncCallback(err, data);
                                   }
                               } else {
                                   var allowedTimePeriod = constants.updateFeedTime*60*1000;
                                   if (new Date() -  data.LastModified < allowedTimePeriod) {
                                       // File is created within allowed time period. Using this feed version.
                                       var feedItems = JSON.parse(data.Body);
                                       this.attributes[versionIdKey] = data.VersionId;
                                       // Call new item notification to compute number of new items available
                                       asyncCallback(null, feedItems);
                                   } else {
                                       // File for the category does not exists. Thus parse feed and store in S3.
                                       logHelper.logAPICall(this.event.session, 'Feed Parser');
                                       // Call feedHelper to fetch feeds for given category
                                       feedHelper.getFeed(category, this.attributes[fileNameKey],(error, feed) => {
                                           if (error) {
                                               logHelper.logAPIError(this.event.session, 'Feed Parser', error);
                                               asyncCallback(error, feed)
                                           } else {
                                               logHelper.logAPISuccesses(this.event.session, 'Feed Parser');
                                               if (feed.items) {
                                                   this.attributes[versionIdKey] = feed.VersionId;
                                                   asyncCallback(null, feed.items);
                                               } else {
                                                   console.log('Feed parsed is empty');
                                                   this.emit('feedEmptyError');
                                               }
                                           }
                                       });
                                   }
                               }
                            });
                        }
                    });
                });
                // Calling async parallel to run above requests simultaneously
                async.parallel(asyncDataCollection, (err, results) => {
                    if (err) {
                        console.log("Async Error : " + err);
                        this.emit('reportError');
                    } else {
                        var allFeeds = {};
                        items = [];
                        // Merge all items and eliminate duplicates
                        results.forEach(function (feeds) {
                            feeds.forEach(function (feed) {
                                allFeeds[feed.title] = feed;
                            });
                        });
                        for (var feed in allFeeds) {
                            items.push(allFeeds[feed]);
                        }
                        // Sort all items based on the date
                        items.sort(function (a, b) {
                            return new Date(b.date) - new Date(a.date);
                        });
                        // Re-initialize the count variable since order disrupted during sort
                        for (var index = 0; index < items.length; index++) {
                            items[index].count = index;
                        }
                        // Save all processed items in a file
                        var fileNameKey = 'fileNameFavorite';
                        randomNameGenerator((fileName) => {
                            this.attributes[fileNameKey] = fileName;
                            feedHelper.stringifyItems(items, (feedData) => {
                                logHelper.logAPICall(this.event.session, 'S3');
                                // Call S3 to store favorite items file
                                s3Helper.putObject(fileName, feedData, (err, data) => {
                                    if (err) {
                                        logHelper.logAPIError(this.event.session, 'S3', err);
                                        this.emit('reportError');
                                    } else {
                                        logHelper.logAPISuccesses(this.event.session, 'S3');
                                        this.attributes['favoriteFilePresent'] = true;
                                        this.attributes['versionIdFavorite'] = data.VersionId;
                                        this.attributes['category'] = 'Favorite';
                                        // Call new item notification to compute number of new items available
                                        newItemNotification.call(this, (newItemCount) => {
                                            /*
                                             *  If number of new items = 0 : notify user and ask whether to continue with feed
                                             *  Else : notify user the number of new items and begin feed with first page
                                             */
                                            if (newItemCount === 0) {
                                                this.emit('noNewItems');
                                            } else {
                                                this.emit('readItems');
                                            }
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
            } else {
                // No categories marked as favorite. Notify user.
                this.emit('favoriteListEmpty');
            }
        }
    },
    'addFavorite' : function (category) {
        /*
         *   If requested category does not exists in favorite category list :
         *      * Add it to favorites
         *      * Call deleteFavoriteFile
         *   Else : give appropriate message to the user
         */
        var categoryIndex = this.attributes['favoriteCategories'].indexOf(category);
        if (categoryIndex === -1) {
            this.attributes['favoriteCategories'].push(category);
            console.log(category + ' added to favorites.');
            // Call deleteFavoriteFile since items in favorite category are altered
            deleteFavoriteFile.call(this, () => {
                this.emit('favoriteAdded', category);
            });
        } else {
            this.emit('favoriteAddExistingError', category);
        }
    },
    'addCurrentToFavorite' : function () {
        /*
         * Identify current category
         * If category is favorite : give error message
         * Else : add category to favorite if not present and give appropriate message 
         */
        var category = this.attributes['category'];
        if (category != 'Favorite') {
            this.emit('addFavorite', category);
        } else {
            this.emit('favoriteAddCurrentError');
        }
    },
    'removeFavorite' : function (category) {
        /*
         *   If requested category exists in favorite category list :
         *      * remove from favorites
         *      * call deleteFavoriteFile
         *   Else : give appropriate message to the user
         */
        var categoryIndex = this.attributes['favoriteCategories'].indexOf(category);
        if (categoryIndex > -1) {
            this.attributes['favoriteCategories'].splice(categoryIndex,1);
            console.log(category + ' removed from favorites.');
            // Call deleteFavoriteFile since items in favorite category are altered
            deleteFavoriteFile.call(this, () => {
                this.emit('favoriteRemoved', category);
            });
        } else {
            this.emit('favoriteRemoveExistingError', category);
        }
    },
    'removeCurrentFromFavorite' : function () {
        /*
         * Identify current category
         * If category is favorite : give error message
         * Else : remove category from favorite and give appropriate message 
         */
        var category = this.attributes['category'];
        if (category != 'Favorite') {
            this.emit('removeFavorite', category);
        } else {
            this.emit('favoriteRemoveCurrentError');
        }
    },
    'launchSingleMode' : function () {
        var category = Object.keys(config.feeds)[0];
        var fileNameKey = 'fileName' + category;
        var versionIdKey = 'versionId' + category;
        // Initialize attributes
        this.attributes['category'] = category;
        this.attributes[fileNameKey] = 'feeds.json';

        logHelper.logAPICall(this.event.session, 'S3');
        s3Helper.getObject(this.attributes[fileNameKey], null, (err, data) => {
            if (err) {
                logHelper.logAPIError(this.event.session, 'S3', err);
                if (err.code === 'NoSuchKey') {
                    // File for the category does not exists. Thus parse feed and store in S3.
                    fetchFeed.call(this, (newItemCount) => {
                        if (newItemCount === 0) {
                            this.emit('noNewItems');
                        } else {
                            this.emit('readItems');
                        }
                    });
                } else {
                    logHelper.logAPIError(this.event.session, 's3', err);
                    this.emit('reportError');
                }
            } else {
                logHelper.logAPISuccesses(this.event.session, 'S3');
                if (data) {
                    var allowedTimePeriod = constants.updateFeedTime*60*1000;
                    if ((new Date() -  data.LastModified < allowedTimePeriod)) {
                        items = JSON.parse(data.Body);
                        this.attributes[versionIdKey] = data.VersionID;
                        this.attributes['feedLength'] = items.length;
                        // Call new item notification to compute number of new items available
                        newItemNotification.call(this, (newItemCount) => {
                            if (newItemCount === 0) {
                                this.emit('noNewItems');
                            } else {
                                this.emit('readItems');
                            }
                        });
                    } else {
                        // File is much older than allowed time. Calling feedHelper and storing file in S3.
                        fetchFeed.call(this, (newItemCount) => {
                            if (newItemCount === 0) {
                                this.emit('noNewItems');
                            } else {
                                this.emit('readItems');
                            }
                        });
                    }
                }
            }
        });
    }
};

module.exports = intentHandlers;

function fetchFeed(callback) {
    var category = this.attributes['category'];
    var fileNameKey = 'fileName' + category;
    var versionIdKey = 'versionId' + category;

    logHelper.logAPICall(this.event.session, 'Feed Parser');
    // Call feedHelper to fetch feeds for given category
    feedHelper.getFeed(category, this.attributes[fileNameKey],(err, data) => {
        if (err) {
            logHelper.logAPIError(this.event.session, 'Feed Parser', err);
            this.emit('reportError');
        } else {
            logHelper.logAPISuccesses(this.event.session, 'Feed Parser');
            if (data && data.items) {
                items = data.items;
                this.attributes[versionIdKey] = data.VersionId;

                if (this.handler.state === constants.states.SINGLE_FEED_MODE) {
                    this.attributes['feedLength'] = items.length;
                }

                // Call new item notification to compute number of new items available
                newItemNotification.call(this, (newItemCount) => {
                    callback(newItemCount);
                });
            } else {
                console.log('Feed parsed is empty');
                this.emit('feedEmptyError');
            }
        }
    });
}

function loadItems(callback) {
    // If data already present in global variable, return back
    if (items) {
        return callback();
    }
    /*
     * Load items stored in the S3 bucket
     * Call specific event based on the status of the feed with the direction passed
     */
    var category = this.attributes['category'];
    var fileNameKey = 'fileName' + category;
    var versionIdKey = 'versionId' + category;
    logHelper.logAPICall(this.event.session, 'S3');
    // Retrieve feed data stored in S3 storage
    s3Helper.getObject(this.attributes[fileNameKey], this.attributes[versionIdKey],(err, data) => {
        if (err) {
            logHelper.logAPIError(this.event.session, 'S3', err);
            this.emit('reportError');
        } else {
            logHelper.logAPISuccesses(this.event.session, 'S3');
            if (data && data.Body) {
                items = JSON.parse(data.Body);
                callback();
            } else {
                console.log('Data retrieved is empty');
                this.emit('feedEmptyError');
            }
        }
    });
}

function newItemNotification(callback) {
    var category = this.attributes['category'];
    var indexKey = 'index' + category;
    var directionKey = 'direction' + category;
    var justStartedKey = 'justStarted' + category;
    // Initialize index and direction
    this.attributes[indexKey] = 0;
    this.attributes[directionKey] = 'forward';
    this.attributes[justStartedKey] = true;
    // Calculate number of new items available in the feed since the last visit
    var newItemCount = -1;
    if (this.attributes['latestItem'] && this.attributes['latestItem'][category]) {
        var lastItemTitle = this.attributes['latestItem'][category];
        for (var index = 0; index < items.length; index++) {
            if (items[index].title === lastItemTitle) {
                newItemCount = index;
                break;
            }
        }
    }
    // Update the latest item for the feed for future session
    this.attributes['latestItem'][this.attributes['category']] = items[0].title;
    this.attributes['newItemCount'] = newItemCount;
    // Callback with new item count
    callback(newItemCount);
}

function deleteFavoriteFile(callback) {
    /*
     * If favorite file present : delete file from S3 and give appropriate message
     * Else : give appropriate message
     */
    if (this.attributes['latestItem'] && this.attributes['latestItem']['Favorite']) {
        delete this.attributes['latestItem']['Favorite'];
    }

    if (this.attributes['favoriteFilePresent']) {
        logHelper.logAPICall(this.event.session, 'S3');
        // Delete favorite file from S3 created in current session
        s3Helper.deleteObject(this.attributes['fileNameFavorite'], this.attributes['versionIdFavorite'],(err) => {
            if (err) {
                logHelper.logAPIError(this.event.session, 'S3', err);
                this.emit('reportError');
            } else {
                logHelper.logAPISuccesses(this.event.session, 'S3');
                this.attributes['fileNameFavorite'] = null;
                this.attributes['favoriteFilePresent'] = false;
                this.attributes['versionIdFavorite'] = null;
                callback();
            }
        });
    } else {
        callback();
    }    
}

function randomNameGenerator(callback) {
    // Generate file name.
    var fileName = '';
    var potentialChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i=0; i<10; i++) {
        fileName += potentialChar.charAt(Math.floor(Math.random() * potentialChar.length));
    }
    fileName += '.json';
    callback(fileName);
}