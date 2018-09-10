var express = require('express');
var request = require('request');

// 初始化express
var router = express.Router();

// 路由
router.get('/', function(req, res) {
    var url = 'https://www.google.com' + req.url;
    req.pipe(request(url)).pipe(res);
});

router.get('/search', function(req, res) {
    var url = 'https://www.google.com' + req.url;
    req.pipe(request(url)).pipe(res);
});

exports.router = router;