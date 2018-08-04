//获取当前用户信息
function getCurrentUserInfo(){
    $.ajax({
        url: "/user/currentUser",
        type: "POST",
        dataType: "json",
        data: {},
        success: function (data) {
            if (data.rstId > 0) {
                $("#currentUserName").html(data.result.user_name);
            } else {
                bootbox.alert({
                    size: "small",
                    title: "系统提示",
                    message: data.rstDesc,
                    buttons: {
                        ok: {
                            label: '确定',
                            className: 'btn-info'
                        }
                    },
                    callback: function(){
                        //return location.href = utils.domain() + data.rstDesc;
                    }
                });
            }
        }
    });
}

//获取远程常用菜单列表
function getRemoteMenu(){
    $.ajax({
        url: "/menu/list",
        type: "POST",
        dataType: "json",
        data: {},
        success: function (data) {
            console.log(data);
            if (data.rstId > 0) {
                let oldHtml = $("#m-left-list").html();
                let menuHtml = "";
                if(data.result){
                    $.each(data.result,function (key,value) {
                        console.log(value);
                        menuHtml = menuHtml + '<li>' +
                            '<a data-roleid="" target="_blank" href="' + value["menu_url"] + '">' +
                            '<i class="menu-icon fa fa-circle-o"></i>' +
                            '<span class="menu-text">'+ value["menu_name"] +'</span>' +
                            '</a>' +
                            '</li>'
                    });
                }

                let html = oldHtml + menuHtml;
                $("#m-left-list").html(html);
            } else {
                bootbox.alert({
                    size: "small",
                    title: "系统提示",
                    message: data.rstDesc,
                    buttons: {
                        ok: {
                            label: '确定',
                            className: 'btn-info'
                        }
                    },
                    callback: function(){
                        //return location.href = utils.domain() + data.rstDesc;
                    }
                });
            }
        }
    });
}

$(document).ready(function() {
    getCurrentUserInfo();
    getRemoteMenu();
});