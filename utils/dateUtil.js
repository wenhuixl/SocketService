/**
 * Created by @Evenlai on 2018/07/10.
 */
module.exports = {
    //返回星期
    getDay(date){
        return "星期" + "日一二三四五六".charAt(date.getDay());
    }
};