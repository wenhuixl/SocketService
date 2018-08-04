/**
 * Created by wenhui on 2018/6/28.
 * 获取小区列表
 */
var constant = {
    gridItem: undefined,
    gridBoxItem: undefined,
    type: undefined
};
var gridItem = {
    grid : undefined,
    selId:'',
    data: [],
    runOnce : true,
    postData : {
        compid : '',
        compname : ''
    }
};
var offlineParam = {}; // 脱机参数
var gridBoxItem = {
    grid : undefined,
    selId:'',
    data: [],
    runOnce : true,
    postData : {
        compid : '',
        compname : ''
    }
};
gridItem.initGrid = function (grid_selector, pager_selector) {
    var grid = jQuery(grid_selector).jqGrid({
        caption : "设备管理",
        url : utils.domain() + "device/devicelist.do",
        datatype: 'json',
        height : 'auto',
        autowidth : true,
        altRows : true,
        multiselect : false,
        multiboxonly : false,
        rownumbers : true,
        toppager: true,
        viewrecords : true,
        pager : pager_selector,
        rowNum : 10,
        rowList : [10, 20, 50, 100, 200 ],
        jsonReader : {
            repeatitems : false
        },
        colModel : [{
            name: 'device_id',
            index: 'device_id',
            label: 'device_id',
            hidden: true
        }, {
            name: 'device_name',
            index: 'device_name',
            label: '设备名称',
            align: 'center'
        }, {
            name: 'device_ip',
            index: 'device_ip',
            label: '设备IP',
            align: 'center'
        }, {
            name: 'device_port',
            index: 'device_port',
            label: '设备端口',
            align: 'center'
        }, {
            name: 'device_sn',
            index: 'device_sn',
            label: '序列号',
            align: 'center'
        }, {
            name: 'install_time',
            index: 'install_time',
            label: '安装时间',
            align: 'center',
            formatter: function (val, opt, row) {
                return utils.timestampFormat(val, 'yyyy-MM-dd hh:mm:ss');
            }
        }, {
            name: 'enable',
            index: 'enable',
            label: '是否启用',
            align: 'center',
            formatter: function (val, opt, row) {
                if(val == 0){
                    return '<span class="label label-sm label-warning">否</span>';
                }else{
                    return '<span class="label label-sm label-success">是</span>';
                }
            }
        }, {
            name: 'sync_time',
            index: 'sync_time',
            label: '同步时间',
            align: 'center',
            formatter: function (val, opt, row) {
                return utils.timestampFormat(val, 'yyyy-MM-dd hh:mm:ss');
            }
        }, {
            name: 'online',
            index: 'online',
            label: '在线状态',
            align: 'center',
            formatter: function (val, opt, row) {
                if(val == 0){
                    return '<span class="label label-sm label-warning">离线</span>';
                }else{
                    return '<span class="label label-sm label-success">在线</span>';
                }
            }
        }],
        loadComplete: function(data) {
            utils.jqGrid_complete(this);
            gridItem.data = ( data && data.records > 0 ) ? data.rows : [];
            gridItem.selId = undefined;
        },
        onSelectRow: function(rowid, selected) {
            gridItem.selId = rowid;
        },
        onSelectAll: function(aRowids, selected) {
            // 全选/反选均不选中
            gridItem.selId = undefined;
        },
    }).jqGrid('navGrid', pager_selector, { 	//navbar options
        cloneToTop: true,
        edit : false,
        add : false,
        del : false,
        search : false,
        refresh : true,
        refreshtext : '刷新',
        refreshicon : 'ace-icon fa fa-refresh green',
        view : false
    });

    // toolbar
    $('#grid-table_toppager_center').remove();
    $('#grid-table_toppager_right, #grid-pager_left').html('');

    utils.myAddButton(grid, {
        cloneToTop: true,
        caption: "固定车",
        buttonicon: "ace-icon fa fa-user blue",
        title: "固定车",
        position: 'first',
        onClickButton: function() {
            if (!gridItem.selId) {
                return utils.unSelectRow();
            }
            var device = gridItem.data[gridItem.selId-1];
            var type = 2;
            constant.type = type;
            constant.gridBoxItem.jqGrid('setGridParam', {
                url: utils.domain() + "device/getPlateList.do?device_ip="+device.device_ip+'&device_port='+device.device_port+'&type='+type,
                page: 1
            });
            constant.gridBoxItem.jqGrid('setCaption', '固定车');
            constant.gridBoxItem.trigger("reloadGrid");
            gridItem.blackWhileList_edit();
        }
    });

    utils.myAddButton(grid, {
        cloneToTop: true,
        caption: "白名单",
        buttonicon: "ace-icon fa fa-user blue",
        title: "白名单",
        position: 'first',
        onClickButton: function() {
            if (!gridItem.selId) {
                return utils.unSelectRow();
            }
            var device = gridItem.data[gridItem.selId-1];
            var type = 0;
            constant.type = type;
            constant.gridBoxItem.jqGrid('setGridParam', {
                url: utils.domain() + "device/getPlateList.do?device_ip="+device.device_ip+'&device_port='+device.device_port+'&type='+type,
                page: 1
            });
            constant.gridBoxItem.jqGrid('setCaption', '白名单');
            constant.gridBoxItem.trigger("reloadGrid");
            gridItem.blackWhileList_edit();
        }
    });

    utils.myAddButton(grid, {
        cloneToTop: true,
        caption: "黑名单",
        buttonicon: "ace-icon fa fa-user blue",
        title: "黑名单",
        position: 'first',
        onClickButton: function() {
            if (!gridItem.selId) {
                return utils.unSelectRow();
            }
            var device = gridItem.data[gridItem.selId-1];
            var type = 1;
            constant.type = type;
            constant.gridBoxItem.jqGrid('setGridParam', {
                url: utils.domain() + "device/getPlateList.do?device_ip="+device.device_ip+'&device_port='+device.device_port+'&type='+type,
                page: 1
            });
            constant.gridBoxItem.jqGrid('setCaption', '黑名单');
            constant.gridBoxItem.trigger("reloadGrid");
            gridItem.blackWhileList_edit();
        }
    });

    utils.myAddButton(grid, {
        cloneToTop: true,
        caption: "启用状态",
        buttonicon: "ace-icon fa fa-check-square blue",
        title: "启用状态",
        position: 'first',
        onClickButton: function() {
            if (!gridItem.selId) {
                return utils.unSelectRow();
            }
            gridItem.setEnableEditDialogValue();
            gridItem.enable_edit();
        }
    });

    utils.myAddButton(grid, {
        cloneToTop: true,
        caption: "脱机参数",
        buttonicon: "ace-icon fa fa-cog blue",
        title: "脱机参数",
        position: 'first',
        onClickButton: function() {
            if (!gridItem.selId) {
                return utils.unSelectRow();
            }
            gridItem.setEditOfflineParamValue();
            gridItem.offlineParam_edit();
        }
    });
    /**设置启用状态弹框*/
    gridItem.enable_edit = function () {
        $('#enable_edit').removeClass('hide').dialog({
            modal: true,
            // title: "<div class='widget-header widget-header-small'><h4 class='smaller'> 修改信息</h4></div>",
            title_html: true,
            width: 500,
            draggable: false,
            resizable: false,
            buttons: [{
                html: "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
                "class" : "btn btn-primary btn-xs",
                click: function() {
                    var enable = document.getElementsByName('form-enable-radio')[0].checked==true? 1 : 0;
                    var row = gridItem.data[gridItem.selId-1];
                    row.enable = enable;
                    // console.log(enable, row);
                    gridItem.device_submit(row);
                }
            }, {
                html: "<i class='ace-icon fa fa-remove bigger-110'></i>&nbsp; 取消",
                "class" : "btn btn-xs",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }]
        });
    };
    /**显示黑白名单弹框*/
    gridItem.blackWhileList_edit = function () {
        $('#blackWhileList_edit').removeClass('hide').dialog({
            modal: true,
            // title: "<div class='widget-header widget-header-small'><h4 class='smaller'> 修改信息</h4></div>",
            title_html: true,
            width: 650,
            draggable: false,
            resizable: false,
            buttons: [{
                html: "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
                "class" : "btn btn-primary btn-xs",
                click: function() {
                    // gridItem.offlineParam_submit(); // 保存脱机参数
                }
            }, {
                html: "<i class='ace-icon fa fa-remove bigger-110'></i>&nbsp; 取消",
                "class" : "btn btn-xs",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }]
        });
    };
    /**启用状态初始化弹框*/
    gridItem.setEnableEditDialogValue = function () {
        var row = gridItem.data[gridItem.selId-1];
        if(row.enable == 1) {
            $("input[name='form-enable-radio']").get(0).checked=true;
        } else {
            $("input[name='form-enable-radio']").get(1).checked=true;
        }
    };
    /**获取设备对应脱机参数*/
    gridItem.setEditOfflineParamValue = function(){
        $(":input","#offlineParam-edit-form")
        .not(":button",":reset","hidden","submit")
        .val("")
        .removeAttr("checked")
        .removeAttr("selected");
        $.post('/device/getOfflineParam', {device: gridItem.data[gridItem.selId-1]}, function (result) {
            console.log('脱机参数：', result);
            offlineParam = result.data;
            if(offlineParam) {
                $('#serverIP_edit').val(offlineParam.serverIP);
                $('#serverPort_edit').val(offlineParam.serverPort);
                $('#parkID_edit').val(offlineParam.parkID);
                $('#isRecordCover_edit').val(offlineParam.isRecordCover);
                $('#parkInOutFlag_edit').val(offlineParam.parkInOutFlag);
                $('#monthcarAlarmDays_edit').val(offlineParam.monthcarAlarmDays);
                $('#monthCarOpenType_edit').val(offlineParam.monthCarOpenType);
                $('#tempCarOpenType_edit').val(offlineParam.tempCarOpenType);
                $('#oneChannelMode_edit').val(offlineParam.oneChannelMode);
                $('#onlineFlag_edit').val(offlineParam.onlineFlag);
                $('#tempCarForbiddenFlag_edit').val(offlineParam.tempCarForbiddenFlag);
                $('#oneChannelWaitTime_edit').val(offlineParam.oneChannelWaitTime);
                $('#normalModeWaitTime_edit').val(offlineParam.normalModeWaitTime);
                $('#displayRefreshInterval_edit').val(offlineParam.displayRefreshInterval);
                $('#propertyLogo_edit').val(offlineParam.propertyLogo);
            }
        })
    };
    /**保存设备设置*/
    gridItem.device_submit = function (device) {
        $.post('/device/setDevice.do', {device: device}, function (result) {
            console.log(result);
            if(result.errcode == 0) {
                $('#enable_edit').dialog('close');
                utils.notify_rst('设置成功', 1);
                constant.gridItem.trigger("reloadGrid");
            }
        });
    };
    /**保存脱机参数*/
    gridItem.offlineParam_submit = function () {
        var newOfflineParam = offlineParam;
        newOfflineParam.serverIP = $('#serverIP_edit').val();
        newOfflineParam.serverPort = $('#serverPort_edit').val();
        newOfflineParam.parkID = $('#parkID_edit').val();
        newOfflineParam.isRecordCover = $('#isRecordCover_edit').val();
        newOfflineParam.parkInOutFlag = $('#parkInOutFlag_edit').val();
        newOfflineParam.monthcarAlarmDays = $('#monthcarAlarmDays_edit').val();
        newOfflineParam.monthCarOpenType = $('#monthCarOpenType_edit').val();
        newOfflineParam.tempCarOpenType = $('#tempCarOpenType_edit').val();
        newOfflineParam.oneChannelMode = $('#oneChannelMode_edit').val();
        newOfflineParam.onlineFlag = $('#onlineFlag_edit').val();
        newOfflineParam.tempCarForbiddenFlag = $('#tempCarForbiddenFlag_edit').val();
        newOfflineParam.oneChannelWaitTime = $('#oneChannelWaitTime_edit').val();
        newOfflineParam.normalModeWaitTime = $('#normalModeWaitTime_edit').val();
        newOfflineParam.displayRefreshInterval = $('#displayRefreshInterval_edit').val();
        newOfflineParam.propertyLogo = $('#propertyLogo_edit').val();
        console.log('newOfflineParam', newOfflineParam);
        var device = gridItem.data[gridItem.selId-1];
        $.post('/device/setOfflineParam', {device: device, offlineParam: newOfflineParam}, function (result) {
            console.log(result);
            if(result.errcode == 0) {
                $('#offlineParam_edit').dialog('close');
                utils.notify_rst('设置成功', 1);
            }
        });
    };
    /**编辑脱机参数对话框*/
    gridItem.offlineParam_edit  =  function () {
        $('#offlineParam_edit').removeClass('hide').dialog({
            modal: true,
            // title: "<div class='widget-header widget-header-small'><h4 class='smaller'> 修改信息</h4></div>",
            title_html: true,
            width: 500,
            draggable: false,
            resizable: false,
            buttons: [{
                html: "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
                "class" : "btn btn-primary btn-xs",
                click: function() {
                    gridItem.offlineParam_submit(); // 保存脱机参数
                }
            }, {
                html: "<i class='ace-icon fa fa-remove bigger-110'></i>&nbsp; 取消",
                "class" : "btn btn-xs",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }]
        });
    };
    /**查询相关*/
    gridItem.search = function() {
        $('#searchBtn').click(function () { // 查询点击
            doSearch();
        });

        $('#complist').on('change', function(e) {
            grid.jqGrid('setGridParam', {
                url: utils.domain() + "admin/gatewaylist.do",
                page: 1,
                postData: {
                    compid : $("#complist").val(),
                }
            });
            grid.trigger("reloadGrid");
        });
        // 回车查询
        utils.formEnterSubmit($('.form-search'), function () {
            doSearch();
        });
        // postData: {searchField,searchString,}
        function doSearch () {
            // gridItem.grid.jqGrid('getGridParam').postData={};
            // gridItem.grid.setGridParam({
            //     'page':1,
            //     postData: utils.serializeObject($('.form-search')),
            //     mtype: 'POST'
            // }).trigger('reloadGrid');
        }
    };
    return grid;
};

gridBoxItem.initGrid = function (grid_selector, pager_selector) {
    var grid = jQuery(grid_selector).jqGrid({
        caption : "车牌列表",
        // url : utils.domain() + "device/getPlateList.do?",
        // editurl: utils.domain() + "device/getPlateList.do?",
        datatype: 'json',
        height : 'auto',
        autowidth : true,
        altRows : true,
        multiselect : false,
        multiboxonly : false,
        rownumbers : true,
        toppager: true,
        viewrecords : true,
        pager : pager_selector,
        rowNum : 10,
        rowList : [10, 20, 50, 100, 200 ],
        jsonReader : {
            repeatitems : false
        },
        colModel : [{
            name: 'device_id',
            index: 'device_id',
            label: 'device_id',
            hidden: true
        }, {
            name: 'szType',
            index: 'szType',
            label: '名单类型',
            align: 'center',
            formatter: function (val, opt, row) {
                console.log(val);
                if(val == 0){
                    return '白名单';
                }
                if(val == 1) {
                    return '黑名单';
                }
                if(val == 2) {
                    return '固定车';
                }
            }
        }, {
            name: 'szLicense',
            index: 'szLicense',
            label: '车牌名称',
            align: 'center'
        }, {
            name: 'szBeginTime',
            index: 'szBeginTime',
            label: '开始时间',
            align: 'center'
        }, {
            name: 'szEndTime',
            index: 'szEndTime',
            label: '截止时间',
            align: 'center'
        }],
        loadComplete: function(data) {
            utils.jqGrid_complete(this);
            gridBoxItem.data = ( data && data.records > 0 ) ? data.rows : [];
            gridBoxItem.selId = undefined;
        },
        onSelectRow: function(rowid, selected) {
            gridBoxItem.selId = rowid;
        },
        onSelectAll: function(aRowids, selected) {
            // 全选/反选均不选中
            gridBoxItem.selId = undefined;
        },
        gridComplete: function () {
            utils.jqGrid_complete(this);
        }
    });

    grid.jqGrid('navGrid', pager_selector, { 	//navbar options
        cloneToTop: true,
        edit : false,
        add : false,
        del : false,
        search : false,
        refresh : true,
        refreshtext : '刷新',
        refreshicon : 'ace-icon fa fa-refresh green',
        view : false
    });
    // toolbar
    $('#grid-table-box_toppager_center').remove();
    $('#grid-table-box_toppager_right, #grid-pager-box_left').html('');

    utils.myAddButton(grid, {
        cloneToTop: true,
        caption: "清空全部",
        buttonicon: "ace-icon fa fa-trash blue",
        title: "清空全部",
        onClickButton: function() {
            var device = gridItem.data[gridItem.selId-1];
            console.log(constant.type, device.device_ip);
            $.post('/device/clearPlateList.do',{type: constant.type, device_ip: device.device_ip}, function (data) {
                if(data.errcode == 0) {
                    utils.notify_rst('设置成功', 1);
                    constant.gridBoxItem.trigger("reloadGrid");
                }
            });
        }
    });
    return grid;
};

/** 默认操作 */
gridItem.execute = function () {
    // trigger window resize to make the grid get the correct size
    $(window).triggerHandler('resize.jqGrid');
    $(document).one('ajaxloadstart.page', function(e) {
        gridItem.grid.jqGrid('GridUnload');
        $('.ui-jqdialog,.ui-dialog').remove();
    });
    gridItem.search();
};

gridBoxItem.execute = function () {
    // trigger window resize to make the grid get the correct size
    $(window).triggerHandler('resize.jqGrid');
    $(document).one('ajaxloadstart.page', function(e) {
        gridBoxItem.grid.jqGrid('GridUnload');
        $('.ui-jqdialog,.ui-dialog').remove();
    });
    gridBoxItem.search();
};

jQuery(function ($) {
    constant.gridItem = gridItem.initGrid("#grid-table", "#grid-pager");
    constant.gridBoxItem = gridBoxItem.initGrid("#grid-table-box", "#grid-pager-box"); // 黑白名单列表初始化
    gridItem.execute();
    gridBoxItem.execute();
})