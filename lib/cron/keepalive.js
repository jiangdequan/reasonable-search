var CronJob = require('cron').CronJob;
var request = require('request');
var yaml = require('js-yaml');
var fs = require('fs');

var base64 = require('../encrypt/base64');

var LOGGER = require('../logger/logger');

var config;
var checkSites;
var job;

function loadSites() {
    config = yaml.safeLoad(fs.readFileSync(__dirname + '/../../application.yml', 'utf8'));
    checkSites = config.keepalive.sites;
    for (var i = 0, len = checkSites.length; i < len; i++) {
        checkSites[i] = base64.decrypt(checkSites[i]);
    }
}

var execute = function () {
    if (job !== null && job !== undefined) {
        return;
    }
    loadSites();
    LOGGER.info('Starting cron job to check the sites', __filename);

    job = new CronJob(config.keepalive.cron, function() {
        for (var i = 0, len = checkSites.length; i < len; i++) {
            LOGGER.info('Checking site: ' + checkSites[i], __filename);
            request(checkSites[i]);
        }
    });
    job.start();
    LOGGER.info('Cron job started', __filename);
}

exports.execute = execute;