/**
 * http 请求方法封装
 * Created by wenhui on 2018/7/11.
 */
'use strict'

const request = require('request');
const querystring = require('querystring');
const logger = require('../utils/logUtil').getLogger('/middleware/RequestMethod.js');

function httprequest(method, url, data, callback) {
    logger.debug('请求：method: %s, url:%s, data: %s', method, url, JSON.stringify(data));
    if(method == 'GET') {   // 处理get请求
        request({
            url: url,       // 'http://192.168.1.121:8282/POP_Service/api/complist.do';
            method: method, // 'GET'或'POST'
            json: true,
            headers: {
                'content-type': 'application/json',
            },
            body: data
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body);
            } else {
                callback(null);
            }
        });
    }
    if(method == 'POST') { // 处理post请求
        let form = querystring.stringify(data); //json转换为字符串
        request.post({
            body: form,  // 需要post的数据
            json: true, // 数据的格式
            url: url,   // 请求的URL
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }, function (err, httpResponse, body) {
            if (err) {
                console.log('Error :', err);
                callback(null);
            } else {
                callback(body);
            }
        });
    }
};

module.exports = {
    httprequest: httprequest
};