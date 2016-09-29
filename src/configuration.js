'use strict';

var config = {
    // TODO Add Application ID
    appId : '<APP-ID>',
    // TODO Add an appropriate welcome message.
    welcome_message : '<WELCOME_MESSAGE>',

    number_feeds_per_prompt : 3,
    speak_only_feed_title : true,
    display_only_title_in_card : true,

    // TODO Add the category name (to feed name) and the corresponding URL
    feeds : {
        'CATEGORY_NAME_1' : '<FEED_URL>',
        'CATEGORY_NAME_2' : '<FEED_URL>',
        'CATEGORY_NAME_3' : '<FEED_URL>'

    },

    speech_style_for_numbering_feeds : 'Item',

    // TODO Add the s3 Bucket Name, dynamoDB Table Name and Region
    s3BucketName : '<S3-BUCKET-NAME>',
    dynamoDBTableName : '<DYNAMODB-TABLE-NAME>',
    dynamoDBRegion : '<DYNAMODB-REGION>'
};

module.exports = config;