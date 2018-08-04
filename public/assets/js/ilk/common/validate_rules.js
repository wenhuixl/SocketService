//# sourceURL=validateRules.js
var validateRules = {};

// 手机号码验证规则
//validateRules.mobileReg = /^((\+?86)|(\(\+86\)))?(13[0-9][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
//validateRules.mobileReg = /^((\+?86)|(\(\+86\)))?(13[0-9]|15[012356789]|18[023456789]|17[0135678]){1}[0-9]{8}$/;
/**后面修改手机的区间*/
validateRules.mobileReg = /^((\+?86)|(\(\+86\)))?(13[0-9]|15[0-9]|18[0-9]|17[01345678]){1}[0-9]{8}$/;
// 固话验证规则
validateRules.telReg = /^([0-9]{3,4}(-)?)?[0-9]{7,8}$/;
//身份证规则
validateRules.cardReg = /^\d{6}[1-2]\d{3}[0-1][1-9]\d{2}\d{3}([0-9]|[Xx])$/;
//	/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;

/*
 * 拓展jQuery Validation验证规则
 * 
 * 1.validateRules.isMobile // 验证手机号码
 * 2.validateRules.isTel	// 验证固话
 * ...
 */
/**
 * 手机验证
 */
jQuery.validator.addMethod("mobile", function (value, element) {
	//var mobile = /^((\+?86)|(\(\+86\)))?(13[0-9][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
	return this.optional(element) || (validateRules.mobileReg.test(value));
}, "请输入有效手机号码.");
/**
 * 固话验证
 */
jQuery.validator.addMethod("isTel", function (value, element) {
	return this.optional(element) || (validateRules.telReg.test(value));
}, "请输入合法的固定电话.");


jQuery.validator.addMethod("idcard", function (value, element) {
	return this.optional(element) || (validateRules.cardReg.test(value));
}, "请输入有效身份证号码.");

/**
 * 判断是不是手机号
 */
validateRules.isMobile = function(value) {
	return validateRules.mobileReg.test((value + ""));
};
/**
 * 电话号码验证
 */
validateRules.isTel = function (value) {
	return validateRules.telReg.test((value));
};

/**
 * 身份证验证
 */
validateRules.isIdCard = function(value){
	return validateRules.cardReg.test(value);
}