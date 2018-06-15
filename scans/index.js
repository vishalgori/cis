var async = require('async');
var plugins = require('./exports.js');
var collector = require('./collect.js');
const SumoLogic = require('logs-to-sumologic');
var dateFormat = require('dateformat');
var now = new Date();

var AWSConfig;

exports.handler = (event, context, callback) => {
    var AWSConfig = event.creds;
    var session = event.session['role'];
    var account = event.account;

    if (!AWSConfig || !AWSConfig.accessKeyId) {
        return console.log('ERROR: Invalid AWSConfig');
    }

    var skipRegions = [];   // Add any regions you wish to skip here. Ex: 'us-east-2'

    // Custom settings - place plugin-specific settings here
    // var settings = {};

    // STEP 1 - Obtain API calls to make
    console.log('INFO: Determining API calls to make...');

    var apiCalls = [];

    for (p in plugins) {
        for (a in plugins[p].apis) {
            if (apiCalls.indexOf(plugins[p].apis[a]) === -1) {
                apiCalls.push(plugins[p].apis[a]);
            }
        }
    }

    console.log('INFO: API calls determined.');
    console.log('INFO: Collecting AWS metadata. This may take several minutes...');

    var url = 'https://endpoint2.collection.us2.sumologic.com/receiver/v1/http/ZaVnC4dhaV3Mq185y4xN-4v-U3TpOGmvp6vXrdMcyXNHCY3Rm0pOQgL4GSvFkAiesxux_gx4qWe2WSeERT_WTjKur6U1M7pdsk6aH7GQBOqOkZrHg0tiFQ=='
    const sumologic = SumoLogic.createClient({url: url, name: "SecAuditSumoHttpCollector", host: "stsecaudit.com", category: "env/host/service" });
    var cb = function (err, res) {if (err) {console.log("Error uploading logs to SumoLogic collector")} console.log("Successfully uploaded logs to SumoLogic collector")};

    // STEP 2 - Collect API Metadata from AWS
    collector(AWSConfig, {api_calls: apiCalls, skip_regions: skipRegions}, function(err, collection){
        if (err || !collection) return console.log('ERROR: Unable to obtain API metadata');

        console.log('INFO: Metadata collection complete. Analyzing...');
        console.log('INFO: Analysis complete. Scan report to follow...\n');

        async.forEachOfLimit(plugins, 10, function(plugin, key, callback){
            plugin.run(collection, function(err, results){
                for (r in results) {
                    var statusWord;
                    if (results[r].status === 0) {
                        statusWord = 'OK';
                    } else if (results[r].status === 1) {
                        statusWord = 'WARN';
                    } else if (results[r].status === 2) {
                        statusWord = 'FAIL';
                    } else {
                        statusWord = 'UNKNOWN';
                    }

                    //console.log(plugin.category + '\t' + plugin.title + '\t' +
                    //            (results[r].resource || 'N/A') + '\t' +
                    //            (results[r].region || 'Global') + '\t\t' +
                    //            statusWord + '\t' + results[r].message);
                    log = dateFormat(now,"isoDateTime") + ',' +
                                account + ',' +
                                plugin.category + ',' + plugin.title + ',' +
                                (results[r].resource || 'N/A') + ',' +
                                (results[r].region || 'Global') + ',' +
                                statusWord + ',' + results[r].message
                    sumologic.log(log, cb);
                }

                callback(err);
            });
        }, function(err){
            if (err) return console.log(err);
        });
    });
    //callback(null, "ST-CloudSploited");
  }
