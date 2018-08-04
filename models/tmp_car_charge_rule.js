const mysql = require('../middleware/MySQLPool');

const DEFAULT_FREE_MINUTES = 0;   //默认免费时长
const FIXED_CAR_YES = '00000001';
const FIXED_CAR_NO = '00000000';

module.exports = {

    //根据Id查询命令
    async findById(RuleId) {
        return await mysql.table('parking_tmp_car_charge_rule').where({
            tmp_car_charge_rule_id: RuleId,
            del_tag: 0,
            _logic: 'AND'
        }).find().then(function (data) {
            return data.tmp_car_charge_rule_id!=null?data:null;
        });
    },
    //根据车场、是否固定车查询收费规则
    async findByLotIdAndFixedCar(lotId,fixedCar){
        return await mysql.table('parking_tmp_car_charge_rule').order('sync_time DESC').where({
            parking_lot_id: lotId,
            fixed_car:fixedCar,
            _logic: 'AND'
        }).find().then(function (data) {
            return data.tmp_car_charge_rule_id!=null?data:null;
        });
    },
    async save(DataJson){
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            let IDRep = {tmp_car_charge_rule_id: data[i].tmpCarChargeRuleId};
            let dataToSql = {
                tmp_car_charge_rule_id: data[i].tmpCarChargeRuleId,
                tmp_car_charge_rule_name: data[i].tmpCarChargeRuleName,
                free_minutes: data[i].freeMinutes,
                fixed_car: data[i].fixedCar,
                parking_lot_id: data[i].parkingLotId,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_tmp_car_charge_rule').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_tmp_car_charge_rule').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_tmp_car_charge_rule').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_tmp_car_charge_rule').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    async getDefaultFreeMinutes(){
        return DEFAULT_FREE_MINUTES;
    },
    async getFixedCarYes(){
        return FIXED_CAR_YES;
    },
    async getFixedCarNo(){
        return FIXED_CAR_NO;
    }
};