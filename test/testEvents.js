/**
 * Created by wenhui on 2018/6/26.
 * 事件监听
 */

const events = require('events');

//创建事件监听的一个对象
var  emitter = new events.EventEmitter();

//监听事件some_event
emitter.addListener('some_event',function(arg1, callback){
    console.log('get data:',arg1);
    callback('this is callback!');
});

//触发事件some_event
emitter.on('some_event', 'hello', function (data) {
    console.log(data);
});