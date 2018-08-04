/**
 * Created by wenhui on 2018/6/28.
 * 获取小区列表
 */
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
var edit_dialog = "#edit-dialog"; // 编辑弹框
gridItem.initGrid = function (grid_selector, pager_selector) {
    var grid = jQuery(grid_selector).jqGrid({
        caption : "系统设置",
        url : utils.domain() + "admin/getconfig.do",
        editurl: utils.domain() + "admin/editconfig.do",
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
            repeatitems : false,
            id : "config_id"
        },
        colModel : [{
            name: 'config_id',
            index: 'config_id',
            label: 'config_id',
            hidden: true
        },{
            name: 'comp_id',
            index: 'comp_id',
            label: '小区名称',
            hidden: false
        },{
            name: 'gateway_id',
            index: 'gateway_id',
            label: '网关名称',
            align: 'center'
        }, {
            name: 'mzm_mode',
            index: 'mzm_mode',
            label: '是否启用门中门模式',
            align: 'center',
            formatter: function (val, opt, row) {
                console.log(val);
                if(val == '00000000'){
                    return '否';
                }else{
                    return '是';
                }
            }
        }, {
            name: 'plate_picture_keep',
            index: 'plate_picture_keep',
            label: '车牌图片存储天数',
            align: 'center'
        }, {
            name: 'record_keep',
            index: 'record_keep',
            label: '记录存储天数(进出场/换班/放行/收费)',
            align: 'center'
        }, {
            name: 'server_ip',
            index: 'server_ip',
            label: 'IP地址',
            align: 'center'
        }, {
            name: 'websocket_port',
            index: 'websocket_port',
            label: '端口',
            align: 'center'
        }],
        loadComplete: function(data) {
            utils.jqGrid_complete(this);
            gridItem.data = ( data && data.records > 0 ) ? data.rows : [];
            gridItem.selId = undefined;
            console.log('数据加载完成');
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

    /**查询相关*/
    gridItem.search = function() {
        $('#complist').on('change', function(e) {
            var compid = $("#complist").val();
            $.get('/admin/gatewaylist.do', {compid: compid}, function (data) {
                $('#gatewaylist').html('');
                for(var i in data.rows){
                    $('#gatewaylist').append("<option value='"
                        + data.rows[i].gwId + "'>" + data.rows[i].gwName + "</option>");
                }
            })
        });
    };

    utils.myAddButton(grid, {
        cloneToTop: true,
        caption: "编辑",
        buttonicon: "ace-icon fa fa-pencil blue",
        title: "编辑",
        position: 'first',
        onClickButton: function() {
            if (!gridItem.selId) {
                return utils.unSelectRow();
            }
            gridItem.setEditDialogValue();
            gridItem.dialog_edit();
        }
    });

    utils.myAddButton(grid, {
        cloneToTop: true,
        caption: "初始化",
        buttonicon: "ace-icon fa fa-cogs blue",
        title: "初始化",
        position: 'first',
        onClickButton: function() {
            console.log('初始化', gridItem.selId);
            if (!gridItem.selId) {
                return utils.unSelectRow();
            }
            gridItem.initData();
            // gridItem.setEditDialogValue();
            // gridItem.dialog_edit();
        }
    });
    return grid;
};

gridItem.setEditDialogValue = function(){
    $('#form_edit .form-group').removeClass('has-error');
    var rowData = $('#grid-table').jqGrid('getRowData', gridItem.selId);
    $('#complist').val(rowData.comp_id);
    if(rowData.mzm_mode=='否') {
        $('#mzm_mode_edit').val('00000000');
    } else {
        $('#mzm_mode_edit').val('10000000');
    }
    $('#plate_picture_keep_edit').val(rowData.plate_picture_keep);
    $('#record_keep_edit').val(rowData.record_keep);
    $('#server_ip_edit').val(rowData.server_ip);
    $('#websocket_port_edit').val(rowData.websocket_port);
    $.get('/admin/gatewaylist.do', {compid: rowData.comp_id}, function (data) {
        $('#gatewaylist').html('');
        for(var i in data.rows){
            $('#gatewaylist').append("<option value='"
                + data.rows[i].gwId + "'>" + data.rows[i].gwName + "</option>");
        }
        $('#gatewaylist').val(rowData.gateway_id);
    })
};
/**保存编辑*/
gridItem.doEdit = function () {
    var rowData = $('#grid-table').jqGrid('getRowData', gridItem.selId);
    var config_id = rowData.config_id;
    var comp_id = $('#complist').val();
    var gateway_id = $('#gatewaylist').val();
    var mzm_mode = $('#mzm_mode_edit').val();
    var plate_picture_keep = $('#plate_picture_keep_edit').val();
    var record_keep = $('#record_keep_edit').val();
    var server_ip = $('#server_ip_edit').val();
    var websocket_port = $('#websocket_port_edit').val();
    console.log(config_id, comp_id, gateway_id, mzm_mode, plate_picture_keep, record_keep);
    $.post('/admin/saveconfig.do', {config_id: config_id, comp_id: comp_id, gateway_id: gateway_id, mzm_mode: mzm_mode, plate_picture_keep: plate_picture_keep, record_keep: record_keep, server_ip: server_ip, websocket_port: websocket_port}, function (data) {
        console.log(data);
        utils.notify_rst('保存成功', data.rstId);
        if (data.rstId > 0) {
            gridItem.grid.trigger('reloadGrid');
            $('#dialog_edit').dialog('close');
        }
    })
};
/** 初始化*/
gridItem.initData = function () {
    $("#initData").removeClass('hide').dialog({
        // title: "<div class='widget-header widget-header-small'><h4 class='smaller'>初始化</h4></div>",
        resizable: false,
        modal: true,
        title_html: true,
        width: 500,
        resizable: true,
        buttons: [{
            html: "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
            "class": "btn btn-primary btn-xs",
            click: function() {
                var rowData = $('#grid-table').jqGrid('getRowData', gridItem.selId);
                $.post('/admin/init.do', {comp_id: rowData.comp_id, gateway_id: rowData.gateway_id}, function (data) {
                    console.log(data);
                    utils.notify_rst('初始化成功', data.rstId);
                    $('#initData').dialog('close');
                })
            }
        }, {
            html: "<i class='ace-icon fa fa-remove bigger-110'></i>&nbsp; 取消",
            "class": "btn btn-xs",
            click: function() {
                $(this).dialog( "close" );
            }
        }]
    })
};
/**编辑对话框*/
gridItem.dialog_edit  =  function () {
    $('#dialog_edit').removeClass('hide').dialog({
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
                gridItem.doEdit();
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
/**获取小区列表*/
gridItem.initComplist = function(){
    utils.Ajax({
        url: utils.domain() + 'admin/complist.do',
        beforeSend: function () {
            // utils.beforeSend();
        },
        success: function (rst) {
            // utils.afterSend();
            $('#complist').html('');
            for(var i in rst.rows){
                $('#complist').append("<option value='"
                    + rst.rows[i].compid + "'>" + rst.rows[i].compname + "</option>");
            }
        }
    });
};
/** 默认操作 */
gridItem.execute = function () { // trigger window resize to make the grid get the correct size
    $(window).triggerHandler('resize.jqGrid');
    $(document).one('ajaxloadstart.page', function(e) {
        gridItem.grid.jqGrid('GridUnload');
        $('.ui-jqdialog,.ui-dialog').remove();
    });
    gridItem.search();
};
/**减数*/
function subtract(id) {
    var num = parseInt($('#'+id).val());
    num = (num -1) < 0? 0 : (num -1);
    $('#'+id).val(num);
};
/**加数*/
function increase(id) {
    var num = parseInt($('#'+id).val());
    num = (num +1) > 100? 100 : (num +1);
    $('#'+id).val(num);
};
jQuery(function ($) {
    gridItem.grid = gridItem.initGrid("#grid-table", "#grid-pager");
    gridItem.execute();
    gridItem.initComplist(); // 初始化选择列表
});