/**
 * Created by wenhui on 2018/7/5.
 */

var map = new Map();
map.set(0, 'zero');
map.set(1, 'one');
map.set(0, 'abc');
// console.log(map.get(0));
// map.delete(1);
// console.log(map);

for (var key of map.keys()) {
    console.log(key);
}