/**
 * Created by wenhui on 2018/06/11
 * 数据库相关配置
 */

const MysqlConfig = {
    host: '192.168.1.121',   // 主机 192.168.1.121
    user: 'root',            // MySQL认证用户名
    password: 'root',
    port: '3308',            // 3308
    database: 'pop_local',        // 数据库
    multipleStatements : true   //允许对MySQL执行多条语句
};

module.exports = MysqlConfig;