//# sourceURL=gt.js
/**
 * @author lzh
 * @date 2018-05-07
 */
var scripts = [
    "../../jqGrid/i18n/grid.locale-cn.js",
    "../../jqGrid/jquery.jqGrid.min.js",
    "../../jquery-ui.js",
    "../../date-time/bootstrap-datepicker.js",
    "../../date-time/locales/bootstrap-datepicker.zh-CN.js",
    "../../jquery.gritter.js",
    "../../jquery.validate.js",
    "../../ilk/common/validate_rules.js",
    "../../bootbox.js",
    null];
$('.page-content-area').ace_ajax('loadScripts', scripts, function() {
	var gt = {
			userinfo: undefined
	};
	var $change_shifts_dlg	= $( "#dialog-change-shifts" ),
	    change_shifts_form	= '#form-change-shifts';
	
	/**
	 * 初始化交班对话框
	 */
	gt.initChangeShiftsDialog = function () {
		$change_shifts_dlg.removeClass('hide').dialog({
			resizable: false,
			draggable: false,
			modal: true,
			title: "<div class='widget-header widget-header-small'><h4 class='smaller'>换班确认</h4></div>",
			title_html: true,
			width: 650,
			close: function (e, ui) {
				gt.resetChangeShiftsForm();
			},
			open: function(e, ui) {
			}
		}).dialog('close');
		
		// 提交
		$('#change-shifts-submit').click(function () {
			if ($(change_shifts_form).valid()) {
				bootbox.confirm("操作员换班，程序将退出，请确认!", function(result) {
					if(!result) {
						return;
					}
					utils.Ajax({
						title: '交班',
						url: utils.domain() + '/gt/changeShifts.do',
						beforeSend: function () {
							utils.beforeSend();
							// 表单验证通过
							//if ($(change_shifts_form).valid()) {
							//	return true;
							//}
							//utils.afterSend();
							//return false;
						},
						formData: utils.serializeObject($(change_shifts_form)),
						success: function (rst) {
							utils.afterSend();		
							
							if (rst.rstId > 0) {
								$change_shifts_dlg.dialog("close"); 
								location.href = utils.domain() + "/login/login.do";
							}
						}
					});
				});
			}
		});
		
		// 取消
		$('#change-shifts-cancel').click(function () {
			$change_shifts_dlg.dialog('close');
		});
	};
	
	/** 重置表单  */
	gt.resetChangeShiftsForm = function () {
		$(change_shifts_form +' .form-group').removeClass('has-error');
    	$(change_shifts_form).validate().resetForm();
    	$(change_shifts_form)[0].reset();
	};
	
	/** 表单-验证  */
	gt.validateChangeShiftsForm = function () {
		$(change_shifts_form).validate({
			errorElement: 'div',
			errorClass: 'help-block',
			focusInvalid: true,
			ignore: "",
			rules: {
				advanceAmount:{
					required: true,
					number: true
				},
				actualAmount: {
					required: true,
					number: true
				}
			},
			messages: {
				advanceAmount: {
					required: '必填字段.',
					number: '金额输入不正确'
				},
				actualAmount: {
					required: '必填字段.',
					number: '金额输入不正确'
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
			submitHandler: function (form) {},
			invalidHandler: function (form) {}
		});
	};
	
	/**
	 * 绑定事件
	 */
	gt.bindEvent = function () {
		gt.loadGtUserInfo(function () {
			// 加载岗亭信息
			$('#gt-location').text('百汇中心出入口');
			$('#work-time').text(utils.timestampFormat(gt.p.workRecord.startTime, 'yyyy-MM-dd hh:mm:ss'));
			$('#charge-amount').text(120);
		});
		// 交班
		$('#change-shifts').click(function () {
			var entity = {
					userId: gt.p.gtUser.userId,
					userName: gt.p.gtUser.userName,
					userNo: gt.p.gtUser.workNo,
					beginTime: utils.timestampFormat(gt.p.workRecord.startTime, 'yyyy-MM-dd hh:mm:ss'),
					endTime: utils.timestampFormat(new Date(), 'yyyy-MM-dd hh:mm:ss'),
					turnover: 0,
					freeoutCarNum: 2,
					openByHandNum: 10,
					totalAmount: 0
			}
			$(change_shifts_form).loadForm(entity);
			
			$change_shifts_dlg.dialog('open');
		});
		
		$('#openCOP_YW').click(function () {
			var href = 'http://127.0.0.1:9080/grm/core.operator/executer?_d=Y2xhc3NJZD1nbGR4JnR5cGVJZD02MDE3Jm9wZXJhdG9yTmFtZT1nbGR4LTYwMTctbWFuYWdlLTk5OTktMSZvcHRpb249e3Nob3dVSTp0cnVlLGRpc3BsYXlNb2RlOjF9JmNsb3NlTW9kZWw9MSZfaD0tOTk5ODIyNDMw&_winTitle=%E9%81%93%E9%97%B8%E7%AE%A1%E7%90%86';
			window.open(href);
		});
	};
	
	/**
	 * 获取默认车牌的地区名
	 */
	gt.loadParkCarProvince = function () {
		if (document.getElementById("parkCarProvince")) {
			var carPlates = eval('(' + "['京','津','沪','渝','冀','豫','鄂','云','辽','黑','湘','皖','鲁','苏','新','浙','赣','桂','甘','川','晋','蒙','陕','吉','闽','贵','粤','青','宁','藏','琼']" + ')');
			$.each(carPlates, function(key, value) {
				$("#parkCarProvince").append('<option value="' + value + '">' + value + '</option>');
			});
		}
	};
	
	/**
	 * 
	 */
	gt.loadGtUserInfo = function (callback) {
		utils.Ajax({
			title: '加载岗亭用户信息',
			url: utils.domain() + '/gt/userInfo.do',
			urlParams: {},
			success: function(ret) {
				if (ret.rstId > 0) {
					gt.p = ret.object;
					
					if (callback && typeof callback === 'function') {
						callback();
					}
				} else {
					console.log('加载岗亭用户信息失败');
				}
			}
		});
	};
	
	gt.execute = function () {
		// trigger window resize to make the grid get the correct size
		//$(window).triggerHandler('resize.jqGrid');
		
		$(document).one('ajaxloadstart.page', function(e) {
			$('.ui-jqdialog,.ui-dialog').remove();
		});
		// 查询
		//gt.search();
	};
	
	jQuery(function($) {
		bootbox.setDefaults("locale","zh_CN");
		utils.jq_dialog_html_title();

		gt.bindEvent();
		
		gt.execute();
		
		gt.loadParkCarProvince();
		
		gt.validateChangeShiftsForm();
		
		gt.initChangeShiftsDialog();
	});
});