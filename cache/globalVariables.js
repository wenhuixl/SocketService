/**
 * @filename globalVariables.js
 * @description 全局变量
 * @author myc
 * @date 2018-06-07
 * @version V0.0.1
 */
const configModel = require('../models/config');

/** 与道闸连接的socket客户端 */
var gateClientSocket = false;

/** 客户端与道闸连接状态 */
var gateClientStatus = false;

/** 系统配置 **/
var config;

/** 门中门模式常量 **/

const MZM_MODE_YES = "00000001";   //启用门中门模式
const MZM_MODE_NO = "00000000";    //关闭门中门模式

/** 客户端类型常量 **/
const COMMON_CLIENT_TYPE = 0;   //普通客户端
const WEB_CLIENT_TYPE = 1;      //Web客户端
const DEMO_CLIENT_TYPE = 2;     //demo客户端

/** 名单类型常量 **/
const WHITE_LIST = 0;   //白名单
const BLACK_LIST = 1;   //黑名单
const CONST_LIST = 2;   //固定车名单

var methods = {

    getGateClientSocket: function () {
        return gateClientSocket;
    },

    setGateClientSocket: function (socket) {
        gateClientSocket = socket;
    },

    isGateClientStatus: function () {
        return gateClientStatus;
    },

    setGateClientStatus: function (status) {
        gateClientStatus = status;
    },

    send2Gate: function (protocol) {
        if (!gateClientStatus) {
            gateClientSocket.write(protocol);
        }
    },
    getConfig:async function(){
        if(config==null){
            config = await configModel.getConfig();
        }
        return config;
    },
    getMzmModeYes:async function(){
        return MZM_MODE_YES;
    },
    getMzmModeNo:async function(){
        return MZM_MODE_NO;
    },
    getCommonClientType:async function(){
        return COMMON_CLIENT_TYPE;
    },
    getWebClientType:async function(){
        return WEB_CLIENT_TYPE;
    },
    getDemoClientType:async function(){
        return DEMO_CLIENT_TYPE;
    },
    getWhiteList:async function(){
        return WHITE_LIST;
    },
    getBlackList:async function(){
        return BLACK_LIST;
    },
    getConstList:async function(){
        return CONST_LIST;
    },
};

module.exports = methods;
