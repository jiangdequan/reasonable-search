
var express = require('express');
var request = require('request');

// 初始化express
var router = express.Router();

var remoteUrls = new Array("https://www.google.com", "https://www.google.com.hk", "https://www.duckduckgo.com", "https://www.google.co.jp", "https://www.baidu.com");

var remoteUrlIndex = 0;

var remoteUrl = remoteUrls[remoteUrlIndex];

var searchTips = '1、使用 "" 进行完全匹配，例如："谷歌"<br>' +
                 '2、使用 - 排除关键字，例如："谷歌 -某某"<br>' +
                 '3、使用 * 进行模糊匹配，例如："谷歌*技巧"<br>' +
                 '4、使用 site 指定网站，例如："谷歌 site:google.com"<br>'+
                 '5、使用 <a href="https://support.google.com/webmasters/answer/35287?hl=en">filetype</a> 指定文件类型，例如："谷歌 filetype:pdf"<br>';

router.get('/list', function(req, res) {
    res.send('Supported Proxy Urls: ' + remoteUrls + '<br>Current Used Url: ' + remoteUrl);
});

router.get('/next', function(req, res) {
    remoteUrlIndex = remoteUrlIndex + 1 < remoteUrls.length ? remoteUrlIndex + 1 : 0;
    remoteUrl = remoteUrls[remoteUrlIndex];
    res.send('Supported Proxy Urls: ' + remoteUrls + '<br>Current Used Url: ' + remoteUrl);
});

router.get('/add', function(req, res) {
    var addUrl = req.query.url;
    remoteUrls.push(addUrl);
    res.send('Supported Proxy Urls: ' + remoteUrls + '<br>Current Used Url: ' + remoteUrl);
});

router.get('/readme', function(req, res) {
    res.send(searchTips);
});

// 路由
router.use('/', function(req, res) {
    req.headers.host = remoteUrl.replace('https://', '');

    var realRemoteUrl = remoteUrl + req.url;
    req.pipe(request(realRemoteUrl)).pipe(res);
});

exports.router = router;