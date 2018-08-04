/**
 * Created by wenhui on 2018/6/11.
 */

var mysql = require('../middleware/MySQLPool'); // 具体查询查看文档： https://www.npmjs.com/package/node-mysql-promise
var refer = require('../models/common_menu');
// 查询全部
// mysql.table('parking_enter_exit_record').select().then(function (data) {
//     console.log(data);
// }).catch(function (e) {
//     console.log(e);
// });

// 条件查询
// mysql.table('parking_device').where('del_tag = 0').select().then(function (data) {
//     console.log(data);
// }).catch(function (e) {
//     console.log(e);
// })

// 组合查询
// mysql.table('parking_config').join({
//     table: 'parking_device',
//     join: 'inner',//left, right, inner三种方式
//     as: 'pd',      //表别名
//     on: ['gateway_id', 'gateway_id'] //ON 条件
// }).select().then(function (data) {
//     console.log(data);
// }).catch(function (e) {
//     console.log(e);
// });

// 查询指定列数据
// mysql.table('parking_enter_exit_record').select('2').then(function (data) {
//     console.log(data);
// }).catch(function (e) {
//     console.log(e);
// });

// 插入数据
// var data  = {
//     plate: '粤T2344',
//     pass_time: '2018-06-12 11:26:46'
// };
// mysql.table('parking_enter_exit_record').add(data).then(function (insertId) {
//     console.log(insertId); //如果插入成功，返回插入的id
// }).catch(function (err) {
//     console.log(e); //插入失败，err为具体的错误信息
// });

// var a = {
//     data: {
//         menuId: 222,
//         menuName: 'kaka',
//         menuUrl: 'link',
//         menuParam: 'gg',
//         deltag:0
//     },
//     sendtime:'2018-06-07 17:40:00'
// }
//
// refer.WriteMenuToSql(a)

// 自定义查询
// var sql =  'select * from parking_device pd '+
//            'inner join parking_channel pc '+
//            'inner join parking_exit pe on pe.exit_id = pc.parking_exit_id '+
//            'inner join parking_area pa on pa.area_id = pe.parking_area_id '+
//            'where device_ip = "%s" and device_port = "%s"';
// var data = ['192.168.1.88', '37080'];
// mysql.query(sql, data).then(function (data) {
//     console.log(data);
// });

// const enterExitRecord = require('../models/enter_exit_record');
// const device = require('../models/device');
// const channel = require('../models/channel');
// const DBModel = require('../models/DBModel');
//
// async function get() {
//     let list = await device.selectByRemote('192.168.1.88', '37080')
//     for(let i = 0; i < list.length; i++) {
//         console.log(list[i]);
//         // console.log('--', list[i].exit_type, list[i].device_id, list[i].channel_id, list[i].parking_exit_id, list[i].area_id, list[i].parking_lot_id);
//     }
// }
// get();

// var dataJson = {data: {plate: '粤T2344', pass_time: '2018-06-12 11:26:46'}, sendtime: "2018-06-07 17:40:00"};

// enterExitRecord.save(dataJson);

// mysql.table('parking_device').join({
//     table: 'parking_config',
//     join: 'inner',
//     on: ['gateway_id', 'gateway_id']
// }).where('device_id = 1').select().then(function (data) {
//     console.log(data);
// });

// 查询%s天以前的记录
// var sql =  'select * from parking_enter_exit_record where DATE(pass_time) <= DATE(DATE_SUB(NOW(),INTERVAL %s day)) AND upload_tag = %s';
// var data = [2, 1]; // 两天前已上传开放平台数据
// mysql.query(sql, data).then(function (data) {
//     console.log(data);
// });

// mysql.table('parking_shift_work').where({upload_tag: 0}).select().then(function (data) {
//     console.log(data);
// }).catch(function (e) {
//     console.log(e);
// });

// mysql.table('parking_config').page(1, 20).countSelect().then(function (result) {
//     console.log(result.data);
// });

// mysql.table('parking_config').where({config_id: 1}).update({comp_id: '1100', gateway_id: '1004919', mzm_mode: '00000000', plate_picture_keep: 5, record_keep: 15}).then(function (affectRows) {
//     console.log(affectRows);
// });

// // 删除所有数据
// mysql.table('parking_device').delete().then(function (affectRows) {
//     console.log(affectRows);
// })

// const InitDataBase = require('../models/dataBase');
//
// InitDataBase.initData();

// const carTypeModel = require('../models/car_type');
// const tradeTypeModle = require('../models/trade_type');
// const moment = require('moment');

// var data  = {
//     carTypeId: '1004885',
//     carTypeName: '临时车F45',
//     delTag: '0',
// };
// var where = {
//     carTypeId: '1004885'
// };
//
// carTypeModel.thenAdd(data, where).then(function (result) {
//     console.log(result);
// });

// var data  = {
//     tradeTypeId: '00000003',
//     tradeTypeName: '微信支付',
//     delTag: '0',
// };
// var where = {
//     tradeTypeId: '00000003'
// };
// tradeTypeModle.thenAdd(data, where).then(function (result) {
//     console.log(result);
// });

// const blackWhiteList = require('../models/black_white_list');

// mysql.table('parking_black_white_list').where({del_tag: 0, plate_type: '00000001'}).select().then(function (data) {
//     console.log(data);
// }).catch(function (e) {
//     console.log(e);
// });

// mysql.table('parking_plate_authorization').where({del_tag: 0}).select().then(function (data) {
//     console.log(data);
// }).catch(function (e) {
//     console.log(e);
// });

// mysql.table('parking_gt_user').where({user_id: 1, del_tag: 0}).find().then(function (data) {
//     console.log(data);
// }).catch(function (e) {
//     console.log(e);
// });

// 添加且更新
// const moment = require('moment');

// var data = {
//     user_name: 'wenhui',
//     email: 'admin@163.com',
//     gender: 0,
//     id_card: '1234',
//     phone: '111',
//     work_number: '1001',
//     password: '111',
//     del_tag: 0,
//     sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
// };
// var where = {
//     user_id: 1
// }
//
// mysql.table('parking_gt_user').where(where).update(data).then(function (affectRows) {
//     //返回影响行数
//     console.log(affectRows);
// })

// 分组查询
// mysql.table('parking_plate_authorization').where({del_tag: 0}).group('plate_number').select().then(function (data) {
//     console.log('---', data);
//     return data;
// }).catch(function (e) {
//     console.log(e);
// });

// mysql.table('parking_channel').where({parking_exit_id:'1004924'}).find().then(function (data) {
//     console.log(data);
// });

// mysql.table('parking_channel').join({
//     table: 'parking_device',
//     join: 'inner',
//     on: ['device1_id', 'device_id'] //ON 条件
// }).where({parking_exit_id:'1004924'}).select().then(function (data) {
//     console.log(data);
// });

// 自定义查询
// var sql =  'SELECT * FROM `parking_channel` INNER JOIN `parking_device` ON parking_channel.`device1_id`=parking_device.`device_id` OR parking_channel.`device2_id`=parking_device.`device_id` WHERE ( `parking_exit_id` = %s ) ';
// var data = ['1004924'];
// mysql.query(sql, data).then(function (data) {
//     console.log(data);
// });

// var channel = require('../models/channel');
// channel.findDeviceByExitId(1004924).then(function (data) {
//     console.log(data);
// })

// mysql.table('parking_config').where().find().then(function (config) {
//     console.log(config.config_id);
// })

let device = require('../models/device');

device.findById('1004936').then(function (data) {
    console.log(data.device_ip);
});
