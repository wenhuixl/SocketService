/**
 * Created by @Evenlai on 2018/06/28.
 */
const moment = require('moment');
const global = require('../cache/globalVariables');
const enterExitRecordModel = require('../models/enter_exit_record');
const enterExitRecordTmpModel = require('../models/enter_exit_record_tmp');
const enterExitRecordService = require('../service/enter_exit_record');
const openPlatformClient = require('../middleware/OpenPlatformSendData');
const channelModel = require('../models/channel');
const exitModel = require('../models/exit');
const areaModel = require('../models/area');
const DBModel = require('../models/DBModel');
const evenTypeModel = require('../models/event_type');

module.exports = {
    //保存并上传
    async addAndUpload(parkingEnterExitRecord){
        let insertId = await enterExitRecordModel.add(parkingEnterExitRecord);

        let sendList = new Array();
        let sendData = { // 上传开放平台数据
            enterExitRecordId: insertId,
            passTime: parkingEnterExitRecord.pass_time,
            plate: parkingEnterExitRecord.plate,
            enterExitStatus: parkingEnterExitRecord.enter_exit_status,
            carTypeId:parkingEnterExitRecord.car_type_id,
            deviceId: parkingEnterExitRecord.device_id,
            channelId: parkingEnterExitRecord.channel_id,
            payTag: parkingEnterExitRecord.pay_tag,
            source: parkingEnterExitRecord.source,
            eventId:parkingEnterExitRecord.event_id
        };
        await sendList.push(sendData);
        await this.uploadEnterExitRecord(sendList); // 上传进出场数据

        return insertId;
    },
    async uploadEnterExitRecord(sendList) { // 上传进出场数据
        let config = await global.getConfig();
        let content = {
            devCode: config.gateway_id,
            compId: config.comp_id,
            data: sendList, // [{enterExitRecordId:进出场ID,passTime: “进/出时间”,plate: “车牌”,enterExitStatus: “出入场状态”,deviceId: 设备ID,channelId：通道ID}]
            sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
        };
        console.log('uploadEnterExitRecord: ', content);
        openPlatformClient.SendData(4901, '111111111111', 1, 1, content);
    },
    //非机器识别记录
    async addWithNoneMachine(channelId,plate,platePicturePath,carTypeId,deviceId,tmpIds,enterExitStatus,payTag,source,eventId){
        let channel = await channelModel.findById(channelId);
        let exit = await exitModel.findById(channel.parking_exit_id);
        let area = exit!=null?await areaModel.findById(exit.parking_area_id):null;
        let now = new Date();
        let tmpId = tmpIds!=null?tmpIds[0]:null;
        let parkingEnterExitRecord = null;
        if(tmpId){
            let enterExitRecordTmp = enterExitRecordModel.findById(tmpId);
            //保存车牌数据并上传
            let enterExitRecordId = "";
            let passTime = moment(new Date(enterExitRecordTmp.pass_time)).format('YYYY-MM-DD HH:mm:ss');     // 进/出时间
            let plate = enterExitRecordTmp.plate;                                 // 车牌
            let platePicturePath = enterExitRecordTmp.plate_picture_path;         // 车牌图片路径
            let enterExitStatus = enterExitRecordTmp.enter_exit_status;           // 出入场状态
            let deviceId = enterExitRecordTmp.device_id;                          // 设备id
            let channelId = enterExitRecordTmp.channel_id;                        // 通道id
            let parkingExitId = enterExitRecordTmp.parking_exit_id;               // 进出口id
            let parkingAreaId = enterExitRecordTmp.parking_area_id;               // 车场区域id
            let parkingPlotId = enterExitRecordTmp.parking_plot_id;               // 车场id
            let uploadTag = enterExitRecordTmp.upload_tag;                        // 上传标记
            let uploadTime=  moment(new Date(enterExitRecordTmp.upload_time)).format('YYYY-MM-DD HH:mm:ss');  // 上传时间
            let uploadConfirmTime = enterExitRecordTmp.upload_confirm_time;       // 上传确认时间
            // let payTag = enterExitRecordModel.getPayTagPaid();                    // 支付标记
            // let source = enterExitRecordTmp.source;                                // 数据来源
            eventId = enterExitRecordTmp.event_id;                                // 事件类型
            let parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
            enterExitRecordTmpModel.deleteByIds(tmpIds);
        }else{  //无临时数据
            let enterExitRecordId = "";
            let passTime = moment(new Date(now)).format('YYYY-MM-DD HH:mm:ss');  // 进/出时间
            //抓图保存 TODO
            let platePicturePath = "";                                            // 车牌图片路径
            let parkingExitId = exit!=null?exit.exit_id:null;                    // 进出口id
            let parkingAreaId = area!=null?area.area_id:null;                    // 车场区域id
            let parkingPlotId = area!=null?area.parking_lot_id:null;             // 车场id
            let uploadTag = 0;                                                    // 上传标记
            let uploadTime = moment(new Date(now)).format('YYYY-MM-DD HH:mm:ss');// 上传时间
            let uploadConfirmTime = null;                                        // 上传确认时间
            // let payTag = enterExitRecordModel.getPayTagPaid();                    // 支付标记
            // let source = enterExitRecordModel.getSourceOpenGateCommand()          // 数据来源
            parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);
        }

        //保存车牌数据并上传
        await this.addAndUpload(parkingEnterExitRecord);
    }
};