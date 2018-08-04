/**
 * Created by wenbin on 2018/06/14.
 */
module.exports = {
    /**
     * 获取客户端ip
     * @param req
     * @returns {*|string|string}
     */
    handlingSpecialCharacters : function(s)
    {
        var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
        var rs = "";
        for (var i = 0; i < s.length; i++) {
            rs = rs+s.substr(i, 1).replace(pattern, '');
        }
        return rs;
    }
};