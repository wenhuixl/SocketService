var crc = require('crc');

exports.crcToBuf = function(buf) {
    var crcHex = crc.crc16(buf).toString(16);
    while (crcHex.length < 4){     //补0
        crcHex = '0'.concat(crcHex);
    }
    var crcHex1 = crcHex.substr(0,2);
    var crcHex2 = crcHex.substr(2,2);

    var crcOverturn = crcHex2.concat(crcHex1);
    return Buffer.from(crcOverturn,'hex');
};