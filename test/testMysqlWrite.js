/**
 * Create by kaka in 2018.06.12
 *
 * */

var mysqlCon = require('../middleware/MySQLPool');

function ParkingLotMsgToSql(DataJson) {      //Json解析
    var data = DataJson.data;
    var IDRep = {plot_id:data.parkingLotId}
    var dataToSql = {
        plot_id:data.parkingLotId,
        plot_no:data.parkingLotNo,
        plot_name:data.parkingLotName,
        del_tag:data.deltag,
        sync_time:DataJson.sendtime
    }
    mysqlCon.table('parking_lot').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })
    mysqlCon.table('parking_lot').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
}

function UserMsgToSql(DataJson) {      //Json解析
    var data = DataJson.data;
    var IDRep = {user_id:data.userId};
    var dataToSql = {
        user_id : data.userId,
        user_name : data.userName,
        email : data.email,
        gender : data.gender,
        id_card : data.idCard,
        phone : data.phone,
        work_number : data.workNumber,
        password : data.password,
        del_tag : data.deltag,
        sync_time : DataJson.sendtime
    }
    mysqlCon.table('parking_gt_user').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
    mysqlCon.table('parking_gt_user').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })

}

function ParkingAreaMsgToSql(DataJson) {
    var data = DataJson.data;
    var IDRep = {area_id:data.parkingAreaId}
    var dataToSql = {
        area_id:data.parkingAreaId,
        area_name:data.parkingAreaName,
        del_tag:data.deltag,
        parking_plot_id:data.parkingLotId,
        sync_time:DataJson.sendtime
    }
    mysqlCon.table('parking_area').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })
    mysqlCon.table('parking_area').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
}

function ChennelMsgToSql(DataJson) {
    var data = DataJson.data;
    var IDRep = {channel_id:data.channelId}
    var dataToSql = {
        channel_id:data.channelId,
        channel_name:data.channelName,
        device1_id:data.device1,
        device2_id:data.device2,
        device1_pos:device1Pos,
        device2_pos:device2Pos,
        fixed_car_open_type:fixedCarOpenType,
        tmp_car_open_type:tmpCarOpenType,
        exit_type:exitType,
        del_tag:deltag,
        parking_exit_id:parkingExitId,
        sfmzm:sfmzm,
        in_parking_log_id:inParkingLotId,
        out_parking_lot_id:outParkingLotId,
        sync_time:DataJson.sendtime
    }
    mysqlCon.table('parking_channel').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })
    mysqlCon.table('parking_channel').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
}

function ExitMsgToSql(DataJson) {
    var data = DataJson.data;
    var IDRep = {exit_id:data.parkingExitId}
    var dataToSql = {
        exit_id:data.parkingExitId,
        exit_name:data.parkingExitName,
        del_tag:deltag,
        parking_area_id:parkingAreaId,
        sync_time:DataJson.sendtime
    }
    mysqlCon.table('parking_exit').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })
    mysqlCon.table('parking_exit').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
}

function DeviceMsgToSql(DataJson) {
    var data = DataJson.data;
    var IDRep = {device_id:data.deviceId}
    var dataToSql = {
        device_id:data.deviceId,
        device_name:data.deviceName,
        device_ip:data.deviceIp,
        device_port:data.devicePort,
        device_sn:data.deviceSn,
        install_time:data.installTime,
        gateway_id:data.gwId,
        del_tag:data.deltag,
        enable:enable,
        sync_time:DataJson.sendtime
    }
    mysqlCon.table('parking_device').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })
    mysqlCon.table('parking_device').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
}

function GateMsgToSql(DataJson) {
    var data = DataJson.data;
    var IDRep = {gt_id:data.gtId}
    var dataToSql = {
        gt_id:data.gtId,
        gt_name:data.gtName,
        gt_ip:data.gtIp,
        del_tag:data.deltag,
        parking_exit_id:data.parkingExitId,
        sync_time:DataJson.sendtime
    }
    mysqlCon.table('parking_gt').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })
    mysqlCon.table('parking_gt').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
}

function GateWorkMsgToSql(DataJson) {
    var data = DataJson.data;
    var IDRep = {gt_id:data.gtId}
    var dataToSql = {
        gt_id:data.gtId,
        gt_name:data.gtName,
        gt_ip:data.gtIp,
        del_tag:data.deltag,
        parking_exit_id:data.parkingExitId,
        sync_time:DataJson.sendtime
    }
    mysqlCon.table('parking_shift_work').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })
    mysqlCon.table('parking_shift_work').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
}

function MenuToSql(DataJson) {
    var data = DataJson.data;
    var IDRep = {menu_id:data.menuId};
    var dataToSql = {
        menu_id:data.menuId,
        menu_name:data.menuName,
        menu_url:data.menuUrl,
        menu_param:data.menuParam,
        del_tag:data.deltag,
        sync_time:DataJson.sendtime
    }
    mysqlCon.table('parking_shift_work').thenAdd(dataToSql,IDRep).then(function (ID) {
        console.log('插入ID：'+ID)
    })
    mysqlCon.table('parking_shift_work').where(IDRep).update(dataToSql).then(function(affectRows){
        console.log('影响行数：' + affectRows)
    })
}



var json_parkinglot = {data: {parkingLotId:180611,parkingLotName:"某停车场1",parkingLotNo:"testnum",deltag:0},sendtime: "2018-06-07 17:40:00"}
var json_user = {data:{userId:23,userName:"kaka",email:"email",gender:1,idCard:"1654561",phone:"1888888888",workNumber:"110",password:"77777",deltag:0},sendtime:"2018-06-12 12:40:00"}
//ParkingLotMsgToSql(json_parkinglot)
UserMsgToSql(json_user)

