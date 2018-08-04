/**
 * wenhui 2018-06-10
 * 生产者
 */
'use strict';

var kafka = require('kafka-node');
var Producer = kafka.Producer;
var KeyedMessage = kafka.KeyedMessage;
var KafkaConfig = require('../config/KafkaConfig');

const sendMessage = function (sendData, retData) {
    let client = new kafka.KafkaClient({kafkaHost: KafkaConfig.kafkaHost}); // 创建新连接
    let producer = new Producer(client);
    let message = JSON.stringify(sendData);
    let km = new KeyedMessage('1202', message);

    var payloads = [
        { topic: KafkaConfig.kafkaTopic, messages: [km] }
    ];
    producer.on('ready', function() {
        producer.send(payloads, function(err, result) {
            retData(err || result);
            console.log(err || result);
            // process.exit();
        });
    });

    producer.on('error', function (err) {
        console.log('error', err);
    });
}

module.exports = {
    SendMessage: sendMessage
};