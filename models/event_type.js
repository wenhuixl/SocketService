const mysql = require('../middleware/MySQLPool');
const moment = require('moment');

const EVENT_TYPE_VIP = "00000001";              //访客贵宾车
const EVENT_TYPE_COMMON = "00000002";           //一般记录
const EVENT_TYPE_NO_ENTER_RECORD = "00000003";  //未匹配记录
const EVENT_TYPE_MANUAL_PASS = "00000004";      //人工开闸

module.exports = {
    async save(dataJson) {
        let data = dataJson.data;
        let list = new Array();
        for(let i = 0; i < data.length; i++) {
            let IDRep = {event_id: data[i].eventId};
            let dataToSql = {
                event_id: data[i].eventId == undefined? null:data[i].eventId,
                event_name: data[i].eventName == undefined? null:data[i].eventName,
                del_tag: data[i].deltag == undefined? null:data[i].deltag,
                sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            };
            list.push(dataToSql);
            await mysql.table('parking_event').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_event').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_event').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_event').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    //获取常量
    async getEventTypeVIP(){
        return EVENT_TYPE_VIP;
    },
    async getEventTypeCommon(){
        return EVENT_TYPE_COMMON;
    },
    async getEventNoEnterRecord(){
        return EVENT_TYPE_NO_ENTER_RECORD;
    },
    async getEventTypeManualPass(){
        return EVENT_TYPE_MANUAL_PASS;
    }
};