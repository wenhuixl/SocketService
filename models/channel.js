const mysql = require('../middleware/MySQLPool');
const EXIT_TYPE_IN = "00000001";  //入口
const EXIT_TYPE_OUT = "00000002";  //出口
const SFMZM_YES = "00000001";   //是否门中门-是
const SFMZM_NO = "00000000";    //是否门中门-否
const OPEN_TYPE_MANUAL_PASS = "00000001";    //确认放行
const OPEN_TYPE_DIRECT_PASS = "00000002";    //直接放行
const OPEN_TYPE_PAID_PASS = "00000003";      //缴费放行
const SINGLE_CHANNEL_YES = "00000001";        //开启单通道模式
const SINGLE_CHANNEL_NO = "00000000";         //未开启单通道模式

module.exports = {
    //根据id查询
    async findById(ChannelId){
        return await mysql.table('parking_channel').where({channel_id:ChannelId}).find().then(function (data) {
            return data.channel_id!=null?data:null;
        });
    },
    //根据主设备id进行查询
    async findByDevice1(deviceId){
        return await mysql.table('parking_channel').where({device1_id:deviceId}).find().then(function (data) {
            return data.channel_id!=null?data:null;
        });
    },
	//根据进出口id查询通道列表
    async findListByExitId(parkingExitId){
        return await mysql.table('parking_channel').where({parking_exit_id:parkingExitId,del_tag:0,_logic: 'AND'}).select().then(function (data) {
            return data;
        });
    },
    //根据管理岗亭id查询通道列表
    async findListByGlGtId(glGtId){
        return await mysql.table('parking_channel').where({gl_gt_id:glGtId,del_tag:0,_logic: 'AND'}).select().then(function (data) {
            return data;
        });
    },
    // 根据出入口parking_exit_id查询指定设备信息
    async findDeviceByExitId(parkingExitId) {
        var sql =  'SELECT * FROM `parking_channel` INNER JOIN `parking_device` ON parking_channel.`device1_id`=parking_device.`device_id` OR parking_channel.`device2_id`=parking_device.`device_id` WHERE ( `parking_exit_id` = %s ) ';
        var data = [parkingExitId];
        return await mysql.query(sql, data).then(function (data) {
            return data;
        }).catch(function (err) {
            console.log(err);
        });
    },
    async save(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for(let i=0;i<data.length;i++) {
            let IDRep = {channel_id: data[i].channelId};
            let dataToSql = {
                channel_id: data[i].channelId,
                channel_name: data[i].channelName,
                device1_id: data[i].device1==undefined? null:data[i].device1,
                device2_id: data[i].device2==undefined? null:data[i].device2,
                device1_pos: data[i].device1Pos==undefined? null:data[i].device1Pos,
                device2_pos: data[i].device2Pos==undefined? null:data[i].device2Pos,
                fixed_car_open_type: data[i].fixedCarOpenType,
                tmp_car_open_type: data[i].tmpCarOpenType,
                exit_type: data[i].exitType,
                del_tag: data[i].deltag,
                parking_exit_id: data[i].parkingExitId==undefined? null:data[i].parkingExitId,
                sfmzm: data[i].sfmzm,
                in_parking_lot_id: data[i].inParkingLotId==undefined? null:data[i].inParkingLotId,
                out_parking_lot_id: data[i].outParkingLotId==undefined? null:data[i].outParkingLotId,
                gl_gt_id:data[i].parkingGtId==undefined? null:data[i].parkingGtId,
                single_channel: data[i].singleChannel==undefined? null:data[i].singleChannel,
                sync_time: DataJson.sendtime
            };
            list.push(dataToSql);
            await mysql.table('parking_channel').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_channel').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_channel').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_channel').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    async getExitTypeIn(){
        return EXIT_TYPE_IN;
    },
    async getExitTypeOut(){
        return EXIT_TYPE_OUT;
    },
    async getSfmzmYes(){
        return SFMZM_YES;
    },
    async getSfmzmNo(){
        return SFMZM_NO;
    },
    async getOpenTypeManualPass(){
        return OPEN_TYPE_MANUAL_PASS;
    },
    async getOpenTypeDirectPass(){
        return OPEN_TYPE_DIRECT_PASS;
    },
    async getOpenTypePaidPass(){
        return OPEN_TYPE_PAID_PASS;
    },
    async getSingleChannelYes(){
        return SINGLE_CHANNEL_YES;
    },
    async getSingleChannelNo(){
        return SINGLE_CHANNEL_NO;
    }
};