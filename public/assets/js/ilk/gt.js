var gt = {
    userinfo: undefined
};

const CHARGE_ERROR = 0;   //计费异常
const CHARGE_FREE =  1;   //不需要付费
const CHARGE_NO_ENTER_RECORD =  2;   //无入场记录
const CHARGE_NEED_PAY =  3;   //需付费
const CHARGE_ENTRANCE_PASS_CONFIRM = 4; //入口确认放行
const CHARGE_MZM_PASS_CONFIRM = 5; //门中门确认放行
const CHARGE_EXIT_PASS_CONFIRM = 6; //出口确认放行
const EXIT_TYPE_IN = "00000001";  //入口
const EXIT_TYPE_OUT = "00000002"; //出口
const EVENT_TYPE_MANUAL_PASS = "00000004";      //人工开闸

let ws = null;
let lastEnterList = null;

/**
 * 初始化车牌的地区名列表
 */
gt.initParkCarProvince = function () {
    var carPlates = eval('(' + "['','京','津','沪','渝','冀','豫','鄂','云','辽','黑','湘','皖','鲁','苏','新','浙','赣','桂','甘','川','晋','蒙','陕','吉','闽','贵','粤','青','宁','藏','琼']" + ')');

    $.each(carPlates, function(key, value) {
        $("#parkCarProvinceForManualPass").append('<option value="' + value + '">' + value + '</option>');
        $("#manualCorrectPlateShengSearch").append('<option value="' + value + '">' + value + '</option>');
        $("#manualCorrectEnterPlateSheng").append('<option value="' + value + '">' + value + '</option>');
    });

};

/**
 *初始化人工放行-放行原因
 */
gt.initReasonForManualPass = function(){
    let reasons = eval('(' + "['1-系统故障','2-抬杆故障','3-摄像头故障']" + ')');
    if (document.getElementById("reasonForManualPass")) {
        $.each(reasons, function(key, value) {
            $("#reasonForManualPass").append('<option value="' + value + '">' + value + '</option>');
        });
    }
};

/**
 * 初始化
 */
gt.init = function(){
    $.ajax({
        url: "/gt/info.do?t=" + new Date().toLocaleTimeString(),
        type: "GET",
        dataType: "json",
        success: function (data) {
            if(data.rstId > 0){
                //本机是岗亭
                if(data.isGt === 1){
                    //websocket
                    ws = new WebSocket("ws://" + data.serverIp + ":" + data.websocketPort);

                    ws.onopen = function (e) {
                        console.log('Connection to server opened');
                    };
                    ws.onmessage = function (e) {
                        let data =  JSON.parse(e.data.toString());
                        switch (data.rstId) {
                            case CHARGE_NO_ENTER_RECORD:
                                showManualCorrectForm(data);
                                break;
                            case CHARGE_NEED_PAY:
                                showChargeForm(data);
                                break;
                            case CHARGE_ENTRANCE_PASS_CONFIRM:
                                showPassConfirmForm(data);
                                break;
                            case CHARGE_MZM_PASS_CONFIRM:
                                showPassConfirmForm(data);
                                break;
                            case CHARGE_EXIT_PASS_CONFIRM:
                                showPassConfirmForm(data);
                                break;
                            case CHARGE_ERROR:
                                showErrorMessage(data);
                                break;
                            default:
                                showErrorMessage(data);
                                break;
                        }
                    };

                    //当前岗亭名称
                    $("#currentGt").html(data.gtName);
                    //上班时间
                    $("#workShiftTime").html(data.workShiftTime);
                    //收费金额
                    $("#chargeAmounts").html(data.chargeAmounts);
                    $("#changeShift").removeAttr("style");
                    $(".middle,.ace-icon,.fa .fa-cny,.bigger-120,.red").removeAttr("style");

                    //加载通道列表
                    let channels = data.channelList;
                    if(channels){
                        for(let i=0;i<channels.length;i++){
                            $("#channelsForManualPass").append('<option value="' + channels[i].channel_id + '">' + channels[i].channel_name + '</option>');
                        }
                    }

                    //所属区域
                    $("#currentArea").html(data.areaName);

                    //剩余车位
                    $("#residualLotCount").html(data.residualLotCount);

                    //显示操作按钮
                    $("#confirmManualPass").removeAttr("style");
                    $("#manualRecognize").removeAttr("style");
                }else {  //本机不是岗亭
                    $("#disableConfirmManualPass").removeAttr("style");
                }
            }else{
                alert("初始化失败");
            }
        }
    });
};

gt.initWebsocket = function(){

};

gt.validateFormManualPass = function () {

};

$.validator.setDefaults({
    submitHandler: function() {
        alert("提交事件!");
    }
});

/**
 *调用websocket发送消息
 */
function sendMessage() {
    ws.send("websocket测试");
}
//页面初始化事件
$(document).ready(function() {
    gt.initParkCarProvince();
    gt.initReasonForManualPass();
    gt.init();
    //打开视频监控程序
    // $("#openVideo").click(function () {
    //     var activeObj = new ActiveXObject('WScript.shell');
    //     var para = "C:\\Program Files (x86)\\easyto\\POPVideo\\POPVideo.exe";
    //     activeObj.run(para);
    //     //关闭进程
    //     activeObj = null;
    // });

    //手动识别
    $("#manualRecognize").click(function () {
        //通道id
        let channelId = $("#channelsForManualPass").val();
        //校验
        if(!channelId){
            bootbox.alert({
                size: "small",
                title: "系统提示",
                message: "请选择进行识别的通道！",
                buttons: {
                    ok: {
                        label: '确定',
                        className: 'btn-info'
                    }
                }
            });
            return;
        }

        //调用手动识别接口
        $.ajax({
            url: "/gt/manualRecognize.do",
            type: "POST",
            dataType: "json",
            data: {"channelId":channelId},
            success: function (data) {
                if (data.rstId === 0) {
                    bootbox.alert({
                        size: "small",
                        title: "系统提示",
                        message: data.message,
                        buttons: {
                            ok: {
                                label: '确定',
                                className: 'btn-info'
                            }
                        }
                    });
                }
            }
        });
    });

    //确认放行按钮(全人工)
    $("#confirmManualPass").click(function () {

        //车牌省份缩写
        let plateSheng = $("#parkCarProvinceForManualPass").val();
        //车牌号码
        let plate = $("#plateForManualPass").val();
        //通道id
        let channelId = $("#channelsForManualPass").val();
        //放行理由
        let passReason = $("#reasonForManualPass").val();
        //是否人工录入车牌
        let manualEnterPlate = 1;
        //事件类型
        let eventId = EVENT_TYPE_MANUAL_PASS;

        //校验
        if(!plate || !channelId || !passReason){
            bootbox.alert({
                size: "small",
                title: "系统提示",
                message: "请输入车牌号码、放行通道、放行理由！",
                buttons: {
                    ok: {
                        label: '确定',
                        className: 'btn-info'
                    }
                }
            });
            return;
        }
        //调用人工放行接口
        $.ajax({
            url: "/gt/manualPass.do",
            type: "POST",
            dataType: "json",
            data: {"plateSheng":plateSheng,"plate":plate,"channelId":channelId,"passReason":passReason,"tmpInsertIds":[],"manualEnterPlate":manualEnterPlate,"eventId":eventId},
            success: function (data) {
                if (data.rstId === CHARGE_FREE) {
                    return location.href = utils.domain() + data.rstDesc;
                } else if(data.rstId === CHARGE_NO_ENTER_RECORD){
                    showManualCorrectForm(data);
                } else if(data.rstId === CHARGE_NEED_PAY){
                    showChargeForm(data);
                } else {
                    bootbox.alert({
                        size: "small",
                        title: "系统提示",
                        message: data.message,
                        buttons: {
                            ok: {
                                label: '确定',
                                className: 'btn-info'
                            }
                        }
                    });
                }
            }
        });

    });
    //收费数据校验
    $("#chargeForm").validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: true,
        ignore: "",
        rules: {
            chargeAmountsReceived: {
                required: true,
                number: true,
                min: 0,
                maxlength: 6
            }
        },
        messages: {
            chargeAmountsReceived:{
                required: "请输入实收金额",
                min:"实收金额不能小于0",
                maxlength:"实收金额最大长度不能超过6位"
            }
        },
        highlight: function (e) {
            $(e).closest('.form-group').removeClass('has-info').addClass('has-error');
        },
        success: function (e) {
            $(e).closest('.form-group').removeClass('has-error');//.addClass('has-info');
            $(e).remove();
        },
        errorPlacement: function (error, element) {
            if(element.is('input[type=checkbox]') || element.is('input[type=radio]')) {
                var controls = element.closest('div[class*="col-"]');

                if(controls.find(':checkbox,:radio').length > 1) {
                    controls.append(error);
                } else {
                    error.insertAfter(element.nextAll('.lbl:eq(0)').eq(0));
                }
            } else if(element.is('.chosen-select')) {
                error.insertAfter(element.siblings('[class*="chosen-container"]:eq(0)'));
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function (form) {
        },
        invalidHandler: function (form) {
        }
    });
    //切换车辆类型重新计费
    $("#chargeCarType").change(function () {
        let plate = $("#chargePlate").val();
        let channelId = $("#chargeChannelId").val();
        let carTypeId = $("#chargeCarType").val();
        let manualEnterPlate = $("#chargeManualEnterPlate").val();
        let tmpInsertIds = $("#chargeTmpInsertIds").val();
        $.ajax({
            url: "/gt/recharge.do",
            type: "POST",
            dataType: "json",
            data: {"channelId":channelId,"plate":plate,"carTypeId":carTypeId, "manualEnterPlate":manualEnterPlate,"tmpInsertIds":tmpInsertIds},
            success: function (data) {
                console.log(data);
                if (data.rstId === CHARGE_NEED_PAY) {
                    $("#chargeAmountsReceivable").val(data.chargeData.object.payAmount);
                    $("#chargeAmountsReceived").val(data.chargeData.object.payAmount);
                } else {
                    //恢复原来所选车辆类型
                    $("#chargeCarType").val(carTypeId);
                    bootbox.alert({
                        size: "small",
                        title: "系统提示",
                        message: data.message,
                        buttons: {
                            ok: {
                                label: '确定',
                                className: 'btn-info'
                            }
                        }
                    });
                }
            }
        });
    });
    //人工收费按钮(全人工/半人工通用)
    $("#confirmManualCharge").click(function () {
        //表单校验
        if(!$("#chargeForm").valid()){
            return;
        }
        //通道id
        let channelId = $("#chargeChannelId").val();
        //放行理由
        let passReason = $("#chargePassReason").val();
        //车牌
        let plate = $("#chargePlate").val();
        //车辆类型
        let carTypeId = $("#chargeCarType").val();
        //入场时间
        let enterTime = $("#chargeEnterTime").val();
        //出场时间
        let exitTime = $("#chargeExitTime").val();
        //应收金额
        let amountsReceivable = $("#chargeAmountsReceivable").val();
        //实收金额
        let amountsReceived = $("#chargeAmountsReceived").val();
        //收款方式
        let tradeTypeId = $("#chargeTradeType").val();
        //云端临时车计费订单编号
        let billCode = $("#chargeBillCode").val();
        //订单状态
        let orderState = $("#chargeOrderState").val();
        //停留时长
        let stayTime = $("#chargeStayTime").val();
        //入场记录id
        let enterRecordId = $("#chargeEnterRecordId").val();
        let tmpInsertIds = $("#chargeTmpInsertIds").val();
        let manualEnterPlate = $("#chargeManualEnterPlate").val();
        let enterPlate = $("#chargeEnterPlate").val();
        let eventId = $("#chargeEventId").val();

        //调用人工收费接口
        $.ajax({
            url: "/gt/manualCharge.do",
            type: "POST",
            dataType: "json",
            data: {"channelId":channelId,"passReason":passReason,"plate":plate,"carTypeId":carTypeId,"enterTime":enterTime,"exitTime":exitTime,
                "amountsReceivable":amountsReceivable,"amountsReceived":amountsReceived,"tradeTypeId":tradeTypeId,"billCode":billCode,
                "orderState":orderState,"stayTime":stayTime,"enterRecordId":enterRecordId,"tmpInsertIds":tmpInsertIds,
                "manualEnterPlate":manualEnterPlate,"enterPlate":enterPlate,"eventId":eventId},
            success: function (data) {
                if (data.rstId > 0) {
                    return location.href = utils.domain() + data.rstDesc;
                } else {
                    bootbox.alert({
                        size: "small",
                        title: "系统提示",
                        message: data.message,
                        buttons: {
                            ok: {
                                label: '确定',
                                className: 'btn-info'
                            }
                        }
                    });
                    return location.href = utils.domain() + data.rstDesc;
                }
            }
        });
    });
    //确认放行按钮(半人工)
    $("#passConfirm").click(function () {
    let action = $("#passConfirmAction").val();
    let tmpInsertIds = $("#passConfirmTmpInsertIds").val();
    let plate = $("#passConfirmPlate").val();
    let carTypeId = $("#passConfirmCarType").val();
    let channelId = $("#passConfirmChannelId").val();

    //调用确认放行接口
    $.ajax({
        url: "/gt/passConfirm.do",
        type: "POST",
        dataType: "json",
        data: {"action":action,"tmpInsertIds":tmpInsertIds,"plate":plate,"carTypeId":carTypeId,"channelId":channelId},
        success: function (data) {
            if (data.rstId === 200) {
                return location.href = utils.domain() + data.rstDesc;
            } else {
                bootbox.alert({
                    size: "small",
                    title: "系统提示",
                    message: data.message,
                    buttons: {
                        ok: {
                            label: '确定',
                            className: 'btn-info'
                        }
                    }
                });
            }
        }
    });

});
    //控制人工校正操作按钮
    $("#manualCorrectEnterPlate").change(function () {
        if($("#manualCorrectEnterPlate").val()){
            $("#manualCorrectConfirm").removeAttr("disabled");
            $("#manualCorrectConfirm").attr("class","btn btn-primary");
        }else{
            $("#manualCorrectConfirm").attr("disabled","disabled");
            $("#manualCorrectConfirm").attr("class","btn btn-default");
        }
    });
    //搜索近似车牌入场数据
    $("#manualCorrectSearch").click(function () {
        let searchPlate = $("#manualCorrectPlateShengSearch").val()+$("#manualCorrectPlateSearch").val();
        let originalPlate = $("#manualCorrectOriginalPlate").val();
        let channelId = $("#manualCorrectChannelId").val();
        let tmpInsertIds = $("#manualCorrectTmpInsertIds").val();
        $.ajax({
            url: "/gt/search.do?t=" + new Date().toLocaleTimeString(),
            type: "POST",
            dataType: "json",
            data:{"searchPlate":searchPlate,"originalPlate":originalPlate,"channelId":channelId,"tmpInsertIds":tmpInsertIds},
            success: function (data) {
                if(data.rstId > 0){
                    fillManualCorrectForm(data);
                }else{
                    bootbox.alert({
                        size: "small",
                        title: "系统提示",
                        message: data.message,
                        buttons: {
                            ok: {
                                label: '确定',
                                className: 'btn-info'
                            }
                        },
                        callback: function(){
                            return location.href = utils.domain() + data.rstDesc;
                        }
                    });
                }
            }
        });
    });
    //确认纠正
    $("#manualCorrectConfirm").click(function () {

        $('#manualCorrectModal').modal("toggle");
        //车牌省份缩写
        var plateSheng = $("#manualCorrectEnterPlateSheng").val();
        //车牌号码
        var plate = $("#manualCorrectEnterPlate").val();
        //车辆类型id
        var carTypeId = $("#manualCorrectCarTypeId").val();
        //通道id
        var channelId = $("#manualCorrectChannelId").val();
        //是否人工录入车牌
        let manualEnterPlate = $("#chargeManualEnterPlate").val();
        //临时出场数据Ids
        var tmpInsertIds = $("#manualCorrectTmpInsertIds").val();
        //事件类型
        var eventId = $("#manualCorrectEventId").val();
        //放行理由
        var passReason = "人工校正放行";

        //调用人工放行接口
        $.ajax({
            url: "/gt/manualPass.do",
            type: "POST",
            dataType: "json",
            data: {"plateSheng":plateSheng,"plate":plate,"carTypeId":carTypeId,"channelId":channelId,"tmpInsertIds":tmpInsertIds,
                "manualEnterPlate":manualEnterPlate,"passReason":passReason,"eventId":eventId},
            success: function (data) {
                if (data.rstId === CHARGE_FREE) {
                    return location.href = utils.domain() + data.rstDesc;
                } else if(data.rstId === CHARGE_NO_ENTER_RECORD){
                    showManualCorrectForm(data);
                } else if(data.rstId === CHARGE_NEED_PAY){
                    showChargeForm(data);
                } else {
                    bootbox.alert({
                        size: "small",
                        title: "系统提示",
                        message: data.message,
                        buttons: {
                            ok: {
                                label: '确定',
                                className: 'btn-info'
                            }
                        }
                    });
                }
            }
        });
    });
    //显示无匹配处理框
    $("#manualCorrectNoEnterRecordHandle").click(function () {
        $.ajax({
            url: "/gt/getTradeTypeList.do?t=" + new Date().toLocaleTimeString(),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data.rstId > 0){
                    let tradeTypeList = data.tradeTypeList;
                    $("#chargeTradeType").empty();
                    if(tradeTypeList){
                        for(var i=0;i<tradeTypeList.length;i++){
                            $("#noEnterChargeTradeType").append('<option value="' + tradeTypeList[i].trade_type_id + '">' + tradeTypeList[i].trade_type_name + '</option>');
                        }
                    }
                    $("#noEnterChargeAmountsReceived").val("0.00");
                    $("#noEnterChargeModal").modal({backdrop: "static", keyboard: false});
                }else{
                    alert("初始化失败");
                }
            }
        });
    });
    //无匹配收费校验
    $("#noEnterChargeForm").validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: true,
        ignore: "",
        rules: {
            noEnterChargeAmountsReceived: {
                required: true,
                number: true,
                min: 0,
                maxlength: 6
            }
        },
        messages: {
            noEnterChargeAmountsReceived:{
                required: "请输入金额",
                min:"金额不能小于0",
                maxlength:"金额最大长度不能超过6位"
            }
        },
        highlight: function (e) {
            $(e).closest('.form-group').removeClass('has-info').addClass('has-error');
        },
        success: function (e) {
            $(e).closest('.form-group').removeClass('has-error');//.addClass('has-info');
            $(e).remove();
        },
        errorPlacement: function (error, element) {
            if(element.is('input[type=checkbox]') || element.is('input[type=radio]')) {
                var controls = element.closest('div[class*="col-"]');

                if(controls.find(':checkbox,:radio').length > 1) {
                    controls.append(error);
                } else {
                    error.insertAfter(element.nextAll('.lbl:eq(0)').eq(0));
                }
            } else if(element.is('.chosen-select')) {
                error.insertAfter(element.siblings('[class*="chosen-container"]:eq(0)'));
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function (form) {
        },
        invalidHandler: function (form) {
        }
    });
    //确认无匹配收费
    $("#noEnterChargeConfirm").click(function () {
        //表单校验
        if(!$("#noEnterChargeForm").valid()){
            return;
        }

        let channelId = $("#manualCorrectChannelId").val();
        let passReason = "无匹配放行处理";
        let plate = $("#manualCorrectOriginalPlate").val();
        var carTypeId = $("#manualCorrectCarTypeId").val();
        let amountsReceived = $("#noEnterChargeAmountsReceived").val();
        let tradeTypeId = $("#noEnterChargeTradeType").val();
        let manualEnterPlate = $("#manualCorrectManualEnterPlate").val();
        let tmpInsertIds = $("#manualCorrectTmpInsertIds").val();
        let eventId = $("#manualCorrectEventId").val();
        let enterPlate = "";
        //调用人工收费接口
        $.ajax({
            url: "/gt/manualCharge.do",
            type: "POST",
            dataType: "json",
            data: {"channelId":channelId,"passReason":passReason,"plate":plate,"carTypeId":carTypeId,
                "amountsReceived":amountsReceived,"tradeTypeId":tradeTypeId, "tmpInsertIds":tmpInsertIds,
                "manualEnterPlate":manualEnterPlate,"enterPlate":enterPlate,"eventId":eventId},
            success: function (data) {
                if (data.rstId > 0) {
                    return location.href = utils.domain() + data.rstDesc;
                } else {
                    bootbox.alert({
                        size: "small",
                        title: "系统提示",
                        message: data.message,
                        buttons: {
                            ok: {
                                label: '确定',
                                className: 'btn-info'
                            }
                        }
                    });
                }
            }
        });
    });
    //打开换班窗口
    $("#changeShift").click(function () {
        $.ajax({
            url: "/gt/shiftWorkInit.do",
            type: "POST",
            dataType: "json",
            data: {},
            success: function (data) {
                if (data.rstId > 0) {
                    //填充换班信息
                    $("#workNumber").val(data.workNumber);
                    $("#userName").val(data.userName);
                    $("#startTime").val(data.startTime);
                    $("#endTime").val(data.endTime);
                    $("#pettyCash").val(0.00);
                    $("#turnover").val(data.turnover);
                    $("#amountsTotal").val(data.turnover);
                    $("#amountsActual").val(data.turnover);

                    $('#shiftWorkModal').modal({backdrop: 'static', keyboard: false});
                } else {
                    bootbox.alert({
                        size: "small",
                        title: "系统提示",
                        message: data.message,
                        buttons: {
                            ok: {
                                label: '确定',
                                className: 'btn-info'
                            }
                        },
                        callback: function(){
                        return location.href = utils.domain() + data.rstDesc;
                    }
                    });
                }
            }
        });
    });
    //换班数据校验
    $("#shiftWorkForm").validate({
        errorElement: 'div',
        errorClass: 'help-block',
        focusInvalid: true,
        ignore: "",
        rules: {
            pettyCash: {
                required: true,
                number: true,
                min: 0,
                maxlength: 6
            },
            amountsActual:{
                required: true,
                number:true,
                min:0,
                maxlength:6
            }
        },
        messages: {
            pettyCash:{
                required: "请输入备用金",
                min:"备用金不能小于0",
                maxlength:"备用金最大长度不能超过6位"
            },
            amountsActual:{
                required: "请输入实际金额",
                min:"实际金额不能小于0",
                maxlength:"实际金额最大长度不能超过6位"
            }
        },
        highlight: function (e) {
            $(e).closest('.form-group').removeClass('has-info').addClass('has-error');
        },
        success: function (e) {
            $(e).closest('.form-group').removeClass('has-error');//.addClass('has-info');
            $(e).remove();
        },
        errorPlacement: function (error, element) {
            if(element.is('input[type=checkbox]') || element.is('input[type=radio]')) {
                var controls = element.closest('div[class*="col-"]');

                if(controls.find(':checkbox,:radio').length > 1) {
                    controls.append(error);
                } else {
                    error.insertAfter(element.nextAll('.lbl:eq(0)').eq(0));
                }
            } else if(element.is('.chosen-select')) {
                error.insertAfter(element.siblings('[class*="chosen-container"]:eq(0)'));
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function (form) {
        },
        invalidHandler: function (form) {
        }
    });
    //确认换班
    $("#confirmShift").click(function () {
        if(!$("#shiftWorkForm").valid()){
            return;
        }
        bootbox.confirm({
            size: "small",
            title: "系统提示",
            message: "操作员换班，将退出程序重新登录，请确认! ",
            className: 'modal fade in alert',
            buttons: {
                cancel:{
                    label: '取消',
                    className: 'btn-default'
                },
                confirm: {
                    label: '确认',
                    className: 'btn-info'
                }
            },
            callback: function(result){

                if(!result) {
                    return;
                }

                //前端校验 TODO
                var pettyCash = $("#pettyCash").val();
                var turnover = $("#turnover").val();
                var amountsActual = $("#amountsActual").val();
                var comments = $("#comments").val();
                $.ajax({
                    url: "/gt/shiftWorkConfirm.do",
                    type: "POST",
                    dataType: "json",
                    data: {"pettyCash":pettyCash,"turnover":turnover,"amountsActual":amountsActual,"comments":comments},
                    success: function (data) {
                        if (data.rstId > 0) {
                            return location.href = utils.domain() + data.rstDesc;
                        } else {
                            bootbox.alert({
                                size: "small",
                                title: "系统提示",
                                message: data.message,
                                buttons: {
                                    ok: {
                                        label: '确认',
                                        className: 'btn-info'
                                    }
                                },
                                callback: function(){
                                    return location.href = utils.domain() + data.rstDesc;
                                }
                            });
                        }
                    }
                });
            }
        });
    });
    //收费
    $("#shoufei").click(function () {
        $('#chargeModal').modal({backdrop: "static", keyboard: false});
    });
    //模态框清除缓存
    $("#shiftWorkModal").on("hidden.bs.modal", function() {
        $("#noEnterChargeAmountsReceived").val("0.00");
        $(this).removeData("bs.modal");
    });
    $("#chargeModal").on("hidden.bs.modal", function() {
        $(this).removeData("bs.modal");
    });
    $("#passConfirmModal").on("hidden.bs.modal", function() {
        $(this).removeData("bs.modal");
    });
    $("#manualCorrectModal").on("hidden.bs.modal", function() {
        $(this).removeData("bs.modal");
    });
    $("#noEnterChargeModal").on("hidden.bs.modal", function() {
        $(this).removeData("bs.modal");
    });
});
//填充车牌到确认放行车牌录入框
function fillPlateToSelectAndInput(plateFull,plateShengSelect,plateInput) {
    let plateSheng = plateFull.substring(0,1);
    let plate = plateFull.substring(1);
    if(!isExistOption(plateShengSelect,plateSheng)){
        $("#"+plateShengSelect).append('<option value="'+ plateSheng +'">' + plateSheng + '</option>');
    }
    $("#"+plateShengSelect).val(plateSheng);
    $("#"+plateInput).val(plate);
}

//判断下拉框是否存在某个值
function isExistOption(id,value) {
    var isExist = false;
    var count = $('#'+id).find('option').length;

    for(var i=0;i<count;i++)
    {
        if($('#'+id).get(0).options[i].value == value)
        {
            isExist = true;
            break;
        }
    }
    return isExist;
}

//显示确认放行弹框
function showPassConfirmForm(data){
    $("#passConfirmAction").val(data.rstId);
    $("#passConfirmTmpInsertIds").val(data.tmpInsertIds);
    $("#passConfirmPlate").val(data.plate);
    $("#passConfirmChannelId").val(data.channelId);
    fillPlateToSelectAndInput(data.plate,"parkCarProvinceForManualPass","plateForManualPass");
    //车辆类型
    let carTypeList = data.carTypeList;
    let carTypeId = data.carTypeId;
    $("#passConfirmCarType").empty();
    if(carTypeList){
        for(var i=0;i<carTypeList.length;i++){
            $("#passConfirmCarType").append('<option value="' + carTypeList[i].car_type_id + '">' + carTypeList[i].car_type_name + '</option>');
        }
    }
    $("#passConfirmCarType").val(carTypeId);
    //根据出入口决定是否允许修改车辆类型
    let exitType = data.exitType;
    //出口不允许修改车辆类型
    if(exitType && exitType===EXIT_TYPE_OUT){
        $("#passConfirmCarType").attr("disabled","disabled");
    }else{
        //固定车、业主临时车禁止选择车辆类型
        let enabledChangeCarType = data.enabledChangeCarType;
        if(enabledChangeCarType==0){
            $("#passConfirmCarType").attr("disabled","disabled");
        }else{
            $("#passConfirmCarType").removeAttr("disabled");
        }
    }
    $("#passConfirmModal").modal({backdrop: "static", keyboard: false});
}
//显示收费弹框
function showChargeForm(data){
    //填充收费信息
    $("#chargePlate").val(data.plate);
    $("#chargeEnterPlate").val(data.enterPlate);
    $("#chargeEnterTime").val(data.chargeData.object.fromDate);
    $("#chargeExitTime").val(data.chargeData.object.toDate);
    $("#chargeAmountsReceivable").val(data.chargeData.object.payAmount);
    $("#chargeAmountsReceived").val(data.chargeData.object.payAmount);
    $("#chargeLatestPaytime").val(data.chargeData.object.latestPaytime?data.chargeData.object.latestPaytime:"无");
    $("#chargeOvertime").val(data.chargeData.object.overtime?data.chargeData.object.overtime===1?"已超时":"未超时":"未超时");
    $("#chargeOvertimeMinute").val(data.chargeData.object.overtimeMinute?data.chargeData.object.overtimeMinute:0);

    $("#chargeChannelId").val(data.channelId);
    $("#chargePassReason").val(data.passReason);
    $("#chargeBillCode").val(data.chargeData.object.billCode);
    $("#chargeOrderState").val(data.chargeData.object.orderState);
    $("#chargeStayTime").val(data.chargeData.object.staytime);
    $("#chargeTotalStaytime").val("（共停留" + data.chargeData.object.staytime + "分钟）");
    $("#chargeEnterRecordId").val(data.chargeData.object.enterRecordId);
    $("#chargeTmpInsertIds").val(data.tmpInsertIds);
    $("#chargeManualEnterPlate").val(data.manualEnterPlate);
    $("#chargeEventId").val(data.eventId);

    fillPlateToSelectAndInput(data.plate,"parkCarProvinceForManualPass","plateForManualPass");
    if(data.enterImgPath){
        $("#enterImg").attr("src",data.enterImgPath);
    }
    //车辆类型
    let carTypeList = data.carTypeList;
    $("#chargeCarType").empty();
    if(carTypeList){
        for(var i=0;i<carTypeList.length;i++){
            $("#chargeCarType").append('<option value="' + carTypeList[i].car_type_id + '">' + carTypeList[i].car_type_name + '</option>');
        }
    }

    //选中车辆类型
    let carTypeId = data.chargeData.object.carTypeId;
    $("#chargeCarType").val(carTypeId);
    //禁止切换车辆类型
    let enabledChangeCarType = data.enabledChangeCarType;
    if(enabledChangeCarType==0){
        $("#chargeCarType").attr("disabled","disabled");
    }else{
        $("#chargeCarType").removeAttr("disabled");
    }
    //收款类型
    let tradeTypeList = data.tradeTypeList;
    $("#chargeTradeType").empty();
    if(tradeTypeList){
        for(var i=0;i<tradeTypeList.length;i++){
            $("#chargeTradeType").append('<option value="' + tradeTypeList[i].trade_type_id + '">' + tradeTypeList[i].trade_type_name + '</option>');
        }
    }

    $("#chargeModal").modal({backdrop: "static", keyboard: false});
}
//填充人工校正弹框
function fillManualCorrectForm(data){
    //初始化
    $("#manualCorrectEnterPlateSheng").val("");
    $("#manualCorrectEnterPlate").val("");
    $("#manualCorrectConfirm").attr("disabled","disabled");
    $("#manualCorrectConfirm").attr("class","btn btn-default");

    //数据暂存
    $("#manualCorrectOriginalPlate").val(data.originalPlate);
    $("#manualCorrectCarTypeId").val(data.carTypeId);
    $("#manualCorrectChannelId").val(data.channelId);
    $("#manualCorrectManualEnterPlate").val(data.manualEnterPlate);
    $("#manualCorrectTmpInsertIds").val(data.tmpInsertIds);
    $("#manualCorrectEventId").val(data.eventId);
    fillPlateToSelectAndInput(data.originalPlate,"parkCarProvinceForManualPass","plateForManualPass");

    let lastEnterListCount = data.lastEnterListCount;
    lastEnterList = data.lastEnterList;
    //默认填充搜索框
    fillPlateToSelectAndInput(data.searchPlate,"manualCorrectPlateShengSearch","manualCorrectPlateSearch");
    //显示记录数量
    $("#manualCorrectLastEnterListCount").html(lastEnterListCount);
    //根据结果进行不同处理
    if(lastEnterListCount>0){
        //生成页码并显示
        let html = "";
        for(let i=1;i<=lastEnterListCount;i++){
            if(i===1){
                html = html + "<li id='manualCorrectLastEnterInfoPagingLi_" + i + "' class='active'><a href='javascript:switchLastEnterInfo("+ i +")'>" + i + "</a></li>";
            }else{
                html = html + "<li id='manualCorrectLastEnterInfoPagingLi_" + i + "' ><a href='javascript:switchLastEnterInfo("+ i +")'>" + i + "</a></li>";
            }
        }
        $("#manualCorrectLastEnterInfoPagingUl").html(html);

        //默认选中第一页
        switchLastEnterInfo(1);
        //隐藏提示语
        $("#manualCorrectLastEnterInfoMessage").attr("style","display:none;");
        //显示图片、数据、页码
        $("#manualCorrectLastEnterInfo").removeAttr("style");
        $("#manualCorrectLastEnterInfoPagingDiv").removeAttr("style");
    }else{
        //隐藏图片、数据、页码显示区域
        $("#manualCorrectLastEnterInfo").attr("style","display:none;");
        $("#manualCorrectLastEnterInfoPagingDiv").attr("style","display:none;");
        $("#manualCorrectLastEnterInfoPagingUl").html("");
        //显示提示语
        $("#manualCorrectLastEnterInfoMessage").attr("style","min-height: 300px");
    }
}
//显示人工校正弹框
function showManualCorrectForm(data){
    //填充数据
    fillManualCorrectForm(data);
    //显示弹框
    $('#manualCorrectModal').modal({backdrop: "static", keyboard: false});
}
//显示错误信息
function showErrorMessage(data){
    bootbox.alert({
        size: "small",
        title: "系统提示",
        message: data.message,
        buttons: {
            ok: {
                label: '确定',
                className: 'btn-info'
            }
        }
    });
}
//切换入场信息
function switchLastEnterInfo(i) {
    //切换选中页码
    $("#manualCorrectLastEnterInfoPagingUl li").each(function () {
        $(this).removeAttr("class");
    });
    $("#manualCorrectLastEnterInfoPagingLi_" + i).attr("class","active");
    if(lastEnterList){
        //显示指定页
        let lastEnterInfo = lastEnterList[i-1];
        //入场照片
        if(lastEnterInfo.plate_picture_path){
            $("#manualCorrectEnterImg").attr("src",lastEnterInfo.plate_picture_path);
        }else{
            $("#manualCorrectEnterImg").attr("src","../assets/images/ruchang.png");
        }
        //车牌号码
        $("#manualCorrectLastEnterInfoPlate").html(lastEnterInfo.plate);
        $("#manualCorrectLastEnterInfoCarType").html(lastEnterInfo.car_type_name);
        $("#manualCorrectLastEnterInfoCarTypeId").val(lastEnterInfo.car_type_id);
        $("#manualCorrectLastEnterInfoChannel").html(lastEnterInfo.channel_name);
        $("#manualCorrectLastEnterInfoPassTime").html(lastEnterInfo.pass_time);

        fillPlateToSelectAndInput(lastEnterInfo.plate,"manualCorrectEnterPlateSheng","manualCorrectEnterPlate");

        $("#manualCorrectEnterPlate").trigger("change");
    }
}






