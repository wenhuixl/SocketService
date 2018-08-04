/**
 * Created by @Evenlai on 2018/07/07
 * 语音消息处理服务类
 */
const Message = require('../models/Message');
const clientProtocol = require('../models/client_protocol');
const websocket = require('../middleware/WebSocket');
const numberUtil = require('../utils/numberUtil');
const moment = require('moment');
const dateUtil = require('../utils/dateUtil');
const displayLastRefreshMap = new Map();
let showDefaultTimeout = null;

module.exports = {
    //所有字符
    async allInMap(){
        let map = new Map();
        for(let prop in Message){
            map.set(Message[prop].content,Message[prop]);
        }
        return map;
    },
    //车牌号相关字符
    async plateInMap(){
        let map = new Map();
        for(let prop in Message){
            //数字、字母、车牌
            if(prop.indexOf("NUM")>0 || prop.indexOf("LETTER")>0 || prop.indexOf("PLATE")>0){
                map.set(Message[prop].content,Message[prop]);
            }
        }
        return map;
    },
    //金额相关字符
    async moneyInMap(){
        let map = new Map();
        for(let prop in Message){
            //数字、货币
            if(prop.indexOf("NUM")>0 || prop.indexOf("MONEY")>0){
                map.set(Message[prop].content,Message[prop]);
            }
        }
        return map;
    },
    //对字符串内容进行编码并计入队列
    async encode(array,str){
        let map = await this.allInMap();
        let message = null;
        for(let i=0;i<str.length;i++){
            message = await map.get(str.substr(i,1));
            if(message){
                await array.push(message.code);
            }
        }
        return array;
    },
    //汉字数字转阿拉伯
    async SimplifiedArabi(string){
        string = string.replace("零", "0");
        string = string.replace("一", "1");
        string = string.replace("二", "2");
        string = string.replace("三", "3");
        string = string.replace("四", "4");
        string = string.replace("五", "5");
        string = string.replace("六", "6");
        string = string.replace("七", "7");
        string = string.replace("八", "8");
        string = string.replace("九", "9");
        return string;
    },
    //播报语音
    async broadcast(device,voiceMessage){
        console.log("播报语音："+device.device_ip + "/" + voiceMessage);
        let data = {
            devAddress:66,
            voiceMessage:voiceMessage
        };
        let client = await websocket.getClient(device);
        let buf = await clientProtocol.Broadcast(data);
        if(client){
            console.log("发送播报指令"+buf.toString("hex"));
            client.write(buf);
        }
    },
    //修改显示屏内容
    async display(device,upMsg,downMsg,delay){
        console.log("显示屏显示内容：" + upMsg + "/" + downMsg);
        let data = {};
        data.devAddress = 66;
        if(upMsg){
            data.upMsg = upMsg;
        }
        if(downMsg){
            data.downMsg = downMsg;
        }
        let client = await websocket.getClient(device);
        let buf = await clientProtocol.MessageDisplay(data);
        client.write(buf);
        if(client){
            client.write(buf);
        }
        //this.displayLastRefreshMap.set(device.device_id,moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
        // clearTimeout(showDefaultTimeout);
        // if(delay>0){
        //     showDefaultTimeout = setTimeout(function () {
        //         this.displayDefault(device);
        //     }.bind(this),delay);
        // }else{
        //     delay = 10000;
        //     showDefaultTimeout = setTimeout(function () {
        //         this.displayDefault(device);
        //     }.bind(this),delay);
        // }
    },
    //显示默认内容
    async displayDefault(device){
        let upMsg = "易达号停车系统"; //TODO 需改为读取配置
        let now = new Date();
        let downMsg = moment(new Date(now)).format("YYYY-MM-DD") + " " + dateUtil.getDay(now);
        let data = {
            upMsg:upMsg,
            downMsg:downMsg
        };
        let client = await websocket.getClient(device);
        let buf = await clientProtocol.MessageDisplay(data);
        client.write(buf);
        if(client){
            client.write(buf);
            setTimeout(async function () {
                downMsg = "剩余车位88个";  //TODO 需改成动态
                data = {
                    upMsg:upMsg,
                    downMsg:downMsg
                };
                buf = await clientProtocol.MessageDisplay(data);
                client.write(buf);
            },5000);
        }
    },
    //通用
    async sendCommonMsg(device,plate,voiceMessage,upMessage,downMessage){
        let voiceArray = new Array();
        let upMsg = upMessage;
        let downMsg = "";
        let needToBroadcastPlate = "00000001";  //是否播报车牌  TODO
        //播报车牌
        if(plate && needToBroadcastPlate==="00000001"){
            await this.encode(voiceArray,plate);
        }
        //拼接短语
        voiceArray.push(voiceMessage.code);
        if(downMessage.content){
            downMsg = downMsg + downMessage.content + " ";
        }else{
            downMsg = downMsg + downMessage + " ";
        }
        //播报语音
        await this.broadcast(device,voiceArray);
        //屏幕显示
        await this.display(device,upMsg,downMsg,0);
    },
    //收费
    async sendChargeMsg(device,plate,fee){
        let voiceArray = new Array();
        let upMsg = plate;
        let downMsg = "";
        let needToBroadcastPlate = "00000001";  //是否播报车牌  TODO
        //播报车牌
        if(plate && needToBroadcastPlate==="00000001"){
            await this.encode(voiceArray,plate);
        }
        //请交费
        voiceArray.push(Message._122_PHRASE_PAY_FEE.code);
        downMsg = downMsg + Message._122_PHRASE_PAY_FEE.content + " ";
        //金额
        if(fee){
            await this.encode(voiceArray,await this.SimplifiedArabi(await numberUtil.ArabiSimplified(fee)));
            downMsg = downMsg + fee + "元" + " ";
        }
        //播报语音
        await this.broadcast(device,voiceArray);
        //屏幕显示
        await this.display(device,upMsg,downMsg,0);
    }
};

module.exports.displayLastRefreshMap = displayLastRefreshMap;