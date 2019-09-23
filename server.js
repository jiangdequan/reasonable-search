//*******************************************//
//             科学搜(chao)索(xi)             //
//             Reasonable Search             //
//*******************************************//

// import modules
var express = require('express');

var jsproxy = require('./routes/jsproxy');

var LOGGER = require('./lib/logger/logger');

// init express
var app = express();
app.use(express.urlencoded({limit: '1000000', extended: true}));

app.use(express.static(__dirname + "/public"));
// specify the views directory
app.set('views', './public/views');
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

/**
 * 异常处理
 */
process.on('uncaughtException', function (e) {
    LOGGER.error(e.message);
});

LOGGER.info('Server running on http://' + ip + ':' + port, __filename);






var checkTask;
var checkSites = new Array("https://i1024.herokuapp.com/",
    "https://callmev.herokuapp.com/",
    "https://duniang.herokuapp.com/",
    "https://x1024.herokuapp.com/",
    "https://y1024.herokuapp.com/");


var startTime = '08:00:00';
var endTime = '15:52:00';

function excuteTask() {
    setInterval(function() {
        if (checkAble()) {
            if (checkTask === null || checkTask === undefined) {
                checkSiteTasks();
                checkTask = setInterval(checkSiteTasks, 5000);
            }
        } else {
            if (checkTask !== null && checkTask !== undefined) {
                clearInterval(checkTask);
                checkTask = null;
            }
        }
    }, 3000);
}

function checkSiteTasks() {
    for(j = 0,len=checkSites.length; j < len; j++) {
        checkSiteTask(checkSites[j]);
    }
}

function checkSiteTask(url) {
    console.log(url);
}

function currentTime() {
    var timezone = 8; //目标时区时间，东八区
    var offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    var nowDate = new Date().getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
    var result = new Date(nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000);
    return result.getHours()+':'+result.getMinutes()+':'+result.getSeconds();
}

function checkAble() {
    var time = currentTime();
    if (time > startTime && time < endTime) {
        return true;
    }
    return false;
}

excuteTask();