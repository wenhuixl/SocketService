const mysql = require('../middleware/MySQLPool');
const moment = require('moment');

module.exports = {
    //根据Id查询命令
    async findById(RuleId) {
        return await mysql.table('parking_over_time_charge_rule').where({
            over_time_charge_rule_id: RuleId,
            del_tag: 0,
            _logic: 'AND'
        }).find().then(function (data) {
            return data.over_time_charge_rule_id!=null?data:null;
        });
    },
    async save(DataJson){
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            let IDRep = {over_time_charge_rule_id: data[i].overtimeChargeRuleId};
            let dataToSql = {
                over_time_charge_rule_id: data[i].overtimeChargeRuleId,
                over_time_charge_rule_name: data[i].overtimeChargeRuleName,
                sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_over_time_charge_rule').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_over_time_charge_rule').thenAdd(dataToSql, IDRep);
            // await mysql.table('parking_over_time_charge_rule').where(IDRep).update(dataToSql);
            let array = new Array();
            let details = JSON.parse(data[i].details);
            for (let j = 0; j < details.length; j++) {
                let detail_IDRep = {
                    over_time_charge_rule_id: data[i].overtimeChargeRuleId,
                    car_type_id: details[j].carTypeId
                };
                let detail_dataToSql = {
                    over_time_charge_rule_id: data[i].overtimeChargeRuleId,
                    car_type_id: details[j].carTypeId,
                    retention_time: details[j].retentionTime
                    // sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                };
                for (let k in detail_dataToSql){
                    if(detail_dataToSql[k] == undefined){
                        detail_dataToSql[k] = null;
                    }
                }
                array.push(detail_dataToSql);
                await mysql.table('parking_over_time_charge_rule_detail').where(detail_IDRep).delete().catch(function (err) {
                    console.log(err);
                });
                // await mysql.table('parking_over_time_charge_rule_detail').thenAdd(detail_dataToSql, detail_IDRep).catch(function (err) {
                //     console.log(err);
                // });
                // await mysql.table('parking_over_time_charge_rule_detail').where(detail_IDRep).update(detail_dataToSql).catch(function (err) {
                //     console.log(err);
                // });
            }
            if(array.length > 0) {
                await mysql.table('parking_over_time_charge_rule_detail').addAll(array).catch(function (err) {
                    console.log(err);
                });
            }
        }
        if(list.length > 0) {
            await mysql.table('parking_over_time_charge_rule').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    }
};