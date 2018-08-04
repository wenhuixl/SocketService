/**
 * Created by wenhui on 2018/6/4.
 * web socket 客户端
 */
'use strict'

const io = require('socket.io')();
const net = require('net');
const AlprBufferReceive = require('./AlprBufferReceive');
const KafkaProducer = require('./KafkaProducer');
const globalVariables = require('../cache/globalVariables');
const gateHalfPkgDecoder = require('../utils/gateHalfPkgDecoder');
const deviceModel = require('../models/device');
const AlprBufferSend = require('../middleware/AlprBufferSend');
const AlprMessageType = require('../models/AlprMessageType');
const clientProtocol = require('../models/client_protocol');
const parkingEnterExit = require('../service/parkingEnterExit');
const deviceService = require('../service/device');
const clients = new Array();      // 存储连接成功的client
const errorClients = new Array(); // 存储连接中断的client
const dataMap = new Map();        // 存储设备返回数据
const clientMap = new Map();      // 存储所有client
const singleChannelMap = new Map();  //单通道数据存储
const logger = require('../utils/logUtil').getLogger('/middleware/WebSocket.js');
const deviceConfig = require('../config/DeviceConfig');

deviceModel.findAll().then(function (data) {
    if(data) {
        for(let i = 0; i < data.length; i++) { // 创建连接
            if(data[i].device_port && data[i].device_ip && data[i].enable == 1) {
                createConnection(data[i].device_id, deviceConfig.port, data[i].device_ip);
            }
        };
    }
}).catch(function (e) {
    logger.debug(e);
});

function createConnection(id, port, host) {
    let client = new net.Socket(); //直接创建一个socket

    client.connect(port, host, function() { // 连接成功保持心跳
        logger.debug('connected device success! ' + host + ':' + port);
        client.write(clientProtocol.SetClientType(globalVariables.getCommonClientType()));  //设为普通客户端
        deviceService.uploadDeviceState(id, 1); // 上传开放平台
    });

    client.on('data', function(data) { // 为客户端添加“data”事件处理函数
        gateHalfPkgDecoder.dataDecoder(client, data, function (result) {
            let dataType = result.readIntLE(0,4); // 消息类型
            logger.debug('device service back: ', dataType, result);
            AlprBufferReceive.ProtocolDecode(result, function (data) { // 解释协议回调
                dataMap.set(dataType, data); // 存储返回解释数据
                switch (dataType) {
                    case 1202: // 车牌识别
                        io.emit("licensePlate", {errcode:0, errmsg:'ok', result: data});
                        if(data.nPlateNum > 0) { // 识别车牌，保存数据到数据库
                            parkingEnterExit.planteInfo(client.remoteAddress, data);
                        }else{
                            console.log("未识别到车牌");
                        }
                        break;
                    case 1214: // 车牌图像
                        io.emit("licensePhoto", {errcode:0, errmsg:'ok', result: data});
                        break;
                    case 1223: // 黑白名单
                        io.emit("listBanner", {errcode:0, errmsg:'ok', result: data});
                        break;
                    case 1245: // 脱机参数
                        io.emit("getOfflineParamRes", {errcode:0, errmsg:'ok', result: data});
                        break;
                    default:
                        break;
                }
            });
        });
    });
    
    client.on('error', function() {
        globalVariables.setGateClientStatus(false);
        logger.debug('device connected error: ', host + ':' + port);
        clientMap.delete(client.remoteAddress+':'+client.remotePort);
        deviceService.uploadDeviceState(id, 0); // 上传开放平台
        for(let i = 0; i < clients.length; i++) {
            if(clients[i].remoteAddress === client.remoteAddress && clients[i].remotePort === client.remotePort) {
                clients.splice(i, 1); // 删除当前连接
                client.destroy();     // 完全关闭连接
                break;
            }
        }
        errorClients.push({id: id, port:port, host: host});
    });

    client.on('end', function () { // 回话终止
        globalVariables.setGateClientStatus(false);
        clientMap.delete(client.remoteAddress+':'+client.remotePort);
        logger.warn('device connected end', host + ':' + port);
    });

    client.on('close', function() { // 为客户端添加“close”事件处理函数
        globalVariables.setGateClientStatus(false);
        clientMap.delete(client.remoteAddress+':'+client.remotePort);
        logger.warn('device connected close:', host + ':' + port);
    });

    clientMap.set(host+':'+port, client); // 使用map存储连接信息
    clients.push(client); // 将tcp长连接放进数据中供其他函数调用
};

// 设备数据更新时清除原来的重新连接
async function connectAgain(id, port, host) {
    let client = clientMap.get(host+':'+deviceConfig.port);
    if(client) {
        logger.debug('强制断开连接', host+':'+deviceConfig.port);
        client.destroy(); // 完全关闭连接
        clientMap.delete(host+':'+deviceConfig.port); // 删除连接
    }
    logger.debug('重新连接：', host+':'+deviceConfig.port);
    createConnection(id, deviceConfig.port, host);// 重新连接
};

// 强制断开连接
async function destroyClient(id, port, host) {
    logger.debug('强制断开连接', host+':'+deviceConfig.port);
    let client = clientMap.get(host+':'+deviceConfig.port);
    if(client) {
        client.destroy(); // 完全关闭连接
        clientMap.delete(host+':'+deviceConfig.port); // 删除连接
    }
};

io.on('connection',function(socket){   // server listening
    logger.debug('socket.id '+socket.id+ ':  connecting');  // console-- message

    socket.on("disconnect", function() { // 断开连接
        logger.debug("a user go out");
    });

    socket.on('addPlateList', function (data) { // 添加黑白名单
        logger.debug('addPlateList', data);// ListType, PlateNum, PlateDataArray    plateName, plateType, startTime, endTime
        let ListType = data.plateType;
        let plateDate = {
            Plate: data.plateName,
            InDate: data.startTime,
            OutDate: data.endTime
        }
        let PlateDataArray = [plateDate];
        let PlateNum = PlateDataArray.length;
        let buf = AlprBufferSend.AddPlateListReq(ListType, PlateNum, PlateDataArray);
        for(let i = 0; i < clients.length; i++) {
            clients[i].write(buf);
        }
    });

    socket.on('setPlateList', function (data) { // 设置黑白名单
        logger.debug('setPlateList', data);// ListType, PlateNum, PlateDataArray    plateName, plateType, startTime, endTime
        let ListType = data.plateType;
        let plateDate = {
            Plate: data.plateName,
            InDate: data.startTime,
            OutDate: data.endTime
        }
        let PlateDataArray = [plateDate];
        let PlateNum = PlateDataArray.length;
        let buf = AlprBufferSend.SetPlateListReq(ListType, PlateNum, PlateDataArray);
        for(let i = 0; i < clients.length; i++) {
            clients[i].write(buf);
        }
    });

    socket.on('delPlateList', function (data) { // 删除黑白名单
        let ListType = data.plateType;
        let plateData = {
            Plate: data.plateName,
            InDate: data.startTime,
            OutDate: data.endTime
        }
        let PlateDataArray = [plateData];
        let PlateNum = PlateDataArray.length;
        let buf = AlprBufferSend.DelPlateListReq(ListType, PlateNum, PlateDataArray);
        logger.debug('delPlateList: ', ListType, PlateNum, PlateDataArray, buf);
        for(let i = 0; i < clients.length; i++) {
            clients[i].write(buf);
        }
    });

    socket.on('openGate', function (data) {
        var parkingDevice = data.parkingDevice;
        logger.debug('openGate', parkingDevice.device_ip, parkingDevice.device_port);
        for(let i = 0; i < clients.length; i++) {
            if(parkingDevice.device_ip === clients[i].remoteAddress && parkingDevice.device_port === clients[i].remotePort) {
                logger.debug('openGate:', AlprBufferSend.OpenGate());
                clients[i].write(AlprBufferSend.OpenGate()); // 发送开闸指令
                io.emit("openGateRes", {errcode:0, errmsg:'ok'});
            }
        }
    });

    socket.on('listBanner', function (data) {
        var parkingDevice = data.parkingDevice;
        for(let i = 0; i < clients.length; i++) {
            if(parkingDevice.device_ip === clients[i].remoteAddress && parkingDevice.device_port === clients[i].remotePort) {
                logger.debug('listBanner:', parkingDevice.device_ip, parkingDevice.device_port);
                clients[i].write(AlprBufferSend.GetPlateListReq(data.type)); // 获取黑白名单
            }
        }
    });

    socket.on('recogByManual', function (data) { // 手动识别
        var parkingDevice = data.parkingDevice;
        logger.debug('recogByManual', parkingDevice.device_ip, parkingDevice.device_port);
        for(let i = 0; i < clients.length; i++) {
            if(parkingDevice.device_ip === clients[i].remoteAddress && parkingDevice.device_port === clients[i].remotePort) {
                logger.debug('recogByManual:', AlprBufferSend.RecogByManualReq());
                clients[i].write(AlprBufferSend.RecogByManualReq()); // 发送手动识别指令
                io.emit("recogByManualRes", {errcode:0, errmsg:'ok'});
            }
        }
    });

    socket.on('getOfflineParam', function (data) { // 获取脱机参数
        var parkingDevice = data.parkingDevice;
        logger.debug('getOfflineParam', parkingDevice.device_ip, parkingDevice.device_port);
        for(let i = 0; i < clients.length; i++) {
            if(parkingDevice.device_ip === clients[i].remoteAddress && parkingDevice.device_port === clients[i].remotePort) {
                logger.debug('getOfflineParam:', AlprBufferSend.GetOfflineParam());
                clients[i].write(AlprBufferSend.GetOfflineParam()); // 发送获取脱机参数指令
            }
        }
    });

});

exports.listen = function(server){
    return io.listen(server);    // listening
};
exports.clients = function () {
    return clients;
};
exports.errorClients = function () {
    return errorClients;
};
exports.createConnection = createConnection;
exports.dataMap = dataMap;
exports.clientMap = clientMap;
exports.singleChannelMap = singleChannelMap;
exports.connectAgain = connectAgain;
exports.destroyClient = destroyClient;

exports.getClient = async function(device){
    return clientMap.get(device.device_ip + ":" + deviceConfig.port);
};
exports.setSingleChannelMap = async function(glGt,now){
    singleChannelMap.set(glGt,now);
};
exports.getSingleChannelMap = async function(glGt){
    return singleChannelMap.get(glGt);
};
