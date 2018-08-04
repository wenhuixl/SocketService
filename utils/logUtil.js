/**
 * 日志工具
 */
var log4js = require('log4js');
//log4js.configure('./config/log4js.json');

var config = {
    "appenders": [{
        "type": "console"
    },{
        "type": "dateFile",
        "filename": __dirname + "/../logs/access",
        "pattern": ".yyyy-MM-dd.log",
        "category": "http"
    }, {
        "type": "dateFile",
        "filename": __dirname + "/../logs/stats",
        "pattern": ".MM.dd.log",
        "alwaysIncludePattern": true,
        "category": "stats",
        "level" : "INFO"
    }, {
        "type": "file",
        "filename": __dirname + "/../logs/alprClien.log",
        "maxLogSize": 2048000,
        "numBackups": 10,
        "level" : "DEBUG"
    }, {
        "type": "logLevelFilter",
        "level": "WARN",
        "appender": {
            "type": "dateFile",
            "filename": __dirname + "/../logs/errors",
            "pattern": ".MM.dd.log",
            "alwaysIncludePattern": true
        }
    }],
    "replaceConsole": true
};

log4js.configure(config);

module.exports.getLogger = function(name){
    return log4js.getLogger(name);
}