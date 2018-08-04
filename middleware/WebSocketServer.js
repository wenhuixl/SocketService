/**
 * 前端页面webscoket连接
 * Created by Evenlai on 2018/06/26.
 */
const WebSocketServer = require('ws').Server;
const clients = new Map();
const ServerConfig = require('../config/ServerConfig');
const global = require('../cache/globalVariables');

module.exports = {
    async start(){
        console.log("websocketServer Start......");
        let clientIp = "";
        let config = await global.getConfig();
        wss = new WebSocketServer({ port: config.websocket_port?config.websocket_port:ServerConfig.websocketPort});
        wss.on('connection', function (ws) {
            console.log('client connected:' + ws._socket.remoteAddress);
            clientIp = ws._socket.remoteAddress.split(':')[3];
            if(clientIp){
                clients.set(clientIp,ws);
            }
            ws.on('message', function (message) {
                console.log(message);
            });
            ws.on('error',function (error) {
                console.log(error);
            });
        });
    },
    //发送数据
    async send(ip,data){
        let ws = clients.get(ip);
        if(ws){
            ws.send(data);
        }
    }
};
