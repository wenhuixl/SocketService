const mysql = require('../middleware/MySQLPool');
module.exports = {
    //根据账号查询用户，支持邮箱、手机号、工号登录
    async findByAccount(account) {
        return await mysql.table('parking_gt_user').where({
            'email|phone|work_number|user_name': ['EXP', '=\'' + account+'\''],
            del_tag: 0,
            _logic: 'AND'
        }).find().then(function (data) {
            return data.user_id!=null?data:null;
        });
    },

    async save(DataJson) {
        var data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            var IDRep = {user_id: data[i].userId};
            var dataToSql = {
                user_id: data[i].userId,
                user_name: data[i].userName,
                email: data[i].email,
                gender: data[i].gender,
                id_card: data[i].idCard,
                phone: data[i].phone,
                work_number: data[i].workNumber,
                password: data[i].password,
                del_tag: data[i].deltag,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_gt_user').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_gt_user').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_gt_user').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_gt_user').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    // 根据user_id查询指定用户
    async selectByUserId(user_id) {
        return await mysql.table('parking_gt_user').where({user_id: user_id, del_tag: 0}).find().then(function (data) {
            return data;
        }).catch(function (e) {
            console.log(e);
        });
    },
    // 更新用户信息
    async update(where, data) {
        return await mysql.table('parking_gt_user').where(where).update(data).then(function (affectRows) { //返回影响行数
            return affectRows;
        }).catch(function (e) {
            console.log(e);
        });
    }
};