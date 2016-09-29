"use strict";

var AWS = require("aws-sdk");
var s3 = new AWS.S3();
var config = require("./configuration");

var s3Helper = function () {
    return {
        // Get file from S3
        getObject : function (fileName, versionId, callback) {
            var params = {
                Bucket: config.s3BucketName,
                Key: fileName
            };
            if (versionId) {
                params.VersionId = versionId;
            }
            s3.getObject(params, function (err, data) {
                callback(err, data);
            });
        },
        // Put file into S3
        putObject : function (fileName, data, callback) {
            var expirationDate = new Date();
            // Assuming a user would not remain active in the same session for over 1 hr.
            expirationDate = new Date(expirationDate.setHours(expirationDate.getHours() + 1));
            var params = {
                Bucket: config.s3BucketName,
                Key: fileName,
                Body: data,
                Expires: expirationDate
            };
            s3.putObject(params, function (err, data) {
                callback(err, data);
            });
        },
        // Delete file from S3
        deleteObject : function (fileName, versionId,callback) {
            var params = {
                Bucket: config.s3BucketName,
                Key : fileName,
                VersionId : versionId
            };
            s3.deleteObject(params, function (err, data) {
                callback(err, data);
            })
        },
        // Delete files from S3
        deleteObjects : function (objects, callback) {
            var params = {
                Bucket: config.s3BucketName,
                Delete: {
                    Objects : objects
                }
            };
            s3.deleteObjects(params, function (err, data) {
                callback(err, data);
            })
        }
    };
}();

module.exports = s3Helper;