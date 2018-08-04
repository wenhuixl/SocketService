/**
 * 本地计费处理类
 * Created by wenbin on 2018/06/22.
 */
const moment = require('moment');
const global = require('../cache/globalVariables');
const tradeModel = require('../models/trade');
const blackWhiteListModel = require('../models/black_white_list');
const enterExitRecordModel = require('../models/enter_exit_record');
const enterExitRecordService = require('../service/enter_exit_record');
const channelModel = require('../models/channel');
const exitModel = require('../models/exit');
const areaModel = require('../models/area');
const lotModel = require('../models/lot');
const plateAuthorizationModel = require('../models/plate_authorization');
const tmpCarChargeRuleModel = require('../models/tmp_car_charge_rule');
const overTimeChargeRuleDetailModel = require('../models/over_time_charge_rule_detail');
const platformService = require('../service/plateform');
const deviceService = require('../service/device');
const manualPassService = require('../service/manual_pass');
const dateUtil = require('date-utils');  //勿删
const carTypeModel = require('../models/car_type');
const tradeTypeModel = require('../models/trade_type');
const Message = require('../models/Message');
const messageService = require('../service/message');
const deviceModel = require('../models/device');
const eventTypeModel = require('../models/event_type');
const localChargeModel = require('../models/local_charge');

module.exports = {

    /**
     * 检查车辆是否需要收费
     * @param config
     * @param channel
     * @param plate
     * @param carType
     * @returns {Promise<number>}
     */
    async check(config,plate,carType,channel){
        //判断车牌是否在白名单内
        if(await blackWhiteListModel.inWhiteList(plate)){
            return await localChargeModel.getChargeFree();
        }
        //判断是否有入场记录
        let lastEnterRecord = await enterExitRecordModel.findLastByPlate(plate);
        if(lastEnterRecord==null || lastEnterRecord.enter_exit_status===await channelModel.getExitTypeOut()){
            return await localChargeModel.getChargeNoEnterRecord();
        }
        //判断是否授权车牌
        let exit = await exitModel.findById(channel.parking_exit_id);
        let area = exit!=null?await areaModel.findById(exit.parking_area_id):null;
        let lot = area!=null?await lotModel.findById(area.parking_lot_id):null;
        let isFixedCar = await plateAuthorizationModel.isFixedCar(plate,lot.plot_id);
        //查询计费规则
        let tmpCarChargeRule = await tmpCarChargeRuleModel.findByLotIdAndFixedCar(lot.plot_id,isFixedCar?await tmpCarChargeRuleModel.getFixedCarYes():await tmpCarChargeRuleModel.getFixedCarNo())
        let freeMinutes = tmpCarChargeRule==null?await tmpCarChargeRuleModel.getDefaultFreeMinutes():tmpCarChargeRule.free_minutes;
        let now = new Date();
        //是否超过免费时长
        let freeTime = new Date(lastEnterRecord.pass_time).addMinutes(freeMinutes);
        let moreThenFreeTime = freeTime.isBefore(now);

        if(moreThenFreeTime){  //超时
            //查询车牌最新支付记录
            let trade = await tradeModel.findLastByPlate(plate);
            if(trade!=null){  //有支付记录
                //判断是否超过支付后免费时长
                let overTimeChargeRuleDetail = await overTimeChargeRuleDetailModel.findByCarType(carType);
                let retentionMinutes = overTimeChargeRuleDetail==null?await overTimeChargeRuleDetailModel.getDefaultRetentionTime():overTimeChargeRuleDetail.retention_time;
                let retentionTime = new Date(trade.pay_time).addMinutes(retentionMinutes);
                let moreThenRetentionTime = retentionTime.isBefore(now);
                if(moreThenRetentionTime){ //超时
                    return await localChargeModel.getChargeNeedPay();
                }else{   //未超时
                    return await localChargeModel.getChargeFree();
                }
            }else{  //没有支付记录
                return await localChargeModel.getChargeNeedPay();
            }
        }else{  //未超时
            return await localChargeModel.getChargeFree();
        }
    },
    /**
     * 自动结算
     */
    async autoCharge(plate,carType,channel,tmpInsertIds){
        let dataSendToFront = null;
        let config = await global.getConfig();
        if(config.mzm_mode === await global.getMzmModeYes()){   //门中门工作模式下交由平台进行处理
            dataSendToFront = this.remoteCharge(plate,carType,channel.device1_id,tmpInsertIds);
        }else if(config.mzm_mode === await global.getMzmModeNo()){   //非门中门工作模式
            let result = await this.check(config,plate,carType,channel);
            if(result === await localChargeModel.getChargeFree()){   //不需要支付
                dataSendToFront = {"rstId":await localChargeModel.getChargeFree(),"rstDesc":"gt","message":"不需要支付"};
            } else if(result === await localChargeModel.getChargeNoEnterRecord()){   //无入场记录
                dataSendToFront = {"rstId":await localChargeModel.getChargeNoEnterRecord(),"rstDesc":"gt","message":"无入场数据"};
            }else if(result === await localChargeModel.getChargeNeedPay()){  //需要支付
                dataSendToFront = await this.remoteCharge(plate,carType,channel,tmpInsertIds);
            }
        }
        return dataSendToFront;
    },
    /**
     * 远程结算
     */
    async remoteCharge(plate,carType,channel,tmpInsertIds){
        let dataSendToFront = "";
        //调用远程计费接口
        let chargeData = JSON.parse(await platformService.remoteCharge(plate,carType,channel.device1_id,tmpInsertIds));
        //判断调用计费接口是否正常
        if(chargeData){
            switch (chargeData.rstId){
                case await platformService.getRemoteChargeStatusSuccess():
                    if(chargeData.object!=null){
                        //查询入场照片
                        let enterImgPath = "";
                        if (chargeData.object.enterRecordId != null) {
                            let enterRecord = await enterExitRecordModel.findById(chargeData.object.enterRecordId);
                            if (enterRecord != null) {
                                enterImgPath = enterRecord.plate_picture_path;
                            }
                        }
                        dataSendToFront = {
                            "rstId": await localChargeModel.getChargeNeedPay(), "rstDesc": "gt",
                            "message": "需收费", "channelId": channel.channel_id, "passReason": "正常缴费",
                            "plate": plate,"enterPlate":plate, "chargeData": chargeData, "enterImgPath": enterImgPath
                        };
                    }else{
                        dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":chargeData.rstDesc};
                    }
                    break;
                case await platformService.getRemoteChargeStatusOrderInvalid():
                    dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
                case await platformService.getRemoteChargeStatusNoEnterRecord():
                    dataSendToFront = {"rstId":await localChargeModel.getChargeNoEnterRecord(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
                case await platformService.getRemoteChargeStatusFree():
                    dataSendToFront = {"rstId":await localChargeModel.getChargeFree(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
                default:
                    dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
            }
        }else{
            dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":"调用远程计费接口失败，请重试!"};
        }
        return dataSendToFront;
    },
    /**
     * 无入场记录处理
     */
    async noEnterRecordHandle(plate,carTypeId,channelId,manualEnterPlate,tmpInsertIds){
        //无匹配数据处理 TODO
        //查询系统设置的匹配度 TODO
        let dataSendToFront = null;
        let similarityDegree = 4;
        //查找相近的入场数据(未出场)
        let lastEnterList = await enterExitRecordModel.findLastEnterListByPlateAndSimilarityDegree(plate,similarityDegree,await channelModel.getExitTypeIn(),await channelModel.getExitTypeOut());
        if(lastEnterList){
            for(let i=0;i<lastEnterList.length;i++){
                lastEnterList[i].pass_time = moment(lastEnterList[i].pass_time,moment.ISO_8601).format('YYYY-MM-DD HH:mm:ss');
            }
        }
        dataSendToFront = {"rstId":await localChargeModel.getChargeNoEnterRecord(),"rstDesc":"gt",
            "message":"无入场记录","searchPlate":plate,"originalPlate":plate,"carTypeId":carTypeId,
            "lastEnterList":lastEnterList,"lastEnterListCount":lastEnterList==null?0:lastEnterList.length, "channelId":channelId,"manualEnterPlate":manualEnterPlate,"tmpInsertIds":tmpInsertIds};
        return dataSendToFront;
    },
    /**
     * 远程结算(含放行记录保存)
     */
    async remoteChargeWithSavePassRecord(plate,platePicturePath,carTypeId,area,channel,gt,user,passReason,manualEnterPlate,tmpInsertIds){
        let channelId = channel.channel_id;
        let now = new Date();
        let dataSendToFront = "";
        let dataJson = "";
        let device = await deviceModel.findById(channel.device1_id);
        let eventId = await eventTypeModel.getEventTypeManualPass();
        let carType = await carTypeModel.findById(carTypeId);
        //调用远程计费接口
        let chargeData = JSON.parse(await platformService.remoteCharge(plate,carTypeId,channel.device1_id,tmpInsertIds));

        //判断调用计费接口是否正常
        if(chargeData){
            switch (chargeData.rstId){
                case await platformService.getRemoteChargeStatusSuccess():
                    if(chargeData.object!=null){
                        //请交费
                        messageService.sendChargeMsg(device,plate,chargeData.object.payAmount.toString());
                        //查询入场照片
                        let enterImgPath = "";
                        if (chargeData.object.enterRecordId != null) {
                            let enterRecord = await enterExitRecordModel.findById(chargeData.object.enterRecordId);
                            if (enterRecord != null) {
                                enterImgPath = enterRecord.plate_picture_path;
                            }
                        }
                        //下发车辆类型列表
                        let carTypeList = await carTypeModel.findListByCategory(carType.category);
                        //是否允许切换车辆类型
                        let enabledChangeCarType = carType.category===await carTypeModel.getCarCategoryFixed()||carType.isCommunityOwner===await carTypeModel.getIsCommunityOwnerYes()?0:1;
                        //下发收款方式列表
                        let tradeTypeList = await tradeTypeModel.findAll();
                        dataSendToFront = {
                            "rstId": await localChargeModel.getChargeNeedPay(), "rstDesc": "gt",
                            "message": "需收费", "channelId": channel.channel_id, "passReason": "正常缴费",
                            "carTypeList":carTypeList,"enabledChangeCarType":enabledChangeCarType,"tradeTypeList":tradeTypeList,"plate": plate,"enterPlate":plate, "chargeData": chargeData, "enterImgPath": enterImgPath,"eventId":eventId
                        };
                        //请交费
                        messageService.sendChargeMsg(device,plate,chargeData.object.payAmount.toString());
                    }else{
                        dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":"远程计费返回异常"};
                    }
                    break;
                case await platformService.getRemoteChargeStatusOrderInvalid():
                    //请稍候
                    messageService.sendCommonMsg(device,plate,Message._104_PHRASE_WAIT,plate,Message._104_PHRASE_WAIT);
                    dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
                case await platformService.getRemoteChargeStatusNoEnterRecord():
                    //无入场记录
                    messageService.sendCommonMsg(device,plate,Message._115_PHRASE_NO_ENTER_RECORD,plate,Message._115_PHRASE_NO_ENTER_RECORD);
                    dataSendToFront = await this.noEnterRecordHandle(plate,carTypeId,channelId,manualEnterPlate,tmpInsertIds);
                    dataSendToFront.eventId = await eventTypeModel.getEventNoEnterRecord();
                    break;
                case await platformService.getRemoteChargeStatusFree():
                    //开闸
                    deviceService.openGate(channelId);
                    //祝您一路平安
                    messageService.sendCommonMsg(device,plate,Message._101_PHRASE_LEAVE_SAFELY,plate,Message._101_PHRASE_LEAVE_SAFELY);
                    //保存人工放行-出场记录
                    dataJson = {"parkingLotId":area!=null?area.parking_lot_id:null,"gtId":gt.gt_id,"parkingChannelId":channelId,
                        "exitType":await channelModel.getExitTypeOut(),"plate":plate,"passReason":passReason,
                        "passUserId":user.user_id,"passTime":now.toLocaleString(), "uploadTag":0,
                        "uploadTime":now.toLocaleString(),"uploadConfirmTime":null,"shiftWorkId":currentWork.shift_work_id};
                    await manualPassService.addAndUpload(dataJson);
                    //手动创建出场数据
                    await enterExitRecordService.addWithNoneMachine(channelId,plate,platePicturePath,carTypeId,channel.device1_id,tmpInsertIds,await channelModel.getExitTypeOut(),
                        await enterExitRecordModel.getPayTagUnpaid(),await enterExitRecordModel.getSourceManualPass(),eventId);
                    dataSendToFront = {"rstId":await localChargeModel.getChargeFree(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
                default:
                    dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
            }
        }else{
            dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":"调用远程计费接口失败，请重试!"};
        }
        return dataSendToFront;
    },
    /**
     * 重新调用远程接口进行计费
     */
    async recharge(plate,carTypeId,channel,manualEnterPlate,tmpInsertIds){
        let channelId = channel.channel_id;
        let device = await deviceModel.findById(channel.device1_id);
        let dataSendToFront = "";
        //调用远程计费接口
        let chargeData = JSON.parse(await platformService.remoteCharge(plate,carTypeId,channel.device1_id,tmpInsertIds));
        //判断调用计费接口是否正常
        if(chargeData){
            switch (chargeData.rstId){
                case await platformService.getRemoteChargeStatusSuccess():
                    dataSendToFront = {"rstId": await localChargeModel.getChargeNeedPay(), "rstDesc": "gt",
                        "message": "需收费", "chargeData": chargeData};
                    //请交费
                    messageService.sendChargeMsg(device,plate,chargeData.object.payAmount.toString());
                    break;
                case await platformService.getRemoteChargeStatusOrderInvalid():
                    dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
                case await platformService.getRemoteChargeStatusNoEnterRecord():
                    dataSendToFront = await this.noEnterRecordHandle(plate,carTypeId,channelId,manualEnterPlate,tmpInsertIds);
                    break;
                case await platformService.getRemoteChargeStatusFree():
                    dataSendToFront = {"rstId":await localChargeModel.getChargeFree(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
                default:
                    dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":chargeData.rstDesc};
                    break;
            }
        }else{
            dataSendToFront = {"rstId":await localChargeModel.getChargeError(),"rstDesc":"gt","message":"调用远程计费接口失败，请重试!"};
        }
        return dataSendToFront;
    },
    /**
     * 判断是否特殊车辆 TODO 需改为查询数据库
     */
    async isSpecialCar(plate){
        let specialPlate = ['警','军','WJ','使','领'];
        let preTwo = plate.substr(0,2);
        let sufOne = plate.substr(plate.length-1);
        if(specialPlate.indexOf&&typeof(specialPlate.indexOf)=='function'){
            var indexPreTwo = specialPlate.indexOf(preTwo);
            var indexSufOne = specialPlate.indexOf(sufOne);
            if(indexPreTwo >= 0 || indexSufOne>=0){
                return true;
            }
        }
        return false;
    },
    /**
     * 固定车权限检查
     */
    async fixedCarAuthorization(plate,channelId){
        let result = {
            enabledPass:false,   //是否允许通行
            daysRemaining:0      //剩余天数
        };
        //通道
        let channel = await channelModel.findById(channelId);
        if(channel){
            let device = await deviceModel.findById(channel.device1_id);
            let authorization = await plateAuthorizationModel.findByPlateAndExit(plate,channel.parking_exit_id);
            if(authorization){
                //计算剩余天数
                let endTime = authorization.end_time;
                let daysRemaining = Date.today().getDaysBetween(new Date(endTime));
                result.daysRemaining = daysRemaining;
                result.enabledPass = daysRemaining>=0;
            }
        }
        return result;
    },
    /**
     * 临时车权限检查
     */
    async tmpCarAuthorization(channelId){
        let result = {
            enabledPass:false    //是否允许通行
        };
        //通道是否允许临时车通行
        let channel = await channelModel.findById(channelId);
        if(channel && channel.parking_exit_id){
            result.enabledPass = await plateAuthorizationModel.findByPlateAndExit("",channel.parking_exit_id)!=null;
        }
        return result;
    }
};