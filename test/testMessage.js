const messageService = require('../service/message');
const numberUtil = require('../utils/numberUtil');
const clientProtocol = require('../models/client_protocol');
const websocket = require('../middleware/WebSocket');

async function test() {
    let array = new Array();
    array.push(122);
    let voice1 = await messageService.encode(array,await messageService.SimplifiedArabi(await numberUtil.ArabiSimplified("37")));
    let voice2 = await messageService.encode(array,await messageService.SimplifiedArabi(await numberUtil.ArabiSimplified("36.5")));

    let arr = new Array();
    await messageService.encode(arr,"粤T12345");
    console.log("结果----"+arr);
}

test();