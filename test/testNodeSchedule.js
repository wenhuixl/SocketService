/**
 * Created by wenhui on 2018/6/20.
 */

var schedule = require('node-schedule');

// var rule = new schedule.RecurrenceRule();
//
// var times = [0,5,10,15,20,25,30,35,40,45,50,55]; // 每隔5s执行一次
//
// rule.second = times;
//
// var j = schedule.scheduleJob(rule, function(){
//     console.log(new Date());
// });

// setTimeout(function () { // 10s后取消定时任务
//     j.cancel();
//     console.log('取消定时任务');
// }, 10000);

// Cron风格
// schedule.scheduleJob('* * * * * *', function(){ // 每秒执行
//     console.log(new Date());
// });

// schedule.scheduleJob('*/5 * * * * *', function () { // 每隔5秒执行
//     console.log(new Date());
// });

// schedule.scheduleJob('50 8 10 * * *', function () { // 在每天的10点7分0秒执行一次
//     console.log(new Date());
// });
//
// schedule.scheduleJob('0 14 10 25 * *', function () { // 在每月25日10点14分0秒执行一次
//     console.log(new Date());
// });

schedule.scheduleJob('*/1 * * * *', function(){ // 每分钟执行
    console.log(new Date());
});