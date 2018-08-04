const mysql = require('../middleware/MySQLPool');
const moment = require('moment');

module.exports = {
    //查询所有未删除付款方式
    async findAll(){
        return await mysql.table('parking_trade_type').where({del_tag:0}).select().then(function (data) {
            return data !=null && data.length>0 ? data : null;
        });
    },
    //添加收款方式，存在更新，不存在追加
    // async thenAdd(data, where) {
    //     var data  = {
    //         trade_type_id: data.tradeTypeId,
    //         trade_type_name: data.tradeTypeName,
    //         del_tag: data.delTag,
    //         sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    //     };
    //     var where = {
    //         trade_type_id: where.tradeTypeId
    //     }
    //     return await mysql.table('parking_trade_type').add(data, where, true).then(function (insertId) {
    //         return insertId; //如果插入成功，返回插入的id
    //     }).catch(function (err) {
    //         console.log(err);
    //         return 0; //插入失败，err为具体的错误信息
    //     })
    // },
    // 保存开发平台下发数据
    async save(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            let IDRep = {trade_type_id: data[i].tradeTypeId};
            let dataToSql = {
                trade_type_id: data[i].tradeTypeId,
                trade_type_name: data[i].tradeTypeName,
                del_tag: data[i].deltag,
                sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_trade_type').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_trade_type').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_trade_type').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_trade_type').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    }
}