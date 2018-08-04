const mysql = require('../middleware/MySQLPool');
module.exports = {
    //根据Id查询车场信息
    async findById(LotId) {
        return await mysql.table('parking_lot').where({
            plot_id: LotId,
            del_tag: 0,
            _logic: 'AND'
        }).find().then(function (data) {
            return data.plot_id!=null?data:null;
        });
    },
    //将车场信息写入数据库，融合了插入与更新
    async save(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            let IDRep = {plot_id: data[i].parkingLotId};
            let dataToSql = {
                plot_id: data[i].parkingLotId,
                plot_no: data[i].parkingLotNo,
                plot_name: data[i].parkingLotName,
                del_tag: data[i].deltag,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_lot').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_lot').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_lot').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_lot').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    }
};




