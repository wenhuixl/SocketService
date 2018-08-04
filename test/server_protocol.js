/*
* created by kaka in 2018.06.14
* 
* */


var iconv = require('iconv-lite');
var countryDecode = require('./../test/CountryDecode');

function GetPlateListRes(buf) {             //1223
    //输出格式范例：
    //{ DataType: 1,
    //   PlateNum: 2,
    //   PlateData:
    //    [ { Plate: '粤TKC237', InDate: '2018.6.11', OutDate: '2018.6.16' },
    //      { Plate: '粤', InDate: '2018.6.11', OutDate: '2018.6.16' } ] }
    var DataType = buf.readIntLE(12,4);
    var PlateNum = buf.readIntLE(16,4);
    var PlateData = new Array();
    for(var i=0;i<PlateNum;i++){
        let Plate_GBK = buf.slice(20+i*24,36+i*24);
        let Plate = iconv.decode(Plate_GBK,'GB2312').split('\u0000')[0];
        let InDate_Year = buf.readIntLE(36+i*24,2);
        let InDate_Month = buf.readIntLE(38+i*24,1);
        let InDate_Day = buf.readIntLE(39+i*24,1);
        let OutDate_Year = buf.readIntLE(40+i*24,2);
        let OutDate_Month = buf.readIntLE(42+i*24,1);
        let OutDate_Day = buf.readIntLE(43+i*24,1);
        let InDate = InDate_Year+'.'+InDate_Month+'.'+InDate_Day;
        let OutDate = OutDate_Year+'.'+OutDate_Month+'.'+OutDate_Day;
        let json = {Plate:Plate,InDate:InDate.toString(),OutDate:OutDate.toString()};
        PlateData[i] = json;
    }
    var result = {DataType:DataType,PlateNum:PlateNum,PlateData:PlateData};
    return result;
}

function SetPlateListRes(buf) {     //1221
    //设置成功返回1，否则返回0
    var ListType = buf.readIntLE(12,4);
    var VerifyFlag = buf.readIntLE(16,4);
    if(VerifyFlag == 0){
        switch(ListType){
            case 0:console.log('追加白名单成功！');break;
            case 1:console.log('追加黑名单成功！');break;
            case 2:console.log('追加固定车名单成功！');break;
            default:break;
        }
        return 1;
    }
    else{
        console.log('追加名单失败！');
        return 0;
    }
}

function GetDevSN(buf) {        //1235
    var Serial = buf.slice(12,39).toString('hex').split('00000000')[0];
    var ChipContent = buf.slice(39,72).toString().split('\u0000')[0];
    var Length = buf.readIntLE(72,4);
    var License = buf.slice(76,976).toString().split('\u0000')[0];
    var result = {Serial:Serial,ChipContent:ChipContent,Length:Length,License:License};
    return result;
}

function GetBaseParam(buf) {        //1238
    var RVA = buf.readIntLE(12,1);
    var RgnArea = RVA & 0x01;
    var VirtualCoil = (RVA & 0x03)>>1;
    var AccuracyMatch = (RVA & 0Xfc)>>2;
    var AuxCamera = buf.readIntLE(15,1);
    var CameraIP = buf.slice(16,32).toString().split('\u0000')[0];
    var CharCode = buf.readIntLE(32,1);
    var ScreenPlate = buf.readIntLE(33,1);
    var CountryCode = countryDecode.CountryDecode(buf.readIntLE(34,2));
    var result = {RgnArea:RgnArea,VirtualCoil:VirtualCoil,AccuracyMatch:AccuracyMatch,
                AuxCamera:AuxCamera,CameraIP:CameraIP,CharCode:CharCode,ScreenPlate:ScreenPlate,
                CountryCode:CountryCode}
    return result;
}

function GetOfflineParam(buf) {      //1245(可能存在问题)
    var ServerIP = buf.slice(12,28).toString().split('\u0000')[0];
    var ServerPort = buf.readIntLE(28,4);
    var ParkID = buf.readIntLE(32,4);
    var isRecordCover = buf.readIntLE(36,1);
    var parkInOutFlag = buf.readIntLE(37,1);
    var MonthcarAlarmDays = buf.readIntLE(38,1);
    var RecognitionAccuracy = buf.readIntLE(39,1);
    var RecordMatchAccuracy = buf.readIntLE(40,1);
    var MonthCarToTempcarFlag = buf.readIntLE(41,1);
    var MonthCarOpenType = buf.readIntLE(42,1);
    var TempCarOpenType = buf.readIntLE(43,1);
    var MinCharge = buf.readIntLE(44,4);
    var TempCarForbiddenFlag = buf.readIntLE(48,1);
    var SyncTimeFromMaster = buf.readIntLE(52,4);
    var OnlineFlag = buf.readIntLE(56,1);
    var OneChannelMode = buf.readIntLE(57,1);
    var OneChannelWaitTime = buf.readIntLE(60,4);
    var NormalModeWaitTime = buf.readIntLE(64,4);
    var MinChargeFlag = buf.readIntLE(68,1);
    var DisplayRefreshInterval = buf.readIntLE(69,1);
    var PropertyLogo_GBK = buf.slice(70,134);
    var PropertyLogo = iconv.decode(PropertyLogo_GBK,'GB2312').split('\u0000')[0];
    var ScreenType = buf.readIntLE(134,1);
    var result = {
        ServerIP:ServerIP,
        ServerPort:ServerPort,
        ParkID:ParkID,
        isRecordCover:isRecordCover,
        parkInOutFlag:parkInOutFlag,
        MonthcarAlarmDays:MonthcarAlarmDays,
        RecognitionAccuracy:RecognitionAccuracy,
        RecordMatchAccuracy:RecordMatchAccuracy,
        MonthCarToTempcarFlag:MonthCarToTempcarFlag,
        MonthCarOpenType:MonthCarOpenType,
        TempCarOpenType:TempCarOpenType,
        MinCharge:MinCharge,
        TempCarForbiddenFlag:TempCarForbiddenFlag,
        SyncTimeFromMaster:SyncTimeFromMaster,
        OnlineFlag:OnlineFlag,
        OneChannelMode:OneChannelMode,
        OneChannelWaitTime:OneChannelWaitTime,
        NormalModeWaitTime:NormalModeWaitTime,
        MinChargeFlag:MinChargeFlag,
        DisplayRefreshInterval:DisplayRefreshInterval,
        PropertyLogo:PropertyLogo,
        ScreenType:ScreenType
    };
    return result;
}

function AddPlateListRes(buf) {     //1270
    //设置成功返回1，否则返回0
    var ListType = buf.readIntLE(12,4);
    var VerifyFlag = buf.readIntLE(16,4);
    if(VerifyFlag == 0){
        switch(ListType){
            case 0:console.log('追加白名单成功！');break;
            case 1:console.log('追加黑名单成功！');break;
            case 2:console.log('追加固定车名单成功！');break;
            default:break;
        }
        return 1;
    }
    else{
        console.log('追加名单失败！');
        return 0;
    }
}

function DelPlateListRes(buf) {     //1272
    //设置成功返回1，否则返回0
    var ListType = buf.readIntLE(12, 4);
    var VerifyFlag = buf.readIntLE(16, 4);
    if(VerifyFlag == 0){
        switch(ListType){
            case 0:console.log('删除白名单成功！');break;
            case 1:console.log('删除黑名单成功！');break;
            case 2:console.log('删除固定车名单成功！');break;
            default:break;
        }
        return 1;
    }
    else{
        console.log('删除名单失败！');
        return 0;
    }
}

function ProtocolDecode(buf) {
    var DataType = buf.readIntLE(0, 4);
    switch(DataType){
        case 1221: return SetPlateListRes(buf); break;
        case 1223: return GetPlateListRes(buf); break;
        case 1235: return GetDevSN(buf);        break;
        case 1238: return GetBaseParam(buf);    break;
        case 1245: return GetOfflineParam(buf); break;
        case 1270: return AddPlateListRes(buf); break;
        case 1272: return DelPlateListRes(buf); break;
        default:  console.log('未找到解析方法！！数据编号为：' + DataType); break;
    }
}

module.exports = {
    ProtocolDecode:ProtocolDecode
}