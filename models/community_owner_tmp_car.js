const mysql = require('../middleware/MySQLPool');
const moment = require('moment');
module.exports = {
    //根据车牌查询业主临时车
    async findListByPlate(plate){
        return await mysql.table('parking_community_owner_tmp_car').where({plate_number:plate,del_tag:0,_logic: 'AND'}).select().then(function (data) {
            return data != null && data.length > 0 ? data : null;
        });
    },
    //根据车牌判断是否业主临时车
    async isCommunityOwner(plate){
        return await mysql.table('parking_community_owner_tmp_car').where({plate_number:plate,del_tag:0,_logic: 'AND'}).select().then(function (data) {
            return data != null && data.length > 0;
        });
    },
    // 保存
    async save(dataJson) {
        let data = dataJson.data;
        let list = new Array();
        for(let i = 0; i < data.length; i++) {
            let IDRep = {auth_id: data[i].authId}; // 授权ID
            let dataToSql = {
                auth_id: data[i].authId == undefined? null:data[i].authId,
                plate_number: data[i].plateNumber == undefined? null:data[i].plateNumber,
                car_type_id: data[i].carTypeId == undefined? null:data[i].carTypeId,
                del_tag: data[i].deltag == undefined? null:data[i].deltag,
                sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };
            list.push(dataToSql);
            await mysql.table('parking_community_owner_tmp_car').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
        }
        if(list.length > 0) {
            await mysql.table('parking_community_owner_tmp_car').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    }
};