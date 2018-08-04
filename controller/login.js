/**
 * Created by wenbin on 2018/06/12.
 */
var express = require('express');
var router = express.Router();
var logger = require('../utils/logUtil').getLogger('login');
var gtModel = require('../models/gt');
var gtUserModel = require('../models/gt_user');
var shiftWorkModel = require('../models/shift_work');
var shiftWorkService = require('../service/shift_work');
var manualChargeModel = require('../models/manual_charge');
var stringUtil = require('../utils/stringUtil');
var httpUtil = require('../utils/httpUtil');
var global = require('../cache/globalVariables');

router.post('/doLogin.do',async function(req, res)  {

    if(global.getConfig()==null){
        res.json({"rstId":0,"rstDesc":"login","message":"请联系管理员完成系统初始化设置!"});
    }

    let account = req.body.account;
    let password = req.body.password;

    //密码加密 TODO

    //处理特殊字符
    account = stringUtil.handlingSpecialCharacters(account);

    //从数据库查询账号
    let user = await gtUserModel.findByAccount(account);
    let currentWork;
    if(user != null && user.password === password){
        req.session.user = account;
        req.session.currentUser = user;
        //系统管理员不进行自动交班
        if(user.user_name==='admin') { // 管理员
            res.json({"rstId":200,"rstDesc":"admin"});
            return;
        }
        //岗亭自动换班处理
        let isGt = 0;
        //获取用户客户端IP
        let clientIp = httpUtil.get_client_ip(req);
        clientIp = clientIp.split(':')[3];
        let gt = await gtModel.findByIp(clientIp);
        if(gt!=null && gt.gt_ip === clientIp){
            isGt = 1;
        }
        //岗亭用户处理逻辑
        if(isGt === 1){
            //保存到会话中，方便后续使用
            req.session.currentGt = gt;

            currentWork = await shiftWorkModel.findByGtAndShiftTag(gt.gt_id,0);
            let now = new Date();
            let dataJsonAdd = {
                "gtId":gt.gt_id,"startTime":now.toLocaleString(),
                "endTime":null,"onDutyUserId":user.user_id,
                "pettyCash":0.00,"turnover":0.00,
                "amountsTotal":0.00,"amountsActual":0.00,
                "comments":"","isAutoShift":0,
                "shiftTag":0,"uploadTag":0,
                "uploadTime":null,"uploadConfirmTime":null
            };
            //如果都已交班或是第一条数据
            if(currentWork == null || currentWork.on_duty_user_id == null){
                await shiftWorkModel.add(dataJsonAdd);
            }else{
                if(currentWork.on_duty_user_id != user.user_id){
                    //上一班是其他用户时自动换班
                    //统计营业额
                    let turnover = manualChargeModel.sumAmountsByShiftWorkId(currentWork.shift_work_id);
                    turnover = turnover==null?0.00:turnover;
                    let dataJsonUpdate = {
                        "shiftWorkId":currentWork.shift_work_id,
                        "endTime":now.toLocaleString(),
                        "pettyCash":0.00,
                        "turnover":turnover,
                        "amountsTotal":turnover,
                        "amountsActual":turnover,
                        "comments":"",
                        "isAutoShift":1,
                        "shiftTag":1,
                        "uploadTime":now.toLocaleString()
                    };
                    //自动换班
                    await shiftWorkModel.shift(dataJsonUpdate);

                    //上传交班记录到平台
                    await shiftWorkService.uploadById(currentWork.shift_work_id);

                    //新增换班记录
                    await shiftWorkModel.add(dataJsonAdd);
                    currentWork = await shiftWorkModel.findByGtAndShiftTag(gt.gt_id,0);
                }
            }
            req.session.currentWork = currentWork;
        }
        res.json({"rstId":200,"rstDesc":"gt"});
    }else{
        res.json({"rstId":0,"rstDesc":"login","message":"用户名或密码不正确"});
    }

});

module.exports = router;

