
/**
 * @filename gateHalfPkgDecoder.js
 * @description 出入口道闸协议半包处理器，处理数据帧分包粘包问题
 * @author myc
 * @date 2018-06-07
 * @version V0.0.1
 */

//半包数据缓存
var halfPkgBuf = Buffer.from('');

function protocolSplit(socket, data, deal) {
    data = Buffer.concat([halfPkgBuf, data]);
    halfPkgBuf = Buffer.from('');

    var dataLen = data.length;
    if (dataLen === 0) {
        return;
    }

    var silcaIndex = data.indexOf(0xD38A9F74);

    /**
     * 存在固定码、消息类型、数据长度字段，且data长度大于等于数据长度字段值
     * 认为存在完整数据帧，切分完整数据帧作为处理
     * 若有剩余内容，下一次处理
     */
    if (silcaIndex >= 4 && dataLen >= silcaIndex + 8) {
        var protocolLen = data[silcaIndex + 4] + data[silcaIndex + 5] * 256 + data[silcaIndex + 6] * 256 * 256 + data[silcaIndex + 7] * 256 * 256 * 256;
        if (dataLen >= protocolLen + silcaIndex - 4) {
            deal(socket, data.slice(silcaIndex - 4, protocolLen + silcaIndex - 4));
            protocolSplit(socket, data.slice(protocolLen + silcaIndex - 4, dataLen), deal);
            return;
        }
    }

    halfPkgBuf = data;
}

var methods = {

    dataDecoder: function (socket, data, callbackBuf) {
        try {
            protocolSplit(socket, data, (socket, protocol) => {
                //TODO 完整协议帧解析处理
                // console.log('received gate protocol : ' + protocol.toString('hex'));
                callbackBuf(protocol);
            });
        } catch (e) {
            console.log(e);
            console.log('received gate protocol data error. data : ' + data.toString('hex'));
            callbackBuf(data);
        }
    }
};

module.exports = methods;