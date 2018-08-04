var date = require('date-utils');
var time1 = new Date('2018-06-19 17:41:32');
var time2 = new Date('2018-06-19 17:41:33');
console.log(time1);
time2 = time1.addMinutes(60);
console.log(time2);
console.log(time1.isBefore(time2))