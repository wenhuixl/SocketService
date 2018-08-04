const mysql = require('../middleware/MySQLPool');
const moment = require('moment');
const DEFAULT_CAR_TYPE = 1004881; //测试阶段默认车辆类型

const CAR_CATEGORY_FIXED = "00000001";  //固定车
const CAR_CATEGORY_TMP = "00000002";    //临时车
const IS_COMMUNITY_OWNER_NO = "00000000";   //不是业主
const IS_COMMUNITY_OWNER_YES = "00000001";  //是业主

module.exports = {
    //按Id进行查询
    async findById(carTypeId){
        return await mysql.table('parking_car_type').where({car_type_id:carTypeId}).find().then(function (data) {
            return data.car_type_id!=null?data:null;
        });
    },
    //查询所有未删除车辆类型
    async findAll(){
        return await mysql.table('parking_car_type').where({del_tag:0}).select().then(function (data) {
            return data !=null && data.length>0 ? data : null;
        });
    },
    //根据车辆类别查询车辆类型列表
    async findListByCategory(category){
        return await mysql.table('parking_car_type').where({category:category,del_tag:0}).select().then(function (data) {
            return data !=null && data.length>0 ? data : null;
        });
    },
    //添加车辆类型，存在更新，不存在追加
    // async thenAdd(data, where) {
    //     var data  = {
    //         car_type_id: data.carTypeId,
    //         car_type_name: data.carTypeName,
    //         category: data[i].category,
    //         del_tag: data.delTag,
    //         sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    //     };
    //     var where = {
    //         car_type_id: where.carTypeId
    //     }
    //     return await mysql.table('parking_car_type').add(data, where, true).then(function (insertId) {
    //         return insertId; //如果插入成功，返回插入的id
    //     }).catch(function (err) {
    //         console.log(err);
    //         return 0; //插入失败，err为具体的错误信息
    //     })
    // },
    // 保存开发平台下发数据
    async save(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for (let i = 0; i < data.length; i++) {
            let IDRep = {car_type_id: data[i].carTypeId};
            let dataToSql = {
                car_type_id: data[i].carTypeId,
                car_type_name: data[i].carTypeName,
                category: data[i].category,
                del_tag: data[i].deltag,
                sync_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_car_type').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_car_type').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_car_type').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_car_type').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    //获取常量
    async getDefaultCarType(){
        return DEFAULT_CAR_TYPE;
    },
    async getCarCategoryFixed(){
        return CAR_CATEGORY_FIXED;
    },
    async getCarCategoryTmp(){
        return CAR_CATEGORY_TMP;
    },
    async getIsCommunityOwnerNo(){
        return IS_COMMUNITY_OWNER_NO;
    },
    async getIsCommunityOwnerYes(){
        return IS_COMMUNITY_OWNER_YES;
    }
};