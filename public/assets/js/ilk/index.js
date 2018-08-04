//# sourceURL=ilk_index.js
/**
 * 用户首页
 */
var scripts = [null,null];
$('.page-content-area').ace_ajax('loadScripts', scripts, function() {
		
	var ilk_index = {};
	
	/** 
	 * 加载用户菜单
	 * @param roleId
	 * @deprecated instead of ilk_ajax.loadFnMenus
	 */
	ilk_index.loadFuMenus = function (roleId) {
		utils.Ajax({
			title: "获取用户菜单",
			url: utils.domain() + "/userMenu/listFnMenus.do",
			urlParams: { 'roleId': roleId },
			beforeSend: function () {
				console.log(ilk_ajax.user_info)
				return false;
			},
			success: function(data) {
				
				$(".m-metro-container").html(template("metro-list", { metro_list: data }))
				/*// 更新面包屑标题头
				.find('a[data-url*=page]').on('click', function () {
					
					//$(this).parent().prev().remove();
					//$('.breadcrumb').append('<li class="active">'+ $(this).parent().attr('title') +'</li>');
				});*/
			}
		});
	};
	
	/** 初始化模板方法   */
	ilk_index.initTemplateFn = function () {
		template.helper("getDataUrl", function (menuUrl) {
			var data_url = '';
			var _arr = menuUrl.split('#');
			if (_arr && _arr.length > 1) {
				data_url = menuUrl.split('#')[1];
			}
			return data_url;
		});
	};
	
	$(function () {
		
		ilk_index.initTemplateFn();
		
		//ilk_index.loadFuMenus();
	});
});