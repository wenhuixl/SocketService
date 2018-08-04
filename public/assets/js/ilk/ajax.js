/**
 * 后台首页
 * @author lzh
 */
var ilk_ajax = {
		user_info: 		null,	// 用户信息
		current_roleId:	null,	// 当前用户角色
};

/** 加载用户名  */
ilk_ajax.loadUserInfo = function () {
	
	return utils.Ajax({
		title: '加载用户信息',
		url: utils.domain() + '/login/userInfo.do',
		urlParams: {},
		success: function(user) {
			if (user) {
				// 用户名
				$("#sys-user-name").text(user.userName);
				// 头像
				if (user.photo) {
					$('#sys-user-avatar').attr('src', utils.getFilePath(user.photo));
				}
				ilk_ajax.user_info = user;
			
			} else {
				utils.notify_error('加载用户信息失败');
			}
		}
	});
};

ilk_ajax.loadNoticeMess = function(){
	//没有统一的类和表，所以拓展需要重写
		utils.Ajax({
			url: utils.domain() + "/suggest/suggestCount.do",
			success: function(result){
				var object = {};
				object.url = "ajax.html#page/platform/suggest";
				object.noticeName = "投诉与建议";
				object.noticeNum = result;
//				object.num = "";
//				if(result > 0){
//					object.num = 1;
//				}
				
//			$(".m-metro-container").html(template("metro-list", { metro_list: data }));
//			ajax.html#page/platform/suggest
//			投诉与建议
				$("#notice").html(template("noticeList", {data: object}));
			}
		});
	
};

/** 加载侧边栏菜单  */
ilk_ajax.loadSidebarMenu = function () {
	return utils.Ajax({
		url : utils.domain() + "/userMenu/listSidebarMenus.do",
		urlParams : {},
		success : function(data) {
			var sideBarList = template("sideBarList", {
				sideBarList : data
			});
			$("#m-left-list").prepend(sideBarList);
			
			/**
			 * 侧边栏点击事件
			 */
			setTimeout(function () {
				$('#m-left-list li').on('click', function () {
					var that = this;

					// 存储当前用户角色
					ilk_ajax.current_roleId = $(that).find('a').attr('data-roleid');

					if (ilk_ajax.current_roleId) {
						ilk_ajax.loadFnMenus(ilk_ajax.current_roleId);
					}
					// 修改选中样式
					$(that).parent().find('li').removeClass('active');
					$(that).addClass('active');
					
				}).first().click();
				
				/**
				 * 主页点击事件
				 */
				$('#ilk_home').on('click', function () {
					var roleid = -1;
					
					if (ilk_ajax.current_roleId) {
						roleid = ilk_ajax.current_roleId;
					} else {
						roleid = ilk_ajax.user_info.sysUserRole[0].role.roleId;
					}
					ilk_ajax.loadFnMenus(roleid);
				});
			}, 0);
		}
	});
};
/**
 * 根据用户角色加载菜单
 * @param roleId 角色ID
 */
ilk_ajax.loadFnMenus = function (roleId) {
	if (roleId) {
		utils.Ajax({
			title: "获取用户菜单",
			url: utils.domain() + "/userMenu/listFnMenus.do",
			urlParams: { 'roleId': roleId },
			success: function(data) {
				
				// 延时加载，确保index.html加载完成
				setTimeout(function () {
					$(".m-metro-container").html(template("metro-list", { metro_list: data }));
				}, 100);
				
				/*// 更新面包屑标题头
				.find('a[data-url*=page]').on('click', function () {
					
					//$(this).parent().prev().remove();
					//$('.breadcrumb').append('<li class="active">'+ $(this).parent().attr('title') +'</li>');
				});*/
			}
		});
		if(roleId == 6){
			ilk_ajax.loadNoticeMess();
		}
	} // there is no else
};
/** 注销  */
ilk_ajax.logout = function () {
	return window.location.href = utils.domain() + '/login/logout.do';
};

/** 绑定事件  */
ilk_ajax.bindingEvent = function () {
	// 注销
	$('#logout').on('click', function () {
		
		if (confirm('确定要退出系统吗?')) {
			ilk_ajax.logout();
		}
	});
};

/** 初始化模板方法   */
ilk_ajax.initTemplateFn = function () {
	template.helper("getDataUrl", function (menuUrl) {
		var data_url = '';
		var _arr = menuUrl.split('#');
		
		if (_arr && _arr.length > 1) {
			data_url = menuUrl.split('#')[1];
		}
		return data_url;
	});
};

$(function() {
	
	ilk_ajax.initTemplateFn();
	
	// ilk_ajax.loadSidebarMenu();
	//
	// ilk_ajax.bindingEvent();
	//
	// ilk_ajax.loadUserInfo();
	//
	// $('#ilk-version').html(utils.VERSION);
});