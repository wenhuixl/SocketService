const net = require('net');
const config = require('../../config/config.json');
const globalVariables = require('../cache/globalVariables');
const gateHalfPkgDecoder = require('./gateHalfPkgDecoder');

/**
 * @filename socketClient.js
 * @description socket客户端工具类
 * @author myc
 * @date 2018-06-07
 * @version V0.0.1
 */

var methods = {

    /**
     * 创建向道闸发送数据的socket客户端
     * 将此socket存储到全局变量表，所有跟道闸相关通讯均使用此socket
     */
    createGateClient: function () {
        try {
            var gateClient = new net.Socket();
            gateClient.connect(config.gatePort, config.gateIP);
            globalVariables.setGateClientSocket(gateClient);
            globalVariables.setGateClientStatus(true);
            console.log('connect to gate...');

            gateClient.on('error', () => {
                globalVariables.setGateClientStatus(false);
                console.log('can not connect to gate...');
            });

            gateClient.on('close', () => {
                globalVariables.setGateClientStatus(false);
                console.log('gate client connect closed...');
            });

            gateClient.on('end', () => {
                globalVariables.setGateClientStatus(false);
                console.log('gate client connect end...');
            });

            //接收数据
            gateClient.on('data', (data) => {
                gateHalfPkgDecoder.dataDecoder(socket, data);
                console.log('received client data : ' + data.toString('hex'));
            });
        } catch (e) {
            console.log('device is out of net...');
            console.log(e);
        }
    }
};

module.exports = methods;
