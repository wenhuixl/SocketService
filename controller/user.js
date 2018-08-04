/**
 * 用户管理控制类
 * Created by wenhui on 2018/7/10.
 */
'use strict'

const express = require('express');
const router = express.Router();
const request = require('request');
const moment = require('moment');
const configMondel = require('../models/config');
const POPConfig = require('../config/POPConfig');
const deviceModel = require('../models/device');
const gtuserModel = require('../models/gt_user');
const WebSocket = require('../middleware/WebSocket');
const logger = require('../utils/logUtil').getLogger('user.js');

// 获取当前用户数据
router.post('/currentUser', function(req, res)  {
    let user_id = req.session.currentUser.user_id;
    gtuserModel.selectByUserId(user_id).then(function (data) {
        logger.debug('查询用户:', data);
        res.json({'rstId':1,'rstDesc':'success', 'result':data});
    }).catch(function (e) {
        res.json({'rstId':0,'rstDesc':'error', 'result':e});
    })
});

// 更新用户数据
router.post('/update', function (req, res) {
    let user_id = req.session.currentUser.user_id;
    let obj = req.body.user;
    let data = {
        user_name: obj.user_name,
        email: obj.email,
        gender: obj.gender,
        id_card: obj.id_card,
        phone: obj.phone,
        work_number: obj.work_number,
        password: obj.password,
        del_tag: 0,
        sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    gtuserModel.update({user_id: user_id}, data).then(function (affectRows) {
        logger.debug('更新用户:', affectRows);
        res.json({'rstId':1,'rstDesc':'success', 'result':affectRows});
    }).catch(function (e) {
        res.json({'rstId':0,'rstDesc':'error', 'result':e});
    })
});

// 判断密码是否正确
router.post('/checkPass', function (req, res) {
    let oldPass = req.param('oldPass');
    let user_id = req.session.currentUser.user_id;
    gtuserModel.selectByUserId(user_id).then(function (data) {
        logger.debug('用户密码:',oldPass, data.password);
        if(oldPass==data.password) {
            res.json({'rstId':1,'rstDesc':'success'});
        } else {
            res.json({'rstId':0,'rstDesc':'password error'});
        }
    }).catch(function (e) {
        res.json({'rstId':0,'rstDesc':'error', 'result':e});
    })
});

module.exports = router;