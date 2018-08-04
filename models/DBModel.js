/**
 * Created by wenhui on 2018/6/22.
 * 数据库对象
 */

/**进出场记录*/
function parkingEnterExitRecord(enterExitRecordId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId) {
    this.enter_exit_record_id = enterExitRecordId,      // 进出场id
    this.pass_time = passTime,                          // 进/出时间
    this.plate = plate,                                 // 车牌
    this.plate_picture_path = platePicturePath,         // 车牌图片路径
    this.enter_exit_status = enterExitStatus,           // 出入场状态
    this.car_type_id = carTypeId,                       //车辆类型id
    this.device_id = deviceId,                          // 设备id
    this.channel_id = channelId,                        // 通道id
    this.parking_exit_id = parkingExitId,               // 进出口id
    this.parking_area_id = parkingAreaId,               // 车场区域id
    this.parking_plot_id = parkingPlotId,               // 车场id
    this.upload_tag = uploadTag,                        // 上传标记
    this.upload_time= uploadTime,                       // 上传时间
    this.upload_confirm_time = uploadConfirmTime,        // 上传确认时间
    this.pay_tag = payTag,                               // 支付标记：00000000-未支付，00000001-已支付
    this.source = source,                                // 数据来源
    this.event_id = eventId                              //事件类型id
}

function parkingEnterExitRecordTmp(enterExitRecordTmpId, passTime, plate, platePicturePath, enterExitStatus, carTypeId, deviceId, channelId, parkingExitId, parkingAreaId, parkingPlotId, uploadTag, uploadTime, uploadConfirmTime,payTag,source,eventId) {
    this.enter_exit_record_tmp_id = enterExitRecordTmpId,      // 进出场id
        this.pass_time = passTime,                          // 进/出时间
        this.plate = plate,                                 // 车牌
        this.plate_picture_path = platePicturePath,         // 车牌图片路径
        this.enter_exit_status = enterExitStatus,           // 出入场状态
        this.car_type_id = carTypeId,                       //车辆类型id
        this.device_id = deviceId,                          // 设备id
        this.channel_id = channelId,                        // 通道id
        this.parking_exit_id = parkingExitId,               // 进出口id
        this.parking_area_id = parkingAreaId,               // 车场区域id
        this.parking_plot_id = parkingPlotId,               // 车场id
        this.upload_tag = uploadTag,                        // 上传标记
        this.upload_time= uploadTime,                       // 上传时间
        this.upload_confirm_time = uploadConfirmTime,        // 上传确认时间
        this.pay_tag = payTag,                               // 支付标记：00000000-未支付，00000001-已支付
        this.source = source,                                // 数据来源
        this.event_id = eventId                              //事件类型id
}

module.exports = {
    ParkingEnterExitRecord: parkingEnterExitRecord,
    ParkingEnterExitRecordTmp: parkingEnterExitRecordTmp
};
