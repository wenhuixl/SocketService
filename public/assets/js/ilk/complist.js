/**
 * Created by wenhui on 2018/6/28.
 * 获取小区列表
 */
var gridItem = {
    runOnce : true,
    postData : {
        compid : '',
        compname : ''
    }
};
gridItem.initGrid = function (grid_selector, pager_selector) {
    var grid = jQuery(grid_selector).jqGrid({
        caption : "小区管理",
        url : utils.domain() + "admin/complist.do",
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
            name: 'compid',
            index: 'compid',
            label: '小区组织编号',
            hidden: false
        }, {
            name: 'compname',
            index: 'compname',
            label: '小区名称',
            align: 'center'
        }],
        loadComplete: function(data) {
            console.log('数据加载完成');
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
        $('#schoolYear').on('change', function(e) {
            grid.jqGrid('setGridParam', {
                url: $path_base + "/teachingAssess/search4GridQuery.do",
                page: 1,
                postData: {
                    teacherId :	user.teacherId,
                    term : $("#term").val(),
                    schoolYear : $("#schoolYear").val()
                }
            });
            user.grid.trigger("reloadGrid");
        });
        // 回车查询
        utils.formEnterSubmit($('.form-search'), function () {
            doSearch();
        });
        // postData: {searchField,searchString,}
        function doSearch () {
            grid.jqGrid('getGridParam').postData={};
            grid.setGridParam({
                'page':1,
                postData: utils.serializeObject($('.form-search')),
                mtype: 'POST'
            }).trigger('reloadGrid');
        }
    };

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

jQuery(function ($) {
    gridItem.initGrid("#grid-table", "#grid-pager");
    gridItem.execute();
})