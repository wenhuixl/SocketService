/**
 * Created by wenhui on 2018/6/11.
 */
var Mysql = require('node-mysql-promise');
var MysqlConfig = require('../config/MysqlConfig');
var mysql = Mysql.createConnection({
    host: MysqlConfig.host,
    port: MysqlConfig.port,
    user: MysqlConfig.user,
    password: MysqlConfig.password,
    database: MysqlConfig.database,
    connectionLimit: 10, // 最大连接数（默认: 10）
    logSql: true,  // 控制台输出sql（默认: false）
});

module.exports = mysql;