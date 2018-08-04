/**
 * Created by Evenlai on 2018/06/27
 * POP相关配置
 */

const host = 'http://192.168.3.121:8282'; // 主机
const root = '/POP_Service';              // 根路径
const url = host + root;

const POPConfig = {
    REMOTE_HOST : host,
    API_PARKINGLOTS : url+'/api/parkingLots.do',            //车场列表
    API_COMPLIST : url+'/api/complist.do',                  //小区列表
    API_GATEWAYS : url+'/api/gateWays.do',                  //网关列表
    API_PARKINGCHARGEFEE : url+'/api/parkingChargefee.do',  //远程计费
    API_PAYINFO: url + '/api/manual/payinfo.do',            //人工收费
    API_GATEWAY_INIT: url + '/api/gateway/init.do',         //网关初始化
    API_RESIDUAL_LOT_COUNT: url + '/api/residualLotCount',  //剩余车位
};

module.exports = POPConfig;