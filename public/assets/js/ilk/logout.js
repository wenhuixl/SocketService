/** 
 * logout
 * @author lwb
 */
var ilk_logout = {};

/**
 * 注销
 */
ilk_logout.doLogout = function () {
	$.ajax({
		url: "/logout/doLogout.do",
		type: "POST",
		dataType: "json",
		data: "",
		beforeSend: function () {
			//utils.notify('正在为您注销...', 'info');
		},
		success: function (data) {
			console.log(data);
			if (data.rstId > 0) {
				return location.href = utils.domain() + data.rstDesc;
			} else {
				alert("注销失败");
                console.log(data);
			}
		}
	});
};

$(document).ready(function() {
	$("#logout").click(function () {
        ilk_logout.doLogout();
    });
});