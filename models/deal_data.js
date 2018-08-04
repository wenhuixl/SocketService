var iconv = require('iconv-lite');

function dealData(content) {          //将开放平台上接受的数据转换为对象
    // let buf = Buffer.from(content.data, 'BASE64');
    // let GBKData = iconv.decode(buf, 'GBK');
    //console.log(GBKData);
    // let dataObject = eval(GBKData);   //将content中的data转成数组格式
    //console.log(dataObject);
    // let dealData = dealDetail(dataObject);
    //console.log('______________',dealData[0].details);
    // let sendtime = content.sendtime;
    // let dealSendtime = new Date(parseInt(sendtime.slice(6, 19))).toLocaleString();     //将sendtime截取后转为需要的格式

    let dataBuf = Buffer.from(content.data, 'base64');
    let dealData = JSON.parse(iconv.decode(dataBuf, 'GBK')); // 解决中文乱码问题
    let data = ''
    if(typeof(dealData[0]) == 'string') {
        data = JSON.parse(dealData[0]).data;
    } else {
        data = dealData;
    }
    let result = {
        data: data,
        devCode: content.devCode,
        sendtime: content.sendtime
    };
    return result;
}

async function dealDetail(data){
    for (let i = 0; i <data.length; i++) {
        if (data[i].details) {              //处理超时车数据的主从数据格式
            let newDetail = eval(data[i].details);
            data[i].details = newDetail;
        }
        if (data[i].begintime){             //处理黑白名单和授权车牌的时间
            let newBegintime = new Date(parseInt(data[i].begintime.slice(6, 19))).toLocaleString();
            data[i].begintime = newBegintime;
        }
        if (data[i].endtime){               //处理黑白名单和授权车牌的时间
            let newEndtime = new Date(parseInt(data[i].endtime.slice(6, 19))).toLocaleString();
            data[i].endtime = newEndtime;
        }
    }
    return data;
}

module.exports = {

    deal: dealData,

};


