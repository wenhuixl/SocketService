const mysql = require('../middleware/MySQLPool');
const moment = require('moment');

module.exports = {
    //查询车牌对应最后一条支付记录
    async findLastByPlate(plate){
        return await mysql.table('parking_trade').order('pay_time DESC').where({plate_number:plate}).find().then(function (data) {
            return data.trade_number!=null?data:null;
        });
    },
    //按订单号进行查询
    async findByBillCode(billCode){
        return await mysql.table('parking_trade').where({trade_number:billCode,history_trade_numbers: ['LIKE', '%'+ billCode +'%'],_logic: 'OR'}).find().then(function (data) {
            return data.trade_number!=null?data:null;
        });
    },
    async save(DataJson){
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            let IDRep = {trade_number: data[i].tradeNumber};
            let dataToSql = {
                trade_number: data[i].tradeNumber,
                pay_type: data[i].payType,
                amount: data[i].amount,
                pay_time: data[i].payTime,
                plate_number: data[i].plateNumber,
                in_out_record_ids: data[i].inOutRecordIds.toString(),
                history_trade_numbers: data[i].historyTradeNumbers?data[i].historyTradeNumbers.toString():"",
                sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_trade').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_trade').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_trade').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_trade').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    async deleteBeforeDate(time){
        await mysql.table('parking_trade').where({sync_time: {'<':time}}).delete().then(function (affectRow) {
            console.log('删除了 ' +affectRow+ ' 条收费凭证记录');
        });
    }
};