/**
 * Created by wenhui on 2018/5/26.
 * net在服务器端创建客户端
 */
'use strict'

const globalVariables = require('../cache/globalVariables');
const gateHalfPkgDecoder = require('../utils/gateHalfPkgDecoder');
var net = require('net');

var HOST = '192.168.1.88'; // 主机
var PORT = 37080;          // 端口

function tcpConnect(buf, callback) {
    var client = new net.Socket(); //直接创建一个socket

    globalVariables.setGateClientSocket(client);
    globalVariables.setGateClientStatus(true);

    client.connect(PORT, HOST, function() {
        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        if(buf.length > 0) {
            console.log('发送数据：', buf);
            client.write(buf); // 建立连接后立即向服务器发送数据，服务器将收到这些数据
        }
    });

    client.on('data', function(data) { // 为客户端添加“data”事件处理函数
        gateHalfPkgDecoder.dataDecoder(client, data, function (retbuf) {
            // console.log('返回数据：', retbuf);
            callback(retbuf);
        });
    });

    client.on('end', function () { // 回话终止
        globalVariables.setGateClientStatus(false);
        console.log('end');
    });

    client.on('close', function() { // 为客户端添加“close”事件处理函数
        globalVariables.setGateClientStatus(false);
        console.log('关闭连接');
        // client.destroy();  // 完全关闭连接
    });

    client.on('error', function() {
        globalVariables.setGateClientStatus(false);
        console.log('连接中断');
    });

    // client.setTimeout(10000);
    // client.on('timeout', function() {
    //     let buf = Buffer.from('d7040000749f8ad30c000000', 'hex'); // 发送心跳
    //     client.write(buf);
    //     console.log('socket timeout');
    // });

};

exports.connect = function(buf, callback){
    return tcpConnect(buf, callback);
};