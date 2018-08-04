/**
 * Created by wenhui on 2018/6/25.
 * 定时任务
 */
'use strict'

const schedule = require('node-schedule');
const WebSocket = require('./WebSocket');
const clients = WebSocket.clients();
const errorClients = WebSocket.errorClients();
const AlprBufferSend = require('./AlprBufferSend');
const moment = require('moment');
const mysqlClearOldData = require('../service/mysqlClearOldData');
const globalVariables = require('../cache/globalVariables');
const enterExitRecordModel = require('../models/enter_exit_record');
const FsDeal = require('../middleware/FsDeal');
const ServerConfig = require('../config/ServerConfig');
const reUploadPlatform = require('../service/reUploadPlatform');
const DeviceConfig = require('../config/DeviceConfig');
const messageService = require('../service/message');

/**每隔20秒执行,向设备发送心跳指令*/
schedule.scheduleJob('*/20 * * * * *',async function () {
    for(let i = 0; i < clients.length; i++) {
        if(clients[i].remoteAddress && clients[i].remotePort) {
            await clients[i].write(AlprBufferSend.SendHeartBeat());
            console.log('device heartbeat', clients[i].remoteAddress+':'+clients[i].remotePort);
        }
    }
});

/**每隔30秒执行,连接异常设备重连*/
schedule.scheduleJob('*/30 * * * * *', function () {

    for(let i = 0; i < errorClients.length; i++) {
        WebSocket.createConnection(errorClients[i].id, DeviceConfig.port, errorClients[i].host);
        console.log('connect device again', errorClients[i].host+':'+DeviceConfig.port);
    }
    errorClients.splice(0); // 清空数组
});

/**每天凌晨删除超过保存期限数据*/
schedule.scheduleJob('0 0 1 * * *', function () { // 在每天的01点00分00秒执行一次
    let timestamp = new Date().getTime();
    globalVariables.getConfig().then(function (data) {
        let platePictureKeep = data.plate_picture_keep;
        let recordKeep = data.record_keep;
        let delPlatePictureDate = moment(timestamp-platePictureKeep*24*60*60*1000).format('YYYYMMDD'); //  需要删除车牌图片日期
        let delRecordDate = moment(timestamp-recordKeep*24*60*60*1000).format('YYYY-MM-DD HH:mm:ss'); //  需要删除记录日期
        FsDeal.deleteFolderRecursive(ServerConfig.uploadPath+'/'+delPlatePictureDate); // 删除指定文件夹及文件
        mysqlClearOldData.clearDataBeforeDate(); // 删除指定日期以前数据
    });
});

/**定时重发*/
schedule.scheduleJob('*/1 * * * *', async function () { // 数据重发检查周期(分钟)
    await reUploadPlatform.reUploadEnterExitRecord();    // 重新上传出入记录
    await reUploadPlatform.reUploadShiftWork();          // 重新上传换班记录
    await reUploadPlatform.reUploadManualPass();         // 重新上传人工放行记录
    await reUploadPlatform.reUploadManualCharge();       // 重新上传人工收费记录
    console.log('定时重发: ', new Date());
});

/**
 * 定时刷新显示屏内容
 */
// schedule.scheduleJob('*/5 * * * * *', function () {
//     console.log("定时刷新屏幕显示内容");
//     let displayRefreshInterval = 10;  //TODO 后续需要参数化
//     let displayLastRefreshTime = null;
//     let map = messageService.displayLastRefreshMap;
//     let now = new Date();
//     for(let key in map){
//         if(map.hasOwnProperty(key)){
//             displayLastRefreshTime = map[key];
//             //未到间隔时间
//             if(now.getMillisecondsBetween(new Date(displayLastRefreshTime).addSeconds(displayRefreshInterval))<0){
//                 console.log("单通道间隔时间内不进行车牌处理，管理岗亭:" + channelWithLotInfo.gl_gt_id);
//                 return;
//             }
//         }
//
//     }
// });


