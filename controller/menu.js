/**
 * Created by @Evenlai on 2018/07/12.
 */
const express = require('express');
const router = express.Router();
const commonMenuModel = require('../models/common_menu');

// 获取当前用户数据
router.post('/list', async function(req, res)  {
    let menuList = await commonMenuModel.findAll();
    res.json({'rstId':1,'rstDesc':'success', 'result':menuList});
});

module.exports = router;