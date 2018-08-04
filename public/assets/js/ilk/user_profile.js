//# sourceURL=sys_user.js
/**
 * 用户信息
 * @author lzh
 * @since 2016-0-4-21
 */
var scripts = [null,
	    "../../assets/js/jquery-ui.custom.js",
		"../../assets/js/jquery.ui.touch-punch.js",
		"../../assets/js/jquery.gritter.js",
		"../../assets/js/date-time/bootstrap-datepicker.js",
		"../../assets/js/jquery/jquery.parser.js",
		"../../assets/js/jquery/jquery.form.js",
		"../../assets/js/jqGrid/jquery.jqGrid.min.js",
		"../../assets/js/jqGrid/i18n/grid.locale-cn.js",
		"../../assets/js/jquery.validate.js",
        "../../assets/js/ilk/common/validate_rules.js",
        "../../assets/js/fuelux/fuelux.wizard.js",
        "../../assets/js/jquery/messages_zh.js",
        "../../assets/js/jquery.gritter.js",
        "../../assets/js/fuelux/fuelux.spinner.js",
        "../../assets/js/jquery-ui.js",
        "../../assets/js/bootbox.js",
		"../../assets/js/fuelux/fuelux.wizard.js",
		null];
$('.page-content-area').ace_ajax('loadScripts', scripts, function() {
	
  	var user = {
  			info: ilk_ajax.user_info,							// 用户信息
  			tab_pane: {											// 选项卡面板
  				BASIC:		'edit-basic',
  				PASSWORD:	'edit-password'
  			}
  	};
  	
  	user.cur_pane				= user.tab_pane.BASIC;			// 当前tab-pane
  	
  	var user_profile_selector 	= '#user-profile';				// 用户信息选择器
  	var $user_profile			= $(user_profile_selector);
  	
  	var $user_profile_form		= $('#user-profile-form');		// 基本信息表单
  	
  	var $password_form			= $('#password-form');			// 密码表单
  	
  	var $forget_psw_form		= $('#modal-wizard-form');   	// 重置密码
  	
  	var $forget_psw_dialog   	= $('#modal-wizard');       	// 密码对话框

  	var $wizard_container       = $('#modal-wizard-container'); //向导容器
  	
  	var $change_phone_dialog    = $('#change-phone');   //更改密码对话框
  	
  	var $change_phone_form	    = $('#change-phone-form');	//更改手机号表单
  	
  	var $change_phone_container = $('#change-phone-container');  //更改手机号向导容器
  	
  	/**
  	 * <p>初始化用户头像</p>
  	 * 
  	 * dropzone widget
  	 */
  	user.initAvatar = function () {
  		$user_profile.find('input[type=file]').ace_file_input({
			style:'well',
			btn_choose:'上传头像',
			btn_change:null,
			no_icon:'ace-icon fa fa-picture-o',
			thumbnail:'large',
			droppable:true,
			maxSize: utils.fileSettings.maxSize,
			
			allowExt: ['jpg', 'jpeg', 'png'],
			allowMime: ['image/jpg', 'image/jpeg', 'image/png'],
			
			// 该方法必须返回Boolean值
			before_change: function (fileList, p) {
				if (fileList && fileList[0]) {
					if(fileList[0].size > utils.fileSettings.minUploadSize){
						
						var filePath = utils.readFileIntoDataUrl(fileList[0]);
						// 加载图片
						if (filePath) {
							loadAvatar(filePath);
							return true;
						} 
						utils.notify_error('上传失败');
					} else {
						utils.lessThanMin();
					}
				}
				return false;
			}
		}).on('file.error.ace', utils.file_error);
  		
  		if (user.info.photo) {
  			loadAvatar(user.info.photo);
  		}
  		
  		/**
  		 * 加载头像
  		 * @param avatar_path 相对路径
  		 */
  		function loadAvatar (avatar_path) {
  			$user_profile.find('input[type=file]').ace_file_input('show_file_list', [{
  				type: 'image', 
  				name: utils.getFilePath(avatar_path)
  			}]);
  			// 隐藏域赋值头像相对路径,用于表单提交
  			$user_profile_form.find('input[name=photo]').val(avatar_path);
  		};
  	};
  	
  	/**
  	 * 加载个人信息
  	 */
  	user.loadProfile = function () {
  		$user_profile_form.form('load', user.info);
  	};
  	
  	/**
  	 * 初始化表单验证规则
  	 * @param $form
  	 * @param opts: { rules: {}, messages: {} }
  	 */
  	user.initValidator = function ($form, opts) {
  		$form.validate({
			errorElement: 'div',
			errorClass: 'help-block',
			focusInvalid: false,
			ignore: "",
			rules: opts.rules,
			
			messages: opts.messages,

			highlight: function (e) {
				$(e).closest('.form-group').removeClass('has-info').addClass('has-error');
			},

			success: function (e) {
				$(e).closest('.form-group').removeClass('has-error');//.addClass('has-info');
				$(e).remove();
			},

			errorPlacement: function (error, element) {
				
				if(element.is('input[type=radio]')) {
					var controls = element.closest('div[class*="col-"]');
					
					if(controls.find(':radio').length > 1) {
						controls.append(error);
					} else {
						error.insertAfter(element.nextAll('.lbl:eq(0)').eq(0));
					}
				} else {
					error.insertAfter(element.parent());
				}
			},

			submitHandler: function (form) {
				
			},
			invalidHandler: function (form) {}
		});
  	};
  	
  	/**
  	 * 提交基本信息表单
  	 * @param submitUrl
  	 * @param $form
  	 * @param callback
  	 */
  	user.submitForm = function (submitUrl, $form, callback) {
  		if ($form.valid()) {
  			utils.Ajax({
  	  			url: submitUrl,
  	  			formData: utils.serializeObject($form),
  	  			beforeSend: utils.beforeSend,
  	  			success: function (rst) {
  	  				utils.afterSend();
  	  				utils.notify_rst(rst.rstDesc, rst.rstId);
  	  				if (rst.rstId > 0) {
  	  					callback();
  	  				}
  	  			}
  	  		});
  		}
  		// there is no else
  	};
  	
  	/**
  	 * 重置表单
  	 * @param $form 表单对象
  	 */
  	user.resetForm = function ($form) {
  		$form.find('.form-group').removeClass('has-error');
  		$form.validate().resetForm();
  		$form[0].reset();
  		// 手机号不重置
  		$('#phone').val(user.info.phone);
  	};
  	
	/**
  	 * 绑定事件
  	 */
  	user.bindingEvent = function () {
  		// 首次获取图片验证码
  		$('#f-yzm-img').attr('src', utils.domain() + '/login/IMGVCode.do');
  		
  		// 图形验证码更新
		$(".IMGVCode").on("click", function (e) {
			e.preventDefault();
			$(this).prev().attr("src", utils.domain() + "/login/IMGVCode.do?" + Math.floor(Math.random() * 100)).fadeIn();
		});
		// 更换手机获取短信验证码
		$('#f-getVCode').on('click', function () {
			user.getVCode($change_phone_form, 'oldphone');
		});
		
		// 忘记密码短信验证码
		$('#fg-getVCode').on('click', function () {
			user.getVCode($forget_psw_form, 'phone' );
		});
  		
  		// 离开页面的绑定事件
  		$(document).one('ajaxloadstart.page', function(e) {
  			// do something...
		});
  		
  		// 提交表单
  		$('#save-form').on('click', function () {
  			
  			if (user.cur_pane == user.tab_pane.BASIC) {
  				return user.submitForm(utils.domain() + '/sysUserCommon/modifyUserInfo.do', $user_profile_form, function () {
  					// 重新加载用户信息-更新右上头像，用户名
  					ilk_ajax.loadUserInfo();
  				});
  			}
  			if (user.cur_pane == user.tab_pane.PASSWORD) {
  				$password_form.find('input[name=phone]').val(user.info.phone);
  				return user.submitForm(utils.domain() + '/sysUserCommon/modifyPassword.do', $password_form, function () {
  					user.resetForm($password_form);
  				});
  			}
  			// there is no else
  		});
  		
  		// 重置表单
  		$('#reset-form').on('click', function () {
  			if (user.cur_pane == user.tab_pane.BASIC) {
  				$user_profile.find('input[type=file]').ace_file_input('reset_input');
  				return user.resetForm($user_profile_form);
  			}
  			if (user.cur_pane == user.tab_pane.PASSWORD) {
  				return user.resetForm($password_form);
  			}
  			// there is no else
  		});
  		
  		// 切换选项卡-基本信息tab, 密码tab
  		$('[data-toggle=tab]').on('click', function () {
  			// edit-basic || edit-password
  			user.cur_pane = this.href.split('#')[1];
  		});
  	};
  	
  	/**
  	 * 获取基本信息表单验证器
  	 * @returns { rules: {...}, messages: {...} }
  	 */
  	user.getBasicVaildator = function () {
  		return {
			// 验证规则
			rules: {
				userName: {
					required:	true
				},
				mail: {
					required:	true,
					email: 		true
				},
				gender: {
					required:	true
				}
			},
			// 验证信息
			messages: {
				userName: 		'用户名不能为空.',
				mail: {
					required:	'电子邮箱不能为空.',
					email:		'请提供有效的电子邮件.'
				},
				gender:			'请选择性别.'
			}
		};
  	};
  	/**
  	 * 更改手机号表单验证器
  	 */
  	user.getChangePhoneValidator = function () {
  		return {
  			//验证规则
  			rules : {
	  			VCode: {
	  				required: 	true,
					maxlength: 	4,
					remote: {
	  					url: utils.domain() + "/login/validSMSVCode.do",
	  					type: "GET",
	  					dataType: "json",
	  					data: {
	  						phoneNo: function () {
	  							return $('#f-phone').val();
	  						},
	  						VCode: function() {
					            return $("#f-VCode").val();
					        }
	  					}
	  				}
	  			},
	  			phone: {
	  				required: 		false,
	  				mobile: '请正确填写您的手机号码',
	  				remote: {
	  					url: utils.domain() + "/sysUserCommon/checkPhone.do",
	  					type: "GET",
	  					dataType: "json",
	  					data: {
	  						newPhone: function () {
	  							return $('#f-newPhone').val();
	  						}
	  					}
	  				}
	  			},
  			},
  			//验证信息
  			messages: {
  				VCode: {
	  				required: 	'短信验证码不能为空！',
					maxlength: 	$.validator.format('最多可以输入 {0} 个字符'),
					remote:      '短息验证码不正确！'
	  			},
	  			phone: {
	  				required:	'手机号不能为空！',
					mobile: 	'请正确填写您的手机号码',
					remote: 	'手机号已存在，请更换手机号'
	  			}
  			}
  		};
  	};
  	
  	/**
  	 * 获取忘记密码表单的验证器
  	 * @returns { rules: {...}, messages: {...} }
  	 */
  	user.getForgetPswValidator = function () {
  		return {
  			//验证规则
  			rules : {
	  			imgVCode: {
	  				required: 	true,
	  				maxlength: 	4,
	  				remote: {
	  					url: utils.domain() + "/login/validIMGVCode.do",
	  					type: "GET",
	  					dataType: "json",
	  					data: {
	  						imgVCode : function () {
  								return $forget_psw_form.find('input[name=imgVCode]').val();
  							}
  						}
  					}
	  			},
	  			VCode: {
	  				required: 	true,
					maxlength: 	4,
					remote: {
	  					url: utils.domain() + "/login/validSMSVCode.do",
	  					type: "GET",
	  					dataType: "json",
	  					data: {
	  						phoneNo: function () {
	  							return $('#fg-phone').val();
	  						},
	  						VCode: function() {
					            return $('#fg-VCodes').val();
					        }
	  					}
	  				}
	  			},
	  			newPassword: {
	  				required: 		false,
  					//rangelength: 	[6, 18]
	  			},
	  			fg_confirmPassword: {
	  				required: 		false,
  					//equalTo: 		"#f-newPassword"
	  			}
	  		},
	  		//验证信息
	  		messages: {
	  			phone: {
	  				required:		'手机号不能为空.',
					mobile: 		'请正确填写您的手机号码.',
	  			},
	  			imgVCode: {
	  				required: 		'验证码不能为空.',
	  				remote:     	'图形验证码不正确.'
	  			},
	  			VCode: {
	  				required: 		'短信验证码不能为空.',
					maxlength: 		$.validator.format('最多可以输入 {0} 个字符.'),
					remote:     	'短息验证码不正确.'
	  			},
	  			newPassword: {
	  				required: 		'新密码不能为空.',
					rangelength: 	$.validator.format('长度介于 {0} ~ {1} 位之间.')
	  			},
	  			fg_confirmPassword: {
	  				required: 		'确认密码不能为空.',
					equalTo: 		'两次密码不一样.'
	  			}
	  		}
  		};
  	};
  	
  	/**
  	 * 获取密码表单的验证器
  	 * @returns { rules: {...}, messages: {...} }
  	 */
  	user.getPasswordValidator = function () {
  		return {
			// 验证规则
			rules: {
				oldPassword: {
					required: 		true,
					rangelength: 	[6, 18]
				},
				newPassword: {
  					required: 		true,
  					rangelength: 	[6, 18]
  				},
  				confirmPassword: {
  					required: 		true,
  					equalTo: 		"#new-password"
  				}
			},
			// 验证信息
			messages: {
  				oldPassword: {
  					required: 		'原始密码不能为空.',
  					rangelength: 	$.validator.format('密码长度必须介于 {0} 位和 {1} 位之间.')
  				},
				newPassword: {
					required: 		'新密码不能为空.',
					rangelength: 	$.validator.format('密码长度必须介于 {0} 位和 {1} 位之间.')
				},
				confirmPassword: {
					required: 		'确认密码不能为空.',
					equalTo: 		'两次密码不一样.'
				}
			}
		};
  	};
  	
  	
  	/**
  	 *  获取验证码 
  	 *  @param from 表单Id  name 
  	 *  */
  	user.getVCode = function (from , name) {
  		var urlParams = {
  				phoneNo: from.find('input[name='+name+']').val()
  		};
  		$.get(utils.domain() + '/login/SMSVCode.do', urlParams, function (rst) {
  			if (rst.rstId > 0) {
  				utils.notify('验证码已发送，请查收！')
  			}
  		}, 'json');
  	};
  	
  	/***
  	 * 更换手机号向导
  	 */
  	user.changePhoneWizard =  function () {
  		$change_phone_container.ace_wizard({
  			
  		}).on('actionclicked.fu.wizard' , function(e, info) {
  			// 向导回到第一步，重置表单验证规则
  			if (info.step == 2 && info.direction == 'previous') {
  				user.resetChangeFormValidRules(false);
  			
  			} 
  			// 1.向导下一步，作验证
  			// 2.开启第二步的表单验证
  			else if(info.step == 1 && info.direction == 'next') {
  				
  				if (!$change_phone_form.valid()) {
  					e.preventDefault();
  					return false;
  				
  				} else {
  					user.resetChangeFormValidRules(true);
  					
  				} 
  			}
  			
  		}).on('finished.fu.wizard', function(e) {
  			
  			if ($change_phone_form.valid()) {
  				
  				return user.submitForm(utils.domain() + '/sysUserCommon/modifyUserInfo.do', $change_phone_form, function () {
  					$change_phone_dialog.modal('hide');
  					$('#phone').val($('#f-newPhone').val());
  					user.info.phone = $('#f-newPhone').val();
  				});
  			}
  			
		}).on('stepclick.fu.wizard', function(e) {

		});
  		
		$('#change-phone .wizard-actions .btn[data-dismiss=modal]').removeAttr('disabled');
		
		$change_phone_dialog.modal({
			backdrop:'static', 
			keyboard: false,
			show: false
		})
		.on('show.bs.modal', function (e) {
			user.wizardJumpFirstStep($change_phone_container);
			
			user.resetForm($change_phone_form);
			user.resetChangeFormValidRules(false);
			// 
			$('#f-phone').val(user.info.phone);
			
		})
  	};
  	
  	
  	/**
  	 * 忘记密码向导
  	 */
  	user.forgetPasswordWizard = function () {
  		$wizard_container.ace_wizard({
  			
  		}).on('actionclicked.fu.wizard' , function(e, info) {

  			// 向导回到第一步，重置表单验证规则

  			if (info.step == 2 && info.direction == 'previous') {
  				user.resetForgetPswFormValidRules(false);
  			
  			} 
  			// 1.向导下一步，作验证
  			// 2.开启第二步的表单验证
  			else if(info.step == 1 && info.direction == 'next') {
  				
  				if (!$forget_psw_form.valid()) {
  					e.preventDefault();
  					return false;

  				} else {
  					user.resetForgetPswFormValidRules(true);
  				}
  			}
  			
  		}).on('finished.fu.wizard', function(e) {
  			
  			if ($forget_psw_form.valid()) {
  				//
  				return user.submitForm(utils.domain() + '/sysUserCommon/modifyPassword.do', $forget_psw_form, function () {
  					$forget_psw_dialog.modal('hide');
  					
  				});
  			}
  			
		}).on('stepclick.fu.wizard', function(e) {
			//e.preventDefault();//this will prevent clicking and selecting steps
		});
  		
		$('#modal-wizard .wizard-actions .btn[data-dismiss=modal]').removeAttr('disabled');
		
  	};
  	
  	/**
  	 * 初始化忘记密码模态框
  	 */
  	user.initForgetPswDlg = function () {
  		$forget_psw_dialog.modal({
			backdrop:'static', 
			keyboard: false,
			show: false
		})
		.on('show.bs.modal', function (e) {
			user.wizardJumpFirstStep($wizard_container);
			
			user.resetForm($forget_psw_form);
			user.resetForgetPswFormValidRules(false);
			// 获取用户手机号，这里不允许修改
			$('#fg-phone').val(user.info.phone);
			
		});
  	};
  	
  	/**
  	 * 更改newPhone检验状态
  	 * @param required boolean
  	 */
  	user.resetChangeFormValidRules = function (required) {
  		var _rules = $change_phone_form.validate().settings.rules;
  		_rules.phone.required = required;
  		if(required) { 
  			_rules.phone.mobile = "请正确填写您的手机号码";
  			_rules.phone.remote = {
  					url: utils.domain() + "/sysUserCommon/checkPhone.do",
  					type: "GET",
  					dataType: "json",
  					data: {
  						newPhone: function () {
  							return $('#f-newPhone').val();
  						}
  					}
  			};
   		} else {
   			_rules.phone.mobile = undefined;
   			_rules.phone.remote = undefined;
   		}
  	};
  	/**
  	 * 重置找回密码表单中新密码与确认密码的校验属性
  	 * @param required  boolean
  	 */
  	user.resetForgetPswFormValidRules = function (required) {
  		var _rules = $forget_psw_form.validate().settings.rules;
  		_rules.newPassword.required = required;
  		_rules.fg_confirmPassword.required = required;
  		
  		if (required) {
  			_rules.newPassword.rangelength = [6, 18],
  			_rules.fg_confirmPassword.equalTo = "#fg-newPassword";
  		} else {
  			_rules.newPassword.rangelength = undefined,
  			_rules.fg_confirmPassword.equalTo = undefined;
  		}
  	};
  	
  	/** 
  	 * 向导跳转至第一步 
  	 * @param container 
  	 */
	user.wizardJumpFirstStep = function (container) {
		var wizard = container.data('fu.wizard');
		if (wizard) {
			wizard.currentStep = 1;
			wizard.setState();
		}
	};
  	
	jQuery(function($) {
		
		utils.jq_dialog_html_title();
		
		user.initAvatar();
		
		user.loadProfile();
		
		user.initValidator($user_profile_form, user.getBasicVaildator());
		
		user.initValidator($password_form, user.getPasswordValidator());
		
		user.initValidator($forget_psw_form, user.getForgetPswValidator());
		
		user.initValidator($change_phone_form, user.getChangePhoneValidator());
		
		user.bindingEvent();
	
		user.forgetPasswordWizard();
		
		user.changePhoneWizard();
		
		user.initForgetPswDlg();
	});
});