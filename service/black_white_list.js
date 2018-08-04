var blackWhiteList = require('../models/black_white_list');
var authorizationList = require('../models/plate_authorization')
var channel = require('../models/channel')
var toDevice = require('../test/client_protocol');
var deviceModel = require('../models/device');
var webSocket = require('../service/device');
var toServer = require('../test/server_protocol')
const globalVariables = require('./../cache/globalVariables');
const gateHalfPkgDecoder = require('./../utils/gateHalfPkgDecoder');


module.exports = {

    async syncDataToCloud(dataJson){
        var data = dataJson.data;
        // console.log('解析的data为：',data);
        var successList = new Array();
        var deviceList = new Array();
        var buf = Buffer.alloc(20);
        if(data.plateType != null){
            blackWhiteList.save(dataJson);      //将黑白名单数据保存至本地数据库
            buf = await toDevice.AddPlateListReq(data.plateType,1,[{Plate:data.plateNumber,InDate:data.begintime,OutDate:data.endtime}]);
            deviceList = await deviceModel.selectAll();
        }
        else {
            authorizationList.saveFromCloud(dataJson);       //将授权车牌保存至数据库
            var plateData = new Array();
            var deviceId = new Array();
            var deviceIdList = new Array();
            for(let i=0;i<data.plateNumbers.length;i++){
                let dataUnit = {Plate:data.plateNumbers[i],InDate:data.begintime,OutDate:data.endtime};
                await plateData.push(dataUnit);
            }
            buf = await toDevice.AddPlateListReq(2,data.plateNumbers.length,plateData);
            console.log('buf:',buf)
            for(let i=0;i<data.parkingExitIds.length;i++){      //筛选出入口对应的通道
                let channelList = await channel.findListByExitId(data.parkingExitIds[i]);
                for(let j=0;j<channelList.length;j++) {
                    await deviceId.push(channelList[j].device1_id);
                    await deviceId.push(channelList[j].device2_id);
                }
            }
            deviceIdList = await Array.from(new Set(deviceId));      //去重复
            //console.log('设备ID集合：',deviceIdList);
            for(let i=0;i<deviceIdList.length;i++){     //通过ID查找设备并列出IP和端口的清单
                let dataUnit = await deviceModel.findById(deviceIdList[i]);
                if(dataUnit.device_id != null) {
                    deviceList.push(dataUnit);
                }
            }
            console.log('设备名单：',deviceList);
        }
        for(let i=0;i<deviceList.length;i++){
            let successMsg = {deviceIp:deviceList[i].device_ip,successTag:0};
            successList.push(successMsg);
        }
        //await console.log(successList);
        for(let i=0;i<deviceList.length;i++){
            let client = await webSocket.getClient(deviceList[i]);
            if(client!=null){
                client.write(buf);
                client.on('data', function(data) {
                    gateHalfPkgDecoder.dataDecoder(client, data, async function(result) {
                        await console.log('服务器发回: ', result);
                        for(let i=0;i<deviceList.length;i++){
                            if(client.remoteAddress == deviceList[i].device_ip && client.remotePort == deviceList[i].device_port){
                                successList[i].successTag = await toServer.ProtocolDecode(result);
                            }
                        }
                        //console.log('设备ip：',client.remoteAddress);
                    });
                });
                client.on('error', function() {
                    globalVariables.setGateClientStatus(false);
                    console.log('发生意外错误!');
                });
            }

        }
        setTimeout(function () {
            console.log(successList);   //此处使用工具上传将设备执行信息名单至开放平台
        },5000)

    },

}