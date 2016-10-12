var bluemix  = require('../config/bluemix');
var extend      = require('util')._extend;
var fs = require('fs');
var Q = require('q');
var streamifier = require('streamifier');
var wdc = require('watson-developer-cloud');

function VisualRecognitionUtils(watson,callback) {

    // If bluemix credentials (VCAP_SERVICES) are present then override the local credentials
    watson.config.visual_recognition = extend(watson.config.visual_recognition, bluemix.getServiceCreds('visual_recognition')); // VCAP_SERVICES

    if (watson.config.visual_recognition) {
        this.vrService = wdc.visual_recognition({
            api_key: watson.config.visual_recognition.api_key,
            version: 'v3',
            version_date: '2016-05-19'
        });
    }else{
        callback({errMessage : "Visual Recognition key not found"});
    }
}

VisualRecognitionUtils.prototype.classify = function(filePath) {

    var deferred = Q.defer();
    var params = {
        images_file: fs.createReadStream(filePath)
    };

    this.vrService.classify(params, function(err, res) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(res);
            //deferred.resolve(JSON.stringify(res));
    });
    return deferred.promise;
}

VisualRecognitionUtils.prototype.detectFaces = function(filePath) {

    var deferred = Q.defer();
    var params = {
        images_file: fs.createReadStream(filePath)
    };

    this.vrService.detectFaces(params, function(err, res) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(res);
            //deferred.resolve(JSON.stringify(res));
    });
    return deferred.promise;
}

// Exported class
module.exports = VisualRecognitionUtils;

