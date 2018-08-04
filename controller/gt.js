
/**
 * Created by @Evenlai on 2018/06/14.
 */
const express = require('express');
const router = express.Router();
const logger = require('../utils/logUtil').getLogger('gt');
const channelModel = require('../models/channel');
const exitModel = require('../models/exit');
const areaModel = require('../models/area');
const shiftWorkModel = require('../models/shift_work');
const shiftWorkService = require('../service/shift_work');
const manualPassService = require('../service/manual_pass');
const manualChargeModel = require('../models/manual_charge');
const manualChargeService = require('../service/manual_charge');
const deviceModel = require('../models/device');
const deviceService = require('../service/device');
const moment = require('moment');
const global = require('../cache/globalVariables');
const localChargeService = require('../service/local_charge');
const carTypeModel = require('../models/car_type');
const carTypeService = require('../service/car_type');
const tradeTypeModel = require('../models/trade_type');
const enterExitRecordModel = require('../models/enter_exit_record');
const enterExitRecordTmpModel = require('../models/enter_exit_record_tmp');
const enterExitRecordService = require('../service/enter_exit_record');
const ServerConfig = require('../config/ServerConfig');
const Message = require('../models/Message');
const messageService = require('../service/message');
const blackWhiteListModel = require('../models/black_white_list');
const plateformService = require('../service/plateform');
const httpUtil = require('../utils/httpUtil');
const tradeModel = require('../models/trade');
const eventTypeModel = require('../models/event_type');
const localChargeModel = require('../models/local_charge');

/**
 * 获取岗亭信息
 */
router.get('/info.do',async function(req, res)  {
    //是否岗亭
    let isGt = 0;
    //当前岗亭
    let gt = await req.session.currentGt;
    let user = await req.session.currentUser;
    let config = await global.getConfig();
    let currentWork;
    if(gt!=null){
        isGt = 1;
    }
    //如果客户端是岗亭，则查询改岗亭相关的信息
    if(isGt === 1){
        //防止出现一个岗亭多个用户同时登录情况
        currentWork = await shiftWorkModel.findByGtAndShiftTag(gt.gt_id,0);
        let now = new Date();
        let dataJsonAdd = {
            "gtId":gt.gt_id,"startTime":now.toLocaleString(),
            "endTime":null,"onDutyUserId":user.user_id,
            "pettyCash":0.00,"turnover":0.00,
            "amountsTotal":0.00,"amountsActual":0.00,
            "comments":"","isAutoShift":0,
            "shiftTag":0,"uploadTag":0,
            "uploadTime":null,"uploadConfirmTime":null
        };
        //如果都已交班或是第一条数据
        if(currentWork == null || currentWork.on_duty_user_id==null){
            await shiftWorkModel.add(dataJsonAdd);
        }else{
            if(currentWork.on_duty_user_id != user.user_id){
                //上一班是其他用户时自动换班
                //统计营业额
                let turnover = await manualChargeModel.sumAmountsByShiftWorkId(currentWork.shift_work_id);
                turnover = turnover==null?0.00:turnover;
                let dataJsonUpdate = {
                    "shiftWorkId":currentWork.shift_work_id,
                    "endTime":now.toLocaleString(),
                    "pettyCash":0.00,
                    "turnover":turnover,
                    "amountsTotal":turnover,
                    "amountsActual":turnover,
                    "comments":"",
                    "isAutoShift":1,   //自动交班
                    "shiftTag":1,
                    "uploadTime":now.toLocaleString()
                };
                //自动换班
                await shiftWorkModel.shift(dataJsonUpdate);
                //上传交班记录到平台
                await shiftWorkService.uploadById(currentWork.shift_work_id);
                //新增换班记录
                await shiftWorkModel.add(dataJsonAdd);
                currentWork = await shiftWorkModel.findByGtAndShiftTag(gt.gt_id,0);
            }
        }
        //更新当前班次
        req.session.currentWork = currentWork;
        //查询上班时间
        let shiftWork = await shiftWorkModel.findByGtAndUserAndShiftTag(gt.gt_id,user.user_id,0);
        let workShiftTime = moment(shiftWork.start_time).format('YYYY-MM-DD HH:mm');
        //统计收费金额
        let amountsReceived = await manualChargeModel.sumAmountsByShiftWorkId(shiftWork.shift_work_id);
        let chargeAmounts = amountsReceived==null?0.00:amountsReceived;
        //查询可控制通道
        let channelList = await channelModel.findListByGlGtId(gt.gt_id);
        let exit = await exitModel.findById(gt.parking_exit_id);
        //所属区域
        let area = await areaModel.findById(exit.parking_area_id);
        //TODO 剩余车位
        let residualLotCountData = JSON.parse(await plateformService.residualLotCountMock());
        let residualLotCount = residualLotCountData.object.count;
        //服务器IP
        let serverIp = config.server_ip?config.server_ip:await httpUtil.get_server_ip();
        //websocket端口
        let websocketPort = config.websocket_port?config.websocket_port:ServerConfig.websocketPort;
        //返回数据到页面
        res.json({"rstId":200,"rstDesc":"","isGt":isGt,"gtName":gt.gt_name,"workShiftTime":workShiftTime,"chargeAmounts":chargeAmounts,"channelList":channelList,"areaName":area.area_name,"residualLotCount":residualLotCount,"serverIp":serverIp,"websocketPort":websocketPort});
    }else{
        res.json({"rstId":200,"rstDesc":"","isGt":isGt});
    }
});

/**
 * 获取付款方式列表
 */
router.get('/getTradeTypeList.do',async function(req, res)  {
    let tradeTypeList = await tradeTypeModel.findAll();
    res.json({"rstId":200,"rstDesc":"","tradeTypeList":tradeTypeList});
});

/**
 * 人工识别
 */
router.post('/manualRecognize.do',async function(req, res)  {
    //接收页面提交数据
    let channelId = req.body.channelId;
    let dataSendToFront = await deviceService.manualRecognize(channelId);
    res.json(dataSendToFront);
});

/**
 * 人工放行
 */
router.post('/manualPass.do',async function(req, res)  {
    //接收页面提交数据
    let plateSheng = req.body.plateSheng;
    let plate = req.body.plate;
    let plateFull = plateSheng+plate;
    let channelId = req.body.channelId;
    let passReason = req.body.passReason;
    let carType = await carTypeService.getCarType(plateFull,channelId);
    let carTypeId = req.body.carTypeId!=null?req.body.carTypeId:carType!=null?carType.carTypeId:"";
    let tmpInsertIds = req.body.tmpInsertIds;
    let manualEnterPlate = req.body.manualEnterPlate;
    let eventId = req.body.eventId;   //事件类型
    //当前岗亭
    let gt = req.session.currentGt;
    //当前用户
    let user = req.session.currentUser;
    //检查是否有其他用户登录当前岗亭
    let currentWork = req.session.currentWork;
    let newCurrentWork = await shiftWorkModel.findByGtAndShiftTag(gt.gt_id,0);
    if(newCurrentWork==null){
        res.json({"rstId":0,"rstDesc":"login","message":"当班已交班,请重新登录!"});
        return;
    }
    if(newCurrentWork.on_duty_user_id != currentWork.on_duty_user_id){
        res.json({"rstId":0,"rstDesc":"login","message":"其它用户已登录本岗亭,请重新登录后再进行操作!"});
        return;
    }
    //数据校验
    if(!plate || !channelId || !passReason){
        res.json({"rstId":0,"rstDesc":"gt","message":"车牌号码、放行通道、放行理由不能为空！"});
    }else{
        //根据通道性质进行不同处理
        let channel = await channelModel.findById(channelId);
        let device = await deviceModel.findById(channel.device1_id);
        let exit = await exitModel.findById(channel.parking_exit_id);
        let area = exit!=null?await areaModel.findById(exit.parking_area_id):null;
        let dataSendToFront = null;

        let inWhiteList = await blackWhiteListModel.inWhiteList(plateFull);
        let isSpecialCar = await localChargeService.isSpecialCar(plateFull);
        let inBlackList = await blackWhiteListModel.inBlackList(plateFull);
        //判断是否黑名单车辆
        if(inBlackList){
            res.json({"rstId":0,"rstDesc":"gt","message":"注意：该车辆已被列入黑名单,不允许放行!"});
            return;
        }

        if(channel!=null){
            //保存人工放行记录
            let now = new Date();
            let dataJson = "";
            let config = await global.getConfig();
            //未设置系统参数
            if(config==null){
                res.json({"rstId":0,"rstDesc":"gt","message":"请联系管理员设置系统初始化参数"});
                return;
            }

            //TODO 抓图保存
            let platePicturePath = "";

            //有门中门但未使用"门中门工作模式"
            if((config.mzm_mode === await global.getMzmModeNo()) && channel.sfmzm === await channelModel.getSfmzmYes()){
                res.json({"rstId":0,"rstDesc":"gt","message":"该通道是门中门,请联系管理员将系统切换成'门中门工作模式'或修改通道性质!"});
                return;
            }
            //门中门与非门中门区别处理
            if(channel.sfmzm === await channelModel.getSfmzmYes()){  //是门中门
                //开闸
                deviceService.openGate(channelId);
                //您好
                messageService.sendCommonMsg(device,plateFull,Message._102_PHRASE_HELLO,plateFull,Message._102_PHRASE_HELLO);
                //保存人工放行-出场记录
                dataJson = {"parkingLotId":channel.out_parking_lot_id,"gtId":req.session.currentGt.gt_id,"parkingChannelId":channelId,
                    "exitType":await channelModel.getExitTypeOut(),"plate":plateFull,"passReason":passReason,
                    "passUserId":req.session.currentUser.user_id,"passTime":now.toLocaleString(), "uploadTag":0,
                    "uploadTime":now.toLocaleString(),"uploadConfirmTime":null,"shiftWorkId":currentWork.shift_work_id};
                //保存到数据库并上传至开放平台
                await manualPassService.addAndUpload(dataJson);
                //手动创建出场数据
                await enterExitRecordService.addWithNoneMachine(channelId,plateFull,platePicturePath,carTypeId,channel.device1_id,tmpInsertIds,await channelModel.getExitTypeOut(),
                    await enterExitRecordModel.getPayTagUnpaid(),await enterExitRecordModel.getSourceManualPass(),eventId);
                //保存人工放行-入场记录
                dataJson = {"parkingLotId":channel.in_parking_log_id,"gtId":req.session.currentGt.gt_id,"parkingChannelId":channelId,
                    "exitType":await channelModel.getExitTypeIn(),"plate":plateFull,"passReason":passReason,
                    "passUserId":req.session.currentUser.user_id,"passTime":now.toLocaleString(), "uploadTag":0,
                    "uploadTime":now.toLocaleString(),"uploadConfirmTime":null,"shiftWorkId":currentWork.shift_work_id};
                await manualPassService.addAndUpload(dataJson);
                //手动创建入场数据
                await enterExitRecordService.addWithNoneMachine(channelId,plateFull,platePicturePath,carTypeId,channel.device1_id,tmpInsertIds,await channelModel.getExitTypeIn(),
                    await enterExitRecordModel.getPayTagUnpaid(),await enterExitRecordModel.getSourceManualPass(),eventId);
                res.json({"rstId":await localChargeModel.getChargeFree(),"rstDesc":"gt","message":"门中门放行"});
            }else if(channel.sfmzm === await channelModel.getSfmzmNo()){   //不是门中门
                if(channel.exit_type === await channelModel.getExitTypeIn()){  //入口
                    //开闸
                    deviceService.openGate(channelId);
                    if(inWhiteList || isSpecialCar){
                        //贵宾车入场
                        messageService.sendCommonMsg(device,plateFull,Message._98_PHRASE_WELCOME,plateFull,Message._140_PHRASE_VIPCAR_ENTER);
                    }else{
                        //欢迎光临
                        messageService.sendCommonMsg(device,plateFull,Message._98_PHRASE_WELCOME,plateFull,Message._98_PHRASE_WELCOME);
                    }
                    //保存人工放行-入场记录
                    dataJson = {"parkingLotId":area!=null?area.parking_lot_id:null,"gtId":req.session.currentGt.gt_id,"parkingChannelId":channelId,
                        "exitType":await channelModel.getExitTypeIn(),"plate":plateFull,"passReason":passReason,
                        "passUserId":req.session.currentUser.user_id,"passTime":now.toLocaleString(), "uploadTag":0,
                        "uploadTime":now.toLocaleString(),"uploadConfirmTime":null,"shiftWorkId":currentWork.shift_work_id};
                    await manualPassService.addAndUpload(dataJson);
                    //手动创建入场数据
                    await enterExitRecordService.addWithNoneMachine(channelId,plateFull,platePicturePath,carTypeId,channel.device1_id,tmpInsertIds,await channelModel.getExitTypeIn(),
                        await enterExitRecordModel.getPayTagUnpaid(),await enterExitRecordModel.getSourceManualPass(),eventId);
                    res.json({"rstId":await localChargeModel.getChargeFree(),"rstDesc":"gt","message":"入口"});
                }else if(channel.exit_type === await channelModel.getExitTypeOut()){  //出口
                    if(config.mzm_mode === await global.getMzmModeYes()){   //门中门模式交由云端计算
                        dataSendToFront = await localChargeService.remoteChargeWithSavePassRecord(plateFull,platePicturePath,carTypeId,area,channel,gt,user,passReason,manualEnterPlate,tmpInsertIds);
                        dataSendToFront.eventId = eventId;
                        res.json(dataSendToFront);
                    }else if(config.mzm_mode === await global.getMzmModeNo()){    //非门中门工作模式
                        let result = await localChargeService.check(config,plateFull,carTypeId,channel);
                        if(result === await localChargeModel.getChargeFree()){   //不需要支付
                            //开闸
                            deviceService.openGate(channelId);
                            //祝您一路平安
                            messageService.sendCommonMsg(device,plateFull,Message._101_PHRASE_LEAVE_SAFELY,plateFull,Message._101_PHRASE_LEAVE_SAFELY);
                            //保存人工放行-出场记录
                            dataJson = {"parkingLotId":area!=null?area.parking_lot_id:null,"gtId":req.session.currentGt.gt_id,"parkingChannelId":channelId,
                                "exitType":await channelModel.getExitTypeOut(),"plate":plateFull,"passReason":passReason,
                                "passUserId":req.session.currentUser.user_id,"passTime":now.toLocaleString(), "uploadTag":0,
                                "uploadTime":now.toLocaleString(),"uploadConfirmTime":null,"shiftWorkId":currentWork.shift_work_id};
                            //保存到数据库并上传至开放平台
                            await manualPassService.addAndUpload(dataJson);
                            //手动创建出场数据
                            await enterExitRecordService.addWithNoneMachine(channelId,plateFull,platePicturePath,carTypeId,channel.device1_id,tmpInsertIds,await channelModel.getExitTypeOut(),
                                await enterExitRecordModel.getPayTagUnpaid(),await enterExitRecordModel.getSourceManualPass(),eventId);
                            res.json({"rstId":await localChargeModel.getChargeFree(),"rstDesc":"gt","message":"不需要支付"});
                        } else if(result === await localChargeModel.getChargeNoEnterRecord()){   //无入场记录
                            //无入场记录
                            messageService.sendCommonMsg(device,plateFull,Message._115_PHRASE_NO_ENTER_RECORD,plateFull,Message._115_PHRASE_NO_ENTER_RECORD);
                            dataSendToFront = await localChargeService.noEnterRecordHandle(plateFull,carTypeId,channelId,manualEnterPlate,tmpInsertIds);
                            dataSendToFront.eventId = await eventTypeModel.getEventNoEnterRecord();
                            res.json(dataSendToFront);
                        }else if(result === await localChargeModel.getChargeNeedPay()){  //需要支付
                            dataSendToFront = await localChargeService.remoteChargeWithSavePassRecord(plateFull,platePicturePath,carTypeId,area,channel,gt,user,passReason,manualEnterPlate,tmpInsertIds);
                            dataSendToFront.eventId = eventId;
                            res.json(dataSendToFront);
                        }
                    }
                }
            }
        }
    }
});

/**
 * 人工收费
 */
router.post('/manualCharge.do',async function(req, res)  {
    //岗亭id
    let gt = req.session.currentGt;
    let user = req.session.currentUser;
    //当前班次
    let currentWork = req.session.currentWork;
    //通道id
    let channelId = req.body.channelId;
    //放行理由
    let passReason = req.body.passReason;
    //车牌
    let plate = req.body.plate;
    //车辆类型
    let tmpCarTypeList = await carTypeModel.findListByCategory(await carTypeModel.getCarCategoryTmp());
    let carTypeId = req.body.carTypeId==null?(tmpCarTypeList!=null&&tmpCarTypeList.length>0?tmpCarTypeList[0].car_type_id:""):req.body.carTypeId;
    //入场时间
    let enterTime = req.body.enterTime==null?null:req.body.enterTime;
    //出场时间
    let exitTime = req.body.exitTime==null?moment(new Date).format('YYYY-MM-DD HH:mm'):req.body.exitTime;
    //应收金额
    let amountsReceivable = req.body.amountsReceivable==null?0.00:req.body.amountsReceivable;
    //实收金额
    let amountsReceived = req.body.amountsReceived==null?0.00:req.body.amountsReceived;
    //收款方式
    let tradeTypeId = req.body.tradeTypeId;
    //云端临时车计费订单编号
    let billCode = req.body.billCode==null?"":req.body.billCode;
    //订单状态
    let orderState = req.body.orderState==null?"":req.body.orderState;
    //停留时长
    let stayTime = req.body.stayTime==null?0:req.body.stayTime;
    //入场记录id
    let enterRecordId = req.body.enterRecordId==null?null:req.body.enterRecordId;
    //临时车牌数据ids
    let tmpInsertIds = req.body.tmpInsertIds==null?null:req.body.tmpInsertIds;
    //是否人工录入车牌号
    let manualEnterPlate = req.body.manualEnterPlate;
    //进场车牌号
    let enterPlate = req.body.enterPlate;
    //事件类型
    let eventId = req.body.eventId;

    //开闸
    deviceService.openGate(channelId);

    //检查是否已在线支付
    if(billCode!=null && billCode!=""){
        let trade = await tradeModel.findByBillCode(billCode);
        if(trade){  //线上已支付
            res.json({"rstId":0,"rstDesc":"gt","message":"该车辆已在线完成支付"});
            return;
        }
    }

    //人工放行-出场记录
    let now = new Date();
    let channel = await channelModel.findById(channelId);
    let exit = await exitModel.findById(channel.parking_exit_id);
    let area = exit!=null?await areaModel.findById(exit.parking_area_id):null;
    let rgfxDataJson = {"parkingLotId":area!=null?area.parking_lot_id:null,"gtId":gt.gt_id,"parkingChannelId":channelId,
        "exitType":await channelModel.getExitTypeOut(),"plate":plate,"passReason":passReason,
        "passUserId":req.session.currentUser.user_id,"passTime":now.toLocaleString(), "uploadTag":0,
        "uploadTime":now.toLocaleString(),"uploadConfirmTime":null,"shiftWorkId":currentWork.shift_work_id};

    //人工收费记录
    let rgsfDataJson = {"gtId":gt.gt_id, "plate":plate,
        "carTypeId":carTypeId,"enterTime":enterTime,
        "exitTime":exitTime,"amountsReceivable":amountsReceivable,
        "amountsReceived":amountsReceived,"tradeTypeId":tradeTypeId,
        "billCode":billCode, "orderState":orderState,
        "stayTime":stayTime,"enterRecordId":enterRecordId,
        "chargeUserId":req.session.currentUser.user_id,"chargeTime":now.toLocaleString(),
        "uploadTag":0, "uploadTime":now.toLocaleString(),
        "uploadConfirmTime":null,"shiftWorkId":currentWork.shift_work_id,"manualEnterPlate":manualEnterPlate,"enterPlate":enterPlate};

    let device =await deviceModel.findById(channel.device1_id);
    //祝您一路平安
    messageService.sendCommonMsg(device,plate,Message._101_PHRASE_LEAVE_SAFELY,plate,Message._101_PHRASE_LEAVE_SAFELY);

    //转移临时数据、保存人工放行、收费记录
    await manualChargeService.chargeConfirm(gt,user,currentWork,tmpInsertIds,carTypeId,rgfxDataJson,rgsfDataJson,now,channel,exit,area,eventId);

    res.json({"rstId":200,"rstDesc":"gt"});
});

/**
 * 更换车辆类型重新计费
 */
router.post("/recharge.do",async function(req,res){
    let plate = req.body.plate;
    let carTypeId = req.body.carTypeId;
    let channelId = req.body.channelId;
    let manualEnterPlate = req.body.manualEnterPlate;
    let tmpInsertIds = req.body.tmpInsertIds;
    let channel = await channelModel.findById(channelId);
    let dataSendToFront = await localChargeService.recharge(plate,carTypeId,channel,manualEnterPlate,tmpInsertIds);
    res.json(dataSendToFront);
});

/**
 * 换班初始化
 */
router.post('/shiftWorkInit.do',async function(req, res)  {
    let gt = await req.session.currentGt;
    let user = await req.session.currentUser;

    if(gt==null){
        res.json({"rstId":0,"rstDesc":"gt",message:"您所登录的电脑不是岗亭!"});
        return;
    }

    let currentWork = await shiftWorkModel.findByGtAndShiftTag(gt.gt_id,0);
    let now = new Date();
    if(currentWork == null || currentWork.on_duty_user_id==null){
        res.json({"rstId":0,"rstDesc":"login","message":"当前岗亭已交班,请重新登录!"});
    }else{
        if(currentWork.on_duty_user_id != user.user_id){
            res.json({"rstId":0,"rstDesc":"login","message":"其他用户已登录当前岗亭，系统已自动交班!"});
        }else{
            //统计营业额
            let turnover = await manualChargeModel.sumAmountsByShiftWorkId(currentWork.shift_work_id);
            turnover = turnover==null?0.00:turnover;
            res.json({"rstId":200,"rstDesc":"gt",
                "workNumber":user.work_number,"userName":user.user_name,
                "startTime":moment(currentWork.start_time).format('YYYY-MM-DD HH:mm'),"endTime":now.toLocaleString(),
                "turnover":turnover
            });
        }
    }
});

/**
 * 换班确认
 */
router.post('/shiftWorkConfirm.do',async function(req, res)  {
    let gt = await req.session.currentGt;
    let user = await req.session.currentUser;
    let pettyCash = req.body.pettyCash;
    let turnover = req.body.turnover;
    let amountsActual = req.body.amountsActual;
    let comments = req.body.comments;

    if(gt==null){
        res.json({"rstId":0,"rstDesc":"gt",message:"您所登录的电脑不是岗亭!"});
        return;
    }

    //后端校验
    if(!turnover || !amountsActual){
        res.json({"rstId":0,"rstDesc":"gt",message:"所提交的换班数据不齐全!"});
        return;
    }

    //备用金不填时默认为0.00
    pettyCash = pettyCash===""?0.00:pettyCash;

    let currentWork = await shiftWorkModel.findByGtAndShiftTag(gt.gt_id,0);
    let now = new Date();
    if(currentWork == null){
        res.json({"rstId":0,"rstDesc":"login","message":"当前岗亭已交班,请重新登录!"});
    }else{
        if(currentWork.on_duty_user_id != user.user_id){
            res.json({"rstId":0,"rstDesc":"login","message":"其他用户已登录当前岗亭，系统已自动交班!"});
        }else{

            //统计营业额
            let amountsReceived = await manualChargeModel.sumAmountsByShiftWorkId(currentWork.shift_work_id);
            amountsReceived = amountsReceived==null?0.00:amountsReceived;
            if(amountsReceived != turnover){
                res.json({"rstId":0,"rstDesc":"gt","message":"营业额已变动，请重新开始换班操作!"});
            }

            //换班
            let dataJsonUpdate = {
                "shiftWorkId":currentWork.shift_work_id,
                "endTime":now.toLocaleString(),
                "pettyCash":pettyCash,
                "turnover":amountsReceived,
                "amountsTotal":Number(pettyCash)+Number(amountsReceived),
                "amountsActual":amountsActual,
                "comments":comments,
                "isAutoShift":0,   //手动交班
                "shiftTag":1,
                "uploadTime":now.toLocaleString()
            };
            //手动换班
            await shiftWorkModel.shift(dataJsonUpdate);
            //上传交班记录到平台
            await shiftWorkService.uploadById(currentWork.shift_work_id);

            //注销,跳转至登录页
            req.session.user = "";
            res.json({"rstId":200,"rstDesc":"login"});
        }
    }

});

/**
 * 确认放行(半人工)
 */
router.post('/passConfirm.do',async function(req, res)  {
    let gt = await req.session.currentGt;
    let user = await req.session.currentUser;
    //let action = req.body.action;
    let tmpInsertIds = req.body.tmpInsertIds;
    let plate = req.body.plate;
    let carTypeId = req.body.carTypeId;
    let channelId = req.body.channelId;
    let channel = await channelModel.findById(channelId);
    let device = await deviceModel.findById(channel.device1_id);

    if(gt==null){
        res.json({"rstId":0,"rstDesc":"gt",message:"您所登录的电脑不是岗亭!"});
        return;
    }

    //后端校验 TODO

    //开闸
    deviceService.openGate(channelId);

    if(channel.sfmzm === await channelModel.getSfmzmYes()){  //门中门
        //您好
        messageService.sendCommonMsg(device,plate,Message._102_PHRASE_HELLO,plate,Message._102_PHRASE_HELLO);
    }else if(channel.sfmzm === await channelModel.getSfmzmNo()){  //非门中门
        if(channel.exit_type === await channelModel.getExitTypeIn()){  //入口
            //欢迎光临
            messageService.sendCommonMsg(device,plate,Message._98_PHRASE_WELCOME,plate,Message._98_PHRASE_WELCOME);
        }else if(channel.exit_type === await channelModel.getExitTypeOut()){  //出口
            //祝您一路平安
            messageService.sendCommonMsg(device,plate,Message._101_PHRASE_LEAVE_SAFELY,plate,Message._101_PHRASE_LEAVE_SAFELY);
        }
    }
    //检查岗亭是否已交班
    let currentWork = await shiftWorkModel.findByGtAndShiftTag(gt.gt_id,0);
    if(currentWork == null){
        res.json({"rstId":0,"rstDesc":"login","message":"当前岗亭已交班,请重新登录!"});
    }else{
        if(currentWork.on_duty_user_id != user.user_id){
            res.json({"rstId":0,"rstDesc":"login","message":"其他用户已登录当前岗亭，系统已自动交班!"});
        }else{
            await manualPassService.passConfirm(gt,user,currentWork,tmpInsertIds,carTypeId);
            res.json({"rstId":200,"rstDesc":"gt",message:"闸门已打开，放行完成！"});
        }
    }
});

/**
 * 搜索近似车牌入场数据
 */
router.post('/search.do',async function(req, res)  {
    let searchPlate = req.body.searchPlate;
    let originalPlate = req.body.originalPlate;
    let channelId = req.body.channelId;
    let tmpInsertIds = req.body.tmpInsertIds;
    //查询系统设置的匹配度 TODO
    let similarityDegree = 4;
    //查找相近的入场数据(未出场)
    let lastEnterList = await enterExitRecordModel.findLastEnterListByPlateAndSimilarityDegree(searchPlate,similarityDegree,await channelModel.getExitTypeIn(),await channelModel.getExitTypeOut());
    if(lastEnterList){
        for(let i=0;i<lastEnterList.length;i++){
            lastEnterList[i].pass_time = moment(lastEnterList[i].pass_time).format('YYYY-MM-DD HH:mm:ss');
        }
    }
    res.json({"rstId":await localChargeModel.getChargeNoEnterRecord(),"rstDesc":"gt",
        "message":"近似车牌入场记录","searchPlate":searchPlate,"originalPlate":originalPlate,"channelId":channelId,"tmpInsertIds":tmpInsertIds,
        "lastEnterList":lastEnterList,"lastEnterListCount":lastEnterList==null?0:lastEnterList.length});
});

module.exports = router;