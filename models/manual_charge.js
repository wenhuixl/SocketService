const mysql = require('../middleware/MySQLPool');
const global = require('../cache/globalVariables');
const moment = require('moment');
const openPlatform = require('../middleware/OpenPlatformSendData');

module.exports = {
    //根据Id查询命令
    async findById(RecordId){
        return await mysql.table('parking_manual_charge').where({manual_charge_id:RecordId,del_tag:0,_logic:'AND'}).find().then(function (data) {
            return data.manual_charge_id!=null?data:null;
        });
    },
    //新增
    async add(dataJson){
        var dataToSql = {
            gt_id:dataJson.gtId,
            plate:dataJson.plate,
            car_type_id:dataJson.carTypeId,
            enter_time:dataJson.enterTime,
            exit_time:dataJson.exitTime,
            amounts_receivable:dataJson.amountsReceivable,
            amounts_received:dataJson.amountsReceived,
            trade_type_id:dataJson.tradeTypeId,
            bill_code:dataJson.billCode,
            order_state:dataJson.orderState,
            stay_time:dataJson.stayTime,
            enter_record_id:dataJson.enterRecordId,
            charge_user_id:dataJson.chargeUserId,
            charge_time:dataJson.chargeTime,
            upload_tag:dataJson.uploadTag,
            upload_time:dataJson.uploadTime,
            upload_confirm_time:dataJson.uploadConfirmTime,
            shift_work_id:dataJson.shiftWorkId,
            manual_pass_id:dataJson.manualPassId,
            manual_enter_plate:dataJson.manualEnterPlate,
            enter_plate:dataJson.enterPlate
        };
        return await mysql.table('parking_manual_charge').add(dataToSql).then(function (insertId) {
            //如果插入成功，返回插入的id
            return insertId;
        }).catch(function (err) {
            //插入失败，err为具体的错误信息
            console.log(err);
        });
    },
    //按岗亭、用户统计收费金额
    async sumAmountsByGtAndUser(gtId,userId){
        return await mysql.table('parking_manual_charge').where({gt_id:gtId,charge_user_id:userId,_logic:'AND'}).sum('amounts_received').then(function (sum) {
            return sum;
        });
    },
    //按换班id统计收费金额
    async sumAmountsByShiftWorkId(shiftWorkId){
        return await mysql.table('parking_manual_charge').where({shift_work_id:shiftWorkId}).sum('amounts_received').then(function (sum) {
            return sum;
        });
    },
    //发送数据到平台
    async upload(dataJson) {
        let dataList = new Array();
        let data = {
            manualChargeId: dataJson.manualChargeId,
            gtID: dataJson.gtID,
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
            chargeTime: moment(dataJson.chargeTime).format('YYYY-MM-DD HH:mm:ss'),
            shiftWorkId: dataJson.shiftWorkId,
            manualPassId: dataJson.manualPassId,
            manualEnterPlate:dataJson.manualEnterPlate,
            enterPlate:dataJson.enterPlate
        }
        dataList.push(data);

        let config = await global.getConfig();

        let content = {
            compId:config.comp_id,    //小区组织ID
            devCode:config.gateway_id,   //网关ID
            data: dataList, //[{manualChargeId:人工收费ID,gtID: 岗亭ID,plate: “车牌”,carTypeId:车辆类型Id,amountsReceivable:应收金额,amountsReceived:实收金额,tradeTypeId：“收款方式ID”,billCode: “云端临时车计费订单编号”,orderState:“订单编号”,stayTime:停留时长,enterRecordId:入场记录id,chargeUserId: 收费人ID,chargeTime: “收费时间”,shiftWorkId:换班记录id,manualPassId:人工放行记录id}]
            sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
        }
        console.log('uploadManualCharge: ', content);
        openPlatform.SendData(4904, '111111111111', 1, 1, content);
    },
    //确认数据是否成功上传
    async updateConfirm(DataJson){
        let data = DataJson.data;
        for (let i = 0; i < data.length; i++) {
            let IDRep = {manual_charge_id: data[i].manualChargeId};
            let dataToSql = {
                manual_charge_id: data[i].manualChargeId,
                upload_tag: data[i].status,
                upload_confirm_time: DataJson.sendtime,
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            await mysql.table('parking_manual_charge').where(IDRep).update(dataToSql);
        }
    },
    async deleteBeforeDate(time){     //传入Date样式如：2018-04-05
        await mysql.table('parking_manual_charge').where({upload_time: {'<':time}, upload_tag: 1, _logic: 'AND'}).delete().then(function (affectRow) {
            console.log('删除了 ' +affectRow+ ' 条人工收费记录');
        });
    },
    //  根据上传状态查询记录
    async selectByUploadTag(uploadTag) {
        return mysql.table('parking_manual_charge').where({upload_tag: uploadTag}).select().then(function (data) {
            return data;
        });
    }
};