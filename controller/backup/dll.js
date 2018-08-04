/**
 * Created by wenhui on 2018/5/25.
 */
var express = require('express');
var router = express.Router();
var AlprSDK = require('../lib/AlprSDK');
var tcpClient = require('../middleware/TcpClient');
var logger = require('../utils/logUtil').getLogger('dll');

/**
 * 搜索所有设备
 */
router.get('/searchAllCameras', function (req, res, next) {
  var result1 = AlprSDK.AlprSDK_Startup(1, 1);
  console.log('启动AlprSDK：', result1);
  var result2 = AlprSDK.AlprSDK_SearchAllCameras(500);
  logger.debug('/searchAllCameras', JSON.stringify(result1), JSON.stringify(result2));
  res.json({result: result1})
});

module.exports = router;