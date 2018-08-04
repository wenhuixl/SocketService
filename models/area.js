const mysql = require('../middleware/MySQLPool');
module.exports = {
    //根据区域id查询区域
    async findById(area_id){
        return await mysql.table('parking_area').where({area_id:area_id,del_tag:0,_logic: 'AND'}).find().then(function (data) {
            return data.area_id!=null?data:null;
        });
    },
    async save(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for(let i=0;i<data.length;i++) {
            let IDRep = {area_id:data[i].parkingAreaId};
            let dataToSql = {
                area_id: data[i].parkingAreaId,
                area_name: data[i].parkingAreaName,
                del_tag: data[i].deltag,
                parking_lot_id: data[i].parkingLotId,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_area').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_area').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_area').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_area').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    }
};