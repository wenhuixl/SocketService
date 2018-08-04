/**
 * Created by wenhui on 2018/6/29.
 * 数据库初始化
 */
var mysql = require('../middleware/MySQLPool');

'use strict'

async function initData() {
    await mysql.table('parking_area').delete().then(function (affectRows) {
        console.log('clear: parking_area', affectRows);
    })
    await mysql.table('parking_black_white_list').delete().then(function (affectRows) {
        console.log('clear: parking_black_white_list', affectRows);
    })
    await mysql.table('parking_car_type').delete().then(function (affectRows) {
        console.log('clear: parking_car_type', affectRows);
    })
    await mysql.table('parking_channel').delete().then(function (affectRows) {
        console.log('clear: parking_channel', affectRows);
    })
    await mysql.table('parking_common_menu').delete().then(function (affectRows) {
        console.log('clear: parking_common_menu', affectRows);
    })
    await mysql.table('parking_device').delete().then(function (affectRows) {
        console.log('clear: parking_device', affectRows);
    })
    await mysql.table('parking_device').delete().then(function (affectRows) {
        console.log('clear: parking_device', affectRows);
    })
    await mysql.table('parking_enter_exit_record').delete().then(function (affectRows) {
        console.log('clear: parking_enter_exit_record', affectRows);
    })
    await mysql.table('parking_enter_exit_record_tmp').delete().then(function (affectRows) {
        console.log('clear: parking_enter_exit_record_tmp', affectRows);
    })
    await mysql.table('parking_event').delete().then(function (affectRows) {
        console.log('clear: parking_event', affectRows);
    })
    await mysql.table('parking_exit').delete().then(function (affectRows) {
        console.log('clear: parking_exit', affectRows);
    })
    await mysql.table('parking_gt').delete().then(function (affectRows) {
        console.log('clear: parking_gt', affectRows);
    })
    // await mysql.table('parking_gt_user').delete().then(function (affectRows) {
    //     console.log('clear: parking_gt_user', affectRows);
    // })
    await mysql.table('parking_kafka_config').delete().then(function (affectRows) {
        console.log('clear: parking_kafka_config', affectRows);
    })
    await mysql.table('parking_lot').delete().then(function (affectRows) {
        console.log('clear: parking_lot', affectRows);
    })
    await mysql.table('parking_manual_charge').delete().then(function (affectRows) {
        console.log('clear: parking_manual_charge', affectRows);
    })
    await mysql.table('parking_manual_pass').delete().then(function (affectRows) {
        console.log('clear: parking_manual_pass', affectRows);
    })
    await mysql.table('parking_over_time_charge_rule').delete().then(function (affectRows) {
        console.log('clear: parking_over_time_charge_rule', affectRows);
    })
    await mysql.table('parking_over_time_charge_rule_detail').delete().then(function (affectRows) {
        console.log('clear: parking_over_time_charge_rule_detail', affectRows);
    })
    await mysql.table('parking_trade_type').delete().then(function (affectRows) {
        console.log('clear: parking_pay_type', affectRows);
    })
    await mysql.table('parking_plate_authorization').delete().then(function (affectRows) {
        console.log('clear: parking_plate_authorization', affectRows);
    })
    await mysql.table('parking_shift_work').delete().then(function (affectRows) {
        console.log('clear: parking_shift_work', affectRows);
    })
    await mysql.table('parking_tmp_car_charge_rule').delete().then(function (affectRows) {
        console.log('clear: parking_tmp_car_charge_rule', affectRows);
    })
    await mysql.table('parking_trade').delete().then(function (affectRows) {
        console.log('clear: parking_trade', affectRows);
    })
    await mysql.table('parking_community_owner_tmp_car').delete().then(function (affectRows) { // 清理业主临时车记录
        console.log('clear: parking_community_owner_tmp_car', affectRows);
    })
};

module.exports = {
    initData: initData
};