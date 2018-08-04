const mysql = require('../middleware/MySQLPool');

const PAY_TAG_UNPAID = "00000000";   //支付标记-未支付
const PAY_TAG_PAID = "00000001";     //支付标记-已支付
const SOURCE_MACHINE = "00000001";   //数据来源-设备
const SOURCE_OPENGATE_COMMAND = "00000002";   //数据来源-开闸指令
const SOURCE_MANUAL_PASS = "00000003";   //数据来源-人工放行

module.exports = {

    async findById(RecordId){
        return await mysql.table('parking_enter_exit_record').where({enter_exit_record_id:RecordId,_logic:'AND'}).find().then(function (data) {
            return data.enter_exit_record_id!=null?data:null;
        });
    },
    //根据车牌号码查询记录
    async findLastByPlate(plate){
        return await mysql.table('parking_enter_exit_record').order('pass_time DESC').limit(1).where({plate:plate}).find().then(function (data) {
            return data.enter_exit_record_id!=null?data:null;
        });
    },
    //根据车牌号码、出入口状态查询最后入场记录
    async findLastEnterListByPlateAndSimilarityDegree(plate,similarityDegree,EXIT_TYPE_IN,EXIT_TYPE_OUT){
        return await mysql.table('parking_enter_exit_record').alias('a').join({
            table: 'parking_channel',
            join: 'left',
            as: 'c',
            on: ['channel_id', 'channel_id']
        }).join({
            table: 'parking_car_type',
            join: 'left',
            as: 'd',
            on: ['car_type_id', 'car_type_id']
        }).order('a.pass_time DESC').where("SimilarityDegree(a.plate,'"+ plate +"')>="+ similarityDegree +" and a.enter_exit_status='"+ EXIT_TYPE_IN +"' and a.pass_time>IFNULL((SELECT max(b.pass_time) from parking_enter_exit_record b where b.plate=a.plate and b.enter_exit_status='"+ EXIT_TYPE_OUT +"'),'1970-01-01')").select().then(function (data) {
            return data;
        });
    },
    //上传确认
    async updateConfirm(DataJson){
        let data = DataJson.data;
        for (let i = 0; i < data.length; i++) {
            let IDRep = {enter_exit_record_id: data[i].enterExitRecordId};
            let dataToSql = {
                enter_exit_record_id: data[i].enterExitRecordId,
                upload_tag: data[i].status,
                upload_confirm_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            await mysql.table('parking_enter_exit_record').where(IDRep).update(dataToSql);
        }
    },
    async add(data){
        return await mysql.table('parking_enter_exit_record').add(data).then(function (insertId) {
            return insertId;
        });
    },

    async deleteBeforeDate(time){     //传入Date样式如：2018-04-05 20:40:45
        await mysql.table('parking_enter_exit_record').where({upload_time: {'<':time}, upload_tag: 1, _logic: 'AND'}).delete().then(function (affectRow) {
            console.log('删除了 ' +affectRow+ ' 条车辆出入记录');
        });
    },
    //  根据上传状态查询记录
    async selectByUploadTag(uploadTag) {
        return mysql.table('parking_enter_exit_record').where({upload_tag: uploadTag}).select().then(function (data) {
            return data;
        });
    },
    async getPayTagUnpaid(){
        return PAY_TAG_UNPAID;
    },
    async getPayTagPaid(){
        return PAY_TAG_PAID;
    },
    async getSourceMachine(){
        return SOURCE_MACHINE;
    },
    async getSourceOpenGateCommand(){
        return SOURCE_OPENGATE_COMMAND;
    },
    async getSourceManualPass(){
        return SOURCE_MANUAL_PASS;
    },
};
