/**
 * Created by wenhui on 2018/06/06.
 */
const express = require('express');
const router = express.Router();
const AlprBufferReceive = require('../middleware/AlprBufferReceive');
const AlprBufferSend = require('../middleware/AlprBufferSend');
const deviceModel = require('../models/device');
const WebSocket = require('../middleware/WebSocket');
const configModel = require('../models/config');
const logger = require('../utils/logUtil').getLogger('plate');

/**获取全部设备*/
router.get('/parkingDevice', function (req, res, next) {
    deviceModel.findAll().then(function (data) {
        let array = [];
        for (let i = 0; i < data.length; i++) {
            let online = 0; // 设备在线状态
            if(WebSocket.clientMap.get(data[i].device_ip+':'+data[i].device_port)) {
                if(WebSocket.clientMap.get(data[i].device_ip+':'+data[i].device_port).remoteAddress) { // 如果 socket 被销毁了（如客户端已经失去连接）则其值为 undefined
                    online = 1;
                }
            }
            logger.debug('设备状态:',data[i].device_ip+':'+data[i].device_port, online);
            array.push({parkingDevic: data[i], online: online});
        }
        res.json({errcode:0, errmsg:'ok', list: array});
    }).catch(function (e) {
        logger.debug(e);
        res.json({errcode:1, errmsg:e});
    });
});

/**获取指定设备*/
router.get('/parkingDeviceById', function (req, res, next) {
    var device_id = req.param('device_id');
    deviceModel.findById(device_id).then(function (data) {
        let array = [];
        let online = 0; // 设备在线状态
        if(WebSocket.clientMap.get(data.device_ip+':'+data.device_port).remoteAddress) { // 如果 socket 被销毁了（如客户端已经失去连接）则其值为 undefined
            online = 1;
        }
        array.push({parkingDevice: data, online: online})
        res.json({errcode:0, errmsg:'ok', list: array});
    }).catch(function (e) {
        logger.debug(e);
        res.json({errcode:1, errmsg:e});
    });
});

/**开闸*/
router.post('/openGate', function (req, res, next) {  // 开闸
    let item = req.body.item;
    let clients = WebSocket.clients();
    for(let i = 0; i < clients.length; i++) {
        if(item.device_ip == clients[i].remoteAddress && item.device_port == clients[i].remotePort) {
            console.log('openGate:', AlprBufferSend.OpenGate());
            clients[i].write(AlprBufferSend.OpenGate()); // 发送开闸指令
        }
    }
    res.json({errcode:0, errmsg:'ok'});
});

/**重新连接*/
router.post('/connectAgain', function (req, res, next) {
    let device = req.body.item.parkingDevic;
    if(WebSocket.clientMap.get(device.device_ip+':'+device.device_port)) { // 重连
        WebSocket.clientMap.get(device.device_ip+':'+device.device_port).destroy();     // 完全关闭连接
        WebSocket.clientMap.delete(device.device_ip+':'+device.device_port);
        WebSocket.createConnection(device.device_id, device.device_port, device.device_ip);
    }
    logger.debug(WebSocket.clientMap);
    res.json({errcode:0, errmsg:'ok'});
});

router.get('/parkingConfig', function (req, res, next) {
    configModel.selectAll({}, function (data) {
        res.json(data);
    });
});

router.post('/refreshOfflineParam', async function (req, res, next) {
    let device = req.body.device.parkingDevice;
    WebSocket.getClient(device).then(function (client) {   // 获取设备连接
        client.write(AlprBufferSend.GetOfflineParam()); // 发送获取脱机参数指令
        logger.debug(WebSocket.map);
        res.json(WebSocket.map);
    })
});

router.post('/clearPlateList', function (req, res, next) {
    let listType = req.body.listType;
    let device = req.body.device.parkingDevice;
    WebSocket.getClient(device).then(function (client) {   // 获取设备连接
        client.write(AlprBufferSend.ClearPlateList(listType)); // 发送获取脱机参数指令
        logger.debug(AlprBufferSend.ClearPlateList(listType));
        res.json('ok');
    })
});

/**设置脱机参数*/
router.post('/setOfflineParam', function (req, res, next) {  // 开闸
    let device = req.body.device;
    let offlineParam = req.body.offlineParam;
    let ServerIP = offlineParam.serverIP;
    let ServerPort = offlineParam.serverPort;
    let ParkID = offlineParam.parkID;
    let isRecordCover = offlineParam.isRecordCover;
    let parkInOutFlag = offlineParam.parkInOutFlag;
    let MonthcarAlarmDays = offlineParam.monthcarAlarmDays;
    let RecognitionAccuracy = offlineParam.recognitionAccuracy;
    let RecordMatchAccuracy = offlineParam.recordMatchAccuracy;
    let MonthCarToTempcarFlag = offlineParam.monthCarToTempcarFlag;
    let MonthCarOpenType = offlineParam.monthCarOpenType;
    let TempCarOpenType = offlineParam.tempCarOpenType;
    let MinCharge = offlineParam.minCharge;
    let TempCarForbiddenFlag = offlineParam.tempCarForbiddenFlag;
    let SyncTimeFromMaster = offlineParam.syncTimeFromMaster;
    let OnlineFlag = offlineParam.onlineFlag;
    let OneChannelMode = offlineParam.oneChannelMode;
    let OneChannelWaitTime = offlineParam.oneChannelWaitTime;
    let NormalModeWaitTime = offlineParam.normalModeWaitTime;
    let MinChargeFlag = offlineParam.minChargeFlag;
    let DisplayRefreshInterval = offlineParam.displayRefreshInterval;
    let PropertyLogo = offlineParam.propertyLogo;
    let ScreenType = offlineParam.screenType;
    let buf = AlprBufferSend.SetOfflineParam(ServerIP,ServerPort,ParkID,isRecordCover,parkInOutFlag,MonthcarAlarmDays,RecognitionAccuracy,RecordMatchAccuracy,MonthCarToTempcarFlag,MonthCarOpenType,TempCarOpenType,MinCharge,TempCarForbiddenFlag,SyncTimeFromMaster,OnlineFlag,OneChannelMode,OneChannelWaitTime,NormalModeWaitTime,MinChargeFlag,DisplayRefreshInterval,PropertyLogo,ScreenType);
    let clients = WebSocket.clients();
    for(let i = 0; i < clients.length; i++) {
        if(device.parkingDevice.device_ip == clients[i].remoteAddress && device.parkingDevice.device_port == clients[i].remotePort) {
            clients[i].write(buf);
        }
    }
    res.json({errcode:0, errmsg:'ok'});
});

module.exports = router;