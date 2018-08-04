/**
 * kaka 2018-06-10
 * 消费者
 */
'use strict';

const kafka = require('kafka-node');
const events = require('events');
const lot = require('../models/lot');
const area = require('../models/area');
const exit = require('../models/exit');
const channel = require('../models/channel');
const gt = require('../models/gt');
const device = require('../models/device');
const menu = require('../models/common_menu');
const gtUser = require('../models/gt_user');
const tmpCarChargeRule = require('../models/tmp_car_charge_rule');
const overTimeChargeRule = require('../models/over_time_charge_rule');
const enterExitRecord = require('../models/enter_exit_record');
const manualCharge = require('../models/manual_charge');
const manualPass = require('../models/manual_pass');
const shiftWork = require('../models/shift_work');
const bwl = require('../service/syncDataFromCloud');
const carType = require('../models/car_type');
const tradeType = require('../models/trade_type');
const eventType = require('../models/event_type');
const globalVariables = require('../cache/globalVariables');
const emitter = new events.EventEmitter();
const Consumer = kafka.Consumer;
const KafkaConfig = require('../config/KafkaConfig');
// var argv = {
//     topic: "PopService-Consumer-topic-0606" // PopService-Consumer-topic
// };
// var topic = argv.topic;

module.exports = {
    async Consumer() {
        var client = new kafka.KafkaClient({kafkaHost: KafkaConfig.kafkaHost});

        var options = {
            groupId: 'kafka-node-group',//consumer group id, default `kafka-node-group`
// Auto commit config
            autoCommit: true,
            autoCommitIntervalMs: 1000,
// The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms
            fetchMaxWaitMs: 100,
// This is the minimum number of bytes of messages that must be available to give a response, default 1 byte
            fetchMinBytes: 1,
// The maximum bytes to include in the message set for this partition. This helps bound the size of the response.
            fetchMaxBytes: 1024 * 1024,
// If set true, consumer will fetch message from the given offset in the payloads
            fromOffset: false,
// If set to 'buffer', values will be returned as raw buffer objects.
            encoding: 'utf8',
            fromBeginning: false,
            commitOffsetsOnFirstJoin: false,
            outOfRangeOffset: 'latest'
        };

        var config = await globalVariables.getConfig();
        var topics = [{
            //topic: topic.topic
            //topic: 'PopService-Consumer-topic-0606'
            topic: 'POP_'+ config.comp_id + '_' + config.gateway_id + '_DOWN'
        }];
        var consumer = new Consumer(client, topics, options);
        console.log('获取到的主题为',topics);
        consumer.on('message', function (message) {
            let type = message.key;
            let data = JSON.parse(message.value);
            // console.log(data);
            switch (type) {
                case '4800':
                    lot.save(data);
                    break;                       //保存车场信息
                case '4801':
                    area.save(data);
                    break;                       //保存区域信息
                case '4802':
                    exit.save(data);
                    break;                      //保存出入口信息
                case '4803':
                    device.save(data);
                    break;                      //保存设备信息
                case '4804':
                    gt.save(data);
                    break;                      //保存岗亭信息
                case '4805':
                    channel.save(data);
                    break;                     //保存通道信息
                case '4806':
                    gtUser.save(data);
                    break;                    //保存岗亭人事信息
                case '4807':
                    bwl.syncDataToCloud(data, 4807);
                    break;            //黑白名单保存至本地并下发至设备
                case '4808':
                    bwl.syncDataToCloud(data, 4808);
                    break;            //授权名单保存至本地并下发至相关设备
                case '4809':
                    menu.save(data);
                    break;            //更新本地常用功能菜单记录
                case '4811':
                    tmpCarChargeRule.save(data);
                    break;          //保存临时车收费规则
                case '4812':
                    overTimeChargeRule.save(data);
                    break;        //保存超时车收费规则
                case '4814':
                    carType.save(data);
                    break;        // 保存车辆类型
                case '4815':
                    tradeType.save(data);
                    break;        // 保存收款方式
                case '4816':
                    eventType.save(content);
                    break;        // 保存事件类型
                case '4901':
                    enterExitRecord.updateConfirm(data);
                    break;  //确认离场记录是否上传
                case '4902':
                    shiftWork.updateConfirm(data);
                    break;        //确认交接班记录是否上传
                case '4903':
                    manualPass.updateConfirm(data);
                    break;       //确认人工放行记录是否上传
                case '4904':
                    manualCharge.updateConfirm(data);
                    break;     //确认人工收费记录是否上传
                default:
                    console.log('未知的消息！请检查信息编号！');
                    break;
            }
            //console.log(JSON.parse(message.value));
        });

        consumer.on('error', function (err) {
            console.log('error', err);
        });

        emitter.on('load', function (args) {
            console.log('load', args);
        });
    }
};
