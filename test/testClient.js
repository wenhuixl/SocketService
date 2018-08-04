/**
 * Created by wenhui on 2018/5/26.
 * net在服务器端创建客户端
 */
var net = require('net');
var fs = require('fs');
var schedule = require('node-schedule');
const globalVariables = require('./../cache/globalVariables');
const gateHalfPkgDecoder = require('./../utils/gateHalfPkgDecoder');
var server_protocol = require('./server_protocol');

var HOST = '192.168.1.89'; // 主机
var PORT = 37080;          // 端口

var rule = new schedule.RecurrenceRule();
var times = [0,20,40,60]; // 每隔5s执行一次
rule.second = times;

var client = new net.Socket(); //直接创建一个socket
// globalVariables.setGateClientSocket(client);
// globalVariables.setGateClientStatus(true);

client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // let buf = Buffer.from('c6040000749f8ad31000000000000000', 'hex'); // 获取白名单
    // let buf = Buffer.from('d7040000749f8ad30c000000', 'hex'); // 发送心跳
    // let buf = Buffer.from('bf040000749f8ad30c00000s0', 'hex'); // 开闸
    // let buf = Buffer.from('c4040000749f8ad3440000000100000002000000d4c15441353436370000000000000000e1070607e2070607d4c15441353436380000000000000000e1070304e2070305', 'hex');
    // let buf = Buffer.from('ca040000749f8ad30c000000', 'hex'); // 手动识别
    let buf = Buffer.from('dd040000749f8ad30c000000', 'hex'); // 获取脱机参数 1245 4dd
    // let buf = Buffer.from('dc040000749f8ad3a800000000000000000000000000000000000000000000000100000001010004630101003333054200000000d50600000100000005000000050000000114d2d7b4efbac5cda3b3b5a3acc8c3bbd8bcd2b8fcbcf2b5a50000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000', 'hex');
    // let buf = Buffer.from('b9040000749f8ad30c000000', 'hex'); // 1209  4b9
    // let buf = Buffer.from('c8040000749f8ad31f000000aa420100b1120001010101010101010101bd8a', 'hex');
    // let buf = Buffer.from('c8040000749f8ad315000000aa420100b30000c305', 'hex');
    // let buf = Buffer.from('c8040000749f8ad321000000AA420000AE0c0023090000BAC3BAC3D1A7CFB0c72c', 'hex');
    // let buf1 = Buffer.from('D8040000749f8ad31000000000000000', 'hex');  //设置普通客户端
    let buf1 = Buffer.from('D8040000749f8ad31000000000000000', 'hex');  //设置普通客户端
    client.write(buf1);
    // let buf2 = Buffer.from('c8040000749f8ad324000000aa420000b110004a001e0015000d000300040007006a003b', 'hex'); //有问题的
    let buf2 = Buffer.from('c8040000749f8ad328000000aa420000b114004c000b00100001000300040007007a000700260075', 'hex');

    setTimeout(function () {
        client.write(buf2);
    },5000);

});

globalVariables.setGateClientSocket(client);
globalVariables.setGateClientStatus(true);

client.on('data', function(data) { // 为客户端添加“data”事件处理函数
    gateHalfPkgDecoder.dataDecoder(client, data, function (result) {
        console.log('服务器返回: ', result.toString('hex'))
        // console.log(server_protocol.ProtocolDecode(result));
    });
    // client.destroy();  // 完全关闭连接
});

client.on('error', function() {
    globalVariables.setGateClientStatus(false);
    console.log('发生意外错误!');
});

client.on('end', function () { // 回话终止
    globalVariables.setGateClientStatus(false);
    console.log('end');
});

client.on('close', function() { // 为客户端添加“close”事件处理函数
    globalVariables.setGateClientStatus(false);
    console.log('关闭连接');
});

var j = schedule.scheduleJob(rule, function(){
    let buf = Buffer.from('d7040000749f8ad30c000000', 'hex'); // 发送心跳
    client.write(buf);
    console.log('send heartbeat to device', new Date());
});