const net = require('net');
const config = require('../../../../config/openPlatform.json');
const globalVariables = require('../cache/globalVariables');
const halfPackageDecoder = require('./halfPackageDecoder');

/**
 * @filename socketClient.js
 * @description socket客户端工具类
 * @author myc
 * @date 2018-01-25
 * @version V0.0.1
 */
var methods = {

    /**
     * 创建向netty发送数据的socket
     * 将此socket存储到全局变量表，所有跟网关设备管理平台相关的通讯均使用此socket
     */
    createSendSocket: function (dataDeal) {
        try {
            var socket = new net.Socket();
            socket.connect(config.ptPort, config.ptIP);
            globalVariables.setSend2NettySocket(socket);
            globalVariables.setClientChannelStatus(true);
            console.log('connect to platform...');

            //客户端错误关闭监听
            socket.on('error', () => {
                globalVariables.setClientChannelStatus(false);
                console.log('can not connect to the server...');
            });

            //客户端关闭
            socket.on('close', () => {
                globalVariables.setClientChannelStatus(false);
                console.log('platform server closed : ' + socket.remoteAddress + ' ' + socket.remotePort);
            });

            //连接结束
            socket.on('end', () => {
                globalVariables.setClientChannelStatus(false);
                console.log('platform server end...');
            })

            //接收数据
            socket.on('data', (data) => {
                //接收到系统数据，将未接收到系统数据统计次数归0
                globalVariables.setSysNoDataTimes(0);
                halfPackageDecoder.clientDecoder(data, socket, dataDeal);
            });
        } catch (e) {
            console.log('device is out of net...');
        }
    }
};

module.exports = methods;