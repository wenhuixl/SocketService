/**
 * Created by wenbin on 2018/06/12.
 */
var express = require('express');
var router = express.Router();
var logger = require('../utils/logUtil').getLogger('logout');

router.post('/doLogout.do',function(req, res)  {
     req.session.user = "";
     res.json({"rstId":200,"rstDesc":"login"});
});

module.exports = router;

