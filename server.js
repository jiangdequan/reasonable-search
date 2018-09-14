//*******************************************//
//             科学搜(chao)索(xi)             //
//             Reasonable Search             //
//*******************************************//

// import modules
var express = require('express');

var google = require('./routes/google');
var ssr = require('./routes/ssr-subscribe');
var proxy = require('./routes/online-proxy');

var LOGGER = require('./lib/logger/logger');

// init express
var app = express();

app.use(express.static(__dirname + "/public"));
// specify the views directory
app.set('views', './public/views');
app.set("view cache", false);
// register the template engine
app.set('view engine', 'ejs');

// routes
app.use('/', google.router);
app.use('/', ssr.router);
app.use('/', proxy.router);

// port and ip
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

// start the server and listen
app.listen(port, ip, function () {
    ssr.site52ssr();
    ssr.siteDoub();
    ssr.siteFreeSs();
    LOGGER.info('Start to fetch ss/ssr config from internet...', __filename);
});

LOGGER.info('Server running on http://' + ip + ':' + port, __filename);
