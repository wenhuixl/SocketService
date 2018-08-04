/**
 * Created by wenhui on 18-6-6.
 * 停车对象
 */

/**车牌识别信息*/
function licensePlate (szTime, nProcessTime, nPlateNum, szLicense, nLetterCount, fConfidence, rectLeft, rectRight, rectTop, rectBottom, plateColor, bDoublePlates, platePicturePath) {
    this.szTime = szTime;              // 触发时间. 格式为：20161012163417050,即2016年10月12日16点34分17秒050毫秒
    this.nProcessTime = nProcessTime;  // 当前图片的处理时间
    this.nPlateNum = nPlateNum;        // 当前识别的车牌数量
    this.szLicense = szLicense;        // 车牌名称
    this.nLetterCount = nLetterCount;  // 字符数量
    this.fConfidence = fConfidence;    // 车牌的可信度,取值范围[1,100]. 值越小，可信度越高
    this.rectLeft = rectLeft;          // 车牌位置
    this.rectRight = rectRight;
    this.rectTop = rectTop;
    this.rectBottom = rectBottom;
    this.plateColor = plateColor;      // 车牌颜色
    this.bDoublePlates = bDoublePlates;// 是否双层车牌
    this.platePicturePath = platePicturePath; // 车牌图片路径
}

/**车牌识别图片*/
function licensePhoto (szTime, base64Image) {
    this.szTime = szTime;              // 触发时间. 格式为：20161012163417050,即2016年10月12日16点34分17秒050毫秒
    this.base64Image = base64Image;    // 识别车牌图片 base64
}

/**名单信息*/
function listBanner (szType, nListNum, szLicense, szBeginTime, szEndTime) {
    this.szType = szType;               // 名单类型，0白名单，1黑名单，2固定车名单
    this.nListNum = nListNum;           // 名单数量
    this.szLicense = szLicense;         // 车牌名称
    this.szBeginTime = szBeginTime;     // 开始时间
    this.szEndTime = szEndTime;         // 结束时间
}

/**脱机参数*/
function offlineParam(serverIP, serverPort, parkID, isRecordCover, parkInOutFlag, monthcarAlarmDays,
                      recognitionAccuracy, recordMatchAccuracy, monthCarToTempcarFlag, monthCarOpenType, tempCarOpenType, minCharge,tempCarForbiddenFlag,
                      syncTimeFromMaster, onlineFlag, oneChannelMode, oneChannelWaitTime, normalModeWaitTime, minChargeFlag, displayRefreshInterval,
                      propertyLogo, screenType) {
    this.serverIP = serverIP,                               // 主服务器IP地址.字符串IP格式
    this.serverPort = serverPort,                           // 主服务器端口
    this.parkID = parkID,                                   // 车场编号
    this.isRecordCover = isRecordCover,                     // 记录（ 出入场记录和收费记录） 是否覆盖， 1： 覆盖， 0： 不覆盖
    this.parkInOutFlag = parkInOutFlag,                     // 车场出入口标识，车场入口0，车场出口1
    this.monthcarAlarmDays = monthcarAlarmDays,             // 固定车预警天数
    this.recognitionAccuracy = recognitionAccuracy,         // 固定车匹配精度， 99： 精确匹配
    this.recordMatchAccuracy = recordMatchAccuracy,         // 记录匹配精度， 99： 精确匹配
    this.monthCarToTempcarFlag = monthCarToTempcarFlag,     // 启用固定车转临时车，0：否，1：是
    this.monthCarOpenType = monthCarOpenType,               // 固定车开闸方式，0：人工开闸，1：自动开闸
    this.tempCarOpenType = tempCarOpenType,                 // 临时车开闸方式，0：人工开闸，1：自动开闸
    this.minCharge = minCharge,                             // 最低收费
    this.tempCarForbiddenFlag = tempCarForbiddenFlag,       // 临时车禁止出入场， 0： 可出入场， 1： 不可出入场
    this.syncTimeFromMaster = syncTimeFromMaster,           // 时间点，格式如2305（时间点为23:05）
    this.onlineFlag = onlineFlag,                           // 是否在线模式，0：脱机，1：在线
    this.oneChannelMode = oneChannelMode,                   // 是否启用单通道模式，0：否，1：是
    this.oneChannelWaitTime = oneChannelWaitTime,           // 单通道重复车牌等待时间，以秒为单位
    this.normalModeWaitTime = normalModeWaitTime,           // 正常模式重复车牌等待时间，以秒为单位
    this.minChargeFlag = minChargeFlag,                     // 是否启用最低收费， 0：不启用，1：启用
    this.displayRefreshInterval = displayRefreshInterval,   // 脱机显示屏显示内容的刷新间隔， 以秒为单位
    this.propertyLogo = propertyLogo,                       // 脱机显示屏默认显示的企业标识
    this.screenType = screenType                            // 显示屏类型，参考枚举ScreenType
}

module.exports = {
    LicensePlate: licensePlate,
    LicensePhoto: licensePhoto,
    ListBanner: listBanner,
    OfflineParam: offlineParam
};