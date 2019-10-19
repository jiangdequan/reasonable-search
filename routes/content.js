var express = require('express');
var request = require('request');
var TurnDown = require('turndown');

var base64 = require('../lib/encrypt/base64');

var turnDownService = new TurnDown({codeBlockStyle: 'fenced', fence: '```'});
turnDownService.keep(['br']);
turnDownService.addRule('test', {
    filter: ['br'],
    replacement: function (content) {
        return content + '<' + 'br' + '/>'
    }
})
var turnDownServiceFenced = new TurnDown({codeBlockStyle: 'fenced'});

// init express
var router = express.Router();

var token = process.env.TOKEN || "demo";

var url2io = "https://url2api.applinzi.com/" + (token === 'demo' ? 'demo/' : '') + "article?token=" + token + "&url=";

router.post('/content', function (req, res) {
    var url = encodeURIComponent(base64.decrypt(req.body.url.replace(/_/g, '/')));
    request(url2io + url, function (error, response, body) {
        var responseJson = JSON.parse(body);
        res.setHeader('Content-Type', 'application/json');
        var content = turnDownService.turndown(responseJson.content);
        console.log(content)
        // content = turnDownServiceFenced.turndown(content);
        responseJson.content = handleImgs(content);
        res.send(responseJson);
    });
});

router.get('/content/:url', function(req, res) {
    var url = encodeURIComponent(base64.decrypt(req.params.url.replace(/_/g, '/')));

    request(url2io + url, function (error, response, body) {
        var responseJson = JSON.parse(body);
        res.setHeader('Content-Type', 'application/json');
        var content = turnDownService.turndown(responseJson.content);
        // content = turnDownServiceFenced.turndown(content);
        responseJson.content = handleImgs(content);
        res.send(responseJson);
    });
});

function handleImgs(content) {
    var newContent = content.replace(/[\[]*!\[[一-龥0-9a-zA-Z \-_\.\[\]\\]*\]\(/g, '![](');
    if (-1 === newContent.indexOf('![](')) {
        return newContent;
    }
    var segments = newContent.split('![](');

    var resultMarkdown = '';
    for (var i = 0; i < segments.length; i++) {
        if (0 == i && '' !== segments[i]) {
            resultMarkdown = resultMarkdown + segments[i];
            continue;
        }
        var index = segments[i].indexOf(")");
        if (-1 == index) {
            resultMarkdown = resultMarkdown + segments[i];
            continue;
        }
        // 将图片和剩下的文本内容拼接到新的文本变量中
        resultMarkdown = resultMarkdown + "E707E09A32D56F8BC6A72237496D823AD0EA9F3988BBB89EEB942E494A9CBD8E"
            + segments[i].substring(0, index);
        var leftText = segments[i].substring(index + 1);
        if ('' !== leftText) {
            if (leftText.startsWith("]")) {
                leftText = leftText.substring(leftText.indexOf(")") + 1);
            }
            resultMarkdown = resultMarkdown + "E707E09A32D56F8BC6A72237496D823A" + leftText;
        }
    }
    if (0 === resultMarkdown.indexOf("E707E09A32D56F8BC6A72237496D823A")) {
        return resultMarkdown.substring(32);
    }
    return resultMarkdown;
}

exports.router = router;