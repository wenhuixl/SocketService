/**
 * Created by wenhui on 2018/6/13.
 */

function getTypeBuffer(type) {
    var oldstr = type.toString(16);
    while (oldstr.length < 8) {
        oldstr = '0'+oldstr;
    }
    var buf = new Buffer(oldstr, 'hex');
    var newstr = '';
    for(var i = buf.length-1; i >= 0; i--) {
        newstr += buf.slice(i, i+1).toString('hex');
    }
    // console.log(new Buffer(str, 'hex'));
    // console.log(new Buffer(str2, 'hex'));
    return new Buffer(newstr, 'hex');
}

console.log(getTypeBuffer(1202)); // 消息类型
