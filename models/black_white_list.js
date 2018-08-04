const mysql = require('../middleware/MySQLPool');

//黑白名单常量
const BLACK_LIST = "00000001";
const WHITE_LIST = "00000002";

module.exports = {
    //根据Id查询命令
    async findById(ListId) {
        return await mysql.table('parking_black_white_list').where({
            black_white_list_id: ListId,
            del_tag: 0,
            _logic: 'AND'
        }).find().then(function (data) {
            return data.black_white_list_id!=null?data:null;
        });
    },
    //车牌是否在白名单内
    inWhiteList: async function (plate) {
        return await mysql.table('parking_black_white_list').where("plate_number='" + plate + "' AND plate_type='" + WHITE_LIST + "' AND end_time>= now() AND del_tag=0").select().then(function (data) {
            return data != null && data.length > 0;
        });
    },
    //车牌是否在黑名单内
    async inBlackList(plate){
        return await mysql.table('parking_black_white_list').where("plate_number='"+ plate +"' AND plate_type='" + BLACK_LIST + "' AND del_tag=0").select().then(function (data) {
            return data!=null && data.length>0;
        });
    },
    async save(DataJson){
        let data = DataJson.data;
        let list = new Array();
        for(let i=0;i<data.length;i++) {
            let IDRep = {black_white_list_id: data[i].listId};
            let dataToSql = {
                black_white_list_id: data[i].listId,
                plate_number: data[i].plateNumber,
                plate_type: data[i].plateType,
                begin_time: data[i].begintime,
                end_time: data[i].endtime,
                del_tag: data[i].deltag,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_black_white_list').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_black_white_list').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_black_white_list').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_black_white_list').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    // 查询全部黑名单
    async selectBlackList() {
        return mysql.table('parking_black_white_list').where({del_tag: 0, plate_type: '00000001'}).select().then(function (data) {
            return data;
        }).catch(function (e) {
            console.log(e);
        });
    },
    // 查询全部白名单
    async selectWhiteList() {
        return mysql.table('parking_black_white_list').where({del_tag: 0, plate_type: '00000002'}).select().then(function (data) {
            return data;
        }).catch(function (e) {
            console.log(e);
        });
    }
};