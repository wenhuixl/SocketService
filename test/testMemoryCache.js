/**
 * Created by wenhui on 2018/6/21.
 * 缓存
 */

var cache = require('memory-cache');

cache.put('name', 'abcd', 5000, function(key, value) { // key: 'name' , value: 'abcd', time, timeoutCallback)
    console.log(key + ' : ' + value);

}); // Time in ms

console.log('1 name is ' + cache.get('name'));

setTimeout(function() {
    console.log('2 name is ' + cache.get('name'));
}, 6000);
