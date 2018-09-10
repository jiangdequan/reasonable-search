//*******************************************//
//             科学搜(chao)索(xi)            //
//*******************************************//

// 模块引入
var express = require('express');

var google = require('./routes/google');
var ssr = require('./routes/ssr-subscribe');

var LOGGER = require('../lib/logger/logger');

// 初始化express
var app = express();

app.use('/', google.router);
app.use('/', ssr.router);

// 端口及IP获取
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

// 启动监听
app.listen(port, ip, function() {
    ssr.site52ssr();
    ssr.siteDoub();
    LOGGER.info('start to request...', __filename);
});

// 日志记录
LOGGER.info('Server running on http://' + ip + ':' + port, __filename);
