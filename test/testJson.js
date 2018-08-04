/**
 * Created by wenhui on 2018/7/3.
 */
// var iconv = require('iconv-lite');
// var str = 'W3siYmVnaW50aW1lIjoiMjAxNi0wNi0wMSIsImRlbHRhZyI6MCwiZW5kdGltZSI6IjIwMTgtMTIt\r\nMzEiLCJsaXN0SWQiOjEwMDY5NzksInBsYXRlTnVtYmVyIjoi1MFKSEQzODQiLCJwbGF0ZVR5cGUi\r\nOiIwMDAwMDAwMiJ9XQ==';
//
// let buf = Buffer.from(str, 'base64');
//
// let data = iconv.decode(buf, 'GBK');
//
// console.log(JSON.parse(data));


var data = [ '{"data":[{"enterExitRecordId":1195,"status":1}],"sendtime":"2018-07-03 20:42:40"}' ];
console.log(data[0]);
console.log(JSON.parse(data[0]).data);

// const path = require('path');

// console.log(path.dirname());