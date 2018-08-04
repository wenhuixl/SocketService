const mysql = require('../middleware/MySQLPool');
const global = require('../cache/globalVariables');
const moment = require('moment');
const openPlatform = require('../middleware/OpenPlatformSendData');

module.exports = {
    //根据Id查询命令
    async findById(RecordId){
        return await mysql.table('parking_manual_pass').where({manual_pass_id:RecordId,del_tag:0,_logic:'AND'}).find().then(function (data) {
            return data.manual_pass_id!=null?data:null;
        });
    },
    //新增
    async add(dataJson){
        var dataToSql = {
            gt_id:dataJson.gtId,
            parking_lot_id:dataJson.parkingLotId,
            parking_channel_id:dataJson.parkingChannelId,
            exit_type:dataJson.exitType,
            plate:dataJson.plate,
            pass_reason:dataJson.passReason,
            pass_user_id:dataJson.passUserId,
            pass_time:dataJson.passTime,
            upload_tag:0,
            upload_time:dataJson.uploadTime,
            upload_confirm_time:null,
            shift_work_id:dataJson.shiftWorkId
        };
        return await mysql.table('parking_manual_pass').add(dataToSql).then(function (insertId) {
            //如果插入成功，返回插入的id
            return insertId;
        }).catch(function (err) {
            //插入失败，err为具体的错误信息
            console.log(err);
        });
    },
    //发送数据到平台
    async upload(dataJson) {
        let dataList = new Array();
        let data = {
            manualPassId: dataJson.manualPassId,
            parkingLotId: dataJson.parkingLotId,
            gtID: dataJson.gtID,
            parkingChannelID: dataJson.parkingChannelID,
            exitType: dataJson.exitType,
            plate: dataJson.plate,
            passReason: dataJson.passReason,
            passUserId: dataJson.passUserId,
            passTime: moment(dataJson.passTime).format('YYYY-MM-DD HH:mm:ss'),
            shiftWorkId: dataJson.shiftWorkId
        }
        dataList.push(data);

        let config = await global.getConfig();

        let content = {
            compId:config.comp_id,    //小区组织ID
            devCode:config.gateway_id,   //网关ID
            data: dataList, //[{manualPassId:人工放行ID,parkingLotId:车场ID,gtID: 岗亭ID,parkingChannelID: 通道ID,exitType:“进出口类型”,plate: “车牌”,passReason: “放行理由”,passUserId: 放行人ID,passTime: “放行时间”,shiftWorkId:换班记录id}]
            sendtime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 2018-06-21 10:11:04
        }
        console.log('uploadManualPass: ', content);
        openPlatform.SendData(4903, '111111111111', 1, 1, content);
    },
    //确认数据是否成功上传
    async updateConfirm(DataJson){
        let data = DataJson.data;
        for (let i = 0; i < data.length; i++) {
            let IDRep = {manual_pass_id: data[i].manualPassId};
            let dataToSql = {
                manual_pass_id: data[i].manualPassId,
                upload_tag: data[i].status,
                upload_confirm_time: DataJson.sendtime,
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            await mysql.table('parking_manual_pass').where(IDRep).update(dataToSql);
        }
    },
    async deleteBeforeDate(time){     //传入Date样式如：2018-04-05
        await mysql.table('parking_manual_pass').where({upload_time: {'<':time}, upload_tag: 1, _logic: 'AND'}).delete().then(function (affectRow) {
            console.log('删除了 ' +affectRow+ ' 条人工放行记录');
        });
    },
    //  根据上传状态查询记录
    async selectByUploadTag(uploadTag) {
        return mysql.table('parking_manual_pass').where({upload_tag: uploadTag}).select().then(function (data) {
            return data;
        });
    }
};