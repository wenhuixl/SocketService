/**
 * Created by wenhui on 2018/6/22.
 * 车辆进出服务层
 */
'use strict'
const logger = require('../utils/logUtil').getLogger('parkingEnterExit');
const device = require('../models/device');
const DBModel = require('../models/DBModel');
const moment = require('moment');
const enterExitRecord = require('../models/enter_exit_record');
const global = require('../cache/globalVariables');
const deviceModel = require('../models/device');
const deviceCache = require('../cache/device');
const blackWhiteListModel = require('../models/black_white_list');
const plateAuthorizationModel = require('../models/plate_authorization');
const gtModel = require('../models/gt');
const channelModel = require('../models/channel');
const carTypeModel = require('../models/car_type');
const carTypeService = require('../service/car_type');
const tradeTypeModel = require('../models/trade_type');
const localChargeService = require('../service/local_charge');
const enterExitRecordTmpModel = require('../models/enter_exit_record_tmp');
const enterExitRecordModel = require('../models/enter_exit_record');
const websocketServer = require('../middleware/WebSocketServer');
const WebSocket = require('../middleware/WebSocket');
const enterExitRecordService = require('../service/enter_exit_record');
const deviceService = require('../service/device');
const Message = require('../models/Message');
const messageService = require('../service/message');
const eventTypeModel = require('../models/event_type');
const localChargeModel = require('../models/local_charge');
const dateUtil = require('date-utils');  //勿删

/**
 *  文辉代码备份（编写车牌处理逻辑前）
 * @param deviceIp
 * @param devicePort
 * @param licensePlate
 * @returns {Promise<any[]>}
 */
async function planteInfoBK(deviceIp, devicePort, licensePlate) {
    let enterExitRecordId = '';
    let passTime = licensePlate.szTime;
    let plate = licensePlate.szLicense;
    let platePicturePath = licensePlate.platePicturePath;
    let list = await device.selectByRemote(deviceIp); // 查询设备对应车场区域信息
    let insertIds = new Array();
    let sendList = new Array();
    for(let i = 0; i < list.length; i++) {
        let enterExitStatus = list[i].exit_type;
        let deviceId = list[i].device_id;
        let channelId = list[i].channel_id;
        let parkingExitId = list[i].parking_exit_id;
        let parkingAreaId = list[i].area_id;
        let parkingPlotId = list[i].parking_lot_id;
        let uploadTag = 0;
        let uploadTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        let uploadConfirmTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        let parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime);
        let insertId = enterExitRecord.add(parkingEnterExitRecord);
        let sendData = { // 上传开放平台数据
            enterExitRecordId: insertId,
            passTime: passTime,
            plate: plate,
            enterExitStatus: enterExitStatus,
            deviceId: deviceId,
            channelId: channelId
        }
        await insertIds.push(insertId);
        await sendList.push(sendData);
    }
    enterExitRecordService.uploadEnterExitRecord(sendList); // 上传进出场数据
    return insertIds;
}

/**
 * 增加车牌处理逻辑@Evenlai 2018-06-26
 * @param deviceIp
 * @param licensePlate
 */
async function planteInfo(deviceIp,licensePlate) {
    let now = new Date();
    let enterExitRecordId = '';
    let enterExitRecordTmpId = '';
    let passTime = moment(now).format('YYYY-MM-DD HH:mm:ss.SSS');  //let passTime = licensePlate.szTime; 统一使用服务器时间
    let plate = licensePlate.szLicense;
    let platePicturePath = licensePlate.platePicturePath;
    let insertIds = new Array();
    let tmpInsertIds = new Array();
    let config = await global.getConfig();
    //查询设备基础资料
    // let device = await deviceCache.getByIp(deviceIp);
    // if(device==null){
    //     device = await deviceModel.findByIp(deviceIp);
    // }
    let device = await deviceModel.findByIp(deviceIp);
    if(device==null){
        logger.log("未找到设备基础数据:" + deviceIp);
        return null;
    }
    //设备禁用时不进行任何操作
    if(device.enabled === 0){
        return null;
    }
    //查询车场数据
    let channelWithLotInfo = null;
    let list = await deviceModel.selectByRemote(deviceIp); // 查询设备对应车场区域信息
    if(list!=null){
        if(list.length>=1){
            channelWithLotInfo = list[0];
            if(list.length>1){
                logger.log("一台设备被绑定到多个通道:" + deviceIp);
            }
        }
    }
    if(channelWithLotInfo==null){
        logger.log("本地车场数据不齐全");
        return null;
    }
    //单通道处理
    if(channelWithLotInfo.single_channel === await channelModel.getSingleChannelYes()){
        let singleChannelWaitTime = config!=null && config.single_channel_wait_time?config.single_channel_wait_time:20; //默认间隔20秒
        let lastRecognizedTime = WebSocket.singleChannelMap.get(channelWithLotInfo.gl_gt_id);
        console.log("上次识别时间:" + lastRecognizedTime);
        if(lastRecognizedTime){
            //未到间隔时间
            if(now.getMillisecondsBetween(new Date(lastRecognizedTime).addSeconds(singleChannelWaitTime))>=0){
                console.log("单通道间隔时间内不进行车牌处理，管理岗亭:" + channelWithLotInfo.gl_gt_id);
                return;
            }
        }
        let channelListWithSameGlgt = await channelModel.findListByGlGtId(channelWithLotInfo.gl_gt_id);
        if(channelListWithSameGlgt && channelListWithSameGlgt.length>0){
            for(let i=0;i<channelListWithSameGlgt.length;i++){
                if(channelListWithSameGlgt[i].channel_id===channelWithLotInfo.channel_id){

                }else{
                    //同一岗亭下其它通道设备显示提示语
                    let upMsg = "单通道模式";
                    let downMsg = "请让对面车辆先通行";
                    let device = await deviceModel.findById(channelListWithSameGlgt[i].device1_id);
                    console.log("单通道屏幕提示，设备：" + device.device_id);
                    await messageService.display(device,upMsg,downMsg,0);
                }
            }
        }
        WebSocket.singleChannelMap.set(channelWithLotInfo.gl_gt_id,now);
    }
    //通道停用时不进行任何操作 TODO

    //若在黑名单内则不做处理
    let inBlackList = await blackWhiteListModel.inBlackList(plate);
    if(inBlackList){
        //请联系管理员
        messageService.sendCommonMsg(device,plate,Message._105_PHRASE_CONTACT_ADMIN,plate,Message._135_PHRASE_INVALID_PLATE);
        return null;
    }

    //是否门中门
    let sfmzm = channelWithLotInfo.sfmzm;
    //固定车开闸方式
    let fixedCarOpenType = channelWithLotInfo.fixed_car_open_type;
    //临时车开闸方式
    let tmpCarOpenType = channelWithLotInfo.tmp_car_open_type;
    //获取通道岗亭
    let gtId = channelWithLotInfo.gl_gt_id;
    let gt = await gtModel.findById(gtId);

    //数据封装
    let enterExitStatus = channelWithLotInfo.exit_type;

    let deviceId = channelWithLotInfo.device_id;
    let channelId = channelWithLotInfo.channel_id;
    let parkingExitId = channelWithLotInfo.parking_exit_id;
    let parkingAreaId = channelWithLotInfo.area_id;
    let parkingPlotId = channelWithLotInfo.parking_lot_id;
    let uploadTag = 0;
    let uploadTime = moment(now).format('YYYY-MM-DD HH:mm:ss');
    let uploadConfirmTime = null;
    let payTag = await enterExitRecordModel.getPayTagUnpaid();
    let source = await enterExitRecordModel.getSourceMachine();
    let channel = await channelModel.findById(channelId);
    let manualEnterPlate = 0;
    //事件类型，默认为一般记录
    let eventId = await eventTypeModel.getEventTypeCommon();
    //车辆类型
    let carType = await carTypeService.getCarType(plate,channelId);
    let carTypeId = carType!=null?carType.carTypeId:"";
    //查询车辆类型列表
    let carTypeList = await carTypeModel.findListByCategory(carType.category);
    //是否允许切换车辆类型
    let enabledChangeCarType = carType.category===await carTypeModel.getCarCategoryFixed()||carType.isCommunityOwner===await carTypeModel.getIsCommunityOwnerYes()?0:1;
    //查询所有收款方式
    let tradeTypeList = await tradeTypeModel.findAll();
    //判断是否黑白名单、特殊车辆
    let inWhiteList = await blackWhiteListModel.inWhiteList(plate);
    let isSpecialCar = await localChargeService.isSpecialCar(plate);
    //判断是否固定车
    let isFixedCar = carType.category === await carTypeModel.getCarCategoryFixed();
    //临时变量
    let parkingEnterExitRecord = null;
    let parkingEnterExitRecordTmp = null;
    let insertId = null;
    let tmpInsertId = null;
    let dataSendToFront = null;
    let fixedCarAuthorization = null;
    let tmpCarAuthorization = null;

    if(inWhiteList || isSpecialCar){ //白名单、特殊车辆处理
        eventId = await eventTypeModel.getEventTypeVIP();   //访客贵宾车
        //开闸
        deviceService.openGate(channelId);
        if(sfmzm===await channelModel.getSfmzmYes()){ //门中门
            //您好
            messageService.sendCommonMsg(device,plate,Message._102_PHRASE_HELLO,plate,Message._102_PHRASE_HELLO);
            //出场
            enterExitStatus = await channelModel.getExitTypeOut();
            parkingPlotId = channelWithLotInfo.out_parking_lot_id;
            parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
            insertId = await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
            insertIds.push(insertId);
            //入场
            passTime = moment(new Date(passTime).addSeconds(1)).format('YYYY-MM-DD HH:mm:ss');
            uploadTime = passTime;
            enterExitStatus = await channelModel.getExitTypeIn();
            parkingPlotId = channelWithLotInfo.in_parking_lot_id;
            parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
            insertId = await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
            insertIds.push(insertId);
        }else if(sfmzm===await channelModel.getSfmzmNo()){  //非门中门
            if(enterExitStatus===await channelModel.getExitTypeIn()){  //入口
                //贵宾车入场
                messageService.sendCommonMsg(device,plate,Message._98_PHRASE_WELCOME,plate,Message._140_PHRASE_VIPCAR_ENTER);
            }else if(enterExitStatus===await channelModel.getExitTypeOut()){  //出口
                //贵宾车出场
                messageService.sendCommonMsg(device,plate,Message._101_PHRASE_LEAVE_SAFELY,plate,Message._139_PHRASE_VIPCAR_OUT);
            }
            parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
            insertId = await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
            insertIds.push(insertId);
        }
    }else{
        if(isFixedCar){ //检查固定车授权
            fixedCarAuthorization = await localChargeService.fixedCarAuthorization(plate,channelId);
            if(fixedCarAuthorization.daysRemaining<0){
                //月卡车过期
                messageService.sendCommonMsg(device,plate,Message._134_PHRASE_MONTHCARD_EXPIRE,plate,Message._134_PHRASE_MONTHCARD_EXPIRE);
            }
        }else{ //检查临时车授权
            tmpCarAuthorization = await localChargeService.tmpCarAuthorization(channelId);
            if(!tmpCarAuthorization.enabledPass){
                messageService.sendCommonMsg(device,plate,Message._153_PHRASE_TEM_CAR_BAN,plate,Message._153_PHRASE_TEM_CAR_BAN);
            }
        }
        if((isFixedCar && fixedCarAuthorization.enabledPass && (fixedCarOpenType===await channelModel.getOpenTypeManualPass()||fixedCarOpenType===await channelModel.getOpenTypePaidPass()))
            ||(!isFixedCar && tmpCarAuthorization.enabledPass && (tmpCarOpenType===await channelModel.getOpenTypeManualPass()||tmpCarOpenType===await channelModel.getOpenTypePaidPass()))){  //固定车/临时车确认放行/缴费放行
            if(sfmzm===await channelModel.getSfmzmYes()){  //门中门
                //系统正在处理中
                messageService.sendCommonMsg(device,plate,Message._106_PHRASE_HANDLING,plate,Message._106_PHRASE_HANDLING);
                //出场
                enterExitStatus = await channelModel.getExitTypeOut();
                parkingPlotId = channelWithLotInfo.out_parking_lot_id;
                parkingEnterExitRecordTmp = new DBModel.ParkingEnterExitRecordTmp(enterExitRecordTmpId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                tmpInsertId = await enterExitRecordTmpModel.add(parkingEnterExitRecordTmp);
                tmpInsertIds.push(tmpInsertId);
                //入场
                passTime = moment(new Date(passTime).addSeconds(1)).format('YYYY-MM-DD HH:mm:ss');
                uploadTime = passTime;
                enterExitStatus = await channelModel.getExitTypeIn();
                parkingPlotId = channelWithLotInfo.in_parking_lot_id;
                parkingEnterExitRecordTmp = new DBModel.ParkingEnterExitRecordTmp(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                tmpInsertId = await enterExitRecordTmpModel.add(parkingEnterExitRecordTmp);
                tmpInsertIds.push(tmpInsertId);
                dataSendToFront = {"rstId":await localChargeModel.getChargeMZMPassConfirm(),"rstDesc":"gt",
                    "message":"门中门确认放行","plate":plate,"carTypeId":carTypeId,
                    "tmpInsertIds":tmpInsertIds,"carTypeList":carTypeList,"enabledChangeCarType":enabledChangeCarType,
                    "channelId":channelId,"exitType":channelModel.getExitTypeIn()};
                websocketServer.send(gt.gt_ip,JSON.stringify(dataSendToFront));
            }else if(sfmzm===await channelModel.getSfmzmNo()){  //非门中门
                if(channelWithLotInfo.exit_type===await channelModel.getExitTypeIn()){  //入口
                    //系统正在处理中
                    messageService.sendCommonMsg(device,plate,Message._106_PHRASE_HANDLING,plate,Message._106_PHRASE_HANDLING);
                    parkingEnterExitRecordTmp = new DBModel.ParkingEnterExitRecordTmp(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                    tmpInsertId = await enterExitRecordTmpModel.add(parkingEnterExitRecordTmp);
                    tmpInsertIds.push(tmpInsertId);
                    dataSendToFront = {"rstId":await localChargeModel.getChargeEntrancePassConfirm(),"rstDesc":"gt",
                        "message":"入口确认放行","plate":plate,"carTypeId":carTypeId,
                        "tmpInsertIds":tmpInsertIds,"carTypeList":carTypeList,"enabledChangeCarType":enabledChangeCarType,
                        "channelId":channelId,"exitType":channelModel.getExitTypeIn()};
                    websocketServer.send(gt.gt_ip,JSON.stringify(dataSendToFront));
                }else if(channelWithLotInfo.exit_type===await channelModel.getExitTypeOut()){ //出口
                    //检查是否收费
                    dataSendToFront = await localChargeService.autoCharge(plate,carTypeId,channel,tmpInsertIds);
                    if(dataSendToFront.rstId===await localChargeModel.getChargeFree()){  //免费
                        if((isFixedCar && fixedCarOpenType===await channelModel.getOpenTypeManualPass()    //缴费后仍需确认
                            ||!isFixedCar && tmpCarOpenType===await channelModel.getOpenTypeManualPass())){
                            //系统正在处理中
                            messageService.sendCommonMsg(device,plate,Message._106_PHRASE_HANDLING,plate,Message._106_PHRASE_HANDLING);
                            dataSendToFront = {"rstId":await localChargeModel.getChargeExitPassConfirm(),"rstDesc":"gt",
                                "message":"出口确认放行","plate":plate,"carTypeId":carTypeId,
                                "tmpInsertIds":tmpInsertIds,"carTypeList":carTypeList,"enabledChangeCarType":enabledChangeCarType,
                                "channelId":channelId,"exitType":await channelModel.getExitTypeOut()};
                            websocketServer.send(gt.gt_ip,JSON.stringify(dataSendToFront));
                        } else if((isFixedCar && fixedCarOpenType===await channelModel.getOpenTypePaidPass()  //缴费后无需确认
                            ||!isFixedCar && tmpCarOpenType===await channelModel.getOpenTypePaidPass())){
                            deviceService.openGate(channelId);
                            //祝您一路平安
                            messageService.sendCommonMsg(device,plate,Message._101_PHRASE_LEAVE_SAFELY,plate,Message._101_PHRASE_LEAVE_SAFELY);
                            parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                            insertId = await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
                            insertIds.push(insertId);
                        }
                    }else if(dataSendToFront.rstId===await localChargeModel.getChargeNoEnterRecord()){  //无入场记录
                        //无入场记录
                        messageService.sendCommonMsg(device,plate,Message._115_PHRASE_NO_ENTER_RECORD,plate,Message._115_PHRASE_NO_ENTER_RECORD);
                        dataSendToFront = await localChargeService.noEnterRecordHandle(plate,carTypeId,channel.channel_id,manualEnterPlate,tmpInsertIds);
                        dataSendToFront.eventId = await eventTypeModel.getEventNoEnterRecord();
                        websocketServer.send(gt.gt_ip, JSON.stringify(dataSendToFront));
                    }else if(dataSendToFront.rstId===await localChargeModel.getChargeNeedPay()){  //需缴费
                        //请交费
                        messageService.sendChargeMsg(device,plate,dataSendToFront.chargeData.object.payAmount.toString());
                        parkingEnterExitRecordTmp = new DBModel.ParkingEnterExitRecordTmp(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                        tmpInsertId = await enterExitRecordTmpModel.add(parkingEnterExitRecordTmp);
                        tmpInsertIds.push(tmpInsertId);
                        //推送收费信息到前端页面
                        dataSendToFront.tmpInsertIds = tmpInsertIds;
                        dataSendToFront.carTypeList = carTypeList;
                        dataSendToFront.tradeTypeList = tradeTypeList;
                        dataSendToFront.manualEnterPlate = manualEnterPlate;
                        dataSendToFront.eventId = eventId;
                        dataSendToFront.enabledChangeCarType = enabledChangeCarType;
                        websocketServer.send(gt.gt_ip, JSON.stringify(dataSendToFront));
                    }
                }
            }
        }else if((isFixedCar && fixedCarAuthorization.enabledPass && fixedCarOpenType===await channelModel.getOpenTypeDirectPass())
            ||(!isFixedCar && tmpCarAuthorization.enabledPass && tmpCarOpenType===await channelModel.getOpenTypeDirectPass())) {  //直接放行
            if (sfmzm === await channelModel.getSfmzmYes()) {  //门中门
                //开闸
                deviceService.openGate(channelId);
                //您好
                messageService.sendCommonMsg(device,plate,Message._102_PHRASE_HELLO,plate,Message._102_PHRASE_HELLO);
                //出场
                enterExitStatus = await channelModel.getExitTypeOut();
                parkingPlotId = channelWithLotInfo.out_parking_lot_id;
                parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                insertId = await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
                insertIds.push(insertId);
                //入场
                passTime = moment(new Date(passTime).addSeconds(1)).format('YYYY-MM-DD HH:mm:ss');
                uploadTime = passTime;
                enterExitStatus = await channelModel.getExitTypeIn();
                parkingPlotId = channelWithLotInfo.in_parking_lot_id;
                parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                insertId = await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
                insertIds.push(insertId);
            } else if (sfmzm === await channelModel.getSfmzmNo()){  //非门中门
                if (channelWithLotInfo.exit_type === await channelModel.getExitTypeIn()) {  //入口
                    //开闸
                    deviceService.openGate(channelId);
                    //欢迎光临
                    messageService.sendCommonMsg(device,plate,Message._98_PHRASE_WELCOME,plate,Message._98_PHRASE_WELCOME);
                    parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                    insertId = await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
                    insertIds.push(insertId);
                } else if (channelWithLotInfo.exit_type === await channelModel.getExitTypeOut()) { //出口
                    //检查是否收费  TODO自动识别车辆类型
                    dataSendToFront = await localChargeService.autoCharge(plate,carTypeId,channel);
                    if(dataSendToFront.rstId===await localChargeModel.getChargeFree()){  //免费
                        deviceService.openGate(channelId);
                        //祝您一路平安
                        messageService.sendCommonMsg(device,plate,Message._101_PHRASE_LEAVE_SAFELY,plate,Message._101_PHRASE_LEAVE_SAFELY);
                        parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                        insertId = await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
                        insertIds.push(insertId);
                    }else if(dataSendToFront.rstId===await localChargeModel.getChargeNoEnterRecord()){  //无入场记录
                        //TODO 支持设置无入场记录处理方式：直接放行或进行校验
                        //无入场记录
                        messageService.sendCommonMsg(device,plate,Message._115_PHRASE_NO_ENTER_RECORD,plate,Message._115_PHRASE_NO_ENTER_RECORD);
                        parkingEnterExitRecordTmp = new DBModel.ParkingEnterExitRecordTmp(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                        tmpInsertId = await enterExitRecordTmpModel.add(parkingEnterExitRecordTmp);
                        tmpInsertIds.push(tmpInsertId);
                        dataSendToFront = await localChargeService.noEnterRecordHandle(plate,carTypeId,channel.channel_id,manualEnterPlate,tmpInsertIds);
                        dataSendToFront.eventId = await eventTypeModel.getEventNoEnterRecord();
                        websocketServer.send(gt.gt_ip, JSON.stringify(dataSendToFront));
                    }else if(dataSendToFront.rstId===await localChargeModel.getChargeNeedPay()){  //需缴费
                        //请交费
                        messageService.sendChargeMsg(device,plate,dataSendToFront.chargeData.object.payAmount.toString());
                        //推送收费信息到前端页面
                        parkingEnterExitRecordTmp = new DBModel.ParkingEnterExitRecordTmp(enterExitRecordTmpId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
                        tmpInsertId = await enterExitRecordTmpModel.add(parkingEnterExitRecordTmp);
                        tmpInsertIds.push(tmpInsertId);
                        dataSendToFront.tmpInsertIds = tmpInsertIds;
                        dataSendToFront.carTypeList = carTypeList;
                        dataSendToFront.tradeTypeList = tradeTypeList;
                        dataSendToFront.eventId = eventId;
                        dataSendToFront.enabledChangeCarType = enabledChangeCarType;
                        websocketServer.send(gt.gt_ip, JSON.stringify(dataSendToFront));
                    }
                }
            }
        }
    }
    //需要预警时覆盖语音、文字
    //剩余天数预警  TODO
    let earlyWarningDays = 7;
    if(isFixedCar){
        if(fixedCarAuthorization.daysRemaining<0) {
            messageService.sendCommonMsg(device,plate,Message._134_PHRASE_MONTHCARD_EXPIRE,plate,Message._134_PHRASE_MONTHCARD_EXPIRE);
        }
        else if(fixedCarAuthorization.daysRemaining>=0 && fixedCarAuthorization.daysRemaining<=earlyWarningDays){
            let voiceArray = [];
            //月卡有效期
            voiceArray.push(Message._141_PHRASE_MONTHCARD_VALIDTIME.code);
            //?天
            voiceArray.push(await messageService.encode(voiceArray,fixedCarAuthorization.daysRemaining.toString()+"天"));
            //屏幕显示
            let upMsg = plate;
            let downMsg = Message._141_PHRASE_MONTHCARD_VALIDTIME.content + fixedCarAuthorization.daysRemaining + "天";
            setTimeout(function () {
                messageService.broadcast(device,voiceArray);
                messageService.display(device,upMsg,downMsg,0);
            },5000);
        }
    }

    return {"insertIds":insertIds,"tmpInsertIds":tmpInsertIds,"dataSendToFront":JSON.stringify(dataSendToFront)};
}

module.exports = {
    planteInfo: planteInfo
};