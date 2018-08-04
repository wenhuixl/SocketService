/**
 * Created by @Evenlai on 2018/06/25.
 */
const moment = require('moment');
const enterExitRecordService = require('../service/enter_exit_record');
const manualPassModel = require('../models/manual_pass');
const enterExitRecordTmpModel = require('../models/enter_exit_record_tmp');
const DBModel = require('../models/DBModel');

module.exports = {
    async addAndUpload(dataJson){
        let manualPassId = await manualPassModel.add(dataJson);
        //上传数据到开放平台
        let sendData = {
            manualPassId: manualPassId,
            parkingLotId: dataJson.parkingLotId,
            gtID: dataJson.gtId,
            parkingChannelID: dataJson.parkingChannelId,
            exitType: dataJson.exitType,
            plate: dataJson.plate,
            passReason: dataJson.passReason,
            passUserId: dataJson.passUserId,
            passTime: dataJson.passTime,
            shiftWorkId: dataJson.shiftWorkId
        };
        await manualPassModel.upload(sendData);
        return manualPassId;
    },
    //确认放行
    async passConfirm(gt,user,currentWork,tmpInsertIds,newCarTypeId){

        let dataJson = "";
        //查询临时保存车牌数据
        let enterExitRecordTmpList = await enterExitRecordTmpModel.findByIds(tmpInsertIds);

        if(enterExitRecordTmpList==null || enterExitRecordTmpList.length===0){
            return;
        }

        let enterExitRecordId = "";
        let now = new Date();
        for(let i=0;i<enterExitRecordTmpList.length;i++){
            let enterExitRecordTmp = enterExitRecordTmpList[i];
            //保存车牌数据并上传
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
            let payTag = enterExitRecordTmp.pay_tag;                              // 支付标记
            let source = enterExitRecordTmp.source;                               // 数据来源
            let eventId = enterExitRecordTmp.event_id;                            // 事件类型
            let parkingEnterExitRecord = new DBModel.ParkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId);

            await enterExitRecordService.addAndUpload(parkingEnterExitRecord);
            //保存人工放行
            dataJson = {"parkingLotId":parkingPlotId,"gtId":gt.gt_id,"parkingChannelId":channelId,
                "exitType":enterExitStatus,"plate":plate,"passReason":"正常确认放行",
                "passUserId":user.user_id,"passTime":now.toLocaleString(), "uploadTag":0,
                "uploadTime":now.toLocaleString(),"uploadConfirmTime":null,"shiftWorkId":currentWork.shift_work_id};
            //保存到数据库并上传至开放平台
            await this.addAndUpload(dataJson);
        }

        //删除临时数据
        await enterExitRecordTmpModel.deleteByIds(tmpInsertIds);
    }
};