/**
 * Created by wenhui on 2018/7/10.
 */

display = function(time, string) {
    return new Promise(function (resovle, reject) {
        setTimeout(function () {
            console.log(string);
            resovle();
        }, time)
    });
};

// 执行顺序：b a c
fn = async function () {
    // 会造成阻塞
    await display(5000, "b");
    await display(3000, "a");
    await display(1000, "c");
}();


// async function add(a, b) {
//     console.log(a+b);
// }
//
// add(14, 56).then(function () {
//     console.log('ok');
// });