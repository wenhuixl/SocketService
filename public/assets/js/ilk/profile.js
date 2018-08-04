/**
 * Created by wenhui on 2018/6/28.
 * 用户个人信息
 */
var user = {};

getCurrentUser = function () {
    $.post('/user/currentUser', {}, function (data) {
        if(data.rstId) {
            user = data.result;
            $('#userName').val(user.user_name);
            $('#email').val(user.email);
            $('#idCard').val(user.id_card);
            $('#phone').val(user.phone);
            $('#workNumber').val(user.work_number);
            if(user.gender==1) {
                $("input[name='form-field-radio']").get(0).checked=true;
            } else {
                $("input[name='form-field-radio']").get(1).checked=true;
            }
        }
    });
};

saveUserMess = function () {
    user.user_name = $('#userName').val();
    user.email = $('#email').val();
    user.id_card = $('#idCard').val();
    user.phone = $('#phone').val();
    user.work_number = $('#workNumber').val();
    user.gender = document.getElementsByName('form-field-radio')[0].checked==true? 1 : 0;
    $.post('/user/update', {user: user}, function (data) {
        console.log(data);
        if(data.rstId==1) {
            utils.notify_rst('操作成功', 1);
        } else {
            utils.notify_rst('操作失败', 0);
        }
    })
};

savePass = function () {
    var oldPass = $('#oldPass').val();
    var newPass = $('#newPass').val();
    var passwordConfirmation = $('#passwordConfirmation').val();
    if(newPass!=passwordConfirmation) {
        utils.notify_rst('两次输入密码不一致', 0);
        return;
    }
    user.password = passwordConfirmation;
    console.log(user);
    $.post('/user/checkPass', {oldPass: oldPass}, function (data) {
        console.log(data);
        if(data.rstId == 1) {
            saveUserMess(); // 保存用户信息
        } else {
            utils.notify_rst('原密码不正确', 0);
        }
    })
};

jQuery(function ($) {
    getCurrentUser(); // 获取当前用户信息
    $('#resetUser').click(function () { // 点击重置刷新当前用户信息
        getCurrentUser();
    });
    $('#saveUser').click(function () { // 点击保存用户信息
        saveUserMess();
    });
    $('#updatePass').click(function () { // 修改密码
        savePass();
    });
});