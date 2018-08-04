var openPlatform = require('../middleware/OpenPlatformSendData');
var authorizationList = require('../models/plate_authorization');
var channel = require('../models/channel');
var toDevice = require('../models/client_protocol');
var deviceModel = require('../models/device');
var plateDataMix = require('../models/plate_data_mix');
var webSocket = require('../middleware/WebSocket');
var toServer = require('../models/server_protocol');
const globalVariables = require('./../cache/globalVariables');
const gateHalfPkgDecoder = require('./../utils/gateHalfPkgDecoder');
const blackWhiteList = require('../models/black_white_list');
const moment = require('moment');
const AlprBufferSend = require('../middleware/AlprBufferSend');
const deviceConfig = require('../config/DeviceConfig');
const logger = require('../utils/logUtil').getLogger('/middleware/syncDataFromCloud.js');

module.exports = {

    async syncDataToCloud(dataJson,type) {
        let retList =new Array(); // 返回开发平台数据
        let clientMap = webSocket.clientMap;
        // 保存数据到本地数据库
        async function saveDataToLocal(type) {
            if(type == 4807) {
                await blackWhiteList.save(dataJson); // 将黑白名单数据保存至本地数据库
            }
            if(type == 4808) {
                await authorizationList.saveFromCloud(dataJson);       //将授权车牌保存至数据库
            }
        }
        // 清除设备旧数据
        async function clearPlateList(type) {
            if (type == 4807) {
                for (let key of clientMap.keys()) { // 清除设备旧黑白名单信息
                    await clientMap.get(key).write(AlprBufferSend.ClearPlateList(0)); // 清除白名单
                    await clientMap.get(key).write(AlprBufferSend.ClearPlateList(1)); // 清除黑名单
                }
            }
            if (type == 4808) {
                for (let key of clientMap.keys()) { // 清除设备旧黑白名单信息
                    await clientMap.get(key).write(AlprBufferSend.ClearPlateList(2)); // 清除固定车
                }
            }
        }
        // 重新下发数据到设备
        async function sendToDevice(type) {
            if(type == 4807) {
                await blackWhiteList.selectBlackList().then(function (list) { // 下发黑名单
                    for (let key of clientMap.keys()) {
                        let PlateDataArray = [];
                        for(let i = 0; i < list.length; i++) {
                            var plateData = {
                                Plate: list[i].plate_number,
                                InDate: moment(list[i].begin_time).format('YYYY-MM-DD HH:mm:ss'),
                                OutDate: moment(list[i].end_time).format('YYYY-MM-DD HH:mm:ss')
                            }
                            PlateDataArray.push(plateData);
                        }
                        logger.debug('黑名单：', PlateDataArray);
                        let buf = toDevice.AddPlateListReq(1, PlateDataArray.length, PlateDataArray);
                        logger.debug('下发黑名单: ', buf);
                        clientMap.get(key).write(buf); // 写入黑名单
                        retList.push({deviceId:'', status: 1});
                    }
                });
                await blackWhiteList.selectWhiteList().then(function (list) { // 下发白名单
                    for (let key of clientMap.keys()) {
                        let PlateDataArray = [];
                        for(let i = 0; i < list.length; i++) {
                            var plateData = {
                                Plate: list[i].plate_number,
                                InDate: moment(list[i].begin_time).format('YYYY-MM-DD HH:mm:ss'),
                                OutDate: moment(list[i].end_time).format('YYYY-MM-DD HH:mm:ss')
                            }
                            PlateDataArray.push(plateData);
                        }
                        logger.debug('白名单：', PlateDataArray);
                        let buf = toDevice.AddPlateListReq(0, PlateDataArray.length, PlateDataArray);
                        logger.debug('下发白名单: ', buf);
                        clientMap.get(key).write(buf); // 写入白名单
                        retList.push({deviceId:'', status: 1});
                    }
                });
            }
            if (type == 4808) {
                let data = dataJson.data;
                await authorizationList.selectAll().then(function (list) { // 下发授权车牌
                    for(let i = 0; i < list.length; i++) {
                        channel.findDeviceByExitId(list[i].parking_exit_id).then(function (device) { // 查询通道对应设备
                            for(let j = 0; j < device.length; j++){
                                let PlateDataArray = [];
                                var plateData = {
                                    Plate: list[i].plate_number,
                                    InDate: moment(list[i].begin_time).format('YYYY-MM-DD HH:mm:ss'),
                                    OutDate: moment(list[i].end_time).format('YYYY-MM-DD HH:mm:ss')
                                }
                                if(list[i].plate_number != null && list[i].plate_number != undefined && list[i].plate_number != '') {
                                    PlateDataArray.push(plateData);
                                }
                                logger.debug('授权车牌：', PlateDataArray);
                                let buf = toDevice.AddPlateListReq(2, PlateDataArray.length, PlateDataArray);
                                let key = device[j].device_ip+':'+deviceConfig.port;
                                let clinet = clientMap.get(key);
                                if(clinet) {
                                    logger.debug('下发授权车牌到设备%s: ', key, buf);
                                    clinet.write(buf); // 写入白名单
                                    retList.push({deviceId:device[j].device_id, status: 1});
                                } else {
                                    retList.push({deviceId:device[j].device_id, status: 0});
                                }
                            }
                        });
                    }
                    // for (let key of clientMap.keys()) {
                    //     let PlateDataArray = [];
                    //     for(let i = 0; i < list.length; i++) {
                    //         var plateData = {
                    //             Plate: list[i].plate_number,
                    //             InDate: moment(list[i].begin_time).format('YYYY-MM-DD HH:mm:ss'),
                    //             OutDate: moment(list[i].end_time).format('YYYY-MM-DD HH:mm:ss')
                    //         }
                    //         PlateDataArray.push(plateData);
                    //     }
                    //     logger.debug('授权车牌：', PlateDataArray);
                    //     let buf = toDevice.AddPlateListReq(2, PlateDataArray.length, PlateDataArray);
                    //     logger.debug('下发授权车牌: ', buf);
                    //     clientMap.get(key).write(buf); // 写入授权车牌
                    //     retList.push({deviceId:'', status: 1});
                    // }
                });
                // 数据同步-授权车辆：车牌列表为空时，为针对临时车进行进出口授权
                for(let i = 0; i < data.length; i++) {
                    if(data[i].plateNumber == undefined) { // 车牌列表为空
                        logger.debug('授权车辆,车牌列表为空', data[i].plateNumber, data[i].parkingExitIds);
                        for(let j = 0; j < data[i].parkingExitIds.length; j++) { // 获取所有出入口设备,修改脱机参数
                            let parkingExitId = data[i].parkingExitIds[j];
                            await channel.findDeviceByExitId(parkingExitId).then(function (list) {
                                logger.debug('设备列表', list);
                                for(let k = 0; k < list.length; k++) {
                                    let client = webSocket.clientMap.get(list[k].device_ip+':'+deviceConfig.port);
                                    if(client.remoteAddress) {
                                        client.write(AlprBufferSend.GetOfflineParam()); // 发送获取脱机参数指令
                                        setTimeout(function () {
                                            let offlineParam = webSocket.dataMap.get(1245); // 获取脱机参数
                                            if(offlineParam) {
                                                offlineParam.tempCarForbiddenFlag = 0; // 临时车禁止出入场， 0： 可出入场， 1： 不可出入场
                                                logger.debug('脱机参数：%s', offlineParam);
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
                                                client.write(buf);
                                                logger.debug('发送指令：', buf.toString('hex'));
                                                webSocket.dataMap.delete(1245);
                                            }
                                        }, 1000);
                                    }
                                }
                            })
                        }
                    }
                };
            }
        }
        // 上传开放平台
        async function uploadPlatform() {
            let time = new Date().toLocaleString();     //获取时间
            let config = await globalVariables.getConfig();
            let content = {
                compId: config.comp_id,
                devCode: config.gateway_id,
                data: retList,
                sendtime: time
            };
            openPlatform.SendData(type,'111111111111',1,1,content);    //配置发送的各项数据 TODO
            logger.debug('成功名单信息：',retList);
        }

        await saveDataToLocal(type);    // 保存至本地数据库
        await clearPlateList(type);     // 清除设备数据
        await sendToDevice(type);       // 重新下发数据
        await uploadPlatform();         // 上传状态到开放平台

        // let data = dataJson.data;
        // let successList = new Array();      //successList中反馈了设备是否成功接受数据
        // let deviceList = new Array();       //作为数据发送对象的相关设备清单
        // let bufArray = new Array();         //发送至设备的数据帧组

        // if (type == 4807) {
        //     await blackWhiteList.save(dataJson);      //将黑白名单数据保存至本地数据库
        //     deviceList = await deviceModel.selectAll();
        //     for (let i = 0; i < data.length; i++) {
        //         let plateType = data[i].plateType=='00000001'? 1 : 0;  // 白：0，黑：1，固定车：2
        //         let plateMsg = [{
        //             Plate: data[i].plateNumber,
        //             InDate: data[i].begintime,
        //             OutDate: data[i].endtime
        //         }];
        //         if(data[i].deltag==0) { // 新增/编辑
        //             bufArray.push(await toDevice.AddPlateListReq(plateType, 1, plateMsg));
        //         }
        //         if(data[i].deltag==1) { // 删除
        //             bufArray.push(await toDevice.DelPlateListReq(plateType, 1, plateMsg))
        //         }
        //     }
        // }
        // else if (type == 4808) {
        //
        //     var plateNum = 0;
        //     await authorizationList.saveFromCloud(dataJson);       //将授权车牌保存至数据库
        //
        //     deviceList = await deviceModel.getListFromExitId(data);
        //     for (let i = 0; i < data.length; i++) {
        //         plateNum += data[i].plateNumbers.length;
        //     }
        //     let plateData = await plateDataMix.plateDataMix(data);
        //     if(data.deltag==0) { // 新增/编辑
        //         bufArray.push(await toDevice.AddPlateListReq(2, plateNum, plateData));
        //     }
        //     if(data.deltag==1) { // 删除
        //         bufArray.push(await toDevice.DelPlateListReq(2, plateNum, plateData));
        //     }
        // }
        // else {
        //     console.log('未找到处理方法!!');
        // }
        //
        // for(let i = 0; i < deviceList.length; i++){     //创建successList
        //     let successMsg = {deviceId:deviceList[i].device_id,deviceIp:deviceList[i].device_ip,status:0};
        //     successList.push(successMsg);
        // }
        // //await console.log(successList);
        // for(let i = 0; i < deviceList.length; i++){
        //     let client = await webSocket.getClient(deviceList[i]);
        //     if(client!=null){
        //         for(let j = 0; j < bufArray.length; j++){
        //             client.write(bufArray[j]);
        //             logger.debug('设置黑白名单：',bufArray[j]);
        //         }
        //         client.on('data', function(data) {
        //             gateHalfPkgDecoder.dataDecoder(client, data, async function(result) {
        //                 await console.log('服务器发回: ', result.toString('hex'));
        //                 for(let i = 0; i < deviceList.length; i++){
        //                     let isDeviceEnableConnect = client.remoteAddress == deviceList[i].device_ip && client.remotePort == deviceList[i].device_port;
        //                     if(isDeviceEnableConnect){
        //                         successList[i].status = await toServer.ProtocolDecode(result);
        //                     }
        //                 }
        //                 //console.log('设备ip：',client.remoteAddress);
        //             });
        //         });
        //         client.on('error', function() {
        //             globalVariables.setGateClientStatus(false);
        //             console.log('发生意外错误!');
        //         });
        //     }
        //
        // }
        // setTimeout(async function() {
        //     let time = new Date().toLocaleString();     //获取时间
        //     let config = await globalVariables.getConfig();
        //     let content = {
        //         compId: config.comp_id,
        //         devCode: config.gateway_id,
        //         data: successList,
        //         sendtime: time};
        //     openPlatform.SendData(type,'111111111111',1,1,content);    //配置发送的各项数据 TODO
        //     console.log('成功名单信息：',successList);
        // },5000)
    }
};