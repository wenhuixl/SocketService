const webSocket = require('../middleware/WebSocket');
const deviceModel = require('../models/device');
const clientProtocol = require("../test/client_protocol");
const OpenPlatformSendData = require('../middleware/OpenPlatformSendData');
const moment = require('moment');
const global = require('../cache/globalVariables');
const AlprBufferSend = require('../middleware/AlprBufferSend');
const enterExitRecordModel = require('../models/enter_exit_record');
const enterExitRecordService = require('../service/enter_exit_record');
const channelModel = require('../models/channel');
const exitModel = require('../models/exit');
const areaModel = require('../models/area');
const deviceCache = require('../cache/device');
const logger = require('../utils/logUtil').getLogger('/service/device.js');
const Message = require('../models/Message');
const messageService = require('../service/message');
const plateAuthorizationModel = require('../models/plate_authorization');
const websocketServer = require('../middleware/WebSocketServer');
const carTypeModel = require('../models/car_type');
const blackWhiteList = require('../models/black_white_list');
const authorizationList = require('../models/plate_authorization');
const localChargeModel = require('../models/local_charge');
const deviceConfig = require('../config/DeviceConfig');

module.exports = {

    /**
     * 指定通道开闸
     */
    async openGate(channelId){
        //下发开闸指令
        let channel = await channelModel.findById(channelId);
        if(channel){
            //开闸指令
            let buf = clientProtocol.OpenGate();

            let device1 = channel.device1_id?await deviceModel.findById(channel.device1_id):null;
            let device2 = channel.device2_id?await deviceModel.findById(channel.device2_id):null;
            if(device1!=null){
                let client1 = await webSocket.getClient(device1);
                //向设备1(如有)下发开闸指令
                if(client1!=null){
                    client1.write(buf);
                }
            }

            if(device2!=null){
                let client2 = await webSocket.getClient(device2);
                //向设备2(如有)下发开闸指令
                if(client2!=null){
                    client2.write(buf);
                }
            }
        }
    },
    async uploadDeviceState(deviceId, deviceState) { // 上传设备状态到开放平台
        let config = await global.getConfig();
        let content = {
            devCode: config.gateway_id,
            compId: config.comp_id,
            data: [{
                deviceId: deviceId,
                deviceState: deviceState // 1-在线，0-离线
            }],
            sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
        }
        console.log('uploadDeviceState: ', content);
        OpenPlatformSendData.SendData(4900, '111111111111', 1, 1, content);
    },
    async openGateByRemote(content) { // 远程开门
        for(let i = 0; i < content.data.length; i++) {
            let channelId = content.data[i].channelId;
            let plate = content.data[i].plate_number;
            let carTypeId = content.data[i].carTypeId;
            let carType = await carTypeModel.findById(carTypeId);
            let deviceId = content.data[i].deviceId;
            let device = await deviceModel.findById(deviceId);
            let tmpIds = content.data[i].tmpIds;
            if(channelId){
                let channel = await channelModel.findById(channelId);
                if(channel){
                    let exit = await exitModel.findById(channel.parking_exit_id);
                    let area = exit!=null?await areaModel.findById(exit.parking_area_id):null;
                    let isFixedCar = await plateAuthorizationModel.isFixedCar(plate,area.parking_lot_id);
                    //判断是否需要确认
                    let fixedCarOpenType = channel.fixed_car_open_type;
                    let tmpCarOpenType = channel.tmp_car_open_type;
                    if((isFixedCar && (fixedCarOpenType===await channelModel.getOpenTypeManualPass()||fixedCarOpenType===await channelModel.getOpenTypePaidPass()))
                        ||(!isFixedCar && (tmpCarOpenType===await channelModel.getOpenTypeManualPass()||tmpCarOpenType===await channelModel.getOpenTypePaidPass()))) {  //固定车/临时车确认放行/缴费放行
                        //系统正在处理中
                        messageService.sendCommonMsg(device,plate,Message._106_PHRASE_HANDLING,plate,Message._106_PHRASE_HANDLING);
                        //查询车辆类型
                        let carTypeList = await carTypeModel.findListByCategory(carType.category);
                        let dataSendToFront = {"rstId":await localChargeModel.getChargeExitPassConfirm(),"rstDesc":"gt",
                            "message":"出口确认放行","plate":plate,
                            "tmpInsertIds":tmpIds,"carTypeList":carTypeList,
                            "channelId":channelId,"exitType":await channelModel.getExitTypeOut()};
                        websocketServer.send(channel.gl_gt_id,JSON.stringify(dataSendToFront));
                    }else if((isFixedCar && fixedCarOpenType===await channelModel.getOpenTypeDirectPass())
                        ||(!isFixedCar && tmpCarOpenType===await channelModel.getOpenTypeDirectPass())) {  //直接放行
                        this.openGate(channelId);
                        //祝您一路平安
                        messageService.sendCommonMsg(device,plate,Message._101_PHRASE_LEAVE_SAFELY,plate,Message._101_PHRASE_LEAVE_SAFELY);
                        //保存出场记录
                        enterExitRecordService.addWithNoneMachine(channelId,plate,carTypeId,deviceId,tmpIds,await channelModel.getExitTypeOut(),
                            await enterExitRecordModel.getPayTagPaid(),enterExitRecordModel.getSourceOpenGateCommand(),null);
                    }
                }
            }
        }
    },
    async setOfflineParam (content) { // 下发脱机参数到设备
        for(let i = 0; i < content.data.length; i++) {
            let fixedCarOpenType = content.data[i].fixedCarOpenType; // 固定车开闸方式: 00000001: 确认放行，00000002:直接放行，00000003:缴费放行
            let tmpCarOpenType = content.data[i].tmpCarOpenType;     // 临时车开闸方式: 00000001: 确认放行，00000002:直接放行，00000003:缴费放行
            let exitType = content.data[i].exitType;                 // 进出口类型: 00000001:入口 00000002:出口
            let sfmzm = content.data[i].sfmzm;                       // 是否门中门:  00000000：否 00000001：是
            let singleChannel = content.data[i].singleChannel;       // 是否单通道: 00000000：否  00000001：是
            let device1 = content.data[i].device1? await deviceModel.findById(content.data[i].device1):null;
            let device2 = content.data[i].device2? await deviceModel.findById(content.data[i].device1):null;
            if(device1) {
                sendToDevice(device1);
            }
            if(device2) {
                sendToDevice(device2);
            }
            function sendToDevice(device) { // 下发到设备
                logger.debug('下发设备：', device);
                webSocket.getClient(device).then(function (client) {
                    if(client) {
                        client.write(AlprBufferSend.GetOfflineParam()); // 发送获取脱机参数指令
                        setTimeout(function () {
                            logger.debug(webSocket.dataMap);
                            let offlineParam = webSocket.dataMap.get(1245);     // 获取脱机参数
                            if(offlineParam) {
                                offlineParam.MonthCarOpenType = fixedCarOpenType==='00000001'|| fixedCarOpenType==='00000003'? 0:1; // 固定车开闸方式 0：人工开闸，1：自动开闸
                                offlineParam.tempCarOpenType = tmpCarOpenType==='00000001'||tmpCarOpenType==='00000003'? 0:1;     // 临时车开闸方式
                                offlineParam.parkInOutFlag = exitType==='00000001'? 0:1;             // 进出口类型 车场入口0，车场出口1
                                offlineParam.oneChannelMode = singleChannel==='00000001'? 1:0;      // 是否设置为单通道 否0，是1
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
                                logger.debug('setOfflineParam', offlineParam);
                            }
                        }, 1000);
                    }
                })
            }
        }
    },
    async setOfflineParamOnly (content) { // 下发脱机参数到设备
        for(let i = 0; i < content.data.length; i++) {
            let singleChannelWaitTime = content.data[i].singleChannelWaitTime; // 单通道重复车牌等待时长，单位：秒
            deviceModel.findAll().then(function (data) {
                for (let i = 0; i < data.length; i++) {
                    let client = webSocket.clientMap.get(data[i].device_ip + ':' + deviceConfig.port);
                    if(client) {
                        client.write(AlprBufferSend.GetOfflineParam()); // 发送获取脱机参数指令
                        setTimeout(function () {
                            logger.debug(webSocket.dataMap);
                            let offlineParam = webSocket.dataMap.get(1245);     // 获取脱机参数
                            if(offlineParam) {
                                offlineParam.oneChannelWaitTime = singleChannelWaitTime; // 修改原来单通道等待时长
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
                                logger.debug('setOfflineParam', offlineParam);
                            }
                        }, 1000);
                    }
                }
            }).catch(function (e) {
                logger.debug(e);
            });
        }
    },

    //手动识别
    async manualRecognize (channelId){
        let dataSendToFront = "";
        if(channelId!=null){
            let channel = await channelModel.findById(channelId);
            if(channel){
                let device = await deviceModel.findById(channel.device1_id);
                if(device){
                    let client = await webSocket.getClient(device);
                    if(client){
                        console.log("手动识别,设备ip:" + device.device_ip);
                        await client.write(AlprBufferSend.RecogByManualReq());
                        dataSendToFront = {"rstId":200,"rstDesc":"gt","message":"指令发送成功"};
                    }else{
                        dataSendToFront = {"rstId":0,"rstDesc":"gt","message":"该通道设备连接异常"};
                    }
                }else{
                    dataSendToFront = {"rstId":0,"rstDesc":"gt","message":"该通道没有找到关联的设备"};
                }
            }else{
                dataSendToFront = {"rstId":0,"rstDesc":"gt","message":"未找到相应的通道"};
            }
        }
        return dataSendToFront;
    },
    // 断开设备连接
    async destroyClient(content) {
        for(let i = 0; i < content.data.length; i++) {
            let device = await deviceModel.findById(content.data[i].device_id);
            if(device) {
                webSocket.destroyClient(device.device_id, device.device_port, device.device_ip);
            }
        }
    },
    // 设备初始化
    async deviceInit(device) {
        logger.debug('设备初始化', device);
        let clientMap = webSocket.clientMap;
        let key = device.deviceIp+':'+deviceConfig.port;
        let client = clientMap.get(key);
        logger.debug('clientMap', clientMap);
        if(client) {
            await client.write(AlprBufferSend.ClearPlateList(0)); // 清除白名单
            await client.write(AlprBufferSend.ClearPlateList(1)); // 清除黑名单
            await client.write(AlprBufferSend.ClearPlateList(2)); // 清除固定车
            await blackWhiteList.selectBlackList().then(function (list) { // 下发黑名单
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
                let buf = AlprBufferSend.AddPlateListReq(1, PlateDataArray.length, PlateDataArray);
                logger.debug('下发黑名单: ', buf);
                client.write(buf); // 写入黑名单
            });
            await blackWhiteList.selectWhiteList().then(function (list) { // 下发白名单
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
                let buf = AlprBufferSend.AddPlateListReq(0, PlateDataArray.length, PlateDataArray);
                logger.debug('下发白名单: ', buf);
                client.write(buf); // 写入白名单
            });
            await authorizationList.groupSelect().then(function (list) { // 下发授权车牌
                let PlateDataArray = [];
                for(let i = 0; i < list.length; i++) {
                    var plateData = {
                        Plate: list[i].plate_number,
                        InDate: moment(list[i].begin_time).format('YYYY-MM-DD HH:mm:ss'),
                        OutDate: moment(list[i].end_time).format('YYYY-MM-DD HH:mm:ss')
                    }
                    if(list[i].plate_number != '' && list[i].plate_number != null && list[i].plate_number != undefined) { // 车牌号码为空不下发
                        PlateDataArray.push(plateData);
                    }
                }
                logger.debug('授权车牌：', PlateDataArray);
                let buf = AlprBufferSend.AddPlateListReq(2, PlateDataArray.length, PlateDataArray);
                logger.debug('下发授权车牌: ', buf);
                client.write(buf); // 写入授权车牌
            });
        }
    }
};