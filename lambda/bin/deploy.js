var config = require('../custom/configuration');
var fs = require('fs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var modelFile = fs.readFileSync('../../models/en-US.json');
var modelContent = JSON.parse(modelFile);

function getRandomId() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function addCategoryValue(category_name) {
    value =
        {
            "id": getRandomId(),
            "name": {
                "value": category_name,
                "synonyms": []
            }
        };

    return value
}

var feeds = Object.keys(config.feeds);
if (feeds.length > 1) {
    var fileOutput = "";

    var categories = [];

    feeds.forEach(function (feed) {
        fileOutput += feed + "\n";
        categories.push(addCategoryValue(feed))
    });
    fileOutput += "Favorite";

    categories.push(addCategoryValue("Favorite"));

    var types = modelContent.interactionModel.languageModel.types;
    for (index in types) {
        if (types[index].name.toUpperCase() === "CATEGORY") {
            types[index].values = categories;
            // console.log(categories);
            break
        }
    }

    // Write the model content
    console.log("Updating interaction model with Configuration Categories.");
    fs.writeFileSync('../../models/en-US-updated.json', JSON.stringify(modelContent));

    fs.writeFile('../../models/CustomSlots-CATEGORY.txt', fileOutput, function (err) {
        if (err) {
            console.log('Error while creating custom slots value');
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

s3.putBucketVersioning(params, function (err, data) {
    if (err) {
        console.log(err, err.stack);
    } else {
        console.log('Bucket Versioning Enabled.');
        params = {
            Bucket: config.s3BucketName,
            LifecycleConfiguration: {
                Rules: [
                    {
                        Prefix: '',
                        Status: 'Enabled',
                        Expiration: {
                            Days: 1
                        },
                        NoncurrentVersionExpiration: {
                            NoncurrentDays: 1
                        }
                    }
                ]
            }
        };
        s3.putBucketLifecycleConfiguration(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log('Object Expiration rules set.');
            }
        });
    }
});
