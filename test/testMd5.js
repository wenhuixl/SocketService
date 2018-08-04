/**
 * Created by wenhui on 2018/7/11.
 */

const crypto = require('crypto');
const random = require("./../utils/random");
const Base64 = require("./../utils/base64");

/**加密*/
// //1.生成8位的随机数
// let randomWord = Math.random(false,8);
// let base64 = new Base64();
// //2.对生成的随机数加密
// let base64Random = base64.encode(randomWord);
//
// let password = '12345';
// //3.将第二步的值与密码拼接
// let newPas = base64Random + password;
// let md5 = crypto.createHash("md5");
// //4.将第三步的进行md5加密
// let md5Pas = md5.update(newPas).digest("hex");
// //5.将第四步进行base64加密
// let base64Md5 = base64.encode(md5Pas);
// //6.将第二步与第五步拼接
// let lastPassword = base64Random + base64Md5;
//
// console.log('生成密码: %s', lastPassword);  // MC44NTMxOTk3OTIzMDgzNzk0YWNkYTIzYjUwNmY2MThiODk2NjU1OGJjN2RmNjQwNzg=

/**匹配*/
let password = '12345';
let dbPassword = 'MC44NTMxOTk3OTIzMDgzNzk0YWNkYTIzYjUwNmY2MThiODk2NjU1OGJjN2RmNjQwNzg='; // 数据库根据用户名查询对应密码
//1.获取到的密码截取前面随机数通过base64加密的结果
let base64Random = dbPassword.substring(0,24);
//2.将第一步的结果与用户输入的密码拼接
let newPas = base64Random + password;
//3.将第二步的结果进行MD5加密
let md5 = crypto.createHash("md5");
let md5Pas = md5.update(newPas).digest("hex");
//4.将第三步进行base64加密
let base64 = new Base64();
let base64Md5 = base64.encode(md5Pas);
//5.将第一步与第四步拼接
let lastPassword = base64Random + base64Md5;
console.log('匹配密码：%s', lastPassword);



let newPass = '13701234566';
//3.将第二步的结果进行MD5加密
let MD5 = crypto.createHash("md5");
let md5Pas2 = MD5.update(newPass).digest("hex");
console.log(md5Pas2.length);