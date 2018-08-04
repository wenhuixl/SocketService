/**
 * Created by wenhui on 2018/6/13.
 * 数据发送指令封装,返回buffer类型数据
 */
var iconv = require('iconv-lite');

/**获取黑白名单发送指令*/
function getPlateListReq(listType) {
    let buf1 = Buffer.from('c6040000749f8ad31000000000000000', 'hex'); // 白名单
    let buf2 = Buffer.from('c6040000749f8ad31000000001000000', 'hex'); // 黑名单
    let buf3 = Buffer.from('c6040000749f8ad31000000002000000', 'hex'); // 固定车
    switch (listType) {
        case 0:
            return buf1;
            break;
        case 1:
            return buf2;
            break;
        case 2:
            return buf3;
            break;
        default:
            return;
            break;
    }
};

/**更新黑白名单*/
function setPlateListReq(ListType, PlateNum, PlateDataArray) {      //1220
    //int ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    //int PlateNum：车牌数
    //PlateDataArray[PlateNum]：车牌信息
    //  {str Plate：车牌号
    //  str InDate：入场日期，格式2018.06.07
    //  str OutDate：出场日期，格式2018.06.07}
    //范例：buf = SetPlateListReq(1,2,[{Plate:'粤TA5467',InDate:'2017.06.07',OutDate:'2018.06.07'},{Plate:'粤TA5468',InDate:'2017.03.04',OutDate:'2018.03.05'}]);
    var head = Buffer.alloc(20);    //头部
    head.writeIntLE(0x4c4,0,4);
    head.writeInt32LE(0xd38a9f74,4,4);
    head.writeIntLE(PlateNum*24+20,8,4);
    head.writeIntLE(ListType, 12, 4);
    head.writeIntLE(PlateNum, 16, 4);
    var data = Buffer.alloc(24*PlateNum);//数据部
    for(var i=0;i<PlateNum;i++) {
        var InDate_Year = parseInt(PlateDataArray[i].InDate.split('-')[0]);
        var InDate_Month = parseInt(PlateDataArray[i].InDate.split('-')[1]);
        var InDate_Day = parseInt(PlateDataArray[i].InDate.split('-')[2]);
        var OutDate_Year = parseInt(PlateDataArray[i].OutDate.split('-')[0]);
        var OutDate_Month = parseInt(PlateDataArray[i].OutDate.split('-')[1]);
        var OutDate_Day = parseInt(PlateDataArray[i].OutDate.split('-')[2]);
        iconv.encode(PlateDataArray[i].Plate, 'GB2312').copy(data, 0 + 24*i, 0);    //车牌转码为GB2312
        data.writeIntLE(InDate_Year, 16 + 24*i, 2);
        data.writeIntLE(InDate_Month, 18 + 24*i, 1);
        data.writeIntLE(InDate_Day, 19 + 24*i, 1);
        data.writeIntLE(OutDate_Year, 20 + 24*i, 2);
        data.writeIntLE(OutDate_Month, 22 + 24*i, 1);
        data.writeIntLE(OutDate_Day, 23 + 24*i, 1);
    }
    let buf = Buffer.concat([head, data], PlateNum*24+20)
    return buf;
}

/**添加黑白名单*/
function addPlateListReq(ListType, PlateNum, PlateDataArray) {      //1269
    //int ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    //int PlateNum：车牌数
    //PlateDataArray[PlateNum]：车牌信息
    //  {str Plate：车牌号
    //  str InDate：入场日期，格式2018.06.07
    //  str OutDate：出场日期，格式2018.06.07}
    //范例：buf = AddPlateListReq(1,2,[{Plate:'粤TA5467',InDate:'2017.06.07',OutDate:'2018.06.07'},{Plate:'粤TA5468',InDate:'2017.03.04',OutDate:'2018.03.05'}]);
    var head = Buffer.alloc(20);    //头部
    head.writeIntLE(0x4f5,0,4);
    head.writeInt32LE(0xd38a9f74,4,4);
    head.writeIntLE(PlateNum*24+20,8,4);
    head.writeIntLE(ListType, 12, 4);
    head.writeIntLE(PlateNum, 16, 4);
    var data = Buffer.alloc(24*PlateNum);//数据部
    for(var i=0;i<PlateNum;i++) {
        var InDate_Year = parseInt(PlateDataArray[i].InDate.split('-')[0]);
        var InDate_Month = parseInt(PlateDataArray[i].InDate.split('-')[1]);
        var InDate_Day = parseInt(PlateDataArray[i].InDate.split('-')[2]);
        var OutDate_Year = parseInt(PlateDataArray[i].OutDate.split('-')[0]);
        var OutDate_Month = parseInt(PlateDataArray[i].OutDate.split('-')[1]);
        var OutDate_Day = parseInt(PlateDataArray[i].OutDate.split('-')[2]);
        iconv.encode(PlateDataArray[i].Plate, 'GB2312').copy(data, 0 + 24*i, 0);    //车牌转码为GB2312
        data.writeIntLE(InDate_Year, 16 + 24*i, 2);
        data.writeIntLE(InDate_Month, 18 + 24*i, 1);
        data.writeIntLE(InDate_Day, 19 + 24*i, 1);
        data.writeIntLE(OutDate_Year, 20 + 24*i, 2);
        data.writeIntLE(OutDate_Month, 22 + 24*i, 1);
        data.writeIntLE(OutDate_Day, 23 + 24*i, 1);
    }
    var result = Buffer.concat([head, data], PlateNum*24+20)
    return result;
}

/**删除黑白名单*/
function delPlateListReq(ListType, PlateNum, PlateDataArray) {      //1271
    //int ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    //int PlateNum：车牌数
    //PlateDataArray[PlateNum]：车牌信息
    //  {str Plate：车牌号
    //  str InDate：入场日期，格式2018.06.07
    //  str OutDate：出场日期，格式2018.06.07}
    //范例：buf = DelPlateListReq(1,2,[{Plate:'粤TA5467',InDate:'2017.06.07',OutDate:'2018.06.07'},{Plate:'粤TA5468',InDate:'2017.03.04',OutDate:'2018.03.05'}]);
    var head = Buffer.alloc(20);    //头部
    head.writeIntLE(0x4f7,0,4);
    head.writeInt32LE(0xd38a9f74,4,4);
    head.writeIntLE(PlateNum*24+20,8,4);
    head.writeIntLE(ListType, 12, 4);
    head.writeIntLE(PlateNum, 16, 4);
    var data = Buffer.alloc(24*PlateNum);//数据部
    for(var i=0;i<PlateNum;i++) {
        var InDate_Year = parseInt(PlateDataArray[i].InDate.split('-')[0]);
        var InDate_Month = parseInt(PlateDataArray[i].InDate.split('-')[1]);
        var InDate_Day = parseInt(PlateDataArray[i].InDate.split('-')[2]);
        var OutDate_Year = parseInt(PlateDataArray[i].OutDate.split('-')[0]);
        var OutDate_Month = parseInt(PlateDataArray[i].OutDate.split('-')[1]);
        var OutDate_Day = parseInt(PlateDataArray[i].OutDate.split('-')[2]);
        iconv.encode(PlateDataArray[i].Plate, 'GB2312').copy(data, 0 + 24*i, 0);    //车牌转码为GB2312
        data.writeIntLE(InDate_Year, 16 + 24*i, 2);
        data.writeIntLE(InDate_Month, 18 + 24*i, 1);
        data.writeIntLE(InDate_Day, 19 + 24*i, 1);
        data.writeIntLE(OutDate_Year, 20 + 24*i, 2);
        data.writeIntLE(OutDate_Month, 22 + 24*i, 1);
        data.writeIntLE(OutDate_Day, 23 + 24*i, 1);
    }
    var result = Buffer.concat([head, data], PlateNum*24+20)
    return result;
}

/**清除服务端保存的黑白名单固定车名称记录*/
function clearPlateList(ListType) {      //1241
    //int dataJson.ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    var head = Buffer.from('d9040000749f8ad310000000','hex');
    var data = Buffer.alloc(4);
    data.writeIntLE(ListType,0,4);
    var result = Buffer.concat([head,data],16);
    console.log(result);
    return result;
}

/**手动识别*/
function recogByManualReq() {       //1226
    var result = Buffer.from('ca040000749f8ad30c000000','hex');
    return result;
}

/**开闸指令*/
function openGate() {
    let buf = Buffer.from('bf040000749f8ad30c000000', 'hex');
    return buf;
}

/**发送心跳*/
function sendHeartBeat() { // 客户端应该至少在30s内发送一包心跳包给服务端，否则服务端会认为客户端断开
    let buf = Buffer.from('d7040000749f8ad30c000000', 'hex');
    return buf;
}

/**获取脱机参数*/
function getOfflineParam() { // 1245
    var result = Buffer.from('dd040000749f8ad30c000000','hex');
    return result;
}

/**设置脱机参数*/
function setOfflineParam(ServerIP,ServerPort,ParkID,isRecordCover,parkInOutFlag,MonthcarAlarmDays,RecognitionAccuracy,RecordMatchAccuracy,MonthCarToTempcarFlag,MonthCarOpenType,TempCarOpenType,MinCharge,TempCarForbiddenFlag,SyncTimeFromMaster,OnlineFlag,OneChannelMode,OneChannelWaitTime,NormalModeWaitTime,MinChargeFlag,DisplayRefreshInterval,PropertyLogo,ScreenType) {    //1244
    //str ServerIP:主服务器IP地址.字符串IP格式
    //int ServerPort:主服务器端口
    //int ParkID:车场编号
    //int isRecordCover:记录（ 出入场记录和收费记录） 是否覆盖， 1： 覆盖， 0： 不覆盖
    //int parkInOutFlag:车场出入口标识，车场入口0，车场出口1
    //int MonthcarAlarmDays:固定车预警天数
    //int RecognitionAccuracy:固定车匹配精度， 99： 精确匹配
    //int RecordMatchAccuracy:记录匹配精度， 99： 精确匹配
    //int MonthCarToTempcarFlag:启用固定车转临时车，0：否，1：是
    //int MonthCarOpenType:固定车开闸方式，0：人工开闸，1：自动开闸
    //int TempCarOpenType:临时车开闸方式，0：人工开闸，1：自动开闸
    //int MinCharge:最低收费
    //int TempCarForbiddenFlag:临时车禁止出入场， 0： 可出入场， 1： 不可出入场
    //int SyncTimeFromMaster:时间点，格式如2305（时间点为23:05）
    //int OnlineFlag:是否在线模式，0：脱机，1：在线
    //int OneChannelMode:是否启用单通道模式，0：否，1：是
    //int OneChannelWaitTime:单通道重复车牌等待时间，以秒为单位
    //int NormalModeWaitTime:正常模式重复车牌等待时间，以秒为单位
    //int MinChargeFlag:是否启用最低收费， 0：不启用，1：启用
    //int DisplayRefreshInterval:脱机显示屏显示内容的刷新间隔， 以秒为单位
    //str PropertyLogo:脱机显示屏默认显示的企业标识
    //int ScreenType:显示屏类型，参考枚举ScreenType
    var head = Buffer.from('dc040000749f8ad3a8000000','hex');
    var PropertyLogoGBK = iconv.encode(PropertyLogo,'GB2312');
    var data = Buffer.alloc(156);
    data.write(ServerIP,0,16);                     /**< 主服务器IP地址.字符串IP格式,如192.168.12.25为31 39 32 2e 31 36 38 2e 31 32 2e 32 35 00 00 00 */
    data.writeIntLE(ServerPort,16,4);              /**< 主服务器端口 */
    data.writeIntLE(ParkID,20,4);                  /**< 车场编号 */
    data.writeIntLE(isRecordCover,24,1);           /**< 记录（ 出入场记录和收费记录） 是否覆盖， 1： 覆盖， 0： 不覆盖 */
    data.writeIntLE(parkInOutFlag,25,1);           /**< 车场出入口标识，车场入口0，车场出口1, 参考枚举PARK_IN_OUT_E */
    data.writeIntLE(MonthcarAlarmDays,26,1);       /**< 固定车预警天数 */
    data.writeIntLE(RecognitionAccuracy,27,1);     /**< 固定车匹配精度， 99： 精确匹配 */
    data.writeIntLE(RecordMatchAccuracy,28,1);     /**< 记录匹配精度， 99： 精确匹配 */
    data.writeIntLE(MonthCarToTempcarFlag,29,1);   /**< 启用固定车转临时车，0：否，1：是, 参考枚举ENABLED_TYPE_E */
    data.writeIntLE(MonthCarOpenType,30,1);        /**< 固定车开闸方式，0：人工开闸，1：自动开闸, 参考枚举OPEN_GATE_TYPE_E */
    data.writeIntLE(TempCarOpenType,31,1);         /**< 临时车开闸方式，0：人工开闸，1：自动开闸, 参考枚举OPEN_GATE_TYPE_E */
    data.writeIntLE(MinCharge,32,4);               /**< 最低收费 */
    data.writeIntLE(TempCarForbiddenFlag,36,1);    /**< 临时车禁止出入场， 0： 可出入场， 1： 不可出入场 */
    data.writeIntLE(SyncTimeFromMaster,40,4);      /**< 时间点23:00-->2300 -->0x08fc */
    data.writeIntLE(OnlineFlag,44,1);              /**< 是否在线模式，0：脱机，1：在线, 参考枚举ONLINE_MODE_E */
    data.writeIntLE(OneChannelMode,45,1);          /**< 是否启用单通道模式，0：否，1：是, 参考枚举ENABLED_TYPE_E， 0： 不启用单通道，1： 单通道模式*/
    data.writeIntLE(OneChannelWaitTime,48,4);      /**< 单通道重复车牌等待时间， 以秒为单位 */
    data.writeIntLE(NormalModeWaitTime,52,4);      /**< 正常模式重复车牌等待时间， 以秒为单位 */
    data.writeIntLE(MinChargeFlag,56,1);           /**< 是否启用最低收费， 0： 不启用， 1： 启用, 参考枚举ENABLED_TYPE_E， */
    data.writeIntLE(DisplayRefreshInterval,57,1);  /**< 脱机显示屏显示内容的刷新间隔， 以秒为单位 */
    PropertyLogoGBK.copy(data,58,0);
    //data.write(PropertyLogoGBK,58,66);           /**< 脱机显示屏默认显示的企业标识 */
    data.writeIntLE(ScreenType,124,1);             /**< 显示屏类型， 参考枚举ScreenType */
        //保留字段长度：31
    var result = Buffer.concat([head,data],168);
    return result;
}

module.exports = {
    GetPlateListReq: getPlateListReq,
    OpenGate: openGate,
    SendHeartBeat: sendHeartBeat,
    SetPlateListReq: setPlateListReq,
    AddPlateListReq: addPlateListReq,
    DelPlateListReq: delPlateListReq,
    RecogByManualReq: recogByManualReq,
    GetOfflineParam: getOfflineParam,
    SetOfflineParam: setOfflineParam,
    ClearPlateList: clearPlateList
};