const mysql = require('../middleware/MySQLPool');

const DEFAULT_RETENTION_TIME = 0;   //默认超时时长
module.exports = {

    async findByCarType(carTypeId){
        return await mysql.table('parking_over_time_charge_rule_detail').where({car_type_id: carTypeId}).find().then(function (data) {
            return data.over_time_charge_rule_id!=null?data:null;
        });
    },
    async getDefaultRetentionTime(){
        return DEFAULT_RETENTION_TIME;
    }
}