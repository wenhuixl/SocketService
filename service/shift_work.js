/**
 * Created by wenbin on 2018/06/25.
 */
const shiftWorkModel = require('../models/shift_work');
const global = require('../cache/globalVariables');
const moment = require('moment');

module.exports = {
    //上传指定id数据
    async uploadById(shiftWorkId){
        //上传交班记录到平台
        let shiftWork = await shiftWorkModel.findById(shiftWorkId);
        let sendData = {
            shiftWorkId: shiftWork.shift_work_id,
            gtID: shiftWork.gt_id,
            startTime: shiftWork.start_time,
            endTime: shiftWork.end_time,
            onDutyUserId: shiftWork.on_duty_user_id,
            pettyCash: shiftWork.petty_cash,
            turnover: shiftWork.turnover,
            amountsTotal: shiftWork.amounts_total,
            amountsActual: shiftWork.amounts_actual,
            comments: shiftWork.comments,
            isAutoShift: shiftWork.is_auto_shift
        };
        await shiftWorkModel.upload(sendData);
    }
};