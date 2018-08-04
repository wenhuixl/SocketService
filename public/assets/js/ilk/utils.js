/**
 * 售后服务工具类
 * @author lzh
 */
var utils = {
		PROJECT_NAME : 			"",
		ERROR_PAGE: {
			_404: 				'ajax.html#page/error/error-404',				// 404异常页面
			_500: 				'ajax.html#page/error/error-500'				// 500异常页面
		},
		PAGE: {
			LOGIN: 				'',												// 登录跳转链接
		},
		DOMAIN: {
			RES_URL_PATH: 		'',												// 图片文件访问路径
			FILE_UPLOAD: 		''												// 文件上传的路径
		},
		repeatFlag: 			false, // 登录超时/套餐过期的重复标记，防止页面多个请求时重复执行,
		
		mapConfig: {
			CENTER: 			'中山市',
			ZOOM:				12,
		},
		
		jqGridConfig: {
			page:				1,	// 默认行
			rowNum: 			10,	// 每页显示记录数
		},
		
		/**
		 * 项目域名
		 * @param projectName 项目名（非必须的），默认为当前项目名
		 * @returns e.g. http://localhost:8080/ILKService
		 */
		domain: function (projectName) {
			var loc = window.document.location;
			var origin = loc.origin;
			
			// IE兼容
			if (!origin) {
				// origin = http: + '//' + localhost:8080
				origin = loc.protocol + '//' + loc.host;
			}
			return origin + "/" + ( projectName || utils.PROJECT_NAME);
		},
		
		/**
		 * 获取资源文件目录
		 * @param relativePath 文件相对路径
		 */
		getFilePath: function (relativePath) {
			return relativePath ? ( utils.DOMAIN.RES_URL_PATH + relativePath ) : "";
		}
};

utils.PAGE.LOGIN 			= utils.domain() + '/login/login.do';
utils.DOMAIN.FILE_UPLOAD	= utils.domain() + '/baseController/upload_formdata.do';

utils.AjaxConfig = {
	ajaxDataType:	'json',
	ajaxType_POST:	'POST',
	ajaxType_GET:	'GET',
	ajaxAsync:		true,
	ajaxCache:		false,
}
/** 
 * 对ajax的封装
 * @param ajaxInfo
 * ajaxInfo : {
 * 		url:		'',								// 依靠上层指定
 * 		type: 		"GET",							// 访问方式：如果formData不为空,自动设置为POST; 如果为空设置为GET
 * 		dataType: 	utils.AjaxConfig.ajaxDataType,	// 数据类型：JSON、JSONP、text
 * 		cache: 		false,							// 是否缓存，默认不缓存
 * 		urlParams: 	{},								// 添加在url后面的参数, 以GET方法提交
 * 		formData: 	{},								// 表单参数, dateType为JSON,添加进form表单里面; dateType为JSONP,添加在url后面
 * }
 */
utils.Ajax = function(ajaxInfo) {
    // 补全ajaxInfo
    // dataType 
    if (typeof ajaxInfo.dataType == "undefined") {
    	ajaxInfo.dataType = utils.AjaxConfig.ajaxDataType;
    }
    //cache
    if (typeof ajaxInfo.cache == "undefined") {
    	ajaxInfo.cache = utils.AjaxConfig.ajaxCache;
    }
    //async
    if (typeof ajaxInfo.async == "undefined") {
    	ajaxInfo.async = utils.AjaxConfig.ajaxAsync;
    }

    //type
    if (typeof ajaxInfo.formData == "undefined") {
        ajaxInfo.type = utils.AjaxConfig.ajaxType_GET;
    } else {
        ajaxInfo.type = utils.AjaxConfig.ajaxType_POST;
        ajaxInfo.data = ajaxInfo.formData;
    }
   
    //处理URL和参数
    if (typeof ajaxInfo.urlParams != "undefined") {
        var tmpUrlPara = "";
        var para = ajaxInfo.urlParams;
        for (var key in para) {
            tmpUrlPara += "&" + key + "=" + para[key];
        }

        if (ajaxInfo.url.indexOf('?') >= 0) {
            //原地址有参数，直接加
            ajaxInfo.url += tmpUrlPara;
        } else {
            //原地址没有参数，变成?再加
            ajaxInfo.url += tmpUrlPara.replace('&', '?');
        }
        delete tmpUrlPara;
        delete para;
    }

    //处理xhrFields
    if (typeof ajaxInfo.xhrFields == "undefined") {
        ajaxInfo.xhrFields = {
            // 允许cors跨域访问时添加cookie
            withCredentials: true
        };
    } else {
        if (typeof ajaxInfo.xhrFields.withCredentials == "undefined") {
            ajaxInfo.xhrFields.withCredentials = true;
        }
    }

    //处理error
    var error = ajaxInfo.error;
    ajaxInfo.error = function(request, textStatus, errorThrown) {
        //访问失败，自动停止加载动画，并且给出提示
        console.log("提交" + ajaxInfo.title + "的时候发生错误！");
        //if (typeof top.spinStop != "undefined") top.spinStop();
        if (typeof error == "function") {
        	error();
        }
    };

    //处理success
    var success = ajaxInfo.success;
    ajaxInfo.success = function(data) {
        //显示调试信息
        //if (typeof(parent.DebugSet) != "undefined") parent.DebugSet(data.debug);
    	
    	success(data);
    };
    //开始执行ajax
    $.ajax(ajaxInfo);
};

/**
 * 将图片单独上传至server返回图片相对路径
 * @param fileInfo file对象
 * @param compress 是否压缩 boolean
 */
utils.readFileIntoDataUrl = function (fileInfo, compress, quality, sum) {
	var form = new FormData();
	compress = ( compress == undefined ? true : compress );
	quality = quality || 0.6;
	sum = sum || 2;
	form.append('compress', compress);
    form.append("FileData", fileInfo);
    form.append('quality', quality);
    form.append('sum', sum);
    
    var xhr = new XMLHttpRequest();
    // 这里是传到后台的入库的方法，返回图片路径
    xhr.open("post", utils.DOMAIN.FILE_UPLOAD, false);
    xhr.send(form);
    return xhr.responseText;
};

/**
 * 是否登录超时
 * @param xhr_responseText
 */
utils.isTimeOut = function (xhr_responseText) {
	return xhr_responseText == "timeout" && !utils.repeatFlag;
};

/** 全局AJAX请求配置 */
$.ajaxSetup({
    global: false,
    type: "POST",
    complete: function (XMLHttpRequest, textStatus) {
       
    	if (utils.isTimeOut(XMLHttpRequest.responseText)) {
        	
        	if (confirm('登录超时，请重新登录！')) {
        		
    			if (window.top != window.self) {
    				window.top.location = utils.PAGE.LOGIN;
    			} else {
    				window.location.href = utils.PAGE.LOGIN;
    			}
        	}
        	// 重复请求的标记，防止页面多个请求时重复执行
        	utils.repeatFlag = true;
    	}
    	// there is no else
    },
    error: function(jqXHR, textStatus, errorThrown) {
        switch (jqXHR.status) {
            case(500): {
            	window.location.href = utils.ERROR_PAGE._500; 
            	break;
            }
            case(404): {
            	window.location.href = utils.ERROR_PAGE._404; 
            	break;
            }
            case(401): alert("未登录");				break;  
            case(403): alert("无权限执行此操作");	break;
            case(408): alert("请求超时");			break;  
            default:   console.log(jqXHR.status + " : " + jqXHR.statusText);  
        }
    }
});
/** 判断对象是否为空 */
utils.isEmptyObj = function (obj) {
    for(var i in obj){
        if(obj.hasOwnProperty(i)){
            return false;
        }
    }
    return true;
};
/** 对象深拷贝 */
utils.deepCopy = function (source) {
    var result = {};
    for (var key in source) {
        result[key] = typeof source[key]=== 'object' ? utils.deepCopy(source[key]): source[key];
    } 
    return result; 
};

/**
 * 增加formatString功能
 * 
 * 使用方法：wst.format('字符串{0}字符串{1}字符串','第一个变量','第二个变量');
 */
utils.format = function(str) {
	for ( var i = 0; i < arguments.length - 1; i++) {
		str = str.replace("{" + i + "}", arguments[i + 1]);
	}
	return str;
};
/**
 * 获取cookie
 * @param cookie 的名称
 */
utils.getCookie = function(c_name) {
	if (document.cookie.length > 0) {
		c_start = document.cookie.indexOf(c_name + "=");
		
		if (c_start != -1) {
			c_start = c_start + c_name.length + 1
			c_end = document.cookie.indexOf(";", c_start);
			
			if (c_end == -1) {
				c_end = document.cookie.length
			}
			return unescape(document.cookie.substring(c_start, c_end));
		}
	}
	return ""
}
/**
 * 创建cookie
 * @param c_name 		cookie名称
 * @param value 		cookie值
 * @param expiredays 	天数
 * */
utils.setCookie = function (c_name, value, expiredays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + expiredays);
	document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
};
// =========================================================================================== date
Date.prototype.format = function(format) {
	var o = {
		"M+" : this.getMonth() + 1, 					// month
		"d+" : this.getDate(), 							// day
		"h+" : this.getHours(), 						// hour
		"m+" : this.getMinutes(), 						// minute
		"s+" : this.getSeconds(), 						// second
		"q+" : Math.floor((this.getMonth() + 3) / 3), 	// quarter
		"S" : this.getMilliseconds()					// millisecond
	};
	if (/(y+)/.test(format) || /(Y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for ( var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
/**
 * timestamp(datetime)格式化
 * 
 * @param timestamp
 * @param pattern default: "yyyy-MM-dd"
 */
utils.timestampFormat = function(timestamp, pattern) {
	return (new Date(timestamp)).format(pattern || "yyyy-MM-dd");
};
/**
 * 得到日期年月日等加数字后的日期
 * e.g. dateObj.dateAdd('m', 6)
 * @param interval	 必选项 字符串表达式，表示要添加的时间间隔
 * @param number	 必选项 数值表达式，表示要添加的时间间隔的个数。数值表达式可以是正数（得到未来的日期）或负数（得到过去的日期）。
 * @returns {Date}
 */
/**
		   设置	描述
			y	年
			q	季度
			m	月
			d	日
			w	周
			h	小时
			n	分钟
			s	秒
			ms	毫秒
 */
Date.prototype.dateAdd = function(interval, number) {
	var d = this;
	var k = {
		'y' : 'FullYear',
		'q' : 'Month',
		'm' : 'Month',
		'w' : 'Date',
		'd' : 'Date',
		'h' : 'Hours',
		'n' : 'Minutes',
		's' : 'Seconds',
		'ms' : 'MilliSeconds'
	};
	var n = {
		'q' : 3,
		'w' : 7
	};
	eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+'
			+ ((n[interval] || 1) * number) + ')');
	return d;
};
/**
 * 计算两日期相差的日期年月日等
 * e.g. date1.dateDiff('d', date2) 其中date1, date2为日期类型
 * http://www.cnblogs.com/cuixiping/archive/2008/11/16/1334510.html
 *
 * @param interval	必选项 字符串表达式，表示用于计算 date1 和 date2 之间的时间间隔
 * @param objDate2	比较的日期对象
 * @returns objDate2 - objDate1
 */
Date.prototype.dateDiff = function(interval, objDate2) {
	var d = this, i = {}, t = d.getTime(), t2 = objDate2.getTime();
	i['y'] = objDate2.getFullYear() - d.getFullYear();
	i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4)
			- Math.floor(d.getMonth() / 4);
	i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth();
	i['ms'] = objDate2.getTime() - d.getTime();
	i['w'] = Math.floor((t2 + 345600000) / (604800000))
			- Math.floor((t + 345600000) / (604800000));
	i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
	i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
	i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
	i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
	return i[interval];
};
/**
 * 格式化数字
 * @param num		数据
 * @param precision 精度
 * @param separator	分割符
 */
utils.numberFormat = function (num, precision, separator) {
	var parts;
	    // 判断是否为数字
    if (!isNaN(parseFloat(num)) && isFinite(num)) {
        // 把类似 .5, 5. 之类的数据转化成0.5, 5, 为数据精度处理做准, 至于为什么
        // 不在判断中直接写 if (!isNaN(num = parseFloat(num)) && isFinite(num))
        // 是因为parseFloat有一个奇怪的精度问题, 比如 parseFloat(12312312.1234567119)
        // 的值变成了 12312312.123456713
        num = Number(num);
        // 处理小数点位数
        // num = (typeof precision !== 'undefined' ? num.toFixed(precision) : num).toString();
        num = (typeof precision !== 'undefined' ? utils.decimal(num, precision) : num).toString();
        // 分离数字的小数部分和整数部分
        parts = num.split('.');
        // 整数部分加[separator]分隔, 借用一个著名的正则表达式
        parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (separator || ','));

        return parts.join('.');
    }
    return NaN;
};
/**
 * @param num 		数据
 * @param precision	精度
 */
utils.decimal = function (num, precision) {  
    var nn = Math.pow(10, precision);  
    var number = Math.round(num * nn) / nn;
    var result = number.toString(); 
    var rs = result.indexOf('.'); 
    if (rs < 0) { 
      rs = result.length; 
      result += '.'; 
    } 
    while (result.length <= rs + 2) { 
    	result += '0'; 
    }
    return result;
};
/** 表单回车提交 */
utils.formEnterSubmit = function (form, handlerFun) {
	form.find('input').on('keyup', function(event) {
		if (event.keyCode == '13') {
			handlerFun();
		}
	});
};
/**
 * 序列化表单为map对象
 * $.serialize		序列表表格内容为字符串		 
 * $.serializeArray 序列化表格元素为JSON数据结构 e.g.[{name: 'lastName', value: 'World'}, {name: 'alias'}]

 * @param form 表单对象
 * @returns [{ key: value }] e.g. [{ lastName: 'World' }]
 */
utils.serializeObject = function(form) {
	var o = {};
	$.each(form.serializeArray(), function(index) {
		if (o[this['name']]) {
			o[this['name']] = o[this['name']] + "," + this['value'];
		} else {
			o[this['name']] = this['value'];
		}
	});
	return o;
};
// ==================================================================== gritter
/** Gritter 常量选项 */
utils.gritter = {
		INFO: 		'info',
		SUCCESS: 	'success',
		WARNING: 	'warning',
		ERROR: 		'error'
};
/**
 * @param text	显示文本
 * @param title 标题（非必须）
 * @description 需引入 jquery.gritter.js, jquery.gritter.css
 */
utils.notify = function (text, type) {
	return $.gritter.add({
		title: '提示',
		//image: utils.domain() + '/',
		text : text || '这是一个提示框',
		class_name: 'gritter-center gritter-' + ( type || utils.gritter.INFO )
	});
};
/**
 * @param text	错误文本
 * @description 需引入 jquery.gritter.js
 */
utils.notify_error = function (text) {
	return $.gritter.add({
		title: '错误',
		//image: utils.domain() + '/',
		text : text || '这是一个错误提示框',
		class_name: 'gritter-center gritter-error'
	});
};
utils.notify_rst = function (text, rstId) {
	var type = rstId > 0 ? utils.gritter.SUCCESS : utils.gritter.ERROR;
	return $.gritter.add({
		title: '提示',
		//image: utils.domain() + '/',
		text : text || '这是一个提示框',
		class_name: 'gritter-center gritter-' + type
	});
};
// =================================================================== jqGrid
/**
 * jqGrid表格宽度重置
 * @param width 宽度 
 */
utils.jqGridResize = function ($grid, width) {
	// resize to fit page size
	$(window).on('resize.jqGrid', function () {
		try {
			$grid.jqGrid( 'setGridWidth', width || $(".page-content").width() );
		} catch (e) {
		}
    })
	// resize on sidebar collapse/expand
	var parent_column = $grid.closest('[class*="col-"]');
	$(document).on('settings.ace.jqGrid' , function(ev, event_name, collapsed) {
		if( event_name === 'sidebar_collapsed' || event_name === 'main_container_fixed' ) {
			//setTimeout is for webkit only to give time for DOM changes and then redraw!!!
			setTimeout(function() {
				$grid.jqGrid( 'setGridWidth', parent_column.width() );
			}, 0);
		}
    });
};
/**
 * 未选中行
 */
utils.unSelectRow = function () {
	return utils.notify('请选择一条记录！');
};
/**
 * 自定义按钮
 * @param grid
 * @param options
 */
utils.myAddButton = function (grid, options) {
	$(grid).jqGrid('navButtonAdd', $(grid)[0].p.pager, options);
	$(grid).jqGrid('navButtonAdd', '#'+ $(grid)[0].id + "_toppager", options);
}
/**
 * edit record form
 * @param width
 * @param viewPagerButtons true/false
 * @param beforeShowForm	function
 */
utils.edit_options = function (width, viewPagerButtons, beforeShowForm) {
	return {
		width : width,
		recreateForm: true,
		closeAfterEdit: true,
		viewPagerButtons: viewPagerButtons,
		beforeShowForm: function(e) {
			var form = $(e[0]);
			form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar')
					.wrapInner('<div class="widget-header" />');
			beforeShowForm(form);
		},
		afterSubmit : utils.jqGrid_cud_afterSubmit,
		onclickSubmit : function (params, posdata) {
			utils.beforeSend();
		}
	}
};

utils.jqGrid_cud_afterSubmit = function (response, postdata) {
	utils.afterSend();
	var rtn = JSON.parse(response.responseText);
	if (rtn.rstId > 0) {
		//
		utils.notify_rst(rtn.rstDesc, rtn.rstId);
		// Reloads the grid after edit
		$(this).jqGrid('setGridParam', {
			datatype : 'json'
		}).trigger('reloadGrid'); 
		return [ true, '' ];
	}
	if (!rtn.success) {
		var msg = '';
		var error = rtn.validMap;
		for ( var p in error) {
			msg += error[p];
		}
		return [false, msg];
	}
	return [ false, rtn.rstDesc ];// Captures and displays the response text on th Edit window
};

/**
 * new record form
 * @param width
 * @param viewPagerButtons true/false
 * @param beforeShowForm	function
 */
utils.add_options = function (width, viewPagerButtons, beforeShowForm) {
	return {
		width : width,
		recreateForm: true,
		closeAfterAdd: true,
		viewPagerButtons: viewPagerButtons,
		beforeShowForm: function(e) {
			var form = $(e[0]);
			form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar')
					.wrapInner('<div class="widget-header" />');
			beforeShowForm(form);
		},
		afterSubmit : utils.jqGrid_cud_afterSubmit,
		onclickSubmit : function (params, posdata) {
			utils.beforeSend();
		}
	}
};

/**
 * delete record form
 * @param width
 * @param beforeShowForm function
 */
utils.del_options = function (width, beforeShowForm) {
	return {
		width : width,
		recreateForm : true,
		beforeShowForm : function(e) {
			var form = $(e[0]);
			if (form.data('styled')) return false;

			form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar')
					.wrapInner('<div class="widget-header" />');
			beforeShowForm(form);

			form.data('styled', true);
		},
		afterSubmit : utils.jqGrid_cud_afterSubmit,
		onclickSubmit : function (params, posdata) {
			utils.beforeSend();
		}
	}
};

utils.search_options = function () {
	return {};
};

/**
 * view record form
 * @param width
 * @param beforeShowForm function
 */
utils.view_options = function (width, beforeShowForm) {
	return {
		width : width,
		recreateForm : true,
		beforeShowForm : function(e) {
			var form = $(e[0]);
			form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap(
					'<div class="widget-header" />');
			beforeShowForm(form);
		}
	}
};
/** jqGrid默认加载完成的方法 */
utils.jqGrid_complete = function (table) {
	setTimeout(function() {
		//replace icons with FontAwesome icons like above
		utils.updatePagerIcons(table);
		utils.enableTooltips(table);
		
		// 查无数据
		if (utils.isEmptyObj($(table).jqGrid('getRowData'))) {
			$(table).prev().addClass('center').html('<p class="grey lighter smaller" style="line-height:3;font-size:16px;"><i class="ace-icon fa fa-frown-o"></i> 没有数据显示</p>');
		} else {
			$(table).prev().removeClass('center').html('');
		}
	}, 0);
};
/** jqGrid对话框居中 */
utils.jqGridDlgCentered = function (dlgDiv) {
	try {
	    var objLeft = ($(window).width() - dlgDiv.width()) / 2 ; 
	    var objTop = ($(window).height() - dlgDiv.height()) / 2 + $(document).scrollTop();
	    dlgDiv.css({
	    	left:		objLeft + 'px', 
	    	top:		objTop  + 'px',
	    	'display':  'block'
	    });
	    
	} catch (e) {
		console.log(e)
	}
};
utils.isJqGridDetail = function ($form) {
	return $form.attr('id').indexOf('_grid-table-detail') != -1;
};
utils.style_edit_form = function (form) {
	if (utils.isJqGridDetail($(form))) {
		utils.jqGridDlgCentered($("#editmodgrid-table-detail"));
	} else {
		utils.jqGridDlgCentered($("#editmodgrid-table"));
	}
	
	//update buttons classes
	var buttons = form.next().find('.EditButton .fm-button');
	buttons.addClass('btn btn-sm').find('[class*="-icon"]').hide();//ui-icon, s-icon
	buttons.eq(0).addClass('btn-primary').prepend('<i class="ace-icon fa fa-check"></i>');
	buttons.eq(1).prepend('<i class="ace-icon fa fa-times"></i>')
	
	buttons = form.next().find('.navButton a');
	buttons.find('.ui-icon').hide();
	buttons.eq(0).append('<i class="ace-icon fa fa-chevron-left"></i>');
	buttons.eq(1).append('<i class="ace-icon fa fa-chevron-right"></i>');		
};
utils.style_view_form = function (form) {
	if (utils.isJqGridDetail($(form))) {
		$("#viewmodgrid-table-detail").css({ paddingBottom: 20 });
		utils.jqGridDlgCentered($("#viewmodgrid-table-detail"));
	} else {
		$("#viewmodgrid-table").css({ paddingBottom: 20 });
		utils.jqGridDlgCentered($("#viewmodgrid-table"));
	}
};
utils.style_delete_form = function (form) {
	if (utils.isJqGridDetail($(form))) {
		utils.jqGridDlgCentered($("#delmodgrid-table-detail"));
	} else {
		utils.jqGridDlgCentered($("#delmodgrid-table"));
	}
	
	var buttons = form.next().find('.EditButton .fm-button');
	buttons.addClass('btn btn-sm').find('[class*="-icon"]').remove();//ui-icon, s-icon
	buttons.eq(0).addClass('btn-danger').prepend('<i class="ace-icon fa fa-trash"></i>');
	buttons.eq(1).prepend('<i class="ace-icon fa fa-remove"></i>');
};
utils.style_search_filters = function (form) {
	form.find('.delete-rule').val('X');
	form.find('.add-rule').addClass('btn btn-xs btn-primary');
	form.find('.add-group').addClass('btn btn-xs btn-success');
	form.find('.delete-group').addClass('btn btn-xs btn-danger');
};
utils.style_search_form = function (form) {
	var dialog = form.closest('.ui-jqdialog');
	var buttons = dialog.find('.EditTable')
	buttons.find('.EditButton a[id*="_reset"]').addClass('btn btn-sm btn-info').find('.ui-icon').attr('class', 'ace-icon fa fa-retweet');
	buttons.find('.EditButton a[id*="_query"]').addClass('btn btn-sm btn-inverse').find('.ui-icon').attr('class', 'ace-icon fa fa-comment-o');
	buttons.find('.EditButton a[id*="_search"]').addClass('btn btn-sm btn-purple').find('.ui-icon').attr('class', 'ace-icon fa fa-search');
};
utils.updatePagerIcons = function (table) {
	var replacement = {
		'ui-icon-seek-first' : 'ace-icon fa fa-angle-double-left bigger-140',
		'ui-icon-seek-prev' : 'ace-icon fa fa-angle-left bigger-140',
		'ui-icon-seek-next' : 'ace-icon fa fa-angle-right bigger-140',
		'ui-icon-seek-end' : 'ace-icon fa fa-angle-double-right bigger-140'
	};
	$('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function(){
		var icon = $(this);
		var $class = $.trim(icon.attr('class').replace('ui-icon', ''));
		
		if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
	})
};
utils.enableTooltips = function (table) {
	$('.navtable .ui-pg-button').tooltip({container:'body'});
	$(table).find('.ui-pg-div').tooltip({container:'body'});
};
/** 
 * 倒计时函数
 * 需要在按钮上绑定单击事件
 * 如: <button onclick="setInterval('countDown(this, 30)',1000);">发送短信</button>
 * 30代表秒数，需要倒计时多少秒可以自行更改
 */
utils.countDown = function(obj, second) {
    // 如果秒数还是大于0，则表示倒计时还没结束
    if(second >= 0) {
          // 获取默认按钮上的文字
        if(typeof utils.buttonDefaultValue === 'undefined' ) {
        	utils.buttonDefaultValue =  "获取短信验证码";
        	if(utils.getCookie("ilkCountDown") == null || Date.parse(new Date()) / 1000 - utils.getCookie("ilkCountDown") > 0) {
        		utils.setCookie("ilkCountDown", Date.parse(new Date()) / 1000 + second, 1);
        	}
        }
        // 按钮置为不可点击状态
        obj.disabled = true;            
        // 按钮里的内容呈现倒计时状态
        obj.value = '重新发送' + '('+ second +')';
        // 时间自减一
        second--;
        // 一秒后重复执行
        setTimeout(function() { utils.countDown(obj, second); }, 1000);
    // 否则，按钮重置为初始状态
    } else {
    	utils.setCookie("ilkCountDown", '', -1);
        // 按钮置为可点击状态
        obj.disabled = false;   
        // 按钮里的内容恢复初始状态
        obj.value = utils.buttonDefaultValue;
        delete utils.buttonDefaultValue;
    }   
};
/** override dialog's title function to allow for HTML titles  */
utils.jq_dialog_html_title = function () {
	$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
		_title: function(title) {
			var $title = this.options.title || '&nbsp;'
			if( ("title_html" in this.options) && this.options.title_html == true ) {
				title.html($title);
			} else {
				title.text($title);
			}
		}
	}));
};

/**
 * 加载系统常量下拉列表
 * @param constantNumber	系统常量编号
 * @param selector			选择器
 * @param placeholder		下拉列表提示
 * json格式：
[
	{
        "constantId": 2,
        "constantNumber": "project_level",
        "constantName": "项目级别",
        "constantType": "Enum",
        "isSysConstant": true,
        "defaultValue": "",
        "enumOptions": [
            {
                "enumId": 1,
                "enumNumber": "pl-001",
                "enumName": "A",
                "enumVal": 1,
                "isSysConstant": true
            }
        ]
    }
]
 */
/**
 * 加载下拉列表
 * utils.loadWidgetSelect(options, [callback])
 * @param options {
 * 		url:		获取数据的链接
 *		urlParams:	参数（GET请求）
 *		selector:	下拉列表选择器
 *		title:		标题
 *		value:		option-value
 *		name:		options-name
 * }
 * @param callback
 */
utils.loadWidgetSelect = function (options, callback) {
	var opt = {
			type:		options.type || 'GET',
			url:		options.url,
			urlParams:	options.urlParams || {},
			selector:	options.selector,
			title:		options.title,
			id:			options.value,
			name:		options.name,
			clazz:		options.clazz || 'input-medium'
	};
	$.ajax({
		url: opt.url,
		data: opt.urlParams,
		dataType: 'json',
		type: opt.type,
		success: function (data) {
			// data为数组
			if (data && data.length > 0) {
				var html = '';
				
				if (opt.title) {
					html = utils.format('<option value="">请选择{0}</option>', opt.title);
				} else {}
				
				for ( var i in data) {
					html += utils.format('<option value={0} {2}>{1}</option>',
							eval('data[i].' + opt.id), eval('data[i].' + opt.name), ( !opt.title && i== 0 ) ? 'selected' : '');
				}
				$( opt.selector ).html('');
				$( opt.selector ).append(html).addClass(opt.clazz);
				
			} else {
				$( opt.selector ).html('<option value="">查无'+ ( opt.title ? opt.title : '') +'数据</option>');
			}
			
			if ( callback && typeof callback === 'function' ) {
				callback(data);
			}
		}
	});
};
/**
 * 选中下拉列表-加载数据
 * utils.selectOption(selector, value, [callback])
 * @param selector
 * @param value
 * @param callback
 * @return 当前选中的DOM
 */
utils.selectOption = function (selector, value, callback) {
	try {
		var target = $(selector + ' option[value='+ value +']')[0];
		target.selected = true;
		
		if (callback && typeof callback == 'function') {
			callback(target);
		}
		return;
	} catch (e) {
		console.log(e.stack)
	}
};
utils.isFunction = function (fun) {
	if (fun && typeof fun == 'function') {
		return true;
	}
	return false;
};
/**
 * 获取当前选中的对象
 * @param options {
 * 		data: 	// 数据列表
 * 		id:		// 对象ID, 属性名
 * 		selId: 	// 当前选中的ID
 * }
 * @returns 当前选中的object
 */
utils.getRowData = function (options) {
	var data = options.data;
	for ( var i = 0, len = data.length; i < len; i++ ) {
		if ( options.selId == eval('data[i].' + options.id) ) {
			return data[i];
		}
	}
	return {};
};
/**
 * 获取URL链接参数
 * @param paramName 参数名
 * @returns 参数值
 */
utils.getUrlParam = function (paramName) { 
	var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)", "i"); 
	var r = window.location.search.substr(1).match(reg); 
	if (r != null) {
		return unescape(r[2]);
	}
	return null;
};
/**
 * 获取URL链接参数
 * @returns 参数-值列表
 */
utils.getRequest = function () { 
	var url = location.search; // 获取url中"?"符后的字串 
	var theRequest = new Object(); 
	if (url.indexOf("?") != -1) { 
		var str = url.substr(1); 
		strs = str.split("&"); 
		for(var i = 0; i < strs.length; i ++) { 
			theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]); 
		}
	}
	return theRequest; 
};

/**
 * 格式化状态
 * @param type 类型（ info / success / danger / warning / primary / inverse）
 * @param msg 描述
 * @param value 状态值
 * @returns
 */
utils.formatState = function (type, msg, value) {
	return utils.format('<span class="label label-sm label-{0}" data-value={2}>{1}</span>', type, msg, value);
};

/**
 * 禁用form表单中所有的input[文本框、复选框、单选框],select[下拉选],多行文本框[textarea]
 * @param form_selector 表单选择器
 * @param isReadonly 是否禁用
 */
utils.readonly = function (form_selector, isReadonly) {
	$(form_selector).find('input,textarea,select').attr('readonly', isReadonly);
	// ace
	$(form_selector).find('input:radio').attr('disabled', isReadonly);
	$(form_selector).find('select').attr('disabled', isReadonly);
};

//=================================================================== file upload (基于dropzone.js)
/**
 * 文件上传设置
 */
utils.fileSettings = {
	maxSize: 		5 * 1024 * 1024, // 单位：M
	maxSizeMsg:		'5M',
	//apk文件大小限制
	apkMaxSize: 	200 * 1024 * 1024,
	apkMaxSizeMsg:  '200M',
	minUploadSize: 1024
};

/**
 * 文件上传错误-回调
 * 
 * @param event
 * @param eObj
 *
 * json from assets.js.ace.elements.fileinput.js : {
 *		'file_count': 		files.length,
 *		'invalid_count': 	files.length - safe_files.length,
 *		'error_list': 		error_list,
 *		'error_count': 		error_count,
 *		'dropped': 			dropped
 *	}
 */
utils.file_error = function (event, eObj) {
	
	if (!utils.isEmptyObj(eObj.error_list['size'])) {
		utils.notify_error('上传图片最大不超过' + utils.fileSettings.maxSizeMsg);
	
	} else if (!utils.isEmptyObj(eObj.error_list['ext'])) {
		utils.notify_error("只允许上传jpg, jpeg, png等后辍的图片");
		
	} else if (!utils.isEmptyObj(eObj.error_list['mime'])) {
		utils.notify_error("错误代码：MIME");
	}
	console.log(event);
};

/**Excel上传错误-回调*/
utils.file_error_excel = function (event, eObj) {
	
	if (!utils.isEmptyObj(eObj.error_list['size'])) {
		utils.notify_error('上传文件最大不超过' + utils.fileSettings.maxSizeMsg);
	
	} else if (!utils.isEmptyObj(eObj.error_list['ext'])) {
		utils.notify_error("只允许上传xls,xlsx后辍的文件");
		
	} else if (!utils.isEmptyObj(eObj.error_list['mime'])) {
		utils.notify_error("错误代码：MIME");
	}
	console.log(event);
};

/**APK上传错误-回调*/
utils.file_error_apk = function (event, eObj) {
	
	if (!utils.isEmptyObj(eObj.error_list['size'])) {
		utils.notify_error('上传文件最大不超过' + utils.fileSettings.apkMaxSizeMsg);
	
	} else if (!utils.isEmptyObj(eObj.error_list['ext'])) {
		utils.notify_error("只允许上传APK后辍的文件");
		
	} else if (!utils.isEmptyObj(eObj.error_list['mime'])) {
		utils.notify_error("错误代码：MIME");
	}
	console.log(event);
};

/**上传设备的压缩包*/
utils.file_error_rar = function (event, eObj) {
	
	if (!utils.isEmptyObj(eObj.error_list['size'])) {
		utils.notify_error('上传文件最大不超过' + utils.fileSettings.apkMaxSizeMsg);
	
	} else if (!utils.isEmptyObj(eObj.error_list['ext'])) {
		utils.notify_error("只允许上传rar, zip, tar, apk后辍的文件");
		
	} else if (!utils.isEmptyObj(eObj.error_list['mime'])) {
		utils.notify_error("错误代码：MIME");
	}
	console.log(event);
};

/**上传小于最小弹出框*/
utils.lessThanMin = function(){
	return utils.notify_error("上传图片不能少于1k");
};

/**
 * 生成UUID
 */
utils.random4 = function() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
utils.UUID = function() {
	return (utils.random4() + utils.random4() + "-" + utils.random4() + "-" + utils.random4() + "-" + utils.random4() + "-" + utils.random4() + utils.random4() + utils.random4());
};

/**
 * $.ajax() && utils.ajax(): beforeSend事件
 * 提交表单前调用，添加遮罩动画，服务器响应慢，用户重复提交表单
 */
utils.beforeSend = function () {
	// 遮罩层
	// style="height: 100%; width: 100%; position: fixed; left: 0px; top: 0px; z-index: 2000;"
	// position:fixed;z-index:1040;left: 50%; top: 50%;
	/*var overlay = '' +
		'<div id="submit-overlay" style="height: 100%; width: 100%; position: fixed; left: 0px; top: 0px; z-index: 2000;">\
			<div style="position:fixed;z-index:1040;left: 45%; top: 9%;">\
				<i  class="ace-icon fa fa-spinner fa-spin orange" style="font-size: 300%;"></i>\
				<span style="font-size:20px;">处理中,请稍候...</span>\
			</div>\
		</div>';*/
	
	// 遮罩层
	var overlay = '<div id="submit-overlay" style="height: 100%; width: 100%; position: fixed; left: 0px; top: 0px; z-index: 2000;">\
		<i  class="ace-icon fa fa-spinner fa-spin orange"\
		style="position:fixed;z-index:1040;left: 50%; top: 50%; font-size: 400%;"></i></div>';
	
	$(document.body).append(overlay);
	//<div class="ui-widget-overlay ui-front" style="z-index: 1039;"></div>
};

/**
 * 服务器响应后调用，删除遮罩动画
 */
utils.afterSend = function () {
	$('#submit-overlay').remove();
};

/**有进度条的遮罩*/
utils.progressBefore = function(){
	// 遮罩层
	var overlay = '<div id="submit-overlay-second" style="height: 100%; width: 100%; position: fixed; left: 0px; top: 0px; z-index: 2000;">\
		<div id="parent" style="width: 600px; height: 25px;position:fixed;z-index:1040;left: 35%;top: 5%; border-radius: 10px;"\
				class="progress progress-striped pos-rel">\
	       <div id="son" style="width:0; height:100%; font-size:20px; border-radius: 10px;" class="progress-bar progress-bar-success"></div>\
	   </div></div>';
	
	$(document.body).append(overlay);
};

utils.progressAfter = function(){
	$("#son").html("100%" );
    $("#son").css("width", "100%");
	$('#submit-overlay-second').remove();
};

/**显示进度条的方法*/
utils.xhr = function(){
	var xhr = $.ajaxSettings.xhr();
　　　　if(utils.onprogress && xhr.upload) {
　　　　　　xhr.upload.addEventListener("progress" , utils.onprogress, false);
　　　　　　return xhr;
　　　　}
};

/**计算进度条比例*/
utils.onprogress = function(event){
	var loaded = event.loaded;                  //已经上传大小情况 
    var tot = event.total;                      //附件总大小 
    var per = Math.floor(100*loaded/tot);      //已经上传的百分比 
    if(per > 0){
    	per = per-1;
    }
    $("#son").html( per +"%" );
    $("#son").css("width" , per +"%");
};

/**
 * 是否为本地域名
 * @param _host
 */
utils.isLocalHost = function (_host) {
	return (_host.indexOf('localhost') != -1 || _host.indexOf('127.0.0.1') != -1 || _host.indexOf("ilinkeradmin.easyto.cc") != -1);
};

/**
 * 动态加载js脚本
 * @param code js脚本文件
 */
utils.loadScriptString = function (code) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    try {
        // firefox、safari、chrome和Opera
        script.appendChild(document.createTextNode(code));
    } catch(ex) {
        // IE早期的浏览器 ,需要使用script的text属性来指定javascript代码。
        script.text = code;
    }
    document.body.appendChild(script);
};

/**
 * 动态加载js脚本文件
 * @param js脚本url
 */
utils.loadScript = function (url) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    document.body.appendChild(script);
};

/**
 * 动态加载css文件
 * @param url css文件路径
 */
utils.loadStyles = function (url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
};

/**
 * 动态加载css脚本
 * @param cssText css脚本文件
 */
utils.loadStyleString = function (cssText) {
    var style = document.createElement("style");
    style.type = "text/css";
    try {
        // firefox、safari、chrome和Opera
        style.appendChild(document.createTextNode(cssText));
    } catch(ex) {
        // IE早期的浏览器 ,需要使用style元素的stylesheet属性的cssText属性
        style.styleSheet.cssText = cssText;
    }
    document.getElementsByTagName("head")[0].appendChild(style);
};
/**
 * 加载json的数据到页面的表单中，以name为唯一标示符加载
 * @param {String} data 表单数据
 */
$.fn.loadForm = function(data) {
    return this.each(function() {
        var formElem, name;
        
        if(data == null) { 
        	this.reset(); 
        	return;
        }
        for(var i = 0; i < this.length; i++) {  
            formElem = this.elements[i];
            //checkbox的name可能是name[]数组形式
            name = (formElem.type == "checkbox") ? formElem.name.replace(/(.+)\[\]$/, "$1") : formElem.name;
            
            if(data[name] == undefined) continue;
            
            switch(formElem.type) {
                case "checkbox":
                    if(data[name] == "") {
                        formElem.checked = false;
                    } else {
                        //数组查找元素
                        if(data[name].indexOf(formElem.value) > -1) {
                            formElem.checked = true;
                        } else {
                            formElem.checked = false;
                        }
                    }
                break;
                case "radio":
                    if(data[name] == "") {
                        formElem.checked = false;
                    } else if(formElem.value == data[name]) {
                        formElem.checked = true;
                    }
                break;
                case "button": break;
                default: formElem.value = data[name];
            }
        }
    });
};