/** 
 * login
 * @author lzh, czj
 */
var ilk_login = {};

var REMEMBER_ME 			= 'REMEMBER_ME';				// 记住登录账号
var ACCOUNT					= 'ACCOUNT';					// 登录帐号

var remember_me_selector	= '[name=rememberMe]';
var account_selector		= '[name=account]';

var $psdForm				= $('#loginByPassword-form');	// 密码登录

/** 绑定事件  */
ilk_login.bindingEvent = function () {
	// 图形验证码更新
	$(".IMGVCode").on("click", function (e) {
		e.preventDefault();
		$(this).prev().attr("src", utils.domain() + "/login/IMGVCode.do?" + Math.floor(Math.random() * 100)).fadeIn();
	});
	
	// 同步登录表单的记住登录帐号checkbox
	$(remember_me_selector).on('click', function () {
		var that = this;
		$(remember_me_selector).each(function () {
			this.checked = that.checked;
		});
	});
	
	// 固定密码登录
	$('#password-login-btn').on('click', function () {
		ilk_login.psdSubmit();
	});
};

/**
 * 记住登录账号
 */
ilk_login.rememberLoginAccount = function (account) {
	// value(选中 : on | 未选中 : undefinded)
    if ( $( remember_me_selector + ':checked' ).val() == "on") {
        
    	// 存储一个带7天期限的 cookie
    	$.cookie(REMEMBER_ME, "true", { expires: 7 }); 				
        $.cookie(ACCOUNT, account, { expires: 7 });
    }
};

/**
 * 固定密码登录
 */
ilk_login.psdSubmit = function () {
	if (!$psdForm.valid()) {
		return false;
	}
	ilk_login.doLogin($psdForm);
};

/**
 * 登录
 */
ilk_login.doLogin = function ($form) {
	$.ajax({
		url: "/login/doLogin.do",
		type: "POST",
		dataType: "json",
		data: $form.serialize(),
		beforeSend: function () {
			//utils.notify('正在为您登录...', 'info');
		},
		success: function (data) {

			console.log(data);
			ilk_login.rememberLoginAccount($form.find('input[name=account]').val());

			if (data.rstId > 0) {
				return location.href = utils.domain() + data.rstDesc;
			} else {
                $('.error').html(data.message);
			}
		}
	});
};

/** 固定密码登录验证   */
ilk_login.psdValidate = function () {
	$psdForm.validate({
		submitHandler: function(form) {
			//ilk_login.psdSubmit();
		},
		rules : {
			account : {
				required:	true,
				rangelength:[3, 18]
			},
			password: {
				required:	true,
				rangelength:[3, 18]
			},
			imgVCode: 		"required"
		},
		messages : {
			account : {
				required: 	'帐户不能为空！',
				rangelength: $.validator.format('帐户长度必须介于 {0} 位和 {1} 位之间')
			},
			password : {
				required: 	'密码不能为空！',
				rangelength: $.validator.format('密码长度必须介于 {0} 位和 {1} 位之间')
			},
			imgVCode: {
				required: 	'验证码不能为空！'
			}
		},
		errorPlacement: function(error,element) {
			$(element).parent().next().html(error[0].innerText);
		},
		
		highlight: function (element, errorClass) {
		},
		unhighlight: function (element, errorClass) {
			$(element).parent().next().html("");
		}
	});
};

/**
 * 加载cookie
 */
ilk_login.loadCookies = function () {
	// 记住登录帐号
	if ($.cookie(REMEMBER_ME)) {
		$(remember_me_selector).each(function () {
			this.checked = true;
		});
	}
	
	// 登录帐号
	if ($.cookie(ACCOUNT)) {
		$(account_selector).each(function () {
			this.value = $.cookie(ACCOUNT);
		});
	}
	
	// 检查“获取短信验证码”的按钮倒计时
	if(utils.getCookie("ilkCountDown") && 
			!(Date.parse(new Date()) / 1000 - utils.getCookie("ilkCountDown") > 1)) {
		utils.countDown($("#getVCode")[0], utils.getCookie("ilkCountDown") - Date.parse(new Date()) / 1000);
	}
};

$(document).ready(function() {
	
	ilk_login.loadCookies();

	ilk_login.bindingEvent();
	
	ilk_login.psdValidate();
	
	utils.formEnterSubmit($psdForm, ilk_login.psdSubmit);
	
	$('.tbli').on('click', 'li', function() {
		var e = this;
		$(e).siblings().find('a').removeClass('on');
		$(e).find('a').addClass('on');
		$('.login-form').addClass('hide').eq($(e).index()).fadeIn('fast', function() {
			//$(this).find("input[type='text']").val("");
			$(this).find("input[name='password']").val("");
			$(this).find("input[name='imgVCode']").val("");
			$('.error').html('');
			$(this).removeClass('hide');
		});
	});
});