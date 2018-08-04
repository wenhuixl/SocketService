/**
 * Created by wenhui on 2018/6/27.
 */
var request = require('request');
var querystring = require('querystring');
var POPConfig = require('../config/POPConfig');

// 发送get请求
// request.get(POPConfig.API_COMPLIST, function (error, response, body) {
//     console.log('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log('body:', body); // Print the HTML for the Google homepage.
// });

// request.get(POPConfig.API_PARKINGLOTS+'?compid=1100', function (error, response, body) {
//     console.log('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log('body:', body); // Print the HTML for the Google homepage.
// });

// console.log(POPConfig.API_COMPLIST);

var url = 'http://192.168.3.183:8282/POP_Service/api/gateway/init.do';
var requestData = {compid: '1100', gwId: 1004919};

function httprequest(method, url, data, callback) {
    // var form = querystring.stringify(requestData); //json转换为字符串
    // request({
    //     url: url,
    //     method: method, // GET/POST
    //     json: true,
    //     headers: {
    //         'content-type': 'application/json',
    //     },
    //     body: form
    // }, function(error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         callback(body);
    //     } else {
    //         callback(null);
    //     }
    // });

    var form = querystring.stringify(data); //json转换为字符串
    request.post({
        body: form, // 需要post的数据
        json: true, //数据的格式
        url: url, //请求的URL
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    }, function (err, httpResponse, body) {
        if (err) {
            console.log('Error :', err);
            callback(0);
            return
        }
        callback(body);
    })
};

httprequest('POST', url, requestData, function (result) {
    console.log(result);
});


