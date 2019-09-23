//*******************************************//
//             科学搜(chao)索(xi)             //
//             Reasonable Search             //
//*******************************************//

// import modules
var express = require('express');

var keepaliveTask = require('./lib/cron/keepalive');
var jsproxy = require('./routes/jsproxy');

var LOGGER = require('./lib/logger/logger');

// init express
var app = express();
app.use(express.urlencoded({limit: '1000000', extended: true}));

app.use(express.static(__dirname + "/public"));
// specify the views directory
app.set('views', __dirname + '/public/views');
app.set("view cache", false);
// register the template engine
app.set('view engine', 'ejs');

// routes
app.use('/', jsproxy.router);

// port and ip
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8888,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

// start the server and listen
app.listen(port, ip);

keepaliveTask.execute();

/**
 * 异常处理
 */
process.on('uncaughtException', function (e) {
    LOGGER.error(e.message);
});

LOGGER.info('Server running on http://' + ip + ':' + port, __filename);
