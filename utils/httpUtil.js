/**
 * Created by wenbin on 2018/06/14.
 */
const os = require('os');

module.exports = {
    /**
     * 获取客户端ip
     * @param req
     * @returns {*|string|string}
     */
    get_client_ip : function (req) {
        var ip = req.headers['x-forwarded-for'] ||
            req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '';
        if (ip.split(',').length > 0) {
            ip = ip.split(',')[0]
        }
        return ip;
    },
    /**
     * 获取服务器端IP
     * @returns {*}
     */
    get_server_ip:function () {
        let interfaces = os.networkInterfaces();
        for(let devName in interfaces){
            let iface = interfaces[devName];
            for(let i=0;i<iface.length;i++){
                let alias = iface[i];
                if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                    return alias.address;
                }
            }
        }
    }
};

