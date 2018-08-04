/**
 * 设备管理
 * Created by wenhui on 2018/7/13.
 */
'use strict'

const express = require('express');
const router = express.Router();
const deviceModel = require('../models/device');
const WebSocket = require('../middleware/WebSocket');
const gateHalfPkgDecoder = require('../utils/gateHalfPkgDecoder');
const AlprBufferReceive = require('../middleware/AlprBufferReceive');
const AlprBufferSend = require('../middleware/AlprBufferSend');
const deviceConfig = require('../config/DeviceConfig');
const deviceCache = require('../cache/device');
const logger = require('../utils/logUtil').getLogger('device.js');

/**
 * 获取设备列表
 */
router.get('/devicelist.do', function(req, res) {
    deviceModel.findAll().then(function (data) {
        let array = [];
        for (let i = 0; i < data.length; i++) {
            let online = 0; // 设备在线状态
            if (WebSocket.clientMap.get(data[i].device_ip + ':' + deviceConfig.port)) {
                if (WebSocket.clientMap.get(data[i].device_ip + ':' + deviceConfig.port).remoteAddress) { // 如果 socket 被销毁了（如客户端已经失去连接）则其值为 undefined
                    online = 1;
                }
            }
            data[i].online = online;
            logger.debug('设备状态:', data[i].device_ip + ':' + deviceConfig.port, online);
            array.push(data[i]);
        }
        let records = array == [] ? 0 : array.length;
        let rows = array == [] ? [] : array
        res.json({total: 1, page: 1, records: records, rows: rows});
    }).catch(function (e) {
        logger.debug(e);
        res.json({errcode: 1, errmsg: e});
    });
});

/**
 * 获取设备对应脱机参数
 */
router.post('/getOfflineParam', async function (req, res) {
    let device = req.body.device;
    console.log('device', device);
    WebSocket.getClient(device).then(function (client) {   // 获取设备连接
        logger.debug('获取连接', client.remoteAddress, client.remotePort);
        if(client.remoteAddress) {
            logger.debug('获取脱机参数指令', AlprBufferSend.GetOfflineParam());
            client.write(AlprBufferSend.GetOfflineParam()); // 发送获取脱机参数指令
        }
        setTimeout(function () {
            logger.debug('脱机参数:', WebSocket.dataMap.get(1245));
            res.json({errcode:0, errmsg:'ok', data: WebSocket.dataMap.get(1245)});
            WebSocket.dataMap.delete(1245);
        }, 1000);
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
    let client = WebSocket.clientMap.get(device.device_ip+':'+deviceConfig.port);
    logger.debug('设备：', device);
    logger.debug('设置脱机参数：', client.remoteAddress, client.remotePort, buf);
    client.write(buf);
    res.json({errcode:0, errmsg:'ok'});
});

/**获取指定类型名单信息*/
router.get('/getPlateList.do', function (req, res) {
    let device_ip = req.param('device_ip');
    let device_port = req.param('device_port');
    let type = parseInt(req.param('type'));
    let client = WebSocket.clientMap.get(device_ip+':'+deviceConfig.port);
    if(client){
        let buf = AlprBufferSend.GetPlateListReq(type);
        logger.debug('获取设备名单：', buf);
        client.write(buf); // 获取黑白名单
        setTimeout(function () {
            logger.debug('名单列表:', WebSocket.dataMap.get(1223));
            let array = WebSocket.dataMap.get(1223);
            if(array) {
                let records = array == [] ? 0 : array.length;
                let rows = array == [] ? [] : array;
                res.json({total: 1, page: 1, records: records, rows: rows});
                WebSocket.dataMap.delete(1223);
            } else {
                res.json({total: 1, page: 1, records: 0, rows: []});
            }
        }, 1000);
    } else {
        res.json({total: 1, page: 1, records: 0, rows: []});
    }
});

/**设备设置*/
router.post('/setDevice.do', function (req, res) {
    let device = req.body.device;
    let where = {device_id: device.device_id};
    let data = {enable: device.enable};
    deviceModel.update(where, data).then(function (affectRows) { // 更新设备数据
        if(device.enable == 0) { // 断开连接
            WebSocket.destroyClient(device.device_id, deviceConfig.port, device.device_ip);
        }
        if(device.enable == 1) { // 重新连接
            WebSocket.connectAgain(device.device_id, deviceConfig.port, device.device_ip);
        }
        deviceCache.refresh(); // 刷新设备缓存
        res.json({errcode:0, errmsg:'ok', result: affectRows});
    })
});

/**清除设备黑白名单、固定车数据*/
router.post('/clearPlateList.do', function (req, res) {
    let device_ip = req.param('device_ip');
    let type = parseInt(req.param('type'));
    let key = device_ip+':'+deviceConfig.port;
    if(type==0) {
        WebSocket.clientMap.get(key).write(AlprBufferSend.ClearPlateList(0)); // 清除白名单
        logger.debug('发送指令：', AlprBufferSend.ClearPlateList(0));
    }
    if(type==1) {
        WebSocket.clientMap.get(key).write(AlprBufferSend.ClearPlateList(1)); // 清除黑名单
        logger.debug('发送指令：', AlprBufferSend.ClearPlateList(1));
    }
    if(type==2) {
        WebSocket.clientMap.get(key).write(AlprBufferSend.ClearPlateList(2)); // 清除固定车
        logger.debug('发送指令：', AlprBufferSend.ClearPlateList(2));
    }
    res.json({errcode:0, errmsg:'ok'});
});

module.exports = router;