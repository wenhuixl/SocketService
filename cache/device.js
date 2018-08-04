/**
 * 设备列表缓存
 * Created by wenbin on 2018/06/25.
 */
const deviceModel = require('../models/device');
const deviceMap = new Map();
const deviceConfig = require('../config/DeviceConfig');

module.exports = {
    //刷新缓存
    async refresh(){
        let deviceList = await deviceModel.findAll();
        if(deviceList!=null && deviceList.length>0){
            deviceMap.clear();
            for(let i=0;i<deviceList.length;i++){
                deviceMap.set(deviceList[i].device_ip,deviceList[i]);
            }
        }
    },
    //根据ip和端口取得设备
    async getByIp(deviceIp){
        if(deviceMap==null || deviceMap.size===0){
            await this.refresh();
        }
        if(deviceMap==null || deviceMap.size===0){
            return null;
        }else{
            return await deviceMap.get(deviceIp);
        }
    }
};