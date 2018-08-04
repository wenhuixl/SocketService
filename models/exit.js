const mysql = require('../middleware/MySQLPool');
module.exports = {
    //根据进出口id查询进出口
    async findById(exit_id){
        return await mysql.table('parking_exit').where({exit_id:exit_id,del_tag:0,_logic: 'AND'}).find().then(function (data) {
            return data.exit_id!=null?data:null;
        });
    },
    async save(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            let IDRep = {exit_id: data[i].parkingExitId}
            let dataToSql = {
                exit_id: data[i].parkingExitId?data[i].parkingExitId:null,
                exit_name: data[i].parkingExitName,
                del_tag: data[i].deltag,
                parking_area_id: data[i].parkingAreaId,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_exit').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_exit').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_exit').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_exit').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    }
}