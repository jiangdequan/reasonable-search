var fs = require('fs');
var Logger = require('../logger/logger');

exports.loadJsonFile = function (configPath) {

    // 配置文件内容(JSON)
    var config;

    // 配置文件路径可用
    if (configPath) {
        // 打印读取的配置文件路径
        Logger.info('loading config from ' + configPath, __filename);
        // 读取配置文件
        var configContent = fs.readFileSync(configPath);
        try {
            // 解析配置文件为JSON
            config = JSON.parse(configContent);
        } catch (_error) {
            // 打印异常信息并退出
            Logger.error('found an error in config.json: ' + _error.message, __filename);
            process.exit(1);
        }
    } else {
        // 配置文件路径不可用,配置信息为空
        config = {};
    }
    return config;
}

exports.spliceFixUrl = function (config) {
    var url = config.google_custom_search_api + '?';
    // var start = start || config.start || 1;
    var num = config.num || 10;
    var client = config.client || 'google-csbe';
    var key = process.env['KEY'] || config.key;
    var cx = process.env['CX'] || config.cx;
    if (null === key || undefined === key || '' === key) {
        Logger.warn('please config the KEY in config files or environment.', __filename);
        process.exit(1);
    }
    if (null === cx || undefined === cx || '' === cx) {
        Logger.warn('please config the CX in config files or environment.', __filename);
        process.exit(1);
    }
    url = url + 'num=' + num + '&client=' + client + '&key=' + key + '&cx=' + cx + '&q=';
    return url;
}

exports.loadFile = function (path) {

    // 配置文件内容(JSON)
    var config;

    // 配置文件路径可用
    if (path) {
        // 打印读取的配置文件路径
        Logger.info('loading config from ' + path, __filename);
        // 读取配置文件
        config = fs.readFileSync(path, {encoding: 'utf8'});
    } else {
        // 配置文件路径不可用,配置信息为空
        config = '';
    }
    return config;
}