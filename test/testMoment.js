/**
 * Created by wenhui on 2018/6/21.
 * 时间格式化
 */
var moment = require('moment');
const dateUtils = require('date-utils');

var m1 = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); // 2018-06-21 10:11:04
console.log(m1);

// var m12 = moment(new Date()).format('YYYYMMDD'); // 20180621
// console.log(m12);

var timestamp = new Date().getTime();
console.log(timestamp); // 1529974128008
// 获取当前时间戳的前一天
// var ml3 = moment(timestamp-24*60*60*1000).format('YYYY-MM-DD HH:mm:ss');
// console.log(ml3);

console.log(moment(new Date()).format("YYYY-MM-DD 星期"));
console.log("星期" + "日一二三四五六".charAt(new Date().getDay()));
console.log(moment(new Date()).format("L"));
console.log(moment('2016-05-31T16:00:00.000Z').format('YYYY-MM-DD HH:mm:ss'))
console.log(moment("2018-07-01 15:09:23", "YYYYMMDD").fromNow());
console.log(moment().endOf('day').fromNow());

let now = new Date();
console.log(Date.today().getDaysBetween(new Date("2018-07-15 00:00:00")));

console.log(Date.today());
console.log(new Date().toLocaleString().split(" ")[0]);

console.log(new Date("2018-07-15 00:00:01").getMillisecondsBetween(new Date("2018-07-15 00:00:00").addSeconds(1)));
console.log(now.getMillisecondsBetween(new Date("2018-07-15 00:00:00").addSeconds(1)));