var express = require('express');
var request = require('request');

// 初始化express
var router = express.Router();

// 路由
router.get('/wiki', function(req, res) {
    var url = 'https://zh.wikipedia.org/wiki/';
    req.pipe(request(url)).pipe(res);
});

router.get('/wiki/:text', function(req, res) {
    var text = req.params.text;
    var url = 'https://zh.wikipedia.org/wiki/' + text;
    req.pipe(request(url)).pipe(res);
});

exports.router = router;