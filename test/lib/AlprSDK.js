/**
 * Created by wenhui on 2018/05/25
 * 处理get请求
 */
// 'use strict'
//
// var ffi = require('ffi');
// var ref = require('ref');
// var struct = require('ref-struct');
// var async = require('async');
// var task = [];
//
// var servers = [];
// var DEVINFO = struct({
//   'szIP': 'string',
//   'szDevName': 'string',
//   'u16Port': 'int',
//   'szUser':'string',
//   'szPwd':'string',
//   'szPicturesSavePath':'string'
// });
// var devInfo = new DEVINFO({ szIP: '5', szDevName: '10', u16Port: 8908, szUser: 'admin', szPwd: 'admin', szPicturesSavePath: 'D:/picture'})
//
// var lib = ffi.Library('./dll/AlprSDK.dll', {
//   'AlprSDK_Startup': ['int', ['long', 'int']],
//   'AlprSDK_Cleanup': ['int', []],
//   'AlprSDK_SearchAllCameras': ['int', ['int', 'pointer']],
//   'AlprSDK_InitHandle': ['int', ['int', 'long']],
//   'AlprSDK_SetConnectTimeout': ['int', ['int', 'int']],
//   // 'AlprSDK_ConnectDev': ['int',['int', 'pointer', 'string']]
//   'AlprSDK_ConnectDev': ['int',[]]
// });
//
// /**搜索设备*/
// var CallbackServerFind = ffi.Callback('void', ['int', 'string', 'string', 'int', 'long', 'long', 'string', 'string', 'string', 'string', 'long', 'int', 'int', 'long'],
//   function(nDeviceType, pDeviceName, pIP, macAddr, wPortWeb, wPortListen, pSubMask, pGateway, pMultiAddr, pDnsAddr, wMultiPort, nChannelNum, nFindCount, dwDeviceID) {
//     console.log("nDeviceType: ", nDeviceType);
//     console.log("pDeviceName: ", pDeviceName);
//     console.log("pIP: ", pIP);
//     console.log("macAddr: ", macAddr);
//     console.log("wPortWeb: ", wPortWeb);
//     console.log("wPortListen: ", wPortListen);
//     console.log("pSubMask: ", pSubMask);
//     console.log("pGateway: ", pGateway);
//     console.log("pMultiAddr: ", pMultiAddr);
//     console.log("wMultiPort: ", wMultiPort);
//     console.log("nChannelNum: ", nChannelNum);
//     console.log("nFindCount: ", nFindCount);
//     console.log("dwDeviceID: ", dwDeviceID);
//     var server = {
//       nDeviceType: nDeviceType,
//       pDeviceName: pDeviceName,
//       pIP: pIP,
//       macAddr: macAddr,
//       wPortWeb: wPortWeb,
//       wPortListen: wPortListen,
//       pSubMask: pSubMask,
//       pGateway: pGateway,
//       pMultiAddr: pMultiAddr,
//       wMultiPort: wMultiPort,
//       nChannelNum: nChannelNum,
//       nFindCount: nFindCount,
//       dwDeviceID: dwDeviceID
//     }
//     servers.push(server);
//     console.log('关闭AlprSDK：', lib.AlprSDK_Cleanup());
    // console.log('---', servers);
    // console.log('初始化SDK的句柄：', lib.AlprSDK_InitHandle(1, 2));
    // console.log('设置连接超时：', lib.AlprSDK_SetConnectTimeout(1, 500));
    // console.log('关闭AlprSDK：', lib.AlprSDK_Cleanup());
// });

// process.on('exit', function() {
//   console.log('----');
// });

// console.log('启动AlprSDK：', lib.AlprSDK_Startup(1, 1));
//
// setTimeout(function () {
//   lib.AlprSDK_SearchAllCameras(1000, CallbackServerFind);
// }, 2000);
//
// setTimeout(function () {
//   console.log('关闭AlprSDK：', lib.AlprSDK_Cleanup());
// },5000);

// while (true){
//   setTimeout(function () {
//     console.log(new Date());
//   }, 1000);
// }


// setTimeout(function () {
//   console.log('搜索设备3：', lib.AlprSDK_SearchAllCameras(500, CallbackServerFind));
// },3000);


// function myfunc(Interval){
//   console.log('搜索设备：', lib.AlprSDK_SearchAllCameras(500, CallbackServerFind));
// };
//
// var myInterval=setInterval(myfunc, 1000, "Interval");
//
// function stopInterval() {
//   clearTimeout(myInterval)
// };
//
// setTimeout(stopInterval,5000);

// console.log('初始化SDK的句柄：', lib.AlprSDK_InitHandle(1, 2));
// console.log('设置连接超时：', lib.AlprSDK_SetConnectTimeout(1, 500));
// console.log('连接设备：', lib.AlprSDK_ConnectDev());
// console.log('关闭AlprSDK：', lib.AlprSDK_Cleanup());


// task.push(function(callback){
//   setTimeout(function () {
//     console.log('1');
//   }, 3000)
//   callback(null);
// })
//
// task.push(function(callback){
//   console.log('2');
//   callback(null);
// })
//
// async.series(task, function(err, result){
//   console.log('ok');
// })

// var AlprSDK_Startup = function AlprSDK_Startup(hNotifyWnd, nCommandID) {
//   return lib.AlprSDK_Startup(hNotifyWnd, nCommandID);
// }
//
// var AlprSDK_SearchAllCameras = function AlprSDK_SearchAllCameras(nTimeWait) {
//   lib.AlprSDK_SearchAllCameras(nTimeWait, CallbackServerFind);
//   return servers;
// }
//
// process.on('exit', function() {
//   CallbackServerFind
// });
//
// module.exports = {
//   AlprSDK_Startup: AlprSDK_Startup,
//   AlprSDK_SearchAllCameras: AlprSDK_SearchAllCameras
// };