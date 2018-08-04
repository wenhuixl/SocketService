/**
 * Create by kaka in 2018.06.11
 *
 * */

var mysql = require('mysql');

var mysqlCon = mysql.createPool({     //与数据库建立连接池
    host:'192.168.1.121',
    user:'root',
    password:'root',
    port:'3308',
    database:'pop_local',
    multipleStatements : true
});

function ParkingLotMsgToSql(DataJson) {      //Json解析
    var dataJson = JSON.parse(DataJson);
    var data = dataJson.data;
    var plot_id = data.parkingLotId;
    var plot_no = data.parkingLotNo;
    var plot_name = data.parkingLotName;
    var del_tag = data.deltag;
    var sync_time = dataJson.sendtime;

    var sql_isDataExist = function (callback) {     //判断该数据ID是否已存在于数据库
        var sql_judge = 'select plot_id from parking_lot where plot_id = ' + plot_id;
        mysqlCon.getConnection(function (err, conn) {
            if (err) {
                callback(err.stack);
            }
            else {
                conn.query(sql_judge, function (err, result) {
                    if (err) {
                        console.log(err.stack)
                    }
                    conn.release();
                    console.log(result);
                    callback(result);
                })
            }
        })
        // mysqlCon.query(sql_judge, function (err, result) {
        //     if (err) {
        //         console.log('link-wrong:' + err.stack);
        //         return;
        //     }
        //     callback(result)        //回调传出数据
        // })
    }

    sql_isDataExist(function (result) {   //根据判断将数据插入或更新
        mysqlCon.getConnection(function (err, conn) {
            if (err) {
                callback(err, null, null);
            }
            else {
                if (result == 0) {
                    var sql_cmd = 'insert into parking_lot values(?,?,?,?,?)'
                    var sql_mem = [plot_id, plot_no, plot_name, del_tag, sync_time]
                    conn.query(sql_cmd, sql_mem, function (err, result) {
                        if (err) {
                            console.log('link-wrong:' + err.stack);
                            return;
                        }
                    })
                    console.log('插入新建数据');
                    conn.release();
                }
                else {
                    var sql_cmd = 'update parking_lot set plot_no=?,plot_name=?,del_tag=?,sync_time=? where plot_id = ?'
                    var sql_mem = [plot_no, plot_name, del_tag, sync_time, plot_id]
                    conn.query(sql_cmd, sql_mem, function (err, result) {
                        if (err) {
                            console.log('link-wrong:' + err.stack);
                            return;
                        }
                    })
                    console.log('更新已有数据');
                    conn.release();
                }

            }
        })
    })
}

function UserMsgToSql(DataJson) {      //Json解析
    var dataJson = JSON.parse(DataJson);
    var data = dataJson.data;
    var user_id = data.userId;
    var user_name = data.userName;
    var email = data.email;
    var gender = data.gender;
    var id_card = data.idCard;
    var phone = data.phone;
    var work_number = data.workNumber;
    var password = data.password;
    var del_tag = data.deltag;
    var sync_time = dataJson.sendtime;

    var sql_isDataExist = function (callback) {
        var sql_judge = 'select user_id from parking_gt_user where user_id = ' + user_id;
        mysqlCon.getConnection(function (err, conn) {
            if (err) {
                callback(err.stack);
            }
            else {
                conn.query(sql_judge, function (err, result) {
                    if (err) {
                        console.log(err.stack)
                    }
                    conn.release();
                    console.log(result);
                    callback(result);
                })
            }
        })
    }

    sql_isDataExist(function (result) {   //根据判断将数据插入或更新
        mysqlCon.getConnection(function (err, conn) {
            if (err) {
                callback(err, null, null);
            }
            else {
                if (result == 0) {
                    var sql_cmd = 'insert into parking_gt_user values(?,?,?,?,?,?,?,?,?,?)'
                    var sql_mem = [user_id, user_name, email, gender, id_card, phone, work_number, password, del_tag, sync_time]
                    conn.query(sql_cmd, sql_mem, function (err, result) {
                        if (err) {
                            console.log('link-wrong:' + err.stack);
                            return;
                        }
                    })
                    console.log('插入新建数据');
                    conn.release();
                }
                else {
                    var sql_cmd = 'update parking_gt_user set user_name=?,email=?,gender=?,id_card=?,phone=?,work_number=?,password=?,del_tag=?,sync_time=? where user_id = ?'
                    var sql_mem = [user_name, email, gender, id_card, phone, work_number, password, del_tag, sync_time, user_id]
                    conn.query(sql_cmd, sql_mem, function (err, result) {
                        if (err) {
                            console.log('link-wrong:' + err.stack);
                            return;
                        }
                    })
                    console.log('更新已有数据');
                    conn.release();
                }

            }
        })
    })
}

    //     if (result == 0) {
    //         var sql_cmd = 'insert into parking_lot values(?,?,?,?,?)'
    //         var sql_mem = [plot_id,plot_no,plot_name,del_tag,sync_time]
    //         mysqlCon.query(sql_cmd,sql_mem,function (err, result) {
    //             if (err) {
    //                 console.log('link-wrong:' + err.stack);
    //                 return;
    //             }
    //         })
    //         console.log('插入新建数据');
    //     }
    //
    //     else {
    //         var sql_cmd = 'update parking_lot set plot_no=?,plot_name=?,del_tag=?,sync_time=? where plot_id = ?'
    //         var sql_mem = [plot_no,plot_name,del_tag,sync_time,plot_id]
    //         mysqlCon.query(sql_cmd,sql_mem,function (err, result) {
    //             if (err) {
    //                 console.log('link-wrong:' + err.stack);
    //                 return;
    //             }
    //         })
    //         console.log('更新已有数据')
    //     }
    //     console.log(sql_isDataExist)
    // })




var json_parkinglot = '{"data": {"parkingLotId":180610,"parkingLotName":"某停车场","parkingLotNo":"testnum","deltag":0},"sendtime": "2018-06-07 17:40:00"}'
var json_user = '{"data":{"userId":233,"userName":"kaka","email":"email","gender":1,"idCard":"1654561","phone":"1888888888","workNumber":"110","password":"77777","deltag":0},"sendtime":"2018-06-12 12:40:00"}'
//ParkingLotMsgToSql(json_parkinglot)
UserMsgToSql(json_user)

