/**
 * Created by wenhui on 2018/6/20.
 * 开发平台客户端 socket
 */
'use strict'

const etoProtocolDeal = require('../node_etoModules/EtoProtocolDeal');
const lot = require('../models/lot');
const area = require('../models/area');
const exit = require('../models/exit');
const channel = require('../models/channel');
const gt = require('../models/gt');
const device = require('../models/device');
const menu = require('../models/common_menu');
const gtUser = require('../models/gt_user');
const tmpCarChargeRule = require('../models/tmp_car_charge_rule');
const overTimeChargeRule = require('../models/over_time_charge_rule');
const enterExitRecord = require('../models/enter_exit_record');
const manualCharge = require('../models/manual_charge');
const manualPass = require('../models/manual_pass');
const shiftWork = require('../models/shift_work');
const bwl = require('../service/syncDataFromCloud');
const eventType = require('../models/event_type');
const trade = require('../models/trade');
const dealData = require('../models/deal_data');
const carType = require('../models/car_type');
const tradeType = require('../models/trade_type');
const config = require('../models/config');
const deviceService = require('../service/device');
const webSocket = require('../middleware/WebSocket');
const deviceCache = require('../cache/device');
const communityOwnerTmpCar = require('../models/community_owner_tmp_car');
const logger = require('../utils/logUtil').getLogger('/middleware/OpenPlatformClient.js');
const global = require('../cache/globalVariables');

function createConnect() { // 创建连接
    etoProtocolDeal.createDevCode(async function (devId) { // 生成设备序列号
        let config = await global.getConfig();
        if(config==null || !config.gateway_id){
            return;
        }
        let protocol = etoProtocolDeal.transformProtocol(1001, '111111111111', 1, 1, {devCode: config.gateway_id}); // 心跳协议
        let content = null;
        etoProtocolDeal.createServerLink(async function(socket, serverProtocol) { //与服务端建立连接
            let protocolData = etoProtocolDeal.parserProtocol(serverProtocol);
            if (protocolData.content.data != null){
                content = await dealData.deal(protocolData.content); //将云端数据转换成易于接受的格式
                getDataFrom(protocolData.functionNo, content);       //根据协议编号处理接受的数据
                logger.debug('接收到云端数据：', protocolData.functionNo, JSON.stringify(content));
            }
            // logger.debug('协议编号：',protocolData.functionNo);
            // if(content) {
            //     logger.debug('接收到云端数据：', protocolData.functionNo, content);
            // logger.debug('解析数据：',content);
            // }
        });

        // 定时发送心跳
        etoProtocolDeal.sendHeartbeat(protocol, 15);

        // 定时重连
        etoProtocolDeal.reconnectServer(5);
    });
}

function transformProtocol(functionNo, mac, seqn, retryTimes, content) { // 协议封装 功能号 设备mac地址 协议序号 重发次数 协议内容 为空传入空json{}
    let protocol = etoProtocolDeal.transformProtocol(functionNo, mac, seqn, retryTimes, content);
    return protocol;
}

function parserProtocol(protocol) { // 协议解释
    let protocolData = etoProtocolDeal.parserProtocol(serverProtocol);
    return JSON.stringify(protocolData);
}

function getServerLink() { // 获取与服务端连接的socket
    return etoProtocolDeal.getServerLink();
}

function sendData(functionNo, mac, seqn, retryTimes, content) { // 发送数据 功能号 设备mac地址 协议序号 重发次数 协议内容 为空传入空json{}
    let protocol = transformProtocol(functionNo, mac, seqn, retryTimes, content);
    etoProtocolDeal.send2Server(protocol);
    logger.debug('发送数据: ',functionNo, content);
}

function getDataFrom(functionNo,content){
    switch(functionNo){        //协议编号判断
        case 1002: break;
        case 4800: lot.save(content); break;                       //保存车场信息
        case 4801: area.save(content); break;                      //保存车场区域信息
        case 4802: exit.save(content); break;                      //保存出入口信息
        case 4803:
            for(let i = 0; i < content.data.length; i++) {
                device.findById(content.data[i].deviceId).then(function (data) { // 查询数据库，判断设备ip是否更新
                    if(data.device_ip==content.data[i].deviceIp) {               // 若ip没更新直接保存数据库
                        device.save({data:[ content.data[i] ]});
                    } else { // 设备ip已更新,设备断开重连
                        webSocket.connectAgain(content.data[i].deviceId, content.data[i].devicePort, content.data[i].deviceIp).then(function () { // 断开并重新连接
                            deviceService.deviceInit(content.data[i]);  // 初始化黑白名单、授权车牌、脱机参数
                            deviceCache.refresh(); // 刷新设备缓存
                        });
                        device.save({data:[ content.data[i] ]});
                    }
                });
            }
            // deviceService.destroyClient(content).then(function () {// 断开设备原来连接
            //     device.save(content).then(function () {            // 保存设备信息
            //         for(let i = 0; i < content.data.length; i++) {      // 重新连接
            //             webSocket.connectAgain(content.data[i].deviceId, content.data[i].devicePort, content.data[i].deviceIp).then(function () {
            //                 setTimeout(function () {
            //                     deviceService.deviceInit(content.data[i]);  // 初始化黑白名单、授权车牌、脱机参数
            //                 }, 1000);
            //             });
            //         }
            //         deviceCache.refresh(); // 刷新设备缓存
            //     });
            // });
            break;
        case 4804: gt.save(content); break;                        //保存岗亭信息
        case 4805:
            channel.save(content).then(function () {               //保存通道信息
                deviceService.setOfflineParam(content);             //保存设置脱机参数
            });
            break;
        case 4806: gtUser.save(content); break;                    //保存岗亭人事信息
        case 4807: bwl.syncDataToCloud(content,4807); break;       //黑白名单保存至本地并下发至设备
        case 4808: bwl.syncDataToCloud(content,4808); break;       //授权名单保存至本地并下发至相关设备
        case 4809: menu.save(content); break;                      //更新本地常用功能菜单记录
        case 4810: deviceService.openGateByRemote(content); break; //发送开闸指令
        case 4811: tmpCarChargeRule.save(content); break;          //保存临时车收费规则
        case 4812: overTimeChargeRule.save(content); break;        //保存超时车收费规则
        case 4813: trade.save(content); break;                     //保存收费凭证
        case 4814: carType.save(content); break;                   //保存车辆类型
        case 4815: tradeType.save(content); break;                 //保存收款方式
        case 4816: eventType.save(content); break;                 //保存事件类型
        case 4817: communityOwnerTmpCar.save(content); break;      //保存业主临时车
        case 4818:
            config.save(content).then(function () {                //保存系统设置
                deviceService.setOfflineParamOnly(content);         //保存设置脱机参数
            });
            break;
        case 4901: enterExitRecord.updateConfirm(content); break;  //确认离场记录是否上传
        case 4902: shiftWork.updateConfirm(content); break;        //确认交接班记录是否上传
        case 4903: manualPass.updateConfirm(content); break;       //确认人工放行记录是否上传
        case 4904: manualCharge.updateConfirm(content); break;     //确认人工收费记录是否上传
        default: logger.debug('未知的消息！请检查消息编号！'); break;
    }
}

module.exports = {
    CreateConnect: createConnect,
    EtoProtocolDeal: etoProtocolDeal,
    GetServerLink: getServerLink,
    SendData: sendData
};