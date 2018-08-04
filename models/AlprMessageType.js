/**
 * Created by wenhui on 2018/6/13.
 * 消息类型
 */
var AlprMessageType = {
    M_PLATE_INFO : getTypeBuffer(1202),
    M_UploadJPG : getTypeBuffer(1214),
    M_GetPlateListRes : getTypeBuffer(1223)
};

function getTypeBuffer(type) {  // 消息类型转 buffer
    var oldstr = type.toString(16);
    while (oldstr.length < 8) {
        oldstr = '0'+oldstr;
    }
    var buf = new Buffer(oldstr, 'hex');
    var newstr = '';
    for(var i = buf.length-1; i >= 0; i--) {
        newstr += buf.slice(i, i+1).toString('hex');
    }
    return new Buffer(newstr, 'hex');
}

module.exports = AlprMessageType;
