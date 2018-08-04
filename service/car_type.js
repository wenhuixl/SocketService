/**
 * Created by @Evenlai on 2018/07/16.
 */
const carTypeModel = require('../models/car_type');
const channelModel = require('../models/channel');
const exitModel = require('../models/exit');
const areaModel = require('../models/area');
const plateAuthorizationModel = require('../models/plate_authorization');
const communityOwnerTmpCarModel = require('../models/community_owner_tmp_car');

module.exports = {
    //判断车辆类型
    async getCarType(plate,channelId){
        //获取默认临时车类型
        let tmpCarTypeList = await carTypeModel.findListByCategory(await carTypeModel.getCarCategoryTmp());
        //默认值
        let carType = {
            category : await carTypeModel.getCarCategoryTmp(),    //默认临时车
            isCommunityOwner : await carTypeModel.getIsCommunityOwnerNo(),  //默认非业主
            carTypeId:tmpCarTypeList!=null && tmpCarTypeList.length>0?tmpCarTypeList[0].car_type_id:""  //默认临时车类型id
        };
        //判断是否固定车
        let channel = await channelModel.findById(channelId);
        let exit = await exitModel.findById(channel.parking_exit_id);
        let area = exit!=null?await areaModel.findById(exit.parking_area_id):null;
        let plateAuthorizationList = await plateAuthorizationModel.findListByPlateAndLot(plate,area.parking_lot_id);
        let isFixedCar = plateAuthorizationList != null && plateAuthorizationList.length > 0;
        carType.category = isFixedCar?await carTypeModel.getCarCategoryFixed():await carTypeModel.getCarCategoryTmp();
        if(isFixedCar){
            carType.carTypeId = plateAuthorizationList[0].car_type_id;
            return carType;
        }
        //判断是否业主临时车
        let communityOwnerTmpCarList = await communityOwnerTmpCarModel.findListByPlate(plate);
        let isCommunityOwner = communityOwnerTmpCarList != null && communityOwnerTmpCarList.length > 0;
        carType.isCommunityOwner = isCommunityOwner?await carTypeModel.getIsCommunityOwnerYes():await carTypeModel.getIsCommunityOwnerNo();
        if(isCommunityOwner){
            carType.carTypeId = communityOwnerTmpCarList[0].car_type_id;
            return carType;
        }
        return carType;
    }
};