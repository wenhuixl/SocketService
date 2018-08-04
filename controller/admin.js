/**
 * Update by wenhui on 2018/6/27.
 * 系统管理员模块
 */
'use strict'

const express = require('express');
const router = express.Router();
const request = require('request');
const configMondel = require('../models/config');
const POPConfig = require('../config/POPConfig');
const mysqlClearOldData = require('../service/mysqlClearOldData');
const deviceClearOldData = require('../service/deviceClearOldData');
const deviceModel = require('../models/device');
const WebSocket = require('../middleware/WebSocket');
const RequestMethod = require('../middleware/RequestMethod');
const deviceConfig = require('../config/DeviceConfig');
const deviceCache = require('../cache/device');
const logger = require('../utils/logUtil').getLogger('admin.js');

/**
 * 获取小区列表
 */
router.get('/complist.do',async function(req, res)  {
    RequestMethod.httprequest('GET', POPConfig.API_COMPLIST, {}, function (result) {
        logger.debug('小区列表: ',result);
        if(result) {
            let records = result.object==null? 0 : result.object.length;
            let rows = result.object==[]? 0 : result.object
            res.json({total: 1, page: 1, records: result.object.length, rows:result.object});
        } else {
            res.json({total: 1, page: 1, records: 0, rows:[]});
        }
    })
});

/**
 * 获取网关列表
 */
router.get('/gatewaylist.do',async function(req, res)  {
    let compid = req.param('compid');
    RequestMethod.httprequest('GET', POPConfig.API_GATEWAYS+'?compid='+compid, {}, function (result) {
        logger.debug('网关列表: ',result);
        if(result) {
            let records = result.object==null? 0 : result.object.length;
            let rows = result.object==[]? 0 : result.object
            res.json({total: 1, page: 1, records: records, rows:rows});
        } else {
            res.json({total: 1, page: 1, records: 0, rows:[]});
        }
    })
});

/**
 * 获取系统配置
 */
router.get('/getconfig.do',async function(req, res)  {
    let page = req.param('page');
    let rows = req.param('rows');
    configMondel.searchPage(page, rows).then(function (result) {
        console.log('/getconfig.do', req.url, result.data);
        let list = result.data;
        res.json({total: 1, page: 1, records: list.length, rows: list});
    });
});

/**
 * 系统初始化
 */
router.post('/init.do',async function(req, res) {
    let comp_id = req.param('comp_id');
    let gateway_id = req.param('gateway_id');
    let disconnect = function() { // 断开所有设备连接
        return new Promise(function (resovle, reject) {
            deviceModel.findAll().then(function (data) {
                for (let i = 0; i < data.length; i++) {
                    let client = WebSocket.clientMap.get(data[i].device_ip+':'+deviceConfig.port);
                    if(client) {
                        client.destroy(); // 销毁连接
                        WebSocket.clientMap.delete(data[i].device_ip+':'+deviceConfig.port); // 删除连接
                        deviceCache.refresh(); // 刷新设备缓存
                    }
                }
            }).catch(function (e) {
                logger.debug(e);
                res.json({'rstId':0,'rstDesc':'error', 'error':e});
            });
            resovle();
        });
    };
    let clearData = function () {
        return new Promise(function (resovle, reject) {
            mysqlClearOldData.initData();      // 清理本地数据表
            mysqlClearOldData.clearTempData(); // 清理本地临时数据
            deviceClearOldData.initData();     // 清理设备数据
            resovle();
        })
    };
    let openPlatformInit = function () { // 调用开发平台初始化接口
        return new Promise(function (resovle, reject) {
            logger.debug('compid: %s, gwId: %s', comp_id, gateway_id);
            RequestMethod.httprequest('POST', POPConfig.API_GATEWAY_INIT, {compid: comp_id, gwId: gateway_id}, function (result) {
                logger.debug('网关初始化: ',result);
            });
            resovle();
        })
    };
    let backResult = function () {
        return new Promise(function (resovle, reject) {
            res.json({'rstId':1,'rstDesc':'success', 'result':1});
            resovle();
        })
    };
    let fn = async function () { // 阻塞执行
        await disconnect();       // 断开所有设备连接
        await clearData();        // 清理本地数据
        await openPlatformInit(); // 调用开放平台初始化接口
        await backResult();       // 返回结果
    }();
});

/**
 * 保存系统配置
 */
router.post('/saveconfig.do',async function(req, res)  { // {comp_id: '1100', gateway_id: '1004919', mzm_mode: '00000000', plate_picture_keep: 5, record_keep: 15}
    let config_id = req.param('config_id');
    let comp_id = req.param('comp_id');
    let gateway_id = req.param('gateway_id');
    let mzm_mode = req.param('mzm_mode');
    let plate_picture_keep = req.param('plate_picture_keep');
    let record_keep = req.param('record_keep');
    let server_ip = req.param('server_ip');
    let websocket_port = req.param('websocket_port');
    let data = {comp_id: comp_id, gateway_id: gateway_id, mzm_mode: mzm_mode, plate_picture_keep: plate_picture_keep, record_keep: record_keep, server_ip: server_ip, websocket_port:websocket_port};
    configMondel.update(config_id, data).then(function (data) {
        res.json({'rstId':1,'rstDesc':'success', 'result':data});
    })
});

module.exports = router;


