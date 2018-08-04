/**
 * wenhui 2018-06-10
 * 消费者
 */
'use strict';

var kafka = require('kafka-node');
var events = require('events');
var bwl = require('../service/syncDataFromCloud');
var emitter = new events.EventEmitter();
var Consumer = kafka.Consumer;
var KafkaConfig = require('../config/KafkaConfig');
var argv = {
    topic: "PopService-Consumer-topic-0606" // PopService-Consumer-topic
};
var topic = argv.topic;

var client = new kafka.KafkaClient({kafkaHost: KafkaConfig.kafkaHost});

var topics = [{
        topic: topic
    }],
    options = {
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

var consumer = new Consumer(client, topics, options);


consumer.on('message', function(message) {
    console.log(JSON.parse(message.value));
    bwl.syncDataToCloud(JSON.parse(message.value));
});

consumer.on('error', function(err) {
    console.log('error', err);
});

emitter.on('load', function(args) {
    console.log('load', args);
});
