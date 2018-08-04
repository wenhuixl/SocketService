const mysql = require('../middleware/MySQLPool');
module.exports = {
    //根据Id查询命令
    async findById(MenuId){
        return await mysql.table('parking_common_menu').where({menu_id:MenuId,del_tag:0,_logic:'AND'}).find().then(function (data) {
            return data.menu_id!=null?data:null;
        });
    },
    //查询所有未删除菜单
    async findAll(){
        return await mysql.table('parking_common_menu').where({del_tag:0}).select().then(function (data) {
            return data !=null && data.length>0 ? data : null;
        });
    },
    //将命令写入数据库，融合了插入与更新
    async save(DataJson){
        let data = DataJson.data;
        let list = new Array();
        for(let i=0;i<data.length;i++) {
            let IDRep = {menu_id: data[i].menuId};
            let dataToSql = {
                menu_id: data[i].menuId,
                menu_name: data[i].menuName,
                menu_url: data[i].menuUrl,
                menu_param: data[i].menuParam,
                del_tag: data[i].deltag,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_common_menu').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_common_menu').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_common_menu').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_common_menu').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    }
};