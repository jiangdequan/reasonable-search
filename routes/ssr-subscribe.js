var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');
var schedule = require('node-schedule');

var base64 = require('../lib/encrypt/base64');
var LOGGER = require('../lib/logger/logger');

var router = express.Router();

exports.router = router;

var tempSrrArray = [];

var cachedData = [];

const SSR_PREFIX = 'ssr://';

router.get('/ssr/flush', function (req, res) {
    tempSrrArray = [];
    cachedData = [];
    site52ssr();
    siteDoub();
    res.send('flush success!');
    LOGGER.info('flush success!', __filename);
});

router.get('/ssr/subscribe/doub/:max', function (req, res) {
    var max = parseInt(req.params.max);
    if (max === 0) {
        res.send('');
    }
    var doubSsrs = cachedData['doub'];
    max = doubSsrs.length < max ? doubSsrs.length : max;
    var max_str = 'MAX=' + max;
    var selectedData = [];
    for (var i = 0; i < max; i++) {
        selectedData.push(doubSsrs[i]);
    }
    res.send(base64.encrypt(max_str + '\n' + selectedData.join('\n')));
});

router.get('/ssr/doub/subscribe', function (req, res) {
    var doubSsrs = cachedData['doub'];
    res.send(base64.encrypt(doubSsrs.join('\n')));
});

function siteGooglePlus() {
    superagent.get('https://plus.google.com/communities/104092405342699579599').end(function (err, sres) {
        // 常规的错误处理
        if (err) {
            LOGGER.error('failed to request plus.google.com, ' + error, __filename);
            return;
        }
        var $ = cheerio.load(sres.text);
        $('.jVjeQd').each(function (idx, element) {
            var $element = $(element);
            var textStr = $element.text();
            if (textStr.indexOf('ssr') !== -1) {
                console.log('+++++++++++++++++++++++++++');
                console.log(textStr);
                array = getSsrText(textStr);
                console.log(array.length);
    
                for (var i = 0; i < array.length; i++) {
                    if (!dataExist(array[i])) {
                        crawledData.push(array[i]);
                        var result = rebuildSsr(array[i], "doub.io");
                        console.log('-------------------------');
                        console.log(result);
                        data.push(result);
                    }
                }
            }
        });
    });
}

function site52ssr() {
    superagent.get('http://www.52ssr.fun/').end(function (err, response) {
        // request error
        if (err) {
            LOGGER.error('Failed to request 52ssr.fun, ' + err, __filename);
            return;
        }

        var $ = cheerio.load(response.text);
        var remarks = $('#buttons .btn-warning').text();
        var tempSsrs = [];
        $('#buttons a').each(function (idx, element) {
            var $element = $(element);
            var href = $element.attr('href');
            if (href.startsWith('ssr:') && !isAddedSsr(href)) {
                tempSrrArray.push(href);
                var result = generateNewSsr(href, '', '', 'YouMayCallMeV_52ssr.fun', remarks);
                tempSsrs.push(result);
            }
        });
        if (tempSsrs.length > 0) {
            cachedData['52ssr'] = tempSsrs;
        }
    });
}

function siteDoub() {
    superagent.get('https://doub.io/sszhfx/').end(function (err, response) {
        // request error
        if (err) {
            LOGGER.error("[E] Faile to crawl doub.io, " + err, __filename);
            return;
        }
        var $ = cheerio.load(response.text);
        var tempSsrs = [];
        $('td a.dl1').each(function (idx, element) {
            var $element = $(element);
            var href = $element.attr('href');
            href = href.substring(href.indexOf('=') + 1);
            if (href.startsWith('ssr:') && !dataExist(href)) {
                tempSrrArray.push(href);
                var result = generateNewSsr(href, '', '', 'YouMayCallMeV_doub.io', 'doub.io');
                tempSsrs.push(result);
            }
        });
        if (tempSsrs.length > 0) {
            cachedData['doub'] = tempSsrs;
        }
    });
}

function isAddedSsr(ssr) {
    for (var i = 0; i < tempSrrArray.length; i++) {
        if (tempSrrArray[i] === ssr) {
            return true;
        }
    }
    return false;
}

/**
 * SSR Schema: https://github.com/shadowsocksr-backup/shadowsocks-rss/wiki/SSR-QRcode-scheme
 * 
 * @param {*} ssr 
 * @param {*} protoparam 
 * @param {*} obfsparam 
 * @param {*} group 
 * @param {*} remarks 
 */
function generateNewSsr(ssr, protoparam, obfsparam, group, remarks) {
    // remove the prefix(ssr://) of the ssr text
    var tempSsr = ssr.substring(SSR_PREFIX.length);
    // decrypt of the left ssr
    var decryptSsr = base64.decryptSsr(tempSsr);
    // have some additional parameters
    if (-1 !== decryptSsr.indexOf('/?')) {
        // remove additional parameters
        decryptSsr = decryptSsr.substring(0, decryptSsr.indexOf('/?') + 2);
    }
    return addAdditionalParams(decryptSsr, protoparam, obfsparam, group, remarks);
}

/**
 * 
 * @param {*} originalSsr host:port:protocol:method:obfs:base64pass/?
 * @param {*} protoparam 
 * @param {*} obfsparam 
 * @param {*} group 
 * @param {*} remarks 
 */
function addAdditionalParams(originalSsr, protoparam, obfsparam, group, remarks) {
    var parameterAdded = false;
    if ('' !== obfsparam && undefined !== obfsparam) {
        parameterAdded = true;
        originalSsr += 'obfsparam=' + base64.encryptSsr(obfsparam);
    }
    var andMark = '';
    if ('' !== protoparam && undefined !== protoparam) {
        if (parameterAdded) {
            andMark = '&';
        }
        parameterAdded = true;
        originalSsr += andMark + 'protoparam=' + base64.encryptSsr(protoparam);
    }
    if ('' !== remarks && undefined !== remarks) {
        if (parameterAdded) {
            andMark = '&';
        }
        parameterAdded = true;
        originalSsr += andMark + 'remarks=' + base64.encryptSsr(remarks);
    }
    if ('' !== group && undefined !== group) {
        if (parameterAdded) {
            andMark = '&';
        }
        parameterAdded = true;
        originalSsr += andMark + 'group=' + base64.encryptSsr(group);
    }
    LOGGER.debug(originalSsr, __filename);
    var encryptSsr = base64.encryptSsr(originalSsr);
    return SSR_PREFIX + encryptSsr;
}

/**
 * 
 * @param {*} host 
 * @param {*} port 
 * @param {*} password 
 * @param {*} method 
 * @param {*} protocol 
 * @param {*} protoparam 
 * @param {*} obfs 
 * @param {*} obfsparam 
 * @param {*} group 
 * @param {*} remarks 
 */
function generateSsr(host, port, password, method, protocol, protoparam, obfs, obfsparam, group, remarks) {
    // Required parameters
    var originalSsr = host + ':' + port + ':' + protocol + ':' + method + ':' + obfs + ':' + base64.encryptSsr(password) + '/?';
    return addAdditionalParams(originalSsr, protoparam, obfsparam, group, remarks);
}

var scheduleJob = schedule.scheduleJob('* * 0,6,11,17,22 * * *', function(){
    tempSrrArray = [];
    cachedData = [];
    site52ssr();
    siteDoub();
    LOGGER.info('scheduled job is running!');
});

exports.site52ssr = site52ssr;
exports.siteDoub = siteDoub;