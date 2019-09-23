var express = require('express');
var request = require('request');

var keepaliveTask = require('../lib/cron/keepalive');

// 初始化express
var router = express.Router();

// 路由
router.use('/http', function (req, res) {
    var url = req.url.substring(1);

    var host = url.replace('https://', '').replace('http://', '');
    if (host.includes('/')) {
        host = host.substring(0, host.indexOf('/'));
    }
    req.headers.host = host;

    delete req.headers.referer;
    req.pipe(request(url)).pipe(res);
});

router.use('/', function (req, res) {
    keepaliveTask.execute();

    var url = req.url;
    if (url.startsWith('/-----')) {
        url = url.substring(6);
        var host = url.replace('https://', '').replace('http://', '');
        if (host.includes('/')) {
            host = host.substring(0, host.indexOf('/'));
        }
        req.headers.host = host;

        delete req.headers.referer;
        req.pipe(request(url)).pipe(res);
    } else {
        res.render('index_v3');
    }
});

exports.router = router;