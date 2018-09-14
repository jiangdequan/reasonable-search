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

var debugData = [];

const SSR_PREFIX = 'ssr://';

router.get('/ssr/debug', function (req, res) {
    var temp = [];
    for (var i = 0; i < debugData.length; i++) {
        var ssConfig = debugData[i];
        var ssLink = ssConfig[2] + ':' + ssConfig[3] + '@' + ssConfig[0] + ':' + ssConfig[1];
        temp.push(ssLink);
        LOGGER.debug('ss from free-ss = ' + ssLink, __filename);
    }
    res.send(temp.join('\n'));
});

router.get('/ssr/flush', function (req, res) {
    tempSrrArray = [];
    cachedData = [];
    site52ssr();
    siteDoub();
    res.send('flush success!');
    LOGGER.info('flush success!', __filename);
});

router.get('/ssr/subscribe/52ssr/:max', function (req, res) {
    var max = parseInt(req.params.max);
    res.send(generateResponse('52ssr', max));
});

router.get('/ssr/subscribe/52ssr', function (req, res) {
    res.send(generateResponse('52ssr'));
});

router.get('/ssr/subscribe/doub/:max', function (req, res) {
    var max = parseInt(req.params.max);
    res.send(generateResponse('doub', max));
});

router.get('/ssr/subscribe/doub', function (req, res) {
    res.send(generateResponse('doub'));
});

function generateResponse(key, max) {
    var cachedSsrsByKey = cachedData[key];
    if (undefined === max) {
        return base64.encrypt(cachedSsrsByKey.join('\n'));
    }

    if (max === 0) {
        return '';
    }
    max = cachedSsrsByKey.length < max ? cachedSsrsByKey.length : max;
    var max_str = 'MAX=' + max;
    var selectedData = [];
    for (var i = 0; i < max; i++) {
        selectedData.push(cachedSsrsByKey[i]);
    }
    return base64.encrypt(max_str + '\n' + selectedData.join('\n'));
}

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
                    if (!isAddedSsr(array[i])) {
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

/**
 * ss://base64(method:password@server:port)
 */
function siteFreeSs() {
    superagent.get('https://free-ss.site/').end(function (err, response) {
        // record the error msg
        if (err) {
            LOGGER.error('failed to request free-ss.site, ' + error, __filename);
            return;
        }
        var $ = cheerio.load(response.text);
        var debugData = [];
        $('#tb8cda tr').each(function (idx, element) {
            var $element = $(element);
            var ssConfig = [];
            $element.find('td').each(function (index, tdElement) {
                if (index > 0 && index < 5) {
                    var $tdElement = $(tdElement);
                    // the sequence: address port method password
                    ssConfig.push($tdElement.text());
                }
            });
            debugData.push(ssConfig);
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
                LOGGER.info('get ssr from 52ssr.fun: ' + href, __filename);
                tempSrrArray.push(href);
                var result = generateNewSsr(href, '', '', 'YouMayCallMeV-52SSR', remarks);
                tempSsrs.push(result);
            }
        });
        cachedData['52ssr'] = tempSsrs;
    });
}

function siteDoub() {
    superagent.get('https://doub.io/sszhfx/').end(function (err, response) {
        // request error
        if (err) {
            LOGGER.error("Faile to crawl doub.io, " + err, __filename);
            return;
        }
        var $ = cheerio.load(response.text);
        var tempSsrs = [];
        $('td a.dl1').each(function (idx, element) {
            var $element = $(element);
            var href = $element.attr('href');
            superagent.get(href).end(function (err, response) {
                // request error
                if (err) {
                    LOGGER.error("Faile to crawl doub.io, " + err, __filename);
                    return;
                }
                var $ = cheerio.load(response.text);
                var ssr = $('#biao1').attr('href');
                if (ssr.startsWith('ssr:') && !isAddedSsr(ssr)) {
                    LOGGER.info('get ssr from doub.io: ' + ssr, __filename);
                    tempSrrArray.push(ssr);
                    var result = generateNewSsr(ssr, '', '', 'YouMayCallMeV-DOUB', 'doub');
                    tempSsrs.push(result);
                }
            });
        });
        cachedData['doub'] = tempSsrs;
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
    } else {
        decryptSsr += '/?';
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
    LOGGER.debug(remarks + '-' + originalSsr, __filename);
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

// the rule of schedule Job: run job every 4 hours
var rule = new schedule.RecurrenceRule();
var times = [1, 5, 9, 13, 17, 21];
rule.hour = times;
rule.minute = 0;
rule.second = 0;

var scheduleJob = schedule.scheduleJob(rule, function () {
    tempSrrArray = [];
    cachedData = [];
    site52ssr();
    siteDoub();
    LOGGER.info('scheduled job is running!', __filename);
});

exports.site52ssr = site52ssr;
exports.siteDoub = siteDoub;
exports.siteFreeSs = siteFreeSs;
