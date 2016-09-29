'use strict';

var FeedParser = require('feedparser');
var fs = require('fs');
var entities = require('html-entities').AllHtmlEntities;
var request = require('request');
var striptags = require('striptags');

var config = require('./configuration');
var constants = require('./constants');
var logHelper = require('./logHelper');
var s3Helper = require('./s3Helper');

var feedParser = function () {
    return {
        getFeed : function (category, fileName, callback) {
            var url = config.feeds[category];
            var req = request(url);
            var feedparser = new FeedParser(null);
            var items = [];

            req.on('response', function (res) {
                var stream = this;
                if (res.statusCode === 200) {
                    stream.pipe(feedparser);
                } else {
                    return stream.emit('error', new Error('Bad status code'));
                }
            });

            req.on('error', function (err) {
                return callback(err, null);
            });

            // Received stream. parse through the stream and create JSON Objects for each item
            feedparser.on('readable', function() {
                var stream = this;
                var item;
                while (item = stream.read()) {
                    var feedItem = {};
                    // Process feedItem item and push it to items data if it exists
                    if (item['title'] && item['date']) {
                        feedItem['title'] = item['title'];
                        feedItem['title'] = entities.decode(striptags(feedItem['title']));
                        feedItem['title'] = feedItem['title'].trim();
                        feedItem['title'] = feedItem['title'].replace(/[&]/g,'and').replace(/[<>]/g,'');

                        feedItem['date'] = new Date(item['date']).toUTCString();

                        if (item['description']) {
                            feedItem['description'] = item['description'];
                            feedItem['description'] = entities.decode(striptags(feedItem['description']));
                            feedItem['description'] = feedItem['description'].trim();
                            feedItem['description'] = feedItem['description'].replace(/[&]/g,'and').replace(/[<>]/g,'');
                        }

                        if (item['link']) {
                            feedItem['link'] = item['link'];
                        }

                        if (item['image'] && item['image'].url) {
                            feedItem['imageUrl'] = item['image'].url;
                        }
                        items.push(feedItem);
                    }
                }
            });
            
            // All items parsed. Store items in S3 and return items
            feedparser.on('end', function () {
                var count = 0;
                items.sort(function (a, b) {
                    return new Date(b.date) - new Date(a.date);
                });
                items.forEach(function (feedItem) {
                    feedItem['count'] = count++;
                });
                stringifyFeeds(items, (feedData) => {
                    s3Helper.putObject(fileName, feedData, function (err, data) {
                        if (err) {
                            callback(err, data);
                        } else {
                            data.items = items;
                            callback(err, data);
                        }
                    });
                });
            });

            feedparser.on('error', function(err) {
                callback(err, null);
            });
        },
        stringifyItems : function (items, callback) {
            stringifyFeeds(items, function (feedData) {
                callback(feedData);
            })
        }
    };
}();

function stringifyFeeds(items, callback) {
    // Structure items before storing into S3 file.
    var feedData = '[';
    for (var i = 0; i < items.length; i++) {
        feedData += JSON.stringify(items[i]) + ', ';
    }
    var dataLength = feedData.length;
    feedData = feedData.substring(0, dataLength-2) + ']';
    callback(feedData);
}

module.exports = feedParser;