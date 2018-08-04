const mysql = require('../middleware/MySQLPool');
const global = require('../cache/globalVariables');
const moment = require('moment');
const openPlatform = require('../middleware/OpenPlatformSendData');

module.exports = {
    //根据Id查询记录
    async findById(shiftWorkId){
        return await mysql.table('parking_shift_work').where({shift_work_id:shiftWorkId}).find().then(function (data) {
            return data.shift_work_id!=null?data:null;
        });
    },
    async findByGtAndShiftTag(gtId,shiftTag){
        return await mysql.table('parking_shift_work').order('start_time desc').where({gt_id:gtId,shift_tag:shiftTag,_logic:'AND'}).find().then(function (data) {
            return data.shift_work_id!=null?data:null;
        });
    },
    async findByGtAndUserAndShiftTag(gtId,userId,shiftTag){
        return await mysql.table('parking_shift_work').order('start_time desc').where({gt_id:gtId,on_duty_user_id:userId,shift_tag:shiftTag,_logic:'AND'}).find().then(function (data) {
            return data.shift_work_id!=null?data:null;
        });
    },
    //新增
    async add(dataJson) {
        var dataToSql = {
            gt_id:dataJson.gtId,
            start_time:dataJson.startTime,
            end_time:dataJson.endTime,
            on_duty_user_id:dataJson.onDutyUserId,
            petty_cash:dataJson.pettyCash,
            turnover:dataJson.turnover,
            amounts_total:dataJson.amountsTotal,
            amounts_actual:dataJson.amountsActual,
            comments:dataJson.comments,
            is_auto_shift:dataJson.isAutoShift,
            shift_tag:dataJson.shiftTag,
            upload_tag:dataJson.uploadTag,
            upload_time:dataJson.uploadTime,
            upload_confirm_time:dataJson.uploadConfirmTime
        };
        return await mysql.table('parking_shift_work').add(dataToSql).then(function (insertId) {
            //如果插入成功，返回插入的id
            return insertId;
        }).catch(function (err) {
            //插入失败，err为具体的错误信息
            console.log(err);
        });
    },
    //交班
    async shift(dataJson){
        var dataToSql = {
            shift_work_id:dataJson.shiftWorkId,
            end_time:dataJson.endTime,
            petty_cash:dataJson.pettyCash,
            turnover:dataJson.turnover,
            amounts_total:dataJson.amountsTotal,
            amounts_actual:dataJson.amountsActual,
            is_auto_shift:dataJson.isAutoShift,
            shift_tag:dataJson.shiftTag,
            upload_time:dataJson.uploadTime
        };
        return await mysql.table('parking_shift_work').where({shift_work_id:dataJson.shiftWorkId}).update(dataToSql).then(function (affectRows) {
            //如果更新成功，返回影响的行数
            return affectRows;
        }).catch(function (err) {
            //更新失败，err为具体的错误信息
            console.log(err);
        });
    },
    //将命令写入数据库，融合了插入与更新
    async save(DataJson) {
        var data = DataJson.data;
        var IDRep = {shift_work_id:data.shiftWorkId};
        var dataToSql = {
            shift_work_id:data.shiftWorkId,
            gt_id:data.gtId,
            start_time:data.startTime,
            end_time:data.endTime,
            on_duty_user_id:data.onDutyUserId,
            petty_cash:data.pettyCash,
            turnover:data.turnover,
            amounts_total:data.amountsTotal,
            amounts_actual:data.amountsActual,
            comments:data.comments,
            is_auto_shift:data.isAutoShift,
            upload_time:DataJson.sendtime
        }
        mysql.table('parking_shift_work').thenAdd(dataToSql,IDRep);
        mysql.table('parking_shift_work').where(IDRep).update(dataToSql);
    },
    //发送数据到平台
    async upload(dataJson) {
        let dataList = new Array();
        let data = {
            shiftWorkId: dataJson.shiftWorkId,
            gtID: dataJson.gtID,
            startTime: moment(dataJson.startTime).format('YYYY-MM-DD HH:mm:ss'),
            endTime: moment(dataJson.endTime).format('YYYY-MM-DD HH:mm:ss'),
            onDutyUserId: dataJson.onDutyUserId,
            pettyCash: dataJson.pettyCash,
            turnover: dataJson.turnover,
            amountsTotal: dataJson.amountsTotal,
            amountsActual: dataJson.amountsActual,
            comments: dataJson.comments,
            isAutoShift: dataJson.isAutoShift
        }
        dataList.push(data);

        let config = await global.getConfig();

        let content = {
            compId:config.comp_id,    //小区组织ID
            devCode:config.gateway_id,   //网关ID
            data: dataList, //[{shiftWorkId:换班ID,gtID: 岗亭ID,startTime: “上班时间”,endTime: “下班时间”,onDutyUserId:“值班人id”,pettyCash:备用金,turnover:营业额,amountsTotal:总金额,amountsActual:实际金额,comments: “备注”,isAutoShift:是否自动交班   //0-否，1-是}]
            sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
        }
        console.log('uploadShiftWork: ', content);
        openPlatform.SendData(4902, '111111111111', 1, 1, content);
    },
    //确认数据是否成功上传
    async updateConfirm(DataJson){
        let data = DataJson.data;
        for (let i = 0; i < data.length; i++) {
            let IDRep = {shift_work_id: data[i].shiftWorkId};
            let dataToSql = {
                shift_work_id: data[i].shiftWorkId,
                upload_tag: data[i].status,
                upload_confirm_time: DataJson.sendtime,
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            await mysql.table('parking_shift_work').where(IDRep).update(dataToSql);
        }
    },
    async deleteBeforeDate(time){     //传入Date样式如：2018-04-05
        await mysql.table('parking_shift_work').where({upload_time: {'<':time}, upload_tag: 1, _logic: 'AND'}).delete().then(function (affectRow) {
            console.log('删除了 ' +affectRow+ ' 条换班记录');
        });
    },
    //  根据上传状态查询记录
    async selectByUploadTag(shiftTag, uploadTag) {
        return mysql.table('parking_shift_work').where({shift_tag: shiftTag, upload_tag: uploadTag}).select().then(function (data) {
            return data;
        });
    }
}