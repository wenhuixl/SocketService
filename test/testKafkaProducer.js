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
    let km = new KeyedMessage('4808', message);

    var payloads = [
        { topic: 'PopService-Consumer-topic-0606', messages: [km] } // KafkaConfig.kafkaTopic
    ];


    producer.on('ready', function () {
        producer.send(payloads, function (err, result) {
            retData(err || result);
            console.log(err || result);
                // process.exit();
        });
    });

    producer.on('error', function (err) {
        console.log('error', err);
    });
}

// sendMessage({data:{
//         listId:48,
//         plateNumber:'粤TK4599',
//         plateType:'00000000',
//         begintime:"2018-06-01 17:40:00",
//         endtime:"2018-06-12 17:40:00",
//     },
//     sendtime:"2018-06-03 17:40:00"}, function (data) {
//     console.log('data:', data);
// });

sendMessage({data: [{
        Id:66,
        plateNumbers:["粤T97979","粤T79797"],
        parkingExitIds:[0,2],
        begintime: "2018-06-07 12:40:00",
        endtime: "2018-06-07 13:40:00",
        deltag:0 // 1: 删除 0: 未删除
        }],
    sendtime: "2018-06-07 19:09:00"
},function (data) {
    console.log('data:', data);
});