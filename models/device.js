const mysql = require('../middleware/MySQLPool');
const channel = require('./channel');

module.exports = {
    async findById(DeviceId){
        return await mysql.table('parking_device').where({device_id:DeviceId,del_tag:0,_logic:'AND'}).find().then(function (data) {
            return data.device_id!=null?data:null;
        });
    },
    //根据ip进行查询
    async findByIp(deviceIp){
        return await mysql.table('parking_device').where({device_ip:deviceIp,del_tag:0,_logic:'AND'}).find().then(function (data) {
            return data.device_id!=null?data:null;
        });
    },
    //查询所有未删除设备
    async findAll(){
        return await mysql.table('parking_device').where({del_tag:0}).select().then(function (data) {
            return data !=null && data.length>0 ? data : null;
        });
    },
    //将命令写入数据库，融合了插入与更新
    async save(DataJson) {
        let data = DataJson.data;
        let list = new Array();
        for(let i=0;i<data.length;i++) {
            let IDRep = {device_id: data[i].deviceId}
            let dataToSql = {
                device_id: data[i].deviceId,
                device_name: data[i].deviceName,
                device_ip: data[i].deviceIp,
                device_port: data[i].devicePort,
                device_sn: data[i].deviceSn,
                install_time: data[i].installTime,
                gateway_id: data[i].gwId,
                del_tag: data[i].deltag,
                enable: data[i].enable,
                sync_time: DataJson.sendtime
            };
            for (let j in dataToSql){
                if(dataToSql[j] == undefined){
                    dataToSql[j] = null;
                }
            }
            list.push(dataToSql);
            await mysql.table('parking_device').where(IDRep).delete().catch(function (err) {
                console.log(err);
            });
            // await mysql.table('parking_device').thenAdd(dataToSql, IDRep).catch(function (err) {
            //     console.log(err);
            // });
            // await mysql.table('parking_device').where(IDRep).update(dataToSql).catch(function (err) {
            //     console.log(err);
            // });
        }
        if(list.length > 0) {
            await mysql.table('parking_device').addAll(list).catch(function (err) {
                console.log(err);
            });
        }
    },
    // 查询全部设备
    async selectAll() {
        return await mysql.table('parking_device').where({del_tag:0}).select().then(function (data) {
            return data;
        });
    },
    // 设备关联表查询
    async selectByRemote(device_ip) {
        let sql =  'select * from parking_device pd '+
                    'inner join parking_channel pc on pc.device1_id = pd.device_id '+
                    'inner join parking_exit pe on pe.exit_id = pc.parking_exit_id '+
                    'inner join parking_area pa on pa.area_id = pe.parking_area_id '+
                    'where device_ip = "%s" ';
        let data = [device_ip];
        return await mysql.query(sql, data).then(function (data) {
            return data;
        });

    },
    async getListFromExitId(data){      //通过固定车名单中出入口信息导出相关设备列表
        var deviceId = new Array();
        var deviceIdList = new Array();
        var deviceList = new Array();
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].parkingExitIds.length; j++) {      //筛选出入口对应的通道
                let channelList = await channel.findListByExitId(data[i].parkingExitIds[j]);
                //await console.log('channelList：',channelList);
                for (let k = 0; k < channelList.length; k++) {
                    await deviceId.push(channelList[k].device1_id);
                    await deviceId.push(channelList[k].device2_id);
                }
            }
        }
        deviceIdList = await Array.from(new Set(deviceId));      //去重复
        for(let i = 0; i < deviceIdList.length; i++){     //通过ID查找设备并列出IP和端口的清单
            let dataUnit = await this.findById(deviceIdList[i]);
            if(dataUnit != null) {
                deviceList.push(dataUnit);
            }
        }
        return deviceList;
    },
    async update(where, data) {
        return await mysql.table('parking_device').where(where).update(data).then(function (affectRows) {
            return affectRows; //返回影响行数
        })
    },
    // 设备网关关联查询
    selectDeviceConfig: function(condJson, callback) { // condJson查询条件: {device_id: '111'}
        mysql.table('parking_device').join({
            table: 'parking_config',
            join: 'inner',
            on: ['gateway_id', 'gateway_id']
        }).where(condJson).find().then(function (data) {
            callback(data);
        });
    }
};