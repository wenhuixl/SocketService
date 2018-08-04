/**
 * Created by kaka on 2018/6/7.
 */

const iconv = require('iconv-lite');
var crc = require('../utils/crcToBuf');

function SetPlateListReq(ListType,PlateNum,PlateDataArray) {      //1220
    //int ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    //int PlateNum：车牌数
    //PlateDataArray[PlateNum]：车牌信息
    //  {str Plate：车牌号
    //  str InDate：入场日期，格式2018.06.07
    //  str OutDate：出场日期，格式2018.06.07}
    //范例：buf = SetPlateListReq(1,2,[{Plate:'粤TA5467',InDate:'2017-06-07',OutDate:'2018-06-07'},{Plate:'粤TA5468',InDate:'2017-03-04',OutDate:'2018-03-05'}]);
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
    var result = Buffer.concat([head, data], PlateNum*24+20)
    return result;
}
// var buf = SetPlateListReq(1,2,[{Plate:'粤TA5467',InDate:'2017.06.07',OutDate:'2018.06.07'},{Plate:'粤TA5468',InDate:'2017.03.04',OutDate:'2018.03.05'}]);
// console.log(buf.toString('hex'));

function OpenGate() {       //1215
    var result = Buffer.from('bf040000749f8ad30c000000','hex');
    return result;
}

function GetPlateListReq(ListType) {    //1222
    //int dataJson.ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    var head = Buffer.from('c6040000749f8ad310000000', 'hex');
    var data = Buffer.alloc(4);
    data.writeIntLE(ListType,0,4);
    var result = Buffer.concat([head,data],16);
    return result;
}

function RecogByManualReq() {       //1226
    var result = Buffer.from('ca040000749f8ad30c000000','hex');
    return result;
}

function SetDevSN(Serial,ChipContent,Length,License) {      //1234
    //Char[27] dataJson.Serial：序列号
    //char[33] dataJson.ChipContent：加密芯片内容
    //int dataJson.Length：许可长度
    //char[900] dataJson.License：许可内容
    //范例：buf = SetDevSN('FSQ745216540','chipconcent',7,'license')
    var head = Buffer.from('f5040000749f8ad3d0030000','hex');
    var data = Buffer.alloc(964);
    data.write(Serial,0,27);
    data.write(ChipContent,27,33);
    data.writeIntLE(Length,60,4);
    data.write(License,64,900);
    var result = Buffer.concat([head,data],976);
    return result;
}

function GetDevSNq() {      //1235请求帧
    var result = Buffer.from('f6040000749f8ad30c000000','hex');
    return result;
}

function SetBaseParam(RgnArea,VirtualCoil,AccuracyMatch,AuxCamera,CameraIP,CharCode,ScreenPlate,CountryCode) {       //1237
    //int dataJson.RgnArea：是否显示识别区域。0：不显示，1：显示
    //int dataJson.VirtualCoil：是否显示虚拟线圈。0：不显示，1：显示
    //int dataJson.AccuracyMatch：车牌匹配精度
    //int dataJson.AuxCamera：是否辅助摄像机。0：否，1：是
    //char dataJson.CameraIP：主摄像机IP地址（字符串格式）。如192.168.12.25为31 39 32 2e 31 36 38 2e 31 32 2e 32 35 00 00 00
    //int dataJson.CharCode：显示屏字符编码， 参考枚举CharacterEncoding_E
    //int dataJson.ScreenPlate：显示屏是否只显示车牌。0：其他，1：只发送车牌
    //int dataJson.CountryCode：国家编码，参考枚举COUNTRY_CODE_E
    //范例：buf = SetBaseParam(1,1,22,1,'192.168.0.1',1,1,1)
    var RVA = ((0x00|RgnArea)|(VirtualCoil<<1))|(AccuracyMatch<<2)      //RVA第一位或RgnArea，第二位或VirtualCoil，剩余位或AccuracyMatch
    var head = Buffer.from('d5040000749f8ad33e000000','hex');
    var data = Buffer.alloc(50);
    data.writeIntLE(RVA,0,1);
    data.writeIntLE(AuxCamera,3,1);
    data.write(CameraIP,4,16);
    data.writeIntLE(CharCode,20,1);
    data.writeIntLE(ScreenPlate,21,1);
    data.writeIntLE(CountryCode,22,2);
    var result = Buffer.concat([head,data],62);
    return result;
}

function GetBaseParamq() {      //1238
    var result = Buffer.from('d6040000749f8ad30c000000','hex')
    return result;
}

function SendHeartBeat() {      //1239
    var result = Buffer.from('d7040000749f8ad30c000000','hex');
    return result;
}

function SetAPIClientType() {      //1240
    //待补充
}

function ClearPlateList(ListType) {      //1241
    //int dataJson.ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    var head = Buffer.from('d9040000749f8ad310000000','hex');
    var data = Buffer.alloc(4);
    data.writeIntLE(ListType,0,4);
    var result = Buffer.concat([head,data],16);
    console.log(result);
    return result;
}

/**
 * 以下为SetDeviceData（1243）解析部分
 *
 * **/
function SetDeviceDataq(DataJson) {
    //下发数据至服务端
    var dataJson = JSON.parse(DataJson);
    switch (dataJson.dataType){
        case 0:     var result = TTempCarChargeRule(DataJson);break;    //临时车收费数据
        case 1:     var result = TGenChargeRule(DataJson);break;        //固定车收费数据
        case 2:     var result = TRecordInOutLog(DataJson);break;       //车辆出入场数据
        default:    break;
    }
    return result;
}


function TTempCarChargeRule(DataJson) {
    //DataJson = "{ "dataNum":int,
    //              "dataType":int,
    //              "data":json[],
    //              "carType":int,
    //              "freeMin":int,
    //              "freeMinCharge":int,
    //              "segmentCharge":int,
    //              "highestCharge":int,
    //              "GenChargeRuleIDs":int[16]"}"
    var dataJson = JSON.parse(DataJson);
    var head = Buffer.from('db040000749f8ad3', 'hex');
    var dataAttr = Buffer.alloc(12);
    var data = Buffer.alloc(78*(dataJson.dataNum));
    dataAttr.writeIntLE(20+78*(dataJson.dataNum),0,4);
    dataAttr.writeIntLE(dataJson.dataType,4,4);
    dataAttr.writeIntLE(dataJson.dataNum,8,4);
    for(var i=0;i<dataJson.dataNum;i++){
        data.writeIntLE(dataJson.carType,0+i,4);
        data.writeIntLE(dataJson.freeMin,4+i,4);
        data.writeIntLE(dataJson.freeMinCharge,8+i,1);
        data.writeIntLE(dataJson.segmentCharge,9+i,1);
        data.writeIntLE(dataJson.highestCharge,10+i,4);
        for(var j=0;j<16;j++){
            data.writeIntLE(dataJson.GenChargeRuleIDs[j],14+i+j,4);
        }
    }
    var result = Buffer.concat([head,dataAttr,data],20+78*(dataJson.dataNum))
    return result;
}

function TGenChargeRule(DataJson) {
    var dataJson = JSON.parse(DataJson);
    switch (dataJson.ChargeRule){
        case 0:     var result = TimezoneRule(DataJson);break;
        case 1:     var result = PeriodRule(DataJson);break;
        case 2:     var result = VirtualRule(DataJson);break;
        default:    break;
    }
    return result;
}

function TimezoneRule(DataJson) {
    var dataJson = JSON.parse(DataJson);
    var head = Buffer.from('db040000749f8ad3', 'hex');
    var dataAttr = Buffer.alloc(12);
    var data = Buffer.alloc(29*(dataJson.dataNum));
    dataAttr.writeIntLE(20+29*(dataJson.dataNum),0,4);
    dataAttr.writeIntLE(dataJson.dataType,4,4);
    dataAttr.writeIntLE(dataJson.dataNum,8,4);
    for(var i=0;i<dataJson.dataNum;i++){
        data.writeIntLE(dataJson.carType,0+i,4);
        data.writeIntLE(dataJson.chargeMode,4+i,4);
        data.writeIntLE(dataJson.startTime,8+i,4);
        data.writeIntLE(dataJson.endTime,12+i,4);
        data.writeIntLE(dataJson.perTimeCharge,16+i,1);
        data.writeIntLE(dataJson.perTime,17+i,4);
        data.writeIntLE(dataJson.perTimeCost,21+i,4);
        data.writeIntLE(dataJson.Cost,25+i,4);
    }
    var result = Buffer.concat([head,dataAttr,data],20 + 78 * (dataJson.dataNum))
    return result;
}

function PeriodRule(DataJson) {
    var dataJson = JSON.parse(DataJson);
    var head = Buffer.from('db040000749f8ad3', 'hex');
    var dataAttr = Buffer.alloc(12);
    var data = Buffer.alloc(25 * (dataJson.dataNum));
    dataAttr.writeIntLE(20 + 25 * (dataJson.dataNum), 0, 4);
    dataAttr.writeIntLE(dataJson.dataType, 4, 4);
    dataAttr.writeIntLE(dataJson.dataNum, 8, 4);
    for (var i = 0; i < dataJson.dataNum; i++) {
        data.writeIntLE(dataJson.carType, 0 + i, 4);
        data.writeIntLE(dataJson.chargeMode, 4 + i, 4);
        data.writeIntLE(dataJson.parkPeriod, 8 + i, 4);
        data.writeIntLE(dataJson.perTimeCharge, 12 + i, 1);
        data.writeIntLE(dataJson.perTime, 13 + i, 4);
        data.writeIntLE(dataJson.perTimeCost, 17 + i, 4);
        data.writeIntLE(dataJson.Cost, 21 + i, 4);
    }
    var result = Buffer.concat([head, dataAttr, data], 20 + 25 * (dataJson.dataNum))
    return result;
}

function VirtualRule(DataJson){         //保留字段
    var dataJson = JSON.parse(DataJson);
    var head = Buffer.from('db040000749f8ad3', 'hex');
    var dataAttr = Buffer.alloc(12);
    var data = Buffer.alloc(72 * (dataJson.dataNum));
    dataAttr.writeIntLE(20 + 72 * (dataJson.dataNum), 0, 4);
    dataAttr.writeIntLE(dataJson.dataType, 4, 4);
    dataAttr.writeIntLE(dataJson.dataNum, 8, 4);
    for (var i = 0; i < dataJson.dataNum; i++) {
        data.writeIntLE(dataJson.carType, 0 + i, 4);
        data.writeIntLE(dataJson.chargeMode, 4 + i, 4);
        //可使用部分有64字节
    }
    var result = Buffer.concat([head, dataAttr, data], 20 + 72 * (dataJson.dataNum))
    return result;
}

function TRecordInOutLog(DataJson) {        //存在问题
    var dataJson = JSON.parse(DataJson);
    var head = Buffer.from('db040000749f8ad3', 'hex');
    var dataAttr = Buffer.alloc(12);
    var data = Buffer.alloc(78*(dataJson.dataNum));
    dataAttr.writeIntLE(20+78*(dataJson.dataNum),0,4);
    dataAttr.writeIntLE(dataJson.dataType,4,4);
    dataAttr.writeIntLE(dataJson.dataNum,8,4);
    for(var i=0;i<dataJson.dataNum;i++){
        data.writeIntLE(dataJson.recordID,0+i,4);
        data.writeIntLE(dataJson.timeSecond,4+i,4); //时间格式：[(year-100)*12*31+mon*31+day-1]+(hour*60+min)*60+sec
        data.writeIntLE(dataJson.plateNumber,8+i,1);
        data.writeIntLE(dataJson.cardNumber,9+i,1);
        data.writeIntLE(dataJson.inOutState,10+i,4);
        data.writeIntLE(dataJson.eventAddr,10+i,4);
        data.writeIntLE(dataJson.eventType,10+i,4);
        data.writeIntLE(dataJson.photoPath,10+i,4);
        data.writeIntLE(dataJson.isUploadFlag,10+i,4);
        data.writeIntLE(dataJson.isLeave,10+i,4);
    }
    var result = Buffer.concat([head,dataAttr,data],20+78*(dataJson.dataNum))
    return result;
}
/**
 * 以上为SetDeviceData（1243）解析部分
 * */

function SetOfflineParam(ServerIP,ServerPort,ParkID,isRecordCover,parkInOutFlag,MonthcarAlarmDays,RecognitionAccuracy,RecordMatchAccuracy,MonthCarToTempcarFlag,MonthCarOpenType,TempCarOpenType,MinCharge,TempCarForbiddenFlag,SyncTimeFromMaster,OnlineFlag,OneChannelMode,OneChannelWaitTime,NormalModeWaitTime,MinChargeFlag,DisplayRefreshInterval,PropertyLogo,ScreenType) {    //1244
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
    var data = Buffer.alloc(156);
    var PropertyLogoGBK = iconv.encode(data.PropertyLogo,'GB2312');
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
    PropertyLogoGBK.copy(data,58,0);               /**< 脱机显示屏默认显示的企业标识 */
    data.writeIntLE(ScreenType,124,1);             /**< 显示屏类型， 参考枚举ScreenType */
        //保留字段长度：31
    var result = Buffer.concat([head,data],168);
    return result;
}

function GetOfflineParam() {
    var result = Buffer.from('dd040000749f8ad30c000000','hex');
    return result;
}

function GetDeviceDataCount(DataType,IDFilter) {     //1248
    //int Datatype:需要读取的数据类型，目前仅支持3、4、5、7
    //int IDFilter:用于过滤数据的ID值，仅会取到大于该ID的数据
    var head = Buffer.from('e0040000749f8ad314000000','hex');
    var data = Buffer.alloc(8);
    data.writeIntBE(DataType,0,4);
    //数据类型，目前仅支持3、 4、 5、 7
    // typedef enum _FCT_TYPE_E
    // {
    //     FCT_TEMP_CAR_CHARGE_RULE = 3, //临时车收费规则（ TempCarChargeRule）
    //     FCT_GEN_CHARGE_RULE = 4, //通用收费规则（ GenChargeRule）
    //     FCT_RECORD_IN_OUT_LOG = 5, //记录表（ RecordLog）
    //     FCT_CHARGE_LOG = 7, //收费表（ ChargeLog）
    //     FCT_MODEL_PARAM = 8, //模型参数（ ModelParam）
    //     FCT_C3USER = 51,
    //     FCT_FINGERTMP_V10 = 52, //兼容pull协议代码
    // }FCT_TYPE_E;
    data.writeIntBE(IDFilter,4,4);      //ID值，过滤数据用， 只能取到大于此ID值的数据，只有当数据类型为5、 7时， ID值才有效
    var result = Buffer.concat([head,data],20);
    console.log(result);
    return result;
}

function GetDeviceData(DataType,IDFilter,Offset,DataNum) {      //1250  待补充
    var head = Buffer.from('e2040000749f8ad31c000000','hex');
    var data = Buffer.alloc(16);
    data.writeIntBE(DataType,0,4);
    //数据类型，目前仅支持3、 4、 5、 7
    // typedef enum _FCT_TYPE_E
    // {
    //     FCT_TEMP_CAR_CHARGE_RULE = 3, //临时车收费规则（ TempCarChargeRule）
    //     FCT_GEN_CHARGE_RULE = 4, //通用收费规则（ GenChargeRule）
    //     FCT_RECORD_IN_OUT_LOG = 5, //记录表（ RecordLog）
    //     FCT_CHARGE_LOG = 7, //收费表（ ChargeLog）
    //     FCT_MODEL_PARAM = 8, //模型参数（ ModelParam）
    //     FCT_C3USER = 51,
    //     FCT_FINGERTMP_V10 = 52, //兼容pull协议代码
    // }FCT_TYPE_E;
    data.writeIntBE(IDFilter,4,4);      //ID值，过滤数据用， 只能取到大于此ID值的数据，只有当数据类型为5、 7时， ID值才有效
    data.writeIntBE(Offset,8,4);       //读取偏移量。 为防止一次未读完的情况， 设置当前要读的偏移量， 以便新偏移量重新发送请求
    data.writeIntBE(DataNum,12,4);      //读取数据个数
    var result = Buffer.concat([head,data],28);
    return result;
}

function TimeChangeNotify() {      //1254
    var result = Buffer.from('e6040000749f8ad30c000000','hex');
    return result;
}

function ClearDeviceData(DataType) {      //1255    暂时无法清除5、7
    //int DataType:需要清除的数据类型
    var head = Buffer.from('e7040000749f8ad310000000','hex');
    var data = Buffer.alloc(4);
    data.writeIntBE(DataType,0,4);
    // 需要清除的数据类型
    // typedef enum _DATA_TABLE_TYPE_E
    // {
    //     FCT_TEMP_CAR_CHARGE_RULE = 3: result = '临时车收费规则（ TempCarChargeRule） */
    //         FCT_GEN_CHARGE_RULE = 4: result = '通用收费规则（ GenChargeRule） */
    //         FCT_RECORD_IN_OUT_LOG = 5: result = '记录表（ RecordLog） */
    //         FCT_CHARGE_LOG = 7: result = '收费表（ ChargeLog） */
    //         FCT_MODEL_PARAM = 8: result = '模型参数（ ModelParam） */
    // }
    var result = Buffer.concat([head,data],16);
    return result;
}

function AddPlateListReq(ListType,PlateNum,PlateDataArray) {      //1269
    //int ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    //int PlateNum：车牌数
    //PlateDataArray[PlateNum]：车牌信息
    //  {str Plate：车牌号
    //  str InDate：入场日期，格式2018.06.07
    //  str OutDate：出场日期，格式2018.06.07}
    //范例：buf = AddPlateListReq(1,2,[{Plate:'粤TA5467',InDate:'2017-06-07',OutDate:'2018-06-07'},{Plate:'粤TA5468',InDate:'2017-03-04',OutDate:'2018-03-05'}]);
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

function DelPlateListReq(ListType,PlateNum,PlateDataArray) {      //1271
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
        var InDate_Year = parseInt(PlateDataArray[i].InDate.split('.')[0]);
        var InDate_Month = parseInt(PlateDataArray[i].InDate.split('.')[1]);
        var InDate_Day = parseInt(PlateDataArray[i].InDate.split('.')[2]);
        var OutDate_Year = parseInt(PlateDataArray[i].OutDate.split('.')[0]);
        var OutDate_Month = parseInt(PlateDataArray[i].OutDate.split('.')[1]);
        var OutDate_Day = parseInt(PlateDataArray[i].OutDate.split('.')[2]);
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

function SetDColorDLineSCNParam(CountryCode,FirstLineColor,SecondLineColor,MoveDirection1,MoveDirection2,MoveSpeed,ShowTimer,Volume,FirstLinedef,TimeSync,CurTimer) {     //1273
    // CountryCode:国家编码
    // FirstLineColor:第一行显示颜色(0:红色,1:绿色)
    // SecondLineColor:第二行显示颜色(0:红色,1:绿色)
    // MoveDirection1:第一行滚动方向(0:从左到右,1:从右到左)
    // MoveDirection2:第二行滚动方向(0:从左到右,1:从右到左)
    // MoveSpeed:移动速度(0-100)
    // ShowTimer:显示时长(0-100s)
    // Volume:音量大小(0-31)
    // FirstLinedef:第一行默认显示信息
    // TimeSync:是否时间同步
    // CurTimer:当前时间，格式如'2018.06.07.04.20.20.57'即：2018年6月7日星期四20点20分57秒
    var data_time = CurTimer.split(".");
    var data_year = parseInt(data_time[0]) - 2000;
    var data_mon = parseInt(data_time[1]);
    var data_day = parseInt(data_time[2]);
    var data_week = parseInt(data_time[3]);
    var data_hour = parseInt(data_time[4]);
    var data_min = parseInt(data_time[5]);
    var data_sec = parseInt(data_time[6]);
    var head = Buffer.from('f9040000749f8ad35e000000','hex');
    var data = Buffer.alloc(82);
    data.writeIntLE(CountryCode, 0, 4);
    data.writeIntLE(FirstLineColor, 4, 2);
    data.writeIntLE(SecondLineColor, 6, 2);
    data.writeIntLE(MoveDirection1, 8, 2);
    data.writeIntLE(MoveDirection2, 10, 2);
    data.writeIntLE(MoveSpeed, 12, 4);
    data.writeIntLE(ShowTimer, 16, 4);
    data.writeIntLE(Volume, 20, 4);
    data.write(FirstLinedef, 24, 50);
    data.writeIntLE(TimeSync, 74, 1);
    data.writeIntLE(data_year, 75, 1);
    data.writeIntLE(data_mon, 76, 1);
    data.writeIntLE(data_day, 77, 1);
    data.writeIntLE(data_week, 78, 1);
    data.writeIntLE(data_hour, 79, 1);
    data.writeIntLE(data_min, 80, 1);
    data.writeIntLE(data_sec, 81, 1);
    var result = Buffer.concat([head,data],94);
    return result;
}

function MessageDisplay(data){      //1224
    //在双色屏上显示输入信息
    //data:{devAddress:设备地址，目前统一设定为66,
    //      upColor:上方显示信息颜色（'red'：红色，'green'：绿色）,
    //      upMsg:上方显示信息内容,
    //      downColor:下方显示信息颜色（'red'：红色，'green'：绿色）,
    //      downMsg:下方显示信息内容
    //      }
    //颜色统一设置
    data.upColor = "green";
    data.downColor = "red";
    //因为设备无法返回信息，暂时未添加流水号功能
    if (!(data.upColor && data.upMsg) && !(data.downColor && data.downMsg)){
        console.log('请至少输入一个完整的信息（包括颜色）！！');
        return null;
    }
    else {
        var head = Buffer.from('c8040000749f8ad3','hex');
        var upMsgCode = null;
        var downMsgCode = null;
        var upColorCode = null;
        var downColorCode = null;
        var upLenCode = Buffer.alloc(2);
        var downLenCode = Buffer.alloc(2);

        if (data.upColor && data.upMsg) {
            upMsgCode = iconv.encode(data.upMsg, 'GB2312');
            switch (data.upColor) {
                case 'red':
                    upColorCode = Buffer.from('00', 'hex');
                    break;
                case 'green':
                    upColorCode = Buffer.from('01', 'hex');
                    break;
                default:
                    console.log('设备第一行不支持显示颜色：' + data.upColor);
                    break;
            }
            var upLen = upMsgCode.length + upColorCode.length;
            upLenCode.writeIntLE(upLen);
        }
        if (data.downColor && data.downMsg){
            downMsgCode = iconv.encode(data.downMsg, 'GB2312');
            switch (data.downColor) {
                case 'red':
                    downColorCode = Buffer.from('00', 'hex');
                    break;
                case 'green':
                    downColorCode = Buffer.from('01', 'hex');
                    break;
                default:
                    console.log('设备第二行不支持显示颜色：' + data.downColor);
                    break;
            }
            var downLen = downMsgCode.length + downColorCode.length;
            downLenCode.writeIntLE(downLen);
        }
        var dataHead = Buffer.alloc(7);
        dataHead.write('AA', 0, 'hex');       //数据头部
        dataHead.writeIntLE(data.devAddress, 1);       //设备地址
        dataHead.write('0000AE', 2, 'hex');   //固定流水号为0，功能号为174
        var upFlag = Buffer.from('23', 'hex');   //第一行信息类型对应35
        var downFlag = Buffer.from('24', 'hex'); //第二行信息类型对应36
        var dataBody = null;
        if (upMsgCode && !downMsgCode){
            dataBody = Buffer.concat([upFlag, upLenCode, upColorCode, upMsgCode]);
        }
        else if (!upMsgCode && downMsgCode){
            dataBody = Buffer.concat([downFlag, downLenCode, downColorCode, downMsgCode]);
        }
        else if (upMsgCode && downMsgCode){
            //console.log('upLenCode:',upLenCode);
            var dataBodyUp = Buffer.concat([upFlag, upLenCode, upColorCode, upMsgCode]);
            var dataBodyDown = Buffer.concat([downFlag, downLenCode, downColorCode, downMsgCode]);
            dataBody = Buffer.concat([dataBodyUp, dataBodyDown]);
        }
        dataHead.writeIntLE(dataBody.length, 5, 2);
        var dataWithoutVerify = Buffer.concat([dataHead, dataBody]);
        var dataVerifyPart = dataWithoutVerify.slice(1, dataWithoutVerify.length);
        var dataVerify = crc.crcToBuf(dataVerifyPart);
        var dataBuf = Buffer.concat([dataWithoutVerify, dataVerify]);
        var lenBuf = Buffer.alloc(4);
        lenBuf.writeIntLE(dataBuf.length + 12);

        var result = Buffer.concat([head, lenBuf, dataBuf]);
        return result;
    }
}

function Broadcast(data){       //1224
    //向设备发送播报语音信息
    //data:{
    //      devAddress:设备地址，目前统一设定为66,
    //      voiceMessage:语音信息，例如'粤K47855'
    // }
    //因为设备无法返回信息，暂时未添加流水号功能
    //暂时无法编辑数据库，采用手动输入语音编号的方式，此时voiceMessage为数组    TODO
    if (!data.voiceMessage) {
        console.log('未检测到语音信息！请检查发送对象格式是否有误。');
        return null;
    }
    else {
        var head = Buffer.from('c8040000749f8ad3','hex');

        var dataHead = Buffer.alloc(7);
        dataHead.write('AA', 0, 'hex');       //数据头部
        dataHead.writeIntLE(data.devAddress, 1);       //设备地址
        dataHead.write('0000B1', 2, 'hex');   //固定流水号为0，功能号为177
        dataHead.writeIntLE(data.voiceMessage.length * 2, 5);   //语音信息长度
        var dataBody = Buffer.alloc(data.voiceMessage.length * 2);
        for(let i = 0; i < data.voiceMessage.length; i++){
            dataBody.writeIntLE(data.voiceMessage[i], i*2, 2);
        }
        var dataWithoutVerify = Buffer.concat([dataHead, dataBody]);
        var dataVerifyPart = dataWithoutVerify.slice(1, dataWithoutVerify.length);
        var dataVerify = crc.crcToBuf(dataVerifyPart);
        var dataBuf = Buffer.concat([dataWithoutVerify, dataVerify]);
        var lenBuf = Buffer.alloc(4);
        lenBuf.writeIntLE(dataBuf.length + 12);

        var result = Buffer.concat([head, lenBuf, dataBuf]);
        return result;
    }

}

function SetClientType(type) {      //设置客户端类型
    //type: 0-普通客户端  1-web客户端  2-demo客户端
    var head = Buffer.from('d8040000749f8ad310000000','hex');
    var data = Buffer.alloc(4);
    data.writeIntLE(type, 0);
    var result = Buffer.concat([head,data]);
    return result;
}



module.exports = {
    SetPlateListReq:SetPlateListReq,
    OpenGate:OpenGate,
    GetPlateListReq:GetPlateListReq,
    RecogByManualReq:RecogByManualReq,
    SetDevSN:SetDevSN,
    GetDevSNq:GetDevSNq,
    SetBaseParam:SetBaseParam,
    GetBaseParamq:GetBaseParamq,
    SendHeartBeat:SendHeartBeat,
    SetOfflineParam:SetOfflineParam,
    GetOfflineParam:GetOfflineParam,
    GetDeviceDataCount:GetDeviceDataCount,
    GetDeviceData:GetDeviceData,
    TimeChangeNotify:TimeChangeNotify,
    ClearDeviceData:ClearDeviceData,
    AddPlateListReq:AddPlateListReq,
    DelPlateListReq:DelPlateListReq,
    SetDColorDLineSCNParam:SetDColorDLineSCNParam,
    MessageDisplay:MessageDisplay,
    Broadcast:Broadcast,
    SetClientType:SetClientType,
    ClearPlateList:ClearPlateList,
};