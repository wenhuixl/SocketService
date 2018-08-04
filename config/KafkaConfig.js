/**
 * Created by wenhui on 2018/06/11
 * 相关配置
 */

const KafkaConfig = {
    kafkaHost: '192.168.1.121:9091',
    kafkaTopic: 'PopService-Consumer-topic-0606', // test01  PopService-Consumer-topic
    groupId: 'popService-group'
};

module.exports = KafkaConfig;