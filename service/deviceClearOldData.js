/*
* created by kaka on 2018/07/10
*设备信息初始化
* */


var webSocket = require('../middleware/WebSocket');
var deviceModel = require('../models/device');
var client_protocol = require('../models/client_protocol');
const globalVeriables = require('../cache/globalVariables');

async function initData() {
    const WHITE_LIST = await globalVeriables.getWhiteList();
    const BLACK_LIST = await globalVeriables.getBlackList();
    const CONST_LIST = await globalVeriables.getConstList();

    let deviceList = await deviceModel.selectAll();

    for(let i = 0; i < deviceList.length; i++) {
        let client = await webSocket.getClient(deviceList[i]);
        if(client != null) {
            console.log('正在初始化设备 ' + deviceList[i].device_ip + ' ...');
            client.write(await client_protocol.ClearPlateList(WHITE_LIST));
            client.write(await client_protocol.ClearPlateList(BLACK_LIST));
            client.write(await client_protocol.ClearPlateList(CONST_LIST));
            console.log('设备 ' + deviceList[i].device_ip + ' 初始化完成！');
        }
    }
}

module.exports = {
    initData:initData,
};