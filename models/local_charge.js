/**
 * 本地处理实体类
 * Created by wenbin on 2018/07/14.
 */
const CHARGE_ERROR = 0;   //计费异常
const CHARGE_FREE =  1;   //不需要付费
const CHARGE_NO_ENTER_RECORD =  2;   //无入场记录
const CHARGE_NEED_PAY =  3;   //需付费
const CHARGE_ENTRANCE_PASS_CONFIRM = 4; //入口确认放行
const CHARGE_MZM_PASS_CONFIRM = 5; //门中门确认放行
const CHARGE_EXIT_PASS_CONFIRM = 6; //出口确认放行

module.exports = {
    /**
     * 获取常量
     */
    async getChargeError(){
        return CHARGE_ERROR;
    },
    async getChargeFree(){
        return CHARGE_FREE;
    },
    async getChargeNoEnterRecord(){
        return CHARGE_NO_ENTER_RECORD;
    },
    async getChargeNeedPay(){
        return CHARGE_NEED_PAY;
    },
    async getChargeEntrancePassConfirm(){
        return CHARGE_ENTRANCE_PASS_CONFIRM;
    },
    async getChargeMZMPassConfirm(){
        return CHARGE_MZM_PASS_CONFIRM;
    },
    async getChargeExitPassConfirm(){
        return CHARGE_EXIT_PASS_CONFIRM;
    }
};