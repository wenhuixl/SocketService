/**
 * Created by k186 on 2018/6/15.
 */
var iconv = require('iconv-lite');

function SetPlateListReq(ListType,PlateNum,PlateDataArray) {      //1220
    //int ListType：黑、白、固定车名单位，白：0，黑：1，固定车：2
    //int PlateNum：车牌数
    //PlateDataArray[PlateNum]：车牌信息
    //  {str Plate：车牌号
    //  str InDate：入场日期，格式2018.06.07
    //  str OutDate：出场日期，格式2018.06.07}
    //范例：buf = SetPlateListReq(1,2,[{Plate:'粤TA5467',InDate:'2017.06.07',OutDate:'2018.06.07'},{Plate:'粤TA5468',InDate:'2017.03.04',OutDate:'2018.03.05'}]);
    var head = Buffer.alloc(20);    //头部
    head.writeIntLE(0x4c4,0,4); // 0x4c4,0,4
    head.writeInt32LE(0xd38a9f74,4,4);
    head.writeIntLE(PlateNum*24+20,8,4);
    head.writeIntLE(ListType, 12, 4);
    head.writeIntLE(PlateNum, 16, 4);
    var data = Buffer.alloc(24*PlateNum);//数据部
    for(var i=0;i<PlateNum;i++) {
        // var InDate_Year = parseInt(PlateDataArray[i].InDate.split('.')[0]);
        // var InDate_Month = parseInt(PlateDataArray[i].InDate.split('.')[1]);
        // var InDate_Day = parseInt(PlateDataArray[i].InDate.split('.')[2]);
        // var OutDate_Year = parseInt(PlateDataArray[i].OutDate.split('.')[0]);
        // var OutDate_Month = parseInt(PlateDataArray[i].OutDate.split('.')[1]);
        // var OutDate_Day = parseInt(PlateDataArray[i].OutDate.split('.')[2]);
        // iconv.encode(PlateDataArray[i].Plate, 'GB2312').copy(data, 0 + 24*i, 0);    //车牌转码为GB2312
        // data.writeIntLE(InDate_Year, 16 + 24*i, 2);
        // data.writeIntLE(InDate_Month, 18 + 24*i, 1);
        // data.writeIntLE(InDate_Day, 19 + 24*i, 1);
        // data.writeIntLE(OutDate_Year, 20 + 24*i, 2);
        // data.writeIntLE(OutDate_Month, 22 + 24*i, 1);
        // data.writeIntLE(OutDate_Day, 23 + 24*i, 1);
    }
    var result = Buffer.concat([head, data], PlateNum*24+20)
    return result;
}

var buf = SetPlateListReq(1,1,[{Plate:'粤TA5467',InDate:'2017.06.07',OutDate:'2018.06.07'}]);
console.log(buf.toString('hex'));

// console.log(iconv.encode('粤TA5467', 'GB2312').toString('hex'));