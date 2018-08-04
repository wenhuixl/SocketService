const mysql = require('../middleware/MySQLPool');
module.exports = {

    async findById(RecordId){
        return await mysql.table('parking_enter_exit_record_tmp').where({enter_exit_record_tmp_id:RecordId,_logic:'AND'}).find().then(function (data) {
            return data.enter_exit_record_id!=null?data:null;
        });
    },
    //查询指定id数据
    async findByIds(RecordIds){
        return await mysql.table('parking_enter_exit_record_tmp').where({enter_exit_record_tmp_id: ['IN', RecordIds]}).select().then(function (data) {
            return data !=null && data.length>0 ? data : null;
        });
    },
    //批量删除指定id数据
    async deleteByIds(RecordIds){
        return await mysql.table('parking_enter_exit_record_tmp').where({enter_exit_record_tmp_id: ['IN', RecordIds]}).delete().then(function (affectRows) {
            return affectRows;
        });
    },
    async add(data){
        return await mysql.table('parking_enter_exit_record_tmp').add(data).then(function (insertId) {
            return insertId;
        });
    },
    async deleteBeforeDate(time){     //传入Date样式如：2018-04-05 20:40:45
        await mysql.table('parking_enter_exit_record_tmp').where({upload_time: {'<':time}}).delete().then(function (affectRow) {
            console.log('删除了 ' +affectRow+ ' 条车辆出入记录');
        });
    },
    async deleteALL(){
        mysql.table('parking_enter_exit_record_tmp').delete().then(function (affectRow) {
            console.log('删除了 ' +affectRow+ ' 条车辆出入记录');
        });
    }
};