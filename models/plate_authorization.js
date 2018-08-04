const mysql = require('../middleware/MySQLPool');

module.exports = {
    //根据Id查询命令
    async findById(ListId) {
        return await mysql.table('parking_plate_authorization').where({
            plate_authorization_id: ListId,
            del_tag: 0,
            _logic: 'AND'
        }).find().then(function (data) {
            return data.plate_authorization_id != null ? data : null;
        });
    },
    //根据车牌、出入口进行查询
    async findByPlateAndExit(plate,exitId) {
        return await mysql.table('parking_plate_authorization').where({
            plate_number: plate,
            parking_exit_id: exitId,
            del_tag: 0,
            _logic: 'AND'
        }).find().then(function (data) {
            return data.plate_authorization_id != null ? data : null;
        });
    },
    //根据车牌、车场查询授权列表
    async findListByPlateAndLot(plate, lotId) {
        return await mysql.table('parking_plate_authorization').where("end_time>= now() and del_tag=0 and plate_number='" + plate + "' and parking_exit_id in (select exit_id from parking_exit where del_tag=0 and parking_area_id in (select area_id from parking_area where del_tag=0 and parking_lot_id=" + lotId + "))").select().then(function (data) {
            return data != null && data.length ? data : null;
        });
    },
    //根据车牌判断该车是否为某车场固定车
    async isFixedCar(plate, lotId) {
        return await mysql.table('parking_plate_authorization').where("end_time>= now() and del_tag=0 and plate_number='" + plate + "' and parking_exit_id in (select exit_id from parking_exit where del_tag=0 and parking_area_id in (select area_id from parking_area where del_tag=0 and parking_lot_id=" + lotId + "))").select().then(function (data) {
            return data != null && data.length > 0;
        });
    },
    async save(DataJson) {
        var data = DataJson.data;
        var IDRep = {plate_authorization_id: data.Id};
        var dataToSql = {
            plate_authorization_id: data.Id,
            plate_number: data.plateNumbers,
            parking_exit_id: data.parkingExitIds,
            begin_time: data.begintime,
            end_time: data.endtime,
            car_type_id:data.carTypeId,
            del_tag: data.deltag,
            sync_time: DataJson.sendtime
        };
        for (let j in dataToSql) {
            if (!dataToSql[j]) {
                dataToSql[j] = null;
            }
        }
        await mysql.table('parking_plate_authorization').thenAdd(dataToSql, IDRep);
        await mysql.table('parking_plate_authorization').where(IDRep).update(dataToSql);
    },

    async saveFromCloud(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].parkingExitIds.length; j++) {
                if(data[i].plateNumbers) { // 存在车牌数据
                    for (let k = 0; k < data[i].plateNumbers.length; k++) {
                        let IDRep = {
                            plate_authorization_id: data[i].Id,
                            // plate_number: data[i].plateNumbers[k],
                            // parking_exit_id: data[i].parkingExitIds[j]
                        };
                        let dataToSql = {
                            plate_authorization_id: data[i].Id,
                            plate_number: data[i].plateNumbers[k].plateNumber, // 车牌
                            parking_exit_id: data[i].parkingExitIds[j],
                            begin_time: data[i].begintime,
                            end_time: data[i].endtime,
                            car_type_id:data[i].plateNumbers[k].carTypeId, // 车辆类型ID
                            plot_space_id: data[i].plotSpaceId, // 车位ID
                            del_tag: data[i].deltag,
                            sync_time: DataJson.sendtime
                        };
                        for (let l in dataToSql){
                            if(dataToSql[l] == undefined){
                                dataToSql[l] = null;
                            }
                        }
                        list.push(dataToSql);
                        await mysql.table('parking_plate_authorization').where(IDRep).delete().catch(function (err) {
                            console.log(err);
                        });
                        // await mysql.table('parking_plate_authorization').thenAdd(dataToSql, IDRep).catch(function (err) {
                        //     console.log(err);
                        // });
                        // await mysql.table('parking_plate_authorization').where(IDRep).update(dataToSql).catch(function (err) {
                        //     console.log(err);
                        // });
                    }
                } else { // 无车牌数据时处理
                    let IDRep = {
                        plate_authorization_id: data[i].Id,
                        // parking_exit_id: data[i].parkingExitIds[j]
                    };
                    let dataToSql = {
                        plate_authorization_id: data[i].Id,
                        plate_number: '',
                        parking_exit_id: data[i].parkingExitIds[j],
                        begin_time: data[i].begintime,
                        end_time: data[i].endtime,
                        car_type_id: data[i].plateNumbers[k].carTypeId,  // 车辆类型ID
                        plot_space_id: data[i].plotSpaceId, // 车位id
                        del_tag: data[i].deltag,
                        sync_time: DataJson.sendtime
                    };
                    for (let l in dataToSql){
                        if(dataToSql[l] == undefined){
                            dataToSql[l] = null;
                        }
                    }
                    list.push(dataToSql);
                    await mysql.table('parking_plate_authorization').where(IDRep).delete().catch(function (err) {
                        console.log(err);
                    });
                }
            }
        }
        if(list.length > 0) {
            await mysql.table('parking_plate_authorization').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    // 查询全部授权车牌信息
    async selectAll() {
        return await mysql.table('parking_plate_authorization').where({del_tag: 0}).select().then(function (data) {
            return data;
        }).catch(function (e) {
            console.log(e);
        });
    },
    // 按车牌号码分组查询
    async groupSelect() {
        return await mysql.table('parking_plate_authorization').where({del_tag: 0}).group('plate_number').select().then(function (data) {
            return data;
        }).catch(function (e) {
            console.log(e);
        });
    }
};
