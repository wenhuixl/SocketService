/**
 * Created by wenhui on 2018/6/26.
 * 文件处理相关操作
 */
'use strict'

const fs = require("fs");

// 删除非空文件夹
function deleteFolderRecursive(path) { // path: '../public/upload/plate/20180625'
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file) {
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    };
    console.log('delete dir: ', path);
};

module.exports = {
    deleteFolderRecursive: deleteFolderRecursive
};