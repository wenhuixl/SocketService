/**
 * Created by wenhui on 2018/6/26.
 * 重发数据到开放平台
 */

'use strict'

const global = require('../cache/globalVariables');
const OpenPlatformClient = require('../middleware/OpenPlatformClient');
const moment = require('moment');
const enterExitRecordModel = require('../models/enter_exit_record');
const shiftWorkModle = require('../models/shift_work');
const manualPassModle = require('../models/manual_pass');
const manualChargeModle = require('../models/manual_charge');

/**重新上传出入场记录*/
function reUploadEnterExitRecord() {
    enterExitRecordModel.selectByUploadTag(0).then(async function (list) { // 查询未上传记录
        let sendList = new Array();
        for(let i = 0; i < list.length; i++) {
            let sendData = { // 上传开放平台数据
                enterExitRecordId: list[i].enter_exit_record_id,
                passTime: moment(list[i].pass_time).format('YYYY-MM-DD HH:mm:ss'),
                plate: list[i].plate,
                enterExitStatus: list[i].enter_exit_status,
                deviceId: list[i].device_id,
                channelId: list[i].channel_id
            }
            await sendList.push(sendData);
        }
        global.getConfig().then(function (config) {
            let content = {
                devCode: config.gateway_id,
                compId: config.comp_id,
                data: sendList, // [{enterExitRecordId:进出场ID,passTime: “进/出时间”,plate: “车牌”,enterExitStatus: “出入场状态”,deviceId: 设备ID,channelId：通道ID}]
                sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
            }
            if(content.data.length > 0) { // 数据不为空上传开放平台
                OpenPlatformClient.SendData(4901, '111111111111', 1, 1, content);
            }
        })
    });
};

/**重新上传换班记录*/
function reUploadShiftWork() {
    shiftWorkModle.selectByUploadTag(1,0).then(async function (list) {
        let sendList = new Array();
        for(let i = 0; i < list.length; i++) {
            let sendData = { // 上传开放平台数据
                shiftWorkId: list[i].shift_work_id,
                gtID: list[i].gt_id,
                startTime: moment(list[i].start_time).format('YYYY-MM-DD HH:mm:ss'),
                endTime: moment(list[i].end_time).format('YYYY-MM-DD HH:mm:ss'),
                onDutyUserId: list[i].on_duty_user_id,
                pettyCash: list[i].petty_cash,
                turnover: list[i].turnover,
                amountsTotal: list[i].amounts_total,
                amountsActual: list[i].amounts_actual,
                comments: list[i].comments,
                isAutoShift: list[i].is_auto_shift
            }
            await sendList.push(sendData);
        }
        global.getConfig().then(function (config) {
            let content = {
                devCode: config.gateway_id,
                compId: config.comp_id,
                data: sendList,
                sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
            }
            if(content.data.length > 0) { // 数据不为空上传开放平台
                OpenPlatformClient.SendData(4902, '111111111111', 1, 1, content);
            }
        })
    });
};

/**重新上传人工放行记录*/
function reUploadManualPass() {
    manualPassModle.selectByUploadTag(0).then(async function (list) {
        let sendList = new Array();
        for(let i = 0; i < list.length; i++) {
            let sendData = { // 上传开放平台数据
                manualPassId: list[i].manual_pass_id,
                parkingLotId: list[i].parking_lot_id,
                gtID: list[i].gt_id,
                parkingChannelID: list[i].parking_channel_id,
                exitType: list[i].exit_type,
                plate: list[i].plate,
                passReason: list[i].pass_reason,
                passUserId: list[i].pass_user_id,
                passTime: moment(list[i].pass_time).format('YYYY-MM-DD HH:mm:ss'),
                shiftWorkId: list[i].shift_work_id
            }
            await sendList.push(sendData);
        }
        global.getConfig().then(function (config) {
            let content = {
                devCode: config.gateway_id,
                compId: config.comp_id,
                data: sendList,
                sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
            }
            if(content.data.length > 0) { // 数据不为空上传开放平台
                OpenPlatformClient.SendData(4903, '111111111111', 1, 1, content);
            }
        })
    });
};

/**重新上传人工放行记录*/
function reUploadManualCharge() {
    manualChargeModle.selectByUploadTag(0).then(async function (list) {
        let sendList = new Array();
        for(let i = 0; i < list.length; i++) {
            let sendData = { // 上传开放平台数据
                manualChargeId: list[i].manual_charge_id,
                gtID: list[i].gt_id,
                plate: list[i].plate,
                carTypeId: list[i].car_type_id,
                amountsReceivable: list[i].amounts_receivable,
                amountsReceived: list[i].amounts_received,
                tradeTypeId: list[i].trade_type_id,
                billCode: list[i].bill_code,
                orderState: list[i].order_state,
                stayTime: list[i].stay_time,
                enterRecordId: list[i].enter_record_id,
                chargeUserId: list[i].charge_user_id,
                chargeTime: moment(list[i].charge_time).format('YYYY-MM-DD HH:mm:ss'),
                shiftWorkId: list[i].shift_work_id,
                manualPassId: list[i].manual_pass_id
            }
            await sendList.push(sendData);
        }
        global.getConfig().then(function (config) {
            let content = {
                devCode: config.gateway_id,
                compId: config.comp_id,
                data: sendList,
                sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
            }
            if(content.data.length > 0) { // 数据不为空上传开放平台
                OpenPlatformClient.SendData(4904, '111111111111', 1, 1, content);
            }
        })
    });
};

module.exports = {
    reUploadEnterExitRecord: reUploadEnterExitRecord,
    reUploadShiftWork: reUploadShiftWork,
    reUploadManualPass: reUploadManualPass,
    reUploadManualCharge: reUploadManualCharge
}