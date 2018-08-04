var enter_exit_record = require('../models/enter_exit_record');
var enter_exit_record_tmp = require('../models/enter_exit_record_tmp');
var manual_pass = require('../models/manual_pass');
var manual_charge = require('../models/manual_charge');
var shift_work = require('../models/shift_work');
var trade = require('../models/trade');
var config = require('../models/config');
var dataBase = require('../models/dataBase');

module.exports = {
    async clearDataBeforeDate() {
        let con = await config.getConfig();
        let keepTime = con.record_keep;
        let time = await new Date();
        let expiration = await new Date(time - keepTime * 86400000).toLocaleString();        //计算数据过期时间
        console.log('正在删除' + expiration + '前的本地数据...');
        await enter_exit_record.deleteBeforeDate(expiration);
        await enter_exit_record_tmp.deleteBeforeDate(expiration);
        await manual_charge.deleteBeforeDate(expiration);
        await manual_pass.deleteBeforeDate(expiration);
        await shift_work.deleteBeforeDate(expiration);
        await trade.deleteBeforeDate(expiration);
        console.log('过期数据清理完成！')
    },
    async initData() {
        dataBase.initData();
    },
    async clearTempData() {
        console.log('正在清理临时数据...');
        await enter_exit_record_tmp.deleteALL();
        console.log('临时数据清理完成！');
    },
};