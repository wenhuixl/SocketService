'use strict';

const express = require('express');
const router = express.Router();
const ServerConfig = require('../config/ServerConfig');
const global = require('../cache/globalVariables');
const httpUtil = require('../utils/httpUtil');

/* 登录 */
router.get('/login', function(req, res) {
    res.render('login', {title: 'login'});
});

/* 设备 */
router.get('/devicelist', function(req, res) {
    if(req.session.currentUser.user_name == 'admin') {
        res.render('devicelist', {user_name: req.session.currentUser.user_name});
    } else {
        res.render('error/error-404');
    }
});

/* 首页 */
router.get('/home', function(req, res) {
    res.render('home', {title: 'home'});
});

/* 岗亭 */
router.get('/gt', function(req, res) {
  res.render('gt', {title: 'gt'});
});

/** 设备信息 */
router.get('/device', async function(req, res, next) {
    let device_id = req.param('device_id');
    let config = await global.getConfig();
    //服务器IP
    let serverIp = config.server_ip?config.server_ip:await httpUtil.get_server_ip();
    let domain = serverIp+':8083';
    res.render('device', {device_id: device_id, domain: domain}); // 将device_id传递到前台
});

/** 系统管理员 */
router.get('/admin', function(req, res, next) {
    if(req.session.currentUser.user_name == 'admin') {
        res.render('admin', {user_name: req.session.currentUser.user_name});
    } else {
        res.render('error/error-404');
    }
});

/**小区管理*/
router.get('/complist', function(req, res, next) {
    if(req.session.currentUser.user_name == 'admin') {
        res.render('complist', {user_name: req.session.currentUser.user_name});
    } else {
        res.render('error/error-404');
    }
});

/**网关管理*/
router.get('/gateways', function(req, res, next) {
    if(req.session.currentUser.user_name == 'admin') {
        res.render('gateways', {user_name: req.session.currentUser.user_name});
    } else {
        res.render('error/error-404');
    }
});

/**系统设置*/
router.get('/sysconfig', function(req, res, next) {
    if(req.session.currentUser.user_name == 'admin') {
        res.render('sysconfig', {user_name: req.session.currentUser.user_name});
    } else {
        res.render('error/error-404');
    }
});

/**个人信息*/
router.get('/profile', function(req, res, next) {
    if(req.session.currentUser) {
        res.render('profile', {user_name: req.session.currentUser.user_name});
    } else {
        res.render('error/error-404');
    }
});

module.exports = router;
