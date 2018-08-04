/**
 * 平台接口调用处理类
 * Created by Evenlai on 2018/06/26.
 */
const request = require('request-promise');
const POPConfig = require('../config/POPConfig');
const global = require('../cache/globalVariables');
const REMOTE_CHARGE_STATUS_SUCCESS = 1;  //获取订单成功
const REMOTE_CHARGE_STATUS_ORDER_INVALID = 1001; //订单失效
const REMOTE_CHARGE_STATUS_NO_ENTER_RECORD = 1004; //无入场记录
const REMOTE_CHARGE_STATUS_FREE = 1003;  //未超时无需缴费

module.exports = {
    async chargeMock(plate,carType){
        return {"payAmount":5.00,"carTypeId":1004881,"stayTime":3216,
            "fromDate":"2018-06-23 14:08:35","billCode":"837126299251118080",
            "toDate":"2018-06-23 14:46:17","enterRecordId":1178,"orderState":1};
    },
    async getRemoteChargeStatusSuccess(){
        return REMOTE_CHARGE_STATUS_SUCCESS;
    },
    async getRemoteChargeStatusOrderInvalid(){
        return REMOTE_CHARGE_STATUS_ORDER_INVALID;
    },
    async getRemoteChargeStatusNoEnterRecord(){
        return REMOTE_CHARGE_STATUS_NO_ENTER_RECORD;
    },
    async getRemoteChargeStatusFree(){
        return REMOTE_CHARGE_STATUS_FREE;
    },
    //远程计费
    async remoteCharge(plate,carType,deviceId,tmpInsertIds){
        let config = await global.getConfig();
        let plateBuf = new Buffer(plate);
        let url = POPConfig.API_PARKINGCHARGEFEE+"?plateNumber=" + plateBuf.toString('base64')
            + "&carTypeId=" + carType + "&compid=" + config.comp_id + "&deviceId=" + deviceId + "&tmpIds=" + tmpInsertIds +"&t=" + new Date().toLocaleString();
        return await request.get(url,function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            if(response && response.statusCode===200){
                return body;
            }else{
                return null;
            }
        });
    },
    //查询剩余车位
    async residualLotCount(){
        let config = await global.getConfig();
        let url = POPConfig.API_RESIDUAL_LOT_COUNT+"?compid=" + config.comp_id + "&gwId=" + config.gateway_id +"&t=" + new Date().toLocaleString();
        return await request.get(url,function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
            if(response && response.statusCode===200){
                return body;
            }else{
                return null;
            }
        });
    },
    async residualLotCountMock(){
        return '{"rstId":1,"rstDesc":"","object":{"count":88}}';
    }
};