const mysql = require('../middleware/MySQLPool');
const moment = require('moment');

module.exports = {
    async getConfig(){
        return await mysql.table('parking_config').limit(1).select().then(function (data) {
            if (data != null && data.length > 0) {
                return data[0];
            } else {
                return null;
            }
        })
    },
    async searchPage(page, rows) {
        return await mysql.table('parking_config').page(page, rows).countSelect().then(function (data) {
            return data;
        });
    },
    // 更新记录
    update: async function (id, data) { // data {comp_id: '1100', gateway_id: '1004919', mzm_mode: '00000000', plate_picture_keep: 5, record_keep: 15}
        return await mysql.table('parking_config').where({config_id: id}).update(data).then(function (affectRows) {
            return affectRows;
        });
    },
    // 查询全部
    selectAll: function(condJson, callback) { // {del_tag:0}
        mysql.table('parking_config').where(condJson).select().then(function (data) {
            callback(data);
        });
    },
    // 查询一条记录
    findOne: function(condJson, callback) { // {del_tag:0}
        mysql.table('parking_config').where(condJson).find().then(function (data) {
            callback(data);
        });
    },
    //  保存开发平台数据
    async save(dataJson) {
        let data = dataJson.data;
        for(let i = 0; i < data.length; i++) {
            await mysql.table('parking_config').where().find().then(function (config) {
                let IDRep = {config_id: config.config_id};
                let dataToSql = {
                    mzm_charge_mode: data[i].chargeModel,
                    single_channel_wait_time: data[i].singleChannelWaitTime,
                    update_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                };
                mysql.table('parking_config').where(IDRep).update(dataToSql).then(function (affectRows) {
                    console.log('保存系统配置：%s', affectRows);
                }).catch(function (err) {
                    console.log(err);
                })
            }).catch(function (err) {
                console.log(err);
            })
        }
    }
};