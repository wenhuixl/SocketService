/**
 * Created by wenhui on 2018/06/11
 * 相关配置
 */

var ServerConfig = {
    uploadPath : '../public/upload/plate', // 车牌识别图片保存路径
    picturePath : '/upload/plate',         // 图片访问路径
    websocketIp:"127.0.0.1",       //前端页面websocket连接端口  192.168.1.40
    websocketPort:8084       //前端页面websocket连接端口
};

module.exports = ServerConfig;