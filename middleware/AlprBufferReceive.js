/**
 * Created by wenhui on 2018/06/05
 * 处理get请求
 */
'use strict'

var fs = require("fs");
var iconv = require('iconv-lite');
var moment = require('moment');
var AlprSDKModel = require('../models/AlprSDKModel');
var ServerConfig = require('../config/ServerConfig');

/**获取识别车牌信息*/
function getLicensePlate(buf, callback) {
    if(buf.length == 0) { // 没有数据流
        callback(null);
        return;
    }
    let index = buf.lastIndexOf(Buffer.from([0xb2, 0x04, 0x00, 0x00])); // 获取消息类型为1202的索引
    let lenstr = '';
    let lengbuf = buf.slice(index+8, index+12);
    for (let i = lengbuf.length-1; i >= 0; i--) {
        lenstr += lengbuf[i];
    }
    let len = parseInt(lenstr); // 获取数据长度
    console.log(buf.slice(index+12, index+len).toString('hex'));
    let bufCont = buf.slice(index+12, index+len); // 截取数据内容
    let year = bufCont.slice(0, 4).toString();
    let month = bufCont.slice(4, 6).toString();
    let day = bufCont.slice(6, 8).toString();
    let hour = bufCont.slice(8, 10).toString();
    let minute = bufCont.slice(10, 12).toString();
    let second = bufCont.slice(12, 14).toString();
    let msec = bufCont.slice(14, 17).toString(); // 毫秒
    let szTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); // 纠正设备时间
    let nProcessTime = parseInt(bufCont.slice(20, 24).toString('hex'), 16); // 处理时间
    let nPlateNum = parseInt(bufCont.slice(24, 28).toString('hex'), 16); // 车牌数量
    let szLicense = iconv.decode(bufCont.slice(28, 37), 'GB2312').split('\u0000')[0]; // 车牌
    let nLetterCount = parseInt(bufCont.slice(52, 56).toString('hex'), 16); // 车牌字数
    let fConfidence = parseInt(bufCont.slice(56, 60).toString('hex'), 16); // 可信度
    let rectLeft = parseInt(bufCont.slice(60, 64).toString('hex'), 16); // 位置
    let rectRight = parseInt(bufCont.slice(64, 68).toString('hex'), 16);
    let rectTop = parseInt(bufCont.slice(68, 72).toString('hex'), 16);
    let rectBottom = parseInt(bufCont.slice(72, 76).toString('hex'), 16);
    let plateColor = parseInt(bufCont.slice(76, 77).toString('hex'), 16); // 颜色
    let bDoublePlates = parseInt(bufCont.slice(77, 78).toString('hex'), 16); // 双层车牌
    let dirName = moment(new Date()).format('YYYYMMDD'); // 文件夹名称
    let fileName = year+month+day+hour+minute+second+'.jpg'; // 文件名称
    let platePicturePath = ServerConfig.picturePath+'/'+dirName+'/'+fileName;
    let licensePlate = new AlprSDKModel.LicensePlate(szTime, nProcessTime, nPlateNum, szLicense, nLetterCount, fConfidence, rectLeft, rectRight, rectTop, rectBottom, plateColor, bDoublePlates, platePicturePath);
    callback(licensePlate);
}

/**获取识别车牌照片信息*/
function getLicensePhoto(buf, callback) {
    if(buf.length == 0) { // 没有数据流
        callback(null);
        return;
    }
    let index = buf.lastIndexOf(Buffer.from([0xbe, 0x04, 0x00, 0x00])); // 获取消息类型为1214的索引
    let lenstr = '';
    let lengbuf = buf.slice(index+8, index+12);
    for (let i = lengbuf.length-1; i >= 0; i--) {
        lenstr += lengbuf[i];
    }
    let len = parseInt(lenstr); // 获取数据长度
    let bufCont = buf.slice(index+12, index+len); // 截取数据内容
    let year = bufCont.slice(0, 4).toString();
    let month = bufCont.slice(4, 6).toString();
    let day = bufCont.slice(6, 8).toString();
    let hour = bufCont.slice(8, 10).toString();
    let minute = bufCont.slice(10, 12).toString();
    let second = bufCont.slice(12, 14).toString();
    let msec = bufCont.slice(14, 17).toString(); // 毫秒
    let szTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
    let base64Image = bufCont.slice(20, bufCont.length).toString('base64');
    let licensePhoto = new AlprSDKModel.LicensePhoto(szTime, base64Image);
    console.log('photo', year,month,day,hour,minute,second);
    let dirName = moment(new Date()).format('YYYYMMDD'); // 文件夹名称
    let fileName = year+month+day+hour+minute+second+'.jpg'; // 文件名称
    fs.exists(ServerConfig.uploadPath+'/'+dirName, function(exists) { // 判断文件夹是否存在
        if(exists) {
            fs.writeFile(ServerConfig.uploadPath+'/'+dirName+'/'+fileName, bufCont.slice(20, bufCont.length), function(err) { // 保存图片到指定位置
                if(err){
                    console.log(err);
                }else{
                    console.log('save success!');
                }
            })
        } else { // 创建文件夹
            fs.mkdir(ServerConfig.uploadPath+'/'+dirName, function(err){
                if (err) {
                    return console.error(err);
                }
                fs.writeFile(ServerConfig.uploadPath+'/'+dirName+'/'+fileName, bufCont.slice(20, bufCont.length), function(err) { // 保存图片到指定位置
                    if(err){
                        console.log(err);
                    }else{
                        console.log('save success!');
                    }
                })
            })
        }
    });
    callback(licensePhoto);
}

/**获取黑白名单信息*/
function getlistBanner (buf, callback) {
    let DataType = buf.readIntLE(12,4);
    let PlateNum = buf.readIntLE(16,4);
    let list = [];
    for(var i=0;i<PlateNum;i++){
        let Plate_GBK = buf.slice(20+i*24,36+i*24);
        let Plate = iconv.decode(Plate_GBK,'GB2312').split('\u0000')[0];
        let InDate_Year = buf.readIntLE(36+i*24,2);
        let InDate_Month = buf.readIntLE(38+i*24,1)>9? buf.readIntLE(38+i*24,1):'0'+buf.readIntLE(38+i*24,1);
        let InDate_Day = buf.readIntLE(39+i*24,1)>9? buf.readIntLE(39+i*24,1):'0'+buf.readIntLE(39+i*24,1);
        let OutDate_Year = buf.readIntLE(40+i*24,2);
        let OutDate_Month = buf.readIntLE(42+i*24,1)>9? buf.readIntLE(42+i*24,1):'0'+buf.readIntLE(42+i*24,1);
        let OutDate_Day = buf.readIntLE(43+i*24,1)>9? buf.readIntLE(43+i*24,1):'0'+buf.readIntLE(43+i*24,1);
        let InDate = InDate_Year+'-'+InDate_Month+'-'+InDate_Day;
        let OutDate = OutDate_Year+'-'+OutDate_Month+'-'+OutDate_Day;
        let listBanner = new AlprSDKModel.ListBanner(DataType, PlateNum, Plate, InDate, OutDate);
        list.push(listBanner);
    }
    callback(list);
}

/**获取脱机参数*/
function getOfflineParam(buf, callback) {      //1245(可能存在问题)
    let serverIP = buf.slice(12,28).toString().split('\u0000')[0];
    let serverPort = buf.readIntLE(28,4);
    let parkID = buf.readIntLE(32,4);
    let isRecordCover = buf.readIntLE(36,1);
    let parkInOutFlag = buf.readIntLE(37,1);
    let monthcarAlarmDays = buf.readIntLE(38,1);
    let recognitionAccuracy = buf.readIntLE(39,1);
    let recordMatchAccuracy = buf.readIntLE(40,1);
    let monthCarToTempcarFlag = buf.readIntLE(41,1);
    let monthCarOpenType = buf.readIntLE(42,1);
    let tempCarOpenType = buf.readIntLE(43,1);
    let minCharge = buf.readIntLE(44,4);
    let tempCarForbiddenFlag = buf.readIntLE(48,1);
    let syncTimeFromMaster = buf.readIntLE(52,4);
    let onlineFlag = buf.readIntLE(56,1);
    let oneChannelMode = buf.readIntLE(57,1);
    let oneChannelWaitTime = buf.readIntLE(60,4);
    let normalModeWaitTime = buf.readIntLE(64,4);
    let minChargeFlag = buf.readIntLE(68,1);
    let displayRefreshInterval = buf.readIntLE(69,1);
    let propertyLogo_GBK = buf.slice(70,134);
    let propertyLogo = iconv.decode(propertyLogo_GBK,'GB2312').split('\u0000')[0];
    let screenType = buf.readIntLE(134,1);
    let offlineParam = new AlprSDKModel.OfflineParam(serverIP, serverPort, parkID, isRecordCover, parkInOutFlag, monthcarAlarmDays,
        recognitionAccuracy, recordMatchAccuracy, monthCarToTempcarFlag, monthCarOpenType, tempCarOpenType, minCharge,tempCarForbiddenFlag,
        syncTimeFromMaster, onlineFlag, oneChannelMode, oneChannelWaitTime, normalModeWaitTime, minChargeFlag, displayRefreshInterval,
        propertyLogo, screenType);
    callback(offlineParam);
}

function protocolDecode(buf, callback) {
    var dataType = buf.readIntLE(0,4);
    switch(dataType){
        case 1202:
            return getLicensePlate(buf, callback);
            break;
        case 1214:
            return getLicensePhoto(buf, callback);
            break;
        case 1223:
            return getlistBanner(buf, callback);
        break;
        case 1245:
            return getOfflineParam(buf, callback);
            break;
    //     case 1221: return SetPlateListRes(buf);break;
    //     case 1235: return GetDevSN(buf);break;
    //     case 1238: return GetBaseParam(buf);break;
    //     case 1270: return AddPlateListRes(buf);break;
    //     case 1272: return DelPlateListRes(buf);break;
        default:
            return null;
         break;
    }
}

module.exports = {
    ProtocolDecode: protocolDecode
};