/**
 * Created by wenhui on 2018/6/20.
 * socket 服务端
 */
var net = require('net');

var listenPort = 8080;//监听端口
var server = net.createServer(function(socket){ // 创建socket服务端
    console.log('connect: ' + socket.remoteAddress + ':' + socket.remotePort);
    socket.setEncoding('binary');

    socket.on('data',function(data){ //接收到数据
        console.log('client send:' + data.toString('hex'));
    });

    socket.write('Hello client!\r\n');
    // socket.pipe(socket);
    socket.on('error',function(exception){ //数据错误事件
        console.log('socket error:' + exception);
        socket.end();
    });

    socket.on('close',function(data){ //客户端关闭事件
        console.log('client closed!');
        // socket.remoteAddress + ' ' + socket.remotePort);
    });
}).listen(listenPort);

server.on('listening',function(){ //服务器监听事件
    console.log("server listening:" + server.address().port);
});

server.on("error",function(exception){ //服务器错误事件
    console.log("server error:" + exception);
});