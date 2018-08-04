const etoProtocolDeal = require('../node_etoModules/EtoProtocolDeal');
const logger = require('../utils/logUtil').getLogger('/middleware/OpenPlatformSendData.js');

function transformProtocol(functionNo, mac, seqn, retryTimes, content) { // 协议封装 功能号 设备mac地址 协议序号 重发次数 协议内容 为空传入空json{}
    var protocol = etoProtocolDeal.transformProtocol(functionNo, mac, seqn, retryTimes, content);
    return protocol;
};

function sendData(functionNo, mac, seqn, retryTimes, content) { // 发送数据 功能号 设备mac地址 协议序号 重发次数 协议内容 为空传入空json{}
    var protocol = transformProtocol(functionNo, mac, seqn, retryTimes, content);
    etoProtocolDeal.send2Server(protocol);
    logger.debug('发送数据: ',functionNo, content);
};

module.exports = {
    SendData: sendData
};