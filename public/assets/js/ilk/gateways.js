/**
 * Created by wenhui on 2018/6/28.
 * 获取小区列表
 */
var gridItem = {};
gridItem.initGrid = function (grid_selector, pager_selector) {
    var grid = jQuery(grid_selector).jqGrid({
        caption : "网关管理",
        url : utils.domain() + "admin/gatewaylist.do?compid=0",
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
            id : "devId"
        },
        colModel : [{
            name: 'gwId',
            index: 'gwId',
            label: '网关编号',
            hidden: false
        }, {
            name: 'gwName',
            index: 'gwName',
            label: '网关名称',
            align: 'center'
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

/**
 * 获取楼栋列表
 */
gridItem.initComplist = function(){
    utils.Ajax({
        url: utils.domain() + 'admin/complist.do',
        beforeSend: function () {
            utils.beforeSend();
        },
        success: function (rst) {
            utils.afterSend();
            $('#complist').html('');
            $('#complist').append("<option value='0'>全部</option>");
            for(var i in rst.rows){
                $('#complist').append("<option value='"
                    + rst.rows[i].compid + "'>" + rst.rows[i].compname + "</option>");
            }
        }
    });
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

jQuery(function ($) {
    gridItem.initGrid("#grid-table", "#grid-pager");
    gridItem.execute();
    gridItem.initComplist(); // 初始化选择列表
})