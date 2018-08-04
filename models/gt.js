const mysql = require('../middleware/MySQLPool');
module.exports = {
    //根据id查询
    async findById(gtId){
        return await mysql.table('parking_gt').where({gt_id:gtId}).find().then(function (data) {
            return data.gt_id!=null?data:null;
        });
    },
    //根据Ip查询岗亭
    async findByIp(clientIp){
        return await mysql.table('parking_gt').where({gt_ip:clientIp}).find().then(function (data) {
            return data.gt_ip!=null?data:null;
        });
    },
    //将岗亭信息写入数据库，融合了插入与更新
    async save(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            let IDRep = {gt_id: data[i].gtId};
            let dataToSql = {
                gt_id: data[i].gtId,
                gt_name: data[i].gtName,
                gt_ip: data[i].gtIp,
                del_tag: data[i].deltag,
                parking_exit_id: data[i].parkingExitId,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_gt').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_gt').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_gt').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_gt').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    }
};
