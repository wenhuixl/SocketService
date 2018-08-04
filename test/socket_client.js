/**
 * Created by wenhui on 2018/6/20.
 */
var net = require('net');
var port = 8080;
var host = '127.0.0.1';
var client= new net.Socket();

client.setEncoding('binary'); //创建socket客户端

client.connect(port, host, function(){ //连接到服务端
    client.write('hello server'); //向端口写入数据到达服务端
});

client.on('data',function(data){
    console.log('from server:'+ data);//得到服务端返回来的数据
});

client.on('error',function(error){ //错误出现之后关闭连接
    console.log('error:'+error);
    // client.destory();
});

client.on('close',function(){//正常关闭连接
    console.log('Connection closed');
});
