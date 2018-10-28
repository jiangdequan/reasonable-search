var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');
var schedule = require('node-schedule');

var base64 = require('../lib/encrypt/base64');
var LOGGER = require('../lib/logger/logger');

var router = express.Router();

exports.router = router;

var resultMap = new Map();

router.get('/soccer/:type/:dateTime', function (req, res) {
    var type = decodeURIComponent(req.params.type);
    var date = decodeURIComponent(req.params.dateTime);
    var matches = resultMap.get(type);
    
    var prevMatchDate;
    var count = 0;
    var recentMatches = [];
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        if (date <= match.date) {
            if (prevMatchDate !== match.date) {
                prevMatchDate = match.date;
                count++;
            }
            if (count > 3) {
                break;
            }
            recentMatches.push(match);
        }
    }
    var results = {};
    results['results'] = recentMatches;
    res.send(results);
});

function siteHupu() {
    var url = 'https://soccer.hupu.com/schedule/schedule.server.php';
    var urlParamsMap = new Map();
    urlParamsMap.set('英超', {d: '20181016', type: 's', league_id: 2});
    urlParamsMap.set('西甲', {d: '20181016', type: 'a', league_id: 3});
    urlParamsMap.set('意甲', {d: '20181016', type: 's', league_id: 4});
    urlParamsMap.set('德甲', {d: '20181016', type: 's', league_id: 5});
    urlParamsMap.set('法甲', {d: '20181016', type: 's', league_id: 6});

    urlParamsMap.forEach(function(value, key, ownerMap) {
        var league = [];
        superagent.post(url)
                  .send(value)
                  .set('origin', 'https://soccer.hupu.com')
                  .set('referer', 'https://soccer.hupu.com/schedule/England.html')
                  .set('user-agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36')
                  .set('content-type', 'application/x-www-form-urlencoded')
                  .set('cookie', '_cnzz_CV30020080=buzi_cookie%7C6bc95224.a07a.ac5f.2036.bdebbdde028b%7C-1; _dacevid3=6bc95224.a07a.ac5f.2036.bdebbdde028b; __gads=ID=c78c3407f291e878:T=1539622686:S=ALNI_MZLaGfOuXmbCSy2tJg9UAO8E7jlMA; ADHOC_MEMBERSHIP_CLIENT_ID1.0=6ae2928f-0d79-c480-5409-6e13e6bb952a; _cnzz_CV30020080=buzi_cookie%7C6bc95224.a07a.ac5f.2036.bdebbdde028b%7C-1; Hm_lvt_0d446728dc701d4fb7e09b03d0d813f3=1539622698,1539622957,1539657690; Hm_lpvt_0d446728dc701d4fb7e09b03d0d813f3=1539657690; __dacevst=d0499b9b.758ed545|1539667040136')
                  .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                LOGGER.error('failed to request https://soccer.hupu.com/schedule/England.html, ' + err, __filename);
                return;
            }
            var $ = cheerio.load(sres.text);
            $('table tr[name=tr_title]').each(function (idx, element) {
                var $element = $(element);
                var matches = $element.find('td');
                var date;
                var time;
                var week;
                var count;
                var homeTeam;
                var score;
                var awayTeam;
                matches.each(function(matcheIndex, matcheElement) {
                    switch (matcheIndex) {
                        case 0:
                            date = $(matcheElement).attr('title');
                            time = $(matcheElement).text();
                            time = time.split(' ')[1];
                            break;
                        case 1:
                            week = $(matcheElement).find('font').text();
                            break;
                        case 2:
                            count = $(matcheElement).find('font').text();
                            count = count.replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '');
                            break;
                        case 3:
                            homeTeam = $(matcheElement).find('span a').text();
                            break;
                        case 4:
                            score = $(matcheElement).find('a').text();
                            break;
                        case 5:
                            awayTeam = $(matcheElement).find('span a').text();
                            break;
                        default:
                    }
                });
                var match = {};
                match.date = date;
                match.time = time;
                match.week = week;
                match.count = count;
                match.homeTeam = homeTeam;
                match.score = score;
                match.awayTeam = awayTeam;
                league.push(match);
            });
        });
        resultMap.set(key, league);
    });
}

exports.siteHupu = siteHupu;
