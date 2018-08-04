/**
 * Created by wenbin on 2018/06/25.
 */
const request = require('request');
const moment = require('moment');
const POPConfig = require('../config/POPConfig');
let global = require('../cache/globalVariables');
const manualChargeModel = require('../models/manual_charge');
const enterExitRecordTmpModel = require('../models/enter_exit_record_tmp');
const enterExitRecordModel = require('../models/enter_exit_record');
const DBModel = require('../models/DBModel');
const enterExitRecordService = require('../service/enter_exit_record');
const manualPassService = require('../service/manual_pass');
const channelModel = require('../models/channel');
const eventTypeModel = require('../models/event_type');

module.exports = {
    //新增并上传至开放平台
    async addAndUpload(dataJson){
        let manualChargeId = await manualChargeModel.add(dataJson);
        //上传数据到开放平台
        let sendData = {
            manualChargeId: manualChargeId,
            gtID: dataJson.gtId,
            plate: dataJson.plate,
            carTypeId: dataJson.carTypeId,
            amountsReceivable: dataJson.amountsReceivable,
            amountsReceived: dataJson.amountsReceived,
            tradeTypeId: dataJson.tradeTypeId,
            billCode: dataJson.billCode,
            orderState: dataJson.orderState,
            stayTime: dataJson.stayTime,
            enterRecordId: dataJson.enterRecordId,
            chargeUserId: dataJson.chargeUserId,
            chargeTime: dataJson.chargeTime,
            shiftWorkId: dataJson.shiftWorkId,
            manualPassId: dataJson.manualPassId,
            manualEnterPlate:dataJson.manualEnterPlate,
            enterPlate:dataJson.enterPlate
        };
        await manualChargeModel.upload(sendData);
        return manualChargeId;
    },
    //收费确认
    async chargeConfirm(gt,user,currentWork,tmpInsertIds,newCarTypeId,rgfxDataJson,rgsfDataJson,now,channel,exit,area,eventId){
        let config = await global.getConfig();
        //上报平台
        if(rgsfDataJson.billCode){
            request({
                url: POPConfig.API_PAYINFO,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "x-www-form-urlencoded",
                },
                body: {"billCode":rgsfDataJson.billCode,"compid":config.comp_id,"fromType":"manual","userid":gt.gt_id}
            }, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log(body) // 请求成功的处理逻辑
                }
            });
        }
        //查询临时保存车牌数据
        let enterExitRecordTmpList = await enterExitRecordTmpModel.findByIds(tmpInsertIds);
        if(enterExitRecordTmpList!=null && enterExitRecordTmpList.length>0){
            //出场只有1条记录（非门中门）
            let enterExitRecordTmp = enterExitRecordTmpList[0];
            //保存车牌数据并上传
            let enterExitRecordId = "";
            let passTime = moment(new Date(enterExitRecordTmp.pass_time)).format('YYYY-MM-DD HH:mm:ss');     // 进/出时间
            let plate = enterExitRecordTmp.plate;                                 // 车牌
            let platePicturePath = enterExitRecordTmp.plate_picture_path;         // 车牌图片路径
            let enterExitStatus = enterExitRecordTmp.enter_exit_status;           // 出入场状态
            let carTypeId = newCarTypeId;                                         // 车辆类型id
            let deviceId = enterExitRecordTmp.device_id;                          // 设备id
            let channelId = enterExitRecordTmp.channel_id;                        // 通道id
            let parkingExitId = enterExitRecordTmp.parking_exit_id;               // 进出口id
            let parkingAreaId = enterExitRecordTmp.parking_area_id;               // 车场区域id
            let parkingPlotId = enterExitRecordTmp.parking_plot_id;               // 车场id
            let uploadTag = enterExitRecordTmp.upload_tag;                        // 上传标记
            let uploadTime=  moment(new Date(enterExitRecordTmp.upload_time)).format('YYYY-MM-DD HH:mm:ss');  // 上传时间
            let uploadConfirmTime = enterExitRecordTmp.upload_confirm_time;       // 上传确认时间
            let payTag = await enterExitRecordModel.getPayTagPaid();             // 支付标记
            let source = enterExitRecordTmp.source;                               // 数据来源
            eventId = enterExitRecordTmp.event_id;                                // 事件类型
            let parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
            await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
            //删除临时数据
            enterExitRecordTmpModel.deleteByIds(tmpInsertIds);
        }else{
            //保存车牌数据并上传
            let enterExitRecordId = "";
            let passTime = moment(new Date(now)).format('YYYY-MM-DD HH:mm:ss');     // 进/出时间
            let plate = rgfxDataJson.plate;                                         // 车牌
            let platePicturePath = "";                                              // 车牌图片路径 TODO 抓图保存
            let enterExitStatus = rgfxDataJson.exitType;                            // 出入场状态
            let carTypeId = rgsfDataJson.carTypeId;                                 // 车辆类型id
            let deviceId = channel.device1_id;                                      // 设备id
            let channelId = channel.channel_id;                                     // 通道id
            let parkingExitId = exit==null?null:exit.exit_id;                      // 进出口id
            let parkingAreaId = area==null?null:area.area_id;                      // 车场区域id
            let parkingPlotId = area==null?null:area.parking_lot_id;               // 车场id
            let uploadTag = 0;                                                      // 上传标记
            let uploadTime=  moment(new Date(now)).format('YYYY-MM-DD HH:mm:ss');   // 上传时间
            let uploadConfirmTime = null;                                           // 上传确认时间
            let payTag = await enterExitRecordModel.getPayTagPaid();                // 支付标记
            let source = await enterExitRecordModel.getSourceManualPass();          // 数据来源-人工放行
            //let eventId = await eventTypeModel.getEventTypeManualPass();            // 事件类型-人工开闸
            let parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
            await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
        }
        //保存人工放行、收费记录
        rgsfDataJson.manualPassId = await manualPassService.addAndUpload(rgfxDataJson);
        await this.addAndUpload(rgsfDataJson);
    }
};