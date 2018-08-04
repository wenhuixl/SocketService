const etoProtocolDeal = require('../node_etoModules/EtoProtocolDeal');

//生成设备序列号
var devId = '';
etoProtocolDeal.createDevCode((DevId) => {
    devId = DevId;
    console.log('devId: ' + DevId);
});

setTimeout(() => {
    //封装生成协议
    var content = {
        'devId': devId
    };
    var protocol = etoProtocolDeal.transformProtocol(1001, '111111111111', 1, 1, content);
    console.log('create protocol : ' + protocol);

    //解析协议
    var protocolData = etoProtocolDeal.parserProtocol(protocol);
    console.log('parser protocol. data : ' + JSON.stringify(protocolData));

    //与服务端建立连接
    etoProtocolDeal.createServerLink((socket, serverProtocol) => {
        console.log('received server data: ' + serverProtocol);
        // console.log('received data : ' + JSON.stringify(serverProtocol));
        var protocolData = etoProtocolDeal.parserProtocol(serverProtocol);
        console.log(JSON.stringify(protocolData));
    });

    //获取与服务端连接的socket
    console.log(etoProtocolDeal.getServerLink());

    // 向服务端发送数据
    etoProtocolDeal.send2Server(protocol);

    // 定时发送心跳
    etoProtocolDeal.sendHeartbeat(protocol, 15);

    // 定时重连
    etoProtocolDeal.reconnectServer(5);

}, 1000 * 3);
