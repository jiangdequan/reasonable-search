var express = require('express');
var request = require('request');
var JSEncrypt = require('node-jsencrypt');
var FileUtils = require('../lib/util/fileutils');
var LOGGER = require('../lib/logger/logger');

// 私钥
var private_key = process.env['PRIVATE_KEY'] || FileUtils.loadFile(__dirname + '/../private_key.perm');

var decrypt = new JSEncrypt();
decrypt.setPrivateKey(private_key);

// 初始化express
var router = express.Router();

// 路由
router.get('/proxy', function(req, res) {
    res.render('proxy');
});

router.get('/proxy/:url', function(req, res) {
    var url = decodeURIComponent(req.params.url);
    var decryptUrl = decrypt.decrypt(url);
    req.pipe(request(decryptUrl, function(error) {
        if (error) {
            LOGGER.error(error.message, __filename);
        }
    })).pipe(res);
});

exports.router = router;