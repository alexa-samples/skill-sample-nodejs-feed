var config = require('../src/configuration');
var fs = require('fs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();


var feeds = Object.keys(config.feeds);
if (feeds.length > 1) {
    var fileOutput = "";

    feeds.forEach(function (feed) {
        fileOutput += feed + "\n";
    });

    fileOutput += "Favorite";

    fs.writeFile('../speechAssets/CustomSlots-CATEGORY.txt', fileOutput, function (err) {
        if (err) {
            console.log('Error while creating custom slots value')
            console.log(err.message);
        } else {
            console.log('CustomSlots-CATEGORY.txt generated.');
        }   
    });
}


var params = {
    Bucket: config.s3BucketName,
    VersioningConfiguration: {
        Status: 'Enabled'
    }
};
s3.putBucketVersioning(params, function(err, data) {
    if (err) {
        console.log(err, err.stack);
    } else {
        console.log('Bucket Versioning Enabled.');
        params = {
            Bucket: config.s3BucketName,
            LifecycleConfiguration: {
                Rules : [
                    {
                        Prefix : '',
                        Status: 'Enabled',
                        Expiration : {
                            Days : 1
                        },
                        NoncurrentVersionExpiration : {
                            NoncurrentDays: 1
                        }
                    }
                ]
            }
        };
        s3.putBucketLifecycleConfiguration(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log('Object Expiration rules set.');
            }
        });
    }
});